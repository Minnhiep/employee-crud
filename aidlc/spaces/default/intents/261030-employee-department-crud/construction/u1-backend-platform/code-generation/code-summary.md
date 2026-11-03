# Tóm tắt code: u1-backend-platform

> **Nguồn:** `code-generation-plan.md` (đã duyệt), `unit-test-instructions.md`, kết quả chạy lệnh ngày 2026-11-01.

## 1. File đã tạo hoặc sửa

| File | Việc |
|---|---|
| `.gitignore` | Sửa: thêm một khối ở cuối (`bin/`, `obj/`, `*.user`, `.vs/`, `.env`, `node_modules/`, `dist/`, `TestResults/`, `coverage*/`); khối AI-DLC giữ nguyên |
| `.editorconfig` | Tạo bằng `dotnet new editorconfig` |
| `dotnet-tools.json` | Tạo: `dotnet-ef` 10.0.14 cài cục bộ |
| `backend/EmployeeCrud.slnx` | Solution gồm 2 project |
| `backend/EmployeeCrud.Api/EmployeeCrud.Api.csproj` | Project API, có `UserSecretsId` |
| `backend/EmployeeCrud.Api/Program.cs` | Đăng ký dịch vụ và chuỗi xử lý request |
| `backend/EmployeeCrud.Api/appsettings.json`, `appsettings.Development.json` | Mức log, `Cors:AllowedOrigins`; **không có** `ConnectionStrings` |
| `backend/EmployeeCrud.Api/Properties/launchSettings.json` | Của template: `http://localhost:5081`, `https://localhost:7205`, môi trường Development |
| `backend/EmployeeCrud.Api/EmployeeCrud.Api.http` | Sửa: bỏ ví dụ WeatherForecast, thay bằng `GET /api/khong-ton-tai` |
| `backend/EmployeeCrud.Api/Platform/Errors/DomainError.cs` | Kiểu lỗi nghiệp vụ NotFound / Validation / Conflict |
| `backend/EmployeeCrud.Api/Platform/Errors/DbConstraintNames.cs` | Ba tên ràng buộc cố định cho U3, U4 |
| `backend/EmployeeCrud.Api/Platform/Errors/ErrorTitles.cs` | Mọi câu báo lỗi tiếng Việt ở một chỗ |
| `backend/EmployeeCrud.Api/Platform/Errors/ErrorMapper.cs` | Hàm thuần đổi exception → ProblemDetails |
| `backend/EmployeeCrud.Api/Platform/Errors/ProblemDetailsExceptionHandler.cs` | Bộ bắt lỗi toàn cục, ghi log, áp lại CORS |
| `backend/EmployeeCrud.Api/Platform/Errors/ValidationResponseFactory.cs` | 400 tiếng Việt, khóa camelCase |
| `backend/EmployeeCrud.Api/Platform/Errors/StatusCodeProblemWriter.cs` | Nội dung cho 404/405/415 |
| `backend/EmployeeCrud.Api/Platform/Cors/CorsSetup.cs` | Chính sách CORS một origin |
| `backend/EmployeeCrud.Api/Platform/Data/AppDbContext.cs` | Ngữ cảnh database dùng chung (khung trống) |
| `backend/EmployeeCrud.Api/Platform/StartupChecks.cs` | Thiếu chuỗi kết nối thì dừng và hướng dẫn |
| `backend/EmployeeCrud.Api.Tests/EmployeeCrud.Api.Tests.csproj` | Project test xUnit + coverlet + Mvc.Testing |
| `backend/EmployeeCrud.Api.Tests/Platform/ErrorMapperTests.cs` | 11 unit test |
| `backend/EmployeeCrud.Api.Tests/Platform/PipelineTests.cs` | 8 test chạy ứng dụng trong bộ nhớ |
| `backend/EmployeeCrud.Api.Tests/Platform/PlatformWebAppFactory.cs` | Dựng ứng dụng trong bộ nhớ, môi trường Testing |
| `backend/EmployeeCrud.Api.Tests/Platform/TestOnlyController.cs` | Controller chỉ có trong test |
| Đã xóa | `WeatherForecast.cs`, `Controllers/WeatherForecastController.cs`, `UnitTest1.cs` (file mẫu của template) |

