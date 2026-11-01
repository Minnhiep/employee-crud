# Tóm tắt code: u3-departments

> Làm theo `code-generation-plan.md` (Hiệp duyệt ngày 2026-11-02). Lệnh chạy ở phiên chính, Hiệp duyệt từng lệnh. Bước pgAdmin và Lighthouse do Hiệp tự làm.

## 1. File đã tạo hoặc sửa

### Backend

| File | Mới / Sửa | Nội dung |
|---|---|---|
| `backend/EmployeeCrud.Api/Departments/Department.cs` | Mới | Thực thể `Id`, `Name` |
| `backend/EmployeeCrud.Api/Departments/DepartmentConfiguration.cs` | Mới | Bảng `departments`, cột `id`/`name`, `varchar(100) NOT NULL`; không khai chỉ mục, không `HasData` |
| `backend/EmployeeCrud.Api/Departments/DepartmentDto.cs` | Mới | `record DepartmentDto(int Id, string Name)` |
| `backend/EmployeeCrud.Api/Departments/DepartmentRequest.cs` | Mới | `[Required]` trên `Name`; không `[MaxLength]` |
| `backend/EmployeeCrud.Api/Departments/IDepartmentService.cs`, `DepartmentService.cs` | Mới | Luật BR1, BR2; bắt `DbUpdateConcurrencyException` → 404, 23503 `fk_employees_department` → 409 |
| `backend/EmployeeCrud.Api/Departments/DepartmentsController.cs` | Mới | 5 API của C1, `[ProducesResponseType]` đủ mã |
| `backend/EmployeeCrud.Api/Migrations/20261101183552_CreateDepartments.cs` (+ `.Designer.cs`, `AppDbContextModelSnapshot.cs`) | Mới | Bảng + `CREATE UNIQUE INDEX ux_departments_name ON departments (lower(name))` + 4 dòng mẫu `InsertData` không id; `Down` xóa chỉ mục rồi bảng |
| `backend/EmployeeCrud.Api/Platform/Data/AppDbContext.cs` | Sửa | Thêm `DbSet<Department> Departments` |
| `backend/EmployeeCrud.Api/Program.cs` | Sửa | `AddScoped<IDepartmentService, DepartmentService>()` |
| `backend/EmployeeCrud.Api/EmployeeCrud.Api.csproj` | Sửa | Thêm `Microsoft.EntityFrameworkCore.Relational` `10.*` (**khác kế hoạch**, xem mục 3) |
| `backend/EmployeeCrud.Api.Tests/EmployeeCrud.Api.Tests.csproj` | Sửa | Thêm `Microsoft.EntityFrameworkCore.InMemory` `10.*` |
| `backend/EmployeeCrud.Api.Tests/Departments/TestDb.cs`, `ThrowingAppDbContext.cs`, `DepartmentServiceTests.cs` | Mới | 21 ca (25 lần chạy, tính cả Theory) |
| `dotnet-tools.json` | Sửa | Thêm `dotnet-reportgenerator-globaltool` 5.5.12 (cục bộ) |

### Frontend

| File | Mới / Sửa | Nội dung |
|---|---|---|
| `frontend/src/api/departments.ts` | Mới | Kiểu `Department`, `DepartmentRequest`; 5 hàm gọi API |
| `frontend/src/pages/departments/validateDepartment.ts` | Mới | Kiểm tên trên trình duyệt (BR1.1–BR1.3) |
| `frontend/src/pages/departments/DepartmentsPage.tsx` | Dời (`git mv`) + viết lại | 4 trạng thái, bảng, xóa có xác nhận, tải lại sau khi xóa |
| `frontend/src/pages/departments/DepartmentFormPage.tsx` | Mới | Form thêm/sửa |
| `frontend/src/App.tsx` | Sửa | 2 đường dẫn form, import từ thư mục mới |
| `frontend/src/styles/components.css` | Sửa | Thêm `.page-header`, `.list-count` (**khác kế hoạch**, xem mục 3) |
| `frontend/package.json` | Sửa | Script `coverage` |

Phiên bản gói thật: EF Core / Relational / InMemory 10.0.14, Npgsql.EFCore.PostgreSQL 10.0.3, reportgenerator 5.5.12.

## 2. Quyết định chính

- **Chỉ mục viết tay trên `lower(name)`** (NFR3.4): EF Core không sinh được chỉ mục trên biểu thức. Vì mô hình EF không biết chỉ mục này, các migration sau sẽ không tự xóa nó.
- **Seed bằng `InsertData` không id** (NFR3.5): bộ đếm identity vẫn đúng. Phòng ban đầu tiên thêm sau migration nhận id 5, không lỗi.
- **So trùng `d.Name.ToLower() == name.ToLower()`** ở cả hai vế trong biểu thức: PostgreSQL dùng đúng một hàm `lower()` cho hai bên, cùng biểu thức với chỉ mục.
- **Độ dài chỉ kiểm ở service, sau khi trim**: DTO chỉ có `[Required]`, để không có hai câu trả lời khác nhau cho tên dài 100 ký tự kèm khoảng trắng.
- **Service tự bắt `DbUpdateConcurrencyException` → 404**: `ErrorMapper` của U1 không nhận ra lỗi này. U1 không bị sửa.
- **Lỗi khi lưu form**: `onBlur` của ô tên chỉ thay lỗi khi kiểm trên trình duyệt thấy sai. Lỗi phát hiện khi kiểm tay: focus chuyển sang khung tóm tắt làm ô tên blur, và bản đầu tiên xóa mất lỗi 409 của API. Đã sửa và kiểm lại.
- **Trang danh sách tải dữ liệu bằng `.then(...)`**, không gọi hàm async có `setState` ngay trong effect. Đây là luật `react-hooks/set-state-in-effect` của ESLint.
- `FormEvent` đã lỗi thời trong kiểu React 19, nên dùng `SubmitEvent<HTMLFormElement>`.

