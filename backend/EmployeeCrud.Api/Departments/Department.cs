namespace EmployeeCrud.Api.Departments;

/// <summary>
/// Một phòng ban, ứng với một dòng trong bảng <c>departments</c>.
/// Đây là thực thể EF Core, chỉ dùng bên trong backend; ra API thì đổi sang <see cref="DepartmentDto"/>.
/// </summary>
public class Department
{
    public int Id { get; set; }

    public string Name { get; set; } = "";
}