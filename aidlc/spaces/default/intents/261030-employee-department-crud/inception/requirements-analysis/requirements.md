# Yêu cầu: Ứng dụng quản lý nhân viên và phòng ban

> Nguồn:
> - Yêu cầu ban đầu của Hiệp (`project-description.json`)
> - `docs/ke-hoach.md`, mục 3 (bài thực hành) và mục 5 (kết quả bàn giao)
> - Các quyết định trong `aidlc/spaces/default/memory/project.md` (Tech Stack, Decided, Forbidden, Mandated)
> - Cách làm việc đã duyệt trong `inception/practices-discovery/team-practices.md`
> - 8 câu trả lời trong `requirements-analysis-questions.md`
>
> Ký hiệu nguồn dùng trong bảng:
> - `[desc]`: yêu cầu ban đầu
> - `[KH]`: `docs/ke-hoach.md`
> - `[PJ]`: `project.md`
> - `[TP]`: `team-practices.md`
> - `[Q<n>]`: câu hỏi số n
> - `[assumption]`: giả định, Hiệp có thể sửa

## 1. Phân tích mục đích

- **Mục tiêu chính:** làm một ứng dụng CRUD hoàn chỉnh, đi trọn luồng React → Web API JSON → ASP.NET Core → PostgreSQL. Qua đó Hiệp (thực tập sinh) hiểu được và tự trình bày được từng tầng [KH mục 1, 5] [PJ].
- **Người dùng:** một người dùng duy nhất, chạy trên máy cá nhân, không đăng nhập [PJ Forbidden].
- **Tiêu chí hoàn thành (theo `docs/ke-hoach.md` mục 5):**
  - Chạy được toàn bộ luồng từ React tới PostgreSQL.
  - CRUD và tìm kiếm hoạt động.
  - Có kiểm tra dữ liệu và thông báo lỗi cơ bản.
  - Có đủ phần bàn giao: source + migration, sơ đồ DB, danh sách API kèm JSON, README.
- **Phân loại:** dự án mới (greenfield), nhiều thành phần (frontend + backend + database), độ phức tạp vừa phải. Độ chi tiết tài liệu: Standard.
- **Nguyên tắc phạm vi:** làm đúng và đủ theo `docs/ke-hoach.md`, không tự thêm hay bớt tính năng [PJ Mandated]. Mọi lựa chọn "ngoài đề" trong buổi hỏi đều đã bị loại (Q1–Q8 đều chọn phương án tối thiểu).

## 2. Dữ liệu

| Thực thể | Trường | Ràng buộc | Nguồn |
|---|---|---|---|
| Phòng ban (Department) | `id` | Khóa chính, số nguyên, hệ thống tự tạo | [assumption] |
| | `name` (tên) | Bắt buộc; 1–100 ký tự sau khi bỏ khoảng trắng đầu và cuối; không trùng, so sánh không phân biệt hoa thường | [Q2] [Q3] [assumption: độ dài] |
| Nhân viên (Employee) | `id` | Khóa chính, số nguyên, hệ thống tự tạo | [assumption] |
| | `fullName` (họ tên) | Bắt buộc; 1–100 ký tự sau khi bỏ khoảng trắng đầu và cuối | [Q1] [assumption: độ dài] |
| | `email` | Bắt buộc; đúng định dạng email; tối đa 254 ký tự; không trùng, so sánh không phân biệt hoa thường | [Q1] [TP] [assumption: độ dài] |
| | `departmentId` (phòng ban) | Bắt buộc; phải trỏ tới một phòng ban đang có | [Q1] [PJ Decided] |

Quan hệ: một phòng ban có nhiều nhân viên; mỗi nhân viên thuộc đúng một phòng ban [PJ Decided].

## 3. Yêu cầu chức năng

### FR1. Quản lý phòng ban

