# Truy vết cuối: kiem-cuoi-crlf

Việc không có Unit. Nguồn: `aidlc engine sensor-traceability --stage build-and-test` (09/11/2026) cộng bằng chứng chạy thật ở `test-results.md`.

**Kết luận: CHƯA ĐẠT ĐỦ.** 15/18 yêu cầu có bằng chứng đạt; FR4.6, FR4.7 chưa kiểm (Hiệp chọn dời); NFR2 lệch (Smart App Control đang tắt tạm).

Công cụ báo `pass: false` vì 10 ID (FR3.1, FR3.2, FR4.2–FR4.7, NFR3, NFR4) không có file đích ở Code Generation. Đó là yêu cầu kiểm, không phải code để viết; chúng được kiểm ở chính bước này, cột "Bằng chứng" dưới đây.

| ID | Nội dung | Làm ở | Bằng chứng | Kết quả |
|---|---|---|---|---|
| FR1.1 | `.gitattributes` `* text=auto eol=lf` | Code Generation: `.gitattributes` | `git check-attr` → `text: auto`, `eol: lf` | Đạt |
| FR1.2 | `.editorconfig` `end_of_line = lf` | Code Generation: `.editorconfig` | Dòng có trong mục `[*]` | Đạt |
| FR1.3 | Mọi file Git theo dõi là LF, `git status` không thêm file lạ | Code Generation Step 5, Step 10 | `test-results.md` §2: 0 file lệch; sau commit chỉ còn nhật ký AI-DLC | Đạt |
| FR2.1 | `verify` chạy hết chuỗi | `frontend/package.json` | `test-results.md` §1, mã thoát 0 | Đạt |
| FR3.1 | Clone mới sạch | Build and Test | §2: 821/821 LF, Prettier đạt | Đạt |
| FR3.2 | Báo thư mục thử, không tự xóa | Build and Test | §8 | Đạt |
| FR4.1 | `verify` ghi từng bước | `frontend/package.json` | §1 | Đạt |
| FR4.2 | 148 unit test | Build and Test | §1: 148/148 | Đạt |
| FR4.3 | API thật | Build and Test | §3: 30/30 | Đạt |
| FR4.4 | Giao diện trên trình duyệt | Build and Test | §4: 16/16 trên Chromium thật | Đạt |
| FR4.5 | D01–D03 | Build and Test (Hiệp, 09/11) | §5 | Đạt |
| FR4.6 | Migration trên database trống | Dời sang lượt kiểm cuối của việc sửa nhóm A–D | — | **Chưa kiểm** |
| FR4.7 | Lighthouse | Dời sang lượt kiểm cuối của việc sửa nhóm A–D | — | **Chưa kiểm** |
| FR4.8 | README mục 11 | Code Generation: `README.md` | §2: thử trên bản clone cũ có sửa dở | Đạt |
| NFR1 | Không đổi nội dung ngoài xuống dòng | Code Generation | `git show --stat`: chỉ 3 dòng comment, 1 dòng README, file hồ sơ | Đạt |
| NFR2 | Không đổi máy | — | Smart App Control đang tắt tạm (Hiệp tự tắt) | **Lệch** |
| NFR3 | Không lộ mật khẩu | Build and Test | §5 | Đạt |
| NFR4 | Dữ liệu demo giữ nguyên | Build and Test | §3 A30, §4 U15: 9/83 | Đạt |
