# Luật: u1-backend-platform

> **Nguồn:**
> - `inception/contract-design/contract-summary.md` (C3, C5)
> - `inception/requirements-analysis/requirements.md` (FR4.2–FR4.4, FR6.2, FR6.4, NFR2, NFR7)
> - `inception/user-stories/stories.md` (US4.1, US5.1, US5.2)
> - `inception/units-generation/unit-of-work.md` (U1)
>
> **Ba nhóm luật:**
> - **BR1:** đổi lỗi thành phản hồi chuẩn.
> - **BR2:** cấu hình và bảo mật.
> - **BR3:** xử lý request.
>
> Phần thêm so với hợp đồng: BR1.7 xử lý các lỗi do framework tự sinh (điểm R-02 của Contract Design), và BR1.4/BR1.5 ánh xạ theo tên ràng buộc cố định (điểm R-04). Hiệp đã chấp nhận hai điểm này là rủi ro ở gate Contract Design; ở đây chúng được giải quyết luôn, không thêm tính năng mới.

```yaml
rules:
  - id: BR1.1
    statement: Lỗi không tìm thấy trả 404
    category: policy
    applies_to: DomainError(kind=NotFound)
    trigger: Service ném lỗi NotFound
    logic: IF lỗi là NotFound THEN trả 404, title "Không tìm thấy", detail = message của lỗi, không có errors
    violation: -
    source: FR4.3

  - id: BR1.2
    statement: Dữ liệu sai trả 400 kèm lỗi theo từng trường, tiếng Việt, khóa camelCase
    category: validation
    applies_to: "kiểm dữ liệu tự động của API (thiếu, quá dài, sai định dạng) và DomainError(kind=Validation)"
    trigger: Request có dữ liệu không qua luật kiểm, hoặc service ném lỗi Validation
    logic: >
      IF có lỗi kiểm dữ liệu THEN trả 400, title "Dữ liệu không hợp lệ", errors = { <tênTrường camelCase>: [lời báo tiếng Việt] }.
      Phản hồi tự động mặc định của framework (title tiếng Anh, khóa PascalCase) phải được thay bằng dạng này.
    violation: -
    source: FR4.2

  - id: BR1.3
    statement: Xung đột nghiệp vụ trả 409
    category: policy
    applies_to: DomainError(kind=Conflict)
    trigger: Service ném lỗi Conflict (trùng tên phòng ban, trùng email, xóa phòng ban còn nhân viên)
    logic: >
      IF Conflict có field THEN trả 409, title "Dữ liệu bị trùng", errors = { <field>: [message] }.
      IF Conflict không có field THEN trả 409, title = title của lỗi (mặc định "Không thể thực hiện"), detail = message, không có errors.
    violation: -
    source: FR4.4

  - id: BR1.4
    statement: Vi phạm ràng buộc không trùng ở database trả 409 như BR1.3
    category: constraint
    applies_to: "lỗi PostgreSQL 23505 trên ux_departments_name hoặc ux_employees_email"
    trigger: Hai request cùng vượt qua bước kiểm trùng của service rồi một cái bị database từ chối
    logic: >
      IF mã 23505 và tên ràng buộc = ux_departments_name THEN 409, errors { name: ["Tên phòng ban đã tồn tại"] }.
      IF mã 23505 và tên ràng buộc = ux_employees_email THEN 409, errors { email: ["Email đã được sử dụng"] }.
      IF mã 23505 với tên khác THEN xử lý như BR1.6 (lỗi ngoài dự kiến, được ghi log).
    violation: -
    source: NFR3, FR4.4

  - id: BR1.5
    statement: Vi phạm khóa ngoại ở database đổi thành 400 hoặc 409 tùy thao tác
    category: constraint
    applies_to: "lỗi PostgreSQL 23503 (hoặc 23001 khi xóa phòng ban) trên fk_employees_department"
    trigger: Ghi nhân viên vào phòng ban vừa bị xóa, hoặc xóa phòng ban vừa có nhân viên (hai thao tác chen nhau)
    logic: >
      IF mã 23503 khi thêm/sửa nhân viên THEN 400, errors { departmentId: ["Phòng ban không tồn tại"] }.
      IF mã 23001 khi xóa phòng ban THEN 409, title "Không thể xóa phòng ban", detail "Không thể xóa phòng ban vì vẫn còn nhân viên." (đường dự phòng - đường chính có tên phòng ban do U4 ném Conflict).
      Phân biệt hai trường hợp bằng thao tác đang thực hiện (U3/U4 báo ngữ cảnh khi lưu), không đoán từ chuỗi lỗi.
      Đính chính (Build and Test, 03/11/2026): khóa ngoại đặt ON DELETE RESTRICT nên khi xóa phòng ban còn nhân viên PostgreSQL 18 báo 23001 (restrict_violation), không phải 23503 (thấy thật ở U4, U5). Khi thêm/sửa nhân viên vẫn là 23503.
    violation: -
    source: NFR3, FR2.6, FR1.6

  - id: BR1.6
    statement: Lỗi ngoài dự kiến trả 500 chung chung, chi tiết chỉ nằm trong log
    category: policy
    applies_to: mọi lỗi không thuộc BR1.1-BR1.5, BR1.7
    trigger: Ngoại lệ không được xử lý
    logic: >
      IF lỗi không xác định THEN ghi log mức Error kèm chi tiết kỹ thuật ở phía máy chủ,
      trả 500, title "Lỗi máy chủ", detail "Đã có lỗi xảy ra, vui lòng thử lại sau."; không gửi stack trace, câu SQL, chuỗi kết nối.
    violation: -
    source: FR4.2-FR4.4 (phong bì C3)

  - id: BR1.7
    statement: Lỗi do framework tự sinh cũng theo phong bì C3
    category: policy
    applies_to: "JSON hỏng/sai kiểu, id trên đường dẫn không phải số, đường dẫn không tồn tại, sai phương thức, sai Content-Type"
    trigger: Request không tới được controller hoặc không đọc được body
    logic: >
      JSON hỏng hoặc sai kiểu -> 400 "Dữ liệu không hợp lệ", errors có khóa là tên trường camelCase khi xác định được, ngược lại "body": ["Dữ liệu gửi lên không đúng định dạng JSON"].
      id không phải số nguyên -> 404 "Không tìm thấy" (ràng buộc kiểu trên đường dẫn làm route không khớp).
      Đường dẫn không tồn tại -> 404 "Không tìm thấy", detail "Không có đường dẫn API này.".
      Sai phương thức -> 405 "Phương thức không được hỗ trợ". Sai Content-Type -> 415 "Kiểu dữ liệu không được hỗ trợ", detail "Hãy gửi JSON (Content-Type: application/json).".
    violation: -
    source: FR4.2, FR4.3, AC5.2.3

  - id: BR1.8
    statement: Mọi phản hồi lỗi có Content-Type application/problem+json
    category: policy
    applies_to: mọi phản hồi 4xx/5xx từ BR1.1-BR1.7
    trigger: Trả lỗi
    logic: IF phản hồi là lỗi THEN Content-Type = application/problem+json và body là ErrorResponse
    violation: -
    source: AC4.1.2, AC5.2.3

  - id: BR2.1
    statement: Chuỗi kết nối chỉ đến từ user-secrets hoặc biến môi trường; thiếu thì dừng khởi động với lời báo rõ
    category: constraint
    applies_to: StartupSettings.ConnectionStrings:Default
    trigger: Ứng dụng khởi động
    logic: >
      IF ConnectionStrings:Default rỗng hoặc không có THEN không khởi động, ghi lỗi
      "Thiếu cấu hình ConnectionStrings:Default. Hãy đặt bằng: dotnet user-secrets set \"ConnectionStrings:Default\" \"Host=localhost;Port=5432;Database=employee_db;Username=...;Password=...\"" (không in ra mật khẩu nào).
    violation: Ứng dụng thoát với mã lỗi khác 0
    source: NFR2, AC5.1.2

  - id: BR2.2
    statement: Không file nào được commit chứa mật khẩu database
    category: constraint
    applies_to: appsettings*.json, mã nguồn, .gitignore
    trigger: Mỗi lần commit
    logic: IF một file được theo dõi chứa mật khẩu THEN vi phạm; appsettings*.json chỉ được có chuỗi kết nối KHÔNG mật khẩu hoặc không có
    violation: Bị bắt ở bước kiểm của Build and Test (git grep)
    source: NFR2, project.md Forbidden

  - id: BR2.3
    statement: Chỉ origin dev của Vite được gọi API từ trình duyệt; phản hồi lỗi cũng mang header CORS
    category: authorization
    applies_to: mọi request từ trình duyệt
    trigger: Request có header Origin
    logic: >
      IF Origin thuộc Cors:AllowedOrigins (mặc định http://localhost:5173) THEN cho phép GET, POST, PUT, DELETE và header Content-Type, không gửi credential.
      Chính sách CORS phải áp dụng cả cho phản hồi lỗi 4xx/5xx để trình duyệt đọc được ProblemDetails (không biến thành "lỗi mạng").
      IF Origin khác THEN không thêm header cho phép.
    violation: Trình duyệt chặn đọc phản hồi
    source: NFR7

  - id: BR2.4
    statement: Tài liệu OpenAPI chỉ bật ở môi trường Development
    category: policy
    applies_to: đường dẫn tài liệu OpenAPI
    trigger: Ứng dụng khởi động
    logic: IF môi trường = Development THEN phục vụ tài liệu OpenAPI và trang xem tài liệu; ngược lại không phục vụ
    violation: -
    source: FR6.4

  - id: BR2.5
    statement: JSON vào/ra dùng tên trường camelCase và bỏ qua trường lạ
    category: policy
    applies_to: mọi body JSON
    trigger: Đọc/ghi JSON
    logic: Tên thuộc tính đổi sang camelCase khi ghi; khi đọc, trường không biết bị bỏ qua (không lỗi)
    violation: -
    source: FR6.2, C3 client_rules

  - id: BR3.1
    statement: Mọi truy cập database chạy bất đồng bộ, mỗi request một ngữ cảnh database riêng
    category: constraint
    applies_to: AppDbContext
    trigger: Mỗi request
    logic: Ngữ cảnh database có vòng đời theo request (scoped); mọi thao tác đọc/ghi là bất đồng bộ và nhận tín hiệu hủy của request
    violation: -
    source: NFR5, ADR-004

  - id: BR3.2
    statement: Log không chứa bí mật
    category: constraint
    applies_to: log ứng dụng
    trigger: Ghi log
    logic: Không ghi chuỗi kết nối, mật khẩu hay toàn bộ body request; lỗi 500 ghi loại lỗi, thông điệp và đường dẫn request
    violation: -
    source: NFR2
```

