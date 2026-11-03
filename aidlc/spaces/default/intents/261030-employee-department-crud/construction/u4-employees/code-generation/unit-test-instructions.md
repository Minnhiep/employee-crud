# Hướng dẫn test: u4-employees

## 1. Bộ test và cấu hình

- Project `backend/EmployeeCrud.Api.Tests` (xUnit, `coverlet.collector`, `Microsoft.EntityFrameworkCore.InMemory`) đã có từ U1/U3. U4 **không thêm gói**.
- Test của U4 nằm ở hai chỗ:
  - `backend/EmployeeCrud.Api.Tests/Employees/EmployeeServiceTests.cs` (namespace `EmployeeCrud.Api.Tests.Employees`);
  - các ca thêm vào `backend/EmployeeCrud.Api.Tests/Departments/DepartmentServiceTests.cs` (BR2.7).
- Hạ tầng test dùng chung `TestDb.cs`, `ThrowingAppDbContext.cs` được dời từ `backend/EmployeeCrud.Api.Tests/Departments/` sang `backend/EmployeeCrud.Api.Tests/TestSupport/` (namespace `EmployeeCrud.Api.Tests.TestSupport`).
- Không có test tự động cho controller và React (`team.md`). Hai tầng đó kiểm tay ở mục 6.

## 2. Lệnh chạy test của riêng U4

Chạy ở thư mục gốc `employee-crud/`:

```bash
dotnet test backend/EmployeeCrud.slnx --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Employees|FullyQualifiedName~EmployeeCrud.Api.Tests.Departments"
```

- Bộ lọc gồm cả test phòng ban, vì U4 sửa `DepartmentService.DeleteAsync` và dời hạ tầng test mà các test đó dùng.
- Lệnh chạy được ngay từ Step 2 (sau khi dời `TestSupport/`), lúc chưa có test nhân viên nào. Đạt khi mọi test khớp đều xanh.

## 3. Mức độ phủ

- **Mục tiêu của U4:** `EmployeeService` ≥ 80% số dòng, `DepartmentService` vẫn ≥ 80% (NFR4.3, `team.md`). Lệnh riêng:

```bash
npm --prefix frontend run coverage
```

- Lệnh này xóa kết quả cũ, chạy toàn bộ test có thu độ phủ, rồi in bảng % theo lớp. Đọc dòng `EmployeeCrud.Api.Employees.EmployeeService` và `EmployeeCrud.Api.Departments.DepartmentService`. Trang chi tiết nằm ở `backend/TestResults/coverage-report/index.html`.
- Mức sàn 80% của các lớp service là của cả dự án. Build and Test kiểm lại trên toàn bộ test. Không được hạ ngưỡng để cho qua.

## 4. Giả lập database

| Cái gì | Dùng | Vì sao |
|---|---|---|
| Database cho service | `TestDb` tạo `AppDbContext` với `UseInMemoryDatabase(Guid.NewGuid().ToString())`, kèm hàm nạp phòng ban và nhân viên | Mỗi test một database riêng. InMemory chạy `ToLower()` và `Contains` bằng .NET, giữ dấu đúng như mong muốn |
| `IDepartmentService` cho `EmployeeService` | `DepartmentService` thật trên cùng `AppDbContext` InMemory | Kiểm đúng đường gọi C4 (`ExistsAsync`), không cần thư viện giả lập |
| Lỗi database | `ThrowingAppDbContext`, ghi đè `SaveChangesAsync` để ném lỗi được truyền vào | InMemory không có khóa ngoại, không có chỉ mục, không báo tranh chấp đúng lúc |
| `PostgresException` 23503 | Dựng bằng constructor công khai của Npgsql (`sqlState: "23503"`, `constraintName: "fk_employees_department"`), bọc trong `DbUpdateException` | Giống cách của U3 |

**Giới hạn của InMemory** (nên phải kiểm tay thêm ở mục 6):
- Không thi hành `ux_employees_email` và `fk_employees_department`.
- Sắp theo mã ký tự, không theo collation của PostgreSQL. Vì vậy test sắp xếp dùng tên ASCII.
- `ToLower()` là của .NET, không phải `lower()` của PostgreSQL. Chữ "Đ" phải kiểm trên database thật.

## 5. Các ca test

### 5.1 `EmployeeServiceTests.cs`

