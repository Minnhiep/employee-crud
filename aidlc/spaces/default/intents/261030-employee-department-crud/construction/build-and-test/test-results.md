# Kết quả Build and Test

> **Nguồn lệnh:** `unit-test-instructions.md` của U1–U5 (mỗi lệnh khác nhau chạy một lần), `build-instructions.md`, `integration-test-instructions.md`. Đối chiếu với `code-summary.md` và `code-generation-plan.md` (Testing Contract) của từng Unit.
>
> Máy: Windows 11, .NET SDK 10.0.403, Node 24.15.0, PostgreSQL 18.6. Giờ ghi theo UTC (giờ Việt Nam = UTC + 7).

## Lượt chạy 1 — 2026-11-02T18:29Z

**Kết quả: KHÔNG ĐẠT** (2 mục tiêu Không đạt, có gốc ở code U1) → quay lại Code Generation U1 (Loop-back 1, cuối file).

### 1. Build

| Lệnh | Mã thoát | Kết quả |
|---|---|---|
| `npm --prefix frontend run verify` (typecheck → lint → format:check → build → `dotnet test` cả solution) | 0 | `tsc` 0 lỗi; ESLint 0 lỗi, 0 cảnh báo; Prettier sạch; Vite build: JS 281,46 KB (nén 88,00 KB), CSS 6,50 KB; backend build 0 lỗi |
| `dotnet format backend/EmployeeCrud.slnx --verify-no-changes` | 0 | Sạch |
| `npm --prefix frontend audit --omit=dev` | 0 | 0 lỗ hổng (gói chạy trong trình duyệt) |

### 2. Unit test

| Lệnh (nguồn) | Mã thoát | Đạt / Tổng |
|---|---|---|
| `dotnet test ../backend/EmployeeCrud.slnx` (trong `verify`) | 0 | **94 / 94** |
| U1: `dotnet test backend/EmployeeCrud.Api.Tests/EmployeeCrud.Api.Tests.csproj --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Platform"` | 0 | 19 / 19 |
| U3: `dotnet test backend/EmployeeCrud.slnx --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Departments"` | 0 | 28 / 28 (25 của U3 + D1–D3 của U4) |
| U4: `dotnet test backend/EmployeeCrud.slnx --filter "...Employees\|...Departments"` | 0 | 75 / 75 |
| U2: `lint`, `typecheck`, `format:check`, `build` | 0 | Đạt (chạy trong `verify`, cùng lệnh) |
| U5: T1–T6 (PowerShell) | — | T1 = 10; T2: 4 mục lỗi (400, 404, 409 ×2), 5 dòng `problem+json`; T3 = 3; T4 = 12 mục; T5 = 4; T6: 3 dòng `Password=` đều là `$p`, mẫu tìm-thay hoặc `***` |

Không có test bị bỏ qua, không có test lỗi.

### 3. Độ phủ (`npm --prefix frontend run coverage`, mã thoát 0)

Báo cáo: `backend/TestResults/coverage-report/index.html`, `Summary.txt` (coverlet + reportgenerator 5.5.12).

| Lớp | Độ phủ dòng | Mức sàn |
|---|---|---|
| `EmployeeCrud.Api.Departments.DepartmentService` | **100%** | ≥ 80% (`team.md`) → Đạt |
| `EmployeeCrud.Api.Employees.EmployeeService` | **100%** | ≥ 80% → Đạt |
| `ErrorMapper` / `ValidationResponseFactory` / `StatusCodeProblemWriter` / `ProblemDetailsExceptionHandler` | 97,6% / 95,8% / 93,5% / 80% | Không có mức sàn riêng |
| Cả assembly (gồm controller, migration không có test tự động theo `team.md`) | 43,3% | Không phải tiêu chí; ghi để minh bạch |

### 4. Gọi API thật (backend `--launch-profile http`, PostgreSQL thật, `HttpClient` của PowerShell)

| # | Lời gọi | Kết quả |
|---|---|---|
| 1 | `POST /api/departments` `{"name":""}`, Origin 5173 | 400, **`Content-Type: application/json; charset=utf-8`**, body `{"title":"Dữ liệu không hợp lệ","status":400,"errors":{"name":[...]}}` — **không có `type`, không có `traceId`** |
| 2 | `POST /api/employees` họ tên rỗng + email "abc" + `departmentId` null | 400 như trên, chỉ có `errors.fullName` (thiết kế U4: báo lỗi đầu tiên) |
| 3 | `POST /api/employees` `"departmentId":"abc"` | 400 (không 500), `errors.departmentId` "Giá trị không đúng kiểu dữ liệu" kèm `errors.body`; Content-Type như #1 |
| 4 | `GET /api/khong-ton-tai` ×10 | 404 `application/problem+json`; trung vị **0,55 ms** (0,3–3 ms) |
| 5 | CORS trên 404 | Origin 5173 → `Access-Control-Allow-Origin: http://localhost:5173`; origin lạ → không có header |
| 6 | `POST /api/departments` "Kế toán" (trùng) | 409 `application/problem+json`, có `type` RFC 9110 §15.5.10, `errors.name`, có header CORS; 567 ms (lần ghi đầu sau khởi động) |
| 7 | `POST /api/departments` body 40 KB | 400 `problem+json` "Tên phòng ban tối đa 100 ký tự" (service). Không có giới hạn 32 KB: đã bỏ có chủ đích ở NFR Design U1 |
| 8 | Thời gian, 3 lần lấy lớn nhất | `/api/departments` 61,9 ms; `/api/employees` 22,5 ms; `?search=an` 11,6 ms |
| 9 | OpenAPI | `/openapi/v1.json`: 4 đường dẫn, **10 thao tác**; `/swagger/index.html` 200 |
| 10 | Khởi động | `dotnet run --no-build`: API trả lời trong chưa tới 1 giây kể từ lúc bắt đầu chờ |

