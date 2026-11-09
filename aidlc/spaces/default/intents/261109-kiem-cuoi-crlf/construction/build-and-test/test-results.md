# Kết quả kiểm thử: kiem-cuoi-crlf (09/11/2026, tối)

Máy: Windows 11 (26H2, build 26300.9818). Smart App Control: Hiệp tự tắt tạm trước lượt này (registry `VerifiedAndReputablePolicyState = 0`). Repo ở commit `3f62f3e` (3 commit mới của Hiệp: `46d1794`, `d2f64cf`, `3f62f3e`).

## 1. Build và bộ test tự động

| Lệnh | Kết quả |
|---|---|
| `npm --prefix frontend run verify` | Thoát mã 0. `tsc` đạt, ESLint đạt (`--max-warnings 0`), Prettier "All matched files use Prettier code style!", `vite build` 123 module (JS 303.92 kB, CSS 17.32 kB), `dotnet format --verify-no-changes` đạt, `dotnet test` **148/148 đạt, 0 lỗi, 0 bỏ qua** |
| `npm --prefix frontend run coverage` (coverlet) | Thoát mã 0. `DepartmentService` 100%, `EmployeeService` 100%, `TextInput` 100% số dòng; `ErrorMapper` 97,6%. Controller và migration 0% (kiểm thủ công, đúng phạm vi của `team.md`) |

Lần đầu tối nay `dotnet test` bị chặn (0x800711C7, `EmployeeCrud.Api.dll`) khi Smart App Control còn bật; sau khi Hiệp tắt tạm, chạy lại đạt.

## 2. Kiểu xuống dòng và bản clone

| Phép kiểm | Kết quả |
|---|---|
| `git ls-files --eol` trên repo làm bài | 0 file `i/crlf`, `i/mixed`, `w/crlf`, `w/mixed` |
| `git status` sau 3 commit của Hiệp | Chỉ còn 1 dòng: nhật ký `261109-kiem-cuoi-crlf/audit/mint-adeecefb94cd.md` do AI-DLC ghi tiếp. 51 file hồ sơ chỉ đổi xuống dòng tự rơi khỏi danh sách khi `git add`, không vào commit |
| FR3.1: `git clone . backend/TestResults/clone-bt-261109` (máy có `core.autocrlf=true`) | 821/821 file `i/lf w/lf`; `npm ci` rồi `prettier --check .` trong `frontend/` của bản clone: "All matched files use Prettier code style!" |
| FR4.8: bản clone cũ `backend/TestResults/clone-cu-bt-261109` (ghi lại toàn bộ file ở `9ebab38`, trước khi có `.gitattributes`, rồi lên `main`), thêm 1 dòng sửa dở chưa commit vào `docs/ke-hoach.md`, chạy đúng lệnh README mục 11 trong Git Bash | 784 file CRLF (339 trong `aidlc/`) → 0; dòng sửa dở còn; BOM `.csproj` còn (`239,187,191`); sau `git add -A` chỉ còn `M docs/ke-hoach.md` |

## 3. API thật (FR4.3)

Script `backend/TestResults/kiem-b-t-261109/api-check.mjs`, backend chạy bằng `dotnet run --launch-profile http` trên `employee_db`. **30/30 đạt.**

| Nhóm | Ca |
|---|---|
| Đọc | A01 danh sách phòng ban có `employeeCount`; A02 danh sách nhân viên; A07, A08 không có → 404 kèm `traceId` |
| Tìm, lọc | A03 họ tên chữ HOA "NGUYỄN" (7 kết quả); A04 email chữ HOA "CONGTY.EXAMPLE" (80); A05 chuỗi `50%_` → 0 (không hiểu là ký tự đại diện); A06 `departmentId=abc` → 400 |
| Phòng ban | A09 thêm → 201 + `Location`; A10 tên trùng khác hoa thường → 409; A11 tên rỗng → 400; A12 sửa → 200; A20 xóa phòng còn người → 409 "Không thể xóa phòng ban "…" vì còn 1 nhân viên."; A23 xóa phòng trống → 204 |
| Nhân viên | A13 thêm → 201; A14 email trùng khác hoa thường → 409 `errors.email`; A15 phòng không tồn tại → 400 `errors.departmentId`; A16 email sai → 400; A17 đọc → 200; A18 sửa → 200; A19 sửa người không có → 404; A21 xóa → 204; A22 xóa người không có → 404 |
| Giao thức | A24 JSON hỏng → 400; A25 `text/plain` → 415; A26 PATCH → 405; A27 đường dẫn lạ → 404 (đều ProblemDetails) |
| Bảo mật | A28 CORS cho `http://localhost:5173`, không cho origin lạ; A29 `nosniff`, `Cache-Control: no-store`, CSP `frame-ancestors 'none'`, không có header `Server` |
| Dữ liệu | A30 trước 9 phòng / 83 người, sau 9 / 83 |

