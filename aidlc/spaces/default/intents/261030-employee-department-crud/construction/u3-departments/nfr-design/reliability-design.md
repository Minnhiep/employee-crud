# Thiết kế tin cậy: u3-departments

> **Nguồn:** `nfr-requirements/reliability-requirements.md` (NFR3.1–NFR3.3, NFR1.1–NFR1.3, NFR4.1–NFR4.3), `nfr-requirements/tech-stack-decisions.md` (NFR3.4, NFR3.5, NFR4.4–NFR4.6), `functional-design/rules.md`, rà soát NFR Requirements U3, `nfr-design-questions.md` (Q1: A).

## 1. Database tự chặn dữ liệu sai (NFR3.1, NFR3.2, NFR3.4)

- Cột `name`: `varchar(100) NOT NULL`, khai báo bằng `HasMaxLength(100).IsRequired()`.
- Cột `id`: `integer` tự tăng kiểu identity (mặc định của Npgsql).
- Chỉ mục không trùng được viết tay trong migration 1, vì EF Core không sinh được chỉ mục trên biểu thức:

```csharp
// Up: tạo bảng xong mới tạo chỉ mục
migrationBuilder.Sql("CREATE UNIQUE INDEX ux_departments_name ON departments (lower(name));");
// Down: xóa chỉ mục trước, rồi mới xóa bảng
migrationBuilder.Sql("DROP INDEX IF EXISTS ux_departments_name;");
```

- Mô hình EF Core không biết chỉ mục này, nên các migration sau (U4) sẽ không tự xóa nó. Tên `ux_departments_name` khớp với `DbConstraintNames.DepartmentNameUnique` của U1, nhờ vậy U1 nhận ra lỗi 23505 và trả 409 `errors.name`.

## 2. Dữ liệu mẫu (NFR3.5, NFR1.2)

- Dùng `migrationBuilder.InsertData(table: "departments", column: "name", values: [...4 tên...])`, không kèm id, nên PostgreSQL tự cấp id từ bộ đếm identity.
- **Không** dùng `HasData`. `HasData` bắt buộc phải có id cố định, và khi chèn id cố định thì bộ đếm identity không tăng theo, nên lần `POST` đầu sau đó sẽ lỗi trùng khóa.

## 3. Hai thao tác chen nhau (NFR3.3)

Service kiểm trước, database chặn sau cùng. Bảng sau ghi rõ **ai đổi lỗi nào**:

| Tình huống | Lỗi gốc | Ai bắt | Kết quả |
|---|---|---|---|
| Hai `POST`/`PUT` cùng tên cùng vượt qua bước kiểm trùng | 23505 trên `ux_departments_name` | **U1** `ErrorMapper` (đã có) | 409 `errors.name` "Tên phòng ban đã tồn tại" |
| `PUT`/`DELETE` một phòng ban vừa bị xóa ở tab khác, sau khi service đã đọc dòng | `DbUpdateConcurrencyException` (câu lệnh không tác động dòng nào) | **U3** `DepartmentService` | `DomainError.NotFound` → 404, cùng câu với BR2.2 |
| `DELETE` phòng ban còn nhân viên (từ U4) | 23503 trên `fk_employees_department` | **U3** `DepartmentService` | `DomainError.Conflict` title "Không thể xóa phòng ban", detail có tên phòng ban (BR2.5) → 409 |

- **Vì sao U3 bắt `DbUpdateConcurrencyException`, không giao cho U1:** `ErrorMapper` của U1 chỉ nhận ra `DbUpdateException` khi bên trong là `PostgresException`. Lỗi tranh chấp không có `PostgresException` bên trong, nên nếu không ai bắt thì sẽ thành 500. Service biết đang làm việc với mã phòng ban nào, nên báo được đúng câu 404. Không sửa U1. (Đây là điểm Minor 1 của rà soát.)
- Lỗi 23503 được bắt bằng điều kiện `ConstraintName == DbConstraintNames.EmployeeDepartmentForeignKey`. Lỗi khác thì ném tiếp để U1 xử lý.
- Tên phòng ban được đọc **trước** khi xóa (dòng đang được theo dõi), nên có sẵn để đưa vào `detail`.
- Không dùng `ExecuteDeleteAsync`, vì provider InMemory không hỗ trợ nên không test được.

## 4. Migration (NFR1.1, NFR1.3)

