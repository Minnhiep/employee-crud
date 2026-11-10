# Yêu cầu: sua-ra-soat-ban-giao (sửa danh sách rà soát trước bàn giao)

## Intent Analysis

- **Mục tiêu:** đưa bài employee-crud tới trạng thái bàn giao được: không còn lỗi đã biết, tài liệu khớp sản phẩm, giao diện đúng chuẩn trợ năng, và Hiệp tự trình bày được luồng xử lý cùng các vấn đề đã gặp trong buổi demo 15 phút (`docs/ke-hoach.md` §5) [desc].
- **Nguồn:** danh sách rà soát `aidlc/spaces/default/intents/261109-kiem-cuoi-crlf/ra-soat-ban-giao.md` (5 chuyên gia rà ngày 09/11, AI kiểm lại các mục quan trọng), nhóm A (tài liệu, 16 mục), B (backend, 9 mục), C (frontend, 13 mục), mọi mức trừ nhóm E; 4 câu trả lời của Hiệp trong `requirements-analysis-questions.md` [Q1]–[Q4].
- **Loại việc:** sửa lỗi, tài liệu và dọn code; không thêm tính năng, không đổi luật nghiệp vụ (`project.md` Mandated) [desc]. Hiện trạng nghiệp vụ và kiến trúc theo `aidlc/spaces/default/codekb/employee-crud/business-overview.md`, `architecture.md`, `code-structure.md` (quét lại toàn bộ ngày 10/11).
- **Mức độ:** nhiều tầng nhưng mỗi thay đổi nhỏ; độ sâu Minimal.
- **Nguyên tắc cho mục chỉ là suy luận** (cột "Cần chạy thử" trong danh sách rà soát): tái hiện trước khi sửa; không tái hiện được thì không sửa, ghi lại lý do [desc].

## Functional Requirements

### FR1. Danh sách kiểm tay `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md` khớp sản phẩm (A-1 đến A-4)

- **FR1.1** Mục D03 so cấu trúc bảng với `docs/so-do-database.md` (bản đúng), không còn trỏ sang sơ đồ nháp ở `04-postgresql.md` mục 9 (A-1).
  - Given D03 đã sửa, When làm đúng theo D03 trên `employee_db`, Then kết quả "khớp".
- **FR1.2** Có ca kiểm tay cho phòng ban và bộ lọc (A-2): thêm phòng ban; tên trùng khác hoa thường → "Tên phòng ban đã tồn tại" (API 409); tên rỗng và tên quá 100 ký tự; xóa phòng trống; xóa phòng còn nhân viên bị chặn, có nút xem nhân viên (API 409 "còn N nhân viên"); lọc nhân viên theo phòng; trang chi tiết phòng; `GET /api/departments/999999` → 404.
  - Given danh sách mới, When làm từng ca trên trình duyệt hoặc Postman, Then kết quả khớp câu báo và mã trạng thái ghi trong ca.
- **FR1.3** Ca F05 (tìm) có bước gõ chữ HOA khi tìm theo email (A-3).
- **FR1.4** Câu gợi ý "nếu làm tiếp" chỉ nêu việc thật sự chưa làm: phân trang, chống ghi đè khi hai người cùng sửa, xóa mềm, nhật ký thay đổi (A-4).
  - Given câu đã sửa, When đối chiếu với code, Then không câu nào nêu việc đã có (xử lý `DbUpdateException`, kiểm thử tự động).

### FR2. README hướng dẫn đúng và đủ cho người nhận bàn giao (A-5 đến A-11)

- **FR2.1** Mục yêu cầu cài đặt ghi ".NET SDK 10.0.x", và nói máy chỉ có bản lớn hơn thì cài thêm bản 10 (A-5).
- **FR2.2** Mục 11 "Sự cố thường gặp" có cách đo độ phủ khi máy bật Smart App Control: 2 lệnh Microsoft Code Coverage (thu thập `Format=cobertura`, báo cáo `reportgenerator` có `-assemblyfilters:+EmployeeCrud.Api`). Coverlet (`npm run coverage`) vẫn là cách chuẩn; `team.md` giữ nguyên (A-6, [Q4]).
  - Given máy không bật Smart App Control, When chạy `npm --prefix frontend run coverage`, Then báo cáo có các lớp service. Given hai lệnh mới, When chạy, Then báo cáo chỉ có code `EmployeeCrud.Api`.
