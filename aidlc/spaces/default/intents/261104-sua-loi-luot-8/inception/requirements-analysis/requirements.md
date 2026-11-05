# Yêu cầu: sửa 9 nhóm phát hiện từ lượt rà 8

## Phân tích ý định

Hiệp muốn sửa hết các phát hiện của lượt rà 8 trước khi commit, để code gọn, tài liệu đúng, và tự trình bày được. Nguồn: mục "Lượt 8" trong `aidlc/spaces/default/intents/261104-sua-loi-luot-6/construction/build-and-test/test-results.md`, bản quét `aidlc/spaces/default/codekb/employee-crud/` (`business-overview.md`, `architecture.md`, `code-structure.md`, `code-quality-assessment.md`) và 6 câu trả lời trong `requirements-analysis-questions.md`.

Vẫn bám đề: không thêm tính năng lớn, không đổi luật nghiệp vụ, không commit, không push. Các đề xuất đăng nhập, phân trang, xóa mềm, chống ghi đè đồng thời vẫn ngoài phạm vi.

Hành vi của `BE-11`, `FE-14`, `FE-15`, `FE-16` mới suy từ đọc code, nên phải tái hiện trước khi sửa. `FE-12`, `FE-13` đã tái hiện ở lượt 8.

## Yêu cầu chức năng

### FR1. Làm sạch comment (DOC-9, Q4 A)

- **FR1.1** Comment trong `backend/EmployeeCrud.Api`, `backend/EmployeeCrud.Api.Tests`, `frontend/src` không còn mã nội bộ (`BR`, `NFR`, `ADR`, `AC`, `US`, `FR`, `N-`, `S-`, `A-`, `R-`, `U1`–`U5`, `C1`), tên tài liệu nội bộ, lịch sử sửa hay tên người.
  - Given grep theo các mẫu này, When rà kết quả, Then chỉ còn chỗ thuộc danh sách phải giữ: chuẩn công khai, `U+...`, regex, chữ trong SVG, và chữ tả hành vi lúc chạy.
- **FR1.2** Phần giải thích "vì sao" được giữ. Given một comment đã sửa, When đọc lại, Then vẫn nói được lý do như trước.
- **FR1.3** Chỉ đổi comment, không đổi logic. Given bước này xong, When chạy `npm --prefix frontend run verify`, Then mã thoát 0, số test không giảm.

### FR2. Danh sách kiểm tay theo giao diện thật (DOC-10)

- **FR2.1** Các mục F, V trong `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md` tả đúng nút, câu báo và luồng hiện tại. Given từng mục đã sửa, When làm theo trên trình duyệt thật, Then kết quả khớp.
- **FR2.2** F10 được viết lại vì không còn form chung trang: mở sửa người A rồi người B thì form hiện đúng dữ liệu người B.

### FR3. Trang sửa khi không có bản ghi (FE-12, FE-19, Q3 A)

- **FR3.1** Khi đã biết không tìm thấy hoặc tải lỗi, chỉ hiện đúng một trạng thái. Given `/employees/999999/edit` và phòng ban còn đang tải, When nhân viên trả 404, Then không hiện "Đang tải dữ liệu…" cùng lời báo.
- **FR3.2** Trang không tìm thấy dùng tiêu đề "Không tìm thấy nhân viên" hoặc "Không tìm thấy phòng ban", và không có câu "Trường có dấu * là bắt buộc.", ở cả hai form. Given `/departments/999999/edit`, When mở, Then đúng như trên.

### FR4. Quay về sau khi sửa phòng ban từ trang chi tiết (FE-13, Q1 A)

- **FR4.1** Mở sửa từ trang chi tiết, Hủy về lại trang chi tiết.
- **FR4.2** Mở sửa từ trang chi tiết, Lưu về lại trang chi tiết, có lời báo đã lưu.
- **FR4.3** Mở sửa từ danh sách hoặc gõ thẳng địa chỉ, Lưu và Hủy vẫn về danh sách như cũ. `returnTo` chỉ nhận đường dẫn `/departments/{id}` hợp lệ.

### FR5. PUT phòng ban khi phòng vừa bị xóa (BE-11)

- **FR5.1** Given phòng bị xóa sau khi service đã đọc, When PUT với tên không đổi, Then trả 404, không trả 200.
- **FR5.2** Có test hồi quy. Trường hợp thành công vẫn trả 200 với `employeeCount` đúng.

### FR6. Nạp lại phòng ban khi phòng không còn (FE-14)

