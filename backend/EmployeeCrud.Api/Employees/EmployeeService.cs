using System.Linq.Expressions;
using System.Text.RegularExpressions;

using EmployeeCrud.Api.Departments;
using EmployeeCrud.Api.Platform.Data;
using EmployeeCrud.Api.Platform.Errors;

using Microsoft.EntityFrameworkCore;

using Npgsql;

namespace EmployeeCrud.Api.Employees;

/// <summary>
/// Luật nghiệp vụ của nhân viên (BR1, BR2.1–BR2.6). Đăng ký Scoped: mỗi request một service và một AppDbContext riêng.
/// Hỏi phòng ban có tồn tại qua <see cref="IDepartmentService"/> (hợp đồng C4), không đọc thẳng bảng departments.
/// </summary>
public class EmployeeService(AppDbContext db, IDepartmentService departments) : IEmployeeService
{
    public const string FullNameField = "fullName";
    public const string EmailField = "email";
    public const string DepartmentIdField = "departmentId";

    public const string FullNameRequiredMessage = "Vui lòng nhập họ tên";
    public const string FullNameTooLongMessage = "Họ tên tối đa 100 ký tự";
    public const string EmailRequiredMessage = "Vui lòng nhập email";
    public const string EmailTooLongMessage = "Email tối đa 254 ký tự";
    public const string EmailInvalidMessage = "Email không đúng định dạng";
    public const string DepartmentRequiredMessage = "Vui lòng chọn phòng ban";
    public const string DepartmentNotFoundMessage = "Phòng ban không tồn tại";

    // BR1.6: một luật định dạng email, chép GIỐNG HỆT ở frontend/src/pages/employees/validateEmployee.ts.
    // Đọc thành lời: trước "@" ít nhất một ký tự không phải khoảng trắng hay "@"; sau "@" ít nhất hai đoạn
    // ngăn bởi dấu chấm, mỗi đoạn không rỗng (nên dấu chấm không đứng đầu, cuối hay liền nhau).
    // Điều kiện: email PHẢI được trim trước khi kiểm. .NET cho "$" khớp cả trước một dấu xuống dòng cuối chuỗi
    // còn JavaScript thì không; vì đã trim nên không còn dấu xuống dòng cuối, hai bên cho cùng kết quả.
    // static readonly: biểu thức là hằng dùng chung, không phải dữ liệu, nên an toàn khi service là Scoped.
    private static readonly Regex EmailPattern = new(
        @"^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$",
        RegexOptions.CultureInvariant);

    // Một cách đổi thực thể sang DTO, dùng chung cho danh sách, đọc theo id và đọc lại sau khi lưu.
    // Viết dạng Expression để EF dịch e.Department.Name thành JOIN departments trong cùng một câu SQL (NFR5.3).
    private static readonly Expression<Func<Employee, EmployeeDto>> ToDto = e =>
        new EmployeeDto(e.Id, e.FullName, e.Email, e.DepartmentId, e.Department.Name);

    public async Task<IReadOnlyList<EmployeeDto>> GetAllAsync(string? search, CancellationToken cancellationToken = default)
    {
        var query = db.Employees.AsNoTracking();

        // BR2.2: bỏ khoảng trắng hai đầu; rỗng thì không lọc.
        var term = search?.Trim() ?? "";
        if (term.Length > 0)
        {
            // Chuỗi tìm được hạ chữ ở .NET rồi gửi xuống dưới dạng tham số (@p); cột được hạ chữ ở SQL
            // (ToLower() trong biểu thức thành lower(full_name)). Contains được EF dịch an toàn:
            // "%" và "_" trong chuỗi tìm là chữ thường, không thành ký tự đại diện (NFR2.3).
            // Có phân biệt dấu: "binh" không khớp "Bình", đúng yêu cầu.
            var lowered = term.ToLowerInvariant();
            query = query.Where(e =>
                e.FullName.ToLower().Contains(lowered) || e.Email.ToLower().Contains(lowered));
        }

        // Sắp theo họ tên, rồi theo id để hai người trùng tên luôn có thứ tự cố định (BR2.1).
        return await query
            .OrderBy(e => e.FullName)
            .ThenBy(e => e.Id)
            .Select(ToDto)
            .ToListAsync(cancellationToken);
    }

