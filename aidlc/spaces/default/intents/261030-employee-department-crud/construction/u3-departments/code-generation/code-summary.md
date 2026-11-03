# Tóm tắt code: u3-departments

> Làm theo `code-generation-plan.md` (Hiệp duyệt ngày 2026-11-02). Lệnh chạy ở phiên chính, Hiệp duyệt từng lệnh. Bước pgAdmin và Lighthouse do Hiệp tự làm.

## 1. File đã tạo hoặc sửa

### Backend

| File | Mới / Sửa | Nội dung |
|---|---|---|
| `backend/EmployeeCrud.Api/Departments/Department.cs` | Mới | Thực thể `Id`, `Name` |
| `backend/EmployeeCrud.Api/Departments/DepartmentConfiguration.cs` | Mới | Bảng `departments`, cột `id`/`name`, `varchar(100) NOT NULL`; không khai chỉ mục, không `HasData` |
| `backend/EmployeeCrud.Api/Departments/DepartmentDto.cs` | Mới | `record DepartmentDto(int Id, string Name)` |
| `backend/EmployeeCrud.Api/Departments/DepartmentRequest.cs` | Mới | `[Required]` trên `Name`; không `[MaxLength]` |
| `backend/EmployeeCrud.Api/Departments/IDepartmentService.cs`, `DepartmentService.cs` | Mới | Luật BR1, BR2; bắt `DbUpdateConcurrencyException` → 404, 23503 `fk_employees_department` → 409 |
| `backend/EmployeeCrud.Api/Departments/DepartmentsController.cs` | Mới | 5 API của C1, `[ProducesResponseType]` đủ mã |
| `backend/EmployeeCrud.Api/Migrations/20261101183552_CreateDepartments.cs` (+ `.Designer.cs`, `AppDbContextModelSnapshot.cs`) | Mới | Bảng + `CREATE UNIQUE INDEX ux_departments_name ON departments (lower(name))` + 4 dòng mẫu `InsertData` không id; `Down` xóa chỉ mục rồi bảng |
| `backend/EmployeeCrud.Api/Platform/Data/AppDbContext.cs` | Sửa | Thêm `DbSet<Department> Departments` |
| `backend/EmployeeCrud.Api/Program.cs` | Sửa | `AddScoped<IDepartmentService, DepartmentService>()` |
| `backend/EmployeeCrud.Api/EmployeeCrud.Api.csproj` | Sửa | Thêm `Microsoft.EntityFrameworkCore.Relational` `10.*` (**khác kế hoạch**, xem mục 3) |
| `backend/EmployeeCrud.Api.Tests/EmployeeCrud.Api.Tests.csproj` | Sửa | Thêm `Microsoft.EntityFrameworkCore.InMemory` `10.*` |
| `backend/EmployeeCrud.Api.Tests/Departments/TestDb.cs`, `ThrowingAppDbContext.cs`, `DepartmentServiceTests.cs` | Mới | 21 ca (25 lần chạy, tính cả Theory) |
| `dotnet-tools.json` | Sửa | Thêm `dotnet-reportgenerator-globaltool` 5.5.12 (cục bộ) |

### Frontend

| File | Mới / Sửa | Nội dung |
|---|---|---|
| `frontend/src/api/departments.ts` | Mới | Kiểu `Department`, `DepartmentRequest`; 5 hàm gọi API |
| `frontend/src/pages/departments/validateDepartment.ts` | Mới | Kiểm tên trên trình duyệt (BR1.1–BR1.3) |
| `frontend/src/pages/departments/DepartmentsPage.tsx` | Dời (`git mv`) + viết lại | 4 trạng thái, bảng, xóa có xác nhận, tải lại sau khi xóa |
| `frontend/src/pages/departments/DepartmentFormPage.tsx` | Mới | Form thêm/sửa |
| `frontend/src/App.tsx` | Sửa | 2 đường dẫn form, import từ thư mục mới |
| `frontend/src/styles/components.css` | Sửa | Thêm `.page-header`, `.list-count` (**khác kế hoạch**, xem mục 3) |
| `frontend/package.json` | Sửa | Script `coverage` |

