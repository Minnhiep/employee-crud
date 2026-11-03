# Truy vết liên Unit: employee-crud

> **Nguồn:** kết quả `aidlc engine sensor-traceability --stage build-and-test` (lượt chạy 3, 2026-11-03; chạy lại ở lượt 4 sau Change Request rà soát tổng thể: `pass: true`, 0 ID chưa phủ), đọc từ `traceability.json` của U1–U5 và `requirements.md`.

## Kết luận

**Đạt.** Mọi yêu cầu chức năng (FR1.1–FR7.4), mọi nhóm phi chức năng (NFR1–NFR8) và mọi tiêu chí chấp nhận (AC1.1.1–AC5.3.3) đều có ít nhất một Unit xây và một file đích tồn tại. Không còn ID nào chưa phủ.

Lần chạy đầu của lượt này báo **1 ID chưa phủ**: `u3-departments: NFR4.3` trỏ tới `backend/EmployeeCrud.Api.Tests/Departments/ThrowingAppDbContext.cs`. U4 đã dời file này sang `TestSupport/` bằng `git mv` (kế hoạch U4 Step 1), nhưng hồ sơ U3 chưa đổi đường dẫn. Đây là lỗi ghi chép, code đủ. Đã sửa `u3-departments/code-generation/traceability.json` sang `backend/EmployeeCrud.Api.Tests/TestSupport/ThrowingAppDbContext.cs` rồi chạy lại: đạt.

## Yêu cầu chức năng (FR)

| ID | Phủ qua tiêu chí | Unit xây |
|---|---|---|
| FR1.1 | AC1.1.1–AC1.1.3 | U3 |
| FR1.2 | AC1.2.1–AC1.2.4 | U3 |
| FR1.3 | AC1.3.1–AC1.3.4 | U3 |
| FR1.4 | AC1.4.1–AC1.4.3 | U3, U4 |
| FR1.5 | AC1.2.x, AC1.3.x | U3 |
| FR1.6 | AC1.4.1–AC1.4.3 | U3, U4 |
| FR1.7 | AC1.5.1, AC1.5.2 (N/A ở U3: bảng nhân viên trống sau migration thuộc U4) | U3, U4 |
| FR2.1 | AC2.1.1–AC2.1.3 | U4 |
| FR2.2 | AC2.2.1–AC2.2.5 | U4 |
| FR2.3 | AC2.3.1–AC2.3.4 | U4 |
| FR2.4 | AC2.4.1–AC2.4.3 | U4 |
| FR2.5, FR2.6 | AC2.2.x, AC2.3.x | U4 |
| FR3.1, FR3.2 | AC3.1.1–AC3.1.5 | U4 |
| FR4.1, FR4.2 | AC4.1.1–AC4.1.3 | U1, U2, U3, U4 |
| FR4.3 | AC1.3.x, AC2.3.x, AC2.4.x, AC5.2.x | U1, U3, U4, U5 |
| FR4.4 | AC1.2.x–AC1.4.x, AC2.2.x, AC2.3.x, AC5.2.x | U1, U3, U4, U5 |
| FR4.5 | AC4.2.1–AC4.2.3, AC1.1.x | U2, U3, U4 |
| FR4.6 | AC4.4.1, AC4.4.2 | U2, U3, U4 |
| FR5.1, FR5.2 | AC4.3.1–AC4.3.3 | U2, U3, U4 |
| FR5.3 | AC4.5.1, AC4.5.2 | U2, U3, U4 |
| FR5.4 | AC4.6.1, AC4.6.2 | U2, U3, U4 |
| FR6.1, FR6.2, FR6.4 | AC5.2.1–AC5.2.4 | U1, U3, U4, U5 |
| FR6.3 | AC2.1.1–AC2.1.3 | U4 |
| FR7.1, FR7.4 | AC5.1.1–AC5.1.3 | U1, U5 |
| FR7.2 | AC5.3.1–AC5.3.3 | U3, U4, U5 |
| FR7.3 | AC5.2.1–AC5.2.4 | U5 |

## Phi chức năng (NFR)

| Nhóm | Unit phủ | N/A có lý do |
|---|---|---|
| NFR1 (tin cậy khi chạy) | U1, U3, U4 | — |
| NFR2 (bảo mật dữ liệu) | U1, U2, U3, U4, U5 | U2 NFR2.3 (500 không lộ chi tiết là việc của U1); U4 NFR2.1 (không có file bí mật, quét 0 dòng) |
| NFR3 (toàn vẹn dữ liệu) | U1, U3, U4 | — |
| NFR4 (kiểm thử) | U3, U4 | — (sau khi sửa đường dẫn NFR4.3 của U3) |
| NFR5 (hiệu năng, quy mô) | U1, U2, U3, U4 | — |
| NFR6 (ghi log) | U4 (dùng log của U1) | U4 NFR6.1, NFR6.2 (không thêm logger, không bật log dữ liệu nhạy cảm) |
| NFR7 (CORS, cấu hình) | U1, U2, U3, U4, U5 | — |
| NFR8 (chất lượng giao diện) | U2 | — |

