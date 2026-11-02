## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-01T19:26:38Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/functional-design/functional-spec.md > mục 4 (W3), bước 3 và mục 3 bước 5 | Với `PUT /api/employees/{id}` mà id không tồn tại và body cũng sai (ví dụ email rỗng), spec không nói trả 404 hay 400 trước. Mục 3 bước 5 chỉ liệt kê thứ tự kiểm cho luồng thêm; mục 4 chỉ nói "không có id → 404" mà không đặt vào thứ tự. Hai người code hoặc viết test có thể ra hai kết quả khác nhau. | Ghi rõ một thứ tự cho PUT (đề xuất: tìm nhân viên trước, 404 nếu không có; rồi mới BR1.1–BR1.9). Thêm một ca unit test cho trường hợp này. | New |
| R-02 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/functional-design/functional-spec.md > mục 10, dòng "Tìm có chữ có dấu"; rules.md > BR2.2 | Spec chỉ kiểm "có dấu / không dấu" mà chưa kiểm chữ hoa có dấu (ví dụ "ĐỖ" so với "đỗ"). Database chạy collation `English_United States.1252`: nếu `lower()` của PostgreSQL không hạ được chữ hoa tiếng Việt, tìm "đỗ" sẽ không ra "Đỗ Văn An". Cùng lúc, EF InMemory (ToLower của .NET) sẽ cho kết quả khác, nên unit test có thể xanh dù Postgres sai. | Thêm vào mục 10 một ca kiểm tay trên Postgres thật: nhân viên "Đỗ Văn An", tìm `đỗ`, `ĐỖ`, `đỗ văn`. Ghi chú ở BR2.2 là kết quả trên Postgres thật là chuẩn, vì InMemory không đại diện cho việc này. | New |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/functional-design/rules.md > BR2.2 và functional-spec.md > mục 11 (Unit test `EmployeeService`) | Spec đòi `%` và `_` là chữ thường nhưng không nói cách làm. Hàm `ILike` của Npgsql (team.md đã nêu chưa kiểm được trên InMemory) cần thoát ký tự `%`, `_`, `` thủ công; còn `lower(x).Contains(lower(s))` thì EF tự thoát và chạy được cả trên InMemory lẫn Postgres. Nếu Code Generation chọn `ILike`, ca `?search=%` chỉ kiểm được bằng Postman, không kiểm được bằng unit test. | Ghi hướng ưu tiên cho Code Generation: dùng `ToLower().Contains()` (hoặc tương đương EF tự thoát). Nếu buộc dùng `ILike`, phải thoát ký tự đại diện và ghi rõ ca `%` / `_` chỉ kiểm qua Postman. | New |
| R-04 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/functional-design/rules.md > BR1.8 và functional-spec.md > mục 4 bước 1 | Hai đường nhập sai kiểu chưa được nói tới. Một là body có `departmentId` là chuỗi hoặc `fullName` không phải chuỗi: lỗi nối kết (model binding) của ASP.NET trả 400 với khóa kiểu `$.departmentId`, không khớp khóa `departmentId` mà form dùng để hiện lỗi cạnh ô. Hai là `:id` là số dương rất lớn (vượt `int`): spec chỉ nói "không phải số dương" thì không gọi API. | Ghi trong spec rằng khóa lỗi lạ (do binding) rơi vào khung tóm tắt, không mất lỗi. Với `:id`, nói rõ "không phải số nguyên dương trong phạm vi `int`" hoặc để API trả 404. | New |
| R-05 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/functional-design/rules.md > BR1.6, BR4.3 | Luật định dạng email phải được cài hai lần (C# ở service, TypeScript ở form) nên có thể lệch nhau dần. Spec mới nêu "cùng bộ ví dụ" ở mục 10 và mục 11, chưa nói bộ ví dụ nằm ở đâu để cả hai phía dùng. | Chốt trong spec: danh sách ví dụ hợp lệ / không hợp lệ ở BR1.6 là chuẩn; unit test service dùng đúng danh sách đó, và nhắc để người kiểm tay trên form dùng lại. Ghi chú trong code ở cả hai nơi trỏ tới BR1.6. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| traceability | PASS (theo brief) | Không tự chạy lại; các ID luật và truy vết khớp với `rules.md` đã đọc. |
| required-sections, upstream-coverage, linter, type-check | Không chạy lại trong lượt này | Lượt này chỉ đối chiếu nội dung với mã nguồn U1 và U3. Đã xác nhận trong mã: `IDepartmentService.ExistsAsync` có thật, `DbConstraintNames.EmployeeEmailUnique` và `EmployeeDepartmentForeignKey` có thật, `ErrorMapper` đổi 23505 trên `ux_employees_email` thành 409 `errors.email`, và 23503 tên `fk_employees_department` đã có đường dự phòng ở `DepartmentService`. |

### Summary

Thiết kế khớp với phần U1 và U3 đã có (hằng tên ràng buộc, `ExistsAsync`, đường 23503 dự phòng khi xóa phòng ban), các luồng W1–W5 và luật BR1–BR4 đủ để một lập trình viên bắt tay vào code mà không phải hỏi lại kiến trúc sư. Chỉ còn năm điểm nhỏ cần làm rõ (thứ tự kiểm khi PUT, chữ hoa có dấu trên Postgres thật, cách thoát `%`/`_`, lỗi binding và `:id` quá lớn, nơi đặt bộ ví dụ email chung), không điểm nào chặn việc duyệt.