Phiên bản gói thật: EF Core / Relational / InMemory 10.0.14, Npgsql.EFCore.PostgreSQL 10.0.3, reportgenerator 5.5.12.

## 2. Quyết định chính

- **Chỉ mục viết tay trên `lower(name)`** (NFR3.4): EF Core không sinh được chỉ mục trên biểu thức. Vì mô hình EF không biết chỉ mục này, các migration sau sẽ không tự xóa nó.
- **Seed bằng `InsertData` không id** (NFR3.5): bộ đếm identity vẫn đúng. Phòng ban đầu tiên thêm sau migration nhận id 5, không lỗi.
- **So trùng `d.Name.ToLower() == name.ToLower()`** ở cả hai vế trong biểu thức: PostgreSQL dùng đúng một hàm `lower()` cho hai bên, cùng biểu thức với chỉ mục.
- **Độ dài chỉ kiểm ở service, sau khi trim**: DTO chỉ có `[Required]`, để không có hai câu trả lời khác nhau cho tên dài 100 ký tự kèm khoảng trắng.
- **Service tự bắt `DbUpdateConcurrencyException` → 404**: `ErrorMapper` của U1 không nhận ra lỗi này. U1 không bị sửa.
- **Lỗi khi lưu form**: `onBlur` của ô tên chỉ thay lỗi khi kiểm trên trình duyệt thấy sai. Lỗi phát hiện khi kiểm tay: focus chuyển sang khung tóm tắt làm ô tên blur, và bản đầu tiên xóa mất lỗi 409 của API. Đã sửa và kiểm lại.
- **Trang danh sách tải dữ liệu bằng `.then(...)`**, không gọi hàm async có `setState` ngay trong effect. Đây là luật `react-hooks/set-state-in-effect` của ESLint.
- `FormEvent` đã lỗi thời trong kiểu React 19, nên dùng `SubmitEvent<HTMLFormElement>`.

## 3. Khác kế hoạch (Hiệp đã chọn bằng form)

| Khác gì | Vì sao | Hiệp chọn |
|---|---|---|
| Thêm `Microsoft.EntityFrameworkCore.Relational` `10.*` vào project API | Project test nhận Relational 10.0.4 (đi theo Npgsql), còn project API build với 10.0.14 (đi theo gói Design, gói này không truyền sang test), gây cảnh báo MSB3277. Sau khi sửa thì hết cảnh báo | "Khai rõ Relational 10.*" |
| Thêm `.page-header`, `.list-count` vào `components.css` | Mockup đặt tiêu đề và nút "+ Thêm phòng ban" trên cùng một hàng; CSS chung chưa có lớp này. U4 dùng lại được | "Thêm lớp CSS chung" |
| Nút "Thử lại" không có `data-testid` riêng | Nút nằm trong `StatusMessage` của U2. Thay vào đó, khung trạng thái có `data-testid="departments-status"` để tìm nút theo vai trò và chữ | (ghi chú, không đổi file U2) |

## 4. Đã kiểm ra sao

