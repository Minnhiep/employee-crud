# 00. Tổng quan: một thao tác đi qua 4 tầng như thế nào

> Tài liệu tự học theo [Kế hoạch tìm hiểu technical stack 2 tuần](../ke-hoach.md).
> Mục tiêu cuối: **tự giải thích được luồng React → API JSON → ASP.NET Core → PostgreSQL**, rồi áp dụng làm bài CRUD nhân viên/phòng ban.
> Viết ngày 30/10/2026.
>
> **Lưu ý: đây là bản nháp học, viết trước khi làm bài.** Bài thật khác ở: React viết bằng TypeScript, không phải JavaScript; API có 10 thao tác, gồm cả thêm, sửa, xóa phòng ban. Đúng với bài thật: [danh sách API](../danh-sach-api.md), [sơ đồ database](../so-do-database.md).

## 1. Hình dung bằng ví dụ đời thường: một nhà hàng

| Trong nhà hàng | Trong ứng dụng | Thuật ngữ |
|---|---|---|
| Khách nhìn thực đơn, chọn món | Người dùng nhìn màn hình, bấm nút | **Giao diện** (frontend) |
| Nhân viên phục vụ ghi món lên **phiếu theo mẫu chuẩn**, mang vào bếp | Trình duyệt gửi một **yêu cầu HTTP** có nội dung dạng **JSON** | **API**, **request/response**, **JSON** |
| Bếp kiểm tra phiếu (món có không, ghi đủ chưa), rồi nấu | Máy chủ kiểm tra dữ liệu, xử lý nghiệp vụ | **Backend** (ASP.NET Core) |
| Kho nguyên liệu, có sổ nhập xuất | Nơi lưu dữ liệu lâu dài, có quy tắc chặt | **Cơ sở dữ liệu** (PostgreSQL) |
| Sổ ghi lại mọi lần sửa công thức, ai sửa, lúc nào | Lưu lịch sử thay đổi mã nguồn | **Git / GitHub** |

Vì sao không để khách vào thẳng kho? Vì kho cần **người gác**: kiểm tra, từ chối yêu cầu sai, giữ dữ liệu đúng. Đó là lý do có tầng backend nằm giữa giao diện và database.

## 2. Luồng "Thêm nhân viên" từng bước

```
[Người dùng]                [React - trình duyệt]          [ASP.NET Core - máy chủ]           [PostgreSQL]
    |  điền form, bấm Lưu        |                                 |                               |
    |--------------------------->| 1. kiểm tra form (trống? email?)|                               |
    |                            | 2. bật "đang lưu..." (loading)  |                               |
    |                            | 3. POST /api/employees  ------->| 4. Controller nhận JSON         |
    |                            |    body: JSON                   |    -> DTO, kiểm tra lại dữ liệu |
    |                            |                                 | 5. Service: quy tắc nghiệp vụ   |
    |                            |                                 |    (phòng ban có tồn tại?)      |
    |                            |                                 | 6. EF Core sinh câu SQL ------->| 7. INSERT INTO employees...
    |                            |                                 |                                 |    kiểm khóa ngoại, lưu
    |                            |                                 |<------- id mới (vd 15) ---------|
    |                            |<---- 201 Created + JSON --------| 8. trả kết quả                  |
    |<---------------------------| 9. tắt loading, cập nhật danh sách / hoặc hiện lỗi             |
```

Request (bước 3) trông như sau:

```http
POST /api/employees HTTP/1.1
Content-Type: application/json

{ "fullName": "Nguyễn Văn An", "email": "an.nguyen@example.com", "departmentId": 2 }
```

Response khi thành công (bước 8):

```http
HTTP/1.1 201 Created
Location: /api/employees/15
Content-Type: application/json

{ "id": 15, "fullName": "Nguyễn Văn An", "email": "an.nguyen@example.com", "departmentId": 2, "departmentName": "Kế toán" }
```

