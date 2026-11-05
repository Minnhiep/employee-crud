# Tóm tắt Build and Test: employee-crud

> **Nguồn:** `code-generation-plan.md` (Testing Contract), `unit-test-instructions.md`, `code-summary.md` của U1–U5; `nfr-requirements/` và `nfr-design/` của từng Unit; hợp đồng C3; `team.md` (Testing Posture, Deployment); `docs/ke-hoach.md` mục 5 (Hiệp chọn gộp vào bước này); hai Change Request ngày 03/11 (làm lại giao diện, form 08aacca2 và 1af678f9; rà soát tổng thể, `ra-soat-tong-the.md`). Kết quả chạy: `test-results.md`.

## Lượt 6 (04/11/2026, kiểm tra lại riêng theo `docs/ke-hoach.md`)

**Kết luận: Không đạt ở 2 mục, chưa sửa.** Mọi chức năng và bàn giao của đề bài vẫn đạt; 138/138 test; độ phủ service 100%; truy vết 0 ID chưa phủ. Chi tiết: `test-results.md` lượt 6.

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| TP-4 | `team.md` Code Style | Format và lint sạch trước commit | ESLint, Prettier sạch; `dotnet format --verify-no-changes` 8 lỗi ở 6 file | Lượt 6 §1, BT-05 | build-and-test | Not Met |
| S-04, N-09 | Rà soát tổng thể nhóm 1 | Ký tự lạ không làm API ra 500 | U+FFFE ra 500 ở 3 đường gọi; các ký tự khác đúng | Lượt 6 §2, BT-04 | build-and-test | Not Met |
| Các mục còn lại của lượt 5 | Như bảng dưới | Như bảng dưới | Không đổi. Kiểm lại trực tiếp ở lượt 6: KH-1, KH-2, KH-3, TP-1, TP-2, U1-NFR7.1, U2-NFR7.4, FR8.4 | Lượt 6 §1–§3 | build-and-test | Met |

Sẵn sàng: Build-ready có; Test-ready có; Deployment-ready (chạy trên máy theo README) có. Hai mục Not Met không chặn demo. Hai phương án sửa kèm ước lượng ở `test-results.md` lượt 6 §5; lượt này chỉ kiểm tra nên không mở lại Code Generation.

## 1. Trạng thái chung

Các lượt: lượt 1 (02/11) → Loop-back 1 về U1 (BT-01, BT-02) → lượt 2 dừng vì Change Request làm lại giao diện → lượt 3 (03/11 sáng) → Loop-back 2 về U1 (BT-03) → Change Request rà soát tổng thể (U1–U5) → lượt 4 (03/11 chiều) → **Change Request FR8 quan hệ phòng ban – nhân viên (U3–U5) → Loop-back 3 (U4) → Change Request kiểu liên kết (U4) → lượt 5 (04/11, lượt chốt)**.

| Hạng mục | Lượt 1 (2026-11-02T18:29Z) | Lượt 4 (2026-11-03T06:45Z) | Lượt 5 (2026-11-04, FR8) |
|---|---|---|---|
| Build backend + frontend | Đạt | Đạt (`verify` mã thoát 0) | Đạt |
| Unit test | 94/94 | 118/118 | **138/138** |
| Độ phủ service (mức sàn 80%) | `DepartmentService` 100%, `EmployeeService` 100% | `DepartmentService` 100%, `EmployeeService` 100%, `TextInput` 100% (Microsoft Code Coverage, xem §3) | Cả ba vẫn 100% |
| Kiểm API thật | Đạt, trừ lỗi 400 lệch C3 | Đạt (lượt 3 §2, §2b–§2d; lượt 4 §3, §4) | Đạt (83 nhân viên, trung vị 4,1 ms) |
| Kiểm giao diện | Chưa | Playwright 7 trang × 2 độ rộng, console sạch; Lighthouse Desktop 6 trang đều 100 | Playwright 9 trang × 2 độ rộng; Lighthouse Desktop 7 trang đều 100 |
| **Kết luận** | Không đạt → Loop-back 1 | Đạt: 135 Met, 4 N/A | **Đạt**: 146 Met, 4 N/A có lý do, 0 Not Met, 0 Unverified |

Điều kiện có trước (lượt 4): .NET SDK 10.0.403, Node 24.15, PostgreSQL 18.6 đang chạy và **chỉ nghe localhost**, user-secrets `ConnectionStrings:Default` dùng tài khoản `employee_app` (U5, S-02), database `employee_db` có 2 migration, 4 phòng ban, 12 nhân viên.

## 2. Các loại kiểm đã dùng

| Loại | Công cụ | Ở đâu chạy | Ghi chú |
|---|---|---|---|
| Unit test service + phần nền | xUnit, EF Core InMemory, `WebApplicationFactory` | .NET test host (trong bộ nhớ) | 118 test |
| Độ phủ | coverlet (lượt 1–3); Microsoft Code Coverage 17.14.1 (lượt 4) | .NET test host | Lượt 4 đổi công cụ vì Smart App Control chặn dll do coverlet viết lại (`test-results.md` lượt 4 §2) |
| Kiểm tĩnh frontend | `tsc` strict, ESLint, Prettier, Vite build | Node | Không có test tự động cho React (`team.md`) |
| Tích hợp API | Lời gọi HTTP thật tới backend + PostgreSQL thật | PowerShell `HttpClient`, `curl`, `fetch` | Bằng chứng tích hợp, không phải bằng chứng trình duyệt |
| Tích hợp giao diện | Playwright (Chromium thật) và Hiệp trên Chrome | Trình duyệt thật | Lượt 3 (`npm run dev`), lượt 4 (bản build `npm run preview`) |
| Database | pgAdmin (Hiệp), dịch vụ Windows | PostgreSQL 18 | Bằng chứng U3–U5; tắt DB giữa chừng (lượt 3 §2c); `listen_addresses` (lượt 4 §1) |
| Hiệu năng / truy cập | Lighthouse Desktop (Hiệp), W3C Validator | Chrome; `validator.w3.org/nu` | Lighthouse lượt 4; W3C lượt 3 |

