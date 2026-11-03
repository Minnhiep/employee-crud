## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-03T02:19:41Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/code-generation/source-manifest.json > writes | Danh sách `writes` còn ghi ba đường dẫn không còn tồn tại vì đã dời bằng `git mv`: `backend/EmployeeCrud.Api.Tests/Departments/TestDb.cs`, `backend/EmployeeCrud.Api.Tests/Departments/ThrowingAppDbContext.cs`, `frontend/src/pages/EmployeesPage.tsx`. Vị trí mới đã được khai (`TestSupport/`, `pages/employees/`) nên không thiếu file nào. | Bỏ ba đường dẫn cũ khỏi `writes`, hoặc ghi rõ chúng là file đã dời/xóa. | Accepted risk |
| R-02 | Minor | backend/EmployeeCrud.Api/Employees/EmployeeService.cs > UpdateAsync (comment "Giới hạn đã biết") và code-summary.md mục 2 | Comment và code-summary nói khi mọi giá trị giữ nguyên mà nhân viên vừa bị xóa thì API trả 200. Theo code thì không đúng: sau `SaveAsync` luôn gọi `GetByIdAsync`, mà hàm này ném `NotFound` khi dòng đã mất, nên kết quả thực tế là 404. Hành vi tốt hơn mô tả, nhưng lời giải thích sai sẽ làm Hiệp trình bày sai khi được hỏi. | Sửa comment và mục 2 cho đúng với code, hoặc chạy thử một ca để xác nhận rồi mới giữ lời mô tả. Khi U3 sửa cùng chỗ thì rà luôn comment tương ứng ở DepartmentService. | Accepted risk |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/code-generation/code-summary.md > mục 3, dòng 4 (Smart App Control) | Cách vượt Smart App Control là sửa một comment để ra file `.dll` khác. Cách này không bền: lần build sau có thể lại bị chặn, và người đọc có thể hiểu nhầm đó là một sửa đổi có chủ đích. Không phải lỗi của mã nguồn, và đã ghi rõ trong tóm tắt. | Giữ ghi chú này trong nháp README (U5) như một vấn đề môi trường đã biết, kèm hướng đi khi bị chặn lại do Hiệp tự quyết định. Không cần sửa mã. | Accepted risk |
| R-04 | Minor | backend/EmployeeCrud.Api/Platform/Errors/ErrorMapper.cs > MapPostgres | Đường dự phòng chung của U1 chỉ nhận mã 23503; mã 23001 (restrict_violation) mà PostgreSQL thật báo khi xóa phòng ban còn nhân viên không được nhận. Hiện chỉ `DepartmentService` bắt 23001, nên chưa có lỗi, nhưng nếu sau này thêm đường xóa phòng ban khác thì sẽ ra 500. | Ghi vào danh sách việc để ý cho Build and Test, hoặc thêm mã 23001 vào đường dự phòng của U1 nếu Hiệp muốn (ngoài phạm vi U4). | Accepted risk |
| R-05 | Minor | frontend/src/pages/employees/EmployeesPage.tsx > confirmDelete, nhánh catch khi lỗi 404 | Khi xóa gặp 404, trang đóng hộp thoại rồi tải lại danh sách. Ngay lúc đó bảng chuyển sang "đang tải" nên nút Xóa đã mở hộp bị gỡ khỏi trang, và ConfirmDialog không còn chỗ để trả focus. Nhánh này cũng không gọi setHeadingFocusRequest như nhánh xóa thành công. Kết quả: focus rơi về đầu tài liệu, người dùng bàn phím mất vị trí (WCAG 2.4.3). Khung lỗi có role="alert" nên vẫn được đọc, vì vậy chỉ là lỗi nhỏ. Nhánh lỗi mạng thì ổn: nút còn trên trang nên focus trở về đúng nút. | Trong nhánh 404, tăng headingFocusRequest (hoặc đưa focus vào khung lỗi) giống nhánh xóa thành công. Có thể bỏ qua nếu người dùng chấp nhận vì trường hợp này hiếm. | New |
| R-06 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/code-generation/code-generation-plan.md > Step 10 | Việc sửa file của U3 (DepartmentFormPage.tsx: ô tên phòng ban rộng một cột) chỉ có trong code-summary §5b mục 6 và source-manifest, không có trong checklist Step 10 của kế hoạch. Dòng "File:" đầu §5b cũng không liệt kê file này. Người đọc kế hoạch sẽ không biết U4 chạm vào file của U3 sau khi U3 đã duyệt. Phần mô tả form phòng ban trong tài liệu của U3 có thể đã lệch theo, mà phạm vi rà soát này không cho mở để kiểm. | Thêm một dòng vào Step 10 và vào dòng "File:" của §5b: U4 sửa DepartmentFormPage.tsx theo ủy quyền của Hiệp. Ghi chú để U3 cập nhật mô tả form nếu cần. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| npm --prefix frontend run typecheck | PASS (tôi chạy) | Không lỗi kiểu, strict còn nguyên |
| npm --prefix frontend run lint | PASS, max-warnings 0 (tôi chạy) | Sạch |
| npm --prefix frontend run format:check | PASS (tôi chạy) | Đúng Prettier |
| npm --prefix frontend run verify | exit 0, 96/96 test (theo báo cáo của phiên chính, tôi không chạy lại) | Chưa có test tự động cho React theo luật dự án, nên các mục dưới đây tôi kiểm bằng đọc mã |

