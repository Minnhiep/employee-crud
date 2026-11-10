using System.Globalization;
using System.Linq.Expressions;
using System.Text.RegularExpressions;

using EmployeeCrud.Api.Departments;
using EmployeeCrud.Api.Platform.Data;
using EmployeeCrud.Api.Platform.Errors;
using EmployeeCrud.Api.Platform.Text;

using Microsoft.EntityFrameworkCore;

using Npgsql;

namespace EmployeeCrud.Api.Employees;

/// <summary>
/// Luật nghiệp vụ của nhân viên. Đăng ký Scoped: mỗi request một service và một AppDbContext riêng.
/// Hỏi phòng ban có tồn tại qua <see cref="IDepartmentService"/>, không đọc thẳng bảng departments.
/// </summary>
public class EmployeeService(AppDbContext db, IDepartmentService departments) : IEmployeeService
{
    public const string FullNameField = "fullName";
    public const string EmailField = ErrorTitles.EmailKey;
    public const string DepartmentIdField = "departmentId";

    public const string FullNameInvalidCharactersMessage = "Họ tên chứa ký tự không hợp lệ";
    public const string FullNameRequiredMessage = "Vui lòng nhập họ tên";
    public const string FullNameTooLongMessage = "Họ tên tối đa 100 ký tự";
    public const string EmailInvalidCharactersMessage = "Email chứa ký tự không hợp lệ";
    public const string EmailRequiredMessage = "Vui lòng nhập email";
    public const string EmailTooLongMessage = "Email tối đa 254 ký tự";
    public const string EmailInvalidMessage = "Email không đúng định dạng";
    public const string DepartmentRequiredMessage = "Vui lòng chọn phòng ban";
    public const string DepartmentNotFoundMessage = "Phòng ban không tồn tại";
    public const string DepartmentFilterInvalidMessage = "Phòng ban lọc không hợp lệ";

    // Một luật định dạng email, chép GIỐNG HỆT ở frontend/src/pages/employees/validateEmployee.ts.
    // Đọc thành lời: trước "@" ít nhất một ký tự không phải khoảng trắng hay "@"; sau "@" ít nhất hai đoạn
    // ngăn bởi dấu chấm, mỗi đoạn không rỗng (nên dấu chấm không đứng đầu, cuối hay liền nhau).
    // Điều kiện: email PHẢI được chuẩn hóa (TextInput: bỏ hai đầu, gộp khoảng trắng) trước khi kiểm. .NET cho "$"
    // khớp cả trước một dấu xuống dòng cuối chuỗi còn JavaScript thì không; đã chuẩn hóa thì không còn dấu xuống
    // dòng nào, hai bên cho cùng kết quả.
    // static readonly: biểu thức là hằng dùng chung, không phải dữ liệu, nên an toàn khi service là Scoped.
    private static readonly Regex EmailPattern = new(
        @"^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$",
        RegexOptions.CultureInvariant);

    // Một cách đổi thực thể sang DTO, dùng chung cho danh sách, đọc theo id và đọc lại sau khi lưu.
    // Viết dạng Expression để EF dịch e.Department.Name thành JOIN departments trong cùng một câu SQL.
    private static readonly Expression<Func<Employee, EmployeeDto>> ToDto = e =>
        new EmployeeDto(e.Id, e.FullName, e.Email, e.DepartmentId, e.Department.Name);

    public async Task<IReadOnlyList<EmployeeDto>> GetAllAsync(
        string? search,
        string? departmentId = null,
        CancellationToken cancellationToken = default)
    {
        // Kiểm phòng ban lọc TRƯỚC chuỗi tìm, để tham số sai luôn được báo 400 (kể cả khi chuỗi tìm cũng lạ).
        var departmentFilter = ParseDepartmentFilter(departmentId);

        // Chuẩn hóa chuỗi tìm giống họ tên, email lúc lưu (gộp khoảng trắng, NFC), nên gõ hai dấu cách
        // hoặc gõ kiểu tổ hợp vẫn tìm ra. Có ký tự lạ (ví dụ U+0000) thì không ai khớp được, vì họ tên, email đã bị
        // chặn ký tự đó khi lưu: trả rỗng luôn, không gửi xuống PostgreSQL (U+0000 sẽ làm API trả 500).
        // Trả rỗng chứ không 400, vì đây là tìm không ra, không phải dữ liệu nhập sai.
        if (!TextInput.TryNormalize(search, out var term))
        {
            return [];
        }

        var query = db.Employees.AsNoTracking();

        // Lọc theo phòng nằm trong cùng câu SQL với tìm kiếm: hai điều kiện ghép AND.
        // Phòng không tồn tại thì không ai khớp, trả [] (lọc không ra kết quả, không phải 404).
        if (departmentFilter is int filterId)
        {
            query = query.Where(e => e.DepartmentId == filterId);
        }

        // Rỗng thì không lọc.
        if (term.Length > 0)
        {
            // Chuỗi tìm được hạ chữ ở .NET rồi gửi xuống dưới dạng tham số (@p); cột được hạ chữ ở SQL
            // (ToLower() trong biểu thức thành lower(full_name)). Contains được EF dịch an toàn:
            // "%" và "_" trong chuỗi tìm là chữ thường, không thành ký tự đại diện.
            // Có phân biệt dấu: "binh" không khớp "Bình", đúng yêu cầu.
            var lowered = term.ToLowerInvariant();
            query = query.Where(e =>
                e.FullName.ToLower().Contains(lowered) || e.Email.ToLower().Contains(lowered));
        }

        // Sắp theo họ tên, rồi theo id để hai người trùng tên luôn có thứ tự cố định.
        return await query
            .OrderBy(e => e.FullName)
            .ThenBy(e => e.Id)
            .Select(ToDto)
            .ToListAsync(cancellationToken);
    }

