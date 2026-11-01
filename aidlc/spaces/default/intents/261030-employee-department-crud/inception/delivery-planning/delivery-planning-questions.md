# Delivery Planning: câu hỏi về thứ tự làm

Bước này xếp **thứ tự làm** 5 unit đã chia ở Units Generation (`u1-backend-platform`, `u2-web-shell`, `u3-departments`, `u4-employees`, `u5-handover`).

Từ bước này trở đi có hai khái niệm mới:
- **Bolt:** một lượt làm trọn một phần việc (một hoặc vài unit), đi qua các bước thiết kế chi tiết, sinh code và kiểm thử, kết thúc bằng thứ chạy được để xem.
- **Mob:** nhóm thực hiện một Bolt. Ở đây là AI-DLC sinh code, Hiệp trả lời câu hỏi và duyệt.

Những gì đã cố định thì không hỏi lại:
- Sơ đồ phụ thuộc giữa các unit đã chốt: U3 cần U1 và U2; U4 cần U3; U5 cần tất cả. Chỉ U1 và U2 đổi chỗ được cho nhau.
- Không làm bộ khung chạy thử trước (walking skeleton), theo team-practices.
- Một người làm, không có nhóm nào khác.

---

## Q1. [Trưởng nhóm giao hàng] Ưu tiên làm gì trước?

Sơ đồ phụ thuộc chỉ để mở một lựa chọn: làm U1 (nền backend) hay U2 (nền giao diện) trước. Các unit còn lại có thứ tự bắt buộc.

A. **Nền backend trước, rồi đi theo giá trị:** U1 → U2 → U3 → U4 → U5. Những chỗ dễ vướng nhất (nối PostgreSQL, user-secrets, project test) nằm ở U1, gặp sớm thì sửa sớm. Xong U3 là đã có tính năng phòng ban chạy trọn để xem (Đề xuất)
B. **Nền giao diện trước:** U2 → U1 → U3 → U4 → U5. Có màn hình để xem sớm hơn, nhưng các vướng mắc về database lộ ra muộn hơn
C. Dùng mô hình chấm điểm WSJF (điểm = giá trị + độ gấp + mức giảm rủi ro, chia cho độ lớn của việc) để xếp hạng
X. Other (please specify)

[Answer]: A

## Q2. [Trưởng nhóm giao hàng] Một Bolt gồm bao nhiêu unit?

A. **Mỗi Bolt một unit**, tổng cộng 5 Bolt. Mỗi Bolt nhỏ, Hiệp duyệt và tự commit sau từng Bolt, dễ trình bày từng phần (Đề xuất)
B. Gộp U1 và U2 thành một Bolt "nền móng", tổng cộng 4 Bolt
C. Gộp U1, U2 và U3 thành một Bolt lớn, tổng cộng 3 Bolt
X. Other (please specify)

[Answer]: A

## Q3. [Trưởng nhóm giao hàng] Ở giai đoạn Construction, đi theo unit hay theo bước?

A. **Theo unit, lần lượt:** mỗi unit đi trọn các bước (thiết kế chi tiết → sinh code → kiểm) rồi mới sang unit kế. Mỗi unit xong có một điểm kiểm để Hiệp duyệt trước khi sang unit sau (Đề xuất, mặc định của AI-DLC)
B. **Theo bước:** làm thiết kế chi tiết cho tất cả unit trước, rồi mới sinh code cho từng unit
X. Other (please specify)

[Answer]: A

## Q4. [Trưởng nhóm giao hàng] Điều gì anh lo nhất, để xử lý sớm? (select all that apply)

A. Kết nối PostgreSQL lần đầu: tạo database `employee_db`, đặt mật khẩu bằng user-secrets, chạy migration
B. Test service dùng database giả lập có thể không chạy giống PostgreSQL thật ở chỗ so sánh không phân biệt hoa thường
C. Đạt các mục tiêu chất lượng giao diện G1–G6: WCAG 2.1 AA, Lighthouse 100/≥90/≥90, HTML đúng chuẩn
D. Đường dẫn thư mục dự án dài (59 ký tự, trong OneDrive). Công cụ trên Windows có thể lỗi khi đường dẫn vượt 260 ký tự
X. Other (please specify)

[Answer]: A, C; X: kết nối DB hay j thì chỉ tôi nhé, otio kết nối luôn vì tôi có tải rồi
