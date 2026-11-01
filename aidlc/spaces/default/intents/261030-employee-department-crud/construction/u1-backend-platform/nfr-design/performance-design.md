# Thiết kế hiệu năng: u1-backend-platform

> **Nguồn:** `nfr-requirements/performance-requirements.md` (NFR5.1–NFR5.3), `nfr-requirements/tech-stack-decisions.md`.

| Yêu cầu | Thiết kế |
|---|---|
| NFR5.1: phần nền nhanh | Chuỗi xử lý chỉ có 5 bước (CORS → bắt lỗi → trang mã trạng thái → định tuyến → controller). Không thêm middleware log từng request, không nén phản hồi. Con số 20 ms là **ngân sách tự đặt** (không có trong yêu cầu gốc) để chia 1 giây của NFR5; Build and Test đo và báo, không chặn nếu vượt nhẹ |
| NFR5.2: database bất đồng bộ, có pool | Đăng ký `AppDbContext` bằng `AddDbContext` (vòng đời theo request). Dùng pool kết nối mặc định của Npgsql. Không dùng `AddDbContextPool`, vì đổi lấy chút tốc độ không đáng phần khó giải thích |
| NFR5.3: khởi động nhanh | Không chạy migration tự động lúc khởi động (migration do Hiệp chạy bằng `dotnet ef`). Không nạp dữ liệu lúc khởi động. Con số 10 giây cũng là ngân sách tự đặt |

Không có cache, không có nén, không dùng CDN: một người dùng, dữ liệu nhỏ (`scalability-requirements.md`).
