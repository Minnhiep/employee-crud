using System.Net.Http.Json;
using System.Text.Json;

using Microsoft.Extensions.Logging;

namespace EmployeeCrud.Api.Tests.Platform;

/// <summary>
/// Nhật ký lỗi (NFR6.2, rà soát tổng thể 03/11/2026): mỗi lỗi 500 có traceId trong log trùng traceId trong phản hồi (A-02);
/// request bị trình duyệt hủy giữa chừng không bị ghi thành lỗi (A-01).
/// </summary>
public class LoggingTests : IDisposable
{
    private const string HandlerCategory = "EmployeeCrud.Api.Platform.Errors.ProblemDetailsExceptionHandler";

    private readonly LogCapturingWebAppFactory _factory = new();

    public void Dispose()
    {
        _factory.Dispose();
        GC.SuppressFinalize(this);
    }

    [Fact]
    public async Task ServerError_LogsOneErrorLine_WithTheSameTraceIdAsTheResponse()
    {
        var response = await _factory.CreateClient().GetAsync("/api/test-only/throw");
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        var traceId = body.GetProperty("traceId").GetString();

        Assert.False(string.IsNullOrEmpty(traceId));
        var errorLine = Assert.Single(_factory.Logs.Entries, entry => entry.Level >= LogLevel.Error);
        Assert.Equal(HandlerCategory, errorLine.Category);
        Assert.Contains(traceId!, errorLine.Message);
    }

    [Fact]
    public async Task RequestCancelledByTheBrowser_IsNotLoggedAsAnError()
    {
        // Giống trang Nhân viên: người dùng tìm kiếm mới thì lời gọi cũ bị hủy giữa chừng.
        var cancelledBefore = TestOnlyController.SlowRequestsCancelled;
        using var cancel = new CancellationTokenSource(TimeSpan.FromMilliseconds(300));

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() =>
            _factory.CreateClient().GetAsync("/api/test-only/slow", cancel.Token));

        // Chờ (tối đa 5 giây) tới khi máy chủ báo đã nhận việc hủy, thay vì chờ cố định: máy chậm cũng không chập chờn.
        var deadline = DateTime.UtcNow.AddSeconds(5);
        while (TestOnlyController.SlowRequestsCancelled <= cancelledBefore && DateTime.UtcNow < deadline)
        {
            await Task.Delay(50);
        }

        Assert.True(TestOnlyController.SlowRequestsCancelled > cancelledBefore, "Máy chủ phải nhận được việc hủy");
        // Cho bộ bắt lỗi chạy hết sau khi exception rời action, rồi mới đọc log.
        await Task.Delay(200);
        Assert.DoesNotContain(_factory.Logs.Entries, entry => entry.Level >= LogLevel.Error);
    }
}