using EmployeeCrud.Api.Departments;

namespace EmployeeCrud.Api.Employees;

/// <summary>
/// Một nhân viên, ứng với một dòng trong bảng <c>employees</c>.
/// Đây là thực thể EF Core, chỉ dùng bên trong backend; ra API thì đổi sang <see cref="EmployeeDto"/>.
/// </summary>
public class Employee
{
    public int Id { get; set; }

    public string FullName { get; set; } = "";

    /// <summary>Lưu đúng như người dùng gõ (đã bỏ khoảng trắng hai đầu), không đổi về chữ thường (Q1).</summary>
    public string Email { get; set; } = "";

    public int DepartmentId { get; set; }

    /// <summary>
    /// Phòng ban của nhân viên, dùng để lấy tên phòng ban trong cùng một câu truy vấn (JOIN).
    /// Gán <c>null!</c> vì EF Core tự điền khi đọc; code của dự án chỉ dùng nó trong Select, không tự tạo.
    /// </summary>
    public Department Department { get; set; } = null!;
}