# User Stories

> Nguồn:
> - `requirements-analysis/requirements.md` (FR1–FR7, NFR1–NFR8)
> - `personas.md` (P1, P2)
> - `user-stories-questions.md` (Q1–Q4)
> - Thứ tự làm theo `practices-discovery/team-practices.md`: phòng ban trước, nhân viên sau.
>
> Ưu tiên theo MoSCoW. Phần đề bài yêu cầu là **Must**. Ba phần em thêm ngoài đề (FR4.6, FR5.3, FR5.4) là **Should** (Q4). Tiêu chí chấp nhận viết theo Given/When/Then.

## Tổng quan

| ID | Story | Persona | Ưu tiên | Yêu cầu | Phụ thuộc |
|---|---|---|---|---|---|
| US1.1 | Xem danh sách phòng ban | P1 | Must | FR1.1 | — |
| US1.2 | Thêm phòng ban | P1 | Must | FR1.2, FR1.5 | US1.1 |
| US1.3 | Sửa tên phòng ban | P1 | Must | FR1.3, FR1.5 | US1.1 |
| US1.4 | Xóa phòng ban | P1 | Must | FR1.4, FR1.6 | US1.1 |
| US1.5 | Có sẵn phòng ban mẫu khi mới cài | P1 | Must | FR1.7 | — |
| US2.1 | Xem danh sách nhân viên kèm phòng ban | P1 | Must | FR2.1, FR6.3 | US1.5 |
| US2.2 | Thêm nhân viên vào một phòng ban | P1 | Must | FR2.2, FR2.5, FR2.6 | US2.1 |
| US2.3 | Sửa thông tin nhân viên | P1 | Must | FR2.3, FR2.5, FR2.6 | US2.1 |
| US2.4 | Xóa nhân viên | P1 | Must | FR2.4 | US2.1 |
| US3.1 | Tìm nhân viên theo họ tên hoặc email | P1 | Must | FR3.1, FR3.2 | US2.1 |
| US4.1 | Thấy lỗi nhập rõ ràng mà không mất dữ liệu đã gõ | P1 | Must | FR4.1, FR4.2 | — |
| US4.2 | Biết ứng dụng đang tải, bị lỗi hay chưa có dữ liệu | P1 | Must | FR4.5 | — |
| US4.3 | Chuyển giữa hai trang bằng menu, chữ tiếng Việt | P1 | Must | FR5.1, FR5.2 | — |
| US4.4 | Không tạo bản ghi trùng khi lỡ bấm hai lần | P1 | Should | FR4.6 | US1.2, US2.2 |
| US4.5 | Biết đã lưu thành công, hủy được khi đổi ý | P1 | Should | FR5.3 | US1.2, US2.2 |
| US4.6 | Ô nhập có nhãn, lỗi luôn có chữ | P1 | Should | FR5.4 | US4.1 |
| US5.1 | Cài và chạy ứng dụng chỉ bằng README | P2 | Must | FR7.1, FR7.4, NFR1, NFR2 | — |
| US5.2 | Kiểm từng API bằng Postman theo danh sách API | P2 | Must | FR6.1, FR6.2, FR6.4, FR7.3, FR4.3, FR4.4 | US5.1 |
| US5.3 | Đối chiếu sơ đồ database với database thật | P2 | Must | FR7.2, NFR3 | US5.1 |

Tổng: 19 story, gồm 16 Must và 3 Should.

---

## Nhóm 1. Phòng ban

### US1.1. Xem danh sách phòng ban (Must)

**Là** người quản lý nhân sự, **tôi muốn** xem tất cả phòng ban theo thứ tự tên, **để** biết công ty đang có những phòng nào.

- **AC1.1.1**
  - Given database có "Nhân sự" và "Kế toán"
  - When tôi mở trang Phòng ban
  - Then tôi thấy hai dòng theo thứ tự "Kế toán", "Nhân sự".
- **AC1.1.2**
  - Given không có phòng ban nào
  - When tôi mở trang Phòng ban
  - Then tôi thấy "Chưa có phòng ban nào" và nút "Thêm phòng ban".
- **AC1.1.3**
  - Given API trả lỗi hoặc không kết nối được
  - When tôi mở trang Phòng ban
  - Then tôi thấy thông báo lỗi kết nối, không thấy "Chưa có phòng ban nào".

*INVEST:* chỉ đọc dữ liệu, kiểm riêng được, không phụ thuộc story nào khác.

### US1.2. Thêm phòng ban (Must)

**Là** người quản lý nhân sự, **tôi muốn** thêm một phòng ban mới bằng cách nhập tên, **để** có phòng ban đó mà xếp nhân viên vào.

