# Thiết kế bảo mật — U5 `u5-handover`

> **Nguồn:** `construction/u5-handover/nfr-requirements/security-requirements.md` (NFR2.1–NFR2.4, NFR7.1), `construction/u5-handover/nfr-requirements/tech-stack-decisions.md` (PowerShell, Postman, pgAdmin, git clone), `construction/u5-handover/functional-design/functional-spec.md` (WF1–WF4, mục 7), `inception/contract-design/contract-summary.md` (C3: CORS và phong bì lỗi), quyết định "Gọn NFR Design, bỏ Infra" của Hiệp.
>
> File này nói **cách làm** để các yêu cầu bảo mật của U5 thành sự thật lúc sinh tài liệu (Code Generation) và lúc đối chiếu. U5 không có code, nên mọi biện pháp là bước làm và bước kiểm, không phải thành phần phần mềm.

## S1. Không lộ mật khẩu (NFR2.1)

Mật khẩu có thể lọt theo ba đường; mỗi đường một lớp chặn:

| Đường lọt | Lớp chặn | Ai làm, khi nào |
|---|---|---|
| Tài liệu mới viết chứa mật khẩu | Ví dụ connection string chỉ dùng chữ giữ chỗ `<mật-khẩu-của-bạn>`; README chỉ lệnh đặt user-secrets | AI, lúc viết (BR1.3) |
| File cấu hình bị commit | `.gitignore` phải loại `bin/`, `obj/`, `node_modules/`, `dist/`, `.env`; `appsettings*.json` không có giá trị `Password=` thật | AI kiểm bằng đọc file, trước bước Hiệp commit |
| Lịch sử commit cũ (U1–U4) từng chứa mật khẩu rồi xóa | Quét cả lịch sử, không chỉ bản hiện tại: `git log -p -S"<chuỗi>" --all` | **Hiệp tự gõ** chuỗi mật khẩu vào lệnh (AI không biết và không ghi mật khẩu), trước khi đẩy lên GitHub |

- `git grep "<chuỗi>"` chỉ quét bản hiện tại; `git log -S` quét mọi commit. Cả hai phải ra rỗng.
- Nếu thấy mật khẩu trong lịch sử: dừng, không đẩy lên GitHub, báo lại để chọn cách xử lý (đổi mật khẩu PostgreSQL là cách đơn giản nhất; viết lại lịch sử là việc lớn, cần Hiệp quyết).
- README hướng dẫn người cài **không** dán mật khẩu vào `appsettings.json`.

## S2. Dữ liệu mẫu là dữ liệu giả (NFR2.2)

- Bản ghi tạo ra để lấy JSON mẫu (WF3) dùng tên rõ là mẫu và miền email giả, ví dụ `Nguyễn Văn Mẫu`, `mau.nguyen@example.com`.
- Với `GET` danh sách: chỉ chép vào tài liệu các phần tử là dữ liệu mẫu (phòng ban mẫu của migration, bản ghi mẫu vừa tạo); phần tử khác thì cắt bớt và ghi "…" để người đọc biết danh sách dài hơn.
- Nhân viên "Đỗ Văn An" đang có trong database là dữ liệu thử do Hiệp nhập lúc làm U4; nếu xuất hiện trong ví dụ thì vẫn là dữ liệu giả, không phải người thật.
- Ghi chú trong danh sách API: "id trên máy bạn có thể khác".

## S3. Không lộ thông tin máy trong body lỗi (NFR2.3)

- Chỉ chép body ProblemDetails theo đúng C3 (`type`, `title`, `status`, `detail`, `errors` nếu có). Nếu body thật có trường lộ thông tin máy (đường dẫn ổ đĩa, stack trace, tên máy), không chép, và ghi đó là lệch so với C3 để Build and Test xử lý (BR4.1).
- Không chép header dư thừa; chỉ `Content-Type` và `Location` (khi 201).

## S4. Thử ràng buộc không làm hỏng dữ liệu (NFR2.4)

| Ca thử | Dòng mồi | Cách làm | Dọn dẹp |
|---|---|---|---|
| Email trùng khác hoa thường | Dùng một nhân viên **đã có sẵn**, không chèn dòng mồi mới | Chèn một nhân viên có email là email đó viết hoa → PostgreSQL báo vi phạm chỉ mục không trùng | Không cần: lệnh chèn bị từ chối nên không có dòng nào được thêm |
| Xóa phòng ban còn nhân viên | Dùng phòng ban đang có nhân viên | Xóa phòng ban đó → PostgreSQL báo vi phạm khóa ngoại | Không cần: lệnh xóa bị từ chối |

- Hai ca đều là lệnh **bị từ chối**, nên database không đổi. Kiểm lại bằng cách đếm số phòng ban và nhân viên trước và sau khi thử, phải bằng nhau.
- Không dùng lệnh đổi cấu trúc (`DROP`, `ALTER`) trong mục thử.
- Hiệp chạy câu lệnh trong pgAdmin (AI không gõ mật khẩu database).

## S5. Địa chỉ đúng với CORS (NFR7.1)

- Địa chỉ frontend trong README lấy từ cấu hình Vite; địa chỉ API lấy từ biến địa chỉ API của frontend và cấu hình chạy của backend (BR1.5).
- So với danh sách nguồn được phép trong cấu hình CORS của backend; khác nhau thì ghi lệch, không sửa code trong U5.
- Mục "Sự cố thường gặp" nếu có lỗi CORS thì chỉ cách chạy frontend đúng địa chỉ, **không** hướng dẫn mở CORS cho mọi nguồn.

## Giới hạn đã biết

- Bản clone trên cùng máy dùng lại user-secrets và database có sẵn, nên bước "đặt user-secrets lần đầu" và "tạo database mới" chỉ kiểm được bằng cách đọc lệnh, không chạy từ đầu. Kết quả đối chiếu ghi rõ điều này (BR4.3).

## Change Request 03/11/2026 (FR8)

Đã rà theo FR8. File SQL dùng WHERE NOT EXISTS (lower(name)) cho phòng ban (cùng biểu thức với chỉ mục ux_departments_name) và ON CONFLICT DO NOTHING cho email; JOIN theo tên phòng không phân biệt hoa thường; chữ ở dạng NFC, không ký tự lạ (SQL không đi qua bước chuẩn hóa của API). Khối xóa bọc BEGIN/COMMIT.
