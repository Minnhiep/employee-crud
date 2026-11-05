# Kết quả quét code (Developer Scan)

Quét toàn repo, chỉ đọc code ở head_commit `67689354927fc28276fab61f60f42e2ae608a293`. Không chạy build, test hay chương trình nào của dự án. Chi tiết phát hiện nằm ở `code-quality-assessment.md` (mã `DB-`, `BE-`, `FE-`, `DOC-`); file này chỉ tham chiếu mã.

## Developer Code Scan Results

### Scan Coverage

- **Analyzed deeply**:
  - `README.md`
  - `.editorconfig`, `.gitignore`, `dotnet-tools.json`
  - `backend/EmployeeCrud.slnx`
  - `backend/EmployeeCrud.Api/` (toàn bộ file nguồn, cấu hình, migration; trừ 2 file `.Designer.cs` ghi ở dưới)
  - `backend/EmployeeCrud.Api.Tests/` (toàn bộ file nguồn)
  - `frontend/` (toàn bộ cấu hình, `public/`, `src/`; trừ `package-lock.json` ghi ở dưới)
  - `docs/` (toàn bộ, gồm `ke-hoach.md`, `danh-sach-api.md`, `so-do-database.md`, `du-lieu-mau.sql` và 8 file `tim-hieu-technical-stack/`)
- **Skimmed only**:
  - `backend/EmployeeCrud.Api/Migrations/20261101183552_CreateDepartments.Designer.cs` (file sinh tự động, chỉ Grep)
  - `backend/EmployeeCrud.Api/Migrations/20261102083152_CreateEmployees.Designer.cs` (file sinh tự động, chỉ Grep)
  - `frontend/package-lock.json` (chỉ Grep phiên bản đã khóa của các gói trực tiếp)
- **Left out**:
  - `backend/EmployeeCrud.Api/bin/`, `backend/EmployeeCrud.Api/obj/`
  - `backend/EmployeeCrud.Api.Tests/bin/`, `backend/EmployeeCrud.Api.Tests/obj/`
  - `backend/EmployeeCrud.Api.Tests/TestResults/`, `backend/TestResults/`
  - `frontend/node_modules/`, `frontend/dist/`
  - `.playwright-mcp/`

### Packages Found

- `EmployeeCrud.Api` — Web API (`Microsoft.NET.Sdk.Web`) — C# (.NET 10) — backend REST cho phòng ban và nhân viên
- `EmployeeCrud.Api.Tests` — test project — C# (.NET 10) — unit test service và test đường ống HTTP
- `employee-crud-frontend` — SPA (Vite) — TypeScript, React 19 — giao diện quản lý
- `docs/` — tài liệu — Markdown, SQL — bàn giao và tự học

### Build System

- **Type**: `dotnet` (solution `.slnx`) cho backend, npm + Vite + `tsc` cho frontend. Không có Makefile, Dockerfile hay file CI.
- **Config Files**: `backend/EmployeeCrud.slnx`, `backend/EmployeeCrud.Api/EmployeeCrud.Api.csproj`, `backend/EmployeeCrud.Api.Tests/EmployeeCrud.Api.Tests.csproj`, `dotnet-tools.json`, `.editorconfig`, `frontend/package.json`, `frontend/package-lock.json`, `frontend/tsconfig.json`, `frontend/vite.config.ts`, `frontend/eslint.config.js`, `frontend/.prettierignore`.
- **Build Dependencies**: `EmployeeCrud.Api.Tests` → `EmployeeCrud.Api` (ProjectReference). `frontend` không phụ thuộc project .NET lúc build; script `verify` và `coverage` của npm gọi thêm `dotnet` (`frontend/package.json:17-18`).

### APIs Discovered

- REST JSON — `backend/EmployeeCrud.Api/Departments/DepartmentsController.cs` — 5 endpoint
- REST JSON — `backend/EmployeeCrud.Api/Employees/EmployeesController.cs` — 5 endpoint
- OpenAPI + Swagger UI — `backend/EmployeeCrud.Api/Program.cs:58-63` — 2 trang, chỉ ở Development
- Controller chỉ có trong test — `backend/EmployeeCrud.Api.Tests/Platform/TestOnlyController.cs` — route `/api/test-only/*`, không có trong bản chạy thật

### Frameworks & Libraries

