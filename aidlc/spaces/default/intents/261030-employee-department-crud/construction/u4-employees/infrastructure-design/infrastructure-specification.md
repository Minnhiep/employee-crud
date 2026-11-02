# Đặc tả hạ tầng: u4-employees

> **Nguồn:**
> - `nfr-design/` (performance, security, scalability, reliability, observability, logical-components)
> - `nfr-requirements/tech-stack-decisions.md` (NFR3.7, NFR3.8, NFR4.5, NFR4.7, NFR6.4–NFR6.6)
> - `inception/domain-design/components.md`, `functional-design/functional-spec.md`
> - `inception/contract-design/contract-summary.md` (C2, C4, C5)
> - Hạ tầng của U1 (máy của Hiệp, PostgreSQL 18 trên máy, user-secrets), U2 (dev server Vite), U3 (bảng `departments`, InMemory, reportgenerator)
> - `team.md` Deployment, `project.md` Forbidden (không Docker, không CI/CD)
>
> U4 **không thêm hạ tầng mới**, cũng không thêm gói hay công cụ nào so với U3. Nó dùng lại tiến trình backend, database `employee_db`, user-secrets, dev server Vite và hạ tầng test đã có. Phần mới chỉ là bảng `employees`, khóa ngoại và hai chỉ mục, tạo bằng migration 2 `CreateEmployees`.

## Deployment

| Facet | Choice | Rationale |
|---|---|---|
| Compute model | Giữ nguyên: một tiến trình `dotnet run` (http://localhost:5081) và `npm run dev` (http://localhost:5173) | U4 chỉ thêm `EmployeesController`, `EmployeeService` (đăng ký `AddScoped`) và các trang vào hai tiến trình đã có (scalability-design §2, §4) |
| Networking | Giữ nguyên. Endpoint mới `/api/employees` (kèm `?search=`) nằm sau chính sách CORS "Frontend" của U1 | security-design §6 (NFR7.1) |
| Storage | Bảng `employees` (`id` identity, `full_name varchar(100) NOT NULL`, `email varchar(254) NOT NULL`, `department_id int NOT NULL`); khóa ngoại `fk_employees_department` → `departments(id)` kiểu Restrict; chỉ mục `ix_employees_department_id`; chỉ mục không trùng `ux_employees_email` trên `lower(email)`. Không có dòng mẫu | reliability-design §1, §4; scalability-design §3 |
| Environments | Chỉ `Development` | team.md Deployment |
| IaC | Không áp dụng. Thay đổi cấu trúc database đi bằng migration EF Core `CreateEmployees`. `Down` chỉ xóa phần của U4 | Không có tài nguyên đám mây; quay về `CreateDepartments` thì phòng ban còn nguyên (NFR1.1, NFR1.3) |
| Resource sizing | Không đặt. Pool kết nối mặc định của Npgsql | performance-design §2: tối đa 5 lần gọi database mỗi thao tác ghi; dữ liệu tới 1.000 nhân viên (NFR5.6) |
| Chi phí | 0 đồng | Công cụ miễn phí, chạy trên máy |

## Infrastructure Services

| Service | Role | Configuration | Notes |
|---|---|---|---|
| PostgreSQL 18 `employee_db` | database | Thêm bảng `employees`, khóa ngoại `fk_employees_department`, chỉ mục `ix_employees_department_id` và `ux_employees_email` | **Hiệp tự chạy** `dotnet ef database update` (AI không gõ mật khẩu). Kiểm quay lui về `CreateDepartments` rồi lên lại (reliability-design §4) |
| `dotnet-ef` (đã có) | công cụ migration | `dotnet ef migrations add CreateEmployees --project backend/EmployeeCrud.Api --output-dir Migrations` | Sau khi sinh, sửa tay để thêm `CREATE UNIQUE INDEX ux_employees_email ON employees (lower(email))` ở `Up` và `DROP INDEX IF EXISTS ux_employees_email` ở `Down`, trước lệnh xóa bảng (NFR3.7). Khóa ngoại và chỉ mục `department_id` do EF sinh từ cấu hình (NFR3.8) |
| `dotnet-reportgenerator-globaltool` (đã có, cục bộ) | đọc độ phủ test | Dùng lại qua script `npm --prefix frontend run coverage` của U3 | Đọc dòng `EmployeeService` và `DepartmentService` (NFR4.3) |
| `Microsoft.EntityFrameworkCore.InMemory` (đã có) | database giả cho unit test | Chỉ trong `EmployeeCrud.Api.Tests` | Không thêm gói (NFR4.7). Cách tìm `ToLower().Contains` chạy được trên InMemory lẫn PostgreSQL (NFR4.5) |
| pgAdmin 4 (đã có) | công cụ kiểm tay | Query Tool trên `employee_db` | Kiểm Đỗ/ĐỖ, email trùng, khóa ngoại, dữ liệu đo 1.000 dòng `@perf.test` rồi xóa (reliability-design §5, performance-design §3) |
| Cache, queue, search, CDN, DNS, load balancer | không có | — | scalability-design §4 |

## Shared Infrastructure

| Shared Resource | Owner Unit | Consumer Units | Access Boundary |
|---|---|---|---|
| Bảng `employees` + khóa ngoại + hai chỉ mục | U4 (migration `CreateEmployees`) | U3 (`DepartmentService.DeleteAsync` kiểm còn nhân viên bằng `db.Employees.AnyAsync`) | U3 chỉ đọc để chặn xóa (BR2.7, C4 `change_by_u4`). Thay đổi này nằm trong U4, không đổi chữ ký `IDepartmentService` (NFR3.5) |
| Bảng `departments` | U3 (migration `CreateDepartments`) | U4 (khóa ngoại, ô chọn phòng ban, `ExistsAsync`) | U4 không sửa `CreateDepartments` (C5, NFR1.3). Tên khóa ngoại lấy từ hằng `DbConstraintNames.EmployeeDepartmentForeignKey` của U1, để nhánh 23503 của U3 khớp (NFR3.3) |
| `AppDbContext`, `DomainError`, `ErrorMapper`, `DbConstraintNames`, CORS, user-secrets | U1 | U4 | U4 thêm `DbSet<Employee> Employees` vào `AppDbContext`; không đổi cấu hình khác |
| `TestDb`, `ThrowingAppDbContext` | U3 | U3, U4 | Dời sang `backend/EmployeeCrud.Api.Tests/TestSupport/` bằng `git mv` để hai bộ test dùng chung (NFR4.7) |
| `client.ts`, component chung, `src/api/departments.ts` | U2, U3 | U4 (`employees.ts`, các trang nhân viên) | U4 chỉ sửa `App.tsx` (đường dẫn) và dời `EmployeesPage.tsx` sang `pages/employees/` (logical-components §3) |
| `dotnet-tools.json` | U1, U3 | U4, Build and Test | Không thêm tool |