| ID | Yêu cầu | Nguồn |
|---|---|---|
| FR1.1 | Hệ thống hiển thị danh sách tất cả phòng ban, sắp xếp theo tên A→Z, không phân trang. | [desc] [Q5] |
| FR1.2 | Người dùng thêm được phòng ban mới bằng cách nhập tên. | [desc] [Q2] |
| FR1.3 | Người dùng sửa được tên của một phòng ban đang có. | [desc] |
| FR1.4 | Người dùng xóa được phòng ban sau khi xác nhận trong hộp hỏi có ghi tên phòng ban. Phòng ban bị xóa hẳn khỏi database. | [desc] [Q6] |
| FR1.5 | Hệ thống từ chối tên phòng ban trùng với một phòng ban khác (không phân biệt hoa thường) và trả lỗi 409. | [Q3] |
| FR1.6 | Hệ thống từ chối xóa phòng ban còn nhân viên và trả lỗi 409 kèm thông báo tiếng Việt nói rõ lý do. | [PJ Decided] |
| FR1.7 | Migration tạo sẵn một số phòng ban mẫu. Database mới tạo đã có phòng ban để chọn, chưa có nhân viên nào. | [PJ Decided] [Q7] |

**Tiêu chí chấp nhận:**

- **AC FR1.1**
  - Given database có các phòng ban "Nhân sự", "Kế toán"
  - When người dùng mở trang Phòng ban
  - Then thấy hai dòng theo thứ tự "Kế toán", "Nhân sự".
  - Given không có phòng ban nào
  - When mở trang
  - Then thấy thông báo "Chưa có phòng ban nào" thay vì bảng rỗng.
- **AC FR1.2**
  - Given người dùng đang ở form thêm phòng ban
  - When nhập "Kỹ thuật" và bấm Lưu
  - Then API trả 201, người dùng quay về danh sách và thấy "Kỹ thuật".
  - Given ô tên bỏ trống hoặc chỉ có khoảng trắng
  - When bấm Lưu
  - Then form báo "Vui lòng nhập tên phòng ban" ngay cạnh ô và không gửi lên API.
- **AC FR1.3**
  - Given phòng ban "Kỹ thuật" đang có
  - When sửa thành "Kỹ thuật phần mềm" và Lưu
  - Then danh sách hiện tên mới.
  - Given phòng ban có id không tồn tại
  - When gọi API sửa
  - Then API trả 404.
- **AC FR1.4**
  - Given phòng ban "Kinh doanh" không có nhân viên
  - When bấm Xóa rồi xác nhận
  - Then phòng ban biến mất khỏi danh sách và khỏi database.
  - Given người dùng bấm Hủy ở hộp xác nhận
  - Then không có gì bị xóa.
- **AC FR1.5**
  - Given đã có "Kế toán"
  - When thêm hoặc đổi tên một phòng ban khác thành "kế toán"
  - Then API trả 409 và form hiện "Tên phòng ban đã tồn tại".
- **AC FR1.6**
  - Given phòng ban "Kế toán" có ít nhất một nhân viên
  - When xác nhận xóa
  - Then API trả 409, phòng ban vẫn còn, giao diện hiện "Không thể xóa phòng ban vì vẫn còn nhân viên".
- **AC FR1.7**
  - Given database trống
  - When chạy `dotnet ef database update`
  - Then bảng phòng ban có các phòng ban mẫu, bảng nhân viên trống.

### FR2. Quản lý nhân viên

| ID | Yêu cầu | Nguồn |
|---|---|---|
| FR2.1 | Hệ thống hiển thị danh sách tất cả nhân viên gồm họ tên, email và tên phòng ban, sắp xếp theo họ tên A→Z, không phân trang. | [desc] [Q1] [Q5] |
| FR2.2 | Người dùng thêm được nhân viên mới với họ tên, email và một phòng ban chọn từ danh sách thả xuống (dropdown). | [desc] [Q1] [PJ Decided] |
| FR2.3 | Người dùng sửa được họ tên, email và phòng ban của một nhân viên đang có. Form sửa hiện sẵn dữ liệu hiện tại. | [desc] |
| FR2.4 | Người dùng xóa được nhân viên sau khi xác nhận trong hộp hỏi có ghi họ tên nhân viên. Nhân viên bị xóa hẳn khỏi database. | [desc] [Q6] |
| FR2.5 | Hệ thống từ chối email trùng với một nhân viên khác (không phân biệt hoa thường) và trả lỗi 409. | [TP] |
| FR2.6 | Hệ thống từ chối nhân viên có phòng ban không tồn tại và trả lỗi 400, chỉ rõ trường phòng ban bị sai. | [PJ Decided] [TP] |

**Tiêu chí chấp nhận:**

