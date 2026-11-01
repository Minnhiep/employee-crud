import type { ReactNode } from "react";

/** Các thuộc tính FormField truyền cho ô nhập để trình đọc màn hình đọc đủ nhãn, gợi ý và lỗi. */
export type FieldControlProps = {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
  "aria-required": boolean;
};

type FormFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  errors?: string[];
  /** Hàm vẽ ô nhập, nhận sẵn id và các thuộc tính aria cần gắn. */
  children: (controlProps: FieldControlProps) => ReactNode;
};

/**
 * Một ô nhập có nhãn, gợi ý và dòng lỗi (US4.6, WCAG 1.3.1, 3.3.2). Ví dụ:
 *   <FormField id="fullName" label="Họ tên" required errors={fieldErrors.fullName}>
 *     {(props) => <input {...props} value={...} onChange={...} />}
 *   </FormField>
 * Dùng "hàm vẽ" thay vì sao chép phần tử con để TypeScript kiểm được các thuộc tính truyền vào ô.
 */
export function FormField({
  id,
  label,
  required = false,
  hint,
  errors = [],
  children,
}: FormFieldProps) {
  const hintId = `${id}-goi-y`;
  const errorId = `${id}-loi`;
  const hasError = errors.length > 0;
  const describedBy = [hint ? hintId : null, hasError ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={hasError ? "field field--invalid" : "field"}>
      <label htmlFor={id}>
        {label}
        {required && (
          <span className="field__required" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      {hint && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
      {children({
        id,
        "aria-invalid": hasError,
        "aria-describedby": describedBy || undefined,
        "aria-required": required,
      })}
      {hasError && (
        <p className="field__error" id={errorId}>
          <span className="icon" aria-hidden="true">
            (!)
          </span>{" "}
          {errors.join(" ")}
        </p>
      )}
    </div>
  );
}
