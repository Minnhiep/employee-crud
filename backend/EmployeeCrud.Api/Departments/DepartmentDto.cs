namespace EmployeeCrud.Api.Departments;

/// <summary>
/// Phòng ban trả ra API (hợp đồng C1). JSON: <c>{ "id": 1, "name": "Kế toán", "employeeCount": 3 }</c>.
/// <c>EmployeeCount</c> là số nhân viên lúc đọc (FR8.1), đếm từ bảng nhân viên chứ không lưu sẵn (ADR-006).
/// </summary>
public record DepartmentDto(int Id, string Name, int EmployeeCount);
