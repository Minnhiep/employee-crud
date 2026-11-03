# Kế hoạch sinh code: u3-departments

## Summary

- Step 11 (Change Request rà soát tổng thể, 03/11/2026): chuẩn hóa tên phòng ban ở API và form (gộp khoảng trắng, NFC, chặn ký tự điều khiển và ký tự vô hình theo RFC 8264/8266, W3C: hết lỗi 500 với U+0000, hết lách luật không trùng); bỏ `maxLength`; form sửa có `key` theo id; trang danh sách tải cùng kiểu trang nhân viên; dùng hàm lỗi chung của `client.ts`; +6 unit test
- Redesign (Step 10, Hiệp yêu cầu 03/11/2026): siết lại hệ thiết kế chung theo mật độ phần mềm quản trị doanh nghiệp (chữ 14px, nút/ô nhập 36px, dải đầu trang trắng, tấm có phần đầu/thân/chân) và làm lại trang danh sách + form phòng ban (đường dẫn trang, thanh công cụ, bảng gọn, nút dòng nhỏ có icon, hộp xác nhận xóa, form trong tấm, Hủy rồi Lưu); không đổi API, luật, test backend
- Builds: quản lý phòng ban đủ 4 tầng: bảng `departments` + chỉ mục + 4 dòng mẫu (migration), `DepartmentService` (luật BR1, BR2), `DepartmentsController` (5 API), trang danh sách và form thêm/sửa/xóa bằng React TypeScript
- Touches: `backend/EmployeeCrud.Api/Departments/`, `backend/EmployeeCrud.Api/Migrations/`, `Program.cs` (1 dòng), `backend/EmployeeCrud.Api.Tests/Departments/`, `frontend/src/api/departments.ts`, `frontend/src/pages/departments/`, `App.tsx`, `dotnet-tools.json`, `frontend/package.json` (script `coverage`); Step 11 thêm hai file dùng chung `backend/EmployeeCrud.Api/Platform/Text/TextInput.cs` và `frontend/src/utils/normalizeText.ts`
- Tests: 27 ca unit test xUnit cho `DepartmentService` (#1–#27, gồm 6 ca chuẩn hóa tên của Step 11; InMemory + ngữ cảnh ném lỗi giả), độ phủ dòng ≥ 80% (đo được 100%); controller, migration, giao diện kiểm tay bằng curl/Postman, pgAdmin, trình duyệt

> **Nguồn:** `functional-design/` (functional-spec W1–W5, rules BR1.1–BR4.7, entities, frontend-components), `nfr-requirements/`, `nfr-design/` (Q1 = A), `infrastructure-design/` của U3 và các ghi chú rà soát; `contract-summary.md` (C1, C3, C4, C5); `unit-of-work.md` (U3); `requirements.md`; `team.md`, `project.md`.

## Story → bước code

| Story / AC | Phần U3 làm | Bước |
|---|---|---|
| US1.1: AC1.1.1–AC1.1.3 | `GetAllAsync` sắp A-Z; `DepartmentsPage` 4 trạng thái | 4, 5, 7 |
| US1.2: AC1.2.1–AC1.2.4 | `CreateAsync` (trim, bắt buộc, ≤100, trùng → 409); form thêm | 4, 5, 6, 7 |
| US1.3: AC1.3.1–AC1.3.4 | `UpdateAsync` (loại trừ chính nó, 404); form sửa | 4, 5, 6, 7 |
| US1.4: AC1.4.1, AC1.4.2 (AC1.4.3 dự phòng 23503) | `DeleteAsync` (404, 23503 → 409, tranh chấp → 404); nút Xóa có xác nhận | 4, 5, 6, 7 |
| US1.5: AC1.5.1 | Migration `CreateDepartments`: 4 phòng ban mẫu | 3 |
| US4.1, US4.2, US4.4–US4.6 (phần phòng ban) | Dùng `ErrorSummary`, `FormField`, `StatusMessage`, `useSubmitGuard`, `Toast` của U2 | 7 |
| AC5.2.2, AC5.3.2, AC5.3.3 | Mã 200/201/204; bảng snake_case; chèn trùng bị chặn | 3, 6 |

## Những điều anh cần biết trước khi duyệt

1. **Lệnh chạy ở phiên chính, anh duyệt từng lệnh** (như U1, U2).
2. **Việc đầu tiên, trước khi viết migration (rà soát Infrastructure Design):** anh mở pgAdmin, chạy `SELECT lower('KẾ TOÁN') = lower('Kế toán');` trên `employee_db`. Ra `true` thì em làm tiếp. Ra `false` thì em dừng lại hỏi anh, vì khi đó chỉ mục `lower(name)` không chặn được trùng tên có dấu.
3. **Database:** lệnh `dotnet ef ...` đọc mật khẩu từ user-secrets anh đã đặt, nên em không gõ mật khẩu. Em chạy lệnh migration (anh duyệt từng lệnh). Các bước SQL trong pgAdmin thì anh tự làm theo hướng dẫn của em.
4. **Gói và công cụ thêm (đều cục bộ, không `--global`):**
   - Project test thêm `Microsoft.EntityFrameworkCore.InMemory` với **cùng cách ghi phiên bản như EF Core của project API (`10.*`)**. Vì sao: nếu ghim cứng InMemory còn EF Core thì trôi lên 10.0.x mới, hai bản lệch nhau sẽ gây lỗi MSB3277 như ở U1. Ghim chặt mọi gói thì đúng hơn về lâu dài, nhưng phải sửa csproj của U1, nên để thành việc riêng nếu anh muốn (rà soát Infrastructure Design, Minor 2).
   - `dotnet-reportgenerator-globaltool` cài vào `dotnet-tools.json` ở gốc. Manifest luôn ghim đúng số phiên bản.
5. **Không có test tự động cho controller và React** (`team.md`: chỉ unit test service; controller, migration, giao diện kiểm tay). Luật này hẹp hơn và được ưu tiên hơn mục "integration test cho ranh giới chính" của chiến lược Standard.
6. **File có sẵn bị sửa:**
   - `Program.cs`: thêm 1 dòng `AddScoped`.
   - `App.tsx`: thêm 2 đường dẫn form.
   - `frontend/src/pages/DepartmentsPage.tsx` của U2 (chỉ có tiêu đề) được dời bằng `git mv` sang `src/pages/departments/DepartmentsPage.tsx`, rồi viết nội dung thật.
   - `frontend/package.json`: thêm script `coverage`.
   - `appsettings.Development.json` đã có khóa log SQL, nên không sửa.
7. **Đọc độ phủ** (Q1 = A, rà soát Minor 1) bằng một lệnh copy chạy được: `npm --prefix frontend run coverage`. Lệnh này:
   - xóa thư mục kết quả cũ `backend/TestResults/coverage` (thư mục sinh ra, đã bị `.gitignore` loại), để không gộp nhầm số của lần trước;
   - chạy `dotnet test` có thu độ phủ;
   - chạy reportgenerator rồi in bảng % theo từng lớp.

   Lệnh không tự chặn khi dưới 80%: anh đọc dòng `DepartmentService`.

## Các bước

### Step 1: Khung thư mục, gói, công cụ và kiểm `lower()` trước

- [x] Anh chạy trong pgAdmin: `SELECT lower('KẾ TOÁN') = lower('Kế toán');` → phải ra `true` (reliability-design §5). Kết quả ghi vào `code-summary.md`.
- [x] Tạo thư mục `backend/EmployeeCrud.Api/Departments/` và `backend/EmployeeCrud.Api.Tests/Departments/`.
- [x] `dotnet add backend/EmployeeCrud.Api.Tests package Microsoft.EntityFrameworkCore.InMemory --version "10.*"`.
- [x] `dotnet tool install dotnet-reportgenerator-globaltool` ở thư mục gốc (vào `dotnet-tools.json`, cục bộ).
- [x] `frontend/package.json`: thêm script `coverage`. Script này làm lần lượt:
  1. Xóa `../backend/TestResults/coverage` bằng `node -e`.
  2. Chạy `dotnet test ../backend/EmployeeCrud.slnx --collect:"XPlat Code Coverage" --results-directory ../backend/TestResults/coverage`.
  3. Chạy `dotnet tool run reportgenerator` với `TextSummary;Html`, kết quả vào `../backend/TestResults/coverage-report`.
  4. In `Summary.txt`.

### Step 2: Sẵn sàng chạy test (runner)

- [x] Chạy `dotnet test backend/EmployeeCrud.slnx --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Departments"`: build được, chưa có test nào khớp. 19 test cũ vẫn xanh khi chạy `dotnet test backend/EmployeeCrud.slnx`.

### Step 3: Tầng dữ liệu: thực thể, cấu hình, migration (implement rồi kiểm tay)

- [x] `Departments/Department.cs`: `Id` (int), `Name` (string, khởi tạo `""`).
- [x] `Departments/DepartmentConfiguration.cs` (`IEntityTypeConfiguration<Department>`): `ToTable("departments")`, `HasKey`, `Id` → `HasColumnName("id")`, `Name` → `HasColumnName("name")`, `HasMaxLength(100)`, `IsRequired()`. **Không** khai chỉ mục và **không** `HasData` (NFR3.4, NFR3.5).
- [x] `AppDbContext`: thêm `DbSet<Department> Departments => Set<Department>();` (U1 đã có `ApplyConfigurationsFromAssembly`).
- [x] `dotnet ef migrations add CreateDepartments --project backend/EmployeeCrud.Api --output-dir Migrations`, rồi sửa tay file migration:
  - **Up:** sau `CreateTable`, thêm `migrationBuilder.Sql("CREATE UNIQUE INDEX ux_departments_name ON departments (lower(name));")`, rồi `migrationBuilder.InsertData(table: "departments", column: "name", values: ["Nhân sự", "Kế toán", "Kỹ thuật", "Kinh doanh"])` (không id).
  - **Down:** `DROP INDEX IF EXISTS ux_departments_name;` trước `DropTable`.
  - Comment tiếng Việt giải thích vì sao viết tay.
- [x] **Kiểm tầng dữ liệu (kiểm tay):**
  1. `dotnet ef database update --project backend/EmployeeCrud.Api`, sau đó `dotnet ef database update 0 --project backend/EmployeeCrud.Api`, rồi `dotnet ef database update --project backend/EmployeeCrud.Api` (NFR1.1).
  2. Anh xem trong pgAdmin: bảng `departments`, cột `id` / `name`, chỉ mục `ux_departments_name`, 4 dòng mẫu (AC1.5.1, AC5.3.2).
  3. Anh chạy `INSERT INTO departments (name) VALUES ('KẾ TOÁN');`, phải báo lỗi 23505 (AC5.3.3, NFR3.1).

### Step 4: Tầng nghiệp vụ: DTO và service (implement)

- [x] `Departments/DepartmentDto.cs`: `record DepartmentDto(int Id, string Name)`.
- [x] `Departments/DepartmentRequest.cs`: `Name` có `[Required(ErrorMessage = "Vui lòng nhập tên phòng ban")]`. **Không** đặt `[MaxLength]`, vì độ dài được kiểm sau khi bỏ khoảng trắng ở service (security-design §1).
- [x] `Departments/IDepartmentService.cs`: `GetAllAsync`, `GetByIdAsync`, `CreateAsync`, `UpdateAsync`, `DeleteAsync`, `ExistsAsync` (đều nhận `CancellationToken`).
- [x] `Departments/DepartmentService.cs`:
  - `NormalizeName`: trim, rỗng → `DomainError.Validation("name", "Vui lòng nhập tên phòng ban")`, > 100 → `"Tên phòng ban tối đa 100 ký tự"` (BR1.1–BR1.3).
  - Kiểm trùng: `AnyAsync(d => d.Name.ToLower() == name.ToLower() && d.Id != excludeId)` → `DomainError.Conflict("Tên phòng ban đã tồn tại", "name")` (BR1.4).
  - Đọc: `AsNoTracking`, `OrderBy(Name)`, `Select` ra DTO (BR2.1, NFR5.3). Không có → `NotFound("Không tìm thấy phòng ban có mã {id}.")` (BR2.2).
  - Sửa / Xóa: đọc dòng có theo dõi, rồi `SaveChangesAsync`. Bắt `DbUpdateConcurrencyException` → NotFound (NFR3.3). Khi xóa, bắt `DbUpdateException` có `PostgresException` 23503 với `ConstraintName == DbConstraintNames.EmployeeDepartmentForeignKey` → `Conflict("Không thể xóa phòng ban \"<tên>\" vì vẫn còn nhân viên.", title: "Không thể xóa phòng ban")` (BR2.5). Tên phòng ban được đọc trước khi xóa.
  - `ExistsAsync(id)`: `AnyAsync` (BR2.6). Lỗi lạ không bắt.
  - Comment tiếng Việt ngắn ở chỗ không hiển nhiên.

### Step 5: Tầng nghiệp vụ: viết và chạy ngay unit test

- [x] `Tests/Departments/TestDb.cs`: tạo `AppDbContext` InMemory với tên database bằng `Guid` cho mỗi test, kèm hàm nạp sẵn dữ liệu.
- [x] `Tests/Departments/ThrowingAppDbContext.cs`: lớp con `AppDbContext`, ghi đè `SaveChangesAsync` để ném lỗi được truyền vào (NFR4.6).
- [x] `Tests/Departments/DepartmentServiceTests.cs`: các ca trong `unit-test-instructions.md` (khoảng 20 ca: đúng, lỗi, biên cho từng thao tác). Test "sắp A-Z" dùng tên ASCII, vì InMemory sắp theo mã ký tự (rà soát NFR Design).
- [x] Chạy `dotnet test backend/EmployeeCrud.slnx --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Departments"` → xanh.
- [x] Chạy `npm --prefix frontend run coverage` → `DepartmentService` ≥ 80% dòng. Dưới 80% thì thêm test, không hạ ngưỡng.

### Step 6: Tầng API: controller (implement rồi kiểm tay)

- [x] `Departments/DepartmentsController.cs`: `[ApiController]`, `[Route("api/departments")]`; `GET`, `GET {id:int}`, `POST` → `CreatedAtAction` (201 + Location), `PUT {id:int}` → 200, `DELETE {id:int}` → 204 (BR2.3). Không chứa luật, chỉ gọi service. Khai `[ProducesResponseType]` để trang OpenAPI ghi đủ mã 200/201/204/400/404/409.
- [x] `Program.cs`: thêm `builder.Services.AddScoped<IDepartmentService, DepartmentService>();` (NFR5.6).
- [x] `dotnet build` và `dotnet format backend/EmployeeCrud.slnx --verify-no-changes`.
- [x] **Kiểm tầng API (kiểm tay):** chạy backend `dotnet run --project backend/EmployeeCrud.Api --launch-profile http`. Em gọi bằng `curl.exe`, anh gọi lại bằng Postman:
  - `GET` → 200, đúng thứ tự Kế toán, Kinh doanh, Kỹ thuật, Nhân sự.
  - `POST {"name":"  Marketing  "}` → 201, kèm `Location`, tên đã trim.
  - `POST` tên rỗng → 400 `errors.name`. Tên 101 ký tự → 400. `"kế toán"` → 409 `errors.name`.
  - `PUT` "Kế toán" thành "KẾ TOÁN" → 200. `PUT` thành tên của phòng ban khác → 409. `PUT` id 99999 → 404.
  - `DELETE` → 204, sau đó `GET {id}` → 404. `GET /api/departments/abc` → 404.
  - Thời gian mỗi lời gọi ≤ 1 giây (NFR5.1, NFR5.2).
  - Trang `/swagger` hiện đủ 5 thao tác.

### Step 7: Tầng giao diện (implement rồi kiểm tay)

- [x] `src/api/departments.ts`: kiểu `Department`, `DepartmentRequest`; 5 hàm dựa trên `client.ts` (truyền `signal` khi đọc).
- [x] `src/pages/departments/validateDepartment.ts`: hàm thuần, trim, rồi kiểm bắt buộc và ≤ 100, trả `FieldErrors` (BR4.2).
- [x] `git mv frontend/src/pages/DepartmentsPage.tsx frontend/src/pages/departments/DepartmentsPage.tsx`, rồi viết trang danh sách theo `frontend-components.md` §3:
  - Có 4 trạng thái; `Toast`; `DataTable`; dòng "Có N phòng ban".
  - Nút Sửa và Xóa có `aria-label` đầy đủ.
  - Xóa: `window.confirm`, khóa nút ("Đang xóa..."), xong thì gọi lại `loadDepartments()`. Lỗi 409 hoặc lỗi mạng hiện `role="alert"`; 404 thì tải lại và báo "Mục này đã không còn" (BR4.1, BR4.5, BR4.7).
- [x] `src/pages/departments/DepartmentFormPage.tsx` (`mode` create/edit) theo §4:
  - Điền sẵn khi sửa; 404 khi mở → thông báo không tìm thấy.
  - Kiểm khi rời ô và khi bấm Lưu; `ErrorSummary` nhận focus khi có lỗi.
  - `useSubmitGuard` (nút đổi thành "Đang lưu..."); 400/409 → lỗi cạnh ô; 404 khi lưu → khung tóm tắt; lưu xong → về danh sách kèm lời báo (BR4.2–BR4.4, BR4.6).
- [x] `App.tsx`: import trang từ thư mục mới; thêm `departments/new` và `departments/:id/edit`.
- [x] Thêm `data-testid` cho phần tử bấm được: nút thêm, sửa, xóa, ô tên, nút lưu, nút hủy, nút thử lại.
- [x] **Kiểm tầng giao diện:** `npm --prefix frontend run lint`, `typecheck`, `format`, rồi `format:check`, `build` đều sạch. Sau đó kiểm tay trên trình duyệt (backend đang chạy) theo mục "Kiểm tay" trong `unit-test-instructions.md`, gồm các việc U2 chuyển sang: CORS thật, bấm đúp Lưu chỉ một request, xóa xong dòng biến mất không cần F5, tắt backend thì hiện lỗi kết nối, Lighthouse ≥ 90.

### Step 8: Cấu hình build và quét

- [x] Chạy `npm --prefix frontend run verify` → xanh (gồm test cũ và test mới).
- [x] Quét ở thư mục gốc:
  - `git grep --untracked -i -n -E "(password|pwd)\s*=" -- backend frontend` → 0 dòng.
  - `git grep --untracked -n -E "dangerouslySetInnerHTML|FromSqlRaw|ExecuteSqlRaw" -- backend frontend/src` → 0 dòng (NFR2.3, NFR2.5).

### Step 9: Tài liệu và truy vết

- [x] Viết `code-summary.md`, gồm:
  - file đã tạo hoặc sửa, phiên bản gói thật, quyết định chính;
  - kết quả `lower()`, migration lên/xuống, curl/Postman, độ phủ, kiểm tay, quét;
  - nháp cho README của U5: chạy migration, đọc độ phủ, bật log SQL;
  - việc chuyển cho U4: khóa ngoại đúng tên `fk_employees_department`; xóa phòng ban còn nhân viên kiểm thật bằng Postman (409) ở Build and Test.
- [x] Ghi `source-manifest.json` và `traceability.json`.

### Step 10: Làm lại giao diện chuẩn doanh nghiệp (Hiệp yêu cầu, 03/11/2026)

> **Vì sao có bước này:** Hiệp yêu cầu làm lại giao diện chuyên nghiệp "như các doanh nghiệp lớn đang dùng", "dứt một lần duy nhất, đến chi tiết nhỏ nhất" (form 08aacca2, 1af678f9; tin nhắn e9cfca12, c772c370), chỉ đổi giao diện, đúng `docs/ke-hoach.md`. U2 đã đổi khung (thanh bên, icon, hộp xác nhận), nhưng ảnh Hiệp chụp cho thấy phần chung còn to và thưa, phân tầng chưa rõ. Bước này **sửa luôn phần chung** (file của U2, nêu tên dưới đây) rồi áp vào trang phòng ban; U4 sau đó chỉ áp vào trang nhân viên.

**Chuẩn áp dụng** (đối chiếu Ant Design Pro, Microsoft Fluent, SAP Fiori):

| Nhóm | Trước (U2) | Sau |
|---|---|---|
| Chữ | Thân 15px, tiêu đề 22px | Thân và bảng **14px**, nhãn 14px đậm vừa, chữ phụ 13px, tiêu đề trang 20px, tiêu đề tấm 16px |
| Điều khiển | Nút/ô nhập cao 40px | **36px**; nút trong dòng bảng 28px; nút có icon 16px; bo góc 6px |
| Đầu trang | Tiêu đề nằm trên nền xám | **Dải đầu trang trắng** sát mép trên, có đường kẻ dưới: đường dẫn trang, tiêu đề + mô tả bên trái, nút chính bên phải |
| Nội dung | Rộng tối đa 1200px, lề 32px | Lề 24px, rộng theo màn hình (tối đa 1440px); form giới hạn 880px để ô nhập không dài quá |
| Tấm | Chỉ có viền | **Phần đầu** (tiêu đề tấm, ghi chú), **thân**, **chân** (thanh nút căn phải, nền xám nhạt) |
| Bảng | Dòng cao, chữ to | Dòng 48px, đầu cột 13px đậm màu phụ trên nền xám nhạt, kẻ dòng mảnh, rê chuột tô nhạt; cột thao tác căn phải |
| Nút dòng | Nút viền "Sửa", nút đỏ đặc "Xóa" | Nút chữ nhỏ có icon: "Sửa" màu chính, "Xóa" màu đỏ, không nền; nút đỏ đặc chỉ có trong hộp xác nhận |
| Ô chọn | Mũi tên mặc định của trình duyệt | Mũi tên SVG cùng kiểu icon, cùng chiều cao 36px |
| Gợi ý ô nhập | Cách ô 8px | Ngay dưới ô (4px), chữ 13px |
| Thanh bên | 240px, mục 40px | 232px; vùng logo cao 56px khớp dải đầu trang; mục 40px chữ 14px |

**Implement, phần chung (file của U2):**

- [x] `styles/tokens.css`, `styles/base.css`, `styles/components.css`: áp bảng trên; thêm `page-header` dạng dải trắng, `panel__header/__body/__footer`, `form--narrow`, `select` có mũi tên SVG; giữ mọi biến màu đã đo tương phản (17/17 đạt), viền focus 3px, `prefers-reduced-motion`, bố cục 320px.
- [x] `components/PageHeader.tsx`: nhận `headingRef` từ trang (trang gọi `usePageTitle` như trước) thay vì tự gọi bên trong, để trang còn đưa được focus về tiêu đề sau khi xóa (WCAG 2.4.3). Sửa `pages/NotFoundPage.tsx` theo cách mới.

**Implement, trang phòng ban (U3):**

- [x] `pages/departments/DepartmentsPage.tsx`: `PageHeader` (đường dẫn "Nhân sự > Phòng ban", mô tả "Danh mục phòng ban dùng khi gán nhân viên.", nút "Thêm phòng ban" có icon); tấm có thanh công cụ ghi "N phòng ban"; bảng cột "Tên phòng ban" + "Thao tác"; nút dòng "Sửa"/"Xóa" nhỏ có icon; xóa qua `ConfirmDialog` ("Xóa phòng ban?" — "Phòng ban **<tên>** sẽ bị xóa vĩnh viễn. Thao tác này không thể hoàn tác." — [Hủy] [Xóa phòng ban]); lỗi xóa (409, mạng) hiện khung lỗi có icon trên tấm; trạng thái tải/lỗi/trống nằm trong tấm. Giữ nguyên `data-testid`, luồng tải/tải lại/hủy lời gọi, focus về tiêu đề sau khi xóa.
- [x] `pages/departments/DepartmentFormPage.tsx`: `PageHeader` (đường dẫn "Nhân sự > Phòng ban > Thêm mới / Sửa", mô tả có câu "Trường có dấu * là bắt buộc."); form trong tấm ("Thông tin phòng ban"), ô "Tên phòng ban" gợi ý "Tối đa 100 ký tự, không trùng với phòng ban khác."; chân tấm [Hủy] [Lưu phòng ban] (đang lưu: "Đang lưu…"); trạng thái tải / không tìm thấy / lỗi trong tấm. Giữ nguyên luật kiểm, `data-testid`, khung tóm tắt lỗi.

**Kiểm (sau khi code; không có test tự động React theo `team.md`):**

- [x] `npm --prefix frontend run verify` (96 test backend, typecheck, lint, Prettier, build); `audit --omit=dev`; vẫn chỉ 3 gói chạy.
- [x] Playwright (Chromium, backend + PostgreSQL thật): danh sách đúng thứ tự, "4 phòng ban"; thêm (trống → lỗi cạnh ô + khung tóm tắt nhận focus, không gửi request; "kế toán" → 409 cạnh ô; hợp lệ → Toast, về danh sách); sửa; xóa: K9 của U2 (hộp: focus ở "Hủy", Tab trong hộp, Esc đóng và focus về nút Xóa, nút giữ focus khi đang xóa), xóa phòng ban còn nhân viên → khung lỗi có tên, dòng còn; K11–K14 của U2; 320px; kiểm DOM (lang, `h1`, landmark, nhãn, `caption`, không trùng id); đo lại tương phản; console 0 lỗi 0 cảnh báo. Dữ liệu thử tên giả, thử xong xóa.
- [x] Chụp ảnh trước/sau (danh sách, form, form có lỗi, hộp xác nhận, 320px) để Hiệp xem.
- [x] Cập nhật `unit-test-instructions.md` (mục giao diện), `code-summary.md` (mục Step 10), `source-manifest.json`, `traceability.json`.

**Không đổi:** API, `client.ts`, `api/departments.ts`, luật kiểm `validateDepartment.ts`, backend, test backend, đường dẫn trang.

### Step 11: Sửa theo rà soát tổng thể (Change Request, 03/11/2026)

> **Vì sao có bước này:** Hiệp yêu cầu rà toàn bộ "chuẩn như công ty thật" trước khi chốt; danh sách ở `build-and-test/ra-soat-tong-the.md`, Hiệp chọn sửa cả 4 nhóm (form 34027473). Phần thuộc U3 ở dưới. Không thêm tính năng: chỉ siết kiểm dữ liệu và dọn code cho dễ giải thích.
>
> **Sửa sau khi duyệt (Hiệp chọn, form 58339e3f, sau tin nhắn 87ea0d27 "chuẩn như các công ty lớn… giải quyết triệt để"):** chặn thêm ký tự định dạng vô hình (Unicode Cf) và tra chuẩn quốc tế để ghi căn cứ (RFC 8264, RFC 8266, W3C Character Model; chi tiết ở `code-summary.md` mục 4c và `functional-design/rules.md` BR1.1).

**Luật chuẩn hóa tên (N-04, S-04/N-09):** áp ở API (nơi quyết định) và ở form (để báo sớm), cùng thứ tự:

| Bước | Làm gì | Vì sao |
|---|---|---|
| 1 | Mọi chuỗi khoảng trắng (dấu cách, tab, xuống dòng, khoảng trắng Unicode; cùng tập với `char.IsWhiteSpace` của .NET) gộp thành một dấu cách; bỏ khoảng trắng hai đầu | "Kế&nbsp;&nbsp;toán" (2 dấu cách) và "Kế toán" là một tên, nhưng trước đây lách được luật không trùng |
| 2 | Còn ký tự điều khiển (Unicode Cc, ví dụ U+0000, ESC), ký tự định dạng vô hình (Unicode Cf, ví dụ U+200B, U+202E, U+FEFF) hoặc nửa cặp surrogate đứng một mình → 400 trường `name` "Tên phòng ban chứa ký tự không hợp lệ" | U+0000 bị PostgreSQL từ chối nên API trả 500; U+200B làm hai tên trông giống hệt mà máy coi là khác; U+202E làm chữ hiện ra khác chữ thật (CVE-2021-42574) |
| 3 | Đưa chữ có dấu về dạng dựng sẵn (NFC) | "ế" gõ kiểu tổ hợp (e + dấu mũ + dấu sắc, NFD) trông y hệt "ế" dựng sẵn nhưng là chuỗi khác |
| 4 | Kiểm rỗng, kiểm tối đa 100 ký tự, kiểm trùng trên tên **đã chuẩn hóa**; lưu tên đã chuẩn hóa | Độ dài và trùng tên được tính trên đúng thứ sẽ lưu |

Implement:

- [x] Backend, file mới dùng chung `backend/EmployeeCrud.Api/Platform/Text/TextInput.cs`: hàm `TryNormalize(string? raw, out string normalized)` làm bước 1–3, trả `false` khi gặp ký tự không hợp lệ. Đặt ở `Platform` vì U4 (họ tên, email) dùng lại đúng hàm này; không sửa file nào có sẵn của U1.
- [x] `DepartmentService.NormalizeName`: dùng `TextInput.TryNormalize`, thêm hằng `NameInvalidMessage`. Thứ tự lời báo: ký tự không hợp lệ → rỗng → quá 100 ký tự.
- [x] Frontend, file mới dùng chung `frontend/src/utils/normalizeText.ts`: cùng bước 1–3 (`normalize("NFC")`), trả `null` khi gặp ký tự Cc, Cf hoặc nửa cặp surrogate (biểu thức Unicode property Cc, Cf, Cs của JavaScript). `validateDepartment.ts` dùng hàm này, thêm lời báo "Tên phòng ban chứa ký tự không hợp lệ", tính độ dài trên tên đã chuẩn hóa. Form gửi tên đã chuẩn hóa (thay cho `name.trim()`).
- [x] (N-03) `DepartmentFormPage.tsx`: bỏ `maxLength` ở ô tên. Dán 120 ký tự thì giữ nguyên và hiện "Tên phòng ban tối đa 100 ký tự", không cắt bớt mà không báo.
- [x] (A-13) `App.tsx`: thêm `DepartmentEditRoute` giống `EmployeeEditRoute` (`key` theo id): đang sửa phòng ban A mà mở địa chỉ sửa phòng ban B thì form được tạo mới và nạp đúng B.
- [x] (A-05) `DepartmentsPage.tsx`: tải danh sách cùng kiểu với `EmployeesPage`: một `useEffect` theo `reloadKey`; "Thử lại" và sau khi xóa chỉ tăng `reloadKey`; bỏ `reloadControllerRef`, `showDepartments`, `showLoadError`. Hành vi không đổi.
- [x] (A-06) `DepartmentsPage.tsx`, `DepartmentFormPage.tsx`: dùng `GENERIC_MESSAGE`, `isAborted`, `messageOf` từ `api/client.ts`, bỏ bản chép trong từng trang.
- [x] Tài liệu thiết kế U3: `functional-design/rules.md` BR1.1–BR1.3 và bảng tóm tắt ghi luật chuẩn hóa mới kèm căn cứ chuẩn, đánh dấu đổi có chủ đích theo rà soát (N-04, S-04), để tài liệu không lệch code (bài học R-10 của U2).

Unit test (viết và chạy ngay sau service, trong `DepartmentServiceTests`; số #21 đã có nên bắt đầu từ #22):

- [x] #22 Khoảng trắng ở giữa và hai đầu (nhiều dấu cách, tab, U+00A0) được gộp thành một dấu cách khi lưu.
- [x] #23 "Kế&nbsp;&nbsp;toán" (2 dấu cách) khi đã có "Kế toán" → 409 trường `name`.
- [x] #24 "Kế toán" gõ kiểu tổ hợp (NFD) → lưu dạng NFC; tạo tiếp bản dựng sẵn → 409.
- [x] #25 Tên chứa U+0000, ESC, U+200B, U+202E, U+FEFF, nửa cao, nửa thấp (7 ca trong một test) → 400 "Tên phòng ban chứa ký tự không hợp lệ", không lưu gì.
- [x] #26 Emoji đủ hai nửa surrogate → lưu nguyên.
- [x] #27 Sửa với ký tự không hợp lệ → 400, giữ tên cũ.

Kiểm (sau khi code):

- [x] `npm --prefix frontend run verify` xanh (109 test); độ phủ dòng `DepartmentService` 100%, `TextInput` 100% (`npm --prefix frontend run coverage`).
- [x] Bản JavaScript `normalizeText` cho cùng kết quả với bản C# trên 14 ca.
- [x] API thật (PostgreSQL): POST tên chứa U+0000, U+200B, U+202E → 400 (trước: U+0000 ra 500); "Kế&nbsp;&nbsp;toán" → 409; NFD → 409; tên hợp lệ có khoảng trắng thừa → 201 đã gộp; PUT ký tự lạ → 400, tên cũ giữ nguyên; danh sách đang có không tên nào bị ảnh hưởng. Dữ liệu thử đã xóa.
- [x] Playwright (Chromium; frontend dev cổng 5174, backend 5081 cho phép thêm origin 5174 bằng biến môi trường vì cổng 5173 đang có preview của Hiệp; tắt khi xong): dán 120 ký tự → ô giữ đủ 120, lời báo cạnh ô, không gửi request; ký tự vô hình → lời báo, không request; "&nbsp;&nbsp;Kế&nbsp;&nbsp;&nbsp;toán&nbsp;" → gửi tên đã chuẩn hóa, 409 cạnh ô; đang sửa A chuyển sang sửa B → form nạp B; chặn API → "Thử lại" → có dữ liệu; xóa → tải lại; K9, K14 của U2 đạt; console 0 lỗi của ứng dụng.
- [x] Cập nhật `code-summary.md` (mục 4c), `unit-test-instructions.md` (ca #22–#27, kiểm tay 9–12), `source-manifest.json` (thêm file của Step 11).

Sửa sau review (Hiệp duyệt checkpoint U3, gõ 1, yêu cầu sửa R-05 đến R-09; 03/11/2026; chỉ tài liệu):

- [x] **(R-05)** `unit-test-instructions.md` mục 7: bộ 14 ca đối chiếu hai bản chuẩn hóa, dùng chung cho U3, U4.
- [x] **(R-06, R-08)** `code-summary.md` mục 4c: ghi giới hạn ZWJ/ZWNJ và câu về phiên bản Unicode.
- [x] **(R-07)** `functional-design/rules.md` BR1.3: độ dài đếm theo đơn vị UTF-16.
- [x] **(R-09)** Phần đầu plan: số test và hai file dùng chung.
- [x] Ghi `code-summary.md` mục 4d.

**Không đổi:** API (đường dẫn, mã lỗi, dạng JSON), giao diện (CSS, bố cục), migration và dữ liệu đang có trong database.

### Step 12: Gợi ý quy ước tên phòng ban (Change Request FR8, 03/11/2026; BR4.8, US6.5)

- [x] `frontend/src/pages/departments/DepartmentFormPage.tsx`: đổi `hint` của ô "Tên phòng ban" thành "Viết hoa chữ cái đầu, ví dụ: Kế toán, Nhân sự, IT. Tối đa 100 ký tự, không trùng với phòng ban khác." (`FormField` đã gắn gợi ý bằng `aria-describedby`, không cần sửa U2).
- [x] Không đổi `validateDepartment.ts`, `DepartmentService`: quy ước là gợi ý, không phải luật; không tự đổi chữ (giữ "IT", "R&D").
- [x] Kiểm: `npm --prefix frontend run verify` xanh (118 test không đổi số); Playwright: form thêm và sửa hiện gợi ý, `aria-describedby` của ô trỏ tới dòng gợi ý; nhập "kế TOÁN mới" → API nhận đúng chuỗi đó (chặn request, không lưu thật).
- [x] Tài liệu: code-summary §4e, unit-test-instructions (kiểm tay K-tên), source-manifest nếu cần.
- **Không làm ở U3 (story map):** `employeeCount`, trang chi tiết, hộp "Không thể xóa phòng ban", câu 409 có N (U4); README mục quy ước (U5).

## Không làm trong U3

- Không kiểm "còn nhân viên" trước khi xóa, không bảng nhân viên (U4).
- Không phân trang, không cache, không test tự động cho controller hay React, không README (U5).
- Không sửa `ErrorMapper` hay file nào khác của U1, ngoài `Program.cs` và `AppDbContext` (thêm `DbSet`).

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

Áp dụng hợp đồng cho U3, theo thứ tự `team.md`:

| Tầng của hợp đồng | Bước làm | Cách kiểm |
|---|---|---|
| Dữ liệu | Step 3 | Kiểm tay migration lên / xuống / lên trong pgAdmin |
| Truy cập dữ liệu | Không có tầng riêng (EF Core là lớp truy cập dữ liệu, NFR6.4) | — |
| Nghiệp vụ | Step 4 | Unit test chạy ngay ở Step 5 |
| API | Step 6 | Kiểm tay bằng curl/Postman |
| Giao diện | Step 7 | Lint, typecheck, build và kiểm tay trên trình duyệt |
| Cấu hình | Step 8 | |
| Tài liệu | Step 9 | |

Runner có sẵn từ U1 (`EmployeeCrud.Api.Tests`, xUnit). Step 2 kiểm lệnh lọc của U3 chạy được trước khi viết test đầu tiên.
