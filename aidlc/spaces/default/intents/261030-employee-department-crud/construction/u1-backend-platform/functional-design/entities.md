# Thực thể: u1-backend-platform

> **Nguồn:**
> - `inception/units-generation/unit-of-work.md` (U1)
> - `inception/domain-design/components.md` (khối Platform không sở hữu thực thể nghiệp vụ nào)
> - `inception/contract-design/contract-summary.md` (C3, C5)
> - `inception/requirements-analysis/requirements.md` (FR4.2–FR4.4, NFR2, NFR7)
>
> **U1 không lưu dữ liệu nghiệp vụ nào.** `Department` thuộc U3, `Employee` thuộc U4. Các "thực thể" dưới đây là **hình dạng dữ liệu đi qua ranh giới** mà U1 sở hữu:
> - phong bì lỗi trả cho người gọi API;
> - các loại lỗi nghiệp vụ mà service của U3, U4 ném ra;
> - bộ cấu hình khởi động.
>
> Không có cái nào được lưu vào database.

```yaml
entities:
  - name: ErrorResponse
    description: Phong bì lỗi chuẩn (ProblemDetails, RFC 9457) cho mọi phản hồi lỗi của API - hợp đồng C3
    persisted: false
    attributes:
      - { name: type, logical_type: text, required: true, constraints: "URI theo RFC 9110 ứng với mã trạng thái" }
      - { name: title, logical_type: text, required: true, constraints: "tiếng Việt, ngắn, theo bảng ánh xạ trong rules.md" }
      - { name: status, logical_type: integer, required: true, allowed_values: [400, 404, 405, 409, 415, 500] }
      - { name: detail, logical_type: text, required: false, constraints: "tiếng Việt; không chứa stack trace, tên lớp, câu SQL hay chuỗi kết nối" }
      - { name: errors, logical_type: "map<text, list<text>>", required: false, constraints: "khóa là tên trường camelCase (hoặc 'body' khi không xác định được trường); giá trị là lời báo tiếng Việt; bắt buộc có ở 400 và ở 409 gắn với trường" }
    relationships: []

  - name: DomainError
    description: Lỗi nghiệp vụ mà service của U3, U4 ném ra để U1 đổi thành ErrorResponse - hợp đồng C5 domain_errors
    persisted: false
    attributes:
      - { name: kind, logical_type: enum, required: true, allowed_values: [NotFound, Validation, Conflict] }
      - { name: field, logical_type: text, required: false, constraints: "tên trường camelCase; bắt buộc với Validation; tùy chọn với Conflict; không có với NotFound" }
      - { name: message, logical_type: text, required: true, constraints: "tiếng Việt, hiện được cho người dùng" }
      - { name: title, logical_type: text, required: false, constraints: "ghi đè title mặc định của kind (dùng cho 'Không thể xóa phòng ban')" }
    relationships:
      - { to: ErrorResponse, cardinality: "1 -> 1", direction: "DomainError được đổi thành đúng một ErrorResponse" }

  - name: DatabaseConstraintName
    description: Tên cố định của các ràng buộc database mà U3, U4 phải dùng để U1 nhận ra lỗi vi phạm (23505, 23503) - đóng điểm R-04 của Contract Design
    persisted: false
    attributes:
      - { name: name, logical_type: text, required: true, unique: true, allowed_values: [ux_departments_name, ux_employees_email, fk_employees_department] }
      - { name: owner_unit, logical_type: text, required: true, allowed_values: [u3-departments, u4-employees] }
      - { name: violation_code, logical_type: text, required: true, allowed_values: ["23505", "23503"] }
    relationships: []

  - name: StartupSettings
    description: Các giá trị cấu hình U1 đọc khi khởi động
    persisted: false
    attributes:
      - { name: ConnectionStrings:Default, logical_type: text, required: true, constraints: "chỉ đến từ user-secrets (Development) hoặc biến môi trường; KHÔNG nằm trong appsettings*.json được commit" }
      - { name: Cors:AllowedOrigins, logical_type: "list<text>", required: false, default: ["http://localhost:5173"], constraints: "danh sách origin chính xác, không dùng '*'" }
      - { name: ASPNETCORE_ENVIRONMENT, logical_type: enum, required: false, default: Production, allowed_values: [Development, Production] }
    relationships: []
```

## Tóm tắt

| Thực thể | Dùng cho | Ai dùng |
|---|---|---|
| ErrorResponse | Mọi phản hồi lỗi của API | Giao diện (`client.js` của U2), Postman |
| DomainError | Service báo lỗi nghiệp vụ mà không cần biết mã HTTP | Service của U3, U4 ném; U1 đổi thành ErrorResponse |
| DatabaseConstraintName | Ba tên ràng buộc cố định để nhận ra lỗi database | U3, U4 đặt tên khi viết migration; U1 đọc khi đổi lỗi |
| StartupSettings | Chuỗi kết nối, CORS, môi trường | U1 đọc lúc khởi động; **Hiệp tự đặt** chuỗi kết nối bằng user-secrets |
