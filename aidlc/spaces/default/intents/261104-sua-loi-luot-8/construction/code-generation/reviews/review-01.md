## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-05T03:46:25Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Minor | frontend/src/api/client.ts:19-22, 205-210 (so với requirements.md FR7.1) | FR7.1 viết một câu chung "chưa rõ đã lưu hay chưa" cho cả POST, PUT, DELETE. Code tách riêng câu cho DELETE: "chưa rõ đã xóa hay chưa". Hành vi này hợp lý hơn (và 07 mục V09 đã ghi đúng như code), nhưng code-summary.md mục "Khác kế hoạch" không nêu, nên người đọc đối chiếu FR7.1 sẽ thấy lệch. | Thêm một dòng vào "Khác kế hoạch" của code-summary.md, hoặc sửa FR7.1 cho khớp, để Hiệp biết đây là chủ ý. | New |
| R-02 | Minor | frontend/src/pages/departments/DepartmentFormPage.tsx:237 | Breadcrumb "Phòng ban" luôn trỏ về `LIST_PATH`, trong khi nút Hủy và Lưu dùng `returnPath`. Mở sửa từ trang chi tiết rồi bấm breadcrumb thì ra danh sách, không về chi tiết. Form nhân viên thì breadcrumb dùng `listPath`, nên hai form xử lý khác nhau. FR4 chỉ nói Lưu và Hủy nên chưa vi phạm, nhưng dễ bị hỏi khi demo. | Quyết một cách: cho breadcrumb dùng `returnPath` như form nhân viên, hoặc ghi rõ trong code-summary rằng breadcrumb cố ý luôn về danh sách. | New |
| R-03 | Minor | docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md:49 (F10) | Bước F10 bảo đổi số trên thanh địa chỉ sang mã người B. Gõ lại địa chỉ làm trình duyệt tải lại cả trang, nên bước này không kiểm được điều thật sự bảo vệ F10 là `key={`edit-${id}`}` ở App.tsx:22,28 (gắn lại component khi đổi mã). Kết quả "form hiện dữ liệu B" vẫn đúng, nhưng bước không chứng minh gì về luồng dùng chung form. | Ghi chú trong F10 rằng bước này kiểm kết quả hiển thị chứ không kiểm cơ chế gắn lại component, hoặc đổi sang bước dùng điều hướng trong trang (nếu có). | New |
| R-04 | Minor | aidlc/spaces/default/intents/261104-sua-loi-luot-8/construction/code-generation/code-summary.md, mục "Kết quả kiểm Chromium" | DELETE phòng ban quá giờ không kiểm riêng trên trình duyệt (tóm tắt đã nêu). Đã kiểm trong code: `DepartmentsPage.tsx:129` và `DepartmentDetailPage.tsx:136` đều hiện `messageOf(error)`, nên câu "đã xóa" sẽ tới được người dùng. Rủi ro thấp, chỉ là chưa có bằng chứng chạy thật. | Nếu còn thời gian ở Build and Test, chạy một lần DELETE phòng ban với độ trễ trên 10 giây; không thì ghi đây là giới hạn đã biết. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| `npm --prefix frontend run verify` (do người điều phối chạy, không chạy lại) | Mã thoát 0, 148/148 test, độ phủ lớp service 100% | Chấp nhận như đã nêu trong brief; không có phát hiện nào mâu thuẫn với kết quả này. |
| Quét grep comment trong `frontend/src` và `backend/**/*.cs` (mã `BR/NFR/ADR/AC/US/FR/DOC/BE/FE`, `U1`-`U5`, `C1`, "lượt N", "Hiệp", "anh Hiếu", `requirements`, `plan.md`) | 0 dòng khớp | Khớp tuyên bố 0 dòng của code-summary; FR1.1 đạt. |

### Summary

Không thấy lỗi nghiêm trọng. Bốn điểm soi kỹ đều đứng vững khi đọc code. Với `reloading` ở `EmployeeFormPage.tsx`, form không bị gỡ khi nạp lại, Lưu bị khóa khi đang nạp, và phòng đã mất bị bỏ chọn sau bước chọn sẵn nên không tự chọn thay người dùng. Với báo hết giờ ở `client.ts`, `toApiError` phân biệt hủy do rời trang (`pageSignal?.aborted`) với quá 10 giây theo phương thức. `returnPathFrom` chỉ nhận đúng `/departments/{id}` của phòng đang sửa, và `listPathFrom` kiểm `parseId` trên phần sau tiền tố. Nút bỏ lọc ở `EmployeesPage.tsx` giữ chuỗi tìm. Backend `UpdateAsync` đọc lại bằng `GetByIdAsync` nên PUT phòng đã xóa trả 404, có test hồi quy. Nội dung F, V mới của `07` khớp chữ trên giao diện thật. Còn bốn điểm Minor về tài liệu và nhất quán, không chặn.
