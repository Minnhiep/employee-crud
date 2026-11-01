## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-01T15:11:53Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u2-web-shell/infrastructure-design/infrastructure-specification.md > Infrastructure Services, dòng "Backend U1" | Địa chỉ API `http://localhost:5081` nằm ở hai nơi (`.env.development` và giá trị mặc định trong `client.js`), tài liệu chỉ ghi "hai nơi phải giữ khớp" mà không có bước nào kiểm. Bản build dùng giá trị mặc định trong `client.js`, nên nếu hai nơi lệch nhau thì số đo ở `npm run preview` có thể trỏ sai backend mà không ai biết. Phía backend đã khớp: `launchSettings.json` hồ sơ `http` dùng 5081 và `appsettings.json` cho phép đúng origin 5173. | Thêm vào danh sách trước commit một bước ngắn (ví dụ `git grep -n "5081" -- frontend`) để thấy cả hai nơi cùng giá trị. Hoặc chỉ giữ một nguồn duy nhất cho địa chỉ API. | New |
| R-02 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u2-web-shell/infrastructure-design/cicd-pipeline.md > §1 bước 6 và §3 | Ở U2 hai trang mới chỉ có tiêu đề nên chưa có lời gọi API nào. Bước "Chạy thử" không chứng minh được cổng 5173 và danh sách CORS của U1 (hợp đồng C3) thật sự nối được. Lỗi CORS chỉ lộ ra khi làm U3. | Ở Build and Test, thêm một lần kiểm một lần cho C3: từ trang chạy ở `http://localhost:5173`, gọi một endpoint của U1 và xác nhận Network không báo lỗi CORS. Hoặc ghi rõ đây là việc hoãn sang U3 kèm người chịu trách nhiệm. | New |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u2-web-shell/infrastructure-design/infrastructure-specification.md > Deployment, dòng "Compute model" | Chưa ghi phiên bản Node tối thiểu cho dự án (máy hiện có Node 24.15). Người cài lại trên máy khác có thể gặp lỗi khó hiểu khi `npm install` hoặc `npm run dev`. | Ghi phiên bản Node tối thiểu vào `package.json` (trường `engines`) và vào README của U5. | New |
| R-04 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u2-web-shell/infrastructure-design/cicd-pipeline.md > §5 Quay lui, dòng "Cài gói làm hỏng" | Lệnh `git checkout -- package.json package-lock.json` sẽ lỗi nếu `package-lock.json` chưa từng được commit (lần commit đầu của frontend). Lệnh cũng ghi đè thay đổi chưa commit, trong khi quy tắc của Hiệp yêu cầu xem đích trước khi ghi đè. | Ghi rõ lệnh chỉ dùng sau lần commit đầu có `package-lock.json`, và nhắc chạy `git diff` trước khi checkout. | New |
| R-05 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u2-web-shell/infrastructure-design/monitoring-design.md > Metrics & KPIs, dòng "Lỗ hổng gói npm" | `npm audit` chỉ được chạy ở Build and Test và chỉ "ghi kết quả". Quy trình mỗi commit (`cicd-pipeline.md` §1) không có bước này, nên một gói mới thêm vào ở U3/U4 có thể không được kiểm cho tới cuối. | Ghi rõ lúc nào chạy `npm audit` lại (ví dụ sau mỗi lần `package.json` đổi) hoặc xác nhận chủ ý chỉ chạy ở Build and Test. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| traceability | Không chạy lại. `traceability.json` có 15 ID, 11 OK và 4 N/A, mỗi N/A kèm lý do. Trước đó đã đạt theo brief. | Đối chiếu tay: 6 ID mẫu trỏ đúng mục thật trong 3 tài liệu thiết kế. |
| Đối chiếu code U1 | `appsettings.json` AllowedOrigins = `http://localhost:5173`; `launchSettings.json` hồ sơ `http` = `http://localhost:5081`; `.gitignore` gốc loại `.env`, `node_modules/`, `dist/` | Các khẳng định về U1 trong thiết kế khớp với code. `.env.development` không bị `.gitignore` loại nên commit được như thiết kế nói. |

### Summary

Thiết kế hạ tầng phù hợp với phạm vi chạy local: Vite dev và preview cố định cổng 5173 (`strictPort`), CORS khớp U1, không có thành phần bị cấm. Không có finding Critical hay Major. Năm điểm Minor ở trên chỉ là chi tiết kiểm chứng và độ chắc chắn của quy trình, người duyệt có thể cân nhắc rồi duyệt.
