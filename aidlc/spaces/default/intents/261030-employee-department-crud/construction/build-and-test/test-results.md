# Kết quả Build and Test

> **Nguồn lệnh:** `unit-test-instructions.md` của U1–U5 (mỗi lệnh khác nhau chạy một lần), `build-instructions.md`, `integration-test-instructions.md`. Đối chiếu với `code-summary.md` và `code-generation-plan.md` (Testing Contract) của từng Unit.
>
> Máy: Windows 11, .NET SDK 10.0.403, Node 24.15.0, PostgreSQL 18.6. Giờ ghi theo UTC (giờ Việt Nam = UTC + 7).

## Lượt chạy 1 — 2026-11-02T18:29Z

**Kết quả: KHÔNG ĐẠT** (2 mục tiêu Không đạt, có gốc ở code U1) → quay lại Code Generation U1 (Loop-back 1, cuối file).

### 1. Build

| Lệnh | Mã thoát | Kết quả |
|---|---|---|
| `npm --prefix frontend run verify` (typecheck → lint → format:check → build → `dotnet test` cả solution) | 0 | `tsc` 0 lỗi; ESLint 0 lỗi, 0 cảnh báo; Prettier sạch; Vite build: JS 281,46 KB (nén 88,00 KB), CSS 6,50 KB; backend build 0 lỗi |
| `dotnet format backend/EmployeeCrud.slnx --verify-no-changes` | 0 | Sạch |
| `npm --prefix frontend audit --omit=dev` | 0 | 0 lỗ hổng (gói chạy trong trình duyệt) |

### 2. Unit test

| Lệnh (nguồn) | Mã thoát | Đạt / Tổng |
|---|---|---|
| `dotnet test ../backend/EmployeeCrud.slnx` (trong `verify`) | 0 | **94 / 94** |
| U1: `dotnet test backend/EmployeeCrud.Api.Tests/EmployeeCrud.Api.Tests.csproj --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Platform"` | 0 | 19 / 19 |
| U3: `dotnet test backend/EmployeeCrud.slnx --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Departments"` | 0 | 28 / 28 (25 của U3 + D1–D3 của U4) |
| U4: `dotnet test backend/EmployeeCrud.slnx --filter "...Employees\|...Departments"` | 0 | 75 / 75 |
| U2: `lint`, `typecheck`, `format:check`, `build` | 0 | Đạt (chạy trong `verify`, cùng lệnh) |
| U5: T1–T6 (PowerShell) | — | T1 = 10; T2: 4 mục lỗi (400, 404, 409 ×2), 5 dòng `problem+json`; T3 = 3; T4 = 12 mục; T5 = 4; T6: 3 dòng `Password=` đều là `$p`, mẫu tìm-thay hoặc `***` |

Không có test bị bỏ qua, không có test lỗi.

### 3. Độ phủ (`npm --prefix frontend run coverage`, mã thoát 0)

Báo cáo: `backend/TestResults/coverage-report/index.html`, `Summary.txt` (coverlet + reportgenerator 5.5.12).

| Lớp | Độ phủ dòng | Mức sàn |
|---|---|---|
| `EmployeeCrud.Api.Departments.DepartmentService` | **100%** | ≥ 80% (`team.md`) → Đạt |
| `EmployeeCrud.Api.Employees.EmployeeService` | **100%** | ≥ 80% → Đạt |
| `ErrorMapper` / `ValidationResponseFactory` / `StatusCodeProblemWriter` / `ProblemDetailsExceptionHandler` | 97,6% / 95,8% / 93,5% / 80% | Không có mức sàn riêng |
| Cả assembly (gồm controller, migration không có test tự động theo `team.md`) | 43,3% | Không phải tiêu chí; ghi để minh bạch |

### 4. Gọi API thật (backend `--launch-profile http`, PostgreSQL thật, `HttpClient` của PowerShell)

| # | Lời gọi | Kết quả |
|---|---|---|
| 1 | `POST /api/departments` `{"name":""}`, Origin 5173 | 400, **`Content-Type: application/json; charset=utf-8`**, body `{"title":"Dữ liệu không hợp lệ","status":400,"errors":{"name":[...]}}` — **không có `type`, không có `traceId`** |
| 2 | `POST /api/employees` họ tên rỗng + email "abc" + `departmentId` null | 400 như trên, chỉ có `errors.fullName` (thiết kế U4: báo lỗi đầu tiên) |
| 3 | `POST /api/employees` `"departmentId":"abc"` | 400 (không 500), `errors.departmentId` "Giá trị không đúng kiểu dữ liệu" kèm `errors.body`; Content-Type như #1 |
| 4 | `GET /api/khong-ton-tai` ×10 | 404 `application/problem+json`; trung vị **0,55 ms** (0,3–3 ms) |
| 5 | CORS trên 404 | Origin 5173 → `Access-Control-Allow-Origin: http://localhost:5173`; origin lạ → không có header |
| 6 | `POST /api/departments` "Kế toán" (trùng) | 409 `application/problem+json`, có `type` RFC 9110 §15.5.10, `errors.name`, có header CORS; 567 ms (lần ghi đầu sau khởi động) |
| 7 | `POST /api/departments` body 40 KB | 400 `problem+json` "Tên phòng ban tối đa 100 ký tự" (service). Không có giới hạn 32 KB: đã bỏ có chủ đích ở NFR Design U1 |
| 8 | Thời gian, 3 lần lấy lớn nhất | `/api/departments` 61,9 ms; `/api/employees` 22,5 ms; `?search=an` 11,6 ms |
| 9 | OpenAPI | `/openapi/v1.json`: 4 đường dẫn, **10 thao tác**; `/swagger/index.html` 200 |
| 10 | Khởi động | `dotnet run --no-build`: API trả lời trong chưa tới 1 giây kể từ lúc bắt đầu chờ |

