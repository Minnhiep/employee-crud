# Kết quả quét code: employee-crud

Việc AI-DLC: `sua-ra-soat-ban-giao` (bugfix, độ sâu Minimal). Quét lại toàn bộ repo (`./`) ngày 2026-11-09, snapshot `head_commit` `3f62f3e05e3fde56dfdefb8ee0339536ed92a3d6`. Chỉ đọc file bằng công cụ đọc; không build, không chạy test hay chương trình nào. Lúc quét, mã nguồn (ngoài `aidlc/`) trùng với commit trên (`git status` chỉ có thay đổi trong `aidlc/`).

## Developer Code Scan Results

### Scan Coverage
- **Analyzed deeply**:
  - `backend/EmployeeCrud.Api/` (mọi file `.cs` gồm `Migrations/` với 2 file `Designer.cs` và `AppDbContextModelSnapshot.cs`; `EmployeeCrud.Api.csproj`; `appsettings.json`; `appsettings.Development.json`; `Properties/launchSettings.json`; `EmployeeCrud.Api.http`)
  - `backend/EmployeeCrud.Api.Tests/` (`EmployeeCrud.Api.Tests.csproj`, `Departments/`, `Employees/`, `Platform/`, `TestSupport/`)
  - `backend/EmployeeCrud.slnx`
  - `frontend/src/` (`api/`, `components/`, `hooks/`, `pages/`, `utils/`, `styles/`, `App.tsx`, `main.tsx`, `vite-env.d.ts`; `assets/` rỗng)
  - `frontend/public/favicon.svg`
  - `frontend/package.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`, `frontend/eslint.config.js`, `frontend/index.html`, `frontend/.env.development`, `frontend/.gitignore`, `frontend/.prettierignore`
  - `README.md`, `.gitignore` (phần của dự án), `.gitattributes`, `.editorconfig`, `dotnet-tools.json`
  - `docs/danh-sach-api.md`, `docs/so-do-database.md`, `docs/du-lieu-mau.sql`, `docs/ke-hoach.md`
  - `docs/tim-hieu-technical-stack/00-tong-quan-luong.md`, `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md`
- **Skimmed only**:
  - `frontend/package-lock.json` (chỉ đọc phiên bản đã khóa của các gói trực tiếp)
  - `docs/tim-hieu-technical-stack/01-react.md` đến `06-cai-dat-moi-truong.md` (đọc tiêu đề mục và banner "bản nháp học"; đọc kỹ riêng `04-postgresql.md` mục 9 vì `07` trỏ tới đó)
- **Left out**:
  - `.git/`
  - `.claude/`, `aidlc/` (bộ cài và hồ sơ AI-DLC; chỉ đọc `aidlc/spaces/default/intents/261109-kiem-cuoi-crlf/ra-soat-ban-giao.md` làm bối cảnh), khối `BEGIN/END AI-DLC:gitignore` trong `.gitignore`
  - `backend/EmployeeCrud.Api/bin/`, `backend/EmployeeCrud.Api/obj/`, `backend/EmployeeCrud.Api.Tests/bin/`, `backend/EmployeeCrud.Api.Tests/obj/` (build output cạnh `.csproj`)
  - `backend/TestResults/`, `backend/EmployeeCrud.Api.Tests/TestResults/` (bị `.gitignore` bỏ qua; chứa bản clone thử và báo cáo)
  - `frontend/node_modules/`, `frontend/dist/`
  - `.playwright-mcp/` (log công cụ kiểm trình duyệt, bị `.gitignore` bỏ qua)

### Packages Found
- `EmployeeCrud.Api` — ASP.NET Core Web API (`Microsoft.NET.Sdk.Web`) — C# `net10.0`, nullable bật — backend: controller → service → DTO, EF Core + Npgsql, migration
- `EmployeeCrud.Api.Tests` — project test xUnit (`Microsoft.NET.Sdk`) — C# `net10.0` — unit test 2 service trên EF Core InMemory và test phần nền (pipeline, lỗi, CORS, header, log) bằng `WebApplicationFactory<Program>`
- `employee-crud-frontend` — SPA Vite (`"type": "module"`, `private`) — TypeScript strict + React 19 — giao diện quản lý nhân viên và phòng ban
- Gốc repo — tool manifest `dotnet-tools.json` (công cụ cục bộ: `dotnet-ef` 10.0.14, `dotnet-reportgenerator-globaltool` 5.5.12)

