<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
- 2026-11-01T15:45:00Z [unit u2-web-shell] — Giữa lúc build, Hiệp đổi frontend sang TypeScript (sửa project.md Tech Stack/Forbidden, team.md Code Style, tài liệu U2, kế hoạch; build chạy tiếp với kế hoạch đã sửa). Vite mới tạo oxlint → dùng ESLint 10 (Hiệp: "chuẩn nhất khi đi làm"); jsx-a11y chưa hỗ trợ ESLint 10 nên bỏ. FormField đổi sang render-prop để TypeScript kiểm được thuộc tính ô. Typecheck dùng `tsc -p` thay `tsc -b`.
- 2026-11-01T10:10:00Z [unit u1-backend-platform] — Agent bị chặn quyền khi chạy `dotnet new webapi`; Hiệp chọn "hỏi từng lệnh", nên phần còn lại chạy ở phiên chính. Thêm theo lựa chọn của Hiệp: ghim `Microsoft.EntityFrameworkCore` 10.* (hết xung đột 10.0.4/10.0.14); câu hướng dẫn thiếu chuỗi kết nối bỏ phần `Password=` để quét bí mật ra 0 dòng. Tool manifest nằm ở `dotnet-tools.json` gốc (.NET 10 mặc định). `StatusCodeProblemWriter` ghi JSON trực tiếp vì `IProblemDetailsService` giao 415 của controller cho bộ ghi MVC đang tắt (SuppressMapClientErrors) → thân rỗng.
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-01T14:50:00Z [unit u1-backend-platform] — Review code (READY, advisory): Major — BR1.5 mới một phần (23503 chỉ có nhánh chung 409); U3 phải bắt 23503 khi xóa phòng ban → DomainError.Conflict(title "Không thể xóa phòng ban"), U4 bắt 23503 khi ghi nhân viên → DomainError.Validation("departmentId"). Minor: chưa test OpenAPI 404 ngoài Development, chưa test preflight OPTIONS cho PUT/DELETE (nên thêm ở U3), lời báo 400 BadHttpRequest quá chung, gói ghim `10.*` (cân nhắc ghim bản cụ thể). Đưa cho Hiệp ở checkpoint U1.
