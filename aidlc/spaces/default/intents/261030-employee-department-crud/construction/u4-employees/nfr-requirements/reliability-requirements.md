# Yêu cầu tin cậy: u4-employees

> **Nguồn:** `requirements.md` (NFR1, NFR3, NFR4), `functional-design/rules.md` (BR1.7, BR1.9, BR2.6, BR2.7, BR3.1–BR3.4), `contract-summary.md` (C3 database_constraint_violations, C5), rà soát Functional Design U4, bài học U3 (DbUpdateConcurrencyException, tên ràng buộc phải khớp hằng).

## 1. Toàn vẹn dữ liệu ở database (NFR3)

| ID | Yêu cầu | Đạt khi | Nguồn |
|---|---|---|---|
| NFR3.1 | Database tự chặn email trùng (không phân biệt hoa thường) | Có chỉ mục không trùng tên đúng `ux_employees_email` trên `lower(email)`; chèn SQL tay "A@CongTy.vn" khi đã có "a@congty.vn" bị từ chối (23505) | BR3.2, AC5.3.3 |
| NFR3.2 | Độ dài được giữ ở database | `full_name varchar(100) NOT NULL`, `email varchar(254) NOT NULL`, `department_id integer NOT NULL` | BR3.1 |
| NFR3.3 | Database chặn xóa phòng ban còn nhân viên | Khóa ngoại tên đúng `fk_employees_department` (dùng hằng `DbConstraintNames.EmployeeDepartmentForeignKey`), `ON DELETE RESTRICT`; `DELETE` SQL tay một phòng ban còn nhân viên bị từ chối (23503) | BR3.3, rà soát U3 |
| NFR3.4 | Hai thao tác chen nhau không ra 500 | 23505 email → 409 `errors.email` (U1 đổi); 23503 `fk_employees_department` khi thêm/sửa nhân viên → 400 `errors.departmentId` "Phòng ban không tồn tại" (U4 bắt); sửa/xóa nhân viên vừa bị xóa → 404 (U4 bắt `DbUpdateConcurrencyException`) | BR2.6, C3 |
| NFR3.5 | Xóa phòng ban còn nhân viên luôn ra 409 | `DepartmentService.DeleteAsync` kiểm trước (BR2.7); đường dự phòng 23503 của U3 giữ nguyên; cả hai cùng một lời báo | BR2.7, AC1.4.3 |
| NFR3.6 | Thứ tự kiểm cố định | Thêm: dữ liệu → phòng ban tồn tại → email trùng. Sửa: **tìm nhân viên trước (404)** → dữ liệu → phòng ban → email | Rà soát Functional Design U4 (Minor 1) |

## 2. Migration (NFR1)

| ID | Yêu cầu | Đạt khi | Nguồn |
|---|---|---|---|
| NFR1.1 | Migration 2 chạy được và quay lui được | `dotnet ef database update` tạo bảng, chỉ mục, khóa ngoại; quay về migration `CreateDepartments` thì xóa sạch phần của U4 mà bảng `departments` và dữ liệu phòng ban còn nguyên | NFR1, BR3.4 |
| NFR1.2 | Không có nhân viên mẫu | Ngay sau migration, `GET /api/employees` trả `[]` | AC1.5.2, BR3.4 |
| NFR1.3 | Không sửa migration đã chạy | `CreateDepartments` không đổi; U4 chỉ thêm migration mới | C5 |

## 3. Test tự động (NFR4)

| ID | Yêu cầu | Đạt khi | Nguồn |
|---|---|---|---|
| NFR4.1 | Unit test cho `EmployeeService` | Mỗi thao tác (đọc, tìm, tạo, sửa, xóa) có ít nhất 1 ca đúng và 2 ca lỗi/biên; dùng bộ ví dụ email hợp lệ/không hợp lệ của BR1.6; có ca PUT id không tồn tại kèm body sai → 404 | NFR4, team.md, rà soát U4 |
| NFR4.2 | Unit test bổ sung cho `DepartmentService` | Xóa phòng ban còn nhân viên → Conflict có tên phòng ban; xóa phòng ban không còn nhân viên vẫn được | BR2.7 |
| NFR4.3 | Độ phủ dòng ≥ 80% cho từng lớp service | `EmployeeService` ≥ 80% và `DepartmentService` vẫn ≥ 80%, đọc bằng `npm --prefix frontend run coverage` | NFR4, team.md |
| NFR4.4 | Đường lỗi database được thử | 23503 khi ghi nhân viên và `DbUpdateConcurrencyException` thử bằng `ThrowingAppDbContext` (đã có từ U3); email trùng thật, khóa ngoại thật, tìm chữ hoa có dấu ("Đỗ Văn An" với `đỗ`, `ĐỖ`, `đỗ văn`) và `?search=%` kiểm trên PostgreSQL thật bằng Postman / pgAdmin | Rà soát U4 (Minor 2, 3) |
