import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router";

const APP_NAME = "Quản lý nhân sự";

// Biến cấp module: true cho tới khi trang ĐẦU TIÊN của lần tải này hiện xong. Mỗi lần tải trang (kể cả F5)
// trình duyệt chạy lại file từ đầu nên biến trở lại true. Không dựa vào location.key của React Router, vì khi F5
// trình duyệt giữ nguyên lịch sử: key cũ còn đó và trang tưởng người dùng vừa bấm chuyển trang.
let isFirstPageOfLoad = true;

/**
 * Mỗi trang gọi một lần với tên trang, rồi gắn ref trả về vào thẻ <h1 tabIndex={-1}>.
 * - Đổi tiêu đề tab trình duyệt (WCAG 2.4.2).
 * - Sau mỗi lần chuyển trang, đưa focus tới h1 để trình đọc màn hình đọc tiêu đề trang mới (WCAG 2.4.3).
 */
export function usePageTitle(title: string) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const location = useLocation();

  // Quyết định MỘT LẦN lúc trang vừa mở (hàm khởi tạo của useState chỉ chạy lần đầu).
  // Trang đầu tiên của lần tải (mở ứng dụng, F5, kể cả "/" tự chuyển sang "/employees") không đưa focus vào h1,
  // để Tab đầu tiên tới liên kết "Bỏ qua" (WCAG 2.4.1). Mọi trang mở sau đó (bấm liên kết, nút Quay lại/Tới,
  // xóa xong chuyển trang) đều đưa focus vào h1.
  // Không tính lại ở mỗi lần vẽ: trong cùng trang, Toast và nút Xóa cũng điều hướng kiểu thay thế (replace),
  // nếu tính lại thì lần tìm kiếm sau đó sẽ kéo focus khỏi ô tìm.
  const [shouldFocus] = useState(() => !isFirstPageOfLoad);

  // Đánh dấu trong effect (không trong lúc vẽ): ở chế độ StrictMode, React gọi hàm khởi tạo trên hai lần,
  // cả hai lần đều phải thấy đây là trang đầu.
  useEffect(() => {
    isFirstPageOfLoad = false;
  }, []);

  useEffect(() => {
    document.title = `${title} – ${APP_NAME}`;
    if (shouldFocus) {
      headingRef.current?.focus();
    }
    // Chỉ chạy lại khi đổi trang (đường dẫn) hoặc đổi tên trang, không chạy khi cùng trang chỉ đổi
    // state hay #hash (ví dụ Toast xóa lời báo), để không giật focus khỏi ô người dùng đang sửa.
  }, [title, location.pathname, shouldFocus]);

  return headingRef;
}