**Gói NuGet (bản thật đã tải):** `Npgsql.EntityFrameworkCore.PostgreSQL` 10.0.3, `Microsoft.EntityFrameworkCore` 10.0.14, `Microsoft.EntityFrameworkCore.Design` 10.0.14, `Swashbuckle.AspNetCore.SwaggerUI` 10.3.1, `Microsoft.AspNetCore.OpenApi` 10.0.14; test: `Microsoft.AspNetCore.Mvc.Testing` 10.0.14, `xunit` 2.9.3, `coverlet.collector` 6.0.4.

## 2. Quyết định chính

| Quyết định | Vì sao |
|---|---|
| `ErrorMapper` là hàm thuần, tách khỏi bộ bắt lỗi | Test từng nhánh mà không cần chạy web; dễ giải thích "lỗi nào ra mã nào" |
| Chuỗi xử lý: CORS → bắt lỗi → trang mã trạng thái → định tuyến → controller | Đúng `security-design.md` §2; gọi `UseRouting()` rõ ràng để thứ tự không bị framework tự đổi |
| Bộ bắt lỗi tự áp lại CORS bằng `ICorsService` | Bộ bắt lỗi xóa header trước khi ghi lỗi; test 1 chứng minh phản hồi 500 vẫn có `Access-Control-Allow-Origin` |
| `SuppressMapClientErrors = true` và `StatusCodeProblemWriter` ghi thẳng JSON | Để 404/405/415 do framework sinh ra có title tiếng Việt. Ghi thẳng vì với request đã vào controller, `IProblemDetailsService` giao cho bộ ghi của MVC, mà bộ này bị tắt nên không ghi gì (test 415 đã bắt được lỗi này) |
| Kiểm chuỗi kết nối **sau** `Build()`, ném ngoại lệ | `dotnet ef` dừng chương trình ngay sau `Build()` nên vẫn chạy được; test kiểm được trường hợp thiếu |
| `AddDbContext` đọc chuỗi kết nối lúc tạo ngữ cảnh | Khởi động và test không mở kết nối database |
| Bỏ `UseHttpsRedirection`, `UseAuthorization` của template | Giữ 5 bước (NFR5.1); không có đăng nhập |

## 3. Khác kế hoạch (anh đã biết hoặc đã chọn)

1. **Tool manifest ở `dotnet-tools.json` tại thư mục gốc**, không phải `.config/dotnet-tools.json`: .NET 10 tự đặt ở gốc; `dotnet tool restore` vẫn tìm thấy.
2. **Thêm `Microsoft.EntityFrameworkCore` 10.*** vào project API (anh chọn): Npgsql kéo EF 10.0.4, gói Design kéo 10.0.14; ghim rõ để mọi nơi dùng 10.0.14, hết cảnh báo MSB3277.
3. **Câu hướng dẫn thiếu chuỗi kết nối không in sẵn phần mật khẩu** (anh chọn): để bước quét bí mật ra 0 dòng. Câu báo bảo anh tự thêm `;Password` + dấu bằng + mật khẩu vào cuối.
4. **Lệnh chạy ở phiên chính, anh duyệt từng lệnh** (anh chọn), thay vì giao cho agent chạy một mạch: lệnh tạo project bị chặn quyền khi agent chạy.
5. `StatusCodeProblemWriter` ghi JSON trực tiếp (xem mục 2), vì cách qua `IProblemDetailsService` làm 415 trả thân rỗng.

## 4. Kết quả kiểm

