## Developer Code Scan Results

Quét có trọng tâm cho `261104-sua-loi-luot-8`, ngày 2026-11-05. Commit nền `67689354927fc28276fab61f60f42e2ae608a293`; code đọc từ đĩa, gồm các thay đổi chưa commit của `261104-sua-loi-luot-6`. Chỉ đọc code, không chạy test, build hay ứng dụng. Mọi nhận định về hành vi dưới đây là suy ra từ đọc code, trừ chỗ ghi rõ "Lượt 8 đã tái hiện".

### Scan Coverage

- **Analyzed deeply**:
  - `backend/EmployeeCrud.Api/` (mọi file `.cs` viết tay, `.http`, `.csproj`, `appsettings.json`)
  - `frontend/src/` (mọi file `.ts`, `.tsx`)
  - `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md`
- **Skimmed only**:
  - `frontend/src/styles/` (chỉ đọc comment và tên class, không đọc từng luật CSS)
  - `frontend/src/components/Icon.tsx` (đọc đầu file, không đọc hết dữ liệu nét vẽ)
  - `backend/EmployeeCrud.Api/Migrations/*.Designer.cs`, `AppDbContextModelSnapshot.cs` (file sinh tự động, grep mẫu ra 0 dòng)
  - `backend/EmployeeCrud.Api/appsettings.Development.json`, `Properties/launchSettings.json` (grep mẫu ra 0 dòng)
  - `backend/EmployeeCrud.Api.Tests/` (chỉ đếm số dòng khớp mẫu, không đọc)
  - `docs/danh-sach-api.md` (chỉ đọc tiêu đề để đối chiếu thứ tự thao tác với `.http`)
- **Left out**:
  - `backend/EmployeeCrud.Api/bin/`
  - `backend/EmployeeCrud.Api/obj/`
  - `backend/TestResults/`
  - `frontend/node_modules/`
  - `frontend/dist/`
  - `.claude/`, `aidlc/` (trừ hồ sơ `261104-sua-loi-luot-6` đọc để biết yêu cầu)

### Packages Found

- `EmployeeCrud.Api` — Web API — C# / .NET 10 — controller, service, EF Core
- `EmployeeCrud.Api.Tests` — project test — C# — không đọc lần này
- `frontend` — SPA — TypeScript, React 19 — giao diện

### Build System

- **Type**: `dotnet` (MSBuild) cho backend, `npm` cho frontend
- **Config Files**: `backend/EmployeeCrud.Api/EmployeeCrud.Api.csproj`; phần còn lại giữ theo CodeKB cũ
- **Build Dependencies**: `EmployeeCrud.Api.Tests` → `EmployeeCrud.Api`; `npm run verify` gọi `dotnet format`, `dotnet test` (theo `test-results.md` lượt 7)

### APIs Discovered

- REST JSON — `DepartmentsController.cs`, `EmployeesController.cs` — 10 thao tác, không đổi so với CodeKB cũ

### Frameworks & Libraries

Không đổi. `.csproj` khớp `technology-stack.md`. Lần này không đọc `frontend/package.json`.

### Test Coverage

- **Test Directories**: `backend/EmployeeCrud.Api.Tests/`
- **Test Frameworks**: xUnit (không đọc lại)
- **Coverage Config**: theo lượt 7, 146/146 test; `DepartmentService`, `EmployeeService`, `TextInput` 100%, `ErrorMapper` 97,6%. Con số lấy từ `test-results.md`, lần quét này không chạy.

### Code Quality Indicators

- **Linting**: không đổi. Trong vùng quét không có `TODO`, `FIXME`, `HACK`, `eslint-disable`, `ts-ignore`.
- **CI/CD**: không có, đúng `project.md`.
- **Documentation**: comment nhiều và giải thích "vì sao", nhưng 186 dòng còn mã nội bộ (mục dưới).

### Technical Debt Signals

Phát hiện mới, mã đầy đủ ở `code-quality-assessment.md`:

- `BE-11` `DepartmentService.cs:60-73`: PUT tên không đổi không gửi UPDATE, nên phòng vừa bị xóa vẫn ra 200.
- `FE-12` `EmployeeFormPage.tsx:339-340`, `:362-380`: đang tải và không tìm thấy hiện cùng lúc.
- `FE-13` `DepartmentDetailPage.tsx:164-168`, `DepartmentFormPage.tsx:297`: Hủy từ chi tiết về danh sách.
- `FE-14` `EmployeeFormPage.tsx:143`, `:271-293`: lỗi "Phòng ban không tồn tại" không nạp lại ô chọn.
- `FE-15` `client.ts:224-232`: hết 10 giây lúc ghi vẫn báo mất kết nối.
- `FE-16` `EmployeesPage.tsx:156-167`, `:390`, `:455-470`: tải phòng ban lỗi thì không bỏ được lọc.
- `FE-17` `client.ts:54-55`, `:226`: code không ai dùng.
- `DOC-10`: danh sách F, V tả giao diện cũ. `DOC-11`: nhãn `.http` thao tác 2 và 7. `DOC-12`: thiếu dấu phẩy ở `TextInput.cs:16`.

