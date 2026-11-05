# Kết quả Build and Test: lượt 7 (sau khi sửa)

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
