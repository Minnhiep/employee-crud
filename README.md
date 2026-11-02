# Quản lý nhân viên và phòng ban (employee-crud)

Ứng dụng web nhỏ để thêm, sửa, xóa, tìm nhân viên và quản lý phòng ban. Mỗi nhân viên thuộc đúng một phòng ban, chọn từ danh sách có sẵn.

Dữ liệu đi theo một đường: **React** (giao diện trên trình duyệt) gửi JSON tới **Web API** → **ASP.NET Core** nhận request, kiểm luật nghiệp vụ (Controller → Service) → **Entity Framework Core** đọc hoặc ghi **PostgreSQL**, rồi trả JSON ngược lại cho giao diện.

```text
frontend/   React + TypeScript (Vite)            chạy ở http://localhost:5173
backend/    ASP.NET Core Web API (.NET 10)       chạy ở http://localhost:5081
            + migration EF Core tạo database employee_db trên PostgreSQL 18
docs/       sơ đồ database, danh sách API
```

## 1. Phần mềm cần có

| Phần mềm | Phiên bản cần có | Đã thử trên máy làm bài | Ghi chú |
|---|---|---|---|
| .NET SDK | 10.0 trở lên | 10.0.403 | Backend nhắm tới `net10.0` |
| Node.js | 24 trở lên | 24.15.0 | `package.json` ghi `"node": ">=24"` |
| npm | đi kèm Node.js | 11.16.0 | |
| PostgreSQL | 18 | 18.6 | Chạy trên máy, cổng 5432; nhớ mật khẩu tài khoản `postgres` đặt lúc cài |
| Git | bản nào cũng được | 2.54.0 | |
| pgAdmin 4 | không bắt buộc | đi kèm bộ cài PostgreSQL | Để xem bảng, đối chiếu sơ đồ |
| Postman | không bắt buộc | | Để gọi thử API |

Kiểm nhanh trong PowerShell: `dotnet --version`, `node --version`, `npm --version`, `git --version`.

Không cần cài thêm công cụ nào ra toàn máy: công cụ migration (`dotnet-ef`) được khai báo trong dự án và khôi phục ở bước 4.

## 2. Lấy mã nguồn

```powershell
git clone <địa-chỉ-repo> employee-crud
cd employee-crud
```

**Mọi lệnh bên dưới chạy từ thư mục gốc `employee-crud`**, trừ khi ghi rõ thư mục khác.

## 3. Đặt connection string bằng user-secrets

Backend cần biết cách vào PostgreSQL. Mật khẩu **không** để trong file nào của repo; nó được lưu riêng trên máy bạn bằng user-secrets (nằm trong thư mục hồ sơ người dùng của Windows, ngoài repo).

Dán cả khối dưới đây vào PowerShell, bấm Enter, rồi gõ mật khẩu PostgreSQL khi được hỏi (chỉ hiện dấu `*`):

```powershell
$s = Read-Host "Mat khau PostgreSQL" -AsSecureString
$p = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($s))
dotnet user-secrets set "ConnectionStrings:Default" "Host=localhost;Port=5432;Database=employee_db;Username=postgres;Password=$p" --project backend/EmployeeCrud.Api
Remove-Variable p, s
```

Vì sao không gõ thẳng mật khẩu vào lệnh: PowerShell ghi mọi lệnh đã gõ vào một file lịch sử trên máy, mật khẩu gõ thẳng sẽ nằm lại trong file đó. Nhập qua `Read-Host -AsSecureString` thì mật khẩu không vào lịch sử; dòng `Remove-Variable` xóa nó khỏi bộ nhớ sau khi dùng xong.

Kiểm lại (mật khẩu được che thành `***` khi in ra):

```powershell
(dotnet user-secrets list --project backend/EmployeeCrud.Api) -replace 'Password=[^;]*', 'Password=***'
```

Phải thấy `ConnectionStrings:Default = Host=localhost;Port=5432;Database=employee_db;Username=postgres;Password=***`.

Không dán mật khẩu vào `appsettings.json` hay `appsettings.Development.json`: hai file này nằm trong Git.

Nếu quên bước này, backend sẽ dừng ngay khi chạy và in lời báo "Thiếu cấu hình ConnectionStrings:Default" kèm lệnh cần gõ.

## 4. Khôi phục công cụ và gói thư viện của dự án

```powershell
dotnet tool restore
```

Lệnh này đọc `dotnet-tools.json` ở thư mục gốc và cài `dotnet-ef` 10.0.14 (chạy migration) và `reportgenerator` (đọc báo cáo độ phủ test) **cục bộ cho dự án**, không cài ra toàn máy. Phải thấy `Restore was successful.`

```powershell
dotnet restore backend/EmployeeCrud.slnx
```

Lệnh này tải các gói thư viện NuGet mà backend và project test dùng. Phải thấy `Restore complete`. **Đừng bỏ qua bước này:** lệnh migration ở mục 5 cần các gói đã được tải về, nếu không sẽ báo lỗi `NETSDK1004: Assets file '...project.assets.json' not found`.

