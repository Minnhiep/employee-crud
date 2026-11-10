# Danh sách API

API của ứng dụng quản lý nhân viên và phòng ban: 10 thao tác, nhận và trả JSON. Mọi ví dụ dưới đây là **kết quả gọi thật** lúc backend chạy trên máy phát triển (ngày 03/11/2026; hai ví dụ "400 — JSON hỏng" và "413" gọi ngày 10/11/2026), với dữ liệu mẫu tên giả. Trên máy bạn, `id` và `traceId` sẽ khác.

## Quy ước chung

| Mục | Giá trị |
|---|---|
| Địa chỉ gốc | `http://localhost:5081` (chạy `dotnet run`, hồ sơ `http` trong `launchSettings.json`) |
| Địa chỉ HTTPS (không bắt buộc) | `https://localhost:7205` (chạy `dotnet run --launch-profile https`) |
| Định dạng gửi lên | `Content-Type: application/json`, tên trường viết kiểu camelCase (`fullName`, `departmentId`) |
| Định dạng trả về khi thành công | `application/json; charset=utf-8` |
| Định dạng trả về khi lỗi 400, 404, 405, 409, 413, 415, 500 | `application/problem+json` (chuẩn ProblemDetails, RFC 9457), luôn có `title`, `status`, `traceId` và thường có `type`; kể cả khi request chỉ nhận `text/html` (header `Accept`), API vẫn trả JSON này chứ không trả trang HTML hay body rỗng |
| Kích thước body | Tối đa 64 KB mỗi request; lớn hơn thì trả `413` (request hợp lệ lớn nhất chỉ vài trăm byte) |
| Chuẩn hóa chữ | Tên phòng ban, họ tên, email và chuỗi tìm được chuẩn hóa trước khi kiểm và lưu: gộp nhiều khoảng trắng thành một, bỏ khoảng trắng hai đầu, đưa chữ có dấu về một dạng (NFC). Tên phòng ban, họ tên, email có ký tự điều khiển (ví dụ U+0000), ký tự vô hình (ví dụ U+200B) hoặc noncharacter (ví dụ U+FFFE) thì trả `400` "… chứa ký tự không hợp lệ". Chuỗi tìm có các ký tự đó thì trả `200` với `[]`, xem mục `GET /api/employees` |
| Ai được gọi từ trình duyệt | Chỉ trang `http://localhost:5173` (CORS). Postman không bị CORS chặn |
| Đăng nhập | Không có |

### Mã trạng thái

| Mã | Khi nào |
|---|---|
| 200 OK | Đọc hoặc sửa thành công |
| 201 Created | Tạo thành công; header `Location` chứa địa chỉ của bản ghi mới |
| 204 No Content | Xóa thành công; không có body |
| 400 Bad Request | Dữ liệu gửi lên sai (thiếu, quá dài, sai định dạng, chứa ký tự không hợp lệ, phòng ban không tồn tại) |
| 404 Not Found | Không có bản ghi với `id` đó |
| 405 Method Not Allowed | Đường dẫn có, nhưng không nhận phương thức đó (ví dụ `PATCH`) |
| 409 Conflict | Vi phạm luật nghiệp vụ: trùng tên phòng ban, trùng email, xóa phòng ban còn nhân viên |
| 413 Payload Too Large | Body gửi lên lớn hơn 64 KB |
| 415 Unsupported Media Type | Gửi body không phải JSON (thiếu hoặc sai `Content-Type`) |
| 500 Internal Server Error | Lỗi phía máy chủ, ví dụ không kết nối được database. Lời báo là câu chung, không lộ chi tiết kỹ thuật; chi tiết nằm trong log, dò bằng `traceId` |

Lời báo lỗi trong body viết bằng tiếng Việt để giao diện hiện thẳng cho người dùng.

### Thứ tự kiểm khi sửa (PUT)

Giống nhau cho `PUT /api/departments/{id}` và `PUT /api/employees/{id}`:

