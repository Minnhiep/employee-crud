# Yêu cầu bảo mật: u3-departments

> **Nguồn:** `requirements.md` (NFR2, NFR7), `functional-design/rules.md` (BR1.x, BR2.x), `contract-summary.md` (C1, C3), `project.md` Forbidden (không đăng nhập, không commit bí mật).
>
> Không có đăng nhập. Mục tiêu: kiểm dữ liệu ở biên, không để dữ liệu người dùng thành mã chạy, không lộ chi tiết kỹ thuật, không thêm bí mật mới.

| ID | Yêu cầu | Đạt khi | Nguồn |
|---|---|---|---|
| NFR2.1 | U3 không thêm bí mật nào | Migration, cấu hình, code không chứa chuỗi kết nối hay mật khẩu; quét `git grep --untracked -i -n -E "(password\|pwd)\s*=" -- backend frontend` ra 0 dòng | NFR2 |
| NFR2.2 | API kiểm lại mọi dữ liệu, không tin form | `DepartmentRequest.name` được kiểm bắt buộc và ≤ 100 ký tự sau khi bỏ khoảng trắng, ở cả DTO lẫn service; sai trả 400 ProblemDetails | BR1.1–BR1.3, FR4.2 |
| NFR2.3 | Truy vấn database luôn dùng tham số | Chỉ dùng LINQ của EF Core (tự sinh tham số); SQL viết tay chỉ có trong migration (tạo chỉ mục, không chứa dữ liệu người dùng) | Phòng SQL injection |
| NFR2.4 | Lỗi không lộ chi tiết kỹ thuật | Lỗi nghiệp vụ dùng `DomainError` của U1; lỗi lạ để U1 trả 500 chung chung; `detail` chỉ chứa tên phòng ban và id, không có câu SQL hay tên bảng | C3, NFR2.3 của U1 |
| NFR2.5 | Dữ liệu hiển thị như chữ | Trang phòng ban hiển thị tên bằng JSX (React tự thoát ký tự); không `dangerouslySetInnerHTML` | NFR7.4 của U2 |
| NFR7.1 | Dùng chung chính sách CORS của U1 | Không thêm cấu hình CORS riêng; controller phòng ban chạy sau `UseCors` của U1. Kiểm một POST thật từ `http://localhost:5173` không lỗi CORS (việc U2 chuyển sang) | NFR7 |

Không áp dụng: xác thực, phân quyền (project.md Forbidden).
