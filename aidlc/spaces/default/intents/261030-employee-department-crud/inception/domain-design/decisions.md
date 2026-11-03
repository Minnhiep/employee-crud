# Nhật ký quyết định kiến trúc (ADR)

> **Nguồn:**
> - `domain-design-questions.md` (Q1–Q4)
> - `requirements-analysis/requirements.md`
> - `practices-discovery/team-practices.md`
> - `aidlc/spaces/default/memory/project.md` (Tech Stack, Forbidden)
>
> Mỗi ADR gồm: bối cảnh, quyết định, hệ quả, phương án bị loại, và ảnh hưởng tới bảo mật (theo luật của giai đoạn Inception).

| ADR | Tiêu đề | Status |
|---|---|---|
| ADR-001 | Chia thành bốn khối: Phòng ban, Nhân viên, Nền tảng chung, Giao diện web | Accepted |
| ADR-002 | Chặn xóa phòng ban còn nhân viên: khối Phòng ban tự đếm, khóa ngoại chặn thêm | Accepted |
| ADR-003 | Nhân viên phụ thuộc một chiều vào Phòng ban | Accepted |
| ADR-004 | Một DbContext dùng chung đặt ở Nền tảng chung | Accepted |
| ADR-005 | Code React xếp theo tính năng | Accepted |
| ADR-006 | Đếm nhân viên theo phòng ban ở khối Phòng ban (CR 03/11) | Accepted |
| ADR-007 | Lọc theo phòng ban bằng tham số; trang chi tiết dùng lại API có sẵn (CR 03/11) | Accepted |

---

## ADR-001: Chia thành bốn khối

## Status: Accepted

**Context.**
- Ứng dụng có hai thực thể với luật riêng: phòng ban (tên không trùng, chặn xóa khi còn nhân viên) và nhân viên (email không trùng, tìm kiếm).
- Có một số việc dùng chung: kết nối DB, lỗi ProblemDetails, CORS, OpenAPI.
- Giao diện chạy riêng trong trình duyệt.
- `project.md` cấm microservices và kiến trúc phức tạp.
- Hiệp phải tự giải thích được từng phần.
- Thứ tự làm đã chốt: phòng ban trước, nhân viên sau.

**Decision.** Chia thành bốn khối logic: DepartmentManagement, EmployeeManagement, Platform, WebUi (Q1-A). Mỗi khối nghiệp vụ sở hữu đúng một thực thể. Đây là ranh giới logic trong code, không phải các dịch vụ chạy riêng. Cách đóng gói để chạy do bước Units Generation quyết.

**Consequences.**
- (+) Mỗi khối có một trách nhiệm gọi tên được, khớp hai nhóm story (US1.x, US2.x), dễ làm phòng ban trước.
- (+) Lúc trình bày, Hiệp nói được "luật phòng ban nằm ở đây, luật nhân viên nằm ở kia".
- (−) Có thêm một khối Platform phải hiểu. Nếu dồn quá nhiều thứ vào Platform, nó dễ thành "cái gì cũng bỏ vào".
- (·) Bước sau cần giữ Platform chỉ chứa phần hạ tầng dùng chung, không chứa luật nghiệp vụ.

**Alternatives Rejected.**
- **Q1-B, gộp Phòng ban và Nhân viên thành "Quản lý nhân sự":** ít ranh giới hơn, nhưng một khối ôm hai thực thể, các luật lẫn vào nhau, khó chia việc theo thứ tự đã chốt.
- **Q1-C, tách giao diện thành hai khối:** hai khối dùng chung khung trang, menu, module API và hệ thống CSS, nên luôn đổi cùng nhau. Tách ra chỉ thêm ranh giới giả.

**Security.**
- Không có đăng nhập, theo `project.md` Forbidden.
- Lớp bảo vệ ở biên là: kiểm dữ liệu lại ở API (không tin form), và CORS chỉ cho frontend phát triển gọi.
- Cả hai đều đặt ở Platform và ở khối nghiệp vụ, không dựa vào WebUi.

---

## ADR-002: Chặn xóa phòng ban còn nhân viên

## Status: Accepted

