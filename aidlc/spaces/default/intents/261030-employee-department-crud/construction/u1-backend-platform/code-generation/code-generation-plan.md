# Kế hoạch sinh code: u1-backend-platform

## Summary

- Builds: nền backend ASP.NET Core .NET 10 (đổi lỗi sang ProblemDetails tiếng Việt, CORS, OpenAPI, kết nối PostgreSQL qua AppDbContext) và project test xUnit
- Touches: `backend/` (solution, `EmployeeCrud.Api/`, `EmployeeCrud.Api.Tests/`), `.config/dotnet-tools.json`, `.editorconfig`, thêm một khối vào cuối `.gitignore`
- Tests: khoảng 19 test tự động: 11 unit test cho bộ đổi lỗi, 8 test chạy ứng dụng trong bộ nhớ (CORS, 400/404/405/415, thiếu chuỗi kết nối); không cần database thật

> **Nguồn:** `functional-design/` (functional-spec W1–W4, rules BR1.1–BR3.2, entities), `nfr-design/` (security, reliability, performance, observability, logical-components), `infrastructure-design/`, `inception/contract-design/contract-summary.md` (C3, C5), `inception/units-generation/unit-of-work.md` (U1), `inception/requirements-analysis/requirements.md`, `team.md`, `project.md`.

## Story → bước code

| Story / AC | Phần U1 làm | Bước |
|---|---|---|
| US4.1: AC4.1.2, phía API của AC4.1.3 | Lỗi 400/409 theo phong bì C3, tiếng Việt, khóa camelCase | 3, 4, 5, 6 |
| US5.1: AC5.1.2 | Chuỗi kết nối chỉ từ user-secrets; thiếu thì dừng và báo rõ | 1, 5, 6, 8 |
| US5.2: AC5.2.3, phần khung của AC5.2.4 | OpenAPI ở Development; mọi lỗi theo ProblemDetails | 5, 6, 7 |

## Những điều anh cần biết trước khi duyệt

1. **Gói NuGet tải về bộ đệm NuGet mặc định của máy** (`%USERPROFILE%\.nuget\packages`). Đây là cách `dotnet` luôn làm khi thêm gói vào một project, không phải cài công cụ toàn máy. `dotnet-ef` cài **cục bộ** qua tool manifest, không dùng `--global`.
2. **Thêm một gói ngoài danh sách trước:** `Swashbuckle.AspNetCore.SwaggerUI`. Lý do: BR2.4 đã duyệt yêu cầu "phục vụ tài liệu OpenAPI **và trang xem tài liệu**". .NET 10 chỉ tự sinh file JSON `/openapi/v1.json`, không có trang xem; gói này cho trang `/swagger` đọc đúng file đó. Chỉ bật ở Development. Nếu anh không muốn thêm gói, chọn Request Changes và em bỏ: khi đó xem tài liệu bằng cách mở file JSON hoặc nhập vào Postman.
3. **Sửa file `.gitignore` có sẵn:** chỉ **thêm** một khối mới ở cuối (bin/, obj/, ...), không đụng khối AI-DLC đang có.
4. **Kết nối database:** AI không kết nối, không gõ mật khẩu. Bước 8 viết hướng dẫn W4 để anh tự làm (`dotnet user-secrets set`, `dotnet ef database update`).
5. **Bỏ `UseHttpsRedirection` của template:** giữ chuỗi xử lý đúng 5 bước (NFR5.1). Nếu giữ, lời gọi từ Vite tới cổng http có thể bị chuyển hướng sang https và lỗi CORS khó hiểu.

## Các bước

### Step 1: Cấu trúc repo và cấu hình chạy thật

