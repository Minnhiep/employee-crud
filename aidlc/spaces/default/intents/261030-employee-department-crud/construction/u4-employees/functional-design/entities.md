# Thực thể: u4-employees

> **Nguồn:**
> - `inception/requirements-analysis/requirements.md` (FR2.1–FR2.6, FR3.1–FR3.2, mục 2 ràng buộc dữ liệu, mục 6 giả định)
> - `inception/contract-design/contract-summary.md` (C2 `EmployeeDto`, `EmployeeRequest`; C5 bảng `employees`)
> - `inception/domain-design/components.md` (khối EmployeeManagement)
> - Phần nền có sẵn: U1 (`DbConstraintNames.EmployeeEmailUnique` = `ux_employees_email`, `EmployeeDepartmentForeignKey` = `fk_employees_department`), U3 (bảng `departments`)
> - `functional-design-questions.md` (Q1: giữ email như đã gõ)
>
> U4 sở hữu một thực thể lưu trữ là `Employee`, cùng ba hình dạng dữ liệu đi qua API.

```yaml
entities:
  - name: Employee
    description: Một nhân viên, thuộc đúng một phòng ban. Lưu ở bảng employees (snake_case, khai báo tay).
    persisted: true
    table: employees
    attributes:
      - { name: Id, column: id, logical_type: integer, required: true, unique: true, constraints: "khóa chính, số tự tăng do database cấp" }
      - { name: FullName, column: full_name, logical_type: text, required: true, min: 1, max: 100, constraints: "đã bỏ khoảng trắng hai đầu" }
      - { name: Email, column: email, logical_type: text, required: true, min: 1, max: 254, constraints: "đã bỏ khoảng trắng hai đầu; giữ nguyên chữ hoa/thường như người dùng gõ (Q1); đúng định dạng (BR1.6); không trùng với nhân viên khác khi so không phân biệt hoa thường (chỉ mục ux_employees_email trên lower(email))" }
      - { name: DepartmentId, column: department_id, logical_type: integer, required: true, references: Department.Id, constraints: "phải là phòng ban đang có; khóa ngoại fk_employees_department ON DELETE RESTRICT" }
    entity_constraints:
      - "Chỉ mục không trùng ux_employees_email trên lower(email): database tự chặn email trùng kể cả khi hai request chen nhau"
      - "Khóa ngoại fk_employees_department (department_id -> departments.id) ON DELETE RESTRICT: database không cho xóa phòng ban còn nhân viên"
      - "Chỉ mục thường trên department_id: kiểm 'phòng ban còn nhân viên' và khóa ngoại không phải quét cả bảng"
    relationships:
      - { to: Department, cardinality: "0..n -> 1", direction: "Employee tham chiếu Department qua department_id; một phòng ban có không hoặc nhiều nhân viên" }
    seed: []

  - name: EmployeeDto
    description: Dữ liệu một nhân viên trả về qua API (C2), kèm sẵn tên phòng ban để giao diện không phải gọi thêm
    persisted: false
    attributes:
      - { name: id, logical_type: integer, required: true }
      - { name: fullName, logical_type: text, required: true }
      - { name: email, logical_type: text, required: true }
      - { name: departmentId, logical_type: integer, required: true }
      - { name: departmentName, logical_type: text, required: true, constraints: "lấy từ phòng ban mà nhân viên thuộc về" }
    relationships: []

  - name: EmployeeRequest
    description: Dữ liệu gửi lên khi thêm hoặc sửa nhân viên (C2); sửa thì gửi đủ mọi trường
    persisted: false
    attributes:
      - { name: fullName, logical_type: text, required: true, min: 1, max: 100, constraints: "bỏ khoảng trắng hai đầu trước khi kiểm và lưu" }
      - { name: email, logical_type: text, required: true, min: 1, max: 254, constraints: "bỏ khoảng trắng hai đầu; đúng định dạng" }
      - { name: departmentId, logical_type: integer, required: true, min: 1, constraints: "phải là phòng ban đang có (kiểm qua C4)" }
    relationships: []

  - name: EmployeeSearch
    description: Tham số tìm kiếm trên danh sách (C2 ?search=)
    persisted: false
    attributes:
      - { name: search, logical_type: text, required: false, constraints: "bỏ khoảng trắng hai đầu; rỗng hoặc không có thì trả tất cả" }
    relationships: []
```

## Tóm tắt

| Thực thể | Lưu ở đâu | Ghi chú |
|---|---|---|
| Employee | Bảng `employees` (`id`, `full_name`, `email`, `department_id`) | Họ tên 1–100, email 1–254 ký tự sau khi bỏ khoảng trắng; email không trùng (không phân biệt hoa thường) nhưng giữ nguyên chữ như đã gõ; thuộc đúng một phòng ban; không có nhân viên mẫu |
| EmployeeDto | Không lưu | `{ id, fullName, email, departmentId, departmentName }` |
| EmployeeRequest | Không lưu | `{ fullName, email, departmentId }` |
| EmployeeSearch | Không lưu | `?search=` trên `GET /api/employees` |

Quan hệ với U3: `Department` 1 → 0..n `Employee`. Xóa phòng ban còn nhân viên bị chặn ở hai lớp: service kiểm trước (BR2.7), khóa ngoại RESTRICT chặn lần cuối.