Không tạo hay xóa dữ liệu nào ở lượt này (mọi lời gọi ghi đều bị từ chối).

### 5. Quét

| Lệnh | Kết quả |
|---|---|
| `git grep --untracked -i -n -E '(password\|pwd)\s*=\|"password"\s*:' -- backend frontend` | 0 dòng |
| `git grep --untracked -n -E 'dangerouslySetInnerHTML\|innerHTML\|eval\(\|new Function\|FromSqlRaw\|ExecuteSqlRaw\|mailto:\|EnableSensitiveDataLogging' -- backend frontend/src` | 0 dòng |
| `git grep -n 'credentials' -- frontend/src` | 0 dòng |
| Trường `static` trong backend (trừ migration) | Chỉ `static readonly Regex EmailPattern`, `static readonly Expression ToDto` (không giữ dữ liệu) |
| `git log -- <2 file migration>` | Mỗi file đúng 1 commit (`ca66dbf`, `b3bc5e4`): chưa bị sửa sau khi tạo |

### 6. Chi tiết lỗi

**BT-01 (Không đạt, C3-400).** Lỗi 400 do kiểm DTO trả `application/json`, thiếu `type`. Hợp đồng C3 (`inception/contract-design/contract-summary.md`) yêu cầu `application/problem+json` có `type`, như 404 và 409 (vẫn đúng). Gốc: `ValidationResponseFactory.Create` (U1) có đặt `ContentTypes = { "application/problem+json" }`, nhưng `[Produces("application/json")]` trên `DepartmentsController` (U3) và `EmployeesController` (U4) là bộ lọc kết quả, ghi đè loại nội dung của `BadRequestObjectResult`. `ValidationProblemDetails` được dựng tay nên không có `type`, `traceId`. Ảnh hưởng: `frontend/src/api/client.ts` (`readProblem`) chỉ đọc body khi có `application/problem+json`, nên với loại 400 này giao diện chỉ hiện câu chung. Trên giao diện ít gặp, vì form React tự kiểm trước khi gửi; ảnh hưởng chính là API lệch hợp đồng (Postman, tài liệu API).

**BT-02 (Không đạt, U1-NFR3.3).** `ErrorMapper.MapPostgres` (U1) chỉ nhận 23505 và 23503; PostgreSQL 18 báo **23001** (restrict_violation) khi xóa phòng ban còn nhân viên (`ON DELETE RESTRICT`, thấy thật ở U4 và U5). Đi tới tầng dự phòng này thì 23001 + ràng buộc đã biết `fk_employees_department` ra 500. Đường xóa thật đã an toàn vì `DepartmentService.DeleteAsync` (U4) tự bắt cả 23503 và 23001; chỗ hở chỉ ở tầng dự phòng, trái NFR3.3 của U1.

### 7. Chưa kiểm ở lượt này (làm một lần sau khi sửa U1)

Luồng chính trên trình duyệt (F, V; Hiệp), Lighthouse 6 trang và Best Practices, W3C Validator, danh sách WCAG, hạn 10 giây (E1), tắt PostgreSQL giữa chừng (U1 NFR1.4), console sạch (E2).

## Lượt chạy 2 — 2026-11-02T19:00Z (dừng giữa chừng)

Sau Loop-back 1 (U1 sửa xong, Hiệp duyệt checkpoint), lượt 2 đã chạy phần kiểm của AI (độ phủ 100/100, 96/96 test, E1–E3, WCAG trên DOM 6 trang) thì Hiệp yêu cầu **làm lại giao diện** (Change Request ngày 03/11, ghi trong audit): quay lại Code Generation U2 → U3 → U4, chỉ đổi giao diện, không thêm tính năng. Kết quả giao diện của lượt 2 không còn đúng với code mới nên **không dùng**; mọi mục giao diện được kiểm lại ở lượt 3.

## Lượt chạy 3 — 2026-11-03T02:30Z (sau khi làm lại giao diện)

Code đã kiểm: commit `4c1ceb3` (sửa lỗi U1), `0c23b04` (giao diện U2–U4), cộng commit hồ sơ AI-DLC; cây làm việc sạch lúc bắt đầu.

