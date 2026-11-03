using System.Net;
using System.Text;

namespace EmployeeCrud.Api.Tests.Platform;

/// <summary>
/// Các lớp bảo vệ của phần nền (rà soát tổng thể 03/11/2026): chặn tên miền lạ (S-03)
/// và header bảo mật trên mọi phản hồi /api, kể cả phản hồi lỗi (S-05).
/// </summary>
public class SecurityTests(PlatformWebAppFactory factory) : IClassFixture<PlatformWebAppFactory>
{
    [Fact]
    public async Task UnknownHost_IsRejectedWith400()
    {
        // Kiểu tấn công "DNS rebinding": trang lạ trỏ tên miền của nó về máy mình, request mang Host lạ.
        var request = new HttpRequestMessage(HttpMethod.Get, "/api/test-only/ok");
        request.Headers.Host = "evil.example";

        var response = await factory.CreateClient().SendAsync(request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ValidationError_KeepsVietnamese_ButEncodesHtmlCharacters()
    {
        var content = new StringContent("{}", Encoding.UTF8, "application/json");

        var response = await factory.CreateClient().PostAsync("/api/test-only/validate-html", content);
        var raw = await response.Content.ReadAsStringAsync();

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        // Chữ Việt giữ nguyên dạng (không thành ữ...), còn < > bị mã hóa nên không bao giờ thành thẻ HTML.
        Assert.Contains("Ghi chú", raw);
        Assert.Contains("\\u003Cb\\u003E", raw);
        Assert.DoesNotContain("<b>", raw);
    }

    [Theory]
    [InlineData("/api/test-only/ok", HttpStatusCode.OK)]
    [InlineData("/api/khong-ton-tai", HttpStatusCode.NotFound)]
    [InlineData("/api/test-only/throw", HttpStatusCode.InternalServerError)]
    public async Task ApiResponses_CarrySecurityHeaders_EvenOnErrors(string path, HttpStatusCode expectedStatus)
    {
        var response = await factory.CreateClient().GetAsync(path);

        Assert.Equal(expectedStatus, response.StatusCode);
        Assert.Equal("nosniff", Assert.Single(response.Headers.GetValues("X-Content-Type-Options")));
        Assert.True(response.Headers.CacheControl?.NoStore, "Cache-Control phải có no-store");
        var csp = Assert.Single(response.Headers.GetValues("Content-Security-Policy"));
        Assert.Contains("frame-ancestors 'none'", csp);
    }
}