- **FR2.3** Câu nhắc "D1–D5 trong hồ sơ kiểm thử" được thay bằng liên kết tới `07` mục 3.4; hai phép kiểm database còn thiếu ở đó (so `lower('KẾ TOÁN')`, thứ tự sắp xếp tên phòng ban) được thêm vào `07` thành D04, D05 (A-7).
- **FR2.4** README có 2 dòng nói `.claude/` và `aidlc/` là công cụ và hồ sơ AI-DLC, không cần để chạy ứng dụng (A-8).
- **FR2.5** Mục "Tài liệu khác" có liên kết tới `docs/tim-hieu-technical-stack/` (06 cài đặt, 07 kiểm thử) và tới `docs/luong-xu-ly-thuc-te.md` (FR3) (A-9).
- **FR2.6** Mục cấu hình chuỗi kết nối nói rõ chạy bằng tài khoản `postgres` chỉ để bắt đầu nhanh, khuyên làm mục tài khoản `employee_app` ngay sau migration, và ghi user-secrets không mã hóa, chỉ dùng trên máy phát triển (A-10).
- **FR2.7** Có mục ngắn "Giới hạn bảo mật": ứng dụng chỉ chạy trên `localhost`, không có đăng nhập nên không mở ra mạng; muốn đưa lên mạng cần xác thực, HTTPS, giới hạn tần suất (ghi là hướng phát triển, không làm) (A-11).
- Tiêu chí chung FR2: Given từng dòng README đã sửa, When làm theo trên máy, Then lệnh chạy được và kết quả khớp mô tả.

### FR3. Trang `docs/luong-xu-ly-thuc-te.md` cho buổi demo (A-12, [Q3])

- **FR3.1** Trang mô tả luồng "Thêm nhân viên" chỉ vào file và hàm thật: form React (`EmployeeFormPage.tsx`) → `frontend/src/api/client.ts` → `EmployeesController` → `EmployeeService` → `AppDbContext` → bảng `employees`, kèm hai nhánh lỗi 400 (dữ liệu sai) và 409 (email trùng).
  - Given trang mới, When đối chiếu từng tên file, hàm với code, Then đều có thật.
- Trang có 4 nhóm "vấn đề đã gặp" Hiệp chọn [Q3] (FR3.2 đến FR3.5), mỗi vấn đề ghi triệu chứng, nguyên nhân, cách xử lý:
- **FR3.2** Lỗi môi trường Windows: kiểu xuống dòng CRLF làm Prettier báo lỗi hàng loạt; Smart App Control chặn file `.dll` vừa build; `psql` không có trong PATH.
- **FR3.3** Dữ liệu chữ: ký tự vô hình và chữ có dấu dạng tổ hợp lách được luật "không trùng" (sửa bằng chuẩn hóa NFC, gộp khoảng trắng); email trùng khác hoa thường (chỉ mục `lower(email)`).
- **FR3.4** Chen nhau khi xóa phòng ban: khóa ngoại `RESTRICT` chặn lớp cuối, API đếm lại để báo đúng số người.
- **FR3.5** CORS: mở giao diện bằng `127.0.0.1` thay vì `localhost` thì trình duyệt chặn gọi API.
  - Tiêu chí chung FR3.2–FR3.5: Given trang mới, When đọc từng vấn đề, Then có đủ triệu chứng, nguyên nhân, cách xử lý, và cách xử lý khớp README hoặc code hiện tại.

### FR4. Danh sách API và file gọi thử khớp hành vi thật (A-13, A-14)

- **FR4.1** `docs/danh-sach-api.md` có ví dụ lỗi 400 khi JSON hỏng (khóa `body`) và 413 khi dữ liệu gửi lên quá lớn (FR6.4) (A-13).
- **FR4.2** `docs/danh-sach-api.md` ghi thứ tự kiểm khi sửa (PUT): tìm bản ghi trước (404), rồi mới kiểm dữ liệu (400), như nhau cho phòng ban và nhân viên (A-13, FR6.9).
- **FR4.3** Ví dụ sửa nhân viên trong `backend/EmployeeCrud.Api/EmployeeCrud.Api.http` không ghi đè nhân viên mẫu: dùng mã của người vừa tạo ở ví dụ thêm mới, hoặc ghi cảnh báo rõ (A-14).
  - Given database có dữ liệu mẫu (`docs/du-lieu-mau.sql`), When chạy lần lượt các ví dụ trong file `.http`, Then không nhân viên mẫu nào bị đổi.

