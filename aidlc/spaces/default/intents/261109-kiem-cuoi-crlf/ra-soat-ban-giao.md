# Rà soát toàn bộ trước bàn giao (09/11/2026)

> Hiệp yêu cầu: kiểm thật kỹ toàn bộ dự án theo chuẩn nghiệp vụ thực tế và chuẩn code công ty lớn trước khi bàn giao; chỗ nào chưa dứt điểm thì làm cho xong. Hiệp duyệt kế hoạch 5 bước và chọn: phần vượt `docs/ke-hoach.md` chỉ ghi "em đề xuất", không làm.
>
> Cách làm: AI chạy các lệnh kiểm tự động; 5 chuyên gia của AI-DLC rà độc lập, chỉ đọc (nghiệp vụ và tài liệu `aidlc-product-lead-agent`, backend và database `aidlc-architecture-reviewer-agent`, frontend `aidlc-developer-agent`, bảo mật và Git `aidlc-devsecops-agent`, kiểm thử và bàn giao `aidlc-quality-agent`); AI gộp, bỏ trùng, tự kiểm lại các mục quan trọng trên code. **Chưa sửa gì.** Hiệp chọn nhóm cần sửa.
>
> Bối cảnh: Smart App Control đang Bật chặn `aidlc.exe` và file `.dll` vừa build, nên lượt này không chạy được AI-DLC, 148 test và backend.

## 1. Kết luận nhanh

- **Không có lỗi mức Cao** ở cả 5 góc. Sản phẩm đạt đủ yêu cầu của `docs/ke-hoach.md` §3 và §5.
- Còn **2 lỗi frontend mức Trung bình** (khung báo lỗi hiện sai lúc chưa bấm Lưu; thông báo thành công có thể không được trình đọc màn hình đọc), **1 ca test bắt buộc còn thiếu** (tìm theo email không phân biệt hoa thường), **tài liệu kiểm tay và README lệch vài chỗ**, cùng khoảng 30 mục Thấp.
- Việc phải làm trước khi gửi anh Hiếu: commit các file đang dở và **push 3 commit** chưa lên GitHub (bản trên GitHub chưa có bản sửa lỗi xuống dòng).

## 2. Kết quả kiểm tự động (AI chạy ngày 09/11)

| Kiểm tra | Kết quả |
|---|---|
| `npm run typecheck`, `lint`, `format:check`, `build` | Đạt cả 4 (bản build 304 KB JS, 17 KB CSS) |
| `dotnet format backend/EmployeeCrud.slnx --verify-no-changes` | Đạt |
| `dotnet list package --vulnerable --include-transitive` | 0 gói có lỗ hổng |
| `npm audit --omit=dev` (gói chạy thật) | 0 lỗ hổng |
| `npm audit` (cả gói dev) | 10 mức trung bình, đều do `minimatch` trong bộ ESLint, chỉ dùng lúc lập trình. Sửa phải hạ ESLint xuống bản 9 (đổi lớn), giữ quyết định "không làm" như lần 03/11 |
| `dotnet test` | **Không chạy được**: `EmployeeCrud.Api.dll` bị chặn (0x800711C7). Lần chạy được gần nhất: 148/148 ngày 05/11; từ đó code chỉ thêm comment |
| Xuống dòng trong Git (`git ls-files --eol`) | 804/804 file LF |
| File bị bỏ qua mà vẫn nằm trong Git | Không có |
| Bí mật trong lịch sử Git (37 commit, mọi nhánh) | Không có |
| Gói NuGet cũ | Chỉ 3 gói của project test có bản lớn mới hơn; không có lỗ hổng. Không nâng lúc bàn giao |

## 3. Đối chiếu `docs/ke-hoach.md`

