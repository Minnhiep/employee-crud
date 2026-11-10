# Component Inventory: employee-crud

Mỗi mục: trách nhiệm, file, phụ thuộc. Phụ thuộc gói bên ngoài nằm ở `dependencies.md`; điểm nợ kỹ thuật ở `code-quality-assessment.md` (mã CQ-n).

## Backend: `backend/EmployeeCrud.Api`

### Program

- **Trách nhiệm**: đăng ký DI (controller, ProblemDetails, exception handler, CORS, OpenAPI, `AppDbContext` scoped đọc chuỗi kết nối lúc tạo ngữ cảnh, hai service scoped); gọi `StartupChecks.EnsureConnectionString`; dựng chuỗi middleware theo thứ tự cố định; khai `public partial class Program` cho test.
- **File**: `Program.cs`, `appsettings.json` (log, `AllowedHosts`, `Cors:AllowedOrigins`), `appsettings.Development.json`, `Properties/launchSettings.json`, `EmployeeCrud.Api.csproj` (`UserSecretsId`).
- **Phụ thuộc**: mọi `Platform.*`, `DepartmentService`, `EmployeeService`.

### DepartmentsController

- **Trách nhiệm**: 5 endpoint `/api/departments`; không chứa luật; 201 qua `CreatedAtAction`, 204 qua `NoContent`.
- **File**: `Departments/DepartmentsController.cs`.
- **Phụ thuộc**: `IDepartmentService`, `DepartmentDto`, `DepartmentRequest`.

### DepartmentService

- **Trách nhiệm**: đọc danh sách/một phòng kèm `employeeCount` (truy vấn con), thêm, sửa tên, xóa có kiểm còn nhân viên, `ExistsAsync` cho nhân viên; chuẩn hóa và kiểm tên (ký tự lạ → rỗng → quá 100); kiểm trùng `ToLower()`; bắt `DbUpdateConcurrencyException` → 404, lỗi khóa ngoại 23001/23503 trên `fk_employees_department` → đếm lại → 409.
- **File**: `Departments/DepartmentService.cs`, `IDepartmentService.cs`, `Department.cs`, `DepartmentConfiguration.cs` (bảng `departments`, `NameMaxLength = 100`), `DepartmentDto.cs`, `DepartmentRequest.cs`.
- **Phụ thuộc**: `AppDbContext`, `TextInput`, `DomainError`, `ErrorTitles`, `DbConstraintNames`, Npgsql (`PostgresException`, `PostgresErrorCodes`).

### EmployeesController

- **Trách nhiệm**: 5 endpoint `/api/employees`; `GET` nhận `search`, `departmentId` dạng chuỗi để service tự đọc số.
- **File**: `Employees/EmployeesController.cs`.
- **Phụ thuộc**: `IEmployeeService`, `EmployeeDto`, `EmployeeRequest`.

### EmployeeService

- **Trách nhiệm**: danh sách có lọc phòng (AND) và tìm `Contains` trên `ToLower()` của họ tên hoặc email, sắp họ tên rồi id; đọc một người (projection `ToDto` có JOIN); thêm/sửa với thứ tự kiểm cố định; xóa hẳn; `SaveAsync` đổi lỗi tranh chấp thành 404 (chỉ khi sửa/xóa) và lỗi khóa ngoại 23503 thành 400 "Phòng ban không tồn tại"; regex `EmailPattern` (chép giống `validateEmployee.ts`); `ParseDepartmentFilter` với `NumberStyles.None`.
- **File**: `Employees/EmployeeService.cs`, `IEmployeeService.cs`, `Employee.cs`, `EmployeeConfiguration.cs` (bảng `employees`, `FullNameMaxLength = 100`, `EmailMaxLength = 254`, khóa ngoại `Restrict`, chỉ mục `ix_employees_department_id`), `EmployeeDto.cs`, `EmployeeRequest.cs`.
- **Phụ thuộc**: `AppDbContext`, `IDepartmentService`, `TextInput`, `DomainError`, `ErrorTitles`, `DbConstraintNames`, Npgsql.

### AppDbContext

- **Trách nhiệm**: `DbSet<Department>`, `DbSet<Employee>`; nạp mọi `IEntityTypeConfiguration` trong assembly.
- **File**: `Platform/Data/AppDbContext.cs`.
- **Phụ thuộc**: EF Core; provider Npgsql do `Program` cấu hình (test thay bằng InMemory).

### Migrations

