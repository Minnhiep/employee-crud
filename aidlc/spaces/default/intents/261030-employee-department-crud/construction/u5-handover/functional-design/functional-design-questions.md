# Câu hỏi Functional Design — U5 `u5-handover`

> **Bối cảnh:** U5 chỉ làm tài liệu bàn giao (unit-of-work.md §U5; FR7.1–FR7.4; US5.1–US5.3). Repo hiện **chưa có** `README.md`, chưa có sơ đồ database và danh sách API. Nháp nằm rải ở code-summary của U1–U4. Các câu dưới đây chỉ hỏi những chỗ các bước trước chưa chốt.

## Q1. [Tài liệu] Đặt sơ đồ database và danh sách API ở đâu?

`docs/ke-hoach.md` mục 5 đòi ba thứ: sơ đồ database, danh sách API kèm JSON mẫu, README. Danh sách 10 API kèm JSON khá dài (ước khoảng 300–400 dòng).

A. Ba file riêng: `README.md` ở thư mục gốc, `docs/so-do-database.md`, `docs/danh-sach-api.md`. README có liên kết sang hai file kia. (Khuyên dùng: mỗi file ứng với đúng một mục trong kế hoạch, README ngắn và dễ làm theo.)
B. Gộp hết vào `README.md`.
C. Một thư mục riêng `docs/ban-giao/` chứa cả ba file (README gốc chỉ trỏ tới).
X. Other (please specify)

[Answer]: A

## Q2. [Tài liệu] README có thêm mục "Sự cố thường gặp" không?

FR7.4 chỉ đòi: phần mềm kèm phiên bản, user-secrets, migration, lệnh chạy, địa chỉ. Khi làm U1–U4 trên máy này đã gặp vài lỗi không phải do code: Windows Smart App Control chặn file vừa build; chứng chỉ HTTPS localhost chưa tin cậy; `psql` không có trong PATH. US5.1 muốn người cài "không phải hỏi thêm".

A. Có, một mục ngắn (3–5 dòng) cho các lỗi đã gặp thật, kèm cách xử lý. (Khuyên dùng: giúp người cài từ bản clone sạch, không thêm tính năng gì.)
B. Không, chỉ đúng các mục FR7.4 đòi.
X. Other (please specify)

[Answer]: A

## Q3. [Kiểm thử] Kiểm "làm theo README từ bản clone sạch là chạy được" bằng cách nào?

Lưu ý: clone trên cùng máy này thì user-secrets (lưu theo máy, không nằm trong repo) và database `employee_db` đã có sẵn, nên không "sạch" hoàn toàn.

A. Anh tự `git clone` repo sang một thư mục khác ngoài dự án (ví dụ Desktop), tự làm theo README từng bước; em hướng dẫn và ghi lại chỗ README chưa rõ để sửa. (Khuyên dùng: anh là người cài thật, đúng vai trong US5.1, và tự kiểm được README.)
B. Em clone vào một thư mục tạm trong dự án (thêm vào `.gitignore`), chạy các lệnh trong README thay anh.
C. Không clone; chỉ đối chiếu từng lệnh trong README với dự án hiện tại và chạy lại ngay tại đây.
X. Other (please specify)

[Answer]: A

## Q4. [Kiểm thử] Lấy JSON mẫu và kiểm danh sách API khớp với code bằng cách nào?

AC5.2.2–AC5.2.3 đòi gọi từng endpoint, đúng mã 200/201/204/400/404/409 như danh sách ghi.

A. Em gọi đủ 10 thao tác và các ca lỗi bằng lệnh (PowerShell `Invoke-WebRequest`) lúc backend đang chạy, chép JSON thật vào danh sách; sau đó anh kiểm lại bằng Postman vài endpoint anh chọn. (Khuyên dùng: JSON trong tài liệu là kết quả thật, anh vẫn tự kiểm bằng Postman.)
B. Anh tự gọi đủ bằng Postman và gửi kết quả cho em chép vào.
C. Như A, và em làm thêm file Postman collection để nhập vào Postman. (Phần thêm ngoài đề.)
X. Other (please specify)

[Answer]: A

## Q5. [Kế hoạch] Mấy chỗ sửa nhỏ còn mở từ U1–U4 thì làm ở đâu?

Còn ba việc: (1) comment trong `EmployeeService.UpdateAsync` và code-summary U4 §2 ghi "200" nhưng code thật trả 404; (2) `ErrorMapper` của U1 chưa nhận mã lỗi PostgreSQL 23001 (DepartmentService đã tự bắt nên chưa gây lỗi); (3) `source-manifest.json` của U4 còn 3 đường dẫn cũ. U5 được định nghĩa là "không viết code ứng dụng".

A. Để cả ba cho Build and Test (bước cuối, vốn sẽ đụng code và chạy lại test). U5 chỉ ghi đúng hành vi thật (404) trong danh sách API. (Khuyên dùng: giữ U5 đúng định nghĩa chỉ làm tài liệu.)
B. U5 sửa luôn (1) vì chỉ là chữ, không đổi hành vi; (2) và (3) để Build and Test.
C. U5 sửa cả ba.
X. Other (please specify)

[Answer]: A
