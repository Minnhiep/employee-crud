-- Dữ liệu mẫu để demo: 80 nhân viên tên giả chia vào 8 phòng ban (rà soát tổng thể N-01, Change Request FR8.6).
-- Dùng để demo danh sách, tìm kiếm, lọc theo phòng ban, số nhân viên từng phòng, và xem tốc độ khi có nhiều dữ liệu.
--
-- Cách chạy: pgAdmin 4 → Servers → PostgreSQL 18 → Databases → employee_db → chuột phải → Query Tool
-- → mở file này (biểu tượng thư mục) → bấm Execute (F5).
--
-- Vì sao viết như vậy:
-- - Chạy lại nhiều lần vẫn an toàn: phòng ban đã có (cùng tên, không phân biệt hoa thường) thì bỏ qua;
--   email đã có thì bỏ qua (ON CONFLICT DO NOTHING). Chạy hai lần vẫn đúng 8 phòng, 80 người.
-- - Email dùng đuôi ".example": đuôi này được dành riêng cho ví dụ (RFC 2606), nên không bao giờ trùng email thật.
-- - Phòng ban được tìm theo tên (không phân biệt hoa thường), không theo id, nên chạy được trên database
--   mới tạo từ migration (4 phòng ban mẫu: Nhân sự, Kế toán, Kỹ thuật, Kinh doanh). Nếu một phòng ban đã bị
--   đổi tên hoặc xóa, người thuộc phòng đó sẽ không được thêm; câu đếm ở cuối file cho biết.
-- - 4 phòng thêm (Hành chính, Truyền thông, Mua hàng, Chăm sóc khách hàng) để có phân bố đều; tên theo quy ước
--   viết hoa chữ cái đầu (README, mục "Quy ước tên phòng ban").
-- - Chữ trong file đã ở dạng dựng sẵn (NFC) và không có ký tự lạ: dữ liệu chèn bằng SQL không đi qua bước
--   chuẩn hóa của API, nên phải sạch ngay từ đầu.
-- - 10 người đầu danh sách là dữ liệu mẫu cũ (giữ nguyên email), nên ai đã chạy bản cũ chỉ được thêm 70 người.

-- 1. Bốn phòng ban thêm. So bằng lower(name), cùng biểu thức với chỉ mục không trùng ux_departments_name.
INSERT INTO departments (name)
SELECT v.name
FROM (VALUES
    ('Hành chính'),
    ('Truyền thông'),
    ('Mua hàng'),
    ('Chăm sóc khách hàng')
) AS v (name)
WHERE NOT EXISTS (
    SELECT 1 FROM departments AS d WHERE lower(d.name) = lower(v.name)
);

