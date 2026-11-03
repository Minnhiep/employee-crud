using System.Collections.Concurrent;

using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;

namespace EmployeeCrud.Api.Tests.Platform;

/// <summary>
/// Giống PlatformWebAppFactory nhưng giữ lại mọi dòng log, để test kiểm "dòng nào được ghi, ở mức nào".
/// </summary>
public sealed class LogCapturingWebAppFactory : PlatformWebAppFactory
{
    public CapturedLogs Logs { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        base.ConfigureWebHost(builder);
        builder.ConfigureLogging(logging => logging.AddProvider(Logs));
    }
}

/// <summary>Bộ ghi log trong bộ nhớ: mỗi dòng giữ tên nhóm log (category) và mức.</summary>
public sealed class CapturedLogs : ILoggerProvider
{
    private readonly ConcurrentQueue<(string Category, LogLevel Level, string Message)> _entries = new();

    public IReadOnlyList<(string Category, LogLevel Level, string Message)> Entries => [.. _entries];

    public ILogger CreateLogger(string categoryName) => new CapturingLogger(categoryName, _entries);

    public void Dispose()
    {
    }

    private sealed class CapturingLogger(
        string category,
        ConcurrentQueue<(string Category, LogLevel Level, string Message)> entries) : ILogger
    {
        public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;

        public bool IsEnabled(LogLevel logLevel) => true;

        public void Log<TState>(
            LogLevel logLevel, EventId eventId, TState state, Exception? exception,
            Func<TState, Exception?, string> formatter) =>
            entries.Enqueue((category, logLevel, formatter(state, exception)));
    }
}