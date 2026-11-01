## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-01T18:56:56Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | backend/EmployeeCrud.Api/Departments/DepartmentService.cs:48-68 (UpdateAsync) | Khi người dùng sửa mà tên sau khi bỏ khoảng trắng giống hệt tên đang lưu, EF Core thấy không có gì thay đổi nên không gửi câu UPDATE nào, và `DbUpdateConcurrencyException` (dòng 61-66) không bao giờ xảy ra. Nếu phòng ban vừa bị xóa ở nơi khác giữa lúc đọc (dòng 51) và lúc lưu, API vẫn trả 200 với dữ liệu cũ thay vì 404. Nhánh catch ở dòng 61 chỉ có tác dụng khi tên thật sự đổi, và test hiện tại không chạm tới trường hợp này. Hậu quả nhỏ (hai người dùng cùng lúc, tên không đổi) nhưng comment ở dòng 63 ngầm hứa rằng mọi trường hợp xóa chen ngang đều ra 404. | Chấp nhận và ghi vào comment rằng chỉ trường hợp tên có đổi mới được bảo vệ, hoặc nếu muốn chặt hơn thì bỏ qua kiểm "không đổi" bằng cách kiểm tồn tại lại trước khi trả về. Không bắt buộc sửa ở đợt này. | New |
| R-02 | Minor | backend/EmployeeCrud.Api/Departments/DepartmentService.cs:85-91 và backend/EmployeeCrud.Api/Platform/Errors/DbConstraintNames.cs:11 | Nhánh dự phòng BR2.5 chỉ chạy khi khóa ngoại của U4 tên đúng `fk_employees_department` (so khớp theo chuỗi). Hiện chưa có khóa ngoại nào trong database nên nhánh này chỉ được test bằng DbContext giả ném lỗi, chưa từng chạy thật. Nếu U4 đặt tên khác đi một ký tự, lỗi rơi xuống ErrorMapper và người dùng thấy lời báo chung chung (409 "không thể thực hiện") thay vì lời báo có tên phòng ban, không có lỗi nào lộ ra lúc biên dịch. | Khi làm U4, đặt tên khóa ngoại bằng đúng hằng `DbConstraintNames.EmployeeDepartmentForeignKey` (hoặc dùng hằng đó trong migration) và kiểm thủ công lại việc xóa phòng ban còn nhân viên. Ghi nhắc này vào danh sách việc của U4. | New |
| R-03 | Minor | frontend/src/pages/departments/DepartmentFormPage.tsx:48-94 | Khi chế độ sửa, tên được điền trong `useEffect` theo `id`, nhưng các state `name`, `touched`, `fieldErrors`, `summaryMessages` không được đặt lại khi `id` đổi. Nếu route dùng lại cùng một component cho `/departments/1/edit` rồi `/departments/2/edit` (ví dụ nút Back/Forward của trình duyệt), tên và lỗi cũ có thể còn lưu lại trong lúc chờ tải xong. Luồng bình thường đi qua trang danh sách nên ít gặp. | Nếu muốn chắc, thêm `key={id}` vào route ở App.tsx để React tạo lại component theo từng mã; nếu không thì chấp nhận vì luồng thật không gặp. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| required-sections | Đã vượt qua theo brief | Các mục bắt buộc của artifact có đủ |
| traceability | PASS theo brief | Truy vết từ yêu cầu tới mã đã khớp |
| Kiểm chứng đã chạy ở phiên chính (không chạy lại) | 44/44 test xanh, DepartmentService 100% line coverage, typecheck/lint/format/build sạch, curl, Playwright, pgAdmin (chỉ mục `lower(name)` duy nhất, trùng tên báo 23505) | Mức sàn 80% độ phủ của lớp service đạt rõ ràng; tôi chỉ đọc mã để đối chiếu, không tự chạy lại test |

### Summary

Mã của U3 đúng với thiết kế: luật nằm ở service, chỉ mục `lower(name)` do database giữ nên tên trùng bị chặn cả khi hai request chen nhau, và lỗi được ErrorMapper của U1 đổi đúng sang 400/404/409. Không có lỗi Critical hay Major; ba điểm trên đều là Minor để Hiệp biết và cân nhắc, chủ yếu là khoảng trống nhỏ ở trường hợp hai người dùng cùng lúc và việc U4 phải đặt đúng tên khóa ngoại.
