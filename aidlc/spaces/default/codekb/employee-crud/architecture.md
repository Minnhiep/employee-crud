# Architecture: employee-crud

## Architecture Analysis

### System Overview

Một repo gồm hai ứng dụng chạy trên cùng máy, nói chuyện bằng REST JSON:

- **frontend/**: SPA React 19 + TypeScript, dựng bằng Vite, chạy ở `http://localhost:5173` (cổng cố định, `strictPort`).
- **backend/EmployeeCrud.Api**: ASP.NET Core Web API trên .NET 10, chạy ở `http://localhost:5081` (hồ sơ `http`) hoặc `https://localhost:7205`. Controller → Service → DTO, EF Core + Npgsql tới PostgreSQL 18 (`employee_db`, cổng 5432).
- **backend/EmployeeCrud.Api.Tests**: test xUnit cho service (InMemory) và phần nền (WebApplicationFactory).

### Architectural Style

Monolith hai tầng triển khai riêng (một backend, một frontend), không microservices (`project.md` cấm). Backend chia thư mục theo nghiệp vụ: `Departments/`, `Employees/` (mỗi thư mục có entity, cấu hình EF, DTO, request, interface service, service, controller) và `Platform/` cho phần dùng chung (dữ liệu, lỗi, CORS, header bảo mật, chuẩn hóa chữ). Frontend chia `pages/` theo nghiệp vụ, `components/`, `hooks/`, `utils/`, `api/`. Bằng chứng: cây thư mục ở `code-structure.md`.

### Component Relationships

```mermaid
flowchart LR
    U["Người dùng<br/>trình duyệt"] --> FE["Trang React<br/>pages, components, hooks"]
    FE --> CL["frontend-api-client<br/>api/client.ts"]
    CL -->|"HTTP JSON cổng 5081, CORS"| PIPE["Program.cs pipeline<br/>SecurityHeaders, CORS, ExceptionHandler, StatusCodePages"]
    PIPE --> DC["DepartmentsController"]
    PIPE --> EC["EmployeesController"]
    DC --> DS["DepartmentService"]
    EC --> ES["EmployeeService"]
    ES -->|"ExistsAsync"| DS
    DS --> TX["Platform.Text<br/>TextInput"]
    ES --> TX
    DS --> DB["AppDbContext<br/>EF Core + Npgsql"]
    ES --> DB
    DS -.->|"ném DomainError"| ERR["Platform.Errors<br/>ErrorMapper, handlers"]
    ES -.->|"ném DomainError"| ERR
    ERR -.->|"ProblemDetails"| PIPE
    DB -->|"SQL"| PG[("PostgreSQL 18<br/>employee_db")]
    MIG["Migrations"] -->|"dotnet ef database update"| PG
```

Bằng lời: trang React gọi API qua một client duy nhất; request đi qua chuỗi middleware rồi tới controller; controller chỉ gọi service; `EmployeeService` hỏi `DepartmentService.ExistsAsync` chứ không đọc thẳng bảng phòng ban; cả hai service dùng `TextInput` để chuẩn hóa chữ và `AppDbContext` để đọc/ghi; lỗi nghiệp vụ là `DomainError`, được `Platform.Errors` đổi thành ProblemDetails. Migration chạy tay bằng `dotnet ef`, ứng dụng không tự migrate lúc khởi động.

### Data Flow

1. **Trình duyệt → API**: `client.ts` ghép `VITE_API_BASE_URL` (mặc định `http://localhost:5081`) với đường dẫn, chỉ gửi `Content-Type: application/json` khi có body, đặt hạn 10 giây (gộp `AbortSignal` của trang và của hẹn giờ).
2. **Chuỗi xử lý backend** (`Program.cs:47-68`, thứ tự cố định): lọc `AllowedHosts` (localhost, 127.0.0.1, [::1]) → `UseSecurityHeaders` (gắn header lúc phản hồi bắt đầu gửi) → `UseCors("Frontend")` → `UseExceptionHandler` (`ProblemDetailsExceptionHandler`) → `UseStatusCodePages` (`StatusCodeProblemWriter` cho 404/405/415) → (Development) `MapOpenApi` + Swagger UI → `UseRouting` → `MapControllers`.
3. **Model binding**: `[ApiController]` kiểm `[Required]`; lỗi đi qua `ValidationResponseFactory` (400, khóa camelCase, `application/problem+json`, chữ Việt không bị mã thoát).
4. **Service**: chuẩn hóa → kiểm rẻ (độ dài, định dạng) → kiểm tồn tại phòng ban → kiểm trùng (AnyAsync trên `ToLower()`) → `SaveChangesAsync` → đọc lại DTO (JOIN lấy tên phòng). Đọc dùng `AsNoTracking`; sửa và xóa đọc có theo dõi.
5. **Database**: chỉ mục không trùng trên `lower(name)`, `lower(email)` và khóa ngoại `RESTRICT` chặn ca hai request chen nhau; service và `ErrorMapper` nhận ra lỗi theo mã SQLSTATE + tên ràng buộc (`DbConstraintNames`).
6. **Phản hồi → trình duyệt**: thành công là JSON camelCase (201 kèm `Location`, 204 khi xóa); lỗi là ProblemDetails có `traceId`. `client.ts` đổi mọi lỗi thành `ApiError` (`network`, `server`, `client`, `aborted`), trang hiện lời báo của API nguyên văn.

Đổi lỗi thành mã HTTP:

```mermaid
flowchart TD
    X["Exception từ controller hoặc service"] --> H["ProblemDetailsExceptionHandler<br/>log, áp lại CORS"]
    H --> M{"ErrorMapper.Map"}
    M -->|"DomainError Validation"| E400["400, errors theo trường"]
    M -->|"DomainError NotFound"| E404["404, detail"]
    M -->|"DomainError Conflict"| E409["409, errors theo trường hoặc detail"]
    M -->|"Postgres 23505 trên ux_departments_name hoặc ux_employees_email"| E409
    M -->|"Postgres 23503 hoặc 23001"| E409F["409, câu dự phòng"]
    M -->|"BadHttpRequestException"| EB["400 khóa body, hoặc giữ mã như 413"]
    M -->|"Còn lại"| E500["500 câu chung, log Error kèm traceId"]
```

Bằng lời: mọi exception chưa xử lý tới `ProblemDetailsExceptionHandler`; handler ghi log (Error cho 5xx, Information cho 4xx), áp lại header CORS rồi nhờ `ErrorMapper` (hàm thuần) chọn mã: lỗi kiểm dữ liệu 400, không tìm thấy 404, trùng hoặc vướng ràng buộc 409, request hỏng giữ mã của Kestrel, còn lại 500 với câu chung không lộ chi tiết.

### Key Design Decisions

- **Luật nằm ở service, controller mỏng**: controller chỉ gọi service và trả mã (201 qua `CreatedAtAction`, 204 qua `NoContent`). Service ném `DomainError` không biết mã HTTP; `ErrorMapper` giữ ánh xạ ở một chỗ.
- **Chống trùng hai lớp**: service kiểm trước (câu báo rõ), chỉ mục biểu thức `lower(...)` viết tay trong migration chặn ca chen nhau (EF Core không sinh được chỉ mục biểu thức).
- **Xóa phòng ban**: kiểm số nhân viên trước; khóa ngoại `ON DELETE RESTRICT` (PostgreSQL báo 23001) là lớp dự phòng; cả hai đường ra cùng một mẫu câu.
- **Chuẩn hóa chữ một luật cho hai đầu**: `Platform/Text/TextInput.cs` và `frontend/src/utils/normalizeText.ts`; regex email chép giống hệt ở `EmployeeService.cs` và `validateEmployee.ts`.
- **Tham số lọc `departmentId` nhận dạng chuỗi** để service tự đọc số và báo câu tiếng Việt thay cho câu tiếng Anh của model binding.
- **Độ dài đo sau chuẩn hóa**: request không có `[MaxLength]`; độ dài chỉ kiểm ở service.
- **Bảo mật nền**: không xác thực (ngoài phạm vi); CORS chỉ `http://localhost:5173`, 4 phương thức, header `Content-Type`; `AllowedHosts` chặn Host lạ; `X-Content-Type-Options: nosniff` mọi phản hồi, riêng `/api` thêm `Cache-Control: no-store` và CSP `default-src 'none'; frame-ancestors 'none'`; tắt header `Server`; Swagger chỉ ở Development; chuỗi kết nối nằm trong user-secrets, thiếu thì dừng lúc khởi động (`StartupChecks`).
- **Log gọn**: bốn nhóm log EF Core đặt `Critical` (`appsettings.json`) để mỗi lỗi chỉ một dòng Error do handler ghi, kèm `traceId` trùng body.
- **Frontend**: địa chỉ trang là nguồn đúng cho tìm kiếm/lọc (`useSearchParams`); mỗi effect tải dữ liệu có `AbortController`; route có `key` theo id để form tạo mới khi đổi bản ghi; `useSubmitGuard` chặn bấm đúp bằng `useRef`; lời báo thành công truyền qua `location.state` tới `Toast`.

### Improvement Opportunities

Danh sách đầy đủ, có mã và vị trí, nằm ở `code-quality-assessment.md` mục "Technical debt". Các điểm thuộc kiến trúc: giới hạn kích thước body (CQ-4), đường ghi dự phòng khi `TryWriteAsync` trả `false` (CQ-3), một vùng `Toast` chung ở `AppLayout` thay cho mỗi trang một cái (CQ-9), ghim SDK bằng `global.json` (CQ-7), thống nhất thứ tự kiểm 404/400 giữa hai PUT (CQ-5).

## Interaction Diagrams

### Thêm nhân viên (POST /api/employees)

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant F as EmployeeFormPage
    participant C as api/client.ts
    participant P as Pipeline ASP.NET Core
    participant EC as EmployeesController
    participant ES as EmployeeService
    participant DS as DepartmentService
    participant DB as AppDbContext và PostgreSQL
    U->>F: Điền form, bấm Lưu nhân viên
    F->>F: validateEmployee và normalizeText
    alt Form có lỗi
        F-->>U: Lỗi dưới ô và ErrorSummary, không gửi request
    else Form hợp lệ
        F->>C: createEmployee(fullName, email, departmentId)
        C->>P: POST /api/employees, JSON, hạn 10 giây
        P->>P: Model binding, kiểm thuộc tính Required
        alt Thiếu trường hoặc JSON hỏng
            P-->>C: 400 problem+json từ ValidationResponseFactory
        else Đủ hình dạng
            P->>EC: Create(request)
            EC->>ES: CreateAsync(request)
            ES->>ES: Normalize họ tên, email, departmentId
            ES->>DS: ExistsAsync(departmentId)
            DS->>DB: SELECT EXISTS trên departments
            ES->>DB: AnyAsync so lower(email)
            ES->>DB: INSERT employees qua SaveChangesAsync
            ES->>DB: Đọc lại kèm JOIN departments
            ES-->>EC: EmployeeDto
            EC-->>C: 201 Created, Location, JSON
        end
        Note over P,ES: DomainError hoặc lỗi 23505 đi qua ProblemDetailsExceptionHandler và ErrorMapper thành 400 hoặc 409
        C-->>F: Employee hoặc ApiError
        alt Thành công
            F->>U: Về danh sách, Toast Đã thêm nhân viên
        else ApiError loại client 400 hoặc 409
            F->>U: splitErrors, lỗi theo ô và ErrorSummary
        end
    end
```

Bằng lời: form kiểm trước, sai thì không gửi. Hợp lệ thì `client.ts` gửi POST; ASP.NET Core kiểm hình dạng body (thiếu trường thì 400 ngay). Service chuẩn hóa và kiểm theo thứ tự cố định: dữ liệu → phòng ban có không (400) → email trùng (409), rồi INSERT và đọc lại để có tên phòng; controller trả 201 kèm `Location`. Lỗi nghiệp vụ hoặc lỗi trùng do chen nhau được đổi thành ProblemDetails; form hiện lỗi cạnh ô.

### Xóa phòng ban (DELETE /api/departments/{id})

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant L as DepartmentsPage
    participant H as useDepartmentDelete
    participant C as api/client.ts
    participant DS as DepartmentService
    participant DB as PostgreSQL
    U->>L: Bấm Xóa ở một dòng
    L->>H: requestDelete(department)
    alt employeeCount lớn hơn 0
        H-->>U: Hộp thông báo còn N nhân viên, liên kết xem nhân viên, không gọi API
    else employeeCount bằng 0
        H-->>U: Hộp xác nhận xóa
        U->>H: Bấm Xóa phòng ban
        H->>C: deleteDepartment(id)
        C->>DS: DELETE qua DepartmentsController
        DS->>DB: Đọc dòng có theo dõi
        alt Không có dòng
            DS-->>C: 404 Không tìm thấy phòng ban
        else Có dòng
            DS->>DB: COUNT employees theo department_id
            alt Còn nhân viên
                DS-->>C: 409 Không thể xóa, còn N nhân viên
            else Không còn ai
                DS->>DB: DELETE departments
                alt Khóa ngoại RESTRICT chặn, mã 23001 hoặc 23503
                    DS->>DB: Đếm lại
                    DS-->>C: 409 cùng mẫu câu, số người lúc này, tối thiểu 1
                else Lưu được
                    DS-->>C: 204 No Content
                end
            end
        end
        C-->>H: Kết quả hoặc ApiError
        H->>L: onDeleted hoặc onError
        L-->>U: Tải lại bảng, Toast hoặc khung lỗi
    end
```

Bằng lời: giao diện dùng `employeeCount` của lần tải gần nhất; phòng còn người thì chỉ mở hộp thông báo. Phòng trống thì gọi DELETE; service đọc dòng (404 nếu mất), đếm nhân viên (409 nếu còn), xóa; nếu có người được thêm chen vào, khóa ngoại chặn và service đếm lại để báo đúng số. Trang tải lại bảng khi thành công, 404 hoặc 409.

### Tìm và lọc nhân viên (GET /api/employees)

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant S as SearchBox
    participant E as EmployeesPage
    participant C as api/client.ts
    participant ES as EmployeeService
    participant DB as PostgreSQL
    U->>S: Gõ chuỗi, bấm Tìm hoặc Enter
    S->>E: onSearch(chuỗi đã bỏ hai đầu)
    E->>E: normalizeSearch, ghi search lên địa chỉ trang
    E->>C: getEmployees(search, departmentId, signal)
    Note over E,C: Lời gọi cũ bị AbortController hủy, kết quả cũ bị bỏ qua
    C->>ES: GET /api/employees với search và departmentId qua EmployeesController
    ES->>ES: ParseDepartmentFilter, sai dạng thì 400
    ES->>ES: TryNormalize chuỗi tìm, ký tự lạ thì trả rỗng ngay
    ES->>DB: SELECT lọc department_id và lower(full_name) hoặc lower(email) chứa chuỗi, sắp full_name rồi id
    DB-->>ES: Các dòng kèm tên phòng qua JOIN
    ES-->>C: 200 danh sách EmployeeDto
    C-->>E: Employee[]
    E-->>U: Bảng, dòng đếm aria-live, hoặc trạng thái không tìm thấy
```

Bằng lời: chuỗi tìm và phòng lọc nằm trên địa chỉ trang, nên Back/F5 tự đúng. Mỗi lần đổi, trang hủy lời gọi cũ rồi gọi mới. Service báo 400 nếu `departmentId` sai dạng, trả `[]` ngay nếu chuỗi tìm có ký tự bị chặn (không gửi xuống database), còn lại chạy một câu SQL với `Contains` (EF thoát `%`, `_`), không phân biệt hoa thường nhưng có phân biệt dấu.
