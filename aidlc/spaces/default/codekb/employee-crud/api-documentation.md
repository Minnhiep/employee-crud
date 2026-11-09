# API Documentation: employee-crud

Ví dụ request/response JSON gọi thật có sẵn ở `docs/danh-sach-api.md` và `backend/EmployeeCrud.Api/EmployeeCrud.Api.http`; tài liệu này ghi hợp đồng rút ra từ code.

## Quy ước chung

| Mục | Giá trị | Nguồn |
|---|---|---|
| Địa chỉ gốc | `http://localhost:5081` (hồ sơ `http`); tùy chọn `https://localhost:7205` | `Properties/launchSettings.json` |
| Định dạng | JSON camelCase; thành công `application/json`; lỗi `application/problem+json` | `[Produces("application/json")]`, `ValidationResponseFactory`, `StatusCodeProblemWriter` |
| Xác thực, phân quyền | Không có | Phạm vi đề bài |
| Giới hạn tần suất | Không có | – |
| CORS | Chỉ origin trong `Cors:AllowedOrigins` (mặc định `http://localhost:5173`); phương thức `GET, POST, PUT, DELETE`; header `Content-Type`; không credentials | `Platform/Cors/CorsSetup.cs`, `appsettings.json` |
| Host hợp lệ | `localhost;127.0.0.1;[::1]`, Host khác trả 400 | `appsettings.json` `AllowedHosts` |
| Header bảo mật | Mọi phản hồi: `X-Content-Type-Options: nosniff`. Riêng `/api`: `Cache-Control: no-store`, `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'`. Không gửi header `Server` | `Platform/Security/SecurityHeaders.cs`, `Program.cs` |
| Tài liệu máy đọc | `GET /openapi/v1.json`, Swagger UI `/swagger` (chỉ Development) | `Program.cs` |

## Chuỗi middleware (thứ tự trong `Program.cs`)

1. `UseSecurityHeaders` (gắn header lúc phản hồi bắt đầu, nên có cả trên phản hồi lỗi)
2. `UseCors("Frontend")`
3. `UseExceptionHandler` → `ProblemDetailsExceptionHandler` (log + áp lại CORS + ghi ProblemDetails)
4. `UseStatusCodePages(StatusCodeProblemWriter.WriteAsync)` cho 404/405/415 không có nội dung
5. (Development) `MapOpenApi`, `UseSwaggerUI`
6. `UseRouting`, `MapControllers`

## Endpoint

### Phòng ban: `DepartmentsController` (`/api/departments`)

| # | Phương thức + đường dẫn | Body / tham số | Thành công | Lỗi |
|---|---|---|---|---|
| 1 | `GET /api/departments` | – | 200 `DepartmentDto[]` sắp theo `name` | – |
| 2 | `POST /api/departments` | `{ "name": string }` | 201 `DepartmentDto` + header `Location` | 400 (thiếu/rỗng/quá 100/ký tự lạ), 409 trùng tên (`errors.name`) |
| 3 | `GET /api/departments/{id:int}` | – | 200 `DepartmentDto` | 404 |
| 4 | `PUT /api/departments/{id:int}` | `{ "name": string }` | 200 `DepartmentDto` (đọc lại) | 400, 404, 409 |
| 5 | `DELETE /api/departments/{id:int}` | – | 204 | 404, 409 còn nhân viên (title "Không thể xóa phòng ban", `detail` nêu số người) |

`DepartmentDto` = `{ id: int, name: string, employeeCount: int }` (`employeeCount` đếm lúc đọc bằng truy vấn con, không lưu).

### Nhân viên: `EmployeesController` (`/api/employees`)

| # | Phương thức + đường dẫn | Body / tham số | Thành công | Lỗi |
|---|---|---|---|---|
| 6 | `GET /api/employees` | query `search?` (string), `departmentId?` (nhận dạng chuỗi) | 200 `EmployeeDto[]` sắp theo `fullName` rồi `id` | 400 `departmentId` sai dạng (`errors.departmentId` "Phòng ban lọc không hợp lệ") |
| 7 | `POST /api/employees` | `{ "fullName": string, "email": string, "departmentId": int }` | 201 `EmployeeDto` + `Location` | 400 (dữ liệu, phòng ban không tồn tại), 409 trùng email (`errors.email`) |
| 8 | `GET /api/employees/{id:int}` | – | 200 `EmployeeDto` | 404 |
| 9 | `PUT /api/employees/{id:int}` | như #7 | 200 `EmployeeDto` | 400, 404 (kiểm trước nội dung body), 409 |
| 10 | `DELETE /api/employees/{id:int}` | – | 204 | 404 |

