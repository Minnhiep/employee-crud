# Rà soát tổng thể trước khi chốt Build and Test

> Hiệp yêu cầu (tin nhắn bfe4ebe3, form fc4951b8): rà lại toàn bộ theo `docs/ke-hoach.md` và theo cách công ty thật làm, ở mọi góc (nghiệp vụ, phần mềm, hệ thống, bảo mật, quản lý). Cách làm: AI tự đối chiếu `docs/ke-hoach.md` từng dòng; ba chuyên gia của AI-DLC rà độc lập, chỉ đọc (nghiệp vụ `aidlc-product-lead-agent`, bảo mật `aidlc-devsecops-agent`, kiến trúc và vận hành `aidlc-architecture-reviewer-agent`); AI gộp, bỏ trùng, kiểm lại vài điểm. **Chưa sửa gì**; Hiệp duyệt trước. Ngày 2026-11-03.

## 1. Đối chiếu `docs/ke-hoach.md` từng dòng

| Mục | Yêu cầu | Tình trạng | Bằng chứng |
|---|---|---|---|
| §1 | Demo CRUD hoàn chỉnh; luồng React → API JSON → ASP.NET Core → PostgreSQL | Đạt | Lượt 3 F01–F14 trên server Hiệp tự bật theo README (`test-results.md` §2b) |
| §1 | Giải thích được luồng | Việc của Hiệp | Tài liệu `docs/tim-hieu-technical-stack/`, comment "vì sao" trong code |
| §2 PostgreSQL | Bảng, kiểu dữ liệu, khóa chính, khóa ngoại, SELECT/INSERT/UPDATE/DELETE, JOIN, index, transaction | Có trong code | 2 bảng, PK, FK `fk_employees_department` (RESTRICT), 3 chỉ mục, danh sách dùng JOIN, `SaveChanges` chạy trong transaction |
| §2 C#/ASP.NET | LINQ, async/await, Web API, Controller/Service/DTO, DI, EF Core migration và CRUD | Có trong code | `Departments/`, `Employees/`, `Program.cs`, 2 migration |
| §2 React | Component, props, state, useState, useEffect, form và kiểm dữ liệu, gọi API, loading và lỗi | Có trong code | `frontend/src/` (dùng TypeScript, Hiệp đổi 01/11) |
| §2 API | REST GET/POST/PUT/DELETE, JSON, mã HTTP, validation, OpenAPI, Postman | Có | 10 thao tác, ProblemDetails 400/404/409/500, `/swagger`, Postman ở U5 |
| §2 Công cụ | Git: clone, branch, commit, pull, merge; cài và chạy trên máy | Một phần | Commit, clone (U5) đã làm; **branch, pull, merge chưa thể hiện** (team chọn trunk-based). Hiệp có thể tập khi đẩy lên GitHub |
| §3 | Danh sách, thêm, sửa, xóa, tìm nhân viên; chọn phòng ban; lưu PostgreSQL; React gọi Web API | Đạt | F01–F14, V01–V07 |
| §3 | Không microservices, kiến trúc phức tạp, Redux, CI/CD | Đạt | 1 backend + 1 frontend, không Redux, không CI |
| §5 | Source trên Git gồm backend, frontend, migration | Đạt trên máy; **chưa lên GitHub** | 3 commit 03/11; còn file chưa commit (`appsettings*.json` và hồ sơ) |
| §5 | Sơ đồ database, danh sách API kèm JSON mẫu | Đạt | `docs/so-do-database.md`, `docs/danh-sach-api.md` |
| §5 | README cài và chạy trên máy cá nhân | Đạt | Clone sạch chạy được (U5) |
| §5 | Demo 15 phút | Việc của Hiệp | Câu hỏi demo gợi ý ở mục 4 |
| §5 Yêu cầu hoàn thành | Cả luồng chạy được; CRUD và tìm kiếm chạy; kiểm dữ liệu và thông báo lỗi cơ bản | Đạt | F, V, 400/404/409/500 |

## 2. Danh sách gộp (38 điểm → 30 việc sau khi bỏ trùng)

Mã: N = nghiệp vụ, A = kiến trúc, S = bảo mật. Mức theo người rà; AI ghi "đã kiểm" khi tự xác nhận.

### Nhóm 1. Lỗi thật hoặc lệch yêu cầu kiểm dữ liệu (trong phạm vi ke-hoach §5)

