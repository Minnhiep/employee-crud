# Code Quality Assessment: employee-crud

Đánh giá từ việc đọc code ngày 09–10/11/2026; lần quét không build, không chạy test hay lint, nên mọi con số "đạt/không đạt" của công cụ dưới đây là trích từ tài liệu, có ghi nguồn.

## Kiểm thử

| Mục | Hiện trạng |
|---|---|
| Test tự động | 119 phương thức, 148 ca (đếm trong mã): phòng ban 45, nhân viên 75, phần nền 28. Chi tiết từng lớp test ở `component-inventory.md` (EmployeeCrud.Api.Tests) |
| Phạm vi | Đúng quy ước `team.md`: unit test cho hai service (luật nghiệp vụ, chuẩn hóa chữ, nhánh lỗi chen nhau giả lập bằng `AppDbContext` giả) + test phần nền qua `WebApplicationFactory` (ProblemDetails, CORS trên lỗi, 405/415, header bảo mật, Host lạ, log một dòng Error, request bị hủy). Không test controller riêng, không test React, không E2E |
| Chất lượng test | Mỗi test một database InMemory riêng; dữ liệu và câu khẳng định cụ thể (so đúng câu tiếng Việt); không thấy test luôn đạt; có test chứng minh không truy vấn database (dùng context đã dispose) |
| Giới hạn đã ghi trong code | InMemory không có chỉ mục `lower(...)`, khóa ngoại, thứ tự sắp tiếng Việt (`TestSupport/TestDb.cs`); các luật đó kiểm tay trên PostgreSQL thật |
| Độ phủ | Có `coverlet.collector` và `npm run coverage`; không có ngưỡng tự động. README mục 10 nói lần đo trước được 100% dòng cho `DepartmentService`, `EmployeeService` (lần quét này không đo lại). Theo `CLAUDE.md` của dự án, coverlet đang bị Smart App Control chặn trên máy làm bài |

## Lint, định dạng, CI

| Mục | Hiện trạng |
|---|---|
| TypeScript | `tsc` strict + `noUncheckedIndexedAccess`; chạy trong `npm run build` và `typecheck` |
| ESLint | flat config theo mẫu Vite (js, typescript-eslint recommended, react-hooks, react-refresh), `--max-warnings 0`; không có `eslint-disable` trong mã |
| Prettier | cấu hình mặc định; `format:check` trong `verify` |
| C# | `.editorconfig` + `dotnet format --verify-no-changes` trong `verify`; không bật `TreatWarningsAsErrors`/`EnforceCodeStyleInBuild` |
| CI/CD | Không có (cố ý, `project.md` cấm). Thay bằng `npm run verify` chạy tay trước commit |
| Xuống dòng | `.gitattributes` `* text=auto eol=lf` + `.editorconfig` `end_of_line = lf` |
| Kết quả gần nhất | Theo `aidlc/spaces/default/intents/261109-kiem-cuoi-crlf/ra-soat-ban-giao.md` mục 2 (09/11): typecheck, lint, format:check, build, `dotnet format` đạt; `dotnet test` không chạy được vì `.dll` bị chặn; lần chạy được gần nhất 148/148 (05/11) |

## Tài liệu

`README.md` đầy đủ các bước cài và chạy, giải thích "vì sao" (user-secrets nhập an toàn, tài khoản DB quyền tối thiểu, log). `docs/danh-sach-api.md` có JSON gọi thật cho mọi mã lỗi chính; `docs/so-do-database.md` có sơ đồ mermaid kèm bản chữ và cách tự thử ràng buộc. Trong code: XML doc ở lớp và hàm public, comment tiếng Việt giải thích lý do ở các chỗ không hiển nhiên. Lệch giữa tài liệu và code: CQ-14 đến CQ-17.

## Đánh giá nhanh

| Tiêu chí | Mức | Căn cứ |
|---|---|---|
| Đặt tên | Tốt | Tên tiếng Anh rõ nghĩa, theo quy ước .NET và TS; câu báo là hằng có tên |
| Kích thước hàm/file | Khá | Hàm backend ngắn; vài file lớn: `EmployeeFormPage.tsx` 612 dòng, `EmployeesPage.tsx` 566, `components.css` 1001, `EmployeeServiceTests.cs` 783 |
| Xử lý lỗi | Tốt | Lỗi nghiệp vụ có loại, ánh xạ một chỗ, 500 không lộ chi tiết, log kèm `traceId`; frontend phân loại lỗi mạng/máy chủ/client/hủy |
| Có test cho đường quan trọng | Tốt (backend) | Mọi luật service và nhánh chen nhau có test; thiếu một ca bắt buộc (CQ-1) |
| Trùng lặp | Khá | Khuôn trang (LoadResult, reloadKey, headingFocusRequest, khung `alert`) lặp ở 3 trang; câu báo chép giữa backend, frontend, tài liệu (có chủ ý để hai đầu nói cùng một câu) |
| Code thừa | Tốt | Không có code bị comment bỏ; vài dấu vết nhỏ (CQ-18) |

