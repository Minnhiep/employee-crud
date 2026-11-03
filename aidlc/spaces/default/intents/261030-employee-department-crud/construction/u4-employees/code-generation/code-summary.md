# Tóm tắt code: u4-employees

> Làm theo `code-generation-plan.md` (Hiệp duyệt ngày 2026-11-02). Lệnh chạy ở phiên chính, Hiệp duyệt từng lệnh. Bước pgAdmin và Lighthouse do Hiệp tự làm. Kiểm tay giao diện do AI làm bằng Playwright theo yêu cầu của Hiệp.

## 1. File đã tạo, sửa, dời

| File | Việc |
|---|---|
| `backend/EmployeeCrud.Api/Employees/Employee.cs` | Thực thể, có điều hướng `Department` |
| `backend/EmployeeCrud.Api/Employees/EmployeeConfiguration.cs` | Bảng `employees` snake_case, khóa ngoại `fk_employees_department` (tên lấy từ hằng U1, Restrict), chỉ mục `ix_employees_department_id` |
| `backend/EmployeeCrud.Api/Employees/EmployeeDto.cs`, `EmployeeRequest.cs`, `IEmployeeService.cs` | Hình dạng JSON C2; `DepartmentId` kiểu `int?` không `[Required]` |
| `backend/EmployeeCrud.Api/Employees/EmployeeService.cs` | BR1, BR2.1–BR2.6, tìm kiếm, bắt tranh chấp và 23503 |
| `backend/EmployeeCrud.Api/Employees/EmployeesController.cs` | 5 thao tác C2 + `?search=` |
| `backend/EmployeeCrud.Api/Migrations/20261102083152_CreateEmployees.cs` (+ `.Designer.cs`, `AppDbContextModelSnapshot.cs`) | Migration 2; thêm tay `ux_employees_email` trên `lower(email)` |
| `backend/EmployeeCrud.Api/Departments/DepartmentService.cs` (sửa) | BR2.7 kiểm còn nhân viên trước khi xóa; hàm chung `HasEmployeesConflict`; bắt cả 23503 và 23001 |
| `backend/EmployeeCrud.Api/Platform/Data/AppDbContext.cs` (sửa) | `DbSet<Employee> Employees` |
| `backend/EmployeeCrud.Api/Program.cs` (sửa) | `AddScoped<IEmployeeService, EmployeeService>()` |
| `backend/EmployeeCrud.Api.Tests/TestSupport/TestDb.cs`, `ThrowingAppDbContext.cs` (dời bằng `git mv` từ `Departments/`) | Namespace `EmployeeCrud.Api.Tests.TestSupport`; thêm `SeedEmployeeAsync` |
| `backend/EmployeeCrud.Api.Tests/Employees/EmployeeServiceTests.cs` | 32 ca (47 lượt chạy vì có Theory) |
| `backend/EmployeeCrud.Api.Tests/Departments/DepartmentServiceTests.cs` (sửa) | Thêm D1, D2, D3 |
| `frontend/src/api/employees.ts` | Kiểu + 5 hàm; `?search=` được `encodeURIComponent` |
| `frontend/src/components/SearchBox.tsx` | Form tìm dùng chung |
| `frontend/src/pages/employees/EmployeesPage.tsx` (dời bằng `git mv` từ `pages/`) | Danh sách, tìm, xóa |
| `frontend/src/pages/employees/EmployeeFormPage.tsx`, `validateEmployee.ts` | Form thêm/sửa, luật kiểm như API |
| `frontend/src/App.tsx` (sửa) | 2 đường dẫn form; `EmployeeEditRoute` đặt `key` theo id |

Không thêm gói hay công cụ nào. `appsettings.Development.json` chỉ đổi tạm khi xem log SQL rồi trả lại như cũ (`git diff` sạch).

## 2. Quyết định chính

