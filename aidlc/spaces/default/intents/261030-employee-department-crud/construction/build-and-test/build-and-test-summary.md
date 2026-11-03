# Tóm tắt Build and Test: employee-crud

> **Nguồn:** `code-generation-plan.md` (Testing Contract), `unit-test-instructions.md`, `code-summary.md` của U1–U5; `nfr-requirements/` và `nfr-design/` của từng Unit; hợp đồng C3; `team.md` (Testing Posture, Deployment); `docs/ke-hoach.md` mục 5 (Hiệp chọn gộp vào bước này). Kết quả chạy: `test-results.md`.

## 1. Trạng thái chung

| Hạng mục | Trạng thái (lượt chạy 1, 2026-11-02T18:29Z) |
|---|---|
| Build backend + frontend | Đạt |
| Unit test | 94/94 đạt |
| Độ phủ service | `DepartmentService` 100%, `EmployeeService` 100% (mức sàn 80%) |
| Kiểm API thật | Đạt, trừ lỗi 400 lệch hợp đồng C3 |
| **Kết luận** | **Không đạt**: 2 mục Không đạt có gốc ở code U1 → Loop-back 1 về Code Generation U1. Các mục kiểm tay để lượt chạy sau khi sửa |

Điều kiện có trước: .NET SDK 10.0.403, Node 24.15, PostgreSQL 18.6 đang chạy, user-secrets `ConnectionStrings:Default` đã đặt, database `employee_db` đã có 2 migration.

## 2. Các loại kiểm đã dùng

| Loại | Công cụ | Ở đâu chạy | Ghi chú |
|---|---|---|---|
| Unit test service + phần nền | xUnit, EF Core InMemory, `WebApplicationFactory` | .NET test host (trong bộ nhớ) | 94 test |
| Kiểm tĩnh frontend | `tsc` strict, ESLint, Prettier, Vite build | Node | Không có test tự động cho React (`team.md`) |
| Tích hợp API | Lời gọi HTTP thật tới backend + PostgreSQL thật | PowerShell `HttpClient` | Bằng chứng tích hợp, không phải bằng chứng trình duyệt |
| Tích hợp giao diện | Playwright (Chromium thật) và Hiệp trên Chrome | Trình duyệt thật | Lượt sau khi sửa |
| Database | pgAdmin (Hiệp) | PostgreSQL 18 | Bằng chứng U3–U5 |
| Hiệu năng / truy cập | Lighthouse, W3C Validator (Hiệp) | Chrome | Một phần đã có từ U3, U4 |

`integration-test-instructions.md` là file hướng dẫn kiểm thêm duy nhất (Test Strategy `Standard`). Không viết file kiểm hiệu năng hay bảo mật riêng vì đó là mức `Comprehensive`; các mục tiêu hiệu năng, bảo mật có trong bảng dưới.

## 3. Kỳ vọng độ phủ

| Phạm vi | Kỳ vọng | Nguồn |
|---|---|---|
| Cả dự án | Mỗi lớp service ≥ 80% dòng, đo bằng coverlet trên toàn bộ test | `team.md`, NFR4.2 (U3), NFR4.3 (U4) |
| U1 | Mỗi nhánh `ErrorMapper` có test; 3 hành vi CORS có test | `unit-test-instructions.md` U1 |
| U2 | Không đo độ phủ (không test React) | `unit-test-instructions.md` U2 |
| U3 / U4 | `DepartmentService` / `EmployeeService` ≥ 80% | NFR4.2 / NFR4.3 |
| U5 | Không có code | `unit-test-instructions.md` U5 |

## Target Verification Matrix

Verdict: **Met** (Đạt), **Not Met** (Không đạt), **Unverified** (Chưa kiểm được), **N/A** (không áp dụng, có lý do). "Bằng chứng U3/U4/U5" là kết quả chạy thật ghi trong `code-summary.md` của Unit đó, trên code chưa đổi từ đó.