### Danh sách comment chứa mã nội bộ, lịch sử sửa, tên người

Mẫu đã dùng (ripgrep, phân biệt hoa thường): `BR\d`, `NFR\d`, `ADR-?\d`, `AC\d`, `US\d`, `FR\d`, `[NSAR]-\d`, `U[1-9]` đứng riêng, `C[1-9]` đứng riêng, `mockups`, `interaction-spec`, `-design §`, `requirements mục`, `rà soát`, `Loop-back`, `bài học`, `trước đây`, `comment cũ`, `Hiệp`, `như cũ`, `như trước`, `team.md`, `(Q1)` kiểu tương tự, `Change Request`.

**Tổng:** `frontend/src` 78 dòng ở 26 file; `backend/EmployeeCrud.Api` 108 dòng ở 27 file; cộng 186 dòng ở 53 file. Tất cả 186 dòng đều nằm trong comment (đã soát từng dòng). Thêm `AppDbContext.cs:20` chữ "mỗi unit" không có trong mẫu, là thuật ngữ quy trình.

Ngoài vùng quét: `backend/EmployeeCrud.Api.Tests` có 33 dòng ở 8 file, chưa soát là comment hay chuỗi. Lượt 8 ghi "khoảng 160 dòng ở 47 file", số này khác vì mẫu lần này rộng hơn (`hợp đồng C*`, `phong bì C3`, `team.md`, `(Q1)`).

**Loại cách sửa:**
- **A:** mã trong ngoặc ở cuối câu, xóa ngoặc là xong.
- **B:** mã đứng đầu làm chủ ngữ (`BR1.6:`), bỏ tiền tố, câu vẫn đủ nghĩa.
- **C:** `U1`, `U3`, `U4`, `C1`–`C5` đóng vai chủ ngữ hoặc tên chỗ, phải viết lại bằng tên thật (`U1` là `ErrorMapper` hoặc `ProblemDetailsExceptionHandler`; `U3` là phần phòng ban; `U4` là phần nhân viên; `C3` là định dạng lỗi ProblemDetails; `C1`, `C2` là API phòng ban, nhân viên; `C4` là `IDepartmentService`; `C5` là phần dùng chung).
- **D:** lịch sử hoặc tên người, viết lại thành lý do ở hiện tại.
- **E:** tên tài liệu nội bộ, bỏ tên, giữ lý do.
- **X:** cả comment chỉ có mã, xóa cả dòng.

Lưu ý khi sửa: mã `BR*` không duy nhất giữa các phần. Ví dụ `BR4.4` ở `EmployeeFormPage.tsx` khác `BR4.4` ở `DepartmentFormPage.tsx`; `BR1.7` ở `Program.cs` khác `BR1.7` ở `EmployeeService.cs`. Vì vậy phải đọc câu quanh mã, không thay hàng loạt theo bảng tra.

#### Frontend (78 dòng)