| Mục | Kết quả | Ghi chú |
|---|---|---|
| §1 Luồng React → API JSON → ASP.NET Core → PostgreSQL | Đạt | |
| §2 PostgreSQL, C#/ASP.NET, React, API/JSON | Đạt | Có đủ trong code và tài liệu `docs/tim-hieu-technical-stack/` |
| §2 Git: clone, branch, commit, pull, merge | Đạt | Đã tập nhánh → PR → gộp 3 lần trên GitHub |
| §3 Danh sách, thêm, sửa, xóa, tìm nhân viên, chọn phòng ban | Đạt | |
| §3 Không microservices, Redux, CI/CD | Đạt | |
| §5 Source, migration, sơ đồ DB, danh sách API, README | Đạt | Lệch nhỏ ở nhóm A |
| §5 Demo 15 phút: chức năng, luồng xử lý, vấn đề đã gặp | Một phần | Chưa có trang tóm tắt luồng thật và "vấn đề đã gặp" trong `docs/` (A-12) |
| §5 Yêu cầu hoàn thành | Đạt | Kiểm thật lần cuối 09/11: API 29/29, giao diện 12/12 |

## 4. Danh sách việc

Cột "Kiểm lại": **AI đã kiểm** = AI tự đọc code xác nhận; **Theo người rà** = chuyên gia đọc code, AI chưa kiểm lại; **Cần chạy thử** = mới suy luận, phải tái hiện trước khi sửa.

### Nhóm A. Tài liệu (sửa được ngay, không cần chạy ứng dụng)

