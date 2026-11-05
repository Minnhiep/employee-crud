# Tóm tắt Build and Test

**Trạng thái: đạt, sẵn sàng để Hiệp xem `git diff` và commit.** Chi tiết ở `test-results.md`. Dựa trên `code-generation-plan.md`, `unit-test-instructions.md`, `code-summary.md`.

Loại test: unit test xUnit (Test Strategy Minimal, cộng hồi quy của scope bugfix). Không sinh thêm file hướng dẫn test tích hợp, hiệu năng, bảo mật vì Minimal không yêu cầu. React kiểm bằng Chromium thật.

## Target Verification Matrix

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| NFR1 | `requirements.md` | 146 test cũ đạt cùng test mới, `verify` mã thoát 0 | 148/148, mã thoát 0 | `test-results.md` §1 | build-and-test | Met |
| NFR2 | `requirements.md` | Lớp service ≥ 80% số dòng | 100% | `backend/TestResults/luot9-coverage-report/Summary.txt` | build-and-test | Met |
| NFR3 | `requirements.md` | Ngoài FR5, API giữ nguyên hành vi | Các mã đã kiểm giữ nguyên, câu lỗi không đổi | `test-results.md` §3, 148 test | build-and-test | Met |
| NFR4 | `requirements.md` | Comment tiếng Việt, nói vì sao; phần tử mới có `data-testid` | Biểu thức kiểm ra 0 dòng; rà kiến trúc đạt | `code-summary.md` | build-and-test | Met |
| NFR5 | `requirements.md` | Không thêm gói, không thêm bí mật | `package-lock.json`, `appsettings*` không đổi | `git status` | build-and-test | Met |
| TC-COVERAGE | Testing Contract, `team.md` | ≥ 80% lớp service | 100% | Như NFR2 | build-and-test | Met |
| TC-REGRESSION | Testing Contract, scope bugfix | Có test hồi quy, suite cũ xanh | 2 test mới, `BE-11` đỏ trước khi sửa | `code-summary.md` | build-and-test | Met |
| TC-CI | Testing Contract | CI trước merge | Kế hoạch không chạy CI Pipeline | the plan runs no CI Pipeline | N/A | N/A |

## Sẵn sàng

- Build: sẵn sàng.
- Test: sẵn sàng.
- Triển khai: chạy trên máy theo README, không có staging.

## Giới hạn và việc còn mở

- Breadcrumb "Phòng ban" ở form sửa luôn về danh sách, không về chi tiết như Lưu và Hủy.
- F10 kiểm kết quả hiển thị, không kiểm cơ chế gắn lại component.
- Lỗi lưu sau khi đã rời form chỉ ghi `console.error`.
- Chưa kiểm: D01–D03, migration trên database trống, Postman, Lighthouse, F02 trên database rỗng thật.
- `team.md` và `npm run coverage` vẫn dùng coverlet; Hiệp chưa quyết đổi hẳn.