### Đề bài, hợp đồng, Testing Posture

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| KH-1 | `docs/ke-hoach.md` §5 | Chạy được toàn bộ luồng React → PostgreSQL | Chưa kiểm ở lượt này | Lượt sau: F01–F14 (Hiệp) | build-and-test | Unverified |
| KH-2 | `docs/ke-hoach.md` §5 | CRUD và tìm kiếm hoạt động | Chưa kiểm ở lượt này (U4 Playwright đã đạt 02/11) | Lượt sau: F, V (Hiệp) | build-and-test | Unverified |
| KH-3 | `docs/ke-hoach.md` §5 | Có kiểm tra dữ liệu và thông báo lỗi cơ bản | Form và API đều kiểm; 400 lệch C3 (BT-01) | `test-results.md` §4 #1–3 | build-and-test | Unverified |
| KH-4 | `docs/ke-hoach.md` §5 | Source trên Git gồm backend, frontend, migration | 45 file backend, 37 frontend, 5 migration được Git theo dõi | `git ls-files` | build-and-test | Met |
| KH-5 | `docs/ke-hoach.md` §5 | Sơ đồ DB, danh sách API kèm JSON mẫu | `docs/so-do-database.md`, `docs/danh-sach-api.md` (10 thao tác) | U5 T1–T3 (chạy lại hôm nay) | build-and-test | Met |
| KH-6 | `docs/ke-hoach.md` §5 | README cài đặt và chạy demo trên máy cá nhân | README 12 mục, clone sạch chạy được | U5 Step 11; T4, T5 | build-and-test | Met |
| C3-400 | Hợp đồng C3, FR4 | 400 trả `application/problem+json` có `type` | `application/json`, không `type` | `test-results.md` §4 #1, BT-01 | code-generation (U1) | Not Met |
| C3-404-409 | Hợp đồng C3 | 404, 409 trả `problem+json` có `type`, title tiếng Việt | Đúng | `test-results.md` §4 #4, #6 | build-and-test | Met |
| TP-1 | `team.md` Testing Posture | `dotnet test` toàn bộ xanh | 94/94 | `test-results.md` §2 | build-and-test | Met |
| TP-2 | `team.md`, NFR4.2 U3, NFR4.3 U4 | Mỗi lớp service ≥ 80% dòng | 100% / 100% | `test-results.md` §3 | build-and-test | Met |
| TP-3 | `org.md` (classic: chạy trên CI trước khi merge) | Chạy test trên CI | — | Kế hoạch không chạy CI Pipeline (`ci-pipeline` SKIP) | — | N/A: kế hoạch không có CI Pipeline |
| TP-4 | `team.md` Code Style | Format và lint sạch trước commit | Sạch | `verify`, `dotnet format --verify-no-changes` | build-and-test | Met |
| TP-5 | `team.md` Testing Posture | Mỗi service ≥ 1 ca đúng và 2 ca lỗi/biên mỗi thao tác | Đủ (21 ca U3 + 32 ca U4 + D1–D3) | `unit-test-instructions.md` U3 §5, U4 §5 | build-and-test | Met |
| DEP-1 | `team.md` Deployment | Migration chạy được | Đạt | U5 Step 11 (`Done.`) | build-and-test | Met |
| DEP-2 | `team.md` Deployment | API mở được trang OpenAPI | 10 thao tác; `/swagger` 200 | `test-results.md` §4 #9 | build-and-test | Met |
| DEP-3 | `team.md` Deployment | Gọi qua Postman ra đúng kết quả | Đạt | U5 Step 10 (Hiệp) | build-and-test | Met |
| DEP-4 | `team.md` Deployment | Giao diện thêm, sửa, xóa, tìm được | Chưa kiểm ở lượt này | Lượt sau (Hiệp) | build-and-test | Unverified |

