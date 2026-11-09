# Kế hoạch sửa code: kiem-cuoi-crlf

## Summary

- Builds: repo tự quy định xuống dòng LF (`.gitattributes`, `.editorconfig`), đưa 88 file đang CRLF của dự án về LF, thêm một mục "Sự cố thường gặp" vào README
- Touches: `.gitattributes` (mới), `.editorconfig`, `README.md`, 88 file văn bản ở `backend/`, `frontend/`, `docs/` và gốc repo, 51 file hồ sơ trong `aidlc/` (Step 10) (chỉ đổi ký tự xuống dòng)
- Tests: 1 phép kiểm hồi quy cho đúng lỗi (Prettier + `git ls-files --eol`, đỏ trước khi sửa, xanh sau khi sửa) và chạy lại bộ 148 unit test hiện có

## Bối cảnh và phạm vi

- Việc không có Unit (scope bugfix bỏ Units Generation); kế hoạch dựa vào `inception/requirements-analysis/requirements.md` và kho kiến thức code `aidlc/spaces/default/codekb/employee-crud/`.
- Không đổi code ứng dụng: không có tầng database, data access, nghiệp vụ, API hay giao diện nào bị sửa. Các tầng đó trong Testing Contract là "không áp dụng" cho việc này.
- `.editorconfig` và `README.md` là file có sẵn của Hiệp; kế hoạch sửa chúng vì yêu cầu FR1.2 và FR4.8 gọi tên.
- Lúc đầu kế hoạch **không đổi xuống dòng trong `aidlc/`** (51 file hồ sơ AI-DLC của 3 việc đã xong đang là CRLF trên máy), vì lo đổi byte trên đĩa làm hỏng dấu vân tay nội dung mà AI-DLC ghi. **Đổi ở Step 10 (Hiệp yêu cầu giải quyết dứt điểm R-03, 09/11 tối):** các file này được AI-DLC ghi ra ở dạng LF và lưu trong Git ở dạng LF (`i/lf`); chúng thành CRLF chỉ vì lần `git switch` ngày 05/11 trên máy có `core.autocrlf=true`. Đưa về LF là trả lại đúng byte Git đang lưu (Step 10 kiểm bằng mã băm), không phải tạo nội dung mới.
- Không dùng `git checkout`, `git restore`, `git stash`, `git reset`, `git checkout-index` lên cây làm việc. Công cụ đổi xuống dòng là `dos2unix` 7.5.5 có sẵn trong Git for Windows (`/usr/bin/dos2unix` của Git Bash): nó chỉ đổi CRLF thành LF, không đổi nội dung khác, không cần cài thêm.
- FR3 (clone thử sau khi Hiệp commit) và FR4.2–FR4.7 (148 test, API thật, giao diện, D01–D03, migration trên database trống, Lighthouse) thuộc Build and Test.

## Testing Contract

```json
{
  "version": 1,
  "methodology": "test-after",
  "source": "team",
  "ordering": "Với mỗi Unit, viết code tầng service trước, sau đó viết và chạy ngay unit test cho service đó; controller, migration và giao diện React được kiểm thủ công bằng Postman, pgAdmin và trình duyệt sau khi code xong.",
  "scope": "bugfix",
  "test_strategy": "minimal",
  "project_type": "brownfield",
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
    "strategy": "minimal",
    "strategy_volume": [
      "One verifiable test per requirement at the narrowest effective level.",
      "At least one happy-path unit test per component.",
      "Unit tests are the default; a bugfix/security scope floor may require an integration or E2E regression when that is the narrowest level that reproduces the defect."
    ],
    "scope_floor": [
      "Include a targeted regression for the bug or vulnerability.",
      "Keep the existing test suite green."
    ],
    "combination_rule": "Apply every selected-strategy obligation and every scope-floor obligation; neither replaces the other, and a targeted scope regression may add the narrowest necessary test type beyond the strategy default."
  },
  "plan_profile": {
    "methodology": "test-after",
    "runner_step": "Verify the existing test runner/configuration and record the exact unit-scoped command.",
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
      "Verify the existing test runner/configuration and record the exact unit-scoped command.",
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
  "input_sha256": "sha256:8bcb319442295944c09e27fabb54b1c43590577c243e4b638f4811979e3d4282",
  "contract_sha256": "sha256:580009a37d7174fd2af9c6638c5e5744b693051fb8b4413a537629712ff03450"
}
```

Áp dụng: phương pháp test-after. Năm tầng code (database, data access, nghiệp vụ, API, giao diện) không áp dụng vì việc này không sửa code ứng dụng. Phần còn lại theo thứ tự của contract: cấu hình dự án (Step 3–5), kiểm bộ chạy test (Step 2), viết rồi chạy phép kiểm cho phần vừa sửa (Step 6), cấu hình môi trường/build không đổi, tài liệu và truy vết (Step 7, Step 9).

## Các bước

- [x] **Step 1. Đường cơ sở và tái hiện lỗi (trước khi sửa)** — FR1.3, NFR1
  - Ghi vào `code-summary.md`: kết quả `git status --short` (danh sách file đang sửa hay chưa theo dõi trước khi làm) và số file theo từng loại `i/... w/...` của `git ls-files --eol`.
  - Chạy `npm --prefix frontend run format:check` và ghi kết quả: kỳ vọng **thất bại**, báo 29 file (đây là bằng chứng lỗi còn trước khi sửa).
- [x] **Step 2. Kiểm bộ chạy test và ghi lệnh** — FR2.1
  - Xác nhận các lệnh trong `unit-test-instructions.md` chạy được trên máy (Prettier, Git, `dotnet test`).
- [x] **Step 3. Tạo `.gitattributes` ở gốc repo** — FR1.1
  - Nội dung: vài dòng comment tiếng Việt giải thích vì sao (Git cài mặc định trên Windows đổi file sang CRLF; Prettier và `.editorconfig` của dự án dùng LF), rồi dòng `* text=auto eol=lf`. Không thêm ngoại lệ (repo không có `.bat`, `.cmd` hay file nhị phân mà Git có thể nhận nhầm).
- [x] **Step 4. Thêm `end_of_line = lf` vào mục `[*]` của `.editorconfig`** — FR1.2
  - Chỉ thêm một dòng, không đổi dòng nào khác.
- [x] **Step 5. Đưa file CRLF của dự án về LF bằng `dos2unix`** — FR1.3
  - Lệnh (Git Bash, ở gốc repo), chỉ áp lên file Git đang theo dõi mà `git ls-files --eol` báo `w/crlf` hoặc `w/mixed`, bỏ qua `aidlc/`:
    `git ls-files --eol | grep -E 'w/(crlf|mixed)' | cut -f2 | grep -v '^aidlc/' | xargs -d '\n' dos2unix -b`
  - Cờ `-b` giữ BOM: mặc định `dos2unix` xóa BOM (`-r` là mặc định), mà 8 file có BOM cả trên đĩa lẫn trong Git (2 `.csproj`, migration `.cs`, `launchSettings.json`). Hiệp chọn giữ BOM để chỉ đổi xuống dòng, đúng NFR1 (09/11, sau khi developer phát hiện lúc làm Step 5).
  - Dự kiến 88 file: 46 ở `backend/`, 29 ở `frontend/`, 10 ở `docs/`, cùng `.editorconfig`, `README.md`, `dotnet-tools.json` ở gốc.
- [x] **Step 6. Phép kiểm hồi quy cho đúng lỗi (viết và chạy sau khi sửa)** — FR1.1, FR1.2, FR1.3, NFR1
  - `git check-attr text eol -- frontend/src/App.tsx backend/EmployeeCrud.Api/Program.cs` báo `text: auto`, `eol: lf`.
  - `git ls-files --eol` ngoài `aidlc/`: không còn dòng nào có `i/crlf`, `i/mixed`, `w/crlf` hoặc `w/mixed`.
  - `npm --prefix frontend run format:check` **đạt** (trước khi sửa nó thất bại ở Step 1).
  - `git diff --ignore-cr-at-eol --stat` so với đường cơ sở Step 1: chỉ thêm `.editorconfig` (và `README.md` sau Step 7); `.gitattributes` hiện ở `git status` là file mới chưa theo dõi. Không file mã nguồn nào đổi nội dung.
- [x] **Step 7. Thêm mục vào README "11. Sự cố thường gặp"** — FR4.8
  - Triệu chứng: Prettier báo "Code style issues" hàng loạt ngay sau khi clone hoặc pull trên Windows.
  - Nguyên nhân: bản clone làm **trước** khi repo có `.gitattributes`, nên Git đã ghi file ra dạng CRLF.
  - Cách xử lý: cách gọn nhất là clone lại vào thư mục mới. Nếu muốn giữ bản cũ thì commit hết thay đổi trước (`git status` sạch), rồi chạy trong Git Bash lệnh `dos2unix -b` như Step 5 (có cờ `-b` giữ BOM). Lệnh này chỉ đổi ký tự xuống dòng, không đụng nội dung. Build and Test sẽ thử nó trên một bản clone cũ có sửa dở một file, để chứng minh không mất thay đổi.
- [x] **Step 8. Chạy lại lệnh kiểm tổng và bộ test hiện có** — FR2.1, FR4.1, FR4.2
  - `npm --prefix frontend run verify` (typecheck, lint, Prettier, build, `dotnet format --verify-no-changes`, `dotnet test`).
  - Nếu Smart App Control chặn file `.dll` của test: theo luật dự án, thêm comment có ích vào file nguồn test tối đa 2 lần; vẫn bị chặn thì ghi lại, Build and Test xử lý theo FR4.2.
- [x] **Step 9. Viết `code-summary.md` và `traceability.json`** — mọi FR, NFR trên
- [x] **Step 10. Giải quyết dứt điểm 3 điểm rà soát R-01, R-02, R-03 (Hiệp yêu cầu 09/11 tối)** — FR1.3, FR4.8, NFR1
  - R-03, đưa nốt 51 file trong `aidlc/` về LF:
    - Sao lưu nguyên trạng 51 file vào `backend/TestResults/sao-luu-aidlc-crlf-261109/` (thư mục Git bỏ qua) trước khi đổi.
    - Chạy `dos2unix -b` trên đúng các file `git ls-files --eol` báo `w/crlf` hoặc `w/mixed` (lệnh như Step 5, bỏ điều kiện loại `aidlc/`).
    - Kiểm: với mỗi file không có thay đổi chưa commit, mã băm byte trên đĩa (`git hash-object --no-filters`) phải trùng mã blob trong Git (`git rev-parse :<file>`); `git ls-files --eol` toàn repo không còn `w/crlf`, `w/mixed`; `aidlc doctor` vẫn 0 lỗi; `aidlc engine status` đọc được trạng thái các việc.
  - README mục 11: lệnh `dos2unix -b` cho bản clone cũ áp lên mọi file Git theo dõi (bỏ `grep -v '^aidlc/'`), thêm một câu vì sao an toàn cho hồ sơ `aidlc/`.
  - R-02: `code-summary.md` liệt kê đủ file đã đổi (thêm `Program.cs`, `CorsSetup.cs`, 51 file `aidlc/`), sửa các câu "không commit", "không đổi code ứng dụng" cho đúng hiện trạng (3 commit `319e701`, `fbad699`, `c542387`; còn lại chỉ là comment).
  - R-01: tạo lại `traceability.json` bằng `aidlc engine sensor-traceability --stage code-generation --output-path <file> --write-upstream`, đối chiếu đủ 22 ID với bản viết tay, điền trạng thái và file đích cho từng dòng.
  - Chạy lại `npm --prefix frontend run verify` (có 148 test).

## Truy vết bước → yêu cầu

| Yêu cầu | Bước |
|---|---|
| FR1.1 `.gitattributes` | Step 3, Step 6 |
| FR1.2 `.editorconfig` | Step 4, Step 6 |
| FR1.3 đưa file về LF | Step 1, Step 5, Step 6 |
| FR2.1 verify chạy hết chuỗi | Step 2, Step 8 |
| FR3.1, FR3.2 clone thử | Build and Test (cần Hiệp commit trước) |
| FR4.1, FR4.2 verify và 148 test | Step 8 (chạy lần đầu), Build and Test (chốt) |
| FR4.3–FR4.7 API, giao diện, D01–D03, migration, Lighthouse | Build and Test |
| FR4.8 README | Step 7 |
| NFR1 không đổi hành vi | Step 1, Step 6 |
| NFR2 không đổi máy | Mọi bước: không đổi cấu hình Git của máy, không cài gì, `dos2unix` có sẵn |
| NFR3, NFR4 bí mật, dữ liệu demo | Build and Test |