| # | Thao tác | Ca | Kỳ vọng | Luật |
|---|---|---|---|---|
| 1 | GetAll | 3 nhân viên tên ASCII ("Binh", "an", "Cuong") + 2 người trùng tên | Sắp theo tên rồi id; mỗi phần tử có `DepartmentName` | BR2.1 |
| 2 | GetAll | Không có nhân viên | Mảng rỗng | BR2.1 |
| 3 | Search | "AN" | Ra "an" (không phân biệt hoa thường) | BR2.2 |
| 4 | Search | "congty" | Ra cả người có email chứa chuỗi | BR2.2 |
| 5 | Search | "  binh  " | Trim rồi tìm, ra "Binh" | BR2.2 |
| 6 | Search | "zzz" | Rỗng | BR2.2 |
| 7 | Search | `""`, `"   "`, `null` (Theory) | Ra tất cả | BR2.2 |
| 8 | Search | "binh" khi có "Trần Bình" | Không ra (phân biệt dấu) | BR2.2 |
| 9 | GetById | Có | DTO đúng, có tên phòng ban | BR2.3 |
| 10 | GetById | Không có | NotFound "Không tìm thấy nhân viên có mã 99." | BR2.3 |
| 11 | Create | Họ tên, email có khoảng trắng hai đầu | Lưu đã trim; email giữ chữ hoa như đã gõ | BR1.1, BR1.7 (Q1) |
| 12 | Create | Họ tên `""` / `"   "` (Theory) | Validation `fullName` "Vui lòng nhập họ tên"; không lưu | BR1.2 |
| 13 | Create | Họ tên 101 ký tự / đúng 100 ký tự kèm khoảng trắng (Theory) | 101 → "Họ tên tối đa 100 ký tự"; 100 → lưu được | BR1.3 |
| 14 | Create | Email `""` | Validation `email` "Vui lòng nhập email" | BR1.4 |
| 15 | Create | Email 255 ký tự | Validation "Email tối đa 254 ký tự" | BR1.5 |
| 16 | Create | Email hợp lệ: `a@congty.vn`, `an.nguyen@cong-ty.com.vn`, `"a@b.vn\n"` (đã trim) (Theory) | Lưu được | BR1.6 |
| 17 | Create | Email không hợp lệ: `abc`, `a@b`, `a @b.vn`, `a@b.`, `a@@b.vn`, `a@.b.vn`, `a@b..vn` (Theory) | Validation "Email không đúng định dạng" | BR1.6 |
| 18 | Create | `DepartmentId` null / 0 (Theory) | Validation `departmentId` "Vui lòng chọn phòng ban" | BR1.8 |
| 19 | Create | `DepartmentId` 999 không có | Validation `departmentId` "Phòng ban không tồn tại" | BR1.9 |
| 20 | Create | Đã có "a@congty.vn", tạo "A@CongTy.VN" | Conflict `email` "Email đã được sử dụng" | BR1.7 |
| 21 | Create | Phòng ban sai **và** email trùng | Báo 400 `departmentId` trước (thứ tự kiểm) | NFR3.6 |
| 22 | Create | `SaveChangesAsync` ném 23503 `fk_employees_department` | Validation `departmentId` "Phòng ban không tồn tại" | BR2.6 |
| 23 | Update | Đổi phòng ban | DTO có phòng ban mới, database đã đổi | BR2.4 |
| 24 | Update | Giữ email của mình / chỉ đổi hoa thường email của mình (Theory) | Lưu được | BR1.7 |
| 25 | Update | Đổi thành email (khác hoa thường) của người khác | Conflict `email` | BR1.7 |
| 26 | Update | Id không có **và** body sai | NotFound (tìm trước) | NFR3.6, BR2.3 |
| 27 | Update | `SaveChangesAsync` ném `DbUpdateConcurrencyException` | NotFound | BR2.6 |
| 28 | Update | `SaveChangesAsync` ném 23503 | Validation `departmentId` | BR2.6 |
| 29 | Delete | Có | Không còn trong database | BR2.5 |
| 30 | Delete | Id không có | NotFound | BR2.3 |
| 31 | Delete | `SaveChangesAsync` ném `DbUpdateConcurrencyException` | NotFound | BR2.6 |
| 32 | Create | `SaveChangesAsync` ném 23503 với tên ràng buộc khác | Ném lại nguyên `DbUpdateException` (để U1 xử lý) | NFR2.4 |
| 33 | Create | Họ tên có tab, U+00A0, nhiều dấu cách và chữ gõ kiểu tổ hợp (NFD) | Lưu "Nguyễn Văn An" đã gộp khoảng trắng, dạng NFC | BR1.1 |
| 34 | Create | Họ tên chứa U+0000, U+200B, U+202E, nửa cặp surrogate (một test chạy lần lượt 4 ca) | Validation `fullName` "Họ tên chứa ký tự không hợp lệ"; không lưu | BR1.1 |
| 35 | Create | Email chứa U+200B hoặc U+0000 | Validation `email` "Email chứa ký tự không hợp lệ"; không lưu (trước Step 11, U+200B lọt qua) | BR1.1 |
| 36 | Create | Email gõ kiểu tổ hợp trùng email dựng sẵn đã có | Conflict `email` | BR1.1, BR1.7 |
| 37 | GetAll | Chuỗi tìm có U+0000 hoặc U+200B, service dùng ngữ cảnh database **đã đóng** | Mảng rỗng, không lỗi: chứng minh không gửi truy vấn xuống database | BR2.2 |
| 38 | GetAll | Tìm "nguyễn&nbsp;&nbsp;văn" (2 dấu cách) và bản gõ kiểu tổ hợp | Ra "Nguyễn Văn An" | BR2.2 |
| 39 | Create | `SaveChangesAsync` ném `DbUpdateConcurrencyException` khi thêm mới | Ném lại nguyên lỗi, không báo "không tìm thấy mã 0" | BR2.6 (A-08) |
| 40 | Update | Họ tên mới chứa U+0000 | Validation `fullName`; dữ liệu cũ giữ nguyên | BR1.1 |
| 41 | Update | Email mới chứa U+200B | Validation `email` "Email chứa ký tự không hợp lệ"; email cũ giữ nguyên (rà soát R-08) | BR1.1 |

