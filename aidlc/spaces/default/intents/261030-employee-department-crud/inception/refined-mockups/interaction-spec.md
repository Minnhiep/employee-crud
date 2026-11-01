# Đặc tả tương tác (Interaction Spec)

> **Nguồn:**
> - `mockups.md`
> - `user-stories/stories.md`
> - `requirements-analysis/requirements.md`
> - `refined-mockups-questions.md` (Q1–Q9)
>
> Phần đặc tả từng component theo mẫu `component-spec-template.md`. Tên component là gợi ý cho bước Code Generation, chưa phải quyết định cuối.

## 1. Luồng người dùng

### Luồng F1. Thêm nhân viên (US2.2)

- **Persona:** P1
- **Khởi đầu:** bấm "+ Thêm nhân viên" ở `/employees`
- **Các bước:**
  1. Form thêm nhân viên mở ra.
     - Hệ thống gọi `GET /api/departments` để nạp danh sách phòng ban. Trong lúc nạp, ô chọn bị khóa.
  2. Người dùng nhập họ tên, email và chọn phòng ban, rồi bấm Lưu.
     - Form kiểm dữ liệu ngay trên trình duyệt.
     - Dữ liệu hợp lệ: gọi `POST /api/employees`. Nút Lưu bị khóa và đổi chữ thành "Đang lưu...".
  3. API trả 201.
     - Chuyển về `/employees` và hiện "Đã thêm nhân viên "<tên>"" trong 5 giây.
- **Khi lỗi:**
  - Dữ liệu sai trên form: lỗi hiện cạnh từng ô, focus nhảy tới khung tóm tắt lỗi, không gửi request.
  - API trả 400: lấy lỗi theo trường trong `errors` hiện cạnh ô tương ứng, dữ liệu đã gõ vẫn giữ nguyên.
  - API trả 409 (trùng email): hiện "Email đã được sử dụng" cạnh ô Email.
  - Không kết nối được máy chủ: khung tóm tắt báo "Không kết nối được máy chủ, vui lòng thử lại", nút Lưu mở lại.
  - Nạp phòng ban lỗi: dòng lỗi cạnh ô Phòng ban kèm nút "Thử lại", nút Lưu bị khóa.
  - Bấm Hủy: quay về `/employees`, không gửi request.

### Luồng F2. Sửa (US1.3, US2.3)

Giống F1, có hai điểm khác:
- Lúc mở form, hệ thống gọi `GET /api/{employees|departments}/{id}` để điền sẵn dữ liệu.
  - API trả 404: hiện "Không tìm thấy ..." kèm liên kết về danh sách.
- Khi lưu, hệ thống gọi `PUT`.
  - Thành công: hiện "Đã cập nhật ...".
  - API trả 404 lúc lưu (bản ghi vừa bị xóa ở nơi khác): khung tóm tắt báo "Không tìm thấy ..., có thể đã bị xóa".

### Luồng F3. Xóa (US1.4, US2.4)

1. Người dùng bấm "Xóa" trên một dòng. Hộp `window.confirm` hỏi: `Xóa <loại> "<tên>"? Thao tác này không hoàn tác được.`
2. Bấm Hủy: không có gì xảy ra, focus quay về nút Xóa vừa bấm.
3. Bấm OK: nút Xóa của dòng đó bị khóa, hệ thống gọi `DELETE`.
   - API trả 204: tải lại danh sách, hiện "Đã xóa <loại> "<tên>"".
   - API trả 409: hiện lỗi `role="alert"` ở đầu trang ("Không thể xóa phòng ban ... vì vẫn còn nhân viên."), dòng vẫn còn, nút mở lại.
   - API trả 404: tải lại danh sách và báo "Mục này đã không còn".
   - Không kết nối được máy chủ: hiện lỗi kết nối, nút mở lại.
4. Sau khi danh sách tải lại, focus chuyển về tiêu đề `<h1>` của trang, vì dòng vừa xóa không còn để giữ focus.

### Luồng F4. Tìm kiếm (US3.1, Q3)

1. Người dùng gõ vào ô tìm kiếm. Chưa có gì xảy ra.
2. Bấm "Tìm" hoặc nhấn Enter: gọi `GET /api/employees?search=<chuỗi đã bỏ khoảng trắng hai đầu>`.
   - Chuỗi rỗng: gọi `GET /api/employees` không có tham số.
3. Có kết quả: bảng hiện kết quả và dòng đếm "Đang hiện N nhân viên", được báo qua `aria-live`.
4. Không có kết quả: hiện "Không tìm thấy nhân viên phù hợp với "<chuỗi>"." cùng nút "Xóa tìm kiếm".
5. Chuỗi tìm được ghi lên địa chỉ trang (`/employees?search=an`). Tải lại trang hay bấm Back vẫn giữ kết quả. [assumption: theo checklist "giữ trạng thái lọc"; Hiệp bỏ được]