**Context.**
- FR1.6 yêu cầu từ chối xóa phòng ban còn nhân viên và trả 409 kèm lời báo tiếng Việt.
- Dữ liệu nhân viên thuộc khối EmployeeManagement, mà EmployeeManagement đã phụ thuộc DepartmentManagement (ADR-003).
- Nếu Phòng ban gọi ngược lại Nhân viên thì sinh vòng phụ thuộc.

**Decision.** (Sửa bởi ADR-006 ngày 03/11: `AnyAsync` đổi thành `CountAsync` để câu báo có số N.) DepartmentManagement tự kiểm bằng một truy vấn **chỉ đọc** (`AnyAsync` trên bảng nhân viên với `department_id = id`) qua DbContext dùng chung, ngay trước khi xóa. Phòng còn nhân viên thì trả 409. Khóa ngoại `employees.department_id → departments.id` kiểu **RESTRICT** là chốt chặn thứ hai. Nếu hai thao tác chen nhau, database từ chối và Platform chuyển lỗi đó thành 409 (Q2-A).

**Consequences.**
- (+) Không có vòng phụ thuộc. Code ngắn, đọc là hiểu.
- (+) Luật được chặn hai lớp: ứng dụng và database. Lời báo tiếng Việt rõ ràng nằm ở lớp ứng dụng.
- (−) DepartmentManagement biết tới bảng nhân viên. Đây là chỗ đọc chéo dữ liệu có chủ đích. Nếu sau này tách thành dịch vụ riêng thì phải đổi lại.
- (·) Unit test của service phòng ban phải tạo sẵn nhân viên trong database giả lập để thử trường hợp bị từ chối.

**Alternatives Rejected.**
- **Q2-B, hỏi khối Nhân viên qua `CountByDepartmentAsync`:** ranh giới sạch hơn nhưng tạo vòng Phòng ban ↔ Nhân viên.
- **Q2-C, chỉ dựa vào khóa ngoại:** không phụ thuộc chéo, nhưng phải bắt lỗi riêng của PostgreSQL (mã `23503`) rồi diễn giải. Khó giải thích hơn, và lời báo phụ thuộc chi tiết của database.

**Security.**
- Truy vấn dùng tham số qua EF Core, không ghép chuỗi SQL, nên không có nguy cơ SQL injection.
- Khóa ngoại RESTRICT ngăn mất dữ liệu nhân viên do xóa dây chuyền (cascade).

---

## ADR-003: Nhân viên phụ thuộc một chiều vào Phòng ban

## Status: Accepted

**Context.**
- Khi thêm hoặc sửa nhân viên phải kiểm phòng ban có tồn tại; không có thì trả 400 với lỗi ở trường `departmentId` (FR2.6).
- Danh sách nhân viên phải trả kèm `departmentName` (FR6.3).

**Decision.**
- Kiểm tồn tại bằng cách gọi `DepartmentManagement.ExistsAsync(id)`.
- Tên phòng ban lấy bằng JOIN có sẵn của EF Core (`Include` hoặc phép chiếu `Select`) trên quan hệ Employee → Department, vì quan hệ này đã được khai báo một lần ở DbContext dùng chung (Q3-A).

**Consequences.**
- (+) Luật "phòng ban có tồn tại không" chỉ viết một lần, ở chủ sở hữu của nó.
- (+) Lấy tên phòng ban bằng JOIN chỉ tốn một câu SQL, không gọi lặp từng dòng (tránh lỗi N+1 query).
- (−) Phép JOIN để lấy tên vẫn chạm bảng phòng ban. Đây là đọc chéo chấp nhận được, chỉ để hiển thị.
- (·) Khi test service nhân viên, có thể dùng service phòng ban thật trên database giả lập, hoặc thay bằng bản giả (mock).

**Alternatives Rejected.**
- **Q3-B, khối Nhân viên tự truy vấn bảng phòng ban cho cả hai việc:** ít code hơn, nhưng luật tồn tại bị viết ở hai nơi và đọc chéo nhiều chỗ hơn.

**Security.** Không có tác động mới. `departmentId` từ client luôn được kiểm lại ở server trước khi ghi.

---

## ADR-004: Một DbContext dùng chung đặt ở Nền tảng chung

## Status: Accepted

