# Đánh giá chất lượng code

Chỉ ghi điều đã thấy khi đọc code. Lượt quét `261104-sua-loi-luot-8` đọc cây đang có trên đĩa, dựa trên `67689354927fc28276fab61f60f42e2ae608a293` cộng thay đổi chưa commit của `261104-sua-loi-luot-6`; không chạy build, test hay ứng dụng. Số chạy thật lấy từ `test-results.md` của lượt 6. Phần ngoài `backend/EmployeeCrud.Api`, `frontend/src`, file `07` giữ từ lần quét trước. Chỗ nào chưa kiểm được thì ghi rõ.

**Mức nghiêm trọng:**
- **Cao:** người dùng gặp lỗi sai hẳn, ví dụ API trả 500 với dữ liệu nhập được.
- **Trung bình:** hành vi sai hoặc tài liệu sai có thể làm người khác làm theo sai.
- **Thấp:** nợ kỹ thuật, không gây lỗi thấy được.
- **Thông tin:** cần biết, không nhất thiết phải sửa.

**Trạng thái:** **Đã sửa** là đã thấy trong code lượt này. **Đã sửa (chưa đọc lại)** là `261104-sua-loi-luot-6` ghi đã làm, nằm ngoài vùng quét. **Còn** là chưa sửa.

## Hiện trạng chung

| Mục | Hiện trạng |
|---|---|
| Test | 146/146 (lượt 7, `npm --prefix frontend run verify`). Unit test service trên InMemory; test pipeline bằng `WebApplicationFactory` |
| Test frontend, E2E | Không có, đúng `team.md` |
| Độ phủ | `DepartmentService`, `EmployeeService`, `TextInput` 100%, `ErrorMapper` 97,6% (lượt 7). Không có ngưỡng tự động (`BE-7`) |
| Lint, định dạng | ESLint `--max-warnings 0`, Prettier, `tsc` strict, `dotnet format` đã nằm trong `verify` |
| CI/CD | Không có, đúng `project.md`; thay bằng `npm run verify` trên máy |
| Tài liệu | README đầy đủ; `docs/` có API, sơ đồ, dữ liệu mẫu; còn lệch (`DOC-10`, `DOC-11`) |
| Bí mật | Chưa thấy trong file nguồn và `docs/` |
| Dấu nợ | Không có `TODO`, `FIXME`, `HACK`, `eslint-disable`, `ts-ignore` |

| Tiêu chí | Đánh giá | Ghi chú |
|---|---|---|
| Đặt tên | Tốt | Tên tự giải thích, theo quy ước |
| Độ dài hàm | Khá | Service gọn; component trang dài (`FE-6`) |
| Xử lý lỗi | Tốt | Bắt ở biên, không nuốt lỗi; có đường dự phòng chen nhau. Còn hai chỗ báo sai tình huống (`BE-11`, `FE-15`) |
| Có test cho đường chính | Khá | Service tốt; controller thật chưa có test tự động (`BE-6`) |
| Lặp code | Khá | Lặp ở frontend (`FE-5`) |
| Code chết | Khá | Một nhánh và hai trường ở `client.ts` (`FE-17`) |
| Comment | Khá | Giải thích "vì sao" tốt, nhưng 186 dòng có mã nội bộ (`DOC-9`) |

## Tầng database

| Mã | Mức | Trạng thái | Vị trí | Phát hiện | Lý do |
|---|---|---|---|---|---|
| DB-1 | Thấp | Còn | `Departments/DepartmentConfiguration.cs:21-24`, `Employees/EmployeeConfiguration.cs:24-32`, `DepartmentService.cs:27`, `EmployeeService.cs:86-88`, `:93` | Không khai collation. Sắp xếp và `lower()` theo locale database lúc cài, còn chuỗi tìm hạ chữ ở .NET bằng `ToLowerInvariant` | Repo không quyết định thứ tự chữ Việt; `docs/tim-hieu-technical-stack/06-cai-dat-moi-truong.md:42` chỉ ghi "Default locale". Test InMemory không đo được. `README.md:167` có nêu việc kiểm tay |
| DB-2 | Thấp | Đã sửa (chưa đọc lại) | Migration `CreateEmployees.cs:21-22`, `CreateDepartments.cs:21`, `docs/so-do-database.md:53` | Database chỉ có `NOT NULL` và độ dài, không có `CHECK`. Chuỗi rỗng, ký tự lạ chèn tay vẫn lọt | Phần tài liệu sửa theo FR5 của lượt 6; cấu trúc database không đổi |
| DB-3 | Thông tin | Còn | `EmployeeService.cs:87-88`, `:92-96`, `DepartmentService.cs:25-29` | Tìm "chứa" không có chỉ mục phù hợp; danh sách không phân trang | Bảng nhỏ nên chấp nhận được; đề không đòi |
| DB-4 | Thông tin | Còn | `CreateDepartments.cs:25`, `CreateEmployees.cs:27` | Khóa chính tên `PK_*` chữ hoa, khác `ux_`, `ix_`, `fk_` | Tên mặc định của EF; `team.md` chỉ quy định bảng và cột |

