# Tóm tắt Code Generation — U5 `u5-handover`

> **Nguồn:** `code-generation-plan.md` (12 step, Hiệp duyệt), `unit-test-instructions.md` (T1–T6), `functional-design/` (BR1.1–BR4.4, WF1–WF5), `nfr-design/security-design.md` (S1–S5).
>
> Ngày làm: 02–03/11/2026. AI viết tài liệu và gọi lệnh; Hiệp chạy pgAdmin, Postman, quét mật khẩu, commit và clone sạch.

## 1. File tạo mới

| File | Nội dung | Commit (Hiệp) |
|---|---|---|
| `README.md` | 12 mục: giới thiệu luồng, phần mềm cần có, lấy mã nguồn, user-secrets (nhập mật khẩu dạng ẩn), khôi phục công cụ và gói NuGet, migration, chạy backend, chạy frontend, địa chỉ, kiểm nhanh, test và độ phủ, sự cố thường gặp (3 lỗi đã gặp thật), tài liệu khác | `4bde213`, sửa ở `b78a4eb` |
| `docs/so-do-database.md` | Sơ đồ mermaid `erDiagram` + mô tả chữ; bảng cột 2 bảng; 6 ràng buộc kèm tên thật; 4 phòng ban mẫu; cách đối chiếu pgAdmin; 2 ca thử ràng buộc kèm mã lỗi chạy thật | `4bde213` |
| `docs/danh-sach-api.md` | Quy ước chung, bảng mã trạng thái, bảng tóm tắt 10 thao tác, từng thao tác kèm request/response JSON thật, ví dụ lỗi 400/404/409, cách mở OpenAPI, cách gọi bằng Postman | `4bde213` |

Không sửa file code, migration hay cấu hình nào (BR4.1). Không đụng các file có sẵn của Hiệp (`docs/ke-hoach.md`, `docs/tim-hieu-technical-stack/*`, `.gitignore`).

## 2. Quyết định khi làm

- **Nguồn dữ kiện thật** (BR1.2, BR1.5, BR2.2): phiên bản lấy từ `.csproj`, `package.json` và lệnh `--version` trên máy; cổng lấy từ `launchSettings.json` (http 5081, https 7205), `vite.config.ts` (5173, `strictPort`), `.env.development`; tên bảng, cột, ràng buộc lấy từ hai migration và `AppDbContextModelSnapshot.cs`.
- **JSON mẫu là kết quả gọi thật** ngày 03/11/2026 bằng PowerShell (`HttpWebRequest`, đọc body UTF-8); bản ghi mẫu "Phòng Mẫu", "Nguyễn Văn Mẫu", `@example.com` tạo ra rồi xóa ngay. Lần chạy đầu in thiếu kết quả (lỗi in của script), dữ liệu vẫn được dọn; lần chạy thứ hai in đủ và là nguồn của tài liệu.
- **Mục "Sự cố thường gặp"** chỉ giữ 3 lỗi có căn cứ đã gặp (Smart App Control, file bị khóa khi backend đang chạy, `psql` không có trong PATH). Câu báo "Thiếu cấu hình ConnectionStrings:Default" là lời báo do ứng dụng tự thiết kế, nên chuyển thành ghi chú ở mục 3 (BR1.6).
- **Thử ràng buộc** dùng dòng có sẵn làm mồi, lệnh bị từ chối nên không cần dọn (security-design S4).

## 3. Kết quả kiểm

### 3.1 Lệnh kiểm tài liệu (T1–T6, `unit-test-instructions.md`)

| # | Kết quả |
|---|---|
| T1 | 10 thao tác |
| T2 | Có `#### Lỗi 400`, `#### Lỗi 404`, 2 mục `#### Lỗi 409`; 4 dòng `application/problem+json` |
| T3 | `erDiagram`, `departments {`, `employees {` |
| T4 | README đủ 12 mục (chạy lại sau khi sửa README, vẫn đủ) |
| T5 | 4 dòng liên kết tới 2 tài liệu |
| T6 | 3 dòng `Password=` trong README: biến `$p` (mật khẩu nhập lúc chạy), mẫu che `***` trong lệnh kiểm và câu kết quả mong đợi. Không có giá trị thật. Sau khi đổi mục 3 sang nhập dạng ẩn, dòng chữ giữ chỗ `<mật-khẩu-của-bạn>` được thay bằng biến `$p`, vẫn đạt tinh thần T6 (không có mật khẩu thật) |