- **FR6.1** Given lưu nhân viên trả lỗi `departmentId` "Phòng ban không tồn tại", When có phản hồi, Then danh sách phòng ban được nạp lại, họ tên và email giữ nguyên.
- **FR6.2** Phòng đã mất không còn được chọn; ô Phòng ban báo lỗi để người dùng chọn lại, không cần tải lại trang.
- **FR6.3** "Thử lại" nạp phòng ban ở chế độ sửa không làm form biến mất và không mất dữ liệu đã gõ.

### FR7. Báo đúng khi hết thời gian chờ lúc ghi (FE-15, Q2 A)

- **FR7.1** Given POST, PUT hoặc DELETE quá 10 giây, When hết giờ, Then báo "Máy chủ phản hồi quá lâu, chưa rõ đã lưu hay chưa. Hãy kiểm tra lại danh sách trước khi thử lại."
- **FR7.2** GET hết giờ và lỗi mất mạng thật vẫn báo như cũ.

### FR8. Bỏ lọc khi tải phòng ban lỗi (FE-16, Q5 A)

- **FR8.1** Given `?departmentId=` và tải phòng ban lỗi, When trang hiện, Then có nút "Thử lại" tải lại phòng ban.
- **FR8.2** Có nút "Xóa bộ lọc" bỏ lọc phòng ban và giữ nguyên chuỗi tìm.

### FR9. Việc nhỏ

- **FR9.1** `EmployeeCrud.Api.http`: nhãn thao tác 2 và 7 nói đúng lần đầu ra 201, gửi lại mới ra 409 (`DOC-11`).
- **FR9.2** `TextInput.cs` có dấu phẩy đúng (`DOC-12`).
- **FR9.3** Comment về email và tên ở `Employee.cs`, `EmployeeRequest.cs`, `DepartmentRequest.cs` nói đúng việc gộp khoảng trắng và NFC (`BE-13`).
- **FR9.4** `client.ts` bỏ nhánh `TimeoutError`, `ApiError.title`, `ApiError.detail`, `type`, `status` không dùng (`FE-17`, Q6 A), nếu việc bỏ không làm hỏng FR7.
- **FR9.5** Khóa `"name"`, `"email"` ở `ErrorMapper.cs` có một chỗ định nghĩa chung (`BE-12`). JSON lỗi không đổi.
- **FR9.6** Comment "Xóa tìm kiếm" khớp nút thật "Xóa bộ lọc" (`FE-18`).

## Yêu cầu phi chức năng

- **NFR1 (Hồi quy):** toàn bộ 146 test đạt cùng test mới; `npm --prefix frontend run verify` mã thoát 0.
- **NFR2 (Độ phủ):** lớp service giữ ít nhất 80% số dòng, đo bằng Microsoft Code Coverage.
- **NFR3 (Không đổi hành vi API):** ngoài FR5, mã trạng thái và JSON của API giữ nguyên.
- **NFR4 (Dễ giải thích):** comment mới bằng tiếng Việt, nói "vì sao". Phần tử giao diện mới theo mẫu `data-testid` có sẵn.
- **NFR5 (Bảo mật):** không thêm gói, không thêm bí mật.

## Ràng buộc

- AI không commit, không push; Hiệp tự làm.
- Không có test tự động cho React theo `team.md`: FR3, FR4, FR6, FR7, FR8 kiểm bằng Chromium thật.
- Công cụ sửa file đổi `\uXXXX` thành ký tự thật: không viết mã thoát kiểu đó qua công cụ sửa; quét lại noncharacter sau khi sửa.

## Giả định

- Phát hiện từ đọc code là đúng; nếu tái hiện không ra thì dừng báo Hiệp, không sửa.
- `ApiError.title`, `.detail` thật sự không nơi nào đọc; phải grep lại trước khi bỏ.

## Ngoài phạm vi

- Thêm vùng thông báo toàn cục cho lỗi lưu sau khi đã rời form.
- `BE-3`, `FE-5`, `FE-6`, tách hàm kiểm dữ liệu, hook tải dữ liệu chung, giới hạn kích thước body, tách script.
- `DOC-13`: gợi ý demo trong `07`, ngoài danh sách F, V.
- Đăng nhập, phân trang, nhật ký, xóa mềm, chống ghi đè, collation, `CHECK`, siết email.

## Câu hỏi còn mở

- Hiệp chưa quyết đổi hẳn công cụ đo độ phủ.
- Nguyên nhân `frontend/node_modules` bị hỏng ngày 04/11 chưa rõ.
