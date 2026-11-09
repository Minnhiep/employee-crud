# Câu hỏi làm rõ yêu cầu: kiem-cuoi-crlf

Bối cảnh: Git cài mặc định trên Windows đặt `core.autocrlf=true` (trong `C:/Program Files/Git/etc/gitconfig`). Repo lưu mọi file dạng LF và chưa có `.gitattributes`, nên khi Git ghi file ra máy (clone, switch, pull) thì file thành CRLF. Prettier mặc định đòi LF, nên `npm run verify` dừng ở bước `prettier --check` (29 file frontend đang là CRLF). Các bước typecheck, lint, build, `dotnet format` chạy riêng đều đạt trên cây CRLF; riêng `dotnet test` đang bị Smart App Control chặn file `EmployeeCrud.Api.Tests.dll` (lỗi 0x800711C7), không liên quan CRLF.

## Q1. [Kỹ thuật] Sửa kiểu xuống dòng bằng cách nào?

Cách sửa quyết định máy nào clone về cũng chạy `npm run verify` sạch hay vẫn phụ thuộc cài đặt riêng của từng người.

A. Thêm `.gitattributes` với `* text=auto eol=lf`: Git luôn ghi file văn bản ra dạng LF trên mọi máy, bất kể `core.autocrlf`; rồi đưa các file đang CRLF trên máy này về LF
B. Như A, và thêm `end_of_line = lf` vào `.editorconfig` để trình soạn thảo cũng tạo file mới dạng LF
C. Chỉ đặt Prettier `"endOfLine": "auto"`: Prettier chấp nhận cả hai kiểu; không đổi file nào, nhưng repo vẫn lẫn CRLF và LF tùy máy
D. Chỉ ghi vào README: dặn người clone tự đặt `git config core.autocrlf input` trước khi clone
X. Other (please specify)

[Answer]: B (Hiệp để AI chọn: "Bạn hãy làm  chuẩn chỉnh như thực tế, các cty làm ntn làm như v, chuẩn nghiệp vụ"). Lý do chọn: `.gitattributes` nằm trong repo nên áp cho mọi người clone, không phụ thuộc cài đặt riêng của từng máy (đây là cách GitHub khuyên dùng); thêm `end_of_line = lf` vào `.editorconfig` để trình soạn thảo cũng tạo file mới dạng LF, hai lớp khớp nhau.
**Mode:** guided

## Q2. [Kiểm thử] Thế nào thì coi là "máy Windows nào clone về cũng verify sạch"?

Cần một phép kiểm có kết quả đạt/không đạt rõ ràng. Lưu ý: AI-DLC không tự commit; bản clone chỉ có `.gitattributes` sau khi Hiệp commit.

A. Trên máy này: sau khi sửa, `git ls-files --eol` cho thấy mọi file văn bản là `w/lf`, và `npm run verify` qua bước Prettier
B. Như A, và sau khi Hiệp commit thì clone repo trên máy (`git clone` từ thư mục repo hiện tại) vào một thư mục thử nằm trong `backend/TestResults/` (đã bị `.gitignore` loại), kiểm file ra LF và `prettier --check` đạt
C. Như A, và sau khi Hiệp push thì clone từ GitHub vào thư mục trống, làm đúng theo README từ đầu
X. Other (please specify)

[Answer]: B (Hiệp để AI chọn: "bạn hãy làm chuẩn theo nghiệp vụ, chuyên nghiệp, chuẩn chỉnh như các cty lớn làm, 1 chuyên viên code"). Lý do chọn: công ty thường kiểm trên một bản checkout mới (máy CI); dự án không có CI nên clone mới trên máy là phép kiểm tương đương, làm được ngay sau khi Hiệp commit, không cần push. Clone từ GitHub (C) vẫn nên làm sau khi Hiệp push, như một lần kiểm thêm.
**Mode:** guided

## Q3. [Kiểm thử] Nếu Smart App Control vẫn chặn file test `.dll` thì 148 test tính thế nào?

Luật dự án cho thêm comment có ích tối đa 2 lần mỗi lần gặp; hôm nay đã thử 3 lần và 1 lần build ra thư mục khác, vẫn bị chặn. Không đổi cài đặt máy.

A. Build and Test thử lại theo luật (sau khi sửa sẽ có bản build mới); vẫn bị chặn thì ghi "chưa chạy được do Smart App Control" kèm bằng chứng, dựa vào kết quả 148/148 ngày 05/11 (code ứng dụng không đổi), coi là đạt có ghi chú
B. Coi là chưa đạt: việc này chưa xong cho tới khi chạy được 148 test (có thể phải chạy trên máy khác)
X. Other (please specify)

[Answer]: A
**Mode:** guided

## Q4. [Kiểm thử] Các mục kiểm tay còn mở (D01–D03 trên database, migration trên database trống, Lighthouse) làm thế nào?

D01–D03 và migration trên database trống cần tài khoản `postgres` (mật khẩu do Hiệp gõ, AI không gõ). Lighthouse chạy bằng `npx` sẽ tải gói vào bộ nhớ đệm npm nằm ngoài thư mục dự án; còn chạy trong Chrome DevTools thì không cần cài gì.

A. Hiệp làm tay theo hướng dẫn từng bước của AI (pgAdmin cho D01–D03; khối PowerShell nhập mật khẩu ẩn cho migration vào database thử rồi xóa database đó; Lighthouse trong Chrome DevTools trên bản build); AI kiểm kết quả và ghi vào báo cáo
B. Như A, nhưng Lighthouse do AI chạy bằng `npx lighthouse` (cần Hiệp duyệt tải gói ra ngoài thư mục dự án)
C. Để lại các mục này, ghi "chưa làm" trong báo cáo
X. Other (please specify)

[Answer]: A
**Mode:** guided