- **AC1.2.1**
  - Given tôi ở form thêm phòng ban
  - When nhập "Kỹ thuật" và bấm Lưu
  - Then tôi quay về danh sách và thấy "Kỹ thuật".
- **AC1.2.2**
  - Given ô tên trống hoặc chỉ có khoảng trắng
  - When bấm Lưu
  - Then form báo "Vui lòng nhập tên phòng ban" cạnh ô, và không có request nào gửi đi.
- **AC1.2.3**
  - Given đã có "Kế toán"
  - When tôi thêm "kế toán"
  - Then form hiện "Tên phòng ban đã tồn tại" (API trả 409) và không có phòng ban mới.
- **AC1.2.4**
  - Given tên dài 101 ký tự
  - When bấm Lưu
  - Then form báo tên quá dài (tối đa 100 ký tự).

*INVEST:* một form, một luật không trùng tên.

### US1.3. Sửa tên phòng ban (Must)

**Là** người quản lý nhân sự, **tôi muốn** đổi tên một phòng ban, **để** sửa tên gõ sai hoặc tên đổi theo công ty.

- **AC1.3.1**
  - Given có "Kỹ thuật"
  - When tôi mở form sửa
  - Then ô tên đã điền sẵn "Kỹ thuật".
  - When tôi đổi thành "Kỹ thuật phần mềm" và Lưu
  - Then danh sách hiện tên mới.
- **AC1.3.2**
  - Given có "Kế toán" và "Nhân sự"
  - When tôi đổi "Nhân sự" thành "KẾ TOÁN"
  - Then form hiện "Tên phòng ban đã tồn tại" (409).
- **AC1.3.3**
  - Given tôi sửa "Kế toán" mà giữ nguyên tên, hoặc chỉ đổi hoa thường thành "kế toán"
  - When bấm Lưu
  - Then lưu thành công, không báo trùng với chính nó.
- **AC1.3.4**
  - Given phòng ban đã bị xóa ở nơi khác hoặc id không tồn tại
  - When lưu
  - Then hiện thông báo không tìm thấy phòng ban (API trả 404).

### US1.4. Xóa phòng ban (Must)

**Là** người quản lý nhân sự, **tôi muốn** xóa một phòng ban không còn dùng, **để** danh sách gọn và đúng thực tế.

- **AC1.4.1**
  - Given "Kinh doanh" không có nhân viên
  - When tôi bấm Xóa
  - Then hiện hộp hỏi có ghi "Kinh doanh".
  - When tôi xác nhận
  - Then phòng ban biến mất khỏi danh sách và khỏi database.
- **AC1.4.2**
  - Given hộp xác nhận đang mở
  - When tôi bấm Hủy
  - Then không có gì bị xóa.
- **AC1.4.3**
  - Given "Kế toán" còn ít nhất một nhân viên
  - When tôi xác nhận xóa
  - Then hiện "Không thể xóa phòng ban vì vẫn còn nhân viên" (409) và phòng ban vẫn còn.

### US1.5. Có sẵn phòng ban mẫu khi mới cài (Must)

**Là** người quản lý nhân sự, **tôi muốn** ứng dụng mới cài đã có sẵn vài phòng ban, **để** thêm nhân viên được ngay mà không phải tạo phòng ban trước.

- **AC1.5.1**
  - Given database trống
  - When chạy migration (`dotnet ef database update`)
  - Then bảng phòng ban có 4 phòng: "Nhân sự", "Kế toán", "Kỹ thuật", "Kinh doanh". Tên mẫu là giả định trong `requirements.md` mục 6, Hiệp có thể đổi.
- **AC1.5.2**
  - Given vừa chạy migration
  - Then bảng nhân viên trống (không có nhân viên mẫu, theo Q7 của Requirements Analysis).

---

## Nhóm 2. Nhân viên

### US2.1. Xem danh sách nhân viên kèm phòng ban (Must)

**Là** người quản lý nhân sự, **tôi muốn** xem mọi nhân viên kèm tên phòng ban của họ, **để** biết ai làm ở đâu.

- **AC2.1.1**
  - Given có "Trần B" (Kế toán) và "Nguyễn A" (Nhân sự)
  - When tôi mở trang Nhân viên
  - Then tôi thấy hai dòng theo thứ tự họ tên, có các cột Họ tên, Email, Phòng ban.
- **AC2.1.2**
  - Given chưa có nhân viên
  - When mở trang
  - Then thấy "Chưa có nhân viên nào" và nút "Thêm nhân viên".
- **AC2.1.3**
  - Given gọi `GET /api/employees`
  - Then mỗi phần tử có `id`, `fullName`, `email`, `departmentId`, `departmentName`.

