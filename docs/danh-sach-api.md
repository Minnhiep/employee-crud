# Danh sách API

API của ứng dụng quản lý nhân viên và phòng ban: 10 thao tác, nhận và trả JSON. Mọi ví dụ dưới đây là **kết quả gọi thật** lúc backend chạy trên máy phát triển (ngày 03/11/2026), với dữ liệu mẫu tên giả. Trên máy bạn, `id` và `traceId` sẽ khác.

## Quy ước chung

| Mục | Giá trị |
|---|---|
| Địa chỉ gốc | `http://localhost:5081` (chạy `dotnet run`, hồ sơ `http` trong `launchSettings.json`) |
| Địa chỉ HTTPS (không bắt buộc) | `https://localhost:7205` (chạy `dotnet run --launch-profile https`) |
| Định dạng gửi lên | `Content-Type: application/json`, tên trường viết kiểu camelCase (`fullName`, `departmentId`) |
| Định dạng trả về khi thành công | `application/json; charset=utf-8` |
| Định dạng trả về khi lỗi 404, 409 | `application/problem+json` (chuẩn ProblemDetails, RFC 9457) |
| Định dạng trả về khi lỗi 400 | `application/json; charset=utf-8`, cùng hình dạng ProblemDetails (`title`, `status`, `errors`) nhưng thiếu `type` (xem ghi chú ở mục Lỗi 400) |
| Ai được gọi từ trình duyệt | Chỉ trang `http://localhost:5173` (CORS). Postman không bị CORS chặn |
| Đăng nhập | Không có |

### Mã trạng thái

| Mã | Khi nào |
|---|---|
| 200 OK | Đọc hoặc sửa thành công |
| 201 Created | Tạo thành công; header `Location` chứa địa chỉ của bản ghi mới |
| 204 No Content | Xóa thành công; không có body |
| 400 Bad Request | Dữ liệu gửi lên sai (thiếu, quá dài, sai định dạng, phòng ban không tồn tại) |
| 404 Not Found | Không có bản ghi với `id` đó |
| 409 Conflict | Vi phạm luật nghiệp vụ: trùng tên phòng ban, trùng email, xóa phòng ban còn nhân viên |

Lời báo lỗi trong body viết bằng tiếng Việt để giao diện hiện thẳng cho người dùng.

## Bảng tóm tắt

| # | Phương thức | Đường dẫn | Làm gì | Thành công | Lỗi có thể |
|---|---|---|---|---|---|
| 1 | GET | `/api/departments` | Danh sách phòng ban, sắp theo tên | 200 | |
| 2 | POST | `/api/departments` | Thêm phòng ban | 201 | 400, 409 |
| 3 | GET | `/api/departments/{id}` | Xem một phòng ban | 200 | 404 |
| 4 | PUT | `/api/departments/{id}` | Sửa tên phòng ban | 200 | 400, 404, 409 |
| 5 | DELETE | `/api/departments/{id}` | Xóa phòng ban | 204 | 404, 409 |
| 6 | GET | `/api/employees` | Danh sách nhân viên, có tìm theo họ tên hoặc email | 200 | |
| 7 | POST | `/api/employees` | Thêm nhân viên | 201 | 400, 409 |
| 8 | GET | `/api/employees/{id}` | Xem một nhân viên | 200 | 404 |
| 9 | PUT | `/api/employees/{id}` | Sửa nhân viên | 200 | 400, 404, 409 |
| 10 | DELETE | `/api/employees/{id}` | Xóa nhân viên | 204 | 404 |

Mỗi thao tác đi qua cùng một đường: React gọi API → Controller nhận JSON → Service kiểm luật → EF Core đọc hoặc ghi bảng `departments` / `employees` trong PostgreSQL (xem [sơ đồ database](so-do-database.md)).

---

## Phòng ban

### GET /api/departments

Lấy mọi phòng ban, sắp theo tên A–Z. Đọc bảng `departments`.

Request: không có body.

Response `200`:

```json
[
  { "id": 2, "name": "Kế toán" },
  { "id": 4, "name": "Kinh doanh" },
  { "id": 3, "name": "Kỹ thuật" },
  { "id": 1, "name": "Nhân sự" }
]
```

### POST /api/departments

Thêm phòng ban mới. Ghi vào bảng `departments`.

Request:

```json
{ "name": "Phòng Mẫu" }
```

Response `201`, header `Location: http://localhost:5081/api/departments/10`:

```json
{ "id": 10, "name": "Phòng Mẫu" }
```

Lỗi có thể: `400` tên rỗng hoặc dài quá 100 ký tự; `409` tên đã có (không phân biệt hoa thường).

### GET /api/departments/{id}

Xem một phòng ban. Đọc bảng `departments`.

