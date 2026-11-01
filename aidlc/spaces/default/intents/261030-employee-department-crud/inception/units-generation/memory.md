<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-01T08:55:00Z — Luật chặn xóa phòng ban còn nhân viên (FR1.6) dời sang U4 vì cần bảng employees; U4 sửa DepartmentService. Đổi lại US1.4 trải hai unit. Phương án khác (tạo bảng employees sớm ở U1/U3) bị bỏ vì làm U3 phụ thuộc thực thể chưa thiết kế.
- 2026-11-01T08:55:00Z — U3, U4 không gắn kind để nhận đủ ma trận tài liệu thiết kế (cả backend lẫn giao diện) thay vì gắn service và bỏ sót phần UI.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
