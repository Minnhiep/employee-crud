# 02. API và JSON: "hợp đồng" giữa frontend và backend

> Phần trong kế hoạch: *REST; GET, POST, PUT, DELETE; request/response JSON; HTTP status code; validation và xử lý lỗi; OpenAPI và kiểm thử bằng Postman.*
> Vị trí trong luồng: **bước 3 và 8** ở [00-tong-quan-luong.md](00-tong-quan-luong.md).
>
> **Lưu ý: đây là bản nháp học, viết trước khi làm bài.** Bài thật khác ở: `PUT` trả `200` kèm dữ liệu sau khi sửa, không phải `204`; API có 10 thao tác, gồm cả thêm, sửa, xóa phòng ban; phòng ban trả thêm `employeeCount`; danh sách nhân viên lọc được theo `departmentId`; bài thật đã cài trang Swagger UI ở `/swagger` (chỉ khi chạy môi trường Development), ý "không kèm sẵn trang giao diện" ở mục OpenAPI chỉ đúng với dự án mới tạo; mẫu tìm bằng `ILike` và mẫu CORS trong bản học [03-aspnet-core.md](03-aspnet-core.md) không phải code thật: code thật tìm bằng `Contains` (EF Core tự thoát `%`, `_`), CORS chỉ cho 4 phương thức GET, POST, PUT, DELETE và header `Content-Type`. Bảng ở mục 8 chỉ là nháp, bản đúng với bài thật là [danh sách API](../danh-sach-api.md).

## 1. Nói đơn giản

**API** (Application Programming Interface) giống **quầy giao dịch ngân hàng**. Khách không vào kho tiền mà đưa **phiếu theo mẫu** qua quầy, rồi nhận lại **biên nhận**. Quầy quy định rõ phiếu nào làm việc gì, ghi những ô nào, và biên nhận báo "thành công" hay "sai ở đâu".

- Phiếu gửi đi là **request**, biên nhận là **response**.
- Mẫu phiếu là **JSON**.
- Quy ước quầy nào làm việc gì là **REST**.
- Bản mô tả đầy đủ các quầy là **OpenAPI**.

## 2. HTTP: request và response gồm những gì

| Request | Ví dụ | Response | Ví dụ |
|---|---|---|---|
| **Method** (làm gì) | `POST` | **Status code** (kết quả) | `201` |
| **URL** (với cái gì) | `/api/employees` | **Headers** | `Content-Type: application/json` |
| **Headers** (thông tin kèm) | `Content-Type: application/json` | **Body** | JSON nhân viên vừa tạo |
| **Body** (dữ liệu gửi) | JSON nhân viên mới | | |

## 3. REST: đặt địa chỉ theo "danh từ", hành động theo "method"

REST là **phong cách thiết kế**, không phải thư viện. Ý chính:
- URL chỉ **tài nguyên** bằng danh từ số nhiều, ví dụ `/api/employees`. Không viết kiểu `/api/getEmployees`.
- **Method** nói hành động.
- Mỗi request tự đủ thông tin, server không nhớ request trước (**stateless**).

| Method | Ý nghĩa | Ví dụ bài CRUD | Có body? | Thành công trả | Gọi lặp lại có đổi kết quả? (**idempotent**) |
|---|---|---|---|---|---|
| GET | Lấy | `GET /api/employees?search=an` | Không | `200` + danh sách | Không đổi (an toàn) |
| GET | Lấy một | `GET /api/employees/15` | Không | `200` / `404` | Không đổi |
| POST | Tạo mới | `POST /api/employees` | Có | `201` + `Location` | **Có**: gọi 2 lần tạo 2 bản ghi |
| PUT | Thay toàn bộ | `PUT /api/employees/15` | Có | `200` hoặc `204` | Không: gọi 2 lần kết quả như nhau |
| DELETE | Xóa | `DELETE /api/employees/15` | Không | `204` | Không: lần 2 có thể trả `404` nhưng dữ liệu vẫn vậy |

**Vì sao cần hiểu idempotent?** Mạng chập chờn khiến request bị gửi lại. Gửi lại PUT hay DELETE không gây hại, còn POST thì có thể tạo trùng. Đó là lý do khóa nút "Lưu" khi đang gửi (xem [01-react.md](01-react.md) mục 7) và đặt ràng buộc email không trùng ở database.

Tìm kiếm dùng **query string** (`?search=an`). Đừng tạo URL riêng kiểu `/api/searchEmployees`.

## 4. JSON

JSON là định dạng chữ để trao đổi dữ liệu, người đọc được và máy đọc được.

```json
{
  "id": 15,
  "fullName": "Nguyễn Văn An",
  "email": "an.nguyen@example.com",
  "departmentId": 2,
  "departmentName": "Kế toán",
  "isActive": true,
  "phone": null,
  "skills": ["SQL", "C#"]
}
```

Quy tắc: tên thuộc tính đặt trong **ngoặc kép**; chuỗi dùng ngoặc kép (không dùng ngoặc đơn); không có dấu phẩy thừa ở cuối; không có comment; giá trị chỉ có thể là chuỗi, số, `true`/`false`, `null`, object hoặc mảng.

