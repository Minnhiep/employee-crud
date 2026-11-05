namespace EmployeeCrud.Api.Platform.Errors;

/// <summary>
/// Tên ràng buộc database cố định. Migration của phòng ban và nhân viên phải đặt đúng các tên này,
/// vì code nhận ra lỗi theo tên ràng buộc, không đoán từ câu báo lỗi: ErrorMapper với lỗi trùng,
/// DepartmentService và EmployeeService với lỗi khóa ngoại.
/// </summary>
public static class DbConstraintNames
{
    // Khi PostgreSQL báo 23505 (trùng giá trị phải duy nhất), ErrorMapper so tên ràng buộc để gắn lời báo
    // đúng ô trên form: "name" cho tên phòng ban, "email" cho email nhân viên.
    public const string DepartmentNameUnique = "ux_departments_name";
    public const string EmployeeEmailUnique = "ux_employees_email";

    // Đặt cho khóa ngoại ở EmployeeConfiguration (HasConstraintName). DepartmentService, EmployeeService so tên này
    // để chắc lỗi 23503/23001 đến từ quan hệ nhân viên → phòng ban, rồi mới báo lời dễ hiểu cho người dùng.
    public const string EmployeeDepartmentForeignKey = "fk_employees_department";
}