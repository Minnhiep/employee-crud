# Hướng dẫn test cho việc sửa lỗi lượt 6

## Công cụ và cấu hình

xUnit trong project `backend/EmployeeCrud.Api.Tests`, đã có sẵn, không thêm gói. Service dùng database giả trong bộ nhớ (InMemory), đúng `team.md`.

## Cách chạy

Chỉ các lớp test mà việc này chạm tới:

```powershell
dotnet test backend/EmployeeCrud.slnx --filter "FullyQualifiedName~DepartmentServiceTests|FullyQualifiedName~EmployeeServiceTests|FullyQualifiedName~LoggingTests"
```

Nếu `dotnet test` báo Smart App Control chặn file `.dll` (lỗi 0x800711C7), xử lý theo luật ở `CLAUDE.md` của thư mục `27-10`: thêm một comment có ích vào file nguồn của `.dll` bị chặn, tối đa 2 lần, vẫn bị chặn thì dừng hỏi Hiệp, và ghi lại trong báo cáo.

## Ca cần có

| Yêu cầu | Ca test |
|---|---|
| FR1.1, FR1.4 | Tên phòng, họ tên, email có U+FFFE, U+FFFF, U+FDD0, U+FDEF, U+1FFFE, U+10FFFF: báo lỗi dữ liệu, không ném ngoại lệ, không lưu |
| FR1.2, FR1.4 | Ô tìm có các ký tự trên: trả danh sách rỗng |
| FR1.1 | Chữ Việt và emoji vẫn được nhận (đường đúng) |
| FR9.1 | Email đúng 254 ký tự nhận; 255 ký tự từ chối |
| FR9.2 | Test hủy request trong `LoggingTests.cs` chờ theo điều kiện, không dựa vào hẹn giờ cố định |

## Mục tiêu độ phủ

Mức sàn của dự án: ít nhất 80% số dòng của các lớp service. Build and Test đo mức này trên toàn bộ test, bằng lệnh riêng; lệnh ở trên không dùng để kết luận độ phủ.

## Giả lập và dữ liệu thử

Dùng lại cách tạo `DbContext` InMemory đang có trong từng lớp test. Ký tự đặc biệt viết bằng mã thoát (ví dụ `"￾"`, `char.ConvertFromUtf32(0x1FFFE)`) để file test không chứa ký tự lạ. Không chạm database thật trong unit test.

React không có test tự động theo `team.md`: FR1.3, FR3, FR4, FR8 kiểm bằng trình duyệt thật, dữ liệu thử phải xóa lại sau khi kiểm.