-- 2. Tám mươi nhân viên.
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
    ('Đỗ Thị Ngọc Ánh', 'anh.do@congty.example', 'Kinh doanh'),
    ('Nguyễn Thị Chi', 'chi.nguyen@congty.example', 'Kỹ thuật'),
    ('Trần Quang Linh', 'linh.tran@congty.example', 'Kinh doanh'),
    ('Lê Thanh Sơn', 'son.le@congty.example', 'Hành chính'),
    ('Phạm Văn Dũng', 'dung.pham@congty.example', 'Truyền thông'),
    ('Hoàng Thu Long', 'long.hoang@congty.example', 'Mua hàng'),
    ('Huỳnh Đức Tâm', 'tam.huynh@congty.example', 'Chăm sóc khách hàng'),
    ('Phan Gia Giang', 'giang.phan@congty.example', 'Nhân sự'),
    ('Vũ Minh My', 'my.vu@congty.example', 'Kế toán'),
    ('Võ Ngọc Thảo', 'thao.vo@congty.example', 'Kỹ thuật'),
    ('Đặng Hoài Hà', 'ha.dang@congty.example', 'Kinh doanh'),
    ('Bùi Thị Nga', 'nga.bui@congty.example', 'Hành chính'),
    ('Đỗ Quang Vy', 'vy.do@congty.example', 'Truyền thông'),
    ('Hồ Thanh Hải', 'hai.ho@congty.example', 'Mua hàng'),
    ('Ngô Văn Phong', 'phong.ngo@congty.example', 'Chăm sóc khách hàng'),
    ('Dương Thu An', 'an.duong@congty.example', 'Nhân sự'),
    ('Lý Đức Hạnh', 'hanh.ly@congty.example', 'Kế toán'),
    ('Nguyễn Gia Phúc', 'phuc.nguyen@congty.example', 'Kỹ thuật'),
    ('Trần Minh Bình', 'binh.tran@congty.example', 'Kinh doanh'),
    ('Lê Ngọc Khánh', 'khanh.le@congty.example', 'Hành chính'),
    ('Phạm Hoài Quân', 'quan.pham@congty.example', 'Truyền thông'),
    ('Hoàng Thị Chi', 'chi.hoang@congty.example', 'Mua hàng'),
    ('Huỳnh Quang Linh', 'linh.huynh@congty.example', 'Chăm sóc khách hàng'),
    ('Phan Thanh Sơn', 'son.phan@congty.example', 'Nhân sự'),
    ('Vũ Văn Dũng', 'dung.vu@congty.example', 'Kế toán'),
    ('Võ Thu Long', 'long.vo@congty.example', 'Kỹ thuật'),
    ('Đặng Đức Tâm', 'tam.dang@congty.example', 'Kinh doanh'),
    ('Bùi Gia Giang', 'giang.bui@congty.example', 'Hành chính'),
    ('Đỗ Minh My', 'my.do@congty.example', 'Truyền thông'),
    ('Hồ Ngọc Thảo', 'thao.ho@congty.example', 'Mua hàng'),
    ('Ngô Hoài Hà', 'ha.ngo@congty.example', 'Chăm sóc khách hàng'),
    ('Dương Thị Nga', 'nga.duong@congty.example', 'Nhân sự'),
    ('Lý Quang Vy', 'vy.ly@congty.example', 'Kế toán'),
    ('Nguyễn Thanh Hải', 'hai.nguyen@congty.example', 'Kỹ thuật'),
    ('Trần Văn Phong', 'phong.tran@congty.example', 'Kinh doanh'),
    ('Lê Thu An', 'an.le@congty.example', 'Hành chính'),
    ('Phạm Đức Hạnh', 'hanh.pham@congty.example', 'Truyền thông'),
    ('Hoàng Gia Phúc', 'phuc.hoang@congty.example', 'Mua hàng'),
    ('Huỳnh Minh Bình', 'binh.huynh@congty.example', 'Chăm sóc khách hàng'),
    ('Phan Ngọc Khánh', 'khanh.phan@congty.example', 'Nhân sự'),
    ('Vũ Hoài Quân', 'quan.vu@congty.example', 'Kế toán'),
    ('Võ Thị Chi', 'chi.vo@congty.example', 'Kỹ thuật'),
    ('Đặng Quang Linh', 'linh.dang@congty.example', 'Kinh doanh'),
    ('Bùi Thanh Sơn', 'son.bui@congty.example', 'Hành chính'),
    ('Đỗ Văn Dũng', 'dung.do@congty.example', 'Truyền thông'),
    ('Hồ Thu Long', 'long.ho@congty.example', 'Mua hàng'),
    ('Ngô Đức Tâm', 'tam.ngo@congty.example', 'Chăm sóc khách hàng'),
    ('Dương Gia Giang', 'giang.duong@congty.example', 'Nhân sự'),
    ('Lý Minh My', 'my.ly@congty.example', 'Kế toán'),
    ('Nguyễn Ngọc Thảo', 'thao.nguyen@congty.example', 'Kỹ thuật'),
    ('Trần Hoài Hà', 'ha.tran@congty.example', 'Kinh doanh'),
    ('Lê Thị Nga', 'nga.le@congty.example', 'Hành chính'),
    ('Phạm Quang Vy', 'vy.pham@congty.example', 'Truyền thông'),
    ('Hoàng Thanh Hải', 'hai.hoang@congty.example', 'Mua hàng'),
    ('Huỳnh Văn Phong', 'phong.huynh@congty.example', 'Chăm sóc khách hàng'),
    ('Phan Thu An', 'an.phan@congty.example', 'Nhân sự'),
    ('Vũ Đức Hạnh', 'hanh.vu@congty.example', 'Kế toán'),
    ('Võ Gia Phúc', 'phuc.vo@congty.example', 'Kỹ thuật'),
    ('Đặng Minh Bình', 'binh.dang@congty.example', 'Kinh doanh'),
    ('Bùi Ngọc Khánh', 'khanh.bui@congty.example', 'Hành chính'),
    ('Đỗ Hoài Quân', 'quan.do@congty.example', 'Truyền thông'),
    ('Hồ Thị Chi', 'chi.ho@congty.example', 'Mua hàng'),
    ('Ngô Quang Linh', 'linh.ngo@congty.example', 'Chăm sóc khách hàng'),
    ('Dương Thanh Sơn', 'son.duong@congty.example', 'Nhân sự'),
    ('Lý Văn Dũng', 'dung.ly@congty.example', 'Kế toán'),
    ('Nguyễn Thu Long', 'long.nguyen@congty.example', 'Kỹ thuật'),
    ('Trần Đức Tâm', 'tam.tran@congty.example', 'Kinh doanh'),
    ('Lê Gia Giang', 'giang.le@congty.example', 'Hành chính'),
    ('Phạm Minh My', 'my.pham@congty.example', 'Truyền thông'),
    ('Hoàng Ngọc Thảo', 'thao.hoang@congty.example', 'Mua hàng'),
    ('Huỳnh Hoài Hà', 'ha.huynh@congty.example', 'Chăm sóc khách hàng')
) AS v (full_name, email, department_name)
JOIN departments AS d ON lower(d.name) = lower(v.department_name)
ON CONFLICT DO NOTHING;

