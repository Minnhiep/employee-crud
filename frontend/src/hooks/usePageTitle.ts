import { useEffect, useRef } from "react";
import { useLocation } from "react-router";

const APP_NAME = "Quản lý nhân sự";

/**
 * Mỗi trang gọi một lần với tên trang, rồi gắn ref trả về vào thẻ <h1 tabIndex={-1}>.
 * - Đổi tiêu đề tab trình duyệt (WCAG 2.4.2).
 * - Sau mỗi lần chuyển trang, đưa focus tới h1 để trình đọc màn hình đọc tiêu đề trang mới (WCAG 2.4.3).
 */
export function usePageTitle(title: string) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const location = useLocation();

  // Lần mở ứng dụng đầu tiên, React Router đặt key của địa chỉ là "default".
  // Khi đó giữ focus ở đầu trang để Tab đầu tiên tới liên kết "Bỏ qua" (WCAG 2.4.1).
  const shouldFocus = location.key !== "default";

  useEffect(() => {
    document.title = `${title} – ${APP_NAME}`;
    if (shouldFocus) {
      headingRef.current?.focus();
    }
    // Chỉ chạy lại khi đổi trang (đường dẫn), không chạy khi cùng trang chỉ đổi state hay #hash
    // (ví dụ Toast xóa lời báo), để không giật focus khỏi ô người dùng đang sửa.
  }, [title, location.pathname, shouldFocus]);

  return headingRef;
}
