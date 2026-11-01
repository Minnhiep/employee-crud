# Units Generation: câu hỏi về cách chia phần việc

**Unit** (phần việc) là một khối việc code làm trọn được và kiểm riêng được. Mỗi unit sẽ đi qua các bước thiết kế chi tiết và sinh code ở giai đoạn Construction. Bước này chỉ vẽ **unit nào phụ thuộc unit nào**. Làm unit nào trước để giao giá trị sớm thì bước Delivery Planning quyết.

Những gì đã chốt thì không hỏi lại:
- Backend chạy riêng (`dotnet run`), frontend chạy riêng (`npm run dev`).
- Bốn khối logic: Phòng ban, Nhân viên, Nền tảng chung, Giao diện web (`domain-design/components.md`).
- Thứ tự công việc: phòng ban trước, nhân viên sau.
- Không làm bộ khung chạy thử trước (walking skeleton).

---

## Q1. [Kiến trúc sư] Chia phần việc theo cách nào?

A. **Theo tính năng, cắt dọc**, 5 unit:
   - `u1-backend-platform`: dựng dự án ASP.NET Core, kết nối DB, chuyển lỗi, CORS, OpenAPI, project test.
   - `u2-web-shell`: dựng dự án React, khung trang, menu, module gọi API, bộ biến CSS, trang 404.
   - `u3-departments`: API, luật, test và các trang của **phòng ban**.
   - `u4-employees`: API, luật, tìm kiếm, test và các trang của **nhân viên**, cộng luật chặn xóa phòng ban còn nhân viên (cần bảng nhân viên mới làm được).
   - `u5-handover`: README, sơ đồ DB, danh sách API.

   Mỗi unit tính năng chạy được trọn từ màn hình tới database (Đề xuất)
B. **Theo tầng**, 5 unit: nền backend, API phòng ban, API nhân viên, toàn bộ giao diện, bàn giao. Làm xong hết backend rồi mới làm giao diện
C. **Thô**, 3 unit: toàn bộ backend, toàn bộ frontend, bàn giao. Ít unit nhưng mỗi unit rất lớn, khó duyệt từng phần
X. Other (please specify)

[Answer]: A

## Q2. [Kiến trúc sư] Các unit không phụ thuộc nhau có được làm song song không?

Ví dụ, nền backend (`u1`) và khung giao diện (`u2`) không cần nhau. Một người làm thì thực tế vẫn làm lần lượt; câu này chỉ quyết sơ đồ phụ thuộc có giữ đúng sự thật đó hay không.

A. Giữ đúng phụ thuộc thật: unit nào không cần nhau thì không nối. Bước Delivery Planning tự chọn thứ tự làm (Đề xuất)
B. Thêm phụ thuộc cho thành một hàng thẳng (u1 → u2 → u3 → u4 → u5), dù vài phụ thuộc không có thật
X. Other (please specify)

[Answer]: A

## Q3. [Kiến trúc sư] Tài liệu bàn giao (README, sơ đồ DB, danh sách API kèm JSON) làm khi nào?

A. Mỗi unit tự cập nhật phần tài liệu của mình, ví dụ `u3` thêm các API phòng ban vào danh sách API. Unit cuối `u5-handover` hoàn thiện README và kiểm toàn bộ tài liệu khớp với code. Tài liệu không bị lệch so với code (Đề xuất)
B. Chỉ unit cuối `u5-handover` viết toàn bộ tài liệu một lần
C. Không có unit bàn giao riêng; mỗi unit tự viết phần của mình là đủ
X. Other (please specify)

[Answer]: A