Response khi dữ liệu sai, ví dụ thiếu email:

```http
HTTP/1.1 400 Bad Request
Content-Type: application/problem+json

{ "title": "One or more validation errors occurred.", "status": 400,
  "errors": { "Email": ["The Email field is required."] } }
```

**Điểm cần nhớ:** dữ liệu được kiểm tra **hai lần**. React kiểm để người dùng thấy lỗi ngay. Backend kiểm vì không tin được trình duyệt: người khác có thể gọi API thẳng bằng Postman mà không qua form.

## 3. Mỗi tầng chịu trách nhiệm gì

| Tầng | Chạy ở đâu | Ngôn ngữ | Trách nhiệm | Không nên làm |
|---|---|---|---|---|
| React | Trình duyệt của người dùng | JavaScript | Hiển thị, nhận thao tác, kiểm tra sơ bộ, gọi API, báo loading/lỗi | Nối thẳng database; giữ mật khẩu DB |
| API + JSON | Đường truyền HTTP | (Quy ước, không phải ngôn ngữ) | "Hợp đồng" giữa frontend và backend: địa chỉ, phương thức, dữ liệu, mã trạng thái | |
| ASP.NET Core | Máy chủ | C# | Nhận request, kiểm tra, quy tắc nghiệp vụ, đọc/ghi DB qua EF Core, trả response | Trả lỗi 500 cho mọi trường hợp; để lộ chi tiết lỗi nội bộ |
| PostgreSQL | Máy chủ database | SQL | Lưu dữ liệu lâu dài, giữ ràng buộc (khóa chính, khóa ngoại, duy nhất), truy vấn nhanh | Chứa logic giao diện |
| Git/GitHub | Máy cá nhân + GitHub | Lệnh git | Lưu lịch sử mã nguồn, làm việc nhánh, gộp thay đổi | |

**Vì sao chia tầng?** Mỗi tầng có thể thay, sửa hoặc kiểm thử riêng. Ví dụ đổi giao diện React không phải sửa database. Ví dụ kiểm thử API bằng Postman trước khi có giao diện.

## 4. Phiên bản hiện hành (đã tra ngày 30/10/2026)

