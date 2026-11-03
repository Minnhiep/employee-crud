# Kế hoạch sinh code: u4-employees

## Summary

- Step 11 (Change Request rà soát tổng thể, 03/11/2026): chuẩn hóa họ tên, email và chuỗi tìm bằng hàm chung của U3 (gộp khoảng trắng, NFC, chặn ký tự điều khiển và ký tự vô hình theo RFC 8264/8266, W3C): hết lỗi 500 khi tìm có U+0000 (trả `[]`, Hiệp chọn), hết lách luật trùng email; bỏ `maxLength`; hộp xóa ghi thêm email; Sửa/Hủy từ kết quả tìm giữ `?search=`; dùng hàm lỗi chung của `client.ts`; sửa `SaveAsync` id 0 và comment "200"; +8 unit test
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

### Step 10: Áp chuẩn giao diện doanh nghiệp cho trang nhân viên (Hiệp yêu cầu, 03/11/2026)

> **Vì sao có bước này:** Hiệp yêu cầu làm lại giao diện chuyên nghiệp "như các doanh nghiệp lớn đang dùng", "dứt một lần duy nhất, đến chi tiết nhỏ nhất", chỉ đổi giao diện, đúng `docs/ke-hoach.md` (tin nhắn "chỉnh lại tỉ lệ là chuẩn, xong áp dụng cho employees"). U3 Step 10 đã sửa phần chung (cỡ chữ, nút 36px, dải đầu trang, tấm có đầu/thân/chân, bảng, ô chọn, hộp xác nhận) và áp cho trang phòng ban. Bước này áp **đúng chuẩn đó** cho hai trang nhân viên, để hai mục trong thanh bên trông và dùng như nhau.

**Implement, trang danh sách (`pages/employees/EmployeesPage.tsx`):**

- [x] `PageHeader`: đường dẫn "Nhân sự > Nhân viên", mô tả "Danh sách nhân viên, tìm theo họ tên hoặc email.", nút "Thêm nhân viên" có icon (bỏ dấu "+" viết tay).
- [x] Tấm danh sách: đầu tấm "Danh sách nhân viên" + ghi chú số dòng ("3 nhân viên", khi tìm: "Tìm thấy 2 nhân viên"); vùng ghi chú này **luôn có sẵn** trong trang với `aria-live`, vì trình đọc màn hình chỉ đọc chắc chắn vùng đã có từ trước khi nội dung đổi. Thanh công cụ dưới đầu tấm chứa ô tìm.
- [x] Bảng: cột "Họ tên" có vòng tròn chữ cái đầu (chữ đầu của từ đầu và từ cuối, ví dụ "Đỗ Văn An" → "ĐA"; chỉ để trang trí, trình đọc màn hình bỏ qua), "Email" chữ màu phụ, "Phòng ban" chữ thường, "Thao tác" căn phải; nút dòng "Sửa"/"Xóa" nhỏ có icon như trang phòng ban.
- [x] Xóa: thay `window.confirm` bằng `ConfirmDialog` ("Xóa nhân viên?", "Nhân viên **<tên>** sẽ bị xóa vĩnh viễn. Thao tác này không thể hoàn tác.", [Hủy] [Xóa nhân viên], `data-testid="employee-delete-confirm"`). Xóa xong: Toast, focus về tiêu đề (cùng cách trang phòng ban). 404: tải lại + "Nhân viên này không còn, danh sách đã được tải lại."; lỗi mạng: khung lỗi có icon. Bỏ state `deletingId` (hộp thoại đã hiện "Đang xóa…").
- [x] Trạng thái trong tấm: đang tải "Đang tải dữ liệu…"; lỗi "Không tải được danh sách nhân viên" + lý do + "Thử lại"; trống "Chưa có nhân viên nào" + "Thêm nhân viên đầu tiên và chọn phòng ban cho họ." + nút "Thêm nhân viên"; không khớp "Không tìm thấy nhân viên phù hợp" + `Không có họ tên hoặc email nào chứa "<chuỗi>".` + nút phụ "Xóa tìm kiếm".

**Implement, ô tìm (`components/SearchBox.tsx`, file của U4):**

