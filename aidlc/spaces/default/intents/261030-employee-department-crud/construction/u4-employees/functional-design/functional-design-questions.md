# Câu hỏi Functional Design: u4-employees

> Đã chốt từ trước nên không hỏi lại:
> - Trường và giới hạn: họ tên ≤ 100, email ≤ 254, phòng ban bắt buộc (`requirements.md` mục 2).
> - API C2, lỗi C3.
> - Tìm kiếm: nút "Tìm" hoặc Enter; giữ `?search=` trên địa chỉ; không phân biệt hoa thường, có phân biệt dấu; `%` và `_` là chữ thường (`interaction-spec.md` F4, C2).
> - Chặn xóa phòng ban còn nhân viên (C4).
>
> Còn ba chỗ cần Hiệp chọn.

## Q1. Lưu email thế nào?

Bối cảnh: `requirements.md` mục 8 để Functional Design quyết. Dù chọn cách nào, email vẫn bị chặn trùng khi khác hoa thường (FR2.5): "A@CongTy.vn" trùng với "a@congty.vn".

A. Giữ nguyên như người dùng gõ (chỉ bỏ khoảng trắng hai đầu). Database chặn trùng bằng chỉ mục trên `lower(email)`, giống cách làm tên phòng ban ở U3. Người dùng thấy lại đúng chữ mình đã nhập. (Khuyên dùng)
B. Đổi hết về chữ thường trước khi lưu. Chỉ mục so trực tiếp, đơn giản hơn một chút, nhưng "An.Nguyen@CongTy.vn" sẽ hiện thành "an.nguyen@congty.vn".
X. Other (please specify)

[Answer]: A

## Q2. Kiểm "đúng định dạng email" chặt tới đâu?

Bối cảnh: form React và API phải dùng **cùng một luật**, để không có chuyện form cho qua mà API chặn (hoặc ngược lại).

A. Một luật đơn giản dùng chung cho cả hai bên: có đúng một `@`, trước và sau `@` không rỗng, phần sau `@` có dấu chấm và không ở cuối, không có khoảng trắng. Ví dụ "a@congty.vn" hợp lệ; "abc", "a@b", "a @b.vn" không hợp lệ. Dễ giải thích, đủ cho bài. (Khuyên dùng)
B. Dùng sẵn `[EmailAddress]` của .NET ở API và `type="email"` của trình duyệt ở form. Ít code hơn, nhưng hai bên có luật khác nhau (`[EmailAddress]` cho qua "a@b"), dễ lệch.
X. Other (please specify)

[Answer]: A

## Q3. Form nhân viên khi chưa có phòng ban nào?

Bối cảnh: migration có 4 phòng ban mẫu, nhưng người dùng có thể xóa hết. Khi đó ô "Phòng ban" không có gì để chọn.

A. Ô chọn hiện "-- Chưa có phòng ban --" và bị khóa. Phía dưới hiện dòng "Chưa có phòng ban nào. Hãy thêm phòng ban trước." kèm liên kết tới `/departments/new`. Nút Lưu vẫn bấm được; bấm thì báo "Vui lòng chọn phòng ban" như bình thường. (Khuyên dùng)
B. Không xử lý riêng: ô chọn chỉ có "-- Chọn phòng ban --", bấm Lưu thì báo "Vui lòng chọn phòng ban".
X. Other (please specify)

[Answer]: A
