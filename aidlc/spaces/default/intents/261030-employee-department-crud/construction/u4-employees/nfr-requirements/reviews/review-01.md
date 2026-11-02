## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-01T19:30:08Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/nfr-requirements/tech-stack-decisions.md > NFR4.5 Cách tìm kiếm | Tìm không phân biệt hoa thường bằng `ToLower().Contains(...)` trên PostgreSQL phụ thuộc cách `lower()` xử lý chữ có dấu (Đ, Ễ, Ạ) theo collation `English_United States.1252` của máy. Bản tóm tắt chỉ kiểm điều này ở NFR4.4 bằng tay, chưa nói làm gì nếu `lower('Đ')` không ra `đ`. Câu "EF Core tự thoát `%`, `_`" cũng chưa chắc đúng: bản dịch có thể là `strpos`, không dùng LIKE, nên không cần thoát; kết quả vẫn đúng nhưng lý do ghi chưa chính xác. | Ghi rõ: nếu thử "Đỗ Văn An" với `đỗ`, `ĐỖ` trên PostgreSQL thật mà ra 0 dòng, thì phương án dự phòng là gì (ví dụ `EF.Functions.ILike` kèm tự thoát ký tự đại diện, hoặc `citext`). Sửa câu lý do về `%` và `_` cho khớp với SQL sinh ra (xem bằng log NFR6.3). | New |
| R-02 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/nfr-requirements/performance-requirements.md > NFR5.1, NFR5.2 | Ngưỡng 1 giây với 1.000 nhân viên đo bằng cách chèn dữ liệu tạm bằng SQL tay rồi xóa, nhưng không nói rõ cách chèn cho tên/email đủ đa dạng (có dấu, dài tới giới hạn) và không có bước kiểm tra sau khi xóa là bảng đã sạch. Sót dữ liệu tạm sẽ làm NFR1.2 (`GET /api/employees` trả `[]`) sai ở lần kiểm sau. | Thêm một dòng: chèn bằng `generate_series` với tên có dấu, xóa bằng một lệnh `DELETE` có điều kiện đánh dấu (ví dụ email đuôi `@perf.test`), rồi kiểm lại `SELECT count(*)`. | New |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/nfr-requirements/security-requirements.md > NFR2.1 | Lệnh quét `git grep ... "(password\|pwd)s*="` chỉ bắt dạng có dấu `=`. Chuỗi kết nối kiểu `Password=...` trong `appsettings*.json` sẽ bị bắt, nhưng dạng JSON `"password": "..."` thì không. | Mở rộng mẫu quét để bắt cả `"password"s*:`, hoặc ghi rõ phạm vi chỉ là chuỗi kết nối. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| required-sections, upstream-coverage, linter, type-check, traceability | Bản giao nói đã qua; tôi không chạy lại | Không có phát hiện nào xuất phát từ công cụ. |

### Summary

Bộ NFR của U4 đầy đủ và khớp với code đã có: các hằng `DbConstraintNames.EmployeeEmailUnique` và `EmployeeDepartmentForeignKey` đã tồn tại ở U1, và đường 23503 của U3 đã có test. Chỉ còn ba điểm nhỏ cần cân nhắc, chủ yếu là phương án dự phòng cho tìm kiếm chữ có dấu trên PostgreSQL thật; không có điểm nào chặn.
