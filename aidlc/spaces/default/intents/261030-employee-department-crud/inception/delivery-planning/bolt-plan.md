# Kế hoạch Bolt

> **Nguồn:**
> - `units-generation/unit-of-work.md`, `units-generation/unit-of-work-dependency.md`, `units-generation/unit-of-work-story-map.md`
> - `contract-design/contract-summary.md`
> - `requirements-analysis/requirements.md`
> - `user-stories/stories.md`
> - `refined-mockups/mockups.md`
> - `domain-design/components.md` (bốn khối Platform, DepartmentManagement, EmployeeManagement, WebUi)
> - `practices-discovery/team-practices.md`
> - `delivery-planning-questions.md` (Q1–Q4)
>
> **Bolt** là một lượt làm trọn một phần việc: đi qua các bước thiết kế chi tiết, sinh code và kiểm thử, kết thúc bằng thứ chạy được để xem. Mỗi Bolt ở đây ứng với đúng một unit (Q2).

## Cách làm chung cho mọi Bolt

- **Thứ tự:** B1 → B2 → B3 → B4 → B5 (Q1: nền backend trước, rồi đi theo giá trị). Thứ tự này khớp sơ đồ phụ thuộc; chỉ có cặp U1/U2 là có quyền chọn.
- **Cách đi qua Construction:** theo unit, lần lượt, không làm song song (Q3). Mỗi unit đi trọn các bước thiết kế chi tiết, sinh code, kiểm thử, rồi tới **điểm kiểm** để Hiệp duyệt mới sang unit sau.
- **Bộ khung chạy thử (walking skeleton):** không áp dụng, theo team-practices. Không Bolt nào mang dấu bộ khung.
- **Git** (team-practices, Way of Working): làm trên `main`. Sau mỗi Bolt đã build và test qua, **Hiệp tự commit** bằng lời ghi chú tiếng Việt. AI-DLC không commit, không push.
- **Kết nối database do Hiệp tự làm** (Hiệp dặn ở Q4: "kết nối DB hay j thì chỉ tôi nhé, otio kết nối luôn vì tôi có tải rồi"):
  - Mọi bước chạm vào PostgreSQL trên máy, gồm tạo database `employee_db`, đặt mật khẩu bằng `dotnet user-secrets set`, chạy `dotnet ef database update` và kiểm trong pgAdmin, đều do AI-DLC **viết hướng dẫn từng bước**, còn **Hiệp tự thực hiện**.
  - AI-DLC không tự gõ mật khẩu, không tự tạo database.
- **Đo chất lượng** (Q4 có chọn mục C): bộ CSS chung và khung trang được kiểm a11y (khả năng tiếp cận) ngay ở B2, không đợi tới cuối.

## B1 · Nền backend: `u1-backend-platform` (U1)

- **Unit:** U1
- **Dấu bộ khung:** không
- **Definition of Done:**
  - Có solution .NET 10 gồm `EmployeeCrud.Api` và `EmployeeCrud.Api.Tests` (xUnit + coverlet). `dotnet build` không lỗi; `dotnet test` chạy được.
  - Hiệp **tự** làm theo hướng dẫn: tạo database `employee_db` trong pgAdmin, rồi `dotnet user-secrets set "ConnectionStrings:Default" "..."`. Kiểm bằng `dotnet ef dbcontext info`: lệnh báo đúng provider Npgsql và kết nối được.
  - `appsettings.json` không chứa mật khẩu; `.gitignore` loại `bin/`, `obj/` và file bí mật (NFR2).
  - Có middleware lỗi theo hợp đồng C3: gọi `GET /api/khong-ton-tai` thì nhận 404 `application/problem+json`, `title` tiếng Việt.
  - CORS cho `http://localhost:5173`. Trang OpenAPI mở được ở môi trường Development.
  - Có tool manifest `dotnet-ef` (cài cục bộ, không cài toàn máy) và `.editorconfig`; `dotnet format --verify-no-changes` sạch.
  - Có nháp phần "Cài đặt backend" cho README.
- **Giả thuyết cần chứng minh:** máy của Hiệp và cấu hình user-secrets đủ để backend nói chuyện được với PostgreSQL thật, và lỗi API trả đúng dạng ProblemDetails tiếng Việt. Nếu B1 qua thì các Bolt sau không còn vướng chuyện "kết nối".
- **Demo dự kiến:** chạy `dotnet run`, mở trang OpenAPI, gọi một đường dẫn sai bằng Postman để thấy 404 ProblemDetails, chạy `dotnet ef dbcontext info` để thấy kết nối tốt.

## B2 · Nền giao diện: `u2-web-shell` (U2)