- [x] Thêm vào **cuối** `.gitignore` (sau khối AI-DLC) một khối mới: `bin/`, `obj/`, `*.user`, `.vs/`, `.env`, `node_modules/`, `dist/`, `TestResults/`, `coverage*/`.
- [x] `dotnet new editorconfig` ở thư mục gốc (quy ước C# chuẩn, `team.md` Code Style).
- [x] `dotnet new tool-manifest`, rồi `dotnet tool install dotnet-ef --version 10.*` (cục bộ, tạo `.config/dotnet-tools.json`).
- [x] `dotnet new sln -n EmployeeCrud -o backend`. .NET 10 tạo file `backend/EmployeeCrud.slnx`; mọi lệnh sau dùng đúng tên file sinh ra.
- [x] `dotnet new webapi --use-controllers -n EmployeeCrud.Api -o backend/EmployeeCrud.Api`, rồi thêm vào solution. Bỏ `WeatherForecast` và controller mẫu của template.
- [x] `dotnet user-secrets init --project backend/EmployeeCrud.Api` để `.csproj` có `UserSecretsId` (NFR2.1).
- [x] Thêm gói: `Npgsql.EntityFrameworkCore.PostgreSQL` 10.*, `Microsoft.EntityFrameworkCore.Design` 10.*, `Swashbuckle.AspNetCore.SwaggerUI`. Giữ `Microsoft.AspNetCore.OpenApi` của template.
- [x] `appsettings.json`: mức log theo `observability-design.md`, `Cors:AllowedOrigins: ["http://localhost:5173"]`. **Không có** khóa `ConnectionStrings`. `launchSettings.json`: `ASPNETCORE_ENVIRONMENT=Development`.

### Step 2: Dựng project test và lệnh chạy test của U1

- [x] `dotnet new xunit -n EmployeeCrud.Api.Tests -o backend/EmployeeCrud.Api.Tests`, thêm vào solution, tham chiếu `EmployeeCrud.Api`. Bỏ `UnitTest1.cs` mẫu.
- [x] Thêm gói `Microsoft.AspNetCore.Mvc.Testing` 10.*; giữ `coverlet.collector` của template.
- [x] Tạo thư mục `Platform/` trong project test; mọi test của U1 nằm trong namespace `EmployeeCrud.Api.Tests.Platform`.
- [x] Chạy `dotnet build backend/EmployeeCrud.Api.Tests/EmployeeCrud.Api.Tests.csproj` để chắc lệnh test của U1 (ghi trong `unit-test-instructions.md`) chạy được trước khi viết test đầu tiên.

### Step 3: Tầng logic: kiểu lỗi và bộ đổi lỗi (implement)

Thư mục `backend/EmployeeCrud.Api/Platform/Errors/`:

- [x] `DomainError` (kế thừa `Exception`): `Kind` (NotFound, Validation, Conflict), `Field` (camelCase, có thể rỗng), `Title` (ghi đè, có thể rỗng), `Message`. Hàm tạo nhanh `DomainError.NotFound(...)`, `Validation(field, ...)`, `Conflict(..., field?, title?)` (entities.md, C5).
- [x] `DbConstraintNames`: ba hằng `ux_departments_name`, `ux_employees_email`, `fk_employees_department`.
- [x] `ErrorMapper.Map(Exception)`: hàm thuần, không đụng HTTP, trả về `ProblemDetails` (hoặc `ValidationProblemDetails` khi có `errors`). Tách riêng để test dễ và để anh giải thích được từng nhánh:
  - `DomainError` NotFound → 404 "Không tìm thấy" (BR1.1).
  - `DomainError` Validation → 400 "Dữ liệu không hợp lệ" + `errors` (BR1.2).
  - `DomainError` Conflict có field → 409 "Dữ liệu bị trùng" + `errors`; không field → 409, title của lỗi hoặc "Không thể thực hiện", kèm `detail` (BR1.3).
  - `DbUpdateException` bọc `PostgresException` 23505: `ux_departments_name` → 409 `errors.name`; `ux_employees_email` → 409 `errors.email`; tên khác → 500 (BR1.4).
  - 23503 mà service không bắt → 409 "Không thể thực hiện", detail chung (đường dự phòng, `security-design.md` §4).
  - `BadHttpRequestException` → **giữ đúng mã của nó**: 400 → "Dữ liệu không hợp lệ" + `errors.body`; mã khác (ví dụ 413) → title chung tiếng Việt.
  - Mọi lỗi khác → 500 "Lỗi máy chủ", detail "Đã có lỗi xảy ra, vui lòng thử lại sau." Không lộ thông điệp gốc (BR1.6, NFR2.3).
  - Mã trả về luôn là 4xx hoặc 5xx (NFR3.3).

### Step 4: Tầng logic: viết và chạy test (sau khi code)

- [x] `backend/EmployeeCrud.Api.Tests/Platform/ErrorMapperTests.cs`, 11 test: NotFound → 404; Validation → 400 có `errors`; Conflict có field → 409 `errors`; Conflict không field với title riêng → 409 `detail`; 23505 `ux_departments_name` → 409 `errors.name`; 23505 `ux_employees_email` → 409 `errors.email`; 23505 tên lạ → 500; 23503 → 409 dự phòng; `BadHttpRequestException` 400 → 400 `errors.body`; `BadHttpRequestException` 413 giữ 413; lỗi lạ → 500 và `detail` không chứa thông điệp gốc.
- [x] `PostgresException` giả được dựng bằng constructor công khai của Npgsql, bọc trong `DbUpdateException`.
- [x] Chạy lệnh test của U1 (bước 2). Tất cả phải xanh trước khi sang bước 5.

### Step 5: Tầng API: chuỗi xử lý request (implement)

Thư mục `backend/EmployeeCrud.Api/Platform/`:

- [x] `ProblemDetailsExceptionHandler : IExceptionHandler`: gọi `ErrorMapper`; ghi log Error `"Lỗi không xử lý: {Method} {Path}"` kèm lỗi cho 5xx, Information `"{Status} {Method} {Path}"` cho 4xx (không thêm middleware log riêng); **áp lại CORS** bằng `ICorsService` + `ICorsPolicyProvider` sau khi bộ bắt lỗi đã xóa header (điểm rà soát NFR Design); viết phản hồi qua `IProblemDetailsService`, kiểu `application/problem+json` (BR1.8).
- [x] Bộ đổi lỗi kiểm dữ liệu (`InvalidModelStateResponseFactory`): 400 "Dữ liệu không hợp lệ", đổi khóa sang camelCase (`Name` → `name`, `$.departmentId` → `departmentId`); lỗi đọc JSON không xác định được trường → `body: ["Dữ liệu gửi lên không đúng định dạng JSON"]` (BR1.2, BR1.7).
- [x] Trang mã trạng thái (`UseStatusCodePages`): 404 "Không tìm thấy" + detail "Không có đường dẫn API này.", 405 "Phương thức không được hỗ trợ", 415 "Kiểu dữ liệu không được hỗ trợ" + detail "Hãy gửi JSON (Content-Type: application/json)." Ghi log Information cho các mã này (BR1.7).
- [x] CORS: chính sách đọc `Cors:AllowedOrigins`, cho GET, POST, PUT, DELETE và header `Content-Type`, không credential, không `*` (BR2.3, NFR7.1).
- [x] `AppDbContext` (`Platform/Data/`): khung trống, gọi `ApplyConfigurationsFromAssembly` để U3, U4 tự thêm cấu hình thực thể (C5). Đăng ký `AddDbContext` vòng đời theo request, chuỗi kết nối đọc lúc tạo ngữ cảnh (BR3.1, NFR5.2). Không retry (NFR1.4).
- [x] `Program.cs`: thứ tự `UseCors` → `UseExceptionHandler` → `UseStatusCodePages` → định tuyến → controller (`security-design.md` §2). Development: `MapOpenApi()` và trang `/swagger` đọc `/openapi/v1.json` (BR2.4). JSON camelCase, bỏ qua trường lạ (mặc định, BR2.5). Không chạy migration lúc khởi động (NFR5.3).
- [x] Kiểm chuỗi kết nối **sau** `builder.Build()`: rỗng thì log Critical lời hướng dẫn tiếng Việt (không in giá trị nào), rồi **ném ngoại lệ** (không `Environment.Exit`). Nhờ vậy `dotnet ef` vẫn chạy được, vì công cụ này dừng chương trình ngay sau khi build (BR2.1, NFR1.1).
- [x] Cuối `Program.cs` thêm `public partial class Program { }` để project test dựng được ứng dụng.

### Step 6: Tầng API: viết và chạy test (sau khi code)

- [x] `Platform/PlatformWebAppFactory.cs`: `WebApplicationFactory<Program>` với môi trường `Testing` (không nạp user-secrets thật của anh), chuỗi kết nối giả **không có mật khẩu** (`Host=localhost;Database=employee_crud_test`), và controller chỉ có trong test, đăng ký qua `AddApplicationPart`. Không test nào mở kết nối database.
- [x] `Platform/TestOnlyController.cs`: một endpoint ném lỗi lạ, một ném `DomainError.Conflict`, một nhận DTO có luật `[Required]`.
- [x] `Platform/PipelineTests.cs`, 8 test:
  1. Lỗi lạ, Origin `http://localhost:5173` → 500 problem+json **và** có `Access-Control-Allow-Origin`.
  2. Đường dẫn lạ, cùng Origin → 404 problem+json, có header CORS.
  3. Origin `http://evil.example` → không có `Access-Control-Allow-Origin`.
  4. DTO thiếu trường → 400, title "Dữ liệu không hợp lệ", khóa camelCase.
  5. JSON hỏng → 400, có `errors`.
  6. Sai phương thức → 405 problem+json.
  7. Sai Content-Type → 415 problem+json.
  8. Thiếu chuỗi kết nối → khởi động ném lỗi.
- [x] Chạy lệnh test của U1; tất cả xanh. Nếu test 1 hỏng thì sửa cơ chế áp lại CORS trong bộ bắt lỗi, **không bỏ test**.

### Step 7: Cấu hình môi trường và build

- [x] `dotnet build backend/EmployeeCrud.slnx`: 0 lỗi.
- [x] `dotnet format backend/EmployeeCrud.slnx --verify-no-changes`; nếu báo khác thì chạy `dotnet format` rồi kiểm lại.
- [x] Quét bí mật: `git grep --untracked -i -n -E "(password|pwd)\s*=" -- backend` phải ra 0 dòng. Có `--untracked` vì ở commit đầu mọi file còn chưa được Git theo dõi (điểm rà soát Infrastructure Design).

### Step 8: Tài liệu và truy vết

- [x] Viết `code-summary.md`: file đã tạo, quyết định chính, kết quả test, và **hướng dẫn W4 để anh tự kết nối database**:
  1. Kiểm dịch vụ `postgresql-x64-18` đang chạy.
  2. (Tùy chọn) tạo `employee_db` trong pgAdmin. Nếu chưa tạo, `database update` tự tạo khi tài khoản có quyền.
  3. `dotnet user-secrets set "ConnectionStrings:Default" "Host=localhost;Port=5432;Database=employee_db;Username=<tài khoản>;Password=<mật khẩu>" --project backend/EmployeeCrud.Api`.
  4. `dotnet tool restore`, rồi `dotnet ef database update --project backend/EmployeeCrud.Api`. Không đọc được user-secrets thì thêm `-- --environment Development`.
  5. Đạt khi pgAdmin thấy bảng `__EFMigrationsHistory` trong `employee_db`. Nếu EF Core 10 không tạo bảng khi chưa có migration, dùng `dotnet ef migrations list`: lệnh này phải kết nối được và không báo lỗi.
  6. `dotnet run --project backend/EmployeeCrud.Api`, mở `/swagger` và gọi `GET /api/khong-ton-tai` bằng Postman: 404 tiếng Việt.
- [x] Ghi `source-manifest.json` và `traceability.json` (BR, NFR, AC của U1 → file code hoặc test).
- [x] Các điểm rà soát chuyển cho unit sau, ghi vào `code-summary.md`: U2 đặt Vite `server.strictPort: true`; trước U3 chọn cách đọc độ phủ 80% (`dotnet-reportgenerator-globaltool` cục bộ hoặc ngưỡng của coverlet); README (U5) ghi `update 0` và thứ tự lùi database trước rồi mới `git revert`.

## Không làm trong U1

- Không có thực thể, migration hay endpoint nghiệp vụ (U3, U4).
- Không Dockerfile, không IaC, không CI (`project.md` Forbidden).
- Không viết README (U5 sở hữu, rủi ro R-01 đã chấp nhận ở Units Generation); hướng dẫn chạy tạm nằm trong `code-summary.md`.
- Không có `data-testid`: U1 không có giao diện.

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "team",
  "ordering": "Với mỗi Unit, viết code tầng service trước, sau đó viết và chạy ngay unit test cho service đó; controller, migration và giao diện React được kiểm thủ công bằng Postman, pgAdmin và trình duyệt sau khi code xong.",
  "scope": "classic",
  "test_strategy": "standard",
  "project_type": "greenfield",
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
    "strategy": "standard",
    "strategy_volume": [
      "Five to eight tests per component.",
      "Unit tests plus integration tests for key boundaries.",
      "Add E2E, performance, or security tests when requirements demand them."
    ],
    "scope_floor": [
      "Keep the existing test suite green.",
      "This scope adds no extra new-test floor beyond the selected test strategy."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
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
      "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
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
  "input_sha256": "sha256:b6b872fd21e0c58c5bf1fd46fdd8da37894b85fe9b7d7660b7e84c38818ce401",
  "contract_sha256": "sha256:dfce3d5b6be371bd60bc264d51eb2b2a5627226310edfc05af4c94d5234aa0cb"
}
```

Các tầng không áp dụng ở U1: "Data model / database behavior" và "Repository / data access" (U1 chưa có bảng hay truy vấn nào; U3, U4 thêm), "Frontend behavior" (U2). Tầng "Business logic" ở U1 là bộ đổi lỗi `ErrorMapper` (bước 3–4); tầng "API / endpoint" là chuỗi xử lý request (bước 5–6).