1. Trường bắt buộc bị thiếu, `null`, rỗng hoặc chỉ toàn khoảng trắng: `400` ngay. Bước này do `[Required]` của ASP.NET Core làm, chạy **trước** khi vào controller, nên chưa ai tìm bản ghi (ví dụ `PUT /api/departments/99999` với `{ "name": "   " }` ra `400` "Vui lòng nhập tên phòng ban").
2. Tìm bản ghi theo `id`: không có thì `404`, kể cả khi dữ liệu gửi lên còn sai chỗ khác (ví dụ `PUT /api/departments/99999` với tên dài 101 ký tự ra `404`, không ra `400`).
3. Có bản ghi rồi mới kiểm dữ liệu (`400`: quá dài, sai định dạng, ký tự không hợp lệ, phòng ban không tồn tại), rồi kiểm trùng (`409`).

Lý do: sửa một bản ghi không tồn tại thì việc đáng báo nhất là "không tìm thấy"; người dùng sửa dữ liệu cho đúng cũng không lưu được.

## Bảng tóm tắt

| # | Phương thức | Đường dẫn | Làm gì | Thành công | Lỗi có thể |
|---|---|---|---|---|---|
| 1 | GET | `/api/departments` | Danh sách phòng ban, sắp theo tên, kèm số nhân viên | 200 | |
| 2 | POST | `/api/departments` | Thêm phòng ban | 201 | 400, 409, 413 |
| 3 | GET | `/api/departments/{id}` | Xem một phòng ban, kèm số nhân viên | 200 | 404 |
| 4 | PUT | `/api/departments/{id}` | Sửa tên phòng ban | 200 | 400, 404, 409, 413 |
| 5 | DELETE | `/api/departments/{id}` | Xóa phòng ban | 204 | 404, 409 |
| 6 | GET | `/api/employees` | Danh sách nhân viên, có tìm theo họ tên hoặc email và lọc theo phòng ban | 200 | 400 (`departmentId` sai dạng) |
| 7 | POST | `/api/employees` | Thêm nhân viên | 201 | 400, 409, 413 |
| 8 | GET | `/api/employees/{id}` | Xem một nhân viên | 200 | 404 |
| 9 | PUT | `/api/employees/{id}` | Sửa nhân viên | 200 | 400, 404, 409, 413 |
| 10 | DELETE | `/api/employees/{id}` | Xóa nhân viên | 204 | 404 |

Mỗi thao tác đi qua cùng một đường: React gọi API → Controller nhận JSON → Service kiểm luật → EF Core đọc hoặc ghi bảng `departments` / `employees` trong PostgreSQL (xem [sơ đồ database](so-do-database.md)).

---

## Phòng ban

### GET /api/departments

Lấy mọi phòng ban, sắp theo tên A–Z, mỗi phòng kèm `employeeCount` (số nhân viên lúc đọc). Đọc bảng `departments`; số người được đếm bằng truy vấn con trên bảng `employees` trong **cùng một câu SQL**, nên bao nhiêu phòng cũng chỉ một lần gọi database.

Request: không có body.

Response `200` (trích 3 dòng, sau khi chạy [dữ liệu mẫu](du-lieu-mau.sql); Kế toán và Kỹ thuật có thêm vài người tự nhập):

```json
[
  { "id": 2, "name": "Kế toán", "employeeCount": 11 },
  { "id": 4, "name": "Kinh doanh", "employeeCount": 12 },
  { "id": 3, "name": "Kỹ thuật", "employeeCount": 14 }
]
```

### POST /api/departments

Thêm phòng ban mới. Ghi vào bảng `departments`.

Request:

```json
{ "name": "Đào tạo" }
```

Response `201`, header `Location: http://localhost:5081/api/departments/25` (phòng mới luôn có `employeeCount` 0):

```json
{ "id": 25, "name": "Đào tạo", "employeeCount": 0 }
```

Tên nên theo quy ước: viết hoa chữ cái đầu, không kèm chữ "Phòng" (README, mục "Quy ước tên phòng ban"). API không tự đổi chữ.

Lỗi có thể: `400` tên rỗng hoặc dài quá 100 ký tự; `409` tên đã có (không phân biệt hoa thường).

### GET /api/departments/{id}

Xem một phòng ban. Đọc bảng `departments`.

Request: không có body. Ví dụ `GET /api/departments/25`. Trang chi tiết phòng ban (`/departments/{id}` trên giao diện) gọi API này cùng lúc với `GET /api/employees?departmentId={id}`.

Response `200`:

```json
{ "id": 25, "name": "Đào tạo", "employeeCount": 0 }
```

Lỗi có thể: `404` không có phòng ban mã đó.

### PUT /api/departments/{id}

