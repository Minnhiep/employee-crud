<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-01T09:20:00Z — Q4 Hiệp viết "kết nối DB hay j thì chỉ tôi nhé, otio kết nối luôn vì tôi có tải rồi": hiểu là mọi thao tác chạm PostgreSQL trên máy (tạo employee_db, user-secrets, dotnet ef database update) AI chỉ hướng dẫn từng bước, Hiệp tự làm. Ghi vào bolt-plan và team-allocation để Code Generation tuân theo.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-01T09:20:00Z — Lệnh kiểm cho mỗi unit (verification command) chưa chọn được vì greenfield chưa có code và chưa biết thư mục backend/frontend; để điểm kiểm đầu tiên hỏi Hiệp, không đặt lệnh giữ chỗ.
