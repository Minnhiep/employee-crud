# Code Structure: employee-crud

## Cây thư mục (chỉ phần người viết, bỏ build output, phụ thuộc và bộ cài AI-DLC)

```text
employee-crud/
├── README.md, .gitignore, .gitattributes, .editorconfig, dotnet-tools.json
├── backend/
│   ├── EmployeeCrud.slnx
│   ├── EmployeeCrud.Api/
│   │   ├── Program.cs, EmployeeCrud.Api.csproj, EmployeeCrud.Api.http
│   │   ├── appsettings.json, appsettings.Development.json, Properties/launchSettings.json
│   │   ├── Departments/   Department, DepartmentConfiguration, DepartmentDto, DepartmentRequest,
│   │   │                  IDepartmentService, DepartmentService, DepartmentsController
│   │   ├── Employees/     Employee, EmployeeConfiguration, EmployeeDto, EmployeeRequest,
│   │   │                  IEmployeeService, EmployeeService, EmployeesController
│   │   ├── Migrations/    20261101183552_CreateDepartments(.Designer).cs,
│   │   │                  20261102083152_CreateEmployees(.Designer).cs, AppDbContextModelSnapshot.cs
│   │   └── Platform/      StartupChecks.cs
│   │       ├── Cors/      CorsSetup.cs
│   │       ├── Data/      AppDbContext.cs
│   │       ├── Errors/    DbConstraintNames, DomainError, ErrorMapper, ErrorTitles,
│   │       │              ProblemDetailsExceptionHandler, StatusCodeProblemWriter, ValidationResponseFactory
│   │       ├── Security/  SecurityHeaders.cs
│   │       └── Text/      TextInput.cs
│   └── EmployeeCrud.Api.Tests/
│       ├── EmployeeCrud.Api.Tests.csproj
│       ├── Departments/DepartmentServiceTests.cs
│       ├── Employees/EmployeeServiceTests.cs
│       ├── Platform/      ErrorMapperTests, PipelineTests, SecurityTests, LoggingTests,
│       │                  PlatformWebAppFactory, LogCapturingWebAppFactory, TestOnlyController
│       └── TestSupport/   TestDb, ThrowingAppDbContext, SeedBeforeSaveThenFailContext,
│                          RemoveDepartmentBeforeSaveContext
├── frontend/
│   ├── package.json, package-lock.json, tsconfig.json, vite.config.ts, eslint.config.js
│   ├── index.html, .env.development, .gitignore, .prettierignore, public/favicon.svg
│   └── src/
│       ├── main.tsx, App.tsx, vite-env.d.ts
│       ├── api/           client.ts, departments.ts, employees.ts
│       ├── components/    AppLayout, NavMenu, PageHeader, DataTable, StatusMessage, Toast,
│       │                  ConfirmDialog, ErrorSummary, FormField, SearchBox, Icon, splitErrors.ts
│       ├── hooks/         usePageTitle.ts, useSubmitGuard.ts
│       ├── pages/         NotFoundPage.tsx
│       │   ├── departments/  DepartmentsPage, DepartmentDetailPage, DepartmentFormPage,
│       │   │                 useDepartmentDelete.tsx, validateDepartment.ts
│       │   └── employees/    EmployeesPage, EmployeeFormPage, validateEmployee.ts
│       ├── utils/         normalizeText.ts, parseId.ts
│       ├── styles/        tokens.css, base.css, components.css
│       └── assets/        (rỗng)
└── docs/
    ├── ke-hoach.md, danh-sach-api.md, so-do-database.md, du-lieu-mau.sql
    └── tim-hieu-technical-stack/  00 … 07 (tài liệu tự học, bản nháp viết trước khi làm bài)
```

## Phân loại file

