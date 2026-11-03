# Code Generation Plan Approval

AI-DLC writes this file when it asks you to approve the plan. To answer here
instead of in chat, write your answer after `[Answer]:` and tell me in chat when you are done.

## Plan Approval

Approve the code plan for u3-departments?

- Step 11 (Change Request rà soát tổng thể, 03/11/2026): chuẩn hóa tên phòng ban ở API và form (gộp khoảng trắng, NFC, chặn ký tự điều khiển: hết lỗi 500 với `\0`, hết lách luật không trùng); bỏ `max...
- Redesign (Step 10, Hiệp yêu cầu 03/11/2026): siết lại hệ thiết kế chung theo mật độ phần mềm quản trị doanh nghiệp (chữ 14px, nút/ô nhập 36px, dải đầu trang trắng, tấm có phần đầu/thân/chân) và làm...
- Builds: quản lý phòng ban đủ 4 tầng: bảng `departments` + chỉ mục + 4 dòng mẫu (migration), `DepartmentService` (luật BR1, BR2), `DepartmentsController` (5 API), trang danh sách và form thêm/sửa/xó...
- Touches: `backend/EmployeeCrud.Api/Departments/`, `backend/EmployeeCrud.Api/Migrations/`, `Program.cs` (1 dòng), `backend/EmployeeCrud.Api.Tests/Departments/`, `frontend/src/api/departments.ts`, `f...
- Tests: khoảng 20 unit test xUnit cho `DepartmentService` (InMemory + ngữ cảnh ném lỗi giả), độ phủ dòng ≥ 80%; controller, migration, giao diện kiểm tay bằng curl/Postman, pgAdmin, trình duyệt
- Already changed before you approved: .playwright-mcp/console-2026-11-03T04-09-29-143Z.log.

Full plan: aidlc/spaces/default/intents/261030-employee-department-crud/construction/u3-departments/code-generation/code-generation-plan.md
Test instructions: aidlc/spaces/default/intents/261030-employee-department-crud/construction/u3-departments/code-generation/unit-test-instructions.md

[Approval Fingerprint]: sha256:v3:62e2e14dd76154c38bfba1eb247cf52c029aeea13f54698344057da988425f91
[Planned Source]: 9a2698651e407f381c49a4b1dc6f6b9c86ba49a6031ca4beab45040852080e12

- A. Approve Plan
- B. Request Changes
- C. I'll edit the files

[Answer]: A. Approve Plan
