## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-02T17:51:01Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | README.md > mục 3 "Đặt connection string bằng user-secrets" | README viết `Remove-Variable p, s` "xóa nó khỏi bộ nhớ". Thực tế lệnh này chỉ bỏ tên biến; chuỗi mật khẩu dạng văn bản vẫn nằm trong bộ nhớ tiến trình PowerShell cho tới khi bị thu dọn, và dòng `PtrToStringAuto(SecureStringToBSTR(...))` không giải phóng vùng BSTR. Phần "không vào lịch sử PowerShell" thì đúng. | Sửa câu giải thích thành "bỏ biến sau khi dùng" (không hứa xóa khỏi bộ nhớ), hoặc thêm `ZeroFreeBSTR`. Đây chỉ là chỗ nói quá, không ảnh hưởng chạy. | New |
| R-02 | Minor | README.md > mục 11 "Sự cố thường gặp", lỗi Smart App Control | README bảo "chỉnh Smart App Control trong Windows Security, cân nhắc trước khi làm" nhưng không nói rõ hệ quả. Theo hiểu biết của tôi (chưa kiểm trên máy), trên Windows 11 tắt Smart App Control thường không bật lại được nếu không cài lại hệ điều hành. Người làm theo README có thể tắt mà không biết. | Thêm một câu nêu rõ hệ quả này (hoặc ghi "chưa kiểm") và gợi ý thử build lại trước. Kiểm với tài liệu Microsoft rồi mới khẳng định. | New |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/code-generation/unit-test-instructions.md > dòng T6 | Tiêu chí T6 chỉ cho phép chữ giữ chỗ `<mật-khẩu-của-bạn>`, nhưng README đã đổi sang `$p` và mẫu che `***`. Chạy T6 hôm nay ra 3 dòng (README.md dòng 48, 57, 60), đều không có mật khẩu thật; code-summary đã ghi nhận chỗ lệch này. Tiêu chí chưa được cập nhật. | Sửa cột "Đạt khi" của T6 thành "mọi dòng khớp chỉ chứa biến `$p` hoặc `***`". Không cần đổi tài liệu. | New |
| R-04 | Minor | docs/danh-sach-api.md > Quy ước chung và mục "Lỗi 400" | Tài liệu ghi đúng hành vi thật: lỗi 400 trả `application/json` và thiếu trường `type`, khác FR4/C3 (yêu cầu `application/problem+json`). Người đọc handover sẽ thấy 404/409 và 400 có hai kiểu khác nhau mà không rõ đó là lệch đã biết. Việc này đã nằm trong danh sách chuyển cho Build and Test (mục 4), nhưng chưa có ghi chú ngay trong tài liệu. | Thêm một dòng trong tài liệu (ví dụ "đây là hành vi hiện tại, đang chờ xem xét") để người đọc không tưởng là lỗi tài liệu. Việc sửa code do Build and Test quyết. | New |
| R-05 | Suggestion | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/code-generation/code-summary.md > §3.6 và §5 mục 2 | Hai điểm cần Hiệp nắm khi duyệt. (a) README chưa được chạy từ đầu trên máy trắng: bước đặt user-secrets lần đầu và tạo database mới chỉ kiểm bằng cách đọc lệnh (đã ghi là hạn chế cùng máy). (b) `ErrorMapper` chưa nhận SQLSTATE 23001, nên khi hai thao tác chen nhau, xóa phòng ban có thể trả 500 thay vì 409; tài liệu API mô tả 409 chỉ đúng trên đường đi qua Service. Cả hai đã được ghi đúng chỗ. | Không cần sửa U5. Hiệp nhớ rằng hai điểm này là rủi ro còn mở, và (b) cần xử lý ở Build and Test. Thư mục `C:UsersASUSthu-clone-employee-crud` ngoài dự án cũng cần Hiệp tự quyết giữ hay xóa. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| T1 | `10` | Đạt: đủ 10 thao tác API. |
| T2 | 4 dòng `#### Lỗi` (400 ở dòng 226, 404 ở 248, 409 ở 268 và 290); `application/problem+json` = 4 | Đạt: đủ 400, 404, 409, số lần ≥ 3. |
| T3 | Khớp `erDiagram`, `departments {`, `employees {` (dòng 15, 17, 21) | Đạt. |
| T4 | README có 12 mục `## 1.` đến `## 12.` | Đạt: đủ các mục yêu cầu. |
| T5 | Khớp ở dòng 86, 121, 161, 162 của README | Đạt: có liên kết tới cả hai tài liệu. |
| T6 | 3 dòng khớp (README.md 48, 57, 60): `Password=$p`, mẫu che `***`, câu kết quả mong đợi; hai tài liệu kia không có | Không có mật khẩu thật. Tiêu chí chữ trong T6 đã cũ, xem Minor ở trên. |
| Đối chiếu code | `launchSettings.json` 5081 và 7205; `appsettings.json` AllowedOrigins 5173; `package.json` node `>=24`; `dotnet-tools.json` dotnet-ef 10.0.14 và reportgenerator; `Program.cs` mở OpenAPI và Swagger UI trong `IsDevelopment()`; `StartupChecks.cs` có lời báo "Thiếu cấu hình ConnectionStrings:Default"; migration có `ux_departments_name`, `ux_employees_email` trên `lower(...)`, `fk_employees_department`, `ix_employees_department_id`, `OnDelete Restrict`, độ dài 100 và 254 | Mọi dữ kiện kiểm được đều khớp tài liệu. |
| Phạm vi thay đổi | `git show --stat`: commit `4bde213` chỉ có 3 file tài liệu; `b78a4eb` chỉ sửa `README.md` | Khớp BR4.1: không đụng code, migration hay cấu hình. |

### Summary

Ba tài liệu đủ nội dung, 6 lệnh kiểm đạt, các dữ kiện kiểm được đều khớp code đang có, và README đã được chứng minh bằng một lượt clone sạch (có sửa hai chỗ vướng). Phạm vi thay đổi sạch. Chỉ còn bốn điểm Minor (nói quá về xóa bộ nhớ, thiếu cảnh báo về Smart App Control, tiêu chí T6 đã cũ, thiếu ghi chú về lỗi 400) và một điểm lưu ý. Cả hai việc còn mở chính (23001 chưa được ánh xạ, 400 khác định dạng problem+json) đã được chuyển đúng sang Build and Test.
