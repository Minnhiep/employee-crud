# Technology Stack: employee-crud

Phiên bản lấy từ file trong repo (`*.csproj`, `dotnet-tools.json`, `frontend/package.json`, `frontend/package-lock.json`, snapshot migration). Phiên bản phần mềm đã cài trên máy làm bài lấy từ README mục 1 và `project.md`, scan không kiểm lại.

## Ngôn ngữ

| Ngôn ngữ | Dùng ở | Cấu hình |
| --- | --- | --- |
| C# | `backend/` | `net10.0`, `Nullable` enable, `ImplicitUsings` enable |
| TypeScript | `frontend/src/`, `frontend/vite.config.ts` | `strict`, `noUncheckedIndexedAccess`, `noUnusedLocals/Parameters`, `noFallthroughCasesInSwitch`, `target ES2022`, `moduleResolution bundler`, `jsx react-jsx`, `noEmit` |
| JavaScript (ESM) | `frontend/eslint.config.js` | `"type": "module"` |
| SQL (PostgreSQL) | `migrationBuilder.Sql` trong 2 migration, `docs/du-lieu-mau.sql` | – |
| CSS | `frontend/src/styles/` | CSS thuần, biến `:root` |

## Backend

| Thành phần | Phiên bản | Vai trò |
| --- | --- | --- |
| .NET / ASP.NET Core (`Microsoft.NET.Sdk.Web`) | `net10.0` (máy làm bài: SDK 10.0.403) | Web API kiểu controller |
| Microsoft.AspNetCore.OpenApi | 10.0.14 | Sinh `/openapi/v1.json` |
| Swashbuckle.AspNetCore.SwaggerUI | 10.3.1 | Trang `/swagger` (chỉ UI, đặc tả do OpenApi sinh) |
| Microsoft.EntityFrameworkCore | 10.0.14 | ORM |
| Microsoft.EntityFrameworkCore.Relational | 10.0.14 | Migration, SQL thô |
| Microsoft.EntityFrameworkCore.Design | 10.0.14 (PrivateAssets all) | Cho `dotnet ef` |
| Npgsql.EntityFrameworkCore.PostgreSQL | 10.0.3 | Provider PostgreSQL, `PostgresException`, `PostgresErrorCodes` |

Phiên bản NuGet ghim chính xác (không dùng `10.*`), có comment giải thích trong csproj.

## Kiểm thử backend

| Thành phần | Phiên bản |
| --- | --- |
| xunit | 2.9.3 |
| xunit.runner.visualstudio | 3.1.4 |
| Microsoft.NET.Test.Sdk | 17.14.1 |
| Microsoft.AspNetCore.Mvc.Testing | 10.0.14 |
| Microsoft.EntityFrameworkCore.InMemory | 10.0.14 |
| coverlet.collector | 6.0.4 |

## Frontend

| Gói | Khai trong `package.json` | Đã khóa trong `package-lock.json` | Vai trò |
| --- | --- | --- | --- |
| react, react-dom | ^19.3.1 | 19.3.1 | UI |
| react-router | ^8.5.1 | 8.5.1 | Định tuyến SPA (`BrowserRouter`) |
| vite | ^8.3.5 | 8.3.5 | Dev server cổng 5173 `strictPort`, build |
| @vitejs/plugin-react | ^6.1.2 | 6.1.2 | Plugin React cho Vite |
| typescript | ^6.0.3 | 6.0.3 | Kiểm kiểu (`tsc -p tsconfig.json`) |
| eslint | ^10.14.0 | 10.14.0 | Lint (flat config) |
| typescript-eslint | ^8.72.1 | 8.72.1 | Luật TS |
| @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals | ^10.0.1, ^7.1.1, ^0.5.7, ^17.14.0 | (khóa trong lock, không tra từng gói) | Luật JS, Hooks, React Refresh, biến toàn cục trình duyệt |
| prettier | ^3.9.10 | 3.9.10 | Định dạng, **không có file cấu hình** → mặc định Prettier 3 |
| @types/react, @types/react-dom | ^19.3.0 | (khóa trong lock) | Kiểu |

`engines.node` = `>=24` (máy làm bài: Node 24.15.0, npm 11.16.0). Cài bằng `npm ci` theo README.

## Database và môi trường chạy

- PostgreSQL 18 (máy làm bài 18.6), cổng 5432, database `employee_db`; ứng dụng có thể dùng tài khoản quyền tối thiểu `employee_app` (README mục 13).
- Connection string qua `dotnet user-secrets` (`UserSecretsId` trong csproj) hoặc biến môi trường `ConnectionStrings__Default`.
- Frontend đọc `VITE_API_BASE_URL` từ `frontend/.env.development` khi `npm run dev`; bản build dùng giá trị mặc định trong `client.ts`.
- Không Docker, không cloud, không CI/CD.

## Công cụ phát triển

| Công cụ | Phiên bản | Nơi khai | Ghi chú |
| --- | --- | --- | --- |
| dotnet-ef | 10.0.14 | `dotnet-tools.json` (gốc repo, `isRoot: true`) | Cài cục bộ bằng `dotnet tool restore` |
| dotnet-reportgenerator-globaltool (`reportgenerator`) | 5.5.12 | `dotnet-tools.json` | Dùng trong `npm run coverage` |
| dotnet format | đi kèm SDK | gọi trong `npm run verify` | Theo `.editorconfig` |
| Git | máy làm bài 2.54.0 | – | Máy này `core.autocrlf=true` ở cấu hình hệ thống; repo không có `.gitattributes` |
| Postman, pgAdmin 4, file `.http` của VS Code | – | – | Kiểm tay API và database |

Chi tiết cấu hình định dạng và đầu dòng: `code-quality-assessment.md`.