### 1. Build và unit test

| Lệnh | Mã thoát | Kết quả |
|---|---|---|
| `npm --prefix frontend run verify` | 0 | typecheck, ESLint (0 cảnh báo), Prettier, Vite build (JS 293,06 KB, CSS 16,34 KB) đều sạch; `dotnet test`: **96/96 đạt** |
| `npm --prefix frontend run coverage` (dừng backend nền trước, vì backend giữ file `.exe`, lỗi MSB3027 ở lần chạy đầu) | 0 | `DepartmentService` **100%**, `EmployeeService` **100%** dòng (mức sàn 80%). Toàn assembly 43,7% vì controller, migration không thuộc phạm vi đo theo `team.md` |

### 2. Kiểm trên trình duyệt thật (Playwright điều khiển Chromium, backend + PostgreSQL thật, `npm run dev`)

| Mục | Kết quả |
|---|---|
| 7 trang (`/employees`, `/employees/new`, `/employees/1/edit`, `/departments`, `/departments/new`, `/departments/2/edit`, trang không tồn tại) | Mỗi trang: `lang="vi"`, đúng 1 `h1`, 1 `main`, tiêu đề tab đúng; 0 id trùng, 0 ô thiếu nhãn, 0 nút/liên kết thiếu tên; bảng có `caption` |
| Độ rộng 1920, 1366, 1024, 768, 360, 320px | Cả 7 trang không trang nào cuộn ngang ở bất kỳ độ rộng nào |
| W3C Validator (`validator.w3.org/nu`, gửi HTML đã vẽ của 7 trang; Hiệp chọn AI gửi) | **0 lỗi** cả 7 trang. Cảnh báo duy nhất: `type` thừa ở thẻ `<style>` do Vite chèn khi chạy chế độ dev (bản build dùng `<link>`), không phải code dự án |
| Console khi đi 7 trang (E2) | 0 lỗi, 0 cảnh báo |
| Hạn chờ (E1, U2-NFR5.3): chặn `/api/employees` không trả lời | Sau **10,6 giây** (kể cả lúc tải trang) hiện "Không kết nối được máy chủ, vui lòng thử lại" + "Thử lại" |
| 400 thật hiện trên form (BT-01): sửa body gửi đi thành `departmentId: "abc"` để vượt kiểm của form | API trả **400 `application/problem+json`** có `type` và `traceId`; form hiện khung tóm tắt "Phòng ban: Giá trị không đúng kiểu dữ liệu", khung nhận focus, địa chỉ không đổi, không tạo dữ liệu |
| Luồng thêm/sửa/xóa, tìm, Back/Forward, focus, hộp xác nhận, 409, 404, tắt backend, dữ liệu dài | Đạt trong lúc làm U3, U4 Step 10 (chi tiết: `u3-departments/code-generation/code-summary.md` §4b, `u4-employees/code-generation/code-summary.md` §5b). Dữ liệu thử đã xóa: còn 4 phòng ban, 1 nhân viên |

### 2b. Luồng chính F01–F14, kiểm dữ liệu V01–V07 (Hiệp nhờ AI kiểm, tin nhắn 21d0cfc4)

Chạy trên **hai server Hiệp tự bật theo README** (`dotnet run --project backend/EmployeeCrud.Api`, `npm run dev`), Playwright điều khiển Chromium, 1366×768. Dữ liệu thử "Nhân Viên Demo" đã xóa; sau kiểm còn đúng 1 nhân viên.

| ID | Kết quả | Đạt |
|---|---|---|
| F01 | "Đang tải dữ liệu…" rồi bảng: "ĐA Đỗ Văn An, do.an@congty.vn, Kỹ thuật" | Đạt |
| F02 | (API giả lập trả `[]`) "Chưa có nhân viên nào" + "Thêm nhân viên đầu tiên và chọn phòng ban cho họ." + nút "Thêm nhân viên" | Đạt |
| F03–F05 | `văn`, `AN`, `an`, `congty` đều ra Đỗ Văn An, "Tìm thấy 1 nhân viên", địa chỉ có `?search=` | Đạt |
| F06 | `zzz` → "Không tìm thấy nhân viên phù hợp" + `Không có họ tên hoặc email nào chứa "zzz".` + "Xóa tìm kiếm"; bấm → `/employees`, đủ danh sách | Đạt |
| F07 | "Đã thêm nhân viên "Nhân Viên Demo""; dòng mới có trong bảng (vòng "ND", Kế toán) | Đạt |
| F08 | Ô chọn: "Chọn phòng ban", Kế toán, Kinh doanh, Kỹ thuật, Nhân sự (đủ 4 phòng từ API) | Đạt |
| F09 | Đổi sang Kinh doanh → "Đã cập nhật nhân viên…", bảng đổi | Đạt |
| F10 | Đang ở form sửa Nhân Viên Demo, đổi địa chỉ sang sửa Đỗ Văn An → form nạp "Đỗ Văn An" | Đạt |
| F11 | Gõ tên mới rồi Hủy → về `/employees`, dữ liệu không đổi | Đạt |
| F12 | Xóa → hộp xác nhận → "Xóa nhân viên" → dòng biến mất không F5, "Đã xóa nhân viên…", focus `h1` | Đạt |
| F13 | Xóa → Hủy → dòng còn, focus về nút Xóa của dòng | Đạt |
| F14 | Dữ liệu còn sau khi backend khởi động lại: Đỗ Văn An còn qua 3 lần tắt/bật backend hôm nay và khi Hiệp tự bật | Đạt |
| V01 | Bỏ trống họ tên → "Vui lòng nhập họ tên", khung tóm tắt nhận focus, **0 request** ghi | Đạt |
| V02 | `abc` → "Email không đúng định dạng" | Đạt |
| V03 | Không chọn phòng ban → "Vui lòng chọn phòng ban" | Đạt |
| V04, V05 | `do.an@congty.vn` và `DO.AN@CONGTY.VN` → 409, "Email đã được sử dụng" cạnh ô Email | Đạt |
| V06 | Bấm đúp "Lưu nhân viên" → đúng **1 POST** | Đạt |
| V07 | Tắt backend → "Không kết nối được máy chủ, vui lòng thử lại" + "Thử lại" | Đạt (kiểm khi làm U4 Step 10 cùng ngày, code không đổi từ đó) |