    // Chỉ đọc để trả DTO (không sửa), nên AsNoTracking: EF khỏi tốn công theo dõi đối tượng.
    public async Task<EmployeeDto> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        await db.Employees
            .AsNoTracking()
            .Where(e => e.Id == id)
            .Select(ToDto)
            .FirstOrDefaultAsync(cancellationToken)
        ?? throw NotFound(id);

    public async Task<EmployeeDto> CreateAsync(EmployeeRequest request, CancellationToken cancellationToken = default)
    {
        // Thứ tự kiểm cố định: dữ liệu (rẻ, không chạm database) → phòng ban có không (400)
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
        await SaveAsync(id: null, cancellationToken);

        // Đọc lại để có tên phòng ban trong DTO trả về.
        return await GetByIdAsync(employee.Id, cancellationToken);
    }

    public async Task<EmployeeDto> UpdateAsync(int id, EmployeeRequest request, CancellationToken cancellationToken = default)
    {
        // Tìm nhân viên TRƯỚC khi kiểm dữ liệu: sửa người không tồn tại luôn ra 404,
        // kể cả khi dữ liệu gửi lên cũng sai.
        var employee = await FindTrackedAsync(id, cancellationToken);

        var input = Normalize(request);
        await EnsureDepartmentExistsAsync(input.DepartmentId, cancellationToken);

        // Loại trừ chính nó: giữ nguyên email, hoặc chỉ đổi hoa thường email của mình, vẫn lưu được.
        await EnsureEmailIsFreeAsync(input.Email, excludeId: id, cancellationToken);

        employee.FullName = input.FullName;
        employee.Email = input.Email;
        employee.DepartmentId = input.DepartmentId;

        // Nếu mọi giá trị giữ nguyên, EF không gửi câu UPDATE, nên SaveAsync không phát hiện được trường hợp
        // "vừa bị xóa ở nơi khác". Kết quả vẫn là 404, nhưng do bước đọc lại GetByIdAsync ở dưới không thấy dòng.
        // Hai người sửa cùng lúc thì người lưu sau thắng, vì đề bài không yêu cầu xử lý xung đột này.
        await SaveAsync(id, cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var employee = await FindTrackedAsync(id, cancellationToken);

        // Xóa hẳn khỏi database, không xóa mềm.
        db.Employees.Remove(employee);
        await SaveAsync(id, cancellationToken);
    }

    // Lưu và đổi các lỗi "chen nhau" thành lỗi nghiệp vụ. Lỗi khác ném nguyên để ErrorMapper trả 500.
    // Email trùng (23505 trên ux_employees_email) không bắt ở đây: ErrorMapper đã đổi thành 409.
    // id là null khi thêm mới, vì lúc đó chưa có mã thật.
    private async Task SaveAsync(int? id, CancellationToken cancellationToken)
    {
        try
        {
            await db.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException) when (id is int existingId)
        {
            // Dòng vừa bị xóa ở nơi khác sau khi ta đọc: câu UPDATE/DELETE không tác động dòng nào.
            // Câu INSERT khi thêm mới không thể "không tìm thấy dòng", nên lúc thêm mới không vào nhánh này:
            // lỗi đó là bất thường, được ném nguyên để ErrorMapper trả 500 và ghi log.
            throw NotFound(existingId);
        }
        catch (DbUpdateException exception) when (IsDepartmentForeignKeyViolation(exception))
        {
            // Phòng ban bị xóa giữa lúc ta kiểm ExistsAsync và lúc lưu: khóa ngoại báo 23503.
            // Báo như lỗi dữ liệu của ô Phòng ban, cùng câu với EnsureDepartmentExistsAsync.
            // Lưu ý: khi THÊM/SỬA nhân viên trỏ tới phòng ban không có, PostgreSQL báo 23503
            // (foreign_key_violation). Mã 23001 (restrict_violation) chỉ xuất hiện ở chiều ngược lại:
            // XÓA phòng ban còn nhân viên, và chỗ đó do DepartmentService xử lý.
            throw DomainError.Validation(DepartmentIdField, DepartmentNotFoundMessage);
        }
    }

    // Chuẩn hóa (gộp khoảng trắng, NFC, chặn ký tự điều khiển và ký tự vô hình; cùng hàm với
    // tên phòng ban) rồi kiểm; báo lỗi ĐẦU TIÊN theo thứ tự họ tên → email → phòng ban (DomainError chỉ chứa
    // một trường; form React đã báo đủ các ô). Trong mỗi ô: ký tự không hợp lệ → rỗng → quá dài (→ định dạng).
    private static ValidInput Normalize(EmployeeRequest request)
    {
        if (!TextInput.TryNormalize(request.FullName, out var fullName))
        {
            throw DomainError.Validation(FullNameField, FullNameInvalidCharactersMessage);
        }

        if (fullName.Length == 0)
        {
            throw DomainError.Validation(FullNameField, FullNameRequiredMessage);
        }

        if (fullName.Length > EmployeeConfiguration.FullNameMaxLength)
        {
            throw DomainError.Validation(FullNameField, FullNameTooLongMessage);
        }

        // Email cũng chuẩn hóa: U+200B không phải khoảng trắng nên lọt qua EmailPattern, và hai email trông giống hệt
        // (một cái có ký tự vô hình, hoặc gõ kiểu tổ hợp) sẽ lách được luật không trùng.
        if (!TextInput.TryNormalize(request.Email, out var email))
        {
            throw DomainError.Validation(EmailField, EmailInvalidCharactersMessage);
        }

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

    // Phòng ban phải đang có. Hỏi qua IDepartmentService để DepartmentService giữ quyền trên bảng departments.
    private async Task EnsureDepartmentExistsAsync(int departmentId, CancellationToken cancellationToken)
    {
        if (!await departments.ExistsAsync(departmentId, cancellationToken))
        {
            throw DomainError.Validation(DepartmentIdField, DepartmentNotFoundMessage);
        }
    }

    // So không phân biệt hoa thường. Câu SQL thật: WHERE lower(e.email) = @loweredEmail.
    // - Vế giá trị: hạ chữ ngay ở .NET rồi gửi xuống làm tham số. Dùng ToLowerInvariant (như chỗ tìm kiếm ở trên)
    //   vì ToLower() của .NET theo ngôn ngữ cài trên máy, kết quả có thể khác lower() của PostgreSQL.
    // - Vế cột: e.Email.ToLower() được Npgsql dịch thành lower(email) chạy trong PostgreSQL, cùng biểu thức với chỉ mục
    //   ux_employees_email.
    // Nếu hai request chen nhau cùng qua bước này, chỉ mục là lớp chặn cuối: chặn cái sau (23505), ErrorMapper đổi thành 409.
    private async Task EnsureEmailIsFreeAsync(string email, int? excludeId, CancellationToken cancellationToken)
    {
        var loweredEmail = email.ToLowerInvariant();
        var taken = await db.Employees.AnyAsync(
            e => e.Email.ToLower() == loweredEmail && e.Id != excludeId,
            cancellationToken);

        if (taken)
        {
            throw DomainError.Conflict(ErrorTitles.EmailTaken, EmailField);
        }
    }

    // Đọc CÓ theo dõi (không AsNoTracking) vì sửa và xóa cần EF ghi nhận thay đổi trên chính đối tượng này.
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

    // departmentId đến từ địa chỉ trang nên controller nhận dạng chuỗi và service tự đọc số. Nhờ vậy giá trị
    // sai trả câu tiếng Việt, không lọt câu tiếng Anh của model binding.
    // NumberStyles.None: chỉ chữ số 0-9, không nhận dấu "+", "-", khoảng trắng hay dấu phân cách hàng nghìn;
    // TryParse cũng tự từ chối số vượt phạm vi int. Rỗng (hoặc chỉ khoảng trắng) nghĩa là không lọc.
    private static int? ParseDepartmentFilter(string? departmentId)
    {
        if (string.IsNullOrWhiteSpace(departmentId))
        {
            return null;
        }

        if (int.TryParse(departmentId, NumberStyles.None, CultureInfo.InvariantCulture, out var id) && id > 0)
        {
            return id;
        }

        throw DomainError.Validation(DepartmentIdField, DepartmentFilterInvalidMessage);
    }

    // Dữ liệu đã chuẩn hóa và đã qua kiểm, dùng chung cho thêm và sửa.
    private sealed record ValidInput(string FullName, string Email, int DepartmentId);
}