| Mã | Mức | Việc | Vì sao | Kiểm lại |
|---|---|---|---|---|
| A-1 (PL-1, QA-05) | Trung bình | `07-kiem-thu-va-demo.md:92` mục D03 trỏ sang sơ đồ nháp ở `04-postgresql.md` mục 9 (có cột `created_at`, email không phải 254) → đổi sang `docs/so-do-database.md` | Làm đúng D03 thì luôn ra "không khớp"; dễ trả lời sai khi demo | AI đã kiểm |
| A-2 (PL-3, QA-04) | Trung bình | `07` thêm ca kiểm tay cho phòng ban và bộ lọc: thêm, tên trùng khác hoa thường (409), tên rỗng hoặc quá 100 ký tự, xóa phòng trống, xóa phòng còn người, lọc nhân viên theo phòng, trang chi tiết, `/api/departments/999` → 404 | Luật "không xóa phòng còn nhân viên" là trọng tâm của đề mà danh sách kiểm tay để demo chưa có; bộ kiểm 29 ca hôm 09/11 nằm trong `backend/TestResults` (bị Git bỏ qua) nên người nhận không làm lại được | Theo người rà |
| A-3 (QA-01 phần tay) | Thấp | `07` mục F05: thêm bước gõ chữ HOA khi tìm theo email | Đi cùng B-1 | Theo người rà |
| A-4 (PL-4, QA-10) | Thấp | `07:138` câu gợi ý "làm tiếp: xử lý `DbUpdateException`, kiểm thử tự động", nhưng cả hai đã làm → đổi sang việc thật sự chưa làm (phân trang, chống ghi đè đồng thời, xóa mềm, nhật ký) | Câu trả lời mẫu mâu thuẫn với sản phẩm | AI đã kiểm |
| A-5 (QA-03) | Trung bình | `README.md:18` ".NET SDK 10.0 trở lên" → "10.0.x; máy chỉ có bản mới hơn thì cài thêm 10" | App `net10.0` cần runtime 10; máy chỉ cài .NET 11 sẽ không chạy được `dotnet run`. Đi cùng B-8 (`global.json`) | AI đã kiểm dòng README |
| A-6 (QA-02) | Trung bình | README mục 11: thêm 2 lệnh đo độ phủ bằng Microsoft Code Coverage cho máy bật Smart App Control (có `-assemblyfilters:+EmployeeCrud.Api`); giữ coverlet làm cách chuẩn, khỏi sửa `team.md` | Script `coverage` hiện không tái hiện được con số 100% trên máy này; đây là câu hỏi Hiệp còn để mở | Theo người rà |
| A-7 (QA-06) | Thấp | `README.md:167` nhắc "D1–D5 trong hồ sơ kiểm thử" mà không có đường dẫn, lại trùng tên D01–D03 của file 07 → trỏ về `07` mục 3.4, chuyển 2 phép kiểm còn lại sang làm D04, D05 | Người nhận không tìm được | Theo người rà |
| A-8 (QA-07) | Thấp | README thêm 2 dòng: `.claude/` và `aidlc/` là hồ sơ và công cụ AI-DLC, không cần để chạy ứng dụng | 691/804 file trong repo thuộc hai thư mục này, người lạ dễ bối rối | Theo người rà |
| A-9 (PL-6) | Thấp | README mục 16 thêm liên kết tới `docs/tim-hieu-technical-stack/` (06 cài đặt, 07 kiểm thử) | Người cài máy mới không biết có hướng dẫn | Theo người rà |
| A-10 (SEC-03) | Thấp | README mục 3: nói rõ chạy bằng `postgres` chỉ để bắt đầu nhanh, khuyên làm mục 13 (`employee_app`) ngay sau migration; thêm một dòng "user-secrets không mã hóa, chỉ dùng trên máy phát triển" | Theo README từ trên xuống thì app chạy bằng tài khoản quyền cao nhất | Theo người rà |
| A-11 (SEC-04) | Thấp | README thêm mục ngắn "Giới hạn bảo mật": chỉ chạy localhost, không có đăng nhập nên không mở ra mạng; muốn đưa lên mạng cần xác thực, HTTPS, giới hạn tần suất (ghi là hướng phát triển) | Công ty luôn ghi rõ giả định "ai được tin" (OWASP A04) | Theo người rà |
| A-12 (PL-5) | Trung bình | Thêm `docs/luong-xu-ly-thuc-te.md`: một luồng "Thêm nhân viên" chỉ vào file và hàm thật (form → `client.ts` → controller → service → `AppDbContext` → bảng), các nhánh lỗi 400/409, và 5–7 "vấn đề đã gặp" (CRLF, Smart App Control, ký tự vô hình, chen nhau xóa phòng…) | Đề §5 yêu cầu demo "luồng xử lý và những vấn đề đã gặp"; tài liệu 00–05 là bản nháp lúc học, còn tên cũ | Theo người rà |
| A-13 (PL-10, QA-09, AR-2) | Thấp | `danh-sach-api.md`: thêm ví dụ 400 khi JSON hỏng (khóa `body`) và 413; ghi rõ thứ tự kiểm khi PUT (phòng ban kiểm tên trước, nhân viên tìm trước) | Tài liệu nói liệt kê đủ mã lỗi nhưng thiếu ca có thật; dễ bị hỏi | Theo người rà |
| A-14 (PL-7) | Thấp | `EmployeeCrud.Api.http` #9 `PUT /api/employees/1` sẽ ghi đè nhân viên mẫu có mã 1 → thêm cảnh báo hoặc dùng mã của người vừa tạo ở #7 | Chạy thử trên database demo làm hỏng dữ liệu mẫu | Theo người rà |
| A-15 (PL-11, SEC-07) | Thông tin | Banner "bài thật khác ở…" của `00`, `02`, `03`: thêm ý "bài thật có Swagger UI ở `/swagger`" và "mẫu `ILike`/CORS ở đây là bản học, code thật thoát ký tự và chỉ cho 4 phương thức" | Bản nháp nói ngược sản phẩm; người đọc có thể chép mẫu chưa an toàn | Theo người rà |
| A-16 (SEC-09) | Thông tin | `.gitignore` thêm `*.log`, `.idea/`, `http-client.private.env.json` | Chặn trước file bí mật của `.http` và file rác IDE | Theo người rà |

### Nhóm B. Backend (sửa xong phải chạy test → cần gỡ chặn Smart App Control)

