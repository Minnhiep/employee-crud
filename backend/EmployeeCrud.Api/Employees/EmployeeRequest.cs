using System.ComponentModel.DataAnnotations;

namespace EmployeeCrud.Api.Employees;

/// <summary>
/// Dữ liệu gửi lên khi thêm hoặc sửa nhân viên (hợp đồng C2).
/// JSON: <c>{ "fullName": "Đỗ Văn An", "email": "do.an@congty.vn", "departmentId": 2 }</c>.
/// </summary>
public class EmployeeRequest
{
    // [Required] chặn sớm trường hợp thiếu trường, null, rỗng hoặc chỉ toàn khoảng trắng.
    // Cố ý không đặt [MaxLength]: độ dài phải đo SAU khi bỏ khoảng trắng hai đầu (BR1.3, BR1.5),
    // nên luật độ dài chỉ nằm ở EmployeeService để không có hai câu trả lời khác nhau.
    [Required(ErrorMessage = EmployeeService.FullNameRequiredMessage)]
    public string? FullName { get; set; }

    [Required(ErrorMessage = EmployeeService.EmailRequiredMessage)]
    public string? Email { get; set; }

    // Kiểu int? và không có [Required]: nếu để int thì thiếu trường sẽ âm thầm thành 0;
    // nếu thêm [Required] thì lời báo nằm ở hai chỗ. Service kiểm "null hoặc < 1" để chỉ có
    // đúng một lời báo "Vui lòng chọn phòng ban" (security-design §1).
    public int? DepartmentId { get; set; }
}