import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Icon } from "./Icon";

const HIDE_AFTER_MS = 5000;

/**
 * Ẩn thông báo mà không làm mất vị trí của người dùng bàn phím: nếu focus đang ở trong thông báo
 * (ví dụ ở nút "Đóng thông báo"), chuyển focus về vùng nội dung chính trước khi thông báo biến mất.
 */
function moveFocusOutOf(container: HTMLElement | null) {
  if (container?.contains(document.activeElement)) {
    document.getElementById("noi-dung")?.focus();
  }
}

/** Dữ liệu trang khác gửi kèm khi chuyển về trang danh sách. */
export type ToastLocationState = { message?: string } | null;

/**
 * Thông báo thành công nổi ở góc dưới bên phải, tự ẩn sau 5 giây, có nút đóng.
 * Đặt ở góc dưới để không che nút chính ở dải đầu trang (ví dụ "Thêm phòng ban").
 *
 * Cách dùng ở trang khác:
 *   navigate('/employees', { state: { message: 'Đã thêm nhân viên' } })
 * Sau khi xóa ngay trên trang danh sách:
 *   1. gọi lại hàm tải danh sách để dòng vừa xóa biến mất;
 *   2. navigate(location.pathname + location.search, { replace: true, state: { message: 'Đã xóa ...' } })
 *      chỉ để mang lời báo. Hiệu ứng tải danh sách không được phụ thuộc location.state.
 */
export function Toast() {
  const location = useLocation();
  const navigate = useNavigate();

  const incoming = (location.state as ToastLocationState)?.message;
  const [message, setMessage] = useState(incoming ?? "");
  const [lastIncoming, setLastIncoming] = useState(incoming);
  const toastRef = useRef<HTMLDivElement>(null);

  // Có lời báo mới thì hiện ngay trong lần vẽ này (cách React khuyên, thay vì setState trong effect).
  // Ghi nhớ cả lúc lời báo về rỗng, để hai lần xóa liên tiếp cùng một câu vẫn hiện lại.
  if (incoming !== lastIncoming) {
    setLastIncoming(incoming);
    if (incoming) {
      setMessage(incoming);
    }
  }

  useEffect(() => {
    if (!incoming) {
      return;
    }
    // Xóa lời báo khỏi lịch sử trình duyệt để bấm F5 hoặc Quay lại không hiện lại.
    void navigate(location.pathname + location.search, {
      replace: true,
      state: null,
    });
  }, [incoming, navigate, location.pathname, location.search]);

  useEffect(() => {
    if (!message) {
      return;
    }
    const timer = setTimeout(() => {
      moveFocusOutOf(toastRef.current);
      setMessage("");
    }, HIDE_AFTER_MS);
    // Rời trang trước 5 giây thì hủy hẹn giờ.
    return () => clearTimeout(timer);
  }, [message]);

  // Vùng role="status" luôn có trong trang (rỗng khi không có lời báo),
  // để trình đọc màn hình nhận ra khi chữ được điền vào.
  return (
    <div className="toast-region" role="status">
      {message && (
        <div className="toast" ref={toastRef}>
          <span className="toast__icon" aria-hidden="true">
            <Icon name="checkCircle" />
          </span>
          <p className="toast__message">{message}</p>
          <button
            type="button"
            className="toast__close"
            aria-label="Đóng thông báo"
            onClick={() => {
              moveFocusOutOf(toastRef.current);
              setMessage("");
            }}
          >
            <Icon name="close" size={1.125} />
          </button>
        </div>
      )}
    </div>
  );
}
