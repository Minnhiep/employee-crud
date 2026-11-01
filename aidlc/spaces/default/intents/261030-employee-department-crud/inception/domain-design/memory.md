<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-01T08:40:00Z — Đọc chéo dữ liệu có chủ đích (Phòng ban đếm bảng nhân viên; Nhân viên JOIN lấy tên phòng ban) để giữ đồ thị phụ thuộc không vòng; ghi ở ADR-002/003. DbContext chung làm Platform biết kiểu thực thể của hai khối — phụ thuộc "hình dạng", không ghi là depends_on (ADR-004).
- 2026-11-01T08:40:00Z — Platform chuyển cả lỗi vi phạm ràng buộc DB thành 409/400 (không để 500): xử lý luôn điểm R-03 mà Hiệp đã chấp nhận là rủi ro ở Requirements Analysis, vì cần cho ADR-002 (chốt chặn thứ hai).

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
