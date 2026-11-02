# Kế hoạch Code Generation — U5 `u5-handover`

## Summary

- Builds: 3 tài liệu bàn giao (README, sơ đồ database, danh sách 10 API kèm JSON thật), đã đối chiếu với code đang chạy
- Touches: tạo mới `README.md`, `docs/so-do-database.md`, `docs/danh-sach-api.md`; không sửa code, migration hay cấu hình
- Tests: không có file test mới (unit chỉ làm tài liệu); 6 lệnh kiểm tài liệu tự động + kiểm tay bằng Postman, pgAdmin và bản clone sạch

> **Nguồn:** `functional-design/` (entities, rules BR1.1–BR4.4, functional-spec WF1–WF5), `nfr-requirements/` (security-requirements NFR2.1–NFR2.4, NFR7.1; tech-stack-decisions), `nfr-design/security-design.md` (S1–S5), `inception/units-generation/unit-of-work.md` §U5, `inception/requirements-analysis/requirements.md` (FR7.1–FR7.4), `inception/contract-design/contract-summary.md` (C1–C3, §4).
>
> **Ai làm gì:** AI viết tài liệu, gọi API bằng PowerShell, chạy lệnh kiểm. **Hiệp** chạy câu lệnh SQL trong pgAdmin (AI không gõ mật khẩu database), kiểm lại bằng Postman, tự commit, tự clone và làm theo README. AI không commit, không push.

## Các bước

### Phần A — Chuẩn bị

- [ ] **Step 1. Gom dữ kiện thật (chỉ đọc).** (US5.1, US5.2, US5.3; BR1.2, BR1.5, BR2.2)
  - Phiên bản đích: `backend/EmployeeCrud.Api/EmployeeCrud.Api.csproj`, `backend/EmployeeCrud.Api.Tests/EmployeeCrud.Api.Tests.csproj`, `frontend/package.json`; phiên bản đã cài: `dotnet --version`, `node --version`, `npm --version`, `git --version`.
  - Địa chỉ, cổng: `backend/EmployeeCrud.Api/Properties/launchSettings.json`, cấu hình Vite, biến địa chỉ API của frontend (`.env*` mẫu nếu có), cấu hình CORS và OpenAPI trong backend.
  - Tool manifest (`dotnet-tools.json`), `UserSecretsId`, tên khóa connection string.
  - Bảng, cột, kiểu, ràng buộc, tên ràng buộc, 4 phòng ban mẫu: hai migration và `AppDbContextModelSnapshot.cs`.
  - Ghi chú nháp README trong code-summary của U1–U4.
- [ ] **Step 2. Sẵn sàng lệnh kiểm.** Chạy thử 6 lệnh trong `unit-test-instructions.md` trên cây hiện tại (lúc này phải báo thiếu file), để chắc các lệnh chạy được trước khi viết tài liệu.

### Phần B — Sơ đồ database (WF2) — US5.3

- [ ] **Step 3. Viết `docs/so-do-database.md`.** (BR2.1–BR2.3; AC5.3.1) Sơ đồ mermaid `erDiagram` + mô tả bằng chữ; bảng cột cho `departments`, `employees`; danh sách ràng buộc kèm tên thật; bảng 4 phòng ban mẫu; mục "Đối chiếu bằng pgAdmin"; mục "Thử ràng buộc" (2 ca theo security-design S4: dùng dòng có sẵn làm mồi, kèm bước dự phòng xóa đúng dòng nếu lệnh chèn bất ngờ thành công, ghi chú bộ đếm id có thể nhảy).
- [ ] **Step 4. Hiệp chạy thử ràng buộc và đối chiếu pgAdmin.** (BR2.2, BR2.4; AC5.3.2, AC5.3.3; NFR2.4) AI đưa câu lệnh; Hiệp đếm số dòng, chạy 2 ca trong pgAdmin, đếm lại, gửi mã lỗi PostgreSQL nhận được; AI ghi đúng mã vào tài liệu. Hiệp so tên bảng, cột, ràng buộc trong pgAdmin với tài liệu.

### Phần C — Danh sách API (WF3) — US5.2