- Migration 1 tên `CreateDepartments`: tạo bảng, rồi tạo chỉ mục, rồi chèn dữ liệu mẫu. `Down` chạy ngược lại: xóa chỉ mục, rồi xóa bảng.
- **Kiểm:** chạy `dotnet ef database update`, rồi `dotnet ef database update 0` (pgAdmin không còn bảng), rồi `dotnet ef database update` lần nữa (vẫn đủ 4 dòng). Hiệp tự chạy, AI không gõ mật khẩu.
- U4 thêm bảng `employees` bằng migration mới, không sửa `CreateDepartments` (C5).

## 5. Kiểm chữ có dấu trên PostgreSQL thật (rà soát Minor 3, Minor 4)

Unit test chạy trên InMemory, nơi `ToLower()` là của .NET. Còn PostgreSQL dùng `lower()` theo collation của database. Test xanh vẫn **chưa chứng minh** PostgreSQL xử lý giống vậy. Vì thế cần kiểm thêm trên database thật:

1. **Trước khi tạo migration:** chạy `SELECT lower('KẾ TOÁN') = lower('Kế toán');` trong pgAdmin, phải ra `true`. Nếu ra `false` thì dừng lại và hỏi Hiệp trước khi làm tiếp.
2. **Sau migration:** chạy SQL tay `INSERT INTO departments (name) VALUES ('KẾ TOÁN');`, phải bị từ chối với mã 23505 (NFR3.1).
3. **Postman:** `PUT` phòng ban "Kế toán" thành "KẾ TOÁN" phải trả 200 (chỉ đổi hoa thường của chính nó). `POST` tên "kế toán" phải trả 409.
4. **Thứ tự A-Z:** trang Phòng ban phải hiện Kế toán, Kinh doanh, Kỹ thuật, Nhân sự.

Các bước này ghi vào phần kiểm của Code Generation và Build and Test.

## 6. Test tự động (NFR4.1–NFR4.3, NFR4.5, NFR4.6)

- Project `EmployeeCrud.Api.Tests` thêm gói `Microsoft.EntityFrameworkCore.InMemory` 10.0.x. Mỗi test dùng một database InMemory riêng, đặt tên bằng `Guid`, để các test không dính dữ liệu của nhau.
- Lớp `ThrowingAppDbContext : AppDbContext` chỉ có trong project test. Nó ghi đè `SaveChangesAsync` để ném lỗi được truyền vào: `DbUpdateConcurrencyException`, hoặc `DbUpdateException` bọc `PostgresException` 23503 dựng bằng constructor công khai của Npgsql giống `ErrorMapperTests`.
- Các ca tối thiểu:

| Thao tác | Ca đúng | Ca lỗi / biên |
|---|---|---|
| Đọc danh sách | Sắp A-Z | Danh sách rỗng |
| Đọc theo id | Có | Không có → NotFound |
| Tạo | Tên được bỏ khoảng trắng rồi lưu | Rỗng hoặc chỉ khoảng trắng; dài 101 ký tự; trùng khác hoa thường ("KẾ TOÁN" với "Kế toán") → Conflict; dài đúng 100 ký tự sau khi bỏ khoảng trắng vẫn lưu được |
| Sửa | Đổi tên; giữ tên mình; chỉ đổi hoa thường | Id không có → NotFound; trùng phòng ban khác → Conflict; tranh chấp → NotFound |
| Xóa | Xóa xong không còn | Id không có → NotFound; 23503 → Conflict có tên; tranh chấp → NotFound |
| `ExistsAsync` | Có → true | Không có → false |

- **Đọc độ phủ (NFR4.2, Q1: A):** cài `dotnet-reportgenerator-globaltool` **cục bộ** vào tool manifest đã có ở gốc dự án, `dotnet-tools.json` (`dotnet tool install dotnet-reportgenerator-globaltool`, không thêm `--global`). Đo theo hai bước:
  1. Chạy `dotnet test` với `--collect:"XPlat Code Coverage"` vào một thư mục kết quả cố định trong `backend/TestResults/` (đã có trong `.gitignore`).
  2. Chạy `dotnet reportgenerator` với `-reporttypes:"TextSummary;Html"` để in % dòng của từng lớp. Đạt khi `DepartmentService` ≥ 80%.

  Lệnh cụ thể và cách tránh gộp nhầm kết quả của lần đo cũ sẽ chốt trong kế hoạch Code Generation. Công cụ này không tự chặn khi dưới 80%: Build and Test đọc con số và không được hạ ngưỡng.