Chuỗi tìm rỗng hoặc toàn khoảng trắng thì trả đủ danh sách: ca #7 (Theory) đã kiểm, vẫn đúng sau Step 11 vì chuẩn hóa ra chuỗi rỗng (rà soát R-08 hỏi ca này).

Ca #33–#40 thêm ở Step 11 (rà soát tổng thể N-04, S-04, A-08). Trong file test, chữ có dấu và ký tự vô hình viết bằng mã `\u` để người đọc thấy rõ từng ký tự. Bộ ca đối chiếu hai bản chuẩn hóa (C# và TypeScript) dùng chung với U3: `construction/u3-departments/code-generation/unit-test-instructions.md` mục 7; U4 dùng lại đúng hàm đó nên không thêm ca.

### 5.2 `DepartmentServiceTests.cs` (thêm)

| # | Ca | Kỳ vọng | Luật |
|---|---|---|---|
| D1 | Xóa phòng ban còn nhân viên | Conflict, title "Không thể xóa phòng ban", detail chứa tên; phòng ban vẫn còn | BR2.7 |
| D2 | Bước kiểm trước và nhánh 23503 | Cùng title và cùng detail (một hàm dùng chung) | BR2.7, NFR3.5 |

Xóa phòng ban không còn nhân viên vẫn dùng test có sẵn của U3. Mỗi test theo mẫu Arrange / Act / Assert, dữ liệu nạp riêng trong từng test.

## 6. Kiểm tay (không có test tự động, theo `team.md`)

**Database** (anh làm trong pgAdmin):
- D1: migration lên, quay về `CreateDepartments`, lên lại đều thành công; phòng ban còn nguyên sau khi quay về.
- D2: bảng `employees` trống, cột snake_case, `ux_employees_email`, `ix_employees_department_id`, `fk_employees_department`.
- D3: chèn tay email trùng khác hoa thường → lỗi 23505.
- D4: `DELETE FROM departments WHERE id = <phòng có nhân viên>` → lỗi 23503.
- D5: dữ liệu đo `@perf.test` đã xóa, `count(*)` ra 0.

**API** (curl/Postman, backend chạy bằng `dotnet run --project backend/EmployeeCrud.Api --launch-profile http`): các lời gọi ở Step 6 của kế hoạch, gồm tìm `đỗ`/`ĐỖ`/`đỗ văn`/`do van`, `%25`, `_`, xóa phòng ban còn nhân viên → 409; mỗi lời gọi ≤ 1 giây, kể cả với 1.000 dòng.

