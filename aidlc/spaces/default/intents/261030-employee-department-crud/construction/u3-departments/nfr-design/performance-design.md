# Thiết kế hiệu năng: u3-departments

> **Nguồn:** `nfr-requirements/performance-requirements.md` (NFR5.1–NFR5.4), `nfr-requirements/tech-stack-decisions.md` (NFR4.4), `functional-design/functional-spec.md` (W1–W4).

## 1. Ngân sách số lần gọi database cho mỗi thao tác (NFR5.1, NFR5.2)

Mỗi request chạm database tối đa 3 lần. Với vài chục phòng ban trên máy dev, mỗi lần chỉ tốn vài mili giây, nên mức "≤ 1 giây" còn dư rất xa.

| Thao tác | Các lần gọi database | Ghi chú |
|---|---|---|
| `GET /api/departments` | 1: `SELECT id, name ... ORDER BY name` | Sắp A-Z ngay trong database (BR2.1), không sắp lại trong bộ nhớ |
| `GET /api/departments/{id}` | 1 | Không có → 404 |
| `POST` | 2: kiểm trùng, `INSERT` | |
| `PUT` | 3: đọc dòng, kiểm trùng (loại trừ chính nó), `UPDATE` | |
| `DELETE` | 2: đọc dòng (lấy tên để báo lỗi BR2.5), `DELETE` | |

**Kiểm (NFR5.1, NFR5.2):** dùng Postman gọi mỗi thao tác 3 lần và lấy số lớn nhất ở cột thời gian. Nếu vượt 1 giây thì bật log SQL (observability-design §2) để xem câu nào chậm.

## 2. Truy vấn đọc gọn (NFR5.3)

- Các truy vấn chỉ đọc dùng `AsNoTracking()` và chọn thẳng ra DTO bằng `Select`, nên câu SQL chỉ lấy cột `id`, `name`. Vì sao: không theo dõi thay đổi thì EF Core không phải giữ bản sao từng dòng trong bộ nhớ, và DTO không lộ thực thể ra ngoài.
- Các thao tác ghi (`PUT`, `DELETE`) đọc dòng **có theo dõi**, vì EF Core cần biết dòng nào để sinh câu `UPDATE` hoặc `DELETE`.
- Bước kiểm trùng dùng `AnyAsync(d => d.Name.ToLower() == tên.ToLower() && d.Id != id)`. Npgsql dịch câu này thành `lower(name) = lower(@p)`, khớp với biểu thức của chỉ mục `ux_departments_name`, nên PostgreSQL dùng được chỉ mục khi bảng lớn lên.

```csharp
// Minh họa ý thiết kế, không phải code cuối cùng
var list = await _db.Departments.AsNoTracking()
    .OrderBy(d => d.Name)
    .Select(d => new DepartmentDto(d.Id, d.Name))
    .ToListAsync(ct);
```

## 3. Giao diện (NFR5.4)

- Không cache dữ liệu, không thư viện quản lý dữ liệu từ server. Mỗi lần mở trang thì gọi một lần `GET`; sau khi xóa thì gọi lại hàm tải danh sách (W4).
- Rời trang khi request chưa xong thì hủy request qua `signal` của `client.ts` (U2), để không cập nhật state của một trang đã đóng.
- Không thêm thư viện mới cho phần phòng ban, nên dung lượng bundle gần như giữ nguyên so với U2.
- **Kiểm:** Lighthouse Performance ≥ 90 trên trang `/departments` (`npm run preview`, cổng 5173) khi đã có 4 phòng ban mẫu. Đo ở Build and Test, sau khi backend đã chạy.

## 4. Không làm

Không phân trang, không cache phía server, không nén phản hồi. Lý do: chỉ có khoảng 100 phòng ban và một người dùng (scalability-design).
