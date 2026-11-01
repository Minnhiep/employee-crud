# Thiết kế theo dõi: u3-departments

> **Nguồn:** `nfr-requirements/observability-requirements.md` (NFR6.1–NFR6.3), thiết kế log của U1.

## 1. Dùng chung log của U1 (NFR6.1)

- U3 không thêm middleware, logger hay `ILogger` riêng trong service. Lỗi nghiệp vụ được ném ra dưới dạng `DomainError`, và bộ xử lý lỗi của U1 ghi một dòng `{Status} {Method} {Path}`: mức Information cho 4xx, mức Error kèm stack cho 500.
- Vì sao: một chỗ ghi log thì dễ trình bày và không bị ghi hai lần.

## 2. Xem câu SQL khi học (NFR6.3)

- Trong `appsettings.Development.json`, mục `Logging:LogLevel` có khóa `"Microsoft.EntityFrameworkCore.Database.Command"`. Mặc định để `"Warning"`; Code Generation thêm khóa này nếu U1 chưa có.
- Muốn xem SQL của từng thao tác phòng ban thì đổi giá trị đó sang `"Information"`, rồi chạy lại `dotnet run`. README ghi rõ cách bật và tắt.
- Ví dụ khi bật: gọi `GET /api/departments` sẽ thấy câu `SELECT d.id, d.name FROM departments AS d ORDER BY d.name`. Nhờ vậy Hiệp chỉ ra được LINQ đã thành SQL như thế nào.

## 3. Không ghi dữ liệu nhạy cảm (NFR6.2)

- **Không** bật `EnableSensitiveDataLogging`. Log SQL chỉ hiện tên tham số (`@p0`), không hiện giá trị tên phòng ban.
- Không ghi body request. Tên phòng ban chỉ xuất hiện trong `detail` của phản hồi lỗi gửi cho người dùng.

## 4. Không làm

Không có số liệu (metrics), cảnh báo, SLO hay tracing phân tán. Lý do: một người dùng, chạy trên máy (requirements NFR6).
