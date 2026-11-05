namespace EmployeeCrud.Api.Platform.Errors;

/// <summary>
/// Các câu báo lỗi tiếng Việt dùng chung.
/// Gom về một chỗ để giao diện, Postman và test cùng thấy đúng một câu.
/// </summary>
public static class ErrorTitles
{
    public const string NotFound = "Không tìm thấy";
    public const string Invalid = "Dữ liệu không hợp lệ";
    public const string Duplicate = "Dữ liệu bị trùng";
    public const string CannotPerform = "Không thể thực hiện";
    public const string ServerError = "Lỗi máy chủ";
    public const string MethodNotAllowed = "Phương thức không được hỗ trợ";
    public const string UnsupportedMediaType = "Kiểu dữ liệu không được hỗ trợ";
    public const string PayloadTooLarge = "Dữ liệu gửi lên quá lớn";
    public const string BadRequest = "Yêu cầu không hợp lệ";

    public const string ServerErrorDetail = "Đã có lỗi xảy ra, vui lòng thử lại sau.";
    public const string NoSuchPathDetail = "Không có đường dẫn API này.";
    public const string UnsupportedMediaTypeDetail = "Hãy gửi JSON (Content-Type: application/json).";
    public const string InvalidJsonMessage = "Dữ liệu gửi lên không đúng định dạng JSON";
    public const string InvalidValueTypeMessage = "Giá trị không đúng kiểu dữ liệu";
    public const string ForeignKeyFallbackDetail = "Dữ liệu liên quan đã thay đổi, vui lòng tải lại trang rồi thử lại.";
    public const string DepartmentNameTaken = "Tên phòng ban đã tồn tại";
    public const string EmailTaken = "Email đã được sử dụng";

    /// <summary>Khóa trong errors khi không xác định được trường nào sai (ví dụ JSON hỏng).</summary>
    public const string BodyKey = "body";

    // Khóa JSON của hai ô có ràng buộc duy nhất. Đặt ở tầng nền để ErrorMapper dùng được mà không phụ thuộc ngược
    // vào tầng nghiệp vụ; service tham chiếu lại đây, nên hai bên không thể lệch nhau.
    public const string NameKey = "name";
    public const string EmailKey = "email";
}