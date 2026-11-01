# Yêu cầu theo dõi: u3-departments

> **Nguồn:** thiết kế log của U1 (log 4xx mức Information, 500 mức Error, không ghi bí mật), `requirements.md` (NFR2, NFR6).

| ID | Yêu cầu | Đạt khi | Nguồn |
|---|---|---|---|
| NFR6.1 | Dùng chung cách log của U1 | U3 không thêm middleware hay logger riêng; lỗi nghiệp vụ ném `DomainError` để U1 ghi log `{Status} {Method} {Path}` | NFR6 (giữ đơn giản, dễ trình bày), thiết kế log U1 |
| NFR6.2 | Log không chứa dữ liệu nhạy cảm | Không ghi body request; tên phòng ban chỉ xuất hiện trong `detail` trả cho người dùng, không ghi thêm | NFR2 |
| NFR6.3 | Xem được câu SQL khi học | Bật được `Microsoft.EntityFrameworkCore.Database.Command: Information` trong `appsettings.Development.json` để thấy câu SQL của từng thao tác phòng ban (mặc định tắt) | NFR6, thiết kế log U1 |

Không áp dụng: số liệu, cảnh báo, SLO, tracing (một người dùng trên máy).
