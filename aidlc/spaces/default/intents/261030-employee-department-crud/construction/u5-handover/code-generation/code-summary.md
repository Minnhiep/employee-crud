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

## 6b. Phần H: sửa theo rà soát tổng thể (Change Request, 03/11/2026)

Nguồn: `build-and-test/ra-soat-tong-the.md`; Hiệp chọn sửa cả 4 nhóm (form 34027473), dặn "chuẩn như các công ty lớn… giải quyết triệt để" (87ea0d27), duyệt plan Phần H (gõ 1). Không sửa code, migration hay cấu hình.

| Mã | Sửa | File |
|---|---|---|
| N-01 | File dữ liệu mẫu 10 nhân viên tên giả, email `@congty.example` (RFC 2606), chèn theo tên phòng ban không phân biệt hoa thường, `ON CONFLICT DO NOTHING`, câu đếm, khối gỡ ở dạng ghi chú | `docs/du-lieu-mau.sql` (mới), README mục 12 |
| S-02, A-15 | Tài khoản database riêng `employee_app` (CONNECT, USAGE schema, SELECT/INSERT/UPDATE/DELETE 2 bảng, USAGE/SELECT sequence); mật khẩu đặt bằng hộp thoại pgAdmin; user-secrets đổi sang `employee_app`; migration bằng `postgres` qua biến môi trường `ConnectionStrings__Default` sống trong một cửa sổ | README mục 13 |
| S-11 | Lấy mật khẩu bằng `SecureStringToBSTR` + `PtrToStringBSTR` trong `try`/`finally` có `ZeroFreeBSTR` | README mục 3, 13 |
| S-07 | `npm install` → `npm ci` | README mục 7 |
| N-12 | Chỉ mở `localhost`, không `127.0.0.1`; ghi chú `<địa-chỉ-repo>` điền khi lên GitHub | README mục 2, 8, 11 |
| A-03, A-04 | "100%" là độ phủ dòng C# của service, luật nằm ở PostgreSQL kiểm tay; vì sao lệnh đo nằm trong `frontend/package.json` | README mục 10 |
| A-14 | Vì sao 4 nhóm log EF Core đặt `Critical`, đừng xóa, cách xem SQL khi học | README mục 14 |
| (Hiệp chọn) | Hướng phát triển: xóa mềm, nhật ký thay đổi | README mục 15 |
| A-11, U3/U4 | Quy ước chuẩn hóa chữ; mã 405, 415, 500; ví dụ thật 400 "chứa ký tự không hợp lệ", 405, 415, 500; tìm có ký tự lạ → `[]` | `docs/danh-sach-api.md` |

**Đã kiểm (AI):**
- `docs/du-lieu-mau.sql`: 10 dòng, chữ NFC, không ký tự lạ, email hợp lệ theo luật API, không trùng.
- Ví dụ JSON mới là kết quả gọi thật: 405 (`PATCH`), 415 (`text/plain`), 400 (U+200B) trên backend + PostgreSQL thật; 500 trên backend phụ cổng 5082 trỏ cổng 5999 không có database (log đúng 1 dòng `fail:`); `?search=%00` → 200 `[]`.
- Hai khối PowerShell (mục 3, mục 13): phân tích cú pháp 0 lỗi; chạy thử với mật khẩu giả: chuỗi kết nối đúng, biến `p`, `s`, `b` và biến môi trường bị xóa sau khi chạy.
- `dotnet ef` ưu tiên biến môi trường hơn user-secrets: chạy với biến trỏ cổng 5999 → "Failed to connect to 127.0.0.1:5999" (không dùng user-secrets).
- `npm --prefix frontend ls --depth=0` sạch (khóa khớp, `npm ci` dùng được); T1–T6 đạt (T2 thêm ví dụ 400 ký tự lạ; T4 có thêm mục 12–15; T6 chỉ có `$p`, `***`, đoạn lấy mật khẩu lúc chạy); liên kết README tới `docs/` đều có file; quét ký tự ẩn sạch (đã sửa một U+200B thật trong ví dụ JSON do công cụ ghi file đổi).

**Đã kiểm (Hiệp làm tay, AI kiểm kết quả):**

