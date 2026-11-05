# Cấu trúc code

## Sơ đồ thư mục

```text
employee-crud/
├── README.md, .editorconfig, .gitignore, dotnet-tools.json
├── backend/
│   ├── EmployeeCrud.slnx
│   ├── EmployeeCrud.Api/
│   │   ├── Program.cs, appsettings*.json, EmployeeCrud.Api.http
│   │   ├── Properties/launchSettings.json
│   │   ├── Departments/   thực thể, cấu hình bảng, DTO, request, service, interface, controller
│   │   ├── Employees/     cùng 7 loại file như Departments
│   │   ├── Platform/      Cors, Data, Errors, Security, Text, StartupChecks
│   │   └── Migrations/    2 migration, 2 Designer, 1 snapshot
│   └── EmployeeCrud.Api.Tests/
│       ├── Departments/, Employees/  unit test service
│       ├── Platform/      test pipeline, lỗi, log, bảo mật, factory, TestOnlyController
│       └── TestSupport/   TestDb, ThrowingAppDbContext, SeedBeforeSaveThenFailContext
├── frontend/
│   ├── index.html, vite.config.ts, tsconfig.json, eslint.config.js, package.json
│   ├── public/favicon.svg
│   └── src/
│       ├── main.tsx, App.tsx, vite-env.d.ts
│       ├── api/           client.ts, departments.ts, employees.ts
│       ├── components/    11 component và splitErrors.ts
│       ├── hooks/         usePageTitle, useSubmitGuard
│       ├── pages/         NotFoundPage, departments/ (5 file), employees/ (3 file)
│       ├── styles/        tokens.css, base.css, components.css
│       └── utils/         normalizeText.ts, parseId.ts
└── docs/
    ├── ke-hoach.md, danh-sach-api.md, so-do-database.md, du-lieu-mau.sql
    └── tim-hieu-technical-stack/  00 đến 07
```

## Phân loại file

| Loại | Backend | Frontend |
|---|---|---|
| Model/Entity | `Department`, `Employee`, `*Dto`, `*Request`, `*Configuration` | Kiểu `Department`, `Employee`, `*Request` trong `api/` |
| Controller/Handler | `DepartmentsController`, `EmployeesController` | Trang trong `pages/` |
| Service/UseCase | `DepartmentService`, `EmployeeService`, 2 interface | `useDepartmentDelete`, `validateDepartment`, `validateEmployee` |
| Repository/DAO | Không có; `AppDbContext` đảm nhận | `api/departments.ts`, `api/employees.ts` |
| Utility/Helper | `TextInput` | `normalizeText`, `parseId`, `splitErrors` |
| Configuration | `Program.cs`, `CorsSetup`, `StartupChecks`, `appsettings*.json`, `launchSettings.json` | `vite.config.ts`, `tsconfig.json`, `eslint.config.js`, `.env.development` |
| Middleware | `SecurityHeaders`, `ProblemDetailsExceptionHandler`, `StatusCodeProblemWriter`, `ValidationResponseFactory`, `ErrorMapper` | `api/client.ts` đóng vai trò tương tự ở phía gọi |
| Test | 12 file trong `EmployeeCrud.Api.Tests` | Không có |
| Migration | 2 migration, 2 Designer, 1 snapshot | Không có |
| Static/Asset | Không có | `styles/*.css`, `public/favicon.svg`, `Icon.tsx` |

## Pattern code

**Backend**
- Primary constructor để tiêm phụ thuộc: `DepartmentService(AppDbContext db)`.
- Controller mỏng, chỉ gọi service và chọn mã HTTP.
- `record` cho DTO ra, `class` với `[Required]` cho request vào. Luật độ dài chỉ ở service để đo sau khi chuẩn hóa.
- `DomainError` với factory `NotFound`, `Validation`, `Conflict`.
- Cấu hình bảng tách từng lớp `IEntityTypeConfiguration`, nạp bằng `ApplyConfigurationsFromAssembly`.
- Chỉ mục biểu thức viết tay bằng `migrationBuilder.Sql`.
- Tên ràng buộc dùng chung qua hằng `DbConstraintNames`.
- Bắt lỗi chen nhau bằng `catch ... when`, rơi về lỗi nghiệp vụ.

**Frontend**
- Component hàm, kiểu `Props` khai bằng `type`, không dùng `React.FC`.
- `data-testid` trên phần tử tương tác (31 thuộc tính trong `frontend/src`).
- Effect tải dữ liệu luôn có `AbortController`; lỗi `aborted` bị bỏ qua.
- "Khóa tải" (`reloadKey`, `requestKey`) để kết quả cũ không đè kết quả mới, suy ra trạng thái thay vì giữ state riêng. Hai trang form dùng `loadStatus` riêng, không dùng cách này.
- `key` theo id ở `App.tsx` để form được tạo mới khi đổi đối tượng.
- `useSubmitGuard` dùng `useRef` chặn hai cú bấm trong cùng nhịp.
- Mã trên địa chỉ đọc bằng `parseId`, không dùng `Number()` trực tiếp.
- Đường quay về gửi kèm qua `state` của `Link`, được kiểm dạng trước khi dùng (`listPathFrom` ở `EmployeeFormPage`).
- Khóa liên kết khi đang lưu bằng `aria-disabled` kèm `preventDefault` (nút Hủy, `PageHeader`).
- CSS kiểu BEM, biến trong `tokens.css`.
- Mô tả trợ năng: `aria-*`, `role`, trả focus, liên kết bỏ qua.

**Comment:** viết tiếng Việt, giải thích "vì sao". 186 dòng trong `backend/EmployeeCrud.Api` và `frontend/src` còn mã hồ sơ nội bộ, lịch sử sửa hoặc tên người (`DOC-9`).

**Quy ước đặt tên:** C# theo chuẩn .NET, `_camelCase` cho field; TypeScript camelCase, component PascalCase; bảng và cột `snake_case`; chữ cho người dùng và comment bằng tiếng Việt.
