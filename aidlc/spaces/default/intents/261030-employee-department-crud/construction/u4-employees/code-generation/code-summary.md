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

## 5c. Step 11: sửa theo rà soát tổng thể (Change Request, 03/11/2026)

Nguồn: `build-and-test/ra-soat-tong-the.md`; Hiệp chọn sửa cả 4 nhóm (form 34027473), dặn "chuẩn như các công ty lớn… giải quyết triệt để" (tin nhắn 87ea0d27), chọn chuỗi tìm có ký tự lạ thì trả danh sách rỗng (form c6e6889f), duyệt plan Step 11 (gõ 1). Dùng lại hàm chuẩn hóa chung của U3 (`Platform/Text/TextInput.cs`, `utils/normalizeText.ts`), cùng căn cứ chuẩn (RFC 8264 §4.3.3, RFC 8266 §2.1, W3C Character Model §2.2.1; chi tiết ở code-summary U3 mục 4c).

| Mã | Trước | Sau | File |
|---|---|---|---|
| S-04, N-09 | `GET /api/employees?search=%00` → PostgreSQL từ chối → **500** | Chuỗi tìm qua `TextInput.TryNormalize`; có ký tự lạ → **200 `[]`** ngay, không gửi xuống database | `EmployeeService.GetAllAsync` |
| N-04 (tìm) | Chỉ bỏ khoảng trắng hai đầu chuỗi tìm | Gộp khoảng trắng, NFC: "nguyễn&nbsp;&nbsp;văn" hay bản gõ kiểu tổ hợp vẫn tìm ra; ô tìm và địa chỉ trang ghi chuỗi đã chuẩn hóa | `EmployeeService.GetAllAsync`, `EmployeesPage.tsx` |
| N-04 (họ tên, email) | Chỉ bỏ khoảng trắng hai đầu; U+200B lọt qua luật định dạng email, "a(U+200B)@x.vn" lách được luật không trùng | Chuẩn hóa như tên phòng ban; ký tự lạ → 400 "Họ tên / Email chứa ký tự không hợp lệ"; so trùng email trên giá trị đã chuẩn hóa | `EmployeeService.Normalize`, `validateEmployee.ts`, `EmployeeFormPage.tsx` (gửi giá trị đã chuẩn hóa) |
| N-03 | `maxLength` cắt bớt phần dán thừa ở ô họ tên, email | Bỏ `maxLength`; lời báo "tối đa…" hiện cạnh ô | `EmployeeFormPage.tsx` |
| N-05 | Hộp xóa chỉ ghi họ tên | Ghi thêm email trong ngoặc | `EmployeesPage.tsx` |
| N-07 | Sửa từ kết quả tìm, Lưu/Hủy về `/employees` (mất chuỗi tìm) | Nút Sửa gửi chuỗi tìm qua `state`; form dựng lại địa chỉ bằng `URLSearchParams` (hàm `listPathFrom`) | `EmployeesPage.tsx`, `EmployeeFormPage.tsx` |
| A-08 | `SaveAsync(employee.Id)` khi thêm mới truyền id 0 | `SaveAsync(int? id)`, thêm mới truyền `null`; lỗi tranh chấp khi thêm mới được ném nguyên | `EmployeeService` |
| N-10 | Comment ghi "trả 200 thay vì 404" | Sửa: kết quả là 404 do bước đọc lại `GetByIdAsync` | `EmployeeService.UpdateAsync` |
| A-06 | Câu lỗi chung, `isAborted`, `messageOf` chép trong từng trang | Dùng bản xuất từ `api/client.ts` | `EmployeesPage.tsx`, `EmployeeFormPage.tsx` |

**Khác kế hoạch (nhỏ, cùng mục đích; hoặc Hiệp đã chọn):**