| Kiểm | Lệnh | Kết quả |
|---|---|---|
| Build | `dotnet build backend/EmployeeCrud.slnx` | Đạt, 0 cảnh báo, 0 lỗi |
| Định dạng | `dotnet format backend/EmployeeCrud.slnx --verify-no-changes` | Đạt (sau khi chạy `dotnet format` một lần để sửa kiểu xuống dòng CRLF) |
| Test U1 | `dotnet test backend/EmployeeCrud.Api.Tests/EmployeeCrud.Api.Tests.csproj --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Platform"` | **19/19 đạt** (11 `ErrorMapperTests` + 8 `PipelineTests`) |
| Độ phủ (thêm `--collect:"XPlat Code Coverage"`) | coverlet | `ErrorMapper` 97,7%, `ValidationResponseFactory` 95,8%, `StatusCodeProblemWriter` 85,7%, `ProblemDetailsExceptionHandler` 100%, `StartupChecks` 100%, `CorsSetup` 100%; `AppDbContext` 0% (khung trống, U3/U4 dùng) |
| Quét bí mật | `git grep --untracked -i -n -E "(password\|pwd)\s*=" -- backend` | 0 dòng |

Mức sàn 80% của **các lớp service** chưa áp dụng ở U1 (chưa có service); Build and Test kiểm trên toàn bộ bộ test sau U3, U4.

**Test viết nhưng chưa chạy:** không có. **Chưa kiểm:** kết nối PostgreSQL thật và trang `/swagger` (cần anh tự làm theo mục 5, vì AI không kết nối database).

## 5. Hướng dẫn W4: anh tự kết nối database

Chạy ở thư mục `employee-crud/`. AI không chạy các bước này và không gõ mật khẩu.

1. Kiểm dịch vụ PostgreSQL đang chạy: mở **Services** của Windows, tìm `postgresql-x64-18`, trạng thái **Running**.
2. (Tùy chọn) Trong pgAdmin, tạo database `employee_db`. Nếu chưa tạo, `dotnet ef database update` tự tạo khi tài khoản có quyền tạo database.
3. Đặt chuỗi kết nối vào user-secrets (thay `<tài khoản>` và `<mật khẩu>` bằng của anh):
   ```
   dotnet user-secrets set "ConnectionStrings:Default" "Host=localhost;Port=5432;Database=employee_db;Username=<tài khoản>;Password=<mật khẩu>" --project backend/EmployeeCrud.Api
   ```
   Giá trị này lưu ở `%APPDATA%\Microsoft\UserSecrets\a298b5b5-553b-4de6-bd94-7107af3cbb98\secrets.json`, ngoài repo nên không thể lỡ commit.
4. Lấy công cụ `dotnet ef` cục bộ, rồi chạy cập nhật database:
   ```
   dotnet tool restore
   dotnet ef database update --project backend/EmployeeCrud.Api
   ```
   Nếu lệnh báo thiếu chuỗi kết nối, thêm `-- --environment Development` vào cuối.
5. **Đạt khi:** lệnh không báo lỗi, và pgAdmin thấy bảng `__EFMigrationsHistory` trong `employee_db` (Schemas → public → Tables; bấm Refresh). Nếu bảng không xuất hiện khi chưa có migration nào, chạy `dotnet ef migrations list --project backend/EmployeeCrud.Api`: đạt khi lệnh kết nối được và báo "No migrations were found" mà không có lỗi kết nối.
6. Chạy backend: `dotnet run --project backend/EmployeeCrud.Api`, rồi:
   - mở `http://localhost:5081/swagger`: trang tài liệu hiện ra (chưa có endpoint nào cho tới U3);
   - Postman `GET http://localhost:5081/api/khong-ton-tai`: 404, `Content-Type: application/problem+json`, title "Không tìm thấy".
7. Nếu lỗi: dán thông báo lỗi để em chỉ cách sửa. Hay gặp: sai mật khẩu (`28P01`), dịch vụ chưa chạy (`Connection refused`), chưa có database và tài khoản không có quyền tạo (`3D000`).