- **AC FR2.1**
  - Given có nhân viên "Trần B" (phòng Kế toán) và "Nguyễn A" (phòng Nhân sự)
  - When mở trang Nhân viên
  - Then thấy hai dòng theo thứ tự họ tên, mỗi dòng có cột tên phòng ban.
  - Given chưa có nhân viên
  - Then thấy "Chưa có nhân viên nào".
- **AC FR2.2**
  - Given form thêm nhân viên
  - When nhập "Nguyễn Văn A", "a@congty.vn", chọn "Kế toán" rồi Lưu
  - Then API trả 201 và nhân viên mới xuất hiện trong danh sách.
  - Given chưa chọn phòng ban
  - When bấm Lưu
  - Then form báo "Vui lòng chọn phòng ban".
- **AC FR2.3**
  - Given nhân viên "Nguyễn Văn A"
  - When mở form sửa
  - Then các ô đã điền sẵn dữ liệu hiện tại; đổi phòng ban rồi Lưu thì danh sách hiện phòng ban mới.
  - Given id không tồn tại
  - When gọi API lấy hoặc sửa
  - Then API trả 404.
- **AC FR2.4**
  - Given nhân viên "Nguyễn Văn A"
  - When bấm Xóa và xác nhận
  - Then nhân viên biến mất khỏi danh sách và khỏi database.
  - When bấm Hủy
  - Then không có gì bị xóa.
- **AC FR2.5**
  - Given đã có nhân viên với email "a@congty.vn"
  - When thêm hoặc sửa một nhân viên khác với email "A@CongTy.vn"
  - Then API trả 409 và form hiện "Email đã được sử dụng".
  - Given sửa chính nhân viên đó mà giữ nguyên email
  - Then lưu thành công.
- **AC FR2.6**
  - Given phòng ban id 999 không tồn tại
  - When gọi API tạo nhân viên với `departmentId` = 999
  - Then API trả 400 kèm lỗi cho trường `departmentId`.

### FR3. Tìm kiếm nhân viên

| ID | Yêu cầu | Nguồn |
|---|---|---|
| FR3.1 | Trang Nhân viên có một ô tìm kiếm. Hệ thống trả về các nhân viên có họ tên **hoặc** email chứa chuỗi đã nhập, không phân biệt hoa thường. Khoảng trắng đầu và cuối chuỗi bị bỏ qua. | [desc] [Q4] [PJ Decided] |
| FR3.2 | Khi ô tìm kiếm trống, danh sách hiện tất cả nhân viên. Khi không có kết quả, giao diện hiện "Không tìm thấy nhân viên phù hợp". | [Q4] [assumption] |

**Tiêu chí chấp nhận:**

- **AC FR3.1**
  - Given có "Nguyễn Văn An" (an@congty.vn) và "Trần Bình" (binh@congty.vn)
  - When tìm "AN"
  - Then chỉ ra "Nguyễn Văn An".
  - When tìm "congty"
  - Then ra cả hai.
  - When tìm "  bình  "
  - Then ra "Trần Bình".
- **AC FR3.2**
  - When tìm "zzz"
  - Then thấy "Không tìm thấy nhân viên phù hợp".
  - When xóa trắng ô tìm kiếm
  - Then thấy lại toàn bộ danh sách.

### FR4. Kiểm tra dữ liệu và báo lỗi

| ID | Yêu cầu | Nguồn |
|---|---|---|
| FR4.1 | Form React kiểm tra dữ liệu theo đúng ràng buộc ở mục 2 trước khi gửi. Lỗi hiện bằng tiếng Việt ngay cạnh ô sai, và những gì người dùng đã gõ vẫn được giữ nguyên. | [desc] [PJ Mandated] |
| FR4.2 | API kiểm tra lại cùng các ràng buộc đó, không tin dữ liệu từ form. Dữ liệu sai trả 400 dạng ProblemDetails, kèm danh sách lỗi theo từng trường. | [PJ Mandated] |
| FR4.3 | Lấy, sửa hoặc xóa một bản ghi không tồn tại trả 404 dạng ProblemDetails. | [PJ Mandated] |
| FR4.4 | Vi phạm luật nghiệp vụ (trùng tên phòng ban, trùng email, xóa phòng ban còn nhân viên) trả 409 dạng ProblemDetails. Nội dung thông báo bằng tiếng Việt để giao diện hiện lại cho người dùng. | [PJ Mandated] |
| FR4.5 | Khi gọi API, giao diện có ba trạng thái riêng: đang tải ("Đang tải..."), lỗi (ví dụ "Không kết nối được máy chủ, vui lòng thử lại"), và danh sách trống. Khi API lỗi, giao diện không bao giờ hiện một bảng trống như thể không có dữ liệu. | [KH mục 2: loading và lỗi] |
| FR4.6 | Nút Lưu và nút xác nhận Xóa bị khóa trong lúc chờ API trả lời, để bấm hai lần không tạo bản ghi trùng. | [assumption: corner "double submit"] |

