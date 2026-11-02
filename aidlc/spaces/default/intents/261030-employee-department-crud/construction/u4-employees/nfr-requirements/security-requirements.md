# Yêu cầu bảo mật: u4-employees

> **Nguồn:** `requirements.md` (NFR2, NFR7), `functional-design/rules.md` (BR1.x, BR2.2, BR4.3), `contract-summary.md` (C2, C3), `project.md` Forbidden (không đăng nhập, không commit bí mật), rà soát Functional Design U4 (lỗi binding sai kiểu).
>
> Không có đăng nhập. Mục tiêu: kiểm dữ liệu ở biên, không để dữ liệu người dùng (kể cả chuỗi tìm) thành mã chạy, không lộ chi tiết kỹ thuật, không thêm bí mật mới. Họ tên và email là dữ liệu cá nhân, nên không ghi vào log.

| ID | Yêu cầu | Đạt khi | Nguồn |
|---|---|---|---|
| NFR2.1 | U4 không thêm bí mật nào | Migration, cấu hình, code không chứa chuỗi kết nối hay mật khẩu; quét `git grep --untracked -i -n -E "(password\|pwd)\s*=" -- backend frontend` ra 0 dòng | NFR2 |
| NFR2.2 | API kiểm lại mọi dữ liệu, không tin form | `EmployeeRequest` được kiểm đủ BR1.1–BR1.9 ở service (sau khi bỏ khoảng trắng); sai trả 400 ProblemDetails có `errors` theo trường | BR1.x, FR4.2 |
| NFR2.3 | Chuỗi tìm và mọi dữ liệu đi vào database luôn là tham số | Chỉ dùng LINQ của EF Core; chuỗi tìm đi vào câu SQL dưới dạng tham số; `%` và `_` trong chuỗi tìm không thành ký tự đại diện (BR2.2); SQL viết tay chỉ có trong migration (tạo chỉ mục, không chứa dữ liệu người dùng) | Phòng SQL injection, C2 |
| NFR2.4 | Lỗi không lộ chi tiết kỹ thuật | Lỗi nghiệp vụ dùng `DomainError`; lỗi lạ để U1 trả 500 chung; `detail` chỉ chứa mã nhân viên hoặc tên phòng ban, không có câu SQL, tên bảng, tên ràng buộc | C3 |
| NFR2.5 | Dữ liệu hiển thị như chữ | Họ tên, email, tên phòng ban, chuỗi tìm (trong câu "Không tìm thấy ... với "<chuỗi>"") đều hiển thị bằng JSX; không `dangerouslySetInnerHTML`; email không biến thành liên kết `mailto:` | NFR7.4 của U2 |
| NFR2.6 | Body sai kiểu vẫn ra 400, không ra 500 | `departmentId` là chuỗi hay `fullName` là số → 400 ProblemDetails của U1; form hiện lỗi đó ở khung tóm tắt vì khóa lỗi không trùng tên ô | Rà soát Functional Design U4 (Minor 4) |
| NFR7.1 | Dùng chung chính sách CORS của U1 | Không thêm cấu hình CORS riêng; POST/PUT/DELETE thật từ `http://localhost:5173` không lỗi CORS | NFR7 |

Không áp dụng: xác thực, phân quyền (project.md Forbidden).
