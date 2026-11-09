# Hướng dẫn build: kiem-cuoi-crlf

Việc này chỉ sửa cấu hình repo (kiểu xuống dòng) và tài liệu, không đổi cách build. Các lệnh dưới đây là lệnh của dự án, chạy từ gốc repo trên Windows (PowerShell hoặc terminal của VS Code).

## Nguồn

- `../code-generation/code-generation-plan.md` (code-generation-plan): các bước đã làm (Step 1–10) và Testing Contract.
- `../code-generation/unit-test-instructions.md` (unit-test-instructions): lệnh kiểm của việc này (Prettier, `git ls-files --eol`, `git check-attr`, `git diff --ignore-cr-at-eol`, `dotnet test`); Build and Test chạy lại đúng các lệnh đó, kết quả ở `test-results.md`.
- `../code-generation/code-summary.md` (code-summary): file đã đổi và kết quả lúc làm code.

## Cần có trên máy

| Phần mềm | Bản dùng khi kiểm (09/11/2026) | Ghi chú |
|---|---|---|
| .NET SDK | 10.0.403 | Backend nhắm tới `net10.0` |
| Node.js / npm | 24.15.0 / 11.16.0 | `package.json` ghi `"node": ">=24"` |
| Git for Windows | 2.54.0 | `core.autocrlf=true` ở mức hệ thống (mặc định của bộ cài); `.gitattributes` của repo ghi đè thành LF |
| PostgreSQL | 18.6, dịch vụ `postgresql-x64-18`, cổng 5432 | Chỉ cần cho chạy thật và kiểm API, giao diện |

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

Đo độ phủ (coverlet, cách chuẩn của nhóm):

```powershell
npm --prefix frontend run coverage
```

## Chạy thật để kiểm API và giao diện

```powershell
dotnet run --project backend/EmployeeCrud.Api --launch-profile http   # API ở http://localhost:5081
npm --prefix frontend run dev                                          # giao diện ở http://localhost:5173
```

Chuỗi kết nối database lấy từ user-secrets (README mục 3), không nằm trong repo.

## Sự cố thường gặp khi build

- **`dotnet test` / `dotnet run` báo "Application Control policy has blocked this file" (0x800711C7):** Windows Smart App Control chặn file `.dll` vừa build. Trong việc này, AI-DLC (`aidlc.exe`) cũng bị chặn. Hiệp đã tự tắt tạm Smart App Control ngày 09/11 tối để chạy được; phải bật lại khi xong việc.
- **Prettier báo lỗi định dạng hàng loạt ngay sau khi clone/pull:** bản clone làm trước khi repo có `.gitattributes`; xử lý theo README mục 11.
- **"being used by another process" khi build:** backend còn chạy ở cửa sổ khác; tắt (`Ctrl+C`) rồi build lại.
