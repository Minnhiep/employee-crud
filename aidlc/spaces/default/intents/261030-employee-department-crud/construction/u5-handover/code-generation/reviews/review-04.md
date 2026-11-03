## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-04
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | README.md > mục 3 "Đặt connection string bằng user-secrets" | README viết `Remove-Variable p, s` "xóa nó khỏi bộ nhớ". Thực tế lệnh này chỉ bỏ tên biến; chuỗi mật khẩu dạng văn bản vẫn nằm trong bộ nhớ tiến trình PowerShell cho tới khi bị thu dọn, và dòng `PtrToStringAuto(SecureStringToBSTR(...))` không giải phóng vùng BSTR. Phần "không vào lịch sử PowerShell" thì đúng. | Sửa câu giải thích thành "bỏ biến sau khi dùng" (không hứa xóa khỏi bộ nhớ), hoặc thêm `ZeroFreeBSTR`. Đây chỉ là chỗ nói quá, không ảnh hưởng chạy. | Resolved (reviewer) |
| R-02 | Minor | README.md > mục 11 "Sự cố thường gặp", lỗi Smart App Control | README bảo "chỉnh Smart App Control trong Windows Security, cân nhắc trước khi làm" nhưng không nói rõ hệ quả. Theo hiểu biết của tôi (chưa kiểm trên máy), trên Windows 11 tắt Smart App Control thường không bật lại được nếu không cài lại hệ điều hành. Người làm theo README có thể tắt mà không biết. | Thêm một câu nêu rõ hệ quả này (hoặc ghi "chưa kiểm") và gợi ý thử build lại trước. Kiểm với tài liệu Microsoft rồi mới khẳng định. | Resolved (reviewer) |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/code-generation/unit-test-instructions.md > dòng T6 | Tiêu chí T6 chỉ cho phép chữ giữ chỗ `<mật-khẩu-của-bạn>`, nhưng README đã đổi sang `$p` và mẫu che `***`. Chạy T6 hôm nay ra 3 dòng (README.md dòng 48, 57, 60), đều không có mật khẩu thật; code-summary đã ghi nhận chỗ lệch này. Tiêu chí chưa được cập nhật. | Sửa cột "Đạt khi" của T6 thành "mọi dòng khớp chỉ chứa biến `$p` hoặc `***`". Không cần đổi tài liệu. | Resolved (reviewer) |
| R-04 | Minor | docs/danh-sach-api.md > Quy ước chung và mục "Lỗi 400" | Tài liệu ghi đúng hành vi thật: lỗi 400 trả `application/json` và thiếu trường `type`, khác FR4/C3 (yêu cầu `application/problem+json`). Người đọc handover sẽ thấy 404/409 và 400 có hai kiểu khác nhau mà không rõ đó là lệch đã biết. Việc này đã nằm trong danh sách chuyển cho Build and Test (mục 4), nhưng chưa có ghi chú ngay trong tài liệu. | Thêm một dòng trong tài liệu (ví dụ "đây là hành vi hiện tại, đang chờ xem xét") để người đọc không tưởng là lỗi tài liệu. Việc sửa code do Build and Test quyết. | Resolved (reviewer) |
| R-05 | Suggestion | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/code-generation/code-summary.md > §3.6 và §5 mục 2 | Hai điểm cần Hiệp nắm khi duyệt. (a) README chưa được chạy từ đầu trên máy trắng: bước đặt user-secrets lần đầu và tạo database mới chỉ kiểm bằng cách đọc lệnh (đã ghi là hạn chế cùng máy). (b) `ErrorMapper` chưa nhận SQLSTATE 23001, nên khi hai thao tác chen nhau, xóa phòng ban có thể trả 500 thay vì 409; tài liệu API mô tả 409 chỉ đúng trên đường đi qua Service. Cả hai đã được ghi đúng chỗ. | Không cần sửa U5. Hiệp nhớ rằng hai điểm này là rủi ro còn mở, và (b) cần xử lý ở Build and Test. Thư mục `C:UsersASUSthu-clone-employee-crud` ngoài dự án cũng cần Hiệp tự quyết giữ hay xóa. | Accepted risk |
| R-06 | Suggestion | README.md > mục 3, khối lệnh `Read-Host` | Mật khẩu có ký tự đặc biệt của chuỗi kết nối (dấu `;`, `=`) sẽ làm hỏng connection string. Tôi chưa kiểm hành vi này, đây là suy luận từ cú pháp. Ngoài ra khối lệnh chỉ chạy trong PowerShell và chưa có ghi chú về điều đó. | Nếu muốn, thêm một dòng cảnh báo mật khẩu có `;` hoặc `=` cần bao trong dấu nháy. Không chặn bàn giao. | Accepted risk |
| R-07 | Minor | README.md > mục 10, đoạn "Vì sao lệnh đo độ phủ backend nằm trong frontend/package.json" | Lời giải thích nói lệnh đo độ phủ nằm ở frontend "để có một lệnh npm run verify kiểm cả hai phía". Thực tế `verify` trong `frontend/package.json` chạy typecheck, lint, format:check, build rồi `dotnet test`, và không gọi `coverage`. Lệnh `coverage` là script riêng. Lý do viết trong README không khớp với cách script được nối. | Sửa câu giải thích cho đúng: `verify` kiểm kiểu, lint, định dạng, build và test backend; `coverage` là script riêng cũng đặt ở frontend để mọi lệnh kiểm nằm chung một chỗ. Hoặc nói rõ `verify` không đo độ phủ. | New |
| R-08 | Minor | README.md > mục 3 (và mục 13 bước 3) khối PowerShell đặt connection string | Mật khẩu được ghép thẳng vào chuỗi kết nối rồi truyền làm tham số dòng lệnh cho `dotnet user-secrets set`. Không vào lịch sử PowerShell nên đúng ý đồ. Tuy vậy: (1) mật khẩu chứa dấu `;` hoặc `"` sẽ làm hỏng chuỗi kết nối hoặc cách truyền tham số trên Windows PowerShell 5.1, người mới sẽ khó đoán nguyên nhân; (2) tham số hiện ngắn hạn trong danh sách tiến trình của máy. | Thêm một dòng lưu ý: mật khẩu PostgreSQL không nên chứa `;` và `"`, nếu có thì bọc mật khẩu trong dấu nháy kép theo cú pháp Npgsql hoặc đổi mật khẩu khác. Có thể ghi thêm rằng tham số chỉ hiện ngắn trên máy cá nhân. | New |
| R-09 | Minor | README.md > mục 13 bước 1 (GRANT) và phần "Kiểm" | Quyền cấp cho `employee_app` đủ cho ứng dụng: `employees.id` và `departments.id` là cột identity nên cần `USAGE, SELECT` trên sequence, đã có. Backend không gọi migrate lúc chạy (Program.cs chỉ có `AddDbContext` và `UseNpgsql`), nên không cần đọc `__EFMigrationsHistory`. Nhưng tài liệu chưa nói điều này, và lời kiểm chỉ thử `CREATE TABLE`. Nếu sau này thêm bước tự migrate khi khởi động thì tài khoản này sẽ lỗi `permission denied`. Lệnh `SET ROLE` chỉ có tác dụng đến `RESET ROLE`, nếu câu lệnh lỗi trong một giao dịch đang mở thì phải `ROLLBACK` trước. | Thêm một câu: ứng dụng không tự chạy migration nên tài khoản không cần quyền trên `__EFMigrationsHistory`; muốn tự migrate lúc khởi động thì phải dùng tài khoản có quyền sửa bảng. Ghi thêm "nếu pgAdmin báo giao dịch đã lỗi, chạy `ROLLBACK;` rồi `RESET ROLE;`". | New |
| R-10 | Minor | docs/du-lieu-mau.sql > dòng DELETE ở dạng ghi chú | `DELETE ... WHERE email LIKE '%@congty.example'` chỉ gỡ dữ liệu theo đuôi email, nên cũng xóa mọi nhân viên người dùng tự thêm bằng email đuôi này. Hiệu ứng này đúng ý ("dữ liệu mẫu") nhưng chưa được nói. Dòng này cũng không có điều kiện nào ngăn xóa khi chưa bôi đen riêng dòng; lúc đó file chạy cả script không bị ảnh hưởng vì dòng đang là ghi chú, nên rủi ro thấp. | Thêm vào ghi chú trên dòng DELETE: "xóa cả những người bạn tự thêm bằng email đuôi này". Không cần đổi câu lệnh. | New |
| R-11 | Minor | docs/du-lieu-mau.sql > khối gỡ (cuối file) và README.md mục 12 bước 4 | README đã cảnh báo đúng phạm vi xóa (mọi email `@congty.example`, 4 phòng trùng tên nếu rỗng). Nhưng khối gỡ vẫn chưa có bằng chứng đã chạy thử trong code-summary. | Chạy thử khối gỡ trên database demo một lần rồi ghi kết quả, hoặc ghi rõ "khối gỡ chưa chạy thử" trong code-summary. | New |
| R-12 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/code-generation/code-summary.md > bảng Phần H (dòng N-01) và dòng "Trạng thái máy sau Phần H" | Hai chỗ này vẫn ghi 10 nhân viên mẫu. Đây là lịch sử Phần H nên chấp nhận được, nhưng thiếu ghi chú trỏ sang 80 người của Phần I (plan đã có ghi chú). | Thêm một câu "đã thay bằng 80 nhân viên ở mục 6d" vào hai chỗ đó. | New |

