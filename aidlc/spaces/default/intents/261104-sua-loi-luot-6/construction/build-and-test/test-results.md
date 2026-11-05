# Kết quả Build and Test

## Lượt 8: Hiệp yêu cầu rà lại toàn bộ (chỉ kiểm, chưa sửa code)

**Kết quả: chạy thật ĐẠT; còn phát hiện về tài liệu, comment và lỗi mức Thấp, Hiệp chọn mục sửa.** Code như lượt 7, chưa commit.

| Kiểm | Nơi chạy | Kết quả |
|---|---|---|
| `npm --prefix frontend run verify` | Máy | Lần đầu lỗi vì `frontend/node_modules` bị hỏng (nguyên nhân chưa rõ, dấu thời gian 16:06 ngày 04/11). Sau `npm ci`: mã thoát 0, 146/146 |
| `npm audit --omit=dev`, `dotnet list package --vulnerable` | Máy | 0 lỗ hổng ở gói chạy thật. `npm audit` đủ: 12 mức moderate, chỉ ở công cụ ESLint |
| A01–A07, trùng email, JSON hỏng, sai kiểu, quá dài | API thật (Node `fetch`) | Đạt |
| 8 yêu cầu cùng lúc: email, tên phòng | API thật | Đúng 1 lần 201, 7 lần 409 |
| Xóa phòng còn người, đổi tên trùng, CORS, header, 404, 405, 415 | API thật | Đạt |
| F01, F03–F05, F07–F13, V01–V06 | Chromium thật | Đạt |
| V07 backend tắt | Chromium thật | Đạt ở 3 trang. Lần thử đầu bị backend chạy song song làm sai nên đã làm lại tuần tự |
| F14 tắt rồi bật backend | API thật | Đạt, dữ liệu còn |
| Khóa breadcrumb form phòng ban, emoji, `?search=a%20%20b`, khổ 320 px | Chromium thật | Đạt |
| R01: chép mã nguồn vào thư mục sạch, chạy theo README | Máy + Chromium | Đạt: restore, `npm ci`, chạy, thêm được nhân viên. `dotnet ef database update` báo thiếu quyền vì máy này dùng `employee_app`, README mục 13 quy định migration chạy bằng `postgres` |

Dữ liệu thử đã xóa: 83 nhân viên, 9 phòng ban.

**Chưa kiểm:** F02 (cần database rỗng), D01–D03 (cần pgAdmin), migration trên database trống bằng `postgres` (cần mật khẩu), Lighthouse, Postman.

**Phát hiện đã tái hiện:** `/employees/999999/edit` khi phòng ban tải chậm hiện cùng lúc "Đang tải dữ liệu…" và "Không tìm thấy nhân viên"; Hủy từ trang chi tiết phòng ban về danh sách, không về trang chi tiết.

**Phát hiện từ đọc code:** danh sách F, V trong `07-kiem-thu-va-demo.md` còn tả giao diện cũ; khoảng 160 dòng code và comment khớp mẫu mã nội bộ, lịch sử hoặc tên người ở 47 file; PUT phòng ban tên không đổi chen với xóa có thể trả 200; form giữ phòng đã bị xóa sau lỗi 400; hết 10 giây phía client báo mất kết nối dù server đã lưu; không có nút bỏ lọc khi tải phòng ban lỗi.

**Đính chính:** kế hoạch ghi dự án không dùng `data-testid`; thực tế có 32 chỗ trong `frontend/src`.

---

## Lượt 7 (sau khi sửa)

**Kết quả: ĐẠT.** Chạy ngày 04/11/2026 trên cây code chưa commit, dựa trên commit `6768935`. Kiểm theo `code-generation-plan.md`, `unit-test-instructions.md`, và đối chiếu `code-summary.md`.

## 1. Build và test

| Lệnh | Mã thoát | Kết quả |
|---|---|---|
| `npm --prefix frontend run verify` | 0 | typecheck, ESLint, Prettier, Vite build, `dotnet format`, `dotnet test` đều qua; **146/146** |
| `dotnet test backend/EmployeeCrud.slnx --filter "FullyQualifiedName~DepartmentServiceTests\|FullyQualifiedName~EmployeeServiceTests\|FullyQualifiedName~LoggingTests"` | 0 | 120/120 |
| `dotnet test backend/EmployeeCrud.slnx --collect "Code Coverage;Format=cobertura" --results-directory backend/TestResults/luot7-coverage` | 0 | 146/146 |
| `dotnet tool run reportgenerator` với `-assemblyfilters:+EmployeeCrud.Api` | 0 | Báo cáo ở `backend/TestResults/luot7-coverage-report/Summary.txt` |
| `dotnet ef migrations has-pending-model-changes` | 0 | Model khớp migration |

0 test bị bỏ qua, 0 test lỗi. Smart App Control không chặn lần nào.

## 2. Độ phủ (Microsoft Code Coverage)

| Lớp | Số dòng |
|---|---|
| `DepartmentService` | 100% |
| `EmployeeService`, `EmployeeService.ValidInput` | 100% |
| `TextInput` | 100% |
| `ErrorMapper` | 97,6% |
| Toàn assembly `EmployeeCrud.Api` | 47,8% |

Mức sàn 80% áp cho lớp service. Con số toàn assembly thấp hơn vì tính cả controller và migration, hai phần kiểm tay theo `team.md`.

## 3. API thật (Node `fetch`, backend và PostgreSQL thật)

| Ca | Kết quả |
|---|---|
| Dữ liệu đang có | 83 nhân viên, 9 phòng ban; **0 bản ghi chứa noncharacter** |
| U+FFFE, U+FFFF, U+FDD0, U+FDEF, U+1FFFE, U+10FFFE, U+10FFFF ở tên phòng, họ tên, email | 400 `application/problem+json`, lời báo tiếng Việt |
| Các ký tự trên ở `?search=` | 200 |
| `/employees/2127e0`, `/employees/0`, `/departments/99999999999`, `/employees/99999` | 404 |
| Tìm emoji; tìm `nguyễn` | 200; 7 người, khớp lượt 6 |

## 4. Trình duyệt thật (Chromium do Playwright điều khiển, bản build, backend thật)

| Mục | Kết quả |
|---|---|
| Thêm, tìm, sửa, xóa nhân viên | Đạt, đúng một request ghi mỗi thao tác |
| Họ tên có U+FFFE | Báo lỗi cạnh ô, 0 request ghi |
| Mở sửa với `{id}e0`, `0x10`, `012`, `99999999999` | Không mở form |
| Bấm Hủy khi đang lưu (API giả chậm 1,5 giây) | `aria-disabled="true"`, ở lại form; lưu xong về danh sách |

Không có lỗi trang (`pageerror`). Dữ liệu thử đã xóa: trước 83, sau 83.

Các mục FR3.2–FR3.4, FR8.1–FR8.3 và phần xem lại màu đã kiểm ở Code Generation cũng bằng Chromium, ghi ở `code-summary.md`. Lượt này không lặp lại.

## 5. Không chạy lại

Chen nhau đồng thời, CORS, quét bảo mật, Lighthouse: lượt 6 đã chạy trên `6768935`; việc này không đổi các phần đó.