- **Unit:** U2
- **Dấu bộ khung:** không
- **Definition of Done:**
  - Có dự án Vite React JavaScript. `npm run dev` mở được khung trang gồm header, menu "Nhân viên"/"Phòng ban", liên kết bỏ qua và trang 404.
  - Có `src/api/client.js` theo C3: timeout 10 giây, không tự gọi lại, đọc ProblemDetails.
  - Có các component dùng chung `StatusMessage`, `Toast`, `DataTable`.
  - Có `tokens.css`, `base.css`, `components.css` theo `design-system-mapping.md`.
  - `npm run lint` sạch. Prettier đã cấu hình. `lang="vi"`.
  - **Kiểm a11y sớm** (Q4-C): Lighthouse Accessibility = 100 trên khung trang và trang 404 (chạy trên bản build); dùng hết khung trang chỉ bằng bàn phím.
  - Có nháp phần "Cài đặt frontend" cho README.
- **Giả thuyết cần chứng minh:** bộ CSS và khung trang dùng chung đạt chuẩn tiếp cận ngay từ đầu. Nếu khung đã đạt 100 thì các trang nghiệp vụ chỉ cần không làm hỏng nó.
- **Demo dự kiến:** mở trang, chuyển menu, nhấn Tab để thấy liên kết bỏ qua và viền focus, chạy Lighthouse.

## B3 · Tính năng phòng ban: `u3-departments` (U3)

- **Unit:** U3
- **Dấu bộ khung:** không
- **Definition of Done:**
  - Migration thứ nhất tạo bảng `departments` và 4 phòng ban mẫu. Hiệp **tự** chạy `dotnet ef database update` theo hướng dẫn, rồi thấy bảng trong pgAdmin.
  - `DepartmentService` và `DepartmentsController` đúng hợp đồng C1.
  - Có unit test cho service, mỗi chức năng có ca đúng và ca lỗi; `dotnet test` xanh.
  - Đã chốt cách so sánh không phân biệt hoa thường dùng chung cho test và PostgreSQL thật (câu hỏi mở của C2/C5).
  - Có trang danh sách, thêm, sửa, xóa phòng ban theo mockups mục 5–8.
  - Postman: 5 thao tác trả đúng mã. Trình duyệt: các tiêu chí của US1.1–US1.3 và AC1.4.1, AC1.4.2, AC1.5.1 đạt.
  - Danh sách API có phần phòng ban; sơ đồ DB có bảng `departments`.
- **Giả thuyết cần chứng minh:** luồng trọn React → Web API JSON → ASP.NET Core → EF Core → PostgreSQL chạy được cho một thực thể. Đây cũng là lần đầu đường đi của mục tiêu chính trong `docs/ke-hoach.md` được chứng minh.
- **Demo dự kiến:** thêm "Kỹ thuật", thử thêm "kỹ thuật" để thấy 409 "Tên phòng ban đã tồn tại", sửa, xóa; mở pgAdmin để thấy dữ liệu đổi theo.

## B4 · Tính năng nhân viên: `u4-employees` (U4)

- **Unit:** U4
- **Dấu bộ khung:** không
- **Definition of Done:**
  - Migration thứ hai tạo bảng `employees`, có khóa ngoại kiểu RESTRICT và chỉ mục không trùng email. Hiệp **tự** chạy `dotnet ef database update`.
  - `EmployeeService` (gồm tìm kiếm) và `EmployeesController` đúng hợp đồng C2.
  - `DepartmentService.DeleteAsync` đã thêm bước chặn xóa phòng ban còn nhân viên (C4).
  - Có unit test; `dotnet test` xanh. Độ phủ dòng của các lớp service ≥ 80% (coverlet).
  - Có trang danh sách, tìm, thêm, sửa, xóa nhân viên.
  - Các tiêu chí của US2.1–US2.4, US3.1, AC1.4.3, AC1.5.2 đạt.
  - Danh sách API và sơ đồ DB có phần nhân viên.
- **Giả thuyết cần chứng minh:** quan hệ giữa hai thực thể (khóa ngoại, ô chọn phòng ban, chặn xóa) và tìm kiếm không phân biệt hoa thường chạy đúng trên PostgreSQL thật lẫn trong test.
- **Demo dự kiến:** thêm nhân viên vào "Kế toán", tìm "an", thử xóa "Kế toán" để thấy 409, đổi phòng rồi xóa được.

## B5 · Bàn giao: `u5-handover` (U5)

- **Unit:** U5
- **Dấu bộ khung:** không
- **Definition of Done:**
  - README hoàn chỉnh (FR7.4).
  - Sơ đồ DB dạng mermaid `erDiagram`, khớp pgAdmin.
  - Danh sách API đủ 10 thao tác, kèm ví dụ lỗi 400/404/409, khớp với kết quả gọi Postman.
  - Hiệp làm theo README từ một bản clone sạch và chạy được.
- **Giả thuyết cần chứng minh:** một người khác (persona P2, ví dụ anh Hiếu) cài và kiểm được bài chỉ bằng tài liệu.
- **Demo dự kiến:** clone ra một thư mục mới, làm theo README từng bước, gọi Postman theo danh sách API.

## Sau các Bolt

Bước Build and Test (một lần cho toàn bộ) đo: độ phủ ≥ 80%, NFR5 (dưới 1 giây với 1.000 nhân viên), các mục tiêu G1–G6 (Lighthouse, W3C, WCAG), và kiểm tay cả luồng theo `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md`.
