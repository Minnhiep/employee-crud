# Business Overview: employee-crud

## Mục đích

Ứng dụng web nhỏ quản lý **nhân viên** và **phòng ban**: xem danh sách, thêm, sửa, xóa, tìm kiếm nhân viên; quản lý danh mục phòng ban; mỗi nhân viên thuộc đúng một phòng ban chọn từ danh sách có sẵn. Đây là bài thực hành của kế hoạch thực tập (`docs/ke-hoach.md` mục 3), dùng để chứng minh và giải thích được luồng dữ liệu React → Web API JSON → ASP.NET Core → PostgreSQL.

Kết quả bàn giao theo đề bài (`docs/ke-hoach.md` mục 5): mã nguồn kèm migration, sơ đồ database (`docs/so-do-database.md`), danh sách API kèm JSON mẫu (`docs/danh-sach-api.md`), README cài đặt và chạy trên máy cá nhân, demo 15 phút.

## Người dùng và bối cảnh

- Một loại người dùng duy nhất, không đăng nhập, không phân quyền (đề bài không yêu cầu; `project.md` cấm thêm).
- Chạy trên máy cá nhân: backend `http://localhost:5081`, frontend `http://localhost:5173`, PostgreSQL 18 cổng 5432, database `employee_db`. Không có môi trường staging hay production.
- Giao diện và mọi lời báo lỗi viết tiếng Việt; tên trong code viết tiếng Anh.

## Chức năng chính

| Nhóm | Chức năng | Màn hình | API |
|---|---|---|---|
| Phòng ban | Danh sách sắp theo tên kèm số nhân viên | `/departments` | `GET /api/departments` |
| Phòng ban | Xem chi tiết: tên, số nhân viên, bảng nhân viên của phòng | `/departments/:id` | `GET /api/departments/{id}` + `GET /api/employees?departmentId=` |
| Phòng ban | Thêm, sửa tên | `/departments/new`, `/departments/:id/edit` | `POST`, `PUT` |
| Phòng ban | Xóa (chặn khi còn nhân viên) | Hộp xác nhận / hộp thông báo | `DELETE /api/departments/{id}` |
| Nhân viên | Danh sách kèm tên phòng ban, tìm theo họ tên hoặc email, lọc theo phòng ban | `/employees?search=&departmentId=` | `GET /api/employees` |
| Nhân viên | Thêm (có thể chọn sẵn phòng), sửa | `/employees/new`, `/employees/:id/edit` | `POST`, `PUT` |
| Nhân viên | Xóa hẳn (có xác nhận ghi họ tên và email) | Hộp xác nhận | `DELETE /api/employees/{id}` |

Chi tiết hợp đồng API: `api-documentation.md`. Cách các màn hình gọi nhau: `architecture.md` mục Interaction Diagrams.

## Luật nghiệp vụ

Luật được kiểm ở cả form React lẫn API (cùng câu báo); database chặn thêm phần trùng và khóa ngoại.

| ID | Luật | Nơi thực thi |
|---|---|---|
| BR1 | Tên phòng ban bắt buộc, tối đa 100 ký tự, đo **sau** khi chuẩn hóa | `DepartmentService.NormalizeName`, `validateDepartment.ts` |
| BR2 | Tên phòng ban không trùng, không phân biệt hoa thường | `DepartmentService.EnsureNameIsFreeAsync` + chỉ mục `ux_departments_name` trên `lower(name)` → 409 |
| BR3 | Không xóa được phòng ban còn nhân viên; lời báo nêu số người còn lại | `DepartmentService.DeleteAsync` + khóa ngoại `fk_employees_department` `ON DELETE RESTRICT` (23001/23503) → 409 |
| BR4 | Họ tên bắt buộc, tối đa 100 ký tự | `EmployeeService.Normalize`, `validateEmployee.ts` |
| BR5 | Email bắt buộc, tối đa 254 ký tự, đúng mẫu `^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$` | như BR4 (mẫu chép giống hệt hai phía) |
| BR6 | Email không trùng, không phân biệt hoa thường; email lưu nguyên chữ hoa thường người dùng gõ | `EmployeeService.EnsureEmailIsFreeAsync` + chỉ mục `ux_employees_email` trên `lower(email)` → 409 |
| BR7 | Nhân viên phải chọn một phòng ban đang tồn tại | `EmployeeService.EnsureDepartmentExistsAsync` (hỏi qua `IDepartmentService`) + khóa ngoại → 400 |
| BR8 | Chuẩn hóa chữ nhập: gộp khoảng trắng, bỏ hai đầu, đưa về NFC; từ chối ký tự điều khiển, ký tự định dạng vô hình, nửa cặp surrogate, noncharacter | `Platform/Text/TextInput.cs` ↔ `utils/normalizeText.ts` |
| BR9 | Tìm kiếm theo họ tên hoặc email chứa chuỗi tìm, không phân biệt hoa thường, có phân biệt dấu; chuỗi tìm có ký tự lạ thì trả rỗng (200) | `EmployeeService.GetAllAsync` |
| BR10 | Lọc theo phòng ban: chỉ nhận số nguyên dương viết bằng chữ số 0-9; sai dạng trả 400; phòng không tồn tại trả `[]` | `EmployeeService.ParseDepartmentFilter` |
| BR11 | Thứ tự kiểm khi thêm/sửa nhân viên: dữ liệu (400) → phòng ban có không (400) → email trùng (409); sửa người không tồn tại luôn 404 trước | `EmployeeService.CreateAsync` / `UpdateAsync` |
| BR12 | Xóa là xóa hẳn (không xóa mềm), luôn có hộp xác nhận | Service + `ConfirmDialog` |
| BR13 | Dữ liệu mẫu: migration chèn 4 phòng ban (Nhân sự, Kế toán, Kỹ thuật, Kinh doanh) | `20261101183552_CreateDepartments` |

## Ngoài phạm vi (theo đề bài và `project.md`)

Đăng nhập và phân quyền, xóa mềm, nhật ký thay đổi (README mục 15), microservices, Redux, CI/CD, Docker, Next.js.

## Liên quan tới intent hiện tại

Intent `kiem-cuoi-crlf` không đổi chức năng nghiệp vụ: nó sửa cách repo giữ đầu dòng (line endings) để `npm run verify` chạy sạch trên mọi máy Windows sau khi clone, rồi kiểm lại toàn bộ. Phát hiện kỹ thuật nằm ở `code-quality-assessment.md` mục "Đầu dòng và định dạng".
