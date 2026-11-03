<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->
- 2026-11-02T18:29:13Z — Gộp tiêu chí hoàn thành mục 5 của `docs/ke-hoach.md` vào bảng đối chiếu (dòng KH-1..KH-6); Hiệp chọn "Gộp vào Build and Test" ở đầu phiên. "Demo 15 phút" và "mỗi bạn giải thích được" là việc của Hiệp, không đo được trong stage này, ghi vào việc còn mở.
- 2026-11-02T18:29:13Z — Mức sàn độ phủ 80% đọc theo `team.md`: chỉ tính các lớp service. Tổng cả assembly 43,3% (controller, migration không có test tự động theo `team.md`) được ghi để minh bạch, không phải tiêu chí.
- 2026-11-02T18:29:13Z — NFR2.4 của U1 tách hai dòng: phần "API kiểm lại dữ liệu" là mục tiêu; phần 32 KB/413 đã bị bỏ có chủ đích ở NFR Design U1 (`security-design.md` §3, không có nguồn) nên ghi N/A, dù thử 40 KB thì API nhận và trả 400 của service.
- 2026-11-02T18:29:13Z — Danh sách F/V/A/D/R trong `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md` viết trước thiết kế; kết quả mong đợi lấy theo thiết kế đã duyệt (C2, C3), chỗ lệch ghi trong `integration-test-instructions.md`, không sửa file của Hiệp.

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->
- 2026-11-02T18:29:13Z — Lượt chạy 1 dừng ở Step 9 với 2 mục Không đạt có gốc ở code U1 (C3-400, U1-NFR3.3) → quay lại Code Generation U1 (loop-back 1). Các mục kiểm tay (luồng chính trên trình duyệt, Lighthouse các trang form, W3C, tắt PostgreSQL giữa chừng, hạn 10 giây) để Chưa kiểm được ở lượt này và làm một lần sau khi sửa, để Hiệp không phải làm hai lần.
- 2026-11-02T18:29:13Z — Đo NFR5.1 của U1 bằng `HttpClient` của PowerShell thay vì Postman (cùng phép đo: 10 lần `GET /api/khong-ton-tai`, lấy trung vị).

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->
- 2026-11-02T18:29:13Z — Lỗi 400 sai Content-Type: gốc là `[Produces("application/json")]` trên controller U3/U4 đè `ContentTypes` mà `ValidationResponseFactory` (U1) đặt. Chọn sửa ở U1 (trả kết quả không bị bộ lọc `[Produces]` ghi đè, thêm `type`) thay vì bỏ `[Produces]` ở U3/U4: một chỗ sửa, nằm đúng ở tầng sở hữu phong bì lỗi C3, không mở lại hai Unit.
- 2026-11-02T18:29:13Z — 23001: `DepartmentService` (U4) đã bắt 23001 nên đường xóa chen nhau không ra 500; chỗ hở chỉ còn ở tầng dự phòng `ErrorMapper`. Vẫn sửa vì Hiệp chọn và vì NFR3.3 của U1 yêu cầu ở chính tầng này; đã nói rõ mức độ nhẹ hơn với Hiệp.

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
