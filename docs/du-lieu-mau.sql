-- Dữ liệu mẫu để demo: 10 nhân viên tên giả cho 4 phòng ban mẫu (rà soát tổng thể N-01).
--
-- Cách chạy: pgAdmin 4 → Servers → PostgreSQL 18 → Databases → employee_db → chuột phải → Query Tool
-- → mở file này (biểu tượng thư mục) → bấm Execute (F5).
--
-- Vì sao viết như vậy:
-- - Chạy lại nhiều lần vẫn an toàn: email đã có thì bỏ qua (ON CONFLICT DO NOTHING), không báo lỗi.
-- - Email dùng đuôi ".example": đuôi này được dành riêng cho ví dụ (RFC 2606), nên không bao giờ trùng email thật.
-- - Phòng ban được tìm theo tên (không phân biệt hoa thường), không theo id, nên chạy được trên database
--   mới tạo từ migration (4 phòng ban mẫu: Nhân sự, Kế toán, Kỹ thuật, Kinh doanh). Nếu một phòng ban đã bị
--   đổi tên hoặc xóa, người thuộc phòng đó sẽ không được thêm; câu đếm ở cuối file cho biết.
-- - Chữ trong file đã ở dạng dựng sẵn (NFC) và không có ký tự lạ: dữ liệu chèn bằng SQL không đi qua bước
--   chuẩn hóa của API, nên phải sạch ngay từ đầu.
-- - Có vài họ, tên đệm lặp lại ("Nguyễn", "Văn", "Thị") và chữ "Đ" để demo tìm kiếm.

INSERT INTO employees (full_name, email, department_id)
SELECT v.full_name, v.email, d.id
FROM (VALUES
    ('Nguyễn Văn Hùng', 'hung.nguyen@congty.example', 'Nhân sự'),
    ('Nguyễn Thị Mai', 'mai.nguyen@congty.example', 'Kế toán'),
    ('Trần Văn Đức', 'duc.tran@congty.example', 'Kỹ thuật'),
    ('Lê Thị Hoa', 'hoa.le@congty.example', 'Kinh doanh'),
    ('Phạm Minh Tuấn', 'tuan.pham@congty.example', 'Kỹ thuật'),
    ('Hoàng Thu Trang', 'trang.hoang@congty.example', 'Nhân sự'),
    ('Vũ Quang Huy', 'huy.vu@congty.example', 'Kinh doanh'),
    ('Đặng Thị Lan', 'lan.dang@congty.example', 'Kế toán'),
    ('Bùi Văn Nam', 'nam.bui@congty.example', 'Kỹ thuật'),
    ('Đỗ Thị Ngọc Ánh', 'anh.do@congty.example', 'Kinh doanh')
) AS v (full_name, email, department_name)
JOIN departments AS d ON lower(d.name) = lower(v.department_name)
ON CONFLICT DO NOTHING;

-- Kiểm: phải ra 10.
SELECT count(*) AS so_nhan_vien_mau
FROM employees
WHERE email LIKE '%@congty.example';

-- Gỡ dữ liệu mẫu: bỏ dấu "--" ở đầu dòng dưới, bôi đen riêng dòng đó rồi chạy (F5).
-- Câu này xóa mọi người có email đuôi @congty.example, kể cả người bạn tự thêm bằng đuôi email này;
-- không đụng tới người có email khác.
-- DELETE FROM employees WHERE email LIKE '%@congty.example';