| Mã | Mức | Việc | Vì sao | Kiểm lại |
|---|---|---|---|---|
| B-1 (QA-01) | Trung bình, **bắt buộc theo `team.md`** | Thêm test: nhân viên có email `Do.An@CongTy.VN`, họ tên không chứa chuỗi tìm, tìm "CONGTY" phải ra người đó; đổi `Search_IsCaseInsensitive` sang người có email không chứa "minh" | Hiện nếu bỏ `ToLower()` ở cột email (`EmployeeService.cs:88`) thì cả 148 test vẫn đạt: test tìm chữ HOA ("MINH") khớp cả họ tên lẫn email `minh@…`, test tìm email chỉ dùng chữ thường. Email được lưu giữ nguyên chữ hoa nên đây là ca thật | AI đã kiểm |
| B-2 (AR-1, PL-8) | Thấp | `EmployeeService.cs:254`, `DepartmentService.cs:145`: đổi `email.ToLower()`/`name.ToLower()` (vế biến) sang `ToLowerInvariant()`; sửa comment dòng 248, 138, 143 cho đúng: vế biến được hạ chữ ở .NET rồi gửi làm tham số, chỉ vế cột chạy `lower()` trong PostgreSQL | Comment hiện nói cả hai vế chạy `lower()` trong PostgreSQL, sai với cách EF Core tính trước biểu thức không dính cột; `ToLower()` còn phụ thuộc ngôn ngữ của máy; chỗ tìm kiếm (dòng 86) đã dùng `ToLowerInvariant()` | AI đã kiểm code; SQL thật cần chạy thử |
| B-3 (SEC-01) | Thấp | `ProblemDetailsExceptionHandler.cs:49`: khi `TryWriteAsync` trả `false` (request có `Accept: text/html` mà không có `*/*`) thì tự ghi JSON như `StatusCodeProblemWriter` + 1 test | Hiện lỗi 404 nghiệp vụ trong trường hợp này rơi về trang lỗi chi tiết của Development (lộ stack trace), 400/409/500 ra body rỗng. Trình duyệt thường gửi `*/*` nên ít gặp | Cần chạy thử |
| B-4 (SEC-02, AR-3) | Thấp | `Program.cs:14` đặt `MaxRequestBodySize` khoảng 64 KB + 1 test 413 (`ErrorMapper` đã có câu tiếng Việt cho 413) | Mặc định Kestrel nhận tới khoảng 30 MB rồi mới báo "tối đa 100 ký tự" (OWASP API4:2023) | Theo người rà |
| B-5 (QA-08) | Thấp | `DepartmentServiceTests.cs`: #18 và D9 trùng hệt nhau; comment #18 ghi "còn nhân viên" nhưng dữ liệu không có ai → bỏ một test hoặc sửa comment (số test giảm 1 nếu bỏ) | Test trùng và comment sai làm khó giải thích | Theo người rà |
| B-6 (AR-8) | Thông tin | Comment `Program.cs:33-34` thêm ý: `dotnet ef` vẫn cần có chuỗi kết nối (không cần mở kết nối) | Comment chưa đủ, dễ hiểu nhầm khi chạy `dotnet ef` trên máy chưa đặt user-secrets | Cần chạy thử |
| B-7 (PL-12) | Thông tin | `StartupChecks.cs:15` câu báo "mật khẩu PostgreSQL của anh" → "của bạn" (+ sửa test so câu này) | Người khác chạy thấy lạ | Theo người rà |
| B-8 (QA-03, AR-6) | Thấp | Thêm `global.json` ghim SDK 10 (`rollForward: latestFeature`) | Ghim phiên bản công cụ như công ty thường làm; đi cùng A-5 | AI đã kiểm (không có `global.json`) |
| B-9 (AR-2) | Thông tin | (Tùy chọn) đổi `DepartmentService.UpdateAsync` tìm bản ghi trước rồi mới kiểm tên, cho giống nhân viên | Hai PUT cùng loại xử lý thứ tự khác nhau. Chỉ lộ ra với tên toàn khoảng trắng hoặc quá dài vì `[Required]` chạy trước. Khuyên chỉ ghi tài liệu (A-13) | AI đã kiểm |

### Nhóm C. Frontend (sửa xong phải kiểm trên trình duyệt với backend thật → cần gỡ chặn)