Đổi tên phòng ban. Ghi vào bảng `departments`.

Request (`PUT /api/departments/25`):

```json
{ "name": "Đào tạo nội bộ" }
```

Response `200` (`employeeCount` đếm lại sau khi lưu):

```json
{ "id": 25, "name": "Đào tạo nội bộ", "employeeCount": 0 }
```

Lỗi có thể: `400` tên rỗng hoặc quá dài; `404` không có phòng ban mã đó; `409` tên trùng với phòng ban khác. Thứ tự kiểm: xem mục "Thứ tự kiểm khi sửa (PUT)".

### DELETE /api/departments/{id}

Xóa phòng ban. Chỉ xóa được khi phòng ban **không còn nhân viên**. Xóa khỏi bảng `departments`.

Request: không có body. Ví dụ `DELETE /api/departments/25`.

Response `204`: không có body.

Lỗi có thể: `404` không có phòng ban mã đó; `409` phòng ban còn nhân viên, câu báo ghi số người còn lại (xem ví dụ ở mục Lỗi 409). Giao diện biết trước số người nhờ `employeeCount`: nút Xóa vẫn bấm được nhưng chỉ mở hộp báo phòng còn N nhân viên, không gọi API. Vì vậy 409 chỉ còn xảy ra khi có người được thêm chen vào giữa lúc tải và lúc xóa.

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
  { "id": 2008, "fullName": "Nguyễn Văn Mẫu", "email": "mau.nguyen@example.com", "departmentId": 25, "departmentName": "Đào tạo nội bộ" }
]
```

Response `200` với `?search=mẫu`:

```json
[
  { "id": 2008, "fullName": "Nguyễn Văn Mẫu", "email": "mau.nguyen@example.com", "departmentId": 25, "departmentName": "Đào tạo nội bộ" }
]
```

Không ai khớp thì trả `200` với danh sách rỗng `[]`.

Tham số không bắt buộc thứ hai: `departmentId`, chỉ lấy nhân viên của phòng ban đó; dùng cùng `search` thì phải thỏa **cả hai**. Ví dụ `GET /api/employees?departmentId=2&search=mai`:

```json
[
  { "id": 2052, "fullName": "Nguyễn Thị Mai", "email": "mai.nguyen@congty.example", "departmentId": 2, "departmentName": "Kế toán" }
]
```

- `departmentId` phải là số nguyên dương viết bằng chữ số 0–9 (không dấu `+`, `-`, khoảng trắng, dấu chấm), trong phạm vi số nguyên 32 bit. Sai dạng (`abc`, `0`, `-1`, `99999999999`, ` 5`, `+5`) thì trả `400` với lỗi ở ô `departmentId` (xem ví dụ ở mục Lỗi 400). API tự đọc số để câu báo là tiếng Việt.
- Số hợp lệ nhưng không có phòng ban đó (ví dụ `?departmentId=999999`) thì trả `200` với `[]`: lọc không ra ai, không phải lỗi "không tìm thấy".
- Bỏ trống (`?departmentId=`) nghĩa là không lọc.

Chuỗi tìm được chuẩn hóa như họ tên, email đã lưu, nên `?search=nguyễn%20%20văn` (hai dấu cách) vẫn tìm ra "Nguyễn Văn …". Chuỗi tìm có ký tự điều khiển, ký tự vô hình hoặc noncharacter (ví dụ `?search=%00`, `?search=a%EF%BF%BEb`) cũng trả `200` với `[]`: họ tên, email đã bị chặn các ký tự đó khi lưu nên không ai khớp, và API không gửi chuỗi đó xuống database.

### POST /api/employees

Thêm nhân viên. Ghi vào bảng `employees`.

Request:

```json
{ "fullName": "Nguyễn Văn Mẫu", "email": "mau.nguyen@example.com", "departmentId": 25 }
```

Response `201`, header `Location: http://localhost:5081/api/employees/2008`:

```json
{ "id": 2008, "fullName": "Nguyễn Văn Mẫu", "email": "mau.nguyen@example.com", "departmentId": 25, "departmentName": "Đào tạo nội bộ" }
```

Lỗi có thể: `400` thiếu họ tên, email sai định dạng, thiếu phòng ban hoặc phòng ban không tồn tại; `409` email đã có (không phân biệt hoa thường).

### GET /api/employees/{id}

Xem một nhân viên. Đọc bảng `employees` và `departments`.

