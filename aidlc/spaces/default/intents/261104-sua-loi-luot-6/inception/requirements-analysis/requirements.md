# Yêu cầu: sửa lỗi lượt 6 và các mục rà soát theo `docs/ke-hoach.md`

## Phân tích ý định

Hiệp muốn bài bàn giao không còn lỗi đã biết, tài liệu và comment nói đúng với code, và Hiệp tự giải thích được mọi thứ trước anh Hiếu. Nguồn gồm phiếu lượt 6 (`test-results.md` lượt 6 §5), yêu cầu rà soát của Hiệp (tin nhắn f8315080), bản quét `aidlc/spaces/default/codekb/employee-crud/` (`business-overview.md`, `architecture.md`, `code-structure.md`, `code-quality-assessment.md`) và 5 câu trả lời trong `requirements-analysis-questions.md`.

Hiệp chốt bám đề: sửa thứ sai và lỗi kỹ thuật, không thêm tính năng, không đổi luật nghiệp vụ (Q1 A, Q5 A). Cụm "chuẩn đúng nghiệp vụ các cty đang dùng" ở Q2 là mức chất lượng cho các nhóm đã chọn, không phải mở rộng phạm vi.

Loại việc: sửa lỗi, tài liệu và dọn code. Phạm vi: nhiều tầng nhưng mỗi thay đổi nhỏ.

Kết quả chạy thật ngày 04/11/2026 trên commit `6768935`, trước khi sửa:

| Kiểm tra | Kết quả |
|---|---|
| `npm --prefix frontend run verify` | Đạt, 138/138 test |
| `dotnet format backend/EmployeeCrud.slnx --verify-no-changes` | Không đạt: 8 lỗi ở 6 file (5 `FINALNEWLINE`, 3 `WHITESPACE` ở `DepartmentService.cs` dòng 22–24). `BE-2` trong bản quét đoán 8 file là chưa đúng |
| `GET /api/employees?search=` với 10 loại chuỗi | Chỉ U+FFFE ra 500 |
| Trình duyệt | Thêm, tìm, sửa, xóa đạt; U+FFFE, id `{id}e0`, Hủy khi đang lưu đều tái hiện lỗi |

## Yêu cầu chức năng

### FR1. Chặn ký tự noncharacter (BE-1, FE-1, Q3 A)

Noncharacter là nhóm 66 mã Unicode dành riêng cho nội bộ phần mềm: U+FDD0–U+FDEF và hai mã cuối của mỗi trong 17 mặt phẳng Unicode (U+FFFE, U+FFFF, U+1FFFE, U+1FFFF, ... U+10FFFE, U+10FFFF).

- **FR1.1** API từ chối noncharacter ở tên phòng ban, họ tên, email bằng 400 ProblemDetails, không ra 500.
  - Given một body có U+FFFE trong họ tên, When gọi `POST /api/employees`, Then trả 400 và không tạo bản ghi.
  - Given một tên phòng có U+FDD0, When gọi `POST /api/departments` hoặc `PUT`, Then trả 400.
  - Given chuỗi hợp lệ có emoji hoặc chữ Việt, When gửi, Then xử lý như trước.
- **FR1.2** Ô tìm kiếm có noncharacter trả 200 `[]`, đúng luật hiện có của chuỗi tìm không hợp lệ.
  - Given `?search=a%EF%BF%BEb`, When gọi API, Then trả 200 `[]`.
- **FR1.3** Form React dùng cùng luật: báo lỗi cạnh ô và không gửi request.
  - Given họ tên có U+FFFE, When bấm Lưu, Then hiện lỗi và không có `POST`.
- **FR1.4** Có test hồi quy cho từng đường vào: tên phòng, họ tên, email, tìm kiếm, gồm mã đầu nhóm, cuối nhóm và mã ở mặt phẳng phụ.

### FR2. Định dạng C# (BE-2)

- **FR2.1** Sửa 8 lỗi theo `.editorconfig` hiện tại. Given code đã sửa, When chạy `dotnet format backend/EmployeeCrud.slnx --verify-no-changes`, Then mã thoát 0.
- **FR2.2** `npm run verify` chạy thêm lệnh trên, và README mục 10 mô tả đúng. Given một file C# sai định dạng, When chạy `verify`, Then lệnh thất bại.

### FR3. Khóa lối thoát khi form đang lưu (FE-2, Q4 A)