## Tầng backend

| Mã | Mức | Trạng thái | Vị trí | Phát hiện | Lý do |
|---|---|---|---|---|---|
| BE-1 | Cao | Đã sửa | `Platform/Text/TextInput.cs:56-61`, `:93-94` | U+FFFE lọt tới `Normalize`, API trả 500 | Có `IsNoncharacter`; test lượt 7 đạt ở tên phòng ban, họ tên, email, ô tìm |
| BE-2 | Trung bình | Đã sửa | `frontend/package.json`, `.editorconfig` | `verify` không chạy `dotnet format`. Số đo thật là **8 lỗi ở 6 file** (5 `FINALNEWLINE`, 3 `WHITESPACE`), không phải 8 file như bản quét trước đoán | Lượt 6 sửa và thêm vào `verify`; lượt 7 chạy đạt |
| BE-3 | Thấp | Còn | `DepartmentService.cs:54-55`, `EmployeeService.cs:133-135` | Sửa phòng ban kiểm dữ liệu trước rồi mới tìm bản ghi; sửa nhân viên làm ngược lại | Cùng lỗi kép, hai API trả khác mã (400 và 404). Lượt 6 chọn không làm (Q5 A) |
| BE-4 | Thấp | Đã sửa | `DbConstraintNames.cs:4-6`, `EmployeeConfiguration.cs:36-37`, `DepartmentService.cs:169`, `ValidationResponseFactory.cs:17`, `Program.cs:51` | Bốn comment lệch code | Đã đối chiếu từng dòng lượt này |
| BE-5 | Thấp | Đã sửa | `ValidationResponseFactory.cs:50`, `ErrorTitles.cs:23` | Câu báo viết thẳng | Nay là `ErrorTitles.InvalidValueTypeMessage` |
| BE-6 | Thấp | Còn | `Platform/PipelineTests.cs`, `Platform/SecurityTests.cs`, `Platform/TestOnlyController.cs:13-15` | Test pipeline dùng `/api/test-only`. Không test tự động nào gọi `DepartmentsController`, `EmployeesController` | Route, `[Required]`, 201 và `Location` chỉ kiểm tay. Đúng `team.md`, nhưng là khoảng trống hồi quy |
| BE-7 | Thấp | Còn | `frontend/package.json` | Script `coverage` chỉ in bảng, không so ngưỡng 80% | `team.md` đặt mức sàn; hiện chỉ dựa vào người đọc số |
| BE-8 | Thấp | Đã sửa (chưa đọc lại) | `Platform/LoggingTests.cs` | Test hủy request dùng hẹn giờ cố định | Lượt 6 đổi sang chờ theo điều kiện |
| BE-9 | Thông tin | Còn | `EmployeeCrud.Api.csproj:3-8`, thư mục gốc | Không có `global.json`, `TreatWarningsAsErrors`, `GenerateDocumentationFile` | SDK không được ghim. Controller có `/// <summary>` nhưng file XML không được sinh |
| BE-10 | Thông tin | Đã sửa | `backend/EmployeeCrud.Api/Controllers/` | Thư mục rỗng | Không còn trên đĩa |
| BE-11 | Trung bình | Còn | `DepartmentService.cs:60-73`; so với `EmployeeService.cs:145-151` | PUT phòng ban với tên không đổi: EF không gửi UPDATE, không có lỗi tương tranh, `:73` trả 200 cho phòng vừa bị xóa | Đọc code, chưa chạy. `EmployeeService` tránh được nhờ đọc lại bằng `GetByIdAsync` |
| BE-12 | Thấp | Còn | `ErrorMapper.cs:72-79`; `DepartmentService.cs:16`, `EmployeeService.cs:23` | Khóa `"name"`, `"email"` gõ tay ở tầng nền, trùng hằng ở service | Đổi một bên sẽ lệch âm thầm. Comment `:72-73` giải thích để tránh phụ thuộc ngược; có thể đặt khóa ở `Platform/Errors`, service tham chiếu lại |
| BE-13 | Thấp | Còn | `Employee.cs:15`, `EmployeeRequest.cs:12`, `DepartmentRequest.cs:11` | Comment nói "bỏ khoảng trắng hai đầu"; thật ra `TextInput` còn gộp khoảng trắng và đưa về NFC | Dễ trình bày sai. Chưa có ghi chép chi tiết "comment email" là dòng nào, đây là ứng viên |

