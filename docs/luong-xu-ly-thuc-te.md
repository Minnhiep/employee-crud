# Luồng xử lý thực tế và các vấn đề đã gặp

> Dùng cho buổi demo 15 phút: đề bài ([ke-hoach.md](ke-hoach.md) mục 5) yêu cầu trình bày *chức năng, luồng xử lý và những vấn đề đã gặp*. Mọi tên file, tên hàm dưới đây là của **bài thật**. Tài liệu trong [tim-hieu-technical-stack/](tim-hieu-technical-stack/00-tong-quan-luong.md) là bản nháp lúc học, có chỗ khác bài thật.

## 1. Luồng "Thêm nhân viên" khi mọi thứ đúng

Nói gọn: form trên trình duyệt kiểm dữ liệu, gửi JSON tới API; API kiểm lại theo luật nghiệp vụ, ghi một dòng vào bảng `employees`, rồi trả JSON của nhân viên mới về cho form.

```text
EmployeeFormPage.tsx ─ handleSubmit ─▶ api/employees.ts ─ createEmployee ─▶ api/client.ts ─ request (fetch)
        │  POST http://localhost:5081/api/employees   body: { fullName, email, departmentId }
        ▼
Program.cs (chuỗi middleware) ─▶ EmployeesController.Create ─▶ EmployeeService.CreateAsync
        ▼
AppDbContext.SaveChangesAsync ─▶ PostgreSQL: INSERT INTO employees ...  ─▶ 201 Created + JSON ─▶ trang danh sách
```

| Bước | Tầng | File | Hàm | Làm gì, vì sao |
| --- | --- | --- | --- | --- |
| 1 | React | `frontend/src/pages/employees/EmployeeFormPage.tsx` | `handleSubmit` | Nút Lưu đang khóa (đang lưu, phòng ban chưa tải xong) thì bỏ qua. Gọi `validateEmployee` (`validateEmployee.ts`) kiểm 3 ô; có lỗi thì hiện khung tóm tắt và **không gửi request**. Hợp lệ thì chuẩn hóa họ tên, email bằng `normalizeText` (`frontend/src/utils/normalizeText.ts`) để gửi đúng chữ sẽ được lưu |
| 2 | React | `frontend/src/api/employees.ts` → `frontend/src/api/client.ts` | `createEmployee` → `apiPost` → `request` | `fetch` gửi `POST /api/employees` kèm `Content-Type: application/json`, hẹn giờ 10 giây. Mọi lời gọi API đi qua một file này nên cách báo lỗi giống nhau ở mọi trang |
| 3 | ASP.NET Core | `backend/EmployeeCrud.Api/Program.cs` | chuỗi middleware | Gắn header bảo mật, áp CORS (chỉ cho `http://localhost:5173`), bọc bộ bắt lỗi; Kestrel từ chối body lớn hơn 64 KB (413) |
| 4 | ASP.NET Core | `Employees/EmployeeRequest.cs` | `[Required]` | MVC đọc JSON thành `EmployeeRequest`. Thiếu họ tên hoặc email thì trả 400 ngay (qua `Platform/Errors/ValidationResponseFactory.cs`), chưa vào controller |
| 5 | Controller | `Employees/EmployeesController.cs` | `Create` | Chỉ nhận request và gọi service; không có luật nào ở đây |
| 6 | Service | `Employees/EmployeeService.cs` | `CreateAsync` | Thứ tự cố định: `Normalize` (chuẩn hóa bằng `TextInput.TryNormalize`, kiểm độ dài, kiểm định dạng bằng `EmailPattern`) → `EnsureDepartmentExistsAsync` (hỏi `IDepartmentService.ExistsAsync`) → `EnsureEmailIsFreeAsync` (câu SQL `WHERE lower(e.email) = @loweredEmail`). Lỗi "dữ liệu sai" luôn được báo trước lỗi "trùng" |
| 7 | EF Core + PostgreSQL | `Platform/Data/AppDbContext.cs` | `db.Employees.Add`, `SaveAsync` → `SaveChangesAsync` | EF Core sinh câu `INSERT INTO employees ...`. PostgreSQL tự kiểm khóa ngoại `fk_employees_department` (phòng ban phải có thật) và chỉ mục `ux_employees_email` (không trùng email) |
| 8 | Service → Controller | `EmployeeService.cs`, `EmployeesController.cs` | `GetByIdAsync`, `CreatedAtAction` | Đọc lại dòng vừa thêm (JOIN `departments` để có `departmentName`), trả `201 Created` kèm header `Location` |
| 9 | React | `client.ts`, `EmployeeFormPage.tsx`, `frontend/src/components/Toast.tsx` | `readSuccess`, `navigate`, `Toast` | Đọc JSON, chuyển về trang danh sách kèm lời báo; `Toast` (đặt một lần trong `AppLayout`) hiện `Đã thêm nhân viên "X"`, trang danh sách tải lại và có người mới |