- [x] Ô có icon kính lúp bên trong, chữ mờ "Tìm theo họ tên hoặc email"; nhãn vẫn có cho trình đọc màn hình (ẩn khỏi mắt, như các ô tìm của Microsoft, SAP); nút "Tìm" giữ nguyên. Vẫn chỉ tìm khi bấm Tìm hoặc Enter.
- [x] **Sửa lỗi focus (khác thiết kế, anh cần biết):** em kiểm thật thấy gõ chuỗi rồi Enter thì focus bàn phím rơi về đầu trang (`BODY`), người dùng bàn phím mất chỗ đang đứng (WCAG 2.4.3). Hai nguyên nhân: (1) trang đặt `key` theo chuỗi tìm nên mỗi lần tìm ô bị tạo lại; (2) ô bị khóa (`disabled`) khi đang tải, mà trình duyệt bỏ focus khỏi ô bị khóa. Cách sửa: ô tự đồng bộ chữ khi địa chỉ đổi (Back/Forward, "Xóa tìm kiếm") mà không bị tạo lại; ô và nút **không khóa** khi đang tải. Bấm Tìm lần nữa trong lúc tải vẫn an toàn, vì lời gọi cũ đã bị hủy (NFR5.5). Điều này khác `frontend-components.md` §3 (thuộc tính `disabled` "khóa khi đang tải"); em bỏ thuộc tính đó.

**Implement, form (`pages/employees/EmployeeFormPage.tsx`):**

- [x] `PageHeader`: đường dẫn "Nhân sự > Nhân viên > Thêm mới / Sửa"; mô tả "Nhập thông tin nhân viên mới. Trường có dấu \* là bắt buộc." / "Cập nhật thông tin nhân viên. Trường có dấu \* là bắt buộc." (bỏ dòng "(\* là ô bắt buộc)").
- [x] Form trong tấm "Thông tin nhân viên", lưới hai cột trên màn rộng (một cột dưới 960px): hàng 1 "Họ tên" | "Email", hàng 2 "Phòng ban". Chữ mờ: "Ví dụ: Nguyễn Văn An", `ten@congty.vn`. Gợi ý: "Tối đa 100 ký tự." / "Không trùng với email của nhân viên khác.".
- [x] Ô Phòng ban dùng mũi tên SVG chung; dòng "Đang tải danh sách phòng ban…", lỗi có icon + nút nhỏ "Thử lại", hoặc "Chưa có phòng ban nào." + liên kết "Thêm phòng ban" nằm ngay dưới ô, cùng cột.
- [x] Chân tấm: [Hủy] [Lưu nhân viên] (đang lưu: "Đang lưu…"). Trạng thái tải / không tìm thấy / lỗi nằm trong tấm như form phòng ban.
- [x] Giữ nguyên luật kiểm `validateEmployee.ts`, cách xử lý lỗi API cạnh ô, khung tóm tắt nhận focus, chặn bấm đúp, mọi `data-testid`.

**Implement, thêm sau khi duyệt (Hiệp giao em quyết theo chuẩn doanh nghiệp, form d8187086; rà soát R-05, R-06):**

- [x] `pages/departments/DepartmentFormPage.tsx` (**file của U3, sửa sau khi U3 đã duyệt**): ô "Tên phòng ban" đặt trong `form__grid`, rộng một cột như ô "Họ tên"; trang sửa ghi "Cập nhật tên phòng ban <tên>.".
- [x] `EmployeeFormPage.tsx`: ô chọn trống chữ mờ; trang sửa ghi "Cập nhật thông tin của <họ tên>.".
- [x] Xóa gặp 404: đưa focus về tiêu đề ở cả `EmployeesPage.tsx` và `DepartmentsPage.tsx` (**file của U3**), vì bảng tải lại nên nút Xóa không còn để nhận focus (R-05).

**Implement, CSS:** dọn các lớp không còn dùng sau bước này (`.badge`, `.list-count`, `.toolbar__count`, `.form__note`, nếu `grep` xác nhận không còn nơi nào dùng); thêm tối đa một lớp nhỏ cho cột Phòng ban (ô chọn + dòng trạng thái) nếu cần.