| File | Dòng | Nội dung khớp | Loại |
|---|---|---|---|
| `src/App.tsx` | 17 | `rà soát U3` | A |
| | 25 | `rà soát tổng thể A-13` | A |
| | 31 | `FR8.2` | A |
| `src/api/client.ts` | 2, 30 | `hợp đồng C3` | A |
| `src/api/departments.ts` | 4 | `hợp đồng C1` | A |
| | 8 | `FR8.1` | A |
| `src/api/employees.ts` | 4 | `hợp đồng C2` | A |
| | 24 | `FR8.3` | A |
| `src/components/ConfirmDialog.tsx` | 29 | `Change Request FR8.4` | E |
| | 122 | `rà soát U2, R-07` | A |
| `src/components/ErrorSummary.tsx` | 16 | `US4.1` (giữ `WCAG 3.3.1`) | A |
| `src/components/FormField.tsx` | 23 | `US4.6` (giữ `WCAG 1.3.1, 3.3.2`) | A |
| `src/components/Icon.tsx` | 2 | `NFR5.4` | A |
| `src/components/PageHeader.tsx` | 48 | `FR8.2` | A |
| `src/components/SearchBox.tsx` | 15 | `interaction-spec 2.4` | E |
| | 18 | `NFR5.5` (giữ `WCAG 2.4.3`) | A |
| | 37 | `rà soát U4 R-07` (giữ ví dụ `"a  b"`) | A |
| `src/components/StatusMessage.tsx` | 14 | `Loop-back 3` | E |
| | 35 | `US4.2` | A |
| `src/components/Toast.tsx` | 21 | `US4.5` | A |
| | 26 | `(U3, U4)` | A |
| `src/components/splitErrors.ts` | 6 | `hợp đồng C3` | A |
| `src/hooks/usePageTitle.ts` | 21 | `rà soát U2, R-08` | A |
| `src/hooks/useSubmitGuard.ts` | 4 | `US4.4` | A |
| `src/utils/normalizeText.ts` | 2 | `rà soát tổng thể N-04, S-04` | A |
| `src/pages/departments/DepartmentDetailPage.tsx` | 45 | `US6.2, BR6.2` | A |
| | 46 | `ADR-007` | A |
| | 122 | `AC6.2.5` | A |
| | 128 | `AC6.4.3` | A |
| | 142, 190 | `AC6.2.3` | A |
| `src/pages/departments/DepartmentFormPage.tsx` | 37 | `US1.2, US1.3` | A |
| | 38 | `BR4.2`, `BR4.6`, `BR4.4` | A |
| | 85 | `BR4.3` | A |
| | 168 | `AC4.1.1` | A |
| | 279 | `rà soát N-03` | A |
| `src/pages/departments/DepartmentsPage.tsx` | 29 | `US6.2` | A |
| | 50 | `US1.1, US1.4, US6.1`, `BR4.1` | A |
| | 51 | `BR6.4` | A |
| | 58 | `rà soát tổng thể A-05` | A |
| | 105 | `rà soát U2` | A |
| | 115 | `AC6.4.3` | A |
| `src/pages/departments/useDepartmentDelete.tsx` | 17 | `BR6.4, US6.4` | A |
| | 20 | `như trước (BR4.5)` | D |
| `src/pages/departments/validateDepartment.ts` | 8 | `BR1.1–BR1.3` | A |
| `src/pages/employees/EmployeeFormPage.tsx` | 60 | `như cũ` | D |
| | 61 | `FR8.2` | A |
| | 63 | `rà soát N-07, FR8.3` | A |
| | 110 | `US2.2, US2.3` | A |
| | 111 | `BR4.3`, `BR4.4`, `BR4.8` | A |
| | 112 | `BR4.6` | A |
| | 122 | `AC6.2.3` | A |
| | 176 | `BR4.5` | A |
| | 177 | `NFR5.5` | A |
| | 208 | `BR4.4`, `dùng API của U3` | C |
| | 264 | `bài học U3` | D |
| | 303 | `AC4.1.1` | A |
| | 430, 455 | `rà soát N-03` | A |
| | 567 | `BR4.4`, `BR4.8` | A |
| `src/pages/employees/EmployeesPage.tsx` | 58 | `BR5.3` | A |
| | 97 | `US2.1, US2.4, US3.1, US6.3` | A |
| | 98 | `BR4.1`, `BR4.2`, `BR6.3` | A |
| | 99 | `BR4.7` | A |
| | 125, 170 | `AC6.3.4` | A |
| | 186 | `NFR5.5` | A |
| | 291 | `Câu theo mockups 8b-3.` | X |
| | 303 | `rà soát N-07, FR8.3` | A |
| | 324 | `rà soát U4 lượt 1` | A |
| | 521 | `rà soát N-05` | A |
| `src/pages/employees/validateEmployee.ts` | 9 | `BR1.6:` | B |
| | 28 | `BR1.1–BR1.6, BR1.8` | A |
| `src/styles/base.css` | 62 | `trước đây hiện khung xanh` | D |
| `src/styles/components.css` | 305 | `FR8.3` | A |
| | 375 | `Hiệp chọn 04/11` | D |
| | 529 | `US4.4` | A |

#### Backend (108 dòng)

