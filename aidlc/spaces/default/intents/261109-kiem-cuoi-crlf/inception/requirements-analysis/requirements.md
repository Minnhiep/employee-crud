# Yêu cầu: kiem-cuoi-crlf (lần kiểm cuối employee-crud)

## Intent Analysis

- **Mục tiêu:** bất kỳ máy Windows nào clone repo về (Git cài mặc định, `core.autocrlf=true`) cũng chạy `npm run verify` sạch; sau đó kiểm lại toàn bộ bài lần cuối trước khi bàn giao [desc].
- **Loại việc:** sửa lỗi cấu hình repo (bugfix), không đổi chức năng nghiệp vụ. Không thêm, bớt hay đổi luật nào trong BR1–BR13 của `business-overview.md`.
- **Nguyên nhân đã tái hiện:** repo lưu file dạng LF và không có `.gitattributes`; `.editorconfig` không có `end_of_line` (`code-structure.md`). Git cài mặc định trên Windows đặt `core.autocrlf=true` ở mức hệ thống, nên khi ghi file ra máy (clone, switch, pull) thì file thành CRLF. Prettier không có cấu hình riêng nên mong đợi LF; `verify` dừng ở `prettier --check` vì các bước nối bằng `&&` (`architecture.md` mục 4 của Interaction Diagrams) [desc].
- **Mức độ:** đơn giản, phạm vi cả repo (mọi file văn bản), độ sâu Minimal.

## Functional Requirements

### FR1. Repo tự quy định kiểu xuống dòng LF

- **FR1.1** Gốc repo có file `.gitattributes` với dòng `* text=auto eol=lf`: Git tự nhận file văn bản và luôn ghi chúng ra máy dạng LF, trên mọi máy, bất kể `core.autocrlf` của máy đó; file nhị phân Git tự nhận và giữ nguyên [Q1].
  - Đạt khi: `git check-attr text eol -- frontend/src/App.tsx backend/EmployeeCrud.Api/Program.cs` báo `text: auto` và `eol: lf`.
- **FR1.2** `.editorconfig` có `end_of_line = lf` trong mục `[*]`, để trình soạn thảo (VS Code, Visual Studio) tạo file mới dạng LF, khớp với `.gitattributes` [Q1].
  - Đạt khi: mục `[*]` của `.editorconfig` có dòng `end_of_line = lf`.
- **FR1.3** Trên máy làm bài, mọi file văn bản đang được Git theo dõi được đưa về LF; nội dung không đổi, chỉ đổi ký tự xuống dòng [Q1].
  - Đạt khi: `git ls-files --eol` không còn dòng nào có `w/crlf` hay `w/mixed`; và sau khi đưa về LF, `git status` không báo thêm file nào bị sửa ngoài những file đã sửa trước đó và hai file cấu hình của FR1.1–FR1.2.
  - Lỗi/biên: không dùng `git checkout`, `git restore`, `git stash` hay `git reset` lên cây làm việc, vì cây đang có thay đổi chưa commit của Hiệp và các lệnh đó có thể viết lại file sang CRLF (`code-quality-assessment.md`).

### FR2. Lệnh kiểm tổng chạy hết chuỗi trên máy làm bài

- **FR2.1** `npm run verify` (trong `frontend/`) qua đủ các bước: typecheck, lint, `prettier --check`, build, `dotnet format --verify-no-changes`, `dotnet test` [desc].
  - Đạt khi: lệnh thoát mã 0; hoặc, nếu chỉ còn bước `dotnet test` bị Smart App Control chặn, mọi bước trước nó đạt và bước test được xử lý theo FR4.2 [Q3].

### FR3. Bản clone mới cũng sạch

- **FR3.1** Sau khi Hiệp commit thay đổi, clone repo trên máy (`git clone` từ thư mục repo hiện tại) vào một thư mục thử nằm trong `backend/TestResults/` (đã bị `.gitignore` loại) [Q2].
  - Đạt khi: trong bản clone, `git ls-files --eol` cho mọi file văn bản là `i/lf w/lf`, và `prettier --check .` chạy trong `frontend/` của bản clone đạt (dùng Prettier sẵn có của dự án, không cài thêm).
  - Lỗi/biên: nếu Hiệp chưa commit thì bước này chưa làm được; ghi rõ là đang chờ, không coi là đạt.
- **FR3.2** Thư mục clone thử chỉ dùng để kiểm; kiểm xong thì báo Hiệp để quyết giữ hay dời đi (không tự xóa).

### FR4. Kiểm lại toàn bộ bài lần cuối

