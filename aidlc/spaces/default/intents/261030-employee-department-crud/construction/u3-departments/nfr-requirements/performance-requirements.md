# Yêu cầu hiệu năng: u3-departments

> **Nguồn:** `requirements.md` (NFR5: API danh sách và tìm kiếm trả lời trong 1 giây với tối đa 1.000 nhân viên), `functional-design/rules.md` (BR2.1), `performance-requirements.md` của U2 (NFR5.1 đo lại khi U3, U4 xong).

| ID | Yêu cầu | Ngưỡng | Cách đo | Nguồn |
|---|---|---|---|---|
| NFR5.1 | API danh sách phòng ban trả lời nhanh | `GET /api/departments` ≤ 1 giây trên máy dev (dữ liệu: vài chục phòng ban) | Cột thời gian của Postman, 3 lần, lấy số lớn nhất | NFR5 |
| NFR5.2 | Thêm, sửa, xóa một phòng ban trả lời nhanh | Mỗi lời gọi ≤ 1 giây | Postman | NFR5 (áp cùng ngưỡng cho thao tác ghi) |
| NFR5.3 | Đọc danh sách không theo dõi thay đổi | Truy vấn đọc dùng chế độ không theo dõi (no-tracking), chỉ lấy hai cột `id`, `name` | Đọc code service | NFR5 (giữ phần nền gọn, theo NFR5.2 của U1) |
| NFR5.4 | Trang Phòng ban đạt Lighthouse Performance ≥ 90 | Đo lại G3 của U2 khi đã có dữ liệu thật | Lighthouse trên `npm run preview` cổng 5173 | U2 NFR5.1 (G3) |

Không phân trang, không cache: số phòng ban nhỏ (FR1.1 "không phân trang").
