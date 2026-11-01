# Thiết kế theo dõi trên máy: u3-departments

> **Nguồn:** `nfr-design/observability-design.md` (NFR6.1–NFR6.3), `nfr-design/performance-design.md` (NFR5.1, NFR5.2, NFR5.4), `nfr-design/reliability-design.md` (NFR4.2), thiết kế theo dõi của U1.
>
> Một người dùng chạy trên máy, nên không có hệ thống thu số liệu, cảnh báo hay dashboard. "Theo dõi" ở đây nghĩa là đọc log trên cửa sổ `dotnet run` và đo bằng tay một số chỉ số ở lúc kiểm.

## Metrics & KPIs

| Metric | Source | Threshold | Why it matters |
|---|---|---|---|
| Thời gian phản hồi `/api/departments` (5 thao tác) | Cột thời gian của Postman, lấy số lớn nhất trong 3 lần | ≤ 1 giây | NFR5.1, NFR5.2 |
| Độ phủ dòng của `DepartmentService` | Bảng `TextSummary` của reportgenerator đọc từ `coverage.cobertura.xml` | ≥ 80% | NFR4.2, team.md Testing Posture |
| Lighthouse Performance trang `/departments` | Lighthouse trên `npm run preview` (cổng 5173) | ≥ 90 | NFR5.4 |
| Số test xanh | `dotnet test` | 100% | NFR4.1 |

## Alerts

| Alert | Condition | Severity | Routes to |
|---|---|---|---|
| Không có | — | — | Một người dùng trên máy. Lỗi hiện ngay trên giao diện và trong log của cửa sổ `dotnet run` (U1) |

## SLIs / SLOs

| SLI | SLO target | Measurement window |
|---|---|---|
| Không đặt SLO | — | Không có môi trường chạy thật. Các ngưỡng ở bảng Metrics là tiêu chí đạt khi kiểm, không phải SLO |

## Logs & Tracing

| Mục | Cấu hình | Nguồn |
|---|---|---|
| Log lỗi của request phòng ban | Do U1 ghi: 4xx ở mức Information (`{Status} {Method} {Path}`), 500 ở mức Error kèm stack. U3 không thêm logger | NFR6.1 |
| Log câu SQL | `appsettings.Development.json`, khóa `Logging:LogLevel:Microsoft.EntityFrameworkCore.Database.Command`: mặc định `Warning`, đổi sang `Information` khi muốn xem SQL | NFR6.3 |
| Dữ liệu nhạy cảm | Không bật `EnableSensitiveDataLogging`; log chỉ hiện `@p0`, không hiện giá trị | NFR6.2 |
| Tracing, dashboard | Không có | observability-design §4 |
