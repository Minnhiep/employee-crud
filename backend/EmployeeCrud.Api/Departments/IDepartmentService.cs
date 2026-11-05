namespace EmployeeCrud.Api.Departments;

/// <summary>
/// Các thao tác nghiệp vụ trên phòng ban. Lỗi nghiệp vụ được báo bằng DomainError (ErrorMapper đổi sang 400/404/409).
/// </summary>
public interface IDepartmentService
{
    /// <summary>Mọi phòng ban, sắp theo tên A-Z.</summary>
    Task<IReadOnlyList<DepartmentDto>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>Một phòng ban; không có thì báo NotFound.</summary>
    Task<DepartmentDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<DepartmentDto> CreateAsync(DepartmentRequest request, CancellationToken cancellationToken = default);

    Task<DepartmentDto> UpdateAsync(int id, DepartmentRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>Cho EmployeeService kiểm phòng ban có tồn tại khi thêm/sửa nhân viên. Không ném lỗi khi không có.</summary>
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
}