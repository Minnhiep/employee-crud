# Kết quả Build and Test: lượt 9 (sau khi sửa 9 nhóm phát hiện)

**Kết quả: ĐẠT.** Chạy ngày 05/11/2026 trên cây code chưa commit, dựa trên commit `6768935`. Kiểm theo `code-generation-plan.md`, `unit-test-instructions.md`, đối chiếu `code-summary.md`.

## 1. Build và test

| Lệnh | Mã thoát | Kết quả |
|---|---|---|
| `npm --prefix frontend run verify` | 0 | typecheck, ESLint, Prettier, Vite build, `dotnet format`, `dotnet test` đều qua; **148/148** |
| `dotnet test backend/EmployeeCrud.slnx --collect "Code Coverage;Format=cobertura" --results-directory backend/TestResults/luot9-coverage` | 0 | 148/148 |
| `dotnet tool run reportgenerator` với `-assemblyfilters:+EmployeeCrud.Api` | 0 | `backend/TestResults/luot9-coverage-report/Summary.txt` |

Smart App Control chặn `EmployeeCrud.Api.Tests.dll` rồi `EmployeeCrud.Api.dll`. Xử lý bằng comment có ích, tổng 4 comment, Hiệp duyệt phần vượt 2 lần. Không đổi cài đặt máy.

## 2. Độ phủ (Microsoft Code Coverage)

| Lớp | Số dòng |
|---|---|
| `DepartmentService` | 100% |
| `EmployeeService`, `EmployeeService.ValidInput` | 100% |
| `TextInput` | 100% |
| `ErrorMapper` | 97,6% |
| Toàn assembly `EmployeeCrud.Api` | 47,8% |

## 3. API thật (Node `fetch`, backend và PostgreSQL thật)

| Ca | Kết quả |
|---|---|
| F14: tắt backend, bật lại | 83 nhân viên, 9 phòng ban còn nguyên |
| U+FFFE ở tên phòng; ở ô tìm | 400; 200 |
| PUT phòng ban tên không đổi | 200, `employeeCount` đúng |
| Trùng tên phòng; trùng email | 409, khóa `name`, `email` đúng |
| PUT phòng đã xóa | 404 |

## 4. Trình duyệt thật (Chromium do Playwright điều khiển, bản build, backend thật)

| Mục | Kết quả |
|---|---|
| F01, F03, F06, F07, F08, F09, F11, F12, F13 | Đạt |
| V01, V04, V06 | Đạt |
| FR3: `/employees/999999/edit`, `/employees/abc/edit`, `/departments/999999/edit` khi phòng ban tải chậm | Một trạng thái, tiêu đề "Không tìm thấy …", không có câu trường bắt buộc |
| F15, F16: Hủy và Lưu từ trang chi tiết phòng ban; gõ thẳng địa chỉ | Về chi tiết, có lời báo; gõ thẳng về danh sách |
| V08: phòng bị xóa khi form đang mở | Báo lỗi, bỏ chọn, giữ họ tên, phòng biến mất, chọn phòng khác lưu được |
| V09: DELETE phòng ban quá 10 giây | Đúng câu "chưa rõ đã xóa hay chưa" |
| V10: tải phòng ban lỗi khi đang lọc | Có "Thử lại", "Bỏ lọc phòng ban"; bỏ lọc giữ `search=a` |
| V07: backend tắt thật | Đúng lời báo ở 3 trang, trang không trắng, nút Lưu khóa |

Không có lỗi trang (`pageerror`). Dữ liệu thử đã xóa: 83 nhân viên, 9 phòng ban.

## 5. Chưa kiểm hoặc không chạy lại

| Mục | Lý do |
|---|---|
| F02 | Cần database rỗng; Code Generation kiểm bằng giả lập danh sách rỗng |
| F04, F05, F10, V02, V03, V05, V09 phần lưu | Đã đạt ở Code Generation hoặc lượt 8, code sau đó chỉ đổi comment |
| D01–D03 | Cần pgAdmin |
| Migration trên database trống bằng `postgres` | Cần mật khẩu của Hiệp |
| Postman, Lighthouse | Hiệp làm tay; không có thay đổi ở API ngoài PUT phòng đã xóa |
| Thử cài mới trong thư mục sạch | Đã đạt ở lượt 8; chưa chạy lại trên code lượt 9 |
