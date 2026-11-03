import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigationType } from "react-router";

const APP_NAME = "Quản lý nhân sự";

/**
 * Mỗi trang gọi một lần với tên trang, rồi gắn ref trả về vào thẻ <h1 tabIndex={-1}>.
 * - Đổi tiêu đề tab trình duyệt (WCAG 2.4.2).
 * - Sau mỗi lần chuyển trang, đưa focus tới h1 để trình đọc màn hình đọc tiêu đề trang mới (WCAG 2.4.3).
 */
export function usePageTitle(title: string) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const location = useLocation();
  const navigationType = useNavigationType();

  // Quyết định MỘT LẦN lúc trang vừa mở (hàm khởi tạo của useState chỉ chạy lần đầu), dựa vào cách
  // người dùng tới trang này. Không đưa focus vào h1 trong hai trường hợp, để Tab đầu tiên tới liên kết
  // "Bỏ qua" (WCAG 2.4.1):
  // - lần mở ứng dụng đầu tiên: React Router đặt key của địa chỉ là "default";
  // - trang tự chuyển hướng kiểu thay thế (REPLACE), ví dụ mở "/" thì tự sang "/employees":
  //   người dùng chưa bấm gì nên vẫn coi là lần mở đầu (rà soát U2, R-08).
  // Chuyển trang do người dùng bấm (PUSH) hoặc nút Quay lại/Tới (POP) thì đưa focus vào h1.
  // Không tính lại ở mỗi lần vẽ: trong cùng trang, Toast và nút Xóa cũng điều hướng kiểu REPLACE,
  // nếu tính lại thì lần tìm kiếm sau đó (PUSH) sẽ kéo focus khỏi ô tìm.
  const [shouldFocus] = useState(
    () => location.key !== "default" && navigationType !== "REPLACE",
  );

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