| File | Dòng | Nội dung khớp | Loại |
|---|---|---|---|
| `Program.cs` | 22, 24, 33, 60 | `BR1.2`, `BR1.7`, `BR3.1`, `BR2.4` | A |
| | 39 | `NFR5.6` | A |
| `Departments/DepartmentConfiguration.cs` | 7 | `team.md` | E |
| `Departments/DepartmentDto.cs` | 4 | `hợp đồng C1` | A |
| | 5 | `FR8.1`, `ADR-006` | A |
| `Departments/DepartmentRequest.cs` | 6 | `hợp đồng C1` | A |
| | 11 | `BR1.3` | A |
| `Departments/DepartmentsController.cs` | 6 | `hợp đồng C1` | A |
| | 7 | `do U1 đổi sang` | C |
| `Departments/IDepartmentService.cs` | 4 | `U1 đổi sang` | C |
| | 8, 11 | `BR2.1`, `BR2.2` (giữ `A-Z`) | A |
| | 20 | `Cho U4 kiểm`, `BR2.6` | C |
| `Departments/DepartmentService.cs` | 12 | `BR1, BR2` | A |
| | 24 | `BR5.1, ADR-006` | A |
| | 57 | `BR1.4` | A |
| | 68 | `ErrorMapper của U1` | C |
| | 72 | `hợp đồng C1` | A |
| | 81 | `BR5.2:` | B |
| | 100 | `Đường dự phòng của BR2.5` | C |
| | 101 | `khóa ngoại RESTRICT (U4)`, `BR5.2` | A |
| | 112, 136 | `BR1.1–BR1.3:`, `BR1.4:` | B |
| | 138 | `U1 đổi thành 409` | C |
| | 157 | `đã thấy khi chạy thật trên pgAdmin, U4` (giữ sự thật, bỏ `U4`) | A |
| | 170 | `NFR3.5, hợp đồng C1` | A |
| `Employees/Employee.cs` | 15 | `(Q1)` | A |
| `Employees/EmployeeConfiguration.cs` | 9 | `team.md` | E |
| | 36 | `hằng của U1` | C |
| | 38, 46 | `BR3.3`, `NFR5.8` | A |
| `Employees/EmployeeDto.cs` | 4 | `hợp đồng C2` | A |
| `Employees/EmployeeRequest.cs` | 6 | `hợp đồng C2` | A |
| | 12 | `BR1.3, BR1.5` | A |
| | 22 | `security-design §1` | E |
| `Employees/EmployeesController.cs` | 6 | `hợp đồng C2` | A |
| | 7 | `do U1 đổi sang` | C |
| | 17, 20 | `FR8.3`, `ADR-007` | A |
| `Employees/IEmployeeService.cs` | 4 | `U1 đổi sang` | C |
| | 9, 10, 12, 19 | `BR2.1`, `BR2.2`, `BR5.3`, `BR2.3` | A |
| `Employees/EmployeeService.cs` | 17 | `BR1, BR2.1–BR2.6` | A |
| | 18 | `hợp đồng C4` | A |
| | 37 | `BR1.6:` | B |
| | 49 | `NFR5.3` | A |
| | 58, 61 | `BR5.3:`, `BR2.2:` | B |
| | 63, 64 | `trước đây U+0000 làm API trả 500; Hiệp chọn trả rỗng thay vì 400` | D |
| | 72, 73 | `FR8.3`, `ADR-007` | A |
| | 84, 91 | `NFR2.3`, `BR2.1` | A |
| | 110, 132 | `NFR3.6` | A |
| | 138 | `BR1.7` | A |
| | 147 | `rà soát N-10: comment cũ ghi nhầm là 200` | D |
| | 148 | `requirements mục 6`, `reliability-design §2` | E |
| | 158 | `BR2.5:` | B |
| | 163 | `BR2.6`, `để U1 trả 500` | C |
| | 164 | `ErrorMapper của U1` | C |
| | 165 | `rà soát A-08: trước đây truyền id 0` | D |
| | 176 | `để U1 trả 500` | C |
| | 182 | `cùng câu với BR1.9` | C |
| | 190 | `BR1.1–BR1.6, BR1.8:` | B |
| | 191 | `tên phòng ban ở U3` | C |
| | 211 | `BR1.7` | A |
| | 240 | `BR1.9:`, `(C4)`, `U3 giữ quyền` | C |
| | 249 | `BR1.7:` | B |
| | 251 | `U1 đổi thành 409` | C |
| | 279 | `BR5.3:` | B |
| | 280 | `ADR-007` | A |
| `Migrations/20261101183552_CreateDepartments.cs` | 29, 33 | `BR3.1`, `BR3.2` | A |
| | 30 | `U1 đổi lỗi` | C |
| `Migrations/20261102083152_CreateEmployees.cs` | 42 | `BR3.2` | A |
| | 44 | `U1 đổi lỗi` | C |
| `Platform/Cors/CorsSetup.cs` | 5 | `BR2.3, NFR7.1` | A |
| `Platform/Data/AppDbContext.cs` | 9 | `hợp đồng C5` | A |
| | 10 | `U1 chỉ dựng khung; phòng ban (U3) và nhân viên (U4)` | C |
| | 20 | `mỗi unit` (ngoài mẫu) | C |
| `Platform/Errors/DbConstraintNames.cs` | 4 | `(U3)`, `(U4)` | A |
| `Platform/Errors/DomainError.cs` | 3 | `hợp đồng C5` | A |
| `Platform/Errors/ErrorMapper.cs` | 9 | `phong bì C3` | C |
| | 11 | `NFR3.3` | A |
| | 34 | `// BR1.1` (cả dòng) | X |
| | 42, 49 | `BR1.2:`, `BR1.3:` | B |
| | 66, 118 | `BR1.4, BR1.5:`, `BR1.6:` | B |
| | 87 | `service U3/U4` | C |
| `Platform/Errors/ErrorTitles.cs` | 4 | `phong bì lỗi C3, luật BR1.x` | A |
| `Platform/Errors/ProblemDetailsExceptionHandler.cs` | 13 | `phong bì C3` | C |
| | 31, 45 | `BR3.2`, `NFR7.2` | A |
| `Platform/Errors/StatusCodeProblemWriter.cs` | 10 | `BR1.7` | A |
| `Platform/Errors/ValidationResponseFactory.cs` | 12, 68 | `phong bì C3`, `BR1.2, BR1.7` | C |
| `Platform/StartupChecks.cs` | 3, 25, 32 | `BR2.1, NFR1.1`, `NFR1.4`, `BR3.2` | A |
| `Platform/Text/TextInput.cs` | 7 | `ở U3`, `ở U4` | A |
| | 8 | `rà soát tổng thể N-04, S-04` | A |

