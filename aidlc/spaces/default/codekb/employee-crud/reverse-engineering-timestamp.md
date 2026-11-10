# Reverse Engineering Timestamp

## Run Record

- Date: 2026-11-10 (bắt đầu quét 2026-11-09)
- Commit: 3f62f3e05e3fde56dfdefb8ee0339536ed92a3d6
- Intent: `sua-ra-soat-ban-giao` (scope `bugfix`, độ sâu Minimal)
- Kiểu quét: quét lại toàn bộ repo (`./`), thay thế toàn bộ 9 artifact của knowledge base cũ (bản quét sáng 09/11 ở commit `9ebab38`).
- Ghi chú: lúc quét, mã nguồn ngoài `aidlc/` trùng commit trên (thay đổi chưa commit chỉ nằm trong `aidlc/`). Chỉ đọc file; không build, không chạy test hay chương trình nào.
- Bỏ qua không mở: `.git/`; `bin/` và `obj/` của hai project .NET; `backend/TestResults/`, `backend/EmployeeCrud.Api.Tests/TestResults/`; `frontend/node_modules/`, `frontend/dist/`; `.playwright-mcp/`; phần cài đặt và hồ sơ AI-DLC (`.claude/`, `aidlc/`, khối AI-DLC trong `.gitignore`).
- Handoff của bước quét: `aidlc/spaces/default/intents/261109-sua-ra-soat-ban-giao/inception/reverse-engineering/developer-scan.md`.

## Scope of Analysis

```yaml
scope_version: 1
kind: full
intent: sua-ra-soat-ban-giao
fingerprint: eb5d0b8381e6bd3876f4cf74c5d4d33e07dfa316
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
    - project-docs
shallow:
  paths:
    - frontend/package-lock.json
    - docs/tim-hieu-technical-stack/01-react.md
    - docs/tim-hieu-technical-stack/02-api-json.md
    - docs/tim-hieu-technical-stack/03-aspnet-core.md
    - docs/tim-hieu-technical-stack/04-postgresql.md
    - docs/tim-hieu-technical-stack/05-git.md
    - docs/tim-hieu-technical-stack/06-cai-dat-moi-truong.md
```
