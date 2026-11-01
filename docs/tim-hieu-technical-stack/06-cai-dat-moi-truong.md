# 06. Cài đặt môi trường trên máy cá nhân

> Ứng với **Ngày 1–2: "Cài môi trường"** trong kế hoạch.
> Trạng thái máy (kiểm lại ngày 30/10/2026): **đã đủ**. Hiệp đã cài .NET SDK 10.0.403 (ASP.NET Core 10.0.14) và PostgreSQL 18.6 + pgAdmin 4 theo hướng dẫn dưới đây. Node.js v24.15.0, npm 11.16.0, Git 2.54.0, Postman 12.18.5, VS Code + C# Dev Kit có sẵn từ trước.
> Phần dưới giữ lại để cài trên máy khác hoặc làm căn cứ viết README.

## 1. Cài .NET 10 SDK

**SDK khác runtime ở đâu?**
- **Runtime** là bộ để *chạy* chương trình đã build sẵn.
- **SDK** là bộ để *viết và build* chương trình, có kèm runtime.

Làm bài cần **SDK**. Trước khi cài, máy chỉ có runtime .NET 10 của riêng tiện ích VS Code, không có SDK, nên không dùng để làm bài được.

1. Mở trang tải chính thức: <https://dotnet.microsoft.com/en-us/download/dotnet/10.0>
2. Ở cột **SDK 10.0.x**, dòng **Windows**, chọn **x64 Installer**. Chọn **SDK**, đừng chọn mục "Runtime".
3. Chạy file vừa tải, bấm **Install**, đồng ý hộp xin quyền admin. Trình cài **tự thêm `dotnet` vào PATH**.
4. **Đóng hết cửa sổ terminal và VS Code rồi mở lại**, vì terminal cũ không nhận PATH mới.
5. Kiểm tra:
   ```powershell
   dotnet --list-sdks        # phải thấy dòng 10.0.xxx
   dotnet --list-runtimes    # phải thấy Microsoft.AspNetCore.App 10.0.x
   ```
6. Tin cậy chứng chỉ HTTPS dùng khi chạy ở máy cá nhân. Không có bước này, trình duyệt báo "không an toàn" khi gọi `https://localhost`:
   ```powershell
   dotnet dev-certs https --trust     # bấm Yes ở hộp thoại hiện ra
   ```

## 2. Cài PostgreSQL 18 (kèm pgAdmin)

1. Mở trang chính thức: <https://www.postgresql.org/download/windows/>, bấm **Download the installer**. Trang này dẫn sang bộ cài của EDB, nơi postgresql.org giới thiệu cho Windows.
2. Chọn bản **18.x**, Windows x86-64, rồi tải và chạy.
3. Đi qua từng màn hình:

| Màn hình | Chọn | Vì sao |
|---|---|---|
| Installation Directory | Để mặc định (`C:\Program Files\PostgreSQL\18`) | Hướng dẫn trên mạng đều giả định đường dẫn này |
| Select Components | ✅ PostgreSQL Server, ✅ pgAdmin 4, ✅ Command Line Tools; ⬜ **bỏ** Stack Builder | Stack Builder để cài thêm tiện ích, bài này chưa cần |
| Data Directory | Để mặc định | Nơi lưu dữ liệu thật |
| **Password** | Đặt mật khẩu cho tài khoản quản trị `postgres`, **ghi lại** | Cần khi mở pgAdmin và khi viết connection string. **Không** đưa mật khẩu này lên Git |
| Port | **5432** (mặc định) | Connection string trong tài liệu dùng cổng này |
| Locale | Default locale | |
| Summary → Next → Finish | Bỏ chọn "Launch Stack Builder" nếu được hỏi | |

4. Kiểm tra dịch vụ đã chạy:
   ```powershell
   Get-Service postgresql*      # Status phải là Running
   ```
5. Kiểm tra kết nối bằng một trong hai cách:
   - **pgAdmin 4** (Start menu): bấm vào *Servers → PostgreSQL 18*, nhập mật khẩu ở bước 3. Mở **Query Tool**, chạy `SELECT version();`.
   - **SQL Shell (psql)** (Start menu): Enter qua các câu hỏi mặc định, nhập mật khẩu, rồi gõ `SELECT version();`.
