# Domain Design: câu hỏi về các khối logic

Bước này chia phần mềm thành các **khối logic (component)**, tức là những phần code mình tự viết và mỗi phần lo một việc. Database PostgreSQL không phải là một khối; nó là thứ các khối dùng tới. Bước này **chưa** quyết cách đóng gói để chạy hay chọn thư viện: những chuyện đó để các bước sau.

Những gì đã chốt thì không hỏi lại:
- Một backend ASP.NET Core và một frontend React.
- Không dùng microservices.
- Backend chia tầng Controller → Service → DTO.
- Hai thực thể: Phòng ban (tên) và Nhân viên (họ tên, email, phòng ban).

---

## Q1. [Kiến trúc sư] Chia phần mềm thành những khối nào?

A. Bốn khối:
   - **Phòng ban** (backend): lo mọi luật về phòng ban.
   - **Nhân viên** (backend): lo luật về nhân viên và tìm kiếm.
   - **Nền tảng chung** (backend): kết nối database, migration, dữ liệu mẫu, chuyển lỗi thành ProblemDetails.
   - **Giao diện web** (React).
   Mỗi khối nghiệp vụ sở hữu đúng một thực thể (Đề xuất)
B. Ba khối: gộp Phòng ban và Nhân viên thành một khối "Quản lý nhân sự" + Nền tảng chung + Giao diện web. Ít ranh giới hơn, nhưng một khối ôm hai thực thể
C. Như A, nhưng tách Giao diện web thành hai khối riêng (giao diện phòng ban, giao diện nhân viên)
X. Other (please specify)

[Answer]: A

## Q2. [Kiến trúc sư] Luật "không xóa phòng ban còn nhân viên" do ai kiểm?

Để kiểm luật này, phía Phòng ban phải biết phòng đó còn nhân viên không, mà nhân viên lại thuộc khối Nhân viên. Có ba cách:

A. Khối Phòng ban **tự đếm** nhân viên của phòng bằng một truy vấn chỉ đọc (`AnyAsync`) vào bảng nhân viên trước khi xóa; còn nhân viên thì trả 409. Khóa ngoại trong database chặn thêm một lần nữa. Đơn giản, dễ giải thích, nhưng khối Phòng ban đọc dữ liệu của khối khác (Đề xuất)
B. Khối Phòng ban **hỏi khối Nhân viên** qua một hàm như `CountByDepartmentAsync`. Ranh giới sạch hơn, nhưng hai khối gọi qua lại nhau (Nhân viên cũng cần hỏi Phòng ban), tạo vòng phụ thuộc
C. Không kiểm trước, **chỉ dựa vào khóa ngoại**: cứ xóa, database từ chối thì bắt lỗi rồi chuyển thành 409. Không phụ thuộc chéo, nhưng phải hiểu mã lỗi riêng của PostgreSQL, khó giải thích hơn
X. Other (please specify)

[Answer]: A

## Q3. [Kiến trúc sư] Khối Nhân viên kiểm "phòng ban có tồn tại" và lấy tên phòng ban bằng cách nào?

A. Gọi qua khối Phòng ban (ví dụ `ExistsAsync(id)`) để kiểm tồn tại. Danh sách nhân viên lấy tên phòng ban bằng phép JOIN có sẵn của EF Core (`Include`). Nhân viên phụ thuộc một chiều vào Phòng ban (Đề xuất)
B. Khối Nhân viên tự truy vấn thẳng bảng phòng ban cho cả hai việc. Ít code hơn, nhưng đọc dữ liệu của khối khác ở nhiều chỗ hơn
X. Other (please specify)

[Answer]: A

## Q4. [Thiết kế giao diện] Code React xếp thư mục thế nào?

A. Theo tính năng:
   - `src/features/departments/`: trang, form, lời gọi API của phòng ban.
   - `src/features/employees/`: tương tự cho nhân viên.
   - `src/components/`: phần dùng chung như bảng, thông báo, khung trang.
   - `src/api/`: module gọi API chung.
   Muốn xem phần phòng ban thì mở một thư mục là đủ (Đề xuất)
B. Theo loại file: `src/pages/`, `src/components/`, `src/services/`. Quen thuộc với nhiều hướng dẫn trên mạng, nhưng code của một tính năng nằm rải ở nhiều thư mục
X. Other (please specify)

[Answer]: A
