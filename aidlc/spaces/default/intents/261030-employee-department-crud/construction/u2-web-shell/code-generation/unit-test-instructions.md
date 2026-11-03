# Hướng dẫn kiểm: u2-web-shell

## Khung kiểm và cấu hình

- **Không có test tự động cho React** (`team.md` Testing Posture: "không viết test tự động cho React"). Không cài Vitest, Jest hay Testing Library.
- U2 được kiểm bằng bốn lệnh tự động (lint, kiểm kiểu, định dạng, build) và các bước kiểm tay trên trình duyệt dưới đây.
- Công cụ: ESLint 10 + `typescript-eslint`, TypeScript `strict` (`tsc -b`), Prettier (cục bộ, cấu hình mặc định), Vite build.

## Lệnh kiểm của U2

Chạy ở thư mục gốc repo (`employee-crud/`), mỗi lệnh riêng một dòng:

```
npm --prefix frontend run lint
```

```
npm --prefix frontend run typecheck
```

```
npm --prefix frontend run format:check
```

```
npm --prefix frontend run build
```

Đạt khi cả bốn lệnh kết thúc không lỗi; `lint` không có cảnh báo; `typecheck` (TypeScript `strict`) không có lỗi kiểu. Lệnh đầu chạy được ngay sau bước 1 của kế hoạch.

## Mục tiêu độ phủ

- Mức sàn 80% của dự án chỉ áp dụng cho **các lớp service backend** (`team.md`); Build and Test kiểm trên toàn bộ bộ test backend. Frontend không đo độ phủ.

## Kiểm tay (sau khi code, trên `npm run dev`, mở `http://localhost:5173`)

| # | Thao tác | Đạt khi | Luật |
|---|---|---|---|
| K1 | Mở `http://localhost:5173/` | Địa chỉ đổi thành `/employees`, thấy `h1` "Nhân viên", tab ghi "Nhân viên – Quản lý nhân sự" | BR1.1, BR1.2 |
| K2 | Mở thẳng `http://localhost:5173/employees`, nhấn Tab lần đầu | Hiện liên kết "Bỏ qua, tới nội dung chính"; Enter thì focus vào vùng nội dung. (Mở bằng `/` thì trang tự chuyển và focus đã ở tiêu đề, Tab tới nút đầu tiên của nội dung) | BR1.3 |
| K3 | Bấm "Phòng ban" trên thanh bên | Địa chỉ `/departments`, `h1` "Phòng ban", tab đổi tiêu đề; tab Network (lọc Doc) không có request tải lại HTML; mục "Phòng ban" có nền sáng + vạch trái + chữ đậm, có `aria-current="page"` | BR1.2, BR1.4, NFR5.2 |
| K4 | Sau khi bấm menu ở K3 | Focus nằm ở `h1` của trang mới, `h1` không có khung viền | BR1.2 |
| K5 | Mở `http://localhost:5173/abc` | Đường dẫn trang "Nhân sự > Không tìm thấy trang", tấm báo "Đường dẫn này không tồn tại hoặc đã bị đổi." và nút "Về danh sách nhân viên"; bấm nút về `/employees` | BR1.1 |
| K6 | Nút Quay lại của trình duyệt | Về đúng trang trước, menu đánh dấu đúng | BR1.4 |
| K7 | Nhấn Tab qua mọi phần tử | Mỗi phần tử có viền focus 3px thấy rõ (trên thanh bên tối là màu xanh sáng `#8ec5ff`) | BR4.2 |
| K8 | Mở tab Console trong suốt K1–K7 | Không có lỗi, không có cảnh báo | NFR8.4 |
| K9 | Hộp xác nhận xóa (`ConfirmDialog`, trang đầu tiên dùng là U3) | Mở thì focus ở nút "Hủy", Tab không ra khỏi hộp, Esc đóng và focus về nút Xóa đã mở hộp; nút xác nhận ghi đúng việc ("Xóa phòng ban") | BR4.2, WCAG 2.1.2, 3.3.4 |
| K10 | Thu cửa sổ còn 320px | Thanh bên thành thanh ngang trên cùng (logo + menu), không cuộn ngang cả trang | WCAG 1.4.10 |
| K11 | (Kiểm ở U3) Thêm phòng ban thật từ `http://localhost:5173` | `client.ts` gọi API thật, không lỗi CORS, Toast "Đã thêm …" hiện góc trên phải | NFR7.1, C3 |
| K12 | (Kiểm ở U3) Đang tải danh sách thì bấm sang trang khác | Lời gọi bị hủy, trang mới không hiện lỗi nào (lỗi `aborted` được bỏ qua) | NFR5.3, rà soát U2 R-01 |
| K13 | (Kiểm ở U3, U4) Bấm Lưu khi form trống, rồi bấm một dòng trong khung tóm tắt lỗi | Focus nhảy vào đúng ô bị lỗi, địa chỉ trang không đổi, focus không bị kéo về tiêu đề | AC4.1.1, WCAG 3.3.1, rà soát U2 R-02 |
| K14 | (Kiểm ở U3, U4) Xóa một mục, chờ Toast tự ẩn hoặc bấm "Đóng thông báo" | Sau khi xóa, focus về tiêu đề trang đúng một lần; Toast ẩn đi không kéo focus đi đâu khác | WCAG 2.4.3, rà soát U2 R-02 |
| K15 | (Step 10) Giả lập lỗi ở trang Nhân viên (DevTools hoặc Playwright chặn `/api/employees`): 500 không body; 200 body hỏng; tắt hẳn backend; 5xx có lời báo của API | Hai ca đầu hiện "Đã có lỗi xảy ra, vui lòng thử lại sau."; tắt backend hiện "Không kết nối được máy chủ, vui lòng thử lại"; ca cuối hiện đúng lời báo của API | Rà soát tổng thể N-02, A-09 |

Các component dùng chung chưa có trang nào dùng ở U2 (`StatusMessage`, `Toast`, `DataTable`, `ErrorSummary`, `FormField`, `useSubmitGuard`, `client.ts`) được kiểm kiểu bằng `typecheck` ngay ở U2 và kiểm hành vi khi U3 dùng tới.

## Giả lập

- Không cần backend để kiểm U2 (chưa có lời gọi API).

## Dữ liệu kiểm

- Không có dữ liệu.
