# Thiết kế bảo mật: u4-employees

> **Nguồn:** `nfr-requirements/security-requirements.md` (NFR2.1–NFR2.6, NFR7.1), `functional-design/rules.md` (BR1.1–BR1.9, BR2.2), `functional-design-questions.md` (Q2), cách làm của U3, rà soát NFR Requirements U4 (Minor 1, 3).
>
> Không có đăng nhập (project.md Forbidden). Lớp chặn giống U3: form kiểm trước, API kiểm lại, database chặn lần cuối.

## 1. Kiểm dữ liệu ở biên (NFR2.2, NFR2.6)

| Lớp | Kiểm gì | Sai thì |
|---|---|---|
| DTO `EmployeeRequest` | `[Required]` trên `FullName` ("Vui lòng nhập họ tên") và `Email` ("Vui lòng nhập email"). `DepartmentId` kiểu `int?`, không gắn `[Required]` | 400 `errors.fullName` / `errors.email` (qua `ValidationResponseFactory` của U1) |
| Model binding của ASP.NET | Body sai kiểu (`"departmentId": "abc"`, `"fullName": 5`) hoặc JSON hỏng | 400 của U1; khóa lỗi không trùng tên ô, nên form hiện ở khung tóm tắt (không mất lỗi) |
| `EmployeeService` | Trim; BR1.2–BR1.6 (độ dài, định dạng); BR1.8 (`DepartmentId` null hoặc < 1 → "Vui lòng chọn phòng ban"); BR1.9 (phòng ban tồn tại); BR1.7 (email trùng) | `DomainError.Validation` (400) hoặc `Conflict` (409) |
| Database | `varchar(100)`, `varchar(254)`, `NOT NULL`, `ux_employees_email`, `fk_employees_department` | 23505 → 409 (U1); 23503 → 400 (U4 bắt) |

- **Vì sao `DepartmentId` là `int?` và không có `[Required]`:** nếu để `int` thì thiếu trường sẽ thành 0 một cách im lặng. Nếu gắn `[Required]` thì lời báo nằm ở hai chỗ. Để service kiểm "null hoặc < 1" thì có đúng một lời báo "Vui lòng chọn phòng ban", gắn khóa `departmentId`.

### Luật định dạng email (BR1.6, Q2)

Một biểu thức chính quy, cùng nội dung ở C# và TypeScript:

```text
^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$
```

- Đọc thành lời: phần trước `@` có ít nhất một ký tự, không có khoảng trắng hay `@`. Phần sau `@` gồm ít nhất hai đoạn ngăn bởi dấu chấm; mỗi đoạn không rỗng, không có khoảng trắng, `@` hay dấu chấm. Vì vậy dấu chấm không thể đứng đầu, đứng cuối hay đứng liền nhau.
- Bộ ví dụ chuẩn (BR1.6): hợp lệ `a@congty.vn`, `an.nguyen@cong-ty.com.vn`; không hợp lệ `abc`, `a@b`, `a @b.vn`, `a@b.`, `a@@b.vn`, `a@.b.vn`, `a@b..vn`.
- Cả hai nơi có comment trỏ về BR1.6. Unit test service dùng đúng bộ ví dụ này; kiểm tay trên form dùng lại.

## 2. Tìm kiếm an toàn (NFR2.3)

- Chuỗi tìm được trim rồi đưa vào LINQ `ToLower().Contains(...)`. EF Core gửi chuỗi dưới dạng tham số.
- Theo rà soát, câu SQL sinh ra có thể dùng `strpos(...)` chứ không phải `LIKE`. Trong trường hợp đó `%` và `_` vốn không phải ký tự đại diện. Nếu sinh `LIKE`, EF tự thoát chúng. **Code Generation bật log SQL (NFR6.3) để xem câu thật và ghi lại vào `code-summary.md`.**
- **Kiểm:** Postman `?search=%25` (tức `%`) và `?search=_` trả rỗng khi không có ai mang ký tự đó.
- Không giới hạn độ dài chuỗi tìm ở API. URL quá dài đã bị Kestrel chặn; dữ liệu nhỏ nên chuỗi dài chỉ là không khớp gì.

## 3. Lỗi không lộ chi tiết (NFR2.4)

- `detail` chỉ chứa mã nhân viên ("Không tìm thấy nhân viên có mã 7.") hoặc tên phòng ban. Lỗi lạ không bắt, để U1 trả 500 chung.

## 4. Hiển thị an toàn (NFR2.5)

- Họ tên, email, tên phòng ban và chuỗi tìm (trong câu "Không tìm thấy nhân viên phù hợp với "<chuỗi>"") đều hiển thị bằng JSX. Không dùng `dangerouslySetInnerHTML`, không dùng `mailto:`.

## 5. Không thêm bí mật (NFR2.1)

- Quét trước commit, mở rộng theo rà soát để bắt cả dạng JSON:
  `git grep --untracked -i -n -E "(password|pwd)\s*=|\"password\"\s*:" -- backend frontend` → 0 dòng.

## 6. CORS (NFR7.1)

- Dùng chính sách "Frontend" của U1. **Kiểm:** POST, PUT, DELETE nhân viên thật từ `http://localhost:5173` không lỗi CORS; lỗi 400/409 vẫn hiện trên form.
