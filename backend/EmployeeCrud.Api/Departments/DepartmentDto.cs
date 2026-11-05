namespace EmployeeCrud.Api.Departments;

/// <summary>
/// Phòng ban trả ra API. JSON: <c>{ "id": 1, "name": "Kế toán", "employeeCount": 3 }</c>.
/// <c>EmployeeCount</c> là số nhân viên lúc đọc, đếm từ bảng nhân viên chứ không lưu sẵn.
/// </summary>
public record DepartmentDto(int Id, string Name, int EmployeeCount);