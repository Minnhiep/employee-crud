# Kế hoạch sửa code: sua-ra-soat-ban-giao

## Summary

- Builds: sửa danh sách rà soát bàn giao nhóm A (tài liệu), B (backend), C (frontend) theo `requirements.md` FR1–FR8; mục chỉ là suy luận thì tái hiện trước, không tái hiện được thì không sửa
- Touches: `backend/EmployeeCrud.Api` (2 service, `Program.cs`, `ProblemDetailsExceptionHandler.cs`, `StartupChecks.cs`), `backend/EmployeeCrud.Api.Tests` (2 file test service, `PipelineTests.cs`), `global.json` (mới), `frontend/src` (form, trang danh sách, `Toast`, `ConfirmDialog`, `AppLayout`, `usePageTitle`, `NotFoundPage`, `PageHeader` và các trang có breadcrumb), `README.md`, `docs/` (07, 00, 02, 03, `danh-sach-api.md`, `luong-xu-ly-thuc-te.md` mới), `EmployeeCrud.Api.http`, `.gitignore`
- Tests: khoảng 5 test xUnit mới hoặc sửa (tìm email không phân biệt hoa thường, thứ tự PUT phòng ban, header `Accept` lạ nếu tái hiện được, câu báo thiếu chuỗi kết nối, bỏ 1 test trùng), thêm 1 test giữ cấu hình giới hạn body 64 KB (Step 12), giữ toàn bộ test cũ xanh; kiểm frontend trên Chromium thật vì nhóm không viết test tự động cho React

## Bối cảnh và phạm vi

