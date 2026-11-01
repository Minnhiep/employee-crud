# Đặc tả hạ tầng: u1-backend-platform

> **Nguồn:**
> - `nfr-design/` (performance, security, scalability, reliability, observability, logical-components)
> - `inception/domain-design/components.md`, `functional-design/functional-spec.md` (W1–W4)
> - `inception/contract-design/contract-summary.md` (C3, C5)
> - `team.md` mục Deployment (Q8), `project.md` (Tech Stack, Forbidden: không Docker, không CI/CD)
>
> "Hạ tầng" ở dự án này chỉ là **máy cá nhân của Hiệp**: không đám mây, không container, không máy chủ. Vì vậy không có VPC, IAM, IaC hay ước tính chi phí; các dòng đó ghi rõ là không áp dụng kèm lý do.

## Deployment

| Facet | Choice | Rationale |
|---|---|---|
| Compute model | Một tiến trình `dotnet run` (Kestrel) trên Windows của Hiệp | Một người dùng, một tiến trình (NFR5.4); `project.md` cấm Docker và kiến trúc phức tạp |
| Networking | Backend nghe trên `localhost`, cổng do template `launchSettings.json` sinh ra. Frontend Vite ở `http://localhost:5173` gọi sang qua CORS. PostgreSQL ở `localhost:5432` | Chỉ chạy trên máy, không mở ra mạng ngoài. Cổng thật của backend được Code Generation ghi vào README và vào cấu hình địa chỉ API của frontend (U2) |
| HTTPS | Dùng chứng chỉ phát triển localhost đã được tin cậy trên máy (kiểm 30/10) | Có sẵn, không cần cấu hình thêm |
| Storage | Một database PostgreSQL 18 `employee_db` trên máy | Đã cài sẵn (`project.md` Tech Stack). Không lưu file, không lưu trữ khác |
| Environments | Chỉ `Development` (đặt trong `launchSettings.json`) | `team.md` Deployment: không có staging hay production |
| IaC | Không áp dụng. Cấu hình nằm trong `appsettings.json`, `launchSettings.json`, user-secrets và tool manifest `.config/dotnet-tools.json` | Không có tài nguyên đám mây để mô tả bằng code |
| Resource sizing | Không đặt. Dùng mặc định của Kestrel và pool kết nối mặc định của Npgsql | Tới 1.000 nhân viên vẫn trong ngân sách NFR5 (`scalability-design.md`) |
| Chi phí | 0 đồng: phần mềm miễn phí đã cài trên máy | Không có dịch vụ trả tiền |

## Infrastructure Services

| Service | Role | Configuration | Notes |
|---|---|---|---|
| PostgreSQL 18.6 (dịch vụ Windows `postgresql-x64-18`) | database | `localhost:5432`, database `employee_db`, pool kết nối mặc định của Npgsql, không retry (NFR1.4) | **Hiệp tự tạo database và tự đặt chuỗi kết nối** theo hướng dẫn W4; AI không gõ mật khẩu. Migration do Hiệp chạy bằng `dotnet ef database update`, không chạy tự động lúc khởi động (NFR5.3) |
| User-secrets của project API | lưu bí mật | Khóa `ConnectionStrings:Default`, đặt bằng `dotnet user-secrets set`. Dự phòng: biến môi trường `ConnectionStrings__Default` | Nằm ngoài repo (thư mục hồ sơ người dùng của Windows), nên không thể lỡ commit (NFR2.1, NFR2.2) |
| `dotnet-ef` (tool cục bộ) | công cụ migration | Khai trong `.config/dotnet-tools.json`; Hiệp chạy `dotnet tool restore` | Không cài `--global` (`team.md` Q3, `project.md` Forbidden) |
| Cache, queue, search, CDN, DNS, load balancer | không có | — | Một người dùng, dữ liệu nhỏ (`performance-design.md`) |

## Shared Infrastructure

Các unit cùng dùng một số tài nguyên. U1 dựng, các unit sau chỉ thêm vào.

| Shared Resource | Owner Unit | Consumer Units | Access Boundary |
|---|---|---|---|
| Database `employee_db` | U1 (kết nối, `AppDbContext`) | U3 (migration 1: `departments` + dữ liệu mẫu), U4 (migration 2: `employees`, khóa ngoại RESTRICT) | Chỉ truy cập qua `AppDbContext`; mỗi unit thêm cấu hình thực thể bằng `IEntityTypeConfiguration` của riêng mình (C5) |
| User-secrets `ConnectionStrings:Default` | U1 | Mọi lệnh `dotnet run`, `dotnet ef` của backend | Chỉ project API đọc; không đưa vào frontend |
| Chính sách CORS (`Cors:AllowedOrigins`) | U1 | U2 (frontend gọi API) | Chỉ `http://localhost:5173`; không dùng `*`, không gửi credential (NFR7.1) |
| Phong bì lỗi C3 (bộ bắt lỗi, trang mã trạng thái) | U1 | U3, U4 (ném `DomainError`), U2 (đọc ProblemDetails) | U3, U4 không tự viết phản hồi lỗi; chỉ ném `DomainError` |

## Ghi chú cho Code Generation

Cơ chế CORS trên phản hồi lỗi đã được sửa ở lần rà soát NFR Design: chỉ đặt `UseCors` ngoài cùng là **chưa đủ**, vì bộ bắt lỗi xóa header. `IExceptionHandler` phải tự áp lại kết quả CORS (qua `ICorsService`) sau khi xóa phản hồi; ba test CORS trong `security-design.md` §2 vẫn là bằng chứng. Phần này thuộc code, không thay đổi hạ tầng.
