# Hướng dẫn kiểm thử: sua-ra-soat-ban-giao

## Khung test và cấu hình

- Không thêm khung test mới. Bộ test có sẵn: xUnit trong `backend/EmployeeCrud.Api.Tests` (148 test trước khi sửa), database giả lập trong bộ nhớ, mỗi test một database riêng (`TestSupport/TestDb.cs`).
- Test tầng HTTP dùng `Platform/PlatformWebAppFactory.cs` (host thử trong bộ nhớ, không chạy Kestrel), như các test `PipelineTests`, `SecurityTests`, `LoggingTests` đang có.
- Không có test tự động cho React (`team.md`): giao diện kiểm trên Chromium thật do Playwright điều khiển, với backend và frontend đang chạy (Step 8 của kế hoạch). Script kiểm để trong `backend/TestResults/` (Git bỏ qua).

## Lệnh chạy

Chạy từ gốc repo, mỗi lệnh riêng.

1. Lớp service (Step 4):
   `dotnet test backend/EmployeeCrud.slnx --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Employees.EmployeeServiceTests|FullyQualifiedName~EmployeeCrud.Api.Tests.Departments.DepartmentServiceTests"`
   - Đạt khi mọi test qua, gồm các test mới: tìm email chữ hoa không phân biệt hoa thường; PUT phòng ban không tồn tại với tên không hợp lệ ra lỗi không tìm thấy; phòng có thật với tên không hợp lệ ra lỗi kiểm dữ liệu.
2. Lớp Platform (Step 5, Step 12):
   `dotnet test backend/EmployeeCrud.slnx --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Platform"`
   - Đạt khi mọi test qua, gồm test `Accept: text/html` mới (nếu Step 2 tái hiện được lỗi) và test giới hạn body 64 KB (Step 12: đọc `IOptions<KestrelServerOptions>` từ host thử, kiểm `Limits.MaxRequestBodySize` bằng `64 * 1024`).
3. Toàn bộ (sau Step 5, Step 10 và Step 12):
   `dotnet test backend/EmployeeCrud.slnx`
   - Đạt khi không test nào đỏ. Số test = 148 − 1 (bỏ test trùng D9) + số test mới: 152 sau Step 1–11, 153 sau Step 12.
4. Định dạng C#: `dotnet format backend/EmployeeCrud.slnx --verify-no-changes` (mã thoát 0).
5. Frontend (Step 7): `npm --prefix frontend run typecheck`, `npm --prefix frontend run lint`, `npm --prefix frontend run format:check`, `npm --prefix frontend run build` (mỗi lệnh mã thoát 0).
6. Kiểm tổng: `npm --prefix frontend run verify` (mã thoát 0).

## Mục tiêu độ phủ

- Mức sàn của dự án: ít nhất 80% số dòng các lớp service, đo bằng coverlet: `npm --prefix frontend run coverage`. Build and Test kiểm mức này trên toàn bộ test; không đổi ngưỡng nào. Lần đo gần nhất (09/11): `DepartmentService`, `EmployeeService`, `TextInput` đều 100%.

## Mock, stub và dữ liệu test

- Test service: dữ liệu tạo trong từng test bằng `TestDb.SeedEmployeeAsync` / `SeedDepartmentAsync`; email mẫu đuôi `@congty.vn` (dữ liệu giả).
- Phép thử "bỏ `ToLower()` ở cột email" (FR6.1) chỉ làm tạm để thấy test đỏ, rồi trả lại code; ghi kết quả vào `code-summary.md`.
- Kiểm trên trình duyệt và API thật: dữ liệu thử dùng đuôi `@kiem-thu.example`, tên "Phòng thử …", xóa sạch sau khi kiểm; `employee_db` phải còn 9 phòng ban, 83 nhân viên (đếm trước và sau).
- Phép thử gây lỗi cho test 64 KB (Step 12): tạm đổi `64 * 1024` thành `128 * 1024` ở `Program.cs`, chạy lớp Platform phải thấy test đỏ, rồi trả lại và chạy lại cho xanh.

## Kỳ vọng khi kiểm bằng API thật (dùng ở Step 12 và Build and Test)

- `PUT /api/departments/99999` với `{ "name": "   " }`: **400** "Vui lòng nhập tên phòng ban", vì `[Required]` chạy trước controller nên chưa tìm bản ghi.
- `PUT /api/departments/99999` với tên 101 ký tự: **404**, vì tìm bản ghi trước rồi mới kiểm độ dài.
- `PUT` phòng ban có thật với tên toàn khoảng trắng hoặc 101 ký tự: **400**.
- Body lớn hơn 64 KB: **413** ProblemDetails "Dữ liệu gửi lên quá lớn"; body nhỏ chạy như cũ.
- Tiêu chí gốc FR6.9 trong `requirements.md` ghi 404 cho cả ca khoảng trắng; hành vi thật (và `docs/danh-sach-api.md`) là 400, Build and Test kiểm theo hành vi thật ở trên.
