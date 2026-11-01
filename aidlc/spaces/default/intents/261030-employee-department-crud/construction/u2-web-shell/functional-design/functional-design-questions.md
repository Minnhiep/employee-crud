# Functional Design (u2-web-shell): câu hỏi

> Các điểm khác của U2 đã chốt ở Refined Mockups (Q1–Q9), Contract Design (C3) và Units Generation. Chỉ còn một điểm chưa chốt.

## Q1. Giao diện React gọi backend qua địa chỉ nào?

Bối cảnh: backend U1 có hai cổng do template tạo ra: `http://localhost:5081` (hồ sơ chạy mặc định của `dotnet run`) và `https://localhost:7205` (chỉ có khi chạy `dotnet run --launch-profile https`). Contract Design C3 ghi "cổng HTTPS thật", nhưng U1 đã bỏ chuyển hướng HTTPS để chuỗi xử lý gọn. Địa chỉ được đặt trong file `frontend/.env.development` (không phải bí mật, được commit), biến `VITE_API_BASE_URL`, để đổi được mà không sửa code.

A. `http://localhost:5081`: chạy bằng `dotnet run` bình thường, không cần chứng chỉ, dễ theo dõi bằng tab Network (khuyên dùng cho chạy trên máy)
B. `https://localhost:7205`: đúng chữ "HTTPS" trong C3, nhưng phải luôn nhớ chạy `dotnet run --launch-profile https`
C. Không gọi thẳng: Vite chuyển tiếp `/api` sang backend (proxy); trình duyệt không cần CORS, nhưng phần CORS đã làm ở U1 sẽ không được dùng tới khi chạy dev
X. Other (please specify)

[Answer]: A