- Việc không có Unit (scope bugfix). Kế hoạch dựa vào `inception/requirements-analysis/requirements.md` và kho kiến thức code `aidlc/spaces/default/codekb/employee-crud/` (quét lại ngày 10/11).
- Không thêm tính năng, không thêm gói NuGet hay npm, không đổi luật nghiệp vụ; chỉ ba thay đổi hành vi API có chủ đích: FR6.3 (header `Accept` lạ), FR6.4 (413), FR6.9 (thứ tự PUT phòng ban) (NFR3).
- `README.md`, `.gitignore`, `docs/` là file có sẵn của Hiệp; kế hoạch sửa chúng vì FR1–FR5 gọi tên.
- Cách kiểm cho tầng HTTP (điểm R-01 của lượt rà yêu cầu): FR6.3 có test tự động qua `PlatformWebAppFactory` (host thử trong bộ nhớ, cùng kiểu với 28 test `Platform` đang có); FR6.4 là cấu hình của Kestrel, host thử không chạy Kestrel nên đường 413 thật kiểm bằng request thật tới backend đang chạy ở Build and Test (FR8.3); con số 64 KB thì có test tự động đọc cấu hình `KestrelServerOptions` từ DI của host thử (Step 12, Hiệp yêu cầu ở cổng 10/11), để ai xóa hay đổi dòng cấu hình là test đỏ.
- Mục chỉ là suy luận (FR6.2 phần SQL, FR6.3, FR6.6, FR7.5, FR7.8, FR7.10) phải tái hiện ở Step 2 trước khi sửa. Không tái hiện được thì bỏ bước sửa tương ứng và ghi lý do trong `code-summary.md`.
- Smart App Control đang được Hiệp tắt tạm, nên `dotnet test`, `dotnet run` chạy được. Nếu bị chặn lại: theo luật dự án, thêm comment có ích tối đa 2 lần rồi dừng báo Hiệp.

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "team",
  "ordering": "Với mỗi Unit, viết code tầng service trước, sau đó viết và chạy ngay unit test cho service đó; controller, migration và giao diện React được kiểm thủ công bằng Postman, pgAdmin và trình duyệt sau khi code xong.",
  "scope": "bugfix",
  "test_strategy": "minimal",
  "project_type": "brownfield",
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
    "strategy": "minimal",
    "strategy_volume": [
      "One verifiable test per requirement at the narrowest effective level.",
      "At least one happy-path unit test per component.",
      "Unit tests are the default; a bugfix/security scope floor may require an integration or E2E regression when that is the narrowest level that reproduces the defect."
    ],
    "scope_floor": [
      "Include a targeted regression for the bug or vulnerability.",
      "Keep the existing test suite green."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Verify the existing test runner/configuration and record the exact unit-scoped command.",
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
      "Verify the existing test runner/configuration and record the exact unit-scoped command.",
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
  "input_sha256": "sha256:8bcb319442295944c09e27fabb54b1c43590577c243e4b638f4811979e3d4282",
  "contract_sha256": "sha256:580009a37d7174fd2af9c6638c5e5744b693051fb8b4413a537629712ff03450"
}
```

Áp dụng: phương pháp test-after. Tầng database và data access không đổi (không migration, không đổi model). Thứ tự: kiểm bộ chạy test (Step 1) → tái hiện các mục suy luận (Step 2) → nghiệp vụ, rồi viết và chạy test của tầng đó (Step 3–4) → API/endpoint, rồi test (Step 5) → cấu hình môi trường (Step 6) → giao diện, rồi kiểm trên trình duyệt thật vì nhóm không viết test tự động cho React (Step 7–8) → tài liệu và truy vết (Step 9–11) → sửa theo yêu cầu của Hiệp ở cổng, rồi chạy lại test và kiểm trên trình duyệt (Step 12).

## Các bước

- [x] **Step 1. Đường cơ sở và bộ chạy test** — NFR1, NFR2
  - Ghi vào `code-summary.md`: `git status --short`, kết quả `npm --prefix frontend run verify` (kỳ vọng 148/148) và số test theo lớp.
  - Xác nhận lệnh trong `unit-test-instructions.md` chạy được (có `--filter` cho từng lớp test).

- [x] **Step 2. Tái hiện các mục suy luận (trước khi sửa)** — FR6.2, FR6.3, FR6.6, FR7.5, FR7.7, FR7.8, FR7.10
  - FR6.2: chạy backend với biến môi trường `Logging__LogLevel__Microsoft.EntityFrameworkCore.Database.Command=Information` (chỉ cho lần chạy này, không sửa `appsettings`), gửi một `POST /api/employees` email trùng khác hoa thường; ghi câu SQL thật (vế email là tham số đã hạ chữ ở .NET hay `lower(@p)`).
  - FR6.3: gửi `GET /api/employees/999999` kèm header `Accept: text/html` tới backend đang chạy; ghi mã trạng thái, `Content-Type` và body.
  - FR6.6: chạy `dotnet ef migrations list --project backend/EmployeeCrud.Api` với biến môi trường `ConnectionStrings__Default` để trống; ghi thông báo.
  - FR7.5, FR7.7, FR7.8, FR7.10 trên Chromium thật (Playwright, frontend `npm run dev` + backend): vùng báo "phòng ban đã chọn không còn" có trong cây trợ năng trước khi có chữ không; F5 ở trang danh sách có đưa focus vào tiêu đề và hiện lại câu báo cũ không; Esc khi hộp xác nhận đang xóa; gõ `a@bücher.vn` vào ô email rồi đọc giá trị gửi lên.
  - Ghi từng kết quả vào `code-summary.md`. Mục nào không tái hiện được thì không sửa và ghi lý do.

- [x] **Step 3. Nghiệp vụ backend** — FR6.2, FR6.9
  - `DepartmentService.UpdateAsync`: tìm bản ghi trước (`FindTrackedAsync`), rồi mới chuẩn hóa và kiểm tên, giống `EmployeeService.UpdateAsync`; comment nói vì sao (404 trước 400, hai API cùng loại xử lý như nhau).
  - `EmployeeService` và `DepartmentService`: vế giá trị khi so trùng dùng `ToLowerInvariant()`; sửa comment cho đúng kết quả Step 2 (vế giá trị hạ chữ ở .NET rồi gửi làm tham số, vế cột chạy `lower()` trong PostgreSQL; chỉ mục `lower(...)` vẫn là lớp chặn cuối).

- [x] **Step 4. Test nghiệp vụ (viết và chạy sau Step 3)** — FR6.1, FR6.5, FR6.9, NFR1
  - `EmployeeServiceTests`: thêm test tìm "CONGTY" ra người có email chữ hoa (ví dụ `Do.An@CongTy.VN`) mà họ tên không chứa chuỗi tìm; sửa `Search_IsCaseInsensitive` cho dùng người có email không chứa chuỗi tìm, để test thật sự kiểm cột họ tên. Thử tạm bỏ `ToLower()` ở cột email: phải có test đỏ (rồi trả lại code, ghi kết quả vào `code-summary.md`).
  - `DepartmentServiceTests`: thêm test PUT phòng ban không tồn tại với tên không hợp lệ (toàn khoảng trắng; quá 100 ký tự) ra lỗi "không tìm thấy" (404); test phòng có thật với tên không hợp lệ vẫn ra lỗi kiểm dữ liệu (400). Bỏ test trùng D9 (dòng ~414–425), giữ #18 (dòng ~261–274) và sửa comment của #18 cho đúng dữ liệu.
  - Chạy: lệnh "Lớp service" trong `unit-test-instructions.md`.

- [x] **Step 5. Tầng API và cấu hình chạy** — FR6.3, FR6.4, FR6.6, FR6.7
  - FR6.3 (chỉ khi Step 2 tái hiện được): `ProblemDetailsExceptionHandler.TryHandleAsync` khi `TryWriteAsync` trả `false` thì tự ghi ProblemDetails bằng `WriteAsJsonAsync(..., "application/problem+json")` như `StatusCodeProblemWriter`, rồi trả `true`; thêm test vào `PipelineTests` gửi `Accept: text/html` và kiểm mã đúng, `Content-Type` `application/problem+json`, có `title` tiếng Việt.
  - FR6.4: trong `Program.cs`, cùng chỗ `ConfigureKestrel` (đang đặt `AddServerHeader = false`), đặt `Limits.MaxRequestBodySize = 64 * 1024` kèm comment vì sao 64 KB. Kiểm bằng request thật ở Build and Test (body > 64 KB → 413 "Dữ liệu gửi lên quá lớn"; body nhỏ vẫn chạy như cũ).
  - FR6.6: sửa comment `Program.cs` (dòng ~33–34) theo kết quả Step 2: `dotnet ef` dựng được ứng dụng mà không mở kết nối, nhưng vẫn cần có chuỗi kết nối.
  - FR6.7: `StartupChecks.MissingConnectionStringMessage` bỏ "của anh", viết trung tính; test đang so câu này dùng hằng nên vẫn đúng.
  - Chạy: lệnh "Lớp Platform" rồi lệnh "Toàn bộ" trong `unit-test-instructions.md`; `dotnet format backend/EmployeeCrud.slnx --verify-no-changes`.

- [x] **Step 6. Cấu hình môi trường** — FR6.8, FR5.2
  - Tạo `global.json` ở gốc repo: `{"sdk": {"version": "10.0.100", "rollForward": "latestFeature"}}`. Kiểm `dotnet --version` ở gốc repo in bản 10.0.x.
  - `.gitignore` gốc thêm `*.log`, `.idea/`, `http-client.private.env.json`. Kiểm `git ls-files -ci --exclude-standard` không in dòng nào.

- [x] **Step 7. Giao diện** — FR7.1 đến FR7.13
  - FR7.1: `EmployeeFormPage.tsx`, `DepartmentFormPage.tsx` thêm cờ "đã bấm Lưu"; `ErrorSummary` chỉ vẽ khi cờ bật (đặt trong `handleSubmit` và `showSaveError`); lỗi khi rời ô chỉ hiện dưới ô.
  - FR7.2: đặt `<Toast />` một lần trong `AppLayout.tsx` (trước `<Outlet />`), bỏ ở `EmployeesPage.tsx`, `DepartmentsPage.tsx`, `DepartmentDetailPage.tsx`; `Toast.tsx` chỉ nhận `message` khi `typeof message === "string"`; sửa comment cách dùng cho khớp.
  - FR7.3: `EmployeesPage.tsx` (dòng ~277), `useDepartmentDelete.tsx`, `DepartmentDetailPage.tsx` (dòng ~123): xóa xong mà người dùng đã rời trang thì không `navigate` (cùng mẫu ref như `hasLeftFormRef` của form).
  - FR7.4: sau "Thử lại" (`EmployeesPage`, `DepartmentsPage`, `DepartmentDetailPage`, hai form) và sau xóa gặp 409 rồi tải lại (`DepartmentsPage.tsx` dòng ~117–130) thì đưa focus về tiêu đề (dùng cơ chế `headingFocusRequest` đang có).
  - FR7.5 (chỉ khi Step 2 tái hiện được): `EmployeesPage.tsx` (dòng ~358–374) vùng `role="status"` không mang class `.alert`; `.alert` đặt ở phần tử con.
  - FR7.6: `DepartmentDetailPage.tsx` xóa xong `navigate("/departments", { replace: true, state })`.
  - FR7.7: `usePageTitle.ts` nhận biết lần tải đầu (kể cả F5) bằng biến cấp module, không dựa vào `location.key`; `EmployeesPage.tsx` đọc cờ `staleDepartment` xong thì xóa bằng một lần `replace`.
  - FR7.8 (chỉ khi Step 2 tái hiện được): `ConfirmDialog.tsx` thêm xử lý sự kiện `close` để đồng bộ state (đang bận thì mở lại), đóng hộp bằng `useLayoutEffect`.
  - FR7.9: nút Lưu ở hai form khóa bằng `aria-disabled` như nút Hủy (giữ focus); form nhân viên khóa Lưu khi danh sách phòng ban còn đang tải.
  - FR7.10 (chỉ khi Step 2 tái hiện được): ô email `type="text"` kèm `inputMode="email"`, `autoCapitalize="none"`, `spellCheck={false}`, `autoComplete="email"`; kiểm dạng email vẫn do `validateEmployee.ts` và API (điểm R-03 của lượt rà yêu cầu). Step 12 đổi `autoComplete` về `off` (Hiệp chọn ở cổng 10/11).
  - FR7.11: `NotFoundPage.tsx` dùng `StatusMessage` thay vì chép tay markup; trang chi tiết phòng ban không tìm thấy dùng cùng kiểu với hai form; thêm dấu chấm cuối các câu: `api/client.ts` (dòng ~17, "…vui lòng thử lại"), `EmployeeFormPage.tsx` (dòng ~292), `DepartmentFormPage.tsx` (dòng ~164) ("…có thể đã bị xóa").
  - FR7.12 (danh mục kiểm, điểm R-04): sửa comment `App.tsx` (dòng ~54), `validateEmployee.ts` (dòng ~30), `SearchBox.tsx` (dòng ~15); bỏ `export` thừa của `FULL_NAME_MAX_LENGTH`, `EMAIL_MAX_LENGTH` (`validateEmployee.ts` dòng ~5–6), `DEPARTMENT_NAME_MAX_LENGTH`, `ToastLocationState` nếu chỉ dùng trong file; dùng hằng thay số 100 và 254 viết cứng ở `validateEmployee.ts` (dòng ~42, ~51), `validateDepartment.ts` (dòng ~22), `EmployeeFormPage.tsx` (dòng ~450), `DepartmentFormPage.tsx` (dòng ~299); bỏ class `app__content` không có CSS (`AppLayout.tsx` dòng ~26); thống nhất cỡ biểu tượng thương hiệu giữa `Icon.tsx` (dòng ~104) và `components.css` (dòng ~66).
  - FR7.13: mục gốc breadcrumb ở mọi trang (`EmployeesPage`, `DepartmentsPage`, `DepartmentDetailPage`, `EmployeeFormPage`, `DepartmentFormPage`, `NotFoundPage`) thành `{ label: "Trang chủ", to: "/" }`; sửa ví dụ trong comment của `PageHeader.tsx`.
  - Chạy: `npm --prefix frontend run typecheck`, `lint`, `format:check`, `build`.

- [x] **Step 8. Kiểm giao diện trên Chromium thật (sau Step 7)** — FR7.1 đến FR7.13, NFR6, NFR7
  - Backend `dotnet run` + frontend `npm run dev`; Playwright điều khiển Chromium; script để trong `backend/TestResults/` (Git bỏ qua). Mỗi FR7.x có ít nhất một phép kiểm theo tiêu chí trong `requirements.md`; kiểm thêm luồng thêm, sửa, xóa, tìm như cũ và không có lỗi JavaScript trên console. Dữ liệu thử dùng đuôi `@kiem-thu.example` và xóa sạch; `employee_db` giữ 9 phòng ban, 83 nhân viên.

- [x] **Step 9. Tài liệu** — FR1, FR2, FR3, FR4, FR5.1
  - `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md`: D03 trỏ `../so-do-database.md`; thêm ca phòng ban và bộ lọc (FR1.2); F05 thêm bước chữ HOA; thêm D04, D05 (so `lower('KẾ TOÁN')`, thứ tự tên phòng ban); câu "nếu làm tiếp" chỉ nêu việc chưa làm.
  - `README.md`: .NET SDK 10.0.x; mục 11 thêm 2 lệnh Microsoft Code Coverage; thay câu "D1–D5" bằng liên kết `07` mục 3.4; 2 dòng về `.claude/`, `aidlc/`; mục tài liệu khác thêm liên kết; mục chuỗi kết nối khuyên `employee_app` và ghi user-secrets không mã hóa; mục "Giới hạn bảo mật".
  - `docs/luong-xu-ly-thuc-te.md` (mới): luồng "Thêm nhân viên" chỉ vào file và hàm thật, nhánh 400 và 409; 4 nhóm vấn đề đã gặp (FR3.2–FR3.5), mỗi vấn đề ghi triệu chứng, nguyên nhân, cách xử lý.
  - `docs/danh-sach-api.md`: ví dụ 400 JSON hỏng (khóa `body`), 413; thứ tự kiểm khi PUT. `EmployeeCrud.Api.http`: ví dụ sửa nhân viên dùng mã của người vừa tạo (biến) hoặc cảnh báo rõ, không ghi đè nhân viên mẫu.
  - Khung "bài thật khác ở…" của `00`, `02`, `03`: thêm ý Swagger UI và mẫu `ILike`/CORS.
  - Kiểm: mọi liên kết tương đối mở được; tên file, hàm nhắc trong tài liệu có thật.

- [x] **Step 10. Chạy lại kiểm tổng** — NFR1, NFR2, NFR5
  - `npm --prefix frontend run verify` mã thoát 0; `npm --prefix frontend run coverage` (lớp service ≥ 80%); `npm --prefix frontend audit --omit=dev` 0 lỗ hổng.

- [x] **Step 11. Viết `code-summary.md` và `traceability.json`** — mọi FR, NFR trên
  - `traceability.json` tạo bằng `aidlc engine sensor-traceability --stage code-generation --output-path <file của stage> --write-upstream` rồi điền trạng thái, file đích; FR8 (kiểm cuối) ghi `Deferred` sang Build and Test.

- [x] **Step 12. Sửa theo yêu cầu của Hiệp ở cổng Code Generation (10/11)** — FR6.4, FR6.9, FR7.3, FR7.7, FR7.10, NFR1, NFR6, NFR7
  - Nguồn: bốn điểm R-01 đến R-04 trong `reviews/review-01.md` và ca còn sót của FR7.3. Hiệp yêu cầu xử lý hết trong một lần, không để lại việc chờ quyết.
  - **R-01 (FR7.7) câu báo "phòng ban không còn" ẩn khi người dùng điều hướng**, `EmployeesPage.tsx`: câu báo gắn với đúng một lần điều hướng, nhận biết bằng `location.key` (mỗi lần điều hướng có khóa mới, kể cả khi địa chỉ giống hệt), thay cho việc so chuỗi truy vấn trong `staleNoticeSearch`. Ghi khóa của địa chỉ ngay sau lần trang tự bỏ `departmentId`; khóa hiện tại khác khóa đã ghi thì ẩn và xóa ghi nhớ, nên quay lại cũng không hiện lại. Comment nói vì sao dùng `location.key`. Tiêu chí:
    - (a) mở `/employees?departmentId=<mã không có>`: câu báo hiện, địa chỉ mất tham số, chỉ thay mục lịch sử chứ không thêm;
    - (b) đang thấy câu báo, bấm lại mục "Nhân viên" trên menu (cùng địa chỉ): câu báo ẩn;
    - (c) đổi bộ lọc hoặc tìm: câu báo ẩn; bấm Back về địa chỉ cũ: không hiện lại;
    - (d) F5: không hiện lại;
    - (e) bấm Tìm lại đúng chuỗi cũ (trang chỉ tải lại, không điều hướng): câu báo vẫn giữ.
  - **R-02 (FR7.10) ô email về `autoComplete="off"`**, `EmployeeFormPage.tsx`: giữ `type="text"`, `inputMode="email"`, `autoCapitalize="none"`, `spellCheck={false}`. Comment: form này nhập email của nhân viên khác, trình duyệt gợi ý email của chính người đang dùng máy là sai mục đích.
  - **FR7.3 ca còn sót: Back trong cùng trang lúc đang xóa**, `EmployeesPage.tsx` `confirmDelete` và cùng mẫu ở `DepartmentsPage.tsx` `onDeleted`. Lỗi: hàm xóa giữ địa chỉ của lúc bấm Xóa, nên nếu trong lúc chờ API người dùng bấm Back về chuỗi tìm khác (vẫn trang danh sách, trang không bị gỡ), xóa xong `navigate` thay địa chỉ về chuỗi tìm cũ. Sửa: giữ địa chỉ **mới nhất** trong một ref, cập nhật trong effect sau mỗi lần vẽ, và `navigate` mang lời báo theo ref đó. Tiêu chí: xóa xong, địa chỉ giữ đúng chỗ người dùng đã về; danh sách tải lại theo bộ lọc đang hiện; lời báo "Đã xóa…" vẫn hiện; rời hẳn trang thì vẫn không bị kéo về (giữ `hasLeftPageRef` như cũ).
  - **R-04 (FR6.4) test giữ giới hạn body 64 KB**, `PipelineTests.cs`: thêm test lấy `IOptions<KestrelServerOptions>` từ `factory.Services` của `PlatformWebAppFactory`, kiểm `Limits.MaxRequestBodySize` bằng `64 * 1024`. Viết số thẳng trong test, không dùng lại hằng của code, để đổi số ở `Program.cs` là test đỏ. Phép thử gây lỗi: tạm đổi 64 thành 128 ở `Program.cs`, thấy test đỏ, trả lại, ghi kết quả vào `code-summary.md`. Việc đổi lỗi 413 thành ProblemDetails "Dữ liệu gửi lên quá lớn" đã có test ở `ErrorMapperTests`; request thật 70 KB ra 413 vẫn kiểm ở Build and Test.
  - **R-03 (FR6.9) không đổi code, ghi rõ kỳ vọng thật**: qua API thật, `PUT /api/departments/99999` với tên toàn khoảng trắng ra **400** (vì `[Required]` chạy trước controller); với tên 101 ký tự ra **404**; phòng có thật với tên sai ra 400. Tiêu chí gốc của FR6.9 ghi 404 cho cả hai ca, lệch ở ca khoảng trắng; `docs/danh-sach-api.md` mục "Thứ tự kiểm khi sửa (PUT)" đã ghi đúng hành vi thật. Ghi kỳ vọng này vào `unit-test-instructions.md` và `code-summary.md` để Build and Test kiểm đúng.
  - Chạy: lệnh "Lớp Platform", rồi "Toàn bộ" trong `unit-test-instructions.md` (kỳ vọng 153/153 = 152 + 1); `dotnet format backend/EmployeeCrud.slnx --verify-no-changes`; `npm --prefix frontend run verify` mã thoát 0.
  - Kiểm trên Chromium thật (backend `dotnet run` + frontend `npm run dev`, Playwright; script để trong `backend/TestResults/`): đủ (a)–(e) của R-01; ô email có `autocomplete="off"`; FR7.3 ca còn sót (làm chậm request DELETE bằng `page.route`, trong lúc chờ bấm Back trong cùng trang, kiểm địa chỉ, danh sách và lời báo); chạy lại 16 phép kiểm giao diện cũ (`backend/TestResults/kiem-b-t-261109/ui-check.js`); không lỗi JavaScript trên console. Dữ liệu thử đuôi `@kiem-thu.example`, xóa sạch; `employee_db` giữ 9 phòng ban, 83 nhân viên.
  - Cập nhật `code-summary.md` (thêm mục Step 12; các "điểm cần Hiệp xem" R-01 đến R-04 ghi đã xử lý thế nào) và `traceability.json` (FR6.4 thêm test, FR7.3, FR7.7, FR7.10 thêm file đã sửa); chạy lại `aidlc engine sensor-traceability` cho đạt.

## Truy vết bước → yêu cầu

| Yêu cầu | Bước |
|---|---|
| FR1.1–FR1.4 danh sách kiểm tay | Step 9 |
| FR2.1–FR2.7 README | Step 9 |
| FR3.1–FR3.5 trang luồng xử lý | Step 9 |
| FR4.1–FR4.3 danh sách API, `.http` | Step 9 |
| FR5.1 tài liệu tự học | Step 9 |
| FR5.2 `.gitignore` | Step 6 |
| FR6.1, FR6.5 test | Step 4 |
| FR6.2 `ToLowerInvariant` | Step 2, Step 3, Step 4 |
| FR6.3 header `Accept` lạ | Step 2, Step 5 |
| FR6.4 giới hạn body | Step 5, Step 12 (test cấu hình; kiểm 413 thật ở Build and Test) |
| FR6.6, FR6.7 comment, câu báo | Step 2, Step 5 |
| FR6.8 `global.json` | Step 6 |
| FR6.9 thứ tự PUT phòng ban | Step 3, Step 4, Step 12 (ghi kỳ vọng thật 400/404) |
| FR7.1–FR7.13 giao diện | Step 2, Step 7, Step 8 |
| FR7.3, FR7.7, FR7.10 sửa thêm ở cổng | Step 12 |
| FR8.1–FR8.3 kiểm cuối | Build and Test |
| NFR1, NFR2, NFR5 | Step 1, Step 4, Step 5, Step 10, Step 12 |
| NFR3 | Step 5 (chỉ ba thay đổi có chủ đích) |
| NFR4 | Mọi bước có comment |
| NFR6, NFR7 | Step 8, Step 12 |
