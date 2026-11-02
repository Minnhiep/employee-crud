import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ApiError } from "../../api/client";
import type { FieldErrors } from "../../api/client";
import { getDepartments } from "../../api/departments";
import type { Department } from "../../api/departments";
import {
  createEmployee,
  getEmployee,
  updateEmployee,
} from "../../api/employees";
import { ErrorSummary } from "../../components/ErrorSummary";
import { FormField } from "../../components/FormField";
import { StatusMessage } from "../../components/StatusMessage";
import { splitErrors } from "../../components/splitErrors";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useSubmitGuard } from "../../hooks/useSubmitGuard";
import {
  EMAIL_MAX_LENGTH,
  FULL_NAME_MAX_LENGTH,
  validateEmployee,
} from "./validateEmployee";
import type { EmployeeField, EmployeeFormValues } from "./validateEmployee";

const GENERIC_MESSAGE = "Đã có lỗi xảy ra, vui lòng thử lại sau.";
const FIELD_NAMES = ["fullName", "email", "departmentId"] as const;
const FIELD_LABELS = {
  fullName: "Họ tên",
  email: "Email",
  departmentId: "Phòng ban",
};
const EMPTY_VALUES: EmployeeFormValues = {
  fullName: "",
  email: "",
  departmentId: "",
};

type LoadStatus = "loading" | "ready" | "not-found" | "error";
type DepartmentsStatus = "loading" | "ready" | "error";

type EmployeeFormPageProps = {
  mode: "create" | "edit";
};

function isAborted(error: unknown): boolean {
  return error instanceof ApiError && error.kind === "aborted";
}

/** Đặt (hoặc bỏ) lỗi của đúng một ô, giữ nguyên lỗi các ô khác. */
function withFieldError(
  current: FieldErrors,
  field: EmployeeField,
  messages: string[] | undefined,
): FieldErrors {
  const next = { ...current };
  if (messages && messages.length > 0) {
    next[field] = messages;
  } else {
    delete next[field];
  }
  return next;
}

/**
 * Form thêm và sửa nhân viên (US2.2, US2.3).
 * Kiểm trên trình duyệt như API (BR4.3), ô Phòng ban nạp từ API (BR4.4), khóa nút Lưu khi chờ (BR4.8),
 * lưu xong về danh sách kèm lời báo (BR4.6).
 */
