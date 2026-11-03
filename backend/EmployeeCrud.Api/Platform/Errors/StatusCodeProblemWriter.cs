using System.Diagnostics;

using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace EmployeeCrud.Api.Platform.Errors;

/// <summary>
/// Framework tự trả 404 (đường dẫn lạ), 405 (sai phương thức), 415 (sai Content-Type) mà không có nội dung.
/// Lớp này điền nội dung ProblemDetails tiếng Việt cho các phản hồi đó (BR1.7).
/// </summary>
public static class StatusCodeProblemWriter
{
    public static async Task WriteAsync(StatusCodeContext statusContext)
    {
        var httpContext = statusContext.HttpContext;
        var status = httpContext.Response.StatusCode;

        var (title, detail) = status switch
        {
            StatusCodes.Status404NotFound => (ErrorTitles.NotFound, ErrorTitles.NoSuchPathDetail),
            StatusCodes.Status405MethodNotAllowed => (ErrorTitles.MethodNotAllowed, null),
            StatusCodes.Status415UnsupportedMediaType =>
                (ErrorTitles.UnsupportedMediaType, ErrorTitles.UnsupportedMediaTypeDetail),
            _ => (ErrorTitles.BadRequest, (string?)null),
        };

        // Cùng cách tính với ProblemDetailsExceptionHandler, để mọi phản hồi lỗi đều có traceId dò được trong log.
        var traceId = Activity.Current?.Id ?? httpContext.TraceIdentifier;

        var logger = httpContext.RequestServices
            .GetRequiredService<ILoggerFactory>()
            .CreateLogger(typeof(StatusCodeProblemWriter));
        logger.LogInformation("{Status} {Method} {Path} (traceId {TraceId})",
            status, httpContext.Request.Method, httpContext.Request.Path, traceId);

        var problem = new ProblemDetails
        {
            Type = TypeFor(status),
            Title = title,
            Status = status,
            Detail = detail,
            Extensions = { ["traceId"] = traceId },
        };

        // Ghi thẳng JSON thay vì qua IProblemDetailsService: với request đã vào tới controller (ví dụ 415),
        // dịch vụ đó giao việc cho bộ ghi của MVC, mà bộ ghi này bị tắt (SuppressMapClientErrors) nên sẽ không ghi gì.
        await httpContext.Response.WriteAsJsonAsync(problem, options: null, contentType: "application/problem+json");
    }

    // Đường dẫn mô tả mã lỗi theo chuẩn HTTP (RFC 9110), giống trường "type" của các lỗi khác.
    private static string TypeFor(int status) => status switch
    {
        StatusCodes.Status404NotFound => "https://tools.ietf.org/html/rfc9110#section-15.5.5",
        StatusCodes.Status405MethodNotAllowed => "https://tools.ietf.org/html/rfc9110#section-15.5.6",
        StatusCodes.Status415UnsupportedMediaType => "https://tools.ietf.org/html/rfc9110#section-15.5.16",
        _ => "https://tools.ietf.org/html/rfc9110#section-15.5.1",
    };
}