# Luật: u4-employees

> **Nguồn:**
> - `inception/requirements-analysis/requirements.md` (FR1.6, FR2.1–FR2.6, FR3.1–FR3.2, FR4.1–FR4.6, mục 2, mục 6)
> - `inception/user-stories/stories.md` (US1.4 AC1.4.3, US2.1–US2.4, US3.1, phần U4 của US4.1, US4.2, US4.4–US4.6)
> - `inception/contract-design/contract-summary.md` (C2, C3, C4, C5)
> - `inception/refined-mockups/` (`interaction-spec.md` luồng F1–F4, mục 2.4, 2.5; `mockups.md` mục 2–4)
> - `functional-design-questions.md` (Q1: giữ email như đã gõ; Q2: một luật định dạng email chung; Q3: form báo khi chưa có phòng ban)
> - Rà soát U1 (U4 bắt 23503 khi ghi nhân viên), rà soát U3 (khóa ngoại phải đúng tên `fk_employees_department`)
>
> **Bốn nhóm luật:**
> - **BR1:** dữ liệu nhân viên (kiểm và lưu).
> - **BR2:** các thao tác của service và API, gồm tìm kiếm và phần bổ sung vào xóa phòng ban.
> - **BR3:** database (bảng, chỉ mục, khóa ngoại, migration).
> - **BR4:** giao diện nhân viên.

