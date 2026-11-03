# Kế hoạch sinh code: u1-backend-platform

## Summary

- Fix (Loop-back 1 từ Build and Test, Step 9): lỗi 400 do kiểm DTO trả đúng `application/problem+json` có `type`, `traceId`; `ErrorMapper` coi 23001 như 23503 ở tầng dự phòng (409); thêm 2 test hồi quy; cập nhật ghi chú lỗi 400 trong `docs/danh-sach-api.md`
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

### Step 9: Sửa lỗi Build and Test (Loop-back 1, 03/11/2026)

> **Vì sao có bước này:** Build and Test lượt 1 (`construction/build-and-test/test-results.md`, BT-01, BT-02) thấy hai mục Không đạt có gốc ở U1. Hiệp chọn sửa cả hai ở đầu Build and Test.
>
> - **BT-01:** lỗi 400 do kiểm DTO trả `Content-Type: application/json`, thiếu `type`, `traceId`, lệch hợp đồng C3 (404, 409 vẫn đúng). Gốc: `ValidationResponseFactory` trả `BadRequestObjectResult` (một `ObjectResult`); `[Produces("application/json")]` trên controller của U3, U4 là bộ lọc kết quả, ghi đè loại nội dung của mọi `ObjectResult`. Test hiện có (`PipelineTests` số 4) không bắt được vì `TestOnlyController` không gắn `[Produces]`.
> - **BT-02:** `ErrorMapper` chỉ nhận 23505, 23503; PostgreSQL 18 báo 23001 khi xóa phòng ban còn nhân viên (`ON DELETE RESTRICT`). Đường xóa thật đã an toàn vì `DepartmentService` (U4) tự bắt 23001; chỗ hở chỉ ở tầng dự phòng (trái NFR3.3 của U1).

Tầng logic (implement, rồi test ngay sau):

- [x] `Platform/Errors/ErrorMapper.cs`: thêm hằng `RestrictViolation = "23001"`; nhánh dự phòng nhận `23503` **hoặc** `23001` → 409 "Không thể thực hiện", detail chung như cũ. Comment giải thích vì sao có 23001.
- [x] `ErrorMapperTests.cs`: thêm 1 test: 23001 `fk_employees_department` → 409 "Không thể thực hiện" (11 → 12 test). Chạy lệnh test của U1, xanh.

Tầng API (implement, rồi test ngay sau):

- [x] `Platform/Errors/ValidationResponseFactory.cs`: thêm `Type = "https://tools.ietf.org/html/rfc9110#section-15.5.1"` và phần mở rộng `traceId` (cùng cách tính với 404/409: `Activity.Current?.Id ?? HttpContext.TraceIdentifier`); trả `JsonResult` với `StatusCode = 400`, `ContentType = "application/problem+json"` thay cho `BadRequestObjectResult`. Vì sao `JsonResult`: nó không phải `ObjectResult`, nên bộ lọc `[Produces]` của controller không ghi đè được. Giữ nguyên `title`, `status`, `errors` (khóa camelCase) để `client.ts` của U2 không phải sửa.
- [x] `TestOnlyController.cs`: thêm một endpoint gắn `[Produces("application/json")]` nhận DTO có `[Required]`, giống controller thật của U3, U4.
- [x] `PipelineTests.cs`: thêm test 9: gửi body thiếu trường tới endpoint đó → 400, `Content-Type` là `application/problem+json`, có `type` (RFC 9110 §15.5.1), có `traceId`, khóa camelCase (8 → 9 test). Chạy lệnh test của U1, xanh.

Kiểm và tài liệu:

- [x] `npm --prefix frontend run verify` (toàn bộ 94 + 2 = 96 test xanh); `dotnet format backend/EmployeeCrud.slnx --verify-no-changes` sạch.
- [x] Kiểm thật (backend `--launch-profile http`, PostgreSQL thật): `POST /api/departments` tên rỗng và `POST /api/employees` có `"departmentId": "abc"` → 400 `application/problem+json`, có `type`, có header CORS với Origin 5173. Không tạo dữ liệu (lời gọi bị từ chối).
- [x] `docs/danh-sach-api.md` (file của U5): bảng quy ước (dòng "Định dạng trả về khi lỗi 400") và ví dụ "Lỗi 400" ghi theo phản hồi thật mới; bỏ ghi chú "Lệch đã biết".
- [x] Cập nhật `code-summary.md` (thêm mục Loop-back 1), `unit-test-instructions.md` (số test 12 + 9), `source-manifest.json`, `traceability.json`.

Không đổi: controller của U3, U4 (giữ `[Produces]` cho tài liệu OpenAPI), `frontend/src/api/client.ts`, service của U3, U4.

### Step 10: Mỗi lỗi 500 chỉ ghi một dòng Error (Loop-back 2, 03/11/2026)

