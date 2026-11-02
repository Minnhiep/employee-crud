# Thiết kế theo dõi: u4-employees

> **Nguồn:** `nfr-requirements/observability-requirements.md` (NFR6.1–NFR6.3), thiết kế log của U1, cách làm của U3.

## 1. Dùng chung log của U1 (NFR6.1)

- U4 không thêm logger hay middleware. Lỗi nghiệp vụ ném `DomainError`; U1 ghi `{Status} {Method} {Path}` (Information cho 4xx, Error cho 500).
- Đường dẫn có `?search=` **không** được ghi kèm chuỗi truy vấn. U1 chỉ ghi `Path`, nên chuỗi tìm (có thể là họ tên người thật) không vào log.

## 2. Xem câu SQL khi học (NFR6.3)

- Dùng khóa `Microsoft.EntityFrameworkCore.Database.Command` đã có trong `appsettings.Development.json`. Đổi sang `Information` để thấy:
  - câu SELECT có `JOIN departments` của danh sách (chứng minh một câu truy vấn, NFR5.3);
  - điều kiện tìm (`strpos` hay `LIKE`) để ghi lại cách EF dịch `Contains` (security-design §2).
- Đổi lại `Warning` sau khi xem.

## 3. Không ghi dữ liệu cá nhân (NFR6.2)

- Không bật `EnableSensitiveDataLogging`: log SQL chỉ hiện `@p0`, không hiện họ tên, email hay chuỗi tìm.
- Không ghi body request.

## 4. Không làm

Không có số liệu, cảnh báo, SLO hay tracing (một người dùng trên máy).