**Giao diện** (backend đang chạy, mở `http://localhost:5173/employees`):
1. Chưa có ai: "Chưa có nhân viên nào" + "Thêm nhân viên đầu tiên và chọn phòng ban cho họ." + nút "Thêm nhân viên".
2. Thêm: bỏ trống → lỗi cạnh ô, khung tóm tắt nhận focus. Email `a@b` → "Email không đúng định dạng". Email đã có (khác hoa thường) → 409 hiện cạnh ô Email. Hợp lệ → về danh sách, "Đã thêm nhân viên ...". DevTools Network không báo lỗi CORS.
3. Lỗi từ API vẫn còn khi rời ô mà chưa sửa; sửa ô thì lỗi đó mới mất.
4. Bấm đúp Lưu nhanh → Network chỉ có **một** POST.
5. Ô Phòng ban: tạm thời không có phòng ban nào (hoặc tắt backend lúc mở form) → hiện dòng hướng dẫn kèm liên kết / dòng lỗi + "Thử lại", nút Lưu khóa.
6. Tìm: gõ "an" rồi Enter → địa chỉ có `?search=an`, đầu tấm ghi "Tìm thấy N nhân viên", **focus vẫn ở ô tìm**. Back → về kết quả trước và chữ trong ô đổi theo; F5 → giữ kết quả. Không khớp → "Không tìm thấy nhân viên phù hợp" + `Không có họ tên hoặc email nào chứa "...".` + "Xóa tìm kiếm"; bấm "Xóa tìm kiếm" → về danh sách đầy đủ, ô tìm rỗng và nhận focus.
7. Sửa: form điền sẵn 3 ô, phòng ban chọn sẵn; lưu → "Đã cập nhật ...". Mở `/employees/99999/edit` và `/employees/abc/edit` → "Không tìm thấy nhân viên". Từ form sửa người A, gõ địa chỉ sửa người B → form nạp lại đúng người B.
8. Xóa: hộp "Xóa nhân viên?" ghi tên in đậm, focus ở "Hủy"; Hủy hoặc Esc → không làm gì, focus về nút Xóa của dòng đó. "Xóa nhân viên" → dòng biến mất **không cần F5**, chuỗi tìm vẫn giữ, thông báo góc dưới phải, focus về tiêu đề.
9. Trang Phòng ban: xóa phòng ban còn nhân viên → lỗi `role="alert"` có tên phòng ban, dòng vẫn còn.
10. Tắt backend rồi F5 → "Không kết nối được máy chủ, vui lòng thử lại" + "Thử lại".
11. Chỉ dùng bàn phím: đi được tới mọi ô và nút; trình đọc màn hình đọc "Sửa nhân viên <tên>".
12. Lighthouse trên `npm --prefix frontend run preview` (cổng 5173), trang `/employees`: Performance ≥ 90.

**Giao diện sau Step 10** (chuẩn chung với trang phòng ban):

13. Trang danh sách: dải đầu trang trắng có "Nhân sự > Nhân viên", tiêu đề, mô tả, nút "Thêm nhân viên" bên phải; tấm "Danh sách nhân viên" có số dòng, thanh công cụ có ô tìm (icon kính lúp không đè chữ); bảng có vòng chữ cái đầu ("Đỗ Văn An" → "ĐA"), cột "Thao tác" căn phải.
14. Form: tấm "Thông tin nhân viên", hai cột trên màn rộng (Họ tên | Email, rồi Phòng ban), một cột dưới 960px; chân tấm [Hủy] [Lưu nhân viên]. Ô Phòng ban lỗi nạp: chữ lỗi và nút "Thử lại" thẳng hàng. Chưa chọn phòng ban: chữ "Chọn phòng ban" mờ như chữ mẫu; chọn rồi thì đậm. Trang sửa ghi "Cập nhật thông tin của <họ tên>."; form phòng ban: ô tên rộng bằng một cột như ô "Họ tên", trang sửa ghi "Cập nhật tên phòng ban <tên>.".
15. Họ tên 100 ký tự và email dài: bảng tự xuống dòng, nút Sửa/Xóa vẫn trong màn hình ở 1024px trở lên; ở 320px bảng cuộn ngang trong tấm, trang không cuộn ngang.
16. Kéo hẹp/rộng cửa sổ Chrome thường (taskbar ở cạnh nào cũng vậy): trang co theo chỗ còn lại, không bị che bên phải.

