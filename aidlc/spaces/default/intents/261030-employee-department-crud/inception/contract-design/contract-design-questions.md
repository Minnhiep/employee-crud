# Contract Design: câu hỏi về hợp đồng API

**Hợp đồng (contract)** là bản thỏa thuận ở chỗ hai phần mềm gặp nhau: gửi dữ liệu gì, theo dạng nào, khi lỗi thì trả gì. Hợp đồng chính của dự án là **Web API REST giữa giao diện React và backend**. Ngoài ra có hai chỗ nối bên trong backend: khối Nhân viên hỏi khối Phòng ban, và các unit dùng chung DbContext (xem `units-generation/unit-of-work-dependency.md`).

Những gì đã chốt thì không hỏi lại:
- Đường dẫn: `/api/departments`, `/api/employees`; tham số tìm kiếm tên `search`.
- JSON dùng tên trường camelCase.
- Mã trả về: 200 khi đọc hoặc sửa, 201 kèm `Location` khi tạo, 204 khi xóa, 400/404/409 dạng ProblemDetails.
- Danh sách nhân viên có `departmentName`.
- Id là số nguyên.
- Lời báo tiếng Việt.

---

## Q1. [Kiến trúc sư] Đường dẫn API có ghi số phiên bản không?

Số phiên bản (ví dụ `/api/v1/...`) giúp sau này đổi API mà không làm hỏng ứng dụng cũ. Ở đây chỉ có một giao diện React đi cùng backend.

A. Không ghi số phiên bản, giữ `/api/departments` như đã chốt. Mọi thay đổi chỉ được **thêm** (thêm trường mới), không đổi tên hay bỏ trường cũ (Đề xuất)
B. Thêm `/api/v1/` vào mọi đường dẫn ngay từ đầu (ngoài những gì đã chốt ở team-practices)
X. Other (please specify)

[Answer]: A

## Q2. [Kiến trúc sư] Lỗi 400 và 409 gửi về giao diện theo dạng nào?

Câu này quyết định giao diện biết gắn lời báo vào ô nào. Ở bước Refined Mockups, người rà soát đã chỉ ra điểm này còn mâu thuẫn (R-07).

A. Dùng dạng chuẩn của ASP.NET Core (ValidationProblemDetails) cho **cả 400 và 409**:
   - `title`: lời báo chung tiếng Việt.
   - `errors`: lỗi theo từng trường, ví dụ `{ "email": ["Email đã được sử dụng"] }`.
   - Riêng lỗi không gắn với ô nào (xóa phòng ban còn nhân viên) thì chỉ có `detail`.
   - Giao diện luôn lấy chữ từ API, không tự viết lại.
   (Đề xuất)
B. Lỗi 400 dùng `errors` như A. Lỗi 409 chỉ có `detail`; giao diện tự biết lỗi trùng thì gắn vào ô email hoặc ô tên, và tự viết câu báo
X. Other (please specify)

[Answer]: A

## Q3. [Kiến trúc sư] Giao diện gọi API mà chậm hoặc lỗi mạng thì xử lý thế nào?

A. Chờ tối đa 10 giây. Quá thời gian hoặc mất mạng thì báo "Không kết nối được máy chủ, vui lòng thử lại" và **không tự gọi lại**; người dùng bấm "Thử lại". Đơn giản, không bao giờ gửi trùng (Đề xuất)
B. Với lời gọi chỉ đọc (GET), tự gọi lại tối đa 3 lần trước khi báo lỗi; lời gọi ghi (POST/PUT/DELETE) thì không gọi lại
X. Other (please specify)

[Answer]: A