## Tầng frontend

| Mã | Mức | Trạng thái | Vị trí | Phát hiện | Lý do |
|---|---|---|---|---|---|
| FE-1 | Cao | Đã sửa | `src/utils/normalizeText.ts:15` | `INVALID` thiếu noncharacter | Có `\p{Noncharacter_Code_Point}` |
| FE-2 | Trung bình | Đã sửa | `EmployeeFormPage.tsx:351`, `:549-563`, `DepartmentFormPage.tsx:206`, `:295-309` | Nút Hủy, breadcrumb bấm được khi đang lưu | `aria-disabled`, `hasLeftFormRef`. Menu và Back vẫn rời được, giới hạn đã chấp nhận |
| FE-3 | Trung bình | Đã sửa | `EmployeeFormPage.tsx:130`, `DepartmentFormPage.tsx:49`, `utils/parseId.ts` | `Number(params.id)` đọc `2127e0` thành 2127 | Dùng `parseId` |
| FE-4 | Thấp | Đã sửa | `utils/parseId.ts` | Regex id lặp 3 lần | Một hàm chung; `MAX_ID` bằng giới hạn `int` |
| FE-5 | Thấp | Còn | `DepartmentFormPage.tsx:136-158`, `EmployeeFormPage.tsx:271-293`; `DepartmentsPage.tsx:156-163`, `DepartmentDetailPage.tsx:194-201`, `EmployeesPage.tsx:337-344` | `showSaveError` và khối thông báo lỗi lặp gần nguyên văn | Sửa một chỗ dễ quên chỗ khác. Lượt 6 chọn không làm |
| FE-6 | Thấp | Còn | `EmployeeFormPage.tsx` (579 dòng), `EmployeesPage.tsx` (530 dòng) | Hai file vượt ngưỡng 500 dòng, dài thêm sau lượt 6 | Khó đọc, khó trình bày khi demo |
| FE-7 | Thấp | Đã sửa | `EmployeesPage.tsx:45-47` | `charAt(0)` cắt đôi surrogate | Dùng `Array.from` |
| FE-8 | Thấp | Đã sửa | `EmployeesPage.tsx:53-55`, `:110` | Chuỗi tìm từ địa chỉ không chuẩn hóa | Dùng `normalizeSearch` |
| FE-9 | Thấp | Đã sửa | `DepartmentDetailPage.tsx:110-116`, `:138` | Gọi `focus()` lúc hộp thoại chưa đóng | Dùng `headingFocusRequest` |
| FE-10 | Thông tin | Đã sửa (chưa đọc lại) | `components.css`, `tokens.css` | CSS thừa, màu viết thẳng | Lượt 6 ghi đã làm; lượt này chỉ đọc comment CSS |
| FE-11 | Thông tin | Còn | `frontend/package.json` | Không có test tự động cho React | Đúng `team.md`; `FE-12` đến `FE-16` chỉ kiểm được bằng tay hoặc trình duyệt |
| FE-12 | Trung bình | Còn | `EmployeeFormPage.tsx:339-340`, `:362-392` | Khi phòng ban đang tải, "Đang tải dữ liệu…" hiện cùng "Không tìm thấy nhân viên" hoặc "Không tải được thông tin nhân viên" | Lượt 8 đã tái hiện với `/employees/999999/edit`. `/employees/abc/edit` cùng đường |
| FE-13 | Trung bình | Còn | `DepartmentDetailPage.tsx:164-168`, `:143`; `DepartmentFormPage.tsx:187`, `:297` | Mở sửa từ chi tiết phòng ban, Hủy về danh sách, không về chi tiết. Liên kết không gửi `state`, form không đọc `state` | Lượt 8 đã tái hiện. Form nhân viên đã làm đúng (`EmployeeFormPage.tsx:66-92`) |
| FE-14 | Trung bình | Còn | `EmployeeFormPage.tsx:143`, `:243-246`, `:271-293`, `:339-340` | Lưu ra 400 "Phòng ban không tồn tại": ô chọn vẫn giữ phòng đã xóa, muốn chọn lại phải F5 | Đọc code, chưa chạy. `retryDepartments` ở chế độ sửa làm form biến mất; `values.departmentId` phải xóa nếu phòng không còn |
| FE-15 | Trung bình | Còn | `client.ts:15-17`, `:127`, `:224-232` | Hết 10 giây lúc POST, PUT, DELETE báo "Không kết nối được máy chủ" dù server có thể đã lưu | Người dùng thử lại rồi gặp 409 hoặc 404 khó hiểu |
| FE-16 | Thấp | Còn | `EmployeesPage.tsx:156-167`, `:390`, `:395`, `:423-470` | Có `?departmentId=` mà tải phòng ban lỗi: ô lọc bị khóa, không có nút bỏ lọc, không thử lại được | Chỉ thoát bằng sửa địa chỉ hoặc F5 |
| FE-17 | Thấp | Còn | `client.ts:226`; `:54-55`, `:62-63`, `:70-71`, `:193-194`; `:35`, `:37` | Nhánh `"TimeoutError"` không xảy ra vì `abort()` không kèm lý do; `ApiError.title`, `.detail` được gán mà không nơi nào đọc; `type`, `status` ở `ProblemDetails` không dùng | Grep toàn `frontend/src`. Chưa có ghi chép chi tiết "code chết" là mục nào; `ApiError.detail` có thể cố ý giữ |
| FE-18 | Thấp | Còn | `SearchBox.tsx:10`, `:26`; `EmployeesPage.tsx:465` | Comment gọi nút là "Xóa tìm kiếm", nút thật là "Xóa bộ lọc" | Comment lệch giao diện |
| FE-19 | Thông tin | Còn | `EmployeeFormPage.tsx:354-358`, `DepartmentFormPage.tsx:209-213` | Trang không tìm thấy vẫn hiện tiêu đề "Sửa …" và câu "Trường có dấu * là bắt buộc." | Không nằm trong yêu cầu; có thể gộp khi sửa `FE-12` nếu chủ dự án muốn |

