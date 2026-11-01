<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-10-30T07:55:00Z — Phòng ban không tồn tại khi tạo/sửa nhân viên trả 400 (lỗi trường departmentId) chứ không phải 404, vì 404 dành cho tài nguyên trên URL; team-practices chỉ ghi "phòng ban không tồn tại" như một ca test, chưa nêu mã.
- 2026-10-30T07:55:00Z — Các yêu cầu loading/lỗi/trống (FR4.5), chống bấm hai lần (FR4.6), nhãn ô nhập (FR5.4) và CORS (NFR7) không do Hiệp nêu trực tiếp; ghi là [assumption] từ corner-checklist và ke-hoach mục 2 (loading, lỗi) để Hiệp sửa được ở gate.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-10-30T07:55:00Z — Tên 4 phòng ban mẫu và độ dài tối đa các trường là giả định; Hiệp chưa xác nhận.
