# Luật: u3-departments

> **Nguồn:**
> - `inception/requirements-analysis/requirements.md` (FR1.1–FR1.7, FR4.1–FR4.6, FR6.1–FR6.2)
> - `inception/user-stories/stories.md` (US1.1–US1.5, phần U3 của US4.1, US4.2, US4.4–US4.6)
> - `inception/contract-design/contract-summary.md` (C1, C4, C5)
> - `inception/refined-mockups/` (`mockups.md` mục 5–8, `interaction-spec.md` luồng F2, F3, mục 2.5)
> - Rà soát Code Generation U1 (Major về lỗi khóa ngoại: U3 tự bắt lỗi khóa ngoại khi xóa) và U2 (sau khi xóa phải tải lại danh sách)
>
> **Bốn nhóm luật:**
> - **BR1:** dữ liệu phòng ban (kiểm và lưu).
> - **BR2:** các thao tác của service và API.
> - **BR3:** database (ràng buộc, migration, dữ liệu mẫu).
> - **BR4:** giao diện phòng ban.

```yaml
rules:
  - id: BR1.1
    statement: Tên phòng ban được bỏ khoảng trắng hai đầu trước khi kiểm và lưu
    category: validation
    applies_to: DepartmentRequest.name
    trigger: Thêm hoặc sửa phòng ban (form và API)
    logic: tên lưu = tên gửi lên đã bỏ khoảng trắng hai đầu
    violation: -
    source: FR1.2, FR1.3, C1 DepartmentRequest

  - id: BR1.2
    statement: Tên phòng ban bắt buộc
    category: validation
    applies_to: DepartmentRequest.name
    trigger: Thêm hoặc sửa
    logic: IF tên sau khi bỏ khoảng trắng rỗng THEN lỗi trường name "Vui lòng nhập tên phòng ban"
    violation: Form báo cạnh ô, không gửi request; API trả 400 errors.name
    source: AC1.2.2, FR4.1, FR4.2

  - id: BR1.3
    statement: Tên phòng ban tối đa 100 ký tự
    category: validation
    applies_to: DepartmentRequest.name
    trigger: Thêm hoặc sửa
    logic: IF độ dài tên (sau khi bỏ khoảng trắng) > 100 THEN lỗi trường name "Tên phòng ban tối đa 100 ký tự"
    violation: Form báo cạnh ô; API trả 400 errors.name
    source: AC1.2.4, FR4.1, FR4.2

  - id: BR1.4
    statement: Tên phòng ban không trùng, so không phân biệt hoa thường
    category: constraint
    applies_to: Department.Name
    trigger: Thêm, hoặc sửa thành tên của một phòng ban KHÁC
    logic: >
      IF có phòng ban khác (id khác) mà lower(name) = lower(tên mới) THEN 409, errors.name "Tên phòng ban đã tồn tại".
      Sửa giữ nguyên tên hoặc chỉ đổi hoa thường của chính nó thì không coi là trùng.
    violation: API 409 "Dữ liệu bị trùng" errors.name; form hiện cạnh ô tên
    source: FR1.5, AC1.2.3, AC1.3.2, AC1.3.3

  - id: BR2.1
    statement: Danh sách phòng ban sắp theo tên A-Z, không phân trang
    category: policy
    applies_to: GET /api/departments
    trigger: Mở trang Phòng ban, hoặc form nhân viên nạp danh sách chọn (U4)
    logic: trả mọi phòng ban, sắp theo tên tăng dần; rỗng thì trả mảng rỗng (200)
    violation: -
    source: FR1.1, AC1.1.1

  - id: BR2.2
    statement: Lấy, sửa, xóa phòng ban không tồn tại trả 404
    category: policy
    applies_to: GET/PUT/DELETE /api/departments/{id}
    trigger: id không có trong database
    logic: IF không có phòng ban mang id THEN 404 "Không tìm thấy", detail "Không tìm thấy phòng ban có mã {id}."
    violation: -
    source: FR4.3, AC1.3.4

  - id: BR2.3
    statement: Mã trạng thái thành công theo FR6.2
    category: policy
    applies_to: /api/departments
    trigger: Thao tác thành công
    logic: GET 200; POST 201 kèm Location /api/departments/{id} và body DepartmentDto; PUT 200 kèm DepartmentDto; DELETE 204 không có body
    violation: -
    source: FR6.1, FR6.2, AC5.2.2

  - id: BR2.4
    statement: Xóa phòng ban xóa hẳn khỏi database
    category: policy
    applies_to: DELETE /api/departments/{id}
    trigger: Người dùng xác nhận xóa
    logic: xóa dòng khỏi bảng departments (không xóa mềm)
    violation: -
    source: FR1.4, AC1.4.1

  - id: BR2.5
    statement: Không xóa được phòng ban còn nhân viên (U3 chuẩn bị, U4 kích hoạt)
    category: constraint
    applies_to: DELETE /api/departments/{id}
    trigger: Database báo vi phạm khóa ngoại fk_employees_department khi xóa (23503)
    logic: >
      U3 bắt DbUpdateException có PostgresException 23503 / fk_employees_department ngay ở thao tác xóa và ném lỗi xung đột
      title "Không thể xóa phòng ban", detail "Không thể xóa phòng ban \"<tên>\" vì vẫn còn nhân viên." (đường dự phòng khi hai thao tác chen nhau).
      U4 thêm bước kiểm còn nhân viên TRƯỚC khi xóa (C4 change_by_u4), cùng lời báo. Trước U4 chưa có bảng nhân viên nên nhánh này chưa xảy ra.
    violation: API 409; giao diện hiện lỗi role="alert" ở đầu trang, dòng vẫn còn
    source: FR1.6, AC1.4.3, C4, rà soát Code Generation U1 (Major về lỗi khóa ngoại)

  - id: BR2.6
    statement: Cho U4 kiểm phòng ban tồn tại
    category: policy
    applies_to: IDepartmentService.ExistsAsync
    trigger: U4 thêm hoặc sửa nhân viên
    logic: trả true nếu có phòng ban mang id, ngược lại false; không ném lỗi khi không có; lỗi database ném lên nguyên vẹn
    violation: -
    source: C4

  - id: BR3.1
    statement: Bảng departments đặt tên snake_case và có chỉ mục không trùng trên lower(name)
    category: constraint
    applies_to: migration 1 (U3)
    trigger: dotnet ef database update
    logic: >
      Tạo bảng departments(id khóa chính tự tăng, name tối đa 100 ký tự, bắt buộc);
      tạo chỉ mục không trùng tên ux_departments_name trên lower(name) (đúng tên U1 nhận ra khi đổi lỗi 23505).
    violation: Chèn SQL tay tên trùng (khác hoa thường) thì PostgreSQL báo lỗi 23505
    source: C5, NFR3, AC5.3.2, AC5.3.3

  - id: BR3.2
    statement: Migration tạo sẵn 4 phòng ban mẫu, không có nhân viên mẫu
    category: policy
    applies_to: migration 1 (U3)
    trigger: dotnet ef database update trên database trống
    logic: chèn "Nhân sự", "Kế toán", "Kỹ thuật", "Kinh doanh"; id do database cấp để phòng ban thêm sau không bị trùng id
    violation: -
    source: FR1.7, AC1.5.1, C5 seed

  - id: BR4.1
    statement: Trang Phòng ban có đủ bốn trạng thái
    category: policy
    applies_to: DepartmentsPage
    trigger: Mở trang
    logic: >
      Đang tải: "Đang tải...". Lỗi: "Không kết nối được máy chủ, vui lòng thử lại" + nút "Thử lại" (không hiện thông báo trống).
      Trống: "Chưa có phòng ban nào." + liên kết "Thêm phòng ban". Có dữ liệu: bảng tên phòng ban + nút Sửa, Xóa + dòng "Có N phòng ban".
    violation: -
    source: US1.1, AC1.1.2, AC1.1.3, FR4.5, mockups mục 5

  - id: BR4.2
    statement: Form phòng ban kiểm trên trình duyệt như API
    category: validation
    applies_to: DepartmentFormPage
    trigger: Rời ô tên, hoặc bấm Lưu
    logic: >
      Áp BR1.1–BR1.3 trên trình duyệt. Có lỗi khi bấm Lưu: không gửi request, focus vào khung tóm tắt lỗi.
      Lỗi 400/409 từ API: lỗi errors.name hiện cạnh ô tên, lỗi khác hiện ở khung tóm tắt. Dữ liệu đã gõ giữ nguyên.
    violation: -
    source: FR4.1, AC1.2.2, AC1.2.3, AC1.2.4, AC4.1.1, AC4.1.3, mockups mục 4b, 6

  - id: BR4.3
    statement: Form sửa điền sẵn dữ liệu và báo khi phòng ban không còn
    category: policy
    applies_to: DepartmentFormPage (chế độ sửa)
    trigger: Mở /departments/:id/edit, hoặc lưu
    logic: >
      Mở form: tải phòng ban, điền sẵn tên. API 404 khi mở: "Không tìm thấy phòng ban" + liên kết về danh sách.
      API 404 khi lưu: khung tóm tắt "Không tìm thấy phòng ban, có thể đã bị xóa".
    violation: -
    source: AC1.3.1, AC1.3.4, interaction-spec F2

  - id: BR4.4
    statement: Lưu xong quay về danh sách kèm thông báo
    category: policy
    applies_to: DepartmentFormPage
    trigger: API trả 201 (thêm) hoặc 200 (sửa)
    logic: chuyển về /departments, Toast hiện "Đã thêm phòng ban \"<tên>\"" hoặc "Đã cập nhật phòng ban \"<tên>\""; nút Hủy là liên kết về danh sách, không gửi request
    violation: -
    source: AC1.2.1, AC1.3.1, AC4.5.1, AC4.5.2, mockups mục 8

  - id: BR4.5
    statement: Xóa phải xác nhận, khóa nút khi chờ, và tải lại danh sách
    category: policy
    applies_to: DepartmentsPage, nút Xóa
    trigger: Bấm Xóa trên một dòng
    logic: >
      Hộp window.confirm: "Xóa phòng ban \"<tên>\"? Thao tác này không hoàn tác được." Hủy: không làm gì.
      OK: khóa nút Xóa của dòng đó (useSubmitGuard), gọi DELETE.
      204: gọi lại hàm tải danh sách, Toast "Đã xóa phòng ban \"<tên>\"", focus về h1.
      409: lỗi role="alert" ở đầu trang với detail của API, dòng vẫn còn, nút mở lại.
      404: tải lại danh sách, báo "Mục này đã không còn". Lỗi mạng: báo lỗi kết nối, nút mở lại.
    violation: -
    source: FR1.4, FR4.6, AC1.4.1, AC1.4.2, AC1.4.3, AC4.4.2, interaction-spec F3, rà soát U2

  - id: BR4.6
    statement: Nút Lưu bị khóa và đổi chữ trong lúc chờ API
    category: policy
    applies_to: DepartmentFormPage
    trigger: Bấm Lưu với dữ liệu hợp lệ
    logic: dùng useSubmitGuard; nút "Đang lưu..." bị khóa tới khi API trả lời; bấm đúp chỉ gửi một request
    violation: -
    source: FR4.6, AC4.4.1, AC4.4.2

  - id: BR4.7
    statement: Nút Sửa và Xóa trên mỗi dòng có tên đầy đủ cho trình đọc màn hình
    category: policy
    applies_to: DepartmentsPage
    trigger: Hiển thị bảng
    logic: aria-label "Sửa phòng ban <tên>", "Xóa phòng ban <tên>"; chữ hiển thị vẫn là "Sửa", "Xóa"
    violation: -
    source: WCAG 2.4.4 (accessibility-checklist G1)
```

