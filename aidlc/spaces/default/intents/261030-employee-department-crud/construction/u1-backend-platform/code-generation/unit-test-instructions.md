# Hướng dẫn test: u1-backend-platform

## Khung test và cấu hình

- **xUnit** trong project riêng `backend/EmployeeCrud.Api.Tests` (`team.md` Testing Posture), tham chiếu `EmployeeCrud.Api`.
- **coverlet.collector** để đo độ phủ; **Microsoft.AspNetCore.Mvc.Testing** để dựng ứng dụng thật trong bộ nhớ (`WebApplicationFactory<Program>`).
- Mọi test của U1 nằm trong namespace `EmployeeCrud.Api.Tests.Platform` (thư mục `Platform/`), nên lọc được riêng.

## Lệnh chạy test của U1

Chạy ở thư mục gốc repo (`employee-crud/`):

```
dotnet test backend/EmployeeCrud.Api.Tests/EmployeeCrud.Api.Tests.csproj --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Platform"
```

Lệnh chạy được ngay sau bước 2 của kế hoạch (khi project test đã build được). Đạt khi mọi test xanh.

Đo độ phủ, chạy thành lệnh riêng:

```
dotnet test backend/EmployeeCrud.Api.Tests/EmployeeCrud.Api.Tests.csproj --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Platform" --collect:"XPlat Code Coverage"
```

## Mục tiêu độ phủ

- Mức sàn của dự án: **80% số dòng của các lớp service** (`team.md`). U1 chưa có service nghiệp vụ; mức sàn này được Build and Test kiểm trên **toàn bộ** bộ test sau khi U3, U4 có service, không chấm ở lần chạy riêng của U1.
- Riêng U1: mỗi nhánh của `ErrorMapper` có ít nhất một test (11 test, bước 4), và ba hành vi CORS có test (bước 6).

## Danh sách test

| Lớp test | Số test | Kiểm gì |
|---|---|---|
| `ErrorMapperTests` | 12 | Từng nhánh đổi lỗi: 404, 400, 409 có/không field, 23505 theo tên ràng buộc, 23505 tên lạ → 500, 23503 dự phòng → 409, **23001 dự phòng → 409** (Loop-back 1), `BadHttpRequestException` 400/413, lỗi lạ → 500 không lộ thông điệp |
| `PipelineTests` | 9 | CORS trên phản hồi 500 và 404, Origin lạ không có header, 400 camelCase, JSON hỏng, 405, 415, thiếu chuỗi kết nối thì khởi động ném lỗi, **400 từ controller gắn `[Produces("application/json")]` vẫn là `application/problem+json` có `type`, `traceId`** (Loop-back 1) |

## Giả lập (mock/stub)

- **Lỗi database:** dựng `PostgresException` bằng constructor công khai của Npgsql (đặt `sqlState` và `constraintName`), bọc trong `DbUpdateException`. Không cần PostgreSQL thật.
- **Ứng dụng trong bộ nhớ:** `PlatformWebAppFactory` dùng môi trường `Testing` để **không** nạp user-secrets thật của Hiệp. Chuỗi kết nối giả `Host=localhost;Database=employee_crud_test` (không có mật khẩu, không mở kết nối nào), đặt qua `UseSetting`.
- **Endpoint chỉ có trong test:** `TestOnlyController` đăng ký bằng `AddApplicationPart`, không nằm trong code chạy thật.
- Không dùng thư viện mock: U1 không có phụ thuộc nào cần thay thế.

## Dữ liệu test

- Không có dữ liệu lưu trữ. Mỗi test tự tạo lỗi hoặc request của mình, không phụ thuộc thứ tự.
- Test "thiếu chuỗi kết nối" dùng một factory riêng không đặt chuỗi kết nối.

## Kiểm bằng tay (Hiệp tự làm, không thuộc lệnh trên)

| Kiểm | Cách làm | Đạt khi |
|---|---|---|
| Kết nối database (W4) | Làm theo hướng dẫn W4 trong `code-summary.md`: `dotnet user-secrets set ...`, `dotnet tool restore`, `dotnet ef database update --project backend/EmployeeCrud.Api` | pgAdmin thấy `__EFMigrationsHistory` trong `employee_db` (hoặc `dotnet ef migrations list` không báo lỗi kết nối) |
| Đường dẫn lạ | `dotnet run --project backend/EmployeeCrud.Api`, Postman `GET /api/khong-ton-tai` | 404, `application/problem+json`, title "Không tìm thấy" |
| OpenAPI | Mở `/swagger` ở Development | Trang hiện ra, đọc được `/openapi/v1.json` |
| Thiếu chuỗi kết nối | `dotnet user-secrets remove "ConnectionStrings:Default" --project backend/EmployeeCrud.Api`, `dotnet run`, rồi đặt lại | Ứng dụng dừng, in hướng dẫn tiếng Việt, không in mật khẩu |
