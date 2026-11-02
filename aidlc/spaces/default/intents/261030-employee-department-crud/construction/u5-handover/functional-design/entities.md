# Thực thể — U5 `u5-handover`

> **Nguồn:**
> - `inception/units-generation/unit-of-work.md` §U5 (trách nhiệm, "không làm", "bàn giao được")
> - `inception/units-generation/unit-of-work-story-map.md` (U5 lo US5.1–US5.3; US5.1 và US5.2 chia với U1)
> - `inception/user-stories/stories.md` (AC5.1.1–AC5.3.3)
> - `inception/requirements-analysis/requirements.md` (FR7.1–FR7.4, FR6.1–FR6.4, FR4.3–FR4.4, NFR1–NFR3)
> - `inception/domain-design/components.md` (U5 không thuộc khối logic nào; nội dung tài liệu mô tả các khối Platform, DepartmentManagement, EmployeeManagement, WebUi)
> - `inception/contract-design/contract-summary.md` (C1, C2: 10 thao tác API; C3: phong bì lỗi chung; §4: cổng thật lấy từ cấu hình dự án)
> - `functional-design-questions.md` (Q1–Q5, Hiệp chọn A cả năm)

U5 là unit loại `spec`: không có dữ liệu nghiệp vụ mới. "Thực thể" ở đây là **ba tài liệu bàn giao** và các phần bắt buộc bên trong từng tài liệu. Hai bảng `departments`, `employees` đã do U3, U4 định nghĩa; U5 chỉ mô tả lại chúng, không thay đổi.

## Mô hình (nguồn đúng)