## 2. Component

### 2.1 `AppLayout`: khung trang

| Field | Value |
|---|---|
| Component | AppLayout |
| Description | Khung chung: liên kết bỏ qua, header, menu, vùng `<main>`, vùng thông báo |
| Category | layout |

| State | Description | Trigger |
|---|---|---|
| default | Hiện header, menu, nội dung trang con | Mở trang |
| focus (skip link) | Liên kết "Bỏ qua, tới nội dung chính" hiện ra | Tab đầu tiên |

| Requirement | Implementation |
|---|---|
| ARIA role | `<header>`, `<nav aria-label="Chính">`, `<main id="noi-dung">` |
| Keyboard interaction | Tab đầu tiên tới liên kết bỏ qua; Enter nhảy tới `<main>` |
| Focus management | Khi đổi trang, focus chuyển tới `<h1>` của trang mới (`tabindex="-1"`) và `document.title` đổi theo |
| Screen reader | Đọc tiêu đề trang mới sau mỗi lần chuyển trang |

Responsive: từ 1024px trở lên menu nằm ngang. Hẹp hơn thì các mục menu tự xuống dòng, không thu gọn thành nút ba gạch.

### 2.2 `NavMenu`: menu chính

| Field | Value |
|---|---|
| Component | NavMenu |
| Description | Hai liên kết "Nhân viên", "Phòng ban" (React Router `NavLink`) |
| Category | navigation |

| State | Description | Trigger |
|---|---|---|
| default | Chữ thường | — |
| hover | Gạch dưới | Di chuột |
| focus | Viền focus 3px | Tab |
| active | Chữ đậm và gạch dưới, `aria-current="page"` | Đang ở trang đó |

### 2.3 `DataTable`: bảng danh sách

| Field | Value |
|---|---|
| Component | DataTable |
| Description | Bảng dùng chung cho nhân viên và phòng ban |
| Category | display |

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| caption | string | yes | — | Tiêu đề bảng cho trình đọc màn hình |
| columns | object[] | yes | — | Tên cột, cách lấy giá trị |
| rows | object[] | yes | — | Dữ liệu |
| renderActions | function | no | — | Vẽ nút Sửa/Xóa cho mỗi dòng |

| State | Description | Trigger |
|---|---|---|
| default | Có dòng dữ liệu | rows có phần tử |
| empty | Không vẽ bảng; trang cha hiện thông báo trống | rows rỗng |

Accessibility:
- Dùng `<table>`, `<caption>`, `<th scope="col">`.
- Khung cuộn ngang có `role="region"`, `aria-label` và `tabindex="0"`.

### 2.4 `SearchBox`: ô tìm kiếm

| Field | Value |
|---|---|
| Component | SearchBox |
| Description | Form tìm gồm nhãn, ô nhập và nút "Tìm" |
| Category | input |

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| initialValue | string | no | "" | Lấy từ `?search=` trên địa chỉ |
| onSearch | function | yes | — | Gọi khi bấm Tìm hoặc nhấn Enter |
| disabled | boolean | no | false | Khóa trong lúc đang tìm |

Accessibility:
- `<form role="search">`, `<label for="tim-kiem">Tìm theo họ tên hoặc email</label>`, `<input type="search">`.
- Enter gửi form.

### 2.5 `EmployeeForm` / `DepartmentForm`

| Field | Value |
|---|---|
| Component | EmployeeForm, DepartmentForm |
| Description | Form thêm và sửa, dùng chung cho cả hai chế độ |
| Category | input |

| State | Description | Trigger |
|---|---|---|
| loading | "Đang tải..." (chế độ sửa, hoặc đang nạp phòng ban) | Mở form |
| default | Ô trống (thêm) hoặc điền sẵn (sửa) | Tải xong |
| error (field) | Viền đỏ dày, biểu tượng (!), dòng lỗi dưới ô | Rời ô hoặc bấm Lưu khi dữ liệu sai |
| error (summary) | Khung tóm tắt lỗi ở đầu form nhận focus | Bấm Lưu khi có lỗi, hoặc API trả 400/409 hay lỗi mạng |
| submitting | Nút "Đang lưu..." bị khóa | Đang chờ API |
| not-found | "Không tìm thấy ..." + liên kết về danh sách | API trả 404 lúc mở form |

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| mode | "create" \| "edit" | yes | — | Chế độ |
| id | number | no | — | Mã bản ghi khi sửa |

**Luật kiểm dữ liệu trên trình duyệt** (khớp `requirements.md` mục 2, API kiểm lại y hệt):

