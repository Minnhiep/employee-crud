## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-02T19:59:36Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | backend/EmployeeCrud.Api/Departments/DepartmentService.cs:48-68 (UpdateAsync) | Khi người dùng sửa mà tên sau khi bỏ khoảng trắng giống hệt tên đang lưu, EF Core thấy không có gì thay đổi nên không gửi câu UPDATE nào, và `DbUpdateConcurrencyException` (dòng 61-66) không bao giờ xảy ra. Nếu phòng ban vừa bị xóa ở nơi khác giữa lúc đọc (dòng 51) và lúc lưu, API vẫn trả 200 với dữ liệu cũ thay vì 404. Nhánh catch ở dòng 61 chỉ có tác dụng khi tên thật sự đổi, và test hiện tại không chạm tới trường hợp này. Hậu quả nhỏ (hai người dùng cùng lúc, tên không đổi) nhưng comment ở dòng 63 ngầm hứa rằng mọi trường hợp xóa chen ngang đều ra 404. | Chấp nhận và ghi vào comment rằng chỉ trường hợp tên có đổi mới được bảo vệ, hoặc nếu muốn chặt hơn thì bỏ qua kiểm "không đổi" bằng cách kiểm tồn tại lại trước khi trả về. Không bắt buộc sửa ở đợt này. | Unresolved |
| R-02 | Minor | backend/EmployeeCrud.Api/Departments/DepartmentService.cs:85-91 và backend/EmployeeCrud.Api/Platform/Errors/DbConstraintNames.cs:11 | Nhánh dự phòng BR2.5 chỉ chạy khi khóa ngoại của U4 tên đúng `fk_employees_department` (so khớp theo chuỗi). Hiện chưa có khóa ngoại nào trong database nên nhánh này chỉ được test bằng DbContext giả ném lỗi, chưa từng chạy thật. Nếu U4 đặt tên khác đi một ký tự, lỗi rơi xuống ErrorMapper và người dùng thấy lời báo chung chung (409 "không thể thực hiện") thay vì lời báo có tên phòng ban, không có lỗi nào lộ ra lúc biên dịch. | Khi làm U4, đặt tên khóa ngoại bằng đúng hằng `DbConstraintNames.EmployeeDepartmentForeignKey` (hoặc dùng hằng đó trong migration) và kiểm thủ công lại việc xóa phòng ban còn nhân viên. Ghi nhắc này vào danh sách việc của U4. | Unresolved |
| R-03 | Minor | frontend/src/pages/departments/DepartmentFormPage.tsx:48-94 | Khi chế độ sửa, tên được điền trong `useEffect` theo `id`, nhưng các state `name`, `touched`, `fieldErrors`, `summaryMessages` không được đặt lại khi `id` đổi. Nếu route dùng lại cùng một component cho `/departments/1/edit` rồi `/departments/2/edit` (ví dụ nút Back/Forward của trình duyệt), tên và lỗi cũ có thể còn lưu lại trong lúc chờ tải xong. Luồng bình thường đi qua trang danh sách nên ít gặp. | Nếu muốn chắc, thêm `key={id}` vào route ở App.tsx để React tạo lại component theo từng mã; nếu không thì chấp nhận vì luồng thật không gặp. | Unresolved |
| R-04 | Minor | frontend/src/pages/departments/DepartmentsPage.tsx > confirmDelete (nhánh catch, dòng 127-137) cùng frontend/src/components/ConfirmDialog.tsx > useEffect đóng hộp (dòng 49-57) | Khi xóa lỗi (409 hoặc lỗi mạng), `setPendingDelete(null)` chạy trong catch, còn `setIsSubmitting(false)` chạy ở `finally` của `useSubmitGuard` ngay sau đó. Các nút Xóa đang `disabled={isSubmitting}`. Nếu React vẽ hai lần riêng, `ConfirmDialog` gọi `focus()` lên nút đã mở hộp đúng lúc nút còn bị khóa, focus không về được và rơi về đầu trang. Nếu React gộp hai cập nhật vào một lần vẽ thì không sao. Tôi chưa kiểm được điều này bằng trình duyệt; `unit-test-instructions.md` mục 5 chỉ kiểm focus về nút Xóa ở nhánh Hủy/Esc, chưa kiểm ở nhánh 409. | Kiểm thủ công một lần: xóa một phòng ban còn nhân viên (hoặc tắt backend rồi xóa) và xem focus có về nút Xóa không. Nếu không về, bỏ `disabled={isSubmitting}` ở nút Xóa trong bảng (hộp thoại đã chặn bấm hai lần) hoặc đổi sang `aria-disabled`. Thêm bước kiểm này vào mục 5 của hướng dẫn kiểm thử. | New |

