# 07. Kiểm thử cả luồng và chuẩn bị demo 15 phút

> Ứng với **Ngày 9–10: "Kiểm thử, sửa lỗi, viết hướng dẫn và demo"** và mục **5. Kết quả bàn giao** trong kế hoạch.
> Yêu cầu hoàn thành của kế hoạch: *chạy được toàn bộ luồng từ React đến PostgreSQL; CRUD và tìm kiếm hoạt động; có kiểm tra dữ liệu và thông báo lỗi cơ bản; giải thích được luồng xử lý tổng thể.*

## 1. Nói đơn giản

Kiểm thử giống **chạy thử xe trước khi giao cho khách**: không chỉ xem máy có nổ không, mà còn thử phanh gấp, đi đường xấu, hết xăng. Với phần mềm, ngoài trường hợp **nhập đúng** còn phải thử **nhập sai, dữ liệu trùng, mất kết nối**, vì người dùng thật sẽ gặp đủ cả.

## 2. Thứ tự kiểm và cách khoanh vùng lỗi

Kiểm **từ dưới lên**, giống thứ tự làm. Tầng dưới đúng rồi mới kiểm tầng trên, khi có lỗi sẽ biết ngay lỗi ở đâu:

```
1. PostgreSQL : bảng, ràng buộc đúng chưa?          → xem bằng pgAdmin
2. API        : từng API trả đúng mã và JSON chưa?   → Postman
3. Giao diện  : màn hình hiển thị, báo lỗi đúng chưa? → trình duyệt
4. Cả luồng   : thao tác trên giao diện → dữ liệu trong DB đổi đúng chưa?
```

Khi một chức năng lỗi, dò theo đúng thứ tự dữ liệu chạy (xem [00-tong-quan-luong.md](00-tong-quan-luong.md)):

| Xem ở đâu | Công cụ | Trả lời câu hỏi |
|---|---|---|
| Trình duyệt | **F12 → tab Console** | Có lỗi JavaScript hay lỗi CORS không? |
| Trình duyệt | **F12 → tab Network**, bấm vào request | Request có gửi đi không? Gửi URL, method, body gì? Nhận mã nào, JSON gì? |
| Backend | Cửa sổ terminal đang chạy `dotnet run` | Có lỗi (exception) nào in ra không? |
| Database | pgAdmin → Query Tool: `SELECT * FROM employees;` | Dữ liệu có thật sự được lưu, sửa, xóa không? |

Ví dụ khoanh vùng: Network thấy `POST` trả `201` mà danh sách không có người mới, vậy lỗi nằm ở **React** (chưa tải lại danh sách), không phải backend.

## 3. Danh sách kiểm thử cả luồng

Mỗi dòng ghi lại kết quả: **Đạt / Không đạt**, kèm ghi chú nếu không đạt. Những lỗi gặp và cách sửa là chất liệu cho phần "vấn đề đã gặp" khi demo.

### 3.1 Chức năng chính (qua giao diện)

