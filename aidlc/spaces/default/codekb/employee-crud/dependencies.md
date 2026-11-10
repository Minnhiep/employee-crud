# Dependencies: employee-crud

## Gói NuGet

### `backend/EmployeeCrud.Api/EmployeeCrud.Api.csproj`

| Gói | Phiên bản | Dùng để |
|---|---|---|
| Microsoft.AspNetCore.OpenApi | 10.0.14 | `AddOpenApi`, `MapOpenApi` |
| Microsoft.EntityFrameworkCore | 10.0.14 | ORM |
| Microsoft.EntityFrameworkCore.Design | 10.0.14 (`PrivateAssets=all`) | cho `dotnet ef` sinh migration |
| Microsoft.EntityFrameworkCore.Relational | 10.0.14 | API quan hệ (`ToTable`, `HasColumnName`, `migrationBuilder.Sql`) |
| Npgsql.EntityFrameworkCore.PostgreSQL | 10.0.3 | provider PostgreSQL, `PostgresException`, `PostgresErrorCodes` |
| Swashbuckle.AspNetCore.SwaggerUI | 10.3.1 | trang `/swagger` (chỉ Development) |

Phiên bản ghim đúng (không dùng `10.*`, có comment giải thích trong `.csproj`).

### `backend/EmployeeCrud.Api.Tests/EmployeeCrud.Api.Tests.csproj`

| Gói | Phiên bản | Dùng để |
|---|---|---|
| coverlet.collector | 6.0.4 | thu độ phủ (`--collect:"XPlat Code Coverage"`) |
| Microsoft.AspNetCore.Mvc.Testing | 10.0.14 | `WebApplicationFactory<Program>` |
| Microsoft.EntityFrameworkCore.InMemory | 10.0.14 | database giả cho test service |
| Microsoft.NET.Test.Sdk | 17.14.1 | chạy test |
| xunit | 2.9.3 | khung test |
| xunit.runner.visualstudio | 3.1.4 | adapter chạy test |

Không có lockfile NuGet (`packages.lock.json`).

### Công cụ cục bộ (`dotnet-tools.json`, `rollForward: false`)

| Công cụ | Phiên bản |
|---|---|
| dotnet-ef | 10.0.14 |
| dotnet-reportgenerator-globaltool | 5.5.12 |

## Gói npm (`frontend/package.json`; phiên bản khóa đọc trong `package-lock.json`)

| Gói | Khai | Khóa | Loại |
|---|---|---|---|
| react | ^19.3.1 | 19.3.1 | chạy |
| react-dom | ^19.3.1 | 19.3.1 | chạy |
| react-router | ^8.5.1 | 8.5.1 (phụ thuộc `@remix-run/route-pattern`, `cookie-es`; yêu cầu Node ≥ 22.22) | chạy |
| vite | ^8.3.5 | 8.3.5 | dev |
| @vitejs/plugin-react | ^6.1.2 | 6.1.2 | dev |
| typescript | ^6.0.3 | 6.0.3 | dev |
| eslint | ^10.14.0 | 10.14.0 | dev |
| @eslint/js | ^10.0.1 | — | dev |
| typescript-eslint | ^8.72.1 | 8.72.1 | dev |
| eslint-plugin-react-hooks | ^7.1.1 | — | dev |
| eslint-plugin-react-refresh | ^0.5.7 | — | dev |
| globals | ^17.14.0 | — | dev |
| prettier | ^3.9.10 | 3.9.10 | dev |
| @types/react, @types/react-dom | ^19.3.0 | — | dev |

"—": lần quét này không đọc dòng khóa của gói đó (lockfile chỉ đọc lướt). Chỉ ba gói chạy thật đi vào bản build; không có thư viện UI, icon, gọi HTTP hay quản lý state bên ngoài (icon tự vẽ, gọi API bằng `fetch`, state bằng hook React). README hướng dẫn cài bằng `npm ci`.

## Phụ thuộc bên ngoài lúc chạy

| Thành phần | Ai cần | Cấu hình |
|---|---|---|
| PostgreSQL 18, database `employee_db` | backend, `dotnet ef` | chuỗi kết nối `ConnectionStrings:Default` (user-secrets) |
| Trình duyệt hỗ trợ `<dialog>`, `AbortSignal.any`, `\p{…}` trong regex | frontend | — |
| Backend ở `VITE_API_BASE_URL` | frontend | `frontend/.env.development`, mặc định `http://localhost:5081` trong `client.ts` |

## Phụ thuộc nội bộ

- `EmployeeCrud.Api.Tests` → `EmployeeCrud.Api` (`ProjectReference`; test dùng `Program`, service, `Platform.*`).
- Frontend → backend: chỉ qua HTTP; hợp đồng chung nằm ở `api-documentation.md`. Những thứ phải giữ khớp tay giữa hai đầu: luật chuẩn hóa (`TextInput.cs` ↔ `normalizeText.ts`), regex email (`EmployeeService.cs` ↔ `validateEmployee.ts`), độ dài 100/254 (`*Configuration.cs` ↔ `validate*.ts`), câu báo lỗi, cổng 5081/5173 (`launchSettings.json`, `appsettings.json` `Cors`, `.env.development`, `client.ts`, `vite.config.ts`).
- Script `frontend/package.json` `verify` và `coverage` gọi `dotnet` trên `../backend/EmployeeCrud.slnx`.
- Database: hai migration theo thứ tự `CreateDepartments` → `CreateEmployees` (khóa ngoại trỏ tới `departments`).
