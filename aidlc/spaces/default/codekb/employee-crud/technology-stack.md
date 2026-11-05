# Công nghệ sử dụng

Phiên bản lấy từ `.csproj`, `dotnet-tools.json`, `frontend/package.json` và `frontend/package-lock.json`. Lượt quét `261104-sua-loi-luot-8` chỉ đọc lại `EmployeeCrud.Api.csproj`, các gói backend khớp bảng dưới; phần còn lại giữ từ lượt trước.

## Ngôn ngữ và runtime

| Thành phần | Phiên bản | Nguồn |
|---|---|---|
| C# / .NET | `net10.0`, nullable bật, implicit usings bật | `EmployeeCrud.Api.csproj` |
| TypeScript | 6.0.3, `strict`, `noUncheckedIndexedAccess` | `package-lock.json`, `tsconfig.json` |
| Node.js | `>=24` | `package.json` |
| SQL | PostgreSQL | Migration, `docs/du-lieu-mau.sql` |
| CSS | Thuần, không thư viện | `frontend/src/styles/` |

## Backend

| Gói | Phiên bản | Dùng để |
|---|---|---|
| ASP.NET Core (`Microsoft.NET.Sdk.Web`) | theo `net10.0` | Web API, controller, DI |
| Microsoft.EntityFrameworkCore | 10.0.14 | ORM |
| Microsoft.EntityFrameworkCore.Relational | 10.0.14 | Phần quan hệ của EF Core |
| Microsoft.EntityFrameworkCore.Design | 10.0.14 | Công cụ migration, chỉ lúc phát triển |
| Npgsql.EntityFrameworkCore.PostgreSQL | 10.0.3 | Provider PostgreSQL |
| Microsoft.AspNetCore.OpenApi | 10.0.14 | Sinh đặc tả OpenAPI |
| Swashbuckle.AspNetCore.SwaggerUI | 10.3.1 | Trang Swagger UI |

## Test backend

| Gói | Phiên bản | Dùng để |
|---|---|---|
| xunit | 2.9.3 | Framework test |
| xunit.runner.visualstudio | 3.1.4 | Chạy test |
| Microsoft.NET.Test.Sdk | 17.14.1 | Nền chạy test |
| Microsoft.AspNetCore.Mvc.Testing | 10.0.14 | `WebApplicationFactory` |
| Microsoft.EntityFrameworkCore.InMemory | 10.0.14 | Database giả cho unit test |
| coverlet.collector | 6.0.4 | Đo độ phủ |

## Công cụ .NET cục bộ (`dotnet-tools.json`)

| Công cụ | Phiên bản |
|---|---|
| dotnet-ef | 10.0.14 |
| dotnet-reportgenerator-globaltool | 5.5.12 |

## Frontend

| Gói | Khai báo | Đã khóa | Dùng để |
|---|---|---|---|
| react, react-dom | `^19.3.1` | 19.3.1 | Giao diện |
| react-router | `^8.5.1` | 8.5.1 | Định tuyến |
| vite | `^8.3.5` | 8.3.5 | Dev server, build |
| @vitejs/plugin-react | `^6.1.2` | 6.1.2 | JSX, nạp nóng |
| typescript | `^6.0.3` | 6.0.3 | Kiểm kiểu |
| eslint | `^10.14.0` | 10.14.0 | Lint |
| @eslint/js | `^10.0.1` | 10.0.1 | Luật JavaScript |
| typescript-eslint | `^8.72.1` | 8.72.1 | Luật TypeScript |
| eslint-plugin-react-hooks | `^7.1.1` | 7.1.1 | Luật Hooks |
| eslint-plugin-react-refresh | `^0.5.7` | 0.5.7 | Luật nạp nóng |
| globals | `^17.14.0` | 17.14.0 | Biến toàn cục trình duyệt |
| prettier | `^3.9.10` | 3.9.10 | Định dạng |
| @types/react, @types/react-dom | `^19.3.0` | 19.3.0 | Kiểu React |

Không có thư viện UI, thư viện state hay thư viện form.

## Hạ tầng cục bộ

| Thành phần | Giá trị | Nguồn |
|---|---|---|
| Database | PostgreSQL 18, cổng 5432, `employee_db` | `README.md`, `project.md` |
| Backend | `http://localhost:5081`; hồ sơ https `https://localhost:7205` | `launchSettings.json` |
| Frontend | `http://localhost:5173`, `strictPort` | `vite.config.ts` |
| Bí mật | .NET user-secrets (`UserSecretsId` trong `.csproj`) | `README.md` mục 3 |
| Container, CI/CD | Không có, đúng `project.md` | Quét repo |

Bản đã chạy thử theo `README.md:16-24`: .NET SDK 10.0.403, Node.js 24.15.0, npm 11.16.0, PostgreSQL 18.6, Git 2.54.0. Các lượt quét không kiểm lại.