### US2.2. Thêm nhân viên vào một phòng ban (Must)

**Là** người quản lý nhân sự, **tôi muốn** thêm nhân viên với họ tên, email và chọn phòng ban từ danh sách, **để** ghi nhận người mới vào đúng phòng.

- **AC2.2.1**
  - Given form thêm nhân viên
  - When nhập "Nguyễn Văn A", "a@congty.vn", chọn "Kế toán" rồi Lưu
  - Then nhân viên mới xuất hiện trong danh sách với phòng "Kế toán".
- **AC2.2.2**
  - Given form thêm
  - Then ô Phòng ban là danh sách thả xuống, chứa đúng các phòng ban đang có.
- **AC2.2.3**
  - Given chưa chọn phòng ban, hoặc họ tên trống, hoặc email sai định dạng
  - When bấm Lưu
  - Then mỗi ô sai có lời báo tiếng Việt và không có request nào gửi đi.
- **AC2.2.4**
  - Given đã có email "a@congty.vn"
  - When thêm người khác với "A@CongTy.vn"
  - Then form hiện "Email đã được sử dụng" (409).
- **AC2.2.5**
  - Given gọi thẳng API với `departmentId` không tồn tại
  - Then API trả 400 kèm lỗi cho trường `departmentId`.

### US2.3. Sửa thông tin nhân viên (Must)

**Là** người quản lý nhân sự, **tôi muốn** sửa họ tên, email hoặc chuyển phòng ban của nhân viên, **để** dữ liệu luôn đúng khi có thay đổi.

- **AC2.3.1**
  - Given nhân viên "Nguyễn Văn A" ở "Kế toán"
  - When mở form sửa
  - Then các ô đã điền sẵn dữ liệu hiện tại.
  - When đổi sang "Kỹ thuật" rồi Lưu
  - Then danh sách hiện phòng "Kỹ thuật".
- **AC2.3.2**
  - Given sửa chính nhân viên đó mà giữ nguyên email
  - When Lưu
  - Then lưu thành công, không báo trùng.
- **AC2.3.3**
  - Given đổi email thành email của một nhân viên khác (khác hoa thường)
  - When Lưu
  - Then báo "Email đã được sử dụng" (409).
- **AC2.3.4**
  - Given id không tồn tại
  - When gọi API lấy hoặc sửa
  - Then API trả 404 và giao diện báo không tìm thấy nhân viên.

### US2.4. Xóa nhân viên (Must)

**Là** người quản lý nhân sự, **tôi muốn** xóa nhân viên đã nghỉ, **để** danh sách chỉ còn người đang làm.

- **AC2.4.1**
  - Given "Nguyễn Văn A"
  - When bấm Xóa
  - Then hộp hỏi có ghi "Nguyễn Văn A".
  - When xác nhận
  - Then nhân viên biến mất khỏi danh sách và khỏi database.
- **AC2.4.2**
  - Given hộp xác nhận đang mở
  - When bấm Hủy
  - Then không có gì bị xóa.
- **AC2.4.3**
  - Given nhân viên đã bị xóa trước đó
  - When gọi `DELETE` lần nữa
  - Then API trả 404.

---

## Nhóm 3. Tìm kiếm

### US3.1. Tìm nhân viên theo họ tên hoặc email (Must)

**Là** người quản lý nhân sự, **tôi muốn** gõ một phần tên hoặc email vào một ô tìm kiếm, **để** tìm nhanh một người trong danh sách dài.

- **AC3.1.1**
  - Given có "Nguyễn Văn An" (an@congty.vn) và "Trần Bình" (binh@congty.vn)
  - When tìm "AN"
  - Then chỉ ra "Nguyễn Văn An".
- **AC3.1.2**
  - When tìm "congty"
  - Then ra cả hai, vì chuỗi có trong email.
- **AC3.1.3**
  - When tìm "  bình  " (có khoảng trắng hai đầu)
  - Then ra "Trần Bình".
- **AC3.1.4**
  - When tìm "zzz"
  - Then thấy "Không tìm thấy nhân viên phù hợp".
  - When xóa trắng ô tìm kiếm
  - Then thấy lại toàn bộ danh sách.
- **AC3.1.5**
  - When tìm "binh" (không dấu)
  - Then không ra "Trần Bình", vì tìm kiếm phân biệt dấu (giả định trong `requirements.md` mục 6).

---

## Nhóm 4. Báo lỗi và giao diện chung

### US4.1. Thấy lỗi nhập rõ ràng mà không mất dữ liệu đã gõ (Must)

