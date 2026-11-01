# Phân công cho các Bolt

> **Nguồn:** `bolt-plan.md`, `practices-discovery/team-practices.md`, `delivery-planning-questions.md` (Q3, Q4).
>
> **Bolt** là một lượt làm trọn một phần việc, kết thúc bằng thứ chạy được. **Mob** là nhóm thực hiện một Bolt. Kế hoạch classic không có bước lập nhóm (Team Formation), nên mọi Bolt đều do **AI** (vai lập trình viên, `aidlc-developer-agent`) sinh code; **Hiệp** là người trả lời câu hỏi, duyệt và làm những thao tác trên máy.

| Bolt | Unit | AI làm | Hiệp làm |
|---|---|---|---|
| B1 | `u1-backend-platform` | Sinh code solution, middleware lỗi, CORS, OpenAPI, project test; viết hướng dẫn kết nối DB từng bước | Duyệt kế hoạch code; **tự tạo `employee_db` và đặt user-secrets** theo hướng dẫn; chạy `dotnet build/test`; duyệt điểm kiểm; tự commit |
| B2 | `u2-web-shell` | Sinh dự án Vite, khung trang, `client.js`, CSS chung, cấu hình ESLint và Prettier | Duyệt; chạy `npm install`, `npm run dev`, Lighthouse; duyệt điểm kiểm; tự commit |
| B3 | `u3-departments` | Sinh thực thể, migration, service, test, controller, các trang phòng ban; cập nhật danh sách API và sơ đồ | Duyệt; **tự chạy `dotnet ef database update`**; kiểm bằng Postman, pgAdmin và trình duyệt; duyệt điểm kiểm; tự commit |
| B4 | `u4-employees` | Như B3 cho nhân viên; thêm bước chặn xóa vào service phòng ban | Như B3 |
| B5 | `u5-handover` | Hoàn thiện README, sơ đồ DB, danh sách API | Làm theo README từ bản clone sạch; duyệt; tự commit; sau cùng tự đẩy lên GitHub (không thuộc Bolt nào) |

- Chỉ có **một mob**: AI cùng Hiệp. Không có nhóm khác nên không cần bảng điều phối nhiều nhóm (Program Board).
- Các Bolt chạy **lần lượt, không song song** (Q3).
- Người duyệt mọi bước là Hiệp (`project.md` Mandated).
- Người nhận bài cuối cùng là anh Hiếu (persona P2). Anh Hiếu không tham gia các Bolt.
