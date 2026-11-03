namespace EmployeeCrud.Api.Employees;

/// <summary>
/// Các thao tác nghiệp vụ trên nhân viên. Lỗi nghiệp vụ được báo bằng DomainError (U1 đổi sang 400/404/409).
/// </summary>
public interface IEmployeeService
{
    /// <summary>
    /// Nhân viên kèm tên phòng ban, sắp theo họ tên rồi id (BR2.1).
    /// Có chuỗi tìm thì chỉ lấy người có họ tên hoặc email chứa chuỗi đó, không phân biệt hoa thường (BR2.2).
    /// Có <paramref name="departmentId"/> (chuỗi từ địa chỉ trang) thì chỉ lấy người của phòng đó; sai dạng báo
    /// Validation ở trường departmentId (BR5.3).
    /// </summary>
    Task<IReadOnlyList<EmployeeDto>> GetAllAsync(
        string? search,
        string? departmentId = null,
        CancellationToken cancellationToken = default);

    /// <summary>Một nhân viên; không có thì báo NotFound (BR2.3).</summary>
    Task<EmployeeDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<EmployeeDto> CreateAsync(EmployeeRequest request, CancellationToken cancellationToken = default);

    Task<EmployeeDto> UpdateAsync(int id, EmployeeRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}