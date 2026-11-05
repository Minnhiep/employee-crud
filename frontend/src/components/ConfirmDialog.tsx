import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

type CommonProps = {
  /** true thì mở hộp thoại, false thì đóng. Trang cha giữ state này. */
  open: boolean;
  title: string;
  /** Nội dung có ghi rõ tên mục sắp bị tác động. */
  children: ReactNode;
  /** Gọi khi bấm "Hủy"/"Đóng" hoặc nhấn Esc. */
  onCancel: () => void;
};

type ConfirmProps = CommonProps & {
  /** Hộp hỏi trước khi làm một việc không hoàn tác được (mặc định). */
  variant?: "confirm";
  /** Chữ trên nút xác nhận, nói đúng việc sẽ làm, ví dụ "Xóa nhân viên". */
  confirmLabel: string;
  /** Đang gửi yêu cầu: khóa nút để không bấm hai lần. */
  busy?: boolean;
  onConfirm: () => void;
  /** data-testid của nút xác nhận, để kiểm tự động tìm đúng nút. */
  confirmTestId?: string;
};

type NoticeProps = CommonProps & {
  /**
   * Hộp chỉ báo vì sao chưa làm được: không có nút xác nhận, chỉ có "Đóng"
   * và một hành động phụ, ví dụ liên kết "Xem 3 nhân viên".
   */
  variant: "notice";
  extraAction?: ReactNode;
};

type ConfirmDialogProps = ConfirmProps | NoticeProps;

/**
 * Hộp xác nhận trước khi xóa (WCAG 3.3.4), dùng thẻ <dialog> gốc của trình duyệt:
 * showModal() tự khóa phần trang phía sau, tự giữ focus trong hộp, nhấn Esc thì đóng.
 * Nút "Hủy" (hoặc "Đóng" ở chế độ thông báo) nhận focus đầu tiên vì an toàn hơn khi lỡ nhấn Enter.
 */
export function ConfirmDialog(props: ConfirmDialogProps) {
  const { open, title, children, onCancel } = props;
  const busy = props.variant === "notice" ? false : (props.busy ?? false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Nút đã mở hộp thoại, để trả focus về đó khi đóng (WCAG 2.4.3).
  const openerRef = useRef<Element | null>(null);
  // id riêng cho từng hộp: một trang có hai hộp (xác nhận và thông báo) thì không bị trùng id.
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      openerRef.current = document.activeElement;
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
      // Nếu mục vừa bị xóa thì nút đã mở hộp không còn; trang tự đưa focus về tiêu đề.
      if (
        openerRef.current instanceof HTMLElement &&
        openerRef.current.isConnected
      ) {
        openerRef.current.focus();
      }
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby={titleId}
      aria-describedby={messageId}
      onCancel={(event) => {
        // Nhấn Esc: để trang cha đổi state, không để trình duyệt tự đóng (giữ state và giao diện khớp nhau).
        event.preventDefault();
        if (!busy) {
          onCancel();
        }
      }}
    >
      <div className="dialog__body">
        <span
          className={
            props.variant === "notice"
              ? "dialog__icon dialog__icon--info"
              : "dialog__icon"
          }
          aria-hidden="true"
        >
          <Icon name={props.variant === "notice" ? "alertCircle" : "trash"} />
        </span>
        <div>
          <h2 id={titleId} className="dialog__title">
            {title}
          </h2>
          <div id={messageId} className="dialog__message">
            {children}
          </div>
        </div>
      </div>
      {props.variant === "notice" ? (
        <div className="dialog__actions">
          {/* showModal() tự đưa focus vào phần tử bấm được đầu tiên: chính là nút "Đóng" này. */}
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onCancel}
          >
            Đóng
          </button>
          {props.extraAction}
        </div>
      ) : (
        /*
         * Lúc đang gửi yêu cầu, hai nút dùng aria-disabled thay cho disabled: nút "disabled" bị trình duyệt
         * lấy mất focus, người dùng bàn phím và trình đọc màn hình mất vị trí trong hộp.
         * Vì nút vẫn bấm được về mặt kỹ thuật, hai hàm xử lý tự bỏ qua khi busy.
         */
        <div className="dialog__actions">
          {/* showModal() tự đưa focus vào phần tử bấm được đầu tiên: chính là nút "Hủy" này. */}
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => {
              if (!busy) {
                onCancel();
              }
            }}
            aria-disabled={busy}
          >
            Hủy
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => {
              if (!busy) {
                props.onConfirm();
              }
            }}
            aria-disabled={busy}
            data-testid={props.confirmTestId}
          >
            {busy ? "Đang xóa…" : props.confirmLabel}
          </button>
        </div>
      )}
    </dialog>
  );
}