### FR5. Tài liệu tự học và `.gitignore` (A-15, A-16)

- **FR5.1** Khung "bài thật khác ở…" đầu `00-tong-quan-luong.md`, `02-api-json.md`, `03-aspnet-core.md` thêm hai ý: bài thật có Swagger UI ở `/swagger`; mẫu `ILike` và CORS trong bản học không phải code thật (code thật tìm bằng `Contains` có thoát ký tự, CORS chỉ cho 4 phương thức và header `Content-Type`) (A-15).
- **FR5.2** `.gitignore` gốc thêm `*.log`, `.idea/`, `http-client.private.env.json`; không file nào đang theo dõi bị bỏ ra (A-16).
  - Given `.gitignore` mới, When chạy `git ls-files -ci --exclude-standard`, Then không in dòng nào.

### FR6. Backend (B-1 đến B-9)

- **FR6.1** Có test chứng minh tìm theo email không phân biệt hoa thường: nhân viên có email chữ hoa (ví dụ `Do.An@CongTy.VN`) mà họ tên không chứa chuỗi tìm, tìm "CONGTY" phải ra người đó; test "tìm không phân biệt hoa thường" theo họ tên dùng người có email không chứa chuỗi tìm (B-1, bắt buộc theo `team.md`).
  - Given bỏ `ToLower()` ở cột email trong `EmployeeService` (thử tạm, không giữ), When chạy test, Then ít nhất một test đỏ.
- **FR6.2** So trùng email và tên phòng ban hạ chữ phía .NET bằng `ToLowerInvariant()` (không phụ thuộc ngôn ngữ của máy); comment ở `EmployeeService` và `DepartmentService` nói đúng: vế giá trị được hạ chữ ở .NET rồi gửi làm tham số, vế cột chạy `lower()` trong PostgreSQL (B-2).
  - Tái hiện trước: xem câu SQL thật (ví dụ `ToQueryString()` trên provider Npgsql, không cần kết nối) để xác nhận cách dịch hiện tại.
- **FR6.3** Khi request có header `Accept` không nhận JSON (ví dụ chỉ `text/html`) và xảy ra lỗi, API vẫn trả ProblemDetails JSON đúng mã, không rơi về trang lỗi chi tiết hay body rỗng; có test (B-3).
  - Tái hiện trước bằng request thật; không tái hiện được thì không sửa.
- **FR6.4** API giới hạn kích thước body (giá trị ở Assumptions); body vượt giới hạn trả 413 ProblemDetails tiếng Việt "Dữ liệu gửi lên quá lớn"; có test (B-4).
- **FR6.5** Bỏ test trùng giữa #18 và D9 trong `DepartmentServiceTests`, test còn lại có comment đúng với dữ liệu (B-5).
- **FR6.6** Comment ở `Program.cs` về `dotnet ef` nói đúng: công cụ dựng được ứng dụng mà không mở kết nối, nhưng vẫn cần có chuỗi kết nối (B-6).
  - Tái hiện trước: chạy một lệnh `dotnet ef` khi thiếu chuỗi kết nối.
- **FR6.7** Câu báo thiếu chuỗi kết nối trong `StartupChecks` viết trung tính, không xưng hô (B-7).
- **FR6.8** Repo có `global.json` ghim SDK .NET 10 (giá trị ở Assumptions) (B-8).
  - Given máy có SDK 10.0.x, When chạy `dotnet --version` ở gốc repo, Then in một bản 10.0.x.
- **FR6.9** Sửa (PUT) phòng ban tìm bản ghi trước rồi mới kiểm tên, giống sửa nhân viên; có test hồi quy (B-9, [Q1]).
  - Given phòng ban 99999 không tồn tại, When `PUT /api/departments/99999` với tên toàn khoảng trắng hoặc quá 100 ký tự, Then 404. Given phòng ban có thật, When PUT với tên không hợp lệ, Then 400 như cũ.

### FR7. Frontend (C-1 đến C-13)

- **FR7.1** Khung tóm tắt lỗi ở đầu form nhân viên và form phòng ban chỉ hiện sau khi người dùng đã bấm Lưu; lỗi khi rời một ô chỉ hiện dưới ô đó (C-1).
  - Given form trống, When rời ô Họ tên mà chưa bấm Lưu, Then không có khung "Chưa lưu được…", ô hiện lỗi riêng. When bấm Lưu, Then khung hiện và nhận focus.
