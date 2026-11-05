# Tổng quan nghiệp vụ

## Mục đích

`employee-crud` là ứng dụng web nhỏ để quản lý nhân viên và phòng ban, làm theo bài thực hành trong `docs/ke-hoach.md`. Mục tiêu của đề là chứng minh hiểu luồng React → API JSON → ASP.NET Core → PostgreSQL, không phải làm sản phẩm chạy thật. Ứng dụng chạy trên máy cá nhân.

Không có đăng nhập hay phân quyền (cố ý, `project.md`). Người dùng duy nhất là người mở trang `http://localhost:5173`.

## Chức năng chính

| Nhóm | Chức năng | Nơi xử lý |
|---|---|---|
| Nhân viên | Danh sách, thêm, sửa, xóa hẳn | `EmployeesPage`, `EmployeeFormPage`, `EmployeeService` |
| Nhân viên | Tìm theo họ tên hoặc email | `SearchBox`, `EmployeeService.GetAllAsync` |
| Nhân viên | Lọc theo phòng ban, ghép AND với tìm kiếm | `EmployeesPage`, `EmployeeService.GetAllAsync` |
| Phòng ban | Danh sách kèm số nhân viên, thêm, sửa, xóa | `DepartmentsPage`, `DepartmentFormPage`, `DepartmentService` |
| Phòng ban | Trang chi tiết: tên, số người, bảng nhân viên của phòng | `DepartmentDetailPage` |
| Dữ liệu | 4 phòng ban mẫu qua migration, 80 nhân viên tên giả qua SQL tùy chọn | `20261101183552_CreateDepartments.cs`, `docs/du-lieu-mau.sql` |

## Luật nghiệp vụ đang có trong code

**Phòng ban**
- Tên bắt buộc, tối đa 100 ký tự đo sau khi chuẩn hóa.
- Tên không trùng, không phân biệt hoa thường. Kiểm ở service, chốt bằng chỉ mục `ux_departments_name` trên `lower(name)`.
- Không xóa được phòng còn nhân viên. Giao diện hiện hộp thông báo; API trả 409; khóa ngoại `fk_employees_department` `ON DELETE RESTRICT` là lớp cuối.

**Nhân viên**
- Họ tên bắt buộc, tối đa 100 ký tự.
- Email bắt buộc, tối đa 254 ký tự, đúng định dạng, không trùng không phân biệt hoa thường. Lưu đúng như người dùng gõ sau khi chuẩn hóa (bỏ khoảng trắng hai đầu, gộp khoảng trắng, NFC); không đổi về chữ thường.
- Thuộc đúng một phòng ban đang tồn tại, chọn từ danh sách.
- Thứ tự kiểm khi thêm: dữ liệu → phòng ban có không (400) → email trùng (409).

**Chuẩn hóa chữ** (`TextInput.TryNormalize` và `normalizeText`)
- Gộp khoảng trắng, bỏ hai đầu, đưa về NFC.
- Từ chối ký tự điều khiển, ký tự định dạng vô hình, nửa cặp surrogate và noncharacter (66 mã, ví dụ U+FFFE). Việc `261104-sua-loi-luot-6` đã sửa lỗi 500 với U+FFFE.

**Tìm kiếm và lọc**
- Tìm theo kiểu "chứa", không phân biệt hoa thường, có phân biệt dấu ("binh" không khớp "Bình").
- Chuỗi tìm có ký tự không hợp lệ thì trả danh sách rỗng, không báo lỗi.
- `departmentId` sai dạng trả 400; số hợp lệ mà không có phòng đó trả `[]`.

## Hành vi điều hướng của form

Mục này do lượt quét `261104-sua-loi-luot-8` thêm.

- Form nhân viên quay về đúng chỗ đã đi tới: trang chi tiết phòng ban (`returnTo`) hoặc danh sách đang tìm, lọc (`search`, `departmentId`). Không có state thì về `/employees`.
- Form phòng ban luôn về `/departments`, kể cả khi mở từ trang chi tiết (`FE-13`).
- Đang lưu thì nút Hủy và breadcrumb bị khóa bằng `aria-disabled`.
- Rời form bằng menu hoặc Back trong lúc lưu: bản ghi vẫn lưu, trang không kéo người dùng đi; nếu lưu lỗi chỉ ghi `console.error`.

## Đối chiếu với `docs/ke-hoach.md`

Đánh giá dựa trên đọc code và tài liệu, chưa chạy ứng dụng ở các lượt quét.

| Mục đề bài | Yêu cầu | Hiện trạng |
|---|---|---|
| §3 | Danh sách, thêm, sửa, xóa, tìm kiếm nhân viên | Có đủ, cả UI và API |
| §3 | Chọn phòng ban | Có: ô chọn nạp từ API |
| §3 | Lưu trong PostgreSQL, thao tác từ React qua Web API | Có |
| §3 | Không microservices, kiến trúc phức tạp, Redux, CI/CD | Đúng: một backend, một frontend, không Redux, không file CI |
| §2 PostgreSQL | Khóa chính, khóa ngoại, index, transaction | Có trong migration; transaction là ngầm định của `SaveChanges` và khối gỡ trong `docs/du-lieu-mau.sql` |
| §2 C#, ASP.NET Core | Controller, Service, DTO, DI, EF Core, migration | Có |
| §2 React | Component, state, `useEffect`, form, gọi API, loading, lỗi | Có. Dùng TypeScript thay JavaScript (Hiệp đổi ngày 2026-11-01, `project.md`) |
| §2 API, JSON | REST, status code, validation, OpenAPI, Postman | Có. OpenAPI chỉ ở Development; hướng dẫn Postman ở `docs/danh-sach-api.md`; không có bộ collection, đề không đòi |
| §2 Công cụ chung | GitHub | Có: `README.md:33` trỏ tới repo |
| §5 | Source gồm backend, frontend, migration | Có |
| §5 | Sơ đồ database | Có: `docs/so-do-database.md` |
| §5 | Danh sách API kèm JSON mẫu | Có: `docs/danh-sach-api.md` |
| §5 | README cài đặt và chạy | Có: `README.md` |
| §5 | Demo 15 phút | Ngoài code. Dàn bài ở `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md` mục 4 |
| §5 | Có kiểm dữ liệu và thông báo lỗi cơ bản | Có, ở cả form và API |

**Không thấy yêu cầu nào của đề bị thiếu trong code.** Các lỗi còn lại là biên và tài liệu lệch, xem `code-quality-assessment.md`.

**Phần vượt đề đang có trong code:** quản lý phòng ban đầy đủ (CRUD), số nhân viên từng phòng, trang chi tiết phòng ban, lọc theo phòng, header bảo mật, Swagger UI, dữ liệu mẫu 80 người. Đề chỉ ghi "chọn phòng ban". Phần CRUD phòng ban có quyết định trong `project.md`. Nguồn của các phần còn lại nằm ngoài phạm vi các lượt quét.