| Mã | Tình huống | Cách làm | Kết quả mong đợi |
|---|---|---|---|
| F01 | Xem danh sách | Mở trang | Hiện "Đang tải..." rồi ra bảng nhân viên kèm tên phòng ban |
| F02 | Danh sách rỗng | Database chưa có nhân viên | Hiện "Chưa có nhân viên.", không lỗi |
| F03 | Tìm có kết quả | Gõ một phần họ tên, bấm Tìm | Chỉ hiện người khớp |
| F04 | Tìm không phân biệt hoa thường | Gõ "AN" và "an" | Ra cùng kết quả |
| F05 | Tìm theo email | Gõ một phần email | Ra người có email khớp |
| F06 | Tìm không có kết quả | Gõ "zzz" | Hiện "Chưa có nhân viên." |
| F07 | Thêm hợp lệ | Nhập đủ, chọn phòng ban, bấm Thêm | Báo "Đã thêm"; người mới hiện trong danh sách; pgAdmin thấy dòng mới |
| F08 | Dropdown phòng ban | Mở dropdown | Có đủ phòng ban từ `GET /api/departments` |
| F09 | Sửa | Bấm Sửa ở một dòng, đổi tên, bấm Cập nhật | Báo "Đã cập nhật"; danh sách và DB đổi theo |
| F10 | Đổi người đang sửa | Bấm Sửa người A, rồi bấm Sửa người B | Form hiện dữ liệu của B (kiểm cái `key` của form) |
| F11 | Hủy sửa | Bấm Sửa, rồi bấm Hủy | Form về chế độ thêm mới, không đổi dữ liệu |
| F12 | Xóa | Bấm Xóa, xác nhận | Báo "Đã xóa"; dòng biến mất; DB không còn dòng đó |
| F13 | Hủy xóa | Bấm Xóa, chọn Cancel | Không có gì bị xóa |
| F14 | Dữ liệu còn sau khi tắt máy chủ | Tắt `dotnet run`, chạy lại, tải lại trang | Dữ liệu vẫn còn, vì đã lưu trong PostgreSQL |

### 3.2 Kiểm tra dữ liệu và báo lỗi

| Mã | Tình huống | Cách làm | Kết quả mong đợi |
|---|---|---|---|
| V01 | Bỏ trống họ tên | Để trống, bấm Thêm | Báo lỗi ngay ở form; **không** gửi request (Network không có POST) |
| V02 | Email sai định dạng | Gõ "abc" | Báo "Email không hợp lệ" |
| V03 | Chưa chọn phòng ban | Không chọn | Báo "Vui lòng chọn phòng ban" |
| V04 | Email trùng | Thêm người có email đã tồn tại | Backend trả **409**; form hiện "Email đã được sử dụng" |
| V05 | Email trùng khác hoa thường | Đã có `an@x.com`, thêm `AN@x.com` | Vẫn báo trùng (409) |
| V06 | Bấm Thêm 2 lần liên tiếp | Bấm nhanh 2 lần | Chỉ tạo **một** nhân viên, vì nút bị khóa khi đang lưu |
| V07 | Máy chủ tắt | Tắt backend, bấm Thêm hoặc tải danh sách | Hiện "Không kết nối được máy chủ" / "Không tải được", trang không trắng |

### 3.3 Kiểm thẳng API bằng Postman (bỏ qua kiểm tra của giao diện)

Phần này chứng minh backend **tự bảo vệ**, không phụ thuộc giao diện.

| Mã | Request | Kết quả mong đợi |
|---|---|---|
| A01 | `POST /api/employees` thiếu `email` | **400**, `errors.Email` có thông báo |
| A02 | `POST` với `departmentId: 999` | **409**, "Phòng ban không tồn tại" |
| A03 | `GET /api/employees/999` | **404** |
| A04 | `PUT /api/employees/999` | **404** |
| A05 | `DELETE /api/employees/999` | **404** |
| A06 | `POST` hợp lệ | **201**, có header `Location`, body có `id` mới |
| A07 | `PUT` hợp lệ | **204**, không có body |

### 3.4 Kiểm ở database (pgAdmin)

| Mã | Câu lệnh | Kết quả mong đợi |
|---|---|---|
| D01 | `DELETE FROM departments WHERE id = 1;` khi phòng 1 còn nhân viên | Báo lỗi khóa ngoại, không xóa được (`ON DELETE RESTRICT`) |
| D02 | `INSERT` hai nhân viên cùng email | Lần hai báo lỗi vi phạm unique |
| D03 | So sánh cấu trúc bảng với sơ đồ ở [04-postgresql.md](04-postgresql.md) mục 9 | Khớp tên bảng, cột, khóa |

D01–D02 kiểm các ràng buộc mà migration đã tạo, nên chạy trên `employee_db`. Để không làm bẩn dữ liệu demo, bọc trong transaction và luôn kết thúc bằng `ROLLBACK`:

