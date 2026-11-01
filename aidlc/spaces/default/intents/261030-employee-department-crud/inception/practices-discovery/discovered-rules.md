# Luật cứng phát hiện được

> Chỉ ghi những ràng buộc chính Hiệp đã nói ra và đã xác nhận ở câu Q12 trong `practices-discovery-questions.md` (2026-10-30).
>
> **Vì sao không chép lại 7 luật NEVER đã có:** `project.md` mục `## Forbidden` đã có 7 luật: không microservices, không Redux, không CI/CD, không commit mật khẩu, không đăng nhập/phân quyền, không Docker, không TypeScript/Next.js. Công cụ `practices-promote` chỉ bỏ qua luật trùng **đúng từng chữ**, nên viết lại bằng tiếng Việt sẽ thành bản sao thứ hai. Chúng chỉ được nhắc tới bằng comment bên dưới và vẫn có hiệu lực.
>
> **Cách đọc:** mỗi dòng bắt đầu bằng `ALWAYS` hoặc `NEVER` là một luật; khi Hiệp duyệt gate, luật được thêm vào `project.md` kèm dấu ngày. Dòng comment `<!-- ... -->` không bị chép.

## Mandated

<!-- Hiệp xác nhận Q12 (lựa chọn A), 2026-10-30. Nguồn: project.md Decided "AI-DLC generates code; Hiệp ... approves every gate himself" và CLAUDE.md của Hiệp. -->
ALWAYS để Hiệp tự trả lời mọi câu hỏi và tự duyệt mọi gate; AI-DLC không bao giờ trả lời hay duyệt thay Hiệp.
<!-- Hiệp xác nhận Q12 (lựa chọn B), 2026-10-30. Nguồn: project.md Decided "Validation on both the React form and the API". -->
ALWAYS kiểm tra dữ liệu ở cả form React lẫn API, và API trả lỗi theo ProblemDetails với mã HTTP đúng (400/404/409).
<!-- Hiệp xác nhận Q12 (lựa chọn C), 2026-10-30. Nguồn: project.md Decided "User-facing explanations and UI text in Vietnamese". -->
ALWAYS viết chữ trên giao diện và thông báo lỗi cho người dùng bằng tiếng Việt.
<!-- Hiệp thêm ở Q12 (X), 2026-10-30, nguyên văn: "làm đúng chuẩn chỉnh theo yêu cầu của PJ tôi đưa cho bạn". -->
ALWAYS làm đúng và đủ theo yêu cầu trong docs/ke-hoach.md (dự án Hiệp giao), không tự thêm hay bớt tính năng.

## Forbidden

<!-- Đã có trong project.md ## Forbidden, không chép lại: microservices, Redux, CI/CD, commit secrets, authentication, Docker, TypeScript/Next.js (affirmed 2026-10-30). -->
<!-- Hiệp xác nhận Q12 (lựa chọn D), 2026-10-30. Nguồn: CLAUDE.md của Hiệp "Không cài gì ra ngoài thư mục dự án, không đổi PATH nếu chưa được duyệt"; khớp Q3 (tool manifest). -->
NEVER cài công cụ hoặc gói ra ngoài thư mục dự án (ví dụ `dotnet tool install --global`, `npm install -g`) hay đổi PATH khi Hiệp chưa duyệt.
<!-- Hiệp xác nhận Q12 (lựa chọn D), 2026-10-30. Nguồn: CLAUDE.md thư mục 27-10 "Git trên máy; làm xong thì chỉ Hiệp từng bước đẩy lên GitHub". -->
NEVER tự đẩy (push) code lên GitHub; Hiệp tự làm từng bước khi bài đã xong.
