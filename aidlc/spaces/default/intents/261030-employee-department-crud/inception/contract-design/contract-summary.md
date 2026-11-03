# Tóm tắt hợp đồng (Contract Summary)

> **Nguồn:**
> - `units-generation/unit-of-work.md` (5 unit) và `units-generation/unit-of-work-dependency.md` (các cạnh phụ thuộc và các điểm nối)
> - `domain-design/components.md` (hình dạng thực thể)
> - `requirements-analysis/requirements.md` (FR4, FR6, NFR5, NFR7)
> - `refined-mockups/interaction-spec.md` mục 3
> - `contract-design-questions.md` (Q1–Q3)
>
> **Hợp đồng** là bản thỏa thuận ở chỗ hai phần gặp nhau: dữ liệu gì đi qua, theo dạng nào, khi lỗi thì trả gì. Mọi unit phải theo đúng hợp đồng để làm riêng mà vẫn ráp khớp với nhau.

## 1. Bảng hợp đồng

| # | Provider Unit | Consumer | Mechanism | Owner |
|---|---|---|---|---|
| C1 | U3 `u3-departments` | U3 và U4 (trang React gọi API phòng ban); External: Postman / người cài đặt (P2) | REST + JSON qua HTTP (OpenAPI) | U3 |
| C2 | U4 `u4-employees` | U4 (trang React nhân viên); External: Postman / người cài đặt (P2) | REST + JSON qua HTTP (OpenAPI) | U4 |
| C3 | U1 `u1-backend-platform` | U2 `u2-web-shell` (`src/api/client.js`); mọi người gọi C1, C2 | Phong bì lỗi chung ProblemDetails, CORS, quy ước timeout (shared schema) | U1 |
| C4 | U3 `u3-departments` | U4 `u4-employees` | Gọi hàm trong cùng tiến trình (interface C#) | U3 |
| C5 | U1 `u1-backend-platform` | U3, U4 | Dùng chung database qua `AppDbContext` (shared schema) và quy ước ném lỗi nghiệp vụ | U1 giữ khung; mỗi unit sở hữu bảng của mình |

Hợp đồng với bên ngoài: hệ thống không có API công khai cho bên thứ ba. "External" ở đây là người cài đặt hoặc chấm bài (persona P2), gọi C1 và C2 bằng Postman theo danh sách API (FR7.3).

---

## 2. Đặc tả từng hợp đồng

### C1. API phòng ban (`/api/departments`)

```yaml
openapi: 3.1.0
info:
  title: Employee CRUD API - Phòng ban
  version: "1.0"
  description: Hợp đồng C1. Không có số phiên bản trong đường dẫn (Q1); chỉ thay đổi kiểu thêm.
servers:
  - url: https://localhost:{port}
    variables:
      port: { default: "7001", description: "Cổng do launchSettings.json của backend quyết định; README ghi cổng thật" }
paths:
  /api/departments:
    get:
      summary: Danh sách phòng ban, sắp theo tên A-Z, mỗi phòng có employeeCount (FR1.1, FR8.1; 1 truy vấn SQL cho cả danh sách)
      responses:
        "200":
          description: Mảng phòng ban (có thể rỗng)
          content:
            application/json:
              schema: { type: array, items: { $ref: "#/components/schemas/DepartmentDto" } }
    post:
      summary: Thêm phòng ban (FR1.2, FR1.5)
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/DepartmentRequest" }
            example: { name: "Kỹ thuật" }
      responses:
        "201":
          description: Đã tạo. Header Location trỏ tới /api/departments/{id}
          headers:
            Location: { schema: { type: string }, description: "/api/departments/5" }
          content:
            application/json:
              schema: { $ref: "#/components/schemas/DepartmentDto" }
              example: { id: 5, name: "Kỹ thuật", employeeCount: 0 }
        "400": { $ref: "#/components/responses/ValidationError" }
        "409": { $ref: "#/components/responses/DuplicateName" }
  /api/departments/{id}:
    parameters:
      - { name: id, in: path, required: true, schema: { type: integer, minimum: 1 } }
    get:
      summary: Một phòng ban, có employeeCount (FR8.1, FR8.2: trang chi tiết)
      responses:
        "200":
          description: Phòng ban
          content:
            application/json:
              schema: { $ref: "#/components/schemas/DepartmentDto" }
        "404": { $ref: "#/components/responses/NotFound" }
    put:
      summary: Sửa tên phòng ban (FR1.3, FR1.5). Gửi đủ mọi trường; giữ nguyên tên của chính nó không bị coi là trùng
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/DepartmentRequest" }
      responses:
        "200":
          description: Phòng ban sau khi sửa (employeeCount đếm lại sau khi lưu)
          content:
            application/json:
              schema: { $ref: "#/components/schemas/DepartmentDto" }
        "400": { $ref: "#/components/responses/ValidationError" }
        "404": { $ref: "#/components/responses/NotFound" }
        "409": { $ref: "#/components/responses/DuplicateName" }
    delete:
      summary: Xóa phòng ban (FR1.4, FR1.6)
      responses:
        "204": { description: Đã xóa, không có body }
        "404": { $ref: "#/components/responses/NotFound" }
        "409":
          description: >
            Phòng ban còn nhân viên (có hiệu lực từ U4). Từ Change Request 03/11 (FR8.4): detail có số N đếm lúc xóa,
            cả khi phát hiện trước lúc xóa lẫn khi khóa ngoại chặn do chen nhau.
          content:
            application/problem+json:
              schema: { $ref: "#/components/schemas/ProblemDetails" }
              example:
                type: "https://tools.ietf.org/html/rfc9110#section-15.5.10"
                title: "Không thể xóa phòng ban"
                status: 409
                detail: "Không thể xóa phòng ban \"Kế toán\" vì còn 3 nhân viên."
components:
  schemas:
    DepartmentDto:
      type: object
      required: [id, name, employeeCount]
      properties:
        id: { type: integer }
        name: { type: string }
        employeeCount: { type: integer, minimum: 0, description: "Số nhân viên của phòng lúc đọc (FR8.1). Thay đổi kiểu thêm: client cũ bỏ qua được." }
    DepartmentRequest:
      type: object
      required: [name]
      properties:
        name: { type: string, minLength: 1, maxLength: 100, description: "Bỏ khoảng trắng hai đầu trước khi kiểm và lưu; không trùng (không phân biệt hoa thường)" }
    ProblemDetails:
      type: object
      properties:
        type: { type: string }
        title: { type: string }
        status: { type: integer }
        detail: { type: string }
        errors:
          type: object
          additionalProperties: { type: array, items: { type: string } }
  responses:
    ValidationError:
      description: Dữ liệu sai (FR4.2)
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/ProblemDetails" }
          example:
            type: "https://tools.ietf.org/html/rfc9110#section-15.5.1"
            title: "Dữ liệu không hợp lệ"
            status: 400
            errors: { name: ["Vui lòng nhập tên phòng ban"] }
    DuplicateName:
      description: Trùng tên phòng ban (FR1.5)
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/ProblemDetails" }
          example:
            type: "https://tools.ietf.org/html/rfc9110#section-15.5.10"
            title: "Dữ liệu bị trùng"
            status: 409
            errors: { name: ["Tên phòng ban đã tồn tại"] }
    NotFound:
      description: Không tìm thấy (FR4.3)
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/ProblemDetails" }
          example:
            type: "https://tools.ietf.org/html/rfc9110#section-15.5.5"
            title: "Không tìm thấy"
            status: 404
            detail: "Không tìm thấy phòng ban có mã 999."
```

### C2. API nhân viên (`/api/employees`)

```yaml
openapi: 3.1.0
info:
  title: Employee CRUD API - Nhân viên
  version: "1.0"
  description: Hợp đồng C2. Lỗi theo C3 (ProblemDetails, có errors cho cả 400 và 409 - Q2).
paths:
  /api/employees:
    get:
      summary: Danh sách nhân viên sắp theo họ tên A-Z; có tìm kiếm (FR2.1, FR3.1, FR3.2, FR6.3)
      parameters:
        - name: search
          in: query
          required: false
          schema: { type: string }
          description: >
            Bỏ khoảng trắng hai đầu. Rỗng hoặc không có thì trả tất cả.
            Khớp khi fullName HOẶC email chứa chuỗi, không phân biệt hoa thường, có phân biệt dấu.
            Ký tự % và _ được coi là chữ thường, không phải ký tự đại diện.
        - name: departmentId
          in: query
          required: false
          schema: { type: string, pattern: "^[1-9][0-9]*$" }
          description: >
            Change Request 03/11 (FR8.3, ADR-007). Chỉ lấy nhân viên của phòng này; ghép AND với search.
            Phải là số nguyên dương trong phạm vi int; sai kiểu, 0, số âm hoặc quá lớn → 400
            errors.departmentId ["Phòng ban lọc không hợp lệ"] (service kiểm, câu tiếng Việt).
            Số hợp lệ nhưng không có phòng đó → 200 [] (lọc không ra kết quả, không phải 404).
      responses:
        "200":
          description: Mảng nhân viên (có thể rỗng)
          content:
            application/json:
              schema: { type: array, items: { $ref: "#/components/schemas/EmployeeDto" } }
              example:
                - { id: 1, fullName: "Nguyễn Văn An", email: "an@congty.vn", departmentId: 2, departmentName: "Kế toán" }
        "400":
          description: departmentId không hợp lệ (FR8.3)
          content:
            application/problem+json:
              example:
                type: "https://tools.ietf.org/html/rfc9110#section-15.5.1"
                title: "Dữ liệu không hợp lệ"
                status: 400
                errors: { departmentId: ["Phòng ban lọc không hợp lệ"] }
    post:
      summary: Thêm nhân viên (FR2.2, FR2.5, FR2.6)
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/EmployeeRequest" }
            example: { fullName: "Nguyễn Văn An", email: "an@congty.vn", departmentId: 2 }
      responses:
        "201":
          description: Đã tạo. Header Location trỏ tới /api/employees/{id}
          headers:
            Location: { schema: { type: string } }
          content:
            application/json:
              schema: { $ref: "#/components/schemas/EmployeeDto" }
        "400":
          description: Dữ liệu sai, gồm cả phòng ban không tồn tại
          content:
            application/problem+json:
              schema: { $ref: "#/components/schemas/ProblemDetails" }
              example:
                title: "Dữ liệu không hợp lệ"
                status: 400
                errors: { departmentId: ["Phòng ban không tồn tại"] }
        "409":
          description: Trùng email
          content:
            application/problem+json:
              schema: { $ref: "#/components/schemas/ProblemDetails" }
              example:
                title: "Dữ liệu bị trùng"
                status: 409
                errors: { email: ["Email đã được sử dụng"] }
  /api/employees/{id}:
    parameters:
      - { name: id, in: path, required: true, schema: { type: integer, minimum: 1 } }
    get:
      summary: Một nhân viên (dùng cho form sửa)
      responses:
        "200":
          description: Nhân viên
          content:
            application/json:
              schema: { $ref: "#/components/schemas/EmployeeDto" }
        "404": { description: Không tìm thấy, content: { application/problem+json: { schema: { $ref: "#/components/schemas/ProblemDetails" } } } }
    put:
      summary: Sửa nhân viên (FR2.3). Gửi đủ mọi trường; giữ nguyên email của chính mình không bị coi là trùng
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: "#/components/schemas/EmployeeRequest" }
      responses:
        "200":
          description: Nhân viên sau khi sửa
          content:
            application/json:
              schema: { $ref: "#/components/schemas/EmployeeDto" }
        "400": { description: Như POST, content: { application/problem+json: { schema: { $ref: "#/components/schemas/ProblemDetails" } } } }
        "404": { description: Không tìm thấy, content: { application/problem+json: { schema: { $ref: "#/components/schemas/ProblemDetails" } } } }
        "409": { description: Trùng email, content: { application/problem+json: { schema: { $ref: "#/components/schemas/ProblemDetails" } } } }
    delete:
      summary: Xóa nhân viên (FR2.4)
      responses:
        "204": { description: Đã xóa }
        "404": { description: Không tìm thấy, content: { application/problem+json: { schema: { $ref: "#/components/schemas/ProblemDetails" } } } }
components:
  schemas:
    EmployeeDto:
      type: object
      required: [id, fullName, email, departmentId, departmentName]
      properties:
        id: { type: integer }
        fullName: { type: string }
        email: { type: string }
        departmentId: { type: integer }
        departmentName: { type: string }
    EmployeeRequest:
      type: object
      required: [fullName, email, departmentId]
      properties:
        fullName: { type: string, minLength: 1, maxLength: 100, description: "Bỏ khoảng trắng hai đầu" }
        email: { type: string, format: email, maxLength: 254, description: "Bỏ khoảng trắng hai đầu; không trùng (không phân biệt hoa thường)" }
        departmentId: { type: integer, minimum: 1, description: "Phải là phòng ban đang có (kiểm qua C4)" }
    ProblemDetails:
      type: object
      properties:
        type: { type: string }
        title: { type: string }
        status: { type: integer }
        detail: { type: string }
        errors:
          type: object
          additionalProperties: { type: array, items: { type: string } }
```

### C3. Phong bì lỗi chung, CORS, timeout (U1 → U2 và mọi bên gọi API)

```yaml
shared-schema: error-envelope-and-transport
owner: u1-backend-platform
problem_details:
  media_type: application/problem+json
  fields:
    type: chuỗi URI chuẩn RFC 9110 theo mã lỗi
    title: lời báo chung, tiếng Việt
    status: số mã HTTP
    detail: lời báo cụ thể, tiếng Việt (có khi lỗi không gắn với ô nào)
    errors: "{ <tênTrường camelCase>: [ <lời báo tiếng Việt>, ... ] } - có ở 400 và ở 409 khi lỗi gắn với một trường (Q2)"
  mapping:
    - { status: 400, title: "Dữ liệu không hợp lệ", when: "sai luật kiểm (thiếu, quá dài, sai định dạng); POST/PUT nhân viên có departmentId không tồn tại; GET /api/employees có departmentId sai dạng (lọc phòng không tồn tại là 200 [], không phải 400)", errors: bắt buộc }
    - { status: 404, title: "Không tìm thấy", when: "id không có, hoặc đường dẫn API không tồn tại", errors: không }
    - { status: 409, title: "Dữ liệu bị trùng", when: "trùng tên phòng ban / trùng email", errors: "bắt buộc (name / email)" }
    - { status: 409, title: "Không thể xóa phòng ban", when: "phòng ban còn nhân viên", errors: "không; chỉ detail" }
    - { status: 500, title: "Lỗi máy chủ", when: "lỗi ngoài dự kiến", detail: "Đã có lỗi xảy ra, vui lòng thử lại sau.", note: "không bao giờ trả stack trace hay chi tiết kỹ thuật" }
  database_constraint_violations:
    - { postgres_code: "23505 unique_violation trên chỉ mục email", status: 409, errors: { email: ["Email đã được sử dụng"] } }
    - { postgres_code: "23505 unique_violation trên chỉ mục tên phòng ban", status: 409, errors: { name: ["Tên phòng ban đã tồn tại"] } }
    - { postgres_code: "23503 foreign_key_violation khi ghi nhân viên", status: 400, errors: { departmentId: ["Phòng ban không tồn tại"] } }
    - { postgres_code: "23503 foreign_key_violation khi xóa phòng ban", status: 409, title: "Không thể xóa phòng ban", detail: "Không thể xóa phòng ban \"<tên>\" vì còn N nhân viên." (DepartmentService tự bắt lỗi này theo tên ràng buộc, đếm lại bằng CountAsync rồi dựng câu; Platform chỉ là đường dự phòng chung) }
client_rules:
  - Mọi lời gọi đi qua src/api/client.js
  - Lời báo hiển thị lấy từ title/detail/errors của API, giao diện không tự viết lại (Q2)
  - Gắn lỗi vào ô theo khóa trong errors; khóa không khớp ô nào thì hiện ở khung tóm tắt lỗi
  - "Timeout 10 giây (AbortController); quá giờ hoặc fetch bị từ chối hoặc 5xx -> 'Không kết nối được máy chủ, vui lòng thử lại' (500 dùng detail của API nếu có)"
  - Không tự gọi lại bất kỳ lời gọi nào; người dùng bấm "Thử lại" (Q3)
  - Bỏ qua trường JSON lạ không biết (để backend thêm trường mà không làm hỏng giao diện)
cors:
  allowed_origins: ["http://localhost:5173"]
  allowed_methods: [GET, POST, PUT, DELETE]
  allowed_headers: [Content-Type]
  credentials: false
openapi_document: chỉ bật ở môi trường Development (FR6.4)
```

### C4. Kiểm phòng ban tồn tại (U3 → U4, trong cùng tiến trình)

```yaml
shared-schema: in-process-interface
owner: u3-departments
interface: IDepartmentService
members_used_by_u4:
  - signature: "Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default)"
    returns: true nếu có phòng ban mang id đó, ngược lại false; không ném lỗi khi không có
    errors: lỗi database được ném lên nguyên vẹn để C3 xử lý
registration: Dependency Injection, vòng đời Scoped (cùng vòng đời với AppDbContext)
change_by_u4:
  - member: "DeleteAsync(int id, ...)"
    adds: kiểm còn nhân viên trước khi xóa -> ném lỗi xung đột (C3 ánh xạ 409 "Không thể xóa phòng ban")
    compatibility: không đổi chữ ký hàm; chỉ thêm một trường hợp lỗi đã có trong C1 (409)
```

### C5. Database dùng chung và quy ước lỗi nghiệp vụ (U1 → U3, U4)

```yaml
shared-schema: database-and-domain-errors
owner: u1-backend-platform (khung) - mỗi unit sở hữu bảng và migration của mình
database: PostgreSQL 18, employee_db, cổng 5432
db_context: AppDbContext (một duy nhất, ADR-004); mỗi unit thêm cấu hình thực thể bằng một lớp IEntityTypeConfiguration riêng trong thư mục của mình
tables:
  departments:
    owner: u3-departments
    columns: [id, name]
    constraints: ["khóa chính id", "chỉ mục không trùng trên lower(name)"]
    seed: ["Nhân sự", "Kế toán", "Kỹ thuật", "Kinh doanh"]
  employees:
    owner: u4-employees
    columns: [id, full_name, email, department_id]
    constraints: ["khóa chính id", "chỉ mục không trùng trên lower(email)", "khóa ngoại department_id -> departments.id ON DELETE RESTRICT"]
naming: snake_case khai báo tay (ToTable, HasColumnName) - team-practices Q10
migrations:
  - { order: 1, owner: u3-departments, creates: departments + seed }
  - { order: 2, owner: u4-employees, creates: employees + khóa ngoại }
  rule: không sửa migration đã chạy; thay đổi thì thêm migration mới
domain_errors:
  description: Service ném lỗi nghiệp vụ; middleware của U1 chuyển thành ProblemDetails theo C3
  types:
    - { name: NotFoundException, maps_to: 404 }
    - { name: ValidationException, carries: "tên trường + lời báo", maps_to: 400 }
    - { name: ConflictException, carries: "tên trường (tùy) + lời báo", maps_to: 409 }
```

---

### Thay đổi của Change Request 03/11/2026 (FR8, ADR-006, ADR-007)

| Hợp đồng | Thay đổi | Kiểu | Chủ sở hữu thực hiện |
|---|---|---|---|
| C1 | `DepartmentDto` thêm `employeeCount` ở GET danh sách, GET một phòng, và phản hồi POST/PUT | Thêm (không phá client cũ) | U4 (đếm cần bảng `employees`, xem story map) |
| C1 | DELETE 409: `detail` có số N | Đổi câu chữ, giữ mã và hình dạng | U4 |
| C2 | GET thêm tham số `departmentId`; 400 `errors.departmentId` khi sai | Thêm | U4 |
| C3, C4, C5 | Không đổi | — | — |

Không tăng `version`: mọi thay đổi là kiểu thêm hoặc đổi câu chữ, đúng luật ở mục 3.

Ghi chú cho Code Generation U4:
- **Mẫu câu 409 duy nhất:** `Không thể xóa phòng ban "<tên>" vì còn N nhân viên.` (chứa đúng cụm "còn N nhân viên" của FR8.4). Dùng chung cho nhánh kiểm trước khi xóa và nhánh chen nhau (bắt lỗi ràng buộc rồi đếm lại). Test và `docs/danh-sach-api.md` có câu cũ "vì vẫn còn nhân viên" phải sửa theo.
- `DepartmentDto` hiện là record `(int Id, string Name)`; thêm `int EmployeeCount` làm đổi mọi chỗ gọi constructor (service, test): sửa trong cùng bước.
- `departmentId`: pattern chỉ là mô tả; service dùng `int.TryParse` (phạm vi int) và kiểm > 0, số quá lớn cũng ra 400.

## 3. Luật sở hữu và thay đổi hợp đồng

- **Ai sở hữu:**
  - C1 thuộc U3. C2 thuộc U4. C4 thuộc U3.
  - C3 thuộc U1. C5 có khung thuộc U1; bảng nào thuộc unit tạo ra bảng đó.
  - Chủ sở hữu là người được sửa đặc tả và chịu trách nhiệm cập nhật danh sách API (FR7.3).
- **Thay đổi an toàn (chỉ thêm):** được thêm trường mới vào response hoặc thêm endpoint mới mà không cần hỏi lại. Bên gọi phải bỏ qua trường lạ (C3, `client_rules`).
- **Thay đổi phá vỡ:** đổi tên hay bỏ trường, đổi kiểu dữ liệu, đổi mã trạng thái, đổi đường dẫn. Phải có Hiệp duyệt, và trong cùng lần sửa phải cập nhật cả giao diện lẫn danh sách API. Không dùng số phiên bản trong đường dẫn (Q1).
- **Migration:** không sửa migration đã chạy; muốn đổi thì thêm migration mới (C5).
- **Kiểm hợp đồng:**
  - Tài liệu OpenAPI do ASP.NET Core sinh ra phải khớp C1 và C2.
  - Bước U5 đối chiếu bằng Postman (US5.2).
  - Unit test của service kiểm đúng loại lỗi nghiệp vụ trong C5.

## 4. Câu hỏi còn mở

| Contract | Question | Blocks |
|---|---|---|
| C2 | Tìm kiếm không phân biệt hoa thường phải chạy được cả trên PostgreSQL thật lẫn database giả lập khi test. Câu hỏi là chọn cách viết truy vấn nào: so sánh chữ thường hay hàm riêng của PostgreSQL, và provider test nào. Cách so sánh tên phòng ban không trùng ở U3 cũng chịu chung câu hỏi này | U3, U4 (Code Generation) |
| C1, C2 | Cổng HTTPS thật của backend do `launchSettings.json` tạo khi dựng dự án; README và `client.js` phải ghi đúng cổng đó | U1, U2, U5 |
| C3 | Email được lưu nguyên như người dùng gõ (chỉ bỏ khoảng trắng hai đầu) hay chuyển về chữ thường. Cách nào thì luật không trùng vẫn đúng nhờ chỉ mục trên `lower(email)` | U4 (Functional Design) |
