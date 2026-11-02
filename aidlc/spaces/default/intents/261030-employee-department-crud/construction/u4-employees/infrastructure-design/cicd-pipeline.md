# Quy trình build và giao: u4-employees

> **Nguồn:** `team.md` (Way of Working, Testing Posture, Deployment, Code Style), `project.md` Forbidden (không CI/CD, không tự push), quy trình của U1–U3, lệnh kiểm đã duyệt `npm --prefix frontend run verify`, `nfr-design/reliability-design.md` §4–§6, `nfr-design/security-design.md` §2, §5, §6, `nfr-design/performance-design.md` §3, §4.
>
> **Không có CI/CD.** Hiệp chạy các bước dưới đây bằng tay trên máy, trước mỗi commit. U4 dùng lại quy trình của U3, chỉ đổi phần migration, kiểm trên database thật và đo với 1.000 dòng.

## 1. Các bước trước khi commit U4

Chạy ở thư mục gốc `employee-crud/`, theo thứ tự. Bước nào lỗi thì dừng lại, sửa, rồi chạy lại từ bước đó.

1. **Công cụ:** `dotnet tool restore` (không có tool mới, chỉ để chắc máy đủ).
2. **Kiểm tổng hợp:** `npm --prefix frontend run verify`. Lệnh này chạy lần lượt typecheck, lint, format:check, build frontend, rồi `dotnet test` backend (cả test phòng ban lẫn nhân viên). Đạt khi không bước nào lỗi.
3. **Định dạng backend:** `dotnet format backend/EmployeeCrud.slnx --verify-no-changes`.
4. **Độ phủ (NFR4.3):** `npm --prefix frontend run coverage`. Đạt khi dòng `EmployeeService` ≥ 80% và `DepartmentService` vẫn ≥ 80%.
5. **Database (Hiệp tự chạy, AI không gõ mật khẩu):**
   1. `dotnet ef database update --project backend/EmployeeCrud.Api` → bảng `employees` xuất hiện; `GET /api/employees` trả `[]` (NFR1.2).
   2. Quay lui: `dotnet ef database update CreateDepartments --project backend/EmployeeCrud.Api` → bảng `employees` biến mất, `departments` và dữ liệu phòng ban còn nguyên (NFR1.1, NFR1.3).
   3. Chạy lại `dotnet ef database update --project backend/EmployeeCrud.Api`.
6. **Kiểm trên PostgreSQL thật (NFR4.4):**
   1. Thêm "Đỗ Văn An" (`do.an@congty.vn`), tìm `đỗ`, `ĐỖ`, `đỗ văn` → đều ra; `do van` → không ra. Nếu "Đ" không hạ được thì **dừng lại hỏi Hiệp** trước khi chuyển sang phương án dự phòng `EF.Functions.ILike`.
   2. pgAdmin: chèn tay "A@CongTy.vn" khi đã có "a@congty.vn" → lỗi 23505.
   3. pgAdmin: `DELETE FROM departments WHERE id = <phòng có nhân viên>` → lỗi 23503; Postman `DELETE /api/departments/{id}` → 409 kèm tên phòng ban.
   4. Postman `?search=%25` và `?search=_` → rỗng.
   5. Bật log SQL (monitoring-design, Logs & Tracing), xem câu `SELECT ... JOIN departments` và cách EF dịch `Contains`, ghi vào `code-summary.md`, rồi đổi log về `Warning`.
7. **Đo hiệu năng (NFR5.1, NFR5.2):** chèn 1.000 nhân viên tạm `@perf.test` bằng câu SQL ở performance-design §3; đo `GET /api/employees` và `?search=` trong Postman (3 lần mỗi lời gọi, ≤ 1 giây); xóa dữ liệu tạm và kiểm `count(*)` ra 0.
8. **Kiểm thật giao diện và API:**
   - Postman: đủ 5 thao tác của C2 cùng các mã 400, 404, 409; PUT id không tồn tại + body sai → 404.
   - Trình duyệt: danh sách, tìm (Back/F5 giữ chuỗi tìm), thêm, sửa, xóa; CORS thật cho POST, PUT, DELETE từ `http://localhost:5173`; lỗi 400/409 hiện trên form; form báo kèm link khi chưa có phòng ban; tắt backend thì hiện thông báo lỗi kết nối.
   - Lighthouse trang `/employees` trên `npm run preview` ≥ 90 (NFR5.5).
9. **Quét bí mật (NFR2.1):** `git grep --untracked -i -n -E "(password|pwd)\s*=|\"password\"\s*:" -- backend frontend` phải ra 0 dòng.
10. **Xem thay đổi:** `git status` và `git diff`. Migration `CreateEmployees` và việc dời `TestSupport/` (hiện là đổi tên, không phải xóa rồi thêm) phải nằm trong lần commit; `TestResults/` và `coverage-report/` không được lọt vào.
11. **Commit:** Hiệp tự commit lên `main`, ví dụ `Thêm quản lý nhân viên: API, migration, giao diện`, rồi commit riêng tài liệu AI-DLC.

## 2. Bảng bước → điều kiện qua

| Bước | Điều kiện qua | Nếu không qua |
|---|---|---|
| `verify` | Mọi bước 0 lỗi, 0 cảnh báo lint, mọi test xanh | Sửa code hoặc test |
| Độ phủ | `EmployeeService` và `DepartmentService` mỗi lớp ≥ 80% dòng | Thêm test; không hạ ngưỡng |
| Migration | Lên, quay về `CreateDepartments`, lên lại đều thành công | Sửa migration **trước khi commit** (sau khi commit thì không sửa nữa, thêm migration mới) |
| Kiểm Đỗ/ĐỖ | Tìm ra đúng như mục 6.1 | Dừng lại, hỏi Hiệp trước khi đổi cách tìm |
| Đo 1.000 dòng | ≤ 1 giây mỗi lời gọi; dữ liệu tạm còn 0 dòng | Xem lại câu SQL (log); xóa sạch dữ liệu tạm |
| Quét bí mật | 0 dòng | Gỡ bí mật, dùng user-secrets |

## 3. Triển khai và quay lui

- "Triển khai" vẫn là chạy trên máy theo README (U1). U4 chỉ thêm bước `dotnet ef database update` để có bảng `employees`; README thêm mục API nhân viên.

| Tình huống | Cách quay lui |
|---|---|
| Commit U4 làm hỏng code | Lùi database trước (`dotnet ef database update CreateDepartments`), rồi `git revert <commit>` |
| Migration `CreateEmployees` làm hỏng database | `dotnet ef database update CreateDepartments` (xóa chỉ mục email, rồi bảng), sửa migration, chạy lại. Chỉ làm được khi migration **chưa commit**; sau đó thì thêm migration mới |
| Sửa `DepartmentService.DeleteAsync` làm hỏng trang phòng ban | Chạy lại `DepartmentServiceTests`; nếu đã commit thì `git revert` |

## 4. Bí mật

U4 không thêm bí mật. Migration dùng chuỗi kết nối Hiệp đã đặt trong user-secrets ở U1. Không có hệ thống CI, nên không cần cơ chế giữ bí mật cho CI.

## 5. Đẩy lên GitHub

Không thuộc việc của AI-DLC. Hiệp tự đẩy khi xong bài.
