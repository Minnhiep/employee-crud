# Tài liệu API

Nguồn chuẩn cho người dùng: `docs/danh-sach-api.md` (có JSON mẫu đầy đủ). File này tóm tắt từ code.

Địa chỉ gốc `http://localhost:5081`. Không có xác thực, không giới hạn tần suất, không phân trang.

## Endpoint

| Phương thức | Đường dẫn | Controller | Vào | Thành công | Lỗi |
|---|---|---|---|---|---|
| GET | `/api/departments` | `DepartmentsController.GetAll` | | 200 `DepartmentDto[]` | |
| GET | `/api/departments/{id:int}` | `DepartmentsController.GetById` | | 200 `DepartmentDto` | 404 |
| POST | `/api/departments` | `DepartmentsController.Create` | `DepartmentRequest` | 201 + `Location` | 400, 409 |
| PUT | `/api/departments/{id:int}` | `DepartmentsController.Update` | `DepartmentRequest` | 200 `DepartmentDto` | 400, 404, 409 |
| DELETE | `/api/departments/{id:int}` | `DepartmentsController.Delete` | | 204 | 404, 409 |
| GET | `/api/employees` | `EmployeesController.GetAll` | `?search=`, `?departmentId=` | 200 `EmployeeDto[]` | 400 |
| GET | `/api/employees/{id:int}` | `EmployeesController.GetById` | | 200 `EmployeeDto` | 404 |
| POST | `/api/employees` | `EmployeesController.Create` | `EmployeeRequest` | 201 + `Location` | 400, 409 |
| PUT | `/api/employees/{id:int}` | `EmployeesController.Update` | `EmployeeRequest` | 200 `EmployeeDto` | 400, 404, 409 |
| DELETE | `/api/employees/{id:int}` | `EmployeesController.Delete` | | 204 | 404 |

Chỉ ở Development: `GET /openapi/v1.json`, trang `/swagger`.

Ràng buộc `{id:int}` làm đường dẫn như `/api/employees/2127e0` không khớp route và ra 404. Frontend đọc mã trên địa chỉ bằng `parseId`, nên `2127e0` không còn được đổi thành 2127.

**Lệch đã biết:** PUT phòng ban với tên không đổi trên phòng vừa bị xóa trả 200 thay vì 404 (`BE-11`). PUT nhân viên cùng tình huống trả 404 đúng. Với lỗi kép (dữ liệu sai và không có bản ghi), PUT phòng ban trả 400, PUT nhân viên trả 404 (`BE-3`).

## Contract

```csharp
// Vào
DepartmentRequest { string? Name }            // [Required]
EmployeeRequest   { string? FullName,          // [Required]
                    string? Email,             // [Required]
                    int? DepartmentId }

// Ra
record DepartmentDto(int Id, string Name, int EmployeeCount);
record EmployeeDto(int Id, string FullName, string Email, int DepartmentId, string DepartmentName);
```

JSON dùng camelCase. `EmployeeCount` đếm lúc đọc, không lưu. `departmentId` trên query nhận dạng chuỗi để service báo câu tiếng Việt.

## Hình dạng lỗi

Mọi lỗi là `application/problem+json`.

| Mã | Nguồn | `title` | Nội dung |
|---|---|---|---|
| 400 | `ValidationResponseFactory`, `DomainError.Validation` | `Dữ liệu không hợp lệ` | `errors: { field: [..] }`, khóa camelCase; JSON hỏng dùng khóa `body` |
| 404 | `DomainError.NotFound` | `Không tìm thấy` | `detail` có mã bản ghi |
| 404 | `StatusCodeProblemWriter` | `Không tìm thấy` | `detail` là câu không có đường dẫn |
| 405 | `StatusCodeProblemWriter` | `Phương thức không được hỗ trợ` | |
| 409 | `DomainError.Conflict` hoặc 23505 | `Dữ liệu bị trùng` | `errors.name` hoặc `errors.email` |
| 409 | Xóa phòng còn người | `Không thể xóa phòng ban` | `detail` có tên và số người |
| 409 | 23503, 23001 lọt tới `ErrorMapper` | `Không thể thực hiện` | `detail` câu chung |
| 413 | `BadHttpRequestException` | `Dữ liệu gửi lên quá lớn` | |
| 415 | `StatusCodeProblemWriter` | `Kiểu dữ liệu không được hỗ trợ` | |
| 500 | Mọi lỗi khác | `Lỗi máy chủ` | Câu chung, có `traceId` để dò log |

Lỗi phòng ban không tồn tại khi thêm hoặc sửa nhân viên là 400 `errors.departmentId` "Phòng ban không tồn tại", từ `EnsureDepartmentExistsAsync` hoặc từ khóa ngoại 23503 khi phòng bị xóa chen vào.

Khóa `"name"`, `"email"` trong `ErrorMapper` gõ tay, phải khớp `DepartmentService.NameField`, `EmployeeService.EmailField` (`BE-12`).

Phản hồi `/api` kèm `X-Content-Type-Options: nosniff`, `Cache-Control: no-store`, `Content-Security-Policy`. CORS chỉ cho `http://localhost:5173`, phương thức GET, POST, PUT, DELETE, header `Content-Type`.

## Bên gọi API trong repo

`frontend/src/api/client.ts` là điểm gọi duy nhất. Hẹn giờ 10 giây cho mọi phương thức, đổi lỗi thành `ApiError` với `kind` là `network`, `server`, `client` hoặc `aborted`. Hết giờ lúc ghi vẫn báo mất kết nối (`FE-15`).

| Trang (đường dẫn trình duyệt) | API dùng |
|---|---|
| `/employees` | GET employees, GET departments, DELETE employee |
| `/employees/new` | GET departments, POST employee |
| `/employees/:id/edit` | GET employee, GET departments, PUT employee |
| `/departments` | GET departments, DELETE department |
| `/departments/new` | POST department |
| `/departments/:id` | GET department, GET employees theo phòng, DELETE department |
| `/departments/:id/edit` | GET department, PUT department |

`/` chuyển sang `/employees`; đường dẫn lạ vào `NotFoundPage`.

`backend/EmployeeCrud.Api/EmployeeCrud.Api.http` có 10 thao tác và ví dụ lọc 6b–6d, thứ tự khớp `docs/danh-sach-api.md`. Nhãn thao tác 2 và 7 còn lệch (`DOC-11`).
