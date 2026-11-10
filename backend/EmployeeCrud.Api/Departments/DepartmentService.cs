using EmployeeCrud.Api.Platform.Data;
using EmployeeCrud.Api.Platform.Errors;
using EmployeeCrud.Api.Platform.Text;

using Microsoft.EntityFrameworkCore;

using Npgsql;

namespace EmployeeCrud.Api.Departments;

/// <summary>
/// Luật nghiệp vụ của phòng ban. Đăng ký Scoped: mỗi request một service và một AppDbContext riêng.
/// </summary>
public class DepartmentService(AppDbContext db) : IDepartmentService
{
    public const string NameField = ErrorTitles.NameKey;
    public const string NameRequiredMessage = "Vui lòng nhập tên phòng ban";
    public const string NameTooLongMessage = "Tên phòng ban tối đa 100 ký tự";
    public const string NameInvalidMessage = "Tên phòng ban chứa ký tự không hợp lệ";
    public const string CannotDeleteTitle = "Không thể xóa phòng ban";

    public async Task<IReadOnlyList<DepartmentDto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        // Chỉ đọc: không theo dõi thay đổi; sắp ngay trong database. Số nhân viên là truy vấn con trong
        // cùng câu SELECT, nên 8 hay 80 phòng ban vẫn chỉ một lần gọi database.
        await db.Departments
            .AsNoTracking()
            .OrderBy(d => d.Name)
            .Select(d => new DepartmentDto(d.Id, d.Name, db.Employees.Count(e => e.DepartmentId == d.Id)))
            .ToListAsync(cancellationToken);

    public async Task<DepartmentDto> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await db.Departments
            .AsNoTracking()
            .Where(d => d.Id == id)
            .Select(d => new DepartmentDto(d.Id, d.Name, db.Employees.Count(e => e.DepartmentId == d.Id)))
            .FirstOrDefaultAsync(cancellationToken)
        ?? throw NotFound(id);

    public async Task<DepartmentDto> CreateAsync(DepartmentRequest request, CancellationToken cancellationToken = default)
    {
        var name = NormalizeName(request.Name);
        await EnsureNameIsFreeAsync(name, excludeId: null, cancellationToken);

        var department = new Department { Name = name };
        db.Departments.Add(department);
        // Hai người thêm cùng tên một lúc đều qua được bước kiểm trên; chỉ mục không trùng chặn người sau tại đây (409).
        await db.SaveChangesAsync(cancellationToken);

        // Phòng vừa tạo chưa thể có nhân viên nào.
        return new DepartmentDto(department.Id, department.Name, 0);
    }

    public async Task<DepartmentDto> UpdateAsync(int id, DepartmentRequest request, CancellationToken cancellationToken = default)
    {
        // Tìm phòng ban TRƯỚC khi kiểm tên: sửa phòng không tồn tại luôn ra 404, kể cả khi tên gửi lên cũng sai.
        // Cùng thứ tự với EmployeeService.UpdateAsync, để hai API sửa trả lỗi theo cùng một luật.
        var department = await FindTrackedAsync(id, cancellationToken);
        var name = NormalizeName(request.Name);

        // Loại trừ chính nó: giữ nguyên tên, hoặc chỉ đổi hoa thường của chính nó, vẫn lưu được.
        await EnsureNameIsFreeAsync(name, excludeId: id, cancellationToken);

        department.Name = name;
        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // Dòng vừa bị xóa ở nơi khác sau khi ta đọc: câu UPDATE không tác động dòng nào.
            // ErrorMapper không nhận ra lỗi này (không có PostgresException bên trong), nên service tự báo 404.
            throw NotFound(id);
        }

        // Đọc lại thay vì dùng dữ liệu đang giữ: tên không đổi thì EF không gửi UPDATE nên không có lỗi tranh chấp,
        // chỉ bước đọc này mới biết phòng vừa bị xóa (404). Phản hồi PUT nhờ đó cũng cùng hình dạng với GET.
        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        // Đọc dòng trước khi xóa: vừa để báo 404, vừa có sẵn tên để đưa vào lời báo khi còn nhân viên.
        var department = await FindTrackedAsync(id, cancellationToken);

