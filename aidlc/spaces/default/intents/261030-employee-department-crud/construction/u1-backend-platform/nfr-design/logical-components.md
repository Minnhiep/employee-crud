# Các thành phần logic: u1-backend-platform

> **Nguồn:** `nfr-requirements/*`, `functional-design/functional-spec.md`, `inception/contract-design/contract-summary.md` (C3, C5), `inception/units-generation/unit-of-work.md`.

## 1. Bố cục thư mục repo (chốt từ U1 để các unit sau theo)

```
employee-crud/
  backend/
    EmployeeCrud.sln
    EmployeeCrud.Api/            (project API - U1 dựng; U3, U4 thêm thư mục Departments/, Employees/)
      Platform/                  (code của U1: lỗi, cấu hình, DbContext)
    EmployeeCrud.Api.Tests/      (xUnit + coverlet + Mvc.Testing)
  frontend/                      (U2 dựng)
  docs/                          (tài liệu bàn giao - U5 hoàn thiện)
  .config/dotnet-tools.json      (dotnet-ef cục bộ)
  .editorconfig, .gitignore
```

## 2. Thành phần trong U1

| Thành phần | Trách nhiệm | Mẫu NFR áp dụng | Phạm vi ảnh hưởng khi hỏng |
|---|---|---|---|
| Khởi động và cấu hình (`Program.cs`) | Đọc cấu hình, kiểm chuỗi kết nối, đăng ký dịch vụ, xếp chuỗi xử lý | Báo lỗi sớm khi thiếu cấu hình (NFR1.1) | Toàn bộ backend không chạy, kèm lời báo rõ |
| `AppDbContext` | Ngữ cảnh database dùng chung. U1 tạo khung; U3, U4 thêm cấu hình thực thể qua `IEntityTypeConfiguration` | Bất đồng bộ, mỗi request một ngữ cảnh, pool mặc định (NFR5.2) | Request chạm database trả 500; request khác không ảnh hưởng (NFR1.4) |
| Các loại `DomainError` (NotFound, Validation, Conflict) | Kiểu lỗi nghiệp vụ dùng chung | Đổi lỗi tập trung | Không có |
| `ProblemDetailsExceptionHandler` (`IExceptionHandler`) | Đổi lỗi thành ProblemDetails theo C3; ghi log lỗi 500 | Không lộ thông tin (NFR2.3); nhận lỗi database theo tên ràng buộc (NFR3.1) | Nếu chính nó lỗi thì ASP.NET Core trả 500 trống; có unit test che |
| Bộ đổi lỗi kiểm dữ liệu (`InvalidModelStateResponseFactory`) | 400 với title tiếng Việt và khóa camelCase (BR1.2) | Kiểm dữ liệu ở biên (NFR2.4) | — |
| Trang mã trạng thái | 404/405/415 không có nội dung → ProblemDetails (BR1.7) | Một phong bì lỗi chung | — |
| Chính sách CORS | Cho phép origin dev, đứng ngoài cùng chuỗi xử lý | NFR7.1, NFR7.2 | Trình duyệt không gọi được API (có test che) |
| OpenAPI | Tài liệu API ở Development | — | Chỉ mất tài liệu |

## 3. Tài nguyên dùng chung

- **PostgreSQL `employee_db`:** điểm hỏng duy nhất của backend. Hiệp tự quản lý dịch vụ (`external-dependency-map.md`).
- **User-secrets** của project API: chung cho mọi lệnh `dotnet run` và `dotnet ef` trên máy Hiệp.

## 4. Chuyển tiếp sang Infrastructure Design

Không có hạ tầng đám mây. Mọi thành phần chạy trong **một tiến trình** trên máy cá nhân, nối với **một** PostgreSQL trên máy.