| Bước | Hiệp làm | Kết quả |
|---|---|---|
| 1 | Chạy `docs/du-lieu-mau.sql` trong pgAdmin | Câu đếm `10`; API: 12 nhân viên (2 cũ + 10 mẫu), đúng phân bố phòng ban (phòng "Nhân Sự" chữ S hoa vẫn ghép đúng), tìm "nguyễn" 2, "văn" 4, "đ" 4, "nguyễn&nbsp;&nbsp;thị" 1 |
| 1b | Chạy riêng dòng `DELETE` cuối file, không lưu file | `DELETE 10`; API: về đúng 2 nhân viên cũ; file trên đĩa giữ dòng ghi chú |
| 1c | Chạy lại cả file 2 lần | Cả 2 lần ra `10`, không lỗi; API: 12 nhân viên, 0 email trùng (dữ liệu mẫu giữ lại để demo) |
| 2.1 | 5 câu `CREATE ROLE`/`GRANT` | `GRANT`, không lỗi |
| 2.2 | Đặt mật khẩu `employee_app` bằng Properties → Definition | Đã Save (mật khẩu không vào SQL, không gửi cho AI) |
| 2.3 | Khối README mục 3 với `Username=employee_app` | `Successfully saved…`; kiểm: `Username=employee_app;Password=***`. AI chạy backend: GET 200, POST 201, PUT 200, DELETE 204 (nhân viên và phòng ban tạm), 0 dòng `fail:` |
| 2.4 | Khối migration bằng `postgres` (README mục 13 bước 4) | `Build succeeded.`, `Done.` Dòng "No migrations were applied…" không hiện vì log EF Core để mức `Warning` (mục 14), không phải lỗi. Chạy được tức là dùng `postgres` (vì `employee_app` không có quyền đọc bảng lịch sử migration) |
| 2.5 | `SET ROLE employee_app; CREATE TABLE thu_quyen (id int);` rồi `RESET ROLE;` | `ERROR: permission denied for schema public` (42501); `RESET` thành công |

**Trạng thái máy sau Phần H:** ứng dụng chạy bằng `employee_app`; database có 10 nhân viên mẫu (`@congty.example`) để demo, gỡ bằng dòng cuối `docs/du-lieu-mau.sql`.

## 6c. Sửa sau review Phần H (Hiệp duyệt checkpoint U5, gõ 1, yêu cầu sửa R-07 đến R-10; 03/11/2026)

Reviewer kết luận READY; 4 góp ý Minor, chỉ sửa câu chữ.

| Điểm | Sửa | File |
|---|---|---|
| R-07 | Lý do lệnh đo độ phủ nằm ở `frontend`: để mọi lệnh kiểm chung một chỗ; `verify` (kiểu, lint, định dạng, build, test) **không** đo độ phủ, `coverage` là lệnh riêng | README mục 10 |
| R-08 | Lưu ý: mật khẩu không dùng `;` hay `"` (cắt chuỗi kết nối, hỏng tham số PowerShell), áp dụng cả mục 13 | README mục 3 |
| R-09 | Ứng dụng không tự migrate nên `employee_app` không cần quyền với `__EFMigrationsHistory`; giao dịch lỗi thì `ROLLBACK;` trước `RESET ROLE;` | README mục 13 |
| R-10 | Ghi chú dòng gỡ: xóa cả người tự thêm bằng email `@congty.example` | `docs/du-lieu-mau.sql` |

**Kiểm lại:** quét ký tự ẩn sạch; file SQL vẫn 10 dòng chuẩn, dòng `DELETE` vẫn ở dạng ghi chú; T6 không có mật khẩu thật.

## 7. Khác với kế hoạch

- Step 5 chạy hai lần do lỗi in kết quả ở lần đầu (không ảnh hưởng dữ liệu).
- Step 11 thêm commit thứ hai (`b78a4eb`) để sửa README theo 2 chỗ vướng, đúng WF5 bước 4.
- Hiệp gửi ca 409 bằng tên cùng hoa thường thay vì viết hoa; ca khác hoa thường đã được kiểm ở Step 5 và Step 4.
