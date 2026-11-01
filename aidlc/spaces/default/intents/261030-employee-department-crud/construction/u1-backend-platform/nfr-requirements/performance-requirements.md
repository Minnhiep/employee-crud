# Yêu cầu hiệu năng: u1-backend-platform

> **Nguồn:** `inception/requirements-analysis/requirements.md` (NFR5), `functional-design/rules.md` (BR3.1), `functional-design/functional-spec.md` (W2).

| ID | Yêu cầu | Đo / kiểm | Luật |
|---|---|---|---|
| NFR5.1 | Phần nền (bắt lỗi, CORS, định tuyến, đọc/ghi JSON) không làm chậm đáng kể. Chi phí phần nền cho một request API nhỏ dưới 20 ms trên máy phát triển, để toàn bộ ngân sách 1 giây của NFR5 dành cho truy vấn của U3/U4 | Build and Test: đo thời gian `GET /api/khong-ton-tai` (chỉ đi qua phần nền) bằng Postman, chạy 10 lần, lấy số giữa | BR3.1 |
| NFR5.2 | Truy cập database bất đồng bộ, mỗi request một ngữ cảnh database; dùng pool kết nối mặc định của Npgsql (không tự tạo kết nối mới mỗi lần) | Rà code ở Code Generation | BR3.1 |
| NFR5.3 | Ứng dụng khởi động xong (sẵn sàng nhận request) trong vòng 10 giây trên máy phát triển | Đo bằng đồng hồ khi `dotnet run` | — |

Cache, giới hạn tần suất gọi (rate limit) và nén phản hồi: **không cần**, vì một người dùng và dữ liệu dưới 1.000 dòng (`requirements.md`, mục 6).