## 5b. Loop-back 1 từ Build and Test (03/11/2026, Step 9)

Build and Test lượt 1 (`construction/build-and-test/test-results.md`, BT-01, BT-02) thấy hai lỗi có gốc ở U1. Hiệp duyệt lại kế hoạch (Step 9) rồi mới sửa.

| Lỗi | Gốc | Đã sửa |
|---|---|---|
| BT-01: 400 do kiểm DTO trả `application/json`, thiếu `type`, `traceId` (lệch C3) | `[Produces("application/json")]` trên controller U3, U4 là bộ lọc kết quả, ghi đè loại nội dung của `BadRequestObjectResult` (một `ObjectResult`) | `ValidationResponseFactory` trả `JsonResult` (không phải `ObjectResult`, bộ lọc không đè được), `Content-Type: application/problem+json`, thêm `type` RFC 9110 §15.5.1 và `traceId` như 404/409 |
| BT-02: `ErrorMapper` gặp 23001 thì trả 500 | Chỉ nhận 23505, 23503; PostgreSQL báo 23001 khi khóa ngoại `ON DELETE RESTRICT` chặn xóa | Thêm hằng `RestrictViolation = "23001"`, nhánh dự phòng nhận 23503 hoặc 23001 → 409 "Không thể thực hiện" |

**File đổi:** `Platform/Errors/ErrorMapper.cs`, `Platform/Errors/ValidationResponseFactory.cs`; test: `ErrorMapperTests.cs` (+1), `PipelineTests.cs` (+1), `TestOnlyController.cs` (+1 endpoint gắn `[Produces]`); tài liệu U5: `docs/danh-sach-api.md` (bảng quy ước, ví dụ lỗi 400 gọi thật, bỏ ghi chú "Lệch đã biết"). `traceability.json` không đổi: NFR3.3, BR1.2, BR1.5, AC4.1.2 đã trỏ đúng các file trên.

**Khác kế hoạch:**

1. **Viết test hồi quy 400 trước khi sửa** (kế hoạch ghi sửa rồi mới test): để chứng minh đúng gốc. Trên code cũ test đỏ: `Expected: "application/problem+json"`, `Actual: "application/json"`; sau khi sửa thì xanh.
2. **Thêm `JsonSerializerOptions` riêng cho `JsonResult`** (Hiệp chọn "Sửa luôn"): kiểm thật lần đầu thấy chữ tiếng Việt bị mã thoát (`Dữ liệu`), vì `JsonResult` dùng bộ mã hóa mặc định, còn bộ ghi JSON của MVC (đường 400 cũ) và lỗi 404/409 thì để nguyên chữ. Dùng `JavaScriptEncoder.UnsafeRelaxedJsonEscaping` như bộ ghi của MVC vẫn tự dùng; test 9 thêm câu kiểm chuỗi thô có "Dữ liệu không hợp lệ".
3. `dotnet format` sửa kiểu xuống dòng (CRLF) ở các dòng mới, như lần đầu ở Step 7.

**Kết quả kiểm:**

| Kiểm | Kết quả |
|---|---|
| Test U1 (`--filter ...Platform`) | 21/21 (12 `ErrorMapperTests` + 9 `PipelineTests`) |
| `npm --prefix frontend run verify` | Xanh, **96/96** test |
| `dotnet format --verify-no-changes` | Sạch |
| API thật, Origin 5173: `POST /api/departments` tên rỗng; `POST /api/employees` `departmentId: "abc"`; thiếu `email` | Cả ba: 400 `application/problem+json`, có `type`, `traceId`, header CORS, chữ tiếng Việt nguyên dạng |
| Đối chứng 404, 409 | Không đổi |

Không có test viết mà chưa chạy.

## 5c. Loop-back 2 từ Build and Test (03/11/2026, Step 10)

