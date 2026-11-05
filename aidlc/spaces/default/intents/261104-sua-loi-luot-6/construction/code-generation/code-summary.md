# Tóm tắt sửa code: lượt 6 và các mục rà soát

## Kết quả kiểm

| Kiểm tra | Trước | Sau |
|---|---|---|
| Test backend | 138/138 | 146/146 (thêm 8 method, sửa 1) |
| `dotnet format --verify-no-changes` | 8 lỗi ở 6 file | Mã thoát 0 |
| `GET /api/employees?search=a%EF%BF%BEb` | 500 | 200 `[]` |
| Độ phủ `DepartmentService`, `EmployeeService`, `TextInput` | Không đo lại ở lượt này | 100% số dòng |
| `npm --prefix frontend run verify` | Không chạy `dotnet format` | Có chạy, mã thoát 0; file C# sai định dạng làm lệnh dừng với mã thoát 2 |

Test hồi quy noncharacter đã được kiểm chiều âm: tạm tắt luật thì đúng 5 ca đỏ, khôi phục thì xanh lại.

## Kiểm trên trình duyệt

Kiểm bằng Playwright tại `http://localhost:5173`, gồm giả lập API chậm 1,5 giây.

| Yêu cầu | Kết quả |
|---|---|
| FR1.3 | Đạt ở họ tên, email, tên phòng với U+FFFE, U+FDD0, U+1FFFE: báo lỗi cạnh ô, 0 request ghi |
| FR3.1, FR3.2, FR3.4 | Đạt ở hai form: bấm Hủy, bấm breadcrumb, Tab rồi Enter đều không rời form; focus giữ nguyên trên nút Hủy; hết lúc lưu thì Hủy dùng lại được |
| FR3.3 | Đạt: rời form bằng menu (form nhân viên) và nút Back (form phòng ban), lưu xong vẫn ở trang đang xem |
| FR4.1, FR4.2 | Đạt với 10 địa chỉ lạ gồm `2127e0`, `0x10`, `012`, `99999999999`, `2147483648`; id thật mở đúng người |
| FR8.1 | Đạt: emoji ở đầu và cuối họ tên, vòng chữ cái không vỡ |
| FR8.2 | Đạt: `?search=a%20%20b` cho ô tìm và API cùng dùng `a b` |
| FR8.3 | Đạt với 409 giả lập: hộp thoại đóng, focus ở tiêu đề trang |
| R-07 | Đạt khi xem 4 màn hình (danh sách nhân viên, danh sách phòng ban, form thêm, trang chi tiết kèm hộp thoại) và đo màu tính toán của thanh bên, logo, lớp phủ. Viền khung lỗi (`--color-danger-border`) không đo riêng; giá trị token chép nguyên mã cũ |

## Giới hạn đã biết

- **Lưu lỗi sau khi đã rời form (R-05):** người dùng không thấy thông báo, lỗi chỉ ghi ở `console.error`, vì ứng dụng không có vùng thông báo toàn cục. Đã kiểm với lỗi 500 giả lập.
- **Lưu thành công sau khi đã rời form:** bản ghi đã lưu nhưng không có lời báo "Đã thêm…", vì người dùng đã ở trang khác.
- **Menu bên trái vẫn bấm được khi đang lưu:** đúng lựa chọn Q4 A.

## Khác với phần Touches của kế hoạch

Các file sau không có trong phần Touches nhưng cần để làm đúng yêu cầu đã duyệt:

- `frontend/src/components/PageHeader.tsx`: breadcrumb nằm ở đây, nên thêm thuộc tính `disabled` cho từng mục (FR3.2).
- `backend/EmployeeCrud.Api.Tests/Platform/TestOnlyController.cs`: thêm bộ đếm request đã tới máy chủ để bỏ hẹn giờ hủy 300ms (FR9.2).
- `backend/EmployeeCrud.Api.Tests/Platform/LogCapturingWebAppFactory.cs`: mở mức Information cho dòng `Request finished` để bỏ lần chờ cố định 200ms (FR9.2).
- `docs/tim-hieu-technical-stack/06-cai-dat-moi-truong.md`: nằm trong `DOC-8`.

Xưng hô được sửa rộng hơn 5 vị trí trong `DOC-8`: mọi chỗ "em" trong `docs/`, vì grep cho thấy cùng một lỗi lặp ở các file `01`–`06`.
