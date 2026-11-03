# Hướng dẫn kiểm tích hợp: cả luồng React → API → PostgreSQL

> **Nguồn:** `unit-test-instructions.md` mục kiểm tay của U1–U5, `code-summary.md` của U3, U4 (lời báo thật trên giao diện), `code-generation-plan.md` của U3, U4 (Step 6: các lời gọi API), danh sách F/V/A/D/R trong `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md`, hợp đồng C2/C3 (`inception/contract-design/contract-summary.md`).
>
> Test Strategy `Standard`: kiểm các ranh giới chính giữa các Unit. Theo `team.md`, không có test tự động cho controller, migration và React; các ranh giới này được kiểm bằng tay hoặc bằng lệnh gọi HTTP.

## 1. Chuẩn bị

1. PostgreSQL đang chạy (dịch vụ `postgresql-x64-18`), đã `dotnet ef database update` (README mục 5).
2. Backend: `dotnet run --project backend/EmployeeCrud.Api --launch-profile http` (cổng 5081).
3. Frontend: `npm --prefix frontend run dev` (cổng 5173). Mở **đúng** `http://localhost:5173`, không dùng `127.0.0.1` (CORS chỉ cho phép đúng origin này).
4. Dữ liệu: 4 phòng ban mẫu. Dữ liệu thử dùng tên giả (`... Thử`, email `@example.com`), thử xong thì xóa.

## 2. Thứ tự kiểm (từ dưới lên)

Kiểm database → API → giao diện → cả luồng. Lỗi ở tầng dưới thì dừng sửa trước, vì tầng trên chỉ phản ánh lại lỗi đó (cách khoanh vùng lỗi ở `07-kiem-thu-va-demo.md` mục 2).

## 3. Phân công (Hiệp chọn "Kết hợp")

| Ai | Làm gì | Vì sao |
|---|---|---|
| AI | Lệnh build/test, gọi API bằng lệnh (`HttpClient`), các ca biên trên giao diện bằng Playwright | Nhanh, lặp lại được, có số liệu |
| Hiệp | Luồng chính trên trình duyệt (F, V), pgAdmin (D), Lighthouse | Tự tay làm luồng sẽ trình bày trong demo 15 phút; pgAdmin và Lighthouse cần thao tác của người |

## 4. Các ranh giới giữa Unit cần kiểm

| ID | Ranh giới | Cách kiểm | Kỳ vọng |
|---|---|---|---|
| IB1 | Phong bì lỗi U1 (C3) ↔ cách đọc lỗi của U2 (`client.ts` `readProblem`) | Gọi API lỗi 400 (kiểm DTO), 404, 409, xem `Content-Type` và body | Cả ba đều `application/problem+json`, có `type`, `title` tiếng Việt; 400 và 409 có `errors` theo khóa camelCase |
| IB2 | CORS U1 ↔ origin của U2 | Gọi từ `Origin: http://localhost:5173` và từ origin lạ, cả với phản hồi lỗi | Origin 5173 có `Access-Control-Allow-Origin`; origin lạ không có |
| IB3 | `EmployeeService` (U4) ↔ `DepartmentService.ExistsAsync` (U3) | `POST /api/employees` với `departmentId` không tồn tại | 400, `errors.departmentId` "Phòng ban không tồn tại" |
| IB4 | Xóa phòng ban (U3) ↔ khóa ngoại `fk_employees_department` (U4) | `DELETE /api/departments/{id}` khi phòng ban còn nhân viên; trên giao diện bấm Xóa ở trang Phòng ban | 409 "Không thể xóa phòng ban "<tên>" vì vẫn còn nhân viên."; dòng vẫn còn, lời báo `role="alert"` |
| IB5 | Ô chọn phòng ban (U4 form) ↔ `GET /api/departments` (U3) | Mở form thêm nhân viên | Đủ phòng ban, đúng thứ tự tên |

## 5. Danh sách kiểm cả luồng

Kết quả mong đợi lấy theo **thiết kế đã duyệt**. Cột "Khác với 07" ghi chỗ tài liệu tự học `07-kiem-thu-va-demo.md` (viết trước khi thiết kế) mong đợi khác, để Hiệp giải thích được khi demo.

### 5.1 Database (Hiệp, pgAdmin)

| ID | Thao tác | Kỳ vọng | Khác với 07 |
|---|---|---|---|
| D01 | `DELETE FROM departments WHERE id = <phòng còn nhân viên>;` | Bị từ chối, SQLSTATE **23001** (`ON DELETE RESTRICT`), không xóa | 07 không ghi mã; tài liệu thiết kế cũ ghi 23503 |
| D02 | Chèn email trùng khác hoa thường | 23505 `ux_employees_email` | — |
| D03 | So cấu trúc với `docs/so-do-database.md` | Khớp 2 bảng, 6 cột, 6 ràng buộc | 07 so với `04-postgresql.md` mục 9 |

D01–D03 đã làm thật ở U5 Step 4 (03/11/2026); chỉ làm lại nếu migration đổi.

### 5.2 API (AI, lệnh gọi HTTP)