| Mã | Mức | Việc | Ghi chú |
|---|---|---|---|
| S-04, N-09 | Thấp→ đáng sửa | Ký tự điều khiển (ví dụ `\0`) trong ô tìm hoặc họ tên/tên phòng ban làm API trả **500** thay vì 400 | S đã gọi GET thật `?search=%00` → 500. Người dùng tự gây được lỗi 500 |
| N-04 | Trung bình | Hai khoảng trắng ở giữa ("Kế  toán") hoặc chữ có dấu kiểu tổ hợp (NFD) lách được luật "không trùng tên" | Chuẩn hóa: gộp khoảng trắng, NFC, ở API và form |
| A-01 | Trung bình | Tìm kiếm liên tiếp hủy request cũ; backend có thể ghi Error 500 giả khi bị hủy | Suy luận, cần chạy thử trước khi sửa |
| S-03 | Thấp | `AllowedHosts: "*"` → trang web lạ có thể dùng kỹ thuật DNS rebinding gọi API trên máy | Sửa 1 dòng thành `localhost` |
| N-03 | Trung bình | `maxLength` cắt im lặng phần dán thừa (mất chữ không báo) | Bỏ `maxLength`, để lời báo "tối đa 100 ký tự" hiện |
| N-05 | Trung bình | Hộp xác nhận xóa chỉ ghi họ tên, trùng tên thì không biết xóa ai | Thêm email vào câu |
| A-13 | Thấp | Form sửa phòng ban không tạo lại khi đổi id (`key="edit"` cố định); nhân viên đã sửa rồi | Đồng bộ với nhân viên |
| N-07 | Thấp | Sửa/Hủy từ kết quả tìm thì quay về mất chuỗi tìm | Giữ `?search=` |
| N-02, A-09 | Thấp | Body hỏng hoặc 5xx không có lời báo thì hiện "Không kết nối được máy chủ" (sai nguyên nhân) | AI đã kiểm: 500 của backend vẫn hiện đúng "Đã có lỗi xảy ra…"; chỉ ca hiếm sai |

### Nhóm 2. Bảo mật mức công ty (tùy chọn, demo local vẫn chạy được nếu không làm)

| Mã | Mức | Việc |
|---|---|---|
| S-05 | Thấp | Header bảo mật cho API: `X-Content-Type-Options: nosniff`, `Cache-Control: no-store` cho `/api`, CSP `frame-ancestors 'none'`; bỏ header `Server: Kestrel` |
| S-09 | Thông tin | Bỏ `UnsafeRelaxedJsonEscaping` (chữ "Unsafe" là cờ đỏ khi rà code), dùng bộ mã hóa giữ chữ Việt mà vẫn mã hóa ký tự HTML |
| S-07 | Thấp | Ghim phiên bản cụ thể cho 4 gói NuGet `10.*`; README dùng `npm ci` |
| S-08 | Thấp | `.gitignore` thêm mẫu file bí mật (`*.pfx`, `*.pem`, `*.key`, `secrets.json`, `.env.*` trừ `.env.development`) |
| A-02 | Trung bình | Ghi `traceId` vào dòng log để dò được lỗi từ phản hồi (tài liệu API đã hứa) |
| S-02, A-15 | Trung bình | App dùng tài khoản `postgres` (quyền cao nhất). Công ty tạo tài khoản riêng chỉ đủ quyền 2 bảng. Cần Hiệp tự chạy SQL trong pgAdmin (AI không gõ mật khẩu) |

### Nhóm 3. Dọn code cho dễ giải thích (không đổi hành vi)

A-05 (hai trang tải lại danh sách theo hai kiểu khác nhau), A-06 (câu lỗi chung và hàm phụ chép 5 chỗ), A-07 (`ErrorMapper` tự gõ mã lỗi thay vì dùng hằng có sẵn), A-08 (`SaveAsync` truyền id 0 khi thêm mới), A-10 (`.env.development` còn ghi `client.js`), A-12 (file `.http` chỉ có 1 request), N-10 (comment "200" trong `EmployeeService.UpdateAsync` sai, thật là 404).

### Nhóm 4. Tài liệu và chuẩn bị demo

