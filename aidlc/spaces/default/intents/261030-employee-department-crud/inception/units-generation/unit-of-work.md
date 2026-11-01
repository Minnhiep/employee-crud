# Các phần việc (Units of Work)

> **Nguồn:**
> - `domain-design/components.md` (4 khối) và `domain-design/decisions.md` (ADR-001 đến ADR-005)
> - `requirements-analysis/requirements.md`
> - `user-stories/stories.md`
> - `units-generation-questions.md` (Q1–Q3, kế hoạch đã được Hiệp duyệt)
>
> **Unit** là một phần việc code làm trọn và kiểm riêng được. Ở giai đoạn Construction, mỗi unit đi qua các bước thiết kế chi tiết, sinh code và kiểm thử. File này chỉ định nghĩa các unit. Unit nào phụ thuộc unit nào nằm trong `unit-of-work-dependency.md`. Thứ tự làm do bước Delivery Planning quyết.

## Bảng unit

| Unit ID | Directory | Kind | Mô tả ngắn | Khối logic (components.md) | Cách chạy | Độ lớn |
|---|---|---|---|---|---|---|
| U1 | `u1-backend-platform` | service | Nền backend: dự án ASP.NET Core, DbContext, lỗi chuẩn, CORS, OpenAPI, project test | Platform | Nằm chung trong một tiến trình backend (`dotnet run`) | M |
| U2 | `u2-web-shell` | ui | Nền giao diện: dự án React (Vite), khung trang, menu, gọi API, CSS chung | WebUi (phần dùng chung) | Nằm chung trong một ứng dụng frontend (`npm run dev`) | M |
| U3 | `u3-departments` | (không gắn loại) | Trọn tính năng phòng ban: dữ liệu, API, luật, test, trang | DepartmentManagement + WebUi (features/departments) + Platform (migration phòng ban) | Gắn vào backend và frontend chung | M |
| U4 | `u4-employees` | (không gắn loại) | Trọn tính năng nhân viên: dữ liệu, API, luật, tìm kiếm, test, trang; cộng luật chặn xóa phòng ban còn nhân viên | EmployeeManagement + WebUi (features/employees) + Platform (migration nhân viên) + một thay đổi nhỏ ở DepartmentManagement | Gắn vào backend và frontend chung | L |
| U5 | `u5-handover` | spec | Tài liệu bàn giao: hoàn thiện README, sơ đồ DB, danh sách API kèm JSON, kiểm khớp với code | (tài liệu, không thuộc khối nào) | Các file `.md` trong repo | S |

**Mô hình chạy chung** (`project.md` Tech Stack, ADR-001):
- Có đúng **hai chương trình**: một backend ASP.NET Core và một frontend React. Không có microservices.
- Các unit không phải chương trình riêng. Mỗi unit góp code vào một trong hai chương trình đó, hoặc góp tài liệu (U5).

**Vì sao U3 và U4 không gắn loại:** mỗi unit chứa cả backend lẫn giao diện. Để trống loại thì unit đi qua đủ mọi tài liệu thiết kế ở Construction, gồm cả nghiệp vụ, API và giao diện, nên không bỏ sót phần nào.

---

## U1 · `u1-backend-platform`

- **Trách nhiệm** (khối Platform, ADR-004):
  - Tạo solution .NET 10 gồm project API `EmployeeCrud.Api` và project test xUnit `EmployeeCrud.Api.Tests` có coverlet.
  - `AppDbContext` dùng Npgsql. Connection string đọc từ **user-secrets**; `appsettings.json` không chứa mật khẩu (NFR2).
  - Bắt mọi lỗi và trả ProblemDetails (400/404/409), lời báo tiếng Việt. Chuyển lỗi vi phạm ràng buộc database thành 409 hoặc 400, không để lộ 500.
  - CORS chỉ cho địa chỉ dev của Vite (NFR7). OpenAPI ở môi trường Development (FR6.4). JSON camelCase.
  - Tool manifest cục bộ cho `dotnet-ef` (team-practices Q3). `.editorconfig`. `.gitignore` loại `bin/`, `obj/`, file bí mật.
- **Không làm:** chưa có thực thể nào. Thực thể và migration do U3 và U4 thêm.
- **Bàn giao được:** `dotnet build` và `dotnet test` chạy xanh. Gọi một endpoint không tồn tại thì trả 404 dạng ProblemDetails. Có trang OpenAPI.
- **Ghi chú, ràng buộc:** không thêm gói đặt tên `snake_case` (team-practices Q10). Không cài công cụ toàn máy. Tài liệu: ghi phần "cài đặt backend" vào nháp README (Q3).

## U2 · `u2-web-shell`

- **Trách nhiệm** (phần dùng chung của WebUi, ADR-005, `refined-mockups/`):
  - Tạo dự án Vite React JavaScript.
  - React Router với các đường dẫn rỗng cho hai trang và trang 404.
  - `AppLayout`: liên kết bỏ qua, header, menu, `<main>`, vùng thông báo.
  - `StatusMessage`, `Toast`, `DataTable` dùng chung.
  - `src/api/client.js`: đọc ProblemDetails, nhận biết lỗi mạng.
  - `src/styles/tokens.css`, `base.css`, `components.css`.
  - ESLint (của Vite), Prettier, `lang="vi"`.
