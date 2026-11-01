# Quy trình build và giao: u2-web-shell

> **Nguồn:** `team.md` (Way of Working Q1–Q3, Code Style Q9, Deployment Q8), `project.md` Forbidden (không CI/CD, không `npm install -g`, không tự push), `nfr-design/` của U2, quy trình của U1 (`cicd-pipeline.md` U1: bước backend giữ nguyên).
>
> **Không có CI/CD.** Hiệp tự chạy các bước sau trên máy trước mỗi commit có thay đổi frontend. Bước backend của U1 vẫn chạy như cũ khi backend có thay đổi.

## 1. Các bước trước mỗi commit (phần frontend)

Chạy trong `employee-crud/frontend/` (trừ bước 5 chạy ở thư mục gốc). Bước nào lỗi thì dừng, sửa rồi chạy lại.

1. **Cài gói** (lần đầu hoặc khi `package.json` đổi): `npm install`. Gói vào `frontend/node_modules/`, không cài toàn máy.
2. **Lint:** `npm run lint`. Đạt khi không lỗi, không cảnh báo.
3. **Định dạng:** `npm run format:check`. Nếu báo khác: `npm run format` rồi xem lại thay đổi.
4. **Build:** `npm run build`. Đạt khi build xong, không lỗi.
5. **Quét bí mật và mã nguy hiểm** (ở thư mục gốc):
   - `git grep --untracked -i -n -E "(password|pwd)\s*=" -- frontend` → 0 dòng.
   - `git grep --untracked -n -E "dangerouslySetInnerHTML|innerHTML|eval\(|new Function" -- frontend/src` → 0 dòng.
6. **Chạy thử:** `npm run dev`, mở `http://localhost:5173`: tự chuyển `/employees`, menu chuyển trang được, `/abc` ra trang 404, tab Console sạch.
7. **Xem thay đổi:** `git status`, `git diff`. Kiểm không có `node_modules/`, `dist/`. **Có** `package-lock.json` (phải commit).
8. **Commit:** Hiệp tự commit lên `main`, lời ghi chú tiếng Việt ngắn, ví dụ `Dựng khung giao diện React: menu, trang 404, component chung`.

## 2. Bảng bước → điều kiện qua

| Bước | Điều kiện qua | Nếu không qua |
|---|---|---|
| Lint | 0 lỗi, 0 cảnh báo | Sửa code |
| Định dạng | Không có thay đổi | `npm run format`, xem diff |
| Build | Xong, không lỗi | Sửa code |
| Quét | 0 dòng | Gỡ bí mật / thay cách làm |
| Chạy thử | Đủ bốn điều ở bước 6 | Sửa code |
| Xem diff | Chỉ file mong đợi, có `package-lock.json` | Bỏ file thừa |

## 3. Đo chất lượng (Build and Test, không phải mỗi commit)

1. Backend đang chạy (`dotnet run --project backend/EmployeeCrud.Api`).
2. Dừng `npm run dev`. Chạy `npm run build` rồi `npm run preview` (cổng 5173).
3. Lighthouse (Desktop) từng trang; W3C Validator cho HTML đã render; `npm audit` ghi kết quả.

## 4. "Triển khai" trên máy

Không có môi trường nào khác. Chạy thật = `npm install` + `npm run dev` trong `frontend/`, cùng lúc với backend `dotnet run` (README của U5 sẽ ghi đủ).

## 5. Quay lui khi hỏng

| Tình huống | Cách quay lui |
|---|---|
| Commit làm hỏng giao diện | `git revert <commit>` |
| Cài gói làm hỏng | `git checkout -- package.json package-lock.json` (chỉ khi chưa commit) rồi `npm install`; đã commit thì `git revert` |
| Cổng 5173 bận | Tắt chương trình đang dùng cổng đó (thường là một `npm run dev` cũ), không đổi cổng |

## 6. Bí mật trong quy trình

Frontend không có bí mật (`.env.development` chỉ có địa chỉ API). Không có CI nên không có cơ chế bí mật cho CI.

## 7. Đẩy lên GitHub

Ngoài phạm vi AI-DLC; Hiệp tự làm khi xong bài.
