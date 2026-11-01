namespace EmployeeCrud.Api.Platform.Errors;

/// <summary>
/// Tên ràng buộc database cố định. Migration của phòng ban (U3) và nhân viên (U4) phải đặt đúng các tên này,
/// vì ErrorMapper nhận ra lỗi trùng / lỗi khóa ngoại dựa vào tên ràng buộc, không đoán từ câu báo lỗi.
/// </summary>
public static class DbConstraintNames
{
    public const string DepartmentNameUnique = "ux_departments_name";
    public const string EmployeeEmailUnique = "ux_employees_email";
    public const string EmployeeDepartmentForeignKey = "fk_employees_department";
}