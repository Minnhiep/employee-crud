# Tóm tắt sửa code: sua-ra-soat-ban-giao

## 1. Đường cơ sở trước khi sửa (Step 1)

- `git status --short` (10/11, trước mọi thay đổi của bước này): chỉ có hồ sơ AI-DLC đang dở: 9 file `aidlc/spaces/default/codekb/employee-crud/*.md` và `aidlc/spaces/default/intents/intents.json` (sửa), `aidlc/.aidlc-subagent-inflight` và thư mục `aidlc/spaces/default/intents/261109-sua-ra-soat-ban-giao/` (mới). Không có file code nào đang sửa dở.
- `npm --prefix frontend run verify`: mã thoát 0. `typecheck`, `lint`, `format:check`, `build` (JS 303,92 KB, CSS 17,32 KB), `dotnet format --verify-no-changes` đều đạt; `dotnet test`: **148/148 đạt**, 0 bỏ qua.
- Số test theo lớp (`dotnet test --list-tests`):

| Lớp test | Số test |
| --- | --- |
| `Employees.EmployeeServiceTests` | 75 |
| `Departments.DepartmentServiceTests` | 45 |
| `Platform.ErrorMapperTests` | 12 |
| `Platform.PipelineTests` | 9 |
| `Platform.SecurityTests` | 5 |
| `Platform.LoggingTests` | 2 |
| **Tổng** | **148** |

- Lệnh trong `unit-test-instructions.md` chạy được: lệnh "Lớp service" (lọc hai lớp service) 120/120 đạt; lệnh "Lớp Platform" 28/28 đạt.
- Độ phủ trước khi sửa (`npm --prefix frontend run coverage`, coverlet): `DepartmentService` 100%, `EmployeeService` 100%, `TextInput` 100%; `ProblemDetailsExceptionHandler` 84,2%; toàn assembly 48% (controller và migration không có unit test theo `team.md`).

## 2. Tái hiện các mục suy luận trước khi sửa (Step 2)

Chạy trên máy thật ngày 10/11: backend `dotnet run --launch-profile http` (môi trường Development), frontend `npm run dev`, Chromium do Playwright điều khiển. Script để trong `backend/TestResults/kiem-sua-261110/` (Git bỏ qua): `repro-api.mjs`, `repro-ui.js`, `repro-ui-esc.js`. Dữ liệu thử đuôi `@kiem-thu.example`, đã xóa; đếm trước và sau đều 9 phòng ban, 83 nhân viên.

| Mục | Cách tái hiện | Kết quả thật | Kết luận |
| --- | --- | --- | --- |
| FR6.2 (phần SQL) | Bật log `Microsoft.EntityFrameworkCore.Database.Command=Information` bằng biến môi trường của riêng lần chạy đó; `POST /api/employees` với email của người có sẵn viết HOA; `POST /api/departments` với tên phòng có sẵn viết HOA (cả hai ra 409, không lưu gì) | Câu SQL thật: `WHERE lower(e.email) = @ToLower` và `WHERE lower(d.name) = @ToLower`. Vế giá trị được EF tính sẵn ở .NET rồi gửi làm tham số `@ToLower`; chỉ vế cột chạy `lower()` trong PostgreSQL. Comment cũ ("dịch thành `lower(email) = lower(@p)`") sai | **Tái hiện được** → sửa (Step 3) |
| FR6.3 | Gửi request chỉ kèm `Accept: text/html` | `GET /api/employees/999999`, `GET /api/departments/999999` → 404; POST email trùng → 409; POST email sai định dạng → 400: **cả bốn đều body rỗng, không có `Content-Type`**; log còn ghi thêm một dòng `fail: ExceptionHandlerMiddleware ... An unhandled exception` kèm stack trace cho mỗi lỗi. Không thấy trang lỗi chi tiết của Development như danh sách rà soát đoán (bản .NET 10 trả body rỗng). Đối chứng: `Accept: text/html, */*` và không có `Accept` → ProblemDetails JSON đúng; JSON hỏng → vẫn JSON (đi đường model binding, không qua bộ bắt lỗi) | **Tái hiện được** (body rỗng) → sửa (Step 5) |
| FR6.6 | `dotnet ef migrations list --project backend/EmployeeCrud.Api` khi chuỗi kết nối trống. Windows xóa biến môi trường nếu gán chuỗi rỗng, nên dùng một dấu cách (`ConnectionStrings__Default=" "`); thêm ca máy chưa có user-secrets (môi trường Production, user-secrets không được nạp) | Cả hai ca: công cụ build và dựng được ứng dụng, liệt kê được 2 migration từ assembly, nhưng báo `An error occurred while accessing the database... The ConnectionString property has not been initialized.` và không biết migration nào đã chạy. Nghĩa là: dựng ứng dụng không cần mở kết nối, nhưng việc nào chạm database vẫn cần chuỗi kết nối | **Tái hiện được** (comment thiếu ý) → sửa (Step 5) |
| FR7.5 | Mở `/employees?departmentId=999999`, làm chậm `GET /api/departments` 2 giây để đọc cây trợ năng (CDP `Accessibility.getPartialAXTree`) trước khi câu báo hiện | Trước khi có chữ: vùng `role="status"` bị `display:none` (luật `.alert:empty`), nút trợ năng `ignored=true (notRendered)`, tức là **không có trong cây trợ năng**. Sau khi có chữ: `role=status`. Vùng ra đời cùng lúc với chữ nên trình đọc màn hình dễ bỏ qua | **Tái hiện được** → sửa (Step 7) |
| FR7.7 | Sau bước trên (địa chỉ đã bỏ tham số, lịch sử mang cờ `staleDepartment`) nhấn F5; ca hai: vào danh sách bằng menu rồi F5 | Sau F5: câu "Phòng ban đã chọn không còn tồn tại" **hiện lại** dù địa chỉ chỉ là `/employees`, và **focus nằm ở `h1` "Nhân viên"** ở cả hai ca (lần tải đầu lẽ ra để focus ở đầu trang cho liên kết "Bỏ qua") | **Tái hiện được** → sửa (Step 7) |
| FR7.8 (đồng bộ khi Esc) | Làm chậm `DELETE` 3–4 giây, bấm Xóa, bấm "Xóa nhân viên", rồi nhấn Esc nhiều lần; ghi cờ `cancelable` của sự kiện `cancel` | Esc lần 1, 2: `cancel(cancelable=true)`, hộp giữ nguyên. **Esc lần 3: `cancel(cancelable=false)`, trình duyệt tự đóng hộp (`close`) trong khi vẫn đang xóa**, state React vẫn coi hộp đang mở. Lý do: Chromium chỉ cho chặn Esc một lần cho mỗi lần người dùng bấm (hai cú bấm chuột = hai lần chặn). Danh sách rà soát ghi "Esc lần hai"; thực tế là lần kế sau số lần bấm | **Tái hiện được** → sửa phần đồng bộ (Step 7) |
| FR7.8 (nháy chữ rỗng khi đóng) | Theo dõi từng khung hình (`requestAnimationFrame`) xem có lúc nào hộp còn mở mà tên nhân viên đã rỗng không, trong một lần xóa thật | **0 khung hình** | **Không tái hiện được** → không đổi sang `useLayoutEffect` |
| FR7.10 | Gõ từng phím `a@bücher.vn` vào ô email (`type="email"`), rồi bấm Lưu; request POST bị script chặn nên không lưu gì | Giá trị ô thành `a@xn--bcher-kva.vn`; body gửi lên `{"email":"a@xn--bcher-kva.vn",...}`: **chữ người gõ bị đổi sang punycode** | **Tái hiện được** → sửa (Step 7) |

