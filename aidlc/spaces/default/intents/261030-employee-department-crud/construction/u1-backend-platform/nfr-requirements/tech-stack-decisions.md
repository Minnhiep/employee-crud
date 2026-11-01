# Lựa chọn công nghệ: u1-backend-platform

> **Nguồn:** `project.md` (Tech Stack, đã khóa), `team-practices.md` (Code Style, Testing Posture), `inception/contract-design/contract-summary.md`, `functional-design/rules.md`.
>
> Công nghệ chính **đã khóa** trong `project.md`. File này chỉ ghi những lựa chọn chi tiết U1 cần, kèm lý do. Phiên bản gói chính xác do Code Generation chốt và ghi lại khi cài.

| Hạng mục | Lựa chọn | Lý do | Yêu cầu liên quan |
|---|---|---|---|
| Nền chạy | .NET 10 (SDK 10.0.403 đã cài), ASP.NET Core Web API kiểu controller | Đã khóa trong `project.md`; .NET 10 là bản LTS | NFR6 |
| Truy cập dữ liệu | EF Core 10 + `Npgsql.EntityFrameworkCore.PostgreSQL` 10.x | Đã khóa; có migration | NFR3, NFR5.2 |
| Công cụ migration | `dotnet-ef` cài **cục bộ** bằng tool manifest (`.config/dotnet-tools.json`) | team-practices Q3; `project.md` Forbidden (không cài toàn máy) | NFR1.2 |
| Bí mật | User-secrets của .NET (Development) | NFR2; không thêm thư viện | NFR2.1 |
| Lỗi chuẩn | ProblemDetails có sẵn trong ASP.NET Core, cộng bộ xử lý lỗi toàn cục và trang mã trạng thái | Có sẵn, không thêm gói; đúng C3 | BR1.x |
| Tài liệu API | OpenAPI có sẵn trong ASP.NET Core 10 (`Microsoft.AspNetCore.OpenApi`), kèm một trang xem tài liệu | FR6.4; Code Generation chọn trang xem nhẹ nhất có trên NuGet và ghi lý do | NFR2 (chỉ ở Development) |
| Test | xUnit + coverlet (`coverlet.collector`) trong project `EmployeeCrud.Api.Tests` | team-practices Q6, Q7 | NFR4.1 |
| Database dùng khi test | Để U3 chốt khi viết test service đầu tiên (câu hỏi còn mở của C2/C5): ưu tiên cách so sánh không phân biệt hoa thường chạy **giống nhau** trên test và PostgreSQL | R2 trong `risk-and-sequencing-rationale.md` | NFR4.1 |
| Định dạng code | `.editorconfig` + `dotnet format` | team-practices Q9 | NFR8.1 |

## Yêu cầu về công cụ

| ID | Yêu cầu | Đo / kiểm |
|---|---|---|
| NFR4.1 | Có sẵn project test xUnit kèm coverlet, chạy được bằng `dotnet test --collect:"XPlat Code Coverage"` ngay từ U1, để U3/U4 thêm test service và đo độ phủ ≥ 80% trên các lớp service | `dotnet test` chạy được, sinh file kết quả độ phủ |
| NFR8.1 | Có `.editorconfig`; `dotnet format --verify-no-changes` không báo lỗi trên code của U1 | Chạy lệnh trước khi commit |

**Phương án không chọn:**
- Serilog hay log có cấu trúc: logger có sẵn là đủ (NFR6.1).
- FluentValidation: DataAnnotations có sẵn là đủ cho ba trường.
- Gói đặt tên `snake_case` tự động: team-practices Q10 đã loại.
- Docker: `project.md` Forbidden.
