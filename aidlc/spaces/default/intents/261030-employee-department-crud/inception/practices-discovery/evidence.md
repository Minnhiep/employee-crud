# Bằng chứng: Practices Discovery

> Người viết: aidlc-pipeline-deploy-agent (lead, làm một mình vì scope `classic` tắt collaborators, nên không có file góp ý của agent hỗ trợ).
> Bản nháp: 2026-10-30T07:30:42Z. Bản tích hợp: 2026-10-30T07:43:36Z.
> Loại dự án: Greenfield (chưa có code ứng dụng, repo chưa có commit nào).

## 1. Đã xem những gì

| File | Đọc để làm gì |
|---|---|
| `.claude/aidlc-common/stages/inception/practices-discovery.md` | Các bước của stage, bốn file phải viết, yêu cầu riêng của mục Testing Posture |
| `aidlc/spaces/default/memory/org.md` | Năm mục mặc định, dùng làm **gợi ý**, không coi là thực tế của nhóm |
| `aidlc/spaces/default/memory/project.md` | Tech Stack, Decided, Forbidden Hiệp đã chốt, coi là **đã quyết** |
| `aidlc/spaces/default/memory/team.md` | Cả năm mục đều trống, chưa có cách làm nào được khẳng định trước đó |
| `aidlc/spaces/default/memory/phases/inception.md` | Luật của pha Inception |
| `aidlc/spaces/default/intents/261030-employee-department-crud/aidlc-state.md` | Scope `classic`, độ sâu Standard, Test Strategy Standard, Construction chạy tuần tự (`serial`) theo từng Unit (`unit-major`); CI Pipeline và cả pha Operation bị bỏ qua |
| `.claude/scopes/aidlc-classic.md` | Scope đặt `skeleton: off`, `collaborators: off`, review chỉ góp ý |
| `docs/ke-hoach.md` | Nguồn yêu cầu: bài CRUD, giới hạn phạm vi (không microservices, Redux, CI/CD), kết quả bàn giao |
| `docs/tim-hieu-technical-stack/05-git.md` | Cách Hiệp đã học dùng Git: commit nhỏ, lời ghi chú tiếng Việt, `.gitignore` |
| `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md` | Danh sách kiểm thủ công F/V/A/D/R, thứ tự kiểm từ dưới lên |
| `docs/tim-hieu-technical-stack/03-aspnet-core.md`, `04-postgresql.md` (chỉ tìm theo từ khóa) | Quy ước tên `snake_case`, cách khai báo `ToTable`/`HasColumnName` |
| `.gitignore` | Hiện chỉ có khối của AI-DLC; **chưa** loại `bin/`, `obj/`, `node_modules/`, `dist/`, `.env` |
| `.claude/tools/aidlc-state.ts` (`practices-promote`), `.claude/tools/aidlc-testing-posture.ts` | Kiểm cách công cụ đọc hai file nháp để chúng được chép đúng vào `team.md`/`project.md` |
| Kiến thức của agent: `branching-strategies.md`, `cicd-patterns.md`, `deployment-strategies.md`, `aidlc-shared/rules-reading.md` | Menu chiến lược nhánh, cổng chất lượng, cách quay lui |
| `practices-discovery-questions.md` | Câu trả lời của Hiệp cho Q1–Q12 (nguồn chính thức của phần 4) |

Không xem lịch sử Git hay cấu hình CI, vì repo chưa có commit và dự án không có CI.

## 2. Suy ra được gì

1. **Một người, một nhánh chính.** Hiệp làm một mình, Git chưa có remote, nên trunk-based trên `main` là cách đơn giản nhất và cũng là mặc định của org.md.
2. **Ai commit.** org.md quy định AI-DLC không tự commit. Mục tiêu là Hiệp hiểu và giải thích được, nên đề xuất Hiệp tự xem diff rồi tự commit.
3. **Walking skeleton.** Scope `classic` đặt `skeleton: off`, nên mặc định là không làm.
4. **Phương pháp test.** project.md chỉ quy định phạm vi test (unit test cho service), không quy định thứ tự viết, nên lấy mặc định `test-after` của org.md.
5. **Luật cứng đã có.** 7 luật NEVER đã nằm trong `project.md`. `practices-promote` chỉ bỏ qua luật trùng đúng từng chữ, nên không chép lại.
6. **Định dạng file nháp.** `practices-promote` coi mọi dòng không rỗng dưới `## Mandated`/`## Forbidden` là một luật (trừ dòng bắt đầu bằng `<!--` hoặc `#`). Vì vậy hai mục đó chỉ chứa dòng luật và comment viết trên một dòng. Dòng `Methodology` chỉ ghi đúng một giá trị.
7. **`dotnet ef`.** Lệnh này cần công cụ `dotnet-ef`, mà cách cài phổ biến là `--global`, tức nằm ngoài thư mục dự án. Điều đó trái với luật của Hiệp, nên phỏng vấn đã hỏi riêng (Q3).

## 3. Chỗ org.md và project.md vênh nhau, và phỏng vấn đã chốt thế nào