| Kiểm | Kết quả |
|---|---|
| pgAdmin `SELECT lower('KẾ TOÁN') = lower('Kế toán')` (trước migration) | `true` |
| Migration: `update` → `update 0` → `update` | Cả ba thành công |
| pgAdmin: chỉ mục | `ux_departments_name ... USING btree (lower((name)::text))` + `PK_departments` |
| pgAdmin: `INSERT ... ('KẾ TOÁN')` | `duplicate key ... "ux_departments_name"`, SQL state **23505** |
| Unit test U3 (`--filter ...Departments`) | 25/25 xanh |
| Toàn bộ test (`npm --prefix frontend run verify`) | 44/44 xanh, frontend typecheck/lint/format/build sạch |
| Độ phủ (`npm --prefix frontend run coverage`) | `DepartmentService` **100%** dòng (mức sàn 80%) |
| `dotnet format --verify-no-changes` | Sạch |
| API bằng curl: GET thứ tự; POST trim → 201 + Location; rỗng / thiếu / 101 ký tự → 400; "kế toán" → 409; PUT chính nó đổi hoa thường → 200; PUT tên khác → 409; PUT / DELETE / GET id không có → 404; DELETE → 204; `/abc` → 404 | Đạt hết |
| Thời gian API | 3–40 ms; lần gọi đầu sau khi khởi động 0,75 giây; đều ≤ 1 giây |
| OpenAPI | 5 thao tác với đủ mã 200/201/204/400/404/409 |
| Trình duyệt (Playwright, dev server) | Danh sách đúng thứ tự, "Có 4 phòng ban", nhãn "Sửa phòng ban Kế toán"; form trống → lỗi cạnh ô + khung tóm tắt nhận focus, không gửi request; "kế toán" → 409 hiện cạnh ô; bấm đúp Lưu → **một** POST; sửa → Toast "Đã cập nhật...", focus h1; xóa: Hủy không làm gì, OK → dòng biến mất **không F5**, Toast, focus h1; `/departments/99999/edit` và `/abc/edit` → "Không tìm thấy phòng ban" (abc không gọi API); tắt backend → "Không kết nối được máy chủ..." + "Thử lại", bật lại và bấm → có dữ liệu; POST / PUT / DELETE thật từ 5173 không lỗi CORS |
| Lighthouse (Hiệp đo, `npm run preview`, khung Galaxy A55 360px) | **Performance 100, Accessibility 100** |
| Quét bí mật, quét `dangerouslySetInnerHTML` / `FromSqlRaw` / `ExecuteSqlRaw` | 0 dòng |

## 4b. Step 10: làm lại giao diện chuẩn doanh nghiệp (03/11/2026)

Hiệp xem ảnh trang nhân viên (chưa làm lại) và yêu cầu "dứt một lần, chuẩn như công ty, đến chi tiết nhỏ nhất". Bước này siết **phần chung** (file của U2, kế hoạch đã nêu tên) và làm lại **trang phòng ban**.

**File:** `styles/tokens.css`, `styles/components.css`, `components/PageHeader.tsx`, `components/StatusMessage.tsx`, `components/Toast.tsx`, `pages/NotFoundPage.tsx` (phần chung); `pages/departments/DepartmentsPage.tsx`, `pages/departments/DepartmentFormPage.tsx`.

| Hạng mục | Trước | Sau |
|---|---|---|
| Mật độ | Chữ 15px, nút/ô 40px | Chữ 14px, tiêu đề trang 20px, tiêu đề tấm 16px; nút/ô 36px, nút dòng 28px, icon trong nút 16px |
| Đầu trang | Tiêu đề trên nền xám | Dải trắng tràn ngang (`PageHeader`): đường dẫn trang, tiêu đề, mô tả, nút chính; thân trang (`page-body`) nền xám lề 24px, tối đa 1440px |
| Tấm | Chỉ viền | `panel__header` (tiêu đề + số lượng), `panel__body`, `panel__footer` (thanh nút căn phải, nền xám nhạt); form giới hạn 880px |
| Bảng | Dòng cao, nút "Sửa" viền + "Xóa" đỏ đặc | Dòng 48px, đầu cột 13px; ô đầu/cuối lùi 24px thẳng mép tiêu đề tấm; "Sửa"/"Xóa" nút chữ nhỏ có icon, cột "Thao tác" căn phải |
| Xóa | `window.confirm` | `ConfirmDialog`: "Xóa phòng ban?" ghi tên in đậm, [Hủy] [Xóa phòng ban] |
| Form | Lưu trước Hủy, nút "Lưu" | Tấm "Thông tin phòng ban", chân tấm [Hủy] [Lưu phòng ban], gợi ý "Tối đa 100 ký tự, không trùng với phòng ban khác.", chữ mẫu "Ví dụ: Kế toán" |
| Ô chọn | Mũi tên mặc định | Mũi tên SVG, cao 36px (dùng ở U4) |
| Thông báo | Góc trên phải, che nút chính | Góc dưới phải; đóng (hoặc tự ẩn) khi focus đang trong thông báo thì focus về vùng nội dung chính |

