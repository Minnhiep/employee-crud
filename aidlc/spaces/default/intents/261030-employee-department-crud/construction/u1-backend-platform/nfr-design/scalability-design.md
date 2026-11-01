# Thiết kế mở rộng: u1-backend-platform

> **Nguồn:** `nfr-requirements/scalability-requirements.md` (NFR5.4, NFR5.5).

| Yêu cầu | Thiết kế |
|---|---|
| NFR5.4: một người dùng, một tiến trình | Một tiến trình `dotnet run`, không chia tải, không có nhiều bản chạy song song, không tự tăng tài nguyên |
| NFR5.5: không giữ trạng thái giữa các request | Service và DbContext có vòng đời theo request. Không có biến `static` nào chứa dữ liệu nghiệp vụ. Cấu hình (`IOptions`) chỉ đọc |

Ngưỡng dung lượng: tới 1.000 nhân viên thì truy vấn trên một bảng có chỉ mục vẫn trong ngân sách NFR5. Nếu sau này cần lớn hơn thì thêm phân trang; đó là ngoài phạm vi (requirements Q5).
