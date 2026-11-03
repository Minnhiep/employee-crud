# Hướng dẫn test: u3-departments

## 1. Bộ test và cấu hình

- Project `backend/EmployeeCrud.Api.Tests` (xUnit 2.9, `coverlet.collector`) đã có từ U1. U3 thêm gói `Microsoft.EntityFrameworkCore.InMemory` (`10.*`, cùng cách ghi phiên bản với EF Core của API).
- Test của U3 nằm trong namespace `EmployeeCrud.Api.Tests.Departments` (thư mục `backend/EmployeeCrud.Api.Tests/Departments/`).
- Không có test tự động cho controller và React (`team.md`). Hai tầng đó kiểm tay ở mục 6.

## 2. Lệnh chạy test của riêng U3

Chạy ở thư mục gốc `employee-crud/`:

```bash
dotnet test backend/EmployeeCrud.slnx --filter "FullyQualifiedName~EmployeeCrud.Api.Tests.Departments"
```

Lệnh này chạy được ngay từ Step 2, khi chưa có test nào khớp. Đạt khi mọi test khớp đều xanh.

## 3. Mức độ phủ

- **Mục tiêu của U3:** `DepartmentService` ≥ 80% số dòng (NFR4.2, `team.md`). Đây là lệnh riêng, Build and Test chạy lại trên toàn bộ test:

```bash
npm --prefix frontend run coverage
```

Lệnh này xóa thư mục kết quả cũ `backend/TestResults/coverage`, chạy toàn bộ test có thu độ phủ, rồi chạy reportgenerator (tool cục bộ) để in bảng % theo lớp. Đọc dòng `EmployeeCrud.Api.Departments.DepartmentService`. Trang HTML chi tiết nằm ở `backend/TestResults/coverage-report/index.html`, cho biết dòng nào chưa được test.

- Mức sàn 80% của các lớp service là của cả dự án. Build and Test kiểm nó trên toàn bộ test khi U4 xong. Không được hạ ngưỡng để cho qua.

## 4. Giả lập database

| Cái gì | Dùng | Vì sao |
|---|---|---|
| Database cho service | `AppDbContext` với `UseInMemoryDatabase(Guid.NewGuid().ToString())`, tạo trong `TestDb.cs` | Mỗi test một database riêng nên không dính dữ liệu. InMemory chạy `ToLower()` bằng .NET, đúng với chữ có dấu |
| Lỗi database | `ThrowingAppDbContext : AppDbContext`, ghi đè `SaveChangesAsync` để ném lỗi được truyền vào | InMemory không có khóa ngoại, không báo lỗi tranh chấp đúng lúc cần |
| `PostgresException` 23503 | Dựng bằng constructor công khai của Npgsql (`sqlState: "23503"`, `constraintName: "fk_employees_department"`), bọc trong `DbUpdateException` | Giống cách `ErrorMapperTests` của U1 |

**Giới hạn của InMemory** (nên phải kiểm tay thêm ở mục 6):
- Không thi hành chỉ mục `ux_departments_name`.
- Sắp xếp theo mã ký tự, không theo collation của PostgreSQL.
- `ToLower()` là của .NET, không phải `lower()` của PostgreSQL.

## 5. Các ca test của `DepartmentService` (`DepartmentServiceTests.cs`)

| # | Thao tác | Ca | Kỳ vọng | Luật |
|---|---|---|---|---|
| 1 | GetAll | Có 3 phòng ban tên ASCII ("Beta", "alpha", "Gamma") | Trả đúng 3, sắp theo tên | BR2.1 |
| 2 | GetAll | Không có phòng ban | Mảng rỗng | BR2.1 |
| 3 | GetById | Có | Trả DTO đúng id, tên | BR2.2 |
| 4 | GetById | Không có | `DomainError` NotFound "Không tìm thấy phòng ban có mã 99." | BR2.2 |
| 5 | Create | `"  Marketing  "` | Lưu `"Marketing"`, trả DTO có id | BR1.1 |
| 6 | Create | `""` và `"   "` (Theory) | Validation `name` "Vui lòng nhập tên phòng ban"; không lưu | BR1.2 |
| 7 | Create | 101 ký tự | Validation "Tên phòng ban tối đa 100 ký tự" | BR1.3 |
| 8 | Create | 100 ký tự kèm khoảng trắng hai đầu | Lưu được (biên) | BR1.1, BR1.3 |
| 9 | Create | Đã có "Kế toán", tạo "KẾ TOÁN" | Conflict `name` "Tên phòng ban đã tồn tại" | BR1.4 |
| 10 | Update | Đổi tên | Trả DTO tên mới, database đã đổi | BR2.3 |
| 11 | Update | Giữ nguyên tên, hoặc chỉ đổi hoa thường của chính nó | Lưu được | BR1.4 |
| 12 | Update | Đổi thành tên (khác hoa thường) của phòng ban khác | Conflict `name` | BR1.4 |
| 13 | Update | Id không có | NotFound | BR2.2 |
| 14 | Update | Tên rỗng | Validation | BR1.2 |
| 15 | Update | `SaveChangesAsync` ném `DbUpdateConcurrencyException` | NotFound | NFR3.3 |
| 16 | Delete | Có | Không còn trong database | BR2.4 |
| 17 | Delete | Id không có | NotFound | BR2.2 |
| 18 | Delete | `SaveChangesAsync` ném 23503 `fk_employees_department` | Conflict, title "Không thể xóa phòng ban", detail chứa tên phòng ban | BR2.5 |
| 19 | Delete | `SaveChangesAsync` ném `DbUpdateConcurrencyException` | NotFound | NFR3.3 |
| 20 | Delete | `SaveChangesAsync` ném 23503 với tên ràng buộc khác | Ném lại nguyên `DbUpdateException` (để U1 xử lý) | NFR2.4 |
| 21 | Exists | Có / không có (Theory) | true / false | BR2.6 |

