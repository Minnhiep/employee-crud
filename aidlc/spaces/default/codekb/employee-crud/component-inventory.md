# Component Inventory: employee-crud

Mỗi thành phần ghi: vị trí, trách nhiệm, phụ thuộc. Tên tiêu đề cấp 3 là tên thành phần dùng trong `reverse-engineering-timestamp.md`. Phiên bản thư viện: `technology-stack.md`; đồ thị phụ thuộc: `dependencies.md`.

## Backend: `backend/EmployeeCrud.Api`

### Program

- **Vị trí**: `backend/EmployeeCrud.Api/Program.cs`
- **Trách nhiệm**: composition root. Đăng ký controller (thay phản hồi 400 mặc định, tắt `MapClientErrors`), ProblemDetails, `ProblemDetailsExceptionHandler`, CORS, OpenAPI, `AppDbContext` (Npgsql, chuỗi kết nối đọc lúc tạo context), hai service Scoped; tắt header `Server`; gọi `StartupChecks`; dựng chuỗi middleware (thứ tự ở `api-documentation.md`). `public partial class Program` cho `WebApplicationFactory`.
- **Phụ thuộc**: mọi thành phần backend còn lại.

### DepartmentsController

- **Vị trí**: `backend/EmployeeCrud.Api/Departments/DepartmentsController.cs`
- **Trách nhiệm**: 5 endpoint `/api/departments`; chỉ nhận request, gọi service, trả mã HTTP (201 `CreatedAtAction`, 204 `NoContent`).
- **Phụ thuộc**: `IDepartmentService`, `DepartmentDto`, `DepartmentRequest`.

### DepartmentService

- **Vị trí**: `backend/EmployeeCrud.Api/Departments/` (`IDepartmentService.cs`, `DepartmentService.cs`, `Department.cs`, `DepartmentConfiguration.cs`, `DepartmentDto.cs`, `DepartmentRequest.cs`)
- **Trách nhiệm**: luật BR1–BR3 (chuẩn hóa tên, độ dài, trùng tên theo `lower()`, xóa chặn khi còn nhân viên kèm đường dự phòng bắt 23001/23503 và đếm lại); `ExistsAsync` cho `EmployeeService`; DTO kèm `employeeCount` bằng truy vấn con; xử lý `DbUpdateConcurrencyException` → 404. Cấu hình bảng `departments` (snake_case, `NameMaxLength = 100`).
- **Phụ thuộc**: `AppDbContext`, `Platform.Text`, `Platform.Errors`, Npgsql (`PostgresException`, `PostgresErrorCodes`).

### EmployeesController

- **Vị trí**: `backend/EmployeeCrud.Api/Employees/EmployeesController.cs`
- **Trách nhiệm**: 5 endpoint `/api/employees`; nhận `search`, `departmentId` dạng chuỗi để service tự báo lỗi tiếng Việt.
- **Phụ thuộc**: `IEmployeeService`, `EmployeeDto`, `EmployeeRequest`.

### EmployeeService

- **Vị trí**: `backend/EmployeeCrud.Api/Employees/` (`IEmployeeService.cs`, `EmployeeService.cs`, `Employee.cs`, `EmployeeConfiguration.cs`, `EmployeeDto.cs`, `EmployeeRequest.cs`)
- **Trách nhiệm**: luật BR4–BR11 (chuẩn hóa, độ dài, mẫu email, phòng ban tồn tại, email trùng, tìm kiếm và lọc, thứ tự kiểm); đổi DTO bằng `Expression` (JOIN tên phòng ban); bắt 23503 khi lưu → 400 ô `departmentId`; concurrency → 404. Cấu hình bảng `employees`: khóa ngoại `fk_employees_department` RESTRICT, chỉ mục `ix_employees_department_id`.
- **Phụ thuộc**: `AppDbContext`, `IDepartmentService`, `Platform.Text`, `Platform.Errors`, Npgsql.

### AppDbContext

