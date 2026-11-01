# User Stories: kế hoạch và câu hỏi

## Kế hoạch

- **Đầu vào:** `requirements-analysis/requirements.md`, gồm FR1–FR7 và NFR1–NFR8, đã được Hiệp duyệt.
- **Dạng story:** "Là [vai], tôi muốn [việc], để [lợi ích]". Mỗi story đạt tiêu chí INVEST: độc lập, bàn lại được, có giá trị, ước lượng được, nhỏ, kiểm thử được. Tiêu chí chấp nhận viết theo Given/When/Then.
- **Mã định danh:** story là `US{nhóm}.{số}`, tiêu chí là `AC{nhóm}.{số}.{số thứ tự}`.
- **Ưu tiên:** MoSCoW, gồm Must (phải có), Should (nên có), Could (có thì tốt), Won't (lần này không làm). Phạm vi bản đầu tiên (MVP) sẽ chốt ở bước Delivery Planning.
- **Yêu cầu phi chức năng (NFR):** phần lớn không thành story riêng. Chúng được gắn vào tiêu chí của story liên quan, hoặc ghi là để các bước sau xử lý.

---

## Q1. [Quản lý sản phẩm] Ứng dụng có những ai dùng (persona)?

Persona là chân dung một kiểu người dùng: họ là ai, muốn gì. Mỗi story phải gắn với một persona. Phần bàn giao (README, danh sách API, sơ đồ DB) phục vụ người cài đặt hoặc chấm bài, không phải người dùng giao diện.

A. Hai persona: "Người quản lý nhân sự" dùng giao diện để quản lý dữ liệu; "Người cài đặt / người hướng dẫn" (ví dụ anh Hiếu) đọc README, gọi API bằng Postman, xem sơ đồ DB (Đề xuất)
B. Một persona "Người quản lý nhân sự"; phần bàn giao FR7 ghi là việc kỹ thuật, không viết thành story
X. Other (please specify)

[Answer]: A

## Q2. [Quản lý sản phẩm] Chia story nhỏ tới mức nào?

A. Mỗi thao tác một story (xem danh sách, thêm, sửa, xóa, tìm), khoảng 14–16 story, mỗi story kiểm riêng được (Đề xuất, theo INVEST)
B. Mỗi thực thể một story lớn ("Quản lý phòng ban", "Quản lý nhân viên"), khoảng 5–6 story
X. Other (please specify)

[Answer]: A

## Q3. [Quản lý sản phẩm] Gom các story thành nhóm theo cách nào?

A. Theo phần việc, khớp thứ tự làm đã chốt: nhóm 1 Phòng ban → nhóm 2 Nhân viên → nhóm 3 Tìm kiếm → nhóm 4 Báo lỗi chung → nhóm 5 Bàn giao (Đề xuất)
B. Theo persona: story của người quản lý nhân sự trước, story của người cài đặt sau
C. Theo luồng sử dụng: mở ứng dụng → xem → tìm → thêm/sửa → xóa
X. Other (please specify)

[Answer]: A

## Q4. [Quản lý sản phẩm] Mức ưu tiên các story thế nào?

Ở bước trước, người rà soát chỉ ra 7 mục trong yêu cầu là em thêm ngoài đề (đánh dấu `[assumption]`). Anh đã duyệt và chấp nhận chúng là rủi ro. Câu này quyết định chúng được ưu tiên thế nào so với phần đề bài yêu cầu.

A. Mọi story nằm trong đề là Must. Các phần thêm ngoài đề là Should: khóa nút chống bấm hai lần (FR4.6), thông báo lưu thành công (FR5.3), nhãn cho ô nhập (FR5.4) (Đề xuất)
B. Tất cả đều Must
X. Other (please specify)

[Answer]: A
