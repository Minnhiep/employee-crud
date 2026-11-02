# Yêu cầu hiệu năng: u4-employees

> **Nguồn:** `requirements.md` (NFR5: API danh sách và tìm kiếm trả lời trong 1 giây với tối đa 1.000 nhân viên), `functional-design/rules.md` (BR2.1, BR2.2), `functional-design/functional-spec.md` (W1), mức đo của U3 (Lighthouse trang Phòng ban).

| ID | Yêu cầu | Ngưỡng | Cách đo | Nguồn |
|---|---|---|---|---|
| NFR5.1 | API danh sách nhân viên trả lời nhanh với dữ liệu lớn nhất dự kiến | `GET /api/employees` ≤ 1 giây khi có 1.000 nhân viên | Chèn tạm 1.000 nhân viên bằng SQL tay trong pgAdmin, đo bằng Postman 3 lần, lấy số lớn nhất, rồi xóa dữ liệu tạm | NFR5 |
| NFR5.2 | Tìm kiếm trả lời nhanh với 1.000 nhân viên | `GET /api/employees?search=an` ≤ 1 giây | Như NFR5.1 | NFR5, FR3.1 |
| NFR5.3 | Danh sách lấy kèm tên phòng ban trong **một** câu truy vấn | Một câu SQL có JOIN tới `departments`; không gọi database riêng cho từng nhân viên; đọc không theo dõi thay đổi, chỉ lấy 5 cột cần cho DTO | Bật log SQL (NFR6.3), đếm số câu SELECT khi gọi danh sách | NFR5 (tránh lỗi "N+1 truy vấn") |
| NFR5.4 | Thêm, sửa, xóa một nhân viên trả lời nhanh | Mỗi lời gọi ≤ 1 giây | Postman | NFR5 |
| NFR5.5 | Trang Nhân viên đạt Lighthouse Performance ≥ 90 | Đo khi có dữ liệu mẫu (vài nhân viên) | Lighthouse trên `npm run preview` cổng 5173 | G3, như U3 |

Không phân trang, không cache (FR2.1 "không phân trang", requirements mục 6: dưới 1.000 dòng). Tìm "chứa chuỗi" không dùng được chỉ mục thường, nhưng với 1.000 dòng thì quét cả bảng vẫn chỉ tốn vài mili giây.