- [ ] **Step 5. Gọi API thật.** (BR3.2–BR3.5; NFR2.2, NFR2.3) Dừng backend nền nếu có → `dotnet run` ở Development → gọi 10 thao tác bằng `Invoke-WebRequest` với bản ghi mẫu tên giả (`Nguyễn Văn Mẫu`, `@example.com`, phòng ban `Phòng Mẫu`) → gọi các ca 400, 404, 409 (trùng tên, trùng email, xóa phòng ban còn nhân viên) → mở trang OpenAPI đếm đủ 10 thao tác → xóa mọi bản ghi mẫu vừa tạo, database về như trước → dừng backend. Nếu Smart App Control chặn: dừng, báo Hiệp, không sửa code.
- [ ] **Step 6. Viết `docs/danh-sach-api.md`.** (BR3.1, BR3.4, BR4.2; AC5.2.1, AC5.2.3) Quy ước chung; bảng tóm tắt 10 dòng; mỗi thao tác theo khuôn `Operation`; mục ví dụ lỗi 400/404/409 đầy đủ; cách mở OpenAPI; cách gọi bằng Postman. Chỉ chép JSON từ Step 5; ghi "id trên máy bạn có thể khác". 409 chỉ mô tả đường đã đối chiếu thật (qua service).

### Phần D — README (WF1) — US5.1

- [ ] **Step 7. Viết `README.md`.** (BR1.1–BR1.6, BR4.2; AC5.1.1, AC5.1.2; NFR2.1, NFR4.1, NFR6.1, NFR7.1) Theo đúng thứ tự mục của `HandoverReadme`: giới thiệu luồng → phần mềm cần có (bảng phiên bản từ Step 1) → lấy mã nguồn → đặt connection string bằng user-secrets (mật khẩu là chữ giữ chỗ) → khôi phục công cụ → tạo database bằng migration → chạy backend → chạy frontend → địa chỉ → kiểm nhanh → chạy test và đo độ phủ → sự cố thường gặp (chỉ lỗi có căn cứ đã gặp; lỗi chưa có căn cứ thì bỏ) → liên kết tới hai tài liệu kia.

### Phần E — Kiểm và đối chiếu (WF4, WF5)

- [ ] **Step 8. Chạy 6 lệnh kiểm tài liệu** trong `unit-test-instructions.md`; tất cả phải đạt. Lệch thì sửa tài liệu (WF5), không sửa code.
- [ ] **Step 9. Kiểm bảo mật.** (NFR2.1; security-design S1) AI: đọc `.gitignore` (có `bin/`, `obj/`, `node_modules/`, `dist/`, `.env`), đọc `appsettings*.json` (không có mật khẩu thật), chạy lệnh tìm mẫu `Password=` trong cây hiện tại và cả lịch sử (`git log -p --all -G`), toàn repo gồm `aidlc/`. **Hiệp:** tự gõ chuỗi mật khẩu thật vào `git grep` và `git log -p -S ... --all`; cả hai phải rỗng.
- [ ] **Step 10. Hiệp kiểm lại bằng Postman.** (BR4.4; AC5.2.2, AC5.2.3) Ít nhất 1 GET, 1 POST, 1 PUT, 1 DELETE, 1 ca lỗi; mã và body khớp danh sách. Xóa bản ghi tạo thêm khi kiểm.
- [ ] **Step 11. Hiệp commit ba tài liệu, rồi clone sạch và làm theo README.** (BR4.3; AC5.1.1, AC5.1.3; NFR1.1) Hiệp xem `git status`, `git diff`, commit `Thêm tài liệu bàn giao: README, sơ đồ database, danh sách API` (chỉ 3 file tài liệu). Rồi `git clone` sang thư mục ngoài dự án, làm theo README từng bước; kết thúc bằng một lượt thêm, sửa, xóa, tìm trên giao diện. Chỗ vướng → AI sửa README → Hiệp commit sửa → làm lại từ bước vướng. Hạn chế cùng máy (user-secrets, `employee_db` có sẵn) ghi vào kết quả. Bước này làm **trước** khi rà soát và duyệt U5, để lúc duyệt README đã được chứng minh chạy được.

### Phần F — Hồ sơ

