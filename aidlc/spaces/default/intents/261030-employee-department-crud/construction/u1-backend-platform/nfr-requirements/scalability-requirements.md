# Yêu cầu mở rộng: u1-backend-platform

> **Nguồn:** `inception/requirements-analysis/requirements.md` (mục 6 Giả định, NFR5), `functional-design/functional-spec.md`.

| ID | Yêu cầu | Đo / kiểm | Luật |
|---|---|---|---|
| NFR5.4 | Quy mô thiết kế: **một người dùng**, một tiến trình backend, dữ liệu tối đa 1.000 nhân viên. Không cần mở rộng ngang (thêm máy), không cần chia tải | Không cần đo; đây là ràng buộc thiết kế | BR3.1 |
| NFR5.5 | Không giữ trạng thái trong bộ nhớ giữa các request (không cache, không biến tĩnh chứa dữ liệu), để sau này chạy nhiều tiến trình vẫn không sai | Rà code ở Code Generation | BR3.1 |

**Ngoài phạm vi:** phân trang (requirements Q5), chia nhỏ dữ liệu (sharding), bản sao chỉ đọc (read replica), hàng đợi.