- **Vị trí**: `backend/EmployeeCrud.Api/Platform/Data/AppDbContext.cs`
- **Trách nhiệm**: `DbSet<Department> Departments`, `DbSet<Employee> Employees`; `ApplyConfigurationsFromAssembly` nạp mọi `IEntityTypeConfiguration`.
- **Phụ thuộc**: EF Core; thực thể `Department`, `Employee`.

### Migrations

- **Vị trí**: `backend/EmployeeCrud.Api/Migrations/`
- **Trách nhiệm**: `20261101183552_CreateDepartments` (bảng, chỉ mục viết tay `ux_departments_name` trên `lower(name)`, 4 phòng ban mẫu chèn không kèm id); `20261102083152_CreateEmployees` (bảng, FK RESTRICT, chỉ mục thường, chỉ mục viết tay `ux_employees_email`). `Down` xóa chỉ mục viết tay trước rồi xóa bảng. Snapshot `ProductVersion` 10.0.14. Chạy tay bằng `dotnet ef database update`, ứng dụng không tự migrate.
- **Phụ thuộc**: EF Core Migrations, Npgsql.

### Platform.Errors

- **Vị trí**: `backend/EmployeeCrud.Api/Platform/Errors/`
- **Trách nhiệm**: `DomainError` (NotFound, Validation, Conflict); `ErrorMapper.Map` (hàm thuần, exception → ProblemDetails, không bao giờ trả 2xx); `ProblemDetailsExceptionHandler` (log Error cho 5xx, Information cho 4xx kèm `traceId`; áp lại CORS; ghi phản hồi); `StatusCodeProblemWriter` (404/405/415 rỗng → ProblemDetails tiếng Việt); `ValidationResponseFactory` (400 của model binding → khóa camelCase, `JsonResult` giữ `application/problem+json`); `ErrorTitles` (mọi câu báo chung); `DbConstraintNames` (tên ràng buộc là hợp đồng với migration).
- **Phụ thuộc**: ASP.NET Core Diagnostics/MVC, EF Core, Npgsql, `Platform.Cors`.

### Platform.Cors

- **Vị trí**: `backend/EmployeeCrud.Api/Platform/Cors/CorsSetup.cs`
- **Trách nhiệm**: chính sách `Frontend` đọc `Cors:AllowedOrigins` (mặc định `http://localhost:5173`), giới hạn phương thức và header, không credentials.
- **Phụ thuộc**: ASP.NET Core CORS, cấu hình.

### Platform.Security

- **Vị trí**: `backend/EmployeeCrud.Api/Platform/Security/SecurityHeaders.cs`
- **Trách nhiệm**: middleware gắn `nosniff` cho mọi phản hồi, `no-store` + CSP cho `/api`, gắn trong `OnStarting` để không mất khi bộ bắt lỗi xóa header.
- **Phụ thuộc**: ASP.NET Core.

### Platform.Text

- **Vị trí**: `backend/EmployeeCrud.Api/Platform/Text/TextInput.cs`
- **Trách nhiệm**: `TryNormalize` (BR8): gộp khoảng trắng theo `char.IsWhiteSpace`, NFC; từ chối `Cc`, `Cf`, surrogate lẻ, noncharacter. Bản tương ứng phía frontend: `utils`.
- **Phụ thuộc**: BCL (`System.Globalization`, `System.Text`).

### StartupChecks

- **Vị trí**: `backend/EmployeeCrud.Api/Platform/StartupChecks.cs`
- **Trách nhiệm**: thiếu `ConnectionStrings:Default` thì log Critical và ném `InvalidOperationException` với lệnh `dotnet user-secrets` hướng dẫn (không in mật khẩu); không mở kết nối thử.
- **Phụ thuộc**: `WebApplication` cấu hình và logger.

### EmployeeCrud.Api.Tests

