# Luật: u2-web-shell

> **Nguồn:**
> - `inception/units-generation/unit-of-work.md` (U2), `unit-of-work-story-map.md` (US4.1–US4.6 phần U2)
> - `inception/user-stories/stories.md` (US4.1–US4.6)
> - `inception/refined-mockups/` (`mockups.md` mục 1–2, `interaction-spec.md` mục 2–3, `design-system-mapping.md`, `accessibility-checklist.md`)
> - `inception/contract-design/contract-summary.md` (C3 `client_rules`)
> - `functional-design-questions.md` Q1 (địa chỉ API: A)
>
> U2 là unit giao diện: không lưu dữ liệu, không có thực thể. Luật ở đây là **luật hành vi của khung trang và các phần dùng chung** mà U3, U4 dựa vào. Bốn nhóm:
> - **BR1:** điều hướng và khung trang.
> - **BR2:** gọi API (`client.ts`).
> - **BR3:** hiện trạng thái, lỗi, thông báo.
> - **BR4:** chuẩn giao diện dùng chung.

```yaml
rules:
  - id: BR1.1
    statement: Bảng đường dẫn của khung trang
    category: policy
    applies_to: Router
    trigger: Người dùng mở một địa chỉ
    logic: >
      "/" -> tự chuyển tới "/employees" (thay địa chỉ, không thêm vào lịch sử).
      "/employees" -> trang Nhân viên; "/departments" -> trang Phòng ban (U2 chỉ có tiêu đề, U3/U4 thêm nội dung và các đường dẫn form).
      Đường dẫn khác -> trang "Không tìm thấy trang" kèm liên kết về Nhân viên.
      Chuyển trang không tải lại cả trang (G4).
    violation: -
    source: FR5, AC4.3.1

  - id: BR1.2
    statement: Mỗi lần đổi trang, tiêu đề trình duyệt và focus đổi theo
    category: policy
    applies_to: mọi trang
    trigger: Đổi đường dẫn bằng menu, liên kết hoặc nút quay lại của trình duyệt
    logic: >
      document.title = "<Tên trang> – Quản lý nhân sự".
      Sau khi đổi trang (không phải lần mở đầu tiên), focus chuyển tới <h1> của trang mới (h1 có tabindex="-1"),
      để trình đọc màn hình đọc tiêu đề trang mới. Lần mở đầu tiên giữ focus ở đầu trang để Tab đầu tiên tới liên kết bỏ qua.
    violation: -
    source: WCAG 2.4.2, 2.4.3 (accessibility-checklist G1)

  - id: BR1.3
    statement: Liên kết bỏ qua là phần tử nhận focus đầu tiên
    category: policy
    applies_to: AppLayout
    trigger: Nhấn Tab lần đầu trên trang
    logic: IF nhấn Tab lần đầu THEN hiện "Bỏ qua, tới nội dung chính"; Enter thì focus nhảy vào vùng nội dung chính (main#noi-dung).
    violation: -
    source: WCAG 2.4.1

  - id: BR1.4
    statement: Mục menu đang mở được đánh dấu không chỉ bằng màu
    category: policy
    applies_to: NavMenu
    trigger: Đang ở "/employees..." hoặc "/departments..." (kể cả trang form con)
    logic: Mục tương ứng có aria-current="page", chữ đậm và gạch dưới.
    violation: -
    source: AC4.3.1, WCAG 1.4.1

  - id: BR1.5
    statement: Mọi chữ hiển thị của khung trang là tiếng Việt
    category: policy
    applies_to: AppLayout, NavMenu, trang 404, StatusMessage, Toast, ErrorSummary, index.html
    trigger: Hiển thị
    logic: Chữ trên giao diện, aria-label, title bằng tiếng Việt; <html lang="vi">. Tên trong code bằng tiếng Anh.
    violation: -
    source: AC4.3.3, project.md Mandated

  - id: BR2.1
    statement: Mọi lời gọi API đi qua một module chung
    category: constraint
    applies_to: src/api/client.ts
    trigger: Trang cần dữ liệu từ backend
    logic: >
      Trang không gọi fetch trực tiếp. Địa chỉ gốc lấy từ biến VITE_API_BASE_URL (file .env.development, mặc định "http://localhost:5081", Q1=A).
      Body gửi đi là JSON với Content-Type application/json. Không gửi cookie hay thông tin đăng nhập.
    violation: -
    source: C3 client_rules, Q1

  - id: BR2.2
    statement: Mỗi lời gọi có hạn 10 giây và không tự gọi lại
    category: policy
    applies_to: src/api/client.ts
    trigger: Lời gọi chưa có trả lời sau 10 giây
    logic: IF quá 10 giây THEN hủy lời gọi và báo lỗi loại "network". Không bao giờ tự gọi lại; người dùng bấm "Thử lại".
    violation: -
    source: C3 client_rules, Contract Design Q3

  - id: BR2.3
    statement: Lỗi mạng và lỗi máy chủ báo câu dễ hiểu, đúng nguyên nhân
    category: policy
    applies_to: src/api/client.ts
    trigger: fetch bị từ chối (backend tắt, CORS chặn), quá hạn, API trả 5xx, hoặc API trả 200/201 mà body không phải JSON hợp lệ
    logic: >
      IF fetch bị từ chối hoặc quá hạn THEN lỗi loại "network", lời báo "Không kết nối được máy chủ, vui lòng thử lại".
      IF 5xx có ProblemDetails THEN lỗi loại "server", lời báo = detail, ngược lại title.
      IF 5xx không có ProblemDetails, hoặc 200/201 mà body không phải JSON hợp lệ THEN lỗi loại "server", lời báo chung "Đã có lỗi xảy ra, vui lòng thử lại sau." Máy chủ vẫn trả lời được nên không báo "Không kết nối được máy chủ".
      Đổi có chủ đích ở Code Generation Step 10 (rà soát tổng thể N-02, review R-10, 2026-11-03): bản trước báo câu lỗi mạng cho 5xx không có detail.
    violation: -
    source: AC4.2.2, C3 client_rules, construction/build-and-test/ra-soat-tong-the.md (N-02)

  - id: BR2.4
    statement: Lỗi 4xx giữ nguyên lời báo của API
    category: policy
    applies_to: src/api/client.ts
    trigger: API trả 400, 404, 409 (hoặc 4xx khác) dạng application/problem+json
    logic: >
      Lỗi mang status, title, detail, errors (khóa camelCase -> danh sách lời báo) đúng như API gửi; giao diện không tự viết lại lời báo.
      Lời báo chung để hiện = detail nếu có, ngược lại title.
      IF body không phải ProblemDetails THEN lời báo chung "Đã có lỗi xảy ra, vui lòng thử lại sau." và errors rỗng.
    violation: -
    source: AC4.1.3, C3 client_rules

  - id: BR2.5
    statement: Đọc phản hồi thành công một cách dễ dãi
    category: policy
    applies_to: src/api/client.ts
    trigger: API trả 2xx
    logic: 200/201 -> trả dữ liệu JSON; 204 -> trả "không có nội dung". Trường JSON lạ được giữ nguyên, không làm lỗi.
    violation: -
    source: C3 client_rules

  - id: BR3.1
    statement: Ba trạng thái không phải dữ liệu hiện ở một chỗ, có vai trò ARIA đúng
    category: policy
    applies_to: StatusMessage
    trigger: Trang đang tải, gặp lỗi khi tải, hoặc danh sách rỗng
    logic: >
      loading: role="status", biểu tượng xoay (tắt khi prefers-reduced-motion) + "Đang tải...".
      error: role="alert", biểu tượng (!) + lời báo + nút "Thử lại" (nếu trang truyền hành động).
      empty: chữ thường + nút hành động (nếu có). Rỗng là trạng thái riêng, không hiện như lỗi.
    violation: -
    source: AC4.2.1, AC4.2.2, AC4.2.3

  - id: BR3.2
    statement: Thông báo thành công hiện ở đầu trang danh sách và tự ẩn sau 5 giây
    category: policy
    applies_to: Toast
    trigger: Trang khác chuyển về trang danh sách kèm lời báo (trạng thái điều hướng)
    logic: >
      Hiện "✓ <lời báo>" trong role="status"; tự ẩn sau 5 giây; rời trang thì hủy hẹn giờ.
      Sau khi hiện, xóa lời báo khỏi trạng thái điều hướng để tải lại trang (F5) không hiện lại.
    violation: -
    source: AC4.5.1, Refined Mockups Q4

  - id: BR3.3
    statement: Lỗi từ API được gắn vào đúng ô, phần còn lại hiện ở khung tóm tắt
    category: validation
    applies_to: ErrorSummary, FormField (dùng ở form của U3, U4)
    trigger: Form nhận lỗi từ kiểm dữ liệu trên trình duyệt hoặc từ API (400/409)
    logic: >
      Khóa trong errors trùng tên ô -> lời báo hiện dưới ô đó (aria-invalid="true", aria-describedby trỏ tới dòng lỗi, có (!) và chữ).
      Khóa không trùng ô nào, hoặc lỗi không gắn ô (detail, lỗi mạng) -> hiện trong khung tóm tắt.
      Khung tóm tắt có role="alert", nhận focus khi bấm Lưu mà có lỗi; mỗi lỗi gắn ô là liên kết tới ô đó.
      Dữ liệu đang nhập trên form giữ nguyên.
    violation: -
    source: AC4.1.1, AC4.1.3, AC4.6.2, C3 client_rules

  - id: BR3.4
    statement: Nút đang chờ API bị khóa và đổi chữ
    category: policy
    applies_to: nút Lưu, nút xác nhận Xóa (kiểu dùng chung của U2)
    trigger: Đã gửi lời gọi ghi và chưa có trả lời
    logic: >
      Nút có thuộc tính disabled, chữ đổi (ví dụ "Đang lưu..."), kiểu btn[disabled] (độ mờ, con trỏ not-allowed, chữ vẫn đủ tương phản).
      Bấm thêm khi đang khóa không gửi lời gọi nào. Có trả lời (thành công hay lỗi) thì mở lại.
    violation: -
    source: AC4.4.1, AC4.4.2

  - id: BR4.1
    statement: Bảng danh sách dùng cấu trúc bảng chuẩn và cuộn ngang được bằng bàn phím
    category: policy
    applies_to: DataTable
    trigger: Có ít nhất một dòng dữ liệu
    logic: >
      Dùng table, caption, th scope="col". Khung bao có role="region", aria-label, tabindex="0", overflow-x: auto.
      IF không có dòng THEN không vẽ bảng (trang cha hiện StatusMessage empty).
    violation: -
    source: WCAG 1.3.1, 1.4.10

  - id: BR4.2
    statement: Mọi phần tử dùng bộ biến CSS chung và thấy được focus
    category: policy
    applies_to: tokens.css, base.css, components.css
    trigger: Hiển thị
    logic: >
      Màu, cỡ chữ, khoảng cách chỉ lấy từ biến trong tokens.css. :focus-visible luôn có viền 3px, không bao giờ outline:none.
      Cỡ chữ dùng rem; nút và ô nhập cao tối thiểu 44px. Nhãn ô nằm trên ô, dấu * kèm chú thích; ô lỗi có viền đỏ dày + (!) + chữ.
    violation: -
    source: AC4.6.1, AC4.6.2, design-system-mapping, WCAG 1.4.3, 1.4.4, 2.4.7
```

