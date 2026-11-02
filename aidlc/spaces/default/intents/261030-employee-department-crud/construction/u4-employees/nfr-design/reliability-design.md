# Thiết kế tin cậy: u4-employees

> **Nguồn:** `nfr-requirements/reliability-requirements.md` (NFR3.1–NFR3.6, NFR1.1–NFR1.3, NFR4.1–NFR4.4), `nfr-requirements/tech-stack-decisions.md` (NFR3.7, NFR3.8, NFR4.5–NFR4.7), `functional-design/rules.md`, cách làm đã chạy ở U3, rà soát Functional Design và NFR Requirements U4.

## 1. Database tự chặn dữ liệu sai (NFR3.1–NFR3.3, NFR3.7, NFR3.8)

- `EmployeeConfiguration`:
  - `ToTable("employees")`, cột `id`, `full_name` (`HasMaxLength(100)`, bắt buộc), `email` (`HasMaxLength(254)`, bắt buộc), `department_id`.
  - Khóa ngoại khai bằng cấu hình EF, **tên lấy từ hằng của U1** để không thể gõ lệch:

```csharp
// Minh họa ý thiết kế
builder.HasOne(e => e.Department).WithMany()
       .HasForeignKey(e => e.DepartmentId)
       .HasConstraintName(DbConstraintNames.EmployeeDepartmentForeignKey)
       .OnDelete(DeleteBehavior.Restrict);
builder.HasIndex(e => e.DepartmentId).HasDatabaseName("ix_employees_department_id");
```

- Chỉ mục email không trùng **viết tay** trong migration 2, như U3:
  `CREATE UNIQUE INDEX ux_employees_email ON employees (lower(email));`, và `DROP INDEX IF EXISTS ux_employees_email;` ở `Down`, trước khi xóa bảng.

## 2. Ai bắt lỗi nào khi hai thao tác chen nhau (NFR3.4, NFR3.5)

| Tình huống | Lỗi gốc | Ai bắt | Kết quả |
|---|---|---|---|
| Hai request cùng email vượt qua bước kiểm | 23505 `ux_employees_email` | U1 `ErrorMapper` (đã có) | 409 `errors.email` "Email đã được sử dụng" |
| Phòng ban bị xóa giữa lúc kiểm tồn tại và lúc lưu nhân viên | 23503 `fk_employees_department` | **U4** `EmployeeService` (thêm, sửa) | `DomainError.Validation("departmentId", "Phòng ban không tồn tại")` → 400 |
| Sửa/xóa nhân viên vừa bị xóa ở nơi khác | `DbUpdateConcurrencyException` | **U4** `EmployeeService` | 404 |
| Xóa phòng ban còn nhân viên | (kiểm trước) | **U4** thêm vào `DepartmentService.DeleteAsync` | `Conflict` "Không thể xóa phòng ban" → 409 |
| Như trên nhưng có người vừa thêm nhân viên sau bước kiểm | 23503 `fk_employees_department` | U3 (đường dự phòng đã có) | Cùng 409, cùng lời báo |

- `DepartmentService` dùng **một** hàm riêng để tạo lỗi "còn nhân viên", gọi từ cả bước kiểm trước lẫn nhánh bắt 23503. Nhờ vậy hai đường luôn ra cùng một câu.
- Kiểm "còn nhân viên": `db.Employees.AnyAsync(e => e.DepartmentId == id)`. `AppDbContext` thêm `DbSet<Employee> Employees`. Đây là thay đổi C4 `change_by_u4` (ADR-002), không đổi chữ ký hàm.
- **Giới hạn đã biết** (rà soát Code Generation U3): khi sửa mà mọi giá trị giữ nguyên, EF không gửi `UPDATE`, nên trường hợp "vừa bị xóa ở nơi khác" sẽ trả 200 thay vì 404. Chấp nhận, vì requirements mục 6 ghi "không xử lý xung đột khi hai người sửa cùng lúc"; comment trong code nói rõ giới hạn này.

## 3. Thứ tự kiểm cố định (NFR3.6)

