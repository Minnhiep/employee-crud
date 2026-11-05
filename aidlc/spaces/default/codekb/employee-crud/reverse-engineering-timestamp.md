# Reverse Engineering Timestamp

## Run Record

- Date: 2026-11-05
- Commit: 67689354927fc28276fab61f60f42e2ae608a293

## Scope of Analysis

```yaml
scope_version: 1
kind: partial
intent: 261104-sua-loi-luot-8
fingerprint: 7b9adf00d658a975c42ccd8373b5416644b2f7df
analyzed:
  paths:
    - backend/EmployeeCrud.Api/
    - frontend/src/
    - docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md
  components:
    - EmployeeCrud.Api.Departments
    - EmployeeCrud.Api.Employees
    - EmployeeCrud.Api.Platform.Data
    - EmployeeCrud.Api.Platform.Errors
    - EmployeeCrud.Api.Platform.Cors
    - EmployeeCrud.Api.Platform.Security
    - EmployeeCrud.Api.Platform.Text
    - EmployeeCrud.Api.Platform.StartupChecks
    - EmployeeCrud.Api.Migrations
    - EmployeeCrud.Api.Program
    - frontend-app-shell
    - frontend-api-client
    - frontend-shared-components
    - frontend-hooks
    - frontend-utils
    - frontend-pages-employees
    - frontend-pages-departments
shallow:
  paths:
    - ./
    - backend/EmployeeCrud.Api/Migrations/20261101183552_CreateDepartments.Designer.cs
    - backend/EmployeeCrud.Api/Migrations/20261102083152_CreateEmployees.Designer.cs
    - backend/EmployeeCrud.Api/Migrations/AppDbContextModelSnapshot.cs
    - backend/EmployeeCrud.Api/Properties/launchSettings.json
    - backend/EmployeeCrud.Api/appsettings.Development.json
    - backend/EmployeeCrud.Api.Tests/
    - docs/danh-sach-api.md
    - frontend/package-lock.json
    - frontend/src/styles/
    - frontend/src/components/Icon.tsx
```