| Mã | Mức | Việc | Vì sao | Kiểm lại |
|---|---|---|---|---|
| C-1 (FE-R1) | Trung bình | `ErrorSummary` chỉ hiện sau khi đã bấm Lưu (thêm cờ `submitAttempted`); lỗi lúc rời ô chỉ hiện dưới ô | Hiện rời một ô trống là khung "Chưa lưu được. Kiểm tra lại các trường sau:" bật lên kèm `role="alert"` dù chưa bấm Lưu: câu báo sai sự thật và trình đọc màn hình bị ngắt liên tục (mẫu GOV.UK Error summary, WAI-ARIA APG Alert) | AI đã kiểm (`EmployeeFormPage.tsx:274-283`, `ErrorSummary.tsx:28-41`) |
| C-2 (FE-R2, FE-R12) | Trung bình | Đặt `<Toast />` một lần trong `AppLayout` (trước `<Outlet />`), bỏ ở 3 trang; kiểm `typeof message === "string"` | Hiện Toast được tạo mới cùng trang đích nên vùng `role="status"` ra đời cùng lúc với chữ, trình đọc màn hình thường không đọc (WCAG 4.1.3); state lạ có thể làm trắng trang | AI đã kiểm (`Toast.tsx:35-36`, 3 trang tự đặt `<Toast />`) |
| C-3 (FE-R3) | Thấp | Xóa xong mà người dùng đã rời trang thì không `navigate` (mẫu `hasLeftFormRef` như form) | Bấm Back lúc đang xóa bị kéo về danh sách | Theo người rà |
| C-4 (FE-R4, FE-R5) | Thấp | Sau "Thử lại" và sau xóa gặp 409 thì đưa focus về tiêu đề | Focus rơi về `body`, người dùng bàn phím mất vị trí (WCAG 2.4.3) | Theo người rà |
| C-5 (FE-R6) | Thấp | `EmployeesPage.tsx:358-374` vùng `role="status"` không mang class `.alert` (đang bị `display:none` khi rỗng) | Câu báo "phòng ban đã chọn không còn" có thể không được đọc | Cần chạy thử |
| C-6 (FE-R7) | Thấp | Xóa phòng ở trang chi tiết xong dùng `navigate(..., { replace: true })` | Bấm Back về trang "Không tìm thấy phòng ban" | Theo người rà |
| C-7 (FE-R8) | Thấp | `usePageTitle`: F5 không tự đưa focus vào tiêu đề; xóa cờ `staleDepartment` sau khi đọc | F5 làm hiện lại câu báo cũ và mất liên kết "Bỏ qua" | Theo người rà |
| C-8 (FE-R9) | Thấp | `ConfirmDialog`: thêm `onClose` đồng bộ state; dùng `useLayoutEffect` khi đóng | Esc lần hai trên Chrome có thể đóng hộp lúc đang xóa; có thể nháy chữ rỗng | Cần chạy thử |
| C-9 (FE-R10) | Thấp | Nút Lưu dùng `aria-disabled` như nút Hủy; khóa Lưu khi phòng ban đang tải | Focus rơi về `body`; bấm Lưu lúc đang tải báo "Vui lòng chọn phòng ban" sai | Theo người rà |
| C-10 (FE-R11) | Thấp | Ô email `type="text"` + `inputMode="email"`, `autoCapitalize="none"`, `spellCheck={false}` | Chrome đổi tên miền có dấu sang punycode, giá trị lưu khác chữ người gõ | Cần chạy thử |
| C-11 (FE-R13, FE-R14) | Thấp | Thống nhất kiểu trang "không tìm thấy" (NotFoundPage dùng `StatusMessage`); thêm dấu chấm cuối 3 câu báo | Nhất quán giao diện và câu chữ | Theo người rà |
| C-12 (FE-R15, FE-R16) | Thông tin | Sửa 3 comment chưa đúng (`App.tsx:54`, `validateEmployee.ts:30`, `SearchBox.tsx:15`); bỏ `export` thừa, dùng hằng thay số 100/254 viết cứng, bỏ class `app__content` không có CSS | Dọn code, không đổi hành vi | Theo người rà |
| C-13 (PL-9) | Thấp | Breadcrumb mục gốc "Nhân sự" không bấm được → bỏ hoặc đổi tên | Trang chi tiết phòng "Nhân sự" hiện "Nhân sự › Phòng ban › Nhân sự" | Theo người rà |

### Nhóm D. Git và dọn dẹp (Hiệp tự làm, AI chỉ từng bước)

