## Review

**Verdict:** READY
**Reviewer:** aidlc-architecture-reviewer-agent
**Date:** 2026-11-02T09:34:52Z
**Iteration:** 1
**Verdict Dictated:** no

### Findings

| ID | Severity | Location | Finding | Required action | Status |
|---|---|---|---|---|---|
| R-01 | Major | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/functional-design/functional-spec.md > mục 3 (vòng đời tài liệu) và WF4 bước 3 | Thứ tự duyệt và commit mâu thuẫn với bước kiểm bản clone sạch. Sơ đồ trạng thái cho README đi Nháp, rồi Đã đối chiếu, rồi Đã duyệt, rồi Đã commit. Nhưng bản clone chỉ lấy được phần đã commit (chính WF4 nói vậy), và AC5.1.1 chỉ được chứng minh sau khi clone. Vì vậy README được "Đã duyệt" trước khi lượt kiểm quan trọng nhất của nó chạy. Câu "Riêng README còn một lượt kiểm sau khi commit" vá được một phần, nhưng không nói rõ checkpoint U5 chờ lượt này hay không, và nếu README sửa lại thì phải duyệt lại hay không. | Ghi rõ trong mục 3 và BR4.3: checkpoint duyệt U5 xảy ra sau khi bản clone sạch đã chạy được. Thứ tự đề xuất là viết, đối chiếu code, Hiệp commit tạm, clone kiểm, sửa nếu vướng, rồi mới duyệt. Nếu README bị sửa sau khi đã duyệt thì nó quay về Nháp và duyệt lại. | New |
| R-02 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/functional-design/rules.md > BR1.6 | Hai trong ba lỗi mẫu của mục "Sự cố thường gặp" chưa có căn cứ là đã gặp thật. "Chứng chỉ HTTPS localhost chưa tin cậy" mâu thuẫn với ghi chú dự án (chứng chỉ đã tin cậy trên máy). "psql không có trong PATH" là sự thật về cấu hình máy chứ chưa chắc là lỗi đã gặp khi làm U1 đến U5. Chỉ có "Smart App Control chặn file vừa build" được các unit trước ghi nhận. | Trước khi viết mục sự cố, lấy từng dòng từ ghi chú U1 đến U4 hoặc từ lần bản clone vướng thật. Dòng nào chưa gặp thì bỏ, đúng như BR1.6 tự đặt ra. Nên đổi hai ví dụ trong BR1.6 thành "ví dụ nếu có căn cứ". | New |
| R-03 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/functional-design/functional-spec.md > mục 7 (Database đã có dữ liệu) và rules.md > BR3.2 | BR3.2 cấm dùng thông tin người thật trong JSON mẫu. Nhưng WF3 gọi GET danh sách trên database hiện có nhân viên "Đỗ Văn An" (id 1) và số tự tăng đã qua 2005. Response mẫu sẽ chép đúng dữ liệu đó, nên "dữ liệu mẫu" là dữ liệu thử cũ, chưa chắc sạch. Id lớn (hơn 2005) cũng làm ví dụ khó đọc. | Quyết định trước khi gọi API: dùng riêng bản ghi do WF3 tạo (đặt tên mẫu rõ ràng) để chép ví dụ, và với GET danh sách chỉ chép các bản ghi mẫu. Hoặc Hiệp xác nhận "Đỗ Văn An" là dữ liệu giả. Ghi quyết định này vào spec. | New |
| R-04 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/functional-design/rules.md > BR4.1 và BR3.3 | Spec chuyển 3 việc lệch sang Build and Test nhưng chỉ nêu một câu ngắn. Riêng "ErrorMapper chưa nhận 23001" là lỗ hổng thật: nếu khóa ngoại RESTRICT bị vi phạm mà kiểm ở tầng service bị lọt (hai người cùng thao tác), API có thể trả 500 thay vì 409, trái FR6.2 và NFR3. Spec chưa nói danh sách API sẽ ghi gì về trường hợp này. | Ghi vào spec rằng danh sách API chỉ mô tả 409 qua đường service (đã đối chiếu thật). Thêm 3 việc lệch vào một mục "việc còn mở" cụ thể trong code-summary.md để Build and Test nhận đúng. Không cần thêm luật mới. | New |
| R-05 | Minor | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/functional-design/functional-spec.md > đầu file (nguồn) | File dùng khối trích dẫn "Nguồn" thay cho các mục `## Sources` và `## Assumptions & Open Questions`. Không có chỗ nào liệt kê giả định của unit (ví dụ máy làm bài có đủ phiên bản phần mềm ghi trong README, backend chạy được ở Development, Hiệp có thời gian chạy bản clone). Nếu sensor nguồn của stage đòi các mục này thì sẽ báo. | Nếu stage yêu cầu, thêm hai mục đó, ghi các giả định trên và để mục "Assumption Confirmation" theo khuôn của stage. Nếu không yêu cầu thì bỏ qua. | New |
| R-06 | Suggestion | aidlc/spaces/default/intents/261030-employee-department-crud/construction/u5-handover/functional-design/traceability.json > reverse | Phần `reverse` chỉ có BR4.1 (N/A), nên không thấy BR1.x đến BR3.x, BR4.2 đến BR4.4 truy ngược về AC nào. Thông tin này có trong bảng tóm tắt của rules.md nhưng chưa nằm trong JSON. | Nếu muốn, thêm các dòng reverse cho các luật còn lại để công cụ truy vết thấy chúng. | New |

### Validation Tool Results

| Tool | Result | Interpretation |
|---|---|---|
| sensor-traceability | Không chạy (chỉ đọc JSON bằng tay) | `upstream_ids` có đủ 10 tiêu chí AC5.1.1 đến AC5.3.3, khớp stories.md dòng 338 đến 372. Mọi AC đều có đích BR và các BR được nhắc đều tồn tại trong rules.md. |

Các điểm đã kiểm đạt: 10 AC trong stories.md đều được phủ bởi BR tương ứng; phạm vi U5 (README, sơ đồ DB, danh sách API, không sửa code) khớp unit-of-work.md; U5 không xin thêm tính năng và không đưa mật khẩu vào tài liệu (BR1.3); Hiệp tự chạy lệnh có mật khẩu và tự duyệt, đúng quy tắc dự án. Mã lỗi 23001 cho khóa ngoại RESTRICT và quan hệ hai bảng khớp mô tả U3, U4 trong unit-of-work.md. Ở đây tôi chỉ đối chiếu với tài liệu inception, không mở code hay thư mục unit khác.

### Summary

Thiết kế đủ để người viết tài liệu làm theo mà không phải hỏi thêm: 10 AC được phủ, ranh giới "không sửa code" rõ ràng. Điểm đáng cân nhắc nhất trước khi duyệt là thứ tự duyệt và commit so với lượt kiểm bản clone sạch (một Major, vì chỉ làm rõ thứ tự là xong), cùng vài chỗ nhỏ về căn cứ của mục sự cố và dữ liệu mẫu.
