# Dependencies: employee-crud

Phiên bản cụ thể nằm ở `technology-stack.md`; tài liệu này ghi **ai dùng gì** và các phụ thuộc giữa phần code với nhau.

## Phụ thuộc ngoài theo thành phần

| Thành phần | Phụ thuộc ngoài | Dùng để |
| --- | --- | --- |
| `Program` | ASP.NET Core (MVC, ProblemDetails, CORS, Diagnostics), Microsoft.AspNetCore.OpenApi, Swashbuckle SwaggerUI, Npgsql EF provider | Dựng ứng dụng, middleware, tài liệu API |
| `DepartmentService`, `EmployeeService` | EF Core (`AnyAsync`, `CountAsync`, `AsNoTracking`, `DbUpdateException`), Npgsql (`PostgresException`, `PostgresErrorCodes`) | Truy vấn, bắt lỗi ràng buộc |
| `Platform.Errors` | ASP.NET Core Diagnostics/MVC, EF Core, Npgsql, `System.Text.Json` | Đổi lỗi sang ProblemDetails |
| `Migrations` | EF Core Migrations, `Npgsql.EntityFrameworkCore.PostgreSQL.Metadata` | Tạo bảng, identity |
| `EmployeeCrud.Api.Tests` | xUnit, Mvc.Testing, EF InMemory, Npgsql (dựng `PostgresException` giả), coverlet | Test |
| `frontend-api-client` | `fetch`, `AbortController`/`AbortSignal.any` của trình duyệt | HTTP |
| Trang, `shared-components`, `hooks` | `react`, `react-router` (`BrowserRouter`, `Link`, `NavLink`, `useSearchParams`, `useNavigate`, `useLocation`, `useParams`, `useNavigationType`, `Outlet`) | UI và định tuyến |
| `repo-tooling` | Node/npm (Vite, tsc, ESLint, Prettier), .NET SDK (`dotnet format`, `dotnet test`, tool manifest), Git | Kiểm chất lượng |

Không có gói icon, gói UI, gói state, gói HTTP client hay gói đổi tên cột (cố ý, xem comment trong code và `team.md`).

## Phụ thuộc lúc chạy

- Trình duyệt → backend: HTTP JSON tới `http://localhost:5081`, phải mở đúng origin `http://localhost:5173` vì CORS so nguyên văn.
- Backend → PostgreSQL 18 qua Npgsql; chuỗi kết nối từ user-secrets hoặc biến môi trường; backend vẫn khởi động khi PostgreSQL tắt (chỉ lỗi lúc request cần dữ liệu).
- Backend không gọi dịch vụ ngoài nào khác.

## Phụ thuộc giữa các project

- `EmployeeCrud.Api.Tests` → `EmployeeCrud.Api` (`ProjectReference`; dùng `Program` qua `public partial class Program`).
- `frontend/package.json` script `verify` và `coverage` gọi `dotnet` trên `../backend/EmployeeCrud.slnx`: frontend phụ thuộc đường dẫn tương đối tới backend ở cấp công cụ, không ở cấp code.
- Không có thư viện dùng chung giữa C# và TypeScript; luật kiểm dữ liệu được chép tay hai phía (`TextInput.cs` ↔ `normalizeText.ts`, `EmployeeService.EmailPattern` ↔ `validateEmployee.ts`, độ dài tối đa).

## Đồ thị phụ thuộc nội bộ

### Backend

```text
Program -> DepartmentsController, EmployeesController (qua MapControllers),
           DepartmentService, EmployeeService (DI), AppDbContext,
           Platform.Cors, Platform.Errors, Platform.Security, StartupChecks
DepartmentsController -> IDepartmentService, DepartmentDto, DepartmentRequest
EmployeesController   -> IEmployeeService, EmployeeDto, EmployeeRequest
DepartmentService -> AppDbContext, TextInput, DomainError, ErrorTitles, DbConstraintNames, DepartmentConfiguration
EmployeeService   -> AppDbContext, IDepartmentService, TextInput, DomainError, ErrorTitles, DbConstraintNames, EmployeeConfiguration
DepartmentRequest -> DepartmentService (hằng câu báo)
EmployeeRequest   -> EmployeeService (hằng câu báo)
EmployeeConfiguration -> DbConstraintNames
AppDbContext -> Department, Employee
ErrorMapper -> DomainError, ErrorTitles, DbConstraintNames
ProblemDetailsExceptionHandler -> ErrorMapper, CorsSetup
StatusCodeProblemWriter, ValidationResponseFactory -> ErrorTitles
```

Không có vòng phụ thuộc giữa file. Ở mức namespace có phụ thuộc hai chiều `Platform.Data` ↔ `Departments`/`Employees` (context biết thực thể, service biết context). `EmployeeService` → `IDepartmentService` là một chiều.

### Frontend

```text
main.tsx -> App, styles/*
App -> AppLayout, pages/*
pages/employees/*   -> api/employees, api/departments, api/client, components/*, hooks/*, utils/*
pages/departments/* -> api/departments, api/employees, api/client, components/*, hooks/*, utils/*, useDepartmentDelete
useDepartmentDelete -> api/departments, components/ConfirmDialog, hooks/useSubmitGuard
validateEmployee, validateDepartment -> utils/normalizeText, api/client (kiểu FieldErrors)
api/departments, api/employees -> api/client
components/ErrorSummary, components/splitErrors -> api/client (kiểu FieldErrors)
AppLayout, NavMenu, PageHeader, FormField, ErrorSummary, ConfirmDialog, SearchBox, StatusMessage, Toast -> components/Icon
AppLayout -> components/NavMenu
```

Không có import vòng. `components/` chỉ phụ thuộc kiểu (`import type`) từ `api/client`.