**Là** người quản lý nhân sự, **tôi muốn** biết chính xác ô nào sai và sửa thế nào, **để** không phải gõ lại từ đầu.

- **AC4.1.1**
  - Given email "abc" và họ tên trống
  - When bấm Lưu
  - Then hiện "Vui lòng nhập họ tên" và "Email không đúng định dạng" cạnh từng ô, chữ "abc" vẫn còn trong ô.
- **AC4.1.2**
  - Given gọi thẳng API bằng Postman với dữ liệu sai (ví dụ `fullName` dài 101 ký tự)
  - Then API vẫn chặn và trả 400 dạng ProblemDetails, trong `errors` có khóa của trường sai.
- **AC4.1.3**
  - Given API trả 400 hoặc 409
  - Then giao diện hiện lại lời báo tiếng Việt từ API, và dữ liệu trên form vẫn còn.

### US4.2. Biết ứng dụng đang tải, bị lỗi hay chưa có dữ liệu (Must)

**Là** người quản lý nhân sự, **tôi muốn** phân biệt được "đang tải", "bị lỗi" và "chưa có dữ liệu", **để** không tưởng nhầm dữ liệu đã mất.

- **AC4.2.1**
  - Given API trả lời chậm
  - When mở trang danh sách
  - Then thấy "Đang tải..." cho tới khi có dữ liệu.
- **AC4.2.2**
  - Given backend đang tắt
  - When mở trang hoặc bấm Lưu
  - Then thấy "Không kết nối được máy chủ, vui lòng thử lại".
- **AC4.2.3**
  - Given API trả danh sách rỗng
  - Then thấy thông báo trống (AC1.1.2, AC2.1.2), không phải thông báo lỗi.

### US4.3. Chuyển giữa hai trang bằng menu, chữ tiếng Việt (Must)

**Là** người quản lý nhân sự, **tôi muốn** chuyển qua lại giữa trang Nhân viên và trang Phòng ban bằng menu, mọi chữ đều tiếng Việt, **để** dùng dễ mà không cần biết tiếng Anh.

- **AC4.3.1**
  - When bấm "Phòng ban" trên menu
  - Then địa chỉ trang đổi và hiện danh sách phòng ban.
  - When bấm "Nhân viên"
  - Then quay lại danh sách nhân viên.
- **AC4.3.2**
  - When bấm "Thêm nhân viên" hoặc "Sửa"
  - Then mở trang form riêng.
- **AC4.3.3**
  - Rà mọi trang, nút, nhãn, thông báo: không còn chữ tiếng Anh hiển thị cho người dùng, trừ dữ liệu như email.

### US4.4. Không tạo bản ghi trùng khi lỡ bấm hai lần (Should, ngoài đề)

**Là** người quản lý nhân sự, **tôi muốn** bấm Lưu hai lần liền không tạo ra hai bản ghi, **để** không phải đi xóa bản thừa.

- **AC4.4.1**
  - When bấm Lưu hai lần thật nhanh
  - Then chỉ một request được gửi và chỉ một bản ghi được tạo.
- **AC4.4.2**
  - Trong lúc chờ API trả lời, nút Lưu và nút xác nhận Xóa bị khóa. API trả lời xong thì mở lại.

### US4.5. Biết đã lưu thành công, hủy được khi đổi ý (Should, ngoài đề)

**Là** người quản lý nhân sự, **tôi muốn** thấy lời báo "đã lưu" và có nút Hủy trên form, **để** chắc thao tác đã xong, hoặc bỏ được khi đổi ý.

- **AC4.5.1**
  - Given vừa thêm thành công
  - Then tôi ở trang danh sách và thấy "Đã thêm nhân viên" (tương tự: đã sửa, đã xóa).
- **AC4.5.2**
  - Given đang ở form
  - When bấm Hủy
  - Then quay về danh sách và không có request ghi nào được gửi.

### US4.6. Ô nhập có nhãn, lỗi luôn có chữ (Should, ngoài đề)

**Là** người quản lý nhân sự, **tôi muốn** mỗi ô có nhãn rõ và lỗi được viết bằng chữ, **để** đọc hiểu ngay, không phải đoán theo màu.

- **AC4.6.1**
  - Bấm vào nhãn "Họ tên" thì con trỏ nhảy vào ô Họ tên.
- **AC4.6.2**
  - Ô bị lỗi luôn có dòng chữ giải thích, không chỉ có viền đỏ.

---

## Nhóm 5. Bàn giao

### US5.1. Cài và chạy ứng dụng chỉ bằng README (Must)

