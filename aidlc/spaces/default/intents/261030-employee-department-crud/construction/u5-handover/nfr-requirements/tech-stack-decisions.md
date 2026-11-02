# Quyết định công cụ — U5 `u5-handover`

> **Nguồn:** `inception/requirements-analysis/requirements.md` (NFR1–NFR8, FR7.1–FR7.4), `construction/u5-handover/functional-design/functional-spec.md` (WF1–WF5), `construction/u5-handover/functional-design/rules.md` (BR1.1–BR4.4), `inception/contract-design/contract-summary.md` (C1, C2, §4 cổng thật), `project.md` (Tech Stack đã khóa).
>
> Công nghệ của ứng dụng đã khóa từ trước (React + TypeScript + Vite, ASP.NET Core .NET 10, EF Core + Npgsql, PostgreSQL 18). U5 không chọn công nghệ mới; file này chỉ ghi **công cụ dùng để viết và kiểm tài liệu**, và các yêu cầu phi chức năng còn lại của U5.

## Công cụ

| Việc | Chọn | Vì sao | Cách khác đã xét |
|---|---|---|---|
| Định dạng tài liệu | Markdown (`.md`) trong repo | Đọc được ngay trên GitHub và VS Code, nằm cùng code nên đổi code thì sửa tài liệu cùng lần commit | Word, PDF: không xem được trong repo, khó so khác biệt |
| Sơ đồ database | Mermaid `erDiagram` trong Markdown, kèm mô tả bằng chữ | GitHub và VS Code vẽ được; là chữ nên sửa và so khác biệt được; không cần công cụ vẽ riêng | Ảnh xuất từ pgAdmin ERD: không sửa được bằng chữ, dễ cũ đi |
| Lấy JSON mẫu | PowerShell `Invoke-WebRequest` lúc backend chạy | Có sẵn trên Windows, không cài thêm; lấy được mã trạng thái, header và body thật (Q4 = A) | `curl`: cũng có, nhưng PowerShell đọc header dễ hơn trên máy này |
| Kiểm lại API | Postman (Hiệp gọi) | Đề bài và AC5.2 ghi rõ Postman; đã cài trên máy | Chỉ dùng trang OpenAPI: không đúng yêu cầu Postman |
| Kiểm sơ đồ DB | pgAdmin 4 (Hiệp mở) | Đã cài; `psql` không có trong PATH | `psql`: phải đổi PATH, cần Hiệp duyệt |
| Kiểm bản clone sạch | `git clone` sang thư mục ngoài dự án, Hiệp tự làm theo README | Đúng vai người cài trong US5.1 (Q3 = A) | AI tự clone: không chứng minh được người khác làm theo được |

Không cài thêm gói hay công cụ nào (`project.md` Forbidden: không cài ra ngoài dự án khi chưa duyệt).

## Yêu cầu phi chức năng khác của U5

| ID | Yêu cầu | Kiểm bằng cách nào |
|---|---|---|
| NFR1.1 | Làm theo README từ bản clone sạch thì chạy được backend (`dotnet run`), frontend (`npm run dev`) và database `employee_db` trên PostgreSQL 18 cổng 5432, không cần bước nào ngoài README. | Hiệp tự clone và làm (BR1.4, BR4.3) |
| NFR3.1 | Sơ đồ DB mô tả đúng hai lớp chặn ở database: khóa ngoại chặn xóa phòng ban còn nhân viên và chỉ mục không trùng (không phân biệt hoa thường) cho tên phòng ban, email. | Đối chiếu pgAdmin và chạy thử ràng buộc (BR2.3, BR2.4) |
| NFR4.1 | README ghi lệnh chạy unit test và đo độ phủ, để người nhận bài tự chạy lại được. | Hiệp chạy lệnh trong README ở bản clone |
| NFR6.1 | Tài liệu đủ rõ để Hiệp trình bày luồng React → Web API JSON → ASP.NET Core → PostgreSQL: README có đoạn giới thiệu luồng; danh sách API nối mỗi thao tác với bảng nó đọc hoặc ghi. | Hiệp đọc lại và tự kể lại được luồng một request |

## Không áp dụng cho U5

- **NFR5 (thời gian phản hồi):** U5 không đổi code; tốc độ đo ở Build and Test.
- **NFR8 (định dạng, lint code):** U5 không có code. Tài liệu Markdown không bắt buộc qua linter.
