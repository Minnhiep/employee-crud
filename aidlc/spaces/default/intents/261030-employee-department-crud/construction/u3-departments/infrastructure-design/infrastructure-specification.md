# Đặc tả hạ tầng: u3-departments

> **Nguồn:**
> - `nfr-design/` (performance, security, scalability, reliability, observability, logical-components)
> - `inception/domain-design/components.md`, `functional-design/functional-spec.md` (W1–W5)
> - `inception/contract-design/contract-summary.md` (C1, C5)
> - Hạ tầng của U1 (máy của Hiệp, PostgreSQL 18 trên máy, user-secrets)
> - `team.md` Deployment, `project.md` Forbidden (không Docker, không CI/CD)
>
> U3 **không thêm hạ tầng mới**. Nó dùng lại tiến trình backend, database `employee_db` và user-secrets của U1, cùng dev server Vite của U2. Phần mới chỉ gồm: bảng và chỉ mục trong database (qua migration 1), một tool cục bộ để đọc độ phủ, và một gói chỉ dùng cho test.

## Deployment

| Facet | Choice | Rationale |
|---|---|---|
| Compute model | Giữ nguyên: một tiến trình `dotnet run` (http://localhost:5081) và `npm run dev` (http://localhost:5173) | U3 chỉ thêm controller và trang vào hai tiến trình đã có (scalability-design §3) |
| Networking | Giữ nguyên. Endpoint mới `/api/departments` nằm sau chính sách CORS "Frontend" của U1 | security-design §6 (NFR7.1) |
| Storage | Bảng `departments` (`id` identity, `name varchar(100) NOT NULL`) + chỉ mục `ux_departments_name` trên `lower(name)` + 4 dòng mẫu, tạo bằng migration `CreateDepartments` | reliability-design §1, §2 |
| Environments | Chỉ `Development` | team.md Deployment |
| IaC | Không áp dụng. Thay đổi cấu trúc database đi bằng migration EF Core (đây là "hạ tầng dạng code" duy nhất của dự án) | Không có tài nguyên đám mây; migration có Down để quay lui (NFR1.1) |
| Resource sizing | Không đặt. Pool kết nối mặc định của Npgsql | performance-design §1: tối đa 3 lần gọi database mỗi request |
| Chi phí | 0 đồng | Công cụ miễn phí, chạy trên máy |

## Infrastructure Services

| Service | Role | Configuration | Notes |
|---|---|---|---|
| PostgreSQL 18 `employee_db` | database | Thêm bảng `departments`, chỉ mục `ux_departments_name`, 4 dòng mẫu | **Hiệp tự chạy** `dotnet ef database update`. Trước đó chạy kiểm `SELECT lower('KẾ TOÁN') = lower('Kế toán');` trong pgAdmin (reliability-design §5) |
| `dotnet-ef` (đã có) | công cụ migration | Tạo migration bằng `dotnet ef migrations add CreateDepartments --project backend/EmployeeCrud.Api --output-dir Migrations` | Sau khi sinh, sửa tay để thêm câu SQL tạo chỉ mục và `InsertData` (reliability-design §1, §2) |
| `dotnet-reportgenerator-globaltool` (mới, cục bộ) | đọc độ phủ test | Thêm vào `dotnet-tools.json` ở gốc bằng `dotnet tool install dotnet-reportgenerator-globaltool` (không `--global`); `dotnet tool restore` cài lại trên máy khác | Q1: A. Chỉ dùng trên máy dev, không chạy lúc ứng dụng chạy |
| `Microsoft.EntityFrameworkCore.InMemory` 10.0.x (mới) | database giả cho unit test | Chỉ thêm vào `EmployeeCrud.Api.Tests` | Không vào project API, nên không có trong bản chạy thật (NFR4.5) |
| Cache, queue, search, CDN, DNS, load balancer | không có | — | scalability-design §3 |

## Shared Infrastructure

| Shared Resource | Owner Unit | Consumer Units | Access Boundary |
|---|---|---|---|
| Bảng `departments` + chỉ mục `ux_departments_name` | U3 (migration `CreateDepartments`) | U4 (khóa ngoại `fk_employees_department` từ `employees.department_id`, ô chọn phòng ban) | U4 chỉ đọc qua `IDepartmentService` (`ExistsAsync`, `GetAllAsync`) và thêm khóa ngoại bằng **migration mới**, không sửa `CreateDepartments` (C5, NFR1.3). Tên khóa ngoại phải đúng `fk_employees_department` để nhánh 23503 của U3 khớp (rà soát NFR Design U3) |
| Database `employee_db`, user-secrets, CORS, phong bì lỗi C3 | U1 | U3 | U3 dùng như U1 đã định, không đổi cấu hình |
| `dotnet-tools.json` | U1 (dotnet-ef) | U3 thêm reportgenerator; U4, Build and Test dùng lại | Chỉ tool cục bộ, có phiên bản ghim trong manifest |
| `client.ts`, component chung | U2 | U3 (`departments.ts`, các trang) | U3 không sửa file của U2 |