- **FR7.2** Thông báo thành công đặt một lần ở khung trang chung, có sẵn trước khi chữ được điền, để trình đọc màn hình đọc được; dữ liệu lạ trong lịch sử trình duyệt không làm trắng trang (C-2).
  - Given thêm nhân viên thành công, When trang danh sách hiện, Then vùng `role="status"` đã có từ trước và nhận chữ "Đã thêm nhân viên …".
- **FR7.3** Xóa xong mà người dùng đã rời trang (bấm Back) thì không bị kéo về trang danh sách (C-3).
- **FR7.4** Sau khi bấm "Thử lại", và sau khi xóa gặp 409 làm danh sách tải lại, focus được đưa về tiêu đề, không rơi về `body` (C-4).
- **FR7.5** Vùng báo "phòng ban đã chọn không còn tồn tại" ở trang danh sách nhân viên được trình đọc màn hình đọc (C-5). Tái hiện trước.
- **FR7.6** Xóa phòng ở trang chi tiết xong thì thay mục lịch sử, bấm Back không về trang "Không tìm thấy phòng ban" (C-6).
- **FR7.7** Tải lại trang (F5) không tự đưa focus vào tiêu đề và không hiện lại câu báo cũ về phòng ban không còn (C-7).
- **FR7.8** Hộp xác nhận xóa đồng bộ trạng thái khi bị đóng bằng Esc và không nháy chữ rỗng khi đóng (C-8). Tái hiện trước.
- **FR7.9** Nút Lưu khi đang lưu giữ focus (khóa bằng `aria-disabled` như nút Hủy) và bị khóa khi danh sách phòng ban còn đang tải (C-9).
- **FR7.10** Ô email giữ nguyên chữ người dùng gõ (không bị trình duyệt đổi tên miền có dấu sang dạng punycode) mà vẫn hiện bàn phím email trên điện thoại (C-10). Tái hiện trước.
- **FR7.11** Các trang "không tìm thấy" dùng chung một kiểu hiển thị (`StatusMessage`); 3 câu báo thiếu dấu chấm cuối được thêm dấu chấm (C-11).
- **FR7.12** Dọn code không đổi hành vi: sửa 3 comment chưa đúng (`App.tsx`, `validateEmployee.ts`, `SearchBox.tsx`), bỏ `export` thừa, dùng hằng thay các số 100 và 254 viết cứng trong câu báo và gợi ý, bỏ class CSS không có định nghĩa (C-12).
- **FR7.13** Mục gốc của đường dẫn trang (breadcrumb) là "Trang chủ", bấm được, dẫn về trang đầu (`/`) ở mọi trang (C-13, [Q2]).
  - Given trang chi tiết phòng "Nhân sự", When xem breadcrumb, Then hiện "Trang chủ › Phòng ban › Nhân sự" và "Trang chủ" là liên kết.

### FR8. Kiểm cuối trước bàn giao (Build and Test)

- **FR8.1** Migration trên database trống: tạo database thử, chạy `dotnet ef database update` (mật khẩu Hiệp gõ ẩn), kiểm đủ 2 migration và 4 phòng ban mẫu, rồi xóa database thử. Hiệp làm tay theo hướng dẫn; AI kiểm (chuyển từ FR4.6 của việc `261109-kiem-cuoi-crlf`) [desc].
- **FR8.2** Lighthouse trên bản build (`npm run build` rồi `npm run preview`), Chrome DevTools chế độ Desktop: Performance ≥ 90 ở hai trang danh sách, Accessibility = 100, Best Practices ≥ 90. Hiệp làm tay; AI ghi kết quả (chuyển từ FR4.7) [desc].
- **FR8.3** Hồi quy toàn bộ: `npm --prefix frontend run verify` mã thoát 0; API thật (đủ thao tác và mã lỗi); giao diện trên trình duyệt thật cho mọi thay đổi FR7 và các luồng thêm, sửa, xóa, tìm.

## Non-Functional Requirements

