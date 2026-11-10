# Câu hỏi làm rõ yêu cầu: sua-ra-soat-ban-giao

Bối cảnh: việc này sửa danh sách rà soát bàn giao (`aidlc/spaces/default/intents/261109-kiem-cuoi-crlf/ra-soat-ban-giao.md`), nhóm A (tài liệu, 16 mục), B (backend, 9 mục), C (frontend, 13 mục), mọi mức trừ nhóm E; bám `docs/ke-hoach.md`, không thêm tính năng. Phần lớn các mục đã có cách sửa rõ ràng trong danh sách; bốn câu dưới đây là chỗ cần Hiệp chọn. Các mục còn lại được ghi thành giả định trong `requirements.md`.

## Q1. [Backend] Khi sửa (PUT) phòng ban, kiểm "có tồn tại không" trước hay kiểm "tên hợp lệ không" trước? (B-9)

Hiện `DepartmentService.UpdateAsync` kiểm tên trước rồi mới tìm bản ghi, còn `EmployeeService.UpdateAsync` tìm bản ghi trước (có test chứng minh "sửa người không tồn tại luôn ra 404, kể cả khi dữ liệu cũng sai"). Khác biệt chỉ lộ ra khi tên toàn khoảng trắng hoặc quá dài, vì `[Required]` của ASP.NET Core chạy trước cả hai. Ví dụ: `PUT /api/departments/99999` với tên quá 100 ký tự hiện trả 400, còn với nhân viên thì trả 404.

A. Đổi code phòng ban cho giống nhân viên: tìm bản ghi trước (404), rồi mới kiểm tên (400); thêm 1 test hồi quy; ghi thứ tự này trong `docs/danh-sach-api.md`
B. Giữ code như hiện tại, chỉ ghi rõ sự khác nhau trong `docs/danh-sach-api.md`
X. Other (please specify)

[Answer]: A
**Mode:** guided

## Q2. [Giao diện] Mục gốc "Nhân sự" trên đường dẫn trang (breadcrumb) xử lý thế nào? (C-13)

Mọi trang đều bắt đầu bằng mục "Nhân sự" không bấm được. Ở trang chi tiết phòng ban tên "Nhân sự" sẽ hiện "Nhân sự › Phòng ban › Nhân sự", dễ gây hiểu nhầm khi demo. Một mục breadcrumb không phải trang hiện tại thì thường là liên kết bấm được.

A. Đổi mục gốc thành "Trang chủ" và cho bấm được, dẫn về trang đầu (`/`, đang chuyển tới danh sách nhân viên): "Trang chủ › Phòng ban › Nhân sự"
B. Giữ chữ "Nhân sự" nhưng cho bấm được, dẫn về trang đầu
C. Bỏ hẳn mục gốc: trang danh sách chỉ còn tiêu đề, trang con là "Nhân viên › Thêm mới"
D. Giữ nguyên như hiện tại
X. Other (please specify)

[Answer]: A
**Mode:** guided

## Q3. [Tài liệu và demo] Trang `docs/luong-xu-ly-thuc-te.md` ghi những "vấn đề đã gặp" nào để trình bày khi demo? (A-12) (select all that apply)

Đề `docs/ke-hoach.md` §5 yêu cầu demo trình bày "luồng xử lý và những vấn đề đã gặp". Trang mới sẽ có một luồng "Thêm nhân viên" chỉ vào file và hàm thật, cộng các vấn đề được chọn dưới đây, mỗi vấn đề ghi triệu chứng, nguyên nhân, cách xử lý.

A. Lỗi môi trường trên Windows: kiểu xuống dòng CRLF làm Prettier báo lỗi hàng loạt; Smart App Control chặn file `.dll` vừa build; `psql` không có trong PATH
B. Dữ liệu chữ: ký tự vô hình và chữ có dấu dạng tổ hợp lách được luật "không trùng" (sửa bằng chuẩn hóa NFC, gộp khoảng trắng); email trùng khác hoa thường (chỉ mục `lower(email)`)
C. Chen nhau khi xóa phòng ban: kiểm "còn nhân viên" rồi mới xóa vẫn có thể lọt nếu có người thêm nhân viên giữa chừng; khóa ngoại `RESTRICT` chặn lớp cuối và API đếm lại để báo đúng số người
D. CORS: mở giao diện bằng `127.0.0.1` thay vì `localhost` thì trình duyệt chặn gọi API
X. Other (please specify)

[Answer]: A, B, C, D
**Mode:** guided

## Q4. [Kiểm thử] Công cụ đo độ phủ test chuẩn của dự án là gì? (A-6)

`team.md` ghi coverlet (`npm run coverage`). Trên máy bật Smart App Control, coverlet bị chặn nên trước đây phải đo bằng Microsoft Code Coverage; tối 09/11, khi Smart App Control đã tắt tạm, coverlet chạy được và ra service 100%. Câu hỏi này Hiệp còn để mở từ 03/11.

A. Giữ coverlet làm cách chuẩn; README mục 11 thêm 2 lệnh đo bằng Microsoft Code Coverage cho máy bật Smart App Control (có lọc `-assemblyfilters:+EmployeeCrud.Api` để chỉ tính code ứng dụng); không sửa `team.md`
B. Đổi hẳn sang Microsoft Code Coverage: sửa script `coverage`, README và ghi lại luật kiểm thử trong `team.md`
X. Other (please specify)

[Answer]: A
**Mode:** guided
