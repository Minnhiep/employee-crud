# Danh sách kiểm accessibility và các chuẩn chất lượng giao diện

> **Nguồn:** Hiệp trả lời các câu Q6–Q9 trong `refined-mockups-questions.md`:
> - Q6: "chuẩn chỉnh hết mọi thứ, chuẩn hóa toàn bộ này kia luôn, tốc độ router".
> - Q7: đạt đủ WCAG 2.1 AA.
> - Q8: đặt con số đo cho tốc độ.
> - Q9: HTML đúng chuẩn, giao diện thống nhất, Lighthouse Best Practices ≥ 90, "chuẩn chỉnh hoàn toàn".
>
> **Liên quan đến yêu cầu:** `requirements.md` chỉ có FR5.4 (nhãn ô nhập, lỗi bằng chữ) và NFR5 (API phản hồi dưới 1 giây). Các mục G1–G6 dưới đây là **yêu cầu mới do Hiệp đặt ở bước này**, vượt `docs/ke-hoach.md`. Bước thiết kế yêu cầu phi chức năng ở Construction (nếu kế hoạch có bước này), hoặc chậm nhất là Build and Test, cần đưa chúng thành mã NFR chính thức.

## 1. Mục tiêu đo được

| Mã | Mục tiêu | Cách đo | Khi nào đo |
|---|---|---|---|
| G1 | Đạt đủ WCAG 2.1 mức AA | Đi hết danh sách ở mục 2 | Build and Test |
| G2 | Điểm **Accessibility** của Lighthouse = 100 ở cả 6 trang (mục 1 của `mockups.md`) | Chrome DevTools → Lighthouse, chế độ Desktop, trên bản build (`npm run build` rồi `npm run preview`) | Build and Test |
| G3 | Điểm **Performance** của Lighthouse ≥ 90 ở trang `/employees` và `/departments` | Như G2. Chạy 3 lần, lấy số giữa | Build and Test |
| G4 | Bấm menu chuyển trang thì khung trang mới hiện ngay, **không tải lại cả trang** | Tab Network của DevTools không có request tải lại tài liệu HTML; chỉ có lời gọi API | Build and Test |
| G5 | Điểm **Best Practices** của Lighthouse ≥ 90; console không có lỗi hay cảnh báo khi dùng bình thường | Lighthouse và tab Console | Build and Test |
| G6 | HTML đúng chuẩn: kiểm bằng W3C Validator (https://validator.w3.org, mục "Validate by direct input", dán HTML đã render) không còn lỗi | Kiểm cả 6 trang | Build and Test |

Lighthouse chỉ bắt được khoảng một phần ba lỗi accessibility. Vì vậy G1 vẫn phải kiểm tay theo mục 2, không chỉ dựa vào điểm của G2.

## 2. WCAG 2.1 AA: các tiêu chí áp dụng cho ứng dụng này

Cột "Thiết kế" chỉ chỗ đã lo trong bản thiết kế. Cột "Kiểm tra" là cách kiểm ở bước Build and Test.

### Perceivable (nhìn và nghe được)

| Tiêu chí | Thiết kế | Kiểm tra |
|---|---|---|
| 1.1.1 Có chữ thay cho nội dung không phải chữ | Biểu tượng ✓, (!), xoay có `aria-hidden="true"` vì đã có chữ đi kèm | Lighthouse; đọc mã HTML |
| 1.3.1 Thông tin và quan hệ thể hiện trong mã | `header/nav/main`, `h1` mỗi trang, `table/caption/th scope`, `label for`, `aria-describedby` cho lỗi | W3C Validator; Lighthouse |
| 1.3.2 Thứ tự đọc có nghĩa | Thứ tự trong mã trùng thứ tự hiển thị | Tắt CSS, đọc từ trên xuống |
| 1.3.5 Nêu rõ mục đích ô nhập | Ô email có `type="email"` | Đọc mã HTML |
| 1.4.1 Không dùng màu làm cách duy nhất để báo | Lỗi có (!) + chữ; menu đang mở có chữ đậm + gạch dưới | Xem giao diện ở chế độ xám (DevTools → Rendering → Emulate vision deficiencies) |
| 1.4.3 Tương phản chữ ≥ 4.5:1 | Bảng màu trong `design-system-mapping.md` mục 2 | Lighthouse; DevTools Contrast |
| 1.4.4 Phóng to chữ 200% | Dùng `rem`, không cố định chiều cao khung chữ | Phóng trình duyệt 200% |
| 1.4.10 Dàn lại ở bề rộng 320px | Một cột; bảng cuộn trong khung (ngoại lệ cho bảng dữ liệu) | Thu cửa sổ còn 320px |
| 1.4.11 Tương phản thành phần giao diện ≥ 3:1 | Viền ô `#6b7280`, viền focus `#1d4ed8` | DevTools |
| 1.4.12 Giãn khoảng chữ | Không cố định chiều cao khung chữ | Thêm CSS giãn chữ thử nghiệm |
| 1.4.13 Nội dung hiện khi di chuột hoặc focus | Không dùng tooltip | — |

### Operable (thao tác được)

| Tiêu chí | Thiết kế | Kiểm tra |
|---|---|---|
| 2.1.1 Mọi việc làm được bằng bàn phím | Chỉ dùng `a`, `button`, `input`, `select` gốc; hộp xác nhận là `window.confirm` | Rút chuột, làm hết luồng F1–F4 bằng bàn phím |
| 2.1.2 Không kẹt bàn phím | Không có modal tự làm | Như trên |
| 2.2.1 Thời gian có thể điều chỉnh | Thông báo tự ẩn sau 5 giây chỉ để báo tin, được đọc ngay khi hiện; không thao tác nào bị giới hạn giờ | Xem lại `interaction-spec.md` mục 2.7 |
| 2.3.1 Không nhấp nháy | Không có nhấp nháy; biểu tượng xoay tắt khi máy bật `prefers-reduced-motion` | Bật Reduce motion trong Windows |
| 2.4.1 Bỏ qua khối lặp lại | Liên kết "Bỏ qua, tới nội dung chính" | Nhấn Tab đầu tiên |
| 2.4.2 Tiêu đề trang | `document.title` đổi theo từng trang | Xem tiêu đề tab trình duyệt |
| 2.4.3 Thứ tự focus hợp lý | Theo thứ tự hiển thị; khi đổi trang, focus vào `h1` | Nhấn Tab |
| 2.4.4 Liên kết có mục đích rõ | Nút Sửa/Xóa có `aria-label` ghi đủ tên mục | Lighthouse; đọc mã |
| 2.4.6 Tiêu đề và nhãn mô tả rõ | Nhãn tiếng Việt rõ nghĩa | Rà chữ |
| 2.4.7 Thấy được focus | `:focus-visible` viền 3px, không tắt outline | Nhấn Tab qua mọi phần tử |

### Understandable (hiểu được)

| Tiêu chí | Thiết kế | Kiểm tra |
|---|---|---|
| 3.1.1 Khai báo ngôn ngữ trang | `<html lang="vi">` | W3C Validator; Lighthouse |
| 3.2.1 / 3.2.2 Không tự đổi ngữ cảnh khi focus hoặc nhập | Chỉ gửi form khi bấm Lưu hoặc Tìm (Q3); chọn phòng ban không tự gửi | Thử từng ô |
| 3.2.3 / 3.2.4 Menu và tên gọi nhất quán | Một `AppLayout` cho mọi trang; một bộ class (Q9-B) | So các trang |
| 3.3.1 Nhận diện lỗi | Lỗi bằng chữ, cạnh ô sai, có khung tóm tắt | Gửi form sai |
| 3.3.2 Có nhãn hoặc hướng dẫn | Nhãn trên ô, gợi ý "Ví dụ: ten@congty.vn", "Tối đa 100 ký tự", chú thích dấu * | Xem form |
| 3.3.3 Gợi ý cách sửa lỗi | Lời báo nói cách sửa ("tối đa 100 ký tự", "đã được sử dụng") | Gửi form sai |
| 3.3.4 Phòng tránh lỗi khi xóa | Xác nhận trước khi xóa, ghi tên mục | Thử xóa |

### Robust (chạy được với nhiều công cụ)

| Tiêu chí | Thiết kế | Kiểm tra |
|---|---|---|
| 4.1.1 Mã HTML đúng cú pháp | Không trùng `id`, thẻ lồng nhau đúng (G6) | W3C Validator |
| 4.1.2 Có tên, vai trò, giá trị | Dùng phần tử gốc; `aria-invalid`, `aria-current`, `aria-required` đúng chỗ | Lighthouse; Accessibility tree trong DevTools |
| 4.1.3 Thông báo trạng thái | Đang tải, đếm kết quả, thông báo thành công nằm trong `role="status"`; lỗi nằm trong `role="alert"` | Đọc mã HTML; Lighthouse |

## 3. Những gì nằm ngoài phạm vi

- Không kiểm bằng trình đọc màn hình NVDA hay VoiceOver: Hiệp chọn A ở Q7, không chọn B.
- Không cam kết mức AAA.
- Không làm giao diện riêng cho điện thoại (Q5). Chỉ cần đạt yêu cầu dàn lại ở 320px của WCAG 1.4.10.
- Không chia nhỏ code theo từng trang (lazy loading): Hiệp chọn A ở Q8, không chọn B.

## 4. Việc cần làm ở các bước sau

- **Bước yêu cầu phi chức năng ở Construction (nếu có trong kế hoạch):** đưa G1–G6 thành mã NFR, ghi nguồn "Hiệp, Refined Mockups Q6–Q9".
- **Code Generation:** làm đúng cấu trúc HTML, biến CSS và hành vi ARIA đã đặc tả.
- **Build and Test:**
  - Chạy Lighthouse và W3C Validator.
  - Kiểm bằng bàn phím theo mục 2.
  - Ghi kết quả vào báo cáo test.

## Bổ sung Change Request 03/11/2026 (US6)

- [ ] Tên phòng ban trong bảng là liên kết thật (`<a>`), tên truy cập "Xem phòng ban <tên>".
- [ ] Cột "Số nhân viên" có tiêu đề cột (`th scope=col`), số căn phải nhưng vẫn đọc được bằng trình đọc màn hình.
- [ ] Ô chọn phòng ban có nhãn "Phòng ban" gắn với ô; đổi lựa chọn không làm mất focus.
- [ ] Dòng "Tìm thấy N nhân viên…" và "Phòng ban đã chọn không còn tồn tại" đặt trong vùng `aria-live=polite`.
- [ ] Hộp "Không thể xóa phòng ban" là `<dialog>` có tiêu đề, focus vào nút Đóng, Esc đóng được, focus trả về nút Xóa.
- [ ] Gợi ý quy ước tên gắn vào ô bằng `aria-describedby`.
- [ ] Trang chi tiết có đúng một `h1` (tên phòng), tiêu đề tab "<tên phòng> – Quản lý nhân sự".
- [ ] Trang chi tiết: đường dẫn `nav` có nhãn "Đường dẫn", mục cuối có `aria-current="page"`.
- [ ] Xóa phòng từ trang chi tiết xong: focus vào `h1` của trang Phòng ban.
