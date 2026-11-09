# Reverse Engineering Timestamp

## Run Record

- Date: 2026-11-09T07:01:08Z
- Commit: 9ebab38027119cd8d484b68a5345f080d1ab5229
- Intent: `kiem-cuoi-crlf` (scope `bugfix`, độ sâu Minimal)
- Kiểu quét: quét lại toàn bộ repo (`./`), thay thế toàn bộ 9 artifact của knowledge base cũ.
- Ghi chú: lúc quét, working tree có thay đổi chưa commit ở `backend/EmployeeCrud.Api.Tests/Platform/PlatformWebAppFactory.cs` và `backend/EmployeeCrud.Api.Tests/TestSupport/ThrowingAppDbContext.cs` (chỉ thêm comment); vân tay bên dưới tính theo file trên đĩa, gồm cả hai thay đổi này.
- Bỏ qua không mở: `.git/`, `bin/` và `obj/` của hai project .NET, `backend/TestResults/`, `backend/EmployeeCrud.Api.Tests/TestResults/`, `frontend/node_modules/`, `frontend/dist/`, `.playwright-mcp/`, phần cài đặt của AI-DLC (`.claude/`, `aidlc/`, khối AI-DLC trong `.gitignore`).

## Scope of Analysis

```yaml
scope_version: 1
kind: full
intent: kiem-cuoi-crlf
fingerprint: 091b4e1eb09166e5e29f710772bab4cf01624454
analyzed:
  paths:
    - ./
  components:
    - Program
    - DepartmentsController
    - DepartmentService
    - EmployeesController
    - EmployeeService
    - AppDbContext
    - Migrations
    - Platform.Errors
    - Platform.Cors
    - Platform.Security
    - Platform.Text
    - StartupChecks
    - EmployeeCrud.Api.Tests
    - App
    - frontend-api-client
    - EmployeesPage
    - EmployeeFormPage
    - DepartmentsPage
    - DepartmentDetailPage
    - DepartmentFormPage
    - useDepartmentDelete
    - NotFoundPage
    - shared-components
    - hooks
    - utils
    - styles
    - repo-tooling
shallow:
  paths:
    - backend/EmployeeCrud.Api/Migrations/AppDbContextModelSnapshot.cs
    - backend/EmployeeCrud.Api/Migrations/20261101183552_CreateDepartments.Designer.cs
    - backend/EmployeeCrud.Api/Migrations/20261102083152_CreateEmployees.Designer.cs
    - backend/EmployeeCrud.Api.Tests/Departments/DepartmentServiceTests.cs
    - backend/EmployeeCrud.Api.Tests/Employees/EmployeeServiceTests.cs
    - frontend/src/styles/components.css
    - frontend/public/favicon.svg
    - docs/danh-sach-api.md
    - docs/du-lieu-mau.sql
    - docs/tim-hieu-technical-stack/
```
