## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-03
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/functional-design/functional-spec.md > mục 4 (W3), bước 3 và mục 3 bước 5 | Với `PUT /api/employees/{id}` mà id không tồn tại và body cũng sai (ví dụ email rỗng), spec không nói trả 404 hay 400 trước. Mục 3 bước 5 chỉ liệt kê thứ tự kiểm cho luồng thêm; mục 4 chỉ nói "không có id → 404" mà không đặt vào thứ tự. Hai người code hoặc viết test có thể ra hai kết quả khác nhau. | Ghi rõ một thứ tự cho PUT (đề xuất: tìm nhân viên trước, 404 nếu không có; rồi mới BR1.1–BR1.9). Thêm một ca unit test cho trường hợp này. | Accepted risk |
| R-02 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/functional-design/functional-spec.md > mục 10, dòng "Tìm có chữ có dấu"; rules.md > BR2.2 | Spec chỉ kiểm "có dấu / không dấu" mà chưa kiểm chữ hoa có dấu (ví dụ "ĐỖ" so với "đỗ"). Database chạy collation `English_United States.1252`: nếu `lower()` của PostgreSQL không hạ được chữ hoa tiếng Việt, tìm "đỗ" sẽ không ra "Đỗ Văn An". Cùng lúc, EF InMemory (ToLower của .NET) sẽ cho kết quả khác, nên unit test có thể xanh dù Postgres sai. | Thêm vào mục 10 một ca kiểm tay trên Postgres thật: nhân viên "Đỗ Văn An", tìm `đỗ`, `ĐỖ`, `đỗ văn`. Ghi chú ở BR2.2 là kết quả trên Postgres thật là chuẩn, vì InMemory không đại diện cho việc này. | Accepted risk |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/functional-design/rules.md > BR2.2 và functional-spec.md > mục 11 (Unit test `EmployeeService`) | Spec đòi `%` và `_` là chữ thường nhưng không nói cách làm. Hàm `ILike` của Npgsql (team.md đã nêu chưa kiểm được trên InMemory) cần thoát ký tự `%`, `_`, `` thủ công; còn `lower(x).Contains(lower(s))` thì EF tự thoát và chạy được cả trên InMemory lẫn Postgres. Nếu Code Generation chọn `ILike`, ca `?search=%` chỉ kiểm được bằng Postman, không kiểm được bằng unit test. | Ghi hướng ưu tiên cho Code Generation: dùng `ToLower().Contains()` (hoặc tương đương EF tự thoát). Nếu buộc dùng `ILike`, phải thoát ký tự đại diện và ghi rõ ca `%` / `_` chỉ kiểm qua Postman. | Accepted risk |
| R-04 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/functional-design/rules.md > BR1.8 và functional-spec.md > mục 4 bước 1 | Hai đường nhập sai kiểu chưa được nói tới. Một là body có `departmentId` là chuỗi hoặc `fullName` không phải chuỗi: lỗi nối kết (model binding) của ASP.NET trả 400 với khóa kiểu `$.departmentId`, không khớp khóa `departmentId` mà form dùng để hiện lỗi cạnh ô. Hai là `:id` là số dương rất lớn (vượt `int`): spec chỉ nói "không phải số dương" thì không gọi API. | Ghi trong spec rằng khóa lỗi lạ (do binding) rơi vào khung tóm tắt, không mất lỗi. Với `:id`, nói rõ "không phải số nguyên dương trong phạm vi `int`" hoặc để API trả 404. | Accepted risk |
| R-05 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/functional-design/rules.md > BR1.6, BR4.3 | Luật định dạng email phải được cài hai lần (C# ở service, TypeScript ở form) nên có thể lệch nhau dần. Spec mới nêu "cùng bộ ví dụ" ở mục 10 và mục 11, chưa nói bộ ví dụ nằm ở đâu để cả hai phía dùng. | Chốt trong spec: danh sách ví dụ hợp lệ / không hợp lệ ở BR1.6 là chuẩn; unit test service dùng đúng danh sách đó, và nhắc để người kiểm tay trên form dùng lại. Ghi chú trong code ở cả hai nơi trỏ tới BR1.6. | Accepted risk |
| R-06 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/functional-design/rules.md > BR5.3 và BR6.3 | BR5.3 cho API nhận số nguyên dương "trong phạm vi int" (tối đa 10 chữ số, 2147483647), còn trang Nhân viên (BR6.3) chỉ nhận 1 đến 9 chữ số. Mã từ 1000000000 trở lên hợp lệ ở API nhưng trang coi là sai dạng và hiện câu "phòng ban không còn tồn tại". Hai nơi nói hai luật khác nhau. | Ghi rõ trong BR6.3 là trang giới hạn 9 chữ số (và vì sao chấp nhận lệch), hoặc nới luật trang cho khớp phạm vi int. | New |
| R-07 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/functional-design/functional-spec.md > W-CR2 và W-CR3 (Thêm nhân viên từ danh sách đang lọc) | Spec nói sửa nhân viên từ danh sách đang tìm hoặc lọc thì Lưu/Hủy quay về đúng chỗ (N-07), nhưng không nói gì về nút "Thêm nhân viên" ở trang đang lọc: form được chọn sẵn phòng qua `?departmentId=` nhưng Lưu/Hủy sẽ về danh sách chưa lọc. Hành vi hiện tại không khớp với tinh thần AC6.2.3 và N-07. | Quyết trong spec: "Thêm" từ danh sách đang lọc có quay về bộ lọc không; ghi vào BR6.3 và AC tương ứng. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| Đọc chéo BR5.1 đến BR6.4 với DepartmentService.cs, EmployeeService.cs | Khớp | Đếm bằng truy vấn con trong cùng câu SQL, 409 có N cả nhánh chen nhau (tối thiểu 1), lọc kiểm trước chuỗi tìm, phòng không có thì trả rỗng. |

### Summary

Luật nghiệp vụ FR8 đầy đủ, rõ trigger và kết quả, khớp mã nguồn và hợp đồng C1/C2; chỉ có hai chỗ lệch nhỏ giữa luật API và luật trang, không chặn việc xây dựng.