**Lỗi tìm thấy (BT-03, NFR6.2):** Build and Test lượt 3, Hiệp tắt PostgreSQL thật. Một lỗi 500 ghi **3 dòng `fail:`**: 2 dòng EF Core tự ghi (`Database.Connection[20004]`, `Query[10100]` kèm stack trace) rồi mới tới dòng của `ProblemDetailsExceptionHandler`. Gốc: `Microsoft.EntityFrameworkCore` để mức `Warning` (ẩn câu SQL theo NFR6.1) vẫn cho dòng Error của EF đi qua. Lượt 1 chấm NFR6.2 bằng đọc code nên không thấy.

**Sửa (chỉ cấu hình):** `backend/EmployeeCrud.Api/appsettings.json` thêm 3 dòng trong `Logging:LogLevel`: `Microsoft.EntityFrameworkCore.Database.Connection`, `...Query`, `...Update` = `Critical`. `appsettings.Development.json` không ghi đè 3 nhóm này nên không sửa.

**Vì sao không mất thông tin (để anh giải thích được):** mọi lỗi không xử lý vẫn tới `ProblemDetailsExceptionHandler`. Dòng Error của nó có phương thức, đường dẫn, loại lỗi, thông điệp và stack trace, kể cả exception bên trong của Npgsql (ví dụ "Failed to connect to 127.0.0.1:5999 … actively refused it"). Lỗi ràng buộc mà service đã xử lý thành 409 thì đúng ra không được ghi Error (NFR6.3); nhóm `Update` là nơi EF ghi khi `SaveChanges` lỗi lúc chen nhau.

**Đã kiểm (không cần Admin, không tắt database thật):**

| Ca | Cách làm | Kết quả |
|---|---|---|
| Lỗi 500 do DB | Backend phụ cổng 5082, `ConnectionStrings__Default` (biến môi trường, chỉ cho tiến trình đó, không mật khẩu) trỏ `Port=5999` không ai nghe; `GET /api/employees` một lần | 500 `application/problem+json` câu chung; log **đúng 1 dòng `fail:`** (trước sửa: 3) |
| Chạy bình thường | Backend phụ với chuỗi kết nối thật (user-secrets): `GET /api/employees` | 200 |
| 409 không ghi Error | `POST` trùng email `DO.AN@congty.vn`, `DELETE /api/departments/3` | 409, 409; log chỉ 2 dòng `info:`, **0 dòng `fail:`** |
| Bộ test | `npm --prefix frontend run verify` | Xanh, 96/96 |

Không đổi: code C#, test tự động, controller, service, frontend.

**Sửa thêm theo rà soát (Hiệp duyệt U1 và chọn sửa R-07, R-08, R-09):**

- **R-07:** nhóm thứ tư `Microsoft.EntityFrameworkCore.Database.Command` cũng ghi Error ("Failed executing DbCommand", mã 20102) khi một câu SQL lỗi. Chạy thật: gửi 8 yêu cầu thêm cùng email `dongthoi@congty.vn` cùng lúc vào backend phụ (DB thật) → 1×201, 7×409 (chỉ mục unique chặn), log có **7 dòng `fail: ...Database.Command[20102]`**, trái NFR6.3. Sửa: thêm `"Microsoft.EntityFrameworkCore.Database.Command": "Critical"` vào `appsettings.json`, và đổi dòng cùng tên trong `appsettings.Development.json` từ `Warning` sang `Critical` (file Development ghi đè file chung theo từng khóa, nên phải sửa cả hai). Chạy lại cùng ca: 7×409, **0 dòng `fail:`**; ca DB không kết nối được vẫn đúng 1 dòng `fail:`. Nhân viên thử đã xóa.
- **R-08 (vì sao có các dòng `Critical`):** NFR6.1 viết "riêng EF Core để Warning" là để ẩn câu SQL. Bốn nhóm con `Database.Command`, `Database.Connection`, `Query`, `Update` được đặt `Critical` để mọi lỗi chỉ còn **một** dòng Error do `ProblemDetailsExceptionHandler` ghi (NFR6.2), và lỗi đã xử lý thành 409 không sinh dòng Error (NFR6.3). **Đừng xóa bốn dòng này.** Muốn xem câu SQL khi học: đổi tạm `Database.Command` trong `appsettings.Development.json` sang `Information`, xem xong đổi lại `Critical`. Nếu thêm nhóm EF Core mới vào cấu hình log thì chạy lại ca kiểm tay "một lỗi = một dòng Error".
- **R-09:** ca kiểm tay trong `unit-test-instructions.md` ghi rõ phải chạy lại sau mỗi lần đổi `appsettings*.json` hoặc nâng bản EF Core/Npgsql (dự án không có CI, không có test tự động cho log).