#### Chỗ khớp mẫu nhưng KHÔNG được sửa

Với mẫu trên, không có dòng code nào bị khớp. Các chỗ dưới đây là code thật, dễ bị một mẫu lỏng hơn bắt nhầm khi thay hàng loạt:

| Chỗ | Vì sao giữ |
|---|---|
| `normalizeText.ts:11`, `:15` (`\u0085`, ` - `, `\p{Cc}`, `\p{Cf}`, `\p{Cs}`) | Regex chạy thật. Mẫu kiểu `C\d` hoặc `U\d` lỏng hơn có thể chạm |
| `Icon.tsx`, dữ liệu `d="M... A1.5 1.5 ..."` | Nét vẽ SVG, `A1`, `C`, `S` là lệnh vẽ |
| `TextInput.cs:94` (`0xFDD0`, `0xFFFE`) | Code chạy thật |
| `ValidationResponseFactory.cs:69`, `StatusCodeProblemWriter.cs:54-57` (`rfc9110#section-15.5.x`) | Chuỗi trả ra API |
| `data-testid`, `testId`, `id` HTML (`employee-*`, `department-*`, `loc-phong-ban`, `tim-kiem`, `thong-tin-*`) | Dùng để kiểm trình duyệt và trợ năng |
| `.http` dòng `### 6b`, `### 6c`, `### 6d` | Số thao tác cho người đọc, không phải mã hồ sơ |
| `.csproj:7` `UserSecretsId`, tên migration `20261101183552_*` | Định danh thật |
| Mã `23505`, `23503`, `23001` | Mã lỗi chuẩn của PostgreSQL |
| Chữ giao diện như `"Nhân sự"`, câu báo lỗi | Có chữ "sự", không phải mã |

Comment cũng phải giữ nguyên vì không phải mã nội bộ:

| Loại | Ví dụ |
|---|---|
| Chuẩn công khai | `WCAG 2.4.3`, `RFC 8264 §4.3.3`, `RFC 8266 §2.1`, `RFC 9457`, `W3C Character Model §2.2.1`, `CVE-2021-42574`, `OWASP` |
| Mã Unicode | `U+0000`, `U+200B`, `U+202E`, `U+FFFE`, `U+1FFFE` |
| Từ thường | `design tokens` (`tokens.css:2`), `A-Z` (`DepartmentsController.cs:14`, `departments.ts:19`), `người A`, `người B` (`App.tsx:17`) |
| Chữ "cũ" tả lúc chạy, không phải lịch sử sửa | `lời gọi cũ`, `kết quả cũ`, `lỗi cũ`, `chuỗi cũ`, `dữ liệu cũ`, `số trên bảng cũ` |
| Sự thật kỹ thuật | `ErrorMapper.cs:21` "Đã thấy thật khi xóa phòng ban còn nhân viên": không có mã; lý do của nhánh 23001 |

### Đối chiếu danh sách F, V trong `07-kiem-thu-va-demo.md` với `frontend/src`

Giao diện nay tách trang danh sách và trang form; danh sách cũ tả form nằm chung một trang. Nút trên form là "Lưu nhân viên", không có nút "Thêm" hay "Cập nhật" trên form.

