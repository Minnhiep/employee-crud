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
| F01 | Xem danh sách | Mở trang | Hiện "Đang tải dữ liệu…" rồi ra bảng nhân viên kèm tên phòng ban |
| F02 | Danh sách rỗng | Database chưa có nhân viên | Hiện "Chưa có nhân viên nào", câu gợi ý và nút "Thêm nhân viên", không lỗi |
| F03 | Tìm có kết quả | Gõ một phần họ tên, bấm Tìm | Chỉ hiện người khớp, có dòng "Tìm thấy N nhân viên" |
| F04 | Tìm không phân biệt hoa thường | Gõ "AN" và "an" | Ra cùng kết quả |
| F05 | Tìm theo email | Gõ một phần email | Ra người có email khớp |
| F06 | Tìm không có kết quả | Gõ "zzz" | Hiện "Không tìm thấy nhân viên phù hợp", câu nêu chuỗi đã tìm và nút "Xóa bộ lọc" |
| F07 | Thêm hợp lệ | Bấm "Thêm nhân viên" ở đầu trang, nhập đủ, chọn phòng ban, bấm "Lưu nhân viên" | Về danh sách, báo `Đã thêm nhân viên "X"`; người mới hiện trong danh sách; pgAdmin thấy dòng mới |
| F08 | Dropdown phòng ban | Mở dropdown | Dòng đầu "Chọn phòng ban", sau đó đủ phòng ban từ `GET /api/departments` |
| F09 | Sửa | Bấm Sửa ở một dòng, đổi tên, bấm "Lưu nhân viên" | Về danh sách, báo `Đã cập nhật nhân viên "X"`; danh sách và DB đổi theo |
| F10 | Đổi người đang sửa | Mở trang sửa người A, rồi đổi số trên địa chỉ thành mã người B (`/employees/<mã B>/edit`) | Form hiện đúng dữ liệu của B, không còn dữ liệu của A |
| F11 | Hủy sửa | Từ danh sách đang tìm, bấm Sửa, đổi tên, bấm Hủy | Về danh sách, giữ chuỗi tìm và phòng đang lọc; dữ liệu không đổi |
| F12 | Xóa | Bấm Xóa, trong hộp "Xóa nhân viên?" bấm "Xóa nhân viên" | Báo `Đã xóa nhân viên "X"`; dòng biến mất; DB không còn dòng đó |
| F13 | Hủy xóa | Bấm Xóa, trong hộp bấm "Hủy" hoặc phím Esc | Hộp đóng, không có gì bị xóa |
| F14 | Dữ liệu còn sau khi tắt máy chủ | Tắt `dotnet run`, chạy lại, tải lại trang | Dữ liệu vẫn còn, vì đã lưu trong PostgreSQL |
| F15 | Hủy sửa phòng ban từ trang chi tiết | Mở chi tiết một phòng, bấm "Sửa phòng ban", bấm Hủy | Về lại đúng trang chi tiết đó |
| F16 | Lưu sửa phòng ban từ trang chi tiết | Mở chi tiết một phòng, bấm "Sửa phòng ban", đổi tên, bấm "Lưu phòng ban" | Về lại trang chi tiết, báo `Đã cập nhật phòng ban "X"`. Mở sửa từ danh sách hoặc gõ thẳng địa chỉ thì Lưu và Hủy về danh sách phòng ban |

### 3.2 Kiểm tra dữ liệu và báo lỗi

| Mã | Tình huống | Cách làm | Kết quả mong đợi |
|---|---|---|---|
| V01 | Bỏ trống họ tên | Để trống, bấm "Lưu nhân viên" | Khung "Chưa lưu được. Kiểm tra lại các trường sau:" và "Vui lòng nhập họ tên" dưới ô; **không** gửi request (Network không có POST) |
| V02 | Email sai định dạng | Gõ "abc" | Báo "Email không đúng định dạng" |
| V03 | Chưa chọn phòng ban | Không chọn | Báo "Vui lòng chọn phòng ban" |
| V04 | Email trùng | Thêm người có email đã tồn tại | Backend trả **409**; form hiện "Email đã được sử dụng" |
| V05 | Email trùng khác hoa thường | Đã có `an@x.com`, thêm `AN@x.com` | Vẫn báo trùng (409) |
| V06 | Bấm "Lưu nhân viên" 2 lần liên tiếp | Bấm nhanh 2 lần | Chỉ tạo **một** nhân viên, vì nút đổi thành "Đang lưu…" và bị khóa khi đang lưu |
| V07 | Máy chủ tắt | Thử ba cách: mở form rồi mới tắt backend, bấm "Lưu nhân viên"; tắt backend rồi mở form; tắt backend rồi mở danh sách | Lần lượt: khung "Chưa lưu được." kèm "Không kết nối được máy chủ, vui lòng thử lại"; "Không tải được danh sách phòng ban." và nút Lưu bị khóa; "Không tải được danh sách nhân viên" và nút "Thử lại". Trang không trắng |
| V08 | Phòng ban vừa bị xóa khi đang nhập | Mở form, chọn một phòng trống, xóa phòng đó ở tab khác, bấm "Lưu nhân viên" | Ô Phòng ban báo "Phòng ban không tồn tại", phòng đã xóa không còn trong danh sách và bị bỏ chọn; họ tên, email giữ nguyên; chọn phòng khác lưu được, không cần tải lại trang |
| V09 | Máy chủ trả lời quá 10 giây lúc ghi | F12 → Network, tạo mức giới hạn tốc độ có độ trễ trên 10 000 ms và chọn nó, rồi lưu hoặc xóa | Lưu: "Máy chủ phản hồi quá lâu, chưa rõ đã lưu hay chưa. Hãy kiểm tra lại danh sách trước khi thử lại." Xóa: cùng câu với "đã xóa". Nút bật lại sau khi báo. Lời gọi đọc quá giờ và mất mạng thật vẫn báo "Không kết nối được máy chủ, vui lòng thử lại" |
| V10 | Tải phòng ban lỗi khi đang lọc | Mở `/employees?departmentId=2&search=a`, để `GET /api/departments` lỗi | Ô lọc khóa, có nút "Thử lại" và "Bỏ lọc phòng ban". "Bỏ lọc phòng ban" giữ chuỗi tìm; "Thử lại" tải lại phòng ban khi API đã chạy lại |

### 3.3 Kiểm thẳng API bằng Postman (bỏ qua kiểm tra của giao diện)

Phần này chứng minh backend **tự bảo vệ**, không phụ thuộc giao diện.

| Mã | Request | Kết quả mong đợi |
|---|---|---|
| A01 | `POST /api/employees` thiếu `email` | **400**, `errors.email` là "Vui lòng nhập email" |
| A02 | `POST` với `departmentId: 999` | **400**, `errors.departmentId` là "Phòng ban không tồn tại" |
| A03 | `GET /api/employees/999` | **404** |
| A04 | `PUT /api/employees/999` | **404** |
| A05 | `DELETE /api/employees/999` | **404** |
| A06 | `POST` hợp lệ | **201**, có header `Location`, body có `id` mới |
| A07 | `PUT` hợp lệ | **200**, body là nhân viên sau khi sửa |

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