**Khác kế hoạch (nhỏ, cùng mục đích):**

1. `StatusMessage`: nút hành động có `icon` tùy chọn (trước luôn có dấu "+", sai nghĩa với "Về danh sách phòng ban").
2. `Toast`: chuyển xuống góc dưới phải (ở góc trên nó che nút "Thêm phòng ban" 5 giây) và giữ focus khi đóng (Playwright thấy focus rơi về `body`). Kế hoạch không ghi hai việc này; phát hiện khi tự soát ảnh và kiểm bàn phím.
3. Lời báo xóa 404: "Mục này đã không còn" → "Phòng ban này không còn, danh sách đã được tải lại.".
4. Thêm `data-testid="department-delete-confirm"` cho nút xác nhận trong hộp; các `data-testid` cũ giữ nguyên.

**Kiểm (Playwright, Chromium, backend + PostgreSQL thật, 1440×900):** danh sách đúng thứ tự, "4 phòng ban"; bấm Lưu khi trống → 0 request, focus khung tóm tắt; K13 bấm lỗi → focus `input#name`, địa chỉ không đổi; "kế toán" → 409 "Tên phòng ban đã tồn tại" cạnh ô; K11 thêm/sửa thật (POST, PUT) → thông báo "Đã thêm…", "Đã cập nhật…", form sửa điền sẵn; K9 mở hộp bằng bàn phím → focus "Hủy", Tab → "Xóa phòng ban", Tab tiếp vẫn trong hộp, Esc → đóng, focus về nút "Xóa phòng ban …"; K14 xóa → dòng biến mất không F5, focus `h1`, đóng thông báo → focus `main#noi-dung`; xóa "Kỹ thuật" → 409 khung lỗi có tên, dòng còn, focus về nút Xóa; K12 rời trang khi đang tải → 0 lỗi; DOM 3 trang: 1 `h1`, `lang="vi"`, đủ landmark, 0 trùng id, 0 ô thiếu nhãn, 0 nút thiếu tên, bảng có `caption`; 320px không cuộn ngang; cột "Thao tác" căn phải đúng. Dữ liệu thử ("Phòng Thử…") đã xóa hết, còn đúng 4 phòng ban. `npm --prefix frontend run verify` xanh (96/96; JS 290,29 KB, CSS 16,60 KB). Ảnh: `.playwright-mcp/u3-list-final.png`, `u3-form-error.png`, `u3-dialog.png`, `u3-320.png`.

## 4c. Step 11: sửa theo rà soát tổng thể (Change Request, 03/11/2026)

Nguồn: `build-and-test/ra-soat-tong-the.md`; Hiệp chọn sửa cả 4 nhóm (form 34027473), duyệt plan Step 11 (gõ 1). Giữa bước, Hiệp dặn "chuẩn như các công ty lớn, kết hợp AI-DLC giải quyết triệt để" (tin nhắn 87ea0d27) → form 58339e3f: **chặn thêm ký tự định dạng vô hình** và **tra chuẩn quốc tế** để ghi căn cứ.