## Tóm tắt luật

| ID | Luật | Kết quả |
|---|---|---|
| BR1.1 | Đường dẫn | `/` → `/employees`; hai trang; đường lạ → trang 404 |
| BR1.2 | Đổi trang | Đổi `document.title`, focus vào `h1` |
| BR1.3 | Liên kết bỏ qua | Tab đầu tiên, nhảy vào `main` |
| BR1.4 | Menu đang mở | `aria-current="page"`, đậm + gạch dưới |
| BR1.5 | Tiếng Việt | Mọi chữ khung trang, `lang="vi"` |
| BR2.1 | Một module gọi API | `client.ts`, địa chỉ từ `VITE_API_BASE_URL` = `http://localhost:5081` |
| BR2.2 | Hạn 10 giây | Hủy và báo lỗi; không tự gọi lại |
| BR2.3 | Lỗi mạng / 5xx / body hỏng | Lỗi mạng: "Không kết nối được máy chủ, vui lòng thử lại"; 5xx: lời báo của API, không có thì "Đã có lỗi xảy ra, vui lòng thử lại sau." (cả khi 200/201 có body hỏng) |
| BR2.4 | Lỗi 4xx | Giữ title/detail/errors của API |
| BR2.5 | Thành công | 200/201 JSON, 204 rỗng, bỏ qua trường lạ |
| BR3.1 | Tải / lỗi / rỗng | `StatusMessage` với vai trò ARIA đúng |
| BR3.2 | Thông báo thành công | `Toast`, tự ẩn 5 giây, không hiện lại khi F5 |
| BR3.3 | Hiện lỗi form | Lỗi theo ô + khung tóm tắt nhận focus |
| BR3.4 | Khóa nút | `disabled` + đổi chữ trong lúc chờ |
| BR4.1 | Bảng | `caption`, `th scope`, khung cuộn có focus |
| BR4.2 | Chuẩn giao diện | Biến CSS chung, focus 3px, `rem`, 44px |
