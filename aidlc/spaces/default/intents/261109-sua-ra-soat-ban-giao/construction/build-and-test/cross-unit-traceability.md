# Truy vết cuối: sua-ra-soat-ban-giao

## Nguồn

- Kết quả lệnh `aidlc engine sensor-traceability --stage build-and-test` (chạy 10/11/2026).
- `../code-generation/code-generation-plan.md` (code-generation-plan): bảng "Truy vết bước → yêu cầu".
- `../code-generation/unit-test-instructions.md` (unit-test-instructions) và `../code-generation/code-summary.md` (code-summary): nơi mỗi yêu cầu được làm và kiểm.
- `../../inception/requirements-analysis/requirements.md`: danh sách yêu cầu (FR1–FR8, NFR1–NFR7).

## Kết luận

**Đạt.** Việc này không chia Unit (scope `bugfix`), nên mọi yêu cầu thuộc một phạm vi duy nhất của stage Code Generation.

- 49 trên 53 mã yêu cầu đã được Code Generation làm ra, mỗi mã có file đích.
- 4 mã còn lại (FR8.1, FR8.2, FR8.3, NFR6) là việc **kiểm**, không phải việc viết code. Code Generation đã ghi chúng `Deferred` sang Build and Test, nên công cụ báo `covered: false`. Build and Test đã kiểm cả bốn và đạt; bằng chứng ở bảng thứ hai.

## Yêu cầu do Code Generation làm ra

| Mã | Phạm vi / Unit | File đích (theo công cụ kiểm) | Trạng thái |
|---|---|---|---|
| FR1.1–FR1.4 | code-generation (không chia Unit) | `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md` | Đã làm |
| FR2.1–FR2.7 | code-generation | `README.md` | Đã làm |
| FR3.1–FR3.5 | code-generation | `docs/luong-xu-ly-thuc-te.md` | Đã làm |
| FR4.1, FR4.2 | code-generation | `docs/danh-sach-api.md` | Đã làm |
| FR4.3 | code-generation | `backend/EmployeeCrud.Api/EmployeeCrud.Api.http` | Đã làm |
| FR5.1 | code-generation | `docs/tim-hieu-technical-stack/00-tong-quan-luong.md` | Đã làm |
| FR5.2 | code-generation | `.gitignore` | Đã làm |
| FR6.1 | code-generation | `backend/EmployeeCrud.Api.Tests/Employees/EmployeeServiceTests.cs` | Đã làm |
| FR6.2 | code-generation | `backend/EmployeeCrud.Api/Employees/EmployeeService.cs` | Đã làm |
| FR6.3 | code-generation | `backend/EmployeeCrud.Api/Platform/Errors/ProblemDetailsExceptionHandler.cs` | Đã làm |
| FR6.4 | code-generation | `backend/EmployeeCrud.Api/Program.cs` (test giữ cấu hình: `PipelineTests.Kestrel_LimitsRequestBodyTo64Kilobytes`) | Đã làm |
| FR6.5 | code-generation | `backend/EmployeeCrud.Api.Tests/Departments/DepartmentServiceTests.cs` | Đã làm |
| FR6.6 | code-generation | `backend/EmployeeCrud.Api/Program.cs` | Đã làm |
| FR6.7 | code-generation | `backend/EmployeeCrud.Api/Platform/StartupChecks.cs` | Đã làm |
| FR6.8 | code-generation | `global.json` | Đã làm |
| FR6.9 | code-generation | `backend/EmployeeCrud.Api/Departments/DepartmentService.cs` | Đã làm |
| FR7.1 | code-generation | `frontend/src/pages/employees/EmployeeFormPage.tsx` | Đã làm |
| FR7.2 | code-generation | `frontend/src/components/AppLayout.tsx` | Đã làm |
| FR7.3 | code-generation | `frontend/src/pages/departments/useDepartmentDelete.tsx` (cùng `EmployeesPage.tsx`, `DepartmentsPage.tsx`, `DepartmentDetailPage.tsx`) | Đã làm |
| FR7.4 | code-generation | `frontend/src/pages/departments/DepartmentsPage.tsx` | Đã làm |
| FR7.5 | code-generation | `frontend/src/pages/employees/EmployeesPage.tsx` | Đã làm |
| FR7.6 | code-generation | `frontend/src/pages/departments/DepartmentDetailPage.tsx` | Đã làm |
| FR7.7 | code-generation | `frontend/src/hooks/usePageTitle.ts` (cùng `EmployeesPage.tsx`) | Đã làm |
| FR7.8 | code-generation | `frontend/src/components/ConfirmDialog.tsx` | Đã làm |
| FR7.9, FR7.10 | code-generation | `frontend/src/pages/employees/EmployeeFormPage.tsx` | Đã làm |
| FR7.11 | code-generation | `frontend/src/pages/NotFoundPage.tsx` | Đã làm |
| FR7.12 | code-generation | `frontend/src/pages/employees/validateEmployee.ts` | Đã làm |
| FR7.13 | code-generation | `frontend/src/pages/departments/DepartmentDetailPage.tsx` | Đã làm |
| NFR1–NFR5, NFR7 | code-generation | `aidlc/spaces/default/intents/261109-sua-ra-soat-ban-giao/construction/code-generation/code-summary.md` | Đã làm, kiểm lại ở Build and Test (Met) |

## Yêu cầu Build and Test kiểm (công cụ báo chưa phủ ở Code Generation)

| Mã | Vì sao Code Generation không làm | Build and Test kiểm thế nào | Kết quả |
|---|---|---|---|
| FR8.1 | Là phép kiểm migration trên database trống, cần mật khẩu `postgres` do Hiệp gõ | Hiệp làm tay theo `build-instructions.md` mục FR8.1 | Met: 2 migration, 4 phòng ban mẫu, đã xóa database thử (Hiệp báo, tin nhắn 47ddac1b) |
| FR8.2 | Là phép đo Lighthouse trên Chrome của Hiệp | Hiệp làm tay theo `build-instructions.md` mục FR8.2 | Met: hai trang danh sách đều 100/100/100 (Hiệp báo, tin nhắn 47ddac1b) |
| FR8.3 | Là hồi quy toàn bộ sau khi code xong | `verify`, API thật, Chromium thật (`test-results.md` §1, §3, §4) | Met: 153/153, API 41/41, Chromium 71/71 |
| NFR6 | Là mục tiêu trợ năng đo trên bản chạy thật | Lighthouse Accessibility và các phép kiểm bàn phím trên Chromium (`test-results.md` §4, §6) | Met: Accessibility 100 cả hai trang; phép kiểm bàn phím đạt |

## Mã chưa phủ

Không còn. Bốn mã công cụ báo `covered: false` đều đã có bằng chứng `Met` ở bảng trên.
