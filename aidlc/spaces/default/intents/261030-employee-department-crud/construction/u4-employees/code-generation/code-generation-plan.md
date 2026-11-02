# Kế hoạch sinh code: u4-employees

## Summary

- Builds: quản lý nhân viên đủ 4 tầng: bảng `employees` + khóa ngoại + 2 chỉ mục (migration `CreateEmployees`), `EmployeeService` (luật BR1, BR2.1–BR2.6, tìm kiếm), `EmployeesController` (5 API + `?search=`), chặn xóa phòng ban còn nhân viên (BR2.7), trang danh sách có tìm kiếm và form thêm/sửa/xóa bằng React TypeScript
- Touches: `backend/EmployeeCrud.Api/Employees/`, `Migrations/`, `Departments/DepartmentService.cs`, `AppDbContext.cs`, `Program.cs` (1 dòng), `backend/EmployeeCrud.Api.Tests/Employees/`, `TestSupport/` (dời từ `Departments/`), `frontend/src/api/employees.ts`, `src/components/SearchBox.tsx`, `src/pages/employees/`, `App.tsx`
- Tests: khoảng 35 unit test xUnit cho `EmployeeService` (kể cả Theory cho bộ ví dụ email) + 2 test thêm cho `DepartmentService`, độ phủ dòng mỗi service ≥ 80%; controller, migration, giao diện kiểm tay bằng curl/Postman, pgAdmin, trình duyệt

> **Nguồn:** `functional-design/` (functional-spec W1–W5, rules BR1.1–BR4.9, entities, frontend-components, Q1–Q3), `nfr-requirements/` (gồm tech-stack-decisions NFR3.7, NFR3.8, NFR4.5–NFR4.7, NFR6.4–NFR6.6), `nfr-design/`, `infrastructure-design/` của U4 và các ghi chú rà soát (NFR Design U4: 3 Minor; Infrastructure Design U4: 2 Minor); `contract-summary.md` (C2, C3, C4, C5); `unit-of-work.md` (U4); `requirements.md`; `team.md`, `project.md`.

## Story → bước code

| Story / AC | Phần U4 làm | Bước |
|---|---|---|
| US2.1: AC2.1.1–AC2.1.3 | `GetAllAsync` sắp họ tên rồi id, có `departmentName`; `EmployeesPage` đủ trạng thái | 4, 5, 6, 7 |
| US3.1: AC3.1.1–AC3.1.5 | Tìm họ tên/email không phân biệt hoa thường, có phân biệt dấu; `SearchBox`; `?search=` trên địa chỉ | 4, 5, 6, 7 |
| US2.2: AC2.2.1–AC2.2.5 | `CreateAsync` (trim, bắt buộc, độ dài, định dạng email, phòng ban có, email trùng → 409); form thêm, ô chọn phòng ban | 4, 5, 6, 7 |
| US2.3: AC2.3.1–AC2.3.4 | `UpdateAsync` (tìm trước → 404, email trùng loại trừ chính nó); form sửa | 4, 5, 6, 7 |
| US2.4: AC2.4.1–AC2.4.3 | `DeleteAsync` (xóa hẳn, 404, tranh chấp → 404); nút Xóa có xác nhận, tải lại giữ chuỗi tìm | 4, 5, 6, 7 |
| US1.4: AC1.4.3 | `DepartmentService.DeleteAsync` kiểm còn nhân viên → 409 | 4, 5, 6 |
| AC1.5.2, AC5.3.2, AC5.3.3 | Migration `CreateEmployees`: bảng trống, snake_case, chỉ mục email chặn trùng ở database | 3 |
| US4.1, US4.2, US4.4–US4.6 (phần nhân viên) | Dùng `ErrorSummary`, `FormField`, `StatusMessage`, `useSubmitGuard`, `Toast`, `DataTable` của U2 | 7 |

## Những điều anh cần biết trước khi duyệt