> R-01 Reviewer note: Step 10 không đụng backend; `DepartmentService.UpdateAsync` giữ nguyên. Vẫn là rủi ro nhỏ, không chặn.

> R-02 Reviewer note: Chưa có khóa ngoại nào trong database nên nhánh BR2.5 vẫn chưa chạy thật; cần nhắc khi làm U4 nhân viên.

> R-03 Reviewer note: `App.tsx` dòng 46-49 vẫn dùng `key="edit"` cố định cho route `departments/:id/edit` (khác với nhân viên đã dùng `key={`edit-${id}`}`). Luồng thật đi qua danh sách nên ít gặp.

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `npm --prefix frontend run lint` | PASS (eslint, `--max-warnings 0`, không cảnh báo) | Sạch. |
| `npm --prefix frontend run format:check` | PASS ("All matched files use Prettier code style!") | Sạch. |
| `npm --prefix frontend run build` | PASS (`tsc` strict rồi vite: 119 module, JS 290,29 kB / gzip 90,57 kB, CSS 16,60 kB) | Kiểu dữ liệu đúng; `PageHeader` nhận `headingRef` ở mọi nơi dùng (`DepartmentsPage`, `DepartmentFormPage`, `NotFoundPage`), không trang nào còn gọi kiểu cũ. |
| `dotnet test ... Tests.Departments` | PASS (28/28, 0 lỗi, 1 giây) | Backend không bị ảnh hưởng bởi Step 10. |

**Đối chiếu các điểm được dặn kiểm**

- Phân tầng: `PageHeader` (nền trắng, có breadcrumb) tiếp theo `.page-body` (lưới `gap: var(--space-4)`) tiếp theo `.panel` (header, body, footer). Hai trang phòng ban dùng đúng cấu trúc này. Nút: `btn`, `btn--sm`, `btn--primary`, `btn--secondary`, `btn--ghost`, `btn--ghost-danger`, `btn--danger` đều có định nghĩa, cỡ nút lấy từ token. Form đặt "Hủy" trước, "Lưu phòng ban" ngoài cùng bên phải.
- Hành vi giữ nguyên: tải, thử lại, hủy lời gọi khi rời trang, 409 (báo ở đầu thân trang, giữ dòng), 404 (tải lại kèm lời báo). Các `data-testid` được giữ (`department-add`, `department-edit-<id>`, `department-delete-<id>`, `department-delete-confirm`, `department-name`, `department-save`, `department-cancel`, `departments-status`).
- WCAG: h1 nhận focus qua `headingRef` do trang giữ, nên sau khi xóa thành công, focus về tiêu đề đúng thứ tự (hộp đóng trước, rồi mới focus tiêu đề, vì dòng bị xóa nên nút mở hộp không còn nối với trang). Toast có `role="status"` luôn có sẵn trong trang; lỗi có `role="alert"`; đóng toast thì focus chuyển về `#noi-dung`. Nút trong hộp thoại dùng `aria-disabled` thay `disabled` để không mất focus. Breadcrumb có `aria-label` và `aria-current`. Hộp thoại, toast và khối trạng thái đều có co theo màn hẹp (`min(27rem, calc(100vw - 2rem))`, toast `min(26rem, ...)`). Tôi chưa đo ở 320px bằng trình duyệt.
- Gói: Step 10 không thêm gói runtime nào ngoài react, react-dom, react-router (các import đều thuộc ba gói này).
- Phạm vi: không có tính năng mới ngoài `docs/ke-hoach.md`; đếm "N phòng ban" và breadcrumb chỉ là trình bày.
- Trang nhân viên và `SearchBox.tsx` còn dùng markup cũ (tự gắn `<h1 ref={headingRef}>`): đúng như dự kiến, không tính là phát hiện của Unit này.

### Summary

Giao diện phòng ban đã được làm lại nhất quán trên hệ thiết kế chung, bốn lệnh kiểm đều qua, hành vi và các `data-testid` giữ nguyên, và `PageHeader` đổi API được dùng đúng ở mọi chỗ. Chỉ còn ba ghi chú Minor cũ (R-01, R-02, R-03) và một điểm cần kiểm tay là focus về nút Xóa sau khi xóa lỗi; không có gì chặn việc duyệt.