    public async Task<EmployeeDto> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await db.Employees
            .AsNoTracking()
            .Where(e => e.Id == id)
            .Select(ToDto)
            .FirstOrDefaultAsync(cancellationToken)
        ?? throw NotFound(id);

    public async Task<EmployeeDto> CreateAsync(EmployeeRequest request, CancellationToken cancellationToken = default)
    {
        // Thứ tự kiểm cố định (NFR3.6): dữ liệu (rẻ, không chạm database) → phòng ban có không (400)
        // → email trùng (409). Nhờ vậy lỗi "dữ liệu sai" luôn được báo trước lỗi "xung đột".
        var input = Normalize(request);
        await EnsureDepartmentExistsAsync(input.DepartmentId, cancellationToken);
        await EnsureEmailIsFreeAsync(input.Email, excludeId: null, cancellationToken);

        var employee = new Employee
        {
            FullName = input.FullName,
            Email = input.Email,
            DepartmentId = input.DepartmentId,
        };
        db.Employees.Add(employee);
        await SaveAsync(employee.Id, cancellationToken);

        // Đọc lại để có tên phòng ban trong DTO trả về.
        return await GetByIdAsync(employee.Id, cancellationToken);
    }

    public async Task<EmployeeDto> UpdateAsync(int id, EmployeeRequest request, CancellationToken cancellationToken = default)
    {
        // Tìm nhân viên TRƯỚC khi kiểm dữ liệu: sửa người không tồn tại luôn ra 404,
        // kể cả khi dữ liệu gửi lên cũng sai (NFR3.6).
        var employee = await FindTrackedAsync(id, cancellationToken);

        var input = Normalize(request);
        await EnsureDepartmentExistsAsync(input.DepartmentId, cancellationToken);

        // Loại trừ chính nó: giữ nguyên email, hoặc chỉ đổi hoa thường email của mình, vẫn lưu được (BR1.7).
        await EnsureEmailIsFreeAsync(input.Email, excludeId: id, cancellationToken);

        employee.FullName = input.FullName;
        employee.Email = input.Email;
        employee.DepartmentId = input.DepartmentId;

        // Giới hạn đã biết: nếu mọi giá trị giữ nguyên, EF không gửi câu UPDATE, nên trường hợp
        // "vừa bị xóa ở nơi khác" sẽ trả 200 thay vì 404. Chấp nhận vì requirements mục 6 không xử lý
        // xung đột khi hai người sửa cùng lúc (reliability-design §2).
        await SaveAsync(id, cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var employee = await FindTrackedAsync(id, cancellationToken);

        // BR2.5: xóa hẳn khỏi database, không xóa mềm.
        db.Employees.Remove(employee);
        await SaveAsync(id, cancellationToken);
    }

    // Lưu và đổi các lỗi "chen nhau" thành lỗi nghiệp vụ (BR2.6). Lỗi khác ném nguyên để U1 trả 500.
    // Email trùng (23505 trên ux_employees_email) không bắt ở đây: ErrorMapper của U1 đã đổi thành 409.
    private async Task SaveAsync(int id, CancellationToken cancellationToken)
    {
        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            // Dòng vừa bị xóa ở nơi khác sau khi ta đọc: câu UPDATE/DELETE không tác động dòng nào.
            throw NotFound(id);
        }
        catch (DbUpdateException exception) when (IsDepartmentForeignKeyViolation(exception))
        {
            // Phòng ban bị xóa giữa lúc ta kiểm ExistsAsync và lúc lưu: khóa ngoại báo 23503.
            // Báo như lỗi dữ liệu của ô Phòng ban, cùng câu với BR1.9.
            // Lưu ý: khi THÊM/SỬA nhân viên trỏ tới phòng ban không có, PostgreSQL báo 23503
            // (foreign_key_violation). Mã 23001 (restrict_violation) chỉ xuất hiện ở chiều ngược lại:
            // XÓA phòng ban còn nhân viên, và chỗ đó do DepartmentService xử lý.
            throw DomainError.Validation(DepartmentIdField, DepartmentNotFoundMessage);
        }
    }

