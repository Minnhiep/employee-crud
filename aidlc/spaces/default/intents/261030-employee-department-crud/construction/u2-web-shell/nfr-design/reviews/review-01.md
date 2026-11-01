## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-01T15:08:31Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u2-web-shell/nfr-design/performance-design.md > §3 Thông báo thành công sau khi xóa | Sau khi xóa, trang gọi `navigate(đường dẫn hiện tại + query, { replace: true, state })` tới đúng địa chỉ đang đứng. Thiết kế không nói danh sách được tải lại bằng cách nào. Nếu hiệu ứng tải dữ liệu chỉ phụ thuộc vào `location.search` hoặc các tham số tìm kiếm thì địa chỉ không đổi nên danh sách không tải lại. Người dùng sẽ thấy lời báo "đã xóa" nhưng dòng vừa xóa vẫn còn trên bảng. Trạng thái `loading` sau xóa chỉ được vẽ ở sơ đồ trạng thái của functional-spec, chưa có cơ chế gây ra nó. | Ghi rõ cơ chế tải lại sau xóa. Cách gọn nhất là trang danh sách gọi lại hàm tải dữ liệu ngay sau khi xóa thành công (hoặc có một biến đếm `reloadKey` trong phụ thuộc của hiệu ứng), việc `navigate` chỉ để mang lời báo. Thêm một dòng kiểm tay vào bước kiểm của U3, U4: xóa xong thì dòng biến mất khỏi bảng không cần F5. | New |
| R-02 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u2-web-shell/nfr-design/performance-design.md > §1 NFR5.3 (dòng "hủy do trang → bỏ qua im lặng") | Không nêu "bỏ qua im lặng" nghĩa là gì với nơi gọi: `client.js` ném `AbortError`, hay ném `ApiError` loại riêng, hay để promise treo. U3, U4 sẽ tự đoán, dễ để sót `catch` rồi hiện lời báo lỗi mạng sai khi người dùng đổi trang hoặc gõ tìm kiếm mới. | Chốt một hợp đồng: ví dụ `client.js` ném `ApiError` có `kind: "aborted"` (hoặc `AbortError` gốc) và mọi trang bắt riêng nhánh này để không đặt trạng thái lỗi. Ghi vào comment đầu `client.js`. | New |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u2-web-shell/nfr-design/performance-design.md > §3 | Mục này không nhắc việc xóa `location.state.message` sau khi hiện để F5 hoặc nút Quay lại không hiện lại lời báo (BR ở functional-design có ghi, thiết kế NFR thì bỏ trống). Việc xóa state bằng một `navigate` thứ hai tới cùng địa chỉ còn có thể kích hoạt tải lại nếu hiệu ứng phụ thuộc vào `location`. | Thêm một câu vào §3 nói rõ cách xóa state và bảo đảm bước này không gây thêm một lần tải danh sách. | New |
| R-04 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u2-web-shell/nfr-design/security-design.md > §2 Đúng địa chỉ backend (đối chiếu backend/EmployeeCrud.Api/Platform/Cors/CorsSetup.cs) | Đã kiểm CORS của U1: `WithOrigins(allowedOrigins)`, `WithMethods("GET","POST","PUT","DELETE")`, `WithHeaders("Content-Type")`, không `AllowCredentials`; `launchSettings.json` có `http://localhost:5081`. Thiết kế khớp. Nhưng CORS so sánh nguyên văn origin: mở giao diện bằng `http://127.0.0.1:5173` sẽ bị chặn y như khi cổng nhảy sang 5174. Ngoài ra `.env.development` chỉ được nạp khi chạy `dev`; bản `build`/`preview` dùng giá trị mặc định cứng trong `client.js`, nên địa chỉ nằm ở hai nơi. | Ghi vào README (và comment `client.js`) rằng phải mở đúng `http://localhost:5173`. Ghi chú trong `.env.development` rằng giá trị mặc định trong `client.js` phải giữ khớp; không cần đổi kiến trúc. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| traceability (`aidlc engine sensor fire traceability --stage nfr-design ...`) | passed (fire_id 6c93fe79) | Mọi NFR của U2 trong `traceability.json` đều có đích; NFR2.3 đánh N/A hợp lý vì thuộc mã U1 |
| required-sections, upstream-coverage, linter, type-check | Không chạy lại riêng | Không có dấu hiệu lỗi trong bốn tệp; chỉ chạy lại traceability theo yêu cầu |

### Summary

Thiết kế chặt chẽ và khớp với U1 đã kiểm: cổng 5173 cố định, CORS, không gửi cookie, chặn gửi đôi bằng `useRef`, hạn 10 giây bao cả lúc đọc body, `npm audit` không tự sửa mạnh tay, đo Lighthouse trên cổng 5173. Việc người duyệt nên cân nhắc trước khi duyệt là cơ chế tải lại danh sách sau khi xóa (đang để hở), cùng ba điểm Minor về hợp đồng hủy yêu cầu, xóa state của Toast và địa chỉ `localhost` so với `127.0.0.1`.
