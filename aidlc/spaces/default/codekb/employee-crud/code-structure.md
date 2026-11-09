# Code Structure: employee-crud

## Cây thư mục (phần người viết, đã bỏ build output, dependency và AI-DLC)

```text
./
├── .editorconfig            quy ước C#/.NET, thụt lề; không có end_of_line
├── .gitignore               khối AI-DLC + phần dự án (bin/, obj/, node_modules/, dist/, TestResults/, coverage*/, bí mật, .playwright-mcp/)
├── dotnet-tools.json        tool manifest: dotnet-ef, reportgenerator
├── README.md                hướng dẫn cài đặt, chạy, test (16 mục)
├── backend/
│   ├── EmployeeCrud.slnx
│   ├── EmployeeCrud.Api/
│   │   ├── Program.cs                     DI + chuỗi middleware
│   │   ├── EmployeeCrud.Api.csproj, EmployeeCrud.Api.http
│   │   ├── appsettings.json, appsettings.Development.json, Properties/launchSettings.json
│   │   ├── Departments/                   7 file: entity, cấu hình bảng, DTO, request, interface, service, controller
│   │   ├── Employees/                     7 file: cùng cấu trúc
│   │   ├── Platform/
│   │   │   ├── StartupChecks.cs
│   │   │   ├── Cors/CorsSetup.cs
│   │   │   ├── Data/AppDbContext.cs
│   │   │   ├── Errors/                    DbConstraintNames, DomainError, ErrorMapper, ErrorTitles,
│   │   │   │                              ProblemDetailsExceptionHandler, StatusCodeProblemWriter, ValidationResponseFactory
│   │   │   ├── Security/SecurityHeaders.cs
│   │   │   └── Text/TextInput.cs
│   │   └── Migrations/                    CreateDepartments, CreateEmployees (+ Designer), AppDbContextModelSnapshot
│   └── EmployeeCrud.Api.Tests/
│       ├── EmployeeCrud.Api.Tests.csproj
│       ├── Departments/DepartmentServiceTests.cs
│       ├── Employees/EmployeeServiceTests.cs
│       ├── Platform/                      ErrorMapperTests, PipelineTests, SecurityTests, LoggingTests,
│       │                                  PlatformWebAppFactory, LogCapturingWebAppFactory, TestOnlyController
│       └── TestSupport/                   TestDb, ThrowingAppDbContext, RemoveDepartmentBeforeSaveContext, SeedBeforeSaveThenFailContext
├── frontend/
│   ├── package.json, package-lock.json, tsconfig.json, vite.config.ts, eslint.config.js, index.html
│   ├── .prettierignore, .gitignore, .env.development
│   ├── public/favicon.svg
│   └── src/
│       ├── main.tsx, App.tsx, vite-env.d.ts
│       ├── api/          client.ts, departments.ts, employees.ts
│       ├── components/   AppLayout, NavMenu, PageHeader, DataTable, FormField, ErrorSummary, ConfirmDialog,
│       │                 SearchBox, StatusMessage, Toast, Icon (.tsx); splitErrors.ts
│       ├── hooks/        usePageTitle.ts, useSubmitGuard.ts
│       ├── pages/        NotFoundPage.tsx
│       │   ├── departments/  DepartmentsPage, DepartmentDetailPage, DepartmentFormPage, useDepartmentDelete (.tsx); validateDepartment.ts
│       │   └── employees/    EmployeesPage, EmployeeFormPage (.tsx); validateEmployee.ts
│       ├── styles/       tokens.css, base.css, components.css
│       ├── utils/        normalizeText.ts, parseId.ts
│       └── assets/       (rỗng)
└── docs/
    ├── ke-hoach.md, so-do-database.md, danh-sach-api.md, du-lieu-mau.sql
    └── tim-hieu-technical-stack/  00–07: tài liệu tự học (không phải code)
```

## Phân loại file