Không có lỗi JavaScript nào trên console trong các lần chạy (dòng `Failed to load resource` duy nhất là request POST do script chủ động chặn ở FR7.10).

## 3. Nghiệp vụ backend và test của nó (Step 3–4)

- `DepartmentService.UpdateAsync`: gọi `FindTrackedAsync` trước `NormalizeName` (404 trước 400, giống `EmployeeService.UpdateAsync`).
- `EnsureNameIsFreeAsync`, `EnsureEmailIsFreeAsync`: vế giá trị hạ chữ bằng `ToLowerInvariant()` vào biến riêng (`loweredName`, `loweredEmail`) trước câu truy vấn, như chỗ tìm kiếm đang làm; comment ghi đúng câu SQL thật và lý do dùng `ToLowerInvariant`.
- Test (lệnh "Lớp service"): **123/123 đạt** (trước 120: bỏ 1 test trùng, thêm 4 test):
  - `EmployeeServiceTests.Search_IsCaseInsensitive`: đổi chuỗi tìm từ "MINH" sang "PHAM" (chỉ có trong họ tên "Hoa Pham", không email nào có), để test thật sự kiểm cột họ tên.
  - Mới `EmployeeServiceTests.Search_MatchesEmailWrittenInUpperCase_IgnoringCase`: nhân viên "Đỗ Văn An", email `Do.An@CongTy.VN`; tìm "CONGTY" và "congty" đều ra đúng người đó.
  - Mới `DepartmentServiceTests.Update_WhenMissing_ThrowsNotFound_EvenIfNameInvalid` (2 ca: tên 3 dấu cách, tên 101 ký tự) → 404 "Không tìm thấy phòng ban có mã 99999.".
  - Mới `DepartmentServiceTests.Update_WithNameTooLong_ThrowsValidationAndKeepsOldName` → vẫn 400 như cũ, tên cũ giữ nguyên (ca tên rỗng đã có ở #14).
  - Bỏ `Delete_WhenForeignKeyBlocksButRecountIsZero_ReportsOne` (D9, trùng hệt #18); giữ #18 và sửa comment cho đúng dữ liệu (database thử không có nhân viên nên đếm lại ra 0, vẫn báo "còn 1 nhân viên").
- Phép thử gây lỗi có chủ đích (làm tạm rồi trả code lại, chạy lại 123/123 xanh): bỏ `ToLower()` ở cột email trong `GetAllAsync` **và** đảo lại thứ tự kiểm tên trước ở PUT phòng ban → **3 test đỏ**, đúng 3 test mới (`Search_MatchesEmailWrittenInUpperCase_IgnoringCase`; hai ca `Update_WhenMissing_ThrowsNotFound_EvenIfNameInvalid`: "Expected NotFound, Actual Validation"); 120 test còn lại vẫn xanh, tức là trước đây không test nào bắt được hai lỗi này.

## 4. Tầng API và cấu hình chạy (Step 5)

- `ProblemDetailsExceptionHandler.TryHandleAsync`: khi `IProblemDetailsService.TryWriteAsync` trả `false` (request không nhận JSON) thì tự ghi ProblemDetails bằng `WriteAsJsonAsync(problem, problem.GetType(), ..., "application/problem+json")` kèm `traceId`, rồi trả `true`. Truyền `problem.GetType()` để lỗi kiểm dữ liệu giữ phần `errors` (nếu ghi theo kiểu khai báo `ProblemDetails` thì mất). Ở đường hiếm này JSON không có trường `type` (bộ ghi mặc định mới tự điền trường đó); `client.ts` chỉ đọc `title`, `detail`, `errors` nên không ảnh hưởng.
- `Program.cs`: `ConfigureKestrel` đặt thêm `Limits.MaxRequestBodySize = 64 * 1024` (comment nói vì sao 64 KB); sửa comment `AddDbContext` theo kết quả tái hiện: dựng ứng dụng không cần mở kết nối, nhưng việc chạm database vẫn cần chuỗi kết nối, và `dotnet ef` không tới bước `StartupChecks`.
- `StartupChecks.MissingConnectionStringMessage`: bỏ "của anh" (câu trung tính, vẫn không chứa mẫu `Password=`).
- Test mới `PipelineTests.DomainError_WithHtmlOnlyAcceptHeader_StillReturnsProblemJson`: `GET /api/test-only/conflict` kèm `Accept: text/html` → 409, `application/problem+json`, `title` "Dữ liệu bị trùng", `errors.email`, có `traceId`. Thử tạm trả về như code cũ (`return written;`): test đỏ ("Expected application/problem+json, Actual null"), trả code lại thì xanh.
- Không viết test tự động cho 413: host thử trong bộ nhớ không chạy Kestrel nên không áp giới hạn này (đúng như kế hoạch); kiểm bằng request thật (xem mục 6).
- Kết quả: lệnh "Lớp Platform" **29/29**; lệnh "Toàn bộ" **152/152** (= 148 − 1 + 5 test mới); `dotnet format backend/EmployeeCrud.slnx --verify-no-changes` mã thoát 0.

## 5. Cấu hình môi trường (Step 6)

- `global.json` (mới, gốc repo): `"version": "10.0.100"`, `"rollForward": "latestFeature"`. `dotnet --version` ở gốc repo in **10.0.403**.
- `.gitignore` gốc thêm `*.log`, `.idea/`, `http-client.private.env.json` kèm comment. `git ls-files -ci --exclude-standard` **không in dòng nào** (không file đang theo dõi nào bị bỏ ra).

## 6. Giao diện (Step 7)

| Mục | Đã sửa |
| --- | --- |
| FR7.1 | Hai form có cờ `submitAttempted` (đặt trong `handleSubmit` và `showSaveError`); `ErrorSummary` chỉ vẽ khi cờ bật. Lỗi khi rời ô vẫn hiện dưới ô như cũ. |
| FR7.2 | `<Toast />` đặt một lần trong `AppLayout` (trong `<main>`, trước `<Outlet />`), bỏ ở `EmployeesPage`, `DepartmentsPage`, `DepartmentDetailPage`. `Toast` đọc lời báo qua `messageFrom()`: chỉ nhận khi `message` là chuỗi. Bỏ kiểu `ToastLocationState` (chỉ dùng trong file, nay không cần). |
| FR7.3 | `EmployeesPage` và `useDepartmentDelete` (dùng chung cho trang danh sách và trang chi tiết phòng ban) có `hasLeftPageRef` như `hasLeftFormRef` của form: xóa xong mà trang đã bị rời thì không chuyển trang; lỗi thì chỉ `console.error` như form. |
| FR7.4 | "Thử lại" ở `EmployeesPage` (cả tải nhân viên lẫn tải phòng ban cho ô lọc), `DepartmentsPage`, `DepartmentDetailPage`, hai form (tải bản ghi; form nhân viên thêm nút tải lại phòng ban) đưa focus về tiêu đề qua `headingFocusRequest` (hai form được thêm cơ chế này). `DepartmentsPage`: xóa gặp 409 (bảng tải lại) cũng đưa focus về tiêu đề như 404. |
| FR7.5 | Vùng `role="status"` của câu "phòng ban đã chọn không còn" mang class mới `live-region` (không mang `.alert`); `.alert` đặt ở phần tử con. `components.css`: thay luật `.alert:empty { display: none }` (chỉ dùng cho vùng này) bằng `.live-region:empty { position: absolute }`, để vùng rỗng vẫn có trong cây trợ năng mà không sinh thêm khoảng cách trong lưới `.page-body`. |
| FR7.6 | `DepartmentDetailPage`: xóa xong `navigate("/departments", { replace: true, state })`. |
| FR7.7 | `usePageTitle`: biến cấp module `isFirstPageOfLoad` (đặt `false` trong effect, an toàn với StrictMode); trang đầu của mỗi lần tải (kể cả F5) không đưa focus vào h1, mọi trang mở sau đó đều đưa. `EmployeesPage`: câu báo phòng ban cũ giữ trong state của trang (`staleNoticeSearch`), không gửi cờ `staleDepartment` vào lịch sử nữa. |
| FR7.8 | `ConfirmDialog`: thêm `onClose`: trình duyệt tự đóng hộp mà state vẫn mở thì đang bận → mở lại (`showModal()`), không bận → gọi `onCancel()`. Không đổi sang `useLayoutEffect` (phần "nháy chữ rỗng" không tái hiện được). |
| FR7.9 | Nút Lưu ở hai form dùng `aria-disabled` thay `disabled`; `handleSubmit` tự bỏ qua khi đang khóa (Enter trong ô cũng gửi form). Form nhân viên khóa Lưu khi danh sách phòng ban chưa ở trạng thái `ready` (đang nạp, nạp lại, nạp lỗi). |
| FR7.10 | Ô email: `type="text"`, `inputMode="email"`, `autoCapitalize="none"`, `spellCheck={false}`, `autoComplete="email"`. |
| FR7.11 | `NotFoundPage` dùng `StatusMessage` (kind `error`, nút có mũi tên); trang chi tiết phòng ban không tìm thấy dùng cùng kiểu với hai form (kind `error`, câu "có thể đã bị xóa, hoặc đường dẫn không đúng.", mũi tên). Thêm dấu chấm cuối 3 câu: `client.ts` (`NETWORK_MESSAGE`), `EmployeeFormPage`, `DepartmentFormPage` ("…có thể đã bị xóa."). |
| FR7.12 | Sửa comment `App.tsx` (form được tạo mới là do hai route khác nhau, không phải do `key`), `validateEmployee.ts` (API chỉ dừng ở lỗi đầu tiên của service; `[Required]` báo cùng lúc họ tên và email; chỉ API kiểm được phòng ban còn không, email trùng), `SearchBox.tsx` (không phải "dùng chung": chỉ trang nhân viên dùng). Bỏ `export` của `EMAIL_MAX_LENGTH`; giữ `export` của `FULL_NAME_MAX_LENGTH`, `DEPARTMENT_NAME_MAX_LENGTH` vì nay form dùng trong dòng gợi ý; câu báo và gợi ý dùng hằng thay 100/254. Bỏ thẻ `div.app__content` không có CSS. `BrandMark` 2rem → 1.75rem cho khớp `.brand-mark`. |
| FR7.13 | Mục gốc breadcrumb ở 6 trang thành `{ label: "Trang chủ", to: "/" }` (ở hai form khóa khi đang lưu, như mục giữa); sửa ví dụ trong comment `PageHeader`. |

- Kết quả: `npm --prefix frontend run typecheck`, `lint`, `format:check` (lần đầu Prettier chê một dòng `else if` dài ở `EmployeesPage.tsx`, sửa tay xong thì đạt), `build` (JS 304,74 KB, CSS 17,33 KB): **cả 4 mã thoát 0**.

## 7. Kiểm trên Chromium thật và API thật (Step 8)

Backend `dotnet run --launch-profile http` (bật log SQL bằng biến môi trường của riêng lần chạy) + frontend `npm run dev`; Chromium do Playwright điều khiển. Script trong `backend/TestResults/kiem-sua-261110/` (Git bỏ qua): `check-api-after.mjs`, `check-ui-a.js`, `check-ui-b.js`; chạy thêm hai bộ có sẵn `backend/TestResults/kiem-b-t-261109/api-check.mjs`, `ui-check.js`. Đếm trước và sau mỗi bộ: **9 phòng ban, 83 nhân viên**. Không có lỗi JavaScript nào trên console (chỉ có các dòng `Failed to load resource` do script chủ động chặn request).

| Bộ kiểm | Kết quả |
| --- | --- |
| `check-api-after.mjs` (API thật, thay đổi backend) | **11/11** |
| `check-ui-a.js` (giao diện, không ghi dữ liệu) | **27/27** |
| `check-ui-b.js` (giao diện, có dữ liệu thử) | **15/15** |
| `api-check.mjs` có sẵn (30 ca API) | **30/30** |
| `ui-check.js` có sẵn (16 ca giao diện: thêm, sửa, xóa, tìm, lọc) | **16/16** |

Kết quả theo từng mục:

| Mục | Phép kiểm | Kết quả |
| --- | --- | --- |
| FR6.2 | Log SQL thật sau khi sửa | `WHERE lower(e.email) = @loweredEmail`, `WHERE lower(d.name) = @loweredName` (khớp comment mới); trùng khác hoa thường vẫn 409 |
| FR6.3 | `Accept: text/html`: GET nhân viên 999999; POST email trùng; POST email sai | 404 / 409 / 400, đều `application/problem+json`, có `title`, `errors`, `traceId`; log không còn dòng `fail` |
| FR6.4 | Body ~70 KB; body ~60 KB | 413 `{"title":"Dữ liệu gửi lên quá lớn"}`; 60 KB vẫn tới service, 400 "Tên phòng ban tối đa 100 ký tự" |
| FR6.9 | PUT phòng 99999 tên 101 ký tự; PUT phòng có thật tên 101 ký tự; PUT phòng 99999 tên toàn khoảng trắng | 404; 400 như cũ; **400** (`[Required]` của `DepartmentRequest` chặn trước khi vào controller, xem mục 9) |
| FR7.1 | Rời ô trống chưa bấm Lưu; bấm Lưu (cả hai form) | Không có khung "Chưa lưu được", lỗi hiện dưới ô; bấm Lưu thì khung hiện và nhận focus |
| FR7.2 | Đánh dấu phần tử `.toast-region[role=status]` ở trang danh sách trước khi thêm; thêm nhân viên; đặt `history.state` lạ (`message` là object) rồi F5 | Sau khi thêm, vẫn đúng phần tử đó (trước rỗng) nhận "Đã thêm nhân viên …"; state lạ: trang vẽ bình thường, không có thông báo |
| FR7.3 | Làm chậm DELETE 2,5 giây, bấm Back khi đang xóa ở trang nhân viên, danh sách phòng ban, chi tiết phòng ban | Ở lại trang đã về (`/departments`, `/employees`, `/employees`), không bị kéo về; bản ghi vẫn bị xóa |
| FR7.4 | Chặn GET cho tới khi trang báo lỗi rồi bấm "Thử lại" (7 chỗ); xóa phòng gặp 409 thật (thêm nhân viên vào phòng sau khi trang đã tải) | Focus về h1 ở cả 7 chỗ; 409 hiện "…vì còn 1 nhân viên." và focus h1 |
| FR7.5 | Đọc cây trợ năng (CDP) trước khi có chữ; đo khoảng cách | Trước: `role=status ignored=false` (trước khi sửa: `ignored=true (notRendered)`); vùng rỗng cao 0, tấm danh sách cách mép đúng 24 px = padding |
| FR7.6 | Xóa ở trang chi tiết rồi bấm Back | Về danh sách có thông báo, focus h1; Back tới `/departments` (h1 "Phòng ban"), không về "Không tìm thấy phòng ban" |
| FR7.7 | F5 sau khi có câu báo phòng cũ; vào bằng menu rồi F5 | Câu báo không hiện lại, focus ở `body`; Tab đầu tới "Bỏ qua, tới nội dung chính"; bấm menu vẫn focus h1; lọc phòng khác thì câu báo tự ẩn |
| FR7.8 | Esc khi không bận; Esc 4 lần khi đang xóa (DELETE chậm 3 giây) | Không bận: hộp đóng, focus về nút Xóa, mở lại được; đang xóa: hộp vẫn mở sau cả 4 lần, vẫn "Đang xóa…"; xóa xong hộp đóng, focus h1 |
| FR7.9 | Phòng ban đang tải (chậm 2,5 giây); đang lưu (POST chậm 1,5 giây, gửi bằng Enter trên nút) | `aria-disabled="true"`, không có `disabled`, bấm không báo nhầm "Vui lòng chọn phòng ban"; đang lưu focus vẫn ở nút Lưu "Đang lưu…" |
| FR7.10 | Gõ từng phím `a@bücher.vn` rồi Lưu (POST bị chặn, không lưu) | Giá trị ô và body gửi lên đều `a@bücher.vn`; thuộc tính `text,email,none,false,email` |
| FR7.11 | 4 trang "không tìm thấy"; câu báo lỗi mạng | Cùng `StatusMessage` lỗi (`role=alert`), nút có mũi tên; "Không kết nối được máy chủ, vui lòng thử lại." có dấu chấm |
| FR7.12 | Gợi ý, câu báo độ dài; logo; `.app__content` | "Tối đa 100 ký tự.", "Họ tên tối đa 100 ký tự", "Tên phòng ban tối đa 100 ký tự" đúng chữ; logo 28 px, thuộc tính `1.75rem`; không còn `.app__content` |
| FR7.13 | Breadcrumb 6 trang; trang chi tiết phòng "Bán hàng"; bấm "Trang chủ" | Cả 6 trang mục gốc là liên kết "Trang chủ" tới `/`; "Trang chủ › Phòng ban › Bán hàng"; bấm thì về `/employees`, focus h1 |
| NFR6 | Bàn phím | Các phép kiểm focus ở trên (FR7.1, FR7.4, FR7.7, FR7.8, FR7.9) đều đạt; điểm Lighthouse chưa đo (FR8.2, Build and Test) |
| NFR7 | Đếm dữ liệu | Trước và sau mọi bộ kiểm: 9 phòng ban, 83 nhân viên |

## 8. Tài liệu (Step 9)

| Mục | File | Đã sửa |
| --- | --- | --- |
| FR1.1 | `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md` | D03 trỏ `../so-do-database.md` |
| FR1.2 | `07` | Thêm F17–F21 (thêm phòng, xóa phòng trống, xóa phòng còn người, lọc theo phòng, trang chi tiết), V11–V12 (tên trùng khác hoa thường 409, tên rỗng/quá 100 ký tự), A08–A10 (`GET /api/departments/999999` 404, `DELETE` phòng còn người 409, `POST` tên trùng 409); câu báo lấy từ phản hồi thật |
| FR1.3 | `07` | F05 thêm bước gõ lại bằng chữ HOA |
| FR1.4 | `07` | Câu hỏi 10: phân trang, chống ghi đè khi hai người cùng sửa, xóa mềm, nhật ký thay đổi |
| FR2.3 | `07`, `README.md` | Thêm D04 (`lower('KẾ TOÁN')`), D05 (thứ tự tên phòng ban); README mục 10 trỏ `07` mục 3.4 thay câu "D1–D5" |
| FR2.1 | `README.md` mục 1 | ".NET SDK 10.0.x", nói `global.json` và việc cài thêm SDK 10 |
| FR2.2 | `README.md` mục 11 | 2 lệnh Microsoft Code Coverage (có `-assemblyfilters:+EmployeeCrud.Api`) kèm lệnh xóa kết quả cũ; coverlet vẫn là cách chuẩn |
| FR2.4 | `README.md` đầu trang | 2 dòng `.claude/`, `aidlc/` trong khối cấu trúc thư mục |
| FR2.5 | `README.md` mục 17 | Liên kết `luong-xu-ly-thuc-te.md`, `tim-hieu-technical-stack/` (00, 06, 07) |
| FR2.6 | `README.md` mục 3 | `postgres` chỉ để bắt đầu nhanh, khuyên làm mục 13 ngay sau migration; user-secrets không mã hóa, chỉ dùng trên máy phát triển; thêm câu báo của `dotnet ef` khi thiếu chuỗi kết nối (từ kết quả tái hiện) |
| FR2.7 | `README.md` mục 15 (mới) | "Giới hạn bảo mật"; hai mục sau dời thành 16, 17 (không tài liệu nào trỏ tới số mục 15, 16 cũ) |
| FR3.1–FR3.5 | `docs/luong-xu-ly-thuc-te.md` (mới) | Luồng "Thêm nhân viên" 9 bước theo file và hàm thật; nhánh 400, 409 (kể cả 23505 khi chen nhau); 4 nhóm vấn đề (Windows: CRLF, Smart App Control, `psql`; dữ liệu chữ; chen nhau khi xóa phòng; CORS 127.0.0.1), mỗi vấn đề có triệu chứng, nguyên nhân, cách xử lý khớp README và code |
| FR4.1, FR4.2 | `docs/danh-sach-api.md` | Thêm mã 413 (quy ước chung, bảng mã, bảng tóm tắt), mục "Thứ tự kiểm khi sửa (PUT)", ví dụ "400 — JSON hỏng" (khóa `body`) và "413" lấy nguyên văn phản hồi thật ngày 10/11; ghi rõ lỗi trả JSON kể cả khi `Accept` chỉ nhận `text/html` |
| FR4.3 | `backend/EmployeeCrud.Api/EmployeeCrud.Api.http` | #9 sửa nhân viên vừa tạo ở #7 (biến `# @name createEmployee`) kèm cảnh báo không dùng mã nhân viên mẫu; làm cùng cách cho #4 (sửa phòng vừa tạo ở #2, trước đây đổi tên phòng mã 1 có sẵn); ghi chú cách dọn hai bản ghi thử ở #5, #10. Tiện ích REST Client trong VS Code nhận đúng cú pháp biến |
| FR5.1 | `00-tong-quan-luong.md`, `02-api-json.md`, `03-aspnet-core.md` | Khung "bài thật khác ở…" thêm: Swagger UI ở `/swagger` (chỉ Development); mẫu `ILike`, CORS của bản học không phải code thật (code thật dùng `Contains` có thoát `%`, `_`; CORS chỉ GET, POST, PUT, DELETE và header `Content-Type`, đối chiếu `CorsSetup.cs`) |

Kiểm:

- Liên kết tương đối trong 7 tài liệu đã sửa: **51/51 mở được**; đường dẫn file nhắc trong `luong-xu-ly-thuc-te.md`: **24/24 có thật** (script `backend/TestResults/kiem-sua-261110/check-links.mjs`). Tên hàm, test, chỉ mục, ràng buộc trong trang đã đối chiếu với code và migration (`ux_employees_email`, `ux_departments_name` trên `lower(...)`, `fk_employees_department` `Restrict`).
- Hai lệnh Microsoft Code Coverage của README chạy được: 152/152 test, báo cáo chỉ có 1 assembly `EmployeeCrud.Api`; trên riêng file kết quả mới: `DepartmentService` 100%, `EmployeeService` 100%, `TextInput` 100%. Thư mục `backend/TestResults/coverage-ms/` còn 2 file cũ ngày 04/11 (không phải do lần này tạo, em không xóa) nên lần chạy đúng lệnh README gộp 3 file: chính vì vậy README ghi thêm lệnh xóa kết quả cũ trước khi đo lại.
- D05 đối chiếu dữ liệu thật (`GET /api/departments`, sắp `ORDER BY name` trong PostgreSQL): "Bán hàng, Chăm sóc khách hàng, Hành chính, Kế toán, Kinh doanh, Kỹ thuật, Nhân Sự, Truyền thông, Văn Phòng": 4 phòng mẫu đúng thứ tự ghi trong D05 (database demo đang có tên "Nhân Sự" chữ S hoa).
- Không chạy các ví dụ trong file `.http` vào `employee_db` (các ví dụ thêm mới sẽ ghi dữ liệu demo); việc chạy thử thuộc Build and Test.

## 9. Kiểm tổng (Step 10)

| Lệnh | Kết quả |
| --- | --- |
| `npm --prefix frontend run verify` | **Mã thoát 0**: `typecheck`, `lint`, `format:check`, `build` (JS 304,74 KB, CSS 17,33 KB), `dotnet format --verify-no-changes` đạt; `dotnet test` **152/152**, 0 bỏ qua |
| `npm --prefix frontend run coverage` (coverlet) | `DepartmentService` **100%**, `EmployeeService` **100%**, `TextInput` **100%** (mức sàn 80% của lớp service: đạt, không đổi ngưỡng nào); `ProblemDetailsExceptionHandler` 84,2% → 95,5%; toàn assembly 48% → 48,8% |
| `npm --prefix frontend audit --omit=dev` | **0 lỗ hổng** |
| `git ls-files --eol -c -o --exclude-standard` | Không có file nào `w/crlf` hay `w/mixed` (kể cả hai file mới) |
| Tìm mã hồ sơ nội bộ (`FR`, `NFR`, `A-`, `B-`, `C-`, `R-`, `D9`) trong code và tài liệu đã sửa | Không có (chỉ một dòng có sẵn từ trước ở `docs/du-lieu-mau.sql`, file không sửa) |
| Gói NuGet, npm | Không thêm gói nào (`package.json`, `*.csproj`, `dotnet-tools.json` không đổi) |

## 10. File tạo mới và sửa

| File | Loại | Mục |
| --- | --- | --- |
| `global.json` | Mới | FR6.8 |
| `docs/luong-xu-ly-thuc-te.md` | Mới | FR3.1–FR3.5 |
| `backend/EmployeeCrud.Api/Departments/DepartmentService.cs` | Sửa | FR6.2, FR6.9 |
| `backend/EmployeeCrud.Api/Employees/EmployeeService.cs` | Sửa | FR6.2 |
| `backend/EmployeeCrud.Api/Platform/Errors/ProblemDetailsExceptionHandler.cs` | Sửa | FR6.3 |
| `backend/EmployeeCrud.Api/Program.cs` | Sửa | FR6.4, FR6.6 |
| `backend/EmployeeCrud.Api/Platform/StartupChecks.cs` | Sửa | FR6.7 |
| `backend/EmployeeCrud.Api/EmployeeCrud.Api.http` | Sửa | FR4.3 |
| `backend/EmployeeCrud.Api.Tests/Employees/EmployeeServiceTests.cs` | Sửa | FR6.1 |
| `backend/EmployeeCrud.Api.Tests/Departments/DepartmentServiceTests.cs` | Sửa | FR6.5, FR6.9 |
| `backend/EmployeeCrud.Api.Tests/Platform/PipelineTests.cs` | Sửa | FR6.3 |
| `frontend/src/components/AppLayout.tsx`, `Toast.tsx` | Sửa | FR7.2, FR7.12 |
| `frontend/src/components/ConfirmDialog.tsx` | Sửa | FR7.8 |
| `frontend/src/components/PageHeader.tsx` | Sửa | FR7.13 (comment) |
| `frontend/src/components/SearchBox.tsx`, `Icon.tsx`, `frontend/src/App.tsx` | Sửa | FR7.12 |
| `frontend/src/hooks/usePageTitle.ts` | Sửa | FR7.7 |
| `frontend/src/api/client.ts` | Sửa | FR7.11 |
| `frontend/src/pages/NotFoundPage.tsx` | Sửa | FR7.11, FR7.13 |
| `frontend/src/pages/employees/EmployeesPage.tsx` | Sửa | FR7.2–FR7.5, FR7.7, FR7.13 |
| `frontend/src/pages/employees/EmployeeFormPage.tsx` | Sửa | FR7.1, FR7.4, FR7.9–FR7.13 |
| `frontend/src/pages/employees/validateEmployee.ts` | Sửa | FR7.12 |
| `frontend/src/pages/departments/DepartmentsPage.tsx` | Sửa | FR7.2, FR7.4, FR7.13 |
| `frontend/src/pages/departments/DepartmentDetailPage.tsx` | Sửa | FR7.2, FR7.4, FR7.6, FR7.11, FR7.13 |
| `frontend/src/pages/departments/DepartmentFormPage.tsx` | Sửa | FR7.1, FR7.4, FR7.9, FR7.11–FR7.13 |
| `frontend/src/pages/departments/useDepartmentDelete.tsx` | Sửa | FR7.3 |
| `frontend/src/pages/departments/validateDepartment.ts` | Sửa | FR7.12 |
| `frontend/src/styles/components.css` | Sửa | FR7.5 |
| `README.md` | Sửa | FR2.1–FR2.7 |
| `.gitignore` | Sửa | FR5.2 |
| `docs/danh-sach-api.md` | Sửa | FR4.1, FR4.2 |
| `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md` | Sửa | FR1.1–FR1.4, FR2.3 |
| `docs/tim-hieu-technical-stack/00-tong-quan-luong.md`, `02-api-json.md`, `03-aspnet-core.md` | Sửa | FR5.1 |

Script kiểm (không vào Git, nằm trong `backend/TestResults/kiem-sua-261110/`): `repro-api.mjs`, `repro-ui.js`, `repro-ui-esc.js`, `check-api-after.mjs`, `check-ui-a.js`, `check-ui-b.js`, `capture-json.mjs`, `check-links.mjs`, `department-order.mjs`.

## 11. Quyết định chính

- Vế giá trị khi so trùng được hạ chữ vào biến riêng trước câu truy vấn (`loweredEmail`, `loweredName`), cùng cách với chỗ tìm kiếm, để câu SQL ra đúng điều comment nói (`= @loweredEmail`); không đổi vế cột (`ToLower()` → `lower()` của PostgreSQL, khớp chỉ mục).
- Khi bộ ghi ProblemDetails mặc định từ chối, handler tự ghi JSON theo kiểu thật của đối tượng (giữ `errors`) và kèm `traceId`; không đổi `StatusCodeProblemWriter` (tiêu đề theo mã ở đó thuộc nhóm "em đề xuất", ngoài phạm vi).
- `usePageTitle`: dùng biến cấp module (đặt trong effect để an toàn với StrictMode) và **bỏ luôn điều kiện "điều hướng kiểu thay thế thì không focus"**: điều kiện đó chỉ để che trường hợp "/" tự chuyển sang "/employees" lúc mở ứng dụng, nay biến cấp module đã che; giữ lại thì hai luồng mới (bấm "Trang chủ" rồi được chuyển sang `/employees`; xóa ở trang chi tiết rồi `replace` về danh sách) sẽ mất focus về `body`. Đã kiểm trên Chromium: cả hai luồng focus h1.
- Câu báo "phòng ban không còn" giữ trong state của trang (`staleNoticeSearch`) thay vì cờ trong lịch sử trình duyệt rồi xóa cờ bằng một lần `replace` như kế hoạch ghi: cùng mục đích (F5 không hiện lại), ít hơn một lần điều hướng, và không còn dữ liệu nào trong lịch sử để sống qua F5. Ghi ở mục 12.
- Vùng `role="status"` rỗng dùng `position: absolute` (luật CSS `.live-region:empty`) thay cho `display: none`, để vẫn có trong cây trợ năng mà bố cục không đổi (đo được khoảng cách 24 px như cũ).
- `useDepartmentDelete` giữ dấu "đã rời trang" cho cả trang danh sách lẫn trang chi tiết phòng ban (hook dùng chung), nên `DepartmentDetailPage` không cần ref riêng.
- Nút Lưu: `aria-disabled` + `handleSubmit` tự bỏ qua khi khóa (Enter trong ô cũng gửi form, nút `aria-disabled` không chặn được việc đó).
- Breadcrumb "Trang chủ" ở hai form cũng khóa khi đang lưu, như mục "Nhân viên"/"Phòng ban" đang làm (lối thoát khi đang lưu đã được khóa từ lượt sửa 04/11).
- `.http`: làm cùng cách cho ví dụ #4 (sửa phòng ban) vì nó cũng đổi tên phòng mã 1 có sẵn, cùng loại lỗi với #9.

## 12. Lệch so với kế hoạch

1. **FR7.8 chỉ sửa một phần:** phần "đồng bộ khi trình duyệt tự đóng hộp" tái hiện được nên đã sửa (`onClose`); phần "nháy chữ rỗng khi đóng" đo 0 khung hình nên **không** đổi sang `useLayoutEffect` (theo luật "không tái hiện được thì không sửa"). Ở bản tái hiện, hộp tự đóng ở lần Esc thứ 3 (sau 2 cú bấm chuột), không phải "lần hai" như danh sách rà soát ghi.
2. **FR7.7 phần câu báo:** dùng state của trang thay cho "đọc cờ `staleDepartment` rồi xóa bằng một lần `replace`" (lý do ở mục 11). Kết quả kiểm trên Chromium khớp tiêu chí.
3. **FR7.12 `export`:** kế hoạch ghi bỏ `export` của `FULL_NAME_MAX_LENGTH`, `EMAIL_MAX_LENGTH`, `DEPARTMENT_NAME_MAX_LENGTH` "nếu chỉ dùng trong file"; vì cùng bước đó đưa hằng vào dòng gợi ý của hai form, chỉ `EMAIL_MAX_LENGTH` còn dùng riêng trong file nên chỉ bỏ `export` của nó. `ToastLocationState` bỏ hẳn (không còn dùng).
4. **FR7.12 `app__content`:** bỏ cả thẻ `div` bọc (thẻ không class, không vai trò thì thừa); bố cục không đổi (đã đo).
5. **FR7.5:** ngoài việc dời `.alert` xuống phần tử con như kế hoạch, phải đổi thêm một luật CSS (mục 11) để không sinh khoảng cách thừa.
6. **FR6.6:** Windows xóa biến môi trường khi gán chuỗi rỗng, nên phép tái hiện dùng một dấu cách, và thêm một ca không nạp user-secrets.
7. **FR6.3:** hiện tượng thật là "body rỗng" (kèm một dòng log `fail` có stack trace), không phải "trang lỗi chi tiết của Development" như danh sách rà soát đoán; đã sửa theo kế hoạch.
8. **Kiểm thêm ngoài kế hoạch (để chắc):** request thật cho 413 và thứ tự PUT (kế hoạch để Build and Test), chạy lại hai bộ kiểm có sẵn (30 ca API, 16 ca giao diện), chạy thử hai lệnh Microsoft Code Coverage của README, đối chiếu thứ tự phòng ban (D05) trên dữ liệu thật.

## 13. Test

- Trước: 148 test (Platform 28, `EmployeeServiceTests` 75, `DepartmentServiceTests` 45). Sau: **152** (Platform 29, `EmployeeServiceTests` 76, `DepartmentServiceTests` 47) = 148 − 1 (bỏ test trùng) + 5 mới. Lệnh: `dotnet test backend/EmployeeCrud.slnx` (và trong `npm --prefix frontend run verify`): 152/152 đạt.
- Test đã viết mà chưa chạy: **không có**.
- Không viết test tự động cho 413 (host thử không chạy Kestrel) và cho React (theo `team.md`): kiểm bằng request thật và Chromium (mục 7).
- Độ phủ (coverlet): lớp service 100% trước và sau; không đổi ngưỡng nào.
- Sau Step 12 (mục 15): **153** (Platform 30) = 152 + 1 test `PipelineTests.Kestrel_LimitsRequestBodyTo64Kilobytes`. Lớp service không đổi nên không đo lại độ phủ.

## 14. Điểm cần Hiệp xem hoặc quyết

Ở cổng 10/11 Hiệp yêu cầu xử lý hết các điểm này trong một lần; cách xử lý ghi ở dòng "Step 12" dưới mỗi điểm (chi tiết ở mục 15).

1. **FR6.9, tiêu chí "tên toàn khoảng trắng → 404":** qua API thật luôn ra **400** vì `[Required]` của `DepartmentRequest` (và `EmployeeRequest`) chạy trước controller; chỉ tên quá dài hoặc ký tự lạ mới thấy thứ tự "404 trước". Unit test ở tầng service đúng tiêu chí; tài liệu API đã ghi đúng hành vi thật. Build and Test nên kỳ vọng 400 cho ca khoảng trắng. Đổi điều này phải bỏ `[Required]`, tức đổi hành vi API ngoài phạm vi (NFR3), nên em không làm.
   - **Step 12 (R-03):** không đổi code. Kỳ vọng thật (400 / 404 / 400) đã ghi trong `unit-test-instructions.md` mục "Kỳ vọng khi kiểm bằng API thật"; chạy lại bằng API thật ngày 10/11 khớp đủ (mục 15.3).
2. **FR7.10 `autoComplete="email"`** làm theo kế hoạch, nhưng em đề xuất cân nhắc giữ `autoComplete="off"` như cũ: form này nhập email của **người khác** (nhân viên), nên trình duyệt gợi ý email của chính người đang dùng máy là không đúng mục đích (WCAG 1.3.5 chỉ yêu cầu `autocomplete` cho thông tin của chính người dùng). Đổi lại chỉ một thuộc tính.
   - **Step 12 (R-02):** Hiệp chọn `off`; đã đổi, giữ `type="text"`, `inputMode="email"`, `autoCapitalize="none"`, `spellCheck={false}`.
3. **FR7.3, ca hẹp chưa che:** bấm Back mà vẫn ở trang danh sách nhân viên (ví dụ từ `?search=a` về `/employees`) trong lúc đang xóa thì trang không bị gỡ, nên khi xóa xong địa chỉ bị thay về chuỗi tìm cũ. Kế hoạch chọn mẫu ref "đã rời trang" nên ca này nằm ngoài; Back sang trang khác (ca chính) đã kiểm đạt.
   - **Step 12:** đã sửa ở cả hai trang danh sách (giữ địa chỉ mới nhất trong ref); tái hiện được trước khi sửa, đạt sau khi sửa (mục 15).
4. **Thư mục `backend/TestResults/coverage-ms/`** còn 2 file kết quả cũ ngày 04/11; lần sau đo bằng lệnh README thì xóa trước (README đã ghi lệnh).
5. **Database demo** đang có hai tên phòng "Nhân Sự", "Văn Phòng" chưa theo quy ước (việc Hiệp còn để mở); không ảnh hưởng kết quả kiểm.
6. Smart App Control đang tắt tạm: cần bật lại khi xong (ràng buộc của requirements).

## 15. Sửa theo yêu cầu của Hiệp ở cổng Code Generation (Step 12, 10/11)

Nguồn: R-01 đến R-04 trong `reviews/review-01.md` và ca FR7.3 còn sót (mục 14.3). Hiệp yêu cầu xử lý hết trong một lần. Thứ tự làm: tái hiện trên code cũ → sửa → test tự động → kiểm trên Chromium thật và API thật → phép thử gây lỗi → kiểm tổng.

### 15.1 Tái hiện trên code cũ (trước khi sửa)

Backend `dotnet run --launch-profile http` và frontend `npm run dev` (em tự bật, xong thì tắt); Chromium do Playwright điều khiển. Script `backend/TestResults/kiem-sua-261110/repro-buoc12.js` (Git bỏ qua). Đếm trước và sau: 9 phòng ban, 83 nhân viên.

| Ca | Kết quả trên code cũ |
| --- | --- |
| Đang có câu báo "phòng ban không còn", bấm lại mục "Nhân viên" trên menu (cùng địa chỉ `/employees`) | Câu báo **vẫn hiện** (R-01) |
| Trang nhân viên: tìm, bấm Xóa (DELETE làm chậm 2,5 giây), trong lúc chờ bấm Back về `/employees` | Xóa xong địa chỉ **bị thay về** `/employees?search=<chuỗi cũ>` (FR7.3 ca còn sót) |
| Danh sách phòng ban: mở `/departments?tu=b12`, bấm menu "Phòng ban", xóa, trong lúc chờ bấm Back | Xóa xong địa chỉ **bị thay về** `/departments` thay vì `/departments?tu=b12` |

### 15.2 Đã sửa

| Điểm | File | Đã sửa |
| --- | --- | --- |
| R-01 (FR7.7) | `frontend/src/pages/employees/EmployeesPage.tsx` | Bỏ `staleNoticeSearch` (so chuỗi truy vấn). State mới `staleNotice` kiểu `StaleNotice`: `{ phase: "removing" }` khi địa chỉ còn phòng không hợp lệ (chờ trang tự bỏ tham số), `{ phase: "shown", locationKey }` ở lần vẽ đầu tiên khi tham số đã mất (ghi `location.key` lúc đó); khóa đổi sau đó thì ẩn và quên luôn. Đổi state ngay trong lúc vẽ như cách cũ. Comment nói vì sao dùng `location.key` (mỗi lần điều hướng có khóa mới, kể cả khi địa chỉ giống hệt), và vì sao ghi khóa ở lần vẽ đầu sau khi tham số mất. |
| FR7.3 ca còn sót | `EmployeesPage.tsx` (`confirmDelete`), `frontend/src/pages/departments/DepartmentsPage.tsx` (`onDeleted`) | `latestLocationRef`: giữ địa chỉ mới nhất, ghi trong effect sau mỗi lần vẽ (không ghi ref lúc vẽ); `navigate` mang lời báo "Đã xóa…" theo ref đó. Giữ nguyên `hasLeftPageRef` (trang nhân viên) và `useDepartmentDelete` (trang phòng ban). |
| R-02 (FR7.10) | `frontend/src/pages/employees/EmployeeFormPage.tsx` | `autoComplete="off"` kèm comment: form nhập email của nhân viên khác, gợi ý email của người đang dùng máy là sai mục đích. |
| R-04 (FR6.4) | `backend/EmployeeCrud.Api.Tests/Platform/PipelineTests.cs` | Test mới `Kestrel_LimitsRequestBodyTo64Kilobytes`: lấy `IOptions<KestrelServerOptions>` từ `factory.Services` của `PlatformWebAppFactory`, so `Limits.MaxRequestBodySize` với `64 * 1024` viết thẳng trong test. `Program.cs` không đổi. |
| R-03 (FR6.9) | (không đổi code) | Kỳ vọng thật đã có trong `unit-test-instructions.md` mục "Kỳ vọng khi kiểm bằng API thật": PUT phòng 99999 tên toàn khoảng trắng **400**, tên 101 ký tự **404**; phòng có thật tên sai **400**. Build and Test kiểm theo các kỳ vọng này. |

Vì sao câu báo không mất ngay khi vừa vào trang: ngay sau khi vào, trang tự thay địa chỉ để bỏ `departmentId`, và Toast tự thay địa chỉ để xóa lời báo khỏi lịch sử; cả hai đều sinh khóa mới. Khóa chỉ được ghi ở lần vẽ đầu tiên khi tham số đã mất, lúc hai lần thay đó đã xong: Toast xóa lời báo ngay ở lượt effect đầu (trước khi danh sách phòng ban tải xong), còn lần bỏ tham số không mang state nên Toast không thay địa chỉ thêm. Ca hai lần thay chạy cùng một lượt (`departmentId` sai dạng kèm lời báo) cũng đã kiểm (R01g).

Hệ quả của quy tắc "khóa đổi là ẩn" (đã đo, X01): đang có câu báo mà xóa một nhân viên trên trang thì câu báo ẩn, vì lần `navigate` mang lời báo "Đã xóa…" là một lần điều hướng mới; thông báo "Đã xóa…" hiện thay. Kế hoạch ghi đúng quy tắc này nên em giữ, không thêm đánh dấu riêng cho các lần điều hướng của chính trang (cách đó phải biết cấu trúc state của Toast).

### 15.3 Kiểm

Test tự động:

| Lệnh | Kết quả |
| --- | --- |
| Lệnh "Lớp Platform" | **30/30** (29 + 1 test mới) |
| Phép thử gây lỗi: tạm đổi `64 * 1024` thành `128 * 1024` ở `Program.cs`, chạy "Lớp Platform" | **1 test đỏ**, đúng test mới: "Expected: 65536, Actual: 131072"; 29 test còn lại xanh. Trả lại `64 * 1024` (đã đối chiếu dòng 20 của `Program.cs`), chạy lại 30/30 |
| Lệnh "Toàn bộ" `dotnet test backend/EmployeeCrud.slnx` | **153/153**, 0 bỏ qua |
| `npm --prefix frontend run verify` | **Mã thoát 0**: `typecheck`, `lint`, `format:check` (lần đầu Prettier chê kiểu `StaleNotice` viết nhiều dòng, sửa tay thành một dòng thì đạt), `build` (JS 304,92 KB, CSS 17,33 KB), `dotnet format --verify-no-changes`, `dotnet test` 153/153 |
| `git ls-files --eol` 5 file đã sửa | Đều `i/lf w/lf` |
| Tìm mã hồ sơ nội bộ (`R-0x`, `FRx`, `NFRx`, `Step x`) trong `frontend/src` và `*.cs` | Không có |

Chromium thật và API thật (backend + frontend em tự bật, xong thì tắt; script trong `backend/TestResults/kiem-sua-261110/`, Git bỏ qua). Mọi bộ kiểm đều đếm trước và sau: **9 phòng ban, 83 nhân viên**; dữ liệu thử đuôi `@kiem-thu.example`, tên "Phòng thử B12 …", đã xóa sạch. Không có lỗi JavaScript trên console (chỉ có dòng `Failed to load resource` khi API trả 409 có chủ đích).

`check-buoc12.js`: **13/13**

| Ca | Phép kiểm | Kết quả |
| --- | --- | --- |
| R01a (a) | Tab mới: mở `/employees`, rồi `/employees?departmentId=999999`, chờ 1,5 giây | Câu báo hiện, địa chỉ `/employees`, lịch sử 2 → 3 (chỉ `goto` thêm 1), `history.state.idx` = 0 (thay, không thêm) |
| R01b (b) | Đang có câu báo, bấm lại mục "Nhân viên" | Câu báo ẩn, địa chỉ vẫn `/employees` |
| R01c1 (c) | Có câu báo, tìm "a", rồi Back | Tìm: ẩn; Back về `/employees`: không hiện lại |
| R01c2 (c) | Có câu báo, lọc một phòng có thật, rồi Back | Lọc: ẩn; Back: không hiện lại |
| R01d (d) | Có câu báo rồi F5 | Không hiện lại, focus ở `body` |
| R01e (e) | Mở `?departmentId=999999&search=a`, bấm Tìm (chuỗi cũ) | Câu báo vẫn giữ, địa chỉ và lịch sử không đổi, danh sách có tải lại |
| R01f | Từ danh sách lọc theo phòng X bấm "Thêm nhân viên"; xóa phòng X qua API; chọn phòng khác rồi Lưu | Về `/employees`: câu báo và thông báo "Đã thêm nhân viên …" cùng hiện; 2 giây sau lịch sử không thêm mục, không có thêm request GET danh sách nhân viên nào (không vòng điều hướng) |
| R01g | `departmentId=abc` kèm lời báo Toast trong lịch sử, F5 (Toast và trang tự thay địa chỉ trong cùng một lượt) | Câu báo và thông báo cùng hiện, câu báo còn sau 2 giây, không thêm request GET danh sách nhân viên |
| R02 | Thuộc tính ô email | `text,email,none,false,off` |
| U73a | Trang nhân viên: tìm, xóa (DELETE chậm 2,5 giây), Back về `/employees` | Địa chỉ giữ `/employees`; dòng đếm "84 nhân viên" khớp API (danh sách tải lại theo bộ lọc đang hiện); thông báo "Đã xóa nhân viên …"; đã xóa |
| U73b | Danh sách phòng ban: `?tu=b12` → menu → xóa → Back | Địa chỉ giữ `/departments?tu=b12`; dòng mất; thông báo "Đã xóa phòng ban …"; đã xóa |
| U73c | Trang nhân viên: Back sang trang khác lúc đang xóa | Ở lại `/departments`; nhân viên vẫn bị xóa |
| U73d | Danh sách phòng ban: Back sang trang khác lúc đang xóa | Ở lại `/employees`; phòng vẫn bị xóa |

Đo thêm `check-buoc12-xoa.js` (X01): đang có câu báo, xóa nhân viên trên trang thì câu báo ẩn, thông báo "Đã xóa" hiện (hệ quả đã nói ở 15.2).

Chạy lại các bộ cũ để chắc không hỏng chỗ khác:

| Bộ | Kết quả |
| --- | --- |
| `backend/TestResults/kiem-b-t-261109/ui-check.js` (16 ca giao diện) | **16/16** ở lần chạy thứ hai. Lần đầu 15/16: U05 (email trùng khác hoa thường) đỏ vì script dùng `isVisible({ timeout: 8000 })`, mà Playwright bỏ qua `timeout` của `isVisible` và đọc ngay, nên đọc trước khi phản hồi 409 về. Kiểm riêng bằng phép chờ đúng (`check-u05-cho-dung.js`): **3/3**, chữ "Email đã được sử dụng" hiện sau 53–59 ms |
| `check-ui-a.js` (27 ca, Step 8) | **27/27** (ô email nay `...,off`) |
| `check-ui-b.js` (15 ca, Step 8) | **15/15** |
| `check-api-after.mjs` (11 ca API thật) | **11/11**: body ~70 KB → 413 "Dữ liệu gửi lên quá lớn"; ~60 KB vẫn tới service; PUT phòng 99999 tên khoảng trắng → 400; tên 101 ký tự → 404; phòng có thật tên 101 ký tự → 400 |

Ghi chú về phép đo R01a: lần chạy đầu đo `history.length` ngay trong tab đang dùng (4 → 5, đạt); lần chạy lại tab đó đã đủ 50 mục, là mức tối đa Chromium giữ cho một tab, nên số không tăng nữa (50 → 50). Em đổi sang đo trong tab mới và kiểm thêm `history.state.idx`; lần chạy cuối đạt 13/13.

### 15.4 Lệch so với kế hoạch và ghi chú

1. **`traceability.json` không thêm được file thứ hai vào một dòng:** công cụ kiểm (`codeTargetProblem` trong `.claude/tools/aidlc-sensor-traceability.ts`) chỉ nhận đúng **một** file có thật cho mỗi dòng `OK`. Em giữ file chính ở mỗi dòng và ghi đủ file ở đây: FR6.4 → `backend/EmployeeCrud.Api/Program.cs` (cấu hình) + `backend/EmployeeCrud.Api.Tests/Platform/PipelineTests.cs` (test); FR7.3 → `useDepartmentDelete.tsx` + `EmployeesPage.tsx` + `DepartmentsPage.tsx`; FR7.7 → `usePageTitle.ts` + `EmployeesPage.tsx`; FR7.10 → `EmployeeFormPage.tsx` (không đổi file).
2. **Ô trong file kế hoạch:** lúc bắt đầu bước này, các ô Step 1–11 trong `code-generation-plan.md` trên đĩa đang **trống** (brief ghi là đã đánh dấu). Lần kiểm tổng cuối của Step 12 (153/153, `verify` mã thoát 0, các bộ kiểm Chromium và API cũ đều đạt) xác nhận lại kết quả của Step 1–11, nên em đánh dấu cả Step 1–12.
3. `ui-check.js` là file của Build and Test, ngoài kế hoạch nên em không sửa. Em đề xuất khi tới Build and Test đổi `isVisible({ timeout })` ở U05 (và U13, U14) thành `waitFor` để ca này không đỏ ngẫu nhiên.
4. File mới (Git bỏ qua): `backend/TestResults/kiem-sua-261110/repro-buoc12.js`, `check-buoc12.js`, `check-buoc12-xoa.js`, `check-u05-cho-dung.js`.

### 15.5 File đã sửa ở Step 12

| File | Mục |
| --- | --- |
| `frontend/src/pages/employees/EmployeesPage.tsx` | FR7.7 (câu báo theo `location.key`), FR7.3 (địa chỉ mới nhất khi xóa) |
| `frontend/src/pages/departments/DepartmentsPage.tsx` | FR7.3 (địa chỉ mới nhất khi xóa) |
| `frontend/src/pages/employees/EmployeeFormPage.tsx` | FR7.10 (`autoComplete="off"`) |
| `backend/EmployeeCrud.Api.Tests/Platform/PipelineTests.cs` | FR6.4 (test giới hạn 64 KB) |
| `aidlc/.../code-generation/code-summary.md`, `code-generation-plan.md` (chỉ đánh dấu ô) | Hồ sơ |

Không còn điểm nào chờ Hiệp quyết từ lượt rà R-01 đến R-04. Việc còn lại thuộc Build and Test (FR8: Lighthouse, kiểm cuối) và việc bật lại Smart App Control.