## 4. Giao diện trên trình duyệt thật (FR4.4)

Chromium do Playwright điều khiển (trình duyệt thật, không phải jsdom), frontend `npm run dev` + backend thật. Script `backend/TestResults/kiem-b-t-261109/ui-check.js`. **16/16 đạt** ở lần chạy thứ ba.

U01 danh sách 83 người; U02 tìm "NGUYỄN" → 7, địa chỉ giữ `?search=`; U03 lưu form trống báo "Vui lòng nhập họ tên", không gửi POST; U04 thêm nhân viên có thông báo; U05 email trùng khác hoa thường báo "Email đã được sử dụng"; U06 tìm theo email chữ HOA ra đúng 1 người, sửa xong quay về đúng danh sách đang tìm; U07 hộp xác nhận xóa ghi họ tên và email, xóa xong có thông báo; U08 danh sách 9 phòng ban; U09 xóa phòng "Bán hàng" (9 người) bị chặn, có nút "Xem 9 nhân viên"; U10 trang chi tiết phòng hiện đúng 9 dòng; U11 thêm rồi xóa phòng trống; U12 lọc theo phòng: "Phòng Bán hàng có 9 nhân viên"; U13 đường dẫn lạ → "Không tìm thấy trang"; U14 `/employees/12e0/edit` → "Không tìm thấy nhân viên"; U15 dữ liệu giữ 9/83; U16 không có lỗi JavaScript trên console.

Hai lần chạy đầu báo lỗi do chính script: đọc chữ trước khi dữ liệu tải xong, đọc nhầm thông báo cũ còn hiện, và đếm cả dòng trình duyệt tự ghi khi API trả 409 có chủ đích. Đã sửa script cho chờ đúng; không có lỗi nào của ứng dụng.

## 5. Database (FR4.5) và dữ liệu (NFR3, NFR4)

- D01–D03 đã đạt ngày 09/11 (Hiệp chạy trong pgAdmin, transaction + `ROLLBACK`): xóa phòng còn người bị khóa ngoại chặn (23001), email trùng khác hoa thường bị chỉ mục `ux_employees_email` chặn (23505), cấu trúc bảng khớp `docs/so-do-database.md`. Không đổi gì ở database từ đó.
- Không gõ hay lưu mật khẩu PostgreSQL ở bất kỳ lệnh hay file nào; ứng dụng đọc chuỗi kết nối từ user-secrets.
- Sau API và giao diện: `employee_db` vẫn 9 phòng ban, 83 nhân viên; dữ liệu thử (đuôi `@kiem-thu.example`, tên "Phòng thử UI …", "Kiểm thử BT …") đã xóa.

## 6. Chưa kiểm (Hiệp chọn dời, tin nhắn 3864d9ab)

- **FR4.6** migration trên database trống và **FR4.7** Lighthouse: Hiệp chọn làm một lần ở lượt kiểm cuối của việc sửa danh sách rà soát bàn giao (nhóm A–D), khi code đã là bản cuối, để số đo đúng bản bàn giao và không phải làm tay hai lần.

## 7. Lệch so với yêu cầu

- **NFR2** ghi "không tắt Smart App Control". Hiệp đã tự tắt tạm để AI-DLC, test và backend chạy được (AI không đổi cài đặt máy). Cần bật lại khi xong việc: Windows Security → App & browser control → Smart App Control settings.

## 8. Thư mục thử để Hiệp quyết (FR3.2)

Trong `backend/TestResults/` (Git bỏ qua): `clone-bt-261109`, `clone-cu-bt-261109`, `kiem-b-t-261109`, `sao-luu-aidlc-crlf-261109` (bản sao 51 file trước khi đổi xuống dòng và `traceability.json` viết tay), cùng các thư mục cũ `clone-moi`, `clone-cu`, `kiem-cuoi`, `r01-cai-moi`, `artifacts`. AI không tự xóa.