```yaml
rules:
  - id: BR1.1
    statement: Họ tên và email được bỏ khoảng trắng hai đầu trước khi kiểm và lưu
    category: validation
    applies_to: EmployeeRequest.fullName, EmployeeRequest.email
    trigger: Thêm hoặc sửa nhân viên (form và API)
    logic: giá trị lưu = giá trị gửi lên đã bỏ khoảng trắng hai đầu
    violation: -
    source: FR2.2, FR2.3, requirements mục 2, mục 6

  - id: BR1.2
    statement: Họ tên bắt buộc
    category: validation
    applies_to: EmployeeRequest.fullName
    trigger: Thêm hoặc sửa
    logic: IF họ tên sau khi bỏ khoảng trắng rỗng THEN lỗi trường fullName "Vui lòng nhập họ tên"
    violation: Form báo cạnh ô, không gửi request; API trả 400 errors.fullName
    source: FR4.1, FR4.2, AC2.2.3, AC4.1.1

  - id: BR1.3
    statement: Họ tên tối đa 100 ký tự
    category: validation
    applies_to: EmployeeRequest.fullName
    trigger: Thêm hoặc sửa
    logic: IF độ dài họ tên (sau khi bỏ khoảng trắng) > 100 THEN lỗi trường fullName "Họ tên tối đa 100 ký tự"
    violation: Form báo cạnh ô; API trả 400 errors.fullName
    source: requirements mục 2, AC4.1.2

  - id: BR1.4
    statement: Email bắt buộc
    category: validation
    applies_to: EmployeeRequest.email
    trigger: Thêm hoặc sửa
    logic: IF email sau khi bỏ khoảng trắng rỗng THEN lỗi trường email "Vui lòng nhập email"
    violation: Form báo cạnh ô; API trả 400 errors.email
    source: requirements mục 2, interaction-spec 2.5

  - id: BR1.5
    statement: Email tối đa 254 ký tự
    category: validation
    applies_to: EmployeeRequest.email
    trigger: Thêm hoặc sửa
    logic: IF độ dài email (sau khi bỏ khoảng trắng) > 254 THEN lỗi trường email "Email tối đa 254 ký tự"
    violation: Form báo cạnh ô; API trả 400 errors.email
    source: requirements mục 2

  - id: BR1.6
    statement: Email đúng định dạng, cùng một luật ở form và API
    category: validation
    applies_to: EmployeeRequest.email
    trigger: Thêm hoặc sửa, sau BR1.4 và BR1.5
    logic: >
      Hợp lệ khi: có đúng một "@"; phần trước "@" không rỗng; phần sau "@" có ít nhất một dấu chấm,
      dấu chấm không đứng đầu hay cuối phần đó; không có khoảng trắng ở đâu cả.
      Ví dụ hợp lệ "a@congty.vn", "an.nguyen@cong-ty.com.vn"; không hợp lệ "abc", "a@b", "a @b.vn", "a@b.", "a@@b.vn".
      IF không hợp lệ THEN lỗi trường email "Email không đúng định dạng"
    violation: Form báo cạnh ô (chữ đã gõ vẫn giữ); API trả 400 errors.email
    source: FR4.1, FR4.2, AC2.2.3, AC4.1.1, Q2

  - id: BR1.7
    statement: Email không trùng với nhân viên khác, so không phân biệt hoa thường; lưu giữ nguyên chữ như đã gõ
    category: constraint
    applies_to: Employee.Email
    trigger: Thêm, hoặc sửa thành email của một nhân viên KHÁC
    logic: >
      IF có nhân viên khác (id khác) mà lower(email) = lower(email mới) THEN 409, errors.email "Email đã được sử dụng".
      Sửa giữ nguyên email hoặc chỉ đổi hoa thường email của chính mình thì không coi là trùng.
      Email lưu đúng như người dùng gõ (sau khi bỏ khoảng trắng), không đổi về chữ thường (Q1).
    violation: API 409 "Dữ liệu bị trùng" errors.email; form hiện cạnh ô Email
    source: FR2.5, AC2.2.4, AC2.3.2, AC2.3.3, Q1

  - id: BR1.8
    statement: Phòng ban bắt buộc chọn
    category: validation
    applies_to: EmployeeRequest.departmentId
    trigger: Thêm hoặc sửa
    logic: IF departmentId không có hoặc nhỏ hơn 1 THEN lỗi trường departmentId "Vui lòng chọn phòng ban"
    violation: Form báo cạnh ô chọn; API trả 400 errors.departmentId
    source: AC FR2.2, AC2.2.3, interaction-spec 2.5

  - id: BR1.9
    statement: Phòng ban phải đang có
    category: constraint
    applies_to: EmployeeRequest.departmentId
    trigger: Thêm hoặc sửa, sau khi qua BR1.1–BR1.8
    logic: IF IDepartmentService.ExistsAsync(departmentId) = false THEN lỗi trường departmentId "Phòng ban không tồn tại"
    violation: API trả 400 errors.departmentId; form hiện cạnh ô Phòng ban
    source: FR2.6, AC2.2.5, C4

  - id: BR2.1
    statement: Danh sách nhân viên sắp theo họ tên A-Z, kèm tên phòng ban, không phân trang
    category: policy
    applies_to: GET /api/employees
    trigger: Mở trang Nhân viên, hoặc tìm kiếm
    logic: trả các nhân viên khớp BR2.2, sắp theo họ tên tăng dần rồi theo id (để hai người trùng tên có thứ tự cố định); mỗi phần tử có departmentName; rỗng thì trả mảng rỗng (200)
    violation: -
    source: FR2.1, AC2.1.1, AC2.1.3

  - id: BR2.2
    statement: Tìm theo họ tên hoặc email, không phân biệt hoa thường, có phân biệt dấu
    category: policy
    applies_to: GET /api/employees?search=
    trigger: Có tham số search
    logic: >
      Bỏ khoảng trắng hai đầu chuỗi tìm. IF rỗng THEN trả tất cả.
      ELSE trả nhân viên mà lower(fullName) chứa lower(chuỗi) HOẶC lower(email) chứa lower(chuỗi).
      Có phân biệt dấu: "binh" không khớp "Bình". Ký tự % và _ là chữ thường, không phải ký tự đại diện.
    violation: -
    source: FR3.1, FR3.2, AC3.1.1–AC3.1.5, C2

  - id: BR2.3
    statement: Lấy, sửa, xóa nhân viên không tồn tại trả 404
    category: policy
    applies_to: GET/PUT/DELETE /api/employees/{id}
    trigger: id không có trong database
    logic: IF không có nhân viên mang id THEN 404 "Không tìm thấy", detail "Không tìm thấy nhân viên có mã {id}."
    violation: -
    source: FR4.3, AC2.3.4, AC2.4.3

  - id: BR2.4
    statement: Mã trạng thái thành công theo FR6.2
    category: policy
    applies_to: /api/employees
    trigger: Thao tác thành công
    logic: GET 200; POST 201 kèm Location /api/employees/{id} và body EmployeeDto; PUT 200 kèm EmployeeDto; DELETE 204 không có body
    violation: -
    source: FR6.1, FR6.2, C2

  - id: BR2.5
    statement: Xóa nhân viên xóa hẳn khỏi database
    category: policy
    applies_to: DELETE /api/employees/{id}
    trigger: Người dùng xác nhận xóa
    logic: xóa dòng khỏi bảng employees (không xóa mềm)
    violation: -
    source: FR2.4, AC2.4.1

  - id: BR2.6
    statement: Hai thao tác chen nhau không ra 500
    category: constraint
    applies_to: EmployeeService (thêm, sửa, xóa)
    trigger: Database báo lỗi khi lưu dù service đã kiểm trước
    logic: >
      Email trùng (23505 trên ux_employees_email) -> U1 đổi thành 409 errors.email "Email đã được sử dụng".
      Phòng ban vừa bị xóa (23503 trên fk_employees_department khi thêm/sửa) -> U4 bắt, báo 400 errors.departmentId "Phòng ban không tồn tại".
      Nhân viên vừa bị xóa ở nơi khác khi sửa/xóa (lưu không tác động dòng nào) -> U4 bắt, báo 404.
      Lỗi khác ném nguyên để U1 trả 500.
    violation: -
    source: NFR3, C3 database_constraint_violations, rà soát U1 (U4 bắt 23503 khi ghi nhân viên)

  - id: BR2.7
    statement: Không xóa được phòng ban còn nhân viên (U4 kích hoạt phần U3 đã chuẩn bị)
    category: constraint
    applies_to: IDepartmentService.DeleteAsync (thay đổi của U4 theo C4 change_by_u4)
    trigger: Xóa một phòng ban
    logic: >
      Sau khi tìm thấy phòng ban, IF có ít nhất một nhân viên thuộc phòng ban đó THEN lỗi xung đột
      title "Không thể xóa phòng ban", detail "Không thể xóa phòng ban \"<tên>\" vì vẫn còn nhân viên." và không xóa.
      Đường dự phòng của U3 (bắt 23503 và 23001) giữ nguyên cho trường hợp chen nhau. Chữ ký hàm không đổi.
    violation: API 409; giao diện phòng ban (U3) hiện lỗi role="alert" ở đầu trang, dòng vẫn còn
    source: FR1.6, AC1.4.3, C4, ADR-002

  - id: BR3.1
    statement: Bảng employees đặt tên snake_case
    category: constraint
    applies_to: migration 2 (U4)
    trigger: dotnet ef database update
    logic: tạo bảng employees(id khóa chính tự tăng, full_name tối đa 100 ký tự bắt buộc, email tối đa 254 ký tự bắt buộc, department_id số nguyên bắt buộc)
    violation: -
    source: C5, team.md Q10, AC5.3.2

  - id: BR3.2
    statement: Database tự chặn email trùng không phân biệt hoa thường
    category: constraint
    applies_to: migration 2 (U4)
    trigger: dotnet ef database update
    logic: tạo chỉ mục không trùng tên ux_employees_email trên lower(email) (đúng tên U1 nhận ra khi đổi lỗi 23505)
    violation: Chèn SQL tay email trùng (khác hoa thường) thì PostgreSQL báo 23505
    source: FR2.5, C5, AC5.3.3

  - id: BR3.3
    statement: Khóa ngoại tới phòng ban, chặn xóa phòng ban còn nhân viên
    category: constraint
    applies_to: migration 2 (U4)
    trigger: dotnet ef database update
    logic: >
      Khóa ngoại tên đúng fk_employees_department (dùng chung hằng với U1/U3) từ employees.department_id tới departments.id, ON DELETE RESTRICT;
      kèm chỉ mục thường trên department_id.
    violation: Xóa SQL tay phòng ban còn nhân viên thì PostgreSQL báo 23001 (restrict_violation; đính chính Build and Test 03/11/2026, trước ghi 23503, đã thấy thật ở U4, U5)
    source: FR1.6, C5, rà soát Code Generation U3

  - id: BR3.4
    statement: Migration thứ hai là migration mới, không có nhân viên mẫu
    category: policy
    applies_to: migration 2 (U4)
    trigger: dotnet ef database update
    logic: thêm migration mới tạo bảng employees; không sửa migration CreateDepartments; không chèn nhân viên mẫu
    violation: -
    source: C5 (không sửa migration đã chạy), FR1.7, AC1.5.2

  - id: BR4.1
    statement: Trang Nhân viên có đủ các trạng thái
    category: policy
    applies_to: EmployeesPage
    trigger: Mở trang hoặc tìm kiếm
    logic: >
      Đang tải: "Đang tải...". Lỗi: "Không kết nối được máy chủ, vui lòng thử lại" + "Thử lại".
      Trống khi không tìm: "Chưa có nhân viên nào." + liên kết "Thêm nhân viên".
      Trống khi đang tìm: "Không tìm thấy nhân viên phù hợp với "<chuỗi>"." + nút "Xóa tìm kiếm".
      Có dữ liệu: bảng cột Họ tên, Email, Phòng ban, Thao tác; dòng đếm "Có N nhân viên" (không tìm) hoặc "Đang hiện N nhân viên" (đang tìm), đọc qua aria-live.
    violation: -
    source: US2.1, AC2.1.1, AC2.1.2, AC3.1.4, AC4.2.1–AC4.2.3, FR4.5, interaction-spec F4

  - id: BR4.2
    statement: Tìm kiếm bằng nút Tìm hoặc Enter, giữ trên địa chỉ trang
    category: policy
    applies_to: EmployeesPage, SearchBox
    trigger: Bấm "Tìm" hoặc Enter; mở trang có ?search=; bấm Back
    logic: >
      Gõ chưa làm gì. Bấm Tìm/Enter: bỏ khoảng trắng hai đầu, ghi lên địa chỉ (/employees?search=an; rỗng thì bỏ tham số), rồi tải lại danh sách theo địa chỉ.
      Mở trang hay bấm Back: ô tìm điền sẵn chuỗi trên địa chỉ và danh sách theo chuỗi đó. "Xóa tìm kiếm" đưa về /employees.
      Ô tìm và nút Tìm khóa trong lúc đang tải.
    violation: -
    source: FR3.1, FR3.2, AC3.1.1–AC3.1.5, interaction-spec F4, 2.4

  - id: BR4.3
    statement: Form nhân viên kiểm trên trình duyệt như API
    category: validation
    applies_to: EmployeeFormPage
    trigger: Rời ô, hoặc bấm Lưu
    logic: >
      Áp BR1.1–BR1.6 và BR1.8 trên trình duyệt, cùng lời báo. Có lỗi khi bấm Lưu: không gửi request, focus vào khung tóm tắt lỗi.
      Lỗi 400/409 từ API: lỗi theo khóa fullName, email, departmentId hiện cạnh ô tương ứng, lỗi khác ở khung tóm tắt. Dữ liệu đã gõ giữ nguyên.
    violation: -
    source: FR4.1, AC2.2.3, AC4.1.1, AC4.1.3, interaction-spec 2.5

  - id: BR4.4
    statement: Ô chọn phòng ban nạp từ API và báo khi không có phòng ban
    category: policy
    applies_to: EmployeeFormPage, ô Phòng ban
    trigger: Mở form
    logic: >
      Gọi GET /api/departments; trong lúc nạp ô chọn bị khóa. Mục đầu "-- Chọn phòng ban --" (giá trị rỗng), sau đó các phòng ban theo thứ tự API trả.
      Nạp lỗi: dòng lỗi cạnh ô kèm nút "Thử lại", nút Lưu bị khóa.
      Danh sách rỗng (Q3): ô hiện "-- Chưa có phòng ban --" và bị khóa, dòng "Chưa có phòng ban nào. Hãy thêm phòng ban trước." kèm liên kết /departments/new; bấm Lưu báo "Vui lòng chọn phòng ban".
    violation: -
    source: FR2.2, AC2.2.2, interaction-spec F1, Q3

  - id: BR4.5
    statement: Form sửa điền sẵn dữ liệu và báo khi nhân viên không còn
    category: policy
    applies_to: EmployeeFormPage (chế độ sửa)
    trigger: Mở /employees/:id/edit, hoặc lưu
    logic: >
      Mở form: tải nhân viên và danh sách phòng ban, điền sẵn ba ô. API 404 khi mở: "Không tìm thấy nhân viên" + liên kết về danh sách.
      API 404 khi lưu: khung tóm tắt "Không tìm thấy nhân viên, có thể đã bị xóa".
    violation: -
    source: AC2.3.1, AC2.3.4, interaction-spec F2

  - id: BR4.6
    statement: Lưu xong quay về danh sách kèm thông báo; Hủy không gửi request
    category: policy
    applies_to: EmployeeFormPage
    trigger: API trả 201 (thêm) hoặc 200 (sửa); bấm Hủy
    logic: chuyển về /employees, Toast "Đã thêm nhân viên \"<tên>\"" hoặc "Đã cập nhật nhân viên \"<tên>\""; Hủy là liên kết về /employees
    violation: -
    source: AC2.2.1, AC2.3.1, AC4.5.1, AC4.5.2

  - id: BR4.7
    statement: Xóa nhân viên phải xác nhận, khóa nút khi chờ, và tải lại danh sách (giữ chuỗi tìm)
    category: policy
    applies_to: EmployeesPage, nút Xóa
    trigger: Bấm Xóa trên một dòng
    logic: >
      Hộp window.confirm: "Xóa nhân viên \"<tên>\"? Thao tác này không hoàn tác được." Hủy: không làm gì.
      OK: khóa nút Xóa (useSubmitGuard), gọi DELETE. 204: tải lại danh sách theo chuỗi tìm hiện tại, Toast "Đã xóa nhân viên \"<tên>\"", focus về h1.
      404: tải lại, báo "Mục này đã không còn". Lỗi mạng: báo lỗi kết nối, mở lại nút.
    violation: -
    source: FR2.4, FR4.6, AC2.4.1, AC2.4.2, AC4.4.2, interaction-spec F3

  - id: BR4.8
    statement: Nút Lưu bị khóa và đổi chữ trong lúc chờ API
    category: policy
    applies_to: EmployeeFormPage
    trigger: Bấm Lưu với dữ liệu hợp lệ
    logic: dùng useSubmitGuard; nút "Đang lưu..." bị khóa tới khi API trả lời; bấm đúp chỉ gửi một request
    violation: -
    source: FR4.6, AC4.4.1, AC4.4.2

  - id: BR4.9
    statement: Nhãn ô và nút đọc được đầy đủ
    category: policy
    applies_to: EmployeesPage, EmployeeFormPage
    trigger: Hiển thị
    logic: >
      Mỗi ô có label gắn for/id (bấm nhãn "Họ tên" thì vào ô Họ tên); lỗi luôn có chữ và biểu tượng, không chỉ viền đỏ.
      Nút trên mỗi dòng có aria-label "Sửa nhân viên <tên>", "Xóa nhân viên <tên>".
    violation: -
    source: AC4.6.1, AC4.6.2, WCAG 2.4.4
```