### U1 `u1-backend-platform`

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| U1-NFR1.1 | nfr-requirements/reliability | Thiếu chuỗi kết nối thì dừng, báo khóa và lệnh | Có | `PipelineTests` (StartupChecks 100%) | build-and-test | Met |
| U1-NFR1.2 | reliability | `dotnet ef database update` kết nối thật | Đạt | U3, U4, U5 Step 11 | build-and-test | Met |
| U1-NFR1.3 | reliability | `dotnet ef` nạp được user-secrets | Đạt | Như trên | build-and-test | Met |
| U1-NFR1.4 | reliability | DB tắt giữa chừng: 500 chung, app không dừng, tự nối lại | Chưa kiểm | Lượt sau (Hiệp tắt dịch vụ PostgreSQL) | build-and-test | Unverified |
| U1-NFR2.1 | security | Chuỗi kết nối chỉ từ user-secrets; `appsettings*` không có mật khẩu | Đúng; API đọc được DB thật | Quét 0 dòng; §4 | build-and-test | Met |
| U1-NFR2.2 | security | Không file Git nào có mật khẩu; `.gitignore` đủ | `.gitignore` dòng 30–36 | Quét 0 dòng | build-and-test | Met |
| U1-NFR2.3 | security | Lỗi không lộ chuỗi kết nối, stack trace, SQL | Đúng | `ErrorMapperTests` (lỗi lạ → 500 chung) | build-and-test | Met |
| U1-NFR2.4a | security | API kiểm lại dữ liệu, không tin form | 400 khi gửi thẳng dữ liệu sai | §4 #1–3, #7 | build-and-test | Met |
| U1-NFR2.4b | security | Body tối đa 32 KB → 413 | Không có giới hạn riêng (mặc định Kestrel) | `nfr-design/security-design.md` §3 | — | N/A: bỏ có chủ đích ở NFR Design U1 (không có nguồn) |
| U1-NFR2.5 | observability | Log không có chuỗi kết nối, mật khẩu, body | Chỉ ghi phương thức, đường dẫn, lỗi | Đọc `ProblemDetailsExceptionHandler.cs` dòng 27–35 | build-and-test | Met |
| U1-NFR3.1 | security | Lỗi ràng buộc nhận theo tên, không lộ 500 | Đúng cho 23505, 23503 | `ErrorMapperTests` | build-and-test | Met |
| U1-NFR3.2 | security | U3/U4 tự bắt 23503 đúng ngữ cảnh | Có (và cả 23001 khi xóa) | Test D2, D3, #22, #28 | build-and-test | Met |
| U1-NFR3.3 | reliability | Lỗi ràng buộc đã biết tên không bao giờ ra 500 | 23001 + `fk_employees_department` ở tầng dự phòng → 500 | BT-02 | code-generation (U1) | Not Met |
| U1-NFR5.1 | performance | Phần nền < 20 ms (trung vị 10 lần) | 0,55 ms | §4 #4 | build-and-test | Met |
| U1-NFR5.2 | performance | DB bất đồng bộ, một ngữ cảnh mỗi request, pool mặc định | Đúng | `Program.cs:31` `AddDbContext`; service `async` | build-and-test | Met |
| U1-NFR5.3 | performance | Khởi động ≤ 10 giây | < 1 giây | §4 #10 | build-and-test | Met |
| U1-NFR5.4 | scalability | Một người dùng, ≤ 1.000 nhân viên | Ràng buộc thiết kế | — | — | N/A: ràng buộc thiết kế, không có giá trị đo |
| U1-NFR5.5 | scalability | Không giữ trạng thái giữa request | Chỉ `static readonly` Regex, Expression | Quét `static` | build-and-test | Met |
| U1-NFR6.1 | observability | Log console; mặc định Information, EF Warning | Đúng | `appsettings.json` | build-and-test | Met |
| U1-NFR6.2 | observability | Mỗi 500 ghi đúng một dòng Error | `LogError` một lần khi status ≥ 500 | `ProblemDetailsExceptionHandler.cs:28–31` | build-and-test | Met |
| U1-NFR6.3 | observability | 4xx không ghi Error | Ghi Information | `ProblemDetailsExceptionHandler.cs:34` | build-and-test | Met |
| U1-NFR7.1 | security | CORS chỉ origin cấu hình, không `*` | Origin lạ không có header | §4 #5 | build-and-test | Met |
| U1-NFR7.2 | security | Mọi phản hồi lỗi có header CORS | 400, 404, 409 có; 500 có (test) | §4 #1, #5, #6; `PipelineTests` | build-and-test | Met |

