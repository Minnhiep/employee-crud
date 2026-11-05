using System.Net.Http.Json;
using System.Text.Json;

using Microsoft.Extensions.Logging;

namespace EmployeeCrud.Api.Tests.Platform;

/// <summary>
/// Nhật ký lỗi: mỗi lỗi 500 có traceId trong log trùng traceId trong phản hồi;
/// request bị trình duyệt hủy giữa chừng không bị ghi thành lỗi.
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
        var startedBefore = TestOnlyController.SlowRequestsStarted;
        var cancelledBefore = TestOnlyController.SlowRequestsCancelled;
        using var cancel = new CancellationTokenSource();

        var request = _factory.CreateClient().GetAsync("/api/test-only/slow", cancel.Token);

        // Hủy khi máy chủ đã nhận request, không hủy theo hẹn giờ: máy chậm cũng không hủy nhầm lúc request chưa tới.
        Assert.True(
            await WaitUntilAsync(() => TestOnlyController.SlowRequestsStarted > startedBefore),
            "Request chậm phải tới được máy chủ");
        await cancel.CancelAsync();
        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => request);

        Assert.True(
            await WaitUntilAsync(() => TestOnlyController.SlowRequestsCancelled > cancelledBefore),
            "Máy chủ phải nhận được việc hủy");
        // "Request finished" được ghi sau cùng, khi bộ bắt lỗi đã chạy hết: tới lúc đó đọc log mới chắc đủ dòng.
        Assert.True(
            await WaitUntilAsync(() => _factory.Logs.Entries.Any(IsSlowRequestFinished)),
            "Máy chủ phải xử lý xong request bị hủy");
        Assert.DoesNotContain(_factory.Logs.Entries, entry => entry.Level >= LogLevel.Error);
    }

    private static bool IsSlowRequestFinished((string Category, LogLevel Level, string Message) entry) =>
        entry.Message.StartsWith("Request finished", StringComparison.Ordinal)
        && entry.Message.Contains("/api/test-only/slow", StringComparison.Ordinal);

    // Chờ theo điều kiện, tối đa 5 giây, thay vì chờ cố định: máy chậm cũng không chập chờn.
    private static async Task<bool> WaitUntilAsync(Func<bool> condition)
    {
        var deadline = DateTime.UtcNow.AddSeconds(5);
        while (!condition() && DateTime.UtcNow < deadline)
        {
            await Task.Delay(50);
        }

        return condition();
    }
}