## Tóm tắt luật

| ID | Luật | Kết quả |
|---|---|---|
| BR1.1 | Bỏ khoảng trắng hai đầu | Họ tên, email lưu đã trim |
| BR1.2 | Họ tên bắt buộc | 400 "Vui lòng nhập họ tên" |
| BR1.3 | Họ tên ≤ 100 | 400 "Họ tên tối đa 100 ký tự" |
| BR1.4 | Email bắt buộc | 400 "Vui lòng nhập email" |
| BR1.5 | Email ≤ 254 | 400 "Email tối đa 254 ký tự" |
| BR1.6 | Định dạng email (một luật chung) | 400 "Email không đúng định dạng" |
| BR1.7 | Email không trùng (không phân biệt hoa thường), lưu như đã gõ | 409 "Email đã được sử dụng" |
| BR1.8 | Phòng ban bắt buộc | 400 "Vui lòng chọn phòng ban" |
| BR1.9 | Phòng ban phải đang có | 400 "Phòng ban không tồn tại" |
| BR2.1 | Danh sách | Sắp theo họ tên rồi id, có `departmentName` |
| BR2.2 | Tìm kiếm | Họ tên hoặc email chứa chuỗi, không phân biệt hoa thường, có phân biệt dấu |
| BR2.3 | Không tìm thấy | 404 "Không tìm thấy nhân viên có mã {id}." |
| BR2.4 | Mã thành công | 200 / 201 + Location / 200 / 204 |
| BR2.5 | Xóa | Xóa hẳn |
| BR2.6 | Chen nhau | 23505 → 409; 23503 → 400 `departmentId`; dòng mất → 404 |
| BR2.7 | Xóa phòng ban còn nhân viên | 409 "Không thể xóa phòng ban" (kiểm trước khi xóa) |
| BR3.1 | Bảng | `employees` snake_case |
| BR3.2 | Chỉ mục email | `ux_employees_email` trên `lower(email)` |
| BR3.3 | Khóa ngoại | `fk_employees_department` RESTRICT + chỉ mục `department_id` |
| BR3.4 | Migration | Migration mới, không có nhân viên mẫu |
| BR4.1 | Trang danh sách | Tải / lỗi / trống / không khớp / có dữ liệu |
| BR4.2 | Tìm kiếm | Nút Tìm, Enter, `?search=` trên địa chỉ |
| BR4.3 | Kiểm form | Như API, lỗi cạnh ô + khung tóm tắt |
| BR4.4 | Ô chọn phòng ban | Nạp từ API; lỗi / rỗng có báo |
| BR4.5 | Form sửa | Điền sẵn; 404 khi mở / khi lưu |
| BR4.6 | Lưu xong / Hủy | Về danh sách + "Đã thêm / Đã cập nhật ..." |
| BR4.7 | Xóa | Xác nhận, khóa nút, tải lại giữ chuỗi tìm |
| BR4.8 | Khóa nút Lưu | Bấm đúp chỉ một request |
| BR4.9 | Nhãn | Label gắn ô; `aria-label` đủ tên |
