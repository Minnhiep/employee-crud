# Hướng dẫn build: sua-ra-soat-ban-giao

Việc này sửa code backend, frontend, test và tài liệu theo danh sách rà soát bàn giao; không đổi cách build, không thêm gói. Các lệnh dưới đây chạy từ gốc repo `employee-crud` trên Windows (PowerShell hoặc terminal của VS Code).

## Nguồn

- `../code-generation/code-generation-plan.md` (code-generation-plan): 12 bước đã làm và Testing Contract (test-after, scope bugfix, strategy Minimal).
- `../code-generation/unit-test-instructions.md` (unit-test-instructions): lệnh test theo lớp (service, Platform, toàn bộ), lệnh định dạng, lệnh frontend, mức sàn độ phủ và kỳ vọng khi kiểm bằng API thật. Build and Test chạy lại đúng các lệnh đó; kết quả ở `test-results.md`.
- `../code-generation/code-summary.md` (code-summary): file đã đổi, kết quả tái hiện lỗi, phép thử gây lỗi cho test mới.

## Cần có trên máy

| Phần mềm | Bản dùng khi kiểm (10/11/2026) | Ghi chú |
|---|---|---|
| .NET SDK | 10.0.403 | `global.json` nhận mọi bản 10.0.x từ 10.0.100 (`rollForward: latestFeature`) |
| Node.js / npm | 24.15.0 / 11.16.0 | `package.json` ghi `"node": ">=24"` |
| PostgreSQL | 18.6, dịch vụ `postgresql-x64-18`, cổng 5432 | Cần cho chạy thật, kiểm API, giao diện, migration |
| Google Chrome | bản đang cài | Chỉ cần cho Lighthouse (FR8.2) |

## Cài thư viện

```powershell
dotnet tool restore
dotnet restore backend/EmployeeCrud.slnx
npm --prefix frontend ci
```

## Build và kiểm tổng

```powershell
npm --prefix frontend run verify
```

Lệnh này lần lượt chạy `tsc`, ESLint, `prettier --check`, `vite build`, `dotnet format --verify-no-changes`, `dotnet test`. Bước nào lỗi thì các bước sau không chạy.

Đo độ phủ (coverlet, cách chuẩn của nhóm) và quét lỗ hổng thư viện:

```powershell
npm --prefix frontend run coverage
npm --prefix frontend audit --omit=dev
```

## Chạy thật để kiểm API và giao diện

```powershell
dotnet run --project backend/EmployeeCrud.Api --launch-profile http   # API ở http://localhost:5081
npm --prefix frontend run dev                                          # giao diện ở http://localhost:5173
```

Chuỗi kết nối database lấy từ user-secrets (README mục 3), không nằm trong repo.

## FR8.1: migration trên database trống (Hiệp làm tay)

Mục đích: chứng minh người mới clone repo tạo được database từ đầu chỉ bằng migration. Dùng một database thử riêng, không đụng `employee_db`.

0. Tắt backend nếu đang chạy (`Ctrl+C`): `dotnet ef` build lại project, mà backend đang chạy giữ file `.dll` nên build báo "being used by another process".
1. Chạy khối lệnh sau trong PowerShell ở gốc repo. Mật khẩu `postgres` gõ vào ô ẩn, không nằm trong lịch sử lệnh (cùng cách README mục 13 bước 4). EF Core tự tạo database `employee_db_thu_migration` nếu chưa có.

   ```powershell
   $s = Read-Host "Mat khau postgres" -AsSecureString
   $b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)
   try {
       $env:ConnectionStrings__Default = "Host=localhost;Port=5432;Database=employee_db_thu_migration;Username=postgres;Password=" + [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b)
       dotnet ef database update --project backend/EmployeeCrud.Api
       dotnet ef migrations list --project backend/EmployeeCrud.Api
   }
   finally {
       [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b)
       Remove-Item Env:ConnectionStrings__Default -ErrorAction SilentlyContinue
       Remove-Variable s, b -ErrorAction SilentlyContinue
   }
   ```

   Đạt khi: có dòng `Done.`; `migrations list` in đủ 2 migration (`CreateDepartments`, `CreateEmployees`) và không dòng nào ghi `(Pending)`.

2. Trong pgAdmin: Servers → PostgreSQL 18 → Databases (F5) → `employee_db_thu_migration` → Query Tool, chạy:

   ```sql
   SELECT "MigrationId" FROM "__EFMigrationsHistory" ORDER BY 1;
   SELECT id, name FROM departments ORDER BY id;
   SELECT count(*) FROM employees;
   ```

   Đạt khi: 2 dòng migration, 4 phòng ban mẫu, 0 nhân viên.

3. Xóa database thử: đóng Query Tool của database đó, mở Query Tool trên database `postgres`, chạy `DROP DATABASE employee_db_thu_migration WITH (FORCE);`.

## FR8.2: Lighthouse trên bản build (Hiệp làm tay)

1. Backend đang chạy ở cổng 5081 (lệnh ở mục "Chạy thật").
2. Tắt `npm run dev` nếu đang chạy (bản xem trước dùng cùng cổng 5173), rồi:

   ```powershell
   npm --prefix frontend run build
   npm --prefix frontend run preview
   ```

3. Mở Chrome ở cửa sổ ẩn danh (Ctrl+Shift+N, để tiện ích của trình duyệt không làm sai điểm), vào `http://localhost:5173/employees`. Nhấn F12 → thẻ **Lighthouse** → Mode **Navigation**, Device **Desktop**, chọn **Performance**, **Accessibility**, **Best practices** → **Analyze page load**. Ghi 3 điểm.
4. Làm lại với `http://localhost:5173/departments`.
5. Nhấn `Ctrl+C` ở terminal để tắt `preview`.

Đạt khi cả hai trang: Performance ≥ 90, Accessibility = 100, Best Practices ≥ 90.

## Sự cố thường gặp khi build

- **`dotnet test` / `dotnet run` báo "Application Control policy has blocked this file" (0x800711C7):** Windows Smart App Control chặn file `.dll` vừa build. Hiệp đang tắt tạm Smart App Control; phải bật lại khi xong việc.
- **`npm run preview` báo cổng 5173 đã dùng:** `npm run dev` còn chạy ở cửa sổ khác; tắt (`Ctrl+C`) rồi chạy lại. Cổng cố định vì backend chỉ cho phép (CORS) đúng `http://localhost:5173`.
- **"being used by another process" khi build:** backend còn chạy ở cửa sổ khác; tắt (`Ctrl+C`) rồi build lại.
- **`dotnet ef` không có:** chạy `dotnet tool restore` (công cụ cài cục bộ theo `dotnet-tools.json` ở gốc repo, không cài `--global`).
