# Hướng dẫn kiểm — U5 `u5-handover`

## Khung kiểm và cấu hình

U5 chỉ làm tài liệu, không có code (BR4.1), nên **không có file unit test và không đổi cấu hình test** (xUnit, coverlet giữ nguyên như U1–U4). "Test" của U5 là 6 lệnh PowerShell kiểm cấu trúc và độ an toàn của ba tài liệu, cùng các bước kiểm tay. Mọi lệnh chỉ đụng tới đúng ba file của U5, chạy từ thư mục gốc repo `employee-crud`.

## Lệnh kiểm của unit này

Chạy từng lệnh một, trong PowerShell, ở thư mục gốc repo.

| # | Kiểm gì | Lệnh | Đạt khi |
|---|---|---|---|
| T1 | Đủ 10 thao tác API (BR3.1, AC5.2.1) | `(Select-String -Path docs/danh-sach-api.md -Pattern '^### (GET\|POST\|PUT\|DELETE) /api/').Count` | In ra `10` |
| T2 | Có ví dụ lỗi 400, 404, 409 dạng problem+json (BR3.4, AC5.2.3) | `Select-String -Path docs/danh-sach-api.md -Pattern '^#### Lỗi (400\|404\|409)'` và `(Select-String -Path docs/danh-sach-api.md -Pattern 'application/problem\+json').Count` | Lệnh đầu ra đủ 3 dòng (400, 404, 409); lệnh sau in ra số ≥ 3 |
| T3 | Sơ đồ có đủ hai bảng (BR2.1, AC5.3.1) | `Select-String -Path docs/so-do-database.md -Pattern 'erDiagram','^\s+departments \{','^\s+employees \{'` | Ra đủ 3 dòng khớp |
| T4 | README đủ các mục FR7.4 (BR1.1, AC5.1.1) | `Select-String -Path README.md -Pattern '^## '` | Có đủ các mục: phần mềm cần có, lấy mã nguồn, đặt connection string, khôi phục công cụ, tạo database, chạy backend, chạy frontend, địa chỉ, kiểm nhanh, chạy test, sự cố thường gặp, tài liệu khác |
| T5 | Liên kết từ README sang hai tài liệu (entities `relatedDocs`) | `Select-String -Path README.md -Pattern 'docs/so-do-database.md','docs/danh-sach-api.md'` | Ra ít nhất 2 dòng khớp, mỗi file một dòng |
| T6 | Không có mật khẩu trong ba tài liệu (BR1.3, NFR2.1) | `Select-String -Path README.md,docs/so-do-database.md,docs/danh-sach-api.md -Pattern 'Password=' -CaseSensitive:$false` | Mọi dòng khớp chỉ chứa biến `$p` (mật khẩu nhập lúc chạy), mẫu che `***` hoặc chữ giữ chỗ; không có giá trị mật khẩu thật |

Quy ước tên mục để T1, T2 khớp: mỗi thao tác là một tiêu đề `### <PHƯƠNG THỨC> <đường dẫn>` (ví dụ `### GET /api/departments`); mỗi ví dụ lỗi là `#### Lỗi <mã> ...`.

## Kiểm tay (không tự động được)

- **pgAdmin** (Step 4): Hiệp so tên bảng, cột, ràng buộc; chạy 2 ca thử ràng buộc; đếm số dòng trước và sau phải bằng nhau.
- **Postman** (Step 10): Hiệp gọi ít nhất 1 GET, 1 POST, 1 PUT, 1 DELETE, 1 ca lỗi; mã và body khớp danh sách.
- **Mật khẩu trong lịch sử** (Step 9): Hiệp tự gõ chuỗi mật khẩu thật vào `git grep "<chuỗi>"` và `git log -p -S"<chuỗi>" --all`; cả hai phải rỗng. AI không biết và không ghi mật khẩu.
- **Bản clone sạch** (Step 11): Hiệp clone ra thư mục ngoài dự án và làm theo README tới lúc thêm, sửa, xóa, tìm được trên giao diện.

**Kiểm của Phần H (rà soát tổng thể, 03/11/2026):**
- **Dữ liệu mẫu:** chạy `docs/du-lieu-mau.sql` trong pgAdmin → câu đếm `10`; chạy lại → vẫn `10`, không lỗi; chạy riêng dòng `DELETE` cuối file → `DELETE 10`, chỉ mất người `@congty.example`.
- **Tài khoản `employee_app`** (README mục 13): sau khi đổi user-secrets, backend đọc, thêm, sửa, xóa được; `SET ROLE employee_app; CREATE TABLE thu_quyen (id int);` → `permission denied for schema public`, rồi `RESET ROLE;`.
- **Migration bằng `postgres`** qua biến môi trường: in `Done.`; muốn chắc biến môi trường được dùng thì cho biến trỏ cổng không có database → phải báo "Failed to connect".
- **Khối PowerShell có mật khẩu:** kiểm cú pháp bằng `[System.Management.Automation.Language.Parser]::ParseFile`, chạy thử với `ConvertTo-SecureString "<mật khẩu giả>" -AsPlainText -Force` thay cho `Read-Host`.
- **Ví dụ lỗi mới trong `docs/danh-sach-api.md`:** `PATCH /api/departments` → 405; `POST` với `Content-Type: text/plain` → 415; tên có U+200B → 400 "chứa ký tự không hợp lệ"; 500 lấy trên backend phụ trỏ cổng không có database.

## Độ phủ

- U5 không có mục tiêu độ phủ riêng vì không có code.
- Mức sàn của dự án (≥ 80% số dòng của các lớp service, đo bằng coverlet) do **Build and Test** đo trên toàn bộ test của dự án. U5 không chạy và không đổi ngưỡng này.

## Giả lập và dữ liệu thử

- Không dùng mock: JSON mẫu lấy từ backend thật đang chạy với PostgreSQL thật (BR3.2).
- Dữ liệu thử: bản ghi mẫu tên giả (`Phòng Mẫu`, `Nguyễn Văn Mẫu`, email `@example.com`), tạo ở Step 5 và xóa ngay sau khi lấy JSON. Thử ràng buộc dùng dòng có sẵn làm mồi; các lệnh bị từ chối nên không thêm dòng (security-design S2, S4).