| Mã | File 07 ghi | Thật trong code | Bằng chứng | Kết luận |
|---|---|---|---|---|
| F01 | "Đang tải..." | "Đang tải dữ liệu…" | `EmployeesPage.tsx:409` | Sửa chữ |
| F02 | "Chưa có nhân viên." | "Chưa có nhân viên nào", kèm câu phụ và nút "Thêm nhân viên" | `EmployeesPage.tsx:429-436` | Sửa chữ |
| F03 | Gõ, bấm Tìm | Đúng; thêm dòng "Tìm thấy N nhân viên" | `EmployeesPage.tsx:298` | Đúng |
| F04 | "AN", "an" ra cùng kết quả | Đúng | `EmployeeService.cs:86-88` | Đúng |
| F05 | Tìm theo email | Đúng | `EmployeeService.cs:88` | Đúng |
| F06 | "Chưa có nhân viên." | "Không tìm thấy nhân viên phù hợp", câu phụ, nút "Xóa bộ lọc" | `EmployeesPage.tsx:455-470` | Sai |
| F07 | "bấm Thêm", báo "Đã thêm" | Bấm "Thêm nhân viên" ở dải đầu trang, sang form, bấm "Lưu nhân viên", về danh sách, Toast `Đã thêm nhân viên "X"` | `EmployeesPage.tsx:317-330`, `EmployeeFormPage.tsx:325`, `:571` | Sai thao tác |
| F08 | Dropdown có đủ phòng | Đúng; dòng đầu "Chọn phòng ban" | `EmployeeFormPage.tsx:499-508` | Đúng |
| F09 | "bấm Cập nhật", báo "Đã cập nhật" | Bấm "Lưu nhân viên", Toast `Đã cập nhật nhân viên "X"` | `EmployeeFormPage.tsx:324`, `:571` | Sai thao tác |
| F10 | Sửa A rồi bấm Sửa B | Không làm được: form chiếm cả trang, không có bảng bên cạnh. Kiểm được bằng gõ địa chỉ sửa người B khi đang sửa A | `App.tsx:20-23` | Sai thao tác |
| F11 | "Form về chế độ thêm mới" | Hủy về danh sách (giữ tìm, lọc), không đổi dữ liệu | `EmployeeFormPage.tsx:549-563`, `:91` | Sai |
| F12 | Bấm Xóa, xác nhận, báo "Đã xóa" | Hộp "Xóa nhân viên?", nút "Xóa nhân viên", Toast `Đã xóa nhân viên "X"` | `EmployeesPage.tsx:266`, `:512-527` | Sửa chữ |
| F13 | "chọn Cancel" | Nút "Hủy" trong hộp, hoặc Esc | `ConfirmDialog.tsx:79-85`, `:137` | Sai chữ |
| F14 | Dữ liệu còn sau khi tắt máy chủ | Đúng, không liên quan chữ giao diện | Lượt 8 đạt | Đúng |
| V01 | "bấm Thêm", báo lỗi ngay ở form | Bấm "Lưu nhân viên"; khung "Chưa lưu được. Kiểm tra lại các trường sau:" và "Vui lòng nhập họ tên" dưới ô; không POST | `EmployeeFormPage.tsx:300-305`, `ErrorSummary.tsx:40` | Sửa thao tác |
| V02 | "Email không đúng định dạng" | Đúng; hiện khi rời ô hoặc bấm Lưu | `validateEmployee.ts:53` | Đúng |
| V03 | "Vui lòng chọn phòng ban" | Đúng | `validateEmployee.ts:58` | Đúng |
| V04 | 409, "Email đã được sử dụng" | Đúng | `ErrorTitles.cs:26` | Đúng |
| V05 | Khác hoa thường vẫn trùng | Đúng | `EmployeeService.cs:254-255` | Đúng |
| V06 | "Bấm Thêm 2 lần" | Bấm "Lưu nhân viên" hai lần; nút đổi "Đang lưu…", khóa | `EmployeeFormPage.tsx:568-571`, `useSubmitGuard.ts:21` | Sửa chữ |
| V07 | "Không kết nối được máy chủ" / "Không tải được", tắt backend rồi bấm Thêm | Đã mở form rồi mới tắt backend: khung "Chưa lưu được." kèm "Không kết nối được máy chủ, vui lòng thử lại". Mở form khi backend đã tắt: "Không tải được danh sách phòng ban." và nút Lưu bị khóa. Danh sách: "Không tải được danh sách nhân viên", nút "Thử lại" | `client.ts:17`, `EmployeeFormPage.tsx:524`, `:568`, `EmployeesPage.tsx:414` | Sửa cách làm và câu |

Tóm lại: 9 mục đúng (F03, F04, F05, F08, F14, V02, V03, V04, V05); 12 mục phải sửa (F01, F02, F06, F07, F09, F10, F11, F12, F13, V01, V06, V07). `team.md` không cần đổi vì chỉ trỏ tới danh sách.