| Mã | Việc |
|---|---|
| D-1 | Commit 2 comment (`Program.cs`, `CorsSetup.cs`) và hồ sơ `aidlc/` (codekb, audit, `intents.json`, thư mục `261109-kiem-cuoi-crlf/`) |
| D-2 (PL-2) | Push 3 commit đang chờ (`319e701`, `fbad699`, `c542387`) và các commit sửa lượt này. Chưa push thì bản anh Hiếu clone chưa có `.gitattributes`, sẽ gặp lỗi Prettier hàng loạt trên Windows |
| D-3 (QA-12) | Dời `backend/TestResults/` (khoảng 437 MB bản clone thử và báo cáo cũ, nằm trong OneDrive) ra thư mục lưu trữ |
| D-4 | Khi `aidlc` chạy lại: đóng việc `261109-kiem-cuoi-crlf` (duyệt Code Generation → Build and Test → Deployment) |
| D-5 (SEC-08) | (Thông tin) 34 commit mang email Gmail cá nhân; muốn ẩn thì đặt `user.email` sang địa chỉ noreply của GitHub cho commit sau, không viết lại lịch sử |

### Nhóm E. Em đề xuất (ngoài đề hoặc đổi lớn; không làm, hỏi anh Hiếu)

Đăng nhập và phân quyền (SEC-04, `project.md` cấm); ErrorBoundary ở gốc và cảnh báo khi rời form chưa lưu (FE-R18); trả 503 khi database tắt (AR-5); `TreatWarningsAsErrors` và `EnforceCodeStyleInBuild` (AR-6); lockfile NuGet và Dependabot (SEC-10); ESLint loại đọc kiểu `recommendedTypeChecked` (FE-R17); tiêu đề lỗi theo mã ở `StatusCodeProblemWriter` (AR-4); đổi tên khóa chính sang `pk_` (AR-7, cần migration mới); kiểm lại quyền sequence của `employee_app` (SEC-05); chuỗi tìm nằm trên địa chỉ là đánh đổi có chủ ý (SEC-06); `replace` khi đổi ô lọc (FE-R19); nâng gói test lên bản lớn; giải thích 28 test Platform (QA-11). Cùng các mục đã chốt từ trước: phân trang, xóa mềm, nhật ký, chống ghi đè đồng thời, collation tiếng Việt, `CHECK`.

## 5. Kiểm chưa làm được (chờ backend chạy lại)

Migration trên database trống → F02 (danh sách rỗng) → R01 (làm theo README từ đầu); Postman/API lượt cuối; Lighthouse; xem câu SQL thật của B-2; tái hiện B-3, B-6, C-5, C-8, C-10; xem log có bị nhiễu dòng Error cho lỗi 404/409 không (AR-9).

## 6. Đã kiểm, thấy ổn (tóm tắt 5 báo cáo)

- Luật nghiệp vụ hai lớp (service kiểm trước, chỉ mục và khóa ngoại database chặn ca chen nhau) cho email trùng, tên phòng trùng, phòng không tồn tại, xóa phòng còn người; ra đúng 400/404/409, không 500.
- REST đúng: 201 kèm `Location`, 204, id lạ ra 404 ProblemDetails tiếng Việt, 405/415 có body; `traceId` thống nhất phản hồi và log.
- EF: model khớp snapshot, `AsNoTracking`, không N+1, số nhân viên đếm bằng một câu SELECT; tìm kiếm dùng LINQ `Contains`, không có SQL viết tay.
- `normalizeText` (React) khớp `TextInput` (C#) từng luật; câu báo lỗi giống nhau ở form, API và tài liệu.
- Mọi effect tải dữ liệu có AbortController; route có `key` theo id; chặn bấm đúp; `returnTo` chỉ nhận `/departments/<số>`.
- Trợ năng: `lang="vi"`, tiêu đề tab, liên kết "Bỏ qua", `aria-invalid`, `<dialog>` gốc, tương phản màu đạt.
- Bảo mật: không bí mật trong Git, CORS chặt, header bảo mật, `AllowedHosts` localhost, Swagger chỉ Development, log không ghi body hay query string; không hồi quy các mục S-01..S-11 đã sửa ngày 03/11.
- Test: đúng 148 ca, không bỏ qua ca nào, mỗi test một database riêng, không có test luôn đạt; đủ các ca bắt buộc trừ B-1.

## 7. Trạng thái AI-DLC

`261030-employee-department-crud`, `261104-sua-loi-luot-6`, `261104-sua-loi-luot-8`: xong. `261109-kiem-cuoi-crlf`: dở ở Code Generation (chờ review và duyệt), bị chặn vì `aidlc.exe` không chạy được.
