# 04. PostgreSQL: nơi lưu dữ liệu

> Phần trong kế hoạch: *Tạo database và bảng; kiểu dữ liệu; khóa chính, khóa ngoại; SELECT, INSERT, UPDATE, DELETE, JOIN; khái niệm index và transaction.*
> Vị trí trong luồng: **bước 7** ở [00-tong-quan-luong.md](00-tong-quan-luong.md).
>
> **Lưu ý: đây là bản nháp học, viết trước khi làm bài.** Bài thật khác ở: bảng do migration EF Core tạo, không chạy tay câu `CREATE TABLE` dưới đây; `email` dài tối đa 254 ký tự, không phải 255; không có cột `created_at`; chống trùng tên và email bằng chỉ mục trên `lower(...)`, không dùng `UNIQUE` thường; xóa phòng ban còn nhân viên báo lỗi `RESTRICT`, mã `23001`. Đúng với bài thật: [sơ đồ database](../so-do-database.md).

## 1. Nói đơn giản

PostgreSQL là một **hệ quản trị cơ sở dữ liệu quan hệ** (relational database). Hình dung nó như một **file Excel rất nghiêm khắc**:
- Mỗi **bảng** (table) là một sheet; mỗi **dòng** (row) là một bản ghi, ví dụ một nhân viên; mỗi **cột** (column) là một thuộc tính, ví dụ email.
- Khác Excel ở chỗ: mỗi cột có **kiểu dữ liệu cố định**, có **luật** (không được trống, không được trùng, phải trỏ tới phòng ban có thật), nhiều người dùng cùng lúc không làm hỏng dữ liệu, và tìm kiếm trong hàng triệu dòng vẫn nhanh.