- [ ] **Step 12. Viết `code-summary.md`, `source-manifest.json`, `traceability.json`.** Kết quả đối chiếu (ngày, lệnh, mã nhận được, hạn chế cùng máy); danh sách việc còn mở chuyển cho Build and Test: (1) comment "200" ở `EmployeeService.UpdateAsync` và code-summary U4 §2; (2) `ErrorMapper` chưa nhận 23001; (3) source-manifest U4 còn 3 đường dẫn cũ; cùng mọi lệch mới tìm thấy ở Step 5–11.

### Phần G — Sửa theo rà soát (Hiệp yêu cầu tại checkpoint U5, 03/11/2026)

- [x] **Step 13. Sửa R-01 đến R-04 của lượt rà soát Code Generation.** Chỉ sửa chữ trong tài liệu, không đụng code.
  - **R-01** (`README.md` mục 3): câu về `Remove-Variable` sửa thành "bỏ biến sau khi dùng", không hứa xóa mật khẩu khỏi bộ nhớ; giữ ý "không vào lịch sử PowerShell".
  - **R-02** (`README.md` mục 11): lỗi Smart App Control thêm cảnh báo: thử build lại trước; tắt Smart App Control có thể không bật lại được (tùy phiên bản Windows 11, chưa kiểm trên máy này, xem hướng dẫn của Microsoft trước khi tắt).
  - **R-03** (`unit-test-instructions.md` T6): cột "Đạt khi" ghi "mọi dòng khớp chỉ chứa biến `$p`, mẫu che `***` hoặc chữ giữ chỗ, không có giá trị thật".
  - **R-04** (`docs/danh-sach-api.md` quy ước chung và mục Lỗi 400): ghi chú lỗi 400 trả `application/json`, khác `application/problem+json` của 404/409, là lệch đã biết so với hợp đồng API, chờ xử lý ở Build and Test.
  - Chạy lại T1–T6; cập nhật `code-summary.md`; Hiệp xem `git diff` và commit `README.md`, `docs/danh-sach-api.md`.

## Các tầng của Testing Contract

Hợp đồng kiểm thử là test-after. U5 không có code, nên mọi tầng có test (data model, data access, business logic, API, frontend) **không áp dụng** (BR4.1). Không tạo file test và không đổi cấu hình test. Thay vào đó: 6 lệnh kiểm tài liệu (Step 2, Step 8) và kiểm tay (Step 4, 10, 11). Bộ test hiện có không bị đụng tới; Build and Test chạy lại toàn bộ và đo mức sàn 80%.

## Truy vết story → bước