Request ghi đã gửi: POST (409), POST (409), POST (201), PUT, DELETE. Ảnh: `.playwright-mcp/bt3-tim-AN.png`, `.playwright-mcp/bt3-tim-zzz.png`.

### 2c. Database tắt giữa chừng (U1-NFR1.4) và số dòng log lỗi (U1-NFR6.2, NFR6.3)

Hiệp tắt dịch vụ `postgresql-x64-18` từ terminal VS Code (`Start-Process powershell -Verb RunAs ... Stop-Service`, bấm Yes ở UAC vì dịch vụ chạy dưới `NT AUTHORITY\NetworkService`, terminal không có quyền Admin), trong lúc backend (5081) và frontend (5173) của Hiệp vẫn chạy.

| Mục | Kết quả | Đạt |
|---|---|---|
| Trang khi DB tắt | Ảnh Hiệp: "Đang tải dữ liệu…" trong lúc backend thử kết nối; `curl /api/employees` → **500 `application/problem+json`**, chỉ "Lỗi máy chủ" / "Đã có lỗi xảy ra, vui lòng thử lại sau.", sau 4,1 giây | Đạt |
| Backend không dừng | Ảnh Hiệp: terminal `dotnet` vẫn chạy, chỉ in log lỗi | Đạt |
| Tự nối lại | Hiệp bật lại dịch vụ (`Running`), bấm Thử lại/F5 → bảng hiện Đỗ Văn An, không khởi động lại backend | Đạt → **U1-NFR1.4 Met** |
| Số dòng `fail:` cho **một** lỗi 500 do DB (backend phụ cổng 5082, đọc log) | **3 dòng**: `Microsoft.EntityFrameworkCore.Database.Connection[20004]`, `Microsoft.EntityFrameworkCore.Query[10100]` (kèm stack trace), `ProblemDetailsExceptionHandler` ("Lỗi không xử lý: GET /api/employees"). Middleware `UseExceptionHandler` của .NET 10 không ghi thêm | **Không đạt U1-NFR6.2** ("mỗi lỗi 500 ghi đúng một dòng mức Error") — xem BT-03 |
| 409 có ghi Error không (U1-NFR6.3) | `POST` trùng email (khác hoa thường) và `DELETE /api/departments/3` (còn nhân viên) → 409, log chỉ 2 dòng `info:` "409 POST …", "409 DELETE …" | Đạt |

**BT-03 (Không đạt, U1-NFR6.2).** `appsettings.json` (U1) đặt `Microsoft.EntityFrameworkCore` ở mức `Warning` để ẩn câu SQL (NFR6.1), nhưng mức này vẫn cho các dòng Error của chính EF Core đi qua. Khi DB lỗi, EF Core tự ghi 2 dòng Error trước khi exception tới `ProblemDetailsExceptionHandler`, nên một lỗi 500 thành 3 dòng Error. Người dùng không bị ảnh hưởng (phản hồi vẫn đúng C3); chỉ log server bị lặp. Lượt 1 chấm U1-NFR6.2 "Met" bằng đọc code, chưa gây lỗi DB thật; lượt này gây thật nên thấy.

### 2d. Sau Loop-back 2 (U1 Step 10 + R-07, Hiệp duyệt U1)

`appsettings.json` thêm 4 nhóm EF Core ở `Critical` (`Database.Command`, `Database.Connection`, `Query`, `Update`); `appsettings.Development.json` đổi `Database.Command` từ `Warning` sang `Critical`. Kiểm bằng backend phụ cổng 5082 (không cần Admin, không tắt DB thật):

