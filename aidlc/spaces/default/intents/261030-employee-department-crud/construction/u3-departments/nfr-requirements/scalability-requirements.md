# Yêu cầu mở rộng: u3-departments

> **Nguồn:** `requirements.md` (NFR5: tối đa 1.000 nhân viên; FR1.1 không phân trang), `functional-design/functional-spec.md`.

| ID | Yêu cầu | Ngưỡng | Nguồn |
|---|---|---|---|
| NFR5.5 | Số phòng ban dự kiến nhỏ | Thiết kế cho tới khoảng 100 phòng ban; trả cả danh sách một lần, không phân trang | FR1.1, NFR5 |
| NFR5.6 | Service không giữ trạng thái giữa các request | `DepartmentService` đăng ký Scoped, dùng `AppDbContext` của request đó; không có biến `static` chứa dữ liệu | NFR5.5 của U1 (một tiến trình) |

Không áp dụng: nhiều bản chạy song song, chia tải, cache (một người dùng, một tiến trình).