        // Kiểm trước, còn nhân viên thì không xóa và nói rõ còn bao nhiêu người.
        // Đếm bằng chỉ mục ix_employees_department_id.
        var employeeCount = await CountEmployeesAsync(id, cancellationToken);
        if (employeeCount > 0)
        {
            throw HasEmployeesConflict(department.Name, employeeCount);
        }

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
            // Đường dự phòng: có người vừa thêm nhân viên vào phòng ban này sau bước kiểm ở trên,
            // khóa ngoại RESTRICT chặn. Đếm lại để câu báo có số đúng lúc này.
            // Lúc database chặn chắc chắn còn ít nhất một người; nếu đếm lại ra 0 (người đó vừa bị xóa tiếp)
            // thì vẫn báo 1 thay vì câu vô lý "còn 0 nhân viên".
            var countNow = await CountEmployeesAsync(id, cancellationToken);
            throw HasEmployeesConflict(department.Name, Math.Max(1, countNow));
        }
    }

    public Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default) =>
        db.Departments.AnyAsync(d => d.Id == id, cancellationToken);

    // Chuẩn hóa (gộp khoảng trắng, NFC, chặn ký tự điều khiển) rồi mới kiểm, nên độ dài và
    // trùng tên được tính trên đúng tên sẽ lưu. Đây là nơi duy nhất kiểm độ dài.
    // Thứ tự kiểm: ký tự không hợp lệ trước, rồi rỗng, rồi quá dài. Ví dụ tên chỉ có "\0" được báo
    // "chứa ký tự không hợp lệ" (đúng nguyên nhân), không bị báo nhầm là "Vui lòng nhập tên phòng ban".
    private static string NormalizeName(string? rawName)
    {
        if (!TextInput.TryNormalize(rawName, out var name))
        {
            throw DomainError.Validation(NameField, NameInvalidMessage);
        }

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

    // So không phân biệt hoa thường. Câu SQL thật: WHERE lower(d.name) = @loweredName.
    // - Vế giá trị: hạ chữ ngay ở .NET rồi gửi xuống làm tham số. Dùng ToLowerInvariant vì ToLower() của .NET theo
    //   ngôn ngữ cài trên máy (máy tiếng Thổ Nhĩ Kỳ đổi "I" thành "ı" không dấu chấm, sẽ không khớp với PostgreSQL).
    // - Vế cột: d.Name.ToLower() được Npgsql dịch thành lower(name) chạy trong PostgreSQL, cùng biểu thức với chỉ mục
    //   ux_departments_name.
    // Nếu hai request chen nhau cùng qua bước này, chỉ mục là lớp chặn cuối: chặn cái sau (23505), ErrorMapper đổi thành 409.
    private async Task EnsureNameIsFreeAsync(string name, int? excludeId, CancellationToken cancellationToken)
    {
        var loweredName = name.ToLowerInvariant();
        var taken = await db.Departments.AnyAsync(
            d => d.Name.ToLower() == loweredName && d.Id != excludeId,
            cancellationToken);

        if (taken)
        {
            throw DomainError.Conflict(ErrorTitles.DepartmentNameTaken, NameField);
        }
    }

    private async Task<Department> FindTrackedAsync(int id, CancellationToken cancellationToken) =>
        await db.Departments.FirstOrDefaultAsync(d => d.Id == id, cancellationToken)
        ?? throw NotFound(id);

    // Khóa ngoại fk_employees_department khai ON DELETE RESTRICT, nên khi xóa phòng ban còn nhân viên
    // PostgreSQL báo 23001 (restrict_violation), không phải 23503 (đã thấy khi chạy thật trên pgAdmin).
    // Bắt cả hai mã để đường dự phòng không lọt thành lỗi 500.
    private static bool IsEmployeeForeignKeyViolation(DbUpdateException exception) =>
        exception.InnerException is PostgresException
        {
            SqlState: PostgresErrorCodes.ForeignKeyViolation or PostgresErrorCodes.RestrictViolation,
            ConstraintName: DbConstraintNames.EmployeeDepartmentForeignKey,
        };

    private Task<int> CountEmployeesAsync(int departmentId, CancellationToken cancellationToken) =>
        db.Employees.CountAsync(e => e.DepartmentId == departmentId, cancellationToken);

    // Một hàm duy nhất tạo lỗi "còn nhân viên", gọi từ cả bước kiểm trước lẫn nhánh bắt lỗi khóa ngoại (23001, 23503),
    // để hai đường luôn ra cùng một mẫu câu.
    public static string HasEmployeesMessage(string departmentName, int employeeCount) =>
        $"Không thể xóa phòng ban \"{departmentName}\" vì còn {employeeCount} nhân viên.";

    private static DomainError HasEmployeesConflict(string departmentName, int employeeCount) =>
        DomainError.Conflict(HasEmployeesMessage(departmentName, employeeCount), title: CannotDeleteTitle);

    private static DomainError NotFound(int id) =>
        DomainError.NotFound($"Không tìm thấy phòng ban có mã {id}.");
}