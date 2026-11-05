# Truy vết yêu cầu

**Kết luận: ĐẠT.** `aidlc engine sensor-traceability --stage build-and-test` trả `pass: true`, 0 ID chưa phủ. Có 32 ID, chủ sở hữu là `code-generation`; việc này không có Unit.

| ID | Trạng thái | File |
|---|---|---|
| FR1.1, FR1.2 | Đã làm | `backend/EmployeeCrud.Api/Platform/Text/TextInput.cs` |
| FR1.3 | Đã làm | `frontend/src/utils/normalizeText.ts` |
| FR1.4, FR9.1, NFR2 | Đã làm | `backend/EmployeeCrud.Api.Tests/Employees/EmployeeServiceTests.cs` |
| FR2.1 | Đã làm | `backend/EmployeeCrud.Api/Departments/DepartmentService.cs` và 5 file định dạng khác |
| FR2.2, NFR1 | Đã làm | `frontend/package.json` |
| FR3.1, FR3.4 | Đã làm | `frontend/src/pages/employees/EmployeeFormPage.tsx` |
| FR3.2 | Đã làm | `frontend/src/components/PageHeader.tsx` |
| FR3.3, FR4.1 | Đã làm | `frontend/src/pages/departments/DepartmentFormPage.tsx` |
| FR4.2 | Đã làm | `frontend/src/utils/parseId.ts` |
| FR5.1 | Đã làm | `backend/EmployeeCrud.Api/EmployeeCrud.Api.http` |
| FR5.2 | Đã làm | `docs/danh-sach-api.md` |
| FR5.3 | Đã làm | `docs/so-do-database.md` |
| FR6.1 | Đã làm | `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md` |
| FR6.2 | Đã làm | `docs/tim-hieu-technical-stack/00-tong-quan-luong.md` và các file `01`–`05` |
| FR6.3 | Đã làm | `docs/tim-hieu-technical-stack/06-cai-dat-moi-truong.md` |
| FR6.4 | Đã làm | `backend/EmployeeCrud.Api/Platform/Errors/DbConstraintNames.cs` |
| FR7.1 | Đã làm | `backend/EmployeeCrud.Api/Platform/Errors/ErrorTitles.cs` |
| FR7.2 | Đã làm | `frontend/src/styles/tokens.css` |
| FR7.3 | N/A | Đã bỏ thư mục rỗng nên không còn file để trỏ tới |
| FR8.1, FR8.2 | Đã làm | `frontend/src/pages/employees/EmployeesPage.tsx` |
| FR8.3 | Đã làm | `frontend/src/pages/departments/DepartmentDetailPage.tsx` |
| FR9.2 | Đã làm | `backend/EmployeeCrud.Api.Tests/Platform/LoggingTests.cs` |
| NFR3, NFR4 | Đã làm | `backend/EmployeeCrud.Api/Platform/Text/TextInput.cs` |
| NFR5 | N/A | Không thêm gói, không thêm bí mật |

Không có ID chưa phủ.