| Mã | Trước | Sau | File |
|---|---|---|---|
| S-04, N-09 | Tên có U+0000 → PostgreSQL từ chối → API **500** | **400** `errors.name` "Tên phòng ban chứa ký tự không hợp lệ"; chặn cả ký tự điều khiển (Cc), ký tự định dạng vô hình (Cf: U+200B, U+202E, U+FEFF…) và nửa cặp surrogate | `Platform/Text/TextInput.cs` (mới), `DepartmentService.cs` |
| N-04 | Chỉ bỏ khoảng trắng hai đầu: "Kế&nbsp;&nbsp;toán" và "Kế toán" gõ kiểu tổ hợp (NFD) lách được luật không trùng | Gộp mọi chuỗi khoảng trắng thành một dấu cách, đưa về NFC, rồi mới kiểm rỗng / độ dài / trùng và lưu | như trên; `utils/normalizeText.ts` (mới), `validateDepartment.ts`, `DepartmentFormPage.tsx` (gửi tên đã chuẩn hóa) |
| N-03 | `maxLength` cắt bớt phần dán thừa mà không báo | Bỏ `maxLength`; lời báo "tối đa 100 ký tự" hiện cạnh ô | `DepartmentFormPage.tsx` |
| A-13 | Route sửa phòng ban `key="edit"` cố định: đổi id trong ứng dụng thì form giữ dữ liệu cũ | `DepartmentEditRoute` với `key` theo id, giống `EmployeeEditRoute` | `App.tsx` |
| A-05 | Trang danh sách tải bằng 2 đường (effect lần đầu + hàm `reload` có `AbortController` riêng) | Một `useEffect` theo `reloadKey`, kết quả ghi kèm khóa lần tải; giống `EmployeesPage` | `DepartmentsPage.tsx` |
| A-06 | Câu lỗi chung và `isAborted`/`messageOf` chép trong từng trang | Dùng bản xuất từ `api/client.ts` (U2 Step 10) | `DepartmentsPage.tsx`, `DepartmentFormPage.tsx` |

**Căn cứ chuẩn (đã tra 03/11/2026, Hiệp cho tra):**

| Bước của luật | Chuẩn | Ghi chú |
|---|---|---|
| Cấm ký tự điều khiển và ký tự vô hình | RFC 8264 §4.3.3 (lớp FreeformClass cấm Controls §9.12 và PrecisIgnorableProperties §9.13) | Ta chặn theo loại Unicode Cc và Cf. Hai bên cho kết quả giống nhau với các ký tự hiện có; nếu .NET và trình duyệt dùng bảng Unicode khác phiên bản thì có thể lệch ở ký tự mới thêm, nhưng API vẫn kiểm lại nên lệch chỉ làm form báo sớm hơn hoặc muộn hơn API (rà soát R-08). **Giới hạn đã biết:** (1) RFC còn cấm thêm một số ký tự "bỏ qua được" ngoài Cf (ví dụ bộ chọn biến thể U+FE0F trong emoji, ký tự lấp Hangul U+3164), ta chưa chặn; (2) ngược lại, chặn cả loại Cf nghĩa là chặn luôn U+200D (ZWJ) và U+200C (ZWNJ): emoji ghép bằng ZWJ (ví dụ emoji gia đình) bị từ chối, chữ Ba Tư và một số chữ Ấn Độ cần hai ký tự này cũng không nhập được. Đây là chủ ý (an toàn hơn) và chấp nhận được vì tên phòng ban tiếng Việt không cần (rà soát R-06) |
| Gộp khoảng trắng | RFC 8266 §2.1 (đổi khoảng trắng Unicode thành dấu cách, bỏ hai đầu, gộp khoảng trắng giữa) | Ta gộp thêm tab và xuống dòng (RFC coi là ký tự điều khiển và từ chối) vì người dùng hay dán từ nơi khác; ô một dòng nên không mất ý nghĩa |
| Đưa về một dạng chữ | W3C "Character Model: String Matching" §2.2.1, §3.2.2.4 khuyên không dùng chuẩn hóa tương thích (NFKC) cho văn bản thường vì làm đổi nghĩa chữ (ví dụ "²" → "2") | RFC 8266 dùng NFKC; ta **giữ NFC** theo W3C. Chữ tiếng Việt cho kết quả như nhau ở cả hai |

**Khác kế hoạch (Hiệp đã chọn, hoặc nhỏ cùng mục đích):**

