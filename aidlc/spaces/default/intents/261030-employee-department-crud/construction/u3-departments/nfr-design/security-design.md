# Thiết kế bảo mật: u3-departments

> **Nguồn:** `nfr-requirements/security-requirements.md` (NFR2.1–NFR2.5, NFR7.1), `functional-design/rules.md` (BR1.1–BR1.3, BR2.5), thiết kế bảo mật và đổi lỗi của U1.
>
> Không có đăng nhập và phân quyền (project.md Forbidden). Hệ thống được bảo vệ theo nhiều lớp: form kiểm trước, API kiểm lại, database chặn lần cuối.

## 1. Kiểm dữ liệu ở biên: hai lớp trong API (NFR2.2)

| Lớp | Kiểm gì | Sai thì |
|---|---|---|
| DTO `DepartmentRequest` | `[Required]` trên `Name`, với câu "Vui lòng nhập tên phòng ban". Chặn trường hợp thiếu trường, `null`, chuỗi rỗng hoặc chỉ có khoảng trắng | 400 `errors.name` (qua `ValidationResponseFactory` của U1) |
| `DepartmentService` | Bỏ khoảng trắng hai đầu, rồi kiểm lại bắt buộc và độ dài ≤ 100 (BR1.1–BR1.3). Service là **nguồn đúng duy nhất** cho luật độ dài | `DomainError.Validation("name", ...)`, sau đó 400 |

- **Vì sao không đặt `[MaxLength(100)]` ở DTO:** DTO kiểm trước khi bỏ khoảng trắng. Một tên dài đúng 100 ký tự nhưng có thêm dấu cách ở đầu sẽ bị DTO chặn, trong khi BR1.3 cho phép. Đặt luật ở một chỗ thì không có hai câu trả lời khác nhau.
- Database chặn lần cuối bằng cột `varchar(100) NOT NULL` và chỉ mục `ux_departments_name` (reliability-design §1).
- Thông điệp cho người dùng viết tiếng Việt, đúng câu trong BR1.x.

## 2. Không có SQL injection (NFR2.3)

- Code chạy lúc runtime chỉ dùng LINQ của EF Core, và EF Core luôn gửi giá trị dưới dạng tham số (`@p0`).
- SQL viết tay chỉ có trong migration 1: đó là hai câu cố định (`CREATE UNIQUE INDEX`, `DROP INDEX`), không chứa dữ liệu người dùng.
- **Cấm** dùng `FromSqlRaw` hay `ExecuteSqlRaw` có nối chuỗi trong U3.

## 3. Lỗi không lộ chi tiết kỹ thuật (NFR2.4)

- Lỗi nghiệp vụ dùng `DomainError` (NotFound, Validation, Conflict). Bộ đổi lỗi của U1 biến chúng thành ProblemDetails.
- `detail` chỉ chứa mã phòng ban hoặc tên phòng ban, ví dụ "Không tìm thấy phòng ban có mã 7." hoặc "Không thể xóa phòng ban \"Kế toán\" vì vẫn còn nhân viên.". Không có câu SQL, tên bảng hay tên ràng buộc.
- Lỗi lạ không bắt trong service, để U1 trả 500 chung và ghi chi tiết vào log.

## 4. Hiển thị an toàn ở giao diện (NFR2.5)

- Tên phòng ban luôn hiển thị bằng JSX (`{department.name}`), và React tự thoát ký tự đặc biệt. Không dùng `dangerouslySetInnerHTML`.
- Câu hỏi xác nhận xóa dùng `window.confirm`, vốn chỉ hiển thị chữ thuần.

## 5. Không thêm bí mật (NFR2.1)

- U3 không thêm chuỗi kết nối hay cấu hình bí mật nào. Migration chạy bằng chuỗi kết nối Hiệp đã đặt ở user-secrets (U1).
- **Kiểm:** chạy `git grep --untracked -i -n -E "(password|pwd)\s*=" -- backend frontend`, phải ra 0 dòng trước khi commit.

## 6. CORS dùng chung (NFR7.1)

- `DepartmentsController` không gắn `[EnableCors]` riêng mà dùng chính sách "Frontend" của U1, đã áp cho mọi endpoint.
- **Kiểm (U2 chuyển sang):** POST thật từ `http://localhost:5173` thành công. Trong DevTools, tab Network không báo lỗi CORS, và phản hồi 409 hay 400 vẫn có header `Access-Control-Allow-Origin` (lỗi vẫn hiện được trên form).