- **Tìm kiếm:** chuỗi trim rồi hạ chữ ở .NET (`ToLowerInvariant`, gửi xuống dưới dạng tham số); cột hạ chữ ở SQL. EF dịch `Contains` thành `lower(e.full_name) LIKE @p OR lower(e.email) LIKE @p`, tham số đã được EF thoát ký tự (log SQL thật). Không cần phương án dự phòng `ILike`.
- **Một cách đổi sang DTO** (`Expression` dùng chung) cho danh sách, đọc theo id và đọc lại sau khi lưu, nên lúc nào cũng là một câu `SELECT ... JOIN departments`.
- **Thứ tự kiểm cố định:** dữ liệu → phòng ban có không (400) → email trùng (409) → lưu. Sửa thì tìm nhân viên trước (404).
- **Luật email chung C#/TS** `^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$`. Comment ở cả hai nơi ghi rõ điều kiện "đã trim" (`$` và `\s` của .NET khác JavaScript).
- **Giao diện:** chuỗi tìm chỉ lấy từ địa chỉ (`useSearchParams`). Kết quả tải ghi kèm "khóa" `reloadKey|search`, để không phải đặt state ngay trong effect (luật lint). `SearchBox` đặt `key` theo chuỗi tìm, để Back/Forward tạo lại ô với đúng chuỗi. Nút "Thử lại", "Xóa tìm kiếm" vẽ riêng ngoài `StatusMessage` để có `data-testid` mà không sửa component của U2.
- **Giới hạn đã biết** (ghi trong comment): sửa mà mọi giá trị giữ nguyên thì EF không gửi `UPDATE`, nên trường hợp "vừa bị xóa ở nơi khác" trả 200 thay vì 404 (requirements mục 6).

## 3. Chỗ khác kế hoạch (Hiệp đã chọn qua form)

| # | Kế hoạch ghi | Thực tế | Hiệp chọn |
|---|---|---|---|
| 1 | Step 4: service "gom lỗi theo khóa" | `DomainError` của U1 chỉ chứa một trường. API báo **lỗi đầu tiên** theo thứ tự họ tên → email → phòng ban (giống U3); form React vẫn báo đủ cả ba ô | Báo lỗi đầu tiên, không sửa U1 |
| 2 | `PUT` id không có + body sai → 404 | Body **thiếu trường hoặc sai kiểu** bị ASP.NET trả 400 trước khi vào action (`[Required]`). Body đủ hình dạng nhưng sai nội dung → 404 đúng | Giữ nguyên như U3, ghi rõ trong comment controller |
| 3 | SQL tay xóa phòng ban còn nhân viên → 23503 | PostgreSQL thật báo **23001** (restrict_violation) vì khóa ngoại `ON DELETE RESTRICT`. Nhánh dự phòng của U3 chỉ bắt 23503, nên khi hai thao tác chen nhau sẽ ra 500 | Giữ RESTRICT, `DepartmentService` bắt cả 23503 và 23001, thêm test D3 |
| 4 | — | Windows **Smart App Control** (đang bật) chặn nạp `EmployeeCrud.Api.dll` vừa build (`0x800711C7`); build sạch vẫn bị chặn | Không đổi cài đặt máy. Thêm một comment có ích trong `EmployeeService.SaveAsync` (giải thích 23503 và 23001) để ra file `.dll` khác → chạy được. Nếu bị chặn lại thì làm cách tương tự |

Không sửa chữ trong kế hoạch và hướng dẫn test đã duyệt (để không mở lại bước duyệt); các thay đổi ghi ở đây và trong nhật ký stage.

## 4. Test

| Lệnh | Kết quả |
|---|---|
| `dotnet test backend/EmployeeCrud.slnx --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Employees\|FullyQualifiedName~EmployeeCrud.Api.Tests.Departments"` | **75/75 xanh** |
| `npm --prefix frontend run verify` (typecheck, lint, format:check, build, toàn bộ `dotnet test`) | **Xanh, 94/94 test** |
| `npm --prefix frontend run coverage` | `EmployeeService` **100%** dòng, `DepartmentService` **100%** dòng (mức sàn 80%) |
| `dotnet format backend/EmployeeCrud.slnx --verify-no-changes` | Sạch |

Không có test viết ra mà chưa chạy. Theo `team.md`, controller, migration và React không có test tự động; ba tầng đó kiểm tay ở mục 5.

## 5. Kiểm tay

**Database** (Hiệp, pgAdmin):
- Migration lên → quay về `CreateDepartments` (bảng `employees` mất, 4 phòng ban còn) → lên lại: đều chạy được.
- Chỉ mục: `PK_employees`, `ix_employees_department_id`, `ux_employees_email`. Ràng buộc: `PK_employees`, `fk_employees_department` và các NOT NULL.
- Chèn tay `DO.AN@CONGTY.VN` khi đã có `do.an@congty.vn` → **23505** `ux_employees_email`.
- `DELETE FROM departments WHERE id = 3` (còn nhân viên) → **23001** `fk_employees_department` (xem mục 3, chỗ khác số 3).