**Tiêu chí chấp nhận:**

- **AC FR4.1**
  - Given email "abc" và họ tên trống
  - When bấm Lưu
  - Then hiện "Vui lòng nhập họ tên" và "Email không đúng định dạng", không có request nào gửi đi, chữ "abc" vẫn còn trong ô.
- **AC FR4.2**
  - Given gọi thẳng API bằng Postman với `fullName` dài 101 ký tự
  - Then API trả 400, trong `errors` có khóa `fullName`.
- **AC FR4.3**
  - When `GET /api/employees/999` (không tồn tại)
  - Then 404 với `Content-Type: application/problem+json`.
- **AC FR4.4**
  - Như AC FR1.5, AC FR1.6 và AC FR2.5; body có `title` hoặc `detail` bằng tiếng Việt.
- **AC FR4.5**
  - Given backend đang tắt
  - When mở trang Nhân viên
  - Then thấy thông báo lỗi kết nối, không thấy "Chưa có nhân viên nào".
- **AC FR4.6**
  - When bấm Lưu hai lần thật nhanh
  - Then chỉ một request được gửi và chỉ một bản ghi được tạo.

### FR5. Giao diện

| ID | Yêu cầu | Nguồn |
|---|---|---|
| FR5.1 | Giao diện có hai trang "Nhân viên" và "Phòng ban", chuyển qua lại bằng thanh menu (React Router). Form thêm và form sửa của mỗi loại là một trang riêng. | [Q8] |
| FR5.2 | Mọi chữ trên giao diện và mọi thông báo lỗi cho người dùng đều bằng tiếng Việt. | [PJ Mandated] |
| FR5.3 | Lưu thành công thì quay về trang danh sách và hiện thông báo thành công ngắn (ví dụ "Đã thêm nhân viên"). Bấm "Hủy" trên form thì quay về danh sách và không lưu gì. | [assumption] |
| FR5.4 | Mỗi ô nhập có nhãn (label) gắn với ô. Báo lỗi bằng chữ, không chỉ bằng màu. | [assumption: corner "keyboard, screen reader"] |

**Tiêu chí chấp nhận:**

- **AC FR5.1**
  - When bấm "Phòng ban" trên menu
  - Then địa chỉ đổi sang trang phòng ban và hiện danh sách phòng ban.
  - When bấm "Thêm nhân viên"
  - Then mở trang form riêng.
- **AC FR5.2**
  - Rà toàn bộ giao diện: không còn chữ tiếng Anh hiển thị cho người dùng, trừ tên riêng như email.
- **AC FR5.3**
  - Given vừa thêm thành công
  - Then đang ở trang danh sách và thấy thông báo thành công.
  - Given bấm Hủy
  - Then không có request ghi nào được gửi.
- **AC FR5.4**
  - Bấm vào nhãn "Họ tên" thì con trỏ nhảy vào ô Họ tên; ô lỗi luôn có dòng chữ giải thích.

### FR6. Web API

| ID | Yêu cầu | Nguồn |
|---|---|---|
| FR6.1 | API REST trả JSON gồm: `GET/POST /api/departments`, `GET/PUT/DELETE /api/departments/{id}`, `GET/POST /api/employees` (`GET` nhận tham số `search` không bắt buộc), `GET/PUT/DELETE /api/employees/{id}`. | [desc] [KH mục 2] [TP] |
| FR6.2 | Mã trạng thái: 200 khi đọc hoặc sửa thành công, 201 kèm header `Location` khi tạo, 204 khi xóa, 400/404/409 như FR4. JSON dùng tên trường camelCase. | [KH mục 2] [TP] |
| FR6.3 | Danh sách nhân viên trả về có cả `departmentId` lẫn `departmentName`, để giao diện hiện tên phòng ban mà không phải gọi thêm. | [Q1] [assumption] |
| FR6.4 | API có tài liệu OpenAPI xem được khi chạy ở môi trường Development, và kiểm thử được từng endpoint bằng Postman. | [PJ Decided] |