**Đã kiểm bằng đọc mã, không thấy lỗi:**

- **Hành vi giữ nguyên:** tải có AbortController và khóa theo requestKey nên kết quả cũ không đè kết quả mới. Chuỗi tìm lấy từ địa chỉ nên Back, Forward và F5 tự đúng. Bấm Tìm lại đúng chuỗi cũ thì tải lại. Xóa dùng useSubmitGuard nên bấm đúp chỉ gửi một lần, và ConfirmDialog dùng aria-disabled nên nút giữ focus trong lúc chờ. Mọi data-testid cũ vẫn còn.
- **SearchBox đồng bộ state ngay lúc vẽ:** không có vòng lặp vì điều kiện initialValue khác syncedValue chỉ đúng một lần rồi syncedValue được gán bằng nó. Chữ đang gõ dở không bị ghi đè khi trang tải lại hay khi xóa xong (navigate giữ nguyên ?search nên prop không đổi). Chữ chỉ đổi khi địa chỉ đổi (Back, Forward, Xóa tìm kiếm), đúng ý. Bỏ key và bỏ disabled giữ focus trong ô, đây là sai khác so với frontend-components §3 đã được người dùng duyệt và ghi lại.
- **Focus:** xóa thành công thì hộp đóng, nút của dòng đã bị gỡ, effect của trang đưa focus về tiêu đề. Lỗi mạng thì focus về nút Xóa (isSubmitting và pendingDelete cùng được gom vào một lần vẽ nên nút đã mở khóa). Esc do ConfirmDialog xử lý. Xóa tìm kiếm đưa focus về ô nhập.
- **Truy cập:** vùng aria-live đếm luôn có trong DOM (kể cả khi chữ rỗng); nhãn "Tìm theo họ tên hoặc email" ẩn bằng sr-only; avatar có aria-hidden; chữ "Chọn phòng ban" dùng màu #5a6472, tỉ lệ tương phản khoảng 6:1 trên nền trắng, đạt AA.
- **CSS:** các lớp bị bỏ (.badge, .list-count, .toolbar__count, .form__note, .form__actions) không còn nơi nào dùng. .search .search__field input chỉ chạm SearchBox, mà SearchBox chỉ có trang nhân viên dùng, nên không ảnh hưởng trang phòng ban. .field-group và .field__error--action chỉ có trang nhân viên dùng.
- **Phạm vi:** form chỉ có họ tên, email, phòng ban đúng docs/ke-hoach.md. Không thêm trường hay tính năng, không thêm gói runtime.

### Summary

Bước 10 giữ đúng hành vi cũ, SearchBox đồng bộ an toàn, và chuẩn truy cập được giữ; các lệnh kiểm tra tôi chạy đều xanh. Còn hai điểm nhỏ không chặn: mất focus ở nhánh xóa gặp 404, và kế hoạch chưa ghi việc sửa file DepartmentFormPage của U3.