**API** (curl, `dotnet run --launch-profile http`):
- `GET` sau migration → `200 []`.
- `POST` có khoảng trắng → 201 + `Location`, đã trim, email giữ chữ hoa như đã gõ, có `departmentName`.
- Thiếu họ tên / email `a@b` / `departmentId` null / 99999 → 400 đúng khóa. Email trùng khác hoa thường → 409. `"departmentId": "abc"` → 400.
- `PUT` đổi phòng ban, chỉ đổi hoa thường email của mình → 200; email người khác → 409; id 99999 + body đủ trường nhưng sai → 404.
- Tìm `đỗ`, `ĐỖ`, `đỗ văn` → ra "Đỗ Văn An"; `do van` → rỗng; `%`, `_` → rỗng; `CONGTY` → ra cả hai người.
- `DELETE /api/departments/3` còn nhân viên → 409 "Không thể xóa phòng ban "Kỹ thuật" vì vẫn còn nhân viên."
- `DELETE` nhân viên → 204, rồi `GET` → 404, `DELETE` lại → 404. `/api/employees/abc` → 404.
- Trang OpenAPI: đủ 5 thao tác nhân viên với mã 200/201/204/400/404/409.

**Log SQL** (đổi tạm sang `Information`): danh sách 1 câu JOIN; tìm 1 câu `LIKE`; POST 4 câu, PUT 5, DELETE 2 (đúng ngân sách NFR5.4). Giá trị tham số hiện `'?'`, không lộ dữ liệu cá nhân (NFR6.2).

**Hiệu năng** (1.000 nhân viên tạm `@perf.test`, curl 3 lần mỗi lời gọi): `GET` lâu nhất **0,077 s**, `?search=thử` lâu nhất **0,052 s** (mức ≤ 1 s). Hiệp đã xóa dữ liệu tạm, `count = 0`. Bộ đếm id đã chạy qua 1.000, nên nhân viên thêm sau có id từ 2005 trở đi.

**Giao diện** (Playwright, `http://localhost:5173`): 12/12 mục ở `unit-test-instructions.md` §6 đạt:
- Trống/lỗi khi lưu: lỗi cạnh 3 ô, khung tóm tắt nhận focus, không có POST.
- Lỗi 409 vẫn giữ khi rời ô, mất khi sửa ô. Bấm đúp Lưu chỉ một POST.
- Tìm, Back, F5 giữ đúng `?search=`; "Không tìm thấy..." kèm "Xóa tìm kiếm".
- Form sửa điền sẵn; đổi id ngay trong ứng dụng thì form nạp đúng người mới.
- Xóa: Hủy không gọi API; OK thì xóa xong tự tải lại vẫn giữ chuỗi tìm, có thông báo, focus về tiêu đề.
- Xóa phòng ban còn nhân viên hiện lỗi ở trang Phòng ban.
- Tab đi qua đủ nút, nhãn "Sửa nhân viên ...".
- Tắt backend: danh sách báo lỗi + "Thử lại"; ô Phòng ban báo lỗi + "Thử lại", nút Lưu khóa; bật lại thì nạp được.

Không có lỗi CORS (POST/PUT/DELETE thật từ 5173). Trường hợp "chưa có phòng ban nào" không dựng được trên dữ liệu thật mà không xóa phòng ban, nên mới kiểm bằng đọc code.

**Lighthouse** (Hiệp, `npm run preview`, khung Samsung Galaxy 360×800, trang `/employees`): **Performance 100, Accessibility 100**.

**Quét:**
- `git grep --untracked -i -n -E '(password|pwd)\s*=|"password"\s*:' -- backend frontend` → 0 dòng.
- `git grep --untracked -n -E "dangerouslySetInnerHTML|FromSqlRaw|ExecuteSqlRaw|mailto:|EnableSensitiveDataLogging" -- backend frontend/src` → 0 dòng.

## 5b. Step 10: áp chuẩn giao diện doanh nghiệp cho trang nhân viên (03/11/2026)

Hiệp duyệt kế hoạch và dặn "làm giống như phòng ban". Bước này áp đúng chuẩn của U3 Step 10 (phần chung đã sửa ở đó) cho hai trang nhân viên.