## Tóm tắt luật

| ID | Luật | Kết quả |
|---|---|---|
| BR1.1 | Không tìm thấy | 404 "Không tìm thấy" |
| BR1.2 | Dữ liệu sai | 400 "Dữ liệu không hợp lệ" + errors camelCase |
| BR1.3 | Xung đột nghiệp vụ | 409 + errors (có trường) hoặc detail (không có trường) |
| BR1.4 | Database báo trùng (23505) | 409, nhận ra theo tên ràng buộc |
| BR1.5 | Database báo vi phạm khóa ngoại (23503; 23001 khi xóa phòng ban) | 400 `departmentId` khi ghi nhân viên / 409 khi xóa phòng ban |
| BR1.6 | Lỗi ngoài dự kiến | 500 chung chung; chi tiết chỉ ghi vào log |
| BR1.7 | Lỗi do framework tự sinh | 400 / 404 / 405 / 415 theo phong bì C3 |
| BR1.8 | Kiểu nội dung lỗi | `application/problem+json` |
| BR2.1 | Chuỗi kết nối | Chỉ từ user-secrets; thiếu thì dừng khởi động và báo rõ |
| BR2.2 | Không commit mật khẩu | Kiểm bằng `git grep` |
| BR2.3 | CORS | Chỉ `http://localhost:5173`; phản hồi lỗi cũng có header CORS |
| BR2.4 | OpenAPI | Chỉ bật ở Development |
| BR2.5 | JSON | camelCase, bỏ qua trường lạ |
| BR3.1 | Truy cập database | Bất đồng bộ, mỗi request một ngữ cảnh |
| BR3.2 | Log | Không chứa bí mật |
