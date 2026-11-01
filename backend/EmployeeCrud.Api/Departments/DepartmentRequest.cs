using System.ComponentModel.DataAnnotations;

namespace EmployeeCrud.Api.Departments;

/// <summary>
/// Dữ liệu gửi lên khi thêm hoặc sửa phòng ban (hợp đồng C1). JSON: <c>{ "name": "Kế toán" }</c>.
/// </summary>
public class DepartmentRequest
{
    // Chặn sớm trường hợp thiếu trường, null, rỗng hoặc chỉ toàn khoảng trắng.
    // Cố ý không đặt [MaxLength]: độ dài phải đo SAU khi bỏ khoảng trắng hai đầu (BR1.3),
    // nên luật độ dài chỉ nằm ở DepartmentService để không có hai câu trả lời khác nhau.
    [Required(ErrorMessage = DepartmentService.NameRequiredMessage)]
    public string? Name { get; set; }
}