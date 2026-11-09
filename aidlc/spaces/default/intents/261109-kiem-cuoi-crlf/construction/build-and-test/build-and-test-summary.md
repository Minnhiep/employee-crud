# Tổng kết Build and Test: kiem-cuoi-crlf

## Trạng thái build

Build đạt trên commit `3f62f3e`: `npm --prefix frontend run verify` thoát mã 0 (typecheck, lint, Prettier, build, `dotnet format`, 148/148 test). Cần có .NET SDK 10.0.x, Node 24, Git for Windows; hướng dẫn ở `build-instructions.md`.

## Loại kiểm thử

Test Strategy `Minimal`, scope `bugfix`: không sinh thêm file hướng dẫn kiểm thử tích hợp, hiệu năng hay bảo mật. Đã chạy:

- Bộ 148 unit test xUnit có sẵn, cùng đo độ phủ bằng coverlet.
- Phép kiểm hồi quy cho đúng lỗi: Prettier, `git ls-files --eol`, `git check-attr`, clone mới, clone cũ.
- Kiểm API thật (30 ca) và giao diện trên Chromium thật (16 ca), theo yêu cầu FR4.3 và FR4.4 của việc này.

## Độ phủ

Mức sàn của `team.md`: ít nhất 80% số dòng các lớp service, đo bằng coverlet. Kết quả: `DepartmentService` 100%, `EmployeeService` 100%, `TextInput` 100%. Không đổi ngưỡng nào.

## Target Verification Matrix

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| FR1.1 | requirements.md FR1.1 | `text: auto`, `eol: lf` | Đúng như mong đợi | `git check-attr` (code-summary Step 6; review lần 2) | build-and-test | Met |
| FR1.2 | requirements.md FR1.2 | `end_of_line = lf` trong `[*]` | Có | `.editorconfig` | build-and-test | Met |
| FR1.3 | requirements.md FR1.3 | 0 file `w/crlf`/`w/mixed`; `git status` không thêm file lạ | 0; chỉ còn nhật ký AI-DLC | test-results.md §2 | build-and-test | Met |
| FR2.1 | requirements.md FR2.1 | `verify` mã thoát 0 | 0 | test-results.md §1 | build-and-test | Met |
| FR3.1 | requirements.md FR3.1 | Clone mới: mọi file `i/lf w/lf`, Prettier đạt | 821/821; đạt | test-results.md §2 | build-and-test | Met |
| FR3.2 | requirements.md FR3.2 | Báo thư mục thử, không tự xóa | Đã liệt kê | test-results.md §8 | build-and-test | Met |
| FR4.1 | requirements.md FR4.1 | Ghi kết quả từng bước `verify` | Đã ghi | test-results.md §1 | build-and-test | Met |
| FR4.2 | requirements.md FR4.2 | 148 test đạt | 148/148 | test-results.md §1 | build-and-test | Met |
| FR4.3 | requirements.md FR4.3 | 10 thao tác + 400/404/409, CORS, header | 30/30 | test-results.md §3 | build-and-test | Met |
| FR4.4 | requirements.md FR4.4 | Thêm, sửa, xóa, tìm; chặn xóa phòng còn người; trang chi tiết (trình duyệt thật) | 16/16 trên Chromium | test-results.md §4 | build-and-test | Met |
| FR4.5 | requirements.md FR4.5 | D01–D03 đạt | Đạt (09/11) | test-results.md §5 | build-and-test | Met |
| FR4.6 | requirements.md FR4.6 | 2 migration + 4 phòng mẫu trên database trống | Chưa chạy | Hiệp chọn dời (3864d9ab) | build-and-test (không có bước sau trong kế hoạch này) | Unverified |
| FR4.7 | requirements.md FR4.7 | Performance ≥ 90 (2 trang danh sách), Accessibility = 100, Best Practices ≥ 90 | Chưa chạy | Hiệp chọn dời (3864d9ab) | build-and-test (không có bước sau trong kế hoạch này) | Unverified |
| FR4.8 | requirements.md FR4.8 | Lệnh README chạy được, không mất thay đổi chưa commit | 784 → 0 CRLF, dòng sửa dở và BOM còn | test-results.md §2 | build-and-test | Met |
| NFR1 | requirements.md NFR1 | Không đổi nội dung ngoài xuống dòng | Chỉ comment, 1 dòng README, hồ sơ | `git show --stat` 3 commit | build-and-test | Met |
| NFR2 | requirements.md NFR2 | Không sửa cấu hình Git máy, không tắt Smart App Control, không cài ra ngoài | `core.autocrlf` giữ nguyên, không cài gì; **Smart App Control đang tắt tạm** (Hiệp tự tắt) | Registry `VerifiedAndReputablePolicyState = 0` | build-and-test | Not Met |
| NFR3 | requirements.md NFR3 | Không gõ hay lưu mật khẩu | Không | test-results.md §5 | build-and-test | Met |
| NFR4 | requirements.md NFR4 | `employee_db` giữ 9 phòng, 83 người | 9/83 | test-results.md §3 A30, §4 U15 | build-and-test | Met |
| COV-1 | team.md Testing Posture | ≥ 80% dòng lớp service (coverlet) | 100% / 100% / 100% | test-results.md §1 | build-and-test | Met |
| TC-SUITE | Testing Contract (bugfix) | Bộ test hiện có giữ xanh | 148/148 | test-results.md §1 | build-and-test | Met |
| TC-CI | Testing Contract | Chạy test trong CI trước khi gộp | — | Kế hoạch không chạy CI Pipeline (`ci-pipeline — SKIP`) | — | N/A |

## Sẵn sàng

- Build: sẵn sàng. Test: sẵn sàng (148/148, độ phủ đạt, API, giao diện đạt).
- Chưa đủ để coi là xong hoàn toàn: FR4.6, FR4.7 chưa kiểm (dời theo lựa chọn của Hiệp); NFR2 lệch tới khi Hiệp bật lại Smart App Control.

## Còn mở

- FR4.6, FR4.7: làm ở lượt kiểm cuối của việc sửa danh sách rà soát bàn giao (nhóm A–D).
- Bật lại Smart App Control khi xong việc.
- Thư mục thử trong `backend/TestResults/` chờ Hiệp quyết.
