using EmployeeCrud.Api.Platform.Data;
using EmployeeCrud.Api.Platform.Errors;

using Microsoft.EntityFrameworkCore;

using Npgsql;

namespace EmployeeCrud.Api.Departments;

/// <summary>
/// Luật nghiệp vụ của phòng ban (BR1, BR2). Đăng ký Scoped: mỗi request một service và một AppDbContext riêng.
/// </summary>
public class DepartmentService(AppDbContext db) : IDepartmentService
{
    public const string NameField = "name";
    public const string NameRequiredMessage = "Vui lòng nhập tên phòng ban";
    public const string NameTooLongMessage = "Tên phòng ban tối đa 100 ký tự";
    public const string CannotDeleteTitle = "Không thể xóa phòng ban";

    public async Task<IReadOnlyList<DepartmentDto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        // Chỉ đọc: không theo dõi thay đổi, chỉ lấy hai cột cần cho DTO; sắp ngay trong database.
        await db.Departments
            .AsNoTracking()
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentDto(d.Id, d.Name))
            .ToListAsync(cancellationToken);

    public async Task<DepartmentDto> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await db.Departments
            .AsNoTracking()
            .Where(d => d.Id == id)
            .Select(d => new DepartmentDto(d.Id, d.Name))
            .FirstOrDefaultAsync(cancellationToken)
        ?? throw NotFound(id);

    public async Task<DepartmentDto> CreateAsync(DepartmentRequest request, CancellationToken cancellationToken = default)
    {
        var name = NormalizeName(request.Name);
        await EnsureNameIsFreeAsync(name, excludeId: null, cancellationToken);

        var department = new Department { Name = name };
        db.Departments.Add(department);
        await db.SaveChangesAsync(cancellationToken);

        return ToDto(department);
    }

    public async Task<DepartmentDto> UpdateAsync(int id, DepartmentRequest request, CancellationToken cancellationToken = default)
    {
        var name = NormalizeName(request.Name);
        var department = await FindTrackedAsync(id, cancellationToken);

        // Loại trừ chính nó: giữ nguyên tên, hoặc chỉ đổi hoa thường của chính nó, vẫn lưu được (BR1.4).
        await EnsureNameIsFreeAsync(name, excludeId: id, cancellationToken);

        department.Name = name;
        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // Dòng vừa bị xóa ở nơi khác sau khi ta đọc: câu UPDATE không tác động dòng nào.
            // ErrorMapper của U1 không nhận ra lỗi này (không có PostgresException bên trong), nên service tự báo 404.
            throw NotFound(id);
        }

        return ToDto(department);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        // Đọc dòng trước khi xóa: vừa để báo 404, vừa có sẵn tên để đưa vào lời báo khi còn nhân viên.
        var department = await FindTrackedAsync(id, cancellationToken);

        db.Departments.Remove(department);
        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw NotFound(id);
        }
        catch (DbUpdateException exception) when (IsEmployeeForeignKeyViolation(exception))
        {
            // Đường dự phòng của BR2.5: phòng ban còn nhân viên (khóa ngoại do U4 tạo).
            // U4 sẽ kiểm trước khi xóa; nhánh này lo trường hợp hai thao tác chen nhau.
            throw DomainError.Conflict(
                $"Không thể xóa phòng ban \"{department.Name}\" vì vẫn còn nhân viên.",
                title: CannotDeleteTitle);
        }
    }

    public Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default) =>
        db.Departments.AnyAsync(d => d.Id == id, cancellationToken);

    // BR1.1–BR1.3: bỏ khoảng trắng hai đầu rồi mới kiểm. Đây là nơi duy nhất kiểm độ dài.
    private static string NormalizeName(string? rawName)
    {
        var name = rawName?.Trim() ?? "";

        if (name.Length == 0)
        {
            throw DomainError.Validation(NameField, NameRequiredMessage);
        }

        if (name.Length > DepartmentConfiguration.NameMaxLength)
        {
            throw DomainError.Validation(NameField, NameTooLongMessage);
        }

        return name;
    }

    // BR1.4: so không phân biệt hoa thường. ToLower() được Npgsql dịch thành lower(name) = lower(@p),
    // cùng biểu thức với chỉ mục ux_departments_name. Nếu hai request chen nhau cùng qua bước này,
    // chỉ mục chặn cái sau (23505) và U1 đổi thành 409.
    private async Task EnsureNameIsFreeAsync(string name, int? excludeId, CancellationToken cancellationToken)
    {
        // Gọi ToLower() ở cả hai vế bên trong biểu thức, để PostgreSQL dùng đúng một hàm lower() cho cả hai bên.
        var taken = await db.Departments.AnyAsync(
            d => d.Name.ToLower() == name.ToLower() && d.Id != excludeId,
            cancellationToken);

        if (taken)
        {
            throw DomainError.Conflict(ErrorTitles.DepartmentNameTaken, NameField);
        }
    }

    private async Task<Department> FindTrackedAsync(int id, CancellationToken cancellationToken) =>
        await db.Departments.FirstOrDefaultAsync(d => d.Id == id, cancellationToken)
        ?? throw NotFound(id);

    private static bool IsEmployeeForeignKeyViolation(DbUpdateException exception) =>
        exception.InnerException is PostgresException
        {
            SqlState: PostgresErrorCodes.ForeignKeyViolation,
            ConstraintName: DbConstraintNames.EmployeeDepartmentForeignKey,
        };

    private static DomainError NotFound(int id) =>
        DomainError.NotFound($"Không tìm thấy phòng ban có mã {id}.");

    private static DepartmentDto ToDto(Department department) => new(department.Id, department.Name);
}