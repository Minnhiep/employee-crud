# Kết quả Build and Test: sua-ra-soat-ban-giao

Ngày kiểm: 10/11/2026, trên máy của Hiệp (Windows 11, .NET SDK 10.0.403, Node 24.15.0, PostgreSQL 18.6). Code ở trạng thái sau Code Generation (12 bước, Hiệp duyệt), chưa commit.

## Nguồn

- `../code-generation/code-generation-plan.md` (code-generation-plan): Testing Contract và 12 bước đã làm.
- `../code-generation/unit-test-instructions.md` (unit-test-instructions): các lệnh chạy dưới đây lấy đúng từ file này (mục "Lệnh chạy", "Mục tiêu độ phủ", "Kỳ vọng khi kiểm bằng API thật").
- `../code-generation/code-summary.md` (code-summary): file đã đổi và kết quả lúc làm code, dùng để đối chiếu.
- `../../inception/requirements-analysis/requirements.md`: FR8.1–FR8.3, NFR1–NFR7 là mục tiêu kiểm của bước này.

## 1. Build và test tự động

| Lệnh | Mã thoát | Kết quả |
|---|---|---|
| `npm --prefix frontend run verify` | 0 | `tsc` đạt; ESLint 0 cảnh báo; Prettier "All matched files use Prettier code style!"; `vite build` 123 module; `dotnet format --verify-no-changes` đạt; `dotnet test` **153/153**, 0 lỗi, 0 bỏ qua |
| `dotnet test backend/EmployeeCrud.slnx --no-build --filter "…EmployeeServiceTests\|…DepartmentServiceTests"` | 0 | Lớp service **123/123** |
| `dotnet test backend/EmployeeCrud.slnx --no-build --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Platform"` | 0 | Lớp Platform **30/30** (có test mới giữ giới hạn body 64 KB) |
| `npm --prefix frontend audit --omit=dev` | 0 | `found 0 vulnerabilities` |

Số test: 148 trước việc này − 1 test trùng bỏ đi + 6 test mới = 153. Sáu test mới: tìm email chữ HOA; PUT phòng ban không tồn tại với tên sai ra 404 (2 ca); PUT phòng có thật tên quá dài vẫn 400; `Accept: text/html` vẫn nhận ProblemDetails JSON; giới hạn body 64 KB (code-summary mục 3, 4, 15). Lệnh lớp service và lớp Platform dùng `--no-build` vì `verify` ngay trước đó đã build đúng code này.

## 2. Độ phủ (coverlet)

Lệnh: `npm --prefix frontend run coverage` (mã thoát 0; chạy lại toàn bộ 153/153 với `--collect:"XPlat Code Coverage"`, báo cáo `backend/TestResults/coverage-report/index.html`).

| Lớp | Độ phủ dòng | Mức sàn (`team.md`) |
|---|---|---|
| `DepartmentService` | 100% | ≥ 80% |
| `EmployeeService` | 100% | ≥ 80% |
| `TextInput` (chuẩn hóa chữ dùng chung cho service) | 100% | ≥ 80% |

Cả dự án 49,1% dòng: controller, migration và mã sinh tự động không có unit test, đúng phạm vi `team.md` (chỉ test service). Không đổi ngưỡng nào, không thêm chỗ loại trừ khỏi đo.

## 3. API thật (FR8.3, NFR3, NFR7)

Backend `dotnet run --launch-profile http` (cổng 5081), database `employee_db` thật. Dữ liệu thử đuôi `@kiem-thu.example`, tên "Kiểm thử BT …"/"Phòng thử …", xóa ở cuối mỗi script.

| Script (thư mục `backend/TestResults/`, Git bỏ qua) | Kết quả | Nội dung |
|---|---|---|
| `kiem-b-t-261109/api-check.mjs` | **30/30** | Đủ 10 thao tác (GET/POST/PUT/DELETE hai tài nguyên), tìm không phân biệt hoa thường, `%` và `_`, 400/404/405/409/415, JSON hỏng, CORS, header bảo mật. Bộ này giống hệt lần kiểm 09/11 và vẫn đạt đủ, nên hành vi API ngoài phạm vi không đổi (NFR3). |
| `kiem-sua-261110/check-api-after.mjs` | **11/11** | Header `Accept: text/html` vẫn nhận ProblemDetails JSON (FR6.3); body ~70 KB → **413** "Dữ liệu gửi lên quá lớn", body ~60 KB vẫn tới service (FR6.4); `PUT /api/departments/99999` tên toàn khoảng trắng → **400**, tên 101 ký tự → **404**, phòng có thật tên 101 ký tự → **400** (FR6.9, đúng kỳ vọng thật ở `unit-test-instructions.md`) |

Dữ liệu trước và sau: **9 phòng ban, 83 nhân viên** (A30; dòng "Trước/Sau khi dọn" của script thứ hai).

## 4. Giao diện trên trình duyệt thật (FR8.3, NFR6, NFR7)

Nơi chạy: **Chromium thật do Playwright điều khiển** (công cụ Playwright MCP), frontend `npm run dev` (cổng 5173) + backend thật. Không dùng Node hay DOM giả lập.

