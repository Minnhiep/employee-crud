# Câu hỏi phân tích yêu cầu: sửa lỗi lượt 6 và rà soát theo `docs/ke-hoach.md`

Ai trả lời cũng được; phần trong ngoặc vuông chỉ nói câu đó thuộc về vai nào. Điền đáp án sau `[Answer]:`.

## Q1. [Quản lý sản phẩm] Có siết luật định dạng email không?

Hiện API nhận email như `a..b@x.com`, `.a@x.com`, `a,b@x.com`, `<x>@x.com` (lượt 6 đã ghi nhận). Hệ thống thực tế thường từ chối các dạng này, nhưng siết lại là đổi luật nghiệp vụ, trong khi việc này đã ghi "không đổi luật nghiệp vụ".

A. Giữ nguyên luật, ghi vào danh sách "em đề xuất" (đúng phiếu đã duyệt)
B. Siết định dạng email ở cả form và API, kèm test (đổi luật, phải nới giới hạn của việc này)
X. Other (please specify)

[Answer]: A

## Q2. [Quản lý sản phẩm] Sửa thêm nhóm nào ngoài 5 việc đã duyệt? (select all that apply)

Các nhóm này đều có thật khi đọc code, nhưng chưa nằm trong phiếu lượt 6. Ở form trước bạn chọn "bám đề, sửa mọi thứ sai và lỗi kỹ thuật".

A. Tài liệu và comment sai: 4 dòng sai kết quả mong đợi trong danh sách kiểm tay (DOC-6), bản nháp tìm hiểu khác bài thật (DOC-7), xưng hô lẫn lộn (DOC-8), 4 comment lệch code (BE-4). Không đổi hành vi.
B. Dọn code, không đổi hành vi: gom một câu báo lỗi về `ErrorTitles` (BE-5), một hàm kiểm id dùng chung (FE-4), bỏ CSS thừa và chỉnh màu viết thẳng (FE-10), bỏ thư mục `Controllers` rỗng (BE-10).
C. Lỗi giao diện nhỏ: chữ cái đầu bị vỡ với emoji (FE-7), chuỗi tìm dán từ địa chỉ không được chuẩn hóa (FE-8), focus sau lỗi xóa ở trang chi tiết phòng ban (FE-9).
D. Bổ sung test: biên email đúng 254 ký tự, sửa test phụ thuộc hẹn giờ cố định (BE-8).
X. Other (please specify)

[Answer]: A, B, C, D. Người dùng ghi thêm: "chuẩn đúng nghiệp vụ  các cty đang dùng" (xem Q5)

## Q3. [Lập trình viên] Chặn những ký tự nào để hết lỗi 500?

Chạy thật trên API: chỉ U+FFFE gây 500; U+FFFF, U+FDD0, U+FDEF, U+1FFFE, U+10FFFF đều trả 200. Đây là nhóm "noncharacter", ký tự Unicode dành riêng, không dùng để trao đổi dữ liệu.

A. Chặn cả nhóm noncharacter ở form và API: một luật rõ, không phải vá từng ký tự
B. Chỉ chặn U+FFFE: thay đổi ít nhất, đúng nguyên văn phiếu
X. Other (please specify)

[Answer]: A

## Q4. [Lập trình viên] Khóa những lối nào khi form đang lưu?

Chạy thật trên trình duyệt: bấm Hủy lúc đang lưu thì dữ liệu vẫn được lưu. Phiếu chỉ nêu nút Hủy, nhưng breadcrumb và menu vẫn bấm được, và sau khi lưu xong trang còn tự chuyển người dùng đi.

A. Khóa Hủy và breadcrumb trong form, đồng thời không tự chuyển trang nếu người dùng đã rời form
B. Chỉ khóa nút Hủy: đúng nguyên văn phiếu
C. Khóa cả menu chung: chặn kín nhất, nhưng phải sửa thêm component dùng chung
X. Other (please specify)

[Answer]: A

## Q5. [Quản lý sản phẩm] "Chuẩn đúng nghiệp vụ các công ty đang dùng" áp dụng tới đâu?

Ở Q2 bạn ghi thêm câu này, còn ở Q1 bạn giữ nguyên luật email và trước đó chọn bám đề. Cần chốt câu này có nới phạm vi không, vì nó quyết định có đổi hành vi API hay không.

A. Là mức chất lượng cho các nhóm đã chọn: làm đến nơi theo thông lệ, có test và có nguồn; không thêm tính năng, không đổi luật nghiệp vụ
B. Như A, và làm thêm: thống nhất thứ tự kiểm khi sửa ở hai API (BE-3, có đổi mã lỗi trả về trong trường hợp lỗi kép), bỏ lặp khối báo lỗi và tách 2 file trang dài (FE-5, FE-6)
X. Other (please specify)

[Answer]: A
