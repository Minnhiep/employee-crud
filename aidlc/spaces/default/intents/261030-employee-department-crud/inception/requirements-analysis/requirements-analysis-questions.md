# Requirements Analysis: câu hỏi làm rõ yêu cầu

Nguồn yêu cầu là `docs/ke-hoach.md`, mục 3 và 5, cùng các quyết định đã có trong `project.md`. Những gì đã quyết thì không hỏi lại: CRUD nhân viên và phòng ban; tìm theo họ tên và email không phân biệt hoa thường; mỗi nhân viên thuộc đúng một phòng ban, chọn từ danh sách; không xóa được phòng ban còn nhân viên; có phòng ban mẫu; kiểm tra dữ liệu ở cả form lẫn API; lỗi trả theo ProblemDetails.

Các câu dưới đây chỉ hỏi những chỗ đề bài chưa nói rõ. Theo luật "làm đúng và đủ theo docs/ke-hoach.md", mỗi câu có một lựa chọn tối thiểu, bám sát đề. Lựa chọn nào vượt ra ngoài đề đều được ghi rõ là "ngoài đề".

---

## Q1. [Quản lý sản phẩm] Một nhân viên gồm những thông tin gì?

Đề chỉ nói "nhân viên" và "tìm theo họ tên, email, chọn phòng ban", chưa nói đủ các trường. Câu này quyết định bảng `employees` trong database và các ô trên form.

A. Tối thiểu theo đề: họ tên, email, phòng ban (Đề xuất)
B. Thêm số điện thoại và chức vụ (ngoài đề, nhưng phổ biến)
C. Thêm số điện thoại, chức vụ và ngày vào làm (ngoài đề)
D. Thêm số điện thoại, chức vụ, ngày vào làm và lương (ngoài đề; lương là dữ liệu nhạy cảm)
X. Other (please specify)

[Answer]: A

## Q2. [Quản lý sản phẩm] Một phòng ban gồm những thông tin gì?

A. Chỉ tên phòng ban (Đề xuất, đơn giản nhất)
B. Tên và mô tả ngắn
C. Mã phòng ban (ví dụ `KT`) và tên
X. Other (please specify)

[Answer]: A

## Q3. [Quản lý sản phẩm] Tên phòng ban có được trùng nhau không?

Email nhân viên đã quyết là không được trùng (trả lỗi 409). Câu này hỏi luật tương tự cho tên phòng ban.

A. Không được trùng, so sánh không phân biệt hoa thường ("Kế toán" và "kế toán" coi là trùng), trùng thì báo lỗi 409 (Đề xuất)
B. Được trùng
X. Other (please specify)

[Answer]: A

## Q4. [Quản lý sản phẩm] Ô tìm kiếm nhân viên hoạt động thế nào?

A. Một ô tìm duy nhất: gõ một phần chữ, ra nhân viên có họ tên hoặc email chứa chữ đó, không phân biệt hoa thường (Đề xuất)
B. Hai ô riêng: một ô tìm theo họ tên, một ô tìm theo email
C. Như A, thêm lọc theo phòng ban (ngoài đề)
X. Other (please specify)

[Answer]: A

## Q5. [Quản lý sản phẩm] Danh sách có cần chia trang (phân trang) không?

Dữ liệu demo chỉ vài chục dòng. Phân trang giúp danh sách dài vẫn nhanh, nhưng thêm việc ở cả API lẫn giao diện.

A. Không phân trang, hiện hết. Ghi rõ đây là giả định cho dữ liệu nhỏ (Đề xuất, đề không yêu cầu)
B. Phân trang phía server, 10 dòng mỗi trang (ngoài đề)
X. Other (please specify)

[Answer]: A

## Q6. [Quản lý sản phẩm] Xóa nhân viên hoặc phòng ban thì xóa thế nào?

A. Hiện hộp hỏi xác nhận có ghi tên mục sắp xóa; đồng ý thì xóa hẳn khỏi database (Đề xuất)
B. Hỏi xác nhận, rồi chỉ đánh dấu "đã xóa" (xóa mềm), dữ liệu vẫn còn trong database (ngoài đề)
X. Other (please specify)

[Answer]: A

## Q7. [Quản lý sản phẩm] Có cần nhân viên mẫu để demo không?

Phòng ban mẫu đã quyết sẽ được tạo bằng migration.

A. Không. Chỉ có phòng ban mẫu; nhân viên do người dùng tự thêm khi demo (Đề xuất)
B. Có. Tạo thêm khoảng 5 nhân viên mẫu bằng migration để mở ra là có dữ liệu
X. Other (please specify)

[Answer]: A

## Q8. [Thiết kế giao diện] Giao diện chia màn hình thế nào?

A. Hai trang "Nhân viên" và "Phòng ban", chuyển bằng thanh menu (dùng React Router). Form thêm/sửa là một trang riêng (Đề xuất)
B. Hai trang như A, nhưng form thêm/sửa hiện ngay trên trang danh sách (hộp nổi hoặc khung bên cạnh)
C. Một trang duy nhất có hai tab, không dùng thư viện điều hướng
X. Other (please specify)

[Answer]: A
