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
git clone https://github.com/Minnhiep/employee-crud.git employee-crud
cd employee-crud
```

Repo đang để chế độ **Private**: chỉ người được chủ repo mời (GitHub → Settings → Collaborators) mới clone được. Lần clone đầu, Git sẽ mở cửa sổ đăng nhập GitHub.

**Mọi lệnh bên dưới chạy từ thư mục gốc `employee-crud`**, trừ khi ghi rõ thư mục khác.

## 3. Đặt connection string bằng user-secrets

Backend cần biết cách vào PostgreSQL. Mật khẩu **không** để trong file nào của repo; nó được lưu riêng trên máy bạn bằng user-secrets (nằm trong thư mục hồ sơ người dùng của Windows, ngoài repo).

Dán cả khối dưới đây vào PowerShell, bấm Enter, rồi gõ mật khẩu PostgreSQL khi được hỏi (chỉ hiện dấu `*`):

```powershell
$s = Read-Host "Mat khau PostgreSQL" -AsSecureString
$b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)
try {
    $p = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b)
    dotnet user-secrets set "ConnectionStrings:Default" "Host=localhost;Port=5432;Database=employee_db;Username=postgres;Password=$p" --project backend/EmployeeCrud.Api
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b)
    Remove-Variable p, s, b -ErrorAction SilentlyContinue
}
```

Vì sao không gõ thẳng mật khẩu vào lệnh: PowerShell ghi mọi lệnh đã gõ vào một file lịch sử trên máy, mật khẩu gõ thẳng sẽ nằm lại trong file đó. Nhập qua `Read-Host -AsSecureString` thì mật khẩu không vào lịch sử.

Vì sao có `try`/`finally` và `ZeroFreeBSTR`: `SecureStringToBSTR` tạo một bản sao mật khẩu dạng chữ thường ở vùng nhớ ngoài .NET; `ZeroFreeBSTR` ghi đè bản sao đó bằng số 0 rồi trả vùng nhớ lại cho máy (cách Microsoft hướng dẫn khi dùng `SecureString`). Khối `finally` chạy cả khi lệnh ở giữa bị lỗi. `Remove-Variable` bỏ các biến để lệnh gõ sau trong cửa sổ đó không vô tình in hay dùng lại mật khẩu. Biến `$p` vẫn là chuỗi .NET nên không xóa sạch được khỏi bộ nhớ; đóng cửa sổ PowerShell sau khi làm xong là chắc nhất.

**Lưu ý về mật khẩu:** đừng dùng dấu `;` hay dấu nháy kép `"` trong mật khẩu PostgreSQL. Dấu `;` ngăn các phần trong chuỗi kết nối nên sẽ cắt mật khẩu làm đôi, dấu `"` làm hỏng cách PowerShell truyền tham số; lỗi hiện ra là "password authentication failed", rất khó đoán nguyên nhân. Mật khẩu có các dấu này thì nên đổi mật khẩu khác. Lưu ý này áp dụng cho cả mục 13.

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
npm ci
npm run dev
```

`npm ci` cài **đúng** phiên bản các gói đã khóa trong `package-lock.json` (xóa `node_modules` cũ rồi cài lại), nên máy nào cũng giống máy làm bài. `npm install` thì có thể tự nâng phiên bản và sửa `package-lock.json`. Chỉ cần chạy `npm ci` lần đầu, hoặc khi `package-lock.json` đổi. Đợi dòng `Local: http://localhost:5173/`.

## 8. Địa chỉ

| Cái gì | Địa chỉ |
|---|---|
| Trang web | <http://localhost:5173> (Nhân viên, Phòng ban; bấm tên phòng ban để mở trang chi tiết `/departments/{id}`) |
| API | <http://localhost:5081/api/departments>, <http://localhost:5081/api/employees> |
| Trang tài liệu API (Swagger UI) | <http://localhost:5081/swagger> |
| Đặc tả OpenAPI (JSON) | <http://localhost:5081/openapi/v1.json> |

