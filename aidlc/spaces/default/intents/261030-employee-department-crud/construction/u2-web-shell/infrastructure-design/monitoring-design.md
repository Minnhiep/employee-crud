# Thiết kế theo dõi: u2-web-shell

> **Nguồn:** `nfr-requirements/performance-requirements.md` (NFR5.x, NFR8.x), `nfr-design/performance-design.md`, `nfr-design/security-design.md` §3–§4.
>
> Frontend chạy trên máy, một người dùng. "Theo dõi" là: đọc **tab Console và Network** của trình duyệt khi dùng, và **đo một lần** bằng Lighthouse / W3C Validator ở Build and Test. Không gửi log hay số liệu đi đâu.

## Metrics & KPIs

| Metric | Source | Threshold | Why it matters |
|---|---|---|---|
| Lighthouse Performance | DevTools → Lighthouse (Desktop), trên `npm run preview` cổng 5173 | ≥ 90, số giữa của 3 lần (NFR5.1); ở U2 chỉ đo nền, đo lại sau U3/U4 | G3 do Hiệp đặt |
| Lighthouse Accessibility | Như trên | = 100 mỗi trang (NFR8.3) | G2 |
| Lighthouse Best Practices | Như trên | ≥ 90 (NFR8.4) | G5 |
| Lỗi HTML | W3C Validator, dán HTML đã render | 0 lỗi (NFR8.5) | G6 |
| Tải lại tài liệu khi bấm menu | Tab Network, lọc "Doc" | 0 request mới (NFR5.2) | G4 |
| Lỗ hổng gói npm | `npm audit` | Ghi kết quả; high/critical ở gói chạy trong trình duyệt thì báo Hiệp | Review NFR Requirements U2 |

## Alerts

| Alert | Condition | Severity | Routes to |
|---|---|---|---|
| Lỗi mạng / máy chủ khi gọi API | `client.js` ném `ApiError` loại `network` hoặc `server` | Hiện cho người dùng | `StatusMessage` hoặc `ErrorSummary` trên trang (tiếng Việt, có "Thử lại") |
| Lỗi lạ trong `client.js` | Lỗi không phải HTTP (lỗi lập trình) | Error | `console.error` trên tab Console của Hiệp |
| Cổng 5173 bận | Vite không khởi động được (`strictPort`) | Error | Terminal chạy `npm run dev` |

Không có cảnh báo gửi đi: không có ai trực hệ thống.

## SLIs / SLOs

Không áp dụng: giao diện chỉ chạy khi Hiệp làm bài trên máy. Tiêu chí "chạy được" là bốn điều của `team.md` Deployment (giao diện làm được đủ thêm, sửa, xóa, tìm sau U3/U4).

| SLI | SLO target | Measurement window |
|---|---|---|
| Không áp dụng | — | — |

## Logs & Tracing

| Mục | Thiết kế |
|---|---|
| Nơi ghi | Tab Console của trình duyệt; không gửi log về backend |
| Khi dùng bình thường | Console **sạch**: không log thông tin, không cảnh báo React (NFR8.4) |
| Khi có lỗi lạ | Một dòng `console.error` kèm đối tượng lỗi; người dùng chỉ thấy câu chung |
| Không ghi | Dữ liệu người dùng nhập, body request |
| Xem request | Tab Network: thấy địa chỉ `http://localhost:5081/api/...`, mã trạng thái, JSON trả về (dùng để học luồng React → API) |
| Tracing, dashboard | Không có |