## Technical debt

Mỗi mục: mã, mức (theo `ra-soat-ban-giao.md` khi có), vị trí, mô tả. "Đã đọc" = lần quét này tự thấy trong code; "suy luận" = cần chạy thử để xác nhận.

| Mã | Mức | Vị trí | Mô tả |
|---|---|---|---|
| CQ-1 | Trung bình, bắt buộc theo `team.md` | `EmployeeServiceTests.cs:103-121`; `EmployeeService.cs:86-88` | Không ca nào chứng minh tìm theo **email** không phân biệt hoa thường: ca "MINH" khớp cả họ tên lẫn email, ca tìm email dùng chữ thường trên email chữ thường. Bỏ `ToLower()` ở cột email thì test vẫn đạt. Đã đọc |
| CQ-2 | Thấp | `EmployeeService.cs:248-255`; `DepartmentService.cs:138-146` | Vế tham số dùng `ToLower()` (phụ thuộc văn hóa của máy), chỗ tìm kiếm dùng `ToLowerInvariant()`; comment nói cả hai vế thành `lower()` trong SQL, trong khi EF thường tính trước biểu thức không dính cột. Đã đọc code; SQL thật là suy luận |
| CQ-3 | Thấp | `ProblemDetailsExceptionHandler.cs:48-53` | Trả thẳng kết quả `TryWriteAsync`; khi dịch vụ ProblemDetails không ghi (request không nhận JSON) thì không có đường ghi dự phòng như `StatusCodeProblemWriter`. Suy luận |
| CQ-4 | Thấp | `Program.cs:14` | Không đặt `MaxRequestBodySize`; dùng mặc định Kestrel (khoảng 30 MB). `ErrorMapper` đã có câu cho 413 nhưng chưa có test 413 qua pipeline. Đã đọc |
| CQ-5 | Thông tin | `DepartmentService.cs:53-59` vs `EmployeeService.cs:129-136` | PUT phòng ban kiểm tên trước rồi tìm bản ghi (400 trước 404); PUT nhân viên tìm trước (404 trước 400). Đã đọc |
| CQ-6 | Thấp | `DepartmentServiceTests.cs:261-274` (#18) và `:414-425` (D9) | Hai test giống hệt dữ liệu, lỗi giả và khẳng định; comment #18 nói "Còn nhân viên" nhưng không nạp ai. Đã đọc |
| CQ-7 | Thấp | gốc repo; `README.md:18` | Không có `global.json`; README ghi ".NET SDK 10.0 trở lên" dù app cần runtime 10 (`net10.0`). Đã đọc |
| CQ-8 | Trung bình | `EmployeeFormPage.tsx:274-283, 437-442`; `DepartmentFormPage.tsx:146-155, 286-291`; `ErrorSummary.tsx:28-41` | Rời một ô sai là `ErrorSummary` (role="alert", tiêu đề "Chưa lưu được…") hiện ngay dù chưa bấm Lưu. Đã đọc |
| CQ-9 | Trung bình | `Toast.tsx:35-36, 72-75`; `DepartmentsPage.tsx:153`, `DepartmentDetailPage.tsx:192`, `EmployeesPage.tsx:346` | Mỗi trang tự đặt `<Toast />`, nên vùng `role="status"` được tạo cùng lúc với lời báo (trình đọc màn hình có thể không đọc); `location.state` được ép kiểu, không kiểm `message` là chuỗi. Đã đọc |
| CQ-10 | Thấp | `EmployeesPage.tsx:359-374`; `components.css:699-701` | Vùng `role="status"` báo "phòng ban đã chọn không còn" luôn có trong trang nhưng mang class `.alert`, mà `.alert:empty { display: none }`. Ảnh hưởng tới trình đọc màn hình là suy luận |
| CQ-11 | Thấp | `DepartmentDetailPage.tsx:121-126`; `useDepartmentDelete.tsx:33-48` | Xóa phòng ở trang chi tiết xong `navigate` không `replace` (Back về trang "không tìm thấy"); xóa không kiểm người dùng đã rời trang (form có `hasLeftFormRef`, xóa thì không). Đã đọc |
| CQ-12 | Thấp | `EmployeeFormPage.tsx:597-601`; `DepartmentFormPage.tsx:337-341` | Nút Lưu dùng `disabled` (mất focus) trong khi nút Hủy dùng `aria-disabled`; form thêm nhân viên không khóa Lưu khi phòng ban đang tải lần đầu (bấm Lưu ra "Vui lòng chọn phòng ban"). Đã đọc |
| CQ-13 | Thấp | `EmployeeFormPage.tsx:478-491` | Ô email `type="email"`: trình duyệt có thể đổi tên miền có dấu sang punycode. Suy luận |
| CQ-14 | Trung bình | `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md:92, 138`, mục 3.1–3.4 | D03 trỏ sơ đồ nháp `04-postgresql.md` mục 9 (có `created_at`, `04-postgresql.md:179`) thay vì `docs/so-do-database.md`; câu gợi ý "làm tiếp: xử lý `DbUpdateException`, kiểm thử tự động" là việc đã làm; chưa có ca kiểm tay cho thêm/xóa phòng ban, tên trùng 409, lọc theo phòng, F05 chưa thử chữ HOA. `00`–`05` là bản nháp học có banner "bài thật khác ở…". Đã đọc |
| CQ-15 | Thấp | `backend/EmployeeCrud.Api/EmployeeCrud.Api.http:65-73` | Khối #9 `PUT /api/employees/1` ghi đè nhân viên mã 1 đang có trong database demo. Đã đọc |
| CQ-16 | Thấp | `README.md:18, 167`, mục 3, mục 10 | "D1–D5 trong hồ sơ kiểm thử" không có đường dẫn và trùng tên với D01–D03 của `07`; README chưa nói `.claude/`, `aidlc/` là hồ sơ AI-DLC; mục 3 dùng tài khoản `postgres` trước, mục 13 mới khuyên tài khoản riêng; chưa có mục giới hạn bảo mật (chỉ localhost, không đăng nhập); chưa có cách đo độ phủ khi coverlet bị chặn. Đã đọc |
| CQ-17 | Thông tin | `.gitignore:29-48` | Phần của dự án chưa có `*.log`, `.idea/`, `http-client.private.env.json` (`frontend/.gitignore` đã có `*.log`, `.idea`). Đã đọc |
| CQ-18 | Thông tin | `StartupChecks.cs:15`; `AppLayout.tsx:26`; breadcrumb ở mọi trang; `EmployeeService.cs:28,31`, `DepartmentService.cs:18`, `validateEmployee.ts:42,51`, `validateDepartment.ts:22`; `NotFoundPage.tsx:21-35` | Câu hướng dẫn xưng "anh"; class `app__content` không có CSS; mục gốc breadcrumb "Nhân sự" không bấm được (trang chi tiết phòng "Nhân sự" thành "Nhân sự › Phòng ban › Nhân sự"); số 100/254 viết cứng trong câu báo dù đã có hằng; `NotFoundPage` tự dựng khung trạng thái thay vì dùng `StatusMessage`. Đã đọc |
| CQ-19 | Thông tin | `.editorconfig:249-251, 265-267, 323` | Luật đặt tên field private static (`s_`) và private static readonly (PascalCase) chồng nhau; `type_parameters.applicable_kinds = namespace` (lỗi của mẫu sinh). Đều mức `suggestion`. Đã đọc |
| CQ-20 | Thông tin | `EmployeeCrud.Api.Tests.csproj` | Theo `ra-soat-ban-giao.md` mục 2, ba gói test có bản lớn mới hơn, không có lỗ hổng; lần quét này không kiểm (không chạy lệnh) |
| CQ-21 | Thông tin | `frontend/src/components/*`, `pages/*` | Một số `export` không được file khác dùng và comment chưa khớp code (theo `ra-soat-ban-giao.md` C-12: `App.tsx:54`, `validateEmployee.ts:30`, `SearchBox.tsx:15`); lần quét này chưa đối chiếu từng chỗ |

Không có `TODO`/`FIXME`/`HACK`, `@ts-ignore`, `as any` trong mã nguồn; `#pragma warning disable 612, 618` chỉ có trong 3 file migration do EF sinh. Không thấy bí mật cứng trong repo (chuỗi kết nối mẫu trong test và `StartupChecks` không có mật khẩu). URL `http://localhost:5081` và `http://localhost:5173` viết cứng làm giá trị mặc định có chủ ý (`client.ts:13`, `CorsSetup.cs:16`).