1. **Lệnh chạy ở phiên chính, anh duyệt từng lệnh** (như U1–U3).
2. **Database:** lệnh `dotnet ef ...` đọc mật khẩu từ user-secrets anh đã đặt, nên em không gõ mật khẩu. Em chạy lệnh migration (anh duyệt từng lệnh). Các câu SQL trong pgAdmin (kiểm email trùng, khóa ngoại, đo 1.000 dòng) anh tự chạy theo hướng dẫn của em.
3. **Không thêm gói hay công cụ nào.** InMemory, reportgenerator, `dotnet-ef` đã có từ U1/U3.
4. **Cách tìm kiếm** (NFR4.5, rà soát NFR Design U4 Minor 3): chuỗi tìm được trim rồi **hạ chữ ở .NET** (`term.ToLower()`, gửi xuống dưới dạng tham số), còn cột được **hạ chữ ở SQL** (`e.FullName.ToLower()` dịch thành `lower(full_name)`). Em sẽ bật log SQL để xem câu thật (`strpos` hay `LIKE`) và ghi vào `code-summary.md`.
   - **Điểm dừng:** nếu trên PostgreSQL thật tìm `đỗ` không ra "Đỗ Văn An" (chữ "Đ" không hạ được), em **dừng lại hỏi anh** trước khi chuyển sang `EF.Functions.ILike`.
5. **Luật định dạng email** (BR1.6, Q2, rà soát Minor 2): một biểu thức `^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$` chép giống hệt ở C# và TypeScript.
   - Ở .NET, `$` cũng khớp trước một dấu xuống dòng cuối chuỗi, còn JavaScript thì không. `\s` của hai bên cũng hơi khác.
   - Hai bên vẫn cho cùng kết quả vì **email luôn được trim trước khi kiểm**. Comment ở cả hai nơi ghi rõ điều kiện này, và unit test có ca `"a@b.vn\n"` (đã trim thì hợp lệ).
6. **Không có test tự động cho controller và React** (`team.md`: chỉ unit test service; controller, migration, giao diện kiểm tay). Luật này hẹp hơn và được ưu tiên hơn mục "integration test cho ranh giới chính" của chiến lược Standard.
7. **File có sẵn bị sửa hoặc dời:**
   - `backend/EmployeeCrud.Api.Tests/Departments/TestDb.cs` và `ThrowingAppDbContext.cs` (của U3) được dời bằng `git mv` sang `backend/EmployeeCrud.Api.Tests/TestSupport/` (thư mục mới), namespace `EmployeeCrud.Api.Tests.TestSupport`. `DepartmentServiceTests.cs` thêm `using` (rà soát Infrastructure Design Minor 2).
   - `DepartmentService.cs`: thêm bước kiểm còn nhân viên trong `DeleteAsync`, gom lời báo "còn nhân viên" vào một hàm dùng chung với nhánh 23503 có sẵn. Chữ ký hàm không đổi.
   - `AppDbContext.cs`: thêm `DbSet<Employee> Employees`.
   - `Program.cs`: thêm 1 dòng `AddScoped`.
   - `frontend/src/pages/EmployeesPage.tsx` của U2 (chỉ có tiêu đề) được dời bằng `git mv` sang `src/pages/employees/EmployeesPage.tsx`, rồi viết nội dung thật.
   - `App.tsx`: import trang từ thư mục mới, thêm 2 đường dẫn form; route sửa có `key` theo `id`.
   - `appsettings.Development.json` đã có khóa log SQL, chỉ đổi tạm khi xem rồi đổi lại.
8. **Lệnh test chạy hai lần** (rà soát Infrastructure Design Minor 1): `verify` và `coverage` đều chạy `dotnet test`. Em giữ nguyên, vì gộp hai lệnh thì phải sửa script của U3; tổng thời gian chỉ thêm vài giây.

## Các bước

### Step 1: Khung thư mục và dời hạ tầng test

- [x] Tạo thư mục `backend/EmployeeCrud.Api/Employees/` và `backend/EmployeeCrud.Api.Tests/Employees/`.
- [x] `git mv backend/EmployeeCrud.Api.Tests/Departments/TestDb.cs backend/EmployeeCrud.Api.Tests/TestSupport/TestDb.cs` và tương tự cho `ThrowingAppDbContext.cs`; đổi namespace thành `EmployeeCrud.Api.Tests.TestSupport`; thêm `using` trong `DepartmentServiceTests.cs` (NFR4.7).

### Step 2: Sẵn sàng chạy test (runner)