| ID | Lời gọi | Kỳ vọng (C2/C3) | Khác với 07 |
|---|---|---|---|
| A01 | `POST /api/employees` thiếu `email` | 400 `application/problem+json`, `errors.email` | 07 ghi khóa `Email`; thiết kế dùng camelCase |
| A02 | `POST` với `departmentId: 999` | **400** `errors.departmentId` "Phòng ban không tồn tại" | 07 ghi 409 |
| A03–A05 | `GET`/`PUT`/`DELETE /api/employees/999` | 404 "Không tìm thấy nhân viên có mã 999." (`PUT` cần body đủ trường) | — |
| A06 | `POST` hợp lệ | 201, `Location`, body có `id`, `departmentName` | — |
| A07 | `PUT` hợp lệ | **200** kèm body nhân viên đã sửa | 07 ghi 204 không body |
| A08 | `POST /api/departments` tên rỗng | 400 `application/problem+json` có `type` | — |
| A09 | `GET /api/khong-ton-tai` ×10 | 404 problem+json; trung vị < 20 ms | — |
| A10 | `departmentId: "abc"` | 400, không 500 | — |

### 5.3 Giao diện, luồng chính (Hiệp, trình duyệt)

| ID | Thao tác | Kỳ vọng | Khác với 07 |
|---|---|---|---|
| F01 | Mở `/employees` | "Đang tải..." rồi bảng kèm tên phòng ban | — |
| F02 | Chưa có nhân viên | "Chưa có nhân viên nào." + nút "Thêm nhân viên" | 07 ghi "Chưa có nhân viên." |
| F03–F05 | Tìm một phần họ tên; "AN" và "an"; một phần email | Đúng người; không phân biệt hoa thường; địa chỉ có `?search=` | — |
| F06 | Tìm "zzz" | "Không tìm thấy nhân viên phù hợp với "zzz"." + "Xóa tìm kiếm" | 07 ghi "Chưa có nhân viên." |
| F07 | Thêm hợp lệ | "Đã thêm nhân viên ..."; có trong danh sách; pgAdmin thấy dòng mới | — |
| F08 | Ô Phòng ban | Đủ phòng ban từ API | — |
| F09 | Sửa, lưu | "Đã cập nhật ..."; danh sách và DB đổi | — |
| F10 | Đang ở form sửa người A, đổi địa chỉ sang sửa người B | Form nạp đúng người B | 07 tả form chung một trang; thiết kế dùng trang form riêng |
| F11 | Ở form, bấm Hủy | Về danh sách, không đổi dữ liệu | 07 ghi "về chế độ thêm mới" |
| F12 | Xóa, xác nhận OK | Dòng biến mất không cần F5, có lời báo, focus về tiêu đề | — |
| F13 | Xóa, chọn Hủy | Không xóa | — |
| F14 | Tắt backend, chạy lại, tải lại | Dữ liệu vẫn còn | — |

### 5.4 Kiểm dữ liệu và báo lỗi (Hiệp, trình duyệt)

| ID | Thao tác | Kỳ vọng | Khác với 07 |
|---|---|---|---|
| V01 | Bỏ trống họ tên, bấm Lưu | Lỗi cạnh ô, khung tóm tắt nhận focus; Network **không** có POST | — |
| V02 | Email "abc" | "Email không đúng định dạng" | 07 ghi "Email không hợp lệ" |
| V03 | Không chọn phòng ban | "Vui lòng chọn phòng ban" | — |
| V04–V05 | Email đã có (cùng / khác hoa thường) | 409, "Email đã được sử dụng" cạnh ô Email | — |
| V06 | Bấm đúp Lưu | Chỉ một POST | — |
| V07 | Tắt backend rồi tải lại | "Không kết nối được máy chủ, vui lòng thử lại" + "Thử lại" | — |

### 5.5 Ca biên (AI, Playwright trên `npm run dev`)

| ID | Thao tác | Kỳ vọng |
|---|---|---|
| E1 | Phản hồi API chậm hơn 10 giây (chặn route trong Playwright) | Sau 10 giây hiện "Không kết nối được máy chủ, vui lòng thử lại" (U2 NFR5.3) |
| E2 | Console trong suốt luồng | 0 lỗi, 0 cảnh báo (U2 NFR8.4) |
| E3 | Xóa phòng ban còn nhân viên trên trang Phòng ban | Lời báo `role="alert"` có tên phòng ban, dòng còn (IB4) |

### 5.6 Người khác chạy được (đã làm ở U5)

| ID | Kỳ vọng | Bằng chứng |
|---|---|---|
| R01 | Clone mới, làm đúng README chạy được cả hai phần | U5 Step 11 (03/11/2026), README sửa ở `b78a4eb` |
| R02 | Repo không có `bin/`, `obj/`, `node_modules/`, mật khẩu | `.gitignore`; quét mật khẩu 0 dòng; Hiệp kiểm lại trên GitHub sau khi đẩy |

## 6. Hiệu năng và độ truy cập (Hiệp, Chrome DevTools)

- Lighthouse trên `npm --prefix frontend run preview` (cổng 5173): Performance ≥ 90 ở `/employees`, `/departments`; Accessibility = 100 và Best Practices ≥ 90 ở 6 trang (2 danh sách, 2 form thêm, 404, một form sửa).
- W3C Validator: dán HTML đã render của một trang danh sách và một trang form; không còn lỗi.

## 7. Ghi kết quả

Mỗi ID ghi Đạt / Không đạt kèm bằng chứng (ảnh chụp, đầu ra lệnh) vào `test-results.md`. Kiểm ở Playwright là kiểm trong trình duyệt thật (Chromium); kiểm bằng lệnh HTTP là bằng chứng tích hợp, không phải bằng chứng trình duyệt.
