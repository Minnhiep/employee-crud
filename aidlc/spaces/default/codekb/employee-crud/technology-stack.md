# Technology Stack: employee-crud

Danh sách gói đầy đủ kèm phiên bản và chỗ khai báo nằm ở `dependencies.md`; file này tóm tầng công nghệ.

## Ngôn ngữ

| Ngôn ngữ | Ở đâu | Ghi chú |
|---|---|---|
| C# (.NET 10, `net10.0`) | `backend/` | `Nullable` và `ImplicitUsings` bật; dùng primary constructor, record, collection expression, pattern matching |
| TypeScript 6.0 | `frontend/src/` | `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`, `verbatimModuleSyntax`, JSX `react-jsx`, `.tsx` cho component, `.ts` cho phần còn lại |
| SQL (PostgreSQL) | `Migrations/` (câu `CREATE UNIQUE INDEX … (lower(...))` viết tay), `docs/du-lieu-mau.sql`, `docs/so-do-database.md` | |
| CSS | `frontend/src/styles/` | biến CSS, đặt tên BEM, không framework CSS |

## Tầng ứng dụng

| Tầng | Công nghệ | Phiên bản (khai trong repo) |
|---|---|---|
| Giao diện | React + React DOM, React Router (chế độ khai báo, `BrowserRouter`) | 19.3.1, 8.5.1 |
| Đóng gói/dev server | Vite + @vitejs/plugin-react | 8.3.5, 6.1.2; cổng 5173 `strictPort` |
| API | ASP.NET Core Web API (controller), ProblemDetails, OpenAPI (`Microsoft.AspNetCore.OpenApi`), Swagger UI (`Swashbuckle.AspNetCore.SwaggerUI`) | .NET 10, 10.0.14, 10.3.1 |
| Truy cập dữ liệu | EF Core + Npgsql provider | 10.0.14, 10.0.3 |
| Database | PostgreSQL | 18 (máy làm bài 18.6, theo README) |
| Test | xUnit, EF Core InMemory, `WebApplicationFactory` | 2.9.3, 10.0.14, 10.0.14 |

## Công cụ phát triển

| Công cụ | Vai trò | Cấu hình |
|---|---|---|
| .NET SDK | build, test, `dotnet format` | không có `global.json` (SDK không ghim); README ghi máy làm bài 10.0.403 |
| dotnet-ef 10.0.14 | migration, cài cục bộ | `dotnet-tools.json` |
| reportgenerator 5.5.12 | in bảng độ phủ | `dotnet-tools.json`, script `npm run coverage` |
| coverlet.collector 6.0.4 | thu độ phủ | project test |
| Node.js ≥ 24, npm | chạy frontend | `package.json` `engines`; README ghi 24.15.0, npm 11.16.0 |
| ESLint 10 + typescript-eslint 8 + react-hooks + react-refresh | lint | `frontend/eslint.config.js`, `--max-warnings 0` |
| Prettier 3.9 | định dạng TS/CSS/JSON/MD | mặc định, `frontend/.prettierignore` |
| EditorConfig | định dạng C#, LF | `.editorconfig` |
| Git | quản lý mã | `.gitattributes` ép LF |
| Postman, REST Client (`.http`), pgAdmin 4 | kiểm tay | `EmployeeCrud.Api.http`, README |

## Môi trường chạy

- Chạy trên máy: backend `http://localhost:5081` (hồ sơ `http`), `https://localhost:7205` (hồ sơ `https`); frontend `http://localhost:5173`; PostgreSQL `localhost:5432`, database `employee_db`.
- Chuỗi kết nối: khóa `ConnectionStrings:Default` trong user-secrets (`UserSecretsId` trong `EmployeeCrud.Api.csproj`) hoặc biến môi trường `ConnectionStrings__Default`; không nằm trong repo.
- Môi trường ASP.NET: `Development` khi `dotnet run` (Swagger bật); test dùng `Testing`.
- Không Docker, không CI/CD, không dịch vụ đám mây (theo `project.md`).
