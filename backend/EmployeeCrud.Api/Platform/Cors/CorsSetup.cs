namespace EmployeeCrud.Api.Platform.Cors;

/// <summary>
/// CORS: trình duyệt chỉ cho trang web ở origin khác gọi API khi API trả header cho phép.
/// Ở đây chỉ cho đúng địa chỉ dev của Vite (cấu hình Cors:AllowedOrigins), không dùng "*".
/// </summary>
public static class CorsSetup
{
    public const string PolicyName = "Frontend";

    public static IServiceCollection AddFrontendCors(this IServiceCollection services, IConfiguration configuration)
    {
        // Đọc danh sách từ appsettings; thiếu mục này thì vẫn cho đúng địa chỉ frontend chạy trên máy,
        // để ứng dụng không bị chặn CORS chỉ vì quên cấu hình.
        var allowedOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? ["http://localhost:5173"];

        return services.AddCors(options => options.AddPolicy(PolicyName, policy => policy
            .WithOrigins(allowedOrigins)
            .WithMethods("GET", "POST", "PUT", "DELETE")
            .WithHeaders("Content-Type")));
        // Không gọi AllowCredentials: ứng dụng không có đăng nhập, không cần gửi cookie.
    }
}