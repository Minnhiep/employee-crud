# Yêu cầu hiệu năng và chất lượng giao diện: u2-web-shell

> **Nguồn:**
> - `inception/requirements-analysis/requirements.md` (NFR5, NFR8)
> - `inception/refined-mockups/accessibility-checklist.md` G1–G6 (Hiệp đặt ở Refined Mockups Q6–Q9; file đó yêu cầu đưa thành mã NFR ở bước này)
> - `inception/contract-design/contract-summary.md` C3 (hạn 10 giây)
> - `functional-design/functional-spec.md` (mục 9–10), review Functional Design U2 (đo trên cổng 5173)
>
> G1–G6 vượt `docs/ke-hoach.md`, do Hiệp yêu cầu thêm. Chúng được gắn vào NFR gần nhất: tốc độ → NFR5, chất lượng kiểm được trước khi bàn giao → NFR8.

## 1. Hiệu năng (NFR5)

| ID | Yêu cầu | Ngưỡng | Cách đo | Nguồn |
|---|---|---|---|---|
| NFR5.1 | Điểm Performance của Lighthouse ở `/employees` và `/departments` | ≥ 90 (chế độ Desktop, lấy số giữa của 3 lần) | Chrome DevTools → Lighthouse trên bản build | G3 |
| NFR5.2 | Chuyển trang bằng menu không tải lại cả trang | Tab Network không có request tải lại tài liệu HTML khi bấm menu | DevTools → Network | G4 |
| NFR5.3 | Một lời gọi API không treo giao diện quá lâu | Hủy sau đúng 10 giây (tính cả lúc đọc body), báo "Không kết nối được máy chủ, vui lòng thử lại" | Kiểm bằng tay ở U3: làm chậm mạng hoặc dừng backend giữa chừng | C3 client_rules, BR2.2 |
| NFR5.4 | Gói JavaScript gọn | Không thêm thư viện ngoài React, React DOM, React Router; không chia nhỏ code theo trang (Hiệp chọn A ở Refined Mockups Q8) | Đọc `package.json` | Q8, project.md (không Redux) |

## 2. Chất lượng giao diện (NFR8)

| ID | Yêu cầu | Ngưỡng | Cách đo | Nguồn |
|---|---|---|---|---|
| NFR8.1 | Lint và định dạng frontend | `npm run lint` không lỗi, không cảnh báo; `npx prettier --check .` sạch | Chạy trước mỗi commit | NFR8, team.md Code Style |
| NFR8.2 | Đạt WCAG 2.1 AA | Đi hết danh sách mục 2 của `accessibility-checklist.md`, không mục nào trượt | Kiểm tay ở Build and Test | G1 |
| NFR8.3 | Điểm Accessibility của Lighthouse | = 100 ở mọi trang (U2: hai trang tiêu đề và trang 404; sau U3/U4: đủ 6 trang) | Lighthouse | G2 |
| NFR8.4 | Điểm Best Practices của Lighthouse và console | ≥ 90; console không lỗi, không cảnh báo khi dùng bình thường | Lighthouse, tab Console | G5 |
| NFR8.5 | HTML đúng chuẩn | W3C Validator (dán HTML đã render) không còn lỗi | validator.w3.org | G6 |

**Điều kiện đo chung (NFR5.1, NFR8.3–NFR8.5):** đo trên bản build, phục vụ ở **cổng 5173** để khớp CORS của U1 (`npm run build` rồi `npm run preview -- --port 5173 --strictPort`, sau khi đã dừng `npm run dev`). Bản build dùng địa chỉ API mặc định `http://localhost:5081` (`.env.development` chỉ nạp ở chế độ dev). Nguồn: review Functional Design U2.

## 3. Không đặt

- Không đặt ngân sách kích thước gói tính bằng KB: chưa có số đo nào để làm căn cứ; NFR5.1 đã bao hiệu quả cuối cùng.
- Không đo thời gian chuyển trang bằng mili giây: G4 chỉ yêu cầu "không tải lại cả trang" (Hiệp chọn A ở Q8).