`integration-test-instructions.md` là file hướng dẫn kiểm thêm duy nhất (Test Strategy `Standard`). Không viết file kiểm hiệu năng hay bảo mật riêng vì đó là mức `Comprehensive`; các mục tiêu hiệu năng, bảo mật có trong bảng dưới.

## 3. Kỳ vọng độ phủ

| Phạm vi | Kỳ vọng | Nguồn |
|---|---|---|
| Cả dự án | Mỗi lớp service ≥ 80% dòng, đo trên toàn bộ test. `team.md` ghi công cụ coverlet; lượt 4 đo bằng Microsoft Code Coverage (cùng thước đo: tỉ lệ dòng), Hiệp chọn vì coverlet bị chặn | `team.md`, NFR4.2 (U3), NFR4.3 (U4) |
| U1 | Mỗi nhánh `ErrorMapper` có test; 3 hành vi CORS có test | `unit-test-instructions.md` U1 |
| U2 | Không đo độ phủ (không test React) | `unit-test-instructions.md` U2 |
| U3 / U4 | `DepartmentService` / `EmployeeService` ≥ 80%; `TextInput` (dùng chung, đợt rà soát) đo cùng | NFR4.2 / NFR4.3 |
| U5 | Không có code | `unit-test-instructions.md` U5 |

## Target Verification Matrix

Verdict: **Met** (Đạt), **Not Met** (Không đạt), **Unverified** (Chưa kiểm được), **N/A** (không áp dụng, có lý do). "Bằng chứng U3/U4/U5" là kết quả chạy thật ghi trong `code-summary.md` của Unit đó, trên code chưa đổi từ đó. "Lượt n §m" trỏ vào `test-results.md`.