| Ca | Trước sửa | Sau sửa | Đạt |
|---|---|---|---|
| Một lỗi 500 do DB không kết nối được (`Port=5999`) | 3 dòng `fail:` | **1** dòng `fail:` (`ProblemDetailsExceptionHandler`, có "Failed to connect" và stack trace) | Đạt (U1-NFR6.2) |
| 8 yêu cầu thêm cùng email gửi cùng lúc (chỉ mục unique chặn 7 cái → 409) | 7 dòng `fail: ...Database.Command[20102]` (phát hiện ở rà soát U1, R-07) | **0** dòng `fail:`, 7 dòng `info: 409 POST` | Đạt (U1-NFR6.3) |
| 409 thường (trùng email, xóa phòng ban còn nhân viên) | 0 dòng `fail:` | 0 dòng `fail:` | Đạt |
| `npm --prefix frontend run verify` | — | 96/96, exit 0 | Đạt |

Nhân viên thử của ca 8 yêu cầu đã xóa; còn đúng Đỗ Văn An.

### 3. Truy vết liên Unit (Step 10)

Lần đầu: 1 ID chưa phủ (`u3-departments: NFR4.3`, đường dẫn cũ trước khi U4 dời file test bằng `git mv`). Sửa đường dẫn trong `u3-departments/code-generation/traceability.json`, chạy lại: **đạt, 0 ID chưa phủ**. Xem `cross-unit-traceability.md`.

### 4. Còn chờ Hiệp làm tay (Chrome thường)

Luồng chính tập demo (KH-1, KH-2, DEP-4), xem dữ liệu trong pgAdmin, tắt dịch vụ PostgreSQL giữa chừng (U1-NFR1.4), Lighthouse Desktop (Accessibility, Best Practices) cho 6 trang (U2-NFR8.3, U2-NFR8.4).

Kết quả: luồng chính đã kiểm ở §2b (trên server Hiệp tự bật), tắt PostgreSQL ở §2c; Lighthouse làm ở lượt 4 §5 vì giữa chừng có Change Request rà soát tổng thể.

## Lượt chạy 4 — 2026-11-03T06:45Z (sau Change Request rà soát tổng thể)

Hiệp duyệt kế hoạch lượt này (form fd428f8a). Code đã kiểm: cây làm việc sau khi Code Generation U1–U5 của đợt rà soát xong (nhóm 1–4 trong `ra-soat-tong-the.md`; review và checkpoint từng Unit đã qua). Thay đổi chưa commit lúc kiểm; Hiệp commit sau bước này.

### 1. PostgreSQL chỉ nghe localhost (S-01, Hiệp duyệt form 7e2b0671)

Hiệp làm trong PowerShell quyền Admin, AI chỉ từng bước; file nằm ngoài repo.

| Bước | Kết quả |
|---|---|
| Sao lưu | `C:\Program Files\PostgreSQL\18\data\postgresql.conf.bak-20261103` (`Test-Path` → `True`) |
| Trước khi sửa | dòng 60 `listen_addresses = '*'`; `postgresql.auto.conf` không có `listen_addresses` (không có gì đè lên) |
| Sửa | đọc và ghi bằng Latin-1 (giữ nguyên từng byte), chỉ thay dòng bắt đầu bằng `listen_addresses = '*'` thành `listen_addresses = 'localhost'`; lệnh đã chạy thử trên file giả trước (chỉ đổi 1 dòng, giữ CRLF và byte ngoài ASCII) |
| Khởi động lại | `Restart-Service postgresql-x64-18` → `Running` |
| Kiểm (AI) | `netstat -ano`: chỉ còn `127.0.0.1:5432` và `[::1]:5432` LISTENING |

### 2. Build, unit test, độ phủ

| Lệnh | Mã thoát | Kết quả |
|---|---|---|
| `npm --prefix frontend run verify` (backend tắt) | 0 | typecheck, ESLint (0 cảnh báo), Prettier, Vite build (JS 293,23 KB, CSS 16,34 KB); `dotnet test`: **118/118 đạt** |
| `npm --prefix frontend run coverage` (coverlet) | 1 | Smart App Control chặn `EmployeeCrud.Api.dll` (0x800711C7). Coverlet viết lại dll để gắn bộ đếm nên mỗi lần đo ra một file mới chưa có uy tín. Thêm 2 comment giải thích vào `Platform/Errors/DbConstraintNames.cs` (cách đã chốt trong `27-10/CLAUDE.md`, tối đa 2 lần) vẫn bị chặn |
| Microsoft Code Coverage 17.14.1 (Hiệp chọn, form 751b59be): `dotnet test backend/EmployeeCrud.slnx --collect "Code Coverage;Format=cobertura" --results-directory backend/TestResults/coverage-ms`, rồi `dotnet tool run reportgenerator ... -assemblyfilters:+EmployeeCrud.Api` | 0 | 118/118. `DepartmentService` **100%**, `EmployeeService` **100%** (`ValidInput` 100%), `TextInput` **100%** dòng (mức sàn 80%); `ErrorMapper` 97,6%. Toàn assembly 47% vì migration, code OpenAPI sinh ra và controller (kiểm tay theo `team.md`) là 0%. Công cụ này đo trong bộ nhớ, không viết lại dll nên không bị chặn. Script `coverage` và `team.md` giữ coverlet |