> **Vì sao có bước này:** Build and Test lượt 3, Hiệp tắt PostgreSQL thật (U1-NFR1.4 đạt). Đọc log thấy **một** lỗi 500 sinh **3 dòng `fail:`**: 2 dòng EF Core tự ghi (`Microsoft.EntityFrameworkCore.Database.Connection[20004]`, `Microsoft.EntityFrameworkCore.Query[10100]` kèm stack trace) rồi mới tới dòng của `ProblemDetailsExceptionHandler`. Trái NFR6.2 ("mỗi lỗi 500 ghi đúng một dòng mức Error"). Gốc: `appsettings.json` đặt `Microsoft.EntityFrameworkCore` ở `Warning` (để ẩn câu SQL, NFR6.1), nhưng mức `Warning` vẫn cho dòng Error của EF Core đi qua. Hiệp chọn sửa qua U1 (form ba368783). Chi tiết: `build-and-test/test-results.md` BT-03, Loop-back 2.

Implement (chỉ cấu hình, không đổi code C#):

- [x] `backend/EmployeeCrud.Api/appsettings.json`, mục `Logging:LogLevel`, thêm 3 dòng: `"Microsoft.EntityFrameworkCore.Database.Connection": "Critical"`, `"Microsoft.EntityFrameworkCore.Query": "Critical"`, `"Microsoft.EntityFrameworkCore.Update": "Critical"`. Vì sao không mất thông tin: lỗi nào không được xử lý vẫn tới `ProblemDetailsExceptionHandler`, dòng Error của nó đã có phương thức, đường dẫn, loại lỗi, thông điệp và cả stack trace của exception (kể cả exception bên trong của Npgsql). Còn lỗi ràng buộc đã được service xử lý thành 409 thì không nên ghi Error (NFR6.3). `Update` là nhóm EF ghi khi `SaveChanges` lỗi (chen nhau gây 23505/23503/23001).
- [x] Đọc `appsettings.Development.json` xem có ghi đè nhóm EF Core nào làm mất tác dụng không; nếu có thì báo Hiệp trước khi sửa.

Kiểm (không cần Admin, không tắt database thật):

- [x] Chạy một backend phụ cổng 5082, chuỗi kết nối trỏ tới cổng database không có ai nghe (đặt bằng biến môi trường `ConnectionStrings__Default` chỉ cho tiến trình đó, không có mật khẩu), gọi `GET /api/employees` một lần → 500 `application/problem+json` câu chung, log có **đúng 1 dòng `fail:`** (của `ProblemDetailsExceptionHandler`).
- [x] Backend phụ với chuỗi kết nối thật (user-secrets): `POST /api/employees` trùng email và `DELETE /api/departments/3` → 409, **0 dòng `fail:`**; `GET /api/employees` 200 (EF vẫn chạy bình thường).
- [x] `npm --prefix frontend run verify` xanh (96/96).
- [x] Cập nhật `code-summary.md` (mục Loop-back 2), `source-manifest.json`, `unit-test-instructions.md` (thêm ca kiểm tay log), `traceability.json` nếu cần.

Không đổi: code C#, test tự động, controller, service, frontend.

Sửa sau rà soát (Hiệp duyệt U1, chọn sửa R-07, R-08, R-09):

- [x] R-07: thêm `Microsoft.EntityFrameworkCore.Database.Command` = `Critical` vào `appsettings.json`; đổi dòng cùng tên trong `appsettings.Development.json` từ `Warning` sang `Critical`. Kiểm 8 yêu cầu thêm cùng email cùng lúc: 0 dòng `fail:`; ca DB không kết nối được vẫn 1 dòng.
- [x] R-08: ghi lý do bốn dòng `Critical` vào `code-summary.md` §5c.
- [x] R-09: ghi "chạy lại sau mỗi lần đổi cấu hình log hoặc nâng EF Core" vào ca kiểm tay của `unit-test-instructions.md`.

### Step 11: Sửa theo rà soát tổng thể (Change Request, 03/11/2026)

> **Vì sao có bước này:** trước khi chốt Build and Test, Hiệp yêu cầu rà toàn bộ "chuẩn như công ty thật, mọi góc". Ba chuyên gia AI-DLC rà độc lập (nghiệp vụ, bảo mật, kiến trúc); danh sách gộp ở `build-and-test/ra-soat-tong-the.md`. Hiệp chọn sửa cả 4 nhóm (form 34027473). Phần thuộc U1 (nền backend) ở dưới; mã trong ngoặc là mã trong file rà soát. Không thêm tính năng ngoài `docs/ke-hoach.md`.

Implement:

- [x] **(S-03) Chặn tên miền lạ:** `appsettings.json` đổi `"AllowedHosts": "*"` thành `"localhost;127.0.0.1;[::1]"`. Vì sao: chặn kiểu tấn công "DNS rebinding" (một trang web lạ trỏ tên miền của nó về máy anh để gọi API). Frontend gọi `http://localhost:5081` nên không bị ảnh hưởng.
- [x] **(S-05) Header bảo mật:** thêm `Platform/Security/SecurityHeaders.cs` (một hàm `UseSecurityHeaders()`, đặt đầu chuỗi xử lý) dùng `Response.OnStarting` để gắn cả vào phản hồi lỗi: mọi phản hồi có `X-Content-Type-Options: nosniff`; riêng `/api/*` thêm `Cache-Control: no-store` (không lưu họ tên, email vào bộ nhớ đệm) và `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'`. Không áp CSP cho `/swagger` (sẽ làm vỡ trang). `Program.cs` tắt header `Server: Kestrel` (`AddServerHeader = false`).
- [x] **(S-09) Bỏ bộ mã hóa "Unsafe":** `ValidationResponseFactory` đổi `JavaScriptEncoder.UnsafeRelaxedJsonEscaping` thành `JavaScriptEncoder.Create(UnicodeRanges.All)`: chữ Việt vẫn giữ nguyên, ký tự HTML (`<`, `>`, `&`, `'`, `"`) vẫn được mã hóa.
- [x] **(A-02) `traceId` trong log:** hai dòng log của `ProblemDetailsExceptionHandler` và dòng log của `StatusCodeProblemWriter` thêm `{TraceId}` (cùng giá trị `traceId` trong phản hồi: `Activity.Current?.Id ?? HttpContext.TraceIdentifier`), để dò được "lỗi lúc 10:03 là lỗi nào" như `docs/danh-sach-api.md` đã viết.
- [x] **(A-01) Request bị hủy không phải lỗi 500:** kiểm thật trước (backend phụ, tìm kiếm liên tiếp để giao diện hủy request cũ, đọc log). Nếu thấy dòng `fail:` thì sửa trong `ProblemDetailsExceptionHandler`: `OperationCanceledException` khi `RequestAborted` đã bị hủy thì chỉ ghi Information "Trình duyệt đã hủy request", không ghi Error, không ghi body. Nếu không thấy thì ghi kết quả kiểm, không sửa.
- [x] **(A-07) Dùng hằng có sẵn:** `ErrorMapper` dùng `PostgresErrorCodes.UniqueViolation`, `ForeignKeyViolation`, `RestrictViolation` của Npgsql thay vì tự gõ `"23505"`, `"23503"`, `"23001"`. Tên trường `name`/`email` giữ trong `ErrorMapper` (tầng nền không phụ thuộc ngược vào tầng nghiệp vụ), thêm comment nói rõ phải khớp với service.
- [x] **(S-07) Ghim phiên bản thư viện:** đổi `10.*` thành bản đang dùng thật: `Microsoft.EntityFrameworkCore`, `.Design`, `.Relational` = `10.0.14`; `Npgsql.EntityFrameworkCore.PostgreSQL` = `10.0.3`; project test: `Microsoft.AspNetCore.Mvc.Testing`, `Microsoft.EntityFrameworkCore.InMemory` = `10.0.14`. Vì sao: build hôm nay và tháng sau ra cùng một bản.
- [x] **(S-08) `.gitignore`:** thêm vào khối của dự án các mẫu file bí mật hay gặp: `*.pfx`, `*.p12`, `*.pem`, `*.key`, `secrets.json`, `.env.*` kèm ngoại lệ `!frontend/.env.development`.
- [x] **(A-12) `EmployeeCrud.Api.http`:** thay request 404 duy nhất bằng đủ 10 thao tác mẫu (gọi thử ngay trong VS Code), dữ liệu mẫu giả.

Test (viết sau khi code, chạy ngay):

- [x] `SecurityTests` (file mới; kế hoạch ban đầu ghi `PipelineTests`, sửa theo rà soát R-11): (1) Host lạ (`Host: evil.example`) → 400; (2) phản hồi 200 và phản hồi lỗi (404, 500) của `/api/...` đều có `X-Content-Type-Options: nosniff`, `Cache-Control: no-store`, CSP; (3) phản hồi 400 vẫn giữ chữ Việt và mã hóa `<` (thêm sau rà soát R-10). `LoggingTests` (file mới): `traceId` trong log trùng phản hồi; request bị hủy không ra Error (A-01, chờ có hạn theo R-13).
- [x] Sửa theo rà soát (Hiệp duyệt U1, chọn sửa R-10..R-13): R-10 test mã hóa `<`; R-11 sửa tên file test trong tài liệu; R-12 comment `SecurityHeaders` ghi rõ phản hồi 400 do Host lạ không có header (bộ lọc chạy trước); R-13 test hủy request chờ có hạn thay vì cố định 1 giây.
- [x] `npm --prefix frontend run verify` xanh; `dotnet format backend/EmployeeCrud.slnx --verify-no-changes` sạch.
- [x] Kiểm thật bằng backend phụ cổng 5082: `curl` với Host lạ → 400; header bảo mật có trên `/api/employees` (200) và trên lỗi 404; `/swagger` vẫn mở được; log lỗi có `TraceId` trùng `traceId` trong phản hồi.
- [x] Cập nhật `code-summary.md` (mục Step 11), `unit-test-instructions.md`, `source-manifest.json`.

Không đổi: luật nghiệp vụ, controller, service, frontend.

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