| Loại | File |
|---|---|
| Model/Entity | `Departments/Department.cs`, `Employees/Employee.cs`; DTO/record: `DepartmentDto.cs`, `EmployeeDto.cs`; request: `DepartmentRequest.cs`, `EmployeeRequest.cs`; kiểu TS: `api/departments.ts`, `api/employees.ts` |
| Controller | `DepartmentsController.cs`, `EmployeesController.cs` (test: `TestOnlyController.cs`) |
| Service | `DepartmentService.cs`, `EmployeeService.cs` + hai interface |
| Repository/DAO | Không có lớp riêng: service dùng thẳng `AppDbContext` (`Platform/Data/AppDbContext.cs`) và cấu hình bảng `*Configuration.cs` |
| Utility | `Platform/Text/TextInput.cs`, `Platform/Errors/ErrorMapper.cs`, `ErrorTitles.cs`, `DbConstraintNames.cs`, `DomainError.cs`; frontend `utils/normalizeText.ts`, `utils/parseId.ts`, `components/splitErrors.ts`, `pages/*/validate*.ts` |
| Configuration | `Program.cs`, `appsettings*.json`, `launchSettings.json`, `Platform/Cors/CorsSetup.cs`, `Platform/StartupChecks.cs`, `vite.config.ts`, `tsconfig.json`, `.env.development` |
| Middleware | `Platform/Security/SecurityHeaders.cs`, `ProblemDetailsExceptionHandler.cs`, `StatusCodeProblemWriter.cs`, `ValidationResponseFactory.cs` |
| Test | toàn bộ `backend/EmployeeCrud.Api.Tests/` |
| Migration | `Migrations/*.cs` (2 migration + snapshot do EF sinh, có SQL viết tay cho chỉ mục `lower(...)`) |
| Static/Asset | `frontend/src/styles/*.css`, `frontend/public/favicon.svg`, `frontend/index.html`, `components/Icon.tsx` (SVG vẽ tay) |
| UI page/hook | `pages/**/*.tsx`, `hooks/*.ts`, `components/*.tsx`, `App.tsx`, `main.tsx` |
| Tài liệu | `README.md`, `docs/*`, `EmployeeCrud.Api.http` |

## Mẫu code lặp lại

- **Backend theo thư mục nghiệp vụ**: mỗi nghiệp vụ tự khai entity, `IEntityTypeConfiguration` (tên bảng, cột snake_case khai tay), DTO là `record`, request là class có `string?` + `[Required]`, service dùng primary constructor, controller `[ApiController]` + `[Produces("application/json")]` + `[ProducesResponseType]`.
- **Lỗi bằng exception có loại**: service ném `DomainError.NotFound/Validation/Conflict`; không trả `Result`.
- **Hằng câu báo**: câu tiếng Việt là `public const` trong service hoặc `ErrorTitles`, test so đúng câu đó.
- **Trang React một khuôn**: `usePageTitle` + `PageHeader` → `Toast` → khung `actionError` → `section.panel` với `StatusMessage` (loading/error/empty) và `DataTable`; kết quả tải gắn "khóa" (`LoadResult.key`) để bỏ kết quả cũ; `reloadKey` để tải lại; `headingFocusRequest` để đưa focus về `h1` sau hành động.
- **Form một khuôn**: `values`/`touched`/`fieldErrors`/`summaryMessages`, kiểm khi rời ô và khi gõ (sau khi đã chạm), `useSubmitGuard`, `hasLeftFormRef` để không chuyển trang khi người dùng đã rời form, `returnTo`/`listPath` đọc từ `location.state` có kiểm dạng.
- **Comment tiếng Việt giải thích "vì sao"** ở hầu hết khối không hiển nhiên; tên code tiếng Anh.

## Đồ thị phụ thuộc trong code

- Backend: `Program` → mọi thành phần `Platform.*`, hai service; `*Controller` → `I*Service`; `EmployeeService` → `IDepartmentService`, `AppDbContext`, `TextInput`, `DomainError`, `ErrorTitles`, `DbConstraintNames`, `EmployeeConfiguration`; `DepartmentService` → `AppDbContext`, `TextInput`, `DomainError`, `ErrorTitles`, `DbConstraintNames`, `DepartmentConfiguration`; `ErrorMapper` → `DomainError`, `ErrorTitles`, `DbConstraintNames` (không phụ thuộc ngược vào nghiệp vụ); `ProblemDetailsExceptionHandler` → `ErrorMapper`, `CorsSetup`. Không có vòng tham chiếu giữa file.
- Frontend: `pages/*` → `api/*` → `api/client.ts`; `pages/*` → `components/*`, `hooks/*`, `utils/*`; `validate*.ts` → `utils/normalizeText.ts`; `components/*` không gọi API. Không có vòng import.