| Thành phần | Phiên bản nên dùng | Ghi chú | Nguồn |
|---|---|---|---|
| .NET / ASP.NET Core | **.NET 10** (LTS, hỗ trợ đến 11/2028) | .NET 8 và 9 hết hỗ trợ ngày 10/11/2026, không nên bắt đầu dự án mới bằng 2 bản này | [Chính sách hỗ trợ .NET](https://dotnet.microsoft.com/en-us/platform/support/policy/dotnet-core), [.NET 8 và 9 hết hỗ trợ](https://devblogs.microsoft.com/dotnet/dotnet-8-9-end-of-support/) |
| Npgsql EF Core (gói nối EF Core với PostgreSQL) | **10.x** (bản 10.0.3 thấy trên NuGet) | Đi cùng .NET 10 / EF Core 10 | [NuGet](https://www.nuget.org/packages/Npgsql.EntityFrameworkCore.PostgreSQL/), [Tài liệu Npgsql EF Core](https://www.npgsql.org/efcore/) |
| React | **19.3** (9/2026) | Create React App đã ngừng; tạo dự án bằng build tool (Vite, Rsbuild, Parcel) hoặc framework (Next.js...), so sánh ở [01-react.md](01-react.md) mục 3 | [React Versions](https://react.dev/versions), [Ngừng Create React App](https://react.dev/blog/2025/02/14/sunsetting-create-react-app) |
| PostgreSQL | **18** (bản vá 18.6) | 19 đang ở bản RC, chưa chính thức; bản 14 hết hỗ trợ 12/11/2026 | [Versioning Policy](https://www.postgresql.org/support/versioning/) |

Hai thay đổi đáng chú ý so với hướng dẫn cũ trên mạng:
1. **Không còn Create React App.** Nhiều bài hướng dẫn cũ dùng `npx create-react-app`, giờ dùng build tool như Vite (`npm create vite@latest`) hoặc một framework; xem tổng quan các cách ở [01-react.md](01-react.md) mục 3. [Nguồn](https://react.dev/learn/build-a-react-app-from-scratch)
2. **Mẫu Web API của .NET 9 trở lên không kèm sẵn trang Swagger.** ASP.NET Core tự sinh tài liệu OpenAPI (file JSON), còn giao diện để bấm thử phải cài thêm gói. [Nguồn](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi?view=aspnetcore-10.0)

## 5. Thứ tự đọc và gắn với lịch 10 ngày

| File | Nội dung | Gắn với lịch trong kế hoạch |
|---|---|---|
| [01-react.md](01-react.md) | JavaScript cần biết, component, props, state, hook, form, gọi API | Ngày 1–2 (học), 3–5 (giao diện), 6–8 (nối API) |
| [02-api-json.md](02-api-json.md) | HTTP, REST, JSON, status code, validation, OpenAPI, Postman, CORS | Ngày 3–8 (hợp đồng giữa hai đầu) |
| [03-aspnet-core.md](03-aspnet-core.md) | C# cơ bản, LINQ, async/await, Controller–Service–DTO, DI, EF Core | Ngày 1–2 (ôn C#), 3–8 (API CRUD) |
| [04-postgresql.md](04-postgresql.md) | Bảng, kiểu dữ liệu, khóa, SQL CRUD, JOIN, index, transaction | Ngày 1–2 (học), 3 (thiết kế bảng) |
| [05-git.md](05-git.md) | clone, branch, commit, pull, merge, xung đột | Dùng suốt 10 ngày |
| [06-cai-dat-moi-truong.md](06-cai-dat-moi-truong.md) | Cài .NET SDK, PostgreSQL, pgAdmin; kiểm tra sau khi cài | Ngày 1–2 (cài môi trường) |
| [07-kiem-thu-va-demo.md](07-kiem-thu-va-demo.md) | Danh sách kiểm thử cả luồng, chuẩn bị demo 15 phút | Ngày 9–10 |

Đọc theo luồng dữ liệu (từ chỗ người dùng bấm đến chỗ dữ liệu được lưu) để luôn biết mình đang ở đâu trong bức tranh. **Khi bắt tay làm thì làm ngược lại, từ dưới lên:** bảng → API → kiểm bằng Postman → giao diện. Vì tầng trên cần tầng dưới chạy được trước.

## 6. Ví dụ dùng chung trong mọi file

Để các tầng khớp nhau, mọi ví dụ dùng chung một mô hình:

- Bảng `departments`: `id`, `name` (tên phòng ban, không trùng).
- Bảng `employees`: `id`, `full_name`, `email` (không trùng), `department_id` (khóa ngoại tới `departments`).
- API: `GET /api/departments`; `GET /api/employees?search=...`; `GET /api/employees/{id}`; `POST /api/employees`; `PUT /api/employees/{id}`; `DELETE /api/employees/{id}`.

Đây là mô hình tối thiểu để học, tên do người viết tự chọn. Khi làm bài thật có thể thêm trường như số điện thoại hay ngày vào làm.

## 7. Câu hỏi tự kiểm (trả lời không nhìn tài liệu)

1. Kể lại 9 bước khi bấm "Lưu" một nhân viên mới. Mỗi bước do tầng nào làm?
2. Vì sao đã kiểm tra dữ liệu ở React mà backend vẫn phải kiểm tra lại?
3. Vì sao React không nối thẳng vào PostgreSQL?
4. Response "201 Created" khác "200 OK" ở điểm nào? Khi nào trả 400, khi nào trả 404?
5. Nếu cần đổi PostgreSQL sang database khác, những tầng nào phải sửa, tầng nào không?
6. Vì sao nên bắt đầu dự án mới bằng .NET 10 thay vì .NET 8?