```sql
BEGIN;
DELETE FROM departments WHERE id = 1;   -- mong đợi: lỗi khóa ngoại
ROLLBACK;                               -- hủy mọi thay đổi trong transaction, dù lệnh trên có lỗi hay không
```

### 3.5 Kiểm "người khác chạy được" (README)

| Mã | Cách làm | Kết quả mong đợi |
|---|---|---|
| R01 | `git clone` repo vào một thư mục mới, làm **đúng từng bước** trong README | Chạy được cả backend lẫn frontend, không phải "tự biết" thêm bước nào |
| R02 | Kiểm repo trên GitHub | Không có `bin/`, `obj/`, `node_modules/`, mật khẩu DB |

## 4. Chuẩn bị demo 15 phút

Kế hoạch yêu cầu demo *"trình bày chức năng, luồng xử lý và những vấn đề đã gặp"*. Một bố cục gợi ý:

| Thời gian | Nội dung | Chuẩn bị gì |
|---|---|---|
| 1 phút | Mục tiêu và phạm vi: làm gì, chưa làm gì (không Redux, không CI/CD...) | 2–3 câu |
| 3 phút | **Luồng xử lý**: một thao tác "Thêm nhân viên" đi qua React → API JSON → ASP.NET Core → PostgreSQL | Sơ đồ ở [00-tong-quan-luong.md](00-tong-quan-luong.md) mục 2 |
| 5 phút | **Chạy thử trực tiếp**: danh sách → tìm kiếm → thêm (cố ý nhập sai để thấy báo lỗi) → sửa → xóa | Mở sẵn F12 tab Network để chỉ request/response JSON; mở sẵn pgAdmin để chỉ dòng dữ liệu đổi thật |
| 3 phút | **Code chính**: 1 controller, 1 service, 1 component, file migration, sơ đồ DB, danh sách API | Mở sẵn các file trong VS Code |
| 2 phút | **Vấn đề đã gặp** và cách giải quyết | Lấy từ ghi chú kiểm thử ở mục 3 |
| 1 phút | Hỏi đáp, hướng tiếp theo | |

**Trước buổi demo:**
- Chạy thử toàn bộ một lần ngay trước giờ demo, theo đúng thứ tự sẽ trình bày.
- Có sẵn dữ liệu mẫu: vài phòng ban, 5–10 nhân viên, có người trùng một phần tên để demo tìm kiếm.
- Có **phương án dự phòng**: ảnh chụp hoặc video quay sẵn, phòng khi máy hay mạng gặp sự cố.
- Tắt thông báo, đóng tab không liên quan, phóng to chữ trong VS Code và trình duyệt cho người xem dễ đọc.

**Câu hỏi có thể bị hỏi.** Tự trả lời trước được thì mới phản biện được:
1. Vì sao không cho React nối thẳng PostgreSQL?
2. Vì sao kiểm dữ liệu ở cả React lẫn backend?
3. Email trùng trả mã gì, vì sao không trả 500?
4. Hai người cùng thêm một email cùng lúc thì chuyện gì xảy ra? Cái gì chặn lại?
5. DTO để làm gì? Trả thẳng entity thì sao?
6. Migration là gì? Người mới clone code về làm sao có database?
7. CORS là gì? Vì sao Postman không bị lỗi CORS mà trình duyệt bị?
8. Vì sao chọn công cụ tạo dự án React này mà không chọn cái khác?
9. Index giúp gì? Bảng này có index nào?
10. Nếu làm tiếp, bạn sẽ cải thiện gì? (Ví dụ: phân trang, xử lý `DbUpdateException`, kiểm thử tự động.)

## 5. Câu hỏi tự kiểm

1. Vì sao kiểm thử từ dưới lên: DB → API → giao diện?
2. Một chức năng lỗi, bạn dò theo những chỗ nào, theo thứ tự nào?
3. Vì sao cần kiểm thẳng API bằng Postman dù giao diện đã kiểm dữ liệu?
4. Làm sao chứng minh trong demo rằng dữ liệu thật sự đi tới PostgreSQL?
