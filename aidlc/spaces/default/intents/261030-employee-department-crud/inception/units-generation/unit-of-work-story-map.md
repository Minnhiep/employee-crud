# Story nào thuộc unit nào

> **Nguồn:** `user-stories/stories.md` (US1.1–US5.3), `unit-of-work.md`.
>
> Mỗi story là một dòng. Một unit có tên trên dòng nào thì phần Functional Design của unit đó phải lo **mọi tiêu chí chấp nhận** của story đó. Story trải trên nhiều unit thì các unit được ngăn bằng `;`.

| Story | Unit ID | Directory | Ghi chú |
|---|---|---|---|
| US1.1 | U3 | u3-departments | |
| US1.2 | U3 | u3-departments | |
| US1.3 | U3 | u3-departments | |
| US1.4 | U3; U4 | u3-departments; u4-employees | U3: xóa và xác nhận (AC1.4.1, AC1.4.2). U4: chặn khi còn nhân viên (AC1.4.3) |
| US1.5 | U3 | u3-departments | Migration và 4 phòng ban mẫu |
| US2.1 | U4 | u4-employees | |
| US2.2 | U4 | u4-employees | |
| US2.3 | U4 | u4-employees | |
| US2.4 | U4 | u4-employees | |
| US3.1 | U4 | u4-employees | |
| US4.1 | U1; U2; U3; U4 | u1-backend-platform; u2-web-shell; u3-departments; u4-employees | U1: ProblemDetails cho lỗi 400. U2: cách hiện lỗi dùng chung. U3, U4: luật kiểm dữ liệu cho từng form |
| US4.2 | U2; U3; U4 | u2-web-shell; u3-departments; u4-employees | U2: component `StatusMessage`. U3, U4: dùng ở từng trang |
| US4.3 | U2 | u2-web-shell | Menu, React Router, chữ tiếng Việt của khung trang. Chữ ở từng trang nghiệp vụ do U3, U4 tự lo theo luật tiếng Việt chung |
| US4.4 | U2; U3; U4 | u2-web-shell; u3-departments; u4-employees | U2: kiểu nút khóa. U3, U4: khóa nút ở từng form và nút xóa |
| US4.5 | U2; U3; U4 | u2-web-shell; u3-departments; u4-employees | U2: vùng `Toast`. U3, U4: lời báo "Đã ..." của từng thao tác |
| US4.6 | U2; U3; U4 | u2-web-shell; u3-departments; u4-employees | U2: CSS cho nhãn và lỗi. U3, U4: nhãn và lỗi ở từng form |
| US5.1 | U1; U5 | u1-backend-platform; u5-handover | U1: user-secrets, tool manifest. U5: README hoàn chỉnh |
| US5.2 | U1; U5 | u1-backend-platform; u5-handover | U1: OpenAPI, ProblemDetails. U5: danh sách API kèm JSON và kiểm bằng Postman (các API do U3, U4 tự thêm vào danh sách) |
| US5.3 | U5 | u5-handover | Sơ đồ DB. Ràng buộc DB thật do U3, U4 tạo bằng migration |

## Story trải trên nhiều unit

- **US1.4:** chặn xóa phòng ban còn nhân viên phải đợi tới khi có bảng nhân viên (U4).
- **US4.1, US4.2, US4.4, US4.5, US4.6:** U2 dựng cơ chế dùng chung, mỗi unit nghiệp vụ dùng nó cho màn hình của mình.
- **US5.1, US5.2:** U1 làm phần kỹ thuật (user-secrets, OpenAPI), U5 viết tài liệu.

## Thứ tự làm bên trong mỗi unit

Theo team-practices, mục Testing Posture (test-after):
- **U1:** solution và project → DbContext và user-secrets → middleware lỗi → CORS và OpenAPI → project test chạy được.
- **U2:** dự án Vite → CSS chung → `AppLayout` và menu → router và trang 404 → component dùng chung → `api/client.js`.
- **U3 và U4:** thực thể và cấu hình → migration → DTO → service → **unit test cho service, chạy ngay** → controller → kiểm bằng Postman → trang danh sách → form → xóa → kiểm bằng trình duyệt → cập nhật tài liệu.
- **U5:** README → sơ đồ DB → danh sách API → đối chiếu với code.

## Kiểm độ phủ

- **Story → unit:** cả 19 story đều có ít nhất một unit.
- **Unit → story:** mỗi unit đều có story của mình.
  - U1: US4.1, US5.1, US5.2
  - U2: US4.1–US4.6
  - U3: US1.1–US1.5, US4.1, US4.2, US4.4–US4.6
  - U4: US1.4, US2.1–US2.4, US3.1, US4.1, US4.2, US4.4–US4.6
  - U5: US5.1–US5.3