| Loại | Backend | Frontend |
|---|---|---|
| Model/Entity | `Departments/Department.cs`, `Employees/Employee.cs` | Kiểu `Department`, `Employee` trong `api/departments.ts`, `api/employees.ts` |
| DTO / Request | `DepartmentDto`, `DepartmentRequest`, `EmployeeDto`, `EmployeeRequest` | `DepartmentRequest`, `EmployeeRequest`, `EmployeeFormValues` |
| Controller/Handler | `DepartmentsController`, `EmployeesController` | (trang là nơi xử lý sự kiện) |
| Service/UseCase | `IDepartmentService`/`DepartmentService`, `IEmployeeService`/`EmployeeService` | `useDepartmentDelete.tsx` |
| Repository/DAO | `Platform/Data/AppDbContext.cs` (không có repository riêng) | `api/client.ts`, `api/departments.ts`, `api/employees.ts` |
| Configuration | `Program.cs`, `*Configuration.cs` (bảng EF), `CorsSetup.cs`, `StartupChecks.cs`, `appsettings*.json`, `launchSettings.json`, csproj, slnx | `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `package.json`, `.env.development`, `vite-env.d.ts` |
| Middleware | `SecurityHeaders.cs`, `ProblemDetailsExceptionHandler.cs`, `StatusCodeProblemWriter.cs`, `ValidationResponseFactory.cs` | – |
| Utility/Helper | `TextInput.cs`, `ErrorMapper.cs`, `ErrorTitles.cs`, `DomainError.cs`, `DbConstraintNames.cs` | `utils/normalizeText.ts`, `utils/parseId.ts`, `components/splitErrors.ts`, `validateDepartment.ts`, `validateEmployee.ts`, `hooks/*` |
| UI component | – | `components/*.tsx`, `pages/**/*.tsx`, `App.tsx`, `main.tsx` |
| Migration | `Migrations/*` | – |
| Test | `EmployeeCrud.Api.Tests/**` (6 file test + 7 file hỗ trợ) | không có |
| Static/Asset | – | `index.html`, `public/favicon.svg`, `styles/*.css` |
| Tài liệu / công cụ | `EmployeeCrud.Api.http`, `docs/*`, `README.md`, `dotnet-tools.json`, `.editorconfig`, `.gitignore` | `.prettierignore`, `frontend/.gitignore` |

## Mẫu code đang dùng

### Backend (C#)

- Thư mục theo tính năng; mỗi tính năng: `Entity` + `IEntityTypeConfiguration` (snake_case khai tay bằng `ToTable`/`HasColumnName`) + `Request` (lớp, DataAnnotations `[Required]`) + `Dto` (`record`) + `I…Service` + `…Service` + `…Controller`.
- Primary constructor cho DI (`DepartmentService(AppDbContext db)`), file-scoped namespace, `Nullable` bật, `ImplicitUsings`.
- Controller mỏng: `[ApiController]`, `[Route("api/...")]`, `[Produces("application/json")]`, `ProducesResponseType<T>` cho OpenAPI, route `{id:int}`, `CreatedAtAction` cho 201.
- Service: chuẩn hóa → kiểm → hỏi database → lưu → đọc lại DTO; đọc chỉ-đọc dùng `AsNoTracking`; đổi DTO bằng `Expression<Func<Employee, EmployeeDto>>` để EF dịch thành JOIN.
- Lỗi nghiệp vụ: `throw DomainError.Validation/NotFound/Conflict(...)`; bắt `DbUpdateConcurrencyException` và `DbUpdateException` có `PostgresException` (so `SqlState` + `ConstraintName`) bằng pattern matching.
- Hằng câu báo tiếng Việt `public const string` trong service và `ErrorTitles`; Request tham chiếu chính các hằng đó.
- Test: mỗi test một database InMemory (tên Guid); `DbContext` con ghi đè `SaveChangesAsync` để giả lập lỗi chen nhau; `WebApplicationFactory<Program>` môi trường `Testing`; đánh số ca bằng comment `// #n`.

### Frontend (TypeScript/React)

- Function component, không có class component; không store toàn cục; địa chỉ trang là nguồn trạng thái tìm/lọc.
- Tải dữ liệu trong `useEffect` với `AbortController`; kết quả gắn "khóa" (`requestKey`/`reloadKey`) để bỏ kết quả cũ; `reloadKey` tăng để tải lại.
- `useSubmitGuard` (cờ `useRef` + state) chặn bấm đúp; `hasLeftFormRef` chặn điều hướng khi đã rời form.
- `FormField` dạng render-prop truyền `id` và `aria-*`; `ErrorSummary` + focus có kiểm soát (WCAG); `ConfirmDialog` dùng `<dialog>` gốc.
- Route sửa/chi tiết bọc component có `key` theo id để tạo mới form khi đổi id.
- Lời báo thành công truyền qua `navigate(..., { state: { message } })`, `Toast` đọc rồi xóa khỏi lịch sử.
- CSS thuần, biến thiết kế trong `tokens.css`, đặt tên kiểu BEM (`panel__header`, `btn--primary`).

## Quy ước đặt tên

- C#: PascalCase cho kiểu, method, property; `_camelCase` cho field private; hậu tố `Async`; interface tiền tố `I` (kiểm bằng `.editorconfig`).
- TypeScript: component PascalCase (`.tsx`), hàm/biến camelCase, hằng UPPER_SNAKE (`TIMEOUT_MS`, `FULL_NAME_MAX_LENGTH`); file không JSX là `.ts`.
- Database: bảng, cột, ràng buộc viết thường `snake_case` (`ux_`, `ix_`, `fk_`); khóa chính giữ tên EF mặc định `PK_departments`, `PK_employees`.
- API: đường dẫn chữ thường số nhiều; JSON camelCase; khóa lỗi `errors` camelCase, `body` cho lỗi cả thân.
- `data-testid` có sẵn trên phần tử tương tác (`employee-save`, `department-delete-{id}`…); trong repo không có bộ test giao diện tự động nào dùng chúng.
