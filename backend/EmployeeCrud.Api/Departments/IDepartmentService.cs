namespace EmployeeCrud.Api.Departments;

/// <summary>
/// Các thao tác nghiệp vụ trên phòng ban. Lỗi nghiệp vụ được báo bằng DomainError (U1 đổi sang 400/404/409).
/// </summary>
public interface IDepartmentService
{
    /// <summary>Mọi phòng ban, sắp theo tên A-Z (BR2.1).</summary>
    Task<IReadOnlyList<DepartmentDto>> GetAllAsync(CancellationToken cancellationToken = default);

    /// <summary>Một phòng ban; không có thì báo NotFound (BR2.2).</summary>
    Task<DepartmentDto> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<DepartmentDto> CreateAsync(DepartmentRequest request, CancellationToken cancellationToken = default);

    Task<DepartmentDto> UpdateAsync(int id, DepartmentRequest request, CancellationToken cancellationToken = default);

    Task DeleteAsync(int id, CancellationToken cancellationToken = default);

    /// <summary>Cho U4 kiểm phòng ban có tồn tại khi thêm/sửa nhân viên (BR2.6). Không ném lỗi khi không có.</summary>
    Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default);
}