Ngoài F, V, không thuộc yêu cầu: dòng 133 gợi ý "xử lý `DbUpdateException`, kiểm thử tự động" như việc tương lai, nhưng code đã có; dòng 119 ghi "5–10 nhân viên" trong khi dữ liệu mẫu có 80 người (`DOC-13`).

### Các chỗ code liên quan đến intent

**1. Đang tải và không tìm thấy cùng lúc (`FE-12`, Lượt 8 đã tái hiện).** `EmployeeFormPage.tsx:339-340` tính `isLoading` có cả `isEdit && departmentsStatus === "loading"`, nên `loadStatus === "not-found"` hoặc `"error"` vẫn đi kèm vòng tải ở `:366` và `:369-392`. `/employees/abc/edit` cũng bị vì `loadStatus` khởi tạo `not-found` (`:137-139`) trong khi effect phòng ban vẫn chạy (`:209`). Phần sửa nhỏ nhất là đổi biểu thức ở `:339-340` để phòng ban chỉ giữ trạng thái tải khi `loadStatus === "ready"`. `:396` không cần đổi.

**2. Hủy từ chi tiết phòng ban (`FE-13`, Lượt 8 đã tái hiện).** Liên kết `DepartmentDetailPage.tsx:164-168` không gửi `state`, trong khi `returnState` đã có ở `:143` và dùng cho form nhân viên. `DepartmentFormPage.tsx` không đọc `useLocation`; Hủy cố định `/departments` (`:297`), lưu xong cũng vậy (`:187`). `EmployeeFormPage.tsx:66-92` có sẵn `listPathFrom` kiểm `returnTo` đúng dạng `/departments/<số>` bằng `parseId`, nhưng hàm không xuất ra ngoài và gắn với danh sách nhân viên. Trang chi tiết đã có `Toast` (`:191`), nên lưu xong về chi tiết cũng hiện được lời báo. Liên kết "Về danh sách phòng ban" (`:228-229`) khi không tìm thấy phải giữ `/departments`.

**3. PUT phòng ban tên không đổi (`BE-11`).** `DepartmentService.cs:60` gán cùng giá trị nên EF không gửi UPDATE, `:63` không ném `DbUpdateConcurrencyException`, `:73` trả DTO bằng dữ liệu đã đọc. Cùng tình huống ở nhân viên ra 404 nhờ `EmployeeService.cs:151` đọc lại bằng `GetByIdAsync`. Sửa theo mẫu đó: `:73` đổi thành `return await GetByIdAsync(id, cancellationToken);`. `CountEmployeesAsync` vẫn dùng ở `DeleteAsync`. Comment `:72` phải sửa theo. Test cần mô phỏng dòng biến mất giữa lúc đọc và lúc lưu; `TestSupport/` có sẵn các context ném lỗi nhưng chưa đọc.

**4. Nạp lại phòng ban (`FE-14`).** `EmployeeFormPage.tsx:281-287` chỉ gắn lỗi cạnh ô. Lỗi `departmentId` đến từ `EmployeeService.cs:186` và `:245`. Ba cạm bẫy khi sửa:
- `retryDepartments` (`:243-246`) đặt `departmentsStatus = "loading"`, mà ở chế độ sửa `isLoading` thành true, form bị gỡ khỏi màn hình và `summaryRef` mất (`:160-164`). Cần nạp lại không đổi trạng thái, hoặc sửa cùng `FE-12`.
- `values.departmentId` vẫn giữ mã đã xóa. Sau khi danh sách mới về, `<select>` không có option khớp nên trình duyệt hiện dòng đầu, còn state vẫn mã cũ; bấm Lưu lại ra 400. Phải xóa giá trị nếu không còn trong danh sách.
- Effect ở `:209-236` phụ thuộc `departmentsReloadKey`, nhánh chọn sẵn chỉ chạy khi ô đang rỗng, không ảnh hưởng.

**5. Hết giờ lúc ghi (`FE-15`).** `client.ts:127` hẹn 10 giây cho mọi phương thức; `:229-231` trả `network` với `NETWORK_MESSAGE`. POST, PUT, DELETE đã tới máy chủ có thể đã lưu; thử lại thì POST ra 409 "Email đã được sử dụng", DELETE ra 404. `toApiError` không biết `method`; cần truyền thêm ở `:148`. Giữ `kind: "network"` với câu khác thì các trang không phải đổi: chúng dùng `messageOf` ở `EmployeeFormPage.tsx:290`, `DepartmentFormPage.tsx:155`, `EmployeesPage.tsx:279`, `DepartmentsPage.tsx:129`, `DepartmentDetailPage.tsx:136`. Comment `client.ts:16`, `:23`, `:125`, `:228` phải sửa theo.

