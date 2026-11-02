# Yêu cầu theo dõi: u4-employees

> **Nguồn:** thiết kế log của U1 (4xx mức Information, 500 mức Error, không ghi bí mật), cách làm của U3, `requirements.md` (NFR2, NFR6).

| ID | Yêu cầu | Đạt khi | Nguồn |
|---|---|---|---|
| NFR6.1 | Dùng chung cách log của U1 | U4 không thêm middleware hay logger riêng; lỗi nghiệp vụ ném `DomainError` để U1 ghi `{Status} {Method} {Path}` | NFR6, như U3 |
| NFR6.2 | Log không chứa dữ liệu cá nhân | Không ghi body request; không bật `EnableSensitiveDataLogging`, nên log SQL chỉ hiện `@p0`, không hiện họ tên, email hay chuỗi tìm | NFR2 |
| NFR6.3 | Xem được câu SQL khi học | Dùng khóa `Microsoft.EntityFrameworkCore.Database.Command` đã có trong `appsettings.Development.json` (U3): đổi sang `Information` để thấy câu SELECT có JOIN và điều kiện tìm | NFR6, NFR5.3 |

Không áp dụng: số liệu, cảnh báo, SLO, tracing (một người dùng trên máy).