- [x] Chạy `dotnet test backend/EmployeeCrud.slnx --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Employees|FullyQualifiedName~EmployeeCrud.Api.Tests.Departments"`: build được sau khi dời file, test phòng ban cũ vẫn xanh, chưa có test nhân viên. Toàn bộ `dotnet test backend/EmployeeCrud.slnx` vẫn xanh (44 test).

### Step 3: Tầng dữ liệu: thực thể, cấu hình, migration (implement rồi kiểm tay)

- [x] `Employees/Employee.cs`: `Id` (int), `FullName`, `Email` (string, khởi tạo `""`), `DepartmentId` (int), điều hướng `Department Department` (dùng `null!`, comment vì sao).
- [x] `Employees/EmployeeConfiguration.cs` (`IEntityTypeConfiguration<Employee>`):
  - `ToTable("employees")`, `HasKey`; cột `id`, `full_name` (`HasMaxLength(100)`, `IsRequired()`), `email` (`HasMaxLength(254)`, `IsRequired()`), `department_id` (NFR6.5, NFR3.2).
  - `HasOne(e => e.Department).WithMany().HasForeignKey(e => e.DepartmentId).HasConstraintName(DbConstraintNames.EmployeeDepartmentForeignKey).OnDelete(DeleteBehavior.Restrict)` (NFR3.3, NFR3.8).
  - `HasIndex(e => e.DepartmentId).HasDatabaseName("ix_employees_department_id")` (NFR5.8).
  - **Không** khai chỉ mục email (viết tay ở migration), **không** `HasData`.
- [x] `AppDbContext`: thêm `DbSet<Employee> Employees => Set<Employee>();`.
- [x] `dotnet ef migrations add CreateEmployees --project backend/EmployeeCrud.Api --output-dir Migrations`, rồi sửa tay file migration:
  - **Up:** sau `CreateTable` và chỉ mục EF sinh, thêm `migrationBuilder.Sql("CREATE UNIQUE INDEX ux_employees_email ON employees (lower(email));")` (NFR3.1, NFR3.7).
  - **Down:** `DROP INDEX IF EXISTS ux_employees_email;` trước `DropTable`.
  - Kiểm file sinh ra: khóa ngoại đúng tên `fk_employees_department`, `onDelete: ReferentialAction.Restrict`; không đụng bảng `departments`.
  - Comment tiếng Việt giải thích vì sao viết tay.
- [x] **Kiểm tầng dữ liệu (kiểm tay):**
  1. `dotnet ef database update --project backend/EmployeeCrud.Api`.
  2. `dotnet ef database update CreateDepartments --project backend/EmployeeCrud.Api` → bảng `employees` biến mất, 4 phòng ban còn nguyên.
  3. `dotnet ef database update --project backend/EmployeeCrud.Api` lần nữa (NFR1.1, NFR1.3).
  4. Anh xem trong pgAdmin: bảng `employees` trống, cột snake_case, `ux_employees_email`, `ix_employees_department_id`, `fk_employees_department` (AC1.5.2, AC5.3.2).

### Step 4: Tầng nghiệp vụ: DTO và service (implement)

