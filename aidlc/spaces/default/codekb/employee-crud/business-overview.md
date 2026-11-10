# Business Overview: employee-crud

## Mục đích

Ứng dụng web nhỏ quản lý **nhân viên** và **phòng ban**, là bài thực hành của kế hoạch thực tập `docs/ke-hoach.md` (mục 3). Mục tiêu của bài là chứng minh trọn một luồng dữ liệu: giao diện React gửi JSON tới Web API ASP.NET Core, API kiểm luật rồi đọc/ghi PostgreSQL, và người làm giải thích được từng tầng.

Người dùng: một người quản trị nội bộ dùng trình duyệt trên chính máy chạy ứng dụng. Không có đăng nhập hay phân quyền (cố ý: `project.md` cấm thêm).

## Chức năng chính

| Nhóm | Chức năng | Nơi thể hiện |
|---|---|---|
| Nhân viên | Danh sách kèm tên phòng ban, sắp theo họ tên rồi mã | `/employees`, `GET /api/employees` |
| Nhân viên | Tìm theo họ tên **hoặc** email, không phân biệt hoa thường, có phân biệt dấu | `?search=` |
| Nhân viên | Lọc theo phòng ban, ghép AND với tìm kiếm | `?departmentId=` |
| Nhân viên | Thêm, sửa (đủ 3 trường), xóa hẳn có hộp xác nhận | `/employees/new`, `/employees/:id/edit` |
| Phòng ban | Danh sách kèm số nhân viên từng phòng | `/departments`, `GET /api/departments` |
| Phòng ban | Trang chi tiết: tên, số người, bảng nhân viên của phòng, thêm nhân viên đã chọn sẵn phòng | `/departments/:id` |
| Phòng ban | Thêm, sửa tên, xóa (chỉ khi phòng không còn ai) | `/departments/new`, `/departments/:id/edit` |

## Luật nghiệp vụ (đang có trong code)

- Mỗi nhân viên thuộc **đúng một** phòng ban đang tồn tại; chọn từ ô danh sách.
- Email không trùng, **không phân biệt hoa thường**; email được lưu giữ nguyên chữ hoa thường như người dùng gõ.
- Tên phòng ban không trùng, không phân biệt hoa thường.
- Không xóa được phòng ban còn nhân viên; câu báo nêu tên phòng và số người còn lại.
- Giới hạn độ dài đo **sau khi chuẩn hóa**: tên phòng ban và họ tên tối đa 100 ký tự, email tối đa 254.
- Chuẩn hóa chữ trước khi kiểm và lưu: gộp khoảng trắng, bỏ hai đầu, đưa về NFC; chặn ký tự điều khiển, ký tự định dạng vô hình, nửa cặp surrogate và noncharacter.
- Định dạng email: một luật regex chung cho form và API.
- Kiểm dữ liệu hai lớp: form React báo ngay, API kiểm lại và trả ProblemDetails tiếng Việt với mã 400/404/409. Database chặn thêm lớp cuối (chỉ mục không trùng trên `lower(...)`, khóa ngoại `RESTRICT`).
- Xóa là xóa hẳn (không xóa mềm), không có nhật ký thay đổi; hai người sửa cùng lúc thì người lưu sau thắng.

Chi tiết nơi từng luật nằm trong code: `component-inventory.md` (DepartmentService, EmployeeService, Platform.Text). Hợp đồng API: `api-documentation.md`.

## Dữ liệu

Hai bảng `departments` và `employees` trong database `employee_db` (PostgreSQL 18). Migration chèn sẵn 4 phòng ban: Nhân sự, Kế toán, Kỹ thuật, Kinh doanh. `docs/du-lieu-mau.sql` thêm 4 phòng và 80 nhân viên tên giả để demo. Sơ đồ: `docs/so-do-database.md`; mô tả kỹ thuật: `architecture.md`.

## Phạm vi và ràng buộc

- Chạy trên máy cá nhân: `dotnet run` (cổng 5081), `npm run dev` (cổng 5173), PostgreSQL cục bộ cổng 5432. Không Docker, không CI/CD, không microservices, không Redux, không Next.js.
- Chữ trên giao diện và lời báo lỗi bằng tiếng Việt; tên trong code bằng tiếng Anh.
- Bàn giao (kế hoạch mục 5): source trên Git, migration, sơ đồ DB, danh sách API kèm JSON mẫu, README, demo 15 phút.