**Kiểm (sau khi code; không có test tự động React theo `team.md`):**

- [x] `npm --prefix frontend run verify` (96 test backend, typecheck, lint, Prettier, build); `npm --prefix frontend audit --omit=dev`; vẫn chỉ 3 gói chạy.
- [x] Playwright (Chromium, backend + PostgreSQL thật): danh sách, đếm dòng; tìm bằng Enter và bằng nút (focus ở lại ô), Back/Forward đổi chữ trong ô, không khớp → "Xóa tìm kiếm"; thêm (trống → lỗi 3 ô + khung tóm tắt nhận focus, không gửi request; email sai mẫu; email trùng khác hoa thường → 409 cạnh ô; hợp lệ → Toast); sửa (điền sẵn, đổi phòng ban); xóa qua hộp xác nhận (focus "Hủy", Esc trả focus về nút Xóa, xóa xong focus tiêu đề); tắt backend → lỗi tải và lỗi nạp phòng ban có "Thử lại"; 320px; kiểm DOM (`h1`, landmark, nhãn, không trùng id); console 0 lỗi 0 cảnh báo. Dữ liệu thử tên giả, thử xong xóa.
- [x] Chụp ảnh (danh sách, tìm không khớp, form, form có lỗi, hộp xác nhận, 320px) để anh xem.
- [x] Cập nhật `unit-test-instructions.md` (mục giao diện), `code-summary.md` (mục Step 10), `source-manifest.json`, `traceability.json`.

**Không đổi:** API, backend, test backend, `client.ts`, `api/employees.ts`, `validateEmployee.ts`, đường dẫn trang, phần chung của U2 và trang phòng ban của U3.

### Step 11: Sửa theo rà soát tổng thể (Change Request, 03/11/2026)

> **Vì sao có bước này:** Hiệp yêu cầu rà toàn bộ "chuẩn như công ty thật" trước khi chốt; danh sách ở `build-and-test/ra-soat-tong-the.md`, Hiệp chọn sửa cả 4 nhóm (form 34027473) và dặn "chuẩn như các công ty lớn… giải quyết triệt để" (tin nhắn 87ea0d27). Phần thuộc U4 ở dưới. Không thêm tính năng. Dùng lại hàm chuẩn hóa chung U3 đã làm và đã được review (`Platform/Text/TextInput.cs`, `utils/normalizeText.ts`), cùng căn cứ chuẩn (RFC 8264 §4.3.3, RFC 8266 §2.1, W3C Character Model §2.2.1).
>
> **Hiệp đã chọn (form c6e6889f):** chuỗi tìm kiếm có ký tự lạ thì API trả danh sách rỗng (200 `[]`), không trả 400.

**Luật mới (cùng luật với tên phòng ban ở U3):**

| Ô | Trước | Sau |
|---|---|---|
| Họ tên | Chỉ bỏ khoảng trắng hai đầu | Chuẩn hóa: gộp mọi chuỗi khoảng trắng thành một dấu cách, bỏ hai đầu, đưa về NFC. Ký tự điều khiển (Cc), ký tự định dạng vô hình (Cf), nửa cặp surrogate → 400 `fullName` "Họ tên chứa ký tự không hợp lệ". Rỗng và tối đa 100 ký tự tính trên họ tên đã chuẩn hóa |
| Email | Chỉ bỏ khoảng trắng hai đầu | Chuẩn hóa như trên. Ký tự lạ → 400 `email` "Email chứa ký tự không hợp lệ". Vì sao cần: U+200B không phải khoảng trắng nên lọt qua luật định dạng hiện nay, "a(U+200B)@congty.vn" lách được luật không trùng email. Sau đó: rỗng → tối đa 254 → định dạng → trùng (như cũ) |
| Chuỗi tìm `?search=` | Chỉ bỏ khoảng trắng hai đầu; U+0000 làm API trả **500** | Chuẩn hóa như trên rồi mới tìm: gõ "Nguyễn&nbsp;&nbsp;Văn" (2 dấu cách) hoặc gõ kiểu tổ hợp vẫn ra "Nguyễn Văn". Có ký tự lạ → **200 `[]`** (Hiệp chọn): họ tên, email đã bị chặn ký tự lạ khi lưu nên chắc chắn không khớp ai, không gọi database |