-- Kiểm: tổng phải ra 80; từng phòng: Nhân sự 10, Kế toán 10, Kỹ thuật 12, Kinh doanh 12, Hành chính 9, Truyền thông 9, Mua hàng 9, Chăm sóc khách hàng 9.
SELECT d.name AS phong_ban, count(e.id) AS so_nhan_vien_mau
FROM departments AS d
LEFT JOIN employees AS e ON e.department_id = d.id AND e.email LIKE '%@congty.example'
GROUP BY d.name
ORDER BY d.name;

SELECT count(*) AS tong_nhan_vien_mau
FROM employees
WHERE email LIKE '%@congty.example';

-- Gỡ dữ liệu mẫu: bỏ dấu "--" ở đầu 5 dòng dưới, bôi đen riêng 5 dòng đó rồi chạy (F5).
-- Chạy trong một transaction: lỗi giữa chừng thì không có gì bị xóa.
-- Câu thứ nhất xóa mọi người có email đuôi @congty.example, kể cả người bạn tự thêm bằng đuôi email này;
-- không đụng tới người có email khác. Câu thứ hai chỉ xóa 4 phòng thêm khi phòng đã không còn ai,
-- nên 4 phòng mẫu của migration và phòng còn người thật luôn được giữ.
-- BEGIN;
-- DELETE FROM employees WHERE email LIKE '%@congty.example';
-- DELETE FROM departments AS d WHERE lower(d.name) IN (lower('Hành chính'), lower('Truyền thông'), lower('Mua hàng'), lower('Chăm sóc khách hàng'))
--     AND NOT EXISTS (SELECT 1 FROM employees AS e WHERE e.department_id = d.id);
-- COMMIT;
