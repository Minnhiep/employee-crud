# API Documentation: employee-crud

Bản cho người dùng API, có JSON mẫu gọi thật, là `docs/danh-sach-api.md`. File này ghi hợp đồng **theo code**: route, kiểu, mã trạng thái, nơi sinh lỗi.

## Quy ước chung

| Mục | Theo code |
|---|---|
| Địa chỉ | `http://localhost:5081`, `https://localhost:7205` (`Properties/launchSettings.json`) |
| Định dạng | JSON camelCase mặc định của ASP.NET Core; controller có `[Produces("application/json")]` |
| Lỗi | `application/problem+json`, có `type`, `title`, `status`, `traceId`; lỗi theo ô nằm trong `errors` (khóa camelCase, mảng câu) |
| Xác thực | Không có |
| CORS | Chỉ origin trong `Cors:AllowedOrigins` (mặc định `http://localhost:5173`), phương thức GET/POST/PUT/DELETE, header `Content-Type`, không credentials (`Platform/Cors/CorsSetup.cs`) |
| Host | `AllowedHosts`: `localhost;127.0.0.1;[::1]` (Host lạ: 400 rỗng) |
| Giới hạn body | Không đặt riêng; dùng mặc định của Kestrel |
| Tài liệu máy đọc | `/openapi/v1.json` và `/swagger`, chỉ môi trường Development (`Program.cs:58-64`) |

## Endpoint

| # | Phương thức và đường dẫn | Action | Request | Thành công | Lỗi |
|---|---|---|---|---|---|
| 1 | `GET /api/departments` | `DepartmentsController.GetAll` | — | 200 `DepartmentDto[]`, sắp theo `name` | — |
| 2 | `GET /api/departments/{id:int}` | `GetById` | — | 200 `DepartmentDto` | 404 |
| 3 | `POST /api/departments` | `Create` | `DepartmentRequest { name }` | 201 `DepartmentDto` (`employeeCount` 0), header `Location` | 400, 409 |
| 4 | `PUT /api/departments/{id:int}` | `Update` | `DepartmentRequest { name }` | 200 `DepartmentDto` đọc lại sau khi lưu | 400, 404, 409 |
| 5 | `DELETE /api/departments/{id:int}` | `Delete` | — | 204 | 404, 409 |
| 6 | `GET /api/employees?search=&departmentId=` | `EmployeesController.GetAll` | query chuỗi, không bắt buộc | 200 `EmployeeDto[]`, sắp `fullName` rồi `id` | 400 (`departmentId` sai dạng) |
| 7 | `GET /api/employees/{id:int}` | `GetById` | — | 200 `EmployeeDto` | 404 |
| 8 | `POST /api/employees` | `Create` | `EmployeeRequest { fullName, email, departmentId }` | 201 `EmployeeDto`, header `Location` | 400, 409 |
| 9 | `PUT /api/employees/{id:int}` | `Update` | `EmployeeRequest` đủ 3 trường | 200 `EmployeeDto` | 400, 404, 409 |
| 10 | `DELETE /api/employees/{id:int}` | `Delete` | — | 204 | 404 |

Ràng buộc route `{id:int}`: đường dẫn như `/api/employees/abc` không khớp route nên ra 404 của `StatusCodeProblemWriter` ("Không có đường dẫn API này."). Phương thức không có (ví dụ `PATCH`) ra 405; body không phải JSON ra 415. Mọi action nhận `CancellationToken`.

## Kiểu dữ liệu

| Kiểu | Trường (JSON) | Ghi chú |
|---|---|---|
| `DepartmentDto` | `id`, `name`, `employeeCount` | `employeeCount` đếm bằng truy vấn con trong cùng câu SELECT |
| `EmployeeDto` | `id`, `fullName`, `email`, `departmentId`, `departmentName` | `departmentName` lấy bằng JOIN |
| `DepartmentRequest` | `name: string?` | `[Required]` "Vui lòng nhập tên phòng ban"; không có `[MaxLength]` |
| `EmployeeRequest` | `fullName: string?`, `email: string?`, `departmentId: int?` | `[Required]` trên hai chuỗi; `departmentId` không `[Required]`, service kiểm `null` hoặc `< 1` |

## Luật kiểm và câu báo (theo thứ tự service kiểm)