1. Chặn thêm ký tự định dạng vô hình (Cf) ở cả API và form (form 58339e3f). Kế hoạch đã sửa theo.
2. Form tự bắt được cả nửa cặp surrogate (biểu thức `\p{Cs}` của JavaScript), không phải đợi API như kế hoạch ghi.
3. Test đánh số #22–#27 (số #21 đã có), 6 ca thay vì 5: ca #25 gộp 7 ký tự lạ trong một test, thêm ca #26 emoji hợp lệ để chắc nhánh "đủ hai nửa surrogate" chạy đúng.
4. Smart App Control chặn file `EmployeeCrud.Api.dll` mới build (0x800711C7, nhật ký Code Integrity sự kiện 3077) ở 3 lần chạy test. Hiệp chọn làm như U4 (form ac967db6): thêm 2 comment có ích (thứ tự kiểm trong `NormalizeName`, tập khoảng trắng trong `TextInput`) để ra file mới → chạy được. Không đổi cài đặt máy.
5. Công cụ ghi file của AI tự đổi mã `\u200B`, `\uFEFF`… thành ký tự thật (vô hình) trong code. Đã ghi lại các đoạn đó bằng cách khác và quét cả 9 file bằng script tìm ký tự Cc/Cf/Cs/dấu tổ hợp: sạch.
6. Cổng 5173 đang có `vite preview` của Hiệp (bản build cũ), nên kiểm giao diện chạy riêng: frontend dev cổng 5174, backend 5081 cho phép thêm origin 5174 bằng biến môi trường `Cors__AllowedOrigins__1` (không sửa file cấu hình). Kiểm xong đã tắt; preview của Hiệp giữ nguyên.

**Đã kiểm:**
- Unit test: 109/109 (103 cũ + 6 mới). Độ phủ dòng: `DepartmentService` 100%, `TextInput` 100%, `EmployeeService` 100%.
- Bản JavaScript `normalizeText` cho cùng kết quả với bản C# trên 14 ca (7 ca ký tự lạ, gộp khoảng trắng, NFD, emoji, U+0085, chuỗi rỗng, chuỗi toàn khoảng trắng).
- API thật (PostgreSQL): U+0000, U+200B, U+202E → 400 đúng lời báo; "Kế&nbsp;&nbsp;toán", NFD → 409; POST "&nbsp;&nbsp;Phòng&nbsp;&nbsp;&nbsp;thử(U+00A0) nghiệm&nbsp;&nbsp;" → 201 "Phòng thử nghiệm"; PUT với U+0000 → 400, tên cũ giữ nguyên; nửa cặp surrogate bị tầng đọc JSON chặn trước (400). 4 tên phòng ban đang có đều đã ở dạng chuẩn (không cần sửa dữ liệu). Bản ghi thử đã xóa.
- Playwright (Chromium): dán 120 ký tự → ô giữ 120, lời báo hiện, 0 request; ký tự vô hình → lời báo, 0 request; "&nbsp;&nbsp;Kế&nbsp;&nbsp;&nbsp;toán&nbsp;" → gửi `{"name":"Kế toán"}`, 409 cạnh ô; sửa "Kế toán" (gõ dở) rồi chuyển sang sửa "Kinh doanh" → ô tên "Kinh doanh"; chặn API → "Thử lại" → có dữ liệu; K9 (focus "Hủy", Esc về nút Xóa), xóa → dòng biến mất, K14 focus `h1`. Console: chỉ 2 dòng trình duyệt tự ghi cho 2 ca cố ý gây lỗi (409, chặn mạng), 0 lỗi của ứng dụng.
- `npm --prefix frontend run verify` xanh (typecheck, lint 0 cảnh báo, Prettier, build, 109/109).

## 4d. Sửa sau review Step 11 (Hiệp duyệt checkpoint U3, gõ 1, yêu cầu sửa R-05 đến R-09; 03/11/2026)

Reviewer kết luận READY; 5 góp ý Minor, đều là tài liệu, không đổi code.