## Tài liệu

| Mã | Mức | Trạng thái | Vị trí | Phát hiện | Lý do |
|---|---|---|---|---|---|
| DOC-1 | Trung bình | Đã sửa (chưa đọc lại) | `docs/danh-sach-api.md` | Hai dòng nói ngược nhau về chuỗi tìm lạ | FR5 lượt 6 |
| DOC-2 | Trung bình | Đã sửa | `EmployeeCrud.Api.http:31-33` | Nhãn xóa phòng ban | Nay ghi 404 và cách thấy 409. Hai nhãn khác cùng loại ở `DOC-11` |
| DOC-3 | Thấp | Đã sửa | `EmployeeCrud.Api.http`, `docs/danh-sach-api.md` | Số thứ tự thao tác lệch | Đối chiếu tiêu đề: cùng thứ tự GET, POST, GET theo id, PUT, DELETE |
| DOC-4 | Thấp | Đã sửa (chưa đọc lại) | `docs/danh-sach-api.md` | Ghi "không cho bấm xóa" | FR5 lượt 6 |
| DOC-5 | Thấp | Đã sửa (chưa đọc lại) | `docs/so-do-database.md` | Không nhắc `docs/du-lieu-mau.sql` | FR5 lượt 6 |
| DOC-6 | Trung bình | Đã sửa | `07-kiem-thu-va-demo.md:60`, `:73`, `:74`, `:79` | A01, A02, A07, V02 sai kết quả mong đợi | Đã đối chiếu lượt này |
| DOC-7 | Thấp | Đã sửa (chưa đọc lại) | File `00`–`05` | Bản nháp học khác bài thật | FR6.2 lượt 6 |
| DOC-8 | Thấp | Đã sửa (chưa đọc lại) | `docs/` | Xưng hô lẫn lộn | FR6.3 lượt 6 |
| DOC-9 | Trung bình | Còn | 78 dòng ở 26 file `frontend/src`, 108 dòng ở 27 file `backend/EmployeeCrud.Api`; danh sách từng dòng ở `developer-scan.md` của `261104-sua-loi-luot-8` | Comment chứa mã hồ sơ, lịch sử sửa, tên người, tên tài liệu nội bộ. `backend/EmployeeCrud.Api.Tests` thêm 33 dòng ở 8 file, chưa soát | Người đọc repo không có hồ sơ thì không tra được mã. Mã `BR*` không duy nhất giữa các phần. Trước đây xếp mức Thông tin với 47 dòng; số đó thấp hơn thực tế, lượt 8 ghi khoảng 160 dòng |
| DOC-10 | Trung bình | Còn | `07-kiem-thu-va-demo.md:40-65`, cụ thể F01, F02, F06, F07, F09–F13, V01, V06, V07 | 12 trên 21 mục F, V tả giao diện cũ (form chung trang, nút "Thêm", "Cập nhật", "Cancel", câu "Chưa có nhân viên.") | `team.md` lấy danh sách này làm chuẩn kiểm tay. F10 không còn làm được như viết. Bảng đối chiếu ở `developer-scan.md` |
| DOC-11 | Thấp | Còn | `EmployeeCrud.Api.http:11`, `:51` | Nhãn nói "sẽ ra 409", "email trùng ra 409" nhưng dữ liệu mẫu trong khối chạy lần đầu ra 201 | Phát hiện `R-01` ở review code lượt 6, chưa sửa |
| DOC-12 | Thấp | Còn | `TextInput.cs:16` | Thiếu dấu phẩy sau `(ví dụ U+200B, U+202E)` | Phát hiện `R-05` ở review code lượt 6, chưa sửa |
| DOC-13 | Thông tin | Còn | `07-kiem-thu-va-demo.md:119`, `:133` | Gợi ý demo "5–10 nhân viên" trong khi có dữ liệu 80 người; câu 10 nêu "xử lý `DbUpdateException`, kiểm thử tự động" như việc tương lai dù đã có | Ngoài danh sách F, V, không thuộc yêu cầu |
| DOC-14 | Thông tin | Còn | `code-generation-plan.md` của lượt 6 | Kế hoạch ghi dự án không dùng `data-testid`; `frontend/src` có 31 thuộc tính | Lượt 8 ghi 32. Hồ sơ cũ, không cần sửa; phần tử mới nên theo mẫu có sẵn |

