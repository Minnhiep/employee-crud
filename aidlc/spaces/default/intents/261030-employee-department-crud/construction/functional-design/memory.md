<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
- 2026-11-01T15:05:00Z [unit u2-web-shell] — Unit giao diện nhưng vẫn viết rules.md (BR1–BR4) để truy vết AC có đích BR; không viết entities.md (không có thực thể). Thêm ErrorSummary, FormField vào phần dùng chung vì story map giao U2 "cách hiện lỗi dùng chung" (US4.1) và "CSS cho nhãn và lỗi" (US4.6). Q1 = A: VITE_API_BASE_URL=http://localhost:5081 (C3 ghi HTTPS; Hiệp chọn http cho chạy trên máy).
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-01T09:00:00Z [unit u1-backend-platform] — Không đặt câu hỏi cho Hiệp: mọi quyết định của U1 đã chốt ở C3/C5 (Contract Design). Giải luôn các điểm R-02/R-04/R-07 của Contract Design (lỗi do framework sinh, tên ràng buộc cố định, CORS cho phản hồi lỗi) bằng BR1.4, BR1.5, BR1.7, BR2.3 — không thêm tính năng mới.
- 2026-11-01T09:00:00Z [unit u1-backend-platform] — Stage yêu cầu "không framework references", nhưng tech stack đã khóa và Hiệp cần trình bày được, nên giữ vài tên cụ thể (user-secrets, dotnet ef dbcontext info, mã lỗi PostgreSQL) ở mức mô tả, không viết code.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-01T15:10:00Z [unit u2-web-shell] — Review (READY, advisory), đưa vào NFR/kế hoạch code U2: (1) hook dùng chung chặn gửi đôi bằng cờ useRef (AC4.4.1), khóa có hiệu lực ngay lúc bấm; (2) đo G1–G6 trên `vite preview --port 5173` (hoặc dev server) để khớp CORS của U1, ghi rõ bản build dùng giá trị mặc định http://localhost:5081; (3) client nhận `{ signal }`, hủy do người dùng không báo lỗi network, hạn 10 giây bao cả đọc body; (4) cách hiện Toast sau xóa (navigate cùng đường dẫn kèm state, replace), vùng role=status luôn có trong DOM; (5) kiểm POST thật qua cổng 5081 ở U3; (6) body không phải JSON / rỗng → ApiError server.
