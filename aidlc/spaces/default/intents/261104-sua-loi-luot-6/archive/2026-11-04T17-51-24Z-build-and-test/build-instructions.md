# Hướng dẫn build

Căn cứ: `code-generation-plan.md`, `unit-test-instructions.md`, `code-summary.md` của việc này. Cài đặt đầy đủ nằm ở `README.md`.

## Chuẩn bị

- .NET SDK 10, Node 24, PostgreSQL 18 chạy ở cổng 5432.
- Connection string đặt bằng user-secrets, không ghi vào `appsettings`.
- `dotnet tool restore`, `dotnet restore backend/EmployeeCrud.slnx`, `npm --prefix frontend ci`.

## Build và kiểm một lượt

```powershell
npm --prefix frontend run verify
```

Lệnh này chạy lần lượt: kiểm kiểu TypeScript, ESLint, Prettier, build frontend, `dotnet format --verify-no-changes`, `dotnet test`. Bước nào lỗi thì dừng ở đó.

## Kiểm build

- Mã thoát 0 và dòng `Passed!` của `dotnet test`.
- `dotnet ef migrations has-pending-model-changes --project backend/EmployeeCrud.Api` báo không có thay đổi model.

## Sự cố thường gặp

- `dotnet format` lỗi: chạy `dotnet format backend/EmployeeCrud.slnx` rồi xem lại thay đổi.
- Không chép được file vì "being used by another process": tắt backend đang chạy.
- Lỗi 0x800711C7: Smart App Control chặn `.dll`, xem `README.md` mục 11.
