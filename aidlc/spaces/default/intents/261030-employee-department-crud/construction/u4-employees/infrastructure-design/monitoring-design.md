# Thiết kế theo dõi trên máy: u4-employees

> **Nguồn:** `nfr-design/observability-design.md` (NFR6.1–NFR6.3), `nfr-design/performance-design.md` (NFR5.1–NFR5.5), `nfr-design/reliability-design.md` (NFR4.1–NFR4.4), thiết kế theo dõi của U1 và U3.
>
> Một người dùng chạy trên máy, nên không có hệ thống thu số liệu, cảnh báo hay dashboard. "Theo dõi" ở đây nghĩa là đọc log trên cửa sổ `dotnet run` và đo bằng tay một số chỉ số lúc kiểm.

## Metrics & KPIs

| Metric | Source | Threshold | Why it matters |
|---|---|---|---|
| Thời gian phản hồi `GET /api/employees` và `?search=` với 1.000 nhân viên tạm `@perf.test` | Cột thời gian của Postman, lấy số lớn nhất trong 3 lần | ≤ 1 giây | NFR5.1, NFR5.2 |
| Số câu SQL của danh sách / tìm kiếm | Log `Microsoft.EntityFrameworkCore.Database.Command` ở mức Information | Đúng 1 câu `SELECT ... JOIN departments` | NFR5.3 (không N+1) |
| Số lần gọi database mỗi thao tác ghi | Cùng log SQL | POST ≤ 4, PUT ≤ 5, DELETE ≤ 2 | NFR5.4 |
| Dữ liệu đo còn sót | `SELECT count(*) FROM employees WHERE email LIKE '%@perf.test'` | 0 | Giữ NFR1.2 đúng ở lần kiểm sau |
| Độ phủ dòng `EmployeeService`, `DepartmentService` | `npm --prefix frontend run coverage` (reportgenerator `TextSummary`) | Mỗi lớp ≥ 80% | NFR4.3, team.md Testing Posture |
| Lighthouse Performance trang `/employees` | Lighthouse trên `npm run preview` (cổng 5173) | ≥ 90 | NFR5.5 |
| Số test xanh | `dotnet test` (trong `npm --prefix frontend run verify`) | 100% | NFR4.1 |

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
| Log lỗi của request nhân viên | Do U1 ghi: 4xx ở mức Information (`{Status} {Method} {Path}`), 500 ở mức Error kèm stack. U4 không thêm logger hay middleware | NFR6.1 |
| Chuỗi tìm không vào log | U1 chỉ ghi `Path`, không ghi query string, nên `?search=<họ tên>` không bị ghi | NFR6.2 |
| Log câu SQL | `appsettings.Development.json`, khóa `Logging:LogLevel:Microsoft.EntityFrameworkCore.Database.Command`: mặc định `Warning`; đổi sang `Information` khi xem câu JOIN và cách EF dịch `Contains` (`strpos` hay `LIKE`), xem xong đổi lại | NFR6.3; kết quả ghi vào `code-summary.md` |
| Dữ liệu nhạy cảm | Không bật `EnableSensitiveDataLogging`; log chỉ hiện `@p0`, không hiện họ tên, email hay chuỗi tìm. Không ghi body request | NFR6.2 |
| Tracing, dashboard | Không có | observability-design §4 |
