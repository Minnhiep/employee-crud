# Danh sách thành phần

Tiêu đề cấp 3 dưới đây là tên thành phần, khớp mục `analyzed.components` trong `reverse-engineering-timestamp.md`.

## Backend

### EmployeeCrud.Api.Departments
- **Trách nhiệm:** phòng ban: thực thể, cấu hình bảng `departments`, DTO, request, service, controller.
- **File chính:** `DepartmentService.cs`, `DepartmentsController.cs`, `IDepartmentService.cs`.
- **Phụ thuộc:** `EmployeeCrud.Api.Platform.Data`, `EmployeeCrud.Api.Platform.Errors`, `EmployeeCrud.Api.Platform.Text`; đọc `db.Employees` để đếm người.
- **Được dùng bởi:** `EmployeeCrud.Api.Employees` qua `IDepartmentService.ExistsAsync`.
- **Điểm sửa:** `BE-11`.

### EmployeeCrud.Api.Employees
- **Trách nhiệm:** nhân viên: thực thể, cấu hình bảng `employees`, DTO, request, service, controller; tìm kiếm và lọc.
- **File chính:** `EmployeeService.cs`, `EmployeesController.cs`, `IEmployeeService.cs`.
- **Phụ thuộc:** `EmployeeCrud.Api.Departments`, `EmployeeCrud.Api.Platform.Data`, `EmployeeCrud.Api.Platform.Errors`, `EmployeeCrud.Api.Platform.Text`.

### EmployeeCrud.Api.Platform.Data
- **Trách nhiệm:** `AppDbContext`, tự nạp cấu hình bảng.
- **Phụ thuộc:** EF Core, thực thể của `Departments` và `Employees`.

### EmployeeCrud.Api.Platform.Errors
- **Trách nhiệm:** `DomainError`, `ErrorMapper`, `ErrorTitles`, `DbConstraintNames`, `ProblemDetailsExceptionHandler`, `StatusCodeProblemWriter`, `ValidationResponseFactory`.
- **Phụ thuộc:** ASP.NET Core, EF Core, Npgsql, `EmployeeCrud.Api.Platform.Cors`. Cố ý không phụ thuộc service nghiệp vụ.
- **Điểm sửa:** `BE-12`.

### EmployeeCrud.Api.Platform.Cors
- **Trách nhiệm:** chính sách CORS `Frontend`, đọc `Cors:AllowedOrigins`.

### EmployeeCrud.Api.Platform.Security
- **Trách nhiệm:** gắn header bảo mật lúc phản hồi bắt đầu gửi.

### EmployeeCrud.Api.Platform.Text
- **Trách nhiệm:** `TextInput.TryNormalize`, một luật chuẩn hóa cho mọi chữ người dùng nhập, gồm chặn noncharacter.
- **Được dùng bởi:** `DepartmentService`, `EmployeeService`.
- **Điểm sửa:** `DOC-12`.

### EmployeeCrud.Api.Platform.StartupChecks
- **Trách nhiệm:** dừng khởi động khi thiếu `ConnectionStrings:Default`.

### EmployeeCrud.Api.Migrations
- **Trách nhiệm:** tạo hai bảng, khóa ngoại, chỉ mục biểu thức, dữ liệu mẫu 4 phòng ban.
- **Phụ thuộc:** EF Core, Npgsql. Tên ràng buộc phải khớp `DbConstraintNames`.

### EmployeeCrud.Api.Program
- **Trách nhiệm:** đăng ký DI, thứ tự middleware, kiểu `Program` công khai cho test.

### EmployeeCrud.Api.Tests
- **Trách nhiệm:** unit test service trên InMemory; test pipeline bằng `WebApplicationFactory<Program>` và `TestOnlyController`.
- **Phụ thuộc:** `EmployeeCrud.Api`, xUnit, EF InMemory, `Microsoft.AspNetCore.Mvc.Testing`.

## Frontend

### frontend-app-shell
- **Trách nhiệm:** `main.tsx`, `App.tsx` (bảng route, `key` theo id), `AppLayout`, `NavMenu`, `NotFoundPage`.
- **Phụ thuộc:** React Router, các trang.

### frontend-api-client
- **Trách nhiệm:** `api/client.ts` (fetch, hẹn giờ, phân loại lỗi), `api/departments.ts`, `api/employees.ts` (kiểu và hàm gọi).
- **Được dùng bởi:** mọi trang; `ErrorSummary` và `splitErrors` dùng kiểu `FieldErrors`.
- **Điểm sửa:** `FE-15`, `FE-17`.

### frontend-shared-components
- **Trách nhiệm:** `ConfirmDialog`, `DataTable`, `ErrorSummary`, `FormField`, `Icon`, `PageHeader`, `SearchBox`, `StatusMessage`, `Toast`, `splitErrors`.
- **Phụ thuộc:** React, React Router (`Toast`, `PageHeader`, `StatusMessage`).

### frontend-hooks
- **Trách nhiệm:** `usePageTitle` (tiêu đề tab, focus h1), `useSubmitGuard` (chặn gửi hai lần).

### frontend-utils
- **Trách nhiệm:** `normalizeText`, bản frontend của `TextInput`; `parseId`, đọc mã trên địa chỉ.
- **Được dùng bởi:** `validateDepartment`, `validateEmployee`, `DepartmentFormPage`, `EmployeeFormPage`, `EmployeesPage`, `DepartmentDetailPage`.

### frontend-pages-employees
- **Trách nhiệm:** `EmployeesPage`, `EmployeeFormPage`, `validateEmployee`. Điểm sửa của `FE-12`, `FE-14`, `FE-16`.
- **Phụ thuộc:** `frontend-api-client`, `frontend-shared-components`, `frontend-hooks`, `frontend-utils`.

### frontend-pages-departments
- **Trách nhiệm:** `DepartmentsPage`, `DepartmentDetailPage`, `DepartmentFormPage`, `useDepartmentDelete`, `validateDepartment`. Điểm sửa của `FE-13`.
- **Phụ thuộc:** `frontend-api-client`, `frontend-shared-components`, `frontend-hooks`, `frontend-utils`.

### frontend-styles
- **Trách nhiệm:** `tokens.css` (biến), `base.css` (thẻ HTML), `components.css` (class BEM, responsive dưới 960px).

## Tài liệu

### docs-delivery
- **Trách nhiệm:** `README.md`, `docs/danh-sach-api.md`, `docs/so-do-database.md`, `docs/du-lieu-mau.sql`, `backend/EmployeeCrud.Api/EmployeeCrud.Api.http`.

### docs-study
- **Trách nhiệm:** `docs/ke-hoach.md` (đề bài), `docs/tim-hieu-technical-stack/` (00 đến 07, ghi chú tự học).
- **Điểm sửa:** `DOC-10` ở file `07`.
