# Tóm tắt sinh code: sửa 9 nhóm phát hiện lượt rà 8

## Tình trạng

**Đã xong cả 10 bước.** `npm --prefix frontend run verify` mã thoát 0, **148/148 test** (146 cũ, 2 mới). Smart App Control chặn `EmployeeCrud.Api.Tests.dll` rồi `EmployeeCrud.Api.dll` (lỗi 0x800711C7): 2 comment theo luật ở `CLAUDE.md` chưa đủ, Hiệp duyệt thêm tối đa 2 lần, comment ở `SeedBeforeSaveThenFailContext.cs` qua được file test, comment ở `DepartmentService.cs` qua được file API.

Không commit, không push, không tạo nhánh, không thêm gói. `HEAD` vẫn `6768935`, nhánh `main`.

## File đã đổi

| Nhóm | File |
|---|---|
| Logic backend | `backend/EmployeeCrud.Api/Departments/DepartmentService.cs`, `Employees/EmployeeService.cs`, `Platform/Errors/ErrorTitles.cs`, `Platform/Errors/ErrorMapper.cs` |
| Test | `backend/EmployeeCrud.Api.Tests/Departments/DepartmentServiceTests.cs`, file mới `backend/EmployeeCrud.Api.Tests/TestSupport/RemoveDepartmentBeforeSaveContext.cs` |
| Frontend | `frontend/src/api/client.ts`, `pages/employees/EmployeeFormPage.tsx`, `pages/employees/EmployeesPage.tsx`, `pages/departments/DepartmentFormPage.tsx`, `pages/departments/DepartmentDetailPage.tsx`, `components/SearchBox.tsx`, `styles/components.css` |
| Tài liệu | `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md`, `backend/EmployeeCrud.Api/EmployeeCrud.Api.http` |
| Chỉ comment | Các file `.cs`, `.ts`, `.tsx`, `.css` còn lại trong `backend/EmployeeCrud.Api`, `backend/EmployeeCrud.Api.Tests`, `frontend/src`, gồm comment trong 2 migration |

## Quyết định chính

- **FR5:** `UpdateAsync` đọc lại bằng `GetByIdAsync`, cùng mẫu với `EmployeeService`.
- **FR9.5:** khóa `NameKey`, `EmailKey` đặt ở `ErrorTitles`, cạnh `BodyKey`. `NameField`, `EmailField` tham chiếu lại nên không phải đổi nơi dùng.
- **FR3:** `isLoading` chỉ tính phòng ban khi `loadStatus === "ready"`, nên trang chỉ hiện đúng một trạng thái.
- **FR6:** thêm trạng thái `reloading`, khác `loading` ở chỗ không gỡ form. Nhận biết lỗi theo khóa `departmentId`. Bỏ chọn phòng đã mất đặt sau bước chọn sẵn, để không tự chọn thay người dùng. Nút Lưu khóa khi đang nạp lại.
- **FR4:** `returnPathFrom` chỉ nhận đúng `/departments/{id}` của phòng đang sửa.
- **FR7:** `toApiError` nhận thêm `method`; giữ `kind: "network"` nên các trang không phải đổi.
- **FR8:** nút "Thử lại" hiện mỗi khi tải phòng ban lỗi, kể cả khi không lọc; nút "Bỏ lọc phòng ban" chỉ hiện khi đang lọc.
- **Số thứ tự test:** `#N`, `D1`… không thuộc mẫu của FR1.1 nên giữ lại. Comment đầu file nay nói rõ chúng chỉ để gọi tên ca test.

## Độ phủ

Đo bằng Microsoft Code Coverage: `DepartmentService`, `EmployeeService`, `EmployeeService.ValidInput`, `TextInput` 100%; `ErrorMapper` 97,6%; toàn assembly 47,8%. Mức sàn 80% của lớp service đạt. Báo cáo ở `backend/TestResults/luot9-coverage-report/Summary.txt`.

## Tái hiện trước khi sửa

| Mã | Cách tái hiện | Kết quả |
|---|---|---|
| `BE-11` | Test `Update_WithUnchangedName_WhenRowDisappearsBeforeSave_ThrowsNotFound` trên code chưa sửa | Không có lỗi nào được ném, tức API trả 200 cho phòng đã xóa. Tái hiện được |
| `FE-14` | Chromium: xóa phòng khi form đang mở, bấm Lưu | Ô chọn giữ mã phòng đã xóa, phòng đó vẫn trong danh sách. Tái hiện được |
| `FE-15` | Chromium: POST treo quá 10 giây | Sau 10,5 giây báo "Không kết nối được máy chủ". Tái hiện được |
| `FE-16` | Chromium: `?departmentId=2&search=a`, `GET /api/departments` trả 500 | Ô lọc khóa, không có nút bỏ lọc hay thử lại. Tái hiện được |

## Kết quả kiểm Chromium

Bản build với backend đã sửa, dữ liệu thật, giả lập API chậm và lỗi khi cần.