- **Vị trí**: `backend/EmployeeCrud.Api.Tests/`
- **Trách nhiệm**: 148 ca xUnit (đếm tĩnh): `DepartmentServiceTests` 45, `EmployeeServiceTests` 75 (unit test service trên InMemory), `ErrorMapperTests` 12, `PipelineTests` 9, `SecurityTests` 5, `LoggingTests` 2 (dựng ứng dụng thật trong bộ nhớ, môi trường `Testing`). Hỗ trợ: `TestDb`, ba `AppDbContext` giả lập lỗi khi lưu, `PlatformWebAppFactory`/`MissingConnectionStringWebAppFactory`, `LogCapturingWebAppFactory`, `TestOnlyController`.
- **Phụ thuộc**: `EmployeeCrud.Api` (ProjectReference), xUnit, Mvc.Testing, EF InMemory, coverlet.

## Frontend: `frontend/`

### App

- **Vị trí**: `frontend/src/main.tsx`, `frontend/src/App.tsx`, `frontend/index.html`
- **Trách nhiệm**: gắn React vào `#root` trong `StrictMode`, nạp CSS theo thứ tự; bảng route (`/` → `/employees`, `employees`, `employees/new`, `employees/:id/edit`, `departments`, `departments/new`, `departments/:id`, `departments/:id/edit`, `*`) trong `AppLayout`; route sửa/chi tiết có `key` theo id.
- **Phụ thuộc**: `react-router`, mọi trang, `shared-components`.

### frontend-api-client

- **Vị trí**: `frontend/src/api/client.ts`, `departments.ts`, `employees.ts`
- **Trách nhiệm**: mọi lời gọi HTTP; hẹn giờ 10 giây; phân loại lỗi thành `ApiError` (hợp đồng ở `api-documentation.md`).
- **Phụ thuộc**: `fetch`, `AbortSignal.any`, biến `VITE_API_BASE_URL`.

### EmployeesPage

- **Vị trí**: `frontend/src/pages/employees/EmployeesPage.tsx`
- **Trách nhiệm**: danh sách nhân viên; tìm (nút Tìm/Enter) và lọc phòng ban qua địa chỉ trang; năm trạng thái tải/lỗi/trống/không khớp/có dữ liệu; phát hiện phòng lọc không còn; xóa có xác nhận; dòng đếm `aria-live`.
- **Phụ thuộc**: `frontend-api-client`, `shared-components`, `hooks`, `utils`.

### EmployeeFormPage

- **Vị trí**: `frontend/src/pages/employees/EmployeeFormPage.tsx`, `validateEmployee.ts`
- **Trách nhiệm**: form thêm/sửa; nạp nhân viên và phòng ban song song; chọn sẵn phòng từ `?departmentId=`; kiểm trên trình duyệt cùng luật API; hiện lỗi API theo ô; nạp lại phòng ban khi API chê `departmentId`; quay về đúng danh sách/trang chi tiết (`returnTo` chỉ nhận `/departments/<số>`).
- **Phụ thuộc**: `frontend-api-client`, `shared-components`, `hooks`, `utils`.

### DepartmentsPage

- **Vị trí**: `frontend/src/pages/departments/DepartmentsPage.tsx`
- **Trách nhiệm**: danh sách phòng ban kèm số nhân viên, tên là liên kết tới trang chi tiết (kiểu liên kết theo `project.md` Corrections), xóa qua `useDepartmentDelete`, tải lại khi 404/409.
- **Phụ thuộc**: `frontend-api-client`, `useDepartmentDelete`, `shared-components`, `hooks`.

### DepartmentDetailPage

- **Vị trí**: `frontend/src/pages/departments/DepartmentDetailPage.tsx`
- **Trách nhiệm**: `/departments/:id`: gọi song song `getDepartment` và `getEmployees("", id)`; sửa/xóa phòng, sửa nhân viên, thêm nhân viên chọn sẵn phòng; gửi `returnTo`.
- **Phụ thuộc**: `frontend-api-client`, `useDepartmentDelete`, `shared-components`, `hooks`, `utils`.

### DepartmentFormPage