export function EmployeeFormPage({ mode }: EmployeeFormPageProps) {
  const isEdit = mode === "edit";
  const title = isEdit ? "Sửa nhân viên" : "Thêm nhân viên";
  const headingRef = usePageTitle(title);
  const navigate = useNavigate();
  const { isSubmitting, run } = useSubmitGuard();

  const params = useParams();
  const id = Number(params.id);
  // Địa chỉ như /employees/abc/edit: không phải mã hợp lệ, coi như không tìm thấy, không gọi API.
  const hasValidId = Number.isInteger(id) && id > 0;

  const [values, setValues] = useState<EmployeeFormValues>(EMPTY_VALUES);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>(() =>
    !isEdit ? "ready" : hasValidId ? "loading" : "not-found",
  );
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsStatus, setDepartmentsStatus] =
    useState<DepartmentsStatus>("loading");
  const [departmentsReloadKey, setDepartmentsReloadKey] = useState(0);

  const [touched, setTouched] = useState<Record<EmployeeField, boolean>>({
    fullName: false,
    email: false,
    departmentId: false,
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [summaryMessages, setSummaryMessages] = useState<string[]>([]);

  const summaryRef = useRef<HTMLDivElement>(null);
  // Tăng số này để đưa focus vào khung tóm tắt lỗi SAU khi khung đã được vẽ.
  const [summaryFocusRequest, setSummaryFocusRequest] = useState(0);

  useEffect(() => {
    if (summaryFocusRequest > 0) {
      summaryRef.current?.focus();
    }
  }, [summaryFocusRequest]);

  // Chế độ sửa: tải nhân viên để điền sẵn ba ô (BR4.5). Chạy song song với việc nạp phòng ban bên dưới,
  // nên thời gian chờ bằng lời gọi lâu hơn chứ không phải tổng hai lời gọi (NFR5.5).
  useEffect(() => {
    if (!isEdit || !hasValidId) {
      return;
    }
    const controller = new AbortController();
    getEmployee(id, { signal: controller.signal }).then(
      (employee) => {
        setValues({
          fullName: employee.fullName,
          email: employee.email,
          departmentId: String(employee.departmentId),
        });
        setLoadStatus("ready");
      },
      (error: unknown) => {
        if (isAborted(error)) {
          return;
        }
        if (error instanceof ApiError && error.status === 404) {
          setLoadStatus("not-found");
          return;
        }
        setLoadError(
          error instanceof ApiError ? error.message : GENERIC_MESSAGE,
        );
        setLoadStatus("error");
      },
    );
    return () => controller.abort();
  }, [isEdit, hasValidId, id, reloadKey]);

  // Nạp danh sách phòng ban cho ô chọn (BR4.4), dùng API của U3.
  useEffect(() => {
    const controller = new AbortController();
    getDepartments({ signal: controller.signal }).then(
      (data) => {
        setDepartments(data);
        setDepartmentsStatus("ready");
      },
      (error: unknown) => {
        if (isAborted(error)) {
          return;
        }
        setDepartmentsStatus("error");
      },
    );
    return () => controller.abort();
  }, [departmentsReloadKey]);

  function retryLoad() {
    setLoadStatus("loading");
    setReloadKey((key) => key + 1);
  }

  function retryDepartments() {
    setDepartmentsStatus("loading");
    setDepartmentsReloadKey((key) => key + 1);
  }

  function handleChange(field: EmployeeField, value: string) {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    // Đã rời ô một lần thì kiểm lại ô đó ngay khi gõ, để lỗi biến mất khi đã sửa đúng
    // (kể cả lỗi của API như "Email đã được sử dụng": người dùng đã sửa ô thì bỏ lỗi cũ).
    if (touched[field]) {
      setFieldErrors((current) =>
        withFieldError(current, field, validateEmployee(nextValues)[field]),
      );
    }
  }

  function handleBlur(field: EmployeeField) {
    setTouched((current) => ({ ...current, [field]: true }));
    const localError = validateEmployee(values)[field];
    // Chỉ thay lỗi khi kiểm trên trình duyệt thấy sai. Lỗi của API (ví dụ "Email đã được sử dụng") được giữ tới khi
    // người dùng sửa ô. Vì sao (bài học U3): lưu lỗi thì focus chuyển sang khung tóm tắt, ô bị blur;
    // nếu xóa lỗi ở đây thì lỗi API vừa nhận biến mất ngay và người dùng không thấy gì.
    if (localError) {
      setFieldErrors((current) => withFieldError(current, field, localError));
    }
  }

  function showSaveError(error: unknown) {
    if (isAborted(error)) {
      return;
    }
    if (!(error instanceof ApiError)) {
      setSummaryMessages([GENERIC_MESSAGE]);
    } else if (error.status === 404) {
      setSummaryMessages(["Không tìm thấy nhân viên, có thể đã bị xóa"]);
    } else if (error.kind === "client") {
      // 400/409: lỗi theo khóa fullName, email, departmentId hiện cạnh ô; lỗi khác ở khung tóm tắt.
      const { fieldErrors: apiFieldErrors, otherMessages } = splitErrors(
        error.errors,
        FIELD_NAMES,
      );
      setFieldErrors(apiFieldErrors);
      const hasAnyFieldError = Object.keys(error.errors).length > 0;
      setSummaryMessages(
        hasAnyFieldError ? otherMessages : [error.message || GENERIC_MESSAGE],
      );
    } else {
      // Lỗi mạng hoặc lỗi máy chủ.
      setSummaryMessages([error.message || GENERIC_MESSAGE]);
    }
    setSummaryFocusRequest((request) => request + 1);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({ fullName: true, email: true, departmentId: true });
    setSummaryMessages([]);

    const errors = validateEmployee(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      // Có lỗi thì không gửi request; đưa focus vào khung tóm tắt (AC4.1.1).
      setSummaryFocusRequest((request) => request + 1);
      return;
    }

    const request = {
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      departmentId: Number(values.departmentId),
    };
    await run(async () => {
      try {
        const saved = isEdit
          ? await updateEmployee(id, request)
          : await createEmployee(request);
        const message = isEdit
          ? `Đã cập nhật nhân viên "${saved.fullName}"`
          : `Đã thêm nhân viên "${saved.fullName}"`;
        void navigate("/employees", { state: { message } });
      } catch (error) {
        showSaveError(error);
      }
    });
  }

  // Sửa: chờ cả nhân viên lẫn phòng ban xong mới hiện form (để ô Phòng ban chọn sẵn đúng phòng).
  const isLoading =
    loadStatus === "loading" || (isEdit && departmentsStatus === "loading");
  const noDepartments =
    departmentsStatus === "ready" && departments.length === 0;

  return (
    <>
      <h1 ref={headingRef} tabIndex={-1}>
        {title}
      </h1>

      {isLoading && <StatusMessage kind="loading" message="Đang tải..." />}
      {loadStatus === "not-found" && (
        <StatusMessage
          kind="error"
          message="Không tìm thấy nhân viên"
          action={{ label: "Về danh sách nhân viên", to: "/employees" }}
        />
      )}
      {loadStatus === "error" && (
        <>
          <StatusMessage kind="error" message={loadError} />
          <button
            type="button"
            className="btn btn--secondary"
            onClick={retryLoad}
            data-testid="employee-retry"
          >
            Thử lại
          </button>
        </>
      )}

      {!isLoading && loadStatus === "ready" && (
        <form
          className="form"
          noValidate
          onSubmit={(event) => void handleSubmit(event)}
        >
          <ErrorSummary
            ref={summaryRef}
            fieldErrors={fieldErrors}
            fieldLabels={FIELD_LABELS}
            messages={summaryMessages}
          />

          <p className="form__note">(* là ô bắt buộc)</p>

          <FormField
            id="fullName"
            label="Họ tên"
            required
            hint="Tối đa 100 ký tự"
            errors={fieldErrors.fullName}
          >
            {(controlProps) => (
              <input
                {...controlProps}
                type="text"
                maxLength={FULL_NAME_MAX_LENGTH}
                autoComplete="off"
                value={values.fullName}
                onChange={(event) =>
                  handleChange("fullName", event.target.value)
                }
                onBlur={() => handleBlur("fullName")}
                data-testid="employee-full-name"
              />
            )}
          </FormField>

          <FormField
            id="email"
            label="Email"
            required
            hint="Ví dụ: ten@congty.vn"
            errors={fieldErrors.email}
          >
            {(controlProps) => (
              <input
                {...controlProps}
                type="email"
                maxLength={EMAIL_MAX_LENGTH}
                autoComplete="off"
                value={values.email}
                onChange={(event) => handleChange("email", event.target.value)}
                onBlur={() => handleBlur("email")}
                data-testid="employee-email"
              />
            )}
          </FormField>

          <FormField
            id="departmentId"
            label="Phòng ban"
            required
            errors={fieldErrors.departmentId}
          >
            {(controlProps) => (
              <select
                {...controlProps}
                value={values.departmentId}
                // Khóa khi đang nạp, khi nạp lỗi, hoặc khi chưa có phòng ban nào để chọn.
                disabled={departmentsStatus !== "ready" || noDepartments}
                onChange={(event) =>
                  handleChange("departmentId", event.target.value)
                }
                onBlur={() => handleBlur("departmentId")}
                data-testid="employee-department"
              >
                {noDepartments ? (
                  <option value="">-- Chưa có phòng ban --</option>
                ) : (
                  <option value="">-- Chọn phòng ban --</option>
                )}
                {departments.map((department) => (
                  <option key={department.id} value={String(department.id)}>
                    {department.name}
                  </option>
                ))}
              </select>
            )}
          </FormField>

          {departmentsStatus === "loading" && (
            <p className="field__hint" role="status">
              Đang tải danh sách phòng ban...
            </p>
          )}
          {departmentsStatus === "error" && (
            <div className="field__error" role="alert">
              <span className="icon" aria-hidden="true">
                (!)
              </span>{" "}
              Không tải được danh sách phòng ban.{" "}
              <button
                type="button"
                className="btn btn--secondary"
                onClick={retryDepartments}
                data-testid="employee-departments-retry"
              >
                Thử lại
              </button>
            </div>
          )}
          {noDepartments && (
            <p className="field__hint">
              Chưa có phòng ban nào. Hãy thêm phòng ban trước.{" "}
              <Link to="/departments/new">Thêm phòng ban</Link>
            </p>
          )}

          <div className="form__actions">
            <button
              type="submit"
              className="btn btn--primary"
              // Nạp phòng ban lỗi thì không cho lưu (BR4.4); đang lưu thì khóa để bấm đúp chỉ gửi một lần (BR4.8).
              disabled={isSubmitting || departmentsStatus === "error"}
              data-testid="employee-save"
            >
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </button>
            <Link
              className="btn btn--secondary"
              to="/employees"
              data-testid="employee-cancel"
            >
              Hủy
            </Link>
          </div>
        </form>
      )}
    </>
  );
}
