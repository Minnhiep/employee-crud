# Quy trình build và giao: u1-backend-platform

> **Nguồn:** `team.md` (Way of Working Q1–Q3, Testing Posture Q5–Q6, Deployment Q8, Code Style Q9), `project.md` Forbidden (không CI/CD, không Docker, không tự push), `nfr-design/security-design.md` §1, `nfr-design/reliability-design.md` §2.
>
> **Không có CI/CD** (`project.md` Forbidden, `docs/ke-hoach.md` mục 3). Mọi bước dưới đây Hiệp chạy bằng tay trên máy, trước mỗi commit. Đây là "đường ống" thay cho CI.

## 1. Các bước trước mỗi commit (Hiệp tự chạy)

Chạy ở thư mục gốc repo `employee-crud/`, theo thứ tự. Bước nào lỗi thì dừng, sửa rồi chạy lại từ đầu.

1. **Khôi phục công cụ:** `dotnet tool restore` (lần đầu, hoặc khi tool manifest đổi).
2. **Build:** `dotnet build backend/EmployeeCrud.sln`. Đạt khi không có lỗi.
3. **Định dạng:** `dotnet format backend/EmployeeCrud.sln --verify-no-changes`. Nếu báo khác, chạy `dotnet format backend/EmployeeCrud.sln` rồi xem lại thay đổi.
4. **Test và độ phủ:** `dotnet test backend/EmployeeCrud.sln --collect:"XPlat Code Coverage"`. Đạt khi mọi test xanh. Độ phủ dòng của các lớp service ≥ 80% (từ U3 trở đi; U1 chưa có service nghiệp vụ, nên U1 chỉ cần test bộ đổi lỗi và ba test CORS xanh).
5. **Quét bí mật:** `git grep -i -n "password=" -- backend frontend`. Đạt khi không ra dòng nào (NFR2.2).
6. **Xem thay đổi:** `git status` và `git diff`. Kiểm không có `bin/`, `obj/`, `TestResults/` lọt vào.
7. **Commit:** Hiệp tự commit lên `main`, lời ghi chú tiếng Việt ngắn, ví dụ `Dựng nền backend: lỗi chung, CORS, kết nối database`.

Từ U2 trở đi thêm cho frontend: `npm run lint` và `npm run build` trong `frontend/`.

## 2. Bảng bước → điều kiện qua

| Bước | Điều kiện qua | Nếu không qua |
|---|---|---|
| Build | 0 lỗi | Sửa code, chạy lại |
| Format | Không có thay đổi | Chạy `dotnet format`, xem lại diff |
| Test | 100% test xanh; độ phủ service ≥ 80% (từ U3) | Sửa code hoặc test; không hạ mức sàn |
| Quét bí mật | 0 dòng | Gỡ bí mật khỏi file, chuyển sang user-secrets |
| Xem diff | Chỉ có file mong đợi | Bỏ file thừa khỏi lần commit |

## 3. "Triển khai" trên máy

Không có môi trường staging hay production. "Triển khai" là chạy được trên máy theo README:

1. PostgreSQL 18 đang chạy (dịch vụ `postgresql-x64-18`).
2. **Hiệp tự** tạo `employee_db` và đặt chuỗi kết nối bằng `dotnet user-secrets set "ConnectionStrings:Default" "..."` theo hướng dẫn W4. AI chỉ viết hướng dẫn, không gõ mật khẩu.
3. `dotnet ef database update --project backend/EmployeeCrud.Api`.
4. `dotnet run --project backend/EmployeeCrud.Api`.
5. Từ U2: `npm install` rồi `npm run dev` trong `frontend/`.

Coi là xong khi đủ bốn điều của `team.md` Deployment. Với riêng U1: backend khởi động được, trang OpenAPI mở được, và `dotnet ef database update` khi chưa có migration nối được database (W4).

## 4. Quay lui khi hỏng

| Tình huống | Cách quay lui |
|---|---|
| Commit làm hỏng code | `git revert <commit>` (không sửa lịch sử) |
| Migration làm hỏng database | `dotnet ef database update <migration trước đó>` |
| Chuỗi kết nối sai | `dotnet user-secrets set ...` lại với giá trị đúng |

## 5. Bí mật trong quy trình

- Chuỗi kết nối chỉ nằm trong user-secrets trên máy Hiệp; không có trong repo, không có trong file cấu hình nào được commit.
- `.gitignore` loại `bin/`, `obj/`, `*.user`, `.vs/`, `.env`, `node_modules/`, `dist/`, `TestResults/`, `coverage*/`.
- Không có hệ thống CI để giữ bí mật, nên không cần cơ chế bí mật cho CI.

## 6. Đẩy lên GitHub

Ngoài phạm vi của AI-DLC. Khi xong bài, Hiệp tự đẩy từng bước (`project.md` Forbidden: AI không push).