| Story | Bước |
|---|---|
| US5.1 | Step 1, 7, 9, 11 |
| US5.2 | Step 1, 5, 6, 8, 10 |
| US5.3 | Step 1, 3, 4, 8 |

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "team",
  "ordering": "Với mỗi Unit, viết code tầng service trước, sau đó viết và chạy ngay unit test cho service đó; controller, migration và giao diện React được kiểm thủ công bằng Postman, pgAdmin và trình duyệt sau khi code xong.",
  "scope": "classic",
  "test_strategy": "standard",
  "project_type": "greenfield",
  "applicable_notes": [
    {
      "layer": "org",
      "text": "We treat tests as a first-class deliverable in every Bolt. The specific\nmethodology (TDD, BDD, ATDD, or classic test-after) is affirmed at\npractices-discovery and recorded in `team.md` under this heading with explicit\n`Methodology` and `Ordering` fields; Code Generation resolves those fields\nindependently from coverage, tooling, and scope notes.\n\nWhen no posture has been affirmed, our default per scope is:\n- **Methodology**: test-after\n- **Ordering**: implement each applicable testable layer, then write and run\n  that layer's tests.\n- `mvp`, `enterprise`, `feature`, `infra`, `classic` add an 80% line-coverage\n  floor and CI execution before merge.\n- `bugfix`, `security-patch` add a targeted regression for the specific\n  bug/vulnerability and require the existing suite to remain green.\n- `express` uses the Minimal strategy: requirement-driven unit tests (one per\n  requirement, with a happy-path floor per component); existing tests remain\n  green.\n- `poc`, `refactor`, `workshop` add no extra new-test floor and require the\n  existing suite to remain green.\n\nThe active `Test Strategy` still applies in every scope and determines test\nvolume/types. Scope floors are additive; they never reduce or replace the\nselected strategy.\n\nBuild and Test verifies defined coverage floors and affirmed quality targets;\nthey may not be weakened to make a step pass.\n\nAffirm a stricter posture in `team.md` if the team commits to one."
    },
    {
      "layer": "team",
      "text": "- **Methodology**: test-after\n- **Methodology evidence**: Hiệp chọn viết code trước, rồi viết test cho phần đó và chạy ngay, vì người mới dễ theo dõi hơn (Q5). Lựa chọn này cũng khớp mặc định của org.md và quyết định trong project.md chỉ viết unit test cho logic nghiệp vụ chính.\n- **Ordering**: Với mỗi Unit, viết code tầng service trước, sau đó viết và chạy ngay unit test cho service đó; controller, migration và giao diện React được kiểm thủ công bằng Postman, pgAdmin và trình duyệt sau khi code xong.\n- Phạm vi test tự động: chỉ unit test cho các service, tập trung vào luật nghiệp vụ. Ví dụ: email trùng (không phân biệt hoa thường) trả 409, phòng ban không tồn tại, không xóa được phòng ban còn nhân viên, tìm theo họ tên và email không phân biệt hoa thường, không tìm thấy trả 404. Mỗi service có ít nhất một trường hợp đúng và hai trường hợp lỗi hoặc biên. Không viết E2E, không viết test tự động cho React, không làm bộ test tích hợp lớn.\n- Độ phủ: ít nhất 80% số dòng (line coverage) của các lớp service, đo bằng coverlet (`dotnet test --collect:\"XPlat Code Coverage\"`). Hiệp chạy `dotnet test` trên máy trước mỗi commit, thay cho bước CI mà dự án không có (Q6). Build and Test kiểm mức sàn này và không được hạ nó xuống để cho qua.\n- Công cụ: xUnit, đặt trong một project test riêng cạnh backend (ví dụ `EmployeeCrud.Api.Tests`). Test service dùng database giả lập trong bộ nhớ (Q7). Chọn cụ thể provider nào thì để Code Generation quyết, vì việc hàm `ILike` của Npgsql có chạy được trên provider giả lập hay không vẫn chưa kiểm (xem `evidence.md`).\n- Kiểm thủ công cả luồng: theo các danh sách F, V, A, D, R trong `docs/tim-hieu-technical-stack/07-kiem-thu-va-demo.md`, kiểm từ dưới lên: database → API → giao diện → cả luồng.\n- Khối lượng và loại test theo Test Strategy `Standard` của workflow; mức sàn của scope chỉ cộng thêm, không thay thế."
    }
  ],
  "obligations": {
    "strategy": "standard",
    "strategy_volume": [
      "Five to eight tests per component.",
      "Unit tests plus integration tests for key boundaries.",
      "Add E2E, performance, or security tests when requirements demand them."
    ],
    "scope_floor": [
      "Keep the existing test suite green.",
      "This scope adds no extra new-test floor beyond the selected test strategy."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
    "runner_ready_before_first_test": true,
    "testable_layers": [
      "Data model / database behavior",
      "Repository / data access",
      "Business logic",
      "API / endpoint",
      "Frontend behavior"
    ],
    "steps": [
      "Project structure and production configuration skeleton.",
      "Bootstrap the minimal test runner/configuration and record the exact unit-scoped command.",
      "Data model / database behavior - implement.",
      "Data model / database behavior - write and run its tests after implementation.",
      "Repository / data access - implement.",
      "Repository / data access - write and run its tests after implementation.",
      "Business logic - implement.",
      "Business logic - write and run its tests after implementation.",
      "API / endpoint - implement.",
      "API / endpoint - write and run its tests after implementation.",
      "Frontend behavior - implement.",
      "Frontend behavior - write and run its tests after implementation.",
      "Environment/build configuration.",
      "Documentation and traceability."
    ]
  },
  "input_sha256": "sha256:b6b872fd21e0c58c5bf1fd46fdd8da37894b85fe9b7d7660b7e84c38818ce401",
  "contract_sha256": "sha256:dfce3d5b6be371bd60bc264d51eb2b2a5627226310edfc05af4c94d5234aa0cb"
}
```