Cấu trúc bảng: [so-do-database.md](so-do-database.md). Request, response đầy đủ: [danh-sach-api.md](danh-sach-api.md) mục `POST /api/employees`.

## 2. Hai nhánh lỗi

### 400: dữ liệu sai

- **Ở form:** `validateEmployee` bắt trước khi gửi (ví dụ "Email không đúng định dạng"), không có request nào đi.
- **Ở API** (gọi thẳng bằng Postman, hoặc dữ liệu mà chỉ API kiểm được): `EmployeeService.Normalize` hoặc `EnsureDepartmentExistsAsync` ném `DomainError.Validation` → `ProblemDetailsExceptionHandler.TryHandleAsync` (`Platform/Errors/`) gọi `ErrorMapper.Map` → `400` dạng ProblemDetails, lỗi gắn đúng ô: `{ "errors": { "departmentId": ["Phòng ban không tồn tại"] } }`.
- **Về React:** `toHttpError` (`client.ts`) đổi phản hồi thành `ApiError` → `showSaveError` (`EmployeeFormPage.tsx`) → `splitErrors` (`frontend/src/components/splitErrors.ts`) đặt lỗi dưới đúng ô; khung tóm tắt đầu form nhận focus.

### 409: email trùng

- `EnsureEmailIsFreeAsync` thấy email đã có (không phân biệt hoa thường) → `DomainError.Conflict` → `ErrorMapper` → `409` `{ "title": "Dữ liệu bị trùng", "errors": { "email": ["Email đã được sử dụng"] } }`; form hiện câu này dưới ô Email.
- Hai người lưu **cùng lúc** cùng một email: cả hai cùng qua bước kiểm trên. Chỉ mục `ux_employees_email` chặn người lưu sau (PostgreSQL báo mã `23505`), `ErrorMapper.MapPostgres` nhận ra theo tên chỉ mục và trả **cùng** `409` đó, không thành `500`.

## 3. Vấn đề đã gặp

Mỗi vấn đề ghi: triệu chứng (thấy gì), nguyên nhân (vì sao), cách xử lý (đã làm gì, nằm ở đâu).

### 3.1 Môi trường Windows

**a. Kiểu xuống dòng CRLF làm Prettier báo lỗi hàng loạt**

- Triệu chứng: vừa clone hoặc pull trên Windows, `npm run verify` dừng ở bước Prettier, báo "Code style issues" ở gần như mọi file, dù không ai sửa code.
- Nguyên nhân: Git cài mặc định trên Windows (`core.autocrlf=true`) đổi ký tự xuống dòng LF thành CRLF khi ghi file ra máy, còn Prettier và `.editorconfig` của dự án đòi LF.
- Cách xử lý: thêm file `.gitattributes` với dòng `* text=auto eol=lf`, bắt mọi bản clone ghi file ra LF bất kể máy cài gì. Bản clone làm trước khi có file này: clone lại, hoặc chạy lệnh đổi về LF ở [README](../README.md) mục 11.

**b. Smart App Control chặn file `.dll` vừa build**

- Triệu chứng: `dotnet test`, `dotnet run` báo "Application Control policy has blocked this file" (mã `0x800711C7`).
- Nguyên nhân: Smart App Control của Windows 11 chặn file chạy được mà chưa có chữ ký số và chưa có "danh tiếng" với Microsoft; mỗi lần build lại ra một file `.dll` mới, chưa ai từng thấy.
- Cách xử lý: theo README mục 11: build lại rồi chạy lại; vẫn bị chặn thì báo người hướng dẫn, đừng vội tắt Smart App Control (tắt rồi có thể không bật lại được). Khi công cụ đo độ phủ coverlet bị chặn, dùng hai lệnh đo bằng công cụ của Microsoft ghi ở README mục 11.

**c. Gõ `psql` báo không có lệnh**

- Triệu chứng: muốn chạy câu SQL bằng dòng lệnh thì PowerShell báo không tìm thấy `psql`.
- Nguyên nhân: bộ cài PostgreSQL không tự thêm thư mục chứa `psql` vào PATH.
- Cách xử lý: dùng pgAdmin 4 (Query Tool) hoặc "SQL Shell (psql)" trong menu Start; không tự đổi PATH của máy (README mục 11).

### 3.2 Dữ liệu chữ

**a. Ký tự vô hình và chữ có dấu gõ kiểu tổ hợp lách được luật "không trùng"**

