# Bản phác thảo giao diện (Refined Mockups)

> **Nguồn:**
> - `user-stories/stories.md` (US1.1–US5.3)
> - `requirements-analysis/requirements.md` (FR1–FR7)
> - `refined-mockups-questions.md` (Q1–Q9)
>
> Kế hoạch classic không có bước phác thảo thô. Chưa có wireframe hay user flow từ trước, nên các màn hình dưới đây được vẽ thẳng từ story.
>
> **Mức hoàn thiện:** vừa phải. Bản vẽ ASCII dùng chữ thật bằng tiếng Việt và ghi đủ năm trạng thái: trống, đang tải, có dữ liệu, lỗi, biên. Màu, cỡ chữ và khoảng cách nằm trong `design-system-mapping.md`. Hành vi chi tiết nằm trong `interaction-spec.md`.
>
> **Phần Hiệp yêu cầu thêm ở Q6–Q9** (vượt `docs/ke-hoach.md`):
> - Đạt đủ WCAG 2.1 AA.
> - Lighthouse: Accessibility 100, Performance ≥ 90, Best Practices ≥ 90.
> - HTML đúng chuẩn.
> - Giao diện thống nhất.
>
> Các phần này được ghi nguồn "[Q6–Q9 Hiệp]" và cần đưa vào yêu cầu phi chức năng ở bước sau (xem `accessibility-checklist.md`).

## 1. Sơ đồ trang (đường dẫn)

| Đường dẫn | Trang | Story |
|---|---|---|
| `/` | Tự chuyển tới `/employees` | US4.3 |
| `/employees` | Danh sách nhân viên + ô tìm kiếm | US2.1, US2.4, US3.1 |
| `/employees/new` | Form thêm nhân viên | US2.2 |
| `/employees/:id/edit` | Form sửa nhân viên | US2.3 |
| `/departments` | Danh sách phòng ban | US1.1, US1.4 |
| `/departments/new` | Form thêm phòng ban | US1.2 |
| `/departments/:id/edit` | Form sửa phòng ban | US1.3 |
| Đường dẫn khác | Trang "Không tìm thấy trang" kèm liên kết về Nhân viên | US4.3 [assumption: tránh màn hình trắng khi gõ sai địa chỉ] |

Chuyển trang dùng React Router, không tải lại cả trang (Q8).

## 2. Khung chung (mọi trang)

```
+--------------------------------------------------------------------------+
| [Bỏ qua, tới nội dung chính]  (chỉ hiện khi bấm Tab)                       |
+--------------------------------------------------------------------------+
| <header>  Quản lý nhân sự                                                  |
| <nav>     [ Nhân viên ]  [ Phòng ban ]      <- mục đang mở được gạch dưới |
+--------------------------------------------------------------------------+
| <main>                                                                     |
|   [Dòng thông báo thành công, nếu có]                                      |
|   <h1>Tiêu đề trang</h1>                                                   |
|   ... nội dung trang ...                                                   |
+--------------------------------------------------------------------------+
```

- Chiều rộng nội dung tối đa 1100px, căn giữa. Thiết kế cho màn hình từ 1024px (Q5).
- Mục menu đang mở có `aria-current="page"`, chữ đậm và gạch dưới. Không phân biệt chỉ bằng màu.
- Tiêu đề trình duyệt (`<title>`) đổi theo trang, ví dụ "Nhân viên – Quản lý nhân sự".

## 3. Trang Nhân viên (`/employees`)

### 3a. Có dữ liệu (US2.1)

```
+--------------------------------------------------------------------------+
| Nhân viên                                          [ + Thêm nhân viên ]   |
|                                                                            |
| Tìm theo họ tên hoặc email                                                 |
| [ an                                    ] [ Tìm ]                           |
|                                                                            |
| +----------------------+--------------------------+------------+---------+ |
| | Họ tên               | Email                    | Phòng ban  | Thao tác| |
| +----------------------+--------------------------+------------+---------+ |
| | Nguyễn Văn An        | an@congty.vn             | Kế toán    |[Sửa][Xóa]|
| | Trần Bình            | binh@congty.vn           | Nhân sự    |[Sửa][Xóa]|
| +----------------------+--------------------------+------------+---------+ |
| Đang hiện 2 nhân viên                                                      |
+--------------------------------------------------------------------------+
```