Request: không có body. Ví dụ `GET /api/employees/2008`.

Response `200`:

```json
{ "id": 2008, "fullName": "Nguyễn Văn Mẫu", "email": "mau.nguyen@example.com", "departmentId": 25, "departmentName": "Đào tạo nội bộ" }
```

Lỗi có thể: `404` không có nhân viên mã đó.

### PUT /api/employees/{id}

Sửa họ tên, email, phòng ban của nhân viên. Gửi đủ cả ba trường. Ghi vào bảng `employees`.

Request (`PUT /api/employees/2008`):

```json
{ "fullName": "Nguyễn Văn Mẫu", "email": "mau.nguyen2@example.com", "departmentId": 25 }
```

Response `200`:

```json
{ "id": 2008, "fullName": "Nguyễn Văn Mẫu", "email": "mau.nguyen2@example.com", "departmentId": 25, "departmentName": "Đào tạo nội bộ" }
```

Lỗi có thể: `400` như khi thêm; `404` không có nhân viên mã đó; `409` email trùng với nhân viên khác. Thứ tự kiểm: xem mục "Thứ tự kiểm khi sửa (PUT)".

### DELETE /api/employees/{id}

Xóa nhân viên. Xóa khỏi bảng `employees`.

Request: không có body. Ví dụ `DELETE /api/employees/2008`.

Response `204`: không có body.

Lỗi có thể: `404` không có nhân viên mã đó.

---

## Ví dụ lỗi

### Lỗi 400 Bad Request

`departmentId` sai dạng khi lọc, `GET /api/employees?departmentId=abc`:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "Dữ liệu không hợp lệ",
  "status": 400,
  "errors": { "departmentId": ["Phòng ban lọc không hợp lệ"] },
  "traceId": "00-a5279f6ca9ae2ab3303b7b93214b2332-5cce64899f232244-00"
}
```

#### Lỗi 400 — tên phòng ban rỗng

Request: `POST /api/departments`

```json
{ "name": "" }
```

Response `400`, `Content-Type: application/problem+json`:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "Dữ liệu không hợp lệ",
  "status": 400,
  "errors": { "name": ["Vui lòng nhập tên phòng ban"] },
  "traceId": "00-52986c94a3e6c03153be9f8ac99ed21a-3a5162a5417adc26-00"
}
```

`errors` gom lỗi theo từng trường, để form React hiện lời báo ngay dưới ô nhập tương ứng (`frontend/src/api/client.ts` đọc body khi `Content-Type` là `application/problem+json`).

> Ví dụ này gọi lại ngày 03/11/2026, sau khi bước Build and Test sửa lỗi 400 cho khớp hợp đồng (trước đó lỗi 400 trả `application/json` và thiếu `type`).

#### Lỗi 400 — JSON hỏng

Request: `POST /api/employees`, `Content-Type: application/json`, body bị cắt dở (không phải JSON hợp lệ):

```text
{ "fullName":
```

Response `400`, `Content-Type: application/problem+json`:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "Dữ liệu không hợp lệ",
  "status": 400,
  "errors": {
    "body": ["Dữ liệu gửi lên không đúng định dạng JSON"],
    "fullName": ["Giá trị không đúng kiểu dữ liệu"]
  },
  "traceId": "00-d8b628d6d6661686bfd2be6ad8f5080a-28bb4ef8097d496f-00"
}
```

Khóa `body` nghĩa là lỗi của **cả body**, không gắn với ô nào: giao diện hiện nó ở khung tóm tắt đầu form. Bộ đọc JSON của ASP.NET Core còn báo thêm trường đang đọc dở (`fullName`). Chỉ gặp khi gọi bằng Postman hoặc công cụ khác: giao diện luôn gửi JSON đúng.

#### Lỗi 400 — chứa ký tự không hợp lệ

Request: `POST /api/departments`, tên có dấu cách rộng 0 (U+200B, ký tự vô hình) giữa hai chữ:

```json
{ "name": "Kế\u200Btoán" }
```

Response `400`, `Content-Type: application/problem+json`:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "Dữ liệu không hợp lệ",
  "status": 400,
  "errors": { "name": ["Tên phòng ban chứa ký tự không hợp lệ"] },
  "traceId": "00-b0deb28a4248ad9b5fa34a09d24d78ca-4d56bb493157f681-00"
}
```