1. **A-05 phần U4 không làm** (đã ghi trong plan): giữ `search` trong danh sách phụ thuộc của `useEffect` ở `EmployeesPage`, vì hàm có dùng `search` bên trong nên quy tắc `react-hooks/exhaustive-deps` của ESLint bắt buộc khai báo; bỏ đi thì `npm run lint` báo lỗi. Khai báo thừa không làm sai gì: `requestKey` đã chứa `search` nên hai giá trị luôn đổi cùng lúc.
2. Địa chỉ quay về có chuỗi tìm (`listPath`) dùng cho cả liên kết "Nhân viên" ở đường dẫn trang và nút "Về danh sách nhân viên" khi không tìm thấy, không chỉ Lưu/Hủy, để mọi đường quay về từ form sửa đều nhất quán.
3. Smart App Control chặn file `.dll` mới build 3 lần (`EmployeeCrud.Api.Tests.dll` một lần, `EmployeeCrud.Api.dll` hai lần, gồm một lần khi đo độ phủ). Lần đầu Hiệp chọn "làm như U3, từ nay tự làm" (form bb8c0c8f, đã ghi vào `27-10/CLAUDE.md`). Em thêm 3 comment có ích (`CreateServiceThatFailsOnSave`, `FindTrackedAsync`, `GetByIdAsync`), mỗi lần một comment, và chạy lại được. Không đổi cài đặt máy.
4. Hộp xóa trong tài liệu ghi ví dụ cụ thể thay cho `<email>`, vì Markdown hiểu nhầm `<email>` là thẻ HTML và ẩn chữ đó đi.