### 3.2 pgAdmin (Hiệp, Step 4)

- Cấu trúc: 3 bảng (`__EFMigrationsHistory`, `departments`, `employees`), 6 cột đúng kiểu, độ dài, NOT NULL; `PK_departments`, `PK_employees`, `ux_departments_name`, `ux_employees_email`, `ix_employees_department_id`, `fk_employees_department ... ON DELETE RESTRICT`. Không lệch.
- Ca 1 (email trùng khác hoa thường): `duplicate key value violates unique constraint "ux_employees_email"`, SQLSTATE **23505**. Đúng dự đoán.
- Ca 2 (xóa phòng ban còn nhân viên): `violates RESTRICT setting of foreign key constraint "fk_employees_department"`, SQLSTATE **23001**. Dự đoán ban đầu (23503) sai; tài liệu đã sửa theo kết quả thật và giải thích vì sao.
- Đếm trước và sau: 4 phòng ban, 1 nhân viên. Không đổi.

### 3.3 Gọi API thật (AI, Step 5)

10 thao tác đúng mã: 200, 201 + `Location`, 200, 200, 201 + `Location`, 200, 200 (`?search=mẫu` ra 1 dòng), 200, 200, 204, 204. Lỗi: 400 (tên rỗng; nhân viên dữ liệu sai), 404 (phòng ban, nhân viên không tồn tại), 409 (trùng tên khác hoa thường, trùng email khác hoa thường, xóa phòng ban còn nhân viên). OpenAPI `/openapi/v1.json` liệt kê đủ 10 thao tác; `/swagger/index.html` trả 200. Dữ liệu sau khi dọn: 4 phòng ban, 1 nhân viên.

### 3.4 Quét mật khẩu (Step 9)

- AI: `appsettings.Development.json` không có connection string; `.gitignore` có `bin/`, `obj/`, `node_modules/`, `dist/`, `.env`; quét mẫu `Password=<giá trị>` trên toàn repo (cả `aidlc/`) và toàn lịch sử (`git log --all -G`): chỉ ra chữ giữ chỗ và ví dụ (`Password=...`, `password=x`, `$DB_PASSWORD`), không có giá trị thật.
- Hiệp: nhập mật khẩu thật qua `Read-Host -AsSecureString`, `git grep -F` và `git log --all -S` đều rỗng.

### 3.5 Postman (Hiệp, Step 10)

GET `/api/departments` 200 (4 phòng ban); POST 201, `Location: .../api/departments/11`; PUT `/11` 200; POST trùng tên 409 `application/problem+json` "Tên phòng ban đã tồn tại"; DELETE `/11` 204; GET `/11` 404 "Không tìm thấy phòng ban có mã 11.". Khớp danh sách.

### 3.6 Bản clone sạch (Hiệp, Step 11)

- Clone `C:\Users\ASUS\thu-clone-employee-crud` từ commit `4bde213`, làm theo README mục 2–9.
- Mục 3: user-secrets đã có sẵn (cùng `UserSecretsId`, cùng máy), chỉ kiểm bằng lệnh `list` có che mật khẩu.
- Mục 4: `dotnet tool restore` đạt.
- Mục 5: **vướng** `NETSDK1004 ... project.assets.json not found` vì bản clone chưa có gói NuGet. Thêm `dotnet restore backend/EmployeeCrud.slnx` thì migration build được và in `Done.` (database đã có đủ migration).
- Mục 6–7: backend chạy từ clone (`Content root path: ...thu-clone-employee-crud\...`), frontend chạy ở 5173.
- Mục 9: 4 phòng ban; thêm "Lê Thị Thử"; sửa email; tìm "Thử" ra 1 dòng; xóa nhân viên; xóa "Kỹ thuật" bị chặn với lời báo tiếng Việt. Dữ liệu sau cùng: 4 phòng ban, 1 nhân viên.
- Sửa README (commit `b78a4eb`): thêm bước `dotnet restore` vào mục 4; mục 3 đổi sang nhập mật khẩu dạng ẩn (gõ thẳng vào lệnh thì mật khẩu nằm lại trong lịch sử PowerShell).
- **Hạn chế cùng máy:** bước đặt user-secrets lần đầu và tạo database mới chỉ kiểm bằng cách đọc lệnh, không chạy từ đầu.

## 4. Test chưa chạy trong bước này

- U5 không có file test mới (không có code).
- Bộ unit test hiện có (`dotnet test backend/EmployeeCrud.slnx`) và mức sàn 80% độ phủ service **không chạy lại trong U5** vì U5 không đổi code; Build and Test chạy toàn bộ.

