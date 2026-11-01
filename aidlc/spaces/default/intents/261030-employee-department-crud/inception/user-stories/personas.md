# Persona

> Nguồn:
> - `requirements-analysis/requirements.md`: mục 1, chỉ một người dùng, không đăng nhập; FR7 về phần bàn giao.
> - `user-stories-questions.md`: câu Q1, Hiệp chọn hai persona.

## P1. Người quản lý nhân sự (persona chính)

- **Vai trò:** người dùng giao diện web để quản lý danh sách phòng ban và nhân viên của một công ty nhỏ.
- **Mục tiêu:**
  - Xem nhanh ai thuộc phòng ban nào.
  - Thêm, sửa, xóa phòng ban và nhân viên mà không làm hỏng dữ liệu.
  - Tìm một nhân viên theo tên hoặc email.
- **Khó khăn hiện tại:**
  - Ghi chép tay hoặc bằng bảng tính dễ bị trùng email, gõ sai định dạng.
  - Dễ xóa nhầm một phòng ban vẫn còn người.
- **Mức quen máy tính:** trung bình. Đọc được tiếng Việt, không biết về API hay database.
- **Tần suất dùng:** hằng ngày, mỗi lần vài thao tác.
- **Điều kiện dùng:** một người, trên trình duyệt Chrome hoặc Edge của máy cá nhân, không đăng nhập.

## P2. Người cài đặt / người hướng dẫn (persona phụ)

- **Vai trò:** người nhận bài bàn giao, ví dụ anh Hiếu hoặc một thành viên khác. Người này cài ứng dụng lên máy mình, gọi thử API, đối chiếu sơ đồ database và nghe Hiệp trình bày.
- **Mục tiêu:**
  - Cài và chạy được ứng dụng từ bản clone sạch chỉ bằng README.
  - Kiểm được từng endpoint bằng Postman theo danh sách API.
  - Thấy sơ đồ database khớp với database thật.
- **Khó khăn hiện tại:**
  - Hướng dẫn thiếu bước, không biết đặt mật khẩu database ở đâu.
  - Tài liệu API không khớp với code.
- **Mức quen máy tính:** cao. Dùng được .NET, Node, PostgreSQL, Postman.
- **Tần suất dùng:** vài lần, lúc nhận bài và lúc xem demo.

## Thứ tự ưu tiên và quan hệ

1. **P1** là người dùng thật của phần mềm. Mọi story giao diện (nhóm 1–4) phục vụ P1.
2. **P2** dùng phần bàn giao (nhóm 5) để kiểm chứng phần P1 dùng. P2 không thao tác thay P1, nhưng cũng có thể mở giao diện để xem demo.
