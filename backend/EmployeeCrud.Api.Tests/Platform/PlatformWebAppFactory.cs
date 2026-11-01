using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace EmployeeCrud.Api.Tests.Platform;

/// <summary>
/// Dựng ứng dụng thật trong bộ nhớ để gửi request thử, không cần mở cổng mạng hay database.
/// </summary>
public class PlatformWebAppFactory : WebApplicationFactory<Program>
{
    // Chuỗi giả, không có mật khẩu và không bao giờ được dùng để kết nối: test chỉ cần ứng dụng khởi động được.
    protected virtual string ConnectionString => "Host=localhost;Database=employee_crud_test";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        // Môi trường "Testing" (không phải Development) để KHÔNG nạp user-secrets thật trên máy.
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Default", ConnectionString);
        builder.ConfigureServices(services => services
            .AddControllers()
            .AddApplicationPart(typeof(TestOnlyController).Assembly));
    }
}

/// <summary>Giống factory trên nhưng cố ý để trống chuỗi kết nối.</summary>
public sealed class MissingConnectionStringWebAppFactory : PlatformWebAppFactory
{
    protected override string ConnectionString => string.Empty;
}