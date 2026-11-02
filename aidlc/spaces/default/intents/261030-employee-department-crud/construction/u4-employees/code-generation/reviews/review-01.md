## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-02T09:16:34Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/code-generation/source-manifest.json > writes | Danh sách `writes` còn ghi ba đường dẫn không còn tồn tại vì đã dời bằng `git mv`: `backend/EmployeeCrud.Api.Tests/Departments/TestDb.cs`, `backend/EmployeeCrud.Api.Tests/Departments/ThrowingAppDbContext.cs`, `frontend/src/pages/EmployeesPage.tsx`. Vị trí mới đã được khai (`TestSupport/`, `pages/employees/`) nên không thiếu file nào. | Bỏ ba đường dẫn cũ khỏi `writes`, hoặc ghi rõ chúng là file đã dời/xóa. | New |
| R-02 | Minor | backend/EmployeeCrud.Api/Employees/EmployeeService.cs > UpdateAsync (comment "Giới hạn đã biết") và code-summary.md mục 2 | Comment và code-summary nói khi mọi giá trị giữ nguyên mà nhân viên vừa bị xóa thì API trả 200. Theo code thì không đúng: sau `SaveAsync` luôn gọi `GetByIdAsync`, mà hàm này ném `NotFound` khi dòng đã mất, nên kết quả thực tế là 404. Hành vi tốt hơn mô tả, nhưng lời giải thích sai sẽ làm Hiệp trình bày sai khi được hỏi. | Sửa comment và mục 2 cho đúng với code, hoặc chạy thử một ca để xác nhận rồi mới giữ lời mô tả. Khi U3 sửa cùng chỗ thì rà luôn comment tương ứng ở DepartmentService. | New |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u4-employees/code-generation/code-summary.md > mục 3, dòng 4 (Smart App Control) | Cách vượt Smart App Control là sửa một comment để ra file `.dll` khác. Cách này không bền: lần build sau có thể lại bị chặn, và người đọc có thể hiểu nhầm đó là một sửa đổi có chủ đích. Không phải lỗi của mã nguồn, và đã ghi rõ trong tóm tắt. | Giữ ghi chú này trong nháp README (U5) như một vấn đề môi trường đã biết, kèm hướng đi khi bị chặn lại do Hiệp tự quyết định. Không cần sửa mã. | New |
| R-04 | Minor | backend/EmployeeCrud.Api/Platform/Errors/ErrorMapper.cs > MapPostgres | Đường dự phòng chung của U1 chỉ nhận mã 23503; mã 23001 (restrict_violation) mà PostgreSQL thật báo khi xóa phòng ban còn nhân viên không được nhận. Hiện chỉ `DepartmentService` bắt 23001, nên chưa có lỗi, nhưng nếu sau này thêm đường xóa phòng ban khác thì sẽ ra 500. | Ghi vào danh sách việc để ý cho Build and Test, hoặc thêm mã 23001 vào đường dự phòng của U1 nếu Hiệp muốn (ngoài phạm vi U4). | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `dotnet test backend/EmployeeCrud.slnx --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Employees\|FullyQualifiedName~EmployeeCrud.Api.Tests.Departments"` | PASS: 75/75, 0 lỗi | Khớp với code-summary mục 4. Không bị Smart App Control chặn trong lần chạy này. |
| `npm --prefix frontend run verify` | PASS: ESLint (0 warning), Prettier, `tsc` + `vite build`, `dotnet test` toàn bộ 94/94 | Khớp code-summary. |
| `npm --prefix frontend run coverage` (chạy thêm) | `EmployeeService` 100%, `DepartmentService` 100% | Vượt mức sàn 80% của lớp service; các controller và migration 0% đúng theo quyết định kiểm tay trong team.md. |

### Summary

Cắt qua các tầng (React, controller, service, EF, migration), không thấy vòng phụ thuộc hay tham chiếu hỏng. Nhân viên hỏi phòng ban qua `IDepartmentService`, xóa phòng ban kiểm nhân viên trước, và có đường dự phòng cho trường hợp hai thao tác chen nhau. Chỉ mục `lower(email)` khớp với `ToLower()` ở service và tên ràng buộc khớp `ErrorMapper` của U1. Bốn điểm khác kế hoạch đều do Hiệp chọn và đã được thực hiện và ghi lại đúng. Chỉ còn bốn điểm Minor về tài liệu và việc để ý cho sau, không chặn.