Bản hiện hành: **PostgreSQL 18**. Bản 19 đang ở giai đoạn RC (chưa chính thức). Nguồn: [Versioning Policy](https://www.postgresql.org/support/versioning/), đã tra ngày 30/10/2026.

Công cụ làm việc:
- **psql** là dòng lệnh, đi kèm khi cài.
- **pgAdmin** là giao diện đồ họa, thường có tùy chọn cài kèm trên Windows.

## 2. Tạo database và bảng

```sql
CREATE DATABASE employee_db;
-- Trong psql: \c employee_db  (chuyển sang database vừa tạo)

CREATE TABLE departments (
    id    integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name  varchar(100) NOT NULL UNIQUE
);

CREATE TABLE employees (
    id             integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name      varchar(100) NOT NULL,
    email          varchar(255) NOT NULL UNIQUE,
    department_id  integer NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
    created_at     timestamptz NOT NULL DEFAULT now()
);
```

Bài thật sẽ để **EF Core migration** tạo bảng (xem [03-aspnet-core.md](03-aspnet-core.md) mục 7). Vẫn nên tự viết SQL một lần để hiểu migration đang làm gì thay mình. Sau khi chạy migration, mở bảng ra so với câu trên.

**Chỉ chọn một cách tạo bảng cho mỗi database.** Migration và các câu `CREATE TABLE` trên đều tạo bảng `departments` và `employees`. Chạy cả hai trên `employee_db` sẽ báo lỗi *relation "..." already exists*. Muốn tập viết SQL tay thì tạo một database riêng để tập, ví dụ `CREATE DATABASE sql_practice;`, và chạy các câu trong file này ở đó. `employee_db` để migration quản lý.

## 3. Kiểu dữ liệu hay dùng

| Kiểu | Lưu gì | Ví dụ dùng |
|---|---|---|
| `integer` / `bigint` | Số nguyên (bigint lớn hơn) | id, số lượng |
| `numeric(p, s)` | Số thập phân chính xác | Tiền, lương (không dùng `real`/`double` cho tiền vì sai số làm tròn) |
| `varchar(n)` / `text` | Chuỗi (có/không giới hạn độ dài) | Tên, email, ghi chú |
| `boolean` | Đúng/sai | Còn làm việc không |
| `date` | Ngày | Ngày sinh, ngày vào làm |
| `timestamptz` | Thời điểm có múi giờ | Thời điểm tạo/sửa bản ghi |
| `uuid` | Mã định danh ngẫu nhiên 128-bit | Id khi không muốn lộ số thứ tự |

**Khóa tự tăng:** cách hiện đại là `GENERATED ... AS IDENTITY`. Nhiều bài cũ dùng `serial`, cũng chạy được nhưng là cách cũ.
- `ALWAYS`: không cho tự gán id.
- `BY DEFAULT`: cho gán id khi cần. EF Core (Npgsql) mặc định tạo kiểu này.

Nguồn: [PostgreSQL Data Types](https://www.postgresql.org/docs/current/datatype.html) (link quen thuộc, chưa mở lại khi viết).

## 4. Khóa chính, khóa ngoại và các ràng buộc

| Ràng buộc | Nói đơn giản | Ví dụ |
|---|---|---|
| **PRIMARY KEY** (khóa chính) | "Số CCCD" của dòng: duy nhất, không trống | `employees.id` |
| **FOREIGN KEY** (khóa ngoại) | "Tham chiếu": giá trị phải có thật ở bảng kia | `employees.department_id` → `departments.id` |
| **NOT NULL** | Bắt buộc có giá trị | `full_name` |
| **UNIQUE** | Không được trùng | `email` |

`ON DELETE RESTRICT`: **không cho xóa** phòng ban khi còn nhân viên trỏ tới. Một lựa chọn khác là `CASCADE`, xóa phòng ban thì xóa luôn nhân viên. Lựa chọn này nguy hiểm, chỉ dùng khi chắc chắn.

**Vì sao đặt luật ở database chứ không chỉ ở code?** Database là **chốt chặn cuối cùng**. Code có thể có lỗi, có thể có người sửa dữ liệu bằng công cụ khác, hoặc hai request ghi cùng lúc. Luật ở database vẫn đứng vững trong mọi trường hợp đó.

## 5. SQL CRUD

```sql
-- C: thêm
INSERT INTO departments (name) VALUES ('Kế toán'), ('Nhân sự'), ('Kỹ thuật');

INSERT INTO employees (full_name, email, department_id)
VALUES ('Nguyễn Văn An', 'an.nguyen@example.com', 1)
RETURNING id;                       -- trả lại id vừa tạo (đặc trưng PostgreSQL)

-- R: đọc
SELECT id, full_name, email FROM employees WHERE department_id = 1 ORDER BY full_name;

-- Tìm kiếm không phân biệt hoa thường: ILIKE (đặc trưng PostgreSQL); % = chuỗi bất kỳ
SELECT * FROM employees WHERE full_name ILIKE '%an%' OR email ILIKE '%an%';

-- U: sửa (LUÔN có WHERE)
UPDATE employees SET email = 'an.nv@example.com' WHERE id = 1;

-- D: xóa (LUÔN có WHERE)
DELETE FROM employees WHERE id = 1;
```

**Cảnh báo:** `UPDATE` hay `DELETE` mà **quên `WHERE`** thì áp dụng cho **toàn bộ bảng**. Thói quen an toàn: viết `SELECT ... WHERE ...` trước để xem sẽ trúng những dòng nào, rồi mới đổi thành `UPDATE`/`DELETE`.

Thử vi phạm ràng buộc để thấy database tự bảo vệ:

```sql
INSERT INTO employees (full_name, email, department_id) VALUES ('Bình', 'binh@example.com', 999);
-- ERROR: insert or update on table "employees" violates foreign key constraint ...

DELETE FROM departments WHERE id = 1;     -- khi còn nhân viên thuộc phòng 1
-- ERROR: update or delete on table "departments" violates foreign key constraint ...
```

## 6. JOIN: ghép hai bảng

Danh sách nhân viên cần hiện **tên phòng ban**, nhưng bảng `employees` chỉ lưu `department_id`. JOIN ghép hai bảng theo cột liên kết, giống **VLOOKUP trong Excel**.

```sql
-- INNER JOIN: chỉ lấy dòng khớp ở cả hai bảng
SELECT e.id, e.full_name, e.email, d.name AS department_name
FROM employees e
JOIN departments d ON d.id = e.department_id
ORDER BY e.full_name;

-- LEFT JOIN: lấy mọi phòng ban, kể cả phòng chưa có nhân viên; đếm số người
SELECT d.name, COUNT(e.id) AS so_nhan_vien
FROM departments d
LEFT JOIN employees e ON e.department_id = d.id
GROUP BY d.name;
```

| Loại | Lấy gì |
|---|---|
| `INNER JOIN` (viết `JOIN`) | Chỉ dòng có cặp ở cả hai bên |
| `LEFT JOIN` | Mọi dòng bảng trái; bên phải không khớp thì là `NULL` |

Liên hệ: câu `.Select(e => new EmployeeDto(..., e.Department.Name))` trong EF Core sẽ được **dịch thành một câu JOIN** như trên.

## 7. Index: mục lục của bảng

**Index** giống **mục lục cuối sách**: muốn tìm chữ "PostgreSQL" thì tra mục lục ra số trang, không phải lật từng trang. Không có index, database phải **quét toàn bộ bảng** (sequential scan).

```sql
CREATE INDEX ix_employees_department_id ON employees (department_id);
```

- PRIMARY KEY và UNIQUE **tự tạo index**, nên `id` và `email` đã có sẵn.
- PostgreSQL **không tự tạo index cho cột khóa ngoại**. Cột này hay dùng trong JOIN/WHERE nên thường nên tạo. EF Core tự tạo index cho khóa ngoại khi sinh migration.
- **Đánh đổi:** index làm **đọc nhanh hơn** nhưng **ghi chậm hơn** (mỗi lần INSERT/UPDATE phải cập nhật cả mục lục) và tốn chỗ. Không tạo index cho mọi cột.
- `ILIKE '%an%'` (có `%` ở đầu) **không dùng được index thường**. Bảng nhỏ trong bài tập thì không sao. Bảng lớn cần kỹ thuật khác, ví dụ `pg_trgm`, nằm ngoài phạm vi 2 tuần.
- Muốn biết câu lệnh có dùng index không, chạy `EXPLAIN SELECT ...`.

## 8. Transaction: "tất cả hoặc không gì cả"

**Transaction** giống **chuyển khoản ngân hàng**: trừ tiền tài khoản A và cộng tiền tài khoản B phải **cùng thành công**. Nếu trừ xong mà mất điện trước khi cộng, toàn bộ phải **quay lại như cũ**.

```sql
BEGIN;
UPDATE employees SET department_id = 2 WHERE department_id = 1;   -- chuyển hết người phòng 1 sang phòng 2
DELETE FROM departments WHERE id = 1;                             -- xóa phòng 1
COMMIT;        -- chốt cả hai; nếu có lỗi giữa chừng thì ROLLBACK để hủy cả hai
```

Tính chất **ACID** (bốn chữ cái đầu):
- **A**tomicity (nguyên tử): tất cả hoặc không gì.
- **C**onsistency (nhất quán): luôn thỏa các ràng buộc.
- **I**solation (cô lập): giao dịch chạy song song không giẫm lên nhau.
- **D**urability (bền): đã COMMIT thì không mất kể cả khi sập máy.

Liên hệ EF Core: mỗi lần gọi `SaveChangesAsync()` thì EF Core **tự gói mọi thay đổi trong một transaction**. Muốn gộp nhiều lần `SaveChanges` vào một giao dịch thì dùng `db.Database.BeginTransactionAsync()`.

## 9. Sơ đồ database (để nộp)

Kế hoạch yêu cầu nộp **sơ đồ database**. Bản tối thiểu:

```
departments                      employees
+------------------+             +---------------------------+
| id   PK          |1 ────────< *| id            PK          |
| name UNIQUE      |             | full_name     NOT NULL    |
+------------------+             | email         UNIQUE      |
                                 | department_id FK → departments.id |
                                 | created_at                |
                                 +---------------------------+
   Một phòng ban có nhiều nhân viên (1 - nhiều); mỗi nhân viên thuộc đúng một phòng ban.
```

pgAdmin có công cụ **ERD** để vẽ sơ đồ từ database thật. Tùy bản cài, chưa kiểm trên mọi máy.

## 10. Câu hỏi tự kiểm

1. Khóa chính và khóa ngoại khác nhau thế nào? Chỉ ra trong bài CRUD.
2. Vì sao không cho xóa phòng ban còn nhân viên? `RESTRICT` và `CASCADE` khác nhau ra sao?
3. Viết câu SQL lấy danh sách nhân viên kèm tên phòng ban, tìm theo chữ "an".
4. INNER JOIN và LEFT JOIN khác nhau thế nào? Khi đếm số nhân viên mỗi phòng thì dùng loại nào, vì sao?
5. Index giúp gì, và làm chậm việc gì? Vì sao không tạo index cho mọi cột?
6. Transaction là gì? Cho một ví dụ trong bài cần transaction.
7. Vì sao lưu tiền nên dùng `numeric` mà không dùng `double`?

## Nguồn

- [PostgreSQL Tutorial: The SQL Language](https://www.postgresql.org/docs/current/tutorial-sql.html), tutorial trong kế hoạch.
- [PostgreSQL Versioning Policy](https://www.postgresql.org/support/versioning/): đã tra ngày 30/10/2026.
- [PostgreSQL Documentation (current)](https://www.postgresql.org/docs/current/): link quen thuộc, chưa mở lại khi viết.
