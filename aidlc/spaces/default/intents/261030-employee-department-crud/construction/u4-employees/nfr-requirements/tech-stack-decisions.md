# Lựa chọn công nghệ: u4-employees

> **Nguồn:** `project.md` (Tech Stack), `team.md` (Testing Posture Q7, Code Style Q10), `contract-summary.md` (C2, C4, C5), lựa chọn đã chạy được ở U3 (InMemory, `ThrowingAppDbContext`, reportgenerator, chỉ mục viết tay), rà soát Functional Design U4.

| ID | Hạng mục | Chọn | Vì sao | Phương án bị loại |
|---|---|---|---|---|
| NFR6.4 | Tầng code | Controller → Service (`IEmployeeService`) → DTO, trong thư mục `Employees/`; `Employee` có thuộc tính điều hướng `Department` để lấy tên phòng ban | Giống U3, Hiệp giải thích được từng tầng | Repository riêng (EF Core đã là lớp truy cập dữ liệu) |
| NFR6.5 | Tên bảng, cột | `ToTable("employees")`, `HasColumnName("full_name")`, `"email"`, `"department_id"`, khai tay | team.md Q10 | Gói `EFCore.NamingConventions` |
| NFR3.7 | Chỉ mục email không trùng không phân biệt hoa thường | `CREATE UNIQUE INDEX ux_employees_email ON employees (lower(email))` viết tay trong migration 2, `DROP INDEX` ở `Down` | Như U3: EF không sinh được chỉ mục trên biểu thức; tên phải khớp hằng U1 | Đổi email về chữ thường khi lưu (Hiệp chọn giữ như đã gõ, Q1); kiểu `citext` |
| NFR3.8 | Khóa ngoại | Khai bằng cấu hình EF: `HasOne(Department).WithMany().HasForeignKey(DepartmentId).HasConstraintName(DbConstraintNames.EmployeeDepartmentForeignKey).OnDelete(Restrict)`, chỉ mục `department_id` đặt tên `ix_employees_department_id` | EF tự sinh câu tạo khóa ngoại; dùng hằng nên tên không thể lệch (rà soát U3) | Viết tay SQL khóa ngoại (dễ lệch tên, mô hình EF không biết) |
| NFR4.5 | Cách tìm kiếm | `e.FullName.ToLower().Contains(term.ToLower()) \|\| e.Email.ToLower().Contains(term.ToLower())` trong LINQ | EF Core tự thoát `%`, `_` khi dịch `Contains`; chạy được cả trên InMemory lẫn PostgreSQL; cùng kiểu so `lower()` với U3 | `EF.Functions.ILike` (InMemory không chạy được, phải tự thoát ký tự đại diện — rà soát U4 Minor 3) |
| NFR4.6 | Luật định dạng email | Một biểu thức chính quy cùng nội dung ở C# (`EmployeeService`) và TypeScript (`validateEmployee.ts`), cả hai có comment trỏ về BR1.6; bộ ví dụ ở BR1.6 là chuẩn cho unit test | Q2: một luật chung; dễ giải thích | `[EmailAddress]` của .NET (cho qua "a@b"), `type="email"` của trình duyệt (luật khác) |
| NFR4.7 | Test service | Dùng lại `TestDb` và `ThrowingAppDbContext` của U3 (gom về một chỗ dùng chung trong project test nếu cần); `Microsoft.EntityFrameworkCore.InMemory` đã có | Không thêm gói mới | SQLite in-memory (lower() chỉ đổi chữ ASCII) |
| NFR6.6 | Gọi API và tìm kiếm ở giao diện | `src/api/employees.ts` trên `client.ts`; chuỗi tìm lấy từ `useSearchParams` của React Router | Địa chỉ là nguồn đúng duy nhất: Back/F5 tự đúng | Lưu chuỗi tìm trong state riêng (dễ lệch với địa chỉ) |

Không thêm gói hay công cụ mới so với U3.
