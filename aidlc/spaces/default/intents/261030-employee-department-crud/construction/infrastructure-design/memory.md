<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
- 2026-11-02T02:40:00Z [unit u3-departments] — Không hỏi thêm: U3 không thêm hạ tầng mới, chỉ bảng/chỉ mục qua migration, reportgenerator cục bộ (Q1 NFR Design), gói InMemory chỉ trong test. cicd-pipeline U3 thêm bước kiểm `lower()` trên pgAdmin, update/update 0/update, đọc độ phủ; ghi đường dẫn thật `EmployeeCrud.slnx` (U1 viết `.sln` dự kiến).
- 2026-11-01T09:25:00Z [unit u1-backend-platform] — Không đặt câu hỏi hạ tầng: triển khai, CI/CD, bí mật, mở rộng đều đã chốt ở team.md Deployment (Q8) và project.md Forbidden (không Docker, không CI/CD, chạy trên máy). "Hạ tầng" = máy của Hiệp + PostgreSQL cục bộ; cicd-pipeline.md là danh sách bước Hiệp tự chạy trước commit thay cho CI. NFR2.4, NFR3.1, NFR3.2, NFR5.5 ghi N/A vì là logic code, không cần tài nguyên.
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-02T02:45:00Z [unit u3-departments] — Review (READY, 3 Minor) đưa vào kế hoạch code U3: (1) ghi lệnh độ phủ đầy đủ, thư mục kết quả cố định, copy chạy được (có thể thêm script npm); (2) ghim phiên bản InMemory khớp EF Core (10.0.14) và reportgenerator trong manifest; cân nhắc ghim Mvc.Testing (đang `10.*`); (3) kiểm `lower('KẾ TOÁN') = lower('Kế toán')` là việc ĐẦU TIÊN của Code Generation, trước khi viết migration; nhánh 409 do chỉ mục chỉ chứng minh bằng pgAdmin/Postman.
- 2026-11-01T15:30:00Z [unit u2-web-shell] — Review (READY, chỉ Minor), đưa vào kế hoạch code U2: kiểm địa chỉ 5081 ở hai nơi (`git grep -n "5081" -- frontend`); `engines.node >= 24` trong package.json; kiểm CORS thật từ 5173 hoãn sang U3 (U3 chịu); chạy lại `npm audit` mỗi khi package.json đổi; quay lui gói: chỉ sau commit đầu có package-lock, `git diff` trước khi checkout.
- 2026-11-01T09:30:00Z [unit u1-backend-platform] — Review (READY, advisory), đưa vào kế hoạch Code Generation: (1) quét bí mật phải dùng `git grep --untracked -i -n -E "(password|pwd)\s*=" -- backend frontend` vì commit đầu mọi file chưa được theo dõi; (2) project test cấp chuỗi kết nối giả không chứa Password (ví dụ `Host=localhost;Database=test`) để app không thoát khi chạy test; (3) trước U3 chọn cách đọc độ phủ 80% (reportgenerator cục bộ hoặc Threshold của coverlet); (4) U2 đặt Vite `strictPort: true`, `Cors:AllowedOrigins` nằm trong appsettings.json; (5) README: `-- --environment Development`, lùi migration bằng `update 0`, lùi database trước rồi mới `git revert`; (6) đo khởi động bằng `dotnet run --no-build`; (7) đường dẫn sln/project là dự kiến, cập nhật checklist theo bố cục thật.