- **NFR1 (Hồi quy):** mọi test hiện có vẫn đạt, trừ test trùng bỏ ở FR6.5, cộng các test mới; `npm --prefix frontend run verify` mã thoát 0.
- **NFR2 (Độ phủ):** các lớp service giữ ít nhất 80% số dòng, đo bằng coverlet (`npm --prefix frontend run coverage`).
- **NFR3 (Không đổi hành vi API ngoài phạm vi):** ngoài FR6.3, FR6.4, FR6.9, mã trạng thái và JSON của mọi thao tác API giữ nguyên.
- **NFR4 (Dễ giải thích):** comment mới bằng tiếng Việt, nói "vì sao", không chứa mã hồ sơ nội bộ (A-, B-, C-, FR, R-…).
- **NFR5 (Bảo mật):** không thêm gói, không thêm bí mật vào Git; `npm audit --omit=dev` vẫn 0 lỗ hổng.
- **NFR6 (Trợ năng):** các thay đổi FR7 không làm giảm điểm Accessibility của Lighthouse (= 100) và dùng được bằng bàn phím.
- **NFR7 (Dữ liệu demo):** sau mọi phép kiểm, `employee_db` vẫn có đúng dữ liệu như trước (9 phòng ban, 83 nhân viên); dữ liệu thử được xóa.

## Constraints

- Bám `docs/ke-hoach.md`, không thêm tính năng; cấm đăng nhập, Docker, CI/CD, Redux (`project.md`).
- AI-DLC không tự commit hay push; Hiệp xem `git diff` rồi tự commit (`team.md`).
- Không thêm gói NuGet hay npm, không cài gì ra ngoài thư mục dự án.
- Không có test tự động cho React (`team.md`): FR7 kiểm trên trình duyệt thật (Chromium do Playwright điều khiển) cùng backend thật.
- Smart App Control đang được Hiệp tắt tạm; cần bật lại khi xong việc.

## Assumptions

- Giới hạn kích thước body ở FR6.4 là **64 KB**: request hợp lệ lớn nhất chỉ vài trăm byte, 64 KB vẫn rộng cho mọi trường hợp thật mà chặn được body lớn [assumption].
- FR6.5 giữ test #18, bỏ bản trùng D9, sửa comment của #18 cho đúng dữ liệu [assumption].
- FR6.7 viết câu báo không xưng hô (bỏ "của anh"), theo lối tài liệu kỹ thuật [assumption].
- FR6.8 dùng `"version": "10.0.100", "rollForward": "latestFeature"`: nhận mọi SDK 10.0.x từ 10.0.100, chặn bản lớn hơn bằng thông báo rõ [assumption].
- Các mục chỉ là suy luận (FR6.2 phần SQL, FR6.3, FR6.6, FR7.5, FR7.8, FR7.10) được tái hiện trước; không tái hiện được thì không sửa và ghi lại trong `code-summary.md` [desc].

## Out of Scope

- Nhóm E "em đề xuất" của danh sách rà soát (đăng nhập, ErrorBoundary, trả 503 khi database tắt, `TreatWarningsAsErrors`, lockfile NuGet, ESLint đọc kiểu, đổi tên khóa chính…) cùng các mục đã chốt từ trước: phân trang, xóa mềm, nhật ký, chống ghi đè đồng thời, collation tiếng Việt, `CHECK`.
- Nhóm D (Git và dọn dẹp): Hiệp tự làm ở cuối theo hướng dẫn: push, dời `backend/TestResults/` ra thư mục lưu trữ, bật lại Smart App Control.
- Đổi `team.md` (Q4 chọn giữ coverlet).

## Open Questions

- Không có câu hỏi chặn. FR8.1, FR8.2 cần Hiệp làm tay ở Build and Test.

## Sources

- [desc] Initial description: mô tả ban đầu của việc (`project-description.json`).
- [Q1]–[Q4] `requirements-analysis-questions.md`, Hiệp trả lời ngày 10/11.
- [assumption] Giả định do AI đặt theo cách làm chuẩn, ghi ở mục Assumptions để Hiệp duyệt ở cổng.
- Danh sách rà soát: `aidlc/spaces/default/intents/261109-kiem-cuoi-crlf/ra-soat-ban-giao.md`.
- Hiện trạng code: `aidlc/spaces/default/codekb/employee-crud/business-overview.md`, `architecture.md`, `code-structure.md` (và `code-quality-assessment.md`, `api-documentation.md`).
- Luật dự án: `aidlc/spaces/default/memory/project.md`, `team.md`.