**Context.**
- Một database `employee_db`, hai bảng có khóa ngoại với nhau. EF Core cần biết cả hai thực thể và quan hệ của chúng để tạo migration và khóa ngoại.
- Ứng dụng nhỏ, một người làm.

**Decision.**
- Platform chứa **một** `AppDbContext` khai báo cả `Department` và `Employee`, kèm cấu hình bảng, cột `snake_case`, chỉ mục không trùng, khóa ngoại RESTRICT và dữ liệu mẫu.
- Các khối nghiệp vụ dùng DbContext này qua Dependency Injection.
- Lớp thực thể (`Department`, `Employee`) chỉ là hình dạng dữ liệu. Luật nghiệp vụ nằm trong service của khối sở hữu.

**Consequences.**
- (+) Một migration duy nhất tạo đủ bảng, khóa ngoại và dữ liệu mẫu. Hiệp đọc một chỗ là thấy toàn bộ database.
- (+) Tạo được JOIN và khóa ngoại giữa hai bảng một cách tự nhiên.
- (−) Ở mức code, DbContext phải biết lớp thực thể của cả hai khối, tức là Platform tham chiếu kiểu dữ liệu của chúng. Đây là phụ thuộc về "hình dạng", không phải "gọi hàm", nên danh mục không ghi nó là `depends_on`.
- (·) Bước Functional Design quyết chi tiết kiểu dữ liệu và ràng buộc của từng cột.

**Alternatives Rejected.**
- **Mỗi khối một DbContext riêng:** ranh giới dữ liệu chặt hơn, nhưng khóa ngoại và migration giữa hai context rất rối với người mới. Quá mức cho hai bảng.
- **Mỗi khối một schema PostgreSQL riêng:** dùng cho modular monolith lớn; ở đây chỉ thêm phức tạp, trái `project.md` (không kiến trúc phức tạp).

**Security.**
- Connection string, trong đó có mật khẩu, đọc từ user-secrets và không bao giờ nằm trong file commit (NFR2, `project.md` Forbidden).
- Tài khoản PostgreSQL dùng cho ứng dụng chỉ cần quyền trên database `employee_db`. README sẽ hướng dẫn việc này ở bước bàn giao.

---

## ADR-005: Code React xếp theo tính năng

## Status: Accepted

**Context.**
- WebUi có hai nhóm màn hình (phòng ban, nhân viên) và một số phần dùng chung: khung trang, bảng, thông báo, module gọi API (`refined-mockups/interaction-spec.md`).
- Thứ tự làm là phòng ban trước, nhân viên sau.

**Decision.**
- Xếp code theo tính năng (Q4-A): `src/features/departments/`, `src/features/employees/`, `src/components/` (dùng chung), `src/api/` (module gọi API chung), `src/styles/` (biến CSS, theo `design-system-mapping.md`).

**Consequences.**
- (+) Làm hay trình bày phần nào thì chỉ mở một thư mục. Khớp cách chia việc theo phòng ban trước, nhân viên sau.
- (−) Phải giữ kỷ luật: thứ dùng chung thật sự mới đưa vào `components/`, tránh copy giữa hai thư mục tính năng.

**Alternatives Rejected.**
- **Q4-B, theo loại file (`pages/`, `components/`, `services/`):** quen thuộc trong hướng dẫn trên mạng, nhưng code của một tính năng nằm rải ở ba thư mục, khó theo dõi khi trình bày.

**Security.** Không có tác động. Module `src/api/` là nơi duy nhất ghép địa chỉ API, không chứa bí mật nào (frontend không giữ mật khẩu).

---

## ADR-006: Đếm nhân viên theo phòng ban ở khối Phòng ban (Change Request 03/11/2026)

## Status: Accepted

**Context.**
- FR8.1 cần `employeeCount` cho mọi phòng ban trong danh sách và trang chi tiết; FR8.4 cần số N trong câu báo 409.
- ADR-002 đã cho DepartmentManagement đọc chéo bảng nhân viên (chỉ đọc) để chặn xóa; ADR-003 giữ phụ thuộc một chiều Nhân viên → Phòng ban.

