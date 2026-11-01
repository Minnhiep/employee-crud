# Đánh giá: có cần viết User Stories không

- **Quyết định:** Làm (Execute)
- **Lý do:** Ứng dụng có giao diện cho người dùng: hai trang danh sách, các form thêm/sửa, ô tìm kiếm, hộp xác nhận xóa. Có luật nghiệp vụ người dùng thấy được: không trùng email hay tên phòng ban, không xóa được phòng ban còn nhân viên. Viết story theo dạng Given/When/Then giúp nối từng yêu cầu trong `requirements-analysis/requirements.md` với một thao tác cụ thể trên màn hình, để kiểm tay theo `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md`.
- **Yếu tố đã xét:**
  - Loại dự án: greenfield, CRUD có giao diện.
  - Phạm vi người dùng nhìn thấy: toàn bộ FR1–FR5.
  - Độ phức tạp: vừa phải, gồm 3 luật nghiệp vụ và kiểm tra dữ liệu ở hai phía.
  - Cách làm: làm phòng ban trước, nhân viên sau (`practices-discovery/team-practices.md`).
- **Story giúp nhiều nhất ở:**
  - Các ca lỗi: dữ liệu sai, trùng, xóa phòng ban còn nhân viên, mất kết nối.
  - Tìm kiếm.
  - Phần bàn giao (README, danh sách API), để người khác cài và kiểm lại được.
