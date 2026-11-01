# Lựa chọn công nghệ: u3-departments

> **Nguồn:** `project.md` (Tech Stack), `team.md` (Testing Posture Q7: "test service dùng database giả lập trong bộ nhớ; chọn provider nào thì để Code Generation quyết", Code Style Q10), `contract-summary.md` (C5), rà soát Functional Design U3.

| ID | Hạng mục | Chọn | Vì sao | Phương án bị loại |
|---|---|---|---|---|
| NFR6.4 | Tầng code | Controller → Service (`IDepartmentService`) → DTO; `Department` là thực thể EF Core; cấu hình bảng bằng `IEntityTypeConfiguration<Department>` trong thư mục `Departments/` | project.md Tech Stack; Hiệp giải thích được từng tầng (NFR6) | Repository riêng (thêm một tầng không cần, EF Core đã là lớp truy cập dữ liệu) |
| NFR6.5 | Tên bảng, cột | `ToTable("departments")`, `HasColumnName("id")`, `HasColumnName("name")`, `HasMaxLength(100)` khai báo tay | team.md Q10 | Gói `EFCore.NamingConventions` (team.md cấm) |
| NFR3.4 | Chỉ mục không trùng không phân biệt hoa thường | `CREATE UNIQUE INDEX ux_departments_name ON departments (lower(name))` viết tay trong migration 1 (`migrationBuilder.Sql`), `DROP INDEX` ở `Down` | EF Core không sinh được chỉ mục trên biểu thức; tên phải đúng để U1 nhận ra 23505 (rà soát Functional Design U3) | Kiểu `citext` (cần bật extension); collation không phân biệt hoa thường (phức tạp, khó giải thích) |
| NFR3.5 | Dữ liệu mẫu | `migrationBuilder.InsertData` chỉ cột `name` (không kèm id) | id do database cấp, số tự tăng không bị lệch (NFR1.2) | `HasData` kèm id cố định (lệch số tự tăng trong PostgreSQL) |
| NFR4.4 | Cách so trùng tên | Một cách duy nhất: so `ToLower()` trong LINQ (Npgsql dịch thành `lower()` của PostgreSQL, cùng hàm với chỉ mục) | Cùng quy tắc với chỉ mục; chạy được cả trên database giả lập | `EF.Functions.ILike` (database giả lập không hỗ trợ); so ở bộ nhớ sau khi tải hết |
| NFR4.5 | Database giả lập cho unit test | `Microsoft.EntityFrameworkCore.InMemory` (bản 10.x, chỉ trong project test) | team.md Q7 giao Code Generation chọn. InMemory chạy `ToLower()` bằng .NET nên đúng với chữ tiếng Việt có dấu; SQLite trong bộ nhớ thì `lower()` chỉ đổi chữ ASCII, sẽ làm test "KẾ TOÁN" sai | SQLite in-memory (sai với chữ có dấu); PostgreSQL thật trong test (cần database, không "chạy được không cần chuẩn bị") |
| NFR4.6 | Giới hạn của database giả lập | InMemory không áp chỉ mục không trùng, không ném lỗi PostgreSQL. Đường 23503 và `DbUpdateConcurrencyException` được thử bằng một lớp con của `AppDbContext` trong project test ném sẵn lỗi đó khi `SaveChangesAsync`; trùng tên thật kiểm bằng Postman / pgAdmin | Rà soát Functional Design U3 | — |
| NFR6.6 | Gọi API ở giao diện | `src/api/departments.ts` dựa trên `client.ts` của U2, có kiểu TypeScript cho `Department`, `DepartmentRequest` | project.md (TypeScript strict) | Gọi `fetch` trực tiếp trong trang |

Phiên bản: `Microsoft.EntityFrameworkCore.InMemory` cùng bản EF Core 10.0.x đã ghim ở U1.
