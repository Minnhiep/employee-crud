# Refined Mockups: câu hỏi về giao diện

Kế hoạch classic không có bước phác thảo thô, nên chưa có wireframe hay user flow từ trước. Giao diện được thiết kế thẳng từ `user-stories/stories.md` và `requirements-analysis/requirements.md`.

Những gì đã chốt thì không hỏi lại:
- Hai trang "Nhân viên" và "Phòng ban", chuyển bằng menu (React Router); form thêm/sửa là trang riêng.
- Xóa phải xác nhận, hộp xác nhận ghi tên mục sắp xóa.
- Ba trạng thái tải, lỗi, trống.
- Chữ trên giao diện bằng tiếng Việt.
- Không phân trang.
- Một ô tìm kiếm.

---

## Q1. [Thiết kế giao diện] Giao diện dùng cách trình bày (CSS) nào?

Đề chỉ yêu cầu React, không nói gì về thư viện giao diện. Thêm thư viện thì đẹp nhanh hơn, nhưng có thêm thứ phải học và giải thích.

A. CSS thuần tự viết trong một vài file `.css`, không thêm thư viện. Dễ đọc, dễ giải thích, đúng đề (Đề xuất)
B. Thêm Bootstrap (thư viện CSS nhẹ, chỉ dùng class sẵn có) (ngoài đề)
C. Thêm thư viện component đầy đủ như MUI hoặc Ant Design (ngoài đề, nặng hơn)
X. Other (please specify)

[Answer]: A

## Q2. [Thiết kế giao diện] Hộp xác nhận xóa làm thế nào?

A. Dùng hộp hỏi sẵn có của trình duyệt (`window.confirm`, ví dụ "Xóa phòng ban "Kế toán"?"). Ít code nhất, tự dùng được bằng bàn phím (Đề xuất)
B. Tự làm một hộp nổi (modal) trong trang, trông đẹp và đồng bộ hơn, nhưng phải tự lo giữ con trỏ trong hộp, phím Esc để đóng... (nhiều code hơn)
X. Other (please specify)

[Answer]: A

## Q3. [Thiết kế giao diện] Ô tìm kiếm chạy khi nào?

A. Bấm nút "Tìm" hoặc nhấn Enter thì mới tìm. Ít request, code đơn giản, dễ giải thích (Đề xuất)
B. Gõ tới đâu tìm tới đó, chờ khoảng 300 mili giây sau khi ngừng gõ rồi mới gọi API (kỹ thuật debounce)
X. Other (please specify)

[Answer]: A

## Q4. [Thiết kế giao diện] Thông báo "Đã lưu" (story Should US4.5) hiện thế nào?

A. Một dòng thông báo màu xanh có biểu tượng ✓ ở đầu trang danh sách, tự ẩn sau 5 giây (Đề xuất)
B. Dòng thông báo như A nhưng ở lại cho tới khi người dùng bấm "×" để đóng
X. Other (please specify)

[Answer]: A

## Q5. [Thiết kế giao diện] Giao diện cần chạy tốt trên màn hình cỡ nào?

`requirements.md` đã giả định demo trên máy tính, chưa cần giao diện riêng cho điện thoại.

A. Thiết kế cho màn hình máy tính (rộng từ 1024px). Màn hẹp hơn vẫn dùng được: bảng tự cuộn ngang, form xếp một cột (Đề xuất)
B. Làm đầy đủ cho cả điện thoại: bảng biến thành dạng thẻ, menu thu gọn (ngoài đề)
X. Other (please specify)

[Answer]: A

## Q6. [Thiết kế giao diện] Mức hỗ trợ người khuyết tật (accessibility) đến đâu?

Accessibility là làm sao cho người dùng bàn phím, trình đọc màn hình hay người nhìn kém vẫn dùng được. Tiêu chuẩn phổ biến là WCAG 2.1 mức AA.

A. Mức cơ bản, khớp story Should US4.6:
   - Mỗi ô có nhãn.
   - Mọi thao tác làm được bằng bàn phím, có viền khi chọn (focus).
   - Lỗi viết bằng chữ, không chỉ bằng màu.
   - Chữ đủ tương phản (tỉ lệ 4.5:1).
   - Kiểm bằng tay và bằng Lighthouse trong Chrome.
   - Không cam kết đạt đủ WCAG.
   (Đề xuất)
B. Cam kết đạt đủ WCAG 2.1 AA và kiểm thêm bằng trình đọc màn hình NVDA (ngoài đề, tốn công)
X. Other (please specify)

[Answer]: X: chuẩn chỉnh hết mọi thứ, chuẩn hóa toàn bộ này kia luôn, tốc độ router,....

---

## Câu hỏi làm rõ thêm (từ câu trả lời Q6)

Ở Q6, Hiệp muốn "chuẩn chỉnh hết mọi thứ, chuẩn hóa toàn bộ, tốc độ router...". Câu trả lời này rộng hơn chuyện accessibility. Để viết thành tiêu chí đo được, cần chốt ba ý dưới đây. Các ý này vượt `docs/ke-hoach.md`, nhưng chính Hiệp yêu cầu nên sẽ được ghi rõ nguồn là "Hiệp yêu cầu ở Q6".

## Q7. [Thiết kế giao diện] "Chuẩn chỉnh" về accessibility nghĩa là mức nào?

A. Đạt đủ WCAG 2.1 mức AA. Kiểm bằng điểm Accessibility của Lighthouse đạt 100 và thử toàn bộ thao tác chỉ bằng bàn phím (Đề xuất)
B. Như A, kiểm thêm bằng trình đọc màn hình NVDA trên Windows
X. Other (please specify)

[Answer]: A

## Q8. [Thiết kế giao diện] "Tốc độ router" (tốc độ chuyển trang) cần đạt gì?

React Router chuyển trang ngay trong trình duyệt, không tải lại cả trang, nên vốn đã nhanh. Câu này chốt có đặt con số đo hay không.

A. Đặt con số đo:
   - Bấm menu để chuyển giữa Nhân viên và Phòng ban thì khung trang hiện ngay, không tải lại trang.
   - Bản build (`npm run build` rồi `npm run preview`) đạt điểm Performance của Lighthouse ≥ 90 trên máy phát triển.
   (Đề xuất)
B. Như A, và chia nhỏ code theo từng trang (lazy loading) để trang đầu nhẹ hơn
C. Chỉ cần chuyển trang không tải lại (mặc định của React Router), không đặt con số
X. Other (please specify)

[Answer]: A

## Q9. [Thiết kế giao diện] "Chuẩn hóa toàn bộ" còn gồm gì nữa? (select all that apply)

Đã chốt từ trước: định dạng và kiểm lỗi code (`dotnet format`, ESLint, Prettier), API REST với lỗi ProblemDetails, chữ tiếng Việt.

A. HTML đúng chuẩn: dùng thẻ đúng nghĩa (`header`, `nav`, `main`, `table`, `form`), khai báo `lang="vi"`, không lỗi khi kiểm bằng W3C Validator
B. Thống nhất giao diện: một bảng màu, cỡ chữ và khoảng cách đặt ở biến CSS dùng chung; nút, bảng và form trông giống nhau ở mọi trang
C. Điểm Best Practices của Lighthouse ≥ 90 (không lỗi console, không dùng API cũ)
D. Không thêm gì nữa ngoài Q7 và Q8
X. Other (please specify)

[Answer]: A, B, C; X: chuẩn chỉnh hoàn toàn
