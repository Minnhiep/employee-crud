# Tổng kết Build and Test: sua-ra-soat-ban-giao

## Nguồn

- `../code-generation/code-generation-plan.md` (code-generation-plan): Testing Contract (test-after, scope `bugfix`, strategy Minimal).
- `../code-generation/unit-test-instructions.md` (unit-test-instructions): lệnh kiểm, mức sàn độ phủ, kỳ vọng khi kiểm bằng API thật.
- `../code-generation/code-summary.md` (code-summary): file đã đổi, kết quả tái hiện lỗi và phép thử gây lỗi.
- `../../inception/requirements-analysis/requirements.md`: FR8.1–FR8.3, NFR1–NFR7.
- `aidlc/spaces/default/memory/team.md` mục Testing Posture: mức sàn 80% dòng các lớp service.

## Trạng thái build

Build đạt trên code sau Code Generation (chưa commit): `npm --prefix frontend run verify` mã thoát 0 (typecheck, lint, Prettier, `vite build`, `dotnet format`, 153/153 test). Cần .NET SDK 10.0.x, Node 24, PostgreSQL 18; hướng dẫn ở `build-instructions.md`.

## Loại kiểm thử

Test Strategy `Minimal`, scope `bugfix`: không sinh thêm file hướng dẫn kiểm thử tích hợp, hiệu năng hay bảo mật. Đã chạy:

- 153 unit test xUnit (lớp service 123, lớp Platform 30), đo độ phủ bằng coverlet.
- API thật: 41 phép kiểm (30 hồi quy + 11 cho các sửa lần này).
- Giao diện trên Chromium thật do Playwright điều khiển: 71 phép kiểm.
- Hiệp làm tay: migration trên database trống, Lighthouse trên bản build.

## Độ phủ

Mức sàn của `team.md`: ít nhất 80% số dòng các lớp service, đo bằng coverlet trên toàn bộ test. Kết quả: `DepartmentService` 100%, `EmployeeService` 100%, `TextInput` 100%. Không đổi ngưỡng, không thêm chỗ loại trừ.

## Target Verification Matrix

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| FR8.1 | requirements.md FR8.1 | Database trống: `database update` chạy được, 2 migration, 4 phòng ban mẫu, rồi xóa database thử | Đạt đủ, đã xóa database thử | test-results.md §5 (Hiệp làm tay, báo qua form 47ddac1b) | build-and-test | Met |
| FR8.2 | requirements.md FR8.2 | Desktop, hai trang danh sách: Performance ≥ 90, Accessibility = 100, Best Practices ≥ 90 | `/employees` 100/100/100; `/departments` 100/100/100 | test-results.md §6 (Hiệp làm tay, báo qua form 47ddac1b) | build-and-test | Met |
| FR8.3 | requirements.md FR8.3 | `verify` mã thoát 0; API thật đủ thao tác và mã lỗi; giao diện trình duyệt thật cho mọi FR7 và luồng thêm, sửa, xóa, tìm | `verify` 0; API 41/41; Chromium 71/71 | test-results.md §1, §3, §4 | build-and-test | Met |
| NFR1 | requirements.md NFR1 | Mọi test cũ đạt (trừ test trùng đã bỏ) + test mới; `verify` 0 | 153/153; `verify` 0 | test-results.md §1 | build-and-test | Met |
| NFR2 | requirements.md NFR2; team.md Testing Posture | Lớp service ≥ 80% dòng (coverlet) | 100% / 100% / 100% | test-results.md §2 | build-and-test | Met |
| NFR3 | requirements.md NFR3 | Ngoài FR6.3, FR6.4, FR6.9, mã trạng thái và JSON API không đổi | Bộ 30 phép kiểm API của 09/11 vẫn đạt đủ; chỉ 3 thay đổi có chủ đích | test-results.md §3 | build-and-test | Met |
| NFR4 | requirements.md NFR4 | Comment mới tiếng Việt, nói "vì sao", không mã hồ sơ nội bộ | Không có mã `R-0x`, `FRx` trong comment | Lượt rà Code Generation lần 2 (tìm trong `frontend/src` và `*.cs`) | code-generation | Met |
| NFR5 | requirements.md NFR5 | Không thêm gói, không thêm bí mật; `npm audit --omit=dev` 0 lỗ hổng | `package.json`, lockfile, `.csproj`, `dotnet-tools.json` không đổi; 0 lỗ hổng; mật khẩu chỉ gõ ẩn | test-results.md §1, §5; `git status` các file gói | build-and-test | Met |
| NFR6 | requirements.md NFR6 | Accessibility Lighthouse = 100; dùng được bằng bàn phím | 100 ở cả hai trang; các phép kiểm bàn phím trên Chromium đạt | test-results.md §4, §6 | build-and-test | Met |
| NFR7 | requirements.md NFR7 | `employee_db` giữ 9 phòng ban, 83 nhân viên; dữ liệu thử xóa hết | 9/83 trước và sau mọi script | test-results.md §3, §4, §7 | build-and-test | Met |
| TC-REG | Testing Contract, scope floor bugfix | Có test hồi quy nhắm đúng lỗi | 6 test mới: tìm email chữ HOA (1); PUT phòng ban không tồn tại với tên sai ra 404 (2 ca); PUT phòng có thật tên quá dài vẫn 400 (1); `Accept: text/html` vẫn nhận ProblemDetails JSON (1); giới hạn body 64 KB (1). Phép thử gây lỗi làm đúng các test mới đỏ (code-summary mục 3, 4, 15) | code-summary.md; test-results.md §1 | build-and-test | Met |
| TC-SUITE | Testing Contract, scope floor bugfix | Bộ test hiện có giữ xanh | 153/153 | test-results.md §1 | build-and-test | Met |
| TC-CI | Testing Contract / org.md | Chạy test trong CI trước khi gộp | — | the plan runs no CI Pipeline (`ci-pipeline — SKIP`; dự án không có CI theo `project.md`) | — | N/A |

## Sẵn sàng

- Build: sẵn sàng.
- Test: sẵn sàng (153/153, độ phủ đạt, API 41/41, giao diện 71/71 trên Chromium, migration trên database trống và Lighthouse đạt theo Hiệp báo).
- Bàn giao: sẵn sàng về code; còn các việc Git và dọn dẹp ở nhóm D do Hiệp tự làm.

## Còn mở

- FR8.1 và FR8.2 là kết quả Hiệp làm tay rồi báo lại; AI không có bản chụp hay báo cáo Lighthouse lưu kèm.
- Nhóm D (Hiệp tự làm, AI hướng dẫn từng bước): commit các thay đổi thành từng commit nhỏ; push; dời `backend/TestResults/` ra thư mục lưu trữ; bật lại Smart App Control.
- `frontend/dist/` đang là bản build lúc 02:43 (Git bỏ qua), không ảnh hưởng bàn giao.
