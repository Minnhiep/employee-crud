## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-03
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/nfr-requirements/tech-stack-decisions.md > NFR4.5 Cách tìm kiếm | Tìm không phân biệt hoa thường bằng `ToLower().Contains(...)` trên PostgreSQL phụ thuộc cách `lower()` xử lý chữ có dấu (Đ, Ễ, Ạ) theo collation `English_United States.1252` của máy. Bản tóm tắt chỉ kiểm điều này ở NFR4.4 bằng tay, chưa nói làm gì nếu `lower('Đ')` không ra `đ`. Câu "EF Core tự thoát `%`, `_`" cũng chưa chắc đúng: bản dịch có thể là `strpos`, không dùng LIKE, nên không cần thoát; kết quả vẫn đúng nhưng lý do ghi chưa chính xác. | Ghi rõ: nếu thử "Đỗ Văn An" với `đỗ`, `ĐỖ` trên PostgreSQL thật mà ra 0 dòng, thì phương án dự phòng là gì (ví dụ `EF.Functions.ILike` kèm tự thoát ký tự đại diện, hoặc `citext`). Sửa câu lý do về `%` và `_` cho khớp với SQL sinh ra (xem bằng log NFR6.3). | Accepted risk |
| R-02 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/nfr-requirements/performance-requirements.md > NFR5.1, NFR5.2 | Ngưỡng 1 giây với 1.000 nhân viên đo bằng cách chèn dữ liệu tạm bằng SQL tay rồi xóa, nhưng không nói rõ cách chèn cho tên/email đủ đa dạng (có dấu, dài tới giới hạn) và không có bước kiểm tra sau khi xóa là bảng đã sạch. Sót dữ liệu tạm sẽ làm NFR1.2 (`GET /api/employees` trả `[]`) sai ở lần kiểm sau. | Thêm một dòng: chèn bằng `generate_series` với tên có dấu, xóa bằng một lệnh `DELETE` có điều kiện đánh dấu (ví dụ email đuôi `@perf.test`), rồi kiểm lại `SELECT count(*)`. | Accepted risk |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/nfr-requirements/security-requirements.md > NFR2.1 | Lệnh quét `git grep ... "(password\|pwd)s*="` chỉ bắt dạng có dấu `=`. Chuỗi kết nối kiểu `Password=...` trong `appsettings*.json` sẽ bị bắt, nhưng dạng JSON `"password": "..."` thì không. | Mở rộng mẫu quét để bắt cả `"password"s*:`, hoặc ghi rõ phạm vi chỉ là chuỗi kết nối. | Accepted risk |
| R-04 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/nfr-requirements/performance-requirements.md > Change Request 03/11/2026 (FR8), mục (1) | Mục tiêu "80 nhân viên mẫu, trung vị 10 lần ≤ 1 giây" và "Lighthouse Performance ≥ 90" không nói 80 nhân viên lấy từ đâu (cơ sở dữ liệu mẫu hiện có 12 nhân viên) và không nói đo bằng công cụ nào, nên người đo khác sẽ không lặp lại được. | Ghi cách tạo dữ liệu 80 người (script hoặc cách thêm tay) và lệnh hoặc công cụ đo; hoặc ghi rõ đây là mục tiêu tham khảo. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| Đọc chéo yêu cầu với mã nguồn | Khớp | departmentId kiểm ở server, 400 tiếng Việt; returnTo chỉ nhận /departments/<số> (EmployeeFormPage.tsx listPathFrom). |

### Summary

Yêu cầu phi chức năng của FR8 đo được và bám đúng thay đổi (1 câu SQL, 400, 409 có N, returnTo); chỉ thiếu cách đo cho hai mục tiêu hiệu năng.
