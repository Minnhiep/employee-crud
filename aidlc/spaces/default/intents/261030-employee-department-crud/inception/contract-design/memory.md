<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-01T09:05:00Z — Chốt bảng ánh xạ lỗi ràng buộc DB (23505 -> 409, 23503 khi ghi nhân viên -> 400 departmentId, 23503 khi xóa phòng ban -> 409) trong C3 để đóng điểm R-05 của Domain Design và R-03 của Requirements (đã chấp nhận là rủi ro nhưng hợp đồng cần một quy tắc duy nhất).
- 2026-11-01T09:05:00Z — Coi Postman/người cài đặt (P2) là consumer "External" của C1, C2 vì hệ thống không có API công khai cho bên thứ ba; danh sách API (FR7.3) là tài liệu hợp đồng cho họ.
- 2026-11-01T09:05:00Z — Chỉ mục không trùng ghi là lower(name)/lower(email); Code Generation có thể chọn cách tương đương (cột citext hoặc collation) miễn đạt cùng hành vi — để mở trong bảng câu hỏi.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
