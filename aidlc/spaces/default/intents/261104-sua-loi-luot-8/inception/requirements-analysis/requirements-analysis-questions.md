# Câu hỏi phân tích yêu cầu: sửa 9 nhóm phát hiện từ lượt rà 8

Ai trả lời cũng được; phần trong ngoặc vuông chỉ nói câu đó thuộc về vai nào. Điền đáp án sau `[Answer]:`.

## Q1. [Quản lý sản phẩm] Từ trang chi tiết phòng ban bấm Sửa, xong thì về đâu?

Hiện cả Lưu và Hủy đều về danh sách phòng ban, trong khi thêm nhân viên từ trang chi tiết thì quay lại đúng trang chi tiết. Việc này chỉ ghi Hủy.

A. Cả Lưu và Hủy đều về lại trang chi tiết, giống form nhân viên
B. Chỉ Hủy về chi tiết, Lưu vẫn về danh sách
X. Other (please specify)

[Answer]: A

## Q2. [Quản lý sản phẩm] Hết 10 giây chờ lúc lưu hoặc xóa thì báo gì?

Hiện báo "Không kết nối được máy chủ" dù server có thể đã lưu, người dùng thử lại rồi gặp 409 khó hiểu.

A. Báo riêng cho thao tác ghi: "Máy chủ phản hồi quá lâu, chưa rõ đã lưu hay chưa. Hãy kiểm tra lại danh sách trước khi thử lại."
B. Giữ câu cũ, chỉ nâng thời gian chờ của thao tác ghi lên 30 giây
X. Other (please specify)

[Answer]: A

## Q3. [Quản lý sản phẩm] Trang không tìm thấy có đổi tiêu đề không?

Trang sửa khi không có bản ghi vẫn hiện tiêu đề "Sửa nhân viên" và câu "Trường có dấu * là bắt buộc." (`FE-19`). Việc này chưa nằm trong 9 nhóm.

A. Sửa luôn: tiêu đề "Không tìm thấy nhân viên", bỏ câu về trường bắt buộc, ở cả hai form
B. Giữ nguyên, chỉ sửa lỗi hai trạng thái cùng hiện
X. Other (please specify)

[Answer]: A

## Q4. [Lập trình viên] Làm sạch comment tới đâu?

Có 186 dòng ở 53 file trong code chạy, và 33 dòng ở 8 file test chứa mã nội bộ, lịch sử sửa hoặc tên người.

A. Cả code chạy và test, giữ phần giải thích "vì sao"
B. Chỉ code chạy, test để nguyên
X. Other (please specify)

[Answer]: A

## Q5. [Lập trình viên] Bỏ lọc khi tải phòng ban lỗi làm thế nào?

Địa chỉ có `?departmentId=` mà tải phòng ban lỗi thì ô lọc bị khóa, không có cách bỏ lọc.

A. Có nút "Thử lại" tải lại phòng ban và nút "Xóa bộ lọc" giữ nguyên chuỗi tìm
B. Chỉ có nút "Xóa bộ lọc"
X. Other (please specify)

[Answer]: A

## Q6. [Lập trình viên] Bỏ code chết ở `client.ts` tới đâu?

Nhánh `TimeoutError` không bao giờ chạy tới; `ApiError.title`, `ApiError.detail` được gán mà không nơi nào đọc; `type`, `status` của `ProblemDetails` không dùng.

A. Bỏ tất cả các phần không ai dùng
B. Chỉ bỏ nhánh `TimeoutError`, giữ `ApiError.title`, `.detail` để mở rộng sau
X. Other (please specify)

[Answer]: A
