using System.ComponentModel.DataAnnotations;

namespace EmployeeCrud.Api.Departments;

/// <summary>
/// Dữ liệu gửi lên khi thêm hoặc sửa phòng ban. JSON: <c>{ "name": "Kế toán" }</c>.
/// </summary>
public class DepartmentRequest
{
    // Chặn sớm trường hợp thiếu trường, null, rỗng hoặc chỉ toàn khoảng trắng.
    // Cố ý không đặt [MaxLength]: độ dài phải đo SAU khi chuẩn hóa (bỏ hai đầu, gộp khoảng trắng, đưa về NFC),
    // nên luật độ dài chỉ nằm ở DepartmentService để không có hai câu trả lời khác nhau.
    [Required(ErrorMessage = DepartmentService.NameRequiredMessage)]
    public string? Name { get; set; }
}