`EmployeeDto` = `{ id, fullName, email, departmentId, departmentName }`. Hành vi tìm/lọc: `business-overview.md` BR9, BR10.

Đường dẫn có `id` không phải số (ví dụ `/api/employees/abc`) không khớp route nào → 404 ProblemDetails.

## Định dạng lỗi (ProblemDetails, RFC 9457)

| Tình huống | Status | `title` | Nội dung |
|---|---|---|---|
| `DomainError.Validation` | 400 | "Dữ liệu không hợp lệ" | `errors: { <field>: [message] }` (một trường, lỗi đầu tiên) |
| Model binding thiếu trường bắt buộc / JSON hỏng / sai kiểu | 400 | "Dữ liệu không hợp lệ" | `errors` khóa camelCase; lỗi cả thân dùng khóa `body` ("Dữ liệu gửi lên không đúng định dạng JSON"); sai kiểu "Giá trị không đúng kiểu dữ liệu" |
| `DomainError.NotFound` | 404 | "Không tìm thấy" | `detail` ví dụ "Không tìm thấy nhân viên có mã 5." |
| Đường dẫn lạ | 404 | "Không tìm thấy" | `detail` "Không có đường dẫn API này." |
| Sai phương thức | 405 | "Phương thức không được hỗ trợ" | – |
| `DomainError.Conflict` có trường | 409 | "Dữ liệu bị trùng" (hoặc title riêng) | `errors.name` hoặc `errors.email` |
| `DomainError.Conflict` không trường | 409 | title riêng hoặc "Không thể thực hiện" | `detail` |
| 23505 trên `ux_departments_name` / `ux_employees_email` (chen nhau) | 409 | "Dữ liệu bị trùng" | `errors.name` / `errors.email` |
| 23503/23001 không được service bắt | 409 | "Không thể thực hiện" | `detail` "Dữ liệu liên quan đã thay đổi, …" |
| Sai `Content-Type` | 415 | "Kiểu dữ liệu không được hỗ trợ" | `detail` "Hãy gửi JSON (Content-Type: application/json)." |
| Lỗi khác | 500 | "Lỗi máy chủ" | `detail` câu chung, không lộ thông điệp gốc |

Mọi phản hồi lỗi có `type` (RFC 9110), `status`, `traceId` (trùng với dòng log). Chữ tiếng Việt ghi nguyên dạng; ký tự HTML `< > & ' "` được mã thoát.

## API nội bộ phía frontend (`frontend/src/api/`)

- `client.ts`: `apiGet<T>`, `apiPost<T>`, `apiPut<T>`, `apiDelete`; base URL `import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5081"`; hẹn giờ 10 giây; chỉ gửi `Content-Type` khi có body; 204 trả `undefined`.
- Lỗi luôn là `ApiError { kind, status, message, errors }` với `kind`: `network` (không gọi được / quá hạn; lời báo khác nhau cho GET, ghi, xóa), `server` (5xx, body hỏng), `client` (4xx, giữ nguyên lời báo API), `aborted` (trang tự hủy, bị bỏ qua). Hàm phụ `isAborted`, `messageOf`, hằng `GENERIC_MESSAGE`.
- `departments.ts`: `getDepartments`, `getDepartment`, `createDepartment`, `updateDepartment`, `deleteDepartment`.
- `employees.ts`: `getEmployees(search, departmentId, options)` (dựng query bằng `URLSearchParams`), `getEmployee`, `createEmployee`, `updateEmployee`, `deleteEmployee`.

## Endpoint chỉ có trong test

`backend/EmployeeCrud.Api.Tests/Platform/TestOnlyController.cs` (`/api/test-only`, nạp bằng `AddApplicationPart` trong `PlatformWebAppFactory`): `GET throw`, `GET ok`, `GET slow`, `GET conflict`, `POST validate`, `POST validate-produces-json`, `POST validate-html`. Không có trong ứng dụng chạy thật.
