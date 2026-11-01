# Thiết kế mở rộng: u3-departments

> **Nguồn:** `nfr-requirements/scalability-requirements.md` (NFR5.5, NFR5.6), thiết kế mở rộng của U1 (một tiến trình).

## 1. Cỡ dữ liệu (NFR5.5)

- Thiết kế cho khoảng 100 phòng ban. API trả cả danh sách trong một lần, không phân trang (FR1.1).
- Khi số phòng ban lớn hơn nhiều, chỉ mục `lower(name)` vẫn giữ cho bước kiểm trùng nhanh. Câu `ORDER BY name` trên vài trăm dòng vẫn chạy trong mili giây.
- **Ngưỡng xem lại:** nếu sau này có hơn 1.000 phòng ban, thêm phân trang theo C2 (giống danh sách nhân viên). Hiện chưa làm, vì kế hoạch không yêu cầu.

## 2. Service không giữ trạng thái (NFR5.6)

- Đăng ký `builder.Services.AddScoped<IDepartmentService, DepartmentService>()`. Mỗi request có một `DepartmentService` và một `AppDbContext` riêng, hết request thì cả hai được giải phóng.
- Không có field `static`, không có danh sách lưu trong bộ nhớ. Vì sao: `AppDbContext` không an toàn khi nhiều luồng dùng chung, nên phải cùng vòng đời Scoped với service.
- Giao diện không giữ dữ liệu phòng ban giữa các trang. Mỗi trang tự tải lại khi mở (performance-design §3).

## 3. Không làm

Không chạy nhiều bản, không chia tải, không cache dùng chung, không hàng đợi. Lý do: một người dùng, một tiến trình trên máy (team.md Deployment).