## 5. Chuyển cho Build and Test (việc còn mở)

Từ trước (Q5 = A):
1. Comment trong `EmployeeService.UpdateAsync` và code-summary U4 §2 ghi "200" nhưng code trả 404.
2. `ErrorMapper` (U1) chưa nhận SQLSTATE **23001**. Step 4 xác nhận PostgreSQL 18 báo đúng mã này khi vi phạm khóa ngoại `ON DELETE RESTRICT`. `DepartmentService` kiểm "còn nhân viên" trước nên API vẫn trả 409; nhưng nếu hai thao tác chen nhau lọt qua bước kiểm, API có thể trả 500.
3. `source-manifest.json` của U4 còn 3 đường dẫn cũ.

Mới tìm thấy ở U5:

4. Lỗi **400** (từ kiểm dữ liệu của ASP.NET Core, `ValidationResponseFactory`) trả `Content-Type: application/json; charset=utf-8`, không phải `application/problem+json` như FR4/C3; body thiếu trường `type` (404, 409 thì đúng). **Có ảnh hưởng tới giao diện:** `frontend/src/api/client.ts` (`readProblem`) chỉ đọc body khi `Content-Type` có `application/problem+json`, nên với lỗi 400 này giao diện mất lời báo theo từng ô và hiện câu chung. Ít gặp vì form React tự kiểm trước khi gửi, nhưng nên sửa ở Build and Test (cho 400 trả `application/problem+json`). Tài liệu đã ghi đúng hành vi thật và ghi chú lệch ngay trong `docs/danh-sach-api.md` (Step 13, R-04).
5. `POST /api/employees` với họ tên rỗng, email sai định dạng và thiếu phòng ban cùng lúc chỉ trả lỗi `fullName`; cần xem có đúng thiết kế (kiểm theo thứ tự, dừng ở lỗi đầu) hay nên gom đủ lỗi để form hiện một lần.
6. Thư mục `C:\Users\ASUS\thu-clone-employee-crud` (ngoài dự án) còn lại sau lượt thử; Hiệp quyết giữ hay tự xóa.

## 6. Lượt sửa theo rà soát (Step 13, 03/11/2026)

Hiệp lỡ chọn Approve ở checkpoint U5, ý thật là sửa R-01 đến R-04; Code Generation của U5 được mở lại, Step 13 thêm vào kế hoạch và Hiệp duyệt lại.

| Điểm | File | Đã sửa |
|---|---|---|
| R-01 | `README.md` mục 3 | `Remove-Variable` "bỏ hai biến sau khi dùng", không hứa xóa sạch khỏi bộ nhớ; gợi ý đóng cửa sổ PowerShell là chắc nhất |
| R-02 | `README.md` mục 11 | Thử build lại trước; cảnh báo tắt Smart App Control có thể không bật lại được nếu không cài lại Windows (ghi rõ tùy phiên bản, chưa kiểm trên máy làm bài); đọc hướng dẫn Microsoft và hỏi người quản lý máy |
| R-03 | `unit-test-instructions.md` T6 | Tiêu chí đạt: chỉ biến `$p`, mẫu che `***` hoặc chữ giữ chỗ |
| R-04 | `docs/danh-sach-api.md` | Quy ước chung ghi 400 thiếu `type`; ghi chú "Lệch đã biết" dưới ví dụ lỗi 400, kèm ảnh hưởng tới giao diện (kiểm trong `client.ts`) |

Trong lúc sửa R-04, kiểm `client.ts` thấy lệch 400 có ảnh hưởng tới giao diện (mục 5 điểm 4 đã cập nhật).

Chạy lại T1–T6: T1 10; T2 4 mục lỗi, 5 dòng `application/problem+json`; T3 3; T4 12 mục; T5 4; T6 3 dòng chỉ có `$p` và `***`. Hiệp commit `README.md`, `docs/danh-sach-api.md` ở `0478fd9`.

## 7. Khác với kế hoạch

- Step 5 chạy hai lần do lỗi in kết quả ở lần đầu (không ảnh hưởng dữ liệu).
- Step 11 thêm commit thứ hai (`b78a4eb`) để sửa README theo 2 chỗ vướng, đúng WF5 bước 4.
- Hiệp gửi ca 409 bằng tên cùng hoa thường thay vì viết hoa; ca khác hoa thường đã được kiểm ở Step 5 và Step 4.
