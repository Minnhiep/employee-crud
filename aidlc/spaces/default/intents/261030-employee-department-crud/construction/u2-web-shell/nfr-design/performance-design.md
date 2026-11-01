# Thiết kế hiệu năng và chất lượng: u2-web-shell

> **Nguồn:** `nfr-requirements/performance-requirements.md` (NFR5.1–NFR5.4, NFR8.1–NFR8.5), `nfr-requirements/tech-stack-decisions.md`, `functional-design/functional-spec.md`, `functional-design/frontend-components.md`, review Functional Design U2 (chặn gửi đôi, đo trên cổng 5173, `signal`, Toast sau xóa, body không phải JSON).

## 1. Hiệu năng (NFR5)

| Yêu cầu | Thiết kế |
|---|---|
| NFR5.1 Lighthouse Performance ≥ 90 | Chỉ ba thư viện chạy (React, React DOM, React Router). Font hệ thống, không tải font hay ảnh. Ba file CSS nhỏ, Vite gộp và nén khi build. Không chia nhỏ code (Q8). Đo trên bản build. **Ở U2 hai trang mới chỉ có tiêu đề, nên số đo ở U2 chỉ để kiểm nền; đo lại khi U3, U4 xong** (review NFR Requirements U2) |
| NFR5.2 Chuyển trang không tải lại | Menu dùng `NavLink`, mọi liên kết trong ứng dụng dùng `Link` của React Router (không dùng `<a href>` cho đường dẫn nội bộ). Riêng liên kết bỏ qua là `<a href="#noi-dung">` vì chỉ nhảy trong trang |
| NFR5.3 Hạn 10 giây | `client.js` tạo `AbortController` riêng cho hạn 10 giây; hẹn giờ chỉ được hủy **sau khi đã đọc xong body**, nên hạn bao cả lúc đọc. Nếu trang truyền `signal` (ví dụ khi trang bị gỡ, hoặc tìm kiếm mới thay tìm kiếm cũ) thì gộp hai tín hiệu: hủy do trang → bỏ qua im lặng (không báo lỗi mạng); hủy do quá hạn → lỗi `network` |
| NFR5.4 Gói gọn | `package.json` chỉ có `react`, `react-dom`, `react-router` ở `dependencies`; công cụ (Vite, ESLint, Prettier) ở `devDependencies` |

## 2. Chặn gửi đôi (AC4.4.1, review Functional Design U2)

- Hook dùng chung `useSubmitGuard()` trả về `isSubmitting` và hàm `run(việc)`.
- Bên trong dùng **cờ `useRef`** (đổi ngay, không đợi vẽ lại) để chặn lần gọi thứ hai trong cùng một nhịp; `useState` chỉ để vẽ nút "Đang lưu..." bị khóa.
- Việc xong (thành công hay lỗi) thì mở cờ. Form của U3, U4 và nút xác nhận xóa đều dùng hook này.
- Kiểm: bấm đúp thật nhanh nút Lưu, tab Network chỉ có **một** request (ghi vào bước kiểm tay của U3).

## 3. Thông báo thành công sau khi xóa (review Functional Design U2)

- Xóa diễn ra trên chính trang danh sách. Trang gọi `navigate(đường dẫn hiện tại + query, { replace: true, state: { message } })` để `Toast` hiện lời báo theo đúng một cách với thêm/sửa.
- Vùng `div[role="status"]` của `Toast` **luôn có trong trang** (rỗng khi không có lời báo), rồi mới điền chữ, để trình đọc màn hình đọc được.

## 4. Đọc phản hồi an toàn (review Functional Design U2)

- 2xx nhưng body không đọc được JSON (hoặc rỗng khi không phải 204) → `ApiError` loại `server`, lời báo "Không kết nối được máy chủ, vui lòng thử lại".
- 4xx/5xx có body rỗng hoặc không phải `application/problem+json` → như BR2.4 (4xx: câu chung; 5xx: câu lỗi mạng).

## 5. Chất lượng (NFR8)

| Yêu cầu | Thiết kế |
|---|---|
| NFR8.1 Lint, định dạng | `npm run lint` (ESLint của Vite), `npm run format` / `npm run format:check` (Prettier cục bộ, cấu hình mặc định, file `.prettierignore` loại `dist`) |
| NFR8.2 WCAG 2.1 AA | Theo `accessibility-checklist.md` mục 2; U2 lo phần khung: `lang="vi"`, liên kết bỏ qua, `header/nav/main`, `h1` mỗi trang, tiêu đề tab, focus khi đổi trang, `:focus-visible`, tương phản theo `tokens.css`, `prefers-reduced-motion` |
| NFR8.3 Lighthouse Accessibility 100 | Như NFR8.2; mỗi trang có đúng một `h1`; không bỏ cấp tiêu đề |
| NFR8.4 Best Practices ≥ 90, console sạch | `<meta charset>`, `<meta name="viewport">`, `<meta name="description">`; không lỗi React (mỗi phần tử danh sách có `key`); có `favicon` của Vite để không lỗi 404 trong console |
| NFR8.5 HTML hợp lệ | Không trùng `id`; thẻ lồng đúng (không đặt `div` trong `p`); `aria-*` chỉ dùng giá trị hợp lệ |

**Điều kiện đo (NFR5.1, NFR8.3–NFR8.5):** `vite.config.js` đặt `server: { port: 5173, strictPort: true }` và `preview: { port: 5173, strictPort: true }`. Đo: dừng `npm run dev`, chạy `npm run build` rồi `npm run preview`, mở `http://localhost:5173`. Bản build dùng địa chỉ API mặc định `http://localhost:5081` trong `client.js`.

## 6. Không làm

- Không cache dữ liệu API ở trình duyệt; mỗi lần mở trang tải lại (dữ liệu nhỏ, một người dùng).
- Không service worker, không chia nhỏ code theo trang (Q8).