### U2 `u2-web-shell`

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| U2-NFR2.1 | security | Frontend không chứa bí mật | `.env.development` chỉ có `VITE_API_BASE_URL` | Quét 0 dòng | build-and-test | Met |
| U2-NFR2.2 | security | `node_modules/`, `dist/` không vào Git | Có trong `.gitignore` | `.gitignore` dòng 35–36 | build-and-test | Met |
| U2-NFR5.1 | performance | Lighthouse Performance ≥ 90 ở `/employees`, `/departments` | 100 / 100 (di động 360 px, chặt hơn Desktop) | Hiệp, U3 và U4 | build-and-test | Met |
| U2-NFR5.2 | performance | Chuyển trang không tải lại HTML | Đúng | U2 K3 (Playwright) | build-and-test | Met |
| U2-NFR5.3 | performance | Hủy sau 10 giây, báo "Không kết nối được máy chủ..." | Chưa kiểm hạn 10 giây | Lượt sau: E1 (Playwright) | build-and-test | Unverified |
| U2-NFR5.4 | performance | Chỉ React, React DOM, React Router | Đúng | `package.json` dependencies | build-and-test | Met |
| U2-NFR7.1 | security | Cổng 5173 `strictPort` cho dev và preview | Đúng | `vite.config.ts:9–10` | build-and-test | Met |
| U2-NFR7.2 | security | Không gửi credential | Không có `credentials` | Quét 0 dòng | build-and-test | Met |
| U2-NFR7.3 | security | `VITE_API_BASE_URL` = `http://localhost:5081` | Đúng | `.env.development` | build-and-test | Met |
| U2-NFR7.4 | security | Không `dangerouslySetInnerHTML`, `innerHTML`, `eval` | 0 dòng | Quét | build-and-test | Met |
| U2-NFR7.5 | security | Lời báo không lộ chi tiết kỹ thuật | Chỉ `title`/`detail`/`errors` hoặc câu chung | `client.ts`; U3, U4 Playwright | build-and-test | Met |
| U2-NFR8.1 | performance | Lint 0 lỗi 0 cảnh báo; Prettier sạch | Đúng | `verify` | build-and-test | Met |
| U2-NFR8.2 | performance | Qua danh sách WCAG 2.1 AA (`accessibility-checklist.md` §2) | Chưa đi hết danh sách ở bước này | Lượt sau | build-and-test | Unverified |
| U2-NFR8.3 | performance | Lighthouse Accessibility = 100 ở 6 trang | 100 ở 2 trang danh sách; 4 trang còn lại chưa đo | Hiệp, U3 và U4 | build-and-test | Unverified |
| U2-NFR8.4 | performance | Best Practices ≥ 90; console sạch | Chưa đo Best Practices | Lượt sau: Lighthouse, E2 | build-and-test | Unverified |
| U2-NFR8.5 | performance | W3C Validator không lỗi | Chưa kiểm | Lượt sau | build-and-test | Unverified |