## Tóm tắt luật

| ID | Luật | Kết quả |
|---|---|---|
| BR1.1 | Bỏ khoảng trắng hai đầu | Tên lưu đã được trim |
| BR1.2 | Tên bắt buộc | 400 "Vui lòng nhập tên phòng ban" |
| BR1.3 | Tối đa 100 ký tự | 400 "Tên phòng ban tối đa 100 ký tự" |
| BR1.4 | Không trùng (không phân biệt hoa thường) | 409 "Tên phòng ban đã tồn tại"; trùng với chính nó thì không sao |
| BR2.1 | Danh sách | Sắp theo tên A-Z, mảng rỗng khi không có |
| BR2.2 | Không tìm thấy | 404 "Không tìm thấy phòng ban có mã {id}." |
| BR2.3 | Mã thành công | 200 / 201 + Location / 200 / 204 |
| BR2.4 | Xóa | Xóa hẳn |
| BR2.5 | Còn nhân viên | 409 "Không thể xóa phòng ban" (U3 bắt 23503, U4 kiểm trước) |
| BR2.6 | `ExistsAsync` | Cho U4 dùng |
| BR3.1 | Bảng, chỉ mục | `departments`, `ux_departments_name` trên `lower(name)` |
| BR3.2 | Dữ liệu mẫu | 4 phòng ban, id do database cấp |
| BR4.1 | Trang danh sách | Tải / lỗi / trống / có dữ liệu |
| BR4.2 | Kiểm form | Như API, lỗi cạnh ô + khung tóm tắt |
| BR4.3 | Form sửa | Điền sẵn; 404 khi mở / khi lưu |
| BR4.4 | Lưu xong | Về danh sách + "Đã thêm / Đã cập nhật ..." |
| BR4.5 | Xóa | Xác nhận, khóa nút, tải lại, 409 / 404 / lỗi mạng |
| BR4.6 | Khóa nút Lưu | Bấm đúp chỉ một request |
| BR4.7 | Nhãn nút | `aria-label` ghi đủ tên phòng ban |