- [x] `Employees/EmployeeDto.cs`: `record EmployeeDto(int Id, string FullName, string Email, int DepartmentId, string DepartmentName)`.
- [x] `Employees/EmployeeRequest.cs`: `FullName` có `[Required(ErrorMessage = "Vui lòng nhập họ tên")]`, `Email` có `[Required(ErrorMessage = "Vui lòng nhập email")]`, `DepartmentId` kiểu `int?` **không** `[Required]` (security-design §1). Không đặt `[MaxLength]` (kiểm sau trim ở service).
- [x] `Employees/IEmployeeService.cs`: `GetAllAsync(string? search, ...)`, `GetByIdAsync`, `CreateAsync`, `UpdateAsync`, `DeleteAsync` (đều nhận `CancellationToken`).
- [x] `Employees/EmployeeService.cs` (nhận `AppDbContext`, `IDepartmentService`):
  - `Normalize`: trim hai trường; kiểm BR1.2–BR1.6, BR1.8 theo thứ tự, gom lỗi theo khóa `fullName`, `email`, `departmentId` → `DomainError.Validation`.
  - Email: `private static readonly Regex EmailPattern` với biểu thức ở mục 5 trên, comment trỏ về BR1.6 và điều kiện "đã trim".
  - Thứ tự kiểm (NFR3.6): **Thêm** dữ liệu → `ExistsAsync` (BR1.9, 400 `departmentId` "Phòng ban không tồn tại") → email trùng (BR1.7) → lưu. **Sửa:** tìm nhân viên trước (404) → như Thêm, email trùng loại trừ chính nó.
  - Email trùng: `AnyAsync(e => e.Email.ToLower() == email.ToLower() && e.Id != excludeId)` → `DomainError.Conflict(ErrorTitles.EmailTaken, "email")`. Email lưu đúng như đã gõ (Q1).
  - Đọc: `AsNoTracking`; nếu có chuỗi tìm (trim, khác rỗng) thì lọc `e.FullName.ToLower().Contains(term) || e.Email.ToLower().Contains(term)` với `term = search.Trim().ToLower()`; `OrderBy(FullName).ThenBy(Id)`; `Select` ra DTO có `e.Department.Name` (BR2.1, BR2.2, NFR5.3).
  - Không có → `NotFound("Không tìm thấy nhân viên có mã {id}.")` (BR2.3).
  - Thêm/Sửa: bắt `DbUpdateException` có `PostgresException` 23503 với `ConstraintName == DbConstraintNames.EmployeeDepartmentForeignKey` → `Validation("departmentId", "Phòng ban không tồn tại")`. Sửa/Xóa: bắt `DbUpdateConcurrencyException` → NotFound. Lỗi khác ném nguyên (BR2.6, NFR2.4).
  - Sau khi lưu, đọc lại DTO (có tên phòng ban) bằng cùng hàm `Select`.
  - Comment giới hạn đã biết: sửa mà mọi giá trị giữ nguyên thì EF không gửi `UPDATE`, nên trường hợp "vừa bị xóa ở nơi khác" trả 200 (reliability-design §2).
- [x] `Departments/DepartmentService.cs` (BR2.7, NFR3.5):
  - Trong `DeleteAsync`, sau khi tìm thấy: `if (await db.Employees.AnyAsync(e => e.DepartmentId == id, ct))` → lỗi "còn nhân viên".
  - Tách hàm riêng `HasEmployeesConflict(string name)` dùng cho cả bước kiểm này lẫn nhánh 23503 đã có, để hai đường ra cùng một câu.

### Step 5: Tầng nghiệp vụ: viết và chạy ngay unit test

- [x] `TestSupport/TestDb.cs`: thêm hàm nạp nhân viên (kèm phòng ban).
- [x] `Tests/Employees/EmployeeServiceTests.cs`: các ca trong `unit-test-instructions.md` §5. Test sắp xếp dùng tên ASCII. Test "phòng ban không có" dùng `IDepartmentService` thật trên cùng InMemory.
- [x] `Tests/Departments/DepartmentServiceTests.cs`: thêm 2 ca BR2.7.
- [x] Chạy `dotnet test backend/EmployeeCrud.slnx --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Employees|FullyQualifiedName~EmployeeCrud.Api.Tests.Departments"` → xanh.
- [x] Chạy `npm --prefix frontend run coverage` → `EmployeeService` ≥ 80% và `DepartmentService` vẫn ≥ 80% dòng. Dưới 80% thì thêm test, không hạ ngưỡng.

### Step 6: Tầng API: controller (implement rồi kiểm tay)

