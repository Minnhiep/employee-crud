# Quy trình build và giao: u3-departments

> **Nguồn:** `team.md` (Way of Working, Testing Posture, Deployment, Code Style), `project.md` Forbidden (không CI/CD, không tự push), quy trình của U1 và U2, lệnh kiểm đã duyệt `npm --prefix frontend run verify`, `nfr-design/reliability-design.md` §4–§6, `nfr-design/security-design.md` §5.
>
> **Không có CI/CD.** Hiệp chạy các bước dưới đây bằng tay trên máy, trước mỗi commit. U3 dùng lại quy trình của U1 và U2, chỉ thêm ba việc: chạy migration, đọc độ phủ và kiểm trên database thật.

## 1. Các bước trước khi commit U3

Chạy ở thư mục gốc `employee-crud/`, theo thứ tự. Bước nào lỗi thì dừng lại, sửa, rồi chạy lại từ bước đó.

1. **Công cụ:** `dotnet tool restore` (lần này cài thêm reportgenerator vừa có trong manifest).
2. **Kiểm tổng hợp:** `npm --prefix frontend run verify`. Lệnh này chạy lần lượt typecheck, lint, format:check, build frontend, rồi `dotnet test` backend. Đạt khi không bước nào lỗi.
3. **Định dạng backend:** `dotnet format backend/EmployeeCrud.slnx --verify-no-changes`.
4. **Độ phủ (NFR4.2):**
   - Chạy `dotnet test` có `--collect:"XPlat Code Coverage"` vào thư mục kết quả cố định trong `backend/TestResults/`.
   - Chạy `dotnet reportgenerator` để in `TextSummary`.
   - Đạt khi dòng `DepartmentService` ≥ 80%.
   - Lệnh chính xác ghi trong kế hoạch Code Generation và README.
5. **Database (Hiệp tự chạy, AI không gõ mật khẩu):**
   1. Trong pgAdmin, chạy `SELECT lower('KẾ TOÁN') = lower('Kế toán');`, phải ra `true`.
   2. Chạy `dotnet ef database update --project backend/EmployeeCrud.Api`.
   3. Thử quay lui `dotnet ef database update 0`, rồi chạy lại `dotnet ef database update` (NFR1.1).
6. **Kiểm thật:**
   - Postman: đủ 5 thao tác của C1 cùng các mã 400, 404, 409.
   - pgAdmin: bảng, chỉ mục và 4 dòng mẫu; câu chèn tay "KẾ TOÁN" bị từ chối.
   - Trình duyệt: danh sách, thêm, sửa, xóa; CORS thật từ 5173; bấm đúp Lưu chỉ gửi một request; xóa xong dòng biến mất mà không cần F5; tắt backend thì hiện thông báo lỗi kết nối.
7. **Quét bí mật:** `git grep --untracked -i -n -E "(password|pwd)\s*=" -- backend frontend` phải ra 0 dòng.
8. **Xem thay đổi:** chạy `git status` và `git diff`. Migration `CreateDepartments` phải nằm trong lần commit; `TestResults/` và `coverage-report/` không được lọt vào.
9. **Commit:** Hiệp tự commit lên `main`, ví dụ `Thêm quản lý phòng ban: API, migration, giao diện`.

## 2. Bảng bước → điều kiện qua

| Bước | Điều kiện qua | Nếu không qua |
|---|---|---|
| `verify` | Mọi bước 0 lỗi, 0 cảnh báo lint, mọi test xanh | Sửa code hoặc test |
| Độ phủ | `DepartmentService` ≥ 80% dòng | Thêm test; không hạ ngưỡng |
| Migration | Lên, quay lui, lên lại đều thành công | Sửa migration **trước khi commit** (sau khi commit thì không sửa nữa, NFR1.3) |
| Kiểm `lower()` | `true` | Dừng lại, hỏi Hiệp trước khi đi tiếp |
| Quét bí mật | 0 dòng | Gỡ bí mật, dùng user-secrets |

## 3. Triển khai và quay lui

- "Triển khai" vẫn là chạy trên máy theo README (U1). U3 chỉ thêm bước `dotnet ef database update`, để có bảng `departments`.

| Tình huống | Cách quay lui |
|---|---|
| Commit U3 làm hỏng code | `git revert <commit>` |
| Migration `CreateDepartments` làm hỏng database | `dotnet ef database update 0` (xóa chỉ mục rồi bảng), sửa migration, chạy lại. Chỉ làm được khi migration **chưa commit**; sau đó thì thêm migration mới |

## 4. Bí mật

U3 không thêm bí mật. Migration dùng chuỗi kết nối Hiệp đã đặt trong user-secrets ở U1. Không có hệ thống CI, nên không cần cơ chế giữ bí mật cho CI.

## 5. Đẩy lên GitHub

Không thuộc việc của AI-DLC. Hiệp tự đẩy khi xong bài.