> R-01 Earlier decision: Accepted risk

> R-02 Earlier decision: Accepted risk

> R-03 Earlier decision: Accepted risk

> R-04 Earlier decision: Accepted risk

> R-07 Not re-checked this round

> R-08 Not re-checked this round

> R-09 Not re-checked this round

> R-10 Not re-checked this round

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| Đối chiếu số liệu README, SQL, danh sách API | README mục 12 và 16 đều ghi 80 nhân viên và 4 phòng thêm. SQL ghi 80 người, 8 phòng, phân bố 10/10/12/12/9/9/9/9. Ví dụ API ghi Kế toán 11, Kinh doanh 12, Kỹ thuật 14, "còn 11 nhân viên". | Khớp nhau. Kế toán 11 và Kỹ thuật 14 khớp với 10 và 12 người mẫu cộng 3 người Hiệp tự nhập (code-summary mục 6d). |
| Các sửa từ lượt review trước | Mục 16 đã sửa; mục 12 bước 4 nêu đúng phạm vi xóa; câu Nghị định đã viết lại (chỉ còn là mẫu tham khảo, không dẫn phụ lục); ví dụ API đã gọi lại sau khi có dữ liệu mẫu; plan Phần H có ghi chú 10 so với 80. | Cả 5 điểm của lượt trước đã được xử lý. |
| Chạy lại SQL và test | Không chạy trong lượt này (chỉ đọc). | Dựa vào kết quả đã ghi: Hiệp chạy hai lần đều ra 80. |

### Summary

Các sửa sau lượt review trước đã khớp: số liệu trong README, SQL và danh sách API nhất quán. Chỉ còn hai điểm Minor (khối gỡ chưa chạy thử, lịch sử Phần H chưa trỏ sang bản 80 người), không chặn bàn giao, nên READY.
