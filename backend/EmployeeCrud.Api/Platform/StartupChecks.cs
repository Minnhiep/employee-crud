namespace EmployeeCrud.Api.Platform;

/// <summary>Kiểm cấu hình bắt buộc lúc khởi động (BR2.1, NFR1.1).</summary>
public static class StartupChecks
{
    // Khớp khóa "ConnectionStrings:Default" trong user-secrets; đổi tên ở đây thì phải đổi cả lệnh trong README.
    public const string ConnectionStringName = "Default";

    // Câu mẫu cố ý không chứa phần mật khẩu, để bước quét bí mật trước khi commit không báo nhầm.
    public const string MissingConnectionStringMessage =
        "Thiếu cấu hình ConnectionStrings:Default. Hãy đặt bằng lệnh: " +
        "dotnet user-secrets set \"ConnectionStrings:Default\" " +
        "\"Host=localhost;Port=5432;Database=employee_db;Username=<tài khoản>\" " +
        "--project backend/EmployeeCrud.Api " +
        "(thêm \";Password\", dấu bằng và mật khẩu PostgreSQL của anh vào cuối chuỗi trong ngoặc kép).";

    /// <summary>
    /// Thiếu chuỗi kết nối thì dừng ngay với lời hướng dẫn, thay vì để tới request đầu tiên mới lỗi khó hiểu.
    /// Ném ngoại lệ (không gọi Environment.Exit) để tiến trình thoát với mã khác 0
    /// mà vẫn để test kiểm được trường hợp này.
    /// </summary>
    public static void EnsureConnectionString(WebApplication app)
    {
        // Chỉ kiểm chuỗi kết nối có hay không, không mở kết nối thử: backend vẫn khởi động được khi PostgreSQL tắt,
        // EF Core chỉ kết nối lúc có request cần dữ liệu (NFR1.4).
        var connectionString = app.Configuration.GetConnectionString(ConnectionStringName);
        if (!string.IsNullOrWhiteSpace(connectionString))
        {
            return;
        }

        // Chỉ in câu hướng dẫn, không in giá trị cấu hình nào (BR3.2).
        app.Logger.LogCritical(MissingConnectionStringMessage);
        throw new InvalidOperationException(MissingConnectionStringMessage);
    }
}