- **Trách nhiệm**: `CreateDepartments` (bảng, `PK_departments`, chỉ mục viết tay `ux_departments_name` trên `lower(name)`, 4 phòng mẫu chèn không kèm id); `CreateEmployees` (bảng, `PK_employees`, `fk_employees_department` RESTRICT, `ix_employees_department_id`, `ux_employees_email` trên `lower(email)`); `Down` xóa chỉ mục viết tay trước rồi xóa bảng; snapshot model EF 10.0.14.
- **File**: `Migrations/20261101183552_CreateDepartments.cs` (+ `.Designer.cs`), `Migrations/20261102083152_CreateEmployees.cs` (+ `.Designer.cs`), `Migrations/AppDbContextModelSnapshot.cs`.
- **Phụ thuộc**: `AppDbContext`; chạy bằng `dotnet ef` (công cụ cục bộ trong `dotnet-tools.json`).

### Platform.Errors

- **Trách nhiệm**: `DomainError` (NotFound/Validation/Conflict, kèm `Field`, `Title`); `ErrorMapper` (hàm thuần exception → ProblemDetails); `ProblemDetailsExceptionHandler` (log Error cho 5xx, Information cho 4xx, áp lại CORS, ghi qua `IProblemDetailsService`); `StatusCodeProblemWriter` (404/405/415 của framework, ghi thẳng JSON); `ValidationResponseFactory` (400 model binding, khóa camelCase, `JsonResult` để giữ `application/problem+json`, encoder giữ chữ Việt nhưng mã hóa `< > & ' "`); `ErrorTitles` (câu tiếng Việt dùng chung, khóa `body`/`name`/`email`); `DbConstraintNames`.
- **File**: `Platform/Errors/*.cs` (7 file).
- **Phụ thuộc**: ASP.NET Core Diagnostics/Mvc, EF Core, Npgsql, `CorsSetup`.

### Platform.Cors

- **Trách nhiệm**: chính sách `Frontend`: origin từ cấu hình (mặc định `http://localhost:5173`), GET/POST/PUT/DELETE, header `Content-Type`, không credentials.
- **File**: `Platform/Cors/CorsSetup.cs`.
- **Phụ thuộc**: `IConfiguration`.

### Platform.Security

- **Trách nhiệm**: middleware gắn header lúc `OnStarting`: `X-Content-Type-Options: nosniff` mọi phản hồi; riêng `/api`: `Cache-Control: no-store`, CSP `default-src 'none'; frame-ancestors 'none'`.
- **File**: `Platform/Security/SecurityHeaders.cs`.
- **Phụ thuộc**: không.

### Platform.Text

- **Trách nhiệm**: `TextInput.TryNormalize`: gộp mọi `char.IsWhiteSpace` thành một dấu cách, bỏ hai đầu, NFC; trả `false` với ký tự điều khiển, ký tự Format (Cf), nửa surrogate, noncharacter (U+FDD0–U+FDEF, …FFFE/…FFFF).
- **File**: `Platform/Text/TextInput.cs`.
- **Phụ thuộc**: không. Bản tương ứng phía giao diện: `utils/normalizeText.ts` (mục utils).

### StartupChecks

- **Trách nhiệm**: thiếu `ConnectionStrings:Default` thì log Critical và ném `InvalidOperationException` kèm lệnh `dotnet user-secrets` mẫu (không mở kết nối thử).
- **File**: `Platform/StartupChecks.cs`.
- **Phụ thuộc**: `WebApplication`.

### EmployeeCrud.Api.Tests

- **Trách nhiệm**: 119 phương thức, 148 ca: `DepartmentServiceTests` (45 ca), `EmployeeServiceTests` (75 ca) trên EF InMemory, mỗi test một database; `ErrorMapperTests` (12), `PipelineTests` (9), `SecurityTests` (5 ca), `LoggingTests` (2) qua `WebApplicationFactory<Program>` môi trường `Testing` với chuỗi kết nối giả; `TestOnlyController` gây lỗi theo yêu cầu; `TestSupport/` có `TestDb` và ba `AppDbContext` giả lập lỗi lúc lưu.
- **File**: `backend/EmployeeCrud.Api.Tests/**` (`.csproj` + 13 file `.cs`).
- **Phụ thuộc**: `EmployeeCrud.Api` (ProjectReference), xUnit, EF InMemory, Mvc.Testing, coverlet.

## Frontend: `frontend/`

### App