- Triệu chứng: lưu được hai phòng ban (hoặc hai email) nhìn y hệt nhau, ví dụ "Kế toán" và một "Kế toán" khác có ký tự vô hình U+200B giữa hai chữ, hoặc gõ kiểu tổ hợp (chữ "e" rồi thêm dấu mũ, dấu sắc thành từng ký tự riêng).
- Nguyên nhân: máy so từng mã ký tự. Hai chuỗi nhìn giống nhau nhưng khác mã thì máy coi là khác, nên chỉ mục không trùng không chặn.
- Cách xử lý: chuẩn hóa **trước khi** kiểm và lưu, cùng một luật ở hai đầu: `TextInput.TryNormalize` (`backend/EmployeeCrud.Api/Platform/Text/TextInput.cs`) và `normalizeText` (`frontend/src/utils/normalizeText.ts`): bỏ khoảng trắng hai đầu, gộp nhiều khoảng trắng thành một, đưa chữ có dấu về dạng dựng sẵn (NFC); chặn ký tự điều khiển, ký tự vô hình và noncharacter với câu "… chứa ký tự không hợp lệ". Unit test: `Create_WithDecomposedName_SavesComposedForm_AndDetectsDuplicate`, `Create_WithExtraSpacesInsideExistingName_ThrowsConflict`.

**b. Email trùng khác hoa thường**

- Triệu chứng: nếu so đúng từng chữ thì `an@congty.vn` và `AN@congty.vn` lưu được cả hai, dù là một hộp thư.
- Nguyên nhân: email được lưu giữ nguyên chữ hoa như người dùng gõ, mà phép so `=` của database phân biệt hoa thường.
- Cách xử lý: hai lớp. Service so `lower(email)` (vế giá trị được hạ chữ ở .NET bằng `ToLowerInvariant`); chỉ mục duy nhất `ux_employees_email` trên `lower(email)` là lớp chặn cuối (viết tay trong migration `CreateEmployees`, vì EF Core không tự sinh được chỉ mục trên biểu thức). Tìm kiếm cũng không phân biệt hoa thường, kể cả email lưu bằng chữ hoa (test `Search_MatchesEmailWrittenInUpperCase_IgnoringCase`). Tên phòng ban làm giống hệt với `ux_departments_name`.

### 3.3 Chen nhau khi xóa phòng ban

- Triệu chứng (tình huống có thể xảy ra): người A xóa phòng "Kế toán" đang trống; đúng lúc đó người B thêm một nhân viên vào phòng này. Nếu không chặn, nhân viên của B trỏ tới một phòng ban không còn.
- Nguyên nhân: bước "đếm nhân viên của phòng" và bước "xóa phòng" là hai câu SQL riêng; người khác có thể chen vào giữa hai câu.
- Cách xử lý: hai lớp. `DepartmentService.DeleteAsync` đếm trước, còn người thì trả `409` "Không thể xóa phòng ban "X" vì còn N nhân viên.". Lớp cuối là khóa ngoại `fk_employees_department` khai `ON DELETE RESTRICT`: PostgreSQL từ chối xóa (mã `23001`, đã thấy khi chạy thật trên pgAdmin); service bắt lỗi này, **đếm lại** để câu báo có đúng số người lúc đó (đếm lại ra 0 thì vẫn báo 1, không ra câu vô lý "còn 0 nhân viên"). Giao diện nhận `409` thì báo lỗi, tải lại bảng và đưa focus về tiêu đề trang. Kiểm tay: D01 ở [07-kiem-thu-va-demo.md](tim-hieu-technical-stack/07-kiem-thu-va-demo.md) mục 3.4.

### 3.4 CORS: mở giao diện bằng `127.0.0.1`

- Triệu chứng: mở `http://127.0.0.1:5173` thì trang báo "Không kết nối được máy chủ, vui lòng thử lại." dù backend đang chạy; F12 → Console có lỗi CORS. Gọi cùng API bằng Postman thì vẫn được.
- Nguyên nhân: với trình duyệt, `localhost` và `127.0.0.1` là hai địa chỉ gốc (origin) khác nhau. Backend chỉ cho origin `http://localhost:5173` (`Cors:AllowedOrigins` trong `appsettings.json`, chính sách ở `Platform/Cors/CorsSetup.cs`), nên trình duyệt chặn trang đọc phản hồi; `fetch` báo lỗi mạng và `client.ts` đổi thành câu "Không kết nối được máy chủ". CORS là luật của trình duyệt, Postman không áp luật này.
- Cách xử lý: luôn mở `http://localhost:5173` (README mục 8 và 11). Không nới CORS thành "cho mọi địa chỉ" để chữa: làm vậy thì trang web lạ nào cũng gọi được API.
