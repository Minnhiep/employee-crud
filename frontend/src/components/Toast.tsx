import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

const HIDE_AFTER_MS = 5000;

/** Dữ liệu trang khác gửi kèm khi chuyển về trang danh sách. */
export type ToastLocationState = { message?: string } | null;

/**
 * Dòng "✓ Đã ..." ở đầu trang danh sách (US4.5), tự ẩn sau 5 giây.
 *
 * Cách dùng ở trang khác:
 *   navigate('/employees', { state: { message: 'Đã thêm nhân viên' } })
 * Sau khi xóa ngay trên trang danh sách (U3, U4):
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
    const timer = setTimeout(() => setMessage(""), HIDE_AFTER_MS);
    // Rời trang trước 5 giây thì hủy hẹn giờ.
    return () => clearTimeout(timer);
  }, [message]);

  // Vùng role="status" luôn có trong trang (rỗng khi không có lời báo),
  // để trình đọc màn hình nhận ra khi chữ được điền vào.
  return (
    <div className="alert alert--success" role="status">
      {message && (
        <>
          <span className="icon" aria-hidden="true">
            ✓
          </span>{" "}
          {message}
        </>
      )}
    </div>
  );
}