- **FR3.1** Nút Hủy ở form nhân viên và form phòng ban bị khóa khi đang lưu. Given đang chờ API, When bấm Hủy, Then không rời form.
- **FR3.2** Breadcrumb trong hai form bị khóa khi đang lưu. Given đang chờ API, When bấm breadcrumb, Then không rời form.
- **FR3.3** Nếu người dùng đã rời form bằng lối khác (menu, nút Back của trình duyệt), lưu xong không tự chuyển trang. Given đang lưu và người dùng đã sang trang khác, When API trả về, Then người dùng vẫn ở trang đang xem.
- **FR3.4** Giữ được thao tác bàn phím và trạng thái khóa đọc được bằng trình đọc màn hình, theo mẫu `aria-disabled` đang có. Given đang lưu, When Tab tới Hủy rồi Enter, Then không rời form.

### FR4. Id lạ trên địa chỉ (FE-3, FE-4)

- **FR4.1** Trang sửa nhân viên và phòng ban chỉ nhận id toàn chữ số. Given `/employees/2127e0/edit` hoặc `/departments/0x10/edit`, When mở, Then hiện lời báo không tìm thấy như id không tồn tại, không mở form của bản ghi khác.
- **FR4.2** Có một hàm kiểm id dùng chung cho mọi nơi đang tự viết regex. Giới hạn số chữ số khớp với API. Given `/employees/12/edit`, When mở, Then form hoạt động như cũ.

### FR5. Tài liệu lệch trong phiếu (DOC-1 đến DOC-5, DB-2)

- **FR5.1** `EmployeeCrud.Api.http`: ví dụ "ra 409" chạy ra đúng 409 hoặc đổi nhãn đúng 404; số thứ tự thao tác khớp `docs/danh-sach-api.md`.
- **FR5.2** `docs/danh-sach-api.md`: bỏ mâu thuẫn dòng 14 và 176; dòng 131 mô tả đúng hành vi nút xóa; ghi luật noncharacter của FR1.
- **FR5.3** `docs/so-do-database.md`: dòng 48 nói đúng email được chuẩn hóa; dòng 53 nói đúng phạm vi bảo vệ của database; nhắc `docs/du-lieu-mau.sql`.
- Tiêu chí chung: Given từng dòng đã sửa, When đối chiếu với code hoặc chạy thử, Then khớp.

### FR6. Tài liệu và comment sai ngoài phiếu (Q2 A)

- **FR6.1** Sửa 4 dòng mong đợi sai trong `07-kiem-thu-va-demo.md` (`DOC-6`). Given danh sách đã sửa, When chạy A01, A02, A07, V02, Then kết quả khớp.
- **FR6.2** Các bản nháp `00`–`05` có ghi chú nêu rõ khác bài thật và trỏ tới tài liệu đúng, hoặc được sửa cho khớp (`DOC-7`). Mỗi mục lệch trong `DOC-7` có cách xử lý đọc được.
- **FR6.3** Thống nhất xưng hô trong tài liệu, bỏ câu đối thoại (`DOC-8`). Grep không còn các câu đã liệt kê.
- **FR6.4** Sửa 4 comment lệch code (`BE-4`). Mỗi comment đối chiếu đúng với dòng code nó nói tới.

### FR7. Dọn code, không đổi hành vi (Q2 B)

- **FR7.1** Đưa câu "Giá trị không đúng kiểu dữ liệu" về `ErrorTitles` (`BE-5`). Response giữ nguyên câu chữ.
- **FR7.2** Bỏ CSS không dùng và đưa màu viết thẳng về `tokens.css` (`FE-10`). Giao diện không đổi.
- **FR7.3** Bỏ thư mục rỗng `backend/EmployeeCrud.Api/Controllers/` (`BE-10`). Build vẫn qua.

### FR8. Lỗi giao diện nhỏ (Q2 C)

- **FR8.1** Vòng chữ cái đầu không vỡ khi họ tên bắt đầu bằng emoji (`FE-7`). Given họ tên "😀 An", When xem danh sách, Then hiện đủ ký tự.
- **FR8.2** Chuỗi tìm đọc từ địa chỉ được chuẩn hóa như khi gõ (`FE-8`). Given `?search=a%20%20b`, When mở trang, Then ô tìm và API dùng cùng chuỗi `a b`.
- **FR8.3** Lỗi xóa ở trang chi tiết phòng ban trả focus đúng sau khi hộp thoại đóng (`FE-9`). Given xóa lỗi, When hộp thoại đóng, Then focus nằm ở phần tử dự kiến.

