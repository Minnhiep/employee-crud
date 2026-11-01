# Yêu cầu tin cậy: u3-departments

> **Nguồn:** `requirements.md` (NFR1, NFR3, NFR4), `functional-design/rules.md` (BR1.4, BR2.2, BR2.5, BR3.1, BR3.2), `contract-summary.md` (C5: không sửa migration đã chạy), rà soát Functional Design U3.

## 1. Toàn vẹn dữ liệu ở database (NFR3)

| ID | Yêu cầu | Đạt khi | Nguồn |
|---|---|---|---|
| NFR3.1 | Database tự chặn tên phòng ban trùng (không phân biệt hoa thường) | Có chỉ mục không trùng tên đúng `ux_departments_name` trên `lower(name)`; chèn SQL tay "kế toán" khi đã có "Kế toán" bị PostgreSQL từ chối (23505) | BR3.1, AC5.3.3, NFR3 |
| NFR3.2 | Tên phòng ban không vượt 100 ký tự ở database | Cột `name` kiểu `varchar(100) NOT NULL` | BR1.3, NFR3 |
| NFR3.3 | Hai thao tác chen nhau không ra 500 | Trùng tên khi chen nhau → 409 (U1 đổi 23505); sửa / xóa một phòng ban vừa bị xóa ở nơi khác → 404 (đổi `DbUpdateConcurrencyException`); xóa phòng ban vừa có nhân viên → 409 "Không thể xóa phòng ban" (bắt 23503) | BR1.4, BR2.2, BR2.5, rà soát Functional Design U3 |

## 2. Migration (NFR1)

| ID | Yêu cầu | Đạt khi | Nguồn |
|---|---|---|---|
| NFR1.1 | Migration 1 chạy được trên database trống và quay lui được | `dotnet ef database update` tạo bảng, chỉ mục, 4 phòng ban mẫu; `dotnet ef database update 0` xóa sạch (Down có `DROP INDEX` và `DROP TABLE`) | NFR1, BR3.1, BR3.2, team.md Deployment |
| NFR1.2 | Dữ liệu mẫu không làm hỏng số tự tăng | Ngay sau migration, `POST /api/departments` tạo phòng ban mới trả 201 (không lỗi trùng id) | BR3.2 |
| NFR1.3 | Không sửa migration đã chạy | Thay đổi bảng sau này (U4) đi bằng migration mới | C5 |

## 3. Test tự động (NFR4)

| ID | Yêu cầu | Đạt khi | Nguồn |
|---|---|---|---|
| NFR4.1 | Unit test cho `DepartmentService` | Ít nhất 1 ca đúng và 2 ca lỗi/biên cho mỗi thao tác chính (tạo, sửa, xóa, đọc); `dotnet test` xanh | NFR4, team.md Testing Posture |
| NFR4.2 | Độ phủ dòng của `DepartmentService` ≥ 80% | Đo bằng coverlet và đọc được con số theo lớp (công cụ đọc báo cáo chọn ở NFR Design) | NFR4, team.md |
| NFR4.3 | Đường lỗi database được thử | 23503 khi xóa và `DbUpdateConcurrencyException` được thử bằng ngữ cảnh database giả ném lỗi; trùng tên thật và chỉ mục kiểm bằng Postman / pgAdmin | Rà soát Functional Design U3 |