Thứ tự lời báo mỗi ô: ký tự không hợp lệ → rỗng → quá dài → (email) định dạng. Thứ tự giữa các ô giữ như cũ: họ tên → email → phòng ban (NFR3.6).

Implement:

- [x] `EmployeeService.Normalize`: dùng `TextInput.TryNormalize` cho họ tên và email; thêm hằng `FullNameInvalidCharactersMessage`, `EmailInvalidCharactersMessage`. Comment cũ "email PHẢI được trim trước khi kiểm" đổi thành "phải chuẩn hóa trước khi kiểm".
- [x] `EmployeeService.GetAllAsync`: chuỗi tìm qua `TextInput.TryNormalize`; `false` → trả danh sách rỗng ngay (không gọi database); chuỗi rỗng → không lọc (như cũ).
- [x] (A-08) `SaveAsync(int? id)`: thêm mới truyền `null` thay cho id 0; lỗi tranh chấp khi thêm mới không thể là "không tìm thấy" nên ném nguyên để U1 trả 500 và ghi log.
- [x] (N-10) Sửa comment trong `UpdateAsync`: khi không đổi giá trị nào mà nhân viên vừa bị xóa ở nơi khác, bước đọc lại `GetByIdAsync` không thấy dòng nên trả **404**, không phải 200 như comment cũ ghi.
- [x] Frontend `validateEmployee.ts`: dùng `normalizeText` cho họ tên và email; thêm 2 lời báo "chứa ký tự không hợp lệ"; độ dài và định dạng tính trên giá trị đã chuẩn hóa. `EmployeeFormPage.tsx` gửi họ tên, email đã chuẩn hóa (thay cho `.trim()`).
- [x] `EmployeesPage.tsx`: chuẩn hóa chuỗi tìm bằng `normalizeText` trước khi ghi lên địa chỉ trang; có ký tự lạ thì ghi chuỗi đã bỏ khoảng trắng hai đầu và API trả danh sách rỗng (giao diện hiện "không tìm thấy" như mọi lần tìm không ra).
- [x] (N-03) `EmployeeFormPage.tsx`: bỏ `maxLength` ở ô họ tên và ô email; dán thừa thì giữ nguyên và hiện lời báo "tối đa…".
- [x] (N-05) Hộp xác nhận xóa ghi thêm email trong ngoặc sau họ tên, ví dụ "Nhân viên **Đỗ Văn An** (`do.an@congty.vn`) sẽ bị xóa vĩnh viễn…", để phân biệt hai người trùng họ tên.
- [x] (N-07) Bấm Sửa từ kết quả tìm kiếm: Lưu hoặc Hủy quay về đúng danh sách đang tìm (`?search=` giữ nguyên). Cách làm: nút Sửa gửi chuỗi tìm qua `state` của đường dẫn; form dựng lại địa chỉ bằng `URLSearchParams` (không ghép chuỗi thô). Mở thẳng địa chỉ sửa (gõ tay, F5) thì quay về `/employees` như cũ.
- [x] (A-06) `EmployeesPage.tsx`, `EmployeeFormPage.tsx`: dùng `GENERIC_MESSAGE`, `isAborted`, `messageOf` từ `api/client.ts`, bỏ bản chép trong từng trang.
- [x] (A-05, phần U4) **Không** bỏ `search` khỏi danh sách phụ thuộc của `useEffect` trong `EmployeesPage`: hàm có dùng `search` bên trong nên quy tắc `react-hooks/exhaustive-deps` của ESLint bắt buộc khai báo, bỏ đi thì `npm run lint` báo lỗi. Ghi lý do vào `code-summary.md`.
- [x] Tài liệu thiết kế U4: `functional-design/rules.md` BR1.1–BR1.7, BR2.2, BR4.2, BR4.6, BR4.7 và bảng tóm tắt ghi luật mới, đánh dấu đổi có chủ đích theo rà soát (N-03, N-04, N-05, N-07, S-04), để tài liệu không lệch code.
- [x] Ghi lại cho U5: `docs/danh-sach-api.md` cần thêm hai lời báo "chứa ký tự không hợp lệ" và ghi chú "chuỗi tìm có ký tự lạ → `[]`".

