# Developer Code Scan: employee-crud

Ngày quét: 2026-11-09T07:01:08Z. Commit gốc của snapshot: `9ebab38027119cd8d484b68a5345f080d1ab5229`. Phạm vi: quét lại toàn bộ repo (`./`). Scan chỉ đọc code, không chạy test, build hay chương trình nào.

## Developer Code Scan Results

### Scan Coverage
- **Analyzed deeply**:
  - `.gitignore` (phần của dự án, sau khối AI-DLC)
  - `.editorconfig`
  - `dotnet-tools.json`
  - `README.md`
  - `backend/EmployeeCrud.slnx`
  - `backend/EmployeeCrud.Api/` (`Program.cs`, `EmployeeCrud.Api.csproj`, `appsettings.json`, `appsettings.Development.json`, `Properties/launchSettings.json`, `EmployeeCrud.Api.http`, toàn bộ `Departments/`, `Employees/`, `Platform/`, hai migration viết tay trong `Migrations/`)
  - `backend/EmployeeCrud.Api.Tests/` (`EmployeeCrud.Api.Tests.csproj`, toàn bộ `TestSupport/` và `Platform/`; ở `Departments/` và `Employees/`: phần dựng, mọi tên ca test và mọi `[InlineData]`)
  - `frontend/` (`package.json`, `.prettierignore`, `.gitignore`, `.env.development`, `tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `index.html`; `package-lock.json` chỉ tra phiên bản đã khóa)
  - `frontend/src/` (mọi file `.ts`/`.tsx`, `styles/tokens.css`, `styles/base.css`)
  - `docs/ke-hoach.md`, `docs/so-do-database.md`
- **Skimmed only**:
  - `backend/EmployeeCrud.Api/Migrations/*.Designer.cs`, `backend/EmployeeCrud.Api/Migrations/AppDbContextModelSnapshot.cs` (EF Core sinh tự động; chỉ tra `ProductVersion` và pragma)
  - Thân từng ca test trong `backend/EmployeeCrud.Api.Tests/Departments/DepartmentServiceTests.cs` và `backend/EmployeeCrud.Api.Tests/Employees/EmployeeServiceTests.cs`
  - `frontend/src/styles/components.css` (đọc theo tiêu đề mục và quy tắc `.table__link`)
  - `frontend/public/favicon.svg`
  - `docs/danh-sach-api.md` (mục lục và phần quy ước chung), `docs/du-lieu-mau.sql` (chú thích và cấu trúc câu lệnh)
  - `docs/tim-hieu-technical-stack/` (tài liệu tự học, đọc theo tiêu đề; không phải code)
- **Left out**:
  - `.git/`
  - `backend/EmployeeCrud.Api/bin/`, `backend/EmployeeCrud.Api/obj/`
  - `backend/EmployeeCrud.Api.Tests/bin/`, `backend/EmployeeCrud.Api.Tests/obj/`
  - `backend/TestResults/`, `backend/EmployeeCrud.Api.Tests/TestResults/`
  - `frontend/node_modules/`, `frontend/dist/`
  - `.playwright-mcp/`
  - Phần cài đặt của AI-DLC: `.claude/`, `aidlc/`, khối `# BEGIN AI-DLC:gitignore` … `# END AI-DLC:gitignore` trong `.gitignore`

### Packages Found
- `EmployeeCrud.Api` — ASP.NET Core Web API (`Microsoft.NET.Sdk.Web`, `net10.0`) — C# — backend REST JSON: Controller → Service → EF Core → PostgreSQL
- `EmployeeCrud.Api.Tests` — project test xUnit (`Microsoft.NET.Sdk`, `net10.0`) — C# — unit test hai service, test lớp nền (lỗi, CORS, header bảo mật, log) bằng `WebApplicationFactory<Program>`
- `employee-crud-frontend` — gói npm riêng tư, SPA Vite — TypeScript + React — giao diện quản lý nhân viên, phòng ban
- Tool manifest `dotnet-tools.json` ở gốc repo — công cụ .NET cục bộ: `dotnet-ef`, `reportgenerator`

### Build System
- **Type**: dotnet/MSBuild (solution dạng mới `.slnx`) cho backend; npm + Vite + `tsc` cho frontend. Không có Docker, Makefile hay CI.
- **Config Files**: `backend/EmployeeCrud.slnx`, `backend/EmployeeCrud.Api/EmployeeCrud.Api.csproj`, `backend/EmployeeCrud.Api.Tests/EmployeeCrud.Api.Tests.csproj`, `dotnet-tools.json`, `.editorconfig`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`, `frontend/eslint.config.js`, `frontend/.prettierignore`, `.gitignore`, `frontend/.gitignore`
- **Build Dependencies**:
  - `EmployeeCrud.Api.Tests` → `EmployeeCrud.Api` (`ProjectReference`)
  - Frontend → backend: chỉ qua HTTP lúc chạy (không phụ thuộc lúc build), nhưng script `verify` và `coverage` của `frontend/package.json` gọi `dotnet format` / `dotnet test` / `dotnet tool run reportgenerator` trên `../backend/EmployeeCrud.slnx`
- **Script npm** (`frontend/package.json`):
  - `format:check` = `prettier --check .` (dòng 15)
  - `verify` = `npm run typecheck && npm run lint && npm run format:check && npm run build && dotnet format ../backend/EmployeeCrud.slnx --verify-no-changes && dotnet test ../backend/EmployeeCrud.slnx` (dòng 17). Các bước nối bằng `&&` nên dừng ở bước hỏng đầu tiên.
  - `coverage` = xóa `../backend/TestResults/coverage` → `dotnet test --collect:"XPlat Code Coverage"` → `dotnet tool run reportgenerator` (TextSummary + Html) → in `Summary.txt` (dòng 18)
- **Đầu dòng (line endings) và định dạng**:
  - Không có file `.gitattributes` ở bất kỳ đâu trong repo.
  - Không có cấu hình Prettier (`.prettierrc*`, `prettier.config.*`, khóa `"prettier"` trong `package.json`): Prettier 3 chạy theo mặc định, trong đó `endOfLine` là `"lf"`.
  - `frontend/.prettierignore` chỉ có `dist`, `node_modules`, `package-lock.json`.
  - `.editorconfig`: `[*]` chỉ có `indent_style = space`; không khai `end_of_line`, không khai `charset`; `[*.cs]` đặt `insert_final_newline = false`.
  - Trên máy này `core.autocrlf=true`, đặt ở cấu hình hệ thống `C:/Program Files/Git/etc/gitconfig` (mặc định của Git for Windows), không phải trong repo.
  - `git diff` báo "LF will be replaced by CRLF the next time Git touches it" cho hai file test đang sửa: working tree hiện tại đang là LF, lần Git ghi lại file (checkout, restore) sẽ đổi sang CRLF.

### APIs Discovered
- REST JSON — `backend/EmployeeCrud.Api/Departments/DepartmentsController.cs` (`/api/departments`) — 5 endpoint (GET danh sách, GET theo id, POST, PUT, DELETE)
- REST JSON — `backend/EmployeeCrud.Api/Employees/EmployeesController.cs` (`/api/employees`) — 5 endpoint (GET danh sách có `?search=` và `?departmentId=`, GET theo id, POST, PUT, DELETE)
- Tài liệu API — `backend/EmployeeCrud.Api/Program.cs` — `/openapi/v1.json` và Swagger UI `/swagger`, chỉ ở môi trường Development
- Controller chỉ có trong test — `backend/EmployeeCrud.Api.Tests/Platform/TestOnlyController.cs` (`/api/test-only`) — 7 action, chỉ đăng ký trong `PlatformWebAppFactory`
- HTTP client phía frontend — `frontend/src/api/` — 10 hàm gọi (5 phòng ban, 5 nhân viên) qua `client.ts`

### Frameworks & Libraries
- .NET / ASP.NET Core — `net10.0` — nền backend
- Microsoft.AspNetCore.OpenApi — 10.0.14 — sinh đặc tả OpenAPI
- Swashbuckle.AspNetCore.SwaggerUI — 10.3.1 — trang Swagger UI
- Microsoft.EntityFrameworkCore (+ `.Relational`, `.Design`) — 10.0.14 — ORM, migration
- Npgsql.EntityFrameworkCore.PostgreSQL — 10.0.3 — provider PostgreSQL
- xunit — 2.9.3; xunit.runner.visualstudio — 3.1.4; Microsoft.NET.Test.Sdk — 17.14.1 — chạy test
- Microsoft.AspNetCore.Mvc.Testing — 10.0.14 — dựng ứng dụng trong bộ nhớ cho test
- Microsoft.EntityFrameworkCore.InMemory — 10.0.14 — database giả cho unit test
- coverlet.collector — 6.0.4 — đo độ phủ
- dotnet-ef — 10.0.14; dotnet-reportgenerator-globaltool — 5.5.12 — công cụ cục bộ
- react / react-dom — 19.3.1 (khóa) — giao diện
- react-router — 8.5.1 (khóa) — định tuyến phía trình duyệt
- vite — 8.3.5; @vitejs/plugin-react — 6.1.2 — dev server, đóng gói
- typescript — 6.0.3 — kiểm kiểu (`noEmit`)
- eslint — 10.14.0; typescript-eslint — 8.72.1; @eslint/js ^10.0.1; eslint-plugin-react-hooks ^7.1.1; eslint-plugin-react-refresh ^0.5.7; globals ^17.14.0 — lint
- prettier — 3.9.10 — định dạng frontend
- PostgreSQL — 18 (README; máy làm bài 18.6) — database

### Test Coverage
- **Test Directories**: `backend/EmployeeCrud.Api.Tests/Departments/`, `backend/EmployeeCrud.Api.Tests/Employees/`, `backend/EmployeeCrud.Api.Tests/Platform/`, `backend/EmployeeCrud.Api.Tests/TestSupport/` (lớp hỗ trợ, không chứa ca test)
- **Test Frameworks**: xUnit 2.9.3, `WebApplicationFactory` (Mvc.Testing), EF Core InMemory
- **Số ca test (đếm tĩnh, không chạy)**: 106 `[Fact]` + 13 `[Theory]` với 42 bộ `[InlineData]` = 148 ca. Theo file: `DepartmentServiceTests` 45, `EmployeeServiceTests` 75, `ErrorMapperTests` 12, `PipelineTests` 9, `SecurityTests` 5, `LoggingTests` 2.
- **Coverage Config**: có. `coverlet.collector` trong project test, `reportgenerator` trong `dotnet-tools.json`, script `npm run coverage`. Không có `.runsettings`; mức sàn 80% dòng của lớp service chỉ ghi trong README và `team.md`, không có cấu hình tự chặn khi thấp hơn.
- Frontend không có test tự động (đúng quy ước của nhóm).

### Code Quality Indicators
- **Linting**: ESLint flat config `frontend/eslint.config.js` (mẫu Vite + `typescript-eslint`, chạy với `--max-warnings 0`); TypeScript `strict` + `noUncheckedIndexedAccess` + `noUnused*` trong `frontend/tsconfig.json`; Prettier mặc định; C#: `.editorconfig` (quy ước .NET đầy đủ) + `dotnet format --verify-no-changes`; `Nullable` bật ở cả hai project.
- **CI/CD**: không có (không có `.github/`, không có file pipeline). `npm run verify` chạy tay trước khi commit thay cho CI.
- **Documentation**: `README.md` 16 mục (cài đặt, user-secrets, migration, chạy, test, sự cố, dữ liệu mẫu, tài khoản DB quyền tối thiểu, log). `docs/` có sơ đồ database (Mermaid ER), danh sách API kèm JSON mẫu, SQL dữ liệu mẫu, đề bài. Comment tiếng Việt và XML doc dày, giải thích "vì sao".

### Technical Debt Signals
- Không có `.gitattributes`: đầu dòng của file sau khi clone phụ thuộc `core.autocrlf` của từng máy. Trên Windows (mặc định `true`) file thành CRLF, trái với mặc định `endOfLine: "lf"` của Prettier (lỗi intent đã tái hiện).
- `.editorconfig` không khai `end_of_line`: không có nguồn quy định đầu dòng chung cho trình soạn thảo và `dotnet format`.
- README không nhắc tới đầu dòng hay `core.autocrlf`.
- 0 `TODO`/`FIXME`/`HACK`; 0 `eslint-disable`, `@ts-ignore`, `any`. Chỉ có `#pragma warning disable 612, 618` do EF Core sinh trong 3 file migration.
- Luật kiểm dữ liệu được chép tay ở hai phía, phải giữ khớp bằng tay: `frontend/src/utils/normalizeText.ts` ↔ `backend/EmployeeCrud.Api/Platform/Text/TextInput.cs`; `EMAIL_PATTERN` ↔ `EmployeeService.EmailPattern`; độ dài tối đa (100/254/100). Không có test nào so hai phía.
- File lớn: `frontend/src/pages/employees/EmployeeFormPage.tsx` 612 dòng, `frontend/src/pages/employees/EmployeesPage.tsx` 566 dòng, `frontend/src/styles/components.css` 1001 dòng.
- DTO yêu cầu tham chiếu hằng của service: `DepartmentRequest` → `DepartmentService.NameRequiredMessage`, `EmployeeRequest` → `EmployeeService.*Message`.
- `Platform/Data/AppDbContext.cs` tham chiếu `Departments`/`Employees`, còn hai thư mục đó tham chiếu `Platform.Data`: phụ thuộc hai chiều ở mức namespace (không phải vòng import lỗi).
- Unit test dùng InMemory nên không kiểm được chỉ mục `lower()`, khóa ngoại RESTRICT, thứ tự sắp xếp tiếng Việt (ghi rõ trong `TestSupport/TestDb.cs`); phần đó kiểm tay.
- Lúc quét, working tree có thay đổi chưa commit ở `backend/EmployeeCrud.Api.Tests/Platform/PlatformWebAppFactory.cs` và `backend/EmployeeCrud.Api.Tests/TestSupport/ThrowingAppDbContext.cs` (chỉ thêm comment).

## Handoff Summary
- **Intent-relevant finding**: Repo không có `.gitattributes` (tìm toàn repo, không thấy file nào); frontend không có cấu hình Prettier nên dùng mặc định `endOfLine: "lf"`; `frontend/package.json` dòng 15 `format:check: prettier --check .` là bước thứ ba của `verify` (dòng 17); `.editorconfig` không có `end_of_line`; máy này có `core.autocrlf=true` từ `C:/Program Files/Git/etc/gitconfig`. Ghép lại: clone mới trên Windows ra CRLF, `prettier --check` báo lỗi và `verify` dừng ở đó.
- **Risks / follow-up**:
  - Vì `verify` nối bằng `&&`, lần tái hiện dừng ở Prettier nên `npm run build`, `dotnet format --verify-no-changes` và `dotnet test` chưa hề chạy trên cây CRLF. Cách `dotnet format` đối xử với file `.cs` CRLF khi `.editorconfig` không khai `end_of_line` chưa được kiểm: cách sửa phải kiểm cả phía backend, không chỉ Prettier.
  - Intent báo 29 file frontend bị Prettier chê; đếm tĩnh thì có khoảng 39 file Prettier xử lý trong `frontend/` (34 file trong `src/` gồm `.ts`/`.tsx`/`.css`, cộng `index.html`, `package.json`, `tsconfig.json`, `eslint.config.js`, `vite.config.ts`). Chênh lệch chưa giải thích; Build and Test nên đối chiếu khi kiểm lại trên clone mới.
  - Working tree hiện tại đang là LF; mọi lệnh Git ghi lại file (`checkout`, `restore`, `stash`) trên máy này trước khi sửa sẽ đổi file sang CRLF và làm hỏng `verify` ngay trên máy làm bài.
  - Có hai file test sửa chưa commit (chỉ comment); vân tay của knowledge base tính cả hai file này.
  - Repo không có file nhị phân nào của dự án ngoài thư mục bị bỏ qua (`favicon.svg` là văn bản), nên quy tắc đầu dòng không đụng tới file nhị phân hiện có.
