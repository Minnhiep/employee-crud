using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

using Npgsql;

namespace EmployeeCrud.Api.Platform.Errors;

/// <summary>
/// Đổi một lỗi (exception) thành phản hồi ProblemDetails theo phong bì C3.
/// Đây là hàm thuần: không đọc request, không ghi phản hồi, nên test được từng nhánh mà không cần chạy web.
/// Mã trả về luôn là 4xx hoặc 5xx (NFR3.3): không bao giờ biến lỗi thành thành công.
/// </summary>
public static class ErrorMapper
{
    // Mã lỗi chuẩn của PostgreSQL.
    private const string UniqueViolation = "23505";
    private const string ForeignKeyViolation = "23503";

    public static ProblemDetails Map(Exception exception) => exception switch
    {
        DomainError domainError => MapDomainError(domainError),
        DbUpdateException { InnerException: PostgresException postgres } => MapPostgres(postgres),
        BadHttpRequestException badRequest => MapBadRequest(badRequest),
        _ => ServerError(),
    };

    private static ProblemDetails MapDomainError(DomainError error) => error.Kind switch
    {
        // BR1.1
        DomainErrorKind.NotFound => new ProblemDetails
        {
            Status = StatusCodes.Status404NotFound,
            Title = ErrorTitles.NotFound,
            Detail = error.Message,
        },

        // BR1.2: lỗi kiểm dữ liệu luôn gắn với một trường.
        DomainErrorKind.Validation => WithErrors(
            StatusCodes.Status400BadRequest,
            ErrorTitles.Invalid,
            error.Field ?? ErrorTitles.BodyKey,
            error.Message),

        // BR1.3: có trường thì báo theo trường (để form tô đỏ đúng ô), không có thì báo chung bằng detail.
        DomainErrorKind.Conflict when error.Field is not null => WithErrors(
            StatusCodes.Status409Conflict,
            error.Title ?? ErrorTitles.Duplicate,
            error.Field,
            error.Message),

        DomainErrorKind.Conflict => new ProblemDetails
        {
            Status = StatusCodes.Status409Conflict,
            Title = error.Title ?? ErrorTitles.CannotPerform,
            Detail = error.Message,
        },

        _ => ServerError(),
    };

    // BR1.4, BR1.5: nhận ra lỗi database theo mã lỗi + tên ràng buộc.
    // Trường hợp này xảy ra khi hai request chen nhau vượt qua bước kiểm trong service.
    private static ProblemDetails MapPostgres(PostgresException postgres)
    {
        if (postgres.SqlState == UniqueViolation)
        {
            return postgres.ConstraintName switch
            {
                DbConstraintNames.DepartmentNameUnique => WithErrors(
                    StatusCodes.Status409Conflict, ErrorTitles.Duplicate, "name", ErrorTitles.DepartmentNameTaken),
                DbConstraintNames.EmployeeEmailUnique => WithErrors(
                    StatusCodes.Status409Conflict, ErrorTitles.Duplicate, "email", ErrorTitles.EmailTaken),
                // Ràng buộc lạ là lỗi ngoài dự kiến: trả 500 và để log ghi chi tiết.
                _ => ServerError(),
            };
        }

        if (postgres.SqlState == ForeignKeyViolation)
        {
            // Đường dự phòng: service U3/U4 lẽ ra đã bắt lỗi này và báo rõ hơn.
            // Ở đây không biết đang làm thao tác gì nên chỉ báo chung, không đoán.
            return new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = ErrorTitles.CannotPerform,
                Detail = ErrorTitles.ForeignKeyFallbackDetail,
            };
        }

        return ServerError();
    }

    // Lỗi do Kestrel/ASP.NET Core tự ném khi request hỏng: giữ đúng mã của nó (400, 413, ...).
    private static ProblemDetails MapBadRequest(BadHttpRequestException badRequest)
    {
        if (badRequest.StatusCode == StatusCodes.Status400BadRequest)
        {
            return WithErrors(
                StatusCodes.Status400BadRequest, ErrorTitles.Invalid, ErrorTitles.BodyKey, ErrorTitles.InvalidJsonMessage);
        }

        return new ProblemDetails
        {
            Status = badRequest.StatusCode,
            Title = badRequest.StatusCode == StatusCodes.Status413PayloadTooLarge
                ? ErrorTitles.PayloadTooLarge
                : ErrorTitles.BadRequest,
        };
    }

    // BR1.6: không đưa thông điệp gốc ra ngoài (có thể chứa câu SQL, tên bảng...); chi tiết chỉ nằm trong log.
    private static ProblemDetails ServerError() => new()
    {
        Status = StatusCodes.Status500InternalServerError,
        Title = ErrorTitles.ServerError,
        Detail = ErrorTitles.ServerErrorDetail,
    };

    private static HttpValidationProblemDetails WithErrors(int status, string title, string field, string message) =>
        new(new Dictionary<string, string[]> { [field] = [message] })
        {
            Status = status,
            Title = title,
        };
}