**Chuẩn hóa và các mục rà soát (Step 11):**

17. API: `GET /api/employees?search=%00` và `?search=%E2%80%8B` → 200 `[]` (trước Step 11, `%00` ra 500). Tìm "nguyễn&nbsp;&nbsp;thử" (2 dấu cách) vẫn ra kết quả. POST họ tên hoặc email chứa U+0000, U+200B → 400 đúng ô. Email gõ kiểu tổ hợp trùng email đã có → 409. Thân request có ký tự đặc biệt nên ghi vào file rồi gửi bằng `curl --data-binary @file`.
18. Form thêm: dán 120 ký tự vào Họ tên và hơn 254 ký tự vào Email → ô giữ nguyên, hai lời báo "tối đa…" hiện cạnh ô, không có request. Dán chữ có ký tự vô hình → "Họ tên / Email chứa ký tự không hợp lệ", không có request.
19. Tìm "&nbsp;&nbsp;Đỗ&nbsp;&nbsp;&nbsp;Văn&nbsp;" → địa chỉ `?search=Đỗ+Văn`, ô tìm hiện "Đỗ Văn". Đang tìm "Đỗ Văn" mà gõ lại "Đỗ&nbsp;&nbsp;Văn" (2 dấu cách) rồi Enter → ô tìm vẫn về "Đỗ Văn", focus ở ô (rà soát R-07).
20. Từ kết quả tìm bấm Sửa, rồi Hủy → về `/employees?search=…` đúng chuỗi đang tìm; bấm Sửa rồi Lưu → cũng về đó, có thông báo "Đã cập nhật…". Mở thẳng địa chỉ sửa (gõ tay hoặc F5) rồi Hủy → về `/employees` (N-07).
21. Hộp xóa ghi họ tên in đậm kèm email trong ngoặc, ví dụ "Nhân viên **Đỗ Văn An** (`do.an@congty.vn`) sẽ bị xóa vĩnh viễn…" (N-05).

## Change Request 03/11/2026 (FR8): test mới và kiểm tay

**Unit test** (`dotnet test`, 138 test):
| # | Test | Kiểm |
|---|---|---|
| D4 | GetAll_ReturnsEmployeeCountPerDepartment | employeeCount 2 và 0 |
| D5 | GetById_ReturnsEmployeeCount | một phòng có số |
| D6 | CreateAndUpdate_ReturnEmployeeCount | POST 0, PUT đếm sau lưu |
| D7 | Delete_WhenTwoEmployees_MessageHasCount | 409 "còn 2 nhân viên", phòng còn |
| D8 | Delete_WhenForeignKeyBlocksAfterRecount_ReportsCountNow | chen nhau, đếm lại ra 2 |
| D9 | Delete_WhenForeignKeyBlocksButRecountIsZero_ReportsOne | đếm lại 0 → vẫn báo 1 |
| #42 | GetAll_WithDepartmentId_ReturnsOnlyThatDepartment | chỉ người của phòng |
| #43 | GetAll_WithDepartmentIdAndSearch_AppliesBoth | AND với search |
| #44 | GetAll_WithEmptyDepartmentId_ReturnsEveryone | null, "", khoảng trắng → không lọc |
| #45–#48 | GetAll_WithInvalidDepartmentId_ThrowsValidation | "abc", "0", "-1", "99999999999", " 5", "+5", "1.5" → 400 |
| #49 | GetAll_WithUnknownDepartmentId_ReturnsEmptyList | không có phòng → [] |
| #50 | GetAll_WithInvalidDepartmentIdAndInvalidSearch_ThrowsValidationFirst | thứ tự kiểm |

**Kiểm tay** (trình duyệt): K-PB1 trang Phòng ban có cột số, bấm tên → chi tiết; K-PB2 phòng còn người bấm Xóa → hộp "còn N nhân viên", chỉ có Đóng và "Xem N nhân viên"; K-PB3 phòng 0 người xóa được từ chi tiết; K-NV1 ô lọc + tìm, F5 giữ; K-NV2 mở `/employees?departmentId=987654` → câu báo, hiện tất cả; K-NV3 "Thêm nhân viên" từ trang chi tiết chọn sẵn phòng, Lưu quay về chi tiết.