### U3 `u3-departments`

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| U3-NFR1.1 | reliability | Migration 1 lên/xuống được | Đạt | U3 D2 (Hiệp) | build-and-test | Met |
| U3-NFR1.2 | reliability | Dữ liệu mẫu không làm hỏng id tự tăng | POST sau migration 201 | U3; U5 Step 10 (id 11) | build-and-test | Met |
| U3-NFR1.3 | reliability | Không sửa migration đã chạy | `CreateDepartments` chỉ 1 commit | `git log` | build-and-test | Met |
| U3-NFR2.1 | security | Không thêm bí mật | 0 dòng | Quét | build-and-test | Met |
| U3-NFR2.2 | security | API kiểm tên bắt buộc, ≤ 100 ký tự | Rỗng → 400; 40 KB → 400 "tối đa 100 ký tự" | §4 #1, #7 | build-and-test | Met |
| U3-NFR2.3 | security | Truy vấn luôn dùng tham số | Chỉ LINQ; không SQL tay ngoài migration | Quét `FromSqlRaw`/`ExecuteSqlRaw` 0 dòng | build-and-test | Met |
| U3-NFR2.4 | security | Lỗi không lộ chi tiết | Body 409 chỉ có lời tiếng Việt | §4 #6 | build-and-test | Met |
| U3-NFR2.5 | security | Hiển thị như chữ | Không `dangerouslySetInnerHTML` | Quét | build-and-test | Met |
| U3-NFR3.1 | reliability | Chỉ mục `ux_departments_name` trên `lower(name)`, chèn tay bị 23505 | Đạt | U3 D3, D4; U5 Step 4 | build-and-test | Met |
| U3-NFR3.2 | reliability | `name varchar(100) NOT NULL` | Đúng | U5 Step 4 | build-and-test | Met |
| U3-NFR3.3 | reliability | Chen nhau không ra 500 | Đúng ở service | Test #15, #18, #19, D3 | build-and-test | Met |
| U3-NFR4.1 | reliability | ≥ 1 ca đúng, 2 ca lỗi mỗi thao tác | 21 ca + D1–D3 | `DepartmentServiceTests` | build-and-test | Met |
| U3-NFR4.2 | reliability | `DepartmentService` ≥ 80% | 100% | §3 | build-and-test | Met |
| U3-NFR4.3 | reliability | Đường lỗi DB được thử | Đạt | Test #15, #18–#20; pgAdmin D4 | build-and-test | Met |
| U3-NFR5.1 | performance | `GET /api/departments` ≤ 1 giây | 61,9 ms | §4 #8 | build-and-test | Met |
| U3-NFR5.2 | performance | Thêm, sửa, xóa ≤ 1 giây | 3–40 ms (U3); 567 ms lần ghi đầu hôm nay | U3 §4; §4 #6 | build-and-test | Met |
| U3-NFR5.3 | performance | Đọc không theo dõi, chỉ 2 cột | `AsNoTracking` + DTO | `DepartmentService.cs:23,30` | build-and-test | Met |
| U3-NFR5.4 | performance | Lighthouse Performance ≥ 90 trang Phòng ban | 100 | Hiệp, U3 | build-and-test | Met |
| U3-NFR5.5 | scalability | Trả cả danh sách, không phân trang | Đúng | §4 #8; C1 | build-and-test | Met |
| U3-NFR5.6 | scalability | Service Scoped, không `static` chứa dữ liệu | Đúng | `Program.cs:36`; quét `static` | build-and-test | Met |
| U3-NFR6.1 | observability | Dùng chung log của U1 | Không có middleware riêng | Đọc code | build-and-test | Met |
| U3-NFR6.2 | observability | Log không chứa dữ liệu nhạy cảm | Không ghi body | Đọc code | build-and-test | Met |
| U3-NFR6.3 | observability | Bật được log SQL | Đạt | U3, U4 (đổi tạm rồi trả lại) | build-and-test | Met |
| U3-NFR7.1 | security | POST thật từ 5173 không lỗi CORS | Đạt | U3 Playwright; §4 #1, #6 | build-and-test | Met |