- **Phòng ban** (`DepartmentService.NormalizeName`): ký tự không hợp lệ → rỗng → quá 100 ký tự (400, khóa `name`); trùng tên không phân biệt hoa thường (409, khóa `name`, title "Dữ liệu bị trùng"). `PUT` chuẩn hóa tên **trước** khi tìm bản ghi (body đủ hình dạng mà tên sai và id không có thì ra 400, không phải 404).
- **Nhân viên** (`EmployeeService.Normalize`): chỉ báo **lỗi đầu tiên** theo thứ tự `fullName` (ký tự lạ → rỗng → quá 100) → `email` (ký tự lạ → rỗng → quá 254 → sai định dạng) → `departmentId` (thiếu hoặc < 1: "Vui lòng chọn phòng ban") → phòng ban không tồn tại (400 "Phòng ban không tồn tại") → email trùng (409, khóa `email`). `PUT` tìm nhân viên **trước** (404 dù body sai nội dung).
- **Lọc** `departmentId`: rỗng hoặc toàn khoảng trắng là không lọc; phải là chữ số 0-9, > 0, trong phạm vi `int` (`NumberStyles.None`), sai thì 400 "Phòng ban lọc không hợp lệ"; số hợp lệ mà không có phòng thì 200 `[]`.
- **Tìm** `search`: chuẩn hóa như dữ liệu lưu; có ký tự bị chặn thì 200 `[]` và không truy vấn database; rỗng thì không lọc.
- **Xóa phòng ban**: còn nhân viên thì 409, title "Không thể xóa phòng ban", detail `Không thể xóa phòng ban "<tên>" vì còn N nhân viên.` (không có `errors`).

## Nơi sinh từng loại lỗi

| Mã | Nguồn | Hình dạng |
|---|---|---|
| 400 thiếu trường, sai kiểu, JSON hỏng | `[ApiController]` → `ValidationResponseFactory.Create` | `errors` theo khóa camelCase; JSON hỏng hoặc thiếu body dùng khóa `body` "Dữ liệu gửi lên không đúng định dạng JSON"; sai kiểu giá trị "Giá trị không đúng kiểu dữ liệu" |
| 400 nghiệp vụ | `DomainError.Validation` → `ErrorMapper` | `errors` một khóa, một câu |
| 404 bản ghi | `DomainError.NotFound` → `ErrorMapper` | `detail` "Không tìm thấy phòng ban/nhân viên có mã N." |
| 404/405/415 của framework | `StatusCodeProblemWriter` | `title` tiếng Việt, `type` RFC 9110, `traceId` |
| 409 | `DomainError.Conflict`, hoặc Postgres 23505 trên `ux_departments_name`/`ux_employees_email`, hoặc 23503/23001 (câu dự phòng) | theo trường hoặc `detail` |
| 413 và lỗi Kestrel khác | `BadHttpRequestException` → `ErrorMapper` | giữ mã gốc; 413 title "Dữ liệu gửi lên quá lớn" |
| 500 | mọi lỗi còn lại → `ErrorMapper.ServerError` | title "Lỗi máy chủ", detail câu chung; chi tiết chỉ trong log |

## Client phía giao diện (`frontend/src/api/`)

- `client.ts`: `apiGet`, `apiPost`, `apiPut`, `apiDelete`; base URL `VITE_API_BASE_URL ?? "http://localhost:5081"`; hạn 10 giây; chỉ đọc body lỗi khi `Content-Type` chứa `application/problem+json`; lỗi luôn là `ApiError { kind, status, message, errors }`, `message` = `detail || title || GENERIC_MESSAGE`. Câu riêng khi quá hạn lúc ghi/xóa ("chưa rõ đã lưu/xóa hay chưa").
- `departments.ts`: `getDepartments`, `getDepartment`, `createDepartment`, `updateDepartment`, `deleteDepartment`.
- `employees.ts`: `getEmployees(search, departmentId, options)` dựng query bằng `URLSearchParams`, `getEmployee`, `createEmployee`, `updateEmployee`, `deleteEmployee`.
- Lời gọi ghi không nhận `signal` (không hủy được từ trang); lời gọi đọc nhận `signal` để hủy.

## Route chỉ có trong project test

`backend/EmployeeCrud.Api.Tests/Platform/TestOnlyController.cs`, nạp qua `AddApplicationPart`: `GET /api/test-only/throw`, `/ok`, `/slow`, `/conflict`; `POST /api/test-only/validate`, `/validate-produces-json`, `/validate-html` (7 route). Không có trong ứng dụng thật.

## Tệp gọi thử

`backend/EmployeeCrud.Api/EmployeeCrud.Api.http`: 10 thao tác + 6b–6d (lọc) + đường dẫn lạ; `@baseUrl = http://localhost:5081`. Khối #9 `PUT /api/employees/1` ghi lên nhân viên mã 1 đang có (xem CQ-15 ở `code-quality-assessment.md`).