**Decision.** DepartmentManagement đếm bằng phép chiếu EF Core trên DbContext dùng chung: mỗi phòng `Count` nhân viên có `department_id` bằng id, dịch thành **một** câu SQL có truy vấn con hoặc `GROUP BY` cho cả danh sách. Khi xóa, `CountAsync` thay cho `AnyAsync` để lời báo có số N. Không thêm cột lưu sẵn số đếm.

**Consequences.**
- (+) Không có vòng phụ thuộc; mở rộng đúng chỗ đọc chéo đã chấp nhận ở ADR-002.
- (+) Số luôn đúng với dữ liệu hiện tại, không phải đồng bộ cột đếm.
- (−) Mỗi lần lấy danh sách phải đếm; với ≤ 1.000 nhân viên và chỉ mục `ix_employees_department_id` (đã có trong migration `CreateEmployees`, khai báo tên tay ở `EmployeeConfiguration`, U4-NFR5.8) thì không đáng kể.
- (·) Nhánh chen nhau: khóa ngoại RESTRICT chặn; DepartmentService đã tự bắt lỗi này theo tên `fk_employees_department` (không để Platform báo chung), nên nó đếm lại rồi báo "Không thể xóa phòng ban vì còn N nhân viên" với N đếm lúc đó.
- (·) Số đếm và danh sách có thể lệch trong chốc lát nếu có người thêm/xóa giữa hai lần gọi; chấp nhận được với một người dùng, tải lại là đúng.
- (·) Kiểm số câu SQL bằng log EF Core (U3-NFR6.3), unit test kiểm giá trị đếm.

**Alternatives Rejected.**
- **Khối Nhân viên cung cấp hàm đếm:** tạo vòng Phòng ban ↔ Nhân viên (cùng lý do Q2-B ở ADR-002).
- **Cột `employee_count` lưu sẵn trong bảng phòng ban:** phải cập nhật mỗi lần thêm, sửa, xóa nhân viên, dễ lệch khi chen nhau.
- **Frontend tự đếm từ danh sách nhân viên:** phải tải toàn bộ nhân viên chỉ để đếm, không đúng khi có lọc.

**Security.** Truy vấn tham số hóa qua EF Core; chỉ trả số đếm, không lộ thêm dữ liệu.

---

## ADR-007: Lọc theo phòng ban bằng tham số và trang chi tiết dùng lại API có sẵn (Change Request 03/11/2026)

## Status: Accepted

**Context.**
- FR8.3 cần lọc nhân viên theo phòng, kết hợp với `search`; FR8.2 cần trang chi tiết phòng ban liệt kê nhân viên của phòng.

**Decision.**
- `GET /api/employees` nhận thêm `departmentId` (không bắt buộc) do EmployeeManagement xử lý, ghép AND với `search` trong cùng một truy vấn.
- Trang chi tiết gọi `GET /api/departments/{id}` (có `employeeCount`) và `GET /api/employees?departmentId={id}`; không thêm endpoint lồng `/api/departments/{id}/employees`.
- `departmentId` sai kiểu hoặc ≤ 0 trả 400; số hợp lệ không có phòng trả `[]` (lọc là phép chọn, không phải tra cứu một bản ghi).
- Controller nhận `departmentId` dạng chuỗi; EmployeeService tự đọc số và ném lỗi Validation tiếng Việt ("Phòng ban lọc không hợp lệ") gắn với trường `departmentId`, để không lọt câu tiếng Anh của model binding (ProblemDetails 400 qua Platform như mọi lỗi khác).

**Consequences.**
- (+) Một cách lấy danh sách nhân viên cho cả trang Nhân viên và trang chi tiết; ít endpoint, ít code.
- (+) Giữ ranh giới: dữ liệu nhân viên chỉ ra từ khối Nhân viên.
- (−) Trang chi tiết gọi 2 API; chạy song song nên không chậm thêm đáng kể.

**Alternatives Rejected.**
- **Endpoint lồng `/api/departments/{id}/employees`:** đúng kiểu REST lồng nhưng lặp logic danh sách nhân viên ở khối Phòng ban.
- **Trả 404 khi phòng không tồn tại lúc lọc:** trộn nghĩa "không tìm thấy bản ghi" với "bộ lọc không ra kết quả".

**Security.** `departmentId` được kiểm kiểu ở server; truy vấn tham số hóa.