| Script | Kết quả | Nội dung |
|---|---|---|
| `kiem-b-t-261109/ui-check.js` | **16/16** | Luồng chính: danh sách, tìm chữ HOA, form trống, thêm, email trùng, sửa, xóa, phòng ban, chặn xóa phòng còn người, trang chi tiết, lọc, trang không tìm thấy, dữ liệu giữ nguyên, không lỗi console |
| `kiem-sua-261110/check-buoc12.js` | **13/13** | Câu báo "phòng ban không còn" theo `location.key`: các ca (a)–(e), hai ca kèm lời báo Toast; ô email `autocomplete="off"`; bấm Back lúc đang xóa ở hai trang danh sách; rời hẳn trang lúc đang xóa |
| `kiem-sua-261110/check-ui-a.js` | **27/27** | FR7.1, FR7.4, FR7.5, FR7.7, FR7.9–FR7.13 (khung tóm tắt lỗi, "Thử lại" đưa focus về tiêu đề, vùng `role=status`, F5, `aria-disabled`, ô email giữ chữ có dấu, trang không tìm thấy, breadcrumb "Trang chủ") |
| `kiem-sua-261110/check-ui-b.js` | **15/15** | FR7.2, FR7.3, FR7.6, FR7.8, FR7.9 (Toast một vùng chung, Back lúc đang xóa, xóa ở trang chi tiết, Esc lúc đang xóa), luồng tìm, sửa, thêm và xóa phòng |

Tổng **71/71** phép kiểm trên Chromium; không có lỗi JavaScript trên console; dữ liệu trước và sau đều 9/83.

Các phép kiểm bàn phím (NFR6): Tab đầu tiên tới liên kết "Bỏ qua, tới nội dung chính"; Esc đóng hộp xác nhận và trả focus về nút Xóa; focus về tiêu đề sau "Thử lại", sau khi lưu, sau khi xóa; nút đang bận khóa bằng `aria-disabled` nên không mất focus.

### Hai lần đỏ do script, đã sửa script (không đổi code ứng dụng)

Đúng loại lỗi đã ghi ở điểm rà R-06: script đọc màn hình trước khi trang tải xong.

| Ca | Lần chạy đầu | Nguyên nhân | Sửa script | Chạy lại |
|---|---|---|---|---|
| `ui-check.js` U11 | Đọc được "Đã thêm phòng ban…" thay vì "Đã xóa phòng ban…" | Thông báo của bước trước còn hiện (tự ẩn sau 5 giây); script đọc ngay sau khi bấm Xóa, trước khi API trả lời | Chờ đúng thông báo có chữ "Đã xóa phòng ban", như U07 đã làm | Đạt, đọc được "Đã xóa phòng ban …" |
| `check-ui-b.js` R01 | Dòng đếm rỗng | Người thử đã có trong danh sách đầy đủ nên nút Sửa hiện trước khi kết quả tìm về; script đọc dòng đếm lúc trang còn đang tải | Chờ dòng đếm có chữ "Tìm thấy" rồi mới đọc | Đạt, "Tìm thấy 1 nhân viên" |

Cùng lúc, `ui-check.js` đổi 4 chỗ `isVisible({ timeout })` (Playwright bỏ qua `timeout`, đọc ngay) sang chờ `waitFor` (U05, U09, U13, U14), theo đề xuất R-06 của lượt rà Code Generation.

## 5. Migration trên database trống (FR8.1)

Hiệp làm tay theo `build-instructions.md` mục FR8.1, mật khẩu `postgres` gõ ẩn; AI không gõ, không đọc mật khẩu. Database thử `employee_db_thu_migration` (không đụng `employee_db`).

| Kiểm | Kỳ vọng | Kết quả Hiệp báo |
|---|---|---|
| `dotnet ef database update` | Chạy xong, có `Done.` | Đạt |
| `dotnet ef migrations list` | `CreateDepartments`, `CreateEmployees`, không `(Pending)` | Đạt |
| `__EFMigrationsHistory` / `departments` / `employees` | 2 dòng / 4 phòng ban mẫu / 0 | Đạt |
| Xóa database thử | `DROP DATABASE … WITH (FORCE)` | Đã xóa |

Bằng chứng: Hiệp trả lời form ngày 10/11 (tin nhắn 47ddac1b), "Đạt đủ". AI không có bản chụp màn hình; AI chỉ tự xác nhận được cổng 5081 và 5173 đã trống sau khi Hiệp làm xong.

## 6. Lighthouse (FR8.2, NFR6)

Hiệp làm tay theo `build-instructions.md` mục FR8.2: Chrome cửa sổ ẩn danh, DevTools → Lighthouse, Mode Navigation, Device Desktop, trên bản `vite preview` (cổng 5173) và backend thật.

| Trang | Performance (≥ 90) | Accessibility (= 100) | Best Practices (≥ 90) |
|---|---|---|---|
| `/employees` | 100 | 100 | 100 |
| `/departments` | 100 | 100 | 100 |

Bằng chứng: Hiệp trả lời form ngày 10/11 (tin nhắn 47ddac1b). AI không có bản báo cáo Lighthouse. Ghi chú: `frontend/dist/index.html` vẫn mang giờ build của lần `verify` lúc 02:43, nên có thể bước `npm run build` của Hiệp đã không chạy lại. Bản `dist` đó build từ đúng code hiện tại (sau đó không sửa file nào của frontend), nên điểm đo vẫn ứng với code bàn giao.

## 7. Dữ liệu demo (NFR7)

`employee_db` trước mọi phép kiểm: 9 phòng ban, 83 nhân viên. Sau từng script API và giao diện: 9/83. Dữ liệu thử đã xóa hết.

## 8. Việc chưa làm trong bước này

- Smart App Control vẫn đang tắt tạm (Hiệp tự tắt để `dotnet test`, `dotnet run` chạy được). Bật lại ở nhóm D, cuối việc.
- Thư mục thử trong `backend/TestResults/` (Git bỏ qua) chờ Hiệp dời ra thư mục lưu trữ ở nhóm D.
