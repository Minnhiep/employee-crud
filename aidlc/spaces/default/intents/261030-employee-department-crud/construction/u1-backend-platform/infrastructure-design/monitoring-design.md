# Thiết kế theo dõi: u1-backend-platform

> **Nguồn:** `nfr-design/observability-design.md`, `nfr-design/performance-design.md`, `nfr-design/reliability-design.md`, `team.md` mục Deployment.
>
> Dự án chạy trên máy cá nhân, một người dùng. "Theo dõi" ở đây là **đọc log trên cửa sổ console** và **kiểm bằng tay** khi chạy thử. Không có hệ thống thu thập số liệu, không cảnh báo tự động, không dashboard.

## Metrics & KPIs

Không thu số liệu liên tục. Các con số dưới đây được **đo một lần** ở Build and Test, bằng công cụ có sẵn.

| Metric | Source | Threshold | Why it matters |
|---|---|---|---|
| Thời gian khởi động backend | Dòng log `Now listening on:` của Kestrel, so với lúc gõ `dotnet run` | ≤ 10 giây (ngân sách tự đặt, NFR5.3) | Hiệp chạy lại backend nhiều lần khi học; khởi động chậm làm mất thời gian |
| Thời gian phản hồi một request | Cột thời gian của Postman, hoặc tab Network của trình duyệt | ≤ 1 giây cả vòng (NFR5); phần nền ≤ 20 ms là ngân sách tự đặt, đo và báo, không chặn | Giao diện phải phản hồi nhanh khi thêm, sửa, xóa, tìm |
| Độ phủ dòng của các lớp service | coverlet (`dotnet test --collect:"XPlat Code Coverage"`) | ≥ 80% (`team.md` Testing Posture) | Mức sàn đã chốt; Build and Test không được hạ |

## Alerts

| Alert | Condition | Severity | Routes to |
|---|---|---|---|
| Thiếu chuỗi kết nối | Lúc khởi động, `ConnectionStrings:Default` rỗng: log mức Critical bằng tiếng Việt, kèm lệnh `dotnet user-secrets set ...`, rồi tiến trình thoát (NFR1.1) | Critical | Console của Hiệp |
| Lỗi không xử lý | Một request ra 500: log một dòng mức Error `"Lỗi không xử lý: {Method} {Path}"` kèm stack trace | Error | Console của Hiệp |
| Lỗi phía người dùng | Request ra 4xx: log mức Information `"{Status} {Method} {Path}"`, không stack trace | Information | Console của Hiệp |

Không có cảnh báo gửi đi (email, chat), vì không có ai trực hệ thống.

## SLIs / SLOs

Không áp dụng. SLO cần một dịch vụ chạy liên tục cho nhiều người dùng, còn ở đây backend chỉ bật khi Hiệp làm bài. Thay vào đó, tiêu chí "chạy được" là bốn điều trong `team.md` Deployment: migration chạy được, trang OpenAPI mở được, Postman ra đúng kết quả, giao diện làm được đủ thêm, sửa, xóa, tìm.

| SLI | SLO target | Measurement window |
|---|---|---|
| Không áp dụng | — | — |

## Logs & Tracing

| Mục | Thiết kế |
|---|---|
| Nơi ghi | Console, bằng logger có sẵn của ASP.NET Core. Không ghi file, không gửi đi |
| Mức log (`appsettings.json`) | `Default: Information`, `Microsoft.AspNetCore: Warning`, `Microsoft.EntityFrameworkCore: Warning` |
| Xem câu SQL khi học | Hiệp có thể tự bật `Microsoft.EntityFrameworkCore.Database.Command: Information` trong `appsettings.Development.json`; mặc định tắt |
| Không ghi | Chuỗi kết nối, mật khẩu, body request (NFR2.3) |
| Vị trí ghi 4xx | Trong `IExceptionHandler` và trang mã trạng thái, không thêm middleware mới (giữ chuỗi xử lý 5 bước của NFR5.1) |
| Tracing, correlation ID | Không có: một tiến trình, một người dùng |
| Dashboard | Không có. Database xem bằng pgAdmin 4; API xem bằng trang OpenAPI và Postman |
