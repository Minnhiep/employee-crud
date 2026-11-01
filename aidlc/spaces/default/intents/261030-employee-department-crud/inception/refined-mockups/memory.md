<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-01T00:00:00Z — Câu trả lời Q6 "chuẩn chỉnh hết mọi thứ, chuẩn hóa toàn bộ này kia luôn, tốc độ router" quá rộng; hỏi thêm Q7–Q9 để đổi thành mục tiêu đo được (WCAG 2.1 AA, Lighthouse a11y 100 / perf ≥ 90 / best practices ≥ 90, W3C Validator, biến CSS chung). Ghi là yêu cầu mới G1–G6 có nguồn Hiệp, vì vượt docs/ke-hoach.md.
- 2026-11-01T00:00:00Z — Không có wireframe/user-flow (classic bỏ rough-mockups); thiết kế thẳng từ stories.md, không bịa nội dung hai file thiếu.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-01T00:00:00Z — Thêm ba điểm nhỏ là [assumption] để Hiệp sửa được: trang "Không tìm thấy trang" cho đường dẫn sai, chuỗi tìm kiếm ghi lên địa chỉ (?search=), focus chuyển về h1 sau khi đổi trang/xóa (cần cho WCAG 2.4.3).

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
