# Yêu cầu bảo mật — U5 `u5-handover`

> **Nguồn:** `inception/requirements-analysis/requirements.md` (NFR2, NFR7), `construction/u5-handover/functional-design/functional-spec.md` (WF1–WF4, mục 7), `construction/u5-handover/functional-design/rules.md` (BR1.3, BR1.5, BR2.4, BR3.2), `inception/contract-design/contract-summary.md` (C3: CORS, phong bì lỗi), quyết định "Làm gọn" của Hiệp cho bước này.
>
> U5 chỉ viết tài liệu, không thêm code, không thêm đường vào hệ thống. Rủi ro bảo mật duy nhất của U5 là **tài liệu làm lộ thứ không được lộ** hoặc **chỉ người cài làm sai cấu hình**. Không có đăng nhập, phân quyền (bị cấm trong `project.md`), nên không có yêu cầu xác thực.

## Yêu cầu

| ID | Yêu cầu | Kiểm bằng cách nào | Luật liên quan |
|---|---|---|---|
| NFR2.1 | Không file tài liệu nào (README, sơ đồ DB, danh sách API) chứa mật khẩu PostgreSQL thật. Ví dụ connection string dùng chữ giữ chỗ; README chỉ cách đặt bằng user-secrets. | Trước khi Hiệp commit: tìm chuỗi mật khẩu thật bằng `git grep` trên toàn repo, kết quả phải rỗng. Không ghi mật khẩu vào lệnh kiểm (Hiệp tự gõ). | BR1.3 |
| NFR2.2 | JSON mẫu và câu lệnh thử ràng buộc chỉ dùng dữ liệu giả, tên và email mẫu (ví dụ miền `@congty.vn` hoặc `@example.com`), không dùng thông tin người thật. Nhân viên "Đỗ Văn An" hiện có trong database là dữ liệu thử; nếu chép vào tài liệu phải là dữ liệu giả. | Đọc lại JSON trong tài liệu trước khi đối chiếu. | BR3.2 |
| NFR2.3 | Kết quả gọi API chép vào tài liệu không chứa thông tin nội bộ của máy: không chứa đường dẫn ổ đĩa, tên máy, chuỗi lỗi chi tiết của server (stack trace). ProblemDetails chỉ có lời báo tiếng Việt như C3 quy định. | Đọc lại từng body lỗi trong mục ví dụ lỗi. | BR3.4 |
| NFR2.4 | Câu lệnh thử ràng buộc trong sơ đồ DB phải trả database về như cũ và không đổi cấu trúc bảng (không xóa ràng buộc, không xóa bảng). | Sau khi thử, đếm lại số phòng ban, nhân viên bằng pgAdmin, phải bằng trước khi thử. | BR2.4 |
| NFR7.1 | README ghi đúng địa chỉ chạy của frontend, vì API chỉ cho phép đúng địa chỉ đó gọi tới (CORS). Không hướng dẫn người cài mở CORS cho mọi nguồn để "chữa" lỗi. | So địa chỉ trong README với cấu hình CORS của backend và cấu hình Vite. | BR1.5 |

## Mối nguy đã xét và không áp dụng

- **Lộ khóa, token API:** dự án không có khóa hay token nào (không đăng nhập, không dịch vụ ngoài).
- **Đẩy lên GitHub công khai:** Hiệp tự đẩy sau, từng bước (`project.md` Forbidden). NFR2.1 bảo đảm khi đó repo không chứa mật khẩu.
- **Người cài dùng mật khẩu yếu cho PostgreSQL:** nằm ngoài phạm vi tài liệu này; README chỉ nhắc dùng mật khẩu đã đặt lúc cài PostgreSQL.
