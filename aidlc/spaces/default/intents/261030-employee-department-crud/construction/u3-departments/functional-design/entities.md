# Thực thể: u3-departments

> **Nguồn:**
> - `inception/requirements-analysis/requirements.md` (FR1.1–FR1.7, mục 2 ràng buộc dữ liệu)
> - `inception/contract-design/contract-summary.md` (C1 `DepartmentDto`, `DepartmentRequest`; C5 bảng `departments`, seed)
> - `inception/domain-design/components.md` (khối DepartmentManagement)
> - `construction/u1-backend-platform` qua hợp đồng C5: tên ràng buộc cố định `ux_departments_name`
>
> U3 sở hữu một thực thể lưu trữ là `Department`, cùng hai hình dạng dữ liệu đi qua API.

```yaml
entities:
  - name: Department
    description: Một phòng ban của công ty. Lưu ở bảng departments (snake_case, khai báo tay).
    persisted: true
    table: departments
    attributes:
      - { name: Id, column: id, logical_type: integer, required: true, unique: true, constraints: "khóa chính, số tự tăng do database cấp" }
      - { name: Name, column: name, logical_type: text, required: true, min: 1, max: 100, constraints: "đã bỏ khoảng trắng hai đầu; không trùng với phòng ban khác khi so không phân biệt hoa thường (chỉ mục ux_departments_name trên lower(name))" }
    entity_constraints:
      - "Chỉ mục không trùng ux_departments_name trên lower(name): database tự chặn tên trùng kể cả khi hai request chen nhau (NFR3)"
    relationships:
      - { to: Employee, cardinality: "1 -> 0..n", direction: "Employee (U4) tham chiếu Department qua department_id; xóa phòng ban còn nhân viên bị chặn (ON DELETE RESTRICT, U4 tạo khóa ngoại)" }
    seed:
      - "Nhân sự"
      - "Kế toán"
      - "Kỹ thuật"
      - "Kinh doanh"

  - name: DepartmentDto
    description: Dữ liệu một phòng ban trả về qua API (C1)
    persisted: false
    attributes:
      - { name: id, logical_type: integer, required: true }
      - { name: name, logical_type: text, required: true }
    relationships: []

  - name: DepartmentRequest
    description: Dữ liệu gửi lên khi thêm hoặc sửa phòng ban (C1)
    persisted: false
    attributes:
      - { name: name, logical_type: text, required: true, min: 1, max: 100, constraints: "bỏ khoảng trắng hai đầu trước khi kiểm và lưu" }
    relationships: []
```

## Tóm tắt

| Thực thể | Lưu ở đâu | Ghi chú |
|---|---|---|
| Department | Bảng `departments` (`id`, `name`) | Tên 1–100 ký tự sau khi bỏ khoảng trắng hai đầu; không trùng (không phân biệt hoa thường); 4 phòng ban mẫu do migration tạo |
| DepartmentDto | Không lưu | `{ id, name }` trả về qua API |
| DepartmentRequest | Không lưu | `{ name }` gửi lên khi thêm, sửa |
