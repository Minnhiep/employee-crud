# Yêu cầu mở rộng: u4-employees

> **Nguồn:** `requirements.md` (NFR5: tối đa 1.000 nhân viên; FR2.1 không phân trang; mục 6), `functional-design/functional-spec.md`.

| ID | Yêu cầu | Ngưỡng | Nguồn |
|---|---|---|---|
| NFR5.6 | Số nhân viên dự kiến | Thiết kế cho tới 1.000 nhân viên; trả cả danh sách (hoặc cả kết quả tìm) một lần, không phân trang | FR2.1, NFR5 |
| NFR5.7 | Service không giữ trạng thái giữa các request | `EmployeeService` đăng ký Scoped, dùng `AppDbContext` của request đó; không có biến `static` chứa dữ liệu | Như U3 (một tiến trình) |
| NFR5.8 | Kiểm "phòng ban còn nhân viên" không quét cả bảng | Có chỉ mục trên `department_id` để câu kiểm của `DepartmentService.DeleteAsync` và khóa ngoại dùng được | BR2.7, BR3.3 |

Không áp dụng: nhiều bản chạy song song, chia tải, cache (một người dùng, một tiến trình). Ngưỡng xem lại: hơn 1.000 nhân viên thì thêm phân trang theo C2.
