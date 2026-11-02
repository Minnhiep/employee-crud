## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-02T18:03:57Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u3-departments/functional-design/rules.md > BR2.5; construction/u4-employees/functional-design/rules.md > BR2.7; construction/u1-backend-platform/functional-design/rules.md > BR1.5 | Ba đặc tả đều viết rằng xóa phòng ban còn nhân viên thì PostgreSQL báo lỗi 23503. Thực tế khóa ngoại khai ON DELETE RESTRICT nên PostgreSQL báo 23001 (restrict_violation). Code đã xử lý đúng (`DepartmentService.IsEmployeeForeignKeyViolation` bắt cả hai mã, và `docs/so-do-database.md` ghi 23001 đã kiểm trên PostgreSQL 18), nhưng đặc tả của ba unit vẫn ghi 23503, nên ai đọc đặc tả rồi tự chèn thử bằng SQL (AC5.3.3) sẽ thấy mã khác. | Sửa chữ trong BR2.5 (U3), BR2.7 (U4), BR1.5 (U1) và mục C3 của hợp đồng: xóa phòng ban còn nhân viên báo 23001 hoặc 23503, còn 23503 chỉ đúng khi ghi nhân viên trỏ tới phòng ban không có. Không cần sửa code. | New |
| R-02 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u1-backend-platform/functional-design/rules.md > BR1.5 | BR1.5 viết rằng bộ đổi lỗi của U1 phân biệt "ghi nhân viên" (400 `departmentId`) với "xóa phòng ban" (409) theo ngữ cảnh do U3/U4 báo. Code thật (`ErrorMapper.cs` dòng 78-84) không phân biệt: mọi lỗi 23503 lọt tới nó đều thành 409 chung. Hành vi đúng vẫn đạt vì U3 và U4 tự bắt lỗi trước (U4 BR2.6, U3 BR2.5), nên đặc tả U1 mô tả một cơ chế không tồn tại. | Sửa BR1.5 cho khớp: U1 chỉ giữ đường dự phòng 409 chung; hai trường hợp cụ thể do service của U3 và U4 xử lý. | New |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u3-departments/functional-design/traceability.json > coverage AC1.5.2; construction/u4-employees/functional-design/traceability.json > reverse BR3.4 | AC1.5.2 (bảng nhân viên trống sau migration) bị đẩy qua lại: U3 ghi N/A "delivered by u4-employees", còn U4 ghi N/A "AC1.5.2 thuộc story của U3" và không đưa AC1.5.2 vào `upstream_ids`. Bảng phân công story chỉ ghi US1.5 cho U3. Về nội dung thì đã được lo (U3 BR3.2 không chèn nhân viên mẫu, U4 BR3.4 không chèn nhân viên mẫu), nhưng không unit nào ghi nhận là chủ của tiêu chí này. | Chọn một chủ cho AC1.5.2 (hợp lý nhất là U4, vì bảng employees do U4 tạo), sửa dòng phân công US1.5 trong bảng story-unit và traceability của hai unit cho khớp. | New |
| R-04 | Suggestion | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u3-departments/functional-design/traceability.json > coverage AC5.2.4 | AC5.2.4 (trang OpenAPI liệt kê đủ 10 thao tác) được trỏ tới BR2.3 (mã trạng thái thành công). Luật thật sự lo việc bật OpenAPI là BR2.4 của U1, và việc đếm đủ 10 thao tác là BR3.5 của U5. Chỉ là sai đích trong bảng truy vết, không ảnh hưởng thiết kế. | Đổi đích truy vết thành U1 BR2.4 và U5 BR3.5, hoặc đánh dấu N/A kèm đơn vị phụ trách. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| Đọc tay `traceability.json` của U1-U5 (không có công cụ riêng) | Mọi AC trong bản đồ story-unit đều có ít nhất một unit nhận; chỉ AC1.5.2 bị đẩy qua lại giữa U3 và U4 | Không có tiêu chí mồ côi về nội dung; chỉ có vấn đề ghi nhận chủ sở hữu (finding Minor thứ ba) |
| Đối chiếu chéo mã lỗi 400/404/409, ProblemDetails, so sánh không phân biệt hoa thường, luật xóa phòng ban | Nhất quán giữa C1, C2, C3, U1, U3, U4 và code. Điểm lệch duy nhất là mã PostgreSQL 23001 so với 23503 | Phần chia luật xóa phòng ban giữa U3 (đường dự phòng) và U4 (kiểm trước) chặt chẽ, dùng chung một hàm tạo lỗi nên hai đường ra cùng một câu |

### Summary

Thiết kế chức năng của năm unit khớp nhau về ngữ nghĩa lỗi (400/404/409, ProblemDetails, so sánh tên và email không phân biệt hoa thường) và về cách chia luật xóa phòng ban còn nhân viên giữa U3 và U4; không có mâu thuẫn chéo unit làm hỏng hành vi. Còn ba chỗ nhỏ cần chỉnh chữ trong đặc tả cho khớp với code đã chạy thật (mã 23001, mô tả bộ đổi lỗi của U1, chủ của AC1.5.2), nên kết luận READY.