- **Thêm:** trim + kiểm dữ liệu (BR1.1–BR1.6, BR1.8) → phòng ban tồn tại (BR1.9) → email trùng (BR1.7) → lưu.
- **Sửa:** tìm nhân viên (404) → như trên, với email trùng loại trừ chính nó → lưu.
- Có unit test cho PUT với id không tồn tại và body sai: kết quả phải là 404.

## 4. Migration 2 (NFR1.1–NFR1.3)

- Tên `CreateEmployees`. Tạo bằng `dotnet ef migrations add CreateEmployees`, rồi sửa tay để thêm chỉ mục email. Không chèn nhân viên mẫu; không sửa `CreateDepartments`.
- **Kiểm quay lui** (Hiệp duyệt lệnh, AI không gõ mật khẩu):
  1. `dotnet ef database update` → bảng `employees` xuất hiện.
  2. `dotnet ef database update CreateDepartments` → bảng `employees` biến mất; `departments` và dữ liệu phòng ban còn nguyên.
  3. `dotnet ef database update` lần nữa.
- Sau migration, `GET /api/employees` trả `[]` (NFR1.2).

## 5. Kiểm trên PostgreSQL thật (NFR4.4)

Unit test chạy trên InMemory, nên các điểm sau phải kiểm thật:

1. **Chữ hoa có dấu khi tìm:** thêm "Đỗ Văn An" (`do.an@congty.vn`), rồi tìm `đỗ`, `ĐỖ`, `đỗ văn` → đều ra; tìm `do van` → không ra (phân biệt dấu). U3 đã thấy `lower('KẾ TOÁN') = lower('Kế toán')` ra `true` trên chính database này. **Dự phòng** nếu "Đ" không hạ được: chuyển sang `EF.Functions.ILike` kèm tự thoát `%`, `_`, `\`, và chỉ kiểm phần đó bằng Postman. Nếu phải dùng dự phòng thì dừng lại hỏi Hiệp trước.
2. **Email trùng ở database:** SQL tay `INSERT` "A@CongTy.vn" khi đã có "a@congty.vn" → 23505.
3. **Khóa ngoại:** SQL tay `DELETE FROM departments WHERE id = <phòng có nhân viên>` → 23503; Postman `DELETE /api/departments/{id}` → 409 kèm tên.
4. **Ký tự đại diện:** `?search=%25` → rỗng.

## 6. Test tự động (NFR4.1–NFR4.3, NFR4.7)

- **Dùng chung hạ tầng test:** dời `TestDb.cs` và `ThrowingAppDbContext.cs` (U3) sang `backend/EmployeeCrud.Api.Tests/TestSupport/` bằng `git mv`, namespace `EmployeeCrud.Api.Tests.TestSupport`. Thêm hàm nạp nhân viên vào `TestDb`. Vì sao: cả hai bộ test dùng chung, để một chỗ thì không chép code.
- **`EmployeeServiceTests`** (các ca chính):

| Thao tác | Ca |
|---|---|
| Danh sách | Sắp họ tên rồi id (tên ASCII); có `departmentName`; rỗng |
| Tìm | "AN" ra An (hoa thường); "congty" ra cả hai (email); "  binh  " trim; "zzz" rỗng; chuỗi rỗng ra tất cả; "binh" không ra "Bình" (có dấu) |
| Đọc theo id | Có; không có → NotFound |
| Tạo | Trim cả hai; thiếu họ tên / email; họ tên 101; email 255; bộ ví dụ email BR1.6 (Theory); `DepartmentId` null / 0 → "Vui lòng chọn phòng ban"; phòng ban không có → 400 `departmentId`; email trùng khác hoa thường → 409; email lưu đúng như đã gõ |
| Sửa | Đổi phòng ban; giữ email mình; chỉ đổi hoa thường email mình; email người khác → 409; id không có + body sai → 404; tranh chấp → 404; 23503 → 400 `departmentId` |
| Xóa | Xóa được; không có → 404; tranh chấp → 404 |

- **`DepartmentServiceTests` thêm:** xóa phòng ban còn nhân viên → Conflict có tên và phòng ban vẫn còn; xóa phòng ban không còn nhân viên vẫn được (đã có).
- **Độ phủ:** `npm --prefix frontend run coverage` → `EmployeeService` ≥ 80%, `DepartmentService` vẫn ≥ 80%.