Request: không có body. Ví dụ `GET /api/departments/10`.

Response `200`:

```json
{ "id": 10, "name": "Phòng Mẫu" }
```

Lỗi có thể: `404` không có phòng ban mã đó.

### PUT /api/departments/{id}

Đổi tên phòng ban. Ghi vào bảng `departments`.

Request (`PUT /api/departments/10`):

```json
{ "name": "Phòng Mẫu Đổi Tên" }
```

Response `200`:

```json
{ "id": 10, "name": "Phòng Mẫu Đổi Tên" }
```

Lỗi có thể: `400` tên rỗng hoặc quá dài; `404` không có phòng ban mã đó; `409` tên trùng với phòng ban khác.

### DELETE /api/departments/{id}

Xóa phòng ban. Chỉ xóa được khi phòng ban **không còn nhân viên**. Xóa khỏi bảng `departments`.

Request: không có body. Ví dụ `DELETE /api/departments/10`.

Response `204`: không có body.

Lỗi có thể: `404` không có phòng ban mã đó; `409` phòng ban còn nhân viên (xem ví dụ ở mục Lỗi 409).

---

## Nhân viên

### GET /api/employees

Lấy danh sách nhân viên, mỗi người kèm tên phòng ban. Đọc bảng `employees`, nối với `departments` để lấy `departmentName`.

Tham số không bắt buộc: `search`, tìm trong **họ tên hoặc email**, không phân biệt hoa thường. Ví dụ `GET /api/employees?search=mẫu` (trong Postman gõ thẳng chữ có dấu; Postman tự mã hóa thành `m%E1%BA%ABu`).

Request: không có body.

Response `200` (không có `search`):

```json
[
  { "id": 1, "fullName": "Đỗ Văn An", "email": "do.an@congty.vn", "departmentId": 3, "departmentName": "Kỹ thuật" },
  { "id": 2008, "fullName": "Nguyễn Văn Mẫu", "email": "mau.nguyen@example.com", "departmentId": 10, "departmentName": "Phòng Mẫu Đổi Tên" }
]
```

Response `200` với `?search=mẫu`:

```json
[
  { "id": 2008, "fullName": "Nguyễn Văn Mẫu", "email": "mau.nguyen@example.com", "departmentId": 10, "departmentName": "Phòng Mẫu Đổi Tên" }
]
```

Không ai khớp thì trả `200` với danh sách rỗng `[]`.

### POST /api/employees

Thêm nhân viên. Ghi vào bảng `employees`.

Request:

```json
{ "fullName": "Nguyễn Văn Mẫu", "email": "mau.nguyen@example.com", "departmentId": 10 }
```

Response `201`, header `Location: http://localhost:5081/api/employees/2008`:

```json
{ "id": 2008, "fullName": "Nguyễn Văn Mẫu", "email": "mau.nguyen@example.com", "departmentId": 10, "departmentName": "Phòng Mẫu Đổi Tên" }
```

Lỗi có thể: `400` thiếu họ tên, email sai định dạng, thiếu phòng ban hoặc phòng ban không tồn tại; `409` email đã có (không phân biệt hoa thường).

### GET /api/employees/{id}

Xem một nhân viên. Đọc bảng `employees` và `departments`.

Request: không có body. Ví dụ `GET /api/employees/2008`.

Response `200`:

```json
{ "id": 2008, "fullName": "Nguyễn Văn Mẫu", "email": "mau.nguyen@example.com", "departmentId": 10, "departmentName": "Phòng Mẫu Đổi Tên" }
```

Lỗi có thể: `404` không có nhân viên mã đó.

### PUT /api/employees/{id}

Sửa họ tên, email, phòng ban của nhân viên. Gửi đủ cả ba trường. Ghi vào bảng `employees`.

Request (`PUT /api/employees/2008`):

```json
{ "fullName": "Nguyễn Văn Mẫu", "email": "mau.nguyen2@example.com", "departmentId": 10 }
```

Response `200`:

```json
{ "id": 2008, "fullName": "Nguyễn Văn Mẫu", "email": "mau.nguyen2@example.com", "departmentId": 10, "departmentName": "Phòng Mẫu Đổi Tên" }
```

Lỗi có thể: `400` như khi thêm; `404` không có nhân viên mã đó; `409` email trùng với nhân viên khác.

### DELETE /api/employees/{id}

Xóa nhân viên. Xóa khỏi bảng `employees`.

Request: không có body. Ví dụ `DELETE /api/employees/2008`.

Response `204`: không có body.

Lỗi có thể: `404` không có nhân viên mã đó.

---

## Ví dụ lỗi

### Lỗi 400 Bad Request

#### Lỗi 400 — tên phòng ban rỗng

Request: `POST /api/departments`