N-01 (database chỉ có 1 nhân viên: thêm file SQL dữ liệu mẫu khoảng 10 người để demo tìm kiếm, kèm hướng dẫn chạy và cách xóa), N-12 (README: phải mở `localhost`, không dùng `127.0.0.1`; điền địa chỉ repo khi đã lên GitHub), A-03 (README: "100% độ phủ" là dòng C# của service; luật phụ thuộc PostgreSQL được kiểm tay), A-04 (vì sao lệnh đo backend nằm trong `frontend/package.json`), A-11 (danh sách API thêm dạng lỗi 500, 405, 415), A-14 (lý do 4 nhóm log EF đặt `Critical`), xóa mềm và nhật ký là hướng phát triển (Hiệp chọn, form fc4951b8), S-11 (README xóa bản sao mật khẩu trong bộ nhớ sau khi nhập).

### Nhóm 5. Trên máy anh, ngoài repo (cần Hiệp duyệt riêng)

| Mã | Mức | Việc |
|---|---|---|
| S-01 | Trung bình | PostgreSQL đang nghe trên mọi card mạng (`0.0.0.0:5432`): ngồi chung Wi-Fi, người khác dò được cổng database, chỉ còn mật khẩu chặn. Cần đọc `pg_hba.conf` trước; nếu chỉ cho localhost thì mức hạ xuống Thấp. Sửa: `listen_addresses = 'localhost'` trong `postgresql.conf`, khởi động lại dịch vụ (cần Admin) |

### Không làm (ngoài phạm vi ke-hoach hoặc đã chốt), chỉ chuẩn bị câu trả lời

N-06 (cột "số nhân viên" của phòng ban: tính năng mới), N-08 (sắp theo tên thay vì họ), N-11 (lưu email chữ thường), S-06 (CSP cho `vite preview`: công ty đặt ở web server thật), S-10 (12 cảnh báo `npm audit` chỉ ở gói lint lúc dev; bản build 0).

## 3. Đã kiểm và thấy ổn (tóm tắt từ 3 báo cáo)

Không có lỗi mức Cao. Tách tầng đúng (controller mỏng, luật ở service, DTO riêng, DI Scoped); EF đọc bằng một câu JOIN, `AsNoTracking`, không N+1; chống chen nhau hai lớp (kiểm trước + bắt lỗi ràng buộc); không bí mật trong Git (quét cả 15 commit); không SQL injection (chỉ LINQ, `%` `_` được thoát); không XSS (không `dangerouslySetInnerHTML`); CORS chỉ `http://localhost:5173`, không credentials; lỗi 500 không lộ thông tin; log không ghi query string, không ghi dữ liệu nhạy cảm; Swagger chỉ ở Development; NuGet 0 lỗ hổng, `npm audit --omit=dev` 0; câu chữ tiếng Việt nhất quán; tài liệu (sơ đồ DB, danh sách API) khớp migration và controller.

## 4. Câu hỏi có thể gặp khi demo (gợi ý trả lời)

1. Hai người cùng sửa một nhân viên? Người lưu sau đè; hướng thật: số phiên bản + 409.
2. Sao xóa hẳn, không đánh dấu nghỉ việc? Đề yêu cầu CRUD; thật thì xóa mềm + nhật ký (hướng phát triển).
3. Không có đăng nhập? Đề không yêu cầu, luật dự án cấm thêm trong phạm vi này; thật thì bắt buộc.
4. Tìm "nguyen" không ra "Nguyễn"? Đề chỉ yêu cầu không phân biệt hoa thường; không dấu cần `unaccent`.
5. 1.000 nhân viên, sao không phân trang? Đo được 0,077 giây với 1.000 dòng; thật thì thêm `page`, `pageSize`, `LIMIT/OFFSET`.
6. Thêm sai nhiều ô mà API báo một lỗi? Form báo đủ; API báo lỗi đầu tiên (Hiệp chốt ở U4).
7. Vì sao kiểm ở cả React lẫn API? React để báo ngay; API vì không được tin trình duyệt (Postman gọi thẳng); database chặn thêm bằng chỉ mục và khóa ngoại.
8. Trùng tên phân biệt bằng gì? Bằng email (duy nhất, không phân biệt hoa thường).
9. Vì sao gõ xong phải bấm Tìm? Chuỗi tìm nằm trên địa chỉ nên Back/F5 vẫn đúng; tự tìm khi gõ cần debounce.
10. "100% độ phủ" nghĩa là gì? Dòng C# của service; luật phụ thuộc PostgreSQL kiểm tay (8 request cùng lúc, tắt DB).