Mỗi test theo mẫu Arrange / Act / Assert. Dữ liệu được nạp riêng trong từng test, không dùng dữ liệu chung.

## 6. Kiểm tay (không có test tự động, theo `team.md`)

**Database** (anh làm trong pgAdmin):
- D1: `SELECT lower('KẾ TOÁN') = lower('Kế toán');` → `true` (làm trước khi viết migration).
- D2: migration lên, xuống (`update 0`), lên lại đều thành công.
- D3: thấy bảng, cột snake_case, chỉ mục `ux_departments_name` và 4 dòng mẫu.
- D4: `INSERT INTO departments (name) VALUES ('KẾ TOÁN');` → lỗi 23505.

**API** (curl/Postman, backend chạy bằng `dotnet run --project backend/EmployeeCrud.Api --launch-profile http`): các lời gọi ở Step 6 của kế hoạch, mỗi lời gọi ≤ 1 giây.

**Giao diện** (backend đang chạy, mở `http://localhost:5173/departments`):
1. Dải đầu trang: đường dẫn "Nhân sự > Phòng ban", tiêu đề, mô tả, nút "Thêm phòng ban". Tấm "Danh sách phòng ban" ghi "4 phòng ban"; bảng đúng thứ tự Kế toán, Kinh doanh, Kỹ thuật, Nhân sự; cột "Thao tác" căn phải với nút "Sửa", "Xóa" nhỏ có icon. (Cập nhật theo Step 10.)
2. Thêm: bỏ trống → lỗi cạnh ô và khung tóm tắt nhận focus. Nhập "kế toán" → 409 hiện cạnh ô. Nhập tên mới → về danh sách, hiện "Đã thêm phòng ban ...". Trong DevTools, tab Network không báo lỗi CORS.
3. Bấm đúp Lưu nhanh → Network chỉ có **một** POST.
4. Sửa: form điền sẵn tên; lưu → hiện "Đã cập nhật ...". Mở `/departments/99999/edit` → báo "Không tìm thấy phòng ban".
5. Xóa: hộp xác nhận "Xóa phòng ban?" ghi tên phòng ban, focus ở nút "Hủy"; Tab chỉ đi trong hộp; Esc hoặc "Hủy" → không làm gì, focus về nút Xóa đã mở hộp. "Xóa phòng ban" → dòng biến mất **không cần F5**, thông báo hiện góc dưới phải, focus về tiêu đề; bấm "Đóng thông báo" thì focus về vùng nội dung chính (không rơi về đầu trang). (Cập nhật theo Step 10: hộp thoại thay `window.confirm`.)
5b. Form thêm/sửa: dải đầu trang "Nhân sự > Phòng ban > Thêm mới / Sửa"; form trong tấm "Thông tin phòng ban" rộng tối đa 880px; chân tấm "Hủy" rồi "Lưu phòng ban"; lỗi cạnh ô có icon, khung tóm tắt có icon, bấm một lỗi trong khung thì focus vào ô.
6. Tắt backend rồi F5 → hiện "Không kết nối được máy chủ, vui lòng thử lại" + "Thử lại". Bật lại backend và bấm "Thử lại" → có dữ liệu.
7. Chỉ dùng bàn phím: đi được tới mọi nút; trình đọc màn hình đọc nhãn "Sửa phòng ban Kế toán".
8. Lighthouse trên `npm --prefix frontend run preview` (cổng 5173): Performance ≥ 90.
