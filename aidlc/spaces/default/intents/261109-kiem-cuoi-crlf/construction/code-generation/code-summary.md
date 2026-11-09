# Tóm tắt sửa code: kiem-cuoi-crlf

## Đã làm gì

Repo giờ **tự quy định** kiểu xuống dòng LF, không còn phụ thuộc cấu hình Git của từng máy:

- Thêm `.gitattributes` với `* text=auto eol=lf`: mọi bản clone ghi file văn bản ra LF, kể cả máy có `core.autocrlf=true`.
- Thêm `end_of_line = lf` vào `.editorconfig`: trình soạn thảo tạo file mới dạng LF, khớp với `.gitattributes`.
- Đưa 88 file đang CRLF trên máy làm bài về LF bằng `dos2unix -b`. Chỉ đổi ký tự xuống dòng; cờ `-b` giữ dấu BOM ở 8 file có sẵn BOM.
- Thêm một mục vào README "11. Sự cố thường gặp" cho bản clone làm trước khi có `.gitattributes`.
- Step 10: đưa nốt 51 file hồ sơ AI-DLC trong `aidlc/` về LF (byte trên đĩa trùng bản Git lưu), và sửa lệnh trong README mục 11 để áp lên mọi file Git theo dõi.

Không đổi logic của code ứng dụng (database, API, nghiệp vụ, giao diện): code ứng dụng chỉ được thêm comment, theo luật Smart App Control của dự án (2 file test ở Step 8; `Program.cs`, `CorsSetup.cs` khi kiểm tiếp ngoài AI-DLC, xem "Lệch so với kế hoạch" mục 3). Phần sửa của Step 1–9 đã được Hiệp tự commit: `319e701` (quy định LF: `.gitattributes`, `.editorconfig`), `fbad699` (README mục 11), `c542387` (comment trong 4 file test). AI không commit.

## File tạo mới hoặc sửa

| File | Thay đổi | Bước |
|---|---|---|
| `.gitattributes` | Mới: 6 dòng comment tiếng Việt (vì sao cần file) và `* text=auto eol=lf`. LF, không BOM | Step 3 |
| `.editorconfig` | Thêm đúng 1 dòng `end_of_line = lf` trong mục `[*]`; đổi CRLF → LF | Step 4, 5 |
| `README.md` | Thêm 1 gạch đầu dòng cuối mục 11; đổi CRLF → LF. Step 10: bỏ `\| grep -v '^aidlc/'` khỏi lệnh `dos2unix -b` và thêm 1 câu vì sao an toàn cho `aidlc/` (chưa commit) | Step 5, 7, 10 |
| 85 file khác ở `backend/` (46), `frontend/` (29), `docs/` (10) và `dotnet-tools.json` | Chỉ đổi CRLF → LF, nội dung giữ nguyên (danh sách là toàn bộ dòng `w/crlf` ngoài `aidlc/` ở đường cơ sở) | Step 5 |
| `backend/EmployeeCrud.Api.Tests/TestSupport/TestDb.cs` | Thêm 2 dòng comment: vì sao nạp dữ liệu bằng context riêng | Step 8 (luật Smart App Control, lần 1) |
| `backend/EmployeeCrud.Api.Tests/Platform/LogCapturingWebAppFactory.cs` | Thêm 2 dòng comment: vì sao dùng `ConcurrentQueue` thay vì `List` | Step 8 (luật Smart App Control, lần 2) |
| `backend/EmployeeCrud.Api/Program.cs` | Thêm 1 dòng comment: Swagger UI đọc file JSON do `MapOpenApi()` phát ở `/openapi/v1.json`. Chỉ comment, chưa commit | Kiểm tiếp ngoài AI-DLC, 09/11 chiều (luật Smart App Control; "Lệch so với kế hoạch" mục 3) |
| `backend/EmployeeCrud.Api/Platform/Cors/CorsSetup.cs` | Thêm 2 dòng comment: thiếu mục `Cors:AllowedOrigins` thì vẫn cho địa chỉ frontend trên máy. Chỉ comment, chưa commit | Như dòng trên |
| 51 file hồ sơ AI-DLC trong `aidlc/spaces/default/intents/` (`261030-employee-department-crud/` 11, `261104-sua-loi-luot-6/` 22, `261104-sua-loi-luot-8/` 18) | Chỉ đổi CRLF → LF. 50 file không có thay đổi chưa commit: byte trên đĩa trùng bản Git lưu (so mã băm). 1 file có thay đổi chưa commit từ trước (`261104-sua-loi-luot-8/audit/mint-adeecefb94cd.md`): phần khác so với Git giữ nguyên, chỉ mất ký tự CR | Step 10 |

