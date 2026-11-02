# Thiết kế mở rộng: u4-employees

> **Nguồn:** `nfr-requirements/scalability-requirements.md` (NFR5.6–NFR5.8), thiết kế của U3.

## 1. Cỡ dữ liệu (NFR5.6)

- Thiết kế cho tới 1.000 nhân viên, trả cả danh sách hoặc cả kết quả tìm trong một lần, không phân trang (FR2.1).
- Đã đo ở mức này (performance-design §3). **Ngưỡng xem lại:** hơn 1.000 nhân viên thì thêm phân trang theo C2.

## 2. Service không giữ trạng thái (NFR5.7)

- `builder.Services.AddScoped<IEmployeeService, EmployeeService>()`. `EmployeeService` nhận `AppDbContext` và `IDepartmentService` qua constructor, cả hai đều Scoped nên cùng vòng đời request.
- Không có field `static` chứa dữ liệu. Biểu thức chính quy email là hằng (`static readonly Regex`), không phải dữ liệu, nên dùng chung an toàn.

## 3. Chỉ mục cho khóa ngoại (NFR5.8)

- Chỉ mục `ix_employees_department_id` trên `department_id`. Câu kiểm "còn nhân viên" của `DepartmentService.DeleteAsync` và việc PostgreSQL kiểm khóa ngoại khi xóa phòng ban đều dùng được chỉ mục này, không phải quét cả bảng `employees`.

## 4. Không làm

Không chạy nhiều bản, không chia tải, không cache. Lý do: một người dùng, một tiến trình (team.md Deployment).