| Ô | Luật | Lời báo |
|---|---|---|
| Họ tên | Bắt buộc sau khi bỏ khoảng trắng hai đầu; tối đa 100 ký tự | "Vui lòng nhập họ tên" / "Họ tên tối đa 100 ký tự" |
| Email | Bắt buộc; đúng định dạng email; tối đa 254 ký tự | "Vui lòng nhập email" / "Email không đúng định dạng" / "Email tối đa 254 ký tự" |
| Phòng ban | Bắt buộc chọn | "Vui lòng chọn phòng ban" |
| Tên phòng ban | Bắt buộc sau khi bỏ khoảng trắng hai đầu; tối đa 100 ký tự | "Vui lòng nhập tên phòng ban" / "Tên phòng ban tối đa 100 ký tự" |

Ô nhập dùng `type="email"`, `maxLength` và `autocomplete="off"`. Form có `noValidate` để tự hiện lời báo tiếng Việt thay vì lời báo mặc định của trình duyệt.

Accessibility:

| Requirement | Implementation |
|---|---|
| Label | `<label for>` hiện rõ phía trên ô; dấu * kèm chú thích "(* là ô bắt buộc)" |
| Lỗi | `aria-invalid="true"` + `aria-describedby` trỏ tới dòng lỗi; dòng lỗi có biểu tượng và chữ |
| Focus management | Bấm Lưu khi có lỗi: focus vào khung tóm tắt (`role="alert"`, `tabindex="-1"`); mỗi lỗi là liên kết `#id-ô` |
| Keyboard | Tab theo thứ tự hiển thị; Enter trong ô bất kỳ gửi form; nút Hủy là liên kết |

### 2.6 `StatusMessage`: tải / lỗi / trống

| Field | Value |
|---|---|
| Component | StatusMessage |
| Description | Một chỗ duy nhất hiện ba trạng thái không phải dữ liệu |
| Category | feedback |

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| kind | "loading" \| "error" \| "empty" | yes | — | Loại |
| message | string | yes | — | Lời báo tiếng Việt |
| action | {label, onClick} | no | — | Nút đi kèm, ví dụ "Thử lại", "+ Thêm ..." |

| kind | Vai trò ARIA | Hình thức |
|---|---|---|
| loading | `role="status"` | Biểu tượng xoay (tắt chuyển động khi máy bật `prefers-reduced-motion`) + "Đang tải..." |
| error | `role="alert"` | Biểu tượng (!) + chữ đỏ đậm trên nền đỏ nhạt |
| empty | (không) | Chữ thường + nút hành động |

### 2.7 `Toast`: thông báo thành công

| Field | Value |
|---|---|
| Component | Toast |
| Description | Dòng "Đã ..." ở đầu trang danh sách, tự ẩn sau 5 giây (Q4) |
| Category | feedback |

- Truyền lời báo qua `navigate(url, { state: { message } })` khi chuyển về trang danh sách.
- `role="status"`. Có dấu ✓ và chữ.
- Hẹn giờ 5 giây; khi rời trang thì hủy hẹn giờ.
- Theo WCAG 2.2.1 (giới hạn thời gian), thông báo chỉ để báo tin, không cần thao tác, nên tự ẩn vẫn đạt. Nội dung đã được đọc ngay khi hiện.

## 3. Giao tiếp với API (phía giao diện)

| Thao tác | API | Thành công | Lỗi xử lý ở giao diện |
|---|---|---|---|
| Danh sách phòng ban | `GET /api/departments` | 200, mảng | Mạng lỗi → StatusMessage error |
| Một phòng ban | `GET /api/departments/{id}` | 200 | 404 → not-found |
| Thêm / sửa phòng ban | `POST` / `PUT` | 201 / 200 | 400 → lỗi theo ô; 409 → "Tên phòng ban đã tồn tại"; 404 (PUT) → khung tóm tắt |
| Xóa phòng ban | `DELETE /api/departments/{id}` | 204 | 409 → alert "còn nhân viên"; 404 → tải lại |
| Danh sách / tìm nhân viên | `GET /api/employees[?search=]` | 200, mảng có `departmentName` | Mạng lỗi → error |
| Một nhân viên | `GET /api/employees/{id}` | 200 | 404 → not-found |
| Thêm / sửa nhân viên | `POST` / `PUT` | 201 / 200 | 400 → lỗi theo ô (gồm `departmentId`); 409 → "Email đã được sử dụng" |
| Xóa nhân viên | `DELETE /api/employees/{id}` | 204 | 404 → tải lại |

Mọi lời gọi API đi qua một module chung (ví dụ `src/api/client.js`). Module này:
- Đọc body ProblemDetails (`title`, `detail`, `errors`) và chuyển thành lời báo tiếng Việt.
- Hiểu lỗi mạng (fetch bị từ chối) là "Không kết nối được máy chủ".
