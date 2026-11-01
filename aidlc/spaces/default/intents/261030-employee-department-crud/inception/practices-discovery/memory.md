<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

- 2026-10-30T07:42:38Z — Q12 Hiệp chọn cả 4 luật và thêm "làm đúng chuẩn chỉnh theo yêu cầu của PJ tôi đưa cho bạn"; hiểu là một luật cứng ALWAYS: bám đúng và đủ yêu cầu trong docs/ke-hoach.md (dự án anh giao), không thêm, không bớt.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-10-30T07:42:38Z — Rút 15 câu gợi ý của lead xuống 12 câu (mức Standard ~5-8): bỏ câu về kiểu gộp worktree (mặc định squash, không ảnh hưởng một người làm trên main) và câu về duyệt tự động trong Construction (sẽ được hỏi riêng lúc vào Construction).

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-10-30T07:42:38Z — Mức sàn độ phủ 80% giữ theo mặc định classic nhưng tính trên lớp service và chạy trên máy thay cho CI, vì project.md cấm CI/CD và chỉ test logic service.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