**Là** người cài đặt / người hướng dẫn, **tôi muốn** làm theo README từ một bản clone sạch là chạy được ứng dụng, **để** kiểm bài trên máy mình mà không phải hỏi thêm.

- **AC5.1.1**
  - Given máy đã cài đủ phần mềm với đúng phiên bản README ghi (.NET 10, Node 24, PostgreSQL 18)
  - When làm đúng từng bước README
  - Then migration tạo được database `employee_db`, backend chạy bằng `dotnet run`, frontend chạy bằng `npm run dev`.
- **AC5.1.2**
  - README chỉ cách đặt connection string bằng user-secrets. Không file nào trong Git chứa mật khẩu PostgreSQL.
- **AC5.1.3**
  - Given ứng dụng đang chạy
  - When làm theo các thao tác thêm/sửa/xóa/tìm
  - Then mọi thao tác đều chạy được trọn luồng từ React tới PostgreSQL.

### US5.2. Kiểm từng API bằng Postman theo danh sách API (Must)

**Là** người cài đặt / người hướng dẫn, **tôi muốn** có danh sách API kèm JSON mẫu và trang tài liệu OpenAPI, **để** gọi thử từng endpoint bằng Postman và đối chiếu kết quả.

- **AC5.2.1**
  - Danh sách API có đủ 10 thao tác (FR6.1). Mỗi thao tác có phương thức, đường dẫn, mô tả, ví dụ request JSON và response JSON.
- **AC5.2.2**
  - Gọi lần lượt từng endpoint với dữ liệu đúng: mã trạng thái là 200, 201 kèm `Location`, hoặc 204, đúng như danh sách ghi.
- **AC5.2.3**
  - Gọi với id không tồn tại thì nhận 404. Gọi gây trùng hoặc xóa phòng ban còn nhân viên thì nhận 409. Body có `Content-Type: application/problem+json` và lời báo tiếng Việt.
- **AC5.2.4**
  - Khi chạy ở môi trường Development, mở được trang tài liệu OpenAPI liệt kê đủ 10 thao tác.

### US5.3. Đối chiếu sơ đồ database với database thật (Must)

**Là** người cài đặt / người hướng dẫn, **tôi muốn** có sơ đồ database khớp với bảng thật trong PostgreSQL, **để** hiểu cấu trúc dữ liệu và kiểm ràng buộc.

- **AC5.3.1**
  - Sơ đồ có bảng `departments` và `employees`, đủ cột, khóa chính, khóa ngoại `employees.department_id` → `departments.id`, và ràng buộc không trùng email và tên phòng ban.
- **AC5.3.2**
  - Mở pgAdmin sau khi chạy migration: tên bảng, tên cột (`snake_case`) và ràng buộc khớp với sơ đồ.
- **AC5.3.3**
  - Given chèn bằng SQL tay một email trùng (khác hoa thường), hoặc xóa một phòng ban còn nhân viên
  - Then PostgreSQL báo lỗi ràng buộc.

---

## Ghi chú INVEST và phụ thuộc

- **Độc lập:** các story CRUD của cùng một thực thể chỉ cần danh sách (US1.1, US2.1) để có chỗ hiển thị kết quả. Thêm, sửa, xóa vẫn kiểm riêng được bằng API.
- **Nhân viên phụ thuộc phòng ban:** nhân viên phải chọn một phòng ban có sẵn. US1.5 (phòng ban mẫu) giúp nhóm 2 không phải chờ US1.2.
- **Nhỏ:** mỗi story là một màn hình hoặc một thao tác, kèm 2–5 tiêu chí.
- **Kiểm được:** mọi tiêu chí kiểm được bằng tay qua giao diện, Postman hoặc pgAdmin. Luật nghiệp vụ của nhóm 1–3 còn được kiểm bằng unit test cho service (`team-practices.md`, mục Testing Posture).
- **Ba story Should (US4.4–US4.6):** là phần thêm ngoài đề. Nếu bỏ cả ba, mọi story Must vẫn đạt.

## Yêu cầu phi chức năng không thành story riêng

| NFR | Xử lý ở đâu |
|---|---|
| NFR4: unit test service, độ phủ ≥ 80% | Bước Build and Test kiểm; Code Generation viết test |
| NFR5: phản hồi dưới 1 giây với ≤ 1.000 nhân viên | Bước Build and Test đo |
| NFR6: chia tầng Controller → Service → DTO, comment tiếng Việt | Bước Code Generation |
| NFR7: CORS chỉ cho phép frontend gọi | Bước Code Generation (điều kiện để US4.3 và nhóm 1–3 chạy được trên trình duyệt) |
| NFR8: `dotnet format` và `npm run lint` không lỗi | Bước Code Generation và Build and Test |
