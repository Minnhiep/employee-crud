# Thiết kế hiệu năng: u4-employees

> **Nguồn:** `nfr-requirements/performance-requirements.md` (NFR5.1–NFR5.5), `nfr-requirements/tech-stack-decisions.md` (NFR4.5), `functional-design/functional-spec.md` (W1–W4), rà soát NFR Requirements U4 (Minor 2: dữ liệu đo tạm).

## 1. Một câu truy vấn cho danh sách và tìm kiếm (NFR5.1–NFR5.3)

- Danh sách dùng `AsNoTracking()`, lọc (nếu có chuỗi tìm), sắp `FullName` rồi `Id`, rồi `Select` thẳng ra `EmployeeDto` có `e.Department.Name`. EF Core dịch thành **một** câu `SELECT ... FROM employees JOIN departments ...`.
  - Vì sao: không có lần gọi database riêng cho từng nhân viên ("N+1"). Với 1.000 dòng, đây vẫn là một lần gọi duy nhất.
- Tìm kiếm thêm điều kiện `lower(full_name) chứa lower(@p) OR lower(email) chứa lower(@p)` vào cùng câu đó. Không dùng được chỉ mục, nhưng quét 1.000 dòng chỉ tốn vài mili giây.

```csharp
// Minh họa ý thiết kế, không phải code cuối cùng
query.OrderBy(e => e.FullName).ThenBy(e => e.Id)
     .Select(e => new EmployeeDto(e.Id, e.FullName, e.Email, e.DepartmentId, e.Department.Name))
```

## 2. Ngân sách số lần gọi database cho thao tác ghi (NFR5.4)

| Thao tác | Các lần gọi | Ghi chú |
|---|---|---|
| `GET /api/employees[?search=]` | 1 | JOIN lấy tên phòng ban |
| `GET /api/employees/{id}` | 1 | JOIN |
| `POST` | 4: phòng ban tồn tại, email trùng, `INSERT`, đọc lại DTO (có tên phòng ban) | Kiểm dữ liệu trước, không chạm database |
| `PUT` | 5: đọc nhân viên, phòng ban tồn tại, email trùng, `UPDATE`, đọc lại DTO | |
| `DELETE` | 2: đọc, `DELETE` | |
| `DELETE /api/departments/{id}` (bổ sung) | 3: đọc phòng ban, kiểm còn nhân viên (dùng chỉ mục `department_id`), `DELETE` | |

Mỗi lần gọi tốn vài mili giây trên máy, nên tổng cộng vẫn dưới 1 giây rất xa.

## 3. Cách đo với 1.000 nhân viên (NFR5.1, NFR5.2)

Hiệp chạy trong pgAdmin (Query Tool trên `employee_db`), dữ liệu tạm có dấu và được đánh dấu bằng đuôi email `@perf.test`:

```sql
INSERT INTO employees (full_name, email, department_id)
SELECT 'Nguyễn Văn Thử ' || g, 'thu' || g || '@perf.test', (SELECT min(id) FROM departments)
FROM generate_series(1, 1000) AS g;
-- Đo bằng Postman: GET /api/employees và GET /api/employees?search=th%E1%BB%AD (3 lần mỗi lời gọi)
DELETE FROM employees WHERE email LIKE '%@perf.test';
SELECT count(*) FROM employees WHERE email LIKE '%@perf.test';  -- phải ra 0
```

Đạt khi mỗi lời gọi ≤ 1 giây. Dữ liệu tạm phải được xóa sạch, nếu không NFR1.2 (danh sách trống sau migration) sẽ sai ở lần kiểm sau.

## 4. Giao diện (NFR5.5)

- Trang danh sách: một lời gọi khi mở hoặc khi đổi chuỗi tìm. Lời gọi cũ bị hủy khi có chuỗi mới (AbortController), nên kết quả cũ không đè lên kết quả mới.
- Form sửa: tải nhân viên và danh sách phòng ban **song song**, nên thời gian chờ bằng lời gọi lâu hơn chứ không phải tổng hai lời gọi.
- Không thêm thư viện mới.
- **Kiểm:** Lighthouse Performance ≥ 90 cho trang `/employees` trên `npm run preview` (cổng 5173).