Không đổi cấu hình Git nào (hệ thống, toàn máy, repo), không cài gì. AI không commit và không chạy `git add`; phần sửa của Step 1–9 do Hiệp tự commit (`319e701`, `fbad699`, `c542387`), phần của Step 10 và 2 comment ở `Program.cs`, `CorsSetup.cs` chưa commit.

## Quyết định chính

- **Sửa ở repo, không sửa ở máy.** `.gitattributes` đi theo repo nên mọi máy clone về đều nhận, còn `core.autocrlf` là cài đặt riêng của từng máy (NFR2).
- **Đổi xuống dòng bằng `dos2unix -b`, không dùng `git checkout`/`restore`/`stash`/`reset`.** Cây làm việc đang có thay đổi chưa commit của Hiệp; các lệnh Git kia có thể ghi đè file. `dos2unix` có sẵn trong Git for Windows.
- **Giữ BOM** (Hiệp chọn A, 09/11): xem mục "Lệch so với kế hoạch".
- **Comment cho Smart App Control phải giải thích code thật**, chọn hai file khác `PlatformWebAppFactory.cs` và `ThrowingAppDbContext.cs` (hai file này đã có comment thêm sáng nay).

## Đường cơ sở trước khi sửa (Step 1, ngày 2026-11-09)

Ghi lại **trước** khi đổi bất cứ file nào, để sau khi sửa so lại được.

### `git status --short`

```text
 M aidlc/spaces/default/codekb/employee-crud/api-documentation.md
 M aidlc/spaces/default/codekb/employee-crud/architecture.md
 M aidlc/spaces/default/codekb/employee-crud/business-overview.md
 M aidlc/spaces/default/codekb/employee-crud/code-quality-assessment.md
 M aidlc/spaces/default/codekb/employee-crud/code-structure.md
 M aidlc/spaces/default/codekb/employee-crud/component-inventory.md
 M aidlc/spaces/default/codekb/employee-crud/dependencies.md
 M aidlc/spaces/default/codekb/employee-crud/reverse-engineering-timestamp.md
 M aidlc/spaces/default/codekb/employee-crud/technology-stack.md
 M aidlc/spaces/default/intents/261104-sua-loi-luot-8/audit/mint-adeecefb94cd.md
 M aidlc/spaces/default/intents/intents.json
 M backend/EmployeeCrud.Api.Tests/Platform/PlatformWebAppFactory.cs
 M backend/EmployeeCrud.Api.Tests/TestSupport/ThrowingAppDbContext.cs
?? aidlc/.aidlc-subagent-inflight
?? aidlc/spaces/default/intents/261109-kiem-cuoi-crlf/
```

Đây là các thay đổi có từ trước việc này (hồ sơ AI-DLC và hai comment trong file test thêm sáng nay). `aidlc/.aidlc-subagent-inflight` là file tạm của AI-DLC trong lúc giao việc cho agent.

### Số file theo kiểu xuống dòng (`git ls-files --eol`)

`i/` là bản trong Git (index), `w/` là bản trên đĩa (working tree).

| Cặp | Trước khi sửa | Sau khi sửa |
|---|---|---|
| `i/lf w/lf` | 664 | 752 |
| `i/lf w/crlf` | 138 | 50 (đều trong `aidlc/`) |
| `i/lf w/mixed` | 1 | 1 (trong `aidlc/`) |
| Tổng | 803 | 803 |