**Tiêu chí chấp nhận:**

- **AC FR6.1/6.2**
  - Gọi lần lượt từng endpoint bằng Postman với dữ liệu đúng và sai; mã trạng thái và body khớp bảng API trong tài liệu bàn giao.
- **AC FR6.3**
  - `GET /api/employees` trả mỗi phần tử có `id`, `fullName`, `email`, `departmentId`, `departmentName`.
- **AC FR6.4**
  - Khi chạy `dotnet run`, mở được trang tài liệu OpenAPI và thấy đủ 10 thao tác.

### FR7. Kết quả bàn giao

| ID | Yêu cầu | Nguồn |
|---|---|---|
| FR7.1 | Source code trên Git gồm backend, frontend và migration EF Core tạo database. | [KH mục 5] [desc] |
| FR7.2 | Sơ đồ database có hai bảng, các cột, khóa chính, khóa ngoại và ràng buộc không trùng. | [KH mục 5] [desc] |
| FR7.3 | Danh sách API: mỗi endpoint có phương thức, đường dẫn, mô tả, ví dụ request JSON và response JSON, gồm cả một ví dụ lỗi 400/404/409. | [KH mục 5] [desc] |
| FR7.4 | README hướng dẫn cài đặt và chạy trên máy cá nhân: phần mềm cần có kèm phiên bản; cách đặt connection string bằng user-secrets; lệnh tạo database bằng migration; lệnh chạy backend và frontend; địa chỉ trang web và API. | [KH mục 5] [TP Deployment] |

**Tiêu chí chấp nhận:**

- **AC FR7.1–7.4**
  - Given máy có đủ phần mềm như README ghi
  - When làm đúng từng bước README từ một bản clone sạch
  - Then ứng dụng chạy được và làm được đủ thêm/sửa/xóa/tìm.
  - Sơ đồ và danh sách API khớp với code.

## 4. Yêu cầu phi chức năng

| ID | Yêu cầu | Tiêu chí đo | Nguồn |
|---|---|---|---|
| NFR1 | Chạy trên máy cá nhân | Backend chạy bằng `dotnet run`, frontend bằng `npm run dev`, dùng PostgreSQL 18 trên máy (cổng 5432, database `employee_db`). Làm theo README từ bản clone sạch thì chạy được, không cần bước nào khác. | [PJ Decided] [TP] |
| NFR2 | Không lộ mật khẩu database | Không có mật khẩu PostgreSQL trong bất kỳ file nào được commit; connection string đặt bằng user-secrets. Kiểm bằng cách rà `git grep` mật khẩu. | [PJ Forbidden] |
| NFR3 | Toàn vẹn dữ liệu ở cả database | Database cũng tự chặn: có khóa ngoại `employees.department_id` → `departments.id` (không cho xóa phòng ban còn nhân viên), và chỉ mục không trùng cho email và tên phòng ban (không phân biệt hoa thường). Chèn SQL tay mà vi phạm thì PostgreSQL báo lỗi. | [PJ Decided] [assumption: chặn hai lớp] |
| NFR4 | Test tự động | Có unit test xUnit cho các lớp service: mỗi service ít nhất 1 trường hợp đúng và 2 trường hợp lỗi hoặc biên. `dotnet test` qua hết. Độ phủ dòng của các lớp service ≥ 80% (đo bằng coverlet). | [TP Testing Posture] |
| NFR5 | Thời gian phản hồi | Với tối đa 1.000 nhân viên trên máy phát triển, API danh sách và tìm kiếm trả lời trong vòng 1 giây. | [assumption] |
| NFR6 | Dễ hiểu, dễ trình bày | Backend chia tầng Controller → Service → DTO, dùng Dependency Injection. Comment tiếng Việt ở chỗ không hiển nhiên. Hiệp giải thích được luồng một request từ React tới PostgreSQL. | [PJ Tech Stack] [KH mục 5] [TP Code Style] |
| NFR7 | Chặn gọi API từ nguồn lạ | API chỉ cho phép trang frontend ở địa chỉ phát triển của Vite (mặc định `http://localhost:5173`) gọi tới (CORS). | [assumption] |
| NFR8 | Định dạng và kiểm lỗi code | Trước khi commit, `dotnet format --verify-no-changes` và `npm run lint` không còn lỗi. | [TP Code Style] |

