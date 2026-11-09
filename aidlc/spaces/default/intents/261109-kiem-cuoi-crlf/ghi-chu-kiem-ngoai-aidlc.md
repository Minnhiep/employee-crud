# Ghi chú: phần kiểm làm ngoài AI-DLC (09/11/2026)

Lý do: từ khoảng 15:00 ngày 09/11, Smart App Control (đang Bật, registry `VerifiedAndReputablePolicyState = 1`) chặn `aidlc.exe`, nên AI-DLC dừng ở Code Generation (đã sửa xong, chưa review, chưa duyệt). Hiệp chọn kiểm tiếp ngoài AI-DLC; khi `aidlc` chạy lại, dùng ghi chú này làm đầu vào cho Build and Test.

| Yêu cầu | Phép kiểm | Kết quả |
|---|---|---|
| FR1.1–FR1.3, NFR1 | 3 commit của Hiệp: `319e701` (`.gitattributes`, `.editorconfig`; `git diff --cached` chỉ 2 file, 8 dòng), `fbad699` (README +1), `c542387` (comment 4 file test, +9); `git status` phần dự án sạch | Đạt |
| FR3.1 | `git clone` vào `backend/TestResults/clone-moi` với `core.autocrlf=true`: 804/804 file `i/lf w/lf`; `npm ci` rồi `format:check`, lint, typecheck; `dotnet format --verify-no-changes` | Đạt |
| FR3.2 | Thư mục thử `clone-moi`, `clone-cu`, `kiem-cuoi` để lại cho Hiệp quyết | Chờ Hiệp |
| FR4.8 | Bản clone cũ (`clone-cu`, checkout `9ebab38` rồi lên `main`): 803 → 447 file CRLF; chạy lệnh README `dos2unix -b` → 0; dòng sửa dở còn; BOM `.csproj` còn (`ef bb bf`); `git add -A` chỉ còn file sửa dở | Đạt |
| FR2.1, FR4.1 | `npm --prefix frontend run verify`: typecheck, lint, Prettier, build, `dotnet format` đạt; `dotnet test` bị Smart App Control chặn | Đạt trừ test |
| FR4.2 | `EmployeeCrud.Api.Tests.dll` bị chặn (0x800711C7) sau 5 lần thêm comment và 1 lần build ra thư mục khác; theo Q3: dựa vào 148/148 ngày 05/11, code ứng dụng không đổi nội dung (chỉ xuống dòng và comment) | Đạt có ghi chú |
| FR4.3, FR4.4 | API thật 29/29, giao diện 12/12 (chạy lúc 13:50–14:00, trước khi sửa; code ứng dụng không đổi nội dung). Sau khi sửa không chạy lại được: `EmployeeCrud.Api.dll/.exe` build lúc 15:17 bị chặn, 2 comment (`Program.cs`, `CorsSetup.cs`) không giúp được | Chưa chạy lại |
| FR4.5 | D01: xóa phòng còn nhân viên → 23001, `violates RESTRICT setting of foreign key constraint "fk_employees_department"`. D02: email trùng khác hoa thường → 23505 `ux_employees_email`, `Key (lower(email::text))`. D03: 6 cột, 5 chỉ mục, 1 khóa ngoại khớp `docs/so-do-database.md`. Hiệp chạy trong pgAdmin, transaction + `ROLLBACK` | Đạt |
| FR4.6, FR4.7 | Migration trên database trống, Lighthouse: cần backend chạy | Chưa làm (Smart App Control) |
| NFR3, NFR4 | Không gõ mật khẩu; sau D01–D03 dữ liệu vẫn 9 phòng ban, 83 nhân viên | Đạt |