```yaml
entities:
  - name: HandoverReadme
    description: >
      README.md ở thư mục gốc repo. Hướng dẫn người cài (persona P2) đi từ bản clone sạch
      tới lúc chạy được cả hai chương trình, rồi trỏ sang hai tài liệu còn lại.
    location: README.md
    attributes:
      - name: overview
        type: section
        required: true
        constraints: "2–4 câu: ứng dụng làm gì và luồng React → Web API JSON → ASP.NET Core → PostgreSQL"
      - name: prerequisites
        type: table
        required: true
        constraints: "mỗi dòng: tên phần mềm, phiên bản cần có, ghi chú; phiên bản lấy từ dự án và máy thật (BR1.2)"
      - name: getSource
        type: steps
        required: true
        constraints: "lệnh clone và thư mục cần đứng để chạy các lệnh sau"
      - name: connectionStringSetup
        type: steps
        required: true
        constraints: "đặt connection string bằng user-secrets; ví dụ chỉ dùng chữ giữ chỗ cho mật khẩu (BR1.3)"
      - name: toolRestore
        type: steps
        required: true
        constraints: "khôi phục công cụ cục bộ (dotnet-ef) từ tool manifest; không cài toàn máy"
      - name: databaseCreation
        type: steps
        required: true
        constraints: "lệnh chạy migration tạo employee_db, kể cả 4 phòng ban mẫu"
      - name: runBackend
        type: steps
        required: true
      - name: runFrontend
        type: steps
        required: true
        constraints: "cài gói lần đầu rồi chạy chế độ phát triển"
      - name: addresses
        type: table
        required: true
        constraints: "địa chỉ trang web, địa chỉ API, địa chỉ trang OpenAPI; lấy từ cấu hình dự án (BR1.5)"
      - name: quickCheck
        type: steps
        required: true
        constraints: "vài thao tác để biết đã chạy đúng: mở trang, thấy 4 phòng ban mẫu, thêm/sửa/xóa/tìm một nhân viên"
      - name: runTests
        type: steps
        required: true
        constraints: "lệnh chạy unit test và đo độ phủ"
      - name: troubleshooting
        type: list
        required: true
        constraints: "3–5 dòng, chỉ lỗi đã gặp thật trên máy làm bài (Q2, BR1.6)"
      - name: relatedDocs
        type: links
        required: true
        references: [DatabaseDiagramDoc, ApiListDoc]

  - name: DatabaseDiagramDoc
    description: >
      docs/so-do-database.md. Sơ đồ và mô tả hai bảng đúng như database sau khi chạy migration.
    location: docs/so-do-database.md
    attributes:
      - name: erDiagram
        type: mermaid-erDiagram
        required: true
        constraints: "đủ 2 bảng, mọi cột, khóa chính, khóa ngoại, đánh dấu cột không trùng (BR2.1)"
      - name: textFallback
        type: paragraph
        required: true
        constraints: "mô tả bằng chữ thay cho sơ đồ khi không hiển thị được mermaid"
      - name: columnTables
        type: table
        required: true
        constraints: "mỗi bảng một bảng mô tả: tên cột snake_case, kiểu, cho phép rỗng hay không, ràng buộc, ý nghĩa (BR2.2)"
      - name: constraintList
        type: list
        required: true
        constraints: "tên thật của khóa chính, khóa ngoại (kiểu chặn xóa), chỉ mục không trùng không phân biệt hoa thường (BR2.3)"
      - name: seedData
        type: table
        required: true
        constraints: "4 phòng ban mẫu do migration tạo"
      - name: pgAdminCheck
        type: steps
        required: true
        constraints: "cách mở pgAdmin và đối chiếu tên bảng, cột, ràng buộc (AC5.3.2)"
      - name: constraintTrial
        type: steps
        required: true
        constraints: "hai thử nghiệm bằng câu lệnh tay: email trùng khác hoa thường, xóa phòng ban còn nhân viên; ghi lỗi PostgreSQL mong đợi (BR2.4)"
    relationships:
      - target: departments-table
        kind: describes
      - target: employees-table
        kind: describes

  - name: ApiListDoc
    description: >
      docs/danh-sach-api.md. Danh sách 10 thao tác của C1, C2 kèm JSON mẫu thật và ví dụ lỗi.
    location: docs/danh-sach-api.md
    attributes:
      - name: conventions
        type: section
        required: true
        constraints: "địa chỉ gốc, JSON camelCase, Content-Type, phong bì lỗi ProblemDetails, bảng mã trạng thái"
      - name: summaryTable
        type: table
        required: true
        constraints: "10 dòng: phương thức, đường dẫn, mô tả, mã thành công, mã lỗi có thể (BR3.1)"
      - name: operations
        type: list-of-Operation
        required: true
        min: 10
        max: 10
      - name: errorExamples
        type: section
        required: true
        constraints: "mỗi mã 400, 404, 409 một ví dụ đầy đủ: request gây lỗi, header, body problem+json tiếng Việt (BR3.4)"
      - name: openApiAccess
        type: steps
        required: true
        constraints: "cách mở trang OpenAPI ở Development (BR3.5)"
      - name: postmanGuide
        type: steps
        required: true
        constraints: "cách gọi thử bằng Postman: chọn phương thức, dán địa chỉ, chọn Body raw JSON, đối chiếu mã và body"

  - name: Operation
    description: Một thao tác API trong ApiListDoc (thành phần lặp, không phải file riêng).
    attributes:
      - name: method
        type: enum
        required: true
        allowed: [GET, POST, PUT, DELETE]
      - name: path
        type: string
        required: true
        constraints: "đúng đường dẫn trong C1/C2, ví dụ /api/departments/{id}"
      - name: description
        type: string
        required: true
        constraints: "tiếng Việt, một câu"
      - name: requestExample
        type: json
        required: false
        constraints: "bắt buộc với POST, PUT; GET có search thì ghi ví dụ chuỗi truy vấn"
      - name: responseExample
        type: json
        required: true
        constraints: "JSON chép từ lần gọi thật (BR3.2); với 204 ghi rõ 'không có body'"
      - name: successStatus
        type: enum
        required: true
        allowed: [200, 201, 204]
      - name: locationHeader
        type: string
        required: false
        constraints: "bắt buộc khi successStatus = 201"
      - name: possibleErrors
        type: list
        required: true
        constraints: "các mã 400/404/409 thao tác này có thể trả, mỗi mã kèm lý do một dòng"
    relationships:
      - target: ApiListDoc
        cardinality: "10 Operation thuộc 1 ApiListDoc"

relationships:
  - from: HandoverReadme
    to: DatabaseDiagramDoc
    cardinality: "1 — 1"
    kind: "liên kết trong mục relatedDocs"
  - from: HandoverReadme
    to: ApiListDoc
    cardinality: "1 — 1"
    kind: "liên kết trong mục relatedDocs; mục addresses dùng chung địa chỉ API với conventions"
  - from: ApiListDoc
    to: Operation
    cardinality: "1 — 10"
    kind: "chứa"
```

## Tóm tắt

| Thực thể | File | Vai trò |
|---|---|---|
| HandoverReadme | `README.md` | Cài và chạy từ bản clone sạch (FR7.4, US5.1); trỏ sang hai tài liệu kia |
| DatabaseDiagramDoc | `docs/so-do-database.md` | Sơ đồ và ràng buộc của hai bảng, cách đối chiếu bằng pgAdmin (FR7.2, US5.3) |
| ApiListDoc | `docs/danh-sach-api.md` | 10 thao tác kèm JSON thật, ví dụ lỗi 400/404/409, cách gọi bằng Postman (FR7.3, US5.2) |
| Operation | (một mục trong ApiListDoc) | Khuôn chung cho mỗi thao tác API |

Vị trí ba file theo Q1 = A. Kết quả đối chiếu với code (ngày, lệnh, mã nhận được) ghi ở `code-summary.md` của U5 khi sinh tài liệu, không ghi vào ba file bàn giao.
