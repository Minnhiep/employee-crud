<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-01T09:00:00Z [unit u1-backend-platform] — Không đặt câu hỏi cho Hiệp: mọi quyết định của U1 đã chốt ở C3/C5 (Contract Design). Giải luôn các điểm R-02/R-04/R-07 của Contract Design (lỗi do framework sinh, tên ràng buộc cố định, CORS cho phản hồi lỗi) bằng BR1.4, BR1.5, BR1.7, BR2.3 — không thêm tính năng mới.
- 2026-11-01T09:00:00Z [unit u1-backend-platform] — Stage yêu cầu "không framework references", nhưng tech stack đã khóa và Hiệp cần trình bày được, nên giữ vài tên cụ thể (user-secrets, dotnet ef dbcontext info, mã lỗi PostgreSQL) ở mức mô tả, không viết code.

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