### Build System
- **Type**: .NET SDK / MSBuild (solution dạng `.slnx`) cho backend; npm + Vite 8 + `tsc` (chỉ kiểm kiểu, `noEmit`) cho frontend
- **Config Files**: `backend/EmployeeCrud.slnx`, `backend/EmployeeCrud.Api/EmployeeCrud.Api.csproj`, `backend/EmployeeCrud.Api.Tests/EmployeeCrud.Api.Tests.csproj`, `dotnet-tools.json`, `.editorconfig`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`, `frontend/eslint.config.js`, `frontend/.prettierignore`, `.gitattributes`
- **Build Dependencies**: `EmployeeCrud.Api.Tests` → `EmployeeCrud.Api` (`ProjectReference`); frontend → backend chỉ qua HTTP (không phụ thuộc lúc build); script `verify` và `coverage` trong `frontend/package.json` gọi `dotnet format`/`dotnet test` trên `../backend/EmployeeCrud.slnx`. Không có `global.json` (SDK không bị ghim).

### APIs Discovered
- REST JSON — `backend/EmployeeCrud.Api/Departments/DepartmentsController.cs` — 5 endpoint (`GET`, `GET {id:int}`, `POST`, `PUT {id:int}`, `DELETE {id:int}` dưới `/api/departments`)
- REST JSON — `backend/EmployeeCrud.Api/Employees/EmployeesController.cs` — 5 endpoint (như trên, dưới `/api/employees`; `GET` nhận `?search=` và `?departmentId=` dạng chuỗi)
- OpenAPI — `backend/EmployeeCrud.Api/Program.cs:58-64` — `/openapi/v1.json` và Swagger UI `/swagger`, chỉ ở môi trường Development
- Route chỉ có trong test — `backend/EmployeeCrud.Api.Tests/Platform/TestOnlyController.cs` — 6 route dưới `/api/test-only` (`throw`, `ok`, `slow`, `conflict`, `validate`, `validate-produces-json`, `validate-html`; 7 action)
- Client HTTP phía giao diện — `frontend/src/api/client.ts` (hàm `apiGet/apiPost/apiPut/apiDelete`, lớp `ApiError`), `frontend/src/api/departments.ts` (5 hàm), `frontend/src/api/employees.ts` (5 hàm)

### Frameworks & Libraries
- .NET / ASP.NET Core — `net10.0` — nền backend
- Microsoft.AspNetCore.OpenApi — 10.0.14 — sinh đặc tả OpenAPI
- Swashbuckle.AspNetCore.SwaggerUI — 10.3.1 — trang Swagger UI đọc `/openapi/v1.json`
- Microsoft.EntityFrameworkCore / .Relational / .Design — 10.0.14 — ORM, migration
- Npgsql.EntityFrameworkCore.PostgreSQL — 10.0.3 — provider PostgreSQL
- xUnit 2.9.3, xunit.runner.visualstudio 3.1.4, Microsoft.NET.Test.Sdk 17.14.1 — chạy test
- Microsoft.AspNetCore.Mvc.Testing 10.0.14 — `WebApplicationFactory` cho test pipeline
- Microsoft.EntityFrameworkCore.InMemory 10.0.14 — database giả cho unit test service
- coverlet.collector 6.0.4 + reportgenerator 5.5.12 — đo và in độ phủ
- React / React DOM — 19.3.1 (khóa trong lockfile) — giao diện
- React Router — 8.5.1 — định tuyến phía trình duyệt (`BrowserRouter`)
- Vite 8.3.5 + @vitejs/plugin-react 6.1.2 — dev server, đóng gói
- TypeScript 6.0.3 — kiểm kiểu strict
- ESLint 10.14.0 + typescript-eslint 8.72.1 + eslint-plugin-react-hooks ^7.1.1 + eslint-plugin-react-refresh ^0.5.7 — lint
- Prettier 3.9.10 — định dạng (cấu hình mặc định)
- PostgreSQL 18 (chạy trên máy, theo README) — database

### Test Coverage
- **Test Directories**: `backend/EmployeeCrud.Api.Tests/Departments/`, `backend/EmployeeCrud.Api.Tests/Employees/`, `backend/EmployeeCrud.Api.Tests/Platform/`, `backend/EmployeeCrud.Api.Tests/TestSupport/` (trợ giúp test). Đếm trong mã: 119 phương thức test, 148 ca khi tính cả `[InlineData]` (phòng ban 45, nhân viên 75, phần nền 28). Frontend không có test tự động (đúng quyết định trong `team.md`).
- **Test Frameworks**: xUnit; EF Core InMemory (mỗi test một database tên Guid, `TestSupport/TestDb.cs`); ba `AppDbContext` giả để tạo lỗi lúc lưu (`ThrowingAppDbContext`, `SeedBeforeSaveThenFailContext`, `RemoveDepartmentBeforeSaveContext`); `WebApplicationFactory<Program>` ở môi trường `Testing`
- **Coverage Config**: có `coverlet.collector` và script `npm run coverage` (coverlet + reportgenerator, kết quả ở `backend/TestResults/coverage-report/`); không có file `.runsettings`, không có ngưỡng tự động chặn khi dưới 80% (mức sàn 80% chỉ là quy ước trong `team.md`)

### Code Quality Indicators
- **Linting**: ESLint flat config ở `frontend/eslint.config.js` (js recommended, typescript-eslint recommended, react-hooks recommended-latest, react-refresh vite), chạy với `--max-warnings 0`; Prettier mặc định (không có `.prettierrc`, có `frontend/.prettierignore`); TypeScript strict + `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters` (`frontend/tsconfig.json`); C# theo `.editorconfig` (LF, quy ước đặt tên .NET) và `dotnet format --verify-no-changes` trong `npm run verify`; `.gitattributes` ép LF (`* text=auto eol=lf`)
- **CI/CD**: không có pipeline (cố ý: `project.md` cấm CI/CD); kiểm tay bằng `npm run verify` trước commit
- **Documentation**: `README.md` 16 mục (cài, user-secrets, migration, chạy, kiểm, sự cố, dữ liệu mẫu, tài khoản DB riêng, log); `docs/danh-sach-api.md`, `docs/so-do-database.md` (mermaid ER), `docs/du-lieu-mau.sql`; XML doc và comment tiếng Việt giải thích "vì sao" ở hầu hết file nguồn

### Technical Debt Signals
- Không có `TODO`/`FIXME`/`HACK`, `eslint-disable`, `@ts-ignore` trong mã nguồn; `#pragma warning disable 612, 618` chỉ có trong 3 file migration do EF sinh.
- Tìm theo email không phân biệt hoa thường chưa có test riêng: `EmployeeServiceTests.cs:103-111` tìm "MINH" khớp cả họ tên "Minh Le" lẫn email `minh@…`; `EmployeeServiceTests.cs:113-121` tìm email bằng chữ thường trên email lưu chữ thường. Bỏ `ToLower()` ở cột email (`EmployeeService.cs:88`) thì không test nào báo.
- Vế tham số so trùng dùng `ToLower()` phụ thuộc ngôn ngữ máy: `EmployeeService.cs:254`, `DepartmentService.cs:145`; chỗ tìm kiếm dùng `ToLowerInvariant()` (`EmployeeService.cs:86`). Comment `DepartmentService.cs:138-143` và `EmployeeService.cs:248-250` nói cả hai vế thành `lower()` trong SQL; chưa kiểm bằng log SQL thật.
- `ProblemDetailsExceptionHandler.cs:49-53` trả thẳng kết quả `TryWriteAsync`, không có đường ghi dự phòng khi dịch vụ ProblemDetails từ chối ghi (ví dụ `Accept` không nhận JSON).
- Không giới hạn kích thước body request: `Program.cs:14` chỉ tắt header `Server`; `ErrorMapper.cs:106-112` đã có câu cho 413.
- Thứ tự kiểm khác nhau giữa hai PUT: `DepartmentService.cs:55-56` chuẩn hóa tên trước rồi mới tìm bản ghi; `EmployeeService.cs:133-135` tìm trước rồi mới kiểm.
- Test trùng: `DepartmentServiceTests.cs:261-274` (#18) và `:414-425` (D9) cùng dữ liệu, cùng lỗi giả, cùng khẳng định; comment #18 ghi "Còn nhân viên" nhưng không nạp nhân viên nào.
- Câu hướng dẫn xưng "anh": `StartupChecks.cs:15`; test chỉ so chuỗi con `ConnectionStrings:Default` (`PipelineTests.cs:164`).
- Không có `global.json`; `README.md:18` ghi ".NET SDK 10.0 trở lên" trong khi app cần runtime `net10.0`.
- Frontend, khung tóm tắt lỗi hiện trước khi bấm Lưu: `handleBlur` đặt lỗi (`EmployeeFormPage.tsx:274-283`, `DepartmentFormPage.tsx:146-155`) và `ErrorSummary` hiện mọi lỗi theo ô kèm `role="alert"` và tiêu đề "Chưa lưu được…" (`ErrorSummary.tsx:28-41`).
- `Toast` được đặt riêng ở từng trang (`DepartmentsPage.tsx:153`, `DepartmentDetailPage.tsx:192`, `EmployeesPage.tsx:346`) nên vùng `role="status"` ra đời cùng lúc với chữ; `Toast.tsx:35` ép kiểu `location.state` mà không kiểm `message` là chuỗi.
- Vùng báo "phòng ban đã chọn không còn" luôn có trong trang (`EmployeesPage.tsx:359-374`) nhưng mang class `.alert`, mà `.alert:empty { display: none }` (`components.css:699-701`).
- Xóa phòng ở trang chi tiết: `navigate("/departments", …)` không `replace` (`DepartmentDetailPage.tsx:121-126`); `useDepartmentDelete.tsx:38-47` không kiểm người dùng đã rời trang.
- Nút Lưu dùng `disabled` (`EmployeeFormPage.tsx:597-601`, `DepartmentFormPage.tsx:337-341`) trong khi nút Hủy dùng `aria-disabled`; nút Lưu nhân viên không khóa khi phòng ban đang `loading` lần đầu ở form thêm.
- Ô email `type="email"` (`EmployeeFormPage.tsx:481`).
- Class `app__content` không có CSS (`AppLayout.tsx:26`); mục gốc breadcrumb "Nhân sự" không phải liên kết ở mọi trang.
- Số 100/254 viết cứng trong câu báo (`EmployeeService.cs:28,31`, `DepartmentService.cs:18`, `validateEmployee.ts:42,51`, `validateDepartment.ts:22`) dù đã có hằng độ dài.
- Tài liệu lệch: `07-kiem-thu-va-demo.md:92` (D03) trỏ sơ đồ nháp `04-postgresql.md` mục 9 (có `created_at`, `04-postgresql.md:179`); `07-kiem-thu-va-demo.md:138` gợi ý "xử lý `DbUpdateException`, kiểm thử tự động" là việc đã làm; `07` chưa có ca kiểm tay cho thêm/xóa phòng ban, tên trùng 409, lọc theo phòng; `README.md:167` nhắc "D1–D5 trong hồ sơ kiểm thử" không có đường dẫn; `EmployeeCrud.Api.http:65-73` (#9) `PUT /api/employees/1` ghi đè dữ liệu có sẵn.
- `.gitignore` của dự án (dòng 29-48) chưa có `*.log`, `.idea/`, `http-client.private.env.json` (`frontend/.gitignore` có `*.log`, `.idea`).
- `.editorconfig:323` khai `type_parameters.applicable_kinds = namespace` (lỗi của mẫu sinh tự động); hai luật đặt tên field private static (`s_camelCase`, dòng 249-251) và private static readonly (PascalCase, dòng 265-267) chồng nhau; đều ở mức `suggestion`.

## Handoff Summary
- **Intent-relevant finding**: Việc sửa chạm ba vùng. (1) Test bắt buộc theo `team.md` còn thiếu: không ca nào chứng minh tìm theo email không phân biệt hoa thường (`backend/EmployeeCrud.Api.Tests/Employees/EmployeeServiceTests.cs:103-121`; mã ở `backend/EmployeeCrud.Api/Employees/EmployeeService.cs:86-88`). (2) Backend: `EmployeeService.cs:248-255`, `DepartmentService.cs:138-146` (`ToLower()` và comment), `ProblemDetailsExceptionHandler.cs:49-53`, `Program.cs:14`, `StartupChecks.cs:15`, `DepartmentServiceTests.cs:261-274` và `:414-425`. (3) Frontend và tài liệu: `ErrorSummary.tsx`, `EmployeeFormPage.tsx`, `DepartmentFormPage.tsx`, `Toast.tsx` (đặt ở 3 trang), `EmployeesPage.tsx:359-374`, `DepartmentDetailPage.tsx:121-126`, `components.css:699-701`; `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md:92,138`, `README.md:18,167`, `docs/danh-sach-api.md`, `backend/EmployeeCrud.Api/EmployeeCrud.Api.http:65-73`, `.gitignore`.
- **Risks / follow-up**: Câu báo lỗi tiếng Việt được chép ở nhiều nơi (hằng trong service và `ErrorTitles.cs`, `validateEmployee.ts`, `validateDepartment.ts`, `docs/danh-sach-api.md`, câu khẳng định trong test): đổi một chỗ phải đổi đủ. `normalizeText.ts` và `TextInput.cs` phải giữ cùng luật; `EMAIL_PATTERN` (`validateEmployee.ts:16`) và `EmailPattern` (`EmployeeService.cs:44-46`) phải giống hệt. `docs/danh-sach-api.md:3` nói mọi ví dụ là kết quả gọi thật ngày 03/11, nên ví dụ mới cần gọi thật hoặc ghi rõ chưa gọi. Bỏ test trùng làm số ca giảm từ 148 (con số này nằm trong hồ sơ AI-DLC, không nằm trong README hay `docs/`). Hành vi SQL thật của `ToLower()` (B-2) và nhánh `TryWriteAsync` trả `false` (B-3) chỉ là suy luận, chưa tái hiện; theo `CLAUDE.md` của dự án và `ra-soat-ban-giao.md` mục 2, Smart App Control trên máy đang chặn `.dll` vừa build nên mọi sửa backend chưa kiểm được bằng `dotnet test` trên máy này.