- **Trách nhiệm**: `main.tsx` nạp CSS theo thứ tự tokens → base → components, render `<App />` trong `StrictMode`; `App.tsx` khai `BrowserRouter` và bảng route dưới `AppLayout`: `/` → `/employees` (replace), `employees`, `employees/new`, `employees/:id/edit`, `departments`, `departments/new`, `departments/:id`, `departments/:id/edit`, `*` → `NotFoundPage`; route sửa/chi tiết có `key` theo id.
- **File**: `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`, `index.html` (`lang="vi"`).
- **Phụ thuộc**: react-router, các trang, `AppLayout`.

### frontend-api-client

- **Trách nhiệm**: mọi lời gọi HTTP; phân loại lỗi `ApiError`; hạn 10 giây; kiểu `Department`, `Employee`, request.
- **File**: `src/api/client.ts`, `src/api/departments.ts`, `src/api/employees.ts`, `.env.development`.
- **Phụ thuộc**: `fetch`, `AbortSignal.any`.

### EmployeesPage

- **Trách nhiệm**: danh sách nhân viên; `search` và `departmentId` đọc từ địa chỉ (`useSearchParams`); tải phòng ban cho ô lọc; bỏ tham số phòng đã mất kèm cờ `staleDepartment`; dòng đếm `aria-live`; trạng thái tải/lỗi/trống/không khớp; xóa có `ConfirmDialog`; `Toast`.
- **File**: `src/pages/employees/EmployeesPage.tsx` (566 dòng).
- **Phụ thuộc**: `api/employees`, `api/departments`, `SearchBox`, `DataTable`, `StatusMessage`, `ConfirmDialog`, `Toast`, `PageHeader`, `usePageTitle`, `useSubmitGuard`, `normalizeText`, `parseId`.

### EmployeeFormPage

- **Trách nhiệm**: form thêm/sửa nhân viên; tải nhân viên (sửa) và phòng ban song song; chọn sẵn phòng từ `?departmentId=` (chỉ form thêm); bỏ chọn phòng đã mất; kiểm khi rời ô và khi gõ; gửi giá trị đã chuẩn hóa; `ErrorSummary` + lỗi cạnh ô; nạp lại phòng ban khi API chê `departmentId`; quay về `listPath` (kiểm dạng `returnTo`/`search`/`departmentId` trong state).
- **File**: `src/pages/employees/EmployeeFormPage.tsx` (612 dòng), `src/pages/employees/validateEmployee.ts`.
- **Phụ thuộc**: `api/*`, `FormField`, `ErrorSummary`, `splitErrors`, `StatusMessage`, `PageHeader`, `usePageTitle`, `useSubmitGuard`, `normalizeText`, `parseId`.

### DepartmentsPage

- **Trách nhiệm**: danh sách phòng ban kèm số nhân viên; tên là liên kết tới trang chi tiết; xóa qua `useDepartmentDelete`; tải lại khi 404/409.
- **File**: `src/pages/departments/DepartmentsPage.tsx`.
- **Phụ thuộc**: `api/departments`, `DataTable`, `StatusMessage`, `Toast`, `PageHeader`, `useDepartmentDelete`.

### DepartmentDetailPage

- **Trách nhiệm**: `/departments/:id`: gọi song song `getDepartment` và `getEmployees("", id)`; nút sửa/xóa phòng, thêm nhân viên chọn sẵn phòng, sửa từng nhân viên với `returnTo` về trang này; xóa xong về `/departments`.
- **File**: `src/pages/departments/DepartmentDetailPage.tsx`.
- **Phụ thuộc**: `api/*`, `DataTable`, `StatusMessage`, `Toast`, `PageHeader`, `useDepartmentDelete`, `parseId`.

### DepartmentFormPage

- **Trách nhiệm**: form thêm/sửa tên phòng ban; quay về trang chi tiết nếu `returnTo` đúng `/departments/<id>`, không thì về danh sách.
- **File**: `src/pages/departments/DepartmentFormPage.tsx`, `src/pages/departments/validateDepartment.ts`.
- **Phụ thuộc**: `api/departments`, `FormField`, `ErrorSummary`, `splitErrors`, `StatusMessage`, `PageHeader`, `useSubmitGuard`, `normalizeText`, `parseId`.

### useDepartmentDelete

- **Trách nhiệm**: luật xóa phòng dùng chung: `employeeCount > 0` → hộp thông báo kèm liên kết "Xem N nhân viên" (không gọi API); bằng 0 → hộp xác nhận → `deleteDepartment`; trả `requestDelete`, `isSubmitting`, `dialogs`.
- **File**: `src/pages/departments/useDepartmentDelete.tsx`.
- **Phụ thuộc**: `ConfirmDialog`, `useSubmitGuard`, `api/departments`.

