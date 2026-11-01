## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-01T15:43:21Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | frontend/src/api/client.ts > hàm `readSuccess` (khối try/catch quanh `response.json()`) | Khi lời gọi bị hủy hoặc quá 10 giây ngay lúc đang đọc body, `response.json()` ném `AbortError`. Khối `catch` trống của `readSuccess` bắt lỗi này và đổi thành `ApiError` loại `server`, nên `toApiError` không còn thấy `AbortError`. Hậu quả: trang rời đi hoặc tìm kiếm mới thay tìm kiếm cũ vẫn nhận lỗi "server" thay vì `aborted` (trang không được bỏ qua), và quá hạn lúc đọc body bị báo `server` thay vì `network`. Điều này trái với kế hoạch Step 4 (hủy do trang thành `aborted`, quá hạn thành `network`, hẹn giờ chỉ hủy sau khi đọc xong body). Kiểm tay K1–K8 không chạm tới nhánh này vì U2 chưa gọi API thật. | Trong `readSuccess` chỉ đổi thành lỗi `server` khi lỗi là lỗi đọc JSON (ví dụ `SyntaxError`); các lỗi khác, nhất là `DOMException` loại `AbortError` hoặc `TimeoutError`, thì ném lại để `toApiError` xử lý. Làm tương tự cho `readProblem`. Ghi vào danh sách kiểm tay của U3 một bước: hủy lời gọi giữa chừng không hiện lỗi. | New |
| R-02 | Major | frontend/src/hooks/usePageTitle.ts (điều kiện `location.key !== "default"`), frontend/src/components/ErrorSummary.tsx (liên kết `href="#ô"`), frontend/src/components/Toast.tsx (lệnh `navigate(..., { replace: true, state: null })`) | `usePageTitle` đưa focus vào `h1` mỗi khi `location.key` đổi, chứ không chỉ khi đổi trang. Hai chỗ khác cũng làm `location.key` đổi trong cùng trang: (1) Toast gọi `navigate` kiểu replace để xóa lời báo; (2) liên kết trong `ErrorSummary` là `<a href="#id">` thuần, bấm vào sẽ phát sinh điều hướng hash mà React Router thấy qua `popstate`. Suy luận từ code là focus sẽ bị kéo về `h1`: sau khi xóa, và sau khi bấm lỗi trong khung tóm tắt thì ô nhập không nhận được focus, làm hỏng mục đích của US4.1 (AC4.1.1) và WCAG 3.3.1. Phần này chưa được kiểm trong K1–K8 và `code-summary.md` cũng không nhắc tới. | Chỉ focus `h1` khi `location.pathname` đổi (không dùng `location.key`), hoặc bỏ qua khi chỉ đổi hash hoặc state. Với `ErrorSummary`, dùng `onClick` gọi `preventDefault()` rồi `document.getElementById(field)?.focus()`. Thêm hai bước vào kiểm tay của U3 và U4: bấm lỗi trong khung tóm tắt thì focus nhảy vào đúng ô, và xóa xong thì focus không bị giật về `h1`. | New |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u2-web-shell/code-generation/code-generation-plan.md > mục "Những điều anh cần biết", điểm 0 và Step 4, Step 5, Step 7 | Kế hoạch còn chỗ lệch với code và `code-summary.md`: Step 4 và Step 7 vẫn gọi `client.js` thay vì `client.ts`; điểm 0 ghi 6 mức "moderate" khi `code-summary.md` ghi 12; Step 7 ghi `5081` xuất hiện "đúng hai nơi" trong khi kết quả thật có thêm một dòng comment. Người duyệt đối chiếu hai tài liệu sẽ thấy số liệu khác nhau. | Sửa lại tên file và số liệu trong kế hoạch cho khớp `code-summary.md`, hoặc ghi rõ số liệu là của thời điểm nào. | New |
| R-04 | Minor | frontend/src/api/client.ts > hằng `BASE_URL`; frontend/.env.development | Địa chỉ API ghi ở hai nơi (`.env.development` và giá trị mặc định trong `client.ts`) và chỉ được giữ khớp nhau bằng comment. Nếu sửa một nơi mà quên nơi kia thì bản `build` gọi sai cổng mà lint, typecheck và build đều không báo. | Giữ như hiện tại là chấp nhận được cho dự án một người, nhưng nên có một bước kiểm trong README của U5 (hoặc lệnh `git grep 5081 -- frontend` đã dùng ở Step 7) để bắt lệch. | New |
| R-05 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u2-web-shell/code-generation/code-summary.md > mục 4 "Kết quả kiểm" | Các component `StatusMessage`, `Toast`, `DataTable`, `ErrorSummary`, `FormField`, `useSubmitGuard` và toàn bộ `client.ts` chưa có bước kiểm nào chạy trong trình duyệt hay mã; chỉ có typecheck, lint và build. Phần này được ghi rõ là "chưa kiểm", nhưng hai lỗi hành vi ở trên cho thấy rủi ro nằm đúng ở đó. Theo `team.md` không viết test tự động cho React nên đây là chấp nhận được. | Chuyển danh sách "chưa kiểm" thành các bước kiểm tay có tên (K9 trở đi) trong `unit-test-instructions.md` để U3 và U4 chạy, thay vì để dưới dạng ghi chú. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `npm --prefix frontend run lint` | PASS: `eslint . --max-warnings 0`, không có lỗi hay cảnh báo | Đạt |
| `npm --prefix frontend run typecheck` | PASS: `tsc -p tsconfig.json`, 0 lỗi | Đạt, `strict` và `noUncheckedIndexedAccess` đang bật |
| `npm --prefix frontend run format:check` | PASS: "All matched files use Prettier code style!" | Đạt |
| `npm --prefix frontend run build` | PASS: 101 module, JS 258,84 kB (nén 82,32 kB), CSS 6,26 kB (nén 1,72 kB) | Khớp số liệu trong `code-summary.md` |
| sensor traceability | PASS (theo thông báo của người điều phối) | Không có phát hiện thêm |

### Summary

Khung giao diện đủ để các Unit sau dựng lên: bốn lệnh kiểm đều sạch, nội dung `source-manifest.json` khớp với các file thật dưới `frontend/` và không thấy file ngoài phạm vi Unit. Hai điểm Major đều nằm ở hành vi chưa được kiểm tay vì U2 chưa gọi API (đọc body bị hủy bị báo sai loại lỗi, và focus bị kéo về `h1` khi `location.key` đổi); nên sửa trước khi U3 dùng `client.ts`, `Toast` và `ErrorSummary`. Số Major là 2 nên theo quy tắc vẫn là READY.
