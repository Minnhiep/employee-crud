## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-01T15:03:50Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u2-web-shell/nfr-requirements/performance-requirements.md > mục 1 (NFR5.1–NFR5.4) và traceability.json > coverage NFR5 | `requirements.md` định nghĩa NFR5 là "API danh sách và tìm kiếm trả lời trong 1 giây với 1.000 nhân viên". U2 dùng lại mã NFR5 cho nội dung khác (Lighthouse, không tải lại trang, timeout 10 giây, gói gọn), rồi traceability ghi NFR5 là `OK`. Người đọc sẽ tưởng yêu cầu 1 giây đã được U2 phủ, trong khi U2 không có API nào để đo. Hai nghĩa khác nhau cùng mang một mã. | Ghi rõ trong traceability và đầu performance-requirements.md rằng ý "API dưới 1 giây" thuộc U1/U3/U4 (đánh dấu N/A cho U2). Hoặc đặt tiền tố riêng cho các mục của U2, ví dụ UI-P1.. gắn với G3/G4, để NFR5 gốc không bị che. | New |
| R-02 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u2-web-shell/nfr-requirements/performance-requirements.md > NFR5.1 | NFR5.1 yêu cầu Lighthouse Performance ≥ 90 ở `/employees` và `/departments`. Ở U2 hai trang này mới chỉ là trang tiêu đề, chưa có bảng hay lời gọi API (U3/U4 mới làm). NFR8.3 có ghi "U2 chỉ hai trang tiêu đề và trang 404" còn NFR5.1 thì không. Nếu đo ở U2, con số đẹp nhưng không đại diện cho trang thật. | Thêm cùng chú thích như NFR8.3: ở U2 đo trên trang tiêu đề, đo lại khi U3 và U4 xong. | New |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u2-web-shell/nfr-requirements/security-requirements.md > NFR7.3 | NFR7.3 đặt điều kiện lên backend của U1 ("chạy bằng hồ sơ `http`, không bật chuyển hướng HTTPS"). Kiểm tra mã hiện có: `launchSettings.json` có hồ sơ `http` ở cổng 5081 và không thấy `UseHttpsRedirection`, nên hiện đúng. Nhưng `launchSettings.json` còn hồ sơ `https` (`https://localhost:7205;http://localhost:5081`) và contract-summary vẫn ghi server `https://localhost:{port}` (dòng 37, 401), nên người chạy nhầm hồ sơ `https` sẽ gặp lỗi khó hiểu. | Ghi trong README và `client.js` rằng frontend chỉ gọi `http://localhost:5081`, kèm lệnh `dotnet run --launch-profile http`. Ghi chú NFR7.3 là phụ thuộc vào U1 đã kiểm, không phải tự U2 bảo đảm. | New |
| R-04 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u2-web-shell/nfr-requirements/security-requirements.md > mục 1 và 3 | Chưa có yêu cầu về lỗ hổng gói npm (`npm audit`). Frontend kéo nhiều gói phụ thuộc gián tiếp, đây là nguồn rủi ro bảo mật thực tế duy nhất của U2. Mục 4 cũng chưa nói rõ phạm vi này loại trừ nó. | Thêm một dòng: chạy `npm audit` trước khi bàn giao và ghi kết quả (không cần là điều kiện chặn), hoặc ghi rõ vào mục "Không áp dụng" cùng lý do. | New |
| R-05 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u2-web-shell/nfr-requirements/performance-requirements.md > NFR5.3 | NFR5.3 yêu cầu timeout 10 giây cho `client.js`, nhưng cách kiểm là "bằng tay ở U3", trong khi `client.js` thuộc U2 và team.md không có test tự động cho React. Nếu bỏ sót thì không đơn vị nào sở hữu việc kiểm. | Chỉ định rõ nơi ghi kết quả kiểm thủ công (ví dụ mục kiểm tay của Build and Test U2 hoặc U3) và người chịu trách nhiệm. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| traceability | PASS (theo thông tin đã nhận, em không chạy lại) | Tất cả NFR1–NFR8 có dòng trong coverage. Phần ID NFR5 bị dùng lại nghĩa được nêu ở Major phía trên. |
| required-sections, upstream-coverage, linter, type-check | Không chạy | Không có kết quả riêng cho bốn sensor này trong brief. Chưa kiểm. |

### Summary

Bộ NFR cho U2 gọn, đúng phạm vi UI, G1–G6 đã được đưa thành mã có ngưỡng đo và cách đo; không có lỗi nghiêm trọng. Điểm đáng cân nhắc nhất là mã NFR5 bị dùng cho nghĩa khác với `requirements.md`, nên traceability dễ gây hiểu nhầm là đã phủ yêu cầu API dưới 1 giây.