## 5d. Step 11: sửa theo rà soát tổng thể (Change Request, 03/11/2026)

Nguồn: `build-and-test/ra-soat-tong-the.md` (3 chuyên gia AI-DLC rà độc lập; Hiệp chọn sửa cả 4 nhóm, form 34027473).

| Mã | Trước | Sau | File |
|---|---|---|---|
| S-03 | `AllowedHosts: "*"` | `"localhost;127.0.0.1;[::1]"`: request mang tên miền lạ bị 400 (chặn DNS rebinding) | `appsettings.json` |
| S-05 | Không có header bảo mật; có `Server: Kestrel` | Mọi phản hồi `X-Content-Type-Options: nosniff`; `/api/*` thêm `Cache-Control: no-store`, `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'`; gắn bằng `Response.OnStarting` nên phản hồi lỗi cũng có; `/swagger` không bị CSP; bỏ header `Server` | `Platform/Security/SecurityHeaders.cs` (mới), `Program.cs` |
| S-09 | `JavaScriptEncoder.UnsafeRelaxedJsonEscaping` | `JavaScriptEncoder.Create(UnicodeRanges.All)`: giữ chữ Việt, vẫn mã thoát `< > & ' "` | `Platform/Errors/ValidationResponseFactory.cs` |
| A-02 | Log lỗi không có `traceId` | Ba dòng log (Error 500, Information 4xx, Information 404/405/415) có `(traceId …)`; 404/405/415 do framework sinh nay cũng có `traceId` trong body như các lỗi khác | `ProblemDetailsExceptionHandler.cs`, `StatusCodeProblemWriter.cs` |
| A-01 | Nghi request bị hủy ghi Error 500 giả | **Không cần sửa:** test chứng minh máy chủ nhận được việc hủy và không ghi dòng Error nào (.NET 10 tự xử lý: ExceptionHandler bỏ qua `OperationCanceledException` khi `RequestAborted`) | (chỉ test) |
| A-07 | Tự gõ `"23505"`, `"23503"`, `"23001"` | `PostgresErrorCodes.*` của Npgsql; comment nói tên trường `name`/`email` phải khớp service (giữ ở tầng nền để không phụ thuộc ngược) | `Platform/Errors/ErrorMapper.cs` |
| S-07 | `10.*` (4 gói API, 2 gói test) | Ghim `10.0.14` (EF Core, Design, Relational, Mvc.Testing, InMemory), `10.0.3` (Npgsql) | 2 file `.csproj` |
| S-08 | `.gitignore` chưa chặn file bí mật hay gặp | Thêm `.env.*` (trừ `frontend/.env.development`), `*.pfx`, `*.p12`, `*.pem`, `*.key`, `secrets.json` | `.gitignore` |
| A-12 | `.http` chỉ có 1 request | Đủ 10 thao tác + 1 ca 404; biến `@baseUrl` (VS Code REST Client hiểu nhầm tên có dấu chấm như `EmployeeCrud.Api_HostAddress`) | `EmployeeCrud.Api.http` |