## 5. Ràng buộc

- **Công nghệ:**
  - React + JavaScript, tạo bằng Vite.
  - ASP.NET Core trên .NET 10, Web API kiểu controller.
  - EF Core + Npgsql 10.x, có migration.
  - PostgreSQL 18; REST + JSON; OpenAPI; Postman.
  - Git trên máy, sau này lên GitHub. [PJ Tech Stack]
- **Không được dùng** [PJ Forbidden]:
  - Microservices hay kiến trúc phức tạp.
  - Redux, CI/CD, Docker, TypeScript/Next.js.
  - Đăng nhập hay phân quyền.
  - Commit mật khẩu.
  - Cài công cụ ra ngoài thư mục dự án.
  - AI-DLC tự push lên GitHub.
- **Cách làm** [TP]:
  - Làm xong phòng ban rồi mới tới nhân viên.
  - Viết test sau code.
  - Hiệp tự commit lên `main`.
  - Tên bảng và cột trong database theo kiểu `snake_case`.

## 6. Giả định

| Giả định | Lý do |
|---|---|
| Chỉ một người dùng, trên một máy. Không xử lý xung đột khi hai người sửa cùng lúc: ai lưu sau thì bản đó được giữ. | Demo cá nhân, không có đăng nhập [PJ]. |
| Độ dài tối đa: tên phòng ban 100, họ tên 100, email 254 ký tự. | Mức phổ biến; 254 là giới hạn thực tế của email. Hiệp có thể đổi. |
| Phòng ban mẫu: "Nhân sự", "Kế toán", "Kỹ thuật", "Kinh doanh". | `project.md` ghi "a few sample departments" nhưng chưa nêu tên cụ thể. |
| Tìm kiếm không phân biệt hoa thường nhưng **có** phân biệt dấu: gõ "nguyen" không ra "Nguyễn". | Đề chỉ yêu cầu không phân biệt hoa thường; bỏ dấu cần thêm extension `unaccent` của PostgreSQL, tức là ngoài đề. |
| Email được so sánh không phân biệt hoa thường; khi lưu, email được bỏ khoảng trắng đầu và cuối. | Chặn trùng kiểu "A@x.vn" và "a@x.vn". |
| Không phân trang. Dữ liệu demo nhỏ (dưới 1.000 dòng). | [Q5]; đề không yêu cầu. |
| Trình duyệt dùng để demo: Chrome hoặc Edge bản mới. Chỉ cần dùng tốt trên màn hình máy tính. | Demo trên máy cá nhân. |

## 7. Ngoài phạm vi

- Đăng nhập và phân quyền [PJ Forbidden].
- Phân trang [Q5].
- Xóa mềm [Q6].
- Lọc nhân viên theo phòng ban [Q4].
- Tìm kiếm không dấu.
- Các trường ngoài đề: số điện thoại, chức vụ, ngày vào làm, lương [Q1]; mô tả và mã phòng ban [Q2].
- Nhân viên mẫu [Q7].
- Xuất hoặc nhập file (Excel, CSV), nhật ký thao tác (audit log), thông báo.
- Giao diện riêng cho điện thoại.
- Test tự động cho React, test E2E [TP].
- CI/CD, Docker, triển khai lên máy chủ [PJ Forbidden].
- Phần trình bày demo 15 phút [KH mục 5]: Hiệp tự làm, không phải là phần mềm.

## 8. Câu hỏi còn mở cho các bước sau

- Test service dùng database giả lập trong bộ nhớ có chạy được phép tìm `ILIKE` riêng của PostgreSQL hay không. Bước Code Generation sẽ quyết cách xử lý, ví dụ dùng `ToLower().Contains()` hoặc một provider giả lập khác. Đã ghi trong `practices-discovery/evidence.md`.
- Email có được chuyển hết về chữ thường trước khi lưu hay giữ nguyên như người dùng gõ. Bước Functional Design sẽ quyết; quyết thế nào thì luật không trùng (FR2.5) vẫn giữ.