- Bảng `<table>` có `<caption>` ẩn khỏi mắt, chỉ trình đọc màn hình đọc: "Danh sách nhân viên". Tiêu đề cột dùng `<th scope="col">`.
- Nút "Sửa" là liên kết tới `/employees/:id/edit`. Nút "Xóa" là `<button>`. Mỗi nút có tên đầy đủ cho trình đọc màn hình, ví dụ `aria-label="Xóa nhân viên Nguyễn Văn An"`.
- Sắp xếp theo họ tên A→Z, do API trả về (FR2.1).
- Dòng "Đang hiện N nhân viên" nằm trong `aria-live="polite"` để trình đọc màn hình báo khi kết quả tìm kiếm đổi.

### 3b. Đang tải (US4.2)

```
| Nhân viên                                          [ + Thêm nhân viên ]   |
| Tìm theo họ tên hoặc email  [                    ] [ Tìm ]                 |
|                                                                            |
|   (biểu tượng xoay)  Đang tải...                                           |
```

`role="status"`. Bảng chưa hiện.

### 3c. Chưa có nhân viên (US2.1, AC2.1.2)

```
|   Chưa có nhân viên nào.                                                   |
|   [ + Thêm nhân viên ]                                                     |
```

### 3d. Tìm không ra (US3.1, AC3.1.4)

```
| Tìm theo họ tên hoặc email  [ zzz                ] [ Tìm ]                 |
|   Không tìm thấy nhân viên phù hợp với "zzz".   [ Xóa tìm kiếm ]           |
```

"Xóa tìm kiếm" xóa trắng ô tìm và tải lại toàn bộ danh sách.

### 3e. Lỗi kết nối (US4.2, AC4.2.2)

```
| (!) Không kết nối được máy chủ, vui lòng thử lại.     [ Thử lại ]          |
```

`role="alert"`, có biểu tượng (!) và chữ, không chỉ đổi màu. Không hiện "Chưa có nhân viên nào".

### 3f. Trường hợp biên

- **Họ tên hoặc email rất dài** (100 hoặc 254 ký tự): chữ tự xuống dòng trong ô (`overflow-wrap: anywhere`), không làm vỡ bảng.
- **Màn hình hẹp hơn 1024px:** bảng nằm trong khung tự cuộn ngang. Khung có `tabindex="0"` và nhãn để cuộn được bằng bàn phím.
- **Một nhân viên:** dòng đếm ghi "Đang hiện 1 nhân viên".

## 4. Form nhân viên (`/employees/new`, `/employees/:id/edit`)

### 4a. Thêm mới (US2.2)

```
+--------------------------------------------------------------------------+
| Thêm nhân viên                                                             |
|                                                                            |
| Họ tên *                                                                   |
| [                                        ]                                 |
|                                                                            |
| Email *                                                                    |
| [                                        ]                                 |
| Ví dụ: ten@congty.vn                                                       |
|                                                                            |
| Phòng ban *                                                                |
| [ -- Chọn phòng ban --                 v ]                                 |
|                                                                            |
| (* là ô bắt buộc)                                                          |
|                                                                            |
| [ Lưu ]   [ Hủy ]                                                          |
+--------------------------------------------------------------------------+
```

- Nhãn nằm trên ô, gắn với ô bằng `for`/`id`. Ô bắt buộc có `required` và `aria-required="true"`.
- Danh sách phòng ban lấy từ `GET /api/departments`. Lúc đang tải, ô chọn bị khóa và ghi "Đang tải phòng ban...". Nếu tải lỗi thì có dòng lỗi cạnh ô và nút "Thử lại".
- Trang sửa có tiêu đề "Sửa nhân viên" và điền sẵn dữ liệu hiện tại (AC2.3.1). Lúc đang tải dữ liệu, form hiện "Đang tải...". Nếu id không tồn tại thì hiện "Không tìm thấy nhân viên" kèm liên kết về danh sách (AC2.3.4).

### 4b. Lỗi nhập (US4.1, AC4.1.1)

```
| (!) Vui lòng sửa 2 lỗi bên dưới.        <- tóm tắt lỗi, nhận focus        |
|                                                                            |
| Họ tên *                                                                   |
| [                                        ]  <- viền đỏ dày + biểu tượng   |
| (!) Vui lòng nhập họ tên                                                   |
|                                                                            |
| Email *                                                                    |
| [ abc                                    ]                                 |
| (!) Email không đúng định dạng                                             |
```

- Kiểm khi rời ô (blur) và khi bấm Lưu. Khi bấm Lưu mà có lỗi:
  - Không gửi request nào đi.
  - Focus chuyển tới khung tóm tắt lỗi; mỗi lỗi trong khung là liên kết nhảy tới ô sai.
- Ô sai có `aria-invalid="true"` và `aria-describedby` trỏ tới dòng lỗi. Dữ liệu đã gõ được giữ nguyên.
- Lỗi 400 hoặc 409 từ API ("Email đã được sử dụng") hiện đúng cạnh ô liên quan nếu API chỉ ra trường, nếu không thì hiện ở khung tóm tắt (AC4.1.3).

