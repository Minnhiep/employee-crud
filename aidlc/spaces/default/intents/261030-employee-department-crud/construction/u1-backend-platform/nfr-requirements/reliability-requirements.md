# Yêu cầu tin cậy: u1-backend-platform

> **Nguồn:** `functional-design/functional-spec.md` (W1, W4), `functional-design/rules.md`, `inception/requirements-analysis/requirements.md` (NFR1, NFR3), `inception/contract-design/contract-summary.md` (C3, C5).
>
> Ứng dụng chạy trên máy cá nhân, không có máy chủ thật, nên **không đặt mục tiêu SLA hay độ sẵn sàng**. Độ tin cậy ở đây là: lỗi nào cũng được báo rõ, và kết nối database được kiểm **thật** chứ không chỉ kiểm cấu hình.

| ID | Yêu cầu | Đo / kiểm | Luật |
|---|---|---|---|
| NFR1.1 | Thiếu chuỗi kết nối: ứng dụng dừng ngay lúc khởi động, báo đúng tên khóa và lệnh `dotnet user-secrets set` cần chạy, mã thoát khác 0 | Hiệp tự làm theo hướng dẫn (AI không xóa secrets của Hiệp): tạm đổi tên khóa bằng `dotnet user-secrets remove`, chạy `dotnet run`, xem lời báo, rồi đặt lại | BR2.1 |
| NFR1.2 | **Kiểm kết nối thật** ở W4: tiêu chí đạt là `dotnet ef database update` chạy thành công. Ở U1 chưa có migration nào, nên lệnh chỉ mở kết nối và tạo bảng lịch sử migration `__EFMigrationsHistory`; đây là phép thử kết nối thật. `dotnet ef dbcontext info` chỉ dùng để xem cấu hình, không phải tiêu chí đạt (đóng điểm Major 3 của review Functional Design) | Hiệp chạy lệnh; pgAdmin thấy bảng `__EFMigrationsHistory` trong `employee_db` | BR2.1 |
| NFR1.3 | Lệnh `dotnet ef` phải nạp được user-secrets. User-secrets chỉ nạp ở môi trường Development, nên hướng dẫn W4 phải chạy `dotnet ef` với môi trường Development (EF tools mặc định là Development; nếu không nạp được thì thêm `-- --environment Development`); `launchSettings.json` đặt `ASPNETCORE_ENVIRONMENT=Development` cho `dotnet run` | Code Generation kiểm thực tế trên máy rồi ghi đúng lệnh vào hướng dẫn | BR2.1 |
| NFR1.4 | Database không chạy hoặc sai mật khẩu khi đang phục vụ request: request đó trả 500 ProblemDetails chung chung, lỗi chi tiết ghi vào log; ứng dụng **không dừng hẳn**; lần gọi sau tự kết nối lại | Tắt dịch vụ PostgreSQL rồi gọi API: nhận 500; bật lại thì gọi được | BR1.6 |
| NFR3.3 | Không đổi lỗi nào thành 2xx; lỗi ràng buộc database không bao giờ lộ ra dưới dạng 500 khi đã biết tên ràng buộc | Unit test của bộ đổi lỗi | BR1.4, BR1.5 |

**Sao lưu và khôi phục:** ngoài phạm vi. Dữ liệu là dữ liệu demo, tạo lại được bằng `dotnet ef database update`. Quay lui migration theo team-practices (Deployment).