## 5. Tạo database bằng migration

```powershell
dotnet ef database update --project backend/EmployeeCrud.Api
```

Lệnh này build backend, rồi tạo database `employee_db` (nếu chưa có) và chạy hai migration; cuối cùng in `Done.`. Hai migration là: bảng `departments` kèm 4 phòng ban mẫu (Nhân sự, Kế toán, Kỹ thuật, Kinh doanh), rồi bảng `employees`. Cấu trúc bảng xem ở [docs/so-do-database.md](docs/so-do-database.md).

Muốn quay lui chỉ phần nhân viên: `dotnet ef database update CreateDepartments --project backend/EmployeeCrud.Api`.

## 6. Chạy backend

Mở một cửa sổ PowerShell:

```powershell
dotnet run --project backend/EmployeeCrud.Api
```

Đợi dòng `Now listening on: http://localhost:5081`. Để cửa sổ này mở trong lúc dùng ứng dụng; bấm `Ctrl+C` để dừng.

## 7. Chạy frontend

Mở **cửa sổ PowerShell thứ hai**:

```powershell
cd frontend
npm install
npm run dev
```

`npm install` chỉ cần chạy lần đầu (hoặc khi `package.json` đổi). Đợi dòng `Local: http://localhost:5173/`.

## 8. Địa chỉ

| Cái gì | Địa chỉ |
|---|---|
| Trang web | <http://localhost:5173> |
| API | <http://localhost:5081/api/departments>, <http://localhost:5081/api/employees> |
| Trang tài liệu API (Swagger UI) | <http://localhost:5081/swagger> |
| Đặc tả OpenAPI (JSON) | <http://localhost:5081/openapi/v1.json> |

Trang tài liệu API chỉ có khi backend chạy ở môi trường Development (mặc định của `dotnet run`). Danh sách đủ 10 thao tác kèm JSON mẫu: [docs/danh-sach-api.md](docs/danh-sach-api.md).

Frontend phải chạy đúng cổng 5173: backend chỉ cho phép trang ở địa chỉ này gọi API (CORS). Địa chỉ backend mà frontend gọi nằm trong `frontend/.env.development` (`VITE_API_BASE_URL=http://localhost:5081`).

## 9. Kiểm nhanh

1. Mở <http://localhost:5173>, vào trang **Phòng ban**: thấy 4 phòng ban mẫu.
2. Vào trang **Nhân viên**, bấm **Thêm nhân viên**, nhập họ tên, email, chọn phòng ban, lưu: nhân viên mới hiện trong danh sách.
3. Sửa nhân viên đó, đổi email, lưu: danh sách cập nhật.
4. Gõ một phần họ tên hoặc email vào ô tìm kiếm: chỉ hiện người khớp (không phân biệt hoa thường).
5. Xóa nhân viên đó: biến mất khỏi danh sách.
6. Thử xóa một phòng ban đang có nhân viên: ứng dụng báo không xóa được.

## 10. Chạy test và đo độ phủ

Unit test (xUnit) cho các service nghiệp vụ:

```powershell
dotnet test backend/EmployeeCrud.slnx
```

Đo độ phủ (coverlet + reportgenerator), in bảng tóm tắt; báo cáo HTML nằm ở `backend/TestResults/coverage-report/index.html`:

```powershell
cd frontend
npm run coverage
```

Mức sàn của dự án: ít nhất 80% số dòng của các lớp service. Kiểm đủ một lượt (kiểu TypeScript, lint, định dạng, build frontend và test backend): `npm run verify` trong thư mục `frontend`.

## 11. Sự cố thường gặp

Các lỗi dưới đây đã gặp thật khi làm bài trên Windows 11, không phải lỗi code.

- **`dotnet run` / `dotnet test` báo "Application Control policy has blocked this file" (0x800711C7).** Windows Smart App Control chặn file `.dll` vừa build. Thử build lại; nếu vẫn bị chặn thì cần chỉnh Smart App Control trong Windows Security (việc này đổi cài đặt máy, cân nhắc trước khi làm).
- **Build hoặc test báo không chép được file vì "being used by another process".** Backend vẫn đang chạy ở cửa sổ khác và giữ file `.exe`. Bấm `Ctrl+C` ở cửa sổ backend rồi chạy lại lệnh.
- **Gõ `psql` báo không tìm thấy lệnh.** Bộ cài PostgreSQL không tự thêm `psql` vào PATH. Dùng pgAdmin 4 (Query Tool) hoặc "SQL Shell (psql)" trong menu Start thay vì đổi PATH.

## 12. Tài liệu khác

- [docs/so-do-database.md](docs/so-do-database.md): sơ đồ hai bảng, cột, ràng buộc, cách đối chiếu bằng pgAdmin.
- [docs/danh-sach-api.md](docs/danh-sach-api.md): 10 thao tác API kèm JSON mẫu, ví dụ lỗi 400/404/409, cách gọi bằng Postman.
- [docs/ke-hoach.md](docs/ke-hoach.md): đề bài thực tập.