Unit test (viết và chạy ngay sau service, trong `EmployeeServiceTests`, tiếp từ #33):

- [x] #33 Họ tên có khoảng trắng thừa (tab, U+00A0) và gõ kiểu tổ hợp → lưu đã gộp khoảng trắng, dạng NFC.
- [x] #34 Họ tên chứa U+0000, U+200B, U+202E, nửa cặp surrogate → 400 `fullName` "Họ tên chứa ký tự không hợp lệ", không lưu gì.
- [x] #35 Email chứa U+200B hoặc U+0000 → 400 `email` "Email chứa ký tự không hợp lệ" (trước đây U+200B lọt qua).
- [x] #36 Email gõ kiểu tổ hợp trùng email dựng sẵn đã có → 409.
- [x] #37 Tìm với chuỗi có U+0000 hoặc U+200B → danh sách rỗng, không lỗi.
- [x] #38 Tìm "nguyễn&nbsp;&nbsp;văn" (2 dấu cách) và bản gõ kiểu tổ hợp → ra "Nguyễn Văn …".
- [x] #39 (A-08) Thêm mới mà lưu gặp lỗi tranh chấp (giả lập) → ném nguyên lỗi, không báo "Không tìm thấy nhân viên có mã 0".
- [x] #40 Sửa với họ tên chứa ký tự lạ → 400, dữ liệu cũ giữ nguyên.

Kiểm (sau khi code):

- [x] `npm --prefix frontend run verify` (khoảng 117 test); độ phủ dòng `EmployeeService` vẫn ≥ 80% (`npm --prefix frontend run coverage`).
- [x] API thật (PostgreSQL): GET `?search=%00` → 200 `[]` (trước: 500); `?search=` có U+200B → `[]`; tìm "Nguyễn&nbsp;&nbsp;Văn" → có kết quả; POST họ tên hoặc email chứa U+0000, U+200B → 400 đúng ô; email gõ kiểu tổ hợp trùng → 409; dữ liệu nhân viên đang có không bị ảnh hưởng. Dữ liệu thử xóa xong.
- [x] Playwright (Chromium; chạy riêng cổng 5174 như U3 nếu preview của Hiệp vẫn giữ 5173; tắt khi xong): dán 120 ký tự họ tên, 300 ký tự email → ô giữ nguyên, lời báo cạnh ô, không gửi request; email có ký tự vô hình → lời báo; tìm "&nbsp;&nbsp;Nguyễn&nbsp;&nbsp;&nbsp;Văn&nbsp;" → địa chỉ ghi chuỗi đã gộp, có kết quả; từ kết quả tìm bấm Sửa rồi Hủy → còn `?search=`; Sửa rồi Lưu → còn `?search=` và có thông báo; hộp xóa có email; K9, K14 của U2; console 0 lỗi của ứng dụng.
- [x] Cập nhật `code-summary.md` (mục Step 11), `unit-test-instructions.md`, `source-manifest.json`, `traceability.json` nếu cần.

Sửa sau review (Hiệp duyệt checkpoint U4, gõ 1, yêu cầu sửa R-07, R-08; 03/11/2026):

- [x] **(R-07)** `SearchBox.tsx`, `EmployeesPage.tsx`: sau khi tìm, ô tìm luôn hiện chuỗi đã chuẩn hóa, kể cả khi chuỗi đó trùng chuỗi đang có trên địa chỉ.
- [x] **(R-08)** Test #41 (sửa với email chứa ký tự lạ); ca chuỗi tìm toàn khoảng trắng đã có ở test #7, ghi rõ trong hướng dẫn test.
- [x] Kiểm: `verify` xanh 118/118; Playwright ca R-07 đạt; ghi `code-summary.md` mục 5d.

**Không đổi:** đường dẫn API, mã lỗi đã có, dạng JSON; giao diện (CSS, bố cục); migration và dữ liệu đang có trong database.

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
