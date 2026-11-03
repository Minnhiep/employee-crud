namespace EmployeeCrud.Api.Platform.Security;

/// <summary>
/// Gắn các header bảo mật cơ bản (mức sàn của OWASP cho API) vào mọi phản hồi của ứng dụng,
/// trừ phản hồi 400 do Host lạ: bộ lọc AllowedHosts của ASP.NET Core chạy trước cả bước này (body 400 đó rỗng, rủi ro rất thấp).
/// - X-Content-Type-Options: nosniff: trình duyệt không "đoán" kiểu nội dung, JSON không bao giờ bị coi là HTML hay script.
/// - Riêng /api: Cache-Control: no-store để họ tên, email không nằm lại trong bộ nhớ đệm của trình duyệt;
///   Content-Security-Policy chặn mọi nội dung chạy kèm và chặn trang khác nhúng phản hồi vào khung (clickjacking).
/// Không áp CSP cho /swagger vì trang đó cần chạy script của chính nó.
/// </summary>
public static class SecurityHeaders
{
    private const string ApiCsp = "default-src 'none'; frame-ancestors 'none'";

    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app) =>
        app.Use(async (context, next) =>
        {
            // Gắn lúc phản hồi bắt đầu gửi (OnStarting), không gắn ngay: bộ bắt lỗi xóa sạch header trước khi
            // ghi phản hồi lỗi, nên gắn sớm thì lỗi 404/500 sẽ mất các header này.
            context.Response.OnStarting(() =>
            {
                var headers = context.Response.Headers;
                headers.XContentTypeOptions = "nosniff";

                if (context.Request.Path.StartsWithSegments("/api"))
                {
                    headers.CacheControl = "no-store";
                    headers.ContentSecurityPolicy = ApiCsp;
                }

                return Task.CompletedTask;
            });

            await next(context);
        });
}