### Đề bài, hợp đồng, Testing Posture

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| KH-1 | `docs/ke-hoach.md` §5 | Chạy được toàn bộ luồng React → PostgreSQL | F01–F14 đạt trên server Hiệp tự bật theo README | Lượt 3 §2b; lượt 4 §3, §4 | build-and-test | Met |
| KH-2 | `docs/ke-hoach.md` §5 | CRUD và tìm kiếm hoạt động | Thêm, sửa, xóa, tìm đạt | Lượt 3 §2b (F03–F13) | build-and-test | Met |
| KH-3 | `docs/ke-hoach.md` §5 | Có kiểm tra dữ liệu và thông báo lỗi cơ bản | Form và API đều kiểm; 400 hiện trên form sau Loop-back 1 | Lượt 3 §2 (400 thật), §2b (V01–V07); lượt 4 §4 | build-and-test | Met |
| KH-4 | `docs/ke-hoach.md` §5 | Source trên Git gồm backend, frontend, migration | Backend, frontend, 2 migration được Git theo dõi; thay đổi của đợt rà soát chờ Hiệp commit (§5) | `git ls-files` | build-and-test | Met |
| KH-5 | `docs/ke-hoach.md` §5 | Sơ đồ DB, danh sách API kèm JSON mẫu | `docs/so-do-database.md`, `docs/danh-sach-api.md` (10 thao tác, thêm 405/415/500 ở đợt rà soát) | U5 T1–T3; U5 `code-summary.md` §6b | build-and-test | Met |
| KH-6 | `docs/ke-hoach.md` §5 | README cài đặt và chạy demo trên máy cá nhân | README 16 mục, clone sạch chạy được | U5 Step 11; T4, T5; §6b | build-and-test | Met |
| C3-400 | Hợp đồng C3, FR4 | 400 trả `application/problem+json` có `type` | Đúng, có cả `traceId` (Loop-back 1) | Lượt 3 §2; `PipelineTests` | build-and-test | Met |
| C3-404-409 | Hợp đồng C3 | 404, 409 trả `problem+json` có `type`, title tiếng Việt | Đúng | Lượt 1 §4 #4, #6 | build-and-test | Met |
| TP-1 | `team.md` Testing Posture | `dotnet test` toàn bộ xanh | 138/138 | Lượt 5 §2 | build-and-test | Met |
| TP-2 | `team.md`, NFR4.2 U3, NFR4.3 U4 | Mỗi lớp service ≥ 80% dòng | 100% / 100% (`TextInput` 100%) | Lượt 4 §2 | build-and-test | Met |
| TP-3 | `org.md` (classic: chạy trên CI trước khi merge) | Chạy test trên CI | — | Kế hoạch không chạy CI Pipeline (`ci-pipeline` SKIP) | — | N/A: kế hoạch không có CI Pipeline |
| TP-4 | `team.md` Code Style | Format và lint sạch trước commit | Sạch | `verify` lượt 4 | build-and-test | Met |
| TP-5 | `team.md` Testing Posture | Mỗi service ≥ 1 ca đúng và 2 ca lỗi/biên mỗi thao tác | Đủ (U3 #1–#27 + D1–D3, U4 #1–#41) | `unit-test-instructions.md` U3, U4 | build-and-test | Met |
| DEP-1 | `team.md` Deployment | Migration chạy được | Đạt; chạy lại bằng `postgres` sau khi có `employee_app`: "Done." | U5 Step 11; U5 §6b | build-and-test | Met |
| DEP-2 | `team.md` Deployment | API mở được trang OpenAPI | 10 thao tác; `/swagger` 200 | Lượt 1 §4 #9 | build-and-test | Met |
| DEP-3 | `team.md` Deployment | Gọi qua Postman ra đúng kết quả | Đạt | U5 Step 10 (Hiệp) | build-and-test | Met |
| DEP-4 | `team.md` Deployment | Giao diện thêm, sửa, xóa, tìm được | Đạt | Lượt 3 §2b (F03–F13); lượt 4 §4 | build-and-test | Met |

### U1 `u1-backend-platform`

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| U1-NFR1.1 | nfr-requirements/reliability | Thiếu chuỗi kết nối thì dừng, báo khóa và lệnh | Có | `PipelineTests` (StartupChecks 100%) | build-and-test | Met |
| U1-NFR1.2 | reliability | `dotnet ef database update` kết nối thật | Đạt | U3, U4, U5 Step 11 | build-and-test | Met |
| U1-NFR1.3 | reliability | `dotnet ef` nạp được user-secrets | Đạt | Như trên | build-and-test | Met |
| U1-NFR1.4 | reliability | DB tắt giữa chừng: 500 chung, app không dừng, tự nối lại | Đạt | Lượt 3 §2c (Hiệp tắt dịch vụ PostgreSQL) | build-and-test | Met |
| U1-NFR2.1 | security | Chuỗi kết nối chỉ từ user-secrets; `appsettings*` không có mật khẩu | Đúng; API đọc được DB thật | Quét 0 dòng; lượt 4 §3 | build-and-test | Met |
| U1-NFR2.2 | security | Không file Git nào có mật khẩu; `.gitignore` đủ | `.gitignore` đủ, thêm mẫu file bí mật (S-08) | Quét 0 dòng; U1 `code-summary.md` §5d | build-and-test | Met |
| U1-NFR2.3 | security | Lỗi không lộ chuỗi kết nối, stack trace, SQL | Đúng | `ErrorMapperTests` (lỗi lạ → 500 chung) | build-and-test | Met |
| U1-NFR2.4a | security | API kiểm lại dữ liệu, không tin form | 400 khi gửi thẳng dữ liệu sai | Lượt 1 §4 #1–3, #7 | build-and-test | Met |
| U1-NFR2.4b | security | Body tối đa 32 KB → 413 | Không có giới hạn riêng (mặc định Kestrel) | `nfr-design/security-design.md` §3 | — | N/A: bỏ có chủ đích ở NFR Design U1 (không có nguồn) |
| U1-NFR2.5 | observability | Log không có chuỗi kết nối, mật khẩu, body | Chỉ ghi phương thức, đường dẫn, lỗi, `traceId` | `ProblemDetailsExceptionHandler.cs`; `LoggingTests` | build-and-test | Met |
| U1-NFR3.1 | security | Lỗi ràng buộc nhận theo tên, không lộ 500 | Đúng cho 23505, 23503, 23001 | `ErrorMapperTests` | build-and-test | Met |
| U1-NFR3.2 | security | U3/U4 tự bắt 23503 đúng ngữ cảnh | Có (và cả 23001 khi xóa) | Test D2, D3, #22, #28 | build-and-test | Met |
| U1-NFR3.3 | reliability | Lỗi ràng buộc đã biết tên không bao giờ ra 500 | 23001 ở tầng dự phòng → 409 (Loop-back 1) | `ErrorMapperTests` ca 23001 | build-and-test | Met |
| U1-NFR5.1 | performance | Phần nền < 20 ms (trung vị 10 lần) | 0,55 ms | Lượt 1 §4 #4 | build-and-test | Met |
| U1-NFR5.2 | performance | DB bất đồng bộ, một ngữ cảnh mỗi request, pool mặc định | Đúng | `Program.cs` `AddDbContext`; service `async` | build-and-test | Met |
| U1-NFR5.3 | performance | Khởi động ≤ 10 giây | < 1 giây | Lượt 1 §4 #10 | build-and-test | Met |
| U1-NFR5.4 | scalability | Một người dùng, ≤ 1.000 nhân viên | Ràng buộc thiết kế | — | — | N/A: ràng buộc thiết kế, không có giá trị đo |
| U1-NFR5.5 | scalability | Không giữ trạng thái giữa request | Chỉ `static readonly` Regex, Expression | Quét `static` | build-and-test | Met |
| U1-NFR6.1 | observability | Log console; mặc định Information, EF Warning | Đúng; 4 nhóm EF ở `Critical` để không lặp lỗi (Loop-back 2) | `appsettings.json` | build-and-test | Met |
| U1-NFR6.2 | observability | Mỗi 500 ghi đúng một dòng Error | 1 dòng `fail:` (lượt 3 thấy 3 dòng, sửa ở Loop-back 2) | Lượt 3 §2c, §2d | build-and-test | Met |
| U1-NFR6.3 | observability | 4xx không ghi Error | Ghi Information; 8 POST chen nhau → 0 dòng `fail:` | Lượt 3 §2c, §2d | build-and-test | Met |
| U1-NFR7.1 | security | CORS chỉ origin cấu hình, không `*` | Origin lạ không có header | Lượt 1 §4 #5 | build-and-test | Met |
| U1-NFR7.2 | security | Mọi phản hồi lỗi có header CORS | 400, 404, 409 có; 500 có (test) | Lượt 1 §4 #1, #5, #6; `PipelineTests` | build-and-test | Met |

### U2 `u2-web-shell`

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| U2-NFR2.1 | security | Frontend không chứa bí mật | `.env.development` chỉ có `VITE_API_BASE_URL` | Quét 0 dòng | build-and-test | Met |
| U2-NFR2.2 | security | `node_modules/`, `dist/` không vào Git | Có trong `.gitignore` | `.gitignore` | build-and-test | Met |
| U2-NFR5.1 | performance | Lighthouse Performance ≥ 90 ở `/employees`, `/departments` | 100 / 100 (Desktop, bản build) | Lượt 4 §5 | build-and-test | Met |
| U2-NFR5.2 | performance | Chuyển trang không tải lại HTML | Đúng | U2 K3 (Playwright) | build-and-test | Met |
| U2-NFR5.3 | performance | Hủy sau 10 giây, báo "Không kết nối được máy chủ..." | Hiện lời báo + "Thử lại" sau 10,6 giây (kể cả lúc tải trang) | Lượt 3 §2 (E1) | build-and-test | Met |
| U2-NFR5.4 | performance | Chỉ React, React DOM, React Router | Đúng | `package.json` dependencies | build-and-test | Met |
| U2-NFR7.1 | security | Cổng 5173 `strictPort` cho dev và preview | Đúng | `vite.config.ts` | build-and-test | Met |
| U2-NFR7.2 | security | Không gửi credential | Không có `credentials` | Quét 0 dòng | build-and-test | Met |
| U2-NFR7.3 | security | `VITE_API_BASE_URL` = `http://localhost:5081` | Đúng | `.env.development` | build-and-test | Met |
| U2-NFR7.4 | security | Không `dangerouslySetInnerHTML`, `innerHTML`, `eval` | 0 dòng | Quét | build-and-test | Met |
| U2-NFR7.5 | security | Lời báo không lộ chi tiết kỹ thuật | Chỉ `title`/`detail`/`errors` hoặc câu chung | `client.ts`; lượt 4 §4 | build-and-test | Met |
| U2-NFR8.1 | performance | Lint 0 lỗi 0 cảnh báo; Prettier sạch | Đúng | `verify` lượt 4 | build-and-test | Met |
| U2-NFR8.2 | performance | Qua danh sách WCAG 2.1 AA (`accessibility-checklist.md` §2) | Đạt phần đo được trên DOM, bàn phím và độ rộng; Lighthouse Accessibility 100 | Lượt 3 §2 (DOM 7 trang, 6 độ rộng); U2 K1–K14; lượt 4 §5 | build-and-test | Met |
| U2-NFR8.3 | performance | Lighthouse Accessibility = 100 ở 6 trang | 100 cả 6 trang | Lượt 4 §5 | build-and-test | Met |
| U2-NFR8.4 | performance | Best Practices ≥ 90; console sạch | 100 cả 6 trang; console 0 lỗi 0 cảnh báo | Lượt 4 §4, §5 | build-and-test | Met |
| U2-NFR8.5 | performance | W3C Validator không lỗi | 0 lỗi 7 trang; đợt rà soát chỉ thêm 1 thẻ `<strong>`, chưa gửi lại | Lượt 3 §2; lượt 4 §6 | build-and-test | Met |

### U3 `u3-departments`

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| U3-NFR1.1 | reliability | Migration 1 lên/xuống được | Đạt | U3 D2 (Hiệp) | build-and-test | Met |
| U3-NFR1.2 | reliability | Dữ liệu mẫu không làm hỏng id tự tăng | POST sau migration 201 | U3; U5 Step 10 (id 11) | build-and-test | Met |
| U3-NFR1.3 | reliability | Không sửa migration đã chạy | `CreateDepartments` chỉ 1 commit | `git log` | build-and-test | Met |
| U3-NFR2.1 | security | Không thêm bí mật | 0 dòng | Quét | build-and-test | Met |
| U3-NFR2.2 | security | API kiểm tên bắt buộc, ≤ 100 ký tự | Rỗng → 400; 40 KB → 400 "tối đa 100 ký tự"; ký tự điều khiển, vô hình → 400 | Lượt 1 §4 #1, #7; test #22–#27 | build-and-test | Met |
| U3-NFR2.3 | security | Truy vấn luôn dùng tham số | Chỉ LINQ; không SQL tay ngoài migration | Quét `FromSqlRaw`/`ExecuteSqlRaw` 0 dòng | build-and-test | Met |
| U3-NFR2.4 | security | Lỗi không lộ chi tiết | Body 409 chỉ có lời tiếng Việt | Lượt 1 §4 #6 | build-and-test | Met |
| U3-NFR2.5 | security | Hiển thị như chữ | Không `dangerouslySetInnerHTML` | Quét | build-and-test | Met |
| U3-NFR3.1 | reliability | Chỉ mục `ux_departments_name` trên `lower(name)`, chèn tay bị 23505 | Đạt | U3 D3, D4; U5 Step 4 | build-and-test | Met |
| U3-NFR3.2 | reliability | `name varchar(100) NOT NULL` | Đúng | U5 Step 4 | build-and-test | Met |
| U3-NFR3.3 | reliability | Chen nhau không ra 500 | Đúng ở service | Test #15, #18, #19, D3 | build-and-test | Met |
| U3-NFR4.1 | reliability | ≥ 1 ca đúng, 2 ca lỗi mỗi thao tác | 27 ca + D1–D3 | `DepartmentServiceTests` | build-and-test | Met |
| U3-NFR4.2 | reliability | `DepartmentService` ≥ 80% | 100% | Lượt 4 §2 | build-and-test | Met |
| U3-NFR4.3 | reliability | Đường lỗi DB được thử | Đạt | Test #15, #18–#20; pgAdmin D4 | build-and-test | Met |
| U3-NFR5.1 | performance | `GET /api/departments` ≤ 1 giây | 61,9 ms | Lượt 1 §4 #8 | build-and-test | Met |
| U3-NFR5.2 | performance | Thêm, sửa, xóa ≤ 1 giây | 3–40 ms (U3); 567 ms lần ghi đầu lượt 1 | U3 §4; lượt 1 §4 #6 | build-and-test | Met |
| U3-NFR5.3 | performance | Đọc không theo dõi, chỉ 2 cột | `AsNoTracking` + DTO | `DepartmentService.cs` | build-and-test | Met |
| U3-NFR5.4 | performance | Lighthouse Performance ≥ 90 trang Phòng ban | 100 | Lượt 4 §5 | build-and-test | Met |
| U3-NFR5.5 | scalability | Trả cả danh sách, không phân trang | Đúng | Lượt 1 §4 #8; C1 | build-and-test | Met |
| U3-NFR5.6 | scalability | Service Scoped, không `static` chứa dữ liệu | Đúng | `Program.cs`; quét `static` | build-and-test | Met |
| U3-NFR6.1 | observability | Dùng chung log của U1 | Không có middleware riêng | Đọc code | build-and-test | Met |
| U3-NFR6.2 | observability | Log không chứa dữ liệu nhạy cảm | Không ghi body | Đọc code | build-and-test | Met |
| U3-NFR6.3 | observability | Bật được log SQL | Đạt | U3, U4 (đổi tạm rồi trả lại) | build-and-test | Met |
| U3-NFR7.1 | security | POST thật từ 5173 không lỗi CORS | Đạt | U3 Playwright; lượt 1 §4 #1, #6 | build-and-test | Met |

### U4 `u4-employees`

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| U4-NFR1.1 | reliability | Migration 2 lên/xuống, phòng ban còn nguyên | Đạt | U4 §5 (Hiệp) | build-and-test | Met |
| U4-NFR1.2 | reliability | Không có nhân viên mẫu trong migration | `GET` sau migration `[]`; dữ liệu demo nằm riêng ở `docs/du-lieu-mau.sql` (N-01) | U4 §5; U5 §6b | build-and-test | Met |
| U4-NFR1.3 | reliability | `CreateDepartments` không đổi | 1 commit | `git log` | build-and-test | Met |
| U4-NFR2.1 | security | Không thêm bí mật | 0 dòng | Quét | build-and-test | Met |
| U4-NFR2.2 | security | API kiểm đủ BR1.1–BR1.9, 400 có `errors` theo trường | Có, `application/problem+json` | Lượt 1 §4 #2; test #12–#21, #33–#40 | build-and-test | Met |
| U4-NFR2.3 | security | Tham số; `%`, `_` không thành ký tự đại diện | Đúng | U4 §5 (`%`, `_` → rỗng) | build-and-test | Met |
| U4-NFR2.4 | security | Lỗi không lộ chi tiết | Đúng | U4 §5; lượt 1 §4 | build-and-test | Met |
| U4-NFR2.5 | security | Hiển thị như chữ, không `mailto:` | 0 dòng | Quét | build-and-test | Met |
| U4-NFR2.6 | security | Body sai kiểu → 400 (không 500), form hiện ở khung tóm tắt | 400 `problem+json`; form hiện "Phòng ban: Giá trị không đúng kiểu dữ liệu" (sau Loop-back 1) | Lượt 3 §2 | build-and-test | Met |
| U4-NFR3.1 | reliability | `ux_employees_email` trên `lower(email)`, 23505 | Đạt | U4, U5 pgAdmin | build-and-test | Met |
| U4-NFR3.2 | reliability | Độ dài cột ở DB | Đúng | U5 Step 4 | build-and-test | Met |
| U4-NFR3.3 | reliability | Khóa ngoại RESTRICT chặn xóa phòng ban còn nhân viên | Bị từ chối (mã thật **23001**; đặc tả đã đính chính ở lượt 2) | U4, U5 pgAdmin | build-and-test | Met |
| U4-NFR3.4 | reliability | Chen nhau không ra 500 | Đúng ở service | Test #22, #27, #28, #31; `ErrorMapperTests` 23505 | build-and-test | Met |
| U4-NFR3.5 | reliability | Xóa phòng ban còn nhân viên luôn 409 | Đúng | D1–D3; U4 API | build-and-test | Met |
| U4-NFR3.6 | reliability | Thứ tự kiểm cố định | Đúng | Test #21, #26 | build-and-test | Met |
| U4-NFR4.1 | reliability | Ca đúng + 2 ca lỗi mỗi thao tác | 41 ca | `EmployeeServiceTests` | build-and-test | Met |
| U4-NFR4.2 | reliability | Test thêm cho `DepartmentService` | D1, D2 (+ D3) | `DepartmentServiceTests` | build-and-test | Met |
| U4-NFR4.3 | reliability | Mỗi service ≥ 80% | 100% / 100% | Lượt 4 §2 | build-and-test | Met |
| U4-NFR4.4 | reliability | Đường lỗi DB; tìm "Đ" có dấu trên PostgreSQL thật | Đạt | Test; U4 §5 (`đỗ`, `ĐỖ`, `đỗ văn`); lượt 4 §3 (`nguyễn`) | build-and-test | Met |
| U4-NFR5.1 | performance | `GET /api/employees` ≤ 1 giây với 1.000 dòng | 0,077 giây | U4 §5 | build-and-test | Met |
| U4-NFR5.2 | performance | Tìm ≤ 1 giây với 1.000 dòng | 0,052 giây | U4 §5 | build-and-test | Met |
| U4-NFR5.3 | performance | Một câu SQL có JOIN | Đúng | U4 log SQL | build-and-test | Met |
| U4-NFR5.4 | performance | Thêm, sửa, xóa ≤ 1 giây | Đạt | U4 §5 | build-and-test | Met |
| U4-NFR5.5 | performance | Lighthouse Performance ≥ 90 trang Nhân viên | 100 | Lượt 4 §5 | build-and-test | Met |
| U4-NFR5.6 | scalability | Trả cả danh sách, không phân trang | Đúng | Lượt 1 §4 #8 | build-and-test | Met |
| U4-NFR5.7 | scalability | Service Scoped, không `static` chứa dữ liệu | Đúng | `Program.cs`; quét | build-and-test | Met |
| U4-NFR5.8 | scalability | Chỉ mục trên `department_id` | `ix_employees_department_id` | Migration; U5 pgAdmin | build-and-test | Met |
| U4-NFR6.1 | observability | Dùng chung log U1 | Đúng | Đọc code | build-and-test | Met |
| U4-NFR6.2 | observability | Log không có dữ liệu cá nhân | Không `EnableSensitiveDataLogging`; log SQL hiện `?` | Quét; U4 §5 | build-and-test | Met |
| U4-NFR6.3 | observability | Xem được câu SQL | Đạt | U4 §5 | build-and-test | Met |
| U4-NFR7.1 | security | POST/PUT/DELETE từ 5173 không lỗi CORS | Đạt | U4 Playwright; lượt 3 §2b | build-and-test | Met |

### U5 `u5-handover`

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| U5-NFR2.1 | security | Tài liệu không có mật khẩu thật | Chỉ `$p`, mẫu tìm-thay, `***`; mật khẩu `employee_app` đặt qua hộp thoại pgAdmin | T6; U5 §6b | build-and-test | Met |
| U5-NFR2.2 | security | Dữ liệu mẫu là dữ liệu giả | `@example.com`, `@congty.example` (đuôi `.example` dành riêng cho ví dụ), tên mẫu | U5 §2, §6b | build-and-test | Met |
| U5-NFR2.3 | security | Không lộ thông tin máy trong JSON mẫu | Đúng | U5 rà soát | build-and-test | Met |
| U5-NFR2.4 | security | Thử ràng buộc trả DB về như cũ | Số dòng trước = sau | U5 Step 4 | build-and-test | Met |
| U5-NFR7.1 | security | README ghi đúng địa chỉ frontend khớp CORS | `http://localhost:5173`; ghi rõ không dùng `127.0.0.1` (N-12) | U5 Step 11; `appsettings.json`; U5 §6b | build-and-test | Met |

### Change Request làm lại giao diện (03/11, form 08aacca2, 1af678f9)

Mục tiêu tóm từ yêu cầu của Hiệp: giao diện "chuẩn nghiệp vụ công ty", chỉ đổi giao diện, không thêm tính năng.

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| UI-1 | Form 08aacca2 | Bố cục quản trị: thanh bên + đầu trang có đường dẫn, mọi trang cùng khung | Có ở cả 7 trang, không cuộn ngang ở 6 độ rộng | U2 `code-summary.md` §4c; lượt 3 §2; lượt 4 §4 | build-and-test | Met |
| UI-2 | Form 1af678f9, U2-NFR5.4 | Tự viết CSS, không thêm gói | Dependencies vẫn chỉ React, React DOM, React Router | `package.json` | build-and-test | Met |
| UI-3 | Form 1af678f9 | Sửa icon "(!)", màu, phông, khoảng cách; hộp xác nhận chuẩn thay `window.confirm` | Icon SVG tự vẽ, `ConfirmDialog` (`<dialog>`), tương phản màu 17/17 cặp đạt | U2 §4c, §4d (R-09); lượt 4 §4 (N-05) | build-and-test | Met |
| UI-4 | Form 08aacca2 | Chỉ đổi giao diện, không thêm tính năng | 10 thao tác API không đổi; F01–F14 đạt trên giao diện mới | Lượt 3 §2b; `docs/danh-sach-api.md` | build-and-test | Met |

### Change Request rà soát tổng thể (03/11, `ra-soat-tong-the.md`, Hiệp chọn nhóm 1–4 + S-01)

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| S-04, N-09 | Nhóm 1 | Ký tự điều khiển, vô hình không làm API ra 500; tìm có ký tự lạ → `[]` | 400 kèm lời "chứa ký tự không hợp lệ"; `?search=%00` → `200 []` | Test U3 #22–#27, U4 #33–#40; U3 §4c; lượt 4 §4 | build-and-test | Met |
| N-04 | Nhóm 1 | Hai khoảng trắng, chữ tổ hợp (NFD) không lách được luật không trùng | Gộp khoảng trắng + NFC ở API và form → 409 | U3 §4c (API thật); `TextInput` 100% | build-and-test | Met |
| A-01 | Nhóm 1 | Hủy request khi tìm liên tiếp không ghi 500 giả | Test chứng minh .NET tự xử lý, không cần sửa code | U1 §5d (test hủy chờ có hạn) | build-and-test | Met |
| S-03 | Nhóm 1 | `AllowedHosts` chỉ localhost | Đúng | U1 §5d; `SecurityTests` | build-and-test | Met |
| N-03 | Nhóm 1 | Không cắt im lặng phần dán thừa | Bỏ `maxLength`; 101 ký tự → lời báo "tối đa 100 ký tự" | Lượt 4 §4 | build-and-test | Met |
| N-05 | Nhóm 1 | Hộp xác nhận xóa có email | "Nhân viên … (email) sẽ bị xóa vĩnh viễn…" | Lượt 4 §4 | build-and-test | Met |
| A-13 | Nhóm 1 | Form sửa phòng ban tạo lại khi đổi id | `key` theo id như nhân viên | U3 §4c | build-and-test | Met |
| N-07 | Nhóm 1 | Sửa/Hủy từ kết quả tìm giữ `?search=` | Về `/employees?search=nguyễn` | Lượt 4 §4 | build-and-test | Met |
| N-02, A-09 | Nhóm 1 | Body hỏng, 5xx không lời báo → câu chung đúng nguyên nhân | "Đã có lỗi xảy ra…"; chỉ lỗi mạng mới báo "Không kết nối được máy chủ" | U2 §4e, §4f (R-10, R-11) | build-and-test | Met |
| S-05 | Nhóm 2 | Header bảo mật cho API, bỏ `Server: Kestrel` | `nosniff`, `no-store` cho `/api`, `frame-ancestors 'none'`; không có `Server` | `SecurityTests` (4 test); U1 §5d | build-and-test | Met |
| S-09 | Nhóm 2 | Bỏ `UnsafeRelaxedJsonEscaping`, vẫn giữ chữ Việt | `JavaScriptEncoder.Create(UnicodeRanges.All)`; `<` vẫn được mã hóa | U1 §5d; test mã hóa `<` (R-10 U1) | build-and-test | Met |
| S-07 | Nhóm 2 | Ghim phiên bản gói; README dùng `npm ci` | 10.0.14 / Npgsql 10.0.3; README mục 7 | U1 §5d; U5 §6b | build-and-test | Met |
| S-08 | Nhóm 2 | `.gitignore` có mẫu file bí mật | Đúng | U1 §5d | build-and-test | Met |
| A-02 | Nhóm 2 | Dòng log có `traceId` | Đúng | `LoggingTests` (2 test); U1 §5d | build-and-test | Met |
| S-02, A-15 | Nhóm 2 | App dùng tài khoản DB riêng, chỉ đủ quyền 2 bảng | `employee_app`; `CREATE TABLE` bị từ chối (42501); app chạy CRUD bằng tài khoản này | U5 §6b (Hiệp tự làm); lượt 4 §3 | build-and-test | Met |
| A-05, A-06, A-07, A-08, A-10, A-12, N-10 | Nhóm 3 | Dọn code, không đổi hành vi | Đã làm; hành vi giữ nguyên | U2 §4e, U3 §4c, U4 §5c, U1 §5d; `verify` 118/118 | build-and-test | Met |
| N-01, N-12, A-03, A-04, A-11, A-14, S-11 | Nhóm 4 | Dữ liệu mẫu, README, danh sách API bổ sung | `docs/du-lieu-mau.sql` (10 người, chạy lại vẫn 10), README 16 mục, `danh-sach-api.md` thêm 405/415/500; xóa mềm ghi là hướng phát triển | U5 §6b, §6c | build-and-test | Met |
| S-01 | Nhóm 5 | PostgreSQL chỉ nghe localhost | Chỉ `127.0.0.1:5432`, `[::1]:5432` | Lượt 4 §1 | build-and-test | Met |
| N-06, N-08, N-11, S-06, S-10 | Mục "Không làm" | — | Chỉ chuẩn bị câu trả lời khi demo | `ra-soat-tong-the.md` §2, §4 | — | N/A: ngoài phạm vi `ke-hoach.md` hoặc đã chốt |

### Change Request FR8: quan hệ phòng ban – nhân viên (03–04/11, `requirements.md` FR8, US6.1–US6.6)

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| FR8.1 | FR8.1, AC6.1.1–6.1.2 | Cột "Số nhân viên"; `employeeCount` 1 câu SQL | Đúng; log SQL thấy truy vấn con trong 1 câu | Test D4–D6; lượt 5 §3, §4 | build-and-test | Met |
| FR8.2 | FR8.2, AC6.2.1–6.2.5 | Trang chi tiết phòng ban đủ trạng thái, thêm nhân viên chọn sẵn phòng, xóa phòng 0 người | Đạt | Lượt 5 §4; U4 code-summary §5e | build-and-test | Met |
| FR8.3 | FR8.3, AC6.3.1–6.3.4 | Lọc theo phòng + tìm, 400 tiếng Việt, `[]`, phòng đã xóa | Đạt; "Tìm thấy 5 nhân viên ở phòng Kỹ thuật" | Test #42–#50; lượt 5 §3, §4 | build-and-test | Met |
| FR8.4 | FR8.4, AC6.4.1–6.4.3 | Hộp "còn N nhân viên" + liên kết; 409 có N cả khi chen nhau | Đạt; "còn 14 nhân viên", 409 "còn 11 nhân viên" | Test D7–D9; lượt 5 §4; `danh-sach-api.md` | build-and-test | Met |
| FR8.5 | FR8.5, AC6.5.1–6.5.3 | Quy ước tên: phòng mẫu đúng, gợi ý dưới ô, README | Đạt; "Nhân Sự", "Văn Phòng" là dữ liệu Hiệp tự nhập, sửa bằng nút Sửa | U3 code-summary §4e; README mục 12 | build-and-test | Met |
| FR8.6 | FR8.6, AC6.6.1–6.6.2 | 80 nhân viên / 8 phòng, chạy lại không nhân đôi, khối gỡ an toàn | Hiệp chạy 2 lần: 80; khối gỡ trong transaction: 0/3/5, sau ROLLBACK: 80/83/9 | Lượt 5 §1, §5 | build-and-test | Met |
| AC6.6.3-API | AC6.6.3 | `GET /api/employees` trung vị 10 lần ≤ 1 giây với nhiều dữ liệu | 4,1 ms với 83 người (lọc 2,6 ms, tìm 2,3 ms) | Lượt 5 §3 | build-and-test | Met |
| AC6.6.3-LH | AC6.6.3, U2-NFR5.1 | Lighthouse Performance ≥ 90 trang Nhân viên, Phòng ban trên bản build | 100 / 100 (83 người, Hiệp xác nhận bảng có dữ liệu) | Lượt 5 §6 | build-and-test | Met |
| FR8-A11y | U2-NFR8.3, accessibility-checklist mục US6 | Accessibility 100 ở trang mới `/departments/{id}` và các trang cũ | 100 cả 7 trang; Best Practices 100 | Lượt 5 §6 | build-and-test | Met |
| LB-3 | Loop-back 3 (`test-results.md`) | "Thêm nhân viên" ở trạng thái rỗng giữ bộ lọc | Về `/employees?departmentId=21` sau Hủy | Lượt 5 §4; U4 code-summary §5f | build-and-test | Met |
| UI-5 | Change Request kiểu liên kết (Hiệp, 04/11) | Tên phòng ban trong bảng kiểu phần mềm quản trị: chữ đậm màu thường, rê chuột xanh + gạch | Đúng (Playwright đọc kiểu chữ; ảnh chụp) | U4 code-summary §5g | build-and-test | Met |

**Tổng lượt 5 (150 mục):** 146 Met, 4 N/A có lý do, 0 Not Met, 0 Unverified (139 mục của lượt 4 giữ nguyên kết quả, kiểm lại bằng `verify` và Playwright hồi quy; thêm 11 mục FR8).

**Tổng lượt 4 (139 mục):** 135 Met, 4 N/A có lý do (TP-3, U1-NFR2.4b, U1-NFR5.4, mục "Không làm" của rà soát), 0 Not Met, 0 Unverified. So với lượt 1 (116 mục: 100 Met, 3 Not Met, 10 Unverified, 3 N/A): 3 Not Met đã sửa qua Loop-back 1; U1-NFR6.2 (Met ở lượt 1 nhờ đọc code, Not Met ở lượt 3 khi gây lỗi DB thật) đã sửa qua Loop-back 2; 10 Unverified đã kiểm; thêm 23 mục từ hai Change Request.

## 4. Đánh giá sẵn sàng

| Mức | Trạng thái |
|---|---|
| Build-ready | Có |
| Test-ready | Có (138 test, lệnh `verify`; đo độ phủ bằng Microsoft Code Coverage) |
| Deployment-ready (chạy trên máy theo README) | Có: migration, OpenAPI, Postman, giao diện đủ bốn điều kiện của `team.md` Deployment |

## 5. Giới hạn đã biết và việc còn mở

- **Thêm nhân viên có nhiều lỗi cùng lúc thì API chỉ báo lỗi đầu tiên** (họ tên → email → phòng ban). Hiệp đã chốt ở U4: không sửa U1; form React vẫn tự báo đủ cả 3 ô.
- **Đo độ phủ bằng coverlet bị Smart App Control chặn** trên máy này (dll do coverlet viết lại là file mới). Lượt 4 đo bằng Microsoft Code Coverage; lệnh `coverage` trong `frontend/package.json` và `team.md` vẫn ghi coverlet. Đổi hẳn công cụ là việc Hiệp quyết sau.
- **Thay đổi sau review U1:** 2 comment giải thích ở `Platform/Errors/DbConstraintNames.cs` (không đổi code), thêm khi xử lý Smart App Control.
- **Tài liệu tự học `07-kiem-thu-va-demo.md`** có vài kết quả mong đợi khác thiết kế đã duyệt (A02: 400, A07: 200, khóa `email`); chỗ lệch ghi trong `integration-test-instructions.md`.
- **Commit:** thay đổi của Change Request FR8 (code U3, U4, file U2 dùng chung, tài liệu, dữ liệu mẫu, hồ sơ AI-DLC) chưa commit; Hiệp commit theo mục đích sau bước này.
- **Đã dùng hết 3 loop-back** của intent này (Loop-back 3 ở U4). Sửa thêm do Hiệp yêu cầu đi theo Change Request, không tính vào giới hạn.
- **Dữ liệu sai quy ước tên trên máy Hiệp:** "Nhân Sự", "Văn Phòng" (Hiệp tự nhập). Sửa bằng nút Sửa ở trang Phòng ban nếu muốn.
- **Minor đã ghi nhận, không sửa:** frontend chỉ nhận `departmentId` tối đa 9 chữ số; câu báo "phòng ban không còn" hiện lại khi F5 đúng mục lịch sử đó; trên màn hình cảm ứng tên phòng ban chỉ phân biệt bằng chữ đậm.
- **Đẩy lên GitHub và demo 15 phút**: việc của Hiệp sau khi xong bước này (`team.md`). Điền địa chỉ repo vào README mục 2 khi đã có.
- **Thư mục `C:\Users\ASUS\thu-clone-employee-crud`**: Hiệp quyết sau.