### NotFoundPage

- **Trách nhiệm**: trang cho đường dẫn lạ, có nút về danh sách nhân viên (dựng khung trạng thái bằng tay, không qua `StatusMessage`).
- **File**: `src/pages/NotFoundPage.tsx`.
- **Phụ thuộc**: `PageHeader`, `Icon`, `usePageTitle`.

### shared-components

- **Trách nhiệm**: `AppLayout` (khung: liên kết "Bỏ qua", thanh bên, `<main id="noi-dung">`), `NavMenu`, `PageHeader` (breadcrumb + h1 + nút), `DataTable` (bảng có `caption` ẩn, vùng cuộn nhận focus), `StatusMessage` (loading/error/empty), `Toast` (role="status", tự ẩn 5 giây, xóa state khỏi lịch sử), `ConfirmDialog` (`<dialog>` gốc, biến thể confirm/notice, `aria-disabled` khi bận), `ErrorSummary` (role="alert", liên kết tới ô), `FormField` (hàm vẽ ô kèm `aria-*`), `SearchBox` (form role="search"), `Icon`/`BrandMark` (SVG tự vẽ), `splitErrors`.
- **File**: `src/components/*`.
- **Phụ thuộc**: react-router (`Link`, `NavLink`, `useLocation`, `useNavigate`), `api/client` (kiểu `FieldErrors`).

### hooks

- **Trách nhiệm**: `usePageTitle` (đặt `document.title`, đưa focus vào h1 khi chuyển trang PUSH/POP, không khi mở lần đầu hoặc REPLACE); `useSubmitGuard` (chặn gửi hai lần bằng `useRef`).
- **File**: `src/hooks/usePageTitle.ts`, `src/hooks/useSubmitGuard.ts`.
- **Phụ thuộc**: react, react-router.

### utils

- **Trách nhiệm**: `normalizeText` (cùng luật `TextInput`, tập khoảng trắng như .NET, chặn `\p{Cc}\p{Cf}\p{Cs}` và noncharacter); `parseId` (số nguyên dương không số 0 đầu, ≤ 2147483647).
- **File**: `src/utils/normalizeText.ts`, `src/utils/parseId.ts`.
- **Phụ thuộc**: không.

### styles

- **Trách nhiệm**: biến thiết kế (màu đã đo tương phản WCAG, cỡ chữ rem, khoảng cách), kiểu nền (focus-visible, `.sr-only`, skip-link, giảm chuyển động), class BEM cho mọi thành phần, bố cục thu về một cột dưới 960px.
- **File**: `src/styles/tokens.css`, `src/styles/base.css`, `src/styles/components.css` (1001 dòng), `public/favicon.svg`.
- **Phụ thuộc**: không.

## Công cụ của repo

### repo-tooling

- **Trách nhiệm**: `dotnet-tools.json` (dotnet-ef 10.0.14, reportgenerator 5.5.12, cài cục bộ); `.editorconfig` (LF, quy ước C#); `.gitattributes` (`* text=auto eol=lf`); `.gitignore` (khối AI-DLC + build output, bí mật, `TestResults/`, `coverage*/`, `.playwright-mcp/`); `frontend/package.json` script `dev`, `build`, `typecheck`, `lint`, `format`, `format:check`, `preview`, `verify`, `coverage`; `frontend/eslint.config.js`, `tsconfig.json`, `vite.config.ts`, `.prettierignore`; `EmployeeCrud.Api.http` (gọi thử trong VS Code).
- **File**: các file trên.
- **Phụ thuộc**: .NET SDK, Node/npm.

### project-docs

- **Trách nhiệm**: hướng dẫn và bàn giao: `README.md` (16 mục), `docs/danh-sach-api.md` (10 thao tác, ví dụ gọi thật 03/11), `docs/so-do-database.md` (mermaid ER, ràng buộc, cách đối chiếu pgAdmin, thử ràng buộc 23505/23001), `docs/du-lieu-mau.sql` (4 phòng + 80 nhân viên `@congty.example`, chạy lại an toàn, khối gỡ), `docs/ke-hoach.md` (đề bài), `docs/tim-hieu-technical-stack/00–07` (tài liệu tự học viết trước khi làm bài; 01–05 và 00 có banner "bài thật khác ở…"; `07` là danh sách kiểm tay F/V/A/D/R và kịch bản demo).
- **File**: `README.md`, `docs/**`.
- **Phụ thuộc**: phản ánh code ở các mục trên; lệch đã thấy ghi ở `code-quality-assessment.md` (CQ-14 đến CQ-17).
