import type { Ref } from "react";
import type { FieldErrors } from "../api/client";
import { Icon } from "./Icon";

type ErrorSummaryProps = {
  /** { tênÔ: [lời báo] }, tênÔ cũng là id của ô trên form. */
  fieldErrors?: FieldErrors;
  /** { tênÔ: 'Nhãn' } để ghi "Họ tên: Vui lòng nhập họ tên". */
  fieldLabels?: Record<string, string>;
  /** Lỗi không gắn ô (lỗi mạng, detail của API...). */
  messages?: string[];
  /** Form gọi ref.current.focus() khi bấm Lưu mà có lỗi. React 19 cho truyền ref như một prop. */
  ref?: Ref<HTMLDivElement>;
};

/** Khung tóm tắt lỗi ở đầu form (US4.1, WCAG 3.3.1); mỗi lỗi gắn ô là liên kết nhảy tới ô đó. */
export function ErrorSummary({
  fieldErrors = {},
  fieldLabels = {},
  messages = [],
  ref,
}: ErrorSummaryProps) {
  const fieldItems = Object.entries(fieldErrors).flatMap(
    ([field, fieldMessages]) =>
      fieldMessages.map((message) => ({ field, message })),
  );

  if (fieldItems.length === 0 && messages.length === 0) {
    return null;
  }

  return (
    <div className="alert alert--error" role="alert" tabIndex={-1} ref={ref}>
      <span className="alert__icon" aria-hidden="true">
        <Icon name="alertCircle" />
      </span>
      <div className="alert__content">
        <p className="alert__title">
          {fieldItems.length > 0
            ? "Chưa lưu được. Kiểm tra lại các trường sau:"
            : "Chưa lưu được."}
        </p>
        <ul className="alert__list">
          {fieldItems.map(({ field, message }) => (
            <li key={`${field}-${message}`}>
              <a
                href={`#${field}`}
                onClick={(event) => {
                  // Đưa focus thẳng vào ô lỗi, không đổi địa chỉ trang (#hash) để React Router không coi là đổi trang.
                  event.preventDefault();
                  document.getElementById(field)?.focus();
                }}
              >
                {fieldLabels[field] ? `${fieldLabels[field]}: ` : ""}
                {message}
              </a>
            </li>
          ))}
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
