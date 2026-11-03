## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-04
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/code-generation/source-manifest.json > writes | Danh sách `writes` còn ghi ba đường dẫn không còn tồn tại vì đã dời bằng `git mv`: `backend/EmployeeCrud.Api.Tests/Departments/TestDb.cs`, `backend/EmployeeCrud.Api.Tests/Departments/ThrowingAppDbContext.cs`, `frontend/src/pages/EmployeesPage.tsx`. Vị trí mới đã được khai (`TestSupport/`, `pages/employees/`) nên không thiếu file nào. | Bỏ ba đường dẫn cũ khỏi `writes`, hoặc ghi rõ chúng là file đã dời/xóa. | Resolved (reviewer) |
| R-02 | Minor | backend/EmployeeCrud.Api/Employees/EmployeeService.cs > UpdateAsync (comment "Giới hạn đã biết") và code-summary.md mục 2 | Comment và code-summary nói khi mọi giá trị giữ nguyên mà nhân viên vừa bị xóa thì API trả 200. Theo code thì không đúng: sau `SaveAsync` luôn gọi `GetByIdAsync`, mà hàm này ném `NotFound` khi dòng đã mất, nên kết quả thực tế là 404. Hành vi tốt hơn mô tả, nhưng lời giải thích sai sẽ làm Hiệp trình bày sai khi được hỏi. | Sửa comment và mục 2 cho đúng với code, hoặc chạy thử một ca để xác nhận rồi mới giữ lời mô tả. Khi U3 sửa cùng chỗ thì rà luôn comment tương ứng ở DepartmentService. | Accepted risk |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/code-generation/code-summary.md > mục 3, dòng 4 (Smart App Control) | Cách vượt Smart App Control là sửa một comment để ra file `.dll` khác. Cách này không bền: lần build sau có thể lại bị chặn, và người đọc có thể hiểu nhầm đó là một sửa đổi có chủ đích. Không phải lỗi của mã nguồn, và đã ghi rõ trong tóm tắt. | Giữ ghi chú này trong nháp README (U5) như một vấn đề môi trường đã biết, kèm hướng đi khi bị chặn lại do Hiệp tự quyết định. Không cần sửa mã. | Accepted risk |
| R-04 | Minor | backend/EmployeeCrud.Api/Platform/Errors/ErrorMapper.cs > MapPostgres | Đường dự phòng chung của U1 chỉ nhận mã 23503; mã 23001 (restrict_violation) mà PostgreSQL thật báo khi xóa phòng ban còn nhân viên không được nhận. Hiện chỉ `DepartmentService` bắt 23001, nên chưa có lỗi, nhưng nếu sau này thêm đường xóa phòng ban khác thì sẽ ra 500. | Ghi vào danh sách việc để ý cho Build and Test, hoặc thêm mã 23001 vào đường dự phòng của U1 nếu Hiệp muốn (ngoài phạm vi U4). | Resolved (reviewer) |
| R-05 | Minor | frontend/src/pages/employees/EmployeesPage.tsx > confirmDelete, nhánh catch khi lỗi 404 | Khi xóa gặp 404, trang đóng hộp thoại rồi tải lại danh sách. Ngay lúc đó bảng chuyển sang "đang tải" nên nút Xóa đã mở hộp bị gỡ khỏi trang, và ConfirmDialog không còn chỗ để trả focus. Nhánh này cũng không gọi setHeadingFocusRequest như nhánh xóa thành công. Kết quả: focus rơi về đầu tài liệu, người dùng bàn phím mất vị trí (WCAG 2.4.3). Khung lỗi có role="alert" nên vẫn được đọc, vì vậy chỉ là lỗi nhỏ. Nhánh lỗi mạng thì ổn: nút còn trên trang nên focus trở về đúng nút. | Trong nhánh 404, tăng headingFocusRequest (hoặc đưa focus vào khung lỗi) giống nhánh xóa thành công. Có thể bỏ qua nếu người dùng chấp nhận vì trường hợp này hiếm. | Resolved (reviewer) |
| R-06 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/code-generation/code-generation-plan.md > Step 10 | Việc sửa file của U3 (DepartmentFormPage.tsx: ô tên phòng ban rộng một cột) chỉ có trong code-summary §5b mục 6 và source-manifest, không có trong checklist Step 10 của kế hoạch. Dòng "File:" đầu §5b cũng không liệt kê file này. Người đọc kế hoạch sẽ không biết U4 chạm vào file của U3 sau khi U3 đã duyệt. Phần mô tả form phòng ban trong tài liệu của U3 có thể đã lệch theo, mà phạm vi rà soát này không cho mở để kiểm. | Thêm một dòng vào Step 10 và vào dòng "File:" của §5b: U4 sửa DepartmentFormPage.tsx theo ủy quyền của Hiệp. Ghi chú để U3 cập nhật mô tả form nếu cần. | Accepted risk |
| R-07 | Minor | frontend/src/pages/employees/EmployeesPage.tsx > handleSearch (nhánh `term === search`) cùng frontend/src/components/SearchBox.tsx > state `value` | Khi địa chỉ đang là `?search=a b` mà người dùng gõ lại `a  b` (hai dấu cách) rồi bấm Tìm, `term` (đã chuẩn hóa) bằng `search` nên trang chỉ tải lại, `initialValue` không đổi nên SearchBox không đồng bộ lại: ô tìm vẫn hiện `a  b` trong khi địa chỉ và kết quả theo `a b`. BR4.2 ghi "ô tìm hiện đúng chuỗi đã ghi", chỗ này lệch (chỉ về hiển thị, kết quả vẫn đúng). | Chấp nhận như hiện tại và ghi chú vào code-summary, hoặc cho SearchBox đặt lại ô về chuỗi đã chuẩn hóa sau khi tìm (ví dụ `handleSearch` trả lại chuỗi để SearchBox gán). Không chặn duyệt. | New |
| R-08 | Minor | backend/EmployeeCrud.Api.Tests/Employees/EmployeeServiceTests.cs > #33–#40 | Các test mới đúng điều chúng nói (đã kiểm #37: ngữ cảnh đã đóng nên service mà truy vấn thì ném lỗi, nên không thể luôn qua). Nhưng chưa có test cho: (a) sửa nhân viên với email chứa ký tự lạ (chỉ có #40 cho họ tên), (b) chuỗi tìm toàn khoảng trắng phải trả đủ danh sách (không lọc). Hai nhánh này có trong code nhưng chỉ được phủ gián tiếp. | Có thể thêm hai ca nhỏ nếu muốn chắc hơn; độ phủ dòng của service vẫn đạt, nên không bắt buộc. | New |
| R-09 | Minor | frontend/src/pages/employees/EmployeesPage.tsx dòng 418-436 (action "Thêm nhân viên" của hai trạng thái rỗng) | Hai liên kết này chưa gửi `state`. Riêng cái ở dòng 433-437 xuất hiện khi đang lọc theo phòng, nên Lưu/Hủy từ đó vẫn về `/employees` chưa lọc, đúng lỗi R-01 mà nút đầu trang đã sửa. Hẹp và không mất dữ liệu. | Nếu `StatusMessage.action` hỗ trợ `state` thì truyền `editState`; nếu không thì ghi vào §5e là giới hạn chấp nhận. | New |
| R-10 | Minor | frontend/src/pages/employees/EmployeesPage.tsx > empty state "Chưa có nhân viên nào" (action.state) | Ở nhánh không tìm và không lọc, `editState` luôn là `undefined`, nên dòng `state: editState` thừa. Không gây lỗi, chỉ giữ cho hai nhánh trống viết giống nhau. | Không bắt buộc. Có thể bỏ dòng này hoặc để nguyên cho đồng bộ. | New |
| R-11 | Minor | frontend/src/styles/components.css > `.table .table__link` và `.table .table__link:hover` | Lúc thường liên kết cùng màu chữ `--color-text` với các ô khác, không gạch chân. Chỉ khác ở độ đậm (600 so với 500 của `.table__strong`), nên rất khó nhận ra đây là liên kết. Dấu hiệu duy nhất là hover, mà màn hình cảm ứng không có. Tiêu chí 1.4.1 nhắm vào liên kết nằm trong đoạn chữ. Liên kết đứng riêng trong một ô bảng thường được chấp nhận, nên đây không phải lỗi bắt buộc. | Chấp nhận là kiểu bảng quản trị Hiệp đã chọn. Nếu muốn an toàn hơn trên cảm ứng, thêm `@media (hover: none)` để liên kết có gạch chân hoặc màu xanh sẵn. Cách khác là ghi vào code-summary rằng cảm ứng không phải đối tượng chính. | New |
| R-12 | Minor | frontend/src/styles/components.css > `.table .table__link:hover` (màu `--color-primary` #0f62c5 trên nền hàng rê chuột `--color-surface-muted` #f7f8fa) | Màu hover đạt AA. Token ghi 5.9:1 với trắng; với nền #f7f8fa vẫn trên 5:1 (ước tính, chưa đo lại). Gạch chân xuất hiện cùng lúc nên hover không chỉ dựa vào màu. | Không cần sửa. Nếu muốn có số liệu chắc chắn, đo lại một lần bằng công cụ tương phản. | New |
| R-13 | Minor | frontend/src/styles/base.css > `:focus-visible` (dòng 55–57) và `.table .table__link` | Quy tắc mới không đặt lại `outline`, nên viền focus 3px màu `--color-focus` với offset 2px vẫn áp dụng cho liên kết. Tiêu chí 2.4.7 đạt. Bàn phím chỉ thấy viền, không thấy gạch chân như hover. Điều này chấp nhận được. | Không cần sửa. Có thể thêm `:focus-visible` cùng kiểu gạch chân với hover để bàn phím và chuột nhất quán (tùy chọn). | New |
| R-14 | Minor | frontend/src/styles/components.css > `.table .table__link` (độ ưu tiên (0,2,0)) | Chỉ ảnh hưởng `<Link>` có class `table__link` trong `.table`, hiện chỉ ở `DepartmentsPage`. Nó thắng được `a { color: primary }` của base.css và `.table__strong` (0,1,0), nên không làm đổi liên kết nào khác (NavMenu, PageHeader, form). Dùng đúng token `--color-text`, `--color-primary`, `--font-weight-semibold`. Chỉ `text-underline-offset: 0.2em` là giá trị cứng chưa thành token. | Khi trang Nhân viên cũng cần liên kết trong bảng, dùng lại đúng class này để giữ nhất quán. | New |

> R-01 Earlier decision: Accepted risk

> R-04 Earlier decision: Accepted risk

> R-05 Earlier decision: Accepted risk

> R-07 Not re-checked this round

> R-08 Not re-checked this round

> R-09 Not re-checked this round

> R-10 Not re-checked this round

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| Đọc CSS và tokens | Không có xung đột độ ưu tiên; token hợp lệ | Không có tác dụng phụ lên liên kết khác |
| Đo tương phản bằng công cụ | Chưa chạy | Số liệu tương phản là ước tính từ token, chưa đo |

### Summary

Thay đổi nhỏ, tách biệt, đúng token, có focus ring và hover đạt tương phản. Điểm yếu duy nhất là dấu hiệu "đây là liên kết" lúc thường quá nhẹ, nhất là trên màn hình cảm ứng. Với đồ án chạy trên máy cục bộ, điều này chấp nhận được. Tôi chưa mở ảnh chụp màn hình, plan Step 14 và code-summary §5g.
