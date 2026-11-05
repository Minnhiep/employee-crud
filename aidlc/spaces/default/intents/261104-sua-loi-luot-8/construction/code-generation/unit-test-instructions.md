# Hướng dẫn test cho việc sửa lỗi lượt 8

## Công cụ và cấu hình

xUnit trong project `backend/EmployeeCrud.Api.Tests`, đã có sẵn, không thêm gói. Service dùng database giả trong bộ nhớ (InMemory), đúng `team.md`.

## Cách chạy

Chỉ các lớp test mà việc này chạm tới:

```powershell
dotnet test backend/EmployeeCrud.slnx --filter "FullyQualifiedName~DepartmentServiceTests|FullyQualifiedName~EmployeeServiceTests|FullyQualifiedName~ErrorMapperTests"
```

Nếu `dotnet test` báo Smart App Control chặn file `.dll` (lỗi 0x800711C7), xử lý theo luật ở `CLAUDE.md` của thư mục `27-10`: thêm một comment có ích vào file nguồn của `.dll` bị chặn, tối đa 2 lần, vẫn bị chặn thì dừng hỏi Hiệp, và ghi lại trong báo cáo.

## Ca cần có

| Yêu cầu | Ca test |
|---|---|
| FR5.1 | Phòng bị xóa sau khi service đã đọc, PUT tên không đổi: ném lỗi không tìm thấy (404), không trả dữ liệu |
| FR5.2 | PUT thành công: tên đúng, `employeeCount` đúng |
| FR9.5 | Lỗi trùng tên và trùng email vẫn trả đúng khóa `name`, `email` |

## Mục tiêu độ phủ

Mức sàn của dự án: ít nhất 80% số dòng của các lớp service. Build and Test đo mức này trên toàn bộ test, bằng lệnh riêng; lệnh ở trên không dùng để kết luận độ phủ.

## Giả lập và dữ liệu thử

Dùng lại cách tạo `DbContext` InMemory và các lớp hỗ trợ trong `TestSupport/` đang có. Không chạm database thật trong unit test.

React không có test tự động theo `team.md`: FR3, FR4, FR6, FR7, FR8 kiểm bằng Chromium thật, dữ liệu thử phải xóa lại sau khi kiểm.