Trang tài liệu API chỉ có khi backend chạy ở môi trường Development (mặc định của `dotnet run`). Danh sách đủ 10 thao tác kèm JSON mẫu: [docs/danh-sach-api.md](docs/danh-sach-api.md).

Frontend phải chạy đúng cổng 5173: backend chỉ cho phép trang ở địa chỉ này gọi API (CORS). Địa chỉ backend mà frontend gọi nằm trong `frontend/.env.development` (`VITE_API_BASE_URL=http://localhost:5081`).

Mở trang bằng `http://localhost:5173`, **không** dùng `http://127.0.0.1:5173`: với trình duyệt đó là hai địa chỉ khác nhau, backend chỉ cho phép `localhost` nên trang sẽ báo "Không kết nối được máy chủ".

## 9. Kiểm nhanh

1. Mở <http://localhost:5173>, vào trang **Phòng ban**: thấy 4 phòng ban mẫu.
2. Vào trang **Nhân viên**, bấm **Thêm nhân viên**, nhập họ tên, email, chọn phòng ban, lưu: nhân viên mới hiện trong danh sách.
3. Sửa nhân viên đó, đổi email, lưu: danh sách cập nhật.
4. Gõ một phần họ tên hoặc email vào ô tìm kiếm: chỉ hiện người khớp (không phân biệt hoa thường). Gõ thừa khoảng trắng (ví dụ hai dấu cách giữa hai chữ) vẫn tìm ra, ô tìm tự gọn lại.
5. Xóa nhân viên đó: hộp xác nhận ghi họ tên kèm email; xác nhận thì người đó biến mất khỏi danh sách.
6. Thử xóa một phòng ban đang có nhân viên: ứng dụng báo không xóa được.

Muốn có sẵn nhiều nhân viên để demo tìm kiếm: xem mục 12.

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