## 3. Khác kế hoạch (Hiệp đã chọn bằng form)

| Khác gì | Vì sao | Hiệp chọn |
|---|---|---|
| Thêm `Microsoft.EntityFrameworkCore.Relational` `10.*` vào project API | Project test nhận Relational 10.0.4 (đi theo Npgsql), còn project API build với 10.0.14 (đi theo gói Design, gói này không truyền sang test), gây cảnh báo MSB3277. Sau khi sửa thì hết cảnh báo | "Khai rõ Relational 10.*" |
| Thêm `.page-header`, `.list-count` vào `components.css` | Mockup đặt tiêu đề và nút "+ Thêm phòng ban" trên cùng một hàng; CSS chung chưa có lớp này. U4 dùng lại được | "Thêm lớp CSS chung" |
| Nút "Thử lại" không có `data-testid` riêng | Nút nằm trong `StatusMessage` của U2. Thay vào đó, khung trạng thái có `data-testid="departments-status"` để tìm nút theo vai trò và chữ | (ghi chú, không đổi file U2) |

## 4. Đã kiểm ra sao

| Kiểm | Kết quả |
|---|---|
| pgAdmin `SELECT lower('KẾ TOÁN') = lower('Kế toán')` (trước migration) | `true` |
| Migration: `update` → `update 0` → `update` | Cả ba thành công |
| pgAdmin: chỉ mục | `ux_departments_name ... USING btree (lower((name)::text))` + `PK_departments` |
| pgAdmin: `INSERT ... ('KẾ TOÁN')` | `duplicate key ... "ux_departments_name"`, SQL state **23505** |
| Unit test U3 (`--filter ...Departments`) | 25/25 xanh |
| Toàn bộ test (`npm --prefix frontend run verify`) | 44/44 xanh, frontend typecheck/lint/format/build sạch |
| Độ phủ (`npm --prefix frontend run coverage`) | `DepartmentService` **100%** dòng (mức sàn 80%) |
| `dotnet format --verify-no-changes` | Sạch |
| API bằng curl: GET thứ tự; POST trim → 201 + Location; rỗng / thiếu / 101 ký tự → 400; "kế toán" → 409; PUT chính nó đổi hoa thường → 200; PUT tên khác → 409; PUT / DELETE / GET id không có → 404; DELETE → 204; `/abc` → 404 | Đạt hết |
| Thời gian API | 3–40 ms; lần gọi đầu sau khi khởi động 0,75 giây; đều ≤ 1 giây |
| OpenAPI | 5 thao tác với đủ mã 200/201/204/400/404/409 |
| Trình duyệt (Playwright, dev server) | Danh sách đúng thứ tự, "Có 4 phòng ban", nhãn "Sửa phòng ban Kế toán"; form trống → lỗi cạnh ô + khung tóm tắt nhận focus, không gửi request; "kế toán" → 409 hiện cạnh ô; bấm đúp Lưu → **một** POST; sửa → Toast "Đã cập nhật...", focus h1; xóa: Hủy không làm gì, OK → dòng biến mất **không F5**, Toast, focus h1; `/departments/99999/edit` và `/abc/edit` → "Không tìm thấy phòng ban" (abc không gọi API); tắt backend → "Không kết nối được máy chủ..." + "Thử lại", bật lại và bấm → có dữ liệu; POST / PUT / DELETE thật từ 5173 không lỗi CORS |
| Lighthouse (Hiệp đo, `npm run preview`, khung Galaxy A55 360px) | **Performance 100, Accessibility 100** |
| Quét bí mật, quét `dangerouslySetInnerHTML` / `FromSqlRaw` / `ExecuteSqlRaw` | 0 dòng |

## 5. Test viết nhưng chưa chạy

Không có. Mọi test đã viết đều chạy và xanh. Theo `team.md`, không có test tự động cho controller và React; hai tầng này đã kiểm tay như bảng trên.

## 6. Nháp cho README (U5)

- **Tạo bảng:** `dotnet tool restore`, rồi `dotnet ef database update --project backend/EmployeeCrud.Api`. Để quay lui hết: `dotnet ef database update 0 --project backend/EmployeeCrud.Api`.
- **Đọc độ phủ:** `npm --prefix frontend run coverage`. Lệnh in bảng % theo lớp; báo cáo chi tiết ở `backend/TestResults/coverage-report/index.html`.
- **Xem câu SQL:** trong `backend/EmployeeCrud.Api/appsettings.Development.json`, đổi `"Microsoft.EntityFrameworkCore.Database.Command"` từ `"Warning"` sang `"Information"`, rồi chạy lại backend.

## 7. Việc chuyển cho U4 và Build and Test

- U4 đặt khóa ngoại đúng tên `fk_employees_department` (nhánh 23503 của `DepartmentService.DeleteAsync` khớp theo tên này), bằng **migration mới**, không sửa `CreateDepartments`.
- U4 thêm bước kiểm "còn nhân viên" trước khi xóa phòng ban (C4). Build and Test kiểm thật bằng Postman: xóa phòng ban còn nhân viên → 409.
- Test "sắp A-Z" của InMemory dùng tên ASCII; thứ tự có dấu đã kiểm trên PostgreSQL thật (trang Phòng ban).
- Ghim chặt mọi phiên bản gói (hiện là `10.*`) là việc riêng nếu Hiệp muốn (rà soát Infrastructure Design, Minor 2).
