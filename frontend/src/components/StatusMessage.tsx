import { Link } from "react-router";

/** Nút (onClick) hoặc liên kết (to) đi kèm lời báo, ví dụ "Thử lại", "+ Thêm phòng ban". */
export type StatusAction =
  { label: string; onClick: () => void } | { label: string; to: string };

type StatusMessageProps = {
  kind: "loading" | "error" | "empty";
  message: string;
  action?: StatusAction;
};

/**
 * Một chỗ duy nhất hiện ba trạng thái không phải dữ liệu (US4.2):
 * - kind="loading": đang tải, role="status" để trình đọc màn hình đọc nhẹ nhàng.
 * - kind="error":   lỗi, role="alert" để được đọc ngay; thường kèm nút "Thử lại".
 * - kind="empty":   danh sách rỗng, không phải lỗi; thường kèm liên kết "+ Thêm ...".
 */
export function StatusMessage({ kind, message, action }: StatusMessageProps) {
  const role =
    kind === "loading" ? "status" : kind === "error" ? "alert" : undefined;

  return (
    <div className={`status status--${kind}`} role={role}>
      {kind === "loading" && (
        <span className="status__spinner" aria-hidden="true" />
      )}
      {kind === "error" && (
        <span className="icon" aria-hidden="true">
          (!)
        </span>
      )}
      <span>{message}</span>
      {action && <StatusActionButton action={action} />}
    </div>
  );
}

function StatusActionButton({ action }: { action: StatusAction }) {
  if ("to" in action) {
    return (
      <Link className="btn btn--primary" to={action.to}>
        {action.label}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className="btn btn--secondary"
      onClick={action.onClick}
    >
      {action.label}
    </button>
  );
}