**6. Bỏ lọc khi tải phòng ban lỗi (`FE-16`).** Có `?departmentId=2` mà `getDepartments` lỗi: ô lọc khóa ở `:390`, hiện "Không tải được phòng ban" (`:395`), danh sách vẫn lọc. `isStaleDepartment` (`:126-130`) cần `ready` nên không chạy. "Xóa bộ lọc" chỉ có khi `search` và rỗng (`:455-470`). Effect `:156-167` không có khóa tải lại, không thử lại được ngoài F5. `clearFilters` (`:245-249`) xóa cả chuỗi tìm; bỏ lọc phòng thì nên gọi `applyFilters(search, null)`.

**7. Việc nhỏ.**
- Nhãn `.http`: `EmployeeCrud.Api.http:11` nói "sẽ ra 409" nhưng tên "Thử nghiệm" chưa có, lần đầu ra 201 (phát hiện `R-01` ở `261104-sua-loi-luot-6/construction/code-generation/reviews/review-01.md`). `:51` cùng lỗi, email `nguyen.van.thu@example.com`. Thao tác 4 (`:24-29`) gửi "Nhân sự" trùng tên mẫu của phòng 1 nên không đổi gì; không sai nhãn nhưng cũng không minh họa đổi tên.
- Dấu phẩy: `TextInput.cs:16`, cuối dòng `(ví dụ U+200B, U+202E)` (`R-05`, cùng file review).
- Comment email: **chưa có ghi chép chi tiết**. Ứng viên số một là `Employee.cs:15` "đã bỏ khoảng trắng hai đầu": `TextInput` còn gộp khoảng trắng và đưa về NFC. Ứng viên phụ: `EmployeeRequest.cs:12`, `DepartmentRequest.cs:11` cùng cách nói.
- Code chết `client.ts`: **chưa có ghi chép chi tiết**. Thấy hai chỗ: `:226` nhánh `"TimeoutError"` không xảy ra vì hẹn giờ dùng `AbortController.abort()` không kèm lý do, nên lỗi luôn là `AbortError`; `ApiError.title`, `ApiError.detail` (`:54-55`, `:62-63`, `:70-71`, `:193-194`) được gán nhưng grep không có nơi nào đọc. Trường `type`, `status` ở kiểu `ProblemDetails` (`:35`, `:37`) cũng không dùng.
- Khóa trường `ErrorMapper`: **chưa có ghi chép chi tiết**. `ErrorMapper.cs:77`, `:79` gõ tay `"name"`, `"email"`, trùng `DepartmentService.NameField`, `EmployeeService.EmailField`; comment `:72-73` giải thích để tầng nền không phụ thuộc ngược. Cách giữ đúng chiều phụ thuộc: đưa khóa vào `Platform/Errors` (cạnh `ErrorTitles.BodyKey`) rồi service tham chiếu lại. `NameField`, `EmailField` là `public const`, test có thể đang dùng.

## Handoff Summary

- **Intent-relevant finding**: 186 dòng comment ở 53 file cần làm sạch, không dòng nào là code (danh sách theo file ở trên), và cả 6 lỗi hành vi đều khoanh được tới dòng: `EmployeeFormPage.tsx:339-340`, `DepartmentDetailPage.tsx:164-168`, `DepartmentService.cs:60-73`, `EmployeeFormPage.tsx:281-287`, `client.ts:229-231`, `EmployeesPage.tsx:390`. Danh sách F, V có 12/21 mục cần sửa.
- **Risks / follow-up**:
  - Requirements Analysis cần hỏi: comment trong `EmployeeCrud.Api.Tests` (33 dòng, 8 file) có thuộc phạm vi không; lưu xong từ chi tiết phòng ban có về chi tiết không, hay chỉ Hủy; câu báo khi hết giờ lúc ghi.
  - Ba việc nhỏ "comment email", "code chết client.ts", "khóa trường ErrorMapper" không có ghi chép chi tiết trong hồ sơ; vị trí trên là suy ra, cần chốt với Hiệp.
  - Sửa `FE-14` phải tránh gỡ form lúc đang hiện lỗi, nên làm cùng `FE-12`.
  - `FE-16`, `FE-12`, `FE-13`, `FE-14`, `FE-15` không có test tự động theo `team.md`; phải kiểm bằng Chromium. `BE-11` cần test hồi quy, scope `bugfix` đòi.
  - `team.md` viết comment phải giải thích "vì sao": khi xóa mã phải giữ lý do, không xóa cả câu.
  - Kế hoạch `261104-sua-loi-luot-6` ghi không dùng `data-testid`; thực tế `frontend/src` có 31 thuộc tính `data-testid` (Lượt 8 ghi 32, lệch một do cách đếm). Phần tử mới nên theo mẫu có sẵn.