**Đã kiểm:**
- Unit test: 117/117 (109 cũ + 8 mới #33–#40). Độ phủ dòng: `EmployeeService` 100%, `DepartmentService` 100%, `TextInput` 100%. Test #37 dùng ngữ cảnh database đã đóng, nên chứng minh được chuỗi tìm có ký tự lạ không bao giờ xuống tới database.
- API thật (PostgreSQL): `?search=%00`, `?search=%E2%80%8B`, `?search=minh%00` → 200 `[]` (trước: 500); POST họ tên chứa U+0000 hoặc U+200B → 400 `fullName`; email chứa U+200B → 400 `email`; POST "&nbsp;&nbsp;Nguyễn&nbsp;&nbsp;&nbsp;Thử(U+00A0) Nghiệm&nbsp;" → 201 "Nguyễn Thử Nghiệm"; email gõ kiểu tổ hợp trùng → 409; tìm "nguyễn&nbsp;&nbsp;thử" → ra kết quả. 2 nhân viên đang có đều đã ở dạng chuẩn. Bản ghi thử đã xóa, còn đúng 2 nhân viên.
- Playwright (Chromium; frontend dev cổng 5174 + backend 5081 cho phép thêm origin 5174, vì cổng 5173 đang có preview của Hiệp; tắt khi xong): dán 120 ký tự họ tên, 310 ký tự email → ô giữ nguyên, 2 lời báo, 0 POST; ký tự vô hình → 2 lời báo, 0 POST; tìm "&nbsp;&nbsp;Đỗ&nbsp;&nbsp;&nbsp;Văn&nbsp;" → `?search=Đỗ+Văn`, ô tìm "Đỗ Văn", "Tìm thấy 1 nhân viên"; Sửa → Hủy và Sửa → Lưu đều về `/employees?search=Đỗ+Văn` (Lưu có thông báo); hộp xóa "Nhân viên Đỗ Văn Tạm (do.tam@congty.vn) sẽ bị xóa vĩnh viễn…", focus "Hủy"; xóa xong giữ `?search=`, focus `h1`; mở thẳng địa chỉ sửa rồi Hủy → `/employees`. Console 0 lỗi, 0 cảnh báo.
- `npm --prefix frontend run verify` xanh (typecheck, lint 0 cảnh báo, Prettier, build, 117/117).

**Chuyển cho U5:** `docs/danh-sach-api.md` cần thêm hai lời báo 400 "Họ tên chứa ký tự không hợp lệ", "Email chứa ký tự không hợp lệ" (và "Tên phòng ban chứa ký tự không hợp lệ" của U3), và ghi chú "chuỗi tìm có ký tự lạ → 200 `[]`".

## 5d. Sửa sau review Step 11 (Hiệp duyệt checkpoint U4, gõ 1, yêu cầu sửa R-07, R-08; 03/11/2026)

Reviewer kết luận READY; 2 góp ý Minor.

| Điểm | Sửa | Kiểm lại |
|---|---|---|
| R-07 | Đang tìm "a b" mà gõ lại "a&nbsp;&nbsp;b" rồi Tìm: địa chỉ không đổi nên `SearchBox` không đồng bộ lại, ô vẫn hiện "a&nbsp;&nbsp;b". Sửa: `onSearch` trả lại chuỗi thật sự được tìm (`handleSearch` trả `term`), `SearchBox` gán ô bằng chuỗi đó | Playwright: đang `?search=Đỗ Văn`, gõ "Đỗ&nbsp;&nbsp;Văn" + Enter → ô "Đỗ Văn", focus ở ô, "Tìm thấy 1 nhân viên"; "&nbsp;&nbsp;Huỳnh&nbsp;&nbsp;&nbsp;Thị&nbsp;" + nút Tìm → `?search=Huỳnh+Thị`, ô "Huỳnh Thị"; console sạch |
| R-08 | (a) Thêm test #41: sửa với email chứa U+200B → 400 `email`, email cũ giữ nguyên. (b) Ca "chuỗi tìm toàn khoảng trắng trả đủ danh sách" đã có ở test #7 (Theory), ghi rõ trong `unit-test-instructions.md` | `npm --prefix frontend run verify` xanh, 118/118 |

File: `frontend/src/components/SearchBox.tsx`, `frontend/src/pages/employees/EmployeesPage.tsx`, `backend/EmployeeCrud.Api.Tests/Employees/EmployeeServiceTests.cs` (đều đã có trong `source-manifest.json`).

## 6. Nháp cho README (U5)

- Tạo bảng: `dotnet ef database update --project backend/EmployeeCrud.Api` (chạy cả 2 migration).
- Quay lui chỉ phần nhân viên: `dotnet ef database update CreateDepartments --project backend/EmployeeCrud.Api`.
- API nhân viên: `GET /api/employees[?search=]`, `GET /api/employees/{id}`, `POST`, `PUT /api/employees/{id}`, `DELETE /api/employees/{id}`. JSON mẫu: `{ "fullName": "Đỗ Văn An", "email": "do.an@congty.vn", "departmentId": 2 }`; trả về có thêm `id`, `departmentName`.
- Xem câu SQL: đổi `Logging:LogLevel:Microsoft.EntityFrameworkCore.Database.Command` trong `appsettings.Development.json` sang `Information`, xem xong đổi lại `Warning`.
- Lưu ý máy có Smart App Control: nếu `dotnet test`/`dotnet run` báo "Application Control policy has blocked this file", đó là Windows chặn file vừa build chứ không phải lỗi code (xem mục 3, chỗ khác số 4).

## 7. Chuyển cho Build and Test

- Chạy lại toàn bộ test và đo độ phủ trên cả dự án (mức sàn 80% các service).
- 3 Minor của U3 vẫn để riêng (không sửa trong U4): route form phòng ban chưa có `key` theo id; sửa không đổi giá trị trả 200.

## 5e. Change Request 03/11/2026 (FR8): quan hệ phòng ban – nhân viên (Step 12, US6.1–US6.4)

**Backend**
- `DepartmentDto(Id, Name, EmployeeCount)`. `DepartmentService`: danh sách và một phòng đếm bằng truy vấn con trong cùng câu SELECT (log SQL thật: `SELECT d.id, d.name, (SELECT count(*)::int FROM employees AS e …)`, 1 câu cho cả danh sách); POST trả 0, PUT đếm sau lưu.
- Xóa: `CountAsync`, câu 409 duy nhất `Không thể xóa phòng ban "<tên>" vì còn N nhân viên.` (`HasEmployeesMessage`); nhánh chen nhau (23503/23001) đếm lại, tối thiểu 1.
- `GET /api/employees?departmentId=`: controller nhận chuỗi; `EmployeeService.ParseDepartmentFilter` (`NumberStyles.None`, phạm vi int, > 0) sai → 400 `departmentId` "Phòng ban lọc không hợp lệ"; kiểm trước `search`; hợp lệ → `Where` trong cùng truy vấn; không có phòng → `[]`.
- Test: D4–D9 (`DepartmentServiceTests`, thêm `TestSupport/SeedBeforeSaveThenFailContext.cs` mô phỏng chen nhau), #42–#50 (`EmployeeServiceTests`); sửa 3 test cũ sang câu "còn 1 nhân viên" và 2 phép so DTO. **138/138**.

**Frontend**
- `api/departments.ts` (`employeeCount`), `api/employees.ts` (`getEmployees(search, departmentId)` dùng URLSearchParams).
- File U2 (Hiệp duyệt): `ConfirmDialog` thêm `variant: "notice"` (nút Đóng + `extraAction`, kiểu union bắt buộc `onConfirm` chỉ ở chế độ xác nhận, id bằng `useId`); `DataTable` thêm `align: "end"`; `PageHeader` key đường dẫn = vị trí + chữ (phòng "Nhân sự" trùng chữ mục đầu); CSS `.table__cell--end`, `.table__link`, `.dialog__icon--info`, `.alert--info`, `.filter`.
- `useDepartmentDelete.tsx` (mới, dùng chung): N > 0 → hộp thông báo + "Xem N nhân viên"; N = 0 → hộp xác nhận; trang cha báo 404/409.
- `DepartmentsPage`: cột "Số nhân viên", tên là liên kết. `DepartmentDetailPage.tsx` (mới) + route `departments/:id` (key theo id), có `<Toast />`.
- `EmployeesPage`: ô lọc "Phòng ban", câu đếm và trạng thái rỗng theo mockups 8b-3, phòng không còn → bỏ tham số (replace) + câu báo suy ra khi vẽ (không setState trong effect, theo ESLint react-hooks), Sửa gửi `search`/`departmentId`.
- `EmployeeFormPage`: `?departmentId=` chọn sẵn (chỉ khi phòng có thật), `returnTo` chỉ nhận `/departments/<số>`.

**Đã kiểm**
- `verify` xanh (typecheck, ESLint 0 cảnh báo, Prettier, build, 138/138).
- API thật (backend 5081 chạy từ dll, log SQL bật bằng biến môi trường): employeeCount đúng (Kế toán 3…), lọc đúng phòng, lọc + tìm AND, 6 giá trị sai → 400 có `type`, phòng không có → `[]`, xóa Kế toán → 409 "còn 3 nhân viên".
- Playwright (dev 5173): AC6.1.1, AC6.2.1–6.2.5, AC6.3.1–6.3.4, AC6.4.1–6.4.3 đạt; console sạch; dữ liệu thử đã xóa (0 phòng, 0 người còn lại). Lỗi tìm thấy và đã sửa: trang chi tiết thiếu `<Toast />` nên không hiện "Đã thêm nhân viên…".
- Dữ liệu trên máy Hiệp còn "Nhân Sự", "Văn Phòng" sai quy ước tên (FR8.5): Hiệp sửa bằng nút Sửa.

**Sửa theo rà soát U4 lượt 1 (Minor):** (1) nút "Thêm nhân viên" ở trang đang lọc gửi kèm state như nút Sửa, Hủy về đúng `/employees?search=…&departmentId=…` (Playwright đạt); (2) `DepartmentDetailPage` đọc id bằng biểu thức chữ số, `/departments/1e3` → "Không tìm thấy phòng ban" (Playwright đạt). Ghi nhận, không sửa: giới hạn 9 chữ số ở frontend (id thật nhỏ hơn nhiều; số dài hơn coi như không hợp lệ và hiện câu báo); câu báo phòng không còn hiện lại khi F5 đúng mục lịch sử đó (chấp nhận); gợi ý quy ước tên ở `DepartmentFormPage` là việc của U3 (Step 12 U3, US6.5), đã rà ở U3.

## 5f. Loop-back 3 từ Build and Test (04/11/2026, Step 13)

- `components/StatusMessage.tsx` (file U2): hành động dạng liên kết nhận `state` tùy chọn, truyền vào `Link`.
- `EmployeesPage.tsx`: hai liên kết "Thêm nhân viên" ở trạng thái rỗng truyền `state: editState`.
- Kiểm: `verify` xanh 138/138; Playwright: lọc "Văn Phòng" (0 người) → "Thêm nhân viên" ở trạng thái rỗng → `/employees/new?departmentId=21` → Hủy → về `/employees?departmentId=21`. Không tạo dữ liệu thử.

## 5g. Change Request (Hiệp, 04/11/2026, Step 14): kiểu liên kết tên phòng ban

- `styles/components.css` `.table .table__link`: màu chữ thường #1B2430, đậm 600, không gạch; rê chuột xanh #0F62C5 + gạch dưới (offset 0.2em). Không đổi React.
- Kiểm (Playwright, bản build trên preview của Hiệp): lúc thường color rgb(27,36,48) weight 600 decoration none; hover rgb(15,98,197) underline; Tab tới liên kết: viền solid 3px rgb(15,98,197). ESLint, Prettier, Vite build sạch. Ảnh: `.playwright-mcp/phong-ban-lien-ket.png`, `phong-ban-lien-ket-hover.png`.
- Chưa chạy `dotnet test` lại ở bước này vì backend đang chạy giữ file; backend không đổi (checkpoint chạy `verify` đầy đủ).
