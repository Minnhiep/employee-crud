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
| 22 | Create | Tên có nhiều dấu cách, tab, khoảng trắng không ngắt (U+00A0) ở giữa và hai đầu | Lưu "Kinh doanh miền Bắc" (một dấu cách giữa các chữ) | BR1.1 |
| 23 | Create | Đã có "Kế toán", tạo "Kế&nbsp;&nbsp;toán" (2 dấu cách) | Conflict `name`; database vẫn một dòng | BR1.1, BR1.4 |
| 24 | Create | "Kế toán" gõ kiểu tổ hợp (NFD), sau đó tạo bản dựng sẵn (NFC) | Lần đầu lưu dạng NFC; lần sau Conflict | BR1.1, BR1.4 |
| 25 | Create | U+0000, ESC, U+200B, U+202E, U+FEFF, nửa cao U+D800, nửa thấp U+DC00 (một test chạy lần lượt cả 7) | Validation `name` "Tên phòng ban chứa ký tự không hợp lệ"; không lưu gì | BR1.1 |
| 26 | Create | Có emoji đủ hai nửa surrogate | Lưu nguyên | BR1.1 |
| 27 | Update | Tên mới chứa U+0000 | Validation "chứa ký tự không hợp lệ"; tên cũ giữ nguyên | BR1.1 |

Ca #22–#27 thêm ở Step 11 (rà soát tổng thể N-04, S-04). Trong file test, chữ có dấu và ký tự vô hình viết bằng mã `\u` để người đọc thấy rõ từng ký tự. Ca #25 không dùng `[InlineData]` vì nửa cặp surrogate không ghi được vào thuộc tính của test.

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

**Chuẩn hóa tên và dọn code (Step 11, rà soát tổng thể):**
9. API: POST tên chứa U+0000, U+200B hoặc U+202E → 400 `errors.name` "Tên phòng ban chứa ký tự không hợp lệ" (trước Step 11, U+0000 ra 500). POST "Kế&nbsp;&nbsp;toán" hoặc "Kế toán" gõ kiểu tổ hợp → 409. POST tên hợp lệ có khoảng trắng thừa → 201, tên trả về đã gộp khoảng trắng. Nửa cặp surrogate bị tầng đọc JSON của ASP.NET chặn trước (400 "Dữ liệu gửi lên không đúng định dạng JSON"), kiểm trong service là lớp dự phòng. Thân request có ký tự đặc biệt nên ghi vào file rồi gửi bằng `curl --data-binary @file`.
10. Form thêm: dán 120 ký tự → ô giữ đủ 120, lời báo "tối đa 100 ký tự" hiện cạnh ô, không có request. Dán tên có ký tự vô hình → "chứa ký tự không hợp lệ", không có request. Nhập "&nbsp;&nbsp;Kế&nbsp;&nbsp;&nbsp;toán&nbsp;" → request gửi `{"name":"Kế toán"}`, 409 hiện cạnh ô.
11. Đang sửa "Kế toán" (gõ dở) mà chuyển sang địa chỉ sửa "Kinh doanh" ngay trong ứng dụng → form tạo mới, ô tên là "Kinh doanh" (A-13).
12. Danh sách: chặn API → trạng thái lỗi có "Thử lại"; bỏ chặn, bấm "Thử lại" → có dữ liệu; xóa → dòng biến mất, focus về tiêu đề (A-05: kiểu tải mới, hành vi như cũ).

## 7. Bộ ca đối chiếu hai bản chuẩn hóa (dùng chung U3, U4)

Luật chuẩn hóa có hai bản: `TextInput.TryNormalize` (C#, có unit test #22–#27) và `normalizeText` (TypeScript, không có test tự động theo `team.md`). Hai bản phải luôn cho cùng kết quả, nên mỗi lần sửa một bên thì chạy lại **cả 14 ca** dưới đây ở **cả hai bên** (rà soát R-05). U4 thêm ca của họ tên, email vào cuối bảng.

Cách chạy bên TypeScript: Node 24 chạy thẳng được file `.ts` (không cần build), ví dụ viết một file `.mts` tạm ngoài dự án, `import { normalizeText } from "<đường dẫn>/frontend/src/utils/normalizeText.ts"`, gọi hàm với từng ca rồi so kết quả. Bên C#: các ca 1–11 đã nằm trong `DepartmentServiceTests` #22–#26.

| # | Chuỗi vào (ký tự đặc biệt ghi dạng U+XXXX) | Kết quả mong đợi |
|---|---|---|
| 1 | dấu cách, "Kinh", dấu cách, tab, dấu cách, "doanh", U+00A0, 2 dấu cách, "miền", 3 dấu cách, "Bắc", dấu cách | "Kinh doanh miền Bắc" |
| 2 | "Kế", 2 dấu cách, "toán" | "Kế toán" |
| 3 | "Kế toán" gõ kiểu tổ hợp: K, e, U+0302, U+0301, dấu cách, t, o, a, U+0301, n | "Kế toán" dạng dựng sẵn (ế = U+1EBF, á = U+00E1) |
| 4 | U+0000 | không hợp lệ |
| 5 | "Kế", U+001B (ESC), "toán" | không hợp lệ |
| 6 | "Kế", U+200B, "toán" | không hợp lệ |
| 7 | U+202E, "toán" | không hợp lệ |
| 8 | U+FEFF, "Kế toán" | không hợp lệ |
| 9 | "Kế", U+D800 (nửa cao đứng một mình), "toán" | không hợp lệ |
| 10 | "Kế", U+DC00 (nửa thấp đứng một mình), "toán" | không hợp lệ |
| 11 | "Phòng IT ", U+1F680 (emoji đủ hai nửa) | giữ nguyên |
| 12 | "a", U+0085, "b" | "a b" (U+0085 là khoảng trắng theo .NET) |
| 13 | chuỗi rỗng | chuỗi rỗng |
| 14 | dấu cách, tab, U+3000, dấu cách | chuỗi rỗng |

Kết quả ngày 03/11/2026: 14/14 ca hai bên khớp.

## Change Request 03/11/2026 (FR8): kiểm tay gợi ý tên

- K-tên 1: mở /departments/new và /departments/{id}/edit → dưới ô tên có "Viết hoa chữ cái đầu, ví dụ: Kế toán, Nhân sự, IT."; trình đọc màn hình đọc gợi ý khi vào ô.
- K-tên 2: nhập "kế TOÁN mới", Lưu → phòng ban lưu đúng như gõ, không báo lỗi. Xóa phòng thử sau khi kiểm.
- Không thêm unit test: không đổi service (team.md chỉ test service).
- K-tên 3: để trống ô rồi Lưu → hiện lời báo lỗi, gợi ý tạm ẩn khỏi mắt nhìn (vẫn đọc được bằng trình đọc màn hình); sửa xong lỗi thì gợi ý hiện lại.
