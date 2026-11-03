import { Link } from "react-router";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

/**
 * Nút (onClick) hoặc liên kết (to) đi kèm lời báo, ví dụ "Thử lại", "Thêm phòng ban".
 * `icon` chọn theo nghĩa của nút: "plus" cho thêm mới, "arrowLeft" cho quay về; nút "Thử lại" mặc định "refresh".
 */
export type StatusAction =
  | { label: string; onClick: () => void; icon?: IconName; testId?: string }
  | {
      label: string;
      to: string;
      /** Gửi kèm khi chuyển trang, ví dụ bộ lọc để form quay về đúng danh sách (Loop-back 3). */
      state?: unknown;
      icon?: IconName;
      testId?: string;
    };

type StatusMessageProps = {
  kind: "loading" | "error" | "empty";
  /** Câu chính, ví dụ "Chưa có nhân viên nào". */
  message: string;
  /** Câu phụ hướng dẫn bước tiếp theo (chỉ hiện ở lỗi và trống). */
  description?: string;
  action?: StatusAction;
};

const ICONS: Record<"error" | "empty", IconName> = {
  error: "alertCircle",
  empty: "inbox",
};

/**
 * Một chỗ duy nhất hiện ba trạng thái không phải dữ liệu (US4.2), đặt trong tấm nội dung:
 * - kind="loading": đang tải, role="status" để trình đọc màn hình đọc nhẹ nhàng.
 * - kind="error":   lỗi, role="alert" để được đọc ngay; thường kèm nút "Thử lại".
 * - kind="empty":   danh sách rỗng, không phải lỗi; thường kèm nút thêm mới.
 */
export function StatusMessage({
  kind,
  message,
  description,
  action,
}: StatusMessageProps) {
  if (kind === "loading") {
    return (
      <div className="status status--loading" role="status">
        <span className="status__spinner" aria-hidden="true" />
        <span>{message}</span>
      </div>
    );
  }

  return (
    <div
      className={`status status--${kind}`}
      role={kind === "error" ? "alert" : undefined}
    >
      <span className="status__icon" aria-hidden="true">
        <Icon name={ICONS[kind]} size={1.5} />
      </span>
      <p className="status__message">{message}</p>
      {description && <p className="status__description">{description}</p>}
      {action && <StatusActionButton action={action} kind={kind} />}
    </div>
  );
}

function StatusActionButton({
  action,
  kind,
}: {
  action: StatusAction;
  kind: "error" | "empty";
}) {
  if ("to" in action) {
    return (
      <Link
        className="btn btn--primary"
        to={action.to}
        state={action.state}
        data-testid={action.testId}
      >
        {action.icon && <Icon name={action.icon} />}
        {action.label}
      </Link>
    );
  }
  const icon = action.icon ?? (kind === "error" ? "refresh" : undefined);
  return (
    <button
      type="button"
      className="btn btn--secondary"
      onClick={action.onClick}
      data-testid={action.testId}
    >
      {icon && <Icon name={icon} />}
      {action.label}
    </button>
  );
}