- **Không làm:** chưa có màn hình nghiệp vụ nào.
- **Bàn giao được:** `npm run dev` mở được khung trang có menu, liên kết bỏ qua, trang 404. `npm run lint` sạch.
- **Ghi chú, ràng buộc:** CSS thuần (refined-mockups Q1). Không Redux, không TypeScript. Tài liệu: ghi phần "cài đặt frontend" vào nháp README.

## U3 · `u3-departments`

- **Trách nhiệm** (khối DepartmentManagement, phần `features/departments` của WebUi):
  - Thực thể `Department` và cấu hình bảng `departments` (`snake_case`, tên không trùng, không phân biệt hoa thường).
  - Migration tạo bảng và **4 phòng ban mẫu** (FR1.7).
  - `DepartmentService` lo các luật FR1.1–FR1.5, có `ExistsAsync` cho U4 dùng.
  - `DepartmentsController` cho `/api/departments` (5 thao tác).
  - Unit test cho service: ít nhất 1 ca đúng và 2 ca lỗi.
  - Các trang danh sách, thêm, sửa, xóa phòng ban theo `mockups.md` mục 5–8.
- **Phần chưa trọn:** luật FR1.6 "không xóa phòng ban còn nhân viên" cần có bảng nhân viên. U3 làm xong việc xóa (FR1.4) nhưng **chưa** có bước kiểm còn nhân viên; U4 bổ sung. Trong lúc chưa có U4 thì chưa có nhân viên nào, nên không có dữ liệu sai.
- **Bàn giao được:** gọi đủ 5 API phòng ban bằng Postman, ra đúng mã. Thêm, sửa, xóa phòng ban trên giao diện. `dotnet test` xanh.
- **Tài liệu:** thêm các API phòng ban (kèm JSON mẫu) vào danh sách API; thêm bảng `departments` vào sơ đồ DB.

## U4 · `u4-employees`

- **Trách nhiệm** (khối EmployeeManagement, phần `features/employees` của WebUi):
  - Thực thể `Employee` và cấu hình bảng `employees`: email không trùng, không phân biệt hoa thường; khóa ngoại `department_id` kiểu **RESTRICT**.
  - Migration thứ hai.
  - `EmployeeService` lo các luật FR2.1–FR2.6 và tìm kiếm FR3.1–FR3.2; gọi `DepartmentService.ExistsAsync` (ADR-003).
  - `EmployeesController` cho `/api/employees`, có tham số `search`.
  - Unit test cho service.
  - Các trang danh sách, tìm kiếm, thêm, sửa, xóa nhân viên; ô chọn phòng ban.
  - **Bổ sung vào `DepartmentService`:** kiểm còn nhân viên trước khi xóa phòng ban, còn thì trả 409 (FR1.6, ADR-002), kèm unit test cho ca này.
- **Bàn giao được:** gọi đủ 5 API nhân viên và `?search=` bằng Postman. Xóa phòng ban còn nhân viên thì nhận 409. Làm được trọn luồng thêm, sửa, xóa, tìm trên giao diện. `dotnet test` xanh và độ phủ service ≥ 80%.
- **Ghi chú, ràng buộc:** cách tìm kiếm phải chạy được cả trên PostgreSQL thật lẫn trên database giả lập dùng khi test. Code Generation chọn cách làm; đây là câu hỏi còn mở từ `practices-discovery/evidence.md`.
- **Tài liệu:** thêm các API nhân viên vào danh sách API; thêm bảng `employees` và khóa ngoại vào sơ đồ DB.

## U5 · `u5-handover`

- **Trách nhiệm** (FR7.1–FR7.4, US5.1–US5.3, Q3):
  - Hoàn thiện `README.md`: phần mềm cần có kèm phiên bản, user-secrets, `dotnet tool restore`, `dotnet ef database update`, lệnh chạy hai chương trình, địa chỉ trang và địa chỉ API.
  - Hoàn thiện sơ đồ DB (mermaid `erDiagram`).
  - Hoàn thiện danh sách API: đủ 10 thao tác và ví dụ lỗi 400/404/409.
  - Đối chiếu từng mục với code đang chạy.
- **Không làm:** không viết code ứng dụng.
- **Bàn giao được:** làm theo README từ một bản clone sạch là chạy được. Sơ đồ khớp với pgAdmin. Danh sách API khớp với kết quả gọi bằng Postman.

---

## Những gì nằm ngoài các unit

- Các mục tiêu chất lượng G1–G6 (WCAG 2.1 AA, Lighthouse, W3C): U2, U3 và U4 làm đúng theo đặc tả; **bước Build and Test** đo và ghi kết quả.
- Demo 15 phút (`docs/ke-hoach.md` mục 5): Hiệp tự làm, không phải là phần mềm.