Họ tên và email của nhân viên dùng cùng luật, lời báo là `"Họ tên chứa ký tự không hợp lệ"` (trường `fullName`) và `"Email chứa ký tự không hợp lệ"` (trường `email`). Vì sao chặn: ký tự vô hình làm hai tên trông giống hệt mà máy coi là khác (lách được luật không trùng), còn U+0000 bị PostgreSQL từ chối. Noncharacter là 66 mã Unicode dành riêng cho nội bộ phần mềm, không phải chữ để trao đổi: U+FDD0 đến U+FDEF và hai mã cuối của mỗi mặt phẳng (U+FFFE, U+FFFF, U+1FFFE, ... U+10FFFF). Riêng U+FFFE từng làm API trả 500 ở bước chuẩn hóa chữ.

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

Request: `POST /api/departments` khi đã có phòng ban "Đào tạo nội bộ"

```json
{ "name": "ĐÀO TẠO NỘI BỘ" }
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

Request: `DELETE /api/departments/2` khi phòng ban "Kế toán" (mã 2) còn 11 nhân viên

Response `409`, `Content-Type: application/problem+json`:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.10",
  "title": "Không thể xóa phòng ban",
  "status": 409,
  "detail": "Không thể xóa phòng ban \"Kế toán\" vì còn 11 nhân viên.",
  "traceId": "00-5594fea7e3c3d848634da8b02547bcaa-6858c647b9e39dbb-00"
}
```

API đếm số nhân viên còn trong phòng trước khi xóa; câu báo luôn theo một mẫu `Không thể xóa phòng ban "<tên>" vì còn N nhân viên.`, kể cả khi có người được thêm chen vào đúng lúc xóa (API đếm lại rồi mới báo). Database còn chặn thêm một lớp bằng khóa ngoại (xem mục "Thử ràng buộc" trong [sơ đồ database](so-do-database.md)).

### Lỗi 405 Method Not Allowed

Request: `PATCH /api/departments` (API không có thao tác `PATCH`)

Response `405`, `Content-Type: application/problem+json`:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.6",
  "title": "Phương thức không được hỗ trợ",
  "status": 405,
  "traceId": "00-0e7575e4f073e78c29de5d34247a404f-895bd32d17b6a2f3-00"
}
```

### Lỗi 413 Payload Too Large

Request: `POST /api/departments` với tên dài khoảng 70 000 ký tự (body hơn 64 KB)

Response `413`, `Content-Type: application/problem+json`:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.14",
  "title": "Dữ liệu gửi lên quá lớn",
  "status": 413,
  "traceId": "00-e22165715becff41ae37613ecd5b60eb-abdac7cb0e78e4be-00"
}
```

Kestrel (máy chủ web của ASP.NET Core) dừng đọc body khi vượt 64 KB, nên body rất lớn bị từ chối sớm, không phải đọc hết rồi mới báo "tối đa 100 ký tự". Body dưới 64 KB mà tên vẫn quá 100 ký tự thì vẫn là `400` như thường.

### Lỗi 415 Unsupported Media Type

Request: `POST /api/departments` với `Content-Type: text/plain`, body là chữ `Kế toán`

Response `415`, `Content-Type: application/problem+json`:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.16",
  "title": "Kiểu dữ liệu không được hỗ trợ",
  "status": 415,
  "detail": "Hãy gửi JSON (Content-Type: application/json).",
  "traceId": "00-4e110dc3c944db20ca1c8216f9118deb-f8dd84f38de7a9d3-00"
}
```

### Lỗi 500 Internal Server Error

Request: `GET /api/employees` lúc backend không kết nối được PostgreSQL (lấy ví dụ bằng một backend phụ trỏ tới cổng không có database)

Response `500`, `Content-Type: application/problem+json`:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.6.1",
  "title": "Lỗi máy chủ",
  "status": 500,
  "detail": "Đã có lỗi xảy ra, vui lòng thử lại sau.",
  "traceId": "00-069cef28e38312296dc53f20c7d2802d-b181ba50cba76b9e-00"
}
```

Lời báo là câu chung, không lộ tên bảng, câu SQL hay chi tiết kết nối. Log của backend ghi **đúng một** dòng `fail:` cho lỗi này, kèm cùng `traceId`; tìm `traceId` trong log để biết nguyên nhân thật.

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
