# Code Generation Plan Approval

AI-DLC writes this file when it asks you to approve the plan. To answer here
instead of in chat, write your answer after `[Answer]:` and tell me in chat when you are done.

## Plan Approval

Approve the code plan for u3-departments?

- Step 11 (Change Request rà soát tổng thể, 03/11/2026): chuẩn hóa tên phòng ban ở API và form (gộp khoảng trắng, NFC, chặn ký tự điều khiển và ký tự vô hình theo RFC 8264/8266, W3C: hết lỗi 500 với ...
- Redesign (Step 10, Hiệp yêu cầu 03/11/2026): siết lại hệ thiết kế chung theo mật độ phần mềm quản trị doanh nghiệp (chữ 14px, nút/ô nhập 36px, dải đầu trang trắng, tấm có phần đầu/thân/chân) và làm...
- Builds: quản lý phòng ban đủ 4 tầng: bảng `departments` + chỉ mục + 4 dòng mẫu (migration), `DepartmentService` (luật BR1, BR2), `DepartmentsController` (5 API), trang danh sách và form thêm/sửa/xó...
- Touches: `backend/EmployeeCrud.Api/Departments/`, `backend/EmployeeCrud.Api/Migrations/`, `Program.cs` (1 dòng), `backend/EmployeeCrud.Api.Tests/Departments/`, `frontend/src/api/departments.ts`, `f...
- Tests: 27 ca unit test xUnit cho `DepartmentService` (#1–#27, gồm 6 ca chuẩn hóa tên của Step 11; InMemory + ngữ cảnh ném lỗi giả), độ phủ dòng ≥ 80% (đo được 100%); controller, migration, giao diệ...

Full plan: aidlc/spaces/default/intents/261030-employee-department-crud/construction/u3-departments/code-generation/code-generation-plan.md
Test instructions: aidlc/spaces/default/intents/261030-employee-department-crud/construction/u3-departments/code-generation/unit-test-instructions.md

[Approval Fingerprint]: sha256:v3:acbc6bc39f6ea424baf39e7fb2d5cf552d1cde4ebea847ca116cdd7aa4b5be10
[Planned Source]: 57841ba60113dc3a53f73d7d6c11c006d9f764e13b53c3ae4e2e95965e6247ae

- A. Approve Plan
- B. Request Changes
- C. I'll edit the files

[Answer]: A. Approve Plan