Không tạo hay xóa dữ liệu nào ở lượt này (mọi lời gọi ghi đều bị từ chối).

### 5. Quét

| Lệnh | Kết quả |
|---|---|
| `git grep --untracked -i -n -E '(password\|pwd)\s*=\|"password"\s*:' -- backend frontend` | 0 dòng |
| `git grep --untracked -n -E 'dangerouslySetInnerHTML\|innerHTML\|eval\(\|new Function\|FromSqlRaw\|ExecuteSqlRaw\|mailto:\|EnableSensitiveDataLogging' -- backend frontend/src` | 0 dòng |
| `git grep -n 'credentials' -- frontend/src` | 0 dòng |
| Trường `static` trong backend (trừ migration) | Chỉ `static readonly Regex EmailPattern`, `static readonly Expression ToDto` (không giữ dữ liệu) |
| `git log -- <2 file migration>` | Mỗi file đúng 1 commit (`ca66dbf`, `b3bc5e4`): chưa bị sửa sau khi tạo |

### 6. Chi tiết lỗi

**BT-01 (Không đạt, C3-400).** Lỗi 400 do kiểm DTO trả `application/json`, thiếu `type`. Hợp đồng C3 (`inception/contract-design/contract-summary.md`) yêu cầu `application/problem+json` có `type`, như 404 và 409 (vẫn đúng). Gốc: `ValidationResponseFactory.Create` (U1) có đặt `ContentTypes = { "application/problem+json" }`, nhưng `[Produces("application/json")]` trên `DepartmentsController` (U3) và `EmployeesController` (U4) là bộ lọc kết quả, ghi đè loại nội dung của `BadRequestObjectResult`. `ValidationProblemDetails` được dựng tay nên không có `type`, `traceId`. Ảnh hưởng: `frontend/src/api/client.ts` (`readProblem`) chỉ đọc body khi có `application/problem+json`, nên với loại 400 này giao diện chỉ hiện câu chung. Trên giao diện ít gặp, vì form React tự kiểm trước khi gửi; ảnh hưởng chính là API lệch hợp đồng (Postman, tài liệu API).

**BT-02 (Không đạt, U1-NFR3.3).** `ErrorMapper.MapPostgres` (U1) chỉ nhận 23505 và 23503; PostgreSQL 18 báo **23001** (restrict_violation) khi xóa phòng ban còn nhân viên (`ON DELETE RESTRICT`, thấy thật ở U4 và U5). Đi tới tầng dự phòng này thì 23001 + ràng buộc đã biết `fk_employees_department` ra 500. Đường xóa thật đã an toàn vì `DepartmentService.DeleteAsync` (U4) tự bắt cả 23503 và 23001; chỗ hở chỉ ở tầng dự phòng, trái NFR3.3 của U1.

### 7. Chưa kiểm ở lượt này (làm một lần sau khi sửa U1)

Luồng chính trên trình duyệt (F, V; Hiệp), Lighthouse 6 trang và Best Practices, W3C Validator, danh sách WCAG, hạn 10 giây (E1), tắt PostgreSQL giữa chừng (U1 NFR1.4), console sạch (E2).

## Loop-Back Log

### Loop-back 1 — 2026-11-02T18:29:13Z

- **Diagnosis:** BT-01 (400 do kiểm DTO trả `application/json`, thiếu `type`, vì `[Produces("application/json")]` của controller ghi đè loại nội dung mà `ValidationResponseFactory` đặt) và BT-02 (`ErrorMapper` không nhận 23001 nên tầng dự phòng trả 500).
- **Root-cause stage:** `code-generation`, Unit `u1-backend-platform` (`Platform/Errors/ValidationResponseFactory.cs`, `Platform/Errors/ErrorMapper.cs`). Không mở lại U3, U4: sửa ở tầng sở hữu phong bì lỗi C3.
- **Planned fix:** (1) `ValidationResponseFactory` trả 400 bằng kết quả mà bộ lọc `[Produces]` không ghi đè được, `Content-Type: application/problem+json`, thêm `type` (RFC 9110 §15.5.1) và `traceId` như 404/409; giữ nguyên `title`, `status`, `errors` (khóa camelCase). (2) `ErrorMapper` coi 23001 như 23503 ở tầng dự phòng → 409 "Không thể thực hiện". (3) Test hồi quy: một controller chỉ có trong test gắn `[Produces("application/json")]` gửi body sai → 400 `application/problem+json` có `type`; `ErrorMapperTests` thêm ca 23001 → 409. Hiệp duyệt lại kế hoạch sửa của U1 trước khi sửa (Hiệp chọn hai việc này ở đầu Build and Test).
- **Estimated impact:** công sức nhỏ (2 file code, 2–3 test, chạy lại bộ test và rà soát; khoảng 1 giờ kể cả duyệt); chi phí tiền 0; rủi ro thấp: chỉ đổi đường 400 do kiểm DTO và một nhánh dự phòng, 94 test hiện có canh giữ, hình dạng JSON chỉ thêm trường (`type`, `traceId`), `client.ts` không cần sửa.