| Điểm | Sửa | File |
|---|---|---|
| R-05 | Ghi bộ 14 ca đối chiếu hai bản chuẩn hóa (C# và TypeScript) thành danh sách kiểm dùng chung, kèm cách chạy bên TypeScript; U4 thêm ca vào cuối | `unit-test-instructions.md` mục 7 |
| R-06 | Mục "giới hạn đã biết": chặn cả loại Cf nên chặn luôn ZWJ (U+200D), ZWNJ (U+200C); emoji ghép bằng ZWJ bị từ chối; chủ ý, chấp nhận vì tên tiếng Việt không cần | mục 4c, bảng căn cứ chuẩn |
| R-07 | BR1.3 ghi rõ độ dài đếm theo đơn vị UTF-16 (emoji tính 2), chặt hơn hoặc bằng cột `varchar(100)` nên không tràn | `functional-design/rules.md` BR1.3 |
| R-08 | Câu "giống nhau ở .NET và JavaScript" đổi thành: giống nhau với ký tự hiện có; lệch phiên bản Unicode chỉ làm form báo sớm hoặc muộn hơn, API vẫn quyết định | mục 4c, bảng căn cứ chuẩn |
| R-09 | Phần đầu plan: "Tests" ghi 27 ca (6 ca Step 11), "Touches" thêm hai file dùng chung | `code-generation-plan.md` Summary |

## 5. Test viết nhưng chưa chạy

Không có. Mọi test đã viết đều chạy và xanh. Theo `team.md`, không có test tự động cho controller và React; hai tầng này đã kiểm tay như bảng trên.

## 6. Nháp cho README (U5)

- **Tạo bảng:** `dotnet tool restore`, rồi `dotnet ef database update --project backend/EmployeeCrud.Api`. Để quay lui hết: `dotnet ef database update 0 --project backend/EmployeeCrud.Api`.
- **Đọc độ phủ:** `npm --prefix frontend run coverage`. Lệnh in bảng % theo lớp; báo cáo chi tiết ở `backend/TestResults/coverage-report/index.html`.
- **Xem câu SQL:** trong `backend/EmployeeCrud.Api/appsettings.Development.json`, đổi `"Microsoft.EntityFrameworkCore.Database.Command"` từ `"Warning"` sang `"Information"`, rồi chạy lại backend.

## 7. Việc chuyển cho U4 và Build and Test

- U4 đặt khóa ngoại đúng tên `fk_employees_department` (nhánh 23503 của `DepartmentService.DeleteAsync` khớp theo tên này), bằng **migration mới**, không sửa `CreateDepartments`.
- U4 thêm bước kiểm "còn nhân viên" trước khi xóa phòng ban (C4). Build and Test kiểm thật bằng Postman: xóa phòng ban còn nhân viên → 409.
- Test "sắp A-Z" của InMemory dùng tên ASCII; thứ tự có dấu đã kiểm trên PostgreSQL thật (trang Phòng ban).
- Ghim chặt mọi phiên bản gói (hiện là `10.*`) là việc riêng nếu Hiệp muốn (rà soát Infrastructure Design, Minor 2).

## 4e. Change Request 03/11/2026 (FR8): gợi ý quy ước tên (Step 12, BR4.8, US6.5)

- `frontend/src/pages/departments/DepartmentFormPage.tsx`: gợi ý dưới ô tên thành "Viết hoa chữ cái đầu, ví dụ: Kế toán, Nhân sự, IT. Tối đa 100 ký tự, không trùng với phòng ban khác." Không đổi luật kiểm, không tự đổi chữ.
- Kiểm: `verify` xanh, 118/118. Playwright (dev 5173, backend 5081 chạy từ dll): form thêm và form sửa có `aria-describedby="name-goi-y"` trỏ tới gợi ý; nhập "kế TOÁN mới" → body POST đúng `{"name":"kế TOÁN mới"}` (request bị chặn, không lưu).
- Ngoài kế hoạch: comment trong `backend/EmployeeCrud.Api.Tests/TestSupport/ThrowingAppDbContext.cs` (vượt Smart App Control ở checkpoint U1).
- Rà soát U3 lượt 1 (Minor): gợi ý trong code gộp câu quy ước với câu cũ "Tối đa 100 ký tự…" (câu quy ước đúng nguyên văn AC6.5.2, giữ). Khi ô đang có lỗi, gợi ý bị ẩn khỏi mắt nhìn (`field__hint--hidden` của U2), trình đọc màn hình vẫn đọc; đã ghi ở BR4.8. Kiểm gợi ý là kiểm tay (team.md chỉ test service).
