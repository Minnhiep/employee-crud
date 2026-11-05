namespace EmployeeCrud.Api.Employees;

/// <summary>
/// Nhân viên trả ra API. JSON:
/// <c>{ "id": 1, "fullName": "Đỗ Văn An", "email": "do.an@congty.vn", "departmentId": 2, "departmentName": "Kế toán" }</c>.
/// Có sẵn tên phòng ban để giao diện không phải gọi thêm API cho từng dòng.
/// </summary>
public record EmployeeDto(int Id, string FullName, string Email, int DepartmentId, string DepartmentName);