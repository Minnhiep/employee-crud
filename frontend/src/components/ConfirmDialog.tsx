import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Icon } from "./Icon";

type ConfirmDialogProps = {
  /** true thì mở hộp thoại, false thì đóng. Trang cha giữ state này. */
  open: boolean;
  title: string;
  /** Nội dung có ghi rõ tên mục sắp bị tác động. */
  children: ReactNode;
  /** Chữ trên nút xác nhận, nói đúng việc sẽ làm, ví dụ "Xóa nhân viên". */
  confirmLabel: string;
  /** Đang gửi yêu cầu: khóa nút để không bấm hai lần. */
  busy?: boolean;
  onConfirm: () => void;
  /** Gọi khi bấm "Hủy" hoặc nhấn Esc. */
  onCancel: () => void;
  /** data-testid của nút xác nhận, để kiểm tự động tìm đúng nút. */
  confirmTestId?: string;
};

/**
 * Hộp xác nhận trước khi xóa (WCAG 3.3.4), dùng thẻ <dialog> gốc của trình duyệt:
 * showModal() tự khóa phần trang phía sau, tự giữ focus trong hộp, nhấn Esc thì đóng.
 * Nút "Hủy" nhận focus đầu tiên vì xóa không hoàn tác được (an toàn hơn khi lỡ nhấn Enter).
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  busy = false,
  onConfirm,
  onCancel,
  confirmTestId,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  // Nút đã mở hộp thoại, để trả focus về đó khi đóng (WCAG 2.4.3).
  const openerRef = useRef<Element | null>(null);

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
      aria-labelledby="hop-thoai-tieu-de"
      aria-describedby="hop-thoai-noi-dung"
      onCancel={(event) => {
        // Nhấn Esc: để trang cha đổi state, không để trình duyệt tự đóng (giữ state và giao diện khớp nhau).
        event.preventDefault();
        if (!busy) {
          onCancel();
        }
      }}
    >
      <div className="dialog__body">
        <span className="dialog__icon" aria-hidden="true">
          <Icon name="trash" />
        </span>
        <div>
          <h2 id="hop-thoai-tieu-de" className="dialog__title">
            {title}
          </h2>
          <div id="hop-thoai-noi-dung" className="dialog__message">
            {children}
          </div>
        </div>
      </div>
      {/*
       * Lúc đang gửi yêu cầu, hai nút dùng aria-disabled thay cho disabled: nút "disabled" bị trình duyệt
       * lấy mất focus, người dùng bàn phím và trình đọc màn hình mất vị trí trong hộp (rà soát U2, R-07).
       * Vì nút vẫn bấm được về mặt kỹ thuật, hai hàm xử lý tự bỏ qua khi busy.
       */}
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
              onConfirm();
            }
          }}
          aria-disabled={busy}
          data-testid={confirmTestId}
        >
          {busy ? "Đang xóa…" : confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