Mức sàn của dự án: ít nhất 80% số dòng của các lớp service. Kiểm đủ một lượt (kiểu TypeScript, lint, định dạng TypeScript, build frontend, định dạng C# bằng `dotnet format` và test backend): `npm run verify` trong thư mục `frontend`.

**Con số độ phủ nói lên điều gì:** khi bảng tóm tắt ghi 100% cho `DepartmentService`, `EmployeeService`, đó là **100% số dòng C#** của các lớp service được unit test chạy qua. Unit test dùng database giả trong bộ nhớ (InMemory), nên các luật nằm ở PostgreSQL không đo được bằng con số này: chỉ mục không trùng theo `lower()`, khóa ngoại chặn xóa phòng ban còn nhân viên, thứ tự sắp xếp chữ tiếng Việt. Các luật đó được kiểm tay trên database thật (danh sách D1–D5 trong hồ sơ kiểm thử của phòng ban và nhân viên). "Tổng" trong bảng thấp hơn vì tính cả controller và migration, hai phần này kiểm tay theo quy ước của dự án.

**Vì sao lệnh đo độ phủ backend nằm trong `frontend/package.json`:** để mọi lệnh kiểm nằm chung một chỗ, gõ cùng một kiểu `npm run …` (dự án không có CI). Hai lệnh làm hai việc khác nhau: `npm run verify` kiểm kiểu TypeScript, lint, định dạng TypeScript, build frontend, kiểm định dạng C# (`dotnet format --verify-no-changes`, chỉ kiểm, không tự sửa file) và chạy test backend (không đo độ phủ), dùng trước mỗi lần commit; `npm run coverage` chạy test backend kèm đo độ phủ và in bảng phần trăm.

## 11. Sự cố thường gặp

Các lỗi dưới đây đã gặp thật khi làm bài trên Windows 11, không phải lỗi code.

- **`dotnet run` / `dotnet test` báo "Application Control policy has blocked this file" (0x800711C7).** Windows Smart App Control chặn file `.dll` vừa build. Thử build lại trước (`dotnet build backend/EmployeeCrud.slnx`) rồi chạy lại lệnh; vẫn bị chặn thì báo người hướng dẫn. **Đừng vội tắt Smart App Control:** trên Windows 11, tắt đi có thể không bật lại được nếu không cài lại Windows (tùy phiên bản; chưa kiểm trên máy làm bài). Muốn tắt thì đọc hướng dẫn của Microsoft về Smart App Control trước và hỏi người quản lý máy.
- **Build hoặc test báo không chép được file vì "being used by another process".** Backend vẫn đang chạy ở cửa sổ khác và giữ file `.exe`. Bấm `Ctrl+C` ở cửa sổ backend rồi chạy lại lệnh.
- **Gõ `psql` báo không tìm thấy lệnh.** Bộ cài PostgreSQL không tự thêm `psql` vào PATH. Dùng pgAdmin 4 (Query Tool) hoặc "SQL Shell (psql)" trong menu Start thay vì đổi PATH.
- **Trang báo "Không kết nối được máy chủ" dù backend đang chạy.** Kiểm thanh địa chỉ: phải là `http://localhost:5173`, không phải `http://127.0.0.1:5173` (xem mục 8).
- **Prettier báo "Code style issues" hàng loạt ngay sau khi clone hoặc pull trên Windows (`npm run verify` dừng ở bước kiểm định dạng).** Bản clone này làm **trước** khi repo có file `.gitattributes`. Git cài mặc định trên Windows đổi ký tự xuống dòng sang CRLF khi ghi file ra máy, còn Prettier của dự án đòi LF, nên file nào cũng bị báo sai dù code không sai. Cách gọn nhất: clone lại vào một thư mục mới; từ nay `.gitattributes` bắt mọi bản clone ra LF. Muốn giữ bản cũ: commit hết thay đổi trước (`git status` sạch), rồi mở Git Bash ở gốc repo và chạy `git ls-files --eol | grep -E 'w/(crlf|mixed)' | cut -f2 | grep -v '^aidlc/' | xargs -d '\n' dos2unix -b` (`dos2unix` có sẵn trong Git for Windows). Lệnh này chỉ đổi CRLF thành LF ở các file Git đang theo dõi, không đụng nội dung; cờ `-b` giữ nguyên dấu BOM ở đầu một số file C#, vì thiếu cờ này `dos2unix` sẽ xóa dấu đó và làm file đổi thật. Chạy xong, `git status` có thể vẫn liệt kê nhiều file là đã sửa: Git còn nhớ kích thước file lúc còn CRLF nên tưởng file đổi, dù nội dung y nguyên (`git diff` không ra gì). Chạy `git add -A` để Git đọc lại các file đó; chúng sẽ biến khỏi danh sách và không có gì mới được đưa vào commit.

## 12. Dữ liệu mẫu để demo

Database mới tạo chỉ có 4 phòng ban mẫu. File [docs/du-lieu-mau.sql](docs/du-lieu-mau.sql) thêm 4 phòng ban (Hành chính, Truyền thông, Mua hàng, Chăm sóc khách hàng) và **80 nhân viên tên giả** (email đuôi `@congty.example`), 9–12 người mỗi phòng, để demo danh sách, tìm kiếm, lọc theo phòng ban, số nhân viên từng phòng và xem tốc độ khi có nhiều dữ liệu.

1. pgAdmin 4 → `employee_db` → chuột phải → **Query Tool** → mở file `docs/du-lieu-mau.sql` → **Execute** (F5).
2. Câu đếm cuối file phải ra tổng `80`, và bảng số người từng phòng như ghi trong file. Chạy lại lần nữa vẫn an toàn (phòng ban, email đã có thì bỏ qua).
3. Xem tốc độ: gọi <http://localhost:5081/api/employees> vài lần (thời gian hiện ở thẻ Network của trình duyệt, hoặc Postman); chấm Lighthouse trên bản build (`npm run build` rồi `npm run preview` trong `frontend`), không chấm trên `npm run dev` vì bản dev không nén code nên điểm thấp sai.
4. Gỡ dữ liệu mẫu: làm theo khối hướng dẫn cuối file. Khối này chạy trong một transaction (lỗi giữa chừng thì không xóa gì) và chỉ dùng cho database demo trên máy. Lưu ý trước khi chạy:
   - Nó xóa **mọi** người có email đuôi `@congty.example`, kể cả người bạn tự thêm bằng đuôi email này.
   - Nó xóa 4 phòng có **tên trùng** 4 phòng thêm (Hành chính, Truyền thông, Mua hàng, Chăm sóc khách hàng) nếu phòng đó đã không còn ai, kể cả khi phòng đó do bạn tự tạo. 4 phòng mẫu của migration và phòng còn người luôn được giữ.

### Quy ước tên phòng ban

- Viết hoa chữ cái đầu, các chữ sau viết thường, trừ tên riêng và chữ viết tắt; không kèm chữ "Phòng". Ví dụ: `Kế toán`, `Nhân sự`, `Chăm sóc khách hàng`, `IT`.
- Cách viết này mượn quy tắc viết hoa tên cơ quan, tổ chức trong văn bản hành chính (Nghị định 30/2020/NĐ-CP về công tác văn thư). Nghị định đó dành cho cơ quan nhà nước; ở đây chỉ dùng làm mẫu cho thống nhất.
- Đây là gợi ý (hiện ngay dưới ô nhập tên), không phải luật kiểm: hệ thống không tự đổi chữ người dùng gõ, để giữ đúng chữ viết tắt như `IT`, `R&D`. Phòng ban đã có mà viết sai quy ước (ví dụ `Nhân Sự`) thì sửa bằng nút **Sửa** ở trang Phòng ban.

## 13. Tài khoản database riêng cho ứng dụng (khuyên dùng)

**Vì sao:** mục 3 cho ứng dụng dùng tài khoản `postgres`, tài khoản có quyền cao nhất (tạo, xóa cả database). Ứng dụng chỉ cần đọc và ghi hai bảng. Công ty thật cho mỗi ứng dụng một tài khoản chỉ đủ quyền nó cần (nguyên tắc quyền tối thiểu): lỡ lộ mật khẩu hay có lỗi bảo mật thì thiệt hại nhỏ hơn. Migration (tạo, sửa bảng) vẫn chạy bằng `postgres`. Làm mục này sau khi đã chạy migration ở mục 5.

**Bước 1. Tạo tài khoản.** pgAdmin 4 → `employee_db` → Query Tool (đang đăng nhập bằng `postgres`), chạy:

```sql
CREATE ROLE employee_app LOGIN;
GRANT CONNECT ON DATABASE employee_db TO employee_app;
GRANT USAGE ON SCHEMA public TO employee_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON departments, employees TO employee_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO employee_app;
```

Tài khoản này không có quyền tạo, sửa hay xóa bảng. Dòng cuối cho dùng bộ đếm sinh `id`. Không cần quyền với bảng lịch sử migration `__EFMigrationsHistory`, vì ứng dụng **không tự chạy migration** khi khởi động (migration luôn chạy tay bằng lệnh ở bước 4). Nếu sau này thêm bước tự migrate lúc khởi động thì phải dùng tài khoản có quyền sửa bảng.

**Bước 2. Đặt mật khẩu bằng hộp thoại của pgAdmin**, không gõ mật khẩu vào câu SQL (pgAdmin lưu lịch sử câu lệnh): Servers → PostgreSQL 18 → **Login/Group Roles** (bấm F5 nếu chưa thấy) → chuột phải `employee_app` → **Properties** → tab **Definition** → **Password** → **Save**.

**Bước 3. Cho ứng dụng dùng tài khoản mới.** Chạy lại khối lệnh ở mục 3, đổi `Username=postgres` thành `Username=employee_app` và nhập mật khẩu vừa đặt.

**Bước 4. Từ nay chạy migration bằng `postgres`**, vì `employee_app` không có quyền sửa bảng. Biến môi trường `ConnectionStrings__Default` được ưu tiên hơn user-secrets và chỉ sống trong cửa sổ PowerShell đang mở; khối `finally` xóa nó ngay sau khi chạy:

```powershell
$s = Read-Host "Mat khau postgres" -AsSecureString
$b = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)
try {
    $env:ConnectionStrings__Default = "Host=localhost;Port=5432;Database=employee_db;Username=postgres;Password=" + [Runtime.InteropServices.Marshal]::PtrToStringBSTR($b)
    dotnet ef database update --project backend/EmployeeCrud.Api
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b)
    Remove-Item Env:ConnectionStrings__Default -ErrorAction SilentlyContinue
    Remove-Variable s, b -ErrorAction SilentlyContinue
}
```

**Kiểm:**
- Chạy backend (mục 6) và làm "Kiểm nhanh" (mục 9): đọc, thêm, sửa, xóa đều được.
- Trong Query Tool (đăng nhập `postgres`), thử quyền của tài khoản mới: `SET ROLE employee_app; CREATE TABLE thu_quyen (id int);` → phải báo `permission denied for schema public`. Sau đó chạy `RESET ROLE;` để trở về `postgres`. Nếu pgAdmin báo `current transaction is aborted` (giao dịch đã lỗi), chạy `ROLLBACK;` trước rồi mới `RESET ROLE;`.

**Lưu ý:** sau này migration thêm bảng mới thì phải cấp quyền cho bảng đó (chạy lại dòng `GRANT SELECT, INSERT, UPDATE, DELETE ON <tên bảng> TO employee_app;` và dòng `GRANT … SEQUENCES`).

## 14. Cấu hình log

Trong `backend/EmployeeCrud.Api/appsettings.json`, bốn nhóm log của EF Core (`Database.Command`, `Database.Connection`, `Query`, `Update`) đặt mức `Critical`. **Đừng xóa bốn dòng này.**

Vì sao: khi một câu SQL lỗi, EF Core tự ghi một dòng Error, rồi ứng dụng lại ghi thêm một dòng Error cho cùng lỗi đó. Đặt `Critical` để mỗi lỗi chỉ còn **một** dòng Error (do `ProblemDetailsExceptionHandler` ghi, kèm `traceId` giống trong body lỗi 500), và các lỗi đã xử lý thành 409 (ví dụ trùng email khi hai người lưu cùng lúc) không sinh dòng Error. Log gọn thì dò lỗi bằng `traceId` nhanh hơn.

Muốn xem câu SQL khi học: đổi tạm `Microsoft.EntityFrameworkCore.Database.Command` trong `appsettings.Development.json` sang `Information`, xem xong đổi lại `Critical`.

## 15. Hướng phát triển

Bài làm đúng phạm vi `docs/ke-hoach.md`. Hai việc dưới đây công ty thật thường làm nhưng đề bài không yêu cầu, nên chưa làm:

- **Xóa mềm:** thay vì xóa hẳn dòng, thêm cột `deleted_at` và ẩn các dòng đã đánh dấu; khôi phục được khi xóa nhầm. Bài này xóa hẳn, có hộp xác nhận ghi rõ tên (và email với nhân viên).
- **Nhật ký thay đổi:** ghi lại ai sửa gì, lúc nào, giá trị trước và sau. Cần có đăng nhập mới biết "ai", mà đề bài không có đăng nhập.

## 16. Tài liệu khác

- [docs/so-do-database.md](docs/so-do-database.md): sơ đồ hai bảng, cột, ràng buộc, cách đối chiếu bằng pgAdmin.
- [docs/danh-sach-api.md](docs/danh-sach-api.md): 10 thao tác API kèm JSON mẫu, ví dụ lỗi 400/404/405/409/415/500, cách gọi bằng Postman.
- [docs/du-lieu-mau.sql](docs/du-lieu-mau.sql): 80 nhân viên mẫu và 4 phòng ban thêm để demo (mục 12).
- [docs/ke-hoach.md](docs/ke-hoach.md): đề bài thực tập.
