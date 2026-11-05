using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;

namespace EmployeeCrud.Api.Tests.Platform;

public class PipelineTests(PlatformWebAppFactory factory) : IClassFixture<PlatformWebAppFactory>
{
    private const string FrontendOrigin = "http://localhost:5173";
    private const string ProblemJson = "application/problem+json";
    private const string AllowOriginHeader = "Access-Control-Allow-Origin";

    private async Task<HttpResponseMessage> SendAsync(
        HttpMethod method, string path, string? origin = FrontendOrigin, HttpContent? content = null)
    {
        var request = new HttpRequestMessage(method, path) { Content = content };
        if (origin is not null)
        {
            request.Headers.Add("Origin", origin);
        }

        return await factory.CreateClient().SendAsync(request);
    }

    private static async Task<JsonElement> ReadJsonAsync(HttpResponseMessage response) =>
        await response.Content.ReadFromJsonAsync<JsonElement>();

    [Fact]
    public async Task UnhandledError_Returns500ProblemWithCorsHeader()
    {
        var response = await SendAsync(HttpMethod.Get, "/api/test-only/throw");

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal(ProblemJson, response.Content.Headers.ContentType?.MediaType);
        Assert.True(response.Headers.TryGetValues(AllowOriginHeader, out var origins));
        Assert.Equal(FrontendOrigin, Assert.Single(origins));

        var body = await ReadJsonAsync(response);
        Assert.Equal("Lỗi máy chủ", body.GetProperty("title").GetString());
        Assert.DoesNotContain("Lỗi giả lập", body.GetRawText());
    }

    [Fact]
    public async Task UnknownPath_Returns404ProblemWithCorsHeader()
    {
        var response = await SendAsync(HttpMethod.Get, "/api/khong-ton-tai");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal(ProblemJson, response.Content.Headers.ContentType?.MediaType);
        Assert.True(response.Headers.Contains(AllowOriginHeader));

        var body = await ReadJsonAsync(response);
        Assert.Equal("Không tìm thấy", body.GetProperty("title").GetString());
        Assert.Equal("Không có đường dẫn API này.", body.GetProperty("detail").GetString());
    }

    [Fact]
    public async Task UnknownOrigin_GetsNoCorsHeader()
    {
        var response = await SendAsync(HttpMethod.Get, "/api/khong-ton-tai", origin: "http://evil.example");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.False(response.Headers.Contains(AllowOriginHeader));
    }

    [Fact]
    public async Task MissingRequiredField_Returns400WithCamelCaseKey()
    {
        var response = await SendAsync(
            HttpMethod.Post, "/api/test-only/validate", content: JsonContent.Create(new { departmentId = 1 }));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(ProblemJson, response.Content.Headers.ContentType?.MediaType);

        var body = await ReadJsonAsync(response);
        Assert.Equal("Dữ liệu không hợp lệ", body.GetProperty("title").GetString());
        var messages = body.GetProperty("errors").GetProperty("fullName");
        Assert.Equal("Họ tên là bắt buộc", messages[0].GetString());
    }

    // Controller thật có [Produces("application/json")], thứ có thể làm 400 trả application/json
    // không có type, khi đó client.ts (chỉ đọc problem+json) mất lời báo theo ô.
    [Fact]
    public async Task MissingRequiredField_OnProducesJsonAction_StillReturnsProblemJsonWithType()
    {
        var response = await SendAsync(
            HttpMethod.Post,
            "/api/test-only/validate-produces-json",
            content: JsonContent.Create(new { departmentId = 1 }));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal(ProblemJson, response.Content.Headers.ContentType?.MediaType);
        Assert.True(response.Headers.Contains(AllowOriginHeader));

        // Chữ tiếng Việt ghi nguyên dạng như 404/409, không thành mã thoát \uXXXX.
        Assert.Contains("Dữ liệu không hợp lệ", await response.Content.ReadAsStringAsync());

        var body = await ReadJsonAsync(response);
        Assert.Equal("https://tools.ietf.org/html/rfc9110#section-15.5.1", body.GetProperty("type").GetString());
        Assert.Equal("Dữ liệu không hợp lệ", body.GetProperty("title").GetString());
        Assert.Equal(400, body.GetProperty("status").GetInt32());
        Assert.False(string.IsNullOrWhiteSpace(body.GetProperty("traceId").GetString()));
        Assert.Equal("Họ tên là bắt buộc", body.GetProperty("errors").GetProperty("fullName")[0].GetString());
    }

    [Fact]
    public async Task MalformedJson_Returns400WithErrors()
    {
        var response = await SendAsync(
            HttpMethod.Post,
            "/api/test-only/validate",
            content: new StringContent("{ \"fullName\": ", Encoding.UTF8, "application/json"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);

        var body = await ReadJsonAsync(response);
        Assert.Equal("Dữ liệu không hợp lệ", body.GetProperty("title").GetString());
        Assert.True(body.GetProperty("errors").EnumerateObject().Any());
    }

    [Fact]
    public async Task WrongMethod_Returns405Problem()
    {
        var response = await SendAsync(HttpMethod.Delete, "/api/test-only/throw");

        Assert.Equal(HttpStatusCode.MethodNotAllowed, response.StatusCode);
        Assert.Equal(ProblemJson, response.Content.Headers.ContentType?.MediaType);

        var body = await ReadJsonAsync(response);
        Assert.Equal("Phương thức không được hỗ trợ", body.GetProperty("title").GetString());
    }

    [Fact]
    public async Task WrongContentType_Returns415Problem()
    {
        var response = await SendAsync(
            HttpMethod.Post,
            "/api/test-only/validate",
            content: new StringContent("fullName=An", Encoding.UTF8, "text/plain"));

        Assert.Equal(HttpStatusCode.UnsupportedMediaType, response.StatusCode);
        Assert.Equal(ProblemJson, response.Content.Headers.ContentType?.MediaType);

        var body = await ReadJsonAsync(response);
        Assert.Equal("Kiểu dữ liệu không được hỗ trợ", body.GetProperty("title").GetString());
    }

    [Fact]
    public void MissingConnectionString_StopsStartup()
    {
        using var missingFactory = new MissingConnectionStringWebAppFactory();

        var exception = Record.Exception(() => missingFactory.CreateClient());

        Assert.NotNull(exception);
        // Lỗi gốc có thể bị bọc trong lỗi khác khi đi qua WebApplicationFactory, nên tìm trong cả chuỗi.
        var messages = new List<string>();
        for (var current = exception; current is not null; current = current.InnerException)
        {
            messages.Add(current.Message);
        }

        Assert.Contains(messages, message => message.Contains("ConnectionStrings:Default"));
    }
}