- [x] `Employees/EmployeesController.cs`: `[ApiController]`, `[Route("api/employees")]`; `GET` (nhận `[FromQuery] string? search`), `GET {id:int}`, `POST` → `CreatedAtAction` (201 + Location), `PUT {id:int}` → 200, `DELETE {id:int}` → 204 (BR2.4). Không chứa luật, chỉ gọi service. Khai `[ProducesResponseType]` đủ mã 200/201/204/400/404/409 (NFR6.4).
- [x] `Program.cs`: thêm `builder.Services.AddScoped<IEmployeeService, EmployeeService>();` (NFR5.7).
- [x] `dotnet build` và `dotnet format backend/EmployeeCrud.slnx --verify-no-changes`.
- [x] **Kiểm tầng API (kiểm tay):** chạy backend `dotnet run --project backend/EmployeeCrud.Api --launch-profile http`. Em gọi bằng `curl.exe`, anh gọi lại bằng Postman:
  - `GET` → 200 `[]` (NFR1.2).
  - `POST` "  Đỗ Văn An  " / "  Do.An@CongTy.vn  " / phòng ban có → 201 + `Location`, đã trim, email giữ chữ hoa như đã gõ, có `departmentName`.
  - `POST` thiếu họ tên / email sai định dạng / `departmentId` null / `departmentId` 99999 → 400 đúng khóa. Email "do.an@congty.vn" → 409 `errors.email`. Body `"departmentId": "abc"` → 400 (NFR2.6).
  - `PUT` đổi phòng ban → 200; chỉ đổi hoa thường email của mình → 200; email người khác → 409; id 99999 kèm body sai → 404.
  - `DELETE` → 204, sau đó `GET {id}` → 404.
  - `DELETE /api/departments/{id}` của phòng ban còn nhân viên → 409, detail có tên phòng ban (AC1.4.3).
  - Tìm trên PostgreSQL thật (NFR4.4): `?search=đỗ`, `?search=ĐỖ`, `?search=đỗ văn` → ra; `?search=do van` → không ra; `?search=%25`, `?search=_` → rỗng (NFR2.3).
  - Bật log SQL (`Information`), xem câu `SELECT ... JOIN departments` (một câu) và cách dịch `Contains`, đếm số câu của POST/PUT/DELETE (NFR5.3, NFR5.4, NFR6.3); ghi lại rồi đổi về `Warning`.
  - Anh chạy trong pgAdmin: chèn tay "DO.AN@CONGTY.VN" → 23505; `DELETE FROM departments WHERE id = <phòng có nhân viên>` → 23503.
  - Đo 1.000 dòng (performance-design §3): anh chèn dữ liệu tạm `@perf.test`; đo `GET` và `?search=th%E1%BB%AD` mỗi lời gọi 3 lần, ≤ 1 giây; anh xóa dữ liệu tạm, `count(*)` ra 0 (NFR5.1, NFR5.2).
  - Trang `/swagger` hiện đủ 5 thao tác.

### Step 7: Tầng giao diện (implement rồi kiểm tay)

- [x] `src/api/employees.ts`: kiểu `Employee`, `EmployeeRequest`; 5 hàm dựa trên `client.ts`; `getEmployees(search, signal)` chỉ thêm `?search=` (đã `encodeURIComponent`) khi chuỗi khác rỗng (NFR6.6).
- [x] `src/components/SearchBox.tsx` theo `frontend-components.md` §3: `role="search"`, label, `type="search"`, nút Tìm; trả chuỗi đã trim; đồng bộ khi `initialValue` đổi.
- [x] `src/pages/employees/validateEmployee.ts`: hàm thuần, trim, kiểm 3 ô, trả `FieldErrors`; chứa `EMAIL_PATTERN` giống hệt C#, comment trỏ BR1.6 và điều kiện "đã trim".
- [x] `git mv frontend/src/pages/EmployeesPage.tsx frontend/src/pages/employees/EmployeesPage.tsx`, rồi viết trang danh sách theo §4:
  - Chuỗi tìm lấy từ `useSearchParams()`; effect tải theo chuỗi, hủy lời gọi cũ bằng `AbortController`, bỏ qua lỗi kiểu "aborted".
  - Đủ trạng thái BR4.1; dòng đếm `aria-live`; "Xóa tìm kiếm" về `/employees`.
  - Xóa: `window.confirm`, khóa nút, xong gọi lại hàm tải (giữ chuỗi tìm), Toast, focus `h1`; 404 → tải lại + "Mục này đã không còn"; lỗi mạng → `role="alert"` (BR4.7).
- [x] `src/pages/employees/EmployeeFormPage.tsx` (`mode` create/edit) theo §5:
  - Sửa: tải nhân viên và phòng ban **song song**; `:id` không phải số dương → không tìm thấy, không gọi API (NFR5.5).
  - Ô Phòng ban: loading / error + "Thử lại" (khóa Lưu) / rỗng + liên kết `/departments/new` (BR4.4, Q3).
  - Kiểm khi rời ô: chỉ thay lỗi khi thấy sai, **không xóa lỗi API** tới khi người dùng sửa ô (bài học U3). Kiểm khi bấm Lưu, `ErrorSummary` nhận focus.
  - `useSubmitGuard`; gửi `departmentId: Number(...)`; 400/409 → cạnh ô theo 3 khóa; 404 khi lưu → khung tóm tắt; lưu xong về danh sách kèm lời báo (BR4.3, BR4.5, BR4.6, BR4.8).
- [x] `App.tsx`: import trang từ thư mục mới; thêm `employees/new` và `employees/:id/edit`; route sửa có `key` theo `id` (rà soát U3).
- [x] Thêm `data-testid` cho phần tử bấm được: ô tìm, nút tìm, nút xóa tìm, nút thêm, sửa, xóa, 3 ô form, nút lưu, nút hủy, nút thử lại.
- [x] **Kiểm tầng giao diện:** `npm --prefix frontend run lint`, `typecheck`, `format`, rồi `format:check`, `build` đều sạch. Sau đó kiểm tay trên trình duyệt (backend đang chạy) theo mục 6 của `unit-test-instructions.md`, gồm CORS thật cho POST/PUT/DELETE, bấm đúp Lưu chỉ một request, Back/F5 giữ chuỗi tìm, tắt backend thì hiện lỗi kết nối, Lighthouse ≥ 90.

### Step 8: Cấu hình build và quét

- [x] Chạy `npm --prefix frontend run verify` → xanh (gồm test cũ và test mới).
- [x] Quét ở thư mục gốc:
  - `git grep --untracked -i -n -E "(password|pwd)\s*=|\"password\"\s*:" -- backend frontend` → 0 dòng (NFR2.1).
  - `git grep --untracked -n -E "dangerouslySetInnerHTML|FromSqlRaw|ExecuteSqlRaw|mailto:|EnableSensitiveDataLogging" -- backend frontend/src` → 0 dòng (NFR2.3, NFR2.5, NFR6.2).

### Step 9: Tài liệu và truy vết

- [x] Viết `code-summary.md`, gồm:
  - file đã tạo, sửa hoặc dời; quyết định chính;
  - kết quả migration lên/quay lui/lên, curl/Postman, câu SQL thật (`strpos` hay `LIKE`), kiểm Đỗ/ĐỖ, đo 1.000 dòng, độ phủ, kiểm tay, quét;
  - nháp cho README của U5: API nhân viên kèm JSON mẫu, migration 2, quay lui về `CreateDepartments`.
- [x] Ghi `source-manifest.json` và `traceability.json`, bao đủ các mã của tech-stack-decisions (NFR3.7, NFR3.8, NFR4.5–NFR4.7, NFR6.4–NFR6.6) và observability (NFR6.1, NFR6.2) (rà soát NFR Design U4 Minor 1).

## Không làm trong U4