**Quy ước tên:** ASP.NET Core mặc định đổi `FullName` (C#) thành `fullName` (JSON) theo kiểu **camelCase**, nên React dùng `fullName`.

## 5. HTTP status code cần nhớ

| Mã | Tên | Khi nào dùng trong bài CRUD |
|---|---|---|
| 200 | OK | GET thành công; PUT trả lại dữ liệu |
| 201 | Created | POST tạo mới thành công, kèm header `Location` trỏ tới bản ghi mới |
| 204 | No Content | DELETE thành công, không có body |
| 400 | Bad Request | Dữ liệu sai: thiếu họ tên, email sai định dạng |
| 404 | Not Found | Không có nhân viên id 999 |
| 409 | Conflict | Email đã tồn tại; xóa phòng ban còn nhân viên |
| 500 | Internal Server Error | Lỗi phía server chưa lường trước, **không phải lỗi người dùng** |

Ghi nhớ theo nhóm: **2xx** là thành công; **4xx** là lỗi phía người gửi (sửa request là được); **5xx** là lỗi phía server. Nguồn: [MDN HTTP status codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) (link quen thuộc, chưa mở lại khi viết).

## 6. Validation và cách trả lỗi

- **Validation** là kiểm tra dữ liệu có hợp lệ không.
- Có hai loại lỗi cần phân biệt:
  - **Lỗi dữ liệu đầu vào**, ví dụ email sai định dạng: trả `400`, chỉ rõ **trường nào sai**.
  - **Lỗi nghiệp vụ**, ví dụ email đã có người dùng hay phòng ban không tồn tại: trả `409` hoặc `400`, kèm thông báo dễ hiểu.

ASP.NET Core trả lỗi theo chuẩn **Problem Details** (RFC 9457, trước đây là RFC 7807), với `Content-Type: application/problem+json`:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Email": ["The Email field is required."],
    "FullName": ["The FullName field is required."]
  }
}
```

React đọc `errors` để hiện lỗi cạnh từng ô nhập. **Không trả nội dung lỗi nội bộ** (stack trace, câu SQL) cho người dùng, vì như vậy lộ thông tin hệ thống.

## 7. CORS: lỗi đầu tiên gần như ai cũng gặp

React chạy ở `http://localhost:5173` (cổng mặc định của Vite; công cụ khác có thể dùng cổng khác), backend chạy ở một cổng khác (ví dụ `http://localhost:5080`). Khác cổng nghĩa là khác **origin**. Trình duyệt mặc định **chặn** trang này gọi API của origin khác, trừ khi server trả lời "tôi cho phép origin đó". Cơ chế này gọi là **CORS** (Cross-Origin Resource Sharing).

- Lỗi thấy ở Console trình duyệt: `blocked by CORS policy`.
- Postman **không** bị lỗi này vì CORS là luật của trình duyệt. Vì thế API chạy được bằng Postman mà React vẫn có thể bị chặn.
- Cách sửa nằm ở **backend**, xem [03-aspnet-core.md](03-aspnet-core.md) mục 9.

## 8. Danh sách API cho bài CRUD (bản nháp để nộp)

| Method | URL | Body gửi | Thành công | Lỗi có thể |
|---|---|---|---|---|
| GET | `/api/departments` | | 200, mảng `{id, name}` | |
| GET | `/api/employees?search=` | | 200, mảng nhân viên (lọc theo họ tên/email) | |
| GET | `/api/employees/{id}` | | 200, một nhân viên | 404 |
| POST | `/api/employees` | `{fullName, email, departmentId}` | 201, nhân viên mới + `Location` | 400, 409 |
| PUT | `/api/employees/{id}` | `{fullName, email, departmentId}` | 204, không có body | 400, 404, 409 |
| DELETE | `/api/employees/{id}` | | 204 | 404 |

Kế hoạch yêu cầu nộp **"danh sách API kèm ví dụ request/response JSON"**. Bảng này cộng với ví dụ ở mục 4 và 6 là khung để điền.

## 9. OpenAPI và Postman

- **OpenAPI** là bản mô tả API dạng máy đọc được (file JSON/YAML): có những đường dẫn nào, nhận gì, trả gì. Từ .NET 9, ASP.NET Core tự sinh file này bằng `AddOpenApi()` + `MapOpenApi()`, xem ở `/openapi/v1.json`. **Không kèm sẵn trang giao diện** (Swagger UI) để bấm thử, muốn có thì cài thêm gói. Nguồn: [Generate OpenAPI documents](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/aspnetcore-openapi?view=aspnetcore-10.0), đã tra ngày 30/10/2026.
- **Postman** là công cụ gửi request thử mà không cần giao diện. Có thể **import** file OpenAPI vào Postman để có sẵn danh sách request.

Cách kiểm thử API bằng Postman cho mỗi API: một trường hợp đúng, các trường hợp sai (thiếu trường, email sai, id không tồn tại, email trùng). Ghi lại status code nhận được và so với bảng mục 8. **Kiểm API xong mới nối giao diện**, để khi có lỗi biết ngay lỗi nằm ở tầng nào.

## 10. Câu hỏi tự kiểm

1. Vì sao URL là `/api/employees` mà không phải `/api/createEmployee`?
2. POST và PUT khác nhau ở đâu? Cái nào idempotent, và điều đó ảnh hưởng gì?
3. Thêm nhân viên với email đã có thì nên trả mã nào? Vì sao không trả 500?
4. Vì sao API gọi bằng Postman thì chạy, gọi từ React thì báo CORS?
5. OpenAPI khác Swagger UI ở đâu?
6. Phân biệt 400, 404, 409 bằng một ví dụ mỗi mã trong bài CRUD.
