# Hướng dẫn build: employee-crud

> **Nguồn:** `code-generation-plan.md`, `code-summary.md` và `unit-test-instructions.md` của 5 Unit (`u1-backend-platform`, `u2-web-shell`, `u3-departments`, `u4-employees`, `u5-handover`); `README.md` (U5) là bản hướng dẫn cho người cài. File này là bản dành cho người kiểm build, chạy ở thư mục gốc `employee-crud/`.

## 1. Phần mềm cần có

| Phần mềm | Bản đã dùng (kiểm 30/10 và 03/11/2026) | Vì sao cần |
|---|---|---|
| .NET SDK | 10.0.403 (ASP.NET Core 10.0.14) | Build và chạy backend, chạy `dotnet test`, `dotnet ef` |
| Node.js / npm | 24.15.0 / 11.16.0 (`package.json` đòi Node ≥ 24) | Build frontend Vite, chạy ESLint, Prettier, TypeScript |
| PostgreSQL | 18.6, dịch vụ `postgresql-x64-18`, cổng 5432 | Database `employee_db` |
| Git | 2.54.0 | Lấy mã nguồn |

Không cần Docker, không cần cài công cụ ra ngoài dự án: `dotnet-ef` 10.0.14 và `dotnet-reportgenerator-globaltool` 5.5.12 nằm trong tool manifest `dotnet-tools.json` (cài cục bộ, `team.md`).

## 2. Cài phụ thuộc

```powershell
dotnet tool restore
dotnet restore backend/EmployeeCrud.slnx
npm --prefix frontend install
```

- `dotnet tool restore` lấy `dotnet ef` và `reportgenerator` theo `dotnet-tools.json`.
- `dotnet restore` phải chạy trước `dotnet ef` trên bản clone mới, nếu không sẽ gặp `NETSDK1004 ... project.assets.json not found` (đã gặp thật ở U5, bước clone sạch).

## 3. Thiết lập môi trường

| Việc | Cách làm | Ghi chú |
|---|---|---|
| Chuỗi kết nối | `dotnet user-secrets set "ConnectionStrings:Default" "Host=localhost;Port=5432;Database=employee_db;Username=<tài khoản>;Password=<mật khẩu>" --project backend/EmployeeCrud.Api` (README mục 3 có cách nhập mật khẩu dạng ẩn) | Lưu ở `%APPDATA%\Microsoft\UserSecrets\...`, ngoài repo. `appsettings*.json` không có `ConnectionStrings` |
| Tạo bảng | `dotnet ef database update --project backend/EmployeeCrud.Api` | Chạy 2 migration `CreateDepartments`, `CreateEmployees`; có 4 phòng ban mẫu |
| Cổng | Backend `http://localhost:5081` (hồ sơ `http`), frontend `http://localhost:5173` (`strictPort`) | CORS chỉ cho phép `http://localhost:5173` (`appsettings.json` → `Cors:AllowedOrigins`) |
| Địa chỉ API cho frontend | `frontend/.env.development`: `VITE_API_BASE_URL=http://localhost:5081` | Không phải bí mật |

## 4. Lệnh build

```powershell
dotnet build backend/EmployeeCrud.slnx
npm --prefix frontend run build
```

`npm run build` chạy `tsc -p tsconfig.json` (TypeScript `strict`) rồi `vite build`, ra `frontend/dist/`.

## 5. Kiểm build

Một lệnh gom đủ các bước kiểm trước khi commit (thay cho CI, vì dự án không có CI):

```powershell
npm --prefix frontend run verify
```

Lệnh này chạy lần lượt: `typecheck` → `lint` (`--max-warnings 0`) → `format:check` → `build` → `dotnet test ../backend/EmployeeCrud.slnx`. Bước sau chỉ chạy khi bước trước đạt.

Thêm:

```powershell
dotnet format backend/EmployeeCrud.slnx --verify-no-changes
npm --prefix frontend run coverage
npm --prefix frontend audit --omit=dev
```

Đạt khi: `verify` thoát mã 0 và mọi test xanh; `dotnet format` không báo thay đổi; bảng độ phủ cho `DepartmentService`, `EmployeeService` ≥ 80% dòng; `audit --omit=dev` báo 0 lỗ hổng.

## 6. Sự cố hay gặp khi build

| Triệu chứng | Nguyên nhân | Cách xử lý |
|---|---|---|
| `dotnet build`/`dotnet test` báo file `.dll` đang bị khóa | Backend đang chạy bằng `dotnet run` giữ file | Dừng backend (Ctrl+C) rồi build lại |
| `Application Control policy has blocked this file` (`0x800711C7`) | Windows **Smart App Control** chặn file vừa build | Build lại; nếu vẫn bị chặn thì làm theo README mục 11. Không tự đổi cài đặt máy |
| `NETSDK1004 ... project.assets.json not found` khi chạy `dotnet ef` | Chưa `dotnet restore` trên bản clone mới | Chạy `dotnet restore backend/EmployeeCrud.slnx` |
| Vite báo cổng 5173 đang bận | `strictPort` chặn việc tự nhảy sang 5174 (CORS sẽ chặn nếu nhảy) | Tắt tiến trình đang giữ cổng 5173 |
| `psql` không chạy được | `psql` không có trong PATH trên máy này | Dùng pgAdmin hoặc SQL Shell |