| Mục | org.md gợi ý | project.md đã chốt | Phỏng vấn chốt |
|---|---|---|---|
| Testing Posture | Scope `classic`: mức sàn 80% line coverage, **chạy CI trước khi gộp** | `NEVER set up CI/CD`; chỉ unit test cho service, không E2E | Giữ mức 80% nhưng tính trên các lớp service, đo bằng coverlet; Hiệp chạy `dotnet test` trên máy trước khi commit, thay cho CI (Q6). Mức sàn không bị hạ, chỉ đổi nơi chạy. |
| Deployment | Tự triển khai lên staging khi gộp; production cần duyệt tay | Chạy thẳng trên máy; không CI/CD, không Docker | Không có staging/production; "triển khai" là chạy trên máy theo README, có tiêu chí "xong" và cách quay lui (Q8) |
| Code Style | Linter chạy trong CI trước khi gộp, lỗi thì chặn PR | Không CI/CD; chưa có GitHub/PR | `dotnet format`, ESLint và Prettier chạy trên máy (Q9) |
| Way of Working | Worktree từng Bolt squash-merge vào `main` | Git cục bộ, Construction tuần tự | Commit thẳng lên `main`, Hiệp tự commit (Q1, Q2). Nếu AI-DLC tạo worktree thì giữ mặc định squash về `main`; phỏng vấn không hỏi riêng điểm này. |
| Walking Skeleton | Chỉ làm khi scope bật | Không nói gì | Không làm (Q4); khớp `skeleton: off` |

## 4. Quyết định từ phỏng vấn

| Câu | Hỏi gì | Hiệp chọn | Ghi vào đâu |
|---|---|---|---|
| Q1 | Dùng nhánh Git thế nào | A: commit thẳng lên `main` | team-practices, Way of Working |
| Q2 | Ai commit, lời ghi chú thế nào | A: Hiệp tự commit sau mỗi phần đã build và test qua; tiếng Việt, ngắn, nói "làm gì"; AI-DLC không tự commit | team-practices, Way of Working |
| Q3 | Cài công cụ phát triển ở đâu | A: cài cục bộ bằng tool manifest, không `--global` | team-practices, Way of Working; khớp luật NEVER thứ nhất |
| Q4 | Có làm lát mỏng chạy xuyên suốt trước không | A: không; làm đầy đủ phòng ban trước rồi tới nhân viên | team-practices, Walking Skeleton |
| Q5 | Test trước hay sau code | A: test-after | team-practices, Testing Posture (`Methodology`) |
| Q6 | Mức độ phủ | A: ≥ 80% line coverage trên các lớp service, coverlet, `dotnet test` trên máy trước commit | team-practices, Testing Posture |
| Q7 | Thư viện test | A: xUnit, project test riêng (ví dụ `EmployeeCrud.Api.Tests`), test service dùng database giả lập trong bộ nhớ | team-practices, Testing Posture |
| Q8 | "Triển khai" nghĩa là gì | A: chạy trên máy theo README; xong khi migration chạy được, OpenAPI mở được, Postman gọi đúng, React làm đủ thêm/sửa/xóa/tìm; quay lui bằng `git revert` + `dotnet ef database update <migration trước>` | team-practices, Deployment |
| Q9 | Định dạng và kiểm lỗi code | A: C# dùng `.editorconfig` + `dotnet format`; JS dùng ESLint (Vite) + Prettier mặc định | team-practices, Code Style |
| Q10 | Tên bảng/cột | A: `snake_case`, khai báo tay trong cấu hình EF Core, không thêm gói | team-practices, Code Style |
| Q11 | Ngôn ngữ của comment | A: tiếng Việt, ngắn, giải thích "vì sao" | team-practices, Code Style |
| Q12 | Luật cứng | A, B, C, D (cả 3 ALWAYS và 2 NEVER), cộng X nguyên văn: "làm đúng chuẩn chỉnh theo yêu cầu của PJ tôi đưa cho bạn" | discovered-rules: 4 ALWAYS, 2 NEVER |

Câu trả lời X ở Q12 được ghi thành `ALWAYS làm đúng và đủ theo yêu cầu trong docs/ke-hoach.md (dự án Hiệp giao), không tự thêm hay bớt tính năng.` Lời gốc của Hiệp được giữ nguyên trong comment nguồn ngay trên dòng luật.

Điểm phỏng vấn không hỏi nên không ghi thành quyết định của nhóm: chọn duyệt từng checkpoint hay để AI-DLC chạy tiếp tự động khi vào Construction. AI-DLC sẽ hỏi Hiệp ở đầu Construction.

## 5. Còn chưa chắc (để các stage sau xử lý)

- **`ILike` trên database giả lập:** EF Core InMemory có thể không dịch được `EF.Functions.ILike`, vì hàm này là của riêng Npgsql. Nếu đúng vậy, test service tìm kiếm phải dùng cách khác (ví dụ so sánh không phân biệt hoa thường bằng LINQ thường, SQLite trong bộ nhớ, hoặc tách phần truy vấn ra sau một interface). Chưa kiểm; Code Generation quyết.
- **coverlet trong template xUnit:** chưa kiểm `dotnet new xunit` trên .NET 10 có sẵn gói `coverlet.collector` không; sẽ kiểm khi tạo project test.
- **`dotnet-ef`:** chưa kiểm máy đã có công cụ này chưa (theo Q3 sẽ cài cục bộ bằng tool manifest).
- **Database `employee_db`:** chưa kiểm đã được tạo trên PostgreSQL 18 chưa.
- **`.gitignore`:** chưa có các dòng cho .NET và Node; phải bổ sung trước commit đầu tiên có code.
- **Cấu trúc thư mục** (`backend/` + `frontend/` như 05-git.md gợi ý): thuộc Units Generation / Code Generation, chưa chốt ở đây.