**File:** `pages/employees/EmployeesPage.tsx`, `pages/employees/EmployeeFormPage.tsx`, `components/SearchBox.tsx`, `styles/components.css`; và hai file **của U3**, sửa sau khi U3 đã duyệt (Hiệp giao em quyết, form d8187086; rà soát R-05): `pages/departments/DepartmentFormPage.tsx` (ô tên một cột, mô tả ghi tên), `pages/departments/DepartmentsPage.tsx` (xóa gặp 404 → focus về tiêu đề). Tài liệu U3 (code-summary §4b) chưa ghi hai thay đổi này; Build and Test đối chiếu lại.

| Hạng mục | Trước | Sau |
|---|---|---|
| Đầu trang | `h1` + nút "+ Thêm nhân viên" trên nền xám | `PageHeader`: "Nhân sự > Nhân viên", tiêu đề, mô tả, nút "Thêm nhân viên" có icon |
| Danh sách | Ô tìm, bảng, dòng đếm dưới bảng rời nhau | Một tấm: đầu tấm (tiêu đề + "N nhân viên"/"Tìm thấy N nhân viên", `aria-live` luôn có sẵn), thanh công cụ có ô tìm, bảng |
| Bảng | Chữ trơn, nút "Sửa" viền + "Xóa" đỏ đặc | Vòng chữ cái đầu + họ tên, email chữ phụ, phòng ban; nút chữ nhỏ có icon; tên/email dài tự xuống dòng |
| Ô tìm | Nhãn hiện trên ô; khóa khi tải; bị tạo lại mỗi lần tìm | Icon kính lúp trong ô, chữ mờ, nhãn ẩn cho trình đọc màn hình; không khóa, không tạo lại → focus ở lại ô |
| Xóa | `window.confirm` | `ConfirmDialog` "Xóa nhân viên?", [Hủy] [Xóa nhân viên] |
| Form | Một cột, "(* là ô bắt buộc)", [Lưu] [Hủy] | Tấm "Thông tin nhân viên", lưới hai cột, chữ mẫu và gợi ý dưới ô, chân tấm [Hủy] [Lưu nhân viên]; ô chọn "Chọn phòng ban" (bỏ "-- --") |
| CSS | — | Thêm `.field-group`, `.field__error--action`; email `min-width: 10rem` + ngắt mọi chỗ; `.person` cho xuống dòng; bỏ `.badge`, `.list-count`, `.toolbar__count`, `.form__note`, `.form__actions` (không còn nơi dùng) |

**Khác kế hoạch (nhỏ, cùng mục đích, phát hiện khi tự kiểm):**

1. Hiệp chụp ảnh: icon kính lúp đè chữ "Tìm". Lý do: quy tắc chung `.search input { padding }` nằm sau trong file nên ghi đè khoảng lùi trái. Sửa bằng bộ chọn mạnh hơn `.search .search__field input`.
2. Họ tên 100 ký tự + email dài làm bảng tràn, nút Sửa/Xóa ra ngoài màn hình 1280px (đo: bảng 1546px trong khung 998px). Sửa: tên xuống dòng, email ngắt mọi chỗ nhưng rộng tối thiểu 10rem (ở 320px không bị bóp còn vài ký tự một dòng).
3. Dòng lỗi nạp phòng ban: nút "Thử lại" lệch dưới chữ 4px → thêm `.field__error--action` căn giữa.
4. "Xóa tìm kiếm" thành nút phụ (trước là liên kết nút chính) và đưa focus về ô tìm, vì nút biến mất ngay sau khi bấm.
5. Lời báo xóa 404: "Mục này đã không còn" → "Nhân viên này không còn, danh sách đã được tải lại." (giống phòng ban).
6. Hiệp xem trên Chrome thường và nhờ soát lại "theo chuẩn công ty lớn"; Hiệp giao em quyết (form d8187086). Sửa thêm 3 chỗ:
   - Form phòng ban: ô "Tên phòng ban" đặt trong cùng lưới hai cột, rộng một cột (403px ở 1280px, bằng ô "Họ tên"), thay vì kéo hết tấm. **Đây là file của U3** (`pages/departments/DepartmentFormPage.tsx`), sửa sau khi U3 đã duyệt.
   - Ô chọn phòng ban chưa chọn: chữ "Chọn phòng ban" màu mờ `#5a6472` như chữ mẫu; chọn rồi thì màu chữ thường `#1b2430` (lớp `field__control--placeholder`).
   - Trang sửa ghi rõ đang sửa ai: "Cập nhật thông tin của Đỗ Văn An. …", "Cập nhật tên phòng ban Kế toán. …". Lấy tên lúc mở form, không đổi theo lúc gõ (đã kiểm: gõ tên khác, mô tả giữ nguyên).
   - Không thêm trường (mã nhân viên, số điện thoại, chức danh…) dù form nhân sự ở công ty thật thường có, vì `docs/ke-hoach.md` chỉ yêu cầu họ tên, email, phòng ban.

