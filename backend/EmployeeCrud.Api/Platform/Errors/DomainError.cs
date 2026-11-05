namespace EmployeeCrud.Api.Platform.Errors;

/// <summary>Ba loại lỗi nghiệp vụ mà service có thể báo.</summary>
public enum DomainErrorKind
{
    NotFound,
    Validation,
    Conflict,
}

/// <summary>
/// Lỗi nghiệp vụ do service của phòng ban / nhân viên ném ra.
/// Service chỉ nói "lỗi gì", không cần biết mã HTTP; ErrorMapper lo việc đổi sang 404/400/409.
/// </summary>
public sealed class DomainError : Exception
{
    private DomainError(DomainErrorKind kind, string message, string? field, string? title)
        : base(message)
    {
        Kind = kind;
        Field = field;
        Title = title;
    }

    public DomainErrorKind Kind { get; }

    /// <summary>Tên trường camelCase bị lỗi (ví dụ "email"); rỗng nếu lỗi không gắn với trường nào.</summary>
    public string? Field { get; }

    /// <summary>Ghi đè title mặc định, ví dụ "Không thể xóa phòng ban".</summary>
    public string? Title { get; }

    public static DomainError NotFound(string message) =>
        new(DomainErrorKind.NotFound, message, field: null, title: null);

    public static DomainError Validation(string field, string message) =>
        new(DomainErrorKind.Validation, message, field, title: null);

    public static DomainError Conflict(string message, string? field = null, string? title = null) =>
        new(DomainErrorKind.Conflict, message, field, title);
}