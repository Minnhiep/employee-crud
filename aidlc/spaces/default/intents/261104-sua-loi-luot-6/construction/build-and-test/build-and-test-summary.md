# Tóm tắt Build and Test

**Trạng thái: đạt, sẵn sàng để Hiệp xem `git diff` và commit.** Chi tiết ở `test-results.md`. Dựa trên `code-generation-plan.md`, `unit-test-instructions.md`, `code-summary.md`.

Loại test: unit test xUnit (Test Strategy Minimal, cộng hồi quy của scope bugfix). Không sinh thêm file hướng dẫn test tích hợp, hiệu năng, bảo mật vì Minimal không yêu cầu. React kiểm bằng Chromium thật.

## Target Verification Matrix

| Target ID | Source | Expected | Actual | Evidence | Owning Stage | Verdict |
|---|---|---|---|---|---|---|
| NFR1 | `requirements.md` | Test cũ vẫn đạt, `verify` mã thoát 0 | 146/146, mã thoát 0 | `test-results.md` §1 | build-and-test | Met |
| NFR2 | `requirements.md` | Lớp service ≥ 80% số dòng | 100% | `backend/TestResults/luot7-coverage-report/Summary.txt` | build-and-test | Met |
| NFR3 | `requirements.md` | Ngoài FR1, API giữ nguyên hành vi | Mã trạng thái đã kiểm giữ nguyên | `test-results.md` §3, 146 test | build-and-test | Met |
| NFR4 | `requirements.md` | Comment mới tiếng Việt, nói vì sao | Đạt khi rà diff | Rà kiến trúc ở Code Generation | build-and-test | Met |
| NFR5 | `requirements.md` | Không thêm bí mật, không thêm gói | `package-lock.json`, `appsettings*` không đổi | `git status` | build-and-test | Met |
| TC-COVERAGE | Testing Contract, `team.md` | ≥ 80% lớp service | 100% | Như NFR2 | build-and-test | Met |
| TC-REGRESSION | Testing Contract, scope bugfix | Có test hồi quy, suite cũ xanh | 8 method mới, đã kiểm chiều âm | `code-summary.md` | build-and-test | Met |
| TC-CI | Testing Contract | CI trước merge | Kế hoạch không chạy CI Pipeline | the plan runs no CI Pipeline | N/A | N/A |

## Sẵn sàng

- Build: sẵn sàng.
- Test: sẵn sàng.
- Triển khai: chạy trên máy theo README, không có staging.

## Giới hạn và việc còn mở

- Lưu lỗi sau khi đã rời form bằng menu hoặc nút Back: người dùng không thấy báo lỗi, chỉ có `console.error`.
- Màu sau khi dọn CSS được xem bằng mắt và đo một số màu, không so từng điểm ảnh với ảnh trước.
- `team.md` và `npm run coverage` vẫn dùng coverlet, bị chặn trên máy này; Hiệp chưa quyết đổi hẳn.
- 5 góp ý Minor ở Code Generation Hiệp đã chấp nhận; R-02 đã có bằng chứng ở đây: 0 bản ghi chứa noncharacter.