6. Tạo sẵn database cho bài. Cách dễ nhất: trong pgAdmin, bấm chuột phải **Databases → Create → Database...**, gõ `employee_db`, bấm **Save**. Hoặc chạy lệnh dưới đây trong Query Tool/psql. Lệnh này phải chạy riêng, không chạy chung với lệnh khác:
   ```sql
   CREATE DATABASE employee_db;
   ```

**Về PATH:** bộ cài này **không tự thêm** `psql` vào PATH. Điều này đã xác nhận trên máy ngày 30/10/2026: cài xong, gõ `psql` vẫn báo không tìm thấy. Vì vậy gõ `psql` trong terminal thường sẽ báo không tìm thấy. Không sao: dùng *SQL Shell (psql)* hoặc *pgAdmin* trong Start menu là đủ cho 2 tuần. Nếu muốn gõ `psql` ở mọi terminal thì thêm `C:\Program Files\PostgreSQL\18\bin` vào PATH của user. Bước này đổi cấu hình máy nên tùy bạn, không bắt buộc.

**Lưu ý hiển thị tiếng Việt:** khi mở psql trên Windows có thể thấy cảnh báo *"Console code page differs from Windows code page"*, và chữ có dấu hiện sai trong cửa sổ đó. Dữ liệu trong database vẫn đúng; muốn xem chữ có dấu thì dùng pgAdmin.

## 3. Kiểm tra tổng sau khi cài

Mở **terminal mới** và chạy:

```powershell
dotnet --list-sdks
node -v
npm -v
git --version
Get-Service postgresql*
```

Hoặc nhắn em "kiểm lại máy", em chạy lại bước kiểm.

| Cần có | Kết quả mong đợi |
|---|---|
| .NET SDK | `10.0.xxx` |
| Node.js | `v24.15.0` (đã có) |
| npm | `11.16.0` (đã có) |
| Git | `2.54.0` (đã có) |
| PostgreSQL | Dịch vụ `postgresql-x64-18` ở trạng thái `Running` (tên có thể khác chút theo bản) |

## 4. Gặp lỗi thì xem đây

| Triệu chứng | Nguyên nhân hay gặp | Cách xử lý |
|---|---|---|
| Đã cài mà `dotnet` vẫn báo không tìm thấy | Terminal/VS Code mở từ trước khi cài | Đóng hết, mở lại; vẫn lỗi thì khởi động lại máy |
| `dotnet --list-sdks` trống | Lỡ cài Runtime thay vì SDK | Quay lại bước 1.2, chọn đúng SDK |
| pgAdmin báo sai mật khẩu | Nhập nhầm mật khẩu `postgres` | Nhập lại mật khẩu đã đặt lúc cài |
| Cài PostgreSQL báo cổng 5432 đã dùng | Có một PostgreSQL khác đang chạy | Báo em kiểm, không tự gỡ |
| Trình duyệt báo chứng chỉ không an toàn ở `https://localhost` | Chưa tin cậy chứng chỉ phát triển | Chạy `dotnet dev-certs https --trust` |
| Gõ "SQL" hay "PostgreSQL" ở ô tìm kiếm Windows không thấy ứng dụng | Ô tìm kiếm chưa cập nhật; tên ứng dụng là "pgAdmin 4" | Start → All apps → thư mục **PostgreSQL 18** → pgAdmin 4, hoặc gõ `pgAdmin` |
| pgAdmin đứng ở "Waiting for pgAdmin 4 to start..." | Lần đầu khởi động chậm | Đợi 30–60 giây, đừng bấm mở thêm |

## 5. Câu hỏi tự kiểm

1. SDK và runtime khác nhau thế nào? Vì sao máy có runtime .NET 10 mà vẫn không làm bài được?
2. Vì sao phải mở lại terminal sau khi cài?
3. Mật khẩu `postgres` sẽ dùng ở những đâu? Vì sao không được đưa lên Git?
4. Cổng 5432 là gì? Connection string ở file 03 dùng nó ở chỗ nào?

## Nguồn

- [Tải .NET 10](https://dotnet.microsoft.com/en-us/download/dotnet/10.0), [PostgreSQL cho Windows](https://www.postgresql.org/download/windows/): trang tải chính thức. Hôm nay em chưa mở lại hai trang này, nên tên nút và các màn hình cài có thể khác chút.
- Kết quả kiểm máy: các lệnh `Get-Command`, `node -v`, `git --version`, `Get-Service`, chạy ngày 30/10/2026.