- **Vị trí**: `frontend/src/pages/departments/DepartmentFormPage.tsx`, `validateDepartment.ts`
- **Trách nhiệm**: form thêm/sửa tên phòng ban; kiểm cùng luật API; quay về trang chi tiết nếu đến từ đó.
- **Phụ thuộc**: `frontend-api-client`, `shared-components`, `hooks`, `utils`.

### useDepartmentDelete

- **Vị trí**: `frontend/src/pages/departments/useDepartmentDelete.tsx`
- **Trách nhiệm**: luật xóa phòng ban dùng chung cho trang danh sách và chi tiết: còn người thì hộp thông báo (liên kết "Xem N nhân viên"), 0 người thì hộp xác nhận; gọi `deleteDepartment`, báo về trang cha.
- **Phụ thuộc**: `frontend-api-client`, `ConfirmDialog`, `useSubmitGuard`.

### NotFoundPage

- **Vị trí**: `frontend/src/pages/NotFoundPage.tsx`
- **Trách nhiệm**: trang cho địa chỉ không khớp route nào, có liên kết về danh sách nhân viên.
- **Phụ thuộc**: `shared-components`, `hooks`.

### shared-components

- **Vị trí**: `frontend/src/components/`
- **Trách nhiệm**: `AppLayout` (thanh bên + `<main id="noi-dung">` + liên kết bỏ qua), `NavMenu`, `PageHeader` (breadcrumb, h1, nút chính), `DataTable`, `FormField` (render-prop + aria), `ErrorSummary`, `ConfirmDialog` (`<dialog>` gốc, trả focus), `SearchBox`, `StatusMessage`, `Toast` (đọc `location.state.message`, tự ẩn 5 giây), `Icon`/`BrandMark` (SVG tự vẽ), `splitErrors`.
- **Phụ thuộc**: `react`, `react-router`, kiểu `FieldErrors` của `frontend-api-client`.

### hooks

- **Vị trí**: `frontend/src/hooks/usePageTitle.ts`, `useSubmitGuard.ts`
- **Trách nhiệm**: `usePageTitle` đặt `document.title` và đưa focus vào h1 khi chuyển trang do người dùng (không ở lần mở đầu hay REPLACE); `useSubmitGuard` chặn gửi hai lần.
- **Phụ thuộc**: `react`, `react-router`.

### utils

- **Vị trí**: `frontend/src/utils/normalizeText.ts`, `parseId.ts`
- **Trách nhiệm**: `normalizeText` (bản frontend của BR8, tập khoảng trắng khớp `char.IsWhiteSpace` của .NET); `parseId` (chỉ nhận `^[1-9][0-9]*$` và không vượt `int` của C#).
- **Phụ thuộc**: không.

### styles

- **Vị trí**: `frontend/src/styles/tokens.css`, `base.css`, `components.css`
- **Trách nhiệm**: biến thiết kế (màu đã đo tương phản WCAG AA, cỡ chữ rem, khoảng cách), kiểu nền và focus, class component kiểu BEM; màn hẹp dưới 960px chuyển thanh bên thành thanh ngang.
- **Phụ thuộc**: không.

## Công cụ của repo

### repo-tooling

- **Vị trí**: `.gitignore`, `.editorconfig`, `dotnet-tools.json`, `frontend/.prettierignore`, `frontend/.gitignore`, `frontend/package.json` (scripts), `frontend/eslint.config.js`, `frontend/tsconfig.json`
- **Trách nhiệm**: loại file sinh ra và bí mật khỏi Git; quy ước code C#; công cụ .NET cục bộ (`dotnet-ef` 10.0.14, `reportgenerator` 5.5.12); cổng kiểm `npm run verify` (typecheck → lint → `prettier --check .` → build → `dotnet format --verify-no-changes` → `dotnet test`) và `npm run coverage`. Không có `.gitattributes`, không có cấu hình Prettier, không có CI (chi tiết: `code-quality-assessment.md`).
- **Phụ thuộc**: Git (cấu hình `core.autocrlf` của từng máy), Node/npm, .NET SDK.