    // BR1.1–BR1.6, BR1.8: bỏ khoảng trắng hai đầu rồi kiểm; báo lỗi ĐẦU TIÊN theo thứ tự
    // họ tên → email → phòng ban (DomainError chỉ chứa một trường; form React đã báo đủ các ô).
    private static ValidInput Normalize(EmployeeRequest request)
    {
        var fullName = request.FullName?.Trim() ?? "";
        if (fullName.Length == 0)
        {
            throw DomainError.Validation(FullNameField, FullNameRequiredMessage);
        }

        if (fullName.Length > EmployeeConfiguration.FullNameMaxLength)
        {
            throw DomainError.Validation(FullNameField, FullNameTooLongMessage);
        }

        var email = request.Email?.Trim() ?? "";
        if (email.Length == 0)
        {
            throw DomainError.Validation(EmailField, EmailRequiredMessage);
        }

        if (email.Length > EmployeeConfiguration.EmailMaxLength)
        {
            throw DomainError.Validation(EmailField, EmailTooLongMessage);
        }

        if (!EmailPattern.IsMatch(email))
        {
            throw DomainError.Validation(EmailField, EmailInvalidMessage);
        }

        if (request.DepartmentId is not int departmentId || departmentId < 1)
        {
            throw DomainError.Validation(DepartmentIdField, DepartmentRequiredMessage);
        }

        return new ValidInput(fullName, email, departmentId);
    }

    // BR1.9: phòng ban phải đang có. Hỏi qua IDepartmentService (C4) để U3 giữ quyền trên bảng departments.
    private async Task EnsureDepartmentExistsAsync(int departmentId, CancellationToken cancellationToken)
    {
        if (!await departments.ExistsAsync(departmentId, cancellationToken))
        {
            throw DomainError.Validation(DepartmentIdField, DepartmentNotFoundMessage);
        }
    }

    // BR1.7: so không phân biệt hoa thường. ToLower() được Npgsql dịch thành lower(email) = lower(@p),
    // cùng biểu thức với chỉ mục ux_employees_email. Nếu hai request chen nhau cùng qua bước này,
    // chỉ mục chặn cái sau (23505) và U1 đổi thành 409.
    private async Task EnsureEmailIsFreeAsync(string email, int? excludeId, CancellationToken cancellationToken)
    {
        var taken = await db.Employees.AnyAsync(
            e => e.Email.ToLower() == email.ToLower() && e.Id != excludeId,
            cancellationToken);

        if (taken)
        {
            throw DomainError.Conflict(ErrorTitles.EmailTaken, EmailField);
        }
    }

    private async Task<Employee> FindTrackedAsync(int id, CancellationToken cancellationToken) =>
        await db.Employees.FirstOrDefaultAsync(e => e.Id == id, cancellationToken)
        ?? throw NotFound(id);

    private static bool IsDepartmentForeignKeyViolation(DbUpdateException exception) =>
        exception.InnerException is PostgresException
        {
            SqlState: PostgresErrorCodes.ForeignKeyViolation,
            ConstraintName: DbConstraintNames.EmployeeDepartmentForeignKey,
        };

    private static DomainError NotFound(int id) =>
        DomainError.NotFound($"Không tìm thấy nhân viên có mã {id}.");

    // Dữ liệu đã trim và đã qua kiểm, dùng chung cho thêm và sửa.
    private sealed record ValidInput(string FullName, string Email, int DepartmentId);
}