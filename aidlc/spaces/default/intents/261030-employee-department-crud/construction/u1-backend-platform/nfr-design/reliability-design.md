# Thiết kế tin cậy: u1-backend-platform

> **Nguồn:** `nfr-requirements/reliability-requirements.md` (NFR1.1–NFR1.4, NFR3.3), `nfr-requirements/tech-stack-decisions.md`, `functional-design/functional-spec.md` (W1, W4).

## 1. Khởi động kiểm cấu hình (NFR1.1)

- Lúc khởi động đọc `ConnectionStrings:Default`. Nếu rỗng thì ghi log mức Critical kèm câu hướng dẫn `dotnet user-secrets set ...` (không in giá trị nào), rồi ném lỗi để tiến trình thoát với mã khác 0.
- Lời báo bằng tiếng Việt, vì Hiệp là người đọc.
- **Kiểm:** Hiệp tự làm theo hướng dẫn, AI không xóa bí mật của Hiệp.
  1. Chạy `dotnet user-secrets remove "ConnectionStrings:Default"`.
  2. Chạy `dotnet run` và xem lời báo.
  3. Chạy lại `dotnet user-secrets set ...` để đặt lại.

## 2. Kiểm kết nối thật (NFR1.2, NFR1.3)

- Project API thêm gói `Microsoft.EntityFrameworkCore.Design`. Thiếu gói này thì lệnh `dotnet ef` báo lỗi ngay.
- Thêm tool manifest `dotnet-ef` (`.config/dotnet-tools.json`); Hiệp chạy `dotnet tool restore`.
- **Tiêu chí đạt của W4:** `dotnet ef database update` chạy thành công **khi chưa có migration nào**. Lệnh phải mở kết nối thật, rồi tạo bảng `__EFMigrationsHistory`. Pass khi pgAdmin thấy bảng đó trong `employee_db`.
  - Code Generation chạy thử lệnh này trên máy **sau khi** Hiệp đã đặt user-secrets, rồi ghi kết quả thật vào hướng dẫn.
  - Nếu EF Core 10 không tạo bảng lịch sử khi chưa có migration, thì tiêu chí thay bằng `dotnet ef migrations list`: lệnh này kết nối database để biết migration nào đã áp dụng, và báo lỗi khi không kết nối được.
- **Môi trường:** `launchSettings.json` đặt `ASPNETCORE_ENVIRONMENT=Development`. Lệnh `dotnet ef` thường chạy ở Development nên đọc được user-secrets. Nếu không đọc được thì hướng dẫn thêm `-- --environment Development` vào cuối lệnh.

## 3. Mất database khi đang chạy (NFR1.4)

- **Không** dùng cơ chế tự thử lại (retry) của Npgsql. Request lỗi trả 500 ngay, giao diện để người dùng bấm "Thử lại" (khớp Q3 của Contract Design: không tự gọi lại).
- Pool kết nối của Npgsql tự tạo lại kết nối ở lần gọi sau, khi database đã chạy lại.
- Ứng dụng không dừng khi mất database: chỉ request đó lỗi.

## 4. Không đổi lỗi thành thành công (NFR3.3)

- Bộ đổi lỗi chỉ trả mã 4xx hoặc 5xx.
- Unit test cho bộ đổi lỗi phủ từng nhánh:
  - NotFound → 404
  - Validation → 400
  - Conflict có field → 409 kèm `errors`
  - Conflict không field → 409 kèm `detail`
  - 23505 theo từng tên ràng buộc → 409
  - 23505 tên lạ → 500
  - 23503 dự phòng → 409
  - Lỗi lạ → 500

  Lỗi giả lập được dựng bằng cách tạo `PostgresException` (Npgsql có constructor công khai) bọc trong `DbUpdateException`.