## Tiêu chí chấp nhận (AC) và file đích

| ID | Unit: file |
|---|---|
| AC1.1.1 | U3: `backend/EmployeeCrud.Api/Departments/DepartmentService.cs` |
| AC1.1.2, AC1.1.3 | U3: `frontend/src/pages/departments/DepartmentsPage.tsx` |
| AC1.2.1, AC1.3.1, AC1.3.4 | U3: `frontend/src/pages/departments/DepartmentFormPage.tsx` |
| AC1.2.2 | U3: `frontend/src/pages/departments/validateDepartment.ts` |
| AC1.2.3, AC1.2.4, AC1.3.3 | U3: `DepartmentService.cs` |
| AC1.3.2 | U3: `backend/EmployeeCrud.Api.Tests/Departments/DepartmentServiceTests.cs` |
| AC1.4.1, AC1.4.2 | U3: `DepartmentsPage.tsx`; U4: `DepartmentService.cs` |
| AC1.4.3 | U4: `DepartmentService.cs` |
| AC1.5.1 | U3: `Migrations/20261101183552_CreateDepartments.cs` |
| AC1.5.2 | N/A ở U3 (thuộc U4: migration `CreateEmployees`, bảng trống) |
| AC2.1.1, AC2.1.3, AC2.2.4, AC2.2.5, AC2.3.2–AC2.3.4, AC2.4.1, AC2.4.3, AC3.1.1–AC3.1.3 | U4: `backend/EmployeeCrud.Api/Employees/EmployeeService.cs` |
| AC2.1.2, AC2.4.2, AC3.1.4, AC3.1.5 | U4: `frontend/src/pages/employees/EmployeesPage.tsx` |
| AC2.2.1, AC2.2.2, AC2.3.1 | U4: `frontend/src/pages/employees/EmployeeFormPage.tsx` |
| AC2.2.3 | U4: `frontend/src/pages/employees/validateEmployee.ts` |
| AC4.1.1 | U2: `FormField.tsx`; U3: `DepartmentFormPage.tsx`; U4: `EmployeeFormPage.tsx` |
| AC4.1.2 | U1: `ValidationResponseFactory.cs`; U3: `DepartmentService.cs`; U4: `validateEmployee.ts` |
| AC4.1.3 | U1: `ErrorMapper.cs`; U2: `client.ts`; U3, U4: hai trang form |
| AC4.2.1, AC4.2.3 | U2: `StatusMessage.tsx`; U3, U4: hai trang danh sách |
| AC4.2.2 | U2: `client.ts`; U3, U4: hai trang danh sách |
| AC4.3.1 | U2: `NavMenu.tsx` |
| AC4.3.2 | U4: `App.tsx` |
| AC4.3.3 | U2: `AppLayout.tsx`; U3: `DepartmentsPage.tsx`; U4: `EmployeeFormPage.tsx` |
| AC4.4.1 | U2: `useSubmitGuard.ts`; U3, U4: hai trang form |
| AC4.4.2 | U2: `useSubmitGuard.ts`; U3, U4: hai trang danh sách |
| AC4.5.1 | U2: `Toast.tsx`; U3, U4: hai trang form |
| AC4.5.2 | U3, U4: hai trang form |
| AC4.6.1 | U2: `FormField.tsx`; U3, U4: hai trang form |
| AC4.6.2 | U2: `styles/components.css`; U3, U4: hai trang form |
| AC5.1.1, AC5.1.3 | U5: `README.md` |
| AC5.1.2 | U1: `StartupChecks.cs`; U5: `README.md` |
| AC5.2.1 | U5: `docs/danh-sach-api.md` |
| AC5.2.2 | U3, U4: hai controller; U5: `docs/danh-sach-api.md` |
| AC5.2.3 | U1: `PipelineTests.cs`; U3, U4: hai controller; U5: `docs/danh-sach-api.md` |
| AC5.2.4 | U1: `Program.cs`; U3, U4: hai controller; U5: `docs/danh-sach-api.md` |
| AC5.3.1 | U5: `docs/so-do-database.md` |
| AC5.3.2 | U3: `DepartmentConfiguration.cs`; U4: `EmployeeConfiguration.cs`; U5: `docs/so-do-database.md` |
| AC5.3.3 | U3, U4: hai migration; U5: `docs/so-do-database.md` |

## Phần chưa phủ

Không có.