### U4 `u4-employees`

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| U4-NFR1.1 | reliability | Migration 2 lên/xuống, phòng ban còn nguyên | Đạt | U4 §5 (Hiệp) | build-and-test | Met |
| U4-NFR1.2 | reliability | Không có nhân viên mẫu | `GET` sau migration `[]` | U4 §5 | build-and-test | Met |
| U4-NFR1.3 | reliability | `CreateDepartments` không đổi | 1 commit | `git log` | build-and-test | Met |
| U4-NFR2.1 | security | Không thêm bí mật | 0 dòng | Quét | build-and-test | Met |
| U4-NFR2.2 | security | API kiểm đủ BR1.1–BR1.9, 400 có `errors` theo trường | Có `errors` theo trường (Content-Type lệch: xem C3-400) | §4 #2; test #12–#21 | build-and-test | Met |
| U4-NFR2.3 | security | Tham số; `%`, `_` không thành ký tự đại diện | Đúng | U4 §5 (`%`, `_` → rỗng) | build-and-test | Met |
| U4-NFR2.4 | security | Lỗi không lộ chi tiết | Đúng | U4 §5; §4 | build-and-test | Met |
| U4-NFR2.5 | security | Hiển thị như chữ, không `mailto:` | 0 dòng | Quét | build-and-test | Met |
| U4-NFR2.6 | security | Body sai kiểu → 400 (không 500), form hiện ở khung tóm tắt | API 400 đúng; giao diện không đọc được vì 400 là `application/json` | §4 #3; BT-01 | code-generation (U1) | Not Met |
| U4-NFR3.1 | reliability | `ux_employees_email` trên `lower(email)`, 23505 | Đạt | U4, U5 pgAdmin | build-and-test | Met |
| U4-NFR3.2 | reliability | Độ dài cột ở DB | Đúng | U5 Step 4 | build-and-test | Met |
| U4-NFR3.3 | reliability | Khóa ngoại RESTRICT chặn xóa phòng ban còn nhân viên | Bị từ chối (mã thật **23001**, đặc tả ghi 23503) | U4, U5 pgAdmin | build-and-test | Met |
| U4-NFR3.4 | reliability | Chen nhau không ra 500 | Đúng ở service | Test #22, #27, #28, #31; `ErrorMapperTests` 23505 | build-and-test | Met |
| U4-NFR3.5 | reliability | Xóa phòng ban còn nhân viên luôn 409 | Đúng | D1–D3; U4 API | build-and-test | Met |
| U4-NFR3.6 | reliability | Thứ tự kiểm cố định | Đúng | Test #21, #26 | build-and-test | Met |
| U4-NFR4.1 | reliability | Ca đúng + 2 ca lỗi mỗi thao tác | 32 ca | `EmployeeServiceTests` | build-and-test | Met |
| U4-NFR4.2 | reliability | Test thêm cho `DepartmentService` | D1, D2 (+ D3) | `DepartmentServiceTests` | build-and-test | Met |
| U4-NFR4.3 | reliability | Mỗi service ≥ 80% | 100% / 100% | §3 | build-and-test | Met |
| U4-NFR4.4 | reliability | Đường lỗi DB; tìm "Đ" có dấu trên PostgreSQL thật | Đạt | Test; U4 §5 (`đỗ`, `ĐỖ`, `đỗ văn`) | build-and-test | Met |
| U4-NFR5.1 | performance | `GET /api/employees` ≤ 1 giây với 1.000 dòng | 0,077 giây | U4 §5 | build-and-test | Met |
| U4-NFR5.2 | performance | Tìm ≤ 1 giây với 1.000 dòng | 0,052 giây | U4 §5 | build-and-test | Met |
| U4-NFR5.3 | performance | Một câu SQL có JOIN | Đúng | U4 log SQL | build-and-test | Met |
| U4-NFR5.4 | performance | Thêm, sửa, xóa ≤ 1 giây | Đạt | U4 §5 | build-and-test | Met |
| U4-NFR5.5 | performance | Lighthouse Performance ≥ 90 trang Nhân viên | 100 | Hiệp, U4 | build-and-test | Met |
| U4-NFR5.6 | scalability | Trả cả danh sách, không phân trang | Đúng | §4 #8 | build-and-test | Met |
| U4-NFR5.7 | scalability | Service Scoped, không `static` chứa dữ liệu | Đúng | `Program.cs:37`; quét | build-and-test | Met |
| U4-NFR5.8 | scalability | Chỉ mục trên `department_id` | `ix_employees_department_id` | Migration dòng 37; U5 pgAdmin | build-and-test | Met |
| U4-NFR6.1 | observability | Dùng chung log U1 | Đúng | Đọc code | build-and-test | Met |
| U4-NFR6.2 | observability | Log không có dữ liệu cá nhân | Không `EnableSensitiveDataLogging`; log SQL hiện `?` | Quét; U4 §5 | build-and-test | Met |
| U4-NFR6.3 | observability | Xem được câu SQL | Đạt | U4 §5 | build-and-test | Met |
| U4-NFR7.1 | security | POST/PUT/DELETE từ 5173 không lỗi CORS | Đạt | U4 Playwright | build-and-test | Met |