**Test mới (7):** `SecurityTests` (Host lạ → 400; header bảo mật trên 200, 404, 500; phản hồi 400 giữ chữ Việt nhưng mã hóa `<b>` thành `<b>`), `LoggingTests` (lỗi 500 ghi đúng 1 dòng Error và `traceId` trong log trùng phản hồi; request bị hủy: máy chủ nhận được việc hủy, 0 dòng Error). Hạ tầng test: `LogCapturingWebAppFactory` (giữ log trong bộ nhớ), `TestOnlyController` thêm `ok`, `slow`, `validate-html`.

**Phạm vi header bảo mật:** mọi phản hồi của ứng dụng, **trừ** phản hồi 400 do Host lạ: bộ lọc `AllowedHosts` do ASP.NET Core thêm sẵn chạy trước `UseSecurityHeaders` (body 400 đó rỗng, rủi ro rất thấp; rà soát R-12).

**Sửa sau rà soát U1 (Hiệp duyệt, chọn sửa R-10..R-13):** lần đầu em bỏ qua test mã hóa `<` vì phản hồi 400 thật không chứa chữ người dùng gõ; rà soát chỉ ra không có test thì sau này đổi lại bộ mã hóa lỏng sẽ không ai biết (R-10), nên đã thêm test với lời báo chứa `<b>` (endpoint chỉ có trong test). Tên file test trong kế hoạch sửa cho đúng (R-11); comment phạm vi header (R-12); test hủy request chờ có hạn tối đa 5 giây (R-13). Sau sửa: `npm --prefix frontend run verify` **103/103**, `dotnet format --verify-no-changes` sạch.

**Đã kiểm:** `dotnet test` (build ra `backend/TestResults/artifacts` vì backend của Hiệp đang chạy giữ file `.dll`) **102/102**; `dotnet format --verify-no-changes` sạch. Backend phụ cổng 5082 (bản vừa build, database thật): `/api/employees` 200 và `/api/khong-ton-tai` 404 đều có `nosniff`, `no-store`, CSP, không có `Server`; `Host: evil.example` → 400; `/swagger/index.html` 200, không có CSP; `traceId` trong body 404 trùng dòng log `404 GET /api/khong-ton-tai (traceId 00-9f33…)`.

## 6. Chuyển cho các unit sau

- **U2:** Vite đặt `server.strictPort: true` (nếu cổng 5173 bận thì báo lỗi, không tự nhảy sang 5174 làm CORS chặn). Địa chỉ API: `http://localhost:5081`.
- **U3, U4:** báo lỗi nghiệp vụ bằng `throw DomainError...`, **không** `return NotFound()` (vì 404 không nội dung sẽ nhận detail "Không có đường dẫn API này."). Cấu hình bảng bằng `IEntityTypeConfiguration`, đặt đúng tên ràng buộc trong `DbConstraintNames`. DTO đặt `ErrorMessage` tiếng Việt cho mọi luật kiểm.
- **Trước U3:** chọn cách đọc mức sàn 80% của service (`dotnet-reportgenerator-globaltool` cục bộ, hoặc ngưỡng của coverlet).
- **U5 (README):** ghi `dotnet ef database update 0` để lùi hết migration, và thứ tự quay lui: lùi database trước, rồi mới `git revert`.

## 5e. Change Request 03/11/2026 (FR8): U1 không đổi

- FR8 không chạm phần nền; Hiệp chọn Keep mọi bước thiết kế của U1 và duyệt lại plan cũ (tin nhắn 6123452d).
- Thay đổi nhỏ ngoài plan: thêm 2 comment giải thích trong `backend/EmployeeCrud.Api/Platform/StartupChecks.cs` (vì sao chỉ kiểm có chuỗi kết nối mà không mở kết nối thử; khóa `ConnectionStrings:Default` khớp README) và 2 comment trong `Platform/Errors/DbConstraintNames.cs` (03/11, Build and Test lượt 4). Không đổi logic. Lý do: build ra file dll mới để vượt Smart App Control (luật trong `27-10/CLAUDE.md`).
