# Yêu cầu bảo mật: u1-backend-platform

> **Nguồn:**
> - `functional-design/functional-spec.md`, `functional-design/rules.md` (BR1.x, BR2.x, BR3.2)
> - `inception/requirements-analysis/requirements.md` (NFR2, NFR3, NFR7)
> - `inception/contract-design/contract-summary.md` (C3)
> - `project.md` Forbidden
>
> **Ngữ cảnh:** chạy trên máy cá nhân, một người dùng, **không có đăng nhập** (`project.md` Forbidden). Vì vậy ở đây không có phần xác thực hay phân quyền. Lớp bảo vệ nằm ở biên: giữ bí mật, CORS, kiểm dữ liệu vào, và không để lộ thông tin trong phản hồi lỗi.

| ID | Yêu cầu | Đo / kiểm | Luật |
|---|---|---|---|
| NFR2.1 | Chuỗi kết nối (có mật khẩu) chỉ đến từ user-secrets hoặc biến môi trường. Project API phải được bật user-secrets ngay khi tạo (có `UserSecretsId`), để Hiệp chạy `dotnet user-secrets set` được ngay | `dotnet user-secrets list` trong project API chạy được; `appsettings*.json` không có `Password=` | BR2.1 |
| NFR2.2 | Không file nào Git theo dõi chứa mật khẩu; `.gitignore` loại `bin/`, `obj/`, `*.user`, `.env` | `git grep -i "password="` không ra kết quả (Build and Test) | BR2.2 |
| NFR2.3 | Log và phản hồi lỗi không chứa chuỗi kết nối, mật khẩu, stack trace hay câu SQL | Gây lỗi 500 có chủ đích trong test của bộ đổi lỗi: body chỉ có `detail` chung chung | BR1.6, BR3.2 |
| NFR7.1 | CORS chỉ cho phép origin trong `Cors:AllowedOrigins` (mặc định `http://localhost:5173`); không dùng `*`; không gửi credential | Từ origin khác: trình duyệt chặn đọc | BR2.3 |
| NFR7.2 | **Mọi phản hồi**, kể cả lỗi 400/404/409/500 do bộ bắt lỗi toàn cục sinh ra, phải mang header CORS khi origin hợp lệ. Bộ bắt lỗi xóa header khi nó viết lại phản hồi, nên phải xếp chuỗi xử lý sao cho phản hồi lỗi vẫn đi qua CORS (đóng điểm Major 1 của review Functional Design) | Từ `http://localhost:5173`: gọi một endpoint ném lỗi nghiệp vụ (ở U3, ví dụ thêm phòng ban trùng tên) **và** gọi đường dẫn lạ; trình duyệt đọc được ProblemDetails trong cả hai trường hợp | BR2.3 |
| NFR3.1 | Lỗi vi phạm ràng buộc database được nhận ra theo **tên ràng buộc** cố định, không dò theo chuỗi lỗi, và không để lộ dưới dạng 500 | Unit test của bộ đổi lỗi: giả lập 23505/23503 với từng tên ràng buộc | BR1.4, BR1.5 |
| NFR3.2 | Để phân biệt lỗi 23503 khi ghi nhân viên (400) với khi xóa phòng ban (409), service của U3/U4 phải **tự bắt lỗi lưu** ở đúng thao tác và ném `DomainError` tương ứng: `Validation(field=departmentId)` khi ghi nhân viên, `Conflict(title="Không thể xóa phòng ban")` khi xóa phòng ban. Bộ đổi lỗi chung của U1 chỉ là đường dự phòng: gặp 23503 không có ngữ cảnh thì trả 409 "Không thể thực hiện" (đóng điểm Major 2) | Rà code U3/U4 ở Code Generation; unit test của service | BR1.5 |
| NFR2.4 | Dữ liệu vào luôn được kiểm lại ở API (không tin form); request body tối đa 32 KB (dư cho ba trường văn bản), quá thì trả 413 ProblemDetails | Postman: body lớn bị từ chối | BR1.2 |

**Mối đe dọa đã xét:**
- **SQL injection:** mọi truy vấn có tham số qua EF Core.
- **Lộ bí mật qua Git:** user-secrets và `.gitignore`.
- **Trang web lạ gọi API:** CORS.
- **Lộ thông tin qua lỗi:** BR1.6.

**Ngoài phạm vi:** XSS phía giao diện thuộc U2–U4 (React tự escape chuỗi); HTTPS bắt buộc (chỉ chạy trên máy).