### FR9. Bổ sung test (Q2 D)

- **FR9.1** Có test biên email đúng 254 ký tự nhận và 255 ký tự từ chối.
- **FR9.2** Test hủy request ở `LoggingTests.cs` chờ theo điều kiện, không dựa vào hẹn giờ cố định (`BE-8`).

## Yêu cầu phi chức năng

- **NFR1 (Hồi quy):** toàn bộ 138 test hiện có vẫn đạt, cộng các test mới. Sau khi sửa, `npm --prefix frontend run verify` mã thoát 0.
- **NFR2 (Độ phủ):** các lớp service giữ ít nhất 80% số dòng, đo bằng Microsoft Code Coverage vì coverlet bị Smart App Control chặn trên máy này.
- **NFR3 (Không đổi hành vi API):** ngoài FR1, mã trạng thái và JSON của 10 thao tác API giữ nguyên.
- **NFR4 (Dễ giải thích):** comment mới bằng tiếng Việt, nói "vì sao", không chứa mã hồ sơ nội bộ.
- **NFR5 (Bảo mật):** không thêm bí mật vào Git; không có lỗ hổng mới ở gói chạy thật do việc này, vì không thêm gói nào.

## Ràng buộc

- Không thêm tính năng, không đổi luật nghiệp vụ, trừ luật ký tự của FR1 do Hiệp chọn.
- AI không commit, không push; Hiệp tự làm. Không thêm gói, không cài ra ngoài dự án.
- Không có test tự động cho React theo `team.md`, nên FR3, FR4, FR8 kiểm bằng trình duyệt thật.
- Giữ cấu hình `insert_final_newline = false`: phiếu ghi "sửa theo .editorconfig".

## Giả định

- Chặn cả nhóm noncharacter không ảnh hưởng dữ liệu đang có. Lý do: lượt 6 ghi dữ liệu không hỏng. Code Generation cần kiểm bằng truy vấn trên 83 nhân viên và 9 phòng ban trước khi sửa.
- Nguồn chính thức của định nghĩa noncharacter (Unicode FAQ) chưa tra được ở lượt này vì công cụ tìm bị từ chối; con số 66 mã dựa trên kiến thức chung và phải kiểm lại khi viết test.

## Ngoài phạm vi

Không làm trong việc này, ghi lại làm danh sách "em đề xuất":

| Mục | Vì sao công ty thường có | Nguồn |
|---|---|---|
| Đăng nhập, phân quyền | Mọi yêu cầu phải được quyết định cho phép hay từ chối, mặc định từ chối. `project.md` cấm trong bài này | [OWASP Authorization](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html) |
| Nhật ký thao tác nhạy cảm | Biết ai đã làm gì khi có sự cố | [OWASP Business Logic Security](https://cheatsheetseries.owasp.org/cheatsheets/Business_Logic_Security_Cheat_Sheet.html) |
| Chống ghi đè khi hai người cùng sửa | Người lưu sau không âm thầm đè người trước, dùng concurrency token | [EF Core Concurrency](https://learn.microsoft.com/en-us/ef/core/saving/concurrency) |
| Phân trang (`DB-3`) | Bảng lớn không tải hết một lần | [EF Core Pagination](https://learn.microsoft.com/en-us/ef/core/querying/pagination) |
| Xóa mềm | Giữ lịch sử thay vì xóa hẳn | [EF Core Global Query Filters](https://learn.microsoft.com/en-us/ef/core/querying/filters) |
| Collation tiếng Việt (`DB-1`) | Sắp xếp và so sánh chữ không phụ thuộc máy | [PostgreSQL Collation](https://www.postgresql.org/docs/current/collation.html) |
| `CHECK` trong database (`DB-2`), siết định dạng email (Q1 A) | Thêm lớp bảo vệ dữ liệu | Thông lệ chung, chưa tra nguồn riêng |

Cũng không làm, theo Q5 A: `BE-3`, `FE-5`, `FE-6`. Không chọn hoặc chỉ là thông tin: `BE-6`, `BE-7`, `BE-9`, `DB-4`, `DOC-9`, `FE-11`.

## Câu hỏi còn mở

- Đổi hẳn công cụ đo độ phủ từ coverlet sang Microsoft Code Coverage trong README và `package.json` hay không. Hiệp chưa quyết, việc này không chặn các FR trên.
- Demo 15 phút do Hiệp tập, nằm ngoài code.
