# Thiết kế bảo mật: u1-backend-platform

> **Nguồn:**
> - `nfr-requirements/security-requirements.md` (NFR2.1–NFR2.4, NFR7.1, NFR7.2, NFR3.1, NFR3.2)
> - `nfr-requirements/tech-stack-decisions.md`
> - `functional-design/functional-spec.md` (W2, W3)
> - `inception/contract-design/contract-summary.md` (C3)
>
> Không có đăng nhập (`project.md` Forbidden). Mục tiêu ở đây là giữ bí mật, CORS đúng, và lỗi không làm lộ thông tin.

## 1. Bí mật (NFR2.1, NFR2.2)

- Tạo project API bằng template Web API rồi chạy `dotnet user-secrets init`, để file `.csproj` có `UserSecretsId`. Từ đó Hiệp dùng được `dotnet user-secrets set` ngay.
- `appsettings.json` **không có** khóa `ConnectionStrings`. Chuỗi kết nối chỉ đến từ user-secrets (môi trường Development) hoặc biến môi trường `ConnectionStrings__Default`.
- `.gitignore` ở thư mục gốc repo loại: `bin/`, `obj/`, `*.user`, `.vs/`, `.env`, `node_modules/`, `dist/`, `TestResults/`, `coverage*/`.
- **Cách kiểm NFR2.2:** chạy `git grep -i -n "password=" -- backend frontend`. Lệnh chỉ quét code, không quét tài liệu thiết kế trong `aidlc/` (vốn có ví dụ chuỗi `Password=<mật khẩu>`). Đạt khi không ra dòng nào.

## 2. CORS kể cả trên phản hồi lỗi (NFR7.1, NFR7.2)

**Vấn đề.** Bộ bắt lỗi toàn cục của ASP.NET Core xóa header của phản hồi trước khi viết ProblemDetails. Nếu header CORS được đặt ở chiều request đi vào, nó có thể mất, và trình duyệt chỉ thấy "lỗi mạng" (điểm Major của hai lần rà soát trước).

**Cơ chế chọn:**
1. Đặt `UseCors` **trước** bộ bắt lỗi trong chuỗi xử lý, tức là đứng ngoài cùng. Thứ tự cụ thể:
   1. CORS
   2. Bắt lỗi toàn cục (`UseExceptionHandler` + `IExceptionHandler` riêng viết ProblemDetails)
   3. Trang mã trạng thái (`UseStatusCodePages`) cho 404/405/415
   4. Định tuyến
   5. Controller
2. Bộ bắt lỗi viết ProblemDetails qua `IProblemDetailsService`. Đã **cố ý** đặt CORS ở ngoài để không phụ thuộc chi tiết bộ bắt lỗi xóa header lúc nào.
3. **Kiểm bằng test tự động ngay trong U1**, không đợi U3:
   - Project test dựng ứng dụng thật trong bộ nhớ bằng `WebApplicationFactory` (gói `Microsoft.AspNetCore.Mvc.Testing`).
   - Thêm một endpoint **chỉ có trong test**, luôn ném lỗi. Gọi nó với header `Origin: http://localhost:5173`.
   - Đạt khi phản hồi là 500 `application/problem+json` **và** có header `Access-Control-Allow-Origin: http://localhost:5173`.
   - Test thứ hai gọi đường dẫn lạ với cùng Origin: 404 ProblemDetails, cũng có header CORS.
   - Test thứ ba với `Origin: http://evil.example`: không có header `Access-Control-Allow-Origin`.
   - Nếu test đầu thất bại, Code Generation đổi sang cách dự phòng: tự thêm header CORS trong `IExceptionHandler` dựa vào chính sách đã đăng ký. Không bỏ test.

Ba test này là test cho phần nền. Chúng không phải "bộ test tích hợp lớn" mà team-practices cấm: chỉ ba ca, chạy cùng `dotnet test`.

## 3. Dữ liệu vào (NFR2.4)

- API luôn kiểm lại dữ liệu bằng luật kiểm trên DTO cùng bộ đổi lỗi 400 (BR1.2), không tin form.
- **Không đặt giới hạn 32 KB / lỗi 413.** Phần này trong NFR2.4 không có nguồn từ `docs/ke-hoach.md` hay `requirements.md`, nên bỏ đi (người rà soát NFR Requirements đã chỉ ra). Giữ giới hạn mặc định của Kestrel (khoảng 30 MB). Body quá lớn hiếm khi xảy ra với một người dùng; nếu có, Kestrel trả lỗi trước khi vào bộ đổi lỗi. Không viết luật riêng cho trường hợp này.

## 4. Lỗi database (NFR3.1, NFR3.2)

- Bộ đổi lỗi đọc `PostgresException.SqlState` (`23505`/`23503`) và `ConstraintName` (`ux_departments_name`, `ux_employees_email`, `fk_employees_department`) từ lỗi bên trong `DbUpdateException`.
- **Đường chính:** service U3/U4 tự bắt `DbUpdateException` ngay ở thao tác lưu và ném `DomainError` có ngữ cảnh:
  - Ghi nhân viên mà vi phạm khóa ngoại: `Validation(departmentId)`.
  - Xóa phòng ban mà vi phạm khóa ngoại: `Conflict("Không thể xóa phòng ban")`.
- **Đường dự phòng của U1:** gặp 23503 mà service không bắt thì trả 409 "Không thể thực hiện" kèm detail chung. Không đoán xem đó là thao tác gì. Dự phòng này thay cho đoạn "phân biệt bằng thao tác" trong BR1.5 của functional-design.

## 5. Không lộ thông tin (NFR2.3)

- Phản hồi 500 chỉ có `title` và `detail` chung chung.
- Stack trace chỉ nằm trong log, và chỉ ở Development.
- Không bật trang lỗi chi tiết dành cho lập trình viên (`UseDeveloperExceptionPage`) cho API, để Development cũng trả đúng phong bì C3.