### 4c. Đang lưu (US4.4, Should)

```
| [ Đang lưu... ] (khóa)   [ Hủy ]                                            |
```

Nút Lưu bị khóa và đổi chữ cho tới khi API trả lời.

## 5. Trang Phòng ban (`/departments`)

```
+--------------------------------------------------------------------------+
| Phòng ban                                          [ + Thêm phòng ban ]   |
|                                                                            |
| +-----------------------------------------------+-------------------+     |
| | Tên phòng ban                                 | Thao tác          |     |
| +-----------------------------------------------+-------------------+     |
| | Kế toán                                       | [Sửa] [Xóa]       |     |
| | Kinh doanh                                    | [Sửa] [Xóa]       |     |
| | Kỹ thuật                                      | [Sửa] [Xóa]       |     |
| | Nhân sự                                       | [Sửa] [Xóa]       |     |
| +-----------------------------------------------+-------------------+     |
| Có 4 phòng ban                                                             |
+--------------------------------------------------------------------------+
```

- Các trạng thái đang tải, trống ("Chưa có phòng ban nào." + nút thêm) và lỗi kết nối giống trang Nhân viên (US1.1).
- Không có ô tìm kiếm, vì đề chỉ yêu cầu tìm nhân viên.

## 6. Form phòng ban (`/departments/new`, `/departments/:id/edit`)

```
| Thêm phòng ban                                                             |
|                                                                            |
| Tên phòng ban *                                                            |
| [                                        ]                                 |
| Tối đa 100 ký tự                                                           |
|                                                                            |
| [ Lưu ]   [ Hủy ]                                                          |
```

Lỗi hiện như mục 4b: "Vui lòng nhập tên phòng ban", "Tên phòng ban tối đa 100 ký tự", "Tên phòng ban đã tồn tại" (US1.2, US1.3).

## 7. Xác nhận xóa (US1.4, US2.4, Q2)

Dùng hộp hỏi sẵn có của trình duyệt (`window.confirm`):

```
+----------------------------------------------+
|  Xóa phòng ban "Kế toán"?                    |
|  Thao tác này không hoàn tác được.            |
|                          [ OK ]  [ Hủy ]      |
+----------------------------------------------+
```

- Nhân viên: `Xóa nhân viên "Nguyễn Văn An"? Thao tác này không hoàn tác được.`
- Hộp này của trình duyệt, nên dùng được bằng bàn phím (Enter/Esc) và trình đọc màn hình đọc được. Không phải làm thêm gì.
- Bấm OK: nút Xóa của dòng đó bị khóa trong lúc chờ API (US4.4).
- Xóa thành công: dòng biến mất và hiện thông báo "Đã xóa ...".
- Bị từ chối 409 (phòng ban còn nhân viên): hiện dòng lỗi `role="alert"` ở đầu trang: "Không thể xóa phòng ban "Kế toán" vì vẫn còn nhân viên." (AC1.4.3).

## 8. Thông báo thành công (US4.5, Q4)

```
| [✓] Đã thêm nhân viên "Nguyễn Văn An".                                    |
```

- Nằm ở đầu nội dung trang danh sách, nền xanh nhạt, có dấu ✓ và chữ.
- Tự ẩn sau 5 giây. Đặt trong `role="status"` (`aria-live="polite"`) để trình đọc màn hình đọc.
- Câu chữ theo từng việc: Đã thêm / Đã cập nhật / Đã xóa + loại + tên.

## 9. Liên hệ giữa story và màn hình

| Story | Màn hình hoặc trạng thái |
|---|---|
| US1.1 | Mục 5, các trạng thái giống 3b, 3c, 3e |
| US1.2, US1.3 | Mục 6, lỗi như 4b |
| US1.4 | Mục 7 |
| US1.5 | Mục 5 (bốn phòng ban mẫu) |
| US2.1 | 3a, 3b, 3c, 3e, 3f |
| US2.2, US2.3 | Mục 4 |
| US2.4 | Mục 7 |
| US3.1 | 3a (ô tìm), 3d |
| US4.1 | 4b |
| US4.2 | 3b, 3e, 4a (đang tải phòng ban) |
| US4.3 | Mục 1, mục 2 |
| US4.4 | 4c, mục 7 |
| US4.5 | Mục 8 |
| US4.6 | 4a, 4b; chi tiết trong `accessibility-checklist.md` |
| US5.1–US5.3 | Không có màn hình riêng (README, Postman, pgAdmin) |
