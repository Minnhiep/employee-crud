<!-- INVARIANT: examples are single-line HTML comments so a fresh template parses to total=0 (MEMORY_EMPTY). Do NOT un-comment or split across lines. t100 guards this. -->
> This file is kept up to date automatically while the stage runs. Add observations at the review step, not by editing here directly.

## Interpretations
- 2026-11-02T09:39:00Z [unit u5-handover] — Hiệp chọn "Làm gọn": không hỏi thêm; unit spec nên chỉ viết security-requirements (NFR2.1–NFR2.4, NFR7.1), tech-stack-decisions (công cụ viết và kiểm tài liệu; NFR1.1, NFR3.1, NFR4.1, NFR6.1), traceability (NFR5, NFR8 N/A). Reviewer READY, 1 Major: git grep không quét lịch sử commit — để Hiệp quyết ở checkpoint U5.
- 2026-11-02T02:50:00Z [unit u4-employees] — Không hỏi thêm: dùng lại lựa chọn đã chạy ở U3 (InMemory, ThrowingAppDbContext, reportgenerator, chỉ mục viết tay lower()). Mới: khóa ngoại khai bằng cấu hình EF với HasConstraintName(DbConstraintNames.EmployeeDepartmentForeignKey) để tên không lệch; tìm bằng ToLower().Contains() (EF tự thoát %/_, chạy InMemory); đo NFR5 với 1.000 nhân viên chèn tạm bằng SQL tay. Thứ tự kiểm PUT: tìm nhân viên trước.
- 2026-11-02T01:30:00Z [unit u3-departments] — Không hỏi thêm. Chọn EF Core InMemory cho unit test service (team.md Q7 giao Code Generation chọn; quyết sớm ở đây vì ảnh hưởng cách so trùng): InMemory chạy ToLower() bằng .NET nên đúng chữ có dấu, SQLite in-memory thì lower() chỉ ASCII. So trùng bằng ToLower() trong LINQ (Npgsql → lower(), cùng chỉ mục). Chỉ mục lower(name) viết tay trong migration, seed InsertData không id.
- 2026-11-01T15:15:00Z [unit u2-web-shell] — Không hỏi thêm: công nghệ và ngưỡng đã chốt (project.md, team.md, Refined Mockups Q1–Q9, Q1 của U2). G1–G6 gắn vào NFR gần nhất: G3, G4 → NFR5.1, NFR5.2; G1, G2, G5, G6 → NFR8.2–NFR8.5. Đo trên `npm run preview -- --port 5173 --strictPort` để khớp CORS.
<!-- example: 2026-05-29T10:14:32Z — chose REST over GraphQL; the consuming team only needs CRUD, revisit if subscriptions land -->

## Deviations
<!-- example: 2026-05-29T10:14:32Z — skipped the optional caching layer the stage prose suggested; the dataset is small enough that it adds risk -->

## Tradeoffs
<!-- example: 2026-05-29T10:14:32Z — picked TDD over BDD this run; the team is unit-first and the domain is well-understood -->

## Open questions
<!-- example: 2026-05-29T10:14:32Z — confirm the retention window with compliance before the next stage hardens the schema -->
- 2026-11-02T03:00:00Z [unit u4-employees] — Review (READY, 3 Minor), đưa vào NFR Design / kế hoạch code: (1) phương án dự phòng nếu lower() không hạ chữ có dấu — thực tế U3 đã kiểm `lower('KẾ TOÁN') = lower('Kế toán')` ra true trên chính database này, vẫn kiểm "Đỗ"; sửa lý do %/_ theo SQL thật (xem log, có thể là strpos chứ không phải LIKE); (2) dữ liệu 1.000 nhân viên tạm: generate_series có dấu, email đuôi `@perf.test`, xóa có điều kiện rồi `SELECT count(*)`; (3) mẫu quét bí mật thêm `"password"\s*:`.
- 2026-11-02T02:00:00Z [unit u3-departments] — Review (READY, advisory), 4 Minor đưa vào NFR Design / kế hoạch code: (1) ai đổi `DbUpdateConcurrencyException` → 404: ErrorMapper U1 chưa xử lý, U3 phải bắt trong service hoặc thêm vào ErrorMapper; (2) cách đọc độ phủ 80%: reportgenerator cài local trong tool manifest, hoặc ngưỡng coverlet; (3) kiểm tay "KẾ TOÁN" với "Kế toán" trên PostgreSQL thật (collation database); (4) test InMemory xanh chưa chứng minh hành vi PostgreSQL, vì `ToLower()` .NET theo culture còn `lower()` theo collation, nên kiểm thêm trên database thật.
- 2026-11-01T15:20:00Z [unit u2-web-shell] — Review (READY, advisory): Major — NFR5 gốc (API dưới 1 giây) thuộc U1/U3/U4; các mục NFR5.x của U2 là G3/G4/timeout, không phủ ý "1 giây" (nói rõ ở checkpoint). Minor đưa vào kế hoạch code: đo lại NFR5.1 khi U3/U4 xong; ghi chú `dotnet run --launch-profile http` trong client.js; chạy `npm audit` và ghi kết quả; kiểm tay timeout 10 giây ghi vào Build and Test.