- **FR4.1** Chạy `npm run verify` như FR2.1 và ghi kết quả từng bước [desc].
- **FR4.2** 148 unit test: thử chạy lại theo luật dự án (thêm comment có ích tối đa 2 lần mỗi lần gặp chặn). Nếu vẫn bị Smart App Control chặn, ghi "chưa chạy được do Smart App Control" kèm thông báo lỗi làm bằng chứng, dựa vào kết quả 148/148 ngày 05/11 (code ứng dụng không đổi từ đó), và coi là đạt có ghi chú [Q3].
- **FR4.3** API thật: đủ 10 thao tác và các mã lỗi 400/404/409, CORS, header bảo mật, như lần kiểm ngày 09/11 (29/29) [desc].
- **FR4.4** Giao diện trên trình duyệt: thêm, sửa, xóa, tìm nhân viên; xóa phòng ban còn nhân viên bị chặn; trang chi tiết phòng ban; như lần kiểm ngày 09/11 (12/12) [desc].
- **FR4.5** D01–D03 trên database: D01 xóa phòng ban còn nhân viên bị khóa ngoại chặn; D02 thêm hai nhân viên cùng email bị chặn; D03 cấu trúc bảng khớp sơ đồ. Hiệp tự làm trong pgAdmin theo hướng dẫn từng bước của AI, chạy trong transaction và kết thúc bằng `ROLLBACK`; AI kiểm kết quả và ghi báo cáo [Q4].
- **FR4.6** Migration trên database trống: tạo một database thử, chạy `dotnet ef database update` vào đó (mật khẩu `postgres` Hiệp gõ ẩn qua khối PowerShell như README mục 13), kiểm có đủ 2 migration và 4 phòng ban mẫu, rồi xóa database thử. Hiệp làm theo hướng dẫn, AI kiểm [Q4].
- **FR4.7** Lighthouse trên bản build (`npm run build` rồi `npm run preview`), chạy trong Chrome DevTools chế độ Desktop. Hiệp làm theo hướng dẫn, AI ghi kết quả. Mức đạt giữ như lần kiểm trước: Performance ≥ 90 ở hai trang danh sách, Accessibility = 100, Best Practices ≥ 90 [Q4].
- **FR4.8** README có thêm một mục ngắn ở "Sự cố thường gặp": Prettier báo sai định dạng hàng loạt ngay sau khi clone hoặc pull. Mục này nêu nguyên nhân (CRLF) và cách xử lý cho bản clone làm **trước** khi repo có `.gitattributes` [Q1].
  - Đạt khi: mục mới nêu đúng nguyên nhân, có lệnh xử lý chạy được, và lệnh đó không làm mất thay đổi chưa commit.

## Non-Functional Requirements

- **NFR1 (Không đổi hành vi):** không file mã nguồn nào đổi nội dung ngoài ký tự xuống dòng. Hai file test đã có comment thêm sẵn (`PlatformWebAppFactory.cs`, `ThrowingAppDbContext.cs`) là thay đổi có từ trước, chỉ là comment. Đạt khi `git diff --ignore-cr-at-eol --stat` chỉ liệt kê `.gitattributes`, `.editorconfig`, `README.md` và các file đã sửa trước đó.
- **NFR2 (Không đổi máy):** không sửa cấu hình Git mức hệ thống hay toàn máy (`core.autocrlf` giữ nguyên), không tắt Smart App Control, không cài gì ra ngoài thư mục dự án (`project.md` Forbidden).
- **NFR3 (Bí mật):** không gõ hay lưu mật khẩu PostgreSQL vào lệnh, file hay lịch sử; database thử ở FR4.6 bị xóa sau khi kiểm.
- **NFR4 (Dữ liệu demo):** sau mọi phép kiểm, `employee_db` vẫn có đúng dữ liệu như trước khi kiểm (9 phòng ban, 83 nhân viên); dữ liệu thử được xóa.

## Constraints

- AI-DLC không tự commit hay push; Hiệp xem `git diff` rồi tự commit (team.md). FR3.1 vì thế phải chờ Hiệp commit sau bước sửa code.
- Không CI/CD, không Docker (project.md). Kiểm tất cả trên máy làm bài.
- Smart App Control trên máy có thể chặn file `.dll` vừa build; không được đổi cài đặt máy.

## Assumptions

- Repo không có file chỉ chạy được với CRLF (như `.bat`, `.cmd`) và không có file nhị phân mà Git có thể nhận nhầm là văn bản, nên một dòng `* text=auto eol=lf` là đủ, không cần ngoại lệ (`code-structure.md`) [assumption].
- `dotnet format` chấp nhận file `.cs` dạng LF: ngày 05/11 `verify` đạt khi mọi file còn là LF [assumption].

## Out of Scope

- Đổi API để báo lỗi của mọi ô cùng lúc: hiện tại API dừng ở lỗi đầu tiên (BR11 trong `business-overview.md`), còn form React báo đủ mọi ô; giữ nguyên thiết kế.
- Đổi công cụ đo độ phủ (coverlet sang Microsoft Code Coverage).
- Đổi cấu hình Git của máy hay của người khác; dọn bản clone cũ `C:\Users\ASUS\thu-clone-employee-crud`.

## Open Questions

- Không có câu hỏi chặn. Hai mục cần Hiệp làm tay (FR4.5–FR4.7) và bước commit trước FR3.1 sẽ được hướng dẫn từng bước trong Build and Test.

## Sources

- [desc] Initial description: mô tả ban đầu của việc (`project-description.json`).
- [Q1]–[Q4] `requirements-analysis-questions.md`: Q3, Q4 do Hiệp chọn; Q1, Q2 Hiệp để AI chọn theo chuẩn công ty, lý do ghi trong file.
- `aidlc/spaces/default/codekb/employee-crud/business-overview.md`, `architecture.md`, `code-structure.md`, `code-quality-assessment.md`.
- [memory] `team.md` (AI-DLC không tự commit, Hiệp tự commit), `project.md` (Forbidden: không cài ra ngoài, không lộ mật khẩu).