## Nối intent với phát hiện

Bảng cho `261104-sua-loi-luot-8`. Các mục của `261104-sua-loi-luot-6` đã xong, xem cột Trạng thái ở trên.

| Mục intent | Phát hiện | File sẽ chạm | Mức ảnh hưởng | Kiểm bằng |
|---|---|---|---|---|
| 1. Làm sạch comment | `DOC-9` | 53 file trong vùng quét; `Tests` nếu chủ dự án chọn | Rộng nhưng không đổi hành vi | `npm run verify`, grep lại mẫu ra 0 dòng |
| 2. Danh sách F, V | `DOC-10` | `07-kiem-thu-va-demo.md` | Thấp | Đối chiếu từng mục với giao diện |
| 3. Đang tải và không tìm thấy | `FE-12` | `EmployeeFormPage.tsx` | Nhỏ | Chromium, API chậm giả lập |
| 4. Hủy về chi tiết | `FE-13` | `DepartmentDetailPage.tsx`, `DepartmentFormPage.tsx`, có thể tách hàm dùng chung từ `EmployeeFormPage.tsx` | Vừa | Chromium |
| 5. PUT trả 404 | `BE-11` | `DepartmentService.cs` | Nhỏ | Test hồi quy trong `DepartmentServiceTests` |
| 6. Nạp lại phòng ban | `FE-14` | `EmployeeFormPage.tsx` | Vừa | Chromium, xóa phòng trong lúc form mở |
| 7. Hết giờ lúc ghi | `FE-15` | `client.ts` | Vừa: mọi lời gọi ghi | Chromium, API chậm giả lập |
| 8. Bỏ lọc khi tải phòng ban lỗi | `FE-16` | `EmployeesPage.tsx` | Nhỏ | Chromium, chặn `GET /api/departments` |
| 9. Việc nhỏ | `DOC-11`, `DOC-12`, `BE-13`, `FE-17`, `BE-12` | `EmployeeCrud.Api.http`, `TextInput.cs`, `Employee.cs`, `client.ts`, `ErrorMapper.cs` | Thấp | `npm run verify` |

Ngoài intent, cần chủ dự án quyết nếu muốn xử lý: `BE-3`, `FE-5`, `FE-6`, `FE-18`, `FE-19`, `DOC-13`.