- ASP.NET Core — 10.0 (`net10.0`) — Web API
- Entity Framework Core — 10.0.14 — truy cập dữ liệu, migration
- Npgsql.EntityFrameworkCore.PostgreSQL — 10.0.3 — provider PostgreSQL
- Microsoft.AspNetCore.OpenApi — 10.0.14 — sinh đặc tả OpenAPI
- Swashbuckle.AspNetCore.SwaggerUI — 10.3.1 — trang Swagger UI
- React / React DOM — 19.3.1 — giao diện
- React Router — 8.5.1 — định tuyến phía trình duyệt
- Vite — 8.3.5 — dev server, đóng gói
- TypeScript — 6.0.3 — kiểu tĩnh, chế độ `strict`
- xUnit — 2.9.3 — framework test

Danh sách đầy đủ: `technology-stack.md`.

### Test Coverage

- **Test Directories**: `backend/EmployeeCrud.Api.Tests/` (`Departments/`, `Employees/`, `Platform/`, `TestSupport/`). Frontend không có test tự động, đúng `team.md`.
- **Test Frameworks**: xUnit 2.9.3, EF Core InMemory 10.0.14, `Microsoft.AspNetCore.Mvc.Testing` 10.0.14. Đếm tĩnh: 96 `[Fact]`, 13 `[Theory]` với 42 `[InlineData]`, tức 138 ca.
- **Coverage Config**: có công cụ (`coverlet.collector` 6.0.4, `reportgenerator` 5.5.12, script `coverage`), không có file ngưỡng (xem `BE-7`).

### Code Quality Indicators

- **Linting**: ESLint 10 (`frontend/eslint.config.js`, `--max-warnings 0`), Prettier 3 (mặc định), `tsc` strict, `.editorconfig` cho C#. `dotnet format` có quy ước nhưng chưa nằm trong `verify` (`BE-2`).
- **CI/CD**: không có file pipeline, đúng phạm vi đề bài.
- **Documentation**: `README.md` 259 dòng đủ cài đặt, chạy, sự cố; `docs/` có API và sơ đồ database; comment code tiếng Việt, giải thích "vì sao". Có lệch nhỏ (`DOC-1` đến `DOC-8`).

### Technical Debt Signals

- Không có `TODO`, `FIXME`, `HACK`, `eslint-disable`, `ts-ignore` trong code người viết. `#pragma warning disable` chỉ nằm trong 3 file migration sinh tự động.
- Chưa thấy bí mật trong file nguồn và `docs/`: Grep các từ khóa mật khẩu chỉ ra tên cấu hình và chuỗi hướng dẫn.
- U+FFFE lọt qua chuẩn hóa ở cả hai đầu: `BE-1`, `FE-1`.
- Thiếu kiểm định dạng C# trong `verify`, 8 file `.cs` trái `.editorconfig`: `BE-2`.
- Nút Hủy không khóa khi đang lưu: `FE-2`. Id lạ mở form sửa: `FE-3`.
- Tài liệu lệch code: `DOC-1` đến `DOC-7`.
- Lặp code ở frontend, hai file trên 500 dòng: `FE-4`, `FE-5`, `FE-6`.
- Thư mục rỗng `backend/EmployeeCrud.Api/Controllers/`: `BE-10`.

## Handoff Summary

- **Intent-relevant finding**: nguyên nhân gốc của 5 mục trong intent đã định vị được bằng đọc code. `backend/EmployeeCrud.Api/Platform/Text/TextInput.cs:43-62` không chặn U+FFFE rồi gọi `Normalize` ở dòng 80 không có bảo vệ; lỗi đi tới nhánh 500 ở `Platform/Errors/ErrorMapper.cs:29`. `frontend/src/utils/normalizeText.ts:14` có cùng lỗ hổng. `Number(params.id)` ở `EmployeeFormPage.tsx:129` và `DepartmentFormPage.tsx:47` đọc `2127e0` thành 2127. Nút Hủy là `<Link>` ở `EmployeeFormPage.tsx:529-535` và `DepartmentFormPage.tsx:274-280`. Bảng nối intent với phát hiện nằm cuối `code-quality-assessment.md`.
- **Risks / follow-up**:
  - Grep thấy đúng 8 file `.cs` trái `insert_final_newline = false`, nhưng 3 trong đó là file migration sinh tự động. Chưa chạy `dotnet format` nên chưa khẳng định đây chính là 8 lỗi của lượt 6.
  - U+FFFF và U+FDD0–U+FDEF cũng không bị chặn. Chưa kiểm chúng có gây 500 hay không; Requirements Analysis cần chốt phạm vi ký tự.
  - Khóa nút Hủy không đủ nếu còn lối khác rời form lúc đang lưu: breadcrumb, menu, nút Back (`FE-2`).
  - Luật ở `TextInput.cs` và `normalizeText.ts` phải đổi cùng nhau, kèm `docs/danh-sach-api.md:14` và `:176`.
  - `README.md:165` và `:169` phải sửa cùng lúc khi thêm kiểm định dạng vào `verify`.