| FR | Kết quả |
|---|---|
| FR3 | Đạt. `/employees/999999/edit`, `/employees/abc/edit`, `/departments/999999/edit`, `/departments/abc/edit`: đúng một trạng thái, tiêu đề "Không tìm thấy …", không có câu trường bắt buộc. Tải lỗi 500: giữ "Sửa …", bỏ câu trường bắt buộc. Đường bình thường vẫn chờ phòng ban rồi hiện form đúng phòng |
| FR4 | Đạt. Từ chi tiết: Hủy và Lưu về chi tiết, có lời báo. Gõ thẳng địa chỉ: về danh sách. Ba giá trị `returnTo` lạ đều về danh sách. Sau F5 vẫn giữ đường quay về |
| FR5 | Đạt ở test hồi quy và API thật: PUT tên không đổi 200 với `employeeCount` đúng; PUT mã không có 404 |
| FR6 | Đạt. Tạo mới và sửa: phòng mất bị bỏ chọn, ô báo lỗi, họ tên và email còn, chọn phòng khác lưu được. Phòng còn thì giữ lựa chọn. Nạp lại lỗi: form còn, hiện "Thử lại". "Thử lại" chậm: form không biến mất |
| FR7 | Đạt. POST, PUT ra đúng câu "đã lưu", DELETE nhân viên ra đúng câu "đã xóa", nút bật lại. GET quá giờ và mất mạng thật vẫn báo câu cũ. Rời form lúc đang lưu không hiện câu báo |
| FR8 | Đạt. "Bỏ lọc phòng ban" giữ `search=a`, nút biến mất, focus về ô tìm. "Thử lại" bật lại ô lọc và giữ phòng đang lọc |

`DELETE` phòng ban quá giờ đi chung nhánh với `DELETE` nhân viên nhưng không kiểm riêng trên trình duyệt.

Đối chiếu danh sách F, V trên trình duyệt: F01–F13, V01–V03, V05–V07 khớp nội dung mới. F02 kiểm bằng giả lập danh sách rỗng. V07 giả lập mất kết nối, không tắt backend thật. **F14 không chạy lại lượt này** (lượt 8 đã đạt). **V04 không chạy riêng**, V05 đi cùng đường và đạt.

## Làm sạch comment

Biểu thức ở Step 8 trên `frontend/src`, `backend/EmployeeCrud.Api`, `backend/EmployeeCrud.Api.Tests` ra **0 dòng** (đã đối chứng glob có quét đúng file).

**Danh sách ngoại lệ theo `file:dòng`: không có.** Biểu thức không khớp `U+...`, `WCAG`, `RFC`, regex hay chữ SVG, nên không dòng nào cần giữ lại làm ngoại lệ.

Bằng chứng không đổi logic:
- Frontend: mã băm bản build giữ nguyên trước và sau Step 8 với cùng biến môi trường (`index-CMRyHJRF.js`, `index-DsZ7TCr-.css`).
- Backend: lọc `git diff -U0 HEAD`, các dòng code khác comment đều thuộc Step 2–4 hoặc thay đổi lượt 6; dòng `"\0", //` chỉ đổi phần comment. Do lượt 6 chưa commit nên `git diff` không tách riêng được Step 8, đây là soát bằng mắt.
- Quét 88 file nguồn và tài liệu: 0 noncharacter thật.

## Giới hạn đã biết

- Comment `EmployeeFormPage.tsx` trước đây nói state mất khi F5; kiểm thật thấy state vẫn còn, nên đã bỏ chữ F5.
- Trang "Không tìm thấy" vẫn có mục đường dẫn cuối "Sửa".
- Lỗi lưu sau khi đã rời form chỉ ghi console, đúng phần ngoài phạm vi.
- Số `#N`, `D1` trong test không còn tra được ở đâu ngoài chính file test.

## Khác kế hoạch

1. **Backend chạy ở cổng 5082, không phải 5081.** Cổng 5081 đang do tiến trình 22552 giữ, chạy `dotnet run` từ `backend/TestResults/r01-cai-moi`. Đây là bản thử cài mới của lượt 8 chưa được tắt, sau đó đã tắt. Lệnh dùng: `dotnet run --project backend/EmployeeCrud.Api -- --urls http://localhost:5082`, build frontend với `VITE_API_BASE_URL=http://localhost:5082`. Bản `dist` cuối do `verify` build lại với giá trị mặc định.
2. **Thêm `.toolbar__actions` vào `components.css`,** file không có trong danh sách Touches, để hai nút xếp gọn cạnh ô lọc.
3. **Thêm file test `RemoveDepartmentBeforeSaveContext.cs`,** vì `ThrowingAppDbContext` không mô phỏng được ca này.
4. **Chạy `dotnet format whitespace` trên 3 file** (`DepartmentService.cs`, `ValidationResponseFactory.cs`, `RemoveDepartmentBeforeSaveContext.cs`) để qua `--verify-no-changes`. Đã so nội dung bỏ khoảng trắng: giống hệt.
5. **Bốn comment thêm theo luật Smart App Control:** hai ở `RemoveDepartmentBeforeSaveContext.cs`, một ở `SeedBeforeSaveThenFailContext.cs`, một ở `DepartmentService.cs`. Chạy `dotnet format whitespace` lại trên hai file sau.
6. **Một lần ghi kết quả `verify` ra file** `backend/TestResults/luot9-verify.log`, trái brief; đã xóa ngay.
7. **FR8.2** dùng nhãn "Bỏ lọc phòng ban" theo chốt R-03.

## Việc còn lại

- Kiểm lại trên Chromium ở Build and Test sau khi làm sạch comment.
- Hiệp xem `git diff` rồi tự commit.