```json
{ "name": "" }
```

Response `400`, `Content-Type: application/json; charset=utf-8`:

```json
{
  "title": "Dữ liệu không hợp lệ",
  "status": 400,
  "errors": { "name": ["Vui lòng nhập tên phòng ban"] }
}
```

`errors` gom lỗi theo từng trường, để form React hiện lời báo ngay dưới ô nhập tương ứng.

> **Lệch đã biết:** theo hợp đồng API của dự án, lỗi 400 cũng phải trả `Content-Type: application/problem+json` và có trường `type` như lỗi 404, 409. Hiện tại API trả `application/json` và thiếu `type`; danh sách này ghi đúng hành vi hiện tại. Việc sửa cho khớp hợp đồng đã được chuyển cho bước kiểm thử cuối (Build and Test). Ảnh hưởng tới giao diện: `frontend/src/api/client.ts` chỉ đọc lời báo lỗi khi `Content-Type` là `application/problem+json`, nên với lỗi 400 này giao diện hiện câu báo chung thay vì lời báo theo từng ô. Bình thường người dùng ít gặp, vì form React đã tự kiểm dữ liệu trước khi gửi.

### Lỗi 404 Not Found

#### Lỗi 404 — phòng ban không tồn tại

Request: `GET /api/departments/999999`

Response `404`, `Content-Type: application/problem+json`:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.5",
  "title": "Không tìm thấy",
  "status": 404,
  "detail": "Không tìm thấy phòng ban có mã 999999.",
  "traceId": "00-3ec7938c422361c8719ffd77372943dd-227edfba5553c8b4-00"
}
```

`PUT /api/employees/999999` cũng trả `404` như vậy, với `detail` là `"Không tìm thấy nhân viên có mã 999999."`. `traceId` là mã để dò log, mỗi lần gọi một khác.

### Lỗi 409 Conflict

#### Lỗi 409 — trùng tên phòng ban

Request: `POST /api/departments` khi đã có phòng ban "Phòng Mẫu Đổi Tên"

```json
{ "name": "PHÒNG MẪU ĐỔI TÊN" }
```

Response `409`, `Content-Type: application/problem+json`:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.10",
  "title": "Dữ liệu bị trùng",
  "status": 409,
  "errors": { "name": ["Tên phòng ban đã tồn tại"] },
  "traceId": "00-0f5149475f968d4513ba338458f7892c-df7cf7e96b05a82d-00"
}
```

Trùng email cũng tương tự: gửi `"email": "MAU.NGUYEN2@EXAMPLE.COM"` khi đã có `mau.nguyen2@example.com` thì nhận `409` với `"errors": { "email": ["Email đã được sử dụng"] }`.

#### Lỗi 409 — xóa phòng ban còn nhân viên

Request: `DELETE /api/departments/10` khi phòng ban 10 còn nhân viên

Response `409`, `Content-Type: application/problem+json`:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.10",
  "title": "Không thể xóa phòng ban",
  "status": 409,
  "detail": "Không thể xóa phòng ban \"Phòng Mẫu Đổi Tên\" vì vẫn còn nhân viên.",
  "traceId": "00-9c8936750dd8e7277b96576f94dff589-455cf3ad54550b4c-00"
}
```

API kiểm "còn nhân viên" trước khi xóa. Database còn chặn thêm một lớp bằng khóa ngoại (xem mục "Thử ràng buộc" trong [sơ đồ database](so-do-database.md)).

---

## Trang tài liệu OpenAPI

Chỉ có khi backend chạy ở môi trường Development (mặc định khi `dotnet run`):

- Bản đặc tả JSON: `http://localhost:5081/openapi/v1.json`
- Trang xem và gọi thử (Swagger UI): `http://localhost:5081/swagger`

Trang này liệt kê đủ 10 thao tác ở trên (đã kiểm ngày 03/11/2026).

## Gọi thử bằng Postman

1. Chạy backend (`dotnet run --project backend/EmployeeCrud.Api`), đợi dòng `Now listening on: http://localhost:5081`.
2. Trong Postman bấm **New** → **HTTP**.
3. Chọn phương thức (GET, POST, PUT, DELETE) ở ô bên trái, dán địa chỉ, ví dụ `http://localhost:5081/api/departments`.
4. Với POST và PUT: mở tab **Body** → chọn **raw** → chọn **JSON** ở ô bên phải, dán JSON request từ danh sách trên.
5. Bấm **Send**. So **mã trạng thái** (góc phải, ví dụ `201 Created`), tab **Headers** (`Location`, `Content-Type`) và **body** với danh sách này.
6. Thử xong thì xóa các bản ghi đã tạo (DELETE nhân viên trước, rồi phòng ban), để dữ liệu về như cũ.