### U5 `u5-handover`

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| U5-NFR2.1 | security | Tài liệu không có mật khẩu thật | Chỉ `$p`, mẫu tìm-thay, `***` | T6 hôm nay; U5 Step 9 (Hiệp) | build-and-test | Met |
| U5-NFR2.2 | security | Dữ liệu mẫu là dữ liệu giả | `@example.com`, tên mẫu | U5 §2 | build-and-test | Met |
| U5-NFR2.3 | security | Không lộ thông tin máy trong JSON mẫu | Đúng | U5 rà soát | build-and-test | Met |
| U5-NFR2.4 | security | Thử ràng buộc trả DB về như cũ | Số dòng trước = sau | U5 Step 4 | build-and-test | Met |
| U5-NFR7.1 | security | README ghi đúng địa chỉ frontend khớp CORS | `http://localhost:5173` | U5 Step 11; `appsettings.json` | build-and-test | Met |

**Tổng lượt 1 (116 mục):** 100 Met, 3 Not Met (C3-400, U1-NFR3.3, U4-NFR2.6, cùng gốc ở U1), 10 Unverified (kiểm tay, để lượt sau), 3 N/A có lý do.

## 4. Đánh giá sẵn sàng

| Mức | Trạng thái |
|---|---|
| Build-ready | Có |
| Test-ready | Có (94 test, lệnh `verify`, `coverage`) |
| Deployment-ready (chạy trên máy theo README) | Chưa: chờ sửa U1 và lượt kiểm tay |

## 5. Giới hạn đã biết và việc còn mở

- **Thêm nhân viên có nhiều lỗi cùng lúc thì API chỉ báo lỗi đầu tiên** (họ tên → email → phòng ban). Hiệp đã chốt ở U4: không sửa U1; form React vẫn tự báo đủ cả 3 ô.
- **Comment "200" trong `EmployeeService.UpdateAsync`** và `code-summary.md` U4 §2 ghi sai (thật là 404). Hiệp chọn không mở lại U4.
- **README mục 3:** mật khẩu có `;` hoặc `=` có thể làm hỏng chuỗi kết nối. Hiệp chọn không mở lại U5.
- **Tài liệu tự học `07-kiem-thu-va-demo.md`** có vài kết quả mong đợi khác thiết kế đã duyệt (A02: 400, A07: 200, khóa `email`); chỗ lệch ghi trong `integration-test-instructions.md`.
- **Đẩy lên GitHub và demo 15 phút**: việc của Hiệp sau khi xong bước này (`team.md`).
- **Thư mục `C:\Users\ASUS\thu-clone-employee-crud`**: Hiệp quyết sau.
