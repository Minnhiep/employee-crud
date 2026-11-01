## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-01T16:10:49Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u3-departments/functional-design/rules.md > BR3.1 và functional-spec.md > mục 6 (W5) | Chỉ mục `ux_departments_name` đặt trên biểu thức `lower(name)`. Cấu hình EF Core kiểu `HasIndex(x => x.Name)` không sinh được chỉ mục biểu thức, nên người code phải tự viết `migrationBuilder.Sql(...)`. Thiết kế không nói điều này. Hệ quả: model snapshot không biết chỉ mục, nên nếu ai sinh lại migration thì chỉ mục có thể bị bỏ qua hoặc tạo sai tên. Tên chỉ mục lại là điều kiện để ErrorMapper của U1 đổi lỗi 23505 thành 409 `errors.name`. Cách tạo seed (BR3.2, "id do database cấp") cũng chưa nói rõ phải dùng `InsertData` không kèm cột id, không dùng `HasData` có id cố định. | Ghi vào BR3.1 và BR3.2 rằng chỉ mục được tạo bằng SQL thô trong migration 1 (kèm `DROP INDEX` ở `Down`), và seed chèn không kèm id. Thêm một bước kiểm sau migration: xem chỉ mục trong pgAdmin và chèn tên trùng hoa thường bằng SQL tay phải báo 23505 đúng tên `ux_departments_name`. | New |
| R-02 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u3-departments/functional-design/rules.md > BR2.2, BR2.5 và functional-spec.md > mục 4, 5 | Chưa nói gì về hai chuyện chen nhau. (1) Phòng ban bị xóa giữa lúc service đã tìm thấy và lúc lưu: EF ném `DbUpdateConcurrencyException`, chưa có luật đổi thành 404, nên có thể ra 500. Đây là thao tác Sửa hoặc Xóa hai tab cùng lúc. (2) Ở BR2.5, `detail` cần tên phòng ban, mà sau khi `SaveChanges` lỗi thì thực thể vẫn ở trạng thái Deleted; tên phải lấy trước khi gọi xóa. | Thêm vào BR2.2 rằng `DbUpdateConcurrencyException` khi sửa hoặc xóa được đổi thành 404. Thêm vào BR2.5 rằng tên phòng ban được đọc vvào biến trước khi xóa. | New |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u3-departments/functional-design/functional-spec.md > mục 11 (Kiểm như thế nào) | Danh sách unit test có "trùng" và "23503 khi xóa", nhưng team đã chọn database giả lập trong bộ nhớ. Provider đó không áp chỉ mục không trùng và không tự ném `PostgresException` 23503/23505. Hai đường dự phòng (BR1.4 khi chen nhau, BR2.5) vì vậy không thể thử bằng provider giả lập thông thường. Thiết kế chưa nói cách giả lập. | Ghi rõ ở mục 11 cách thử hai đường này: ví dụ lớp con của `AppDbContext` hoặc interceptor ném `DbUpdateException` chứa `PostgresException` giả, và coi việc chèn trùng thật là kiểm bằng Postman hoặc pgAdmin, không phải unit test. | New |
| R-04 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u3-departments/functional-design/functional-spec.md > mục 10, hàng "Thứ tự A-Z" và "So không phân biệt hoa thường" | Phần kiểm chỉ nhắm vào 4 tên mẫu. Collation `English_United States.1252` không theo bảng chữ cái tiếng Việt: dấu chỉ là khác biệt phụ, nên "Đào tạo" (Đ) có thể xếp sai chỗ so với kỳ vọng của người dùng, và "Ă", "Â" xếp như "A". Ngoài ra `ToLower()` của .NET (so trùng) và `lower()` của PostgreSQL (chỉ mục) có thể khác nhau ở vài ký tự lạ. Kết quả kiểm trên 4 tên mẫu sẽ không phát hiện được. | Thêm vào hàng kiểm hai tên có dấu đặc biệt (một tên bắt đầu bằng "Đ", một tên có "Ă" hoặc "Â") và ghi nhận kết quả là giới hạn đã biết nếu thứ tự khác kỳ vọng. Quyết định ở Code Generation dùng một cách so duy nhất (`lower()` ở database hoặc `ToLower()` ở .NET) và ghi lại. | New |
| R-05 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u3-departments/functional-design/functional-spec.md > mục 4 (W3) và rules.md > BR2.2 | Hợp đồng C1 khai báo `id` là số nguyên tối thiểu 1, nhưng thiết kế chưa nói giá trị `id` không hợp lệ (ví dụ `abc`, `0`, `-1`) trên API và trên đường dẫn `/departments/:id/edit` của React xử lý ra sao. Nếu để mặc định, `abc` có thể ra 404 của routing, còn `0` ra 404 của service, hai lời báo khác nhau. | Ghi một dòng: id không phải số hoặc nhỏ hơn 1 được xử lý như "không tìm thấy" (404 ProblemDetails), và form sửa hiện "Không tìm thấy phòng ban" cho cả hai trường hợp. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| traceability | PASS (theo báo cáo trong brief; tôi không chạy lại) | Các ID luật, thực thể trong `traceability.json` khớp với các artifact. |
| required-sections, upstream-coverage, linter, type-check | Không chạy lại | Tôi không có kết quả riêng; không dùng làm căn cứ cho finding nào ở trên. |

### Summary

Thiết kế nhất quán với hợp đồng C1, C4, C5 và với phần nền U1, U2: luật BR1 đến BR4 đủ để người code làm theo, và các đường lỗi chính (400, 404, 409, 23505, 23503) đều có chỗ xử lý. Điểm đáng cân nhắc nhất trước khi duyệt là cách tạo chỉ mục biểu thức `lower(name)` và seed (Major), cùng vài khe hở nhỏ về cạnh tranh, cách thử đường lỗi database và thứ tự chữ tiếng Việt (Minor).
