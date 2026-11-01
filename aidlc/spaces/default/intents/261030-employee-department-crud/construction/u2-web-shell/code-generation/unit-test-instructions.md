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
| K2 | Nhấn Tab lần đầu | Hiện liên kết "Bỏ qua, tới nội dung chính"; Enter thì focus vào vùng nội dung | BR1.3 |
| K3 | Bấm "Phòng ban" trên menu | Địa chỉ `/departments`, `h1` "Phòng ban", tab đổi tiêu đề; tab Network (lọc Doc) không có request tải lại HTML; mục "Phòng ban" đậm + gạch dưới, có `aria-current="page"` | BR1.2, BR1.4, NFR5.2 |
| K4 | Sau khi bấm menu ở K3 | Focus nằm ở `h1` của trang mới | BR1.2 |
| K5 | Mở `http://localhost:5173/abc` | Thấy "Không tìm thấy trang" và liên kết "Về trang Nhân viên"; bấm liên kết về `/employees` | BR1.1 |
| K6 | Nút Quay lại của trình duyệt | Về đúng trang trước, menu đánh dấu đúng | BR1.4 |
| K7 | Nhấn Tab qua mọi phần tử | Mỗi phần tử có viền focus 3px thấy rõ | BR4.2 |
| K8 | Mở tab Console trong suốt K1–K7 | Không có lỗi, không có cảnh báo | NFR8.4 |

Các component dùng chung chưa có trang nào dùng ở U2 (`StatusMessage`, `Toast`, `DataTable`, `ErrorSummary`, `FormField`, `useSubmitGuard`, `client.ts`) được kiểm kiểu bằng `typecheck` ngay ở U2 và kiểm hành vi khi U3 dùng tới.

## Giả lập

- Không cần backend để kiểm U2 (chưa có lời gọi API).

## Dữ liệu kiểm

- Không có dữ liệu.