### 3. Backend với PostgreSQL localhost và tài khoản `employee_app`

Hiệp bật backend theo README (`dotnet run --project backend/EmployeeCrud.Api`, user-secrets dùng `employee_app` từ U5). AI gọi: `GET /api/departments` 200 (4 dòng), `GET /api/employees` 200 (12 dòng: 2 nhân viên có từ trước và 10 người từ `docs/du-lieu-mau.sql`), `?search=nguyễn` 200 (2 dòng).

### 4. Playwright hồi quy (bản build `npm run preview` của Hiệp, backend thật, chỉ đọc)

| Mục | Kết quả |
|---|---|
| 7 trang × 2 độ rộng (1366, 320 px) | Tiêu đề tab, `h1`, `lang="vi"` đúng; không trang nào cuộn ngang |
| Console và request | 0 lỗi, 0 cảnh báo, 0 request hỏng |
| N-03: tên phòng ban 101 ký tự | Ô nhận đủ 101 ký tự, hiện "Tên phòng ban tối đa 100 ký tự", không gửi POST |
| S-04 / N-09: tên phòng ban có U+200B, họ tên có U+202E | "Tên phòng ban chứa ký tự không hợp lệ", "Họ tên chứa ký tự không hợp lệ" |
| S-04: `GET /api/employees?search=%00` | `200 []` (trước đợt sửa: 500) |
| N-05: hộp xác nhận xóa | "Nhân viên Bùi Văn Nam (nam.bui@congty.example) sẽ bị xóa vĩnh viễn…"; bấm Hủy → hộp đóng, vẫn 12 nhân viên |
| N-07: Sửa rồi Hủy từ kết quả tìm | Về `/employees?search=nguyễn`, ô tìm giữ "nguyễn" |

Không ghi dữ liệu: form sai bị chặn ở trình duyệt, hộp xóa bấm Hủy.

### 5. Lighthouse Desktop (Hiệp, Chrome ẩn danh, Navigation, `npm run preview`)

| Trang | Performance | Accessibility | Best Practices |
|---|---|---|---|
| `/employees` | 100 | 100 | 100 |
| `/employees/new` | không đo | 100 | 100 |
| `/employees/2045/edit` | không đo | 100 | 100 |
| `/departments` | 100 | 100 | 100 |
| `/departments/new` | không đo | 100 | 100 |
| `/departments/2/edit` | không đo | 100 | 100 |

Mức cần: Performance ≥ 90 ở 2 trang danh sách, Accessibility = 100, Best Practices ≥ 90.

### 6. W3C và truy vết liên Unit

- **W3C:** không gửi lại. Phần giao diện của đợt rà soát chỉ thêm một thẻ `<strong>` (câu xác nhận xóa), là thẻ chữ hợp lệ ở mọi chỗ có chữ; kết quả 0 lỗi ở lượt 3 §2 vẫn dùng.
- **Truy vết:** `aidlc engine sensor-traceability --stage build-and-test` → `pass: true`, 0 ID chưa phủ.

### 7. Thay đổi ngoài công việc của Unit trong lượt này

- `backend/EmployeeCrud.Api/Platform/Errors/DbConstraintNames.cs`: thêm 2 comment giải thích (không đổi code) khi xử lý Smart App Control; file thuộc U1, đổi sau review U1.
- `postgresql.conf` trên máy (ngoài repo), có bản sao lưu.

## Lượt chạy 5 — 2026-11-04 (Change Request FR8: quan hệ phòng ban – nhân viên)

Code đã kiểm: cây làm việc sau Code Generation U3, U4, U5 của Change Request FR8, Loop-back 3 (U4) và Change Request kiểu liên kết (U4 Step 14). Hiệp duyệt kế hoạch lượt này (tin nhắn d652d18a). Chưa commit.

### 1. Dữ liệu mẫu (Hiệp chạy trong pgAdmin)

| Lần | Kết quả |
|---|---|
| Lần 1 | `tong_nhan_vien_mau` = 80 |
| Lần 2 (chạy lại) | vẫn 80; 9 phòng (8 phòng mẫu + "Văn Phòng" của Hiệp) |

### 2. Build, unit test, độ phủ

| Lệnh | Kết quả |
|---|---|
| `npm --prefix frontend run verify` | typecheck, ESLint 0 cảnh báo, Prettier, Vite build, `dotnet test` **138/138** (checkpoint U4 chạy lại sau từng lần sửa) |
| Microsoft Code Coverage + reportgenerator `-assemblyfilters:+EmployeeCrud.Api` | `DepartmentService` 100%, `EmployeeService` 100% (`ValidInput` 100%), `TextInput` 100%, `ErrorMapper` 97,6%; toàn assembly 47,6% (migration, OpenAPI sinh ra, controller ngoài phạm vi) |
| `aidlc engine sensor-traceability --stage build-and-test` | Lần đầu thiếu FR8/AC6.x (chưa ghi vào traceability code-generation U3–U5); bổ sung ánh xạ tới file thật, chạy lại: `pass: true`, 0 ID chưa phủ |