**Kiểm (Playwright, Chromium, backend + PostgreSQL thật):** danh sách "1 nhân viên", vòng "ĐA"; Enter và nút Tìm → focus ở `#tim-kiem`; "zzzkhongco" → "Tìm thấy 0 nhân viên" + trạng thái không khớp; Back/Forward → chữ trong ô đổi theo địa chỉ; "Xóa tìm kiếm" bằng bàn phím → địa chỉ không còn `?search`, ô rỗng, focus ở ô; Lưu khi trống → 3 lỗi, focus khung tóm tắt, 0 request; "sai-mau" → "Email không đúng định dạng"; "DO.AN@CONGTY.VN" → 409 "Email đã được sử dụng" cạnh ô; thêm thật → "Đã thêm nhân viên…", vòng "NT"; sửa → điền sẵn 3 ô, đường dẫn "Nhân sự > Nhân viên > Sửa", đổi phòng ban → "Đã cập nhật…"; xóa → hộp focus "Hủy", Esc → focus về nút Xóa của dòng, xóa thật → thông báo, focus `h1`; tổng request ghi: POST (409), POST, PUT, DELETE. Tắt backend → danh sách "Không tải được danh sách nhân viên" + "Thử lại", ô tìm vẫn gõ được; form → lỗi nạp phòng ban, ô chọn và nút Lưu khóa; chặn riêng `/api/departments` rồi "Thử lại" → nạp được, Lưu mở. Độ rộng 1920/1280/1024/768/320 với dữ liệu dài: trang không lần nào cuộn ngang, nút "Thêm nhân viên" và Sửa/Xóa trong màn hình (320px: chỉ bảng cuộn ngang trong tấm). DOM form và danh sách: `lang="vi"`, 1 `h1`, 1 `main`, 0 trùng id, 0 ô thiếu nhãn. Console tải sạch: 0 lỗi, 0 cảnh báo. Dữ liệu thử đã xóa, còn đúng 1 nhân viên. `npm --prefix frontend run verify` xanh (96/96; JS 292,80 KB, CSS 16,22 KB), `audit --omit=dev` 0 lỗ hổng. Ảnh: `.playwright-mcp/u4-list.png`, `u4-form.png`, `u4-form-error.png`, `u4-dialog.png`, `u4-long-1280.png`, `u4-long-320.png`, `u4-form-320.png`, `u4-form-dept-error.png`.

**Vì sao ảnh Hiệp chụp bị che bên phải:** đó là cửa sổ Chrome do Playwright điều khiển (có dòng báo `--disable-blink-features=AutomationControlled`), khung trang bị đặt cứng 1440px nên không co theo khi taskbar bên phải chiếm chỗ. Trang thật co giãn theo cửa sổ (đo ở 6 độ rộng ở trên). Cửa sổ kiểm thử đã đóng.

## 6. Nháp cho README (U5)

- Tạo bảng: `dotnet ef database update --project backend/EmployeeCrud.Api` (chạy cả 2 migration).
- Quay lui chỉ phần nhân viên: `dotnet ef database update CreateDepartments --project backend/EmployeeCrud.Api`.
- API nhân viên: `GET /api/employees[?search=]`, `GET /api/employees/{id}`, `POST`, `PUT /api/employees/{id}`, `DELETE /api/employees/{id}`. JSON mẫu: `{ "fullName": "Đỗ Văn An", "email": "do.an@congty.vn", "departmentId": 2 }`; trả về có thêm `id`, `departmentName`.
- Xem câu SQL: đổi `Logging:LogLevel:Microsoft.EntityFrameworkCore.Database.Command` trong `appsettings.Development.json` sang `Information`, xem xong đổi lại `Warning`.
- Lưu ý máy có Smart App Control: nếu `dotnet test`/`dotnet run` báo "Application Control policy has blocked this file", đó là Windows chặn file vừa build chứ không phải lỗi code (xem mục 3, chỗ khác số 4).

## 7. Chuyển cho Build and Test

- Chạy lại toàn bộ test và đo độ phủ trên cả dự án (mức sàn 80% các service).
- 3 Minor của U3 vẫn để riêng (không sửa trong U4): route form phòng ban chưa có `key` theo id; sửa không đổi giá trị trả 200.
