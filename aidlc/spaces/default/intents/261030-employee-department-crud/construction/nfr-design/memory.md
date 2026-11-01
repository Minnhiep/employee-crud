<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
- 2026-11-02T02:20:00Z [unit u3-departments] — Hỏi một câu (Q1 đọc độ phủ) → Hiệp chọn A: reportgenerator cài cục bộ vào `dotnet-tools.json` ở gốc (không phải `.config/`). U3 tự bắt `DbUpdateConcurrencyException` → 404 trong service (ErrorMapper U1 không nhận ra vì không có PostgresException bên trong), không sửa U1. DTO chỉ `[Required]`, độ dài ≤100 chỉ kiểm sau trim ở service để không lệch BR1.3. Không dùng ExecuteDeleteAsync vì InMemory không hỗ trợ. Thêm bước pgAdmin `SELECT lower('KẾ TOÁN') = lower('Kế toán')` trước khi tạo migration.
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-02T02:30:00Z [unit u3-departments] — Review (READY, advisory), 2 Minor đưa vào kế hoạch code U3 và Build and Test: (1) test "sắp A-Z" trên InMemory dùng tên ASCII (InMemory sắp theo mã ký tự, khác collation PostgreSQL); thứ tự có dấu chỉ dựa vào kiểm tay trên database thật; (2) U4 phải đặt khóa ngoại đúng tên `fk_employees_department`; xóa phòng ban còn nhân viên kiểm thật bằng Postman (409) ở Build and Test sau U4.
- 2026-11-01T15:25:00Z [unit u2-web-shell] — Review (READY, advisory), đưa vào kế hoạch code U2/U3/U4: (1) sau xóa, trang gọi lại hàm tải dữ liệu (hoặc reloadKey), navigate chỉ để mang lời báo; kiểm tay dòng biến mất không cần F5; (2) client ném ApiError kind "aborted" khi trang hủy, trang bỏ qua nhánh này; (3) Toast xóa state bằng navigate replace mà không gây tải lại (hiệu ứng tải không phụ thuộc location.state/key); (4) README + comment client.js: mở đúng http://localhost:5173 (không 127.0.0.1); .env.development ghi chú giữ khớp giá trị mặc định trong client.js.
- 2026-11-01T09:16:00Z [unit u1-backend-platform] — Review (READY, advisory) sửa cơ chế CORS: UseCors ngoài cùng KHÔNG đủ vì UseExceptionHandler xóa header; Code Generation phải để IExceptionHandler tự áp lại CORS qua ICorsService.ApplyResult sau khi xóa, giữ 3 test làm bằng chứng. Thêm cho kế hoạch code: controller test qua AddApplicationPart, `public partial class Program`, factory tự cấp chuỗi kết nối giả; nhánh BadHttpRequestException giữ nguyên mã (400/413); log 4xx đặt trong IExceptionHandler/StatusCodePages chứ không thêm middleware; kiểm chuỗi kết nối phải ném ngoại lệ (không Environment.Exit) để dotnet ef chạy được; database update tự tạo employee_db nếu thiếu.
