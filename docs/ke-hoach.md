# Kế hoạch tìm hiểu technical stack

*Dự kiến trong 2 tuần*

## 1. Mục tiêu và phạm vi

Tìm hiểu nền tảng công nghệ để chuẩn bị cho dự án mới và xây dựng một demo CRUD hoàn chỉnh. Sau 2 tuần, cần giải thích được luồng React → API JSON → ASP.NET Core → PostgreSQL.

Thời lượng: 10 ngày làm việc. Giả định: đã có kiến thức lập trình cơ bản.

## 2. Nội dung cần tìm hiểu

| **Phần**           | **Nội dung cơ bản**                                                                                                                                 |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| PostgreSQL         | Tạo database và bảng; kiểu dữ liệu; khóa chính, khóa ngoại; SELECT, INSERT, UPDATE, DELETE, JOIN; khái niệm index và transaction.                   |
| C# và ASP.NET Core | C# cơ bản, LINQ, async/await; Web API; Controller, Service, DTO; Dependency Injection; Entity Framework Core kết nối PostgreSQL, migration và CRUD. |
| React              | JavaScript cơ bản; component, props, state; useState, useEffect; form và kiểm tra dữ liệu; gọi API; hiển thị trạng thái loading và lỗi.             |
| API và JSON        | REST; GET, POST, PUT, DELETE; request/response JSON; HTTP status code; validation và xử lý lỗi; OpenAPI và kiểm thử bằng Postman.                   |
| Công cụ chung      | GitHub: clone, branch, commit, pull, merge; cài đặt và chạy dự án trên máy cá nhân.                                                                 |

## 3. Bài thực hành chung

Xây dựng ứng dụng quản lý nhân viên và phòng ban: danh sách, thêm, sửa, xóa, tìm kiếm nhân viên và chọn phòng ban. Dữ liệu phải được lưu trong PostgreSQL và thao tác từ giao diện React qua Web API.

Giới hạn phạm vi: chưa yêu cầu microservices, kiến trúc phức tạp, Redux hay CI/CD trong 2 tuần.

## 4. Phân công và tiến độ

| **Thời gian** | **Backend và Database**                     | **Frontend và Tích hợp**                                    |
|---------------|---------------------------------------------|-------------------------------------------------------------|
| Ngày 1–2      | Cài môi trường; ôn C#; tìm hiểu PostgreSQL. | Cài môi trường; ôn JavaScript; học React.                   |
| Ngày 3–5      | Thiết kế bảng; xây dựng API CRUD.           | Làm giao diện danh sách và form bằng dữ liệu mẫu.           |
| Ngày 6–8      | Hoàn thiện API, validation và xử lý lỗi.    | Kết nối API; hoàn thiện thao tác, loading và thông báo lỗi. |
| Ngày 9–10     | *(Cả nhóm)* Kiểm thử, sửa lỗi, viết hướng dẫn và demo. | *(Cả nhóm)* Kiểm thử, sửa lỗi, viết hướng dẫn và demo. |

## 5. Kết quả bàn giao

- Source code trên Git, gồm backend, frontend và phần khởi tạo database hoặc migration.

- Sơ đồ database và danh sách API kèm ví dụ request/response JSON.

- README hướng dẫn cài đặt và chạy demo trên máy cá nhân.

- Demo 15 phút: trình bày chức năng, luồng xử lý và những vấn đề đã gặp.

Yêu cầu hoàn thành: chạy được toàn bộ luồng từ React đến PostgreSQL; các chức năng CRUD và tìm kiếm hoạt động; có kiểm tra dữ liệu và thông báo lỗi cơ bản. Mỗi bạn giải thích được phần mình làm và luồng xử lý tổng thể.

## 6. Tài liệu tham khảo

- ASP.NET Core Web API: <https://learn.microsoft.com/en-us/aspnet/core/tutorials/first-web-api>

- React: <https://react.dev/learn>

- PostgreSQL: <https://www.postgresql.org/docs/current/tutorial-sql.html>