### 3. API thật (backend chạy từ dll, PostgreSQL localhost, 83 nhân viên)

| Lời gọi | 10 lần: trung vị / chậm nhất |
|---|---|
| `GET /api/employees` (83 dòng) | 4,1 ms / 6,7 ms |
| `GET /api/departments` (9 dòng, có `employeeCount`) | 1,8 ms / 11,2 ms |
| `GET /api/employees?departmentId=3` (14 dòng) | 2,6 ms / 17,5 ms |
| `GET /api/employees?search=nguyễn` (7 dòng) | 2,3 ms / 17,4 ms |

Thêm: 6 giá trị `departmentId` sai → 400 `errors.departmentId`; phòng không có → `[]`; xóa Kế toán → 409 "còn 11 nhân viên"; log SQL danh sách phòng ban là 1 câu có truy vấn con.

### 4. Playwright (bản build `npm run preview` của Hiệp, backend thật)

| Mục | Kết quả |
|---|---|
| 9 trang × 2 độ rộng (1366, 320 px), gồm `/departments/3`, `/employees?departmentId=3` | 1 `h1`, `lang="vi"`, không tràn ngang, 0 id trùng; trang Nhân viên 83 dòng tải xong (networkidle) khoảng 0,6 giây |
| Danh sách phòng ban | đủ 9 phòng với số người đúng API |
| Lọc Kỹ thuật + tìm "nguyễn" | "Phòng Kỹ thuật có 14 nhân viên" → "Tìm thấy 5 nhân viên ở phòng Kỹ thuật", 5 dòng, địa chỉ giữ `search` và `departmentId` |
| Hộp xóa Kỹ thuật | "Phòng ban Kỹ thuật còn 14 nhân viên…", nút Đóng + "Xem 14 nhân viên" |
| Trang chi tiết Kỹ thuật | h1 "Kỹ thuật", "14 nhân viên", 14 dòng |
| Hồi quy cũ | tìm "zzz" → "Không tìm thấy nhân viên phù hợp"; form bỏ trống → "Vui lòng nhập họ tên", không gửi POST |
| Loop-back 3 | lọc "Văn Phòng" (0 người) → "Thêm nhân viên" ở trạng thái rỗng → Hủy → `/employees?departmentId=21` |
| Kiểu liên kết (Step 14) | lúc thường rgb(27,36,48) đậm 600 không gạch; rê chuột rgb(15,98,197) gạch dưới; Tab: viền 3px |
| Console | sạch (2 request "failed" ở lần chạy đầu là do kịch bản chuyển trang khi request đang chạy; chạy lại có chờ: 0 lỗi) |

### 5. Khối gỡ dữ liệu mẫu (Hiệp, pgAdmin, không mất dữ liệu)

`BEGIN;` + 2 câu DELETE của khối gỡ + câu đếm: còn 0 người mẫu, 3 người Hiệp tự nhập, 5 phòng (4 phòng thêm đã rỗng bị xóa; 4 phòng mẫu và "Văn Phòng" còn). Sau `ROLLBACK;`: 80 / 83 / 9, về đúng như trước.

### 6. Lighthouse Desktop (Hiệp, Chrome ẩn danh, bản build, có 83 nhân viên)

7 trang (`/employees`, `/departments` có Performance; `/departments/3`, `/employees/new`, `/employees/2127/edit`, `/departments/new`, `/departments/3/edit`): **tất cả 100** (Performance 100 × 2, Accessibility 100 × 7, Best Practices 100 × 7). Chấm sau Step 14.

### 7. Thay đổi ngoài công việc của Unit trong lượt này

- File U2 sửa trong U4 (Hiệp duyệt): `ConfirmDialog.tsx`, `DataTable.tsx`, `PageHeader.tsx`, `StatusMessage.tsx`, `styles/components.css`.
- Comment giải thích trong `backend/EmployeeCrud.Api.Tests/TestSupport/ThrowingAppDbContext.cs` (vượt Smart App Control ở checkpoint U1).

## Loop-Back Log

### Loop-back 1 — 2026-11-02T18:29:13Z

