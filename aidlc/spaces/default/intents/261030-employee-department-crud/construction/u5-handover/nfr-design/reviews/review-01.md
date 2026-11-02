## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-02T09:43:00Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-design/security-design.md > S4 (cột "Dọn dẹp" của ca "Email trùng khác hoa thường") | Cột "Dọn dẹp" ghi "Không cần" vì tin rằng lệnh chèn chắc chắn bị từ chối. Nếu chỉ mục email trong database thật không phân biệt hoa thường như kỳ vọng (ví dụ khác với sơ đồ DB), lệnh chèn sẽ thành công, thêm một dòng nhân viên rác và không có bước dọn nào. Ngoài ra một lệnh chèn bị từ chối vẫn làm nhảy số id (sequence), nên "database không đổi" chỉ đúng với số dòng, không đúng với bộ đếm id. | Thêm một dòng dự phòng: nếu lệnh chèn bất ngờ thành công thì xóa đúng dòng vừa chèn (theo id hoặc email) rồi đếm lại, và ghi là lệch so với sơ đồ DB. Ghi chú thêm rằng bộ đếm id có thể nhảy dù lệnh bị từ chối. | New |
| R-02 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-design/security-design.md > S1 (bảng, hàng "Lịch sử commit cũ") | Việc quét lịch sử hiện chỉ dựa vào chuỗi mật khẩu do Hiệp gõ; nếu Hiệp quên làm hoặc gõ sai thì không có lớp chặn nào khác. Ngoài ra thiết kế chưa nói rõ phạm vi quét có gồm cả thư mục `aidlc/` (log kiểm toán, memory) cũng được commit, nơi mật khẩu có thể lọt vào nếu từng được gõ trong hội thoại. | Bổ sung một lượt quét AI chạy được mà không cần biết mật khẩu, ví dụ tìm mẫu `Password=` có giá trị thật trong `git log -p --all -G"Password="` và `git grep -i "password="`. Ghi rõ phạm vi là toàn repo gồm cả `aidlc/`. | New |
| R-03 | Suggestion | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-design/security-design.md > S5 | Địa chỉ frontend lấy từ cấu hình Vite, nhưng Vite tự đổi sang cổng khác khi cổng mặc định đang bận; khi đó CORS sẽ chặn và người cài gặp đúng lỗi mà S5 muốn tránh. | Mục "Sự cố thường gặp" nên nhắc: nếu Vite báo cổng khác với README thì tắt tiến trình đang chiếm cổng cũ rồi chạy lại, không mở CORS. | New |
| R-04 | Suggestion | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/nfr-design/security-design.md > S2 | "Đỗ Văn An" là tên giống người thật; thiết kế cho phép chép vào ví dụ. An toàn hơn là ưu tiên bản ghi mẫu vừa tạo (`Nguyễn Văn Mẫu`) và tránh dùng tên này. | Ưu tiên bản ghi mẫu mới tạo cho mọi JSON mẫu; chỉ dùng "Đỗ Văn An" khi bắt buộc. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| (không có công cụ kiểm) | Đọc tay traceability.json | 5 ID thượng nguồn (NFR2.1 đến NFR2.4, NFR7.1) đều có mục đích trỏ đúng vào S1 đến S5; không thiếu, không thừa. Bốn điểm rà soát từ review trước (quét lịch sử, kiểm .gitignore và appsettings, giới hạn clone cùng máy, dòng mồi cho thử ràng buộc) đều đã được xử lý trong S1, S4 và mục "Giới hạn đã biết". |

### Summary

Thiết kế bảo mật gọn nhưng đủ cho đơn vị chỉ viết tài liệu, phủ đủ NFR2.1 đến NFR2.4 và NFR7.1, đúng quy tắc không tự gõ mật khẩu và không tự đẩy lên GitHub. Chỉ còn hai điểm nhỏ (dự phòng khi ràng buộc email không như kỳ vọng, và lớp quét mật khẩu không cần biết mật khẩu) nên cân nhắc trước khi duyệt; không điểm nào chặn.
