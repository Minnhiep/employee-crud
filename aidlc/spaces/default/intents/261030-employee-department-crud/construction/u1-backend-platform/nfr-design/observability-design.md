# Thiết kế log: u1-backend-platform

> **Nguồn:** `nfr-requirements/observability-requirements.md` (NFR6.1–NFR6.3, NFR2.5), `nfr-requirements/security-requirements.md` (NFR2.3).

- **Nơi ghi:** console, bằng logger có sẵn của ASP.NET Core. Không ghi ra file, không gửi đi đâu.
- **Mức log** (đặt trong `appsettings.json`): `Default: Information`, `Microsoft.AspNetCore: Warning`, `Microsoft.EntityFrameworkCore: Warning`. Riêng `appsettings.Development.json` có thể bật `Microsoft.EntityFrameworkCore.Database.Command: Information` khi Hiệp muốn xem câu SQL để học; mặc định tắt.
- **Lỗi 500:** `IExceptionHandler` ghi đúng một dòng mức Error theo mẫu `"Lỗi không xử lý: {Method} {Path}"`, kèm đối tượng lỗi. Logger tự in stack trace ra console. Không ghi body request.
- **Lỗi 4xx:** ghi mức Information `"{Status} {Method} {Path}"`. Không ghi stack trace.
- **Không ghi:** chuỗi kết nối, mật khẩu, toàn bộ body. Npgsql không đưa mật khẩu vào thông điệp lỗi, vì chuỗi kết nối mặc định có `Persist Security Info=false`.
- **Không có:** truy vết phân tán, mã liên kết request (correlation ID), dashboard, cảnh báo, SLO. Chỉ chạy trên máy cá nhân.