- Không lọc theo phòng ban, không phân trang, không tìm không dấu, không nhân viên mẫu (requirements mục 7).
- Không test tự động cho controller hay React, không README (U5).
- Không sửa `ErrorMapper` hay file khác của U1, ngoài `AppDbContext` (thêm `DbSet`) và `Program.cs`.
- Không sửa 2 Minor còn mở của U3 (`key` theo id ở route form phòng ban; sửa không đổi giá trị trả 200). Nếu anh muốn sửa route phòng ban cùng lúc khi đụng `App.tsx` thì báo em; mặc định để riêng.

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "team",
  "ordering": "Với mỗi Unit, viết code tầng service trước, sau đó viết và chạy ngay unit test cho service đó; controller, migration và giao diện React được kiểm thủ công bằng Postman, pgAdmin và trình duyệt sau khi code xong.",
  "scope": "classic",
  "test_strategy": "standard",
  "project_type": "greenfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    },
    {
      "layer": "team",
      "text": "- **Methodology**: test-after\n- **Methodology evidence**: Hiệp chọn viết code trước, rồi viết test cho phần đó và chạy ngay, vì người mới dễ theo dõi hơn (Q5). Lựa chọn này cũng khớp mặc định của org.md và quyết định trong project.md chỉ viết unit test cho logic nghiệp vụ chính.\n- **Ordering**: Với mỗi Unit, viết code tầng service trước, sau đó viết và chạy ngay unit test cho service đó; controller, migration và giao diện React được kiểm thủ công bằng Postman, pgAdmin và trình duyệt sau khi code xong.\n- Phạm vi test tự động: chỉ unit test cho các service, tập trung vào luật nghiệp vụ. Ví dụ: email trùng (không phân biệt hoa thường) trả 409, phòng ban không tồn tại, không xóa được phòng ban còn nhân viên, tìm theo họ tên và email không phân biệt hoa thường, không tìm thấy trả 404. Mỗi service có ít nhất một trường hợp đúng và hai trường hợp lỗi hoặc biên. Không viết E2E, không viết test tự động cho React, không làm bộ test tích hợp lớn.\n- Độ phủ: ít nhất 80% số dòng (line coverage) của các lớp service, đo bằng coverlet (`dotnet test --collect:\"XPlat Code Coverage\"`). Hiệp chạy `dotnet test` trên máy trước mỗi commit, thay cho bước CI mà dự án không có (Q6). Build and Test kiểm mức sàn này và không được hạ nó xuống để cho qua.\n- Công cụ: xUnit, đặt trong một project test riêng cạnh backend (ví dụ `EmployeeCrud.Api.Tests`). Test service dùng database giả lập trong bộ nhớ (Q7). Chọn cụ thể provider nào thì để Code Generation quyết, vì việc hàm `ILike` của Npgsql có chạy được trên provider giả lập hay không vẫn chưa kiểm (xem `evidence.md`).\n- Kiểm thủ công cả luồng: theo các danh sách F, V, A, D, R trong `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md`, kiểm từ dưới lên: database → API → giao diện → cả luồng.\n- Khối lượng và loại test theo Test Strategy `Standard` của workflow; mức sàn của scope chỉ cộng thêm, không thay thế."
    }
  ],
  "obligations": {
    "strategy": "standard",
    "strategy_volume": [
      "Five to eight tests per component.",
      "Unit tests plus integration tests for key boundaries.",
      "Add E2E, performance, or security tests when requirements demand them."
    ],
    "scope_floor": [
      "Keep the existing test suite green.",
      "This scope adds no extra new-test floor beyond the selected test strategy."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - implement.",
      "Data model / database behavior - write and run its tests after implementation.",
      "Repository / data access - implement.",
      "Repository / data access - write and run its tests after implementation.",
      "Business logic - implement.",
      "Business logic - write and run its tests after implementation.",
      "API / endpoint - implement.",
      "API / endpoint - write and run its tests after implementation.",
      "Frontend behavior - implement.",
      "Frontend behavior - write and run its tests after implementation.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:b6b872fd21e0c58c5bf1fd46fdd8da37894b85fe9b7d7660b7e84c38818ce401",
  "contract_sha256": "sha256:dfce3d5b6be371bd60bc264d51eb2b2a5627226310edfc05af4c94d5234aa0cb"
}
```

Áp dụng hợp đồng cho U4, theo thứ tự `team.md`:

| Tầng của hợp đồng | Bước làm | Cách kiểm |
|---|---|---|
| Dữ liệu | Step 3 | Kiểm tay migration lên / quay về `CreateDepartments` / lên trong pgAdmin |
| Truy cập dữ liệu | Không có tầng riêng (EF Core là lớp truy cập dữ liệu, NFR6.4) | — |
| Nghiệp vụ | Step 4 | Unit test chạy ngay ở Step 5 |
| API | Step 6 | Kiểm tay bằng curl/Postman, pgAdmin cho chỉ mục và khóa ngoại |
| Giao diện | Step 7 | Lint, typecheck, build và kiểm tay trên trình duyệt |
| Cấu hình | Step 8 | |
| Tài liệu | Step 9 | |

Runner có sẵn từ U1 (`EmployeeCrud.Api.Tests`, xUnit). Step 2 kiểm lệnh lọc của U4 chạy được sau khi dời `TestSupport/`, trước khi viết test đầu tiên.
