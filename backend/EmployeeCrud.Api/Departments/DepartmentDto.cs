namespace EmployeeCrud.Api.Departments;

/// <summary>Phòng ban trả ra API (hợp đồng C1). JSON: <c>{ "id": 1, "name": "Kế toán" }</c>.</summary>
public record DepartmentDto(int Id, string Name);