Trước khi sửa, 139 file `w/crlf` hoặc `w/mixed` chia theo thư mục: `aidlc/` 51 (gồm file `w/mixed` duy nhất `aidlc/spaces/default/intents/261104-sua-loi-luot-8/audit/mint-adeecefb94cd.md`), `backend/` 46, `frontend/` 29, `docs/` 10, gốc repo 3 (`.editorconfig`, `README.md`, `dotnet-tools.json`). Ngoài `aidlc/` là **88 file**, đúng như kế hoạch. Không file nào có `i/crlf` hay `i/mixed`: nội dung trong Git đều là LF, chỉ bản trên đĩa bị đổi sang CRLF.

### `git diff --ignore-cr-at-eol --stat` trước khi sửa

13 file: 9 file `aidlc/spaces/default/codekb/employee-crud/*.md`, `aidlc/spaces/default/intents/261104-sua-loi-luot-8/audit/mint-adeecefb94cd.md`, `aidlc/spaces/default/intents/intents.json`, `backend/EmployeeCrud.Api.Tests/Platform/PlatformWebAppFactory.cs` (+4 dòng), `backend/EmployeeCrud.Api.Tests/TestSupport/ThrowingAppDbContext.cs` (+1 dòng). Tổng 816 dòng thêm, 695 dòng bớt.

### `npm --prefix frontend run format:check` trước khi sửa: **thất bại** (đúng như dự kiến)

```text
> employee-crud-frontend@0.0.0 format:check
> prettier --check .

Checking formatting...
[warn] package.json
[warn] src/api/client.ts
... (27 file nữa trong src/)
[warn] Code style issues found in 29 files. Run Prettier with --write to fix.
```

Mã thoát 1. 29 file bị báo đúng là 29 file `w/crlf` của `frontend/`. Đây là bằng chứng lỗi còn trước khi sửa.

### `git check-attr` trước khi có `.gitattributes` (chạy ở Step 2)

`frontend/src/App.tsx` và `backend/EmployeeCrud.Api/Program.cs` đều báo `text: unspecified`, `eol: unspecified`: repo chưa tự quy định kiểu xuống dòng.

## Lệnh đã chạy và kết quả

### Step 2: kiểm bộ chạy test

Có đủ công cụ: `dos2unix` 7.5.5 (Git Bash), .NET SDK 10.0.403, Prettier trong `frontend/node_modules`, Git. Script `verify` trong `frontend/package.json` nối typecheck → lint → format:check → build → `dotnet format --verify-no-changes` → `dotnet test` bằng `&&`.

### Step 5: đưa file về LF

`git ls-files --eol | grep -E 'w/(crlf|mixed)' | cut -f2 | grep -v '^aidlc/' | xargs -d '\n' dos2unix -b`

`dos2unix` in "converting file … to Unix format…" cho đúng 88 file. Sau đó `file` xác nhận 8 file có BOM vẫn còn BOM ("UTF-8 (with BOM) text") và không còn CRLF.

### Step 6: phép kiểm hồi quy (chạy sau khi sửa)

| Phép kiểm | Trước khi sửa | Sau khi sửa | Đạt? |
|---|---|---|---|
| `git check-attr text eol -- frontend/src/App.tsx backend/EmployeeCrud.Api/Program.cs` | `unspecified` / `unspecified` | `text: auto`, `eol: lf` cho cả hai file | Đạt |
| `git ls-files --eol \| grep -v '<tab>aidlc/' \| grep -E 'i/(crlf\|mixed)\|w/(crlf\|mixed)'` | 88 dòng | Không in dòng nào | Đạt |
| `npm --prefix frontend run format:check` | Thất bại, 29 file | "All matched files use Prettier code style!" (mã thoát 0) | Đạt |
| `git diff --ignore-cr-at-eol --stat` | 13 file | 13 file đường cơ sở + `.editorconfig` (+1) + `README.md` (+1) + 2 file test chỉ thêm comment (`TestDb.cs` +2, `LogCapturingWebAppFactory.cs` +2) = 17 file | Đạt, có ghi chú |

Ghi chú cho dòng cuối: hai file test thêm vào danh sách là do luật Smart App Control mà Step 8 của kế hoạch cho phép, và chỉ là comment. `git diff` thường (không bỏ qua CR) cũng chỉ ra đúng các file đó, nghĩa là theo cách Git tự chuẩn hóa xuống dòng thì 86 file chỉ đổi xuống dòng không có dòng nào khác. Không file mã nguồn nào đổi nội dung ngoài comment (NFR1). `.gitattributes` hiện ở `git status` là `??` (file mới chưa theo dõi).

### Step 8: lệnh kiểm tổng `npm --prefix frontend run verify`

| Bước con | Kết quả |
|---|---|
| `npm run typecheck` (`tsc -p tsconfig.json`) | Đạt |
| `npm run lint` (`eslint . --max-warnings 0`) | Đạt |
| `npm run format:check` (`prettier --check .`) | Đạt: "All matched files use Prettier code style!" |
| `npm run build` (`tsc` + `vite build`) | Đạt: 123 module, `dist/assets/index-Csu4ADgQ.js` 303.92 kB (gzip 93.51 kB), CSS 17.32 kB |
| `dotnet format ../backend/EmployeeCrud.slnx --verify-no-changes` | Đạt: chuỗi `&&` chạy tiếp sang `dotnet test` nên bước này thoát mã 0. Sau khi thêm 2 comment, chạy lại riêng lệnh này: vẫn mã thoát 0, không in gì |
| `dotnet test ../backend/EmployeeCrud.slnx` | **Bị Smart App Control chặn**: build xong, nhưng không nạp được `EmployeeCrud.Api.Tests.dll`; 0 test chạy. `verify` thoát mã 1 |

Lỗi đúng nguyên văn (giống nhau ở cả 3 lần chạy):

```text
[xUnit.net 00:00:06.04] EmployeeCrud.Api.Tests: Catastrophic failure: System.IO.FileLoadException: Could not load file or assembly 'C:\Users\ASUS\OneDrive\Desktop\Thực tập\27-10\employee-crud\backend\EmployeeCrud.Api.Tests\bin\Debug\net10.0\EmployeeCrud.Api.Tests.dll'. An Application Control policy has blocked this file. (0x800711C7)
No test is available in C:\Users\ASUS\OneDrive\Desktop\Thực tập\27-10\employee-crud\backend\EmployeeCrud.Api.Tests\bin\Debug\net10.0\EmployeeCrud.Api.Tests.dll. ...
```

Xử lý theo luật dự án (thêm comment có ích để build ra file `.dll` mới, tối đa 2 lần):

| Lần | File thêm comment | Lệnh chạy lại | Kết quả |
|---|---|---|---|
| 0 | (chưa thêm, chạy trong `verify`) | `npm --prefix frontend run verify` | Bị chặn (0x800711C7) |
| 1 | `backend/EmployeeCrud.Api.Tests/TestSupport/TestDb.cs` | `dotnet test backend/EmployeeCrud.slnx` | Bị chặn (0x800711C7), xUnit 00:00:03.99 |
| 2 | `backend/EmployeeCrud.Api.Tests/Platform/LogCapturingWebAppFactory.cs` | `dotnet test backend/EmployeeCrud.slnx` | Bị chặn (0x800711C7), xUnit 00:00:04.61 |

Đã dừng thử sau lần 2. Không đổi cài đặt máy. Cả hai file đều LF (`i/lf w/lf`) và qua `dotnet format --verify-no-changes`. Theo FR2.1, mọi bước trước `dotnet test` đều đạt, còn bước test chuyển cho Build and Test xử lý theo FR4.2.

**Chạy lại ngày 09/11 (tối), sau khi Hiệp tự tắt tạm Smart App Control:** `npm --prefix frontend run verify` thoát mã 0, gồm `dotnet test`: `Passed! - Failed: 0, Passed: 148, Skipped: 0, Total: 148`.

### Step 10: giải quyết R-01, R-02, R-03 (09/11 tối)

#### R-03: đưa 51 file hồ sơ trong `aidlc/` về LF

Các file này AI-DLC ghi ra ở dạng LF và Git lưu ở dạng LF (`i/lf`); chúng thành CRLF chỉ vì lần `git switch` ngày 05/11 trên máy có `core.autocrlf=true`. Đổi về LF là trả lại đúng byte Git đang lưu, các phép kiểm dưới đây chứng minh điều đó.

| # | Việc / phép kiểm | Lệnh | Kết quả thật | Đạt? |
|---|---|---|---|---|
| 1 | Lấy danh sách | `git ls-files --eol \| grep -E 'w/(crlf\|mixed)'` | 51 file: 50 `i/lf w/crlf`, 1 `i/lf w/mixed`; tất cả trong `261030-employee-department-crud/` (11), `261104-sua-loi-luot-6/` (22), `261104-sua-loi-luot-8/` (18) | — |
| 2 | Thay đổi chưa commit, ghi **trước** khi đổi | `git status --short -- <51 file>` | 1 file có (`261104-sua-loi-luot-8/audit/mint-adeecefb94cd.md`, chính là file `w/mixed`); 50 file sạch | — |
| 3 | Sao lưu nguyên trạng | PowerShell `Copy-Item` từng file vào `backend/TestResults/sao-luu-aidlc-crlf-261109/` (giữ cấu trúc đường dẫn; thư mục này Git bỏ qua theo `.gitignore` dòng 45 `TestResults/`) | 51 file đã chép; `Get-FileHash` (SHA-256) bản sao trùng bản gốc 51/51 | Đạt |
| 4 | Đổi xuống dòng | `git ls-files --eol \| grep -E 'w/(crlf\|mixed)' \| cut -f2 \| xargs -d '\n' dos2unix -b` | `dos2unix` in "converting file … to Unix format…" đúng 51 lần, không file nào khác | Đạt |
| 5 | Byte trên đĩa = bản Git lưu (50 file sạch) | `git hash-object --no-filters <file>` so với `git rev-parse :<file>` | **50/50 trùng**, 0 khác | Đạt |
| 6 | File có thay đổi chưa commit | `git diff --ignore-cr-at-eol --stat -- <file>`, và mã băm của cả bản diff đó (`… \| git hash-object --stdin`) | Trước: `1 file changed, 89 insertions(+)`, mã `3103fe38c30f61c140504d0f4f287b773cdffd61`. Sau: y hệt cả hai. Ký tự CR: 2113 → 0 (đếm bằng `tr -cd '\r' \| wc -c`). Kích thước 85735 → 83622 byte (đúng bằng bớt 2113 CR). `tr -d '\r' < <bản sao lưu> \| cmp - <file>`: trùng | Đạt |
| 7 | Toàn repo không còn CRLF | `git ls-files --eol \| grep -E 'i/(crlf\|mixed)\|w/(crlf\|mixed)'` | Không in dòng nào (grep thoát mã 1); cả 804 file Git theo dõi là `i/lf w/lf` | Đạt |
| 8 | AI-DLC vẫn khỏe | `aidlc doctor` | `0 problems, 2 warnings`. Hai cảnh báo là khuyến nghị, không do việc đổi xuống dòng: bản ghi trên dự án 2.11.2 khác engine 2.11.3 đang chọn; 78 thay đổi chưa commit trong `aidlc/` | Đạt |
| 9 | AI-DLC đọc được trạng thái | `aidlc engine status` | Đọc được: Phase CONSTRUCTION, Code Generation (3.5), "Revising Code Generation (revision 1 of 3)", 2/6 stages | Đạt |

Không phép kiểm nào hỏng nên không phải chép lại từ bản sao lưu. Bản sao lưu vẫn để ở `backend/TestResults/sao-luu-aidlc-crlf-261109/`.

Hai điều cần biết khi đọc kết quả:

- Sau khi đổi, `git status --short` báo cả 51 file là ` M`: index còn nhớ kích thước file lúc còn CRLF (giống 88 file ở Step 5). Vì vậy phép kiểm 5 phân loại "sạch / có thay đổi" theo kết quả ghi **trước** khi đổi (phép kiểm 2), không theo `git status` sau khi đổi. `git diff --stat` (thường và `--ignore-cr-at-eol`) hiện ra 14 file, 815 dòng thêm, 696 dòng bớt; trong 51 file chỉ có đúng file audit của lượt 8, như trước khi đổi.
- `grep -c $'\r'` của Git Bash báo 0 CR ngay cả với file còn CRLF (grep bản Windows bỏ CR khi đọc), nên CR được đếm bằng `tr -cd '\r' | wc -c`.

#### README mục 11

Lệnh cho bản clone cũ bỏ đoạn `| grep -v '^aidlc/'`, nay là `git ls-files --eol | grep -E 'w/(crlf|mixed)' | cut -f2 | xargs -d '\n' dos2unix -b`, và thêm một câu: "Lệnh áp lên cả hồ sơ AI-DLC trong `aidlc/` vẫn an toàn: Git lưu các file đó ở dạng LF, nên đổi về LF chỉ trả lại đúng bản Git đang giữ." `git diff --stat -- README.md`: `1 insertion(+), 1 deletion(-)` (cả mục là một dòng); README vẫn `i/lf w/lf`, 0 CR.

#### R-02: tóm tắt này

Bảng "File tạo mới hoặc sửa" thêm `Program.cs`, `CorsSetup.cs` và 51 file `aidlc/`; các câu "không commit", "không đổi code ứng dụng" sửa cho đúng hiện trạng (3 commit của Hiệp; code ứng dụng chỉ thêm comment). Hai dòng comment ở `CorsSetup.cs` và một dòng ở `Program.cs` là toàn bộ phần khác của hai file đó (`git diff -U0`: 3 dòng `+`, không dòng `-`).

#### R-01: tạo lại `traceability.json` bằng công cụ: **xong**

Chạy đúng lệnh của stage file, ghi vào chính file của stage (sao lưu bản viết tay trước ở `backend/TestResults/sao-luu-aidlc-crlf-261109/traceability.viet-tay.json`, SHA-256 trùng):

```text
aidlc engine sensor-traceability --stage code-generation --output-path aidlc/spaces/default/intents/261109-kiem-cuoi-crlf/construction/code-generation/traceability.json --write-upstream
{"path":"...traceability.json","upstream_ids":["FR1","FR1.1","FR1.2","FR1.3","FR2","FR2.1","FR3","FR3.1","FR3.2","FR4","FR4.1","FR4.2","FR4.3","FR4.4","FR4.5","FR4.6","FR4.7","FR4.8","NFR1","NFR2","NFR3","NFR4"],"added":[],"written":false}
```

Công cụ liệt kê đúng 22 ID, trùng hoàn toàn với bản viết tay, không thiếu ID nào (`added: []`) nên không phải ghi thêm. Sau đó `aidlc engine sensor fire traceability --stage code-generation --output-path <file đó>` trả `"result":"passed"`: mọi dòng có trạng thái, mọi đích `OK` là file có thật. Không có chênh lệch.

Lần chạy đầu (theo brief, ghi ra chỗ khác) bị từ chối: `aidlc engine sensor-traceability --stage code-generation --output-path backend/TestResults/traceability-tao-lai.json --write-upstream`. Kết quả nguyên văn:

```text
{"path":"backend/TestResults/traceability-tao-lai.json","upstream_ids":[],"added":[],"written":false,"reason":"nothing written: the table this writes is the code-generation stage's own traceability.json"}
```

Công cụ không tạo file và không in danh sách ID, vì nó chỉ ghi vào chính `traceability.json` của stage trong hồ sơ việc đang mở (hàm `tableWhere`, `.claude/tools/aidlc-sensor-traceability.ts`). Đọc mã nguồn (chưa chạy thử): với việc không có Unit như việc này, công cụ lấy 22 ID trong `inception/requirements-analysis/traceability.json`, bỏ 4 ID cha FR1–FR4 vì đã có ID con, tức đòi **18 ID**; bản viết tay có đủ 22 ID nên chứa đủ 18 ID đó. Khi chạy với `--output-path` là file chính thức, công cụ chỉ **thêm** ID còn thiếu thành dòng `GAP`, giữ nguyên các dòng có sẵn, và không ghi gì nếu không thiếu ID nào. Chạy như vậy là khác brief (brief cho công cụ ghi ra `backend/TestResults/` để không đụng file chính thức), nên developer dừng phần này để Hiệp chọn. `traceability.json` chưa đổi.

#### Lệnh kiểm tổng `npm --prefix frontend run verify`

| Bước con | Kết quả |
|---|---|
| `npm run typecheck` | Đạt |
| `npm run lint` | Đạt |
| `npm run format:check` | Đạt: "All matched files use Prettier code style!" |
| `npm run build` | Đạt: 123 module, `dist/assets/index-Csu4ADgQ.js` 303.92 kB (gzip 93.51 kB), CSS 17.32 kB |
| `dotnet format ../backend/EmployeeCrud.slnx --verify-no-changes` | Đạt (chuỗi `&&` chạy tiếp sang `dotnet test`) |
| `dotnet test ../backend/EmployeeCrud.slnx` | Đạt: `Passed! - Failed: 0, Passed: 148, Skipped: 0, Total: 148` (619 ms). Không bị Smart App Control chặn |

## Độ phủ và test

- Việc này không đổi logic code ứng dụng (chỉ thêm comment) nên không có dòng code chạy mới để đo. Mức sàn của dự án (ít nhất 80% số dòng của các lớp service) do Build and Test kiểm trên toàn bộ test; không đổi ngưỡng nào.
- Phép kiểm hồi quy cho đúng lỗi là Prettier + `git ls-files --eol` + `git check-attr`: đỏ trước khi sửa, xanh sau khi sửa (bảng Step 6).

### Bộ test có sẵn

- **148 unit test xUnit** (`dotnet test backend/EmployeeCrud.slnx`): lúc làm Step 8 chưa chạy được vì Windows Smart App Control chặn nạp `EmployeeCrud.Api.Tests.dll` (0x800711C7). Đã chạy lại ngày 09/11 (tối) sau khi Hiệp tắt tạm Smart App Control: **148/148 đạt** (xem cuối Step 8), và chạy lại sau Step 10: vẫn **148/148 đạt**.
- Không có CI, nên không có test nào được để lại cho CI.

## Lệch so với kế hoạch

1. **BOM ở 8 file (phát hiện lúc làm Step 5, Hiệp chọn A: giữ BOM, 09/11).** Bản kế hoạch được duyệt lần đầu dùng `dos2unix` không có cờ và ghi rằng nó "chỉ đổi CRLF thành LF". `dos2unix --help` trên máy lại in `-r, --remove-bom  remove Byte Order Mark (default)`: khi đổi sang LF, nó mặc định xóa BOM (3 byte `EF BB BF` đầu file). 8 file có BOM cả trên đĩa lẫn trong Git (kiểm bằng `file` và `git cat-file blob ":<file>" | head -c3`): `backend/EmployeeCrud.Api.Tests/EmployeeCrud.Api.Tests.csproj`, `backend/EmployeeCrud.Api/EmployeeCrud.Api.csproj`, 4 file migration (`20261101183552_CreateDepartments.cs`, `.Designer.cs`, `20261102083152_CreateEmployees.cs`, `.Designer.cs`), `AppDbContextModelSnapshot.cs`, `Properties/launchSettings.json`. Chạy lệnh cũ thì 8 file này đổi nội dung, trái NFR1. Developer dừng trước Step 5 để hỏi; Hiệp chọn **A: giữ BOM**. Kế hoạch được cập nhật theo yêu cầu của Hiệp: Step 5 và lệnh trong README (Step 7) dùng `dos2unix -b`. Sau khi chạy, 8 file vẫn còn BOM và không có trong `git diff`.
2. **Hai file test có thêm comment** (`TestDb.cs`, `LogCapturingWebAppFactory.cs`), do luật Smart App Control mà Step 8 cho phép. Vì vậy danh sách ở Step 6 dài hơn mức "chỉ thêm `.editorconfig` và `README.md`" hai file, cả hai chỉ là comment.
3. **Thêm 2 comment vào code ứng dụng khi kiểm tiếp ngoài AI-DLC (09/11 chiều)**, cũng theo luật Smart App Control, lúc backend vừa build bị chặn: `backend/EmployeeCrud.Api/Program.cs` (Swagger UI đọc file JSON do `MapOpenApi()` phát ở `/openapi/v1.json`) và `backend/EmployeeCrud.Api/Platform/Cors/CorsSetup.cs` (thiếu mục `Cors:AllowedOrigins` thì vẫn cho địa chỉ frontend trên máy). Chỉ là comment, đã đối chiếu đúng với code; `dotnet format --verify-no-changes` đạt.
4. **README mục 11 có thêm một câu về `git status`** (Hiệp chọn thêm, 09/11 chiều): sau lệnh `dos2unix -b`, `git status` có thể vẫn liệt kê file đã sửa; chạy `git add -A` thì chúng biến mất. Đề xuất ở mục dưới vì thế đã làm.
5. **`traceability.json` viết bằng tay.** Stage file bảo tạo bằng `aidlc engine sensor-traceability ... --write-upstream`, nhưng trong phiên này chính `aidlc.exe` bị Smart App Control chặn ("Program 'aidlc.exe' failed to run: An Application Control policy has blocked this file"). Git Bash thì báo "Permission denied". File được viết theo mẫu ở `.claude/knowledge/aidlc-shared/verification.md`, với `upstream_ids` là đủ 22 ID của `requirements-analysis/traceability.json`. **Cập nhật Step 10:** `aidlc.exe` đã chạy được, nhưng lệnh tạo lại theo brief (ghi ra `backend/TestResults/traceability-tao-lai.json`) bị công cụ từ chối vì nó chỉ ghi vào chính `traceability.json` của stage; chạy lại đúng lệnh của stage file trên file chính thức thì công cụ xác nhận đủ 22 ID, không thiếu, và sensor traceability đạt (xem Step 10, mục R-01).

## Điều cần biết: `git status` tạm thời liệt kê 88 file là `M`

Sau Step 5, `git status --short` hiện ` M` cho cả 88 file vừa đổi xuống dòng. Thực tế Git không thấy nội dung khác: `git diff` (cả thường lẫn `--ignore-cr-at-eol`) chỉ ra 17 file ở trên, và `git diff -- frontend/src/App.tsx README.md backend/EmployeeCrud.Api/EmployeeCrud.Api.csproj`, chạy ngay sau Step 5 (trước khi thêm mục README), không in dòng nào. Lý do: index còn nhớ **kích thước** file lúc còn CRLF. Khi kích thước khác, `git status` báo "đã sửa" mà không đọc lại nội dung.

Khi Hiệp chạy `git add` lúc commit, Git đọc lại các file này. Vì nội dung (sau khi chuẩn hóa về LF) trùng bản trong Git, chúng sẽ hết `M` và không có gì được stage. AI không tự chạy `git add`, vì kế hoạch không có bước đó và việc commit là của Hiệp. Tiêu chí "`git status` không báo thêm file nào bị sửa" của FR1.3 nên được kiểm lại sau bước `git add` của Hiệp (ở Build and Test).

Bản clone cũ làm theo mục README mới cũng sẽ gặp đúng hiện tượng này sau khi chạy `dos2unix -b`: `git status` liệt kê nhiều file dù nội dung không đổi. Em đề xuất: Hiệp cân nhắc thêm vào mục README một câu, ví dụ "sau lệnh này `git status` có thể vẫn liệt kê các file là đã sửa; chạy `git add -A` thì chúng biến mất, không có gì mới được thêm". Câu này sau đó đã được thêm (Hiệp chọn, xem "Lệch so với kế hoạch" mục 4).

Sau Step 10 cũng vậy: 51 file `aidlc/` vừa đổi xuống dòng hiện ` M` trong `git status` dù 50 file không khác nội dung (xem Step 10). Lúc viết, `git status --short` có 64 dòng ` M`: 51 file đó, 9 file `codekb`, `intents.json`, `README.md`, `Program.cs`, `CorsSetup.cs`.

## Việc còn mở cho Build and Test

- FR4.2: 148 unit test đã đạt khi chạy lại (09/11 tối); Build and Test chạy lại một lần nữa trên bản đã commit.
- FR1.3 (phần `git status`) và FR3.1, FR3.2: sau khi Hiệp `git add` và commit, kiểm `git status` sạch, rồi clone thử vào `backend/TestResults/` và kiểm `i/lf w/lf` cùng `prettier --check .`.
- FR4.8: thử lệnh README `dos2unix -b` trên một bản clone cũ có sửa dở một file.
- FR4.3–FR4.7, NFR3, NFR4: API thật, giao diện, D01–D03, migration trên database trống, Lighthouse, bí mật, dữ liệu demo.