- **Diagnosis:** BT-01 (400 do kiểm DTO trả `application/json`, thiếu `type`, vì `[Produces("application/json")]` của controller ghi đè loại nội dung mà `ValidationResponseFactory` đặt) và BT-02 (`ErrorMapper` không nhận 23001 nên tầng dự phòng trả 500).
- **Root-cause stage:** `code-generation`, Unit `u1-backend-platform` (`Platform/Errors/ValidationResponseFactory.cs`, `Platform/Errors/ErrorMapper.cs`). Không mở lại U3, U4: sửa ở tầng sở hữu phong bì lỗi C3.
- **Planned fix:** (1) `ValidationResponseFactory` trả 400 bằng kết quả mà bộ lọc `[Produces]` không ghi đè được, `Content-Type: application/problem+json`, thêm `type` (RFC 9110 §15.5.1) và `traceId` như 404/409; giữ nguyên `title`, `status`, `errors` (khóa camelCase). (2) `ErrorMapper` coi 23001 như 23503 ở tầng dự phòng → 409 "Không thể thực hiện". (3) Test hồi quy: một controller chỉ có trong test gắn `[Produces("application/json")]` gửi body sai → 400 `application/problem+json` có `type`; `ErrorMapperTests` thêm ca 23001 → 409. Hiệp duyệt lại kế hoạch sửa của U1 trước khi sửa (Hiệp chọn hai việc này ở đầu Build and Test).
- **Estimated impact:** công sức nhỏ (2 file code, 2–3 test, chạy lại bộ test và rà soát; khoảng 1 giờ kể cả duyệt); chi phí tiền 0; rủi ro thấp: chỉ đổi đường 400 do kiểm DTO và một nhánh dự phòng, 94 test hiện có canh giữ, hình dạng JSON chỉ thêm trường (`type`, `traceId`), `client.ts` không cần sửa.

### Loop-back 2 — 2026-11-03T02:51:46Z

- **Diagnosis:** BT-03 (U1-NFR6.2 Không đạt): khi database lỗi, một lỗi 500 sinh 3 dòng Error (`Microsoft.EntityFrameworkCore.Database.Connection[20004]`, `Microsoft.EntityFrameworkCore.Query[10100]`, rồi `ProblemDetailsExceptionHandler`). `appsettings.json` đặt `Microsoft.EntityFrameworkCore` ở `Warning`, mức này vẫn cho Error của EF Core đi qua. Thấy khi Hiệp tắt PostgreSQL thật (lượt 3 §2c).
- **Root-cause stage:** `code-generation`, Unit `u1-backend-platform` (`backend/EmployeeCrud.Api/appsettings.json`, cấu hình log do U1 sinh). Không mở lại U2–U5. Hiệp chọn sửa (form ba368783).
- **Planned fix:** thêm vào `Logging:LogLevel` ba nhóm của EF Core ở mức `Critical`: `Microsoft.EntityFrameworkCore.Database.Connection`, `Microsoft.EntityFrameworkCore.Query`, `Microsoft.EntityFrameworkCore.Update`, để lỗi chỉ được ghi một lần bởi `ProblemDetailsExceptionHandler` (đã có phương thức, đường dẫn, loại lỗi, thông điệp và stack trace của exception, kể cả exception bên trong của Npgsql). Kiểm: chạy một backend phụ ở cổng khác với chuỗi kết nối trỏ tới cổng database không có ai nghe (biến môi trường, không cần mật khẩu, không cần Admin, không tắt DB thật), gọi `/api/employees` một lần, đếm đúng 1 dòng `fail:`; gọi 2 ca 409 vẫn 0 dòng `fail:`; `verify` xanh. Hiệp duyệt lại kế hoạch U1 trước khi sửa.
- **Estimated impact:** công sức rất nhỏ (1 file cấu hình, 3 dòng; không đổi code C#, không thêm test tự động vì log là cấu hình); khoảng 20–30 phút kể cả duyệt và rà soát; chi phí tiền 0; rủi ro thấp: chỉ ẩn bản ghi lỗi trùng của EF Core, mọi lỗi 500 vẫn được ghi đủ một lần, phản hồi API không đổi.

### Loop-back 3 — 2026-11-03T17:29:23Z

- **Diagnosis:** rà soát Code Generation U4 (Change Request FR8, lần rà soát lại) còn 1 Minor: liên kết "Thêm nhân viên" trong trạng thái rỗng của trang Nhân viên (StatusMessage, khi đang lọc theo phòng hoặc chưa có ai) không gửi kèm state bộ lọc, nên Lưu/Hủy ở form về `/employees` chưa lọc (AC6.3.1 giữ bộ lọc, cùng kiểu lỗi đã sửa ở nút Thêm trên đầu trang). Hiệp chọn sửa qua loop-back (tin nhắn d652d18a).
- **Root-cause stage:** `code-generation`, Unit `u4-employees` (`frontend/src/pages/employees/EmployeesPage.tsx`; cần `frontend/src/components/StatusMessage.tsx` của U2 nhận `state` cho hành động dạng liên kết). Không mở lại unit khác.
- **Planned fix:** `StatusAction` dạng liên kết thêm `state?: unknown`, truyền vào `Link`; hai hành động "Thêm nhân viên" ở trạng thái rỗng của EmployeesPage truyền `state: editState`. Kiểm: `verify`, Playwright (lọc phòng 0 người → Thêm nhân viên → Hủy → về `/employees?departmentId=…`).
- **Estimated impact:** rất nhỏ (2 file, vài dòng, không đổi backend, không thêm test tự động vì không có test React theo team.md); khoảng 20 phút kể cả duyệt, rà soát, checkpoint; rủi ro thấp: `state` là tùy chọn, các chỗ dùng StatusMessage khác không đổi.
