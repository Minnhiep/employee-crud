import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router";
import {
  ApiError,
  GENERIC_MESSAGE,
  isAborted,
  messageOf,
} from "../../api/client";
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
import { Icon } from "../../components/Icon";
import { PageHeader } from "../../components/PageHeader";
import { StatusMessage } from "../../components/StatusMessage";
import { splitErrors } from "../../components/splitErrors";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useSubmitGuard } from "../../hooks/useSubmitGuard";
import { normalizeText } from "../../utils/normalizeText";
import { validateEmployee } from "./validateEmployee";
import type { EmployeeField, EmployeeFormValues } from "./validateEmployee";

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

/**
 * Địa chỉ để quay về sau khi Lưu, Hủy, đọc từ state mà trang trước gửi kèm (không có khi gõ thẳng địa chỉ hay F5,
 * khi đó về /employees như cũ):
 * - `returnTo` từ trang chi tiết phòng ban (FR8.2): chỉ nhận đúng dạng /departments/<số>, để state lạ không đưa
 *   người dùng tới một địa chỉ tùy ý;
 * - `search`, `departmentId` từ trang danh sách đang tìm hoặc lọc (rà soát N-07, FR8.3): dựng lại bằng
 *   URLSearchParams, nên giá trị lạ chỉ thành tham số, không đổi được đường dẫn.
 */
function listPathFrom(state: unknown): string {
  if (typeof state !== "object" || state === null) {
    return "/employees";
  }
  if (
    "returnTo" in state &&
    typeof state.returnTo === "string" &&
    /^\/departments\/[1-9][0-9]*$/.test(state.returnTo)
  ) {
    return state.returnTo;
  }
  const params = new URLSearchParams();
  if ("search" in state && typeof state.search === "string" && state.search) {
    params.set("search", state.search);
  }
  if (
    "departmentId" in state &&
    typeof state.departmentId === "number" &&
    Number.isInteger(state.departmentId) &&
    state.departmentId > 0
  ) {
    params.set("departmentId", String(state.departmentId));
  }
  const query = params.toString();
  return query ? `/employees?${query}` : "/employees";
}

/** ?departmentId= của form thêm (đi từ trang chi tiết phòng ban hoặc từ danh sách đang lọc, AC6.2.3). */
function presetDepartmentIdFrom(raw: string | null): number | null {
  return raw !== null && /^[1-9][0-9]{0,8}$/.test(raw) ? Number(raw) : null;
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
  const listPath = listPathFrom(useLocation().state);
  const [searchParams] = useSearchParams();
  // Chỉ form thêm mới chọn sẵn phòng; form sửa luôn lấy phòng của nhân viên đang sửa.
  const presetDepartmentId = isEdit
    ? null
    : presetDepartmentIdFrom(searchParams.get("departmentId"));

  const params = useParams();
  const id = Number(params.id);
  // Địa chỉ như /employees/abc/edit: không phải mã hợp lệ, coi như không tìm thấy, không gọi API.
  const hasValidId = Number.isInteger(id) && id > 0;

  const [values, setValues] = useState<EmployeeFormValues>(EMPTY_VALUES);
  // Họ tên lúc mở form sửa, để mô tả ghi rõ đang sửa ai; không đổi theo lúc gõ.
  const [loadedName, setLoadedName] = useState("");
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
        setLoadedName(employee.fullName);
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
        setLoadError(messageOf(error));
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
        // Chọn sẵn phòng từ địa chỉ, chỉ khi phòng đó có thật trong danh sách và người dùng chưa tự chọn.
        // Sai hoặc không có thì để trống như thêm mới thường.
        if (
          presetDepartmentId !== null &&
          data.some((department) => department.id === presetDepartmentId)
        ) {
          setValues((current) =>
            current.departmentId === ""
              ? { ...current, departmentId: String(presetDepartmentId) }
              : current,
          );
        }
      },
      (error: unknown) => {
        if (isAborted(error)) {
          return;
        }
        setDepartmentsStatus("error");
      },
    );
    return () => controller.abort();
  }, [departmentsReloadKey, presetDepartmentId]);

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
      setSummaryMessages(hasAnyFieldError ? otherMessages : [messageOf(error)]);
    } else {
      // Lỗi mạng hoặc lỗi máy chủ.
      setSummaryMessages([messageOf(error)]);
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

    // Gửi đúng giá trị sẽ được lưu (đã gộp khoảng trắng, NFC). Đã qua validateEmployee nên không ra null.
    const request = {
      fullName: normalizeText(values.fullName) ?? values.fullName,
      email: normalizeText(values.email) ?? values.email,
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
        void navigate(listPath, { state: { message } });
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
      <PageHeader
        title={title}
        headingRef={headingRef}
        breadcrumbs={[
          { label: "Nhân sự" },
          { label: "Nhân viên", to: listPath },
          { label: isEdit ? "Sửa" : "Thêm mới" },
        ]}
        description={
          isEdit
            ? `Cập nhật thông tin ${loadedName ? `của ${loadedName}` : "nhân viên"}. Trường có dấu * là bắt buộc.`
            : "Nhập thông tin nhân viên mới. Trường có dấu * là bắt buộc."
        }
      />

      <div className="page-body">
        {(isLoading ||
          loadStatus === "not-found" ||
          loadStatus === "error") && (
          <section className="panel panel--form">
            {isLoading && (
              <StatusMessage kind="loading" message="Đang tải dữ liệu…" />
            )}
            {loadStatus === "not-found" && (
              <StatusMessage
                kind="error"
                message="Không tìm thấy nhân viên"
                description="Nhân viên có thể đã bị xóa, hoặc đường dẫn không đúng."
                action={{
                  label: "Về danh sách nhân viên",
                  to: listPath,
                  icon: "arrowLeft",
                }}
              />
            )}
            {loadStatus === "error" && (
              <StatusMessage
                kind="error"
                message="Không tải được thông tin nhân viên"
                description={loadError}
                action={{
                  label: "Thử lại",
                  onClick: retryLoad,
                  testId: "employee-retry",
                }}
              />
            )}
          </section>
        )}

        {!isLoading && loadStatus === "ready" && (
          <form
            className="panel panel--form"
            aria-labelledby="thong-tin-nhan-vien"
            noValidate
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className="panel__header">
              <h2 id="thong-tin-nhan-vien" className="panel__title">
                Thông tin nhân viên
              </h2>
            </div>

            <div className="panel__body form">
              <ErrorSummary
                ref={summaryRef}
                fieldErrors={fieldErrors}
                fieldLabels={FIELD_LABELS}
                messages={summaryMessages}
              />

              {/* Hai cột trên màn rộng (Họ tên | Email, rồi Phòng ban), một cột trên màn hẹp. */}
              <div className="form__grid">
                <FormField
                  id="fullName"
                  label="Họ tên"
                  required
                  hint="Tối đa 100 ký tự."
                  errors={fieldErrors.fullName}
                >
                  {(controlProps) => (
                    <input
                      {...controlProps}
                      type="text"
                      // Không đặt maxLength: trình duyệt sẽ cắt bớt phần dán thừa mà không báo (rà soát N-03).
                      // Để nguyên, validateEmployee báo "tối đa 100 ký tự" cạnh ô.
                      autoComplete="off"
                      placeholder="Ví dụ: Nguyễn Văn An"
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
                  hint="Không trùng với email của nhân viên khác."
                  errors={fieldErrors.email}
                >
                  {(controlProps) => (
                    <input
                      {...controlProps}
                      type="email"
                      // Không đặt maxLength, cùng lý do với ô họ tên (rà soát N-03).
                      autoComplete="off"
                      placeholder="ten@congty.vn"
                      value={values.email}
                      onChange={(event) =>
                        handleChange("email", event.target.value)
                      }
                      onBlur={() => handleBlur("email")}
                      data-testid="employee-email"
                    />
                  )}
                </FormField>

                {/* Ô chọn và dòng trạng thái nạp phòng ban nằm chung một cột, ngay dưới nhau. */}
                <div className="field-group">
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
                        // Chưa chọn thì chữ "Chọn phòng ban" màu mờ như chữ mẫu của các ô nhập khác.
                        className={
                          values.departmentId === ""
                            ? "field__control--placeholder"
                            : undefined
                        }
                        // Khóa khi đang nạp, khi nạp lỗi, hoặc khi chưa có phòng ban nào để chọn.
                        disabled={
                          departmentsStatus !== "ready" || noDepartments
                        }
                        onChange={(event) =>
                          handleChange("departmentId", event.target.value)
                        }
                        onBlur={() => handleBlur("departmentId")}
                        data-testid="employee-department"
                      >
                        {noDepartments ? (
                          <option value="">Chưa có phòng ban</option>
                        ) : (
                          <option value="">Chọn phòng ban</option>
                        )}
                        {departments.map((department) => (
                          <option
                            key={department.id}
                            value={String(department.id)}
                          >
                            {department.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </FormField>

                  {departmentsStatus === "loading" && (
                    <p className="field__hint" role="status">
                      Đang tải danh sách phòng ban…
                    </p>
                  )}
                  {departmentsStatus === "error" && (
                    <div
                      className="field__error field__error--action"
                      role="alert"
                    >
                      <Icon name="alertCircle" size={1.125} />
                      <span>Không tải được danh sách phòng ban.</span>
                      <button
                        type="button"
                        className="btn btn--sm btn--secondary"
                        onClick={retryDepartments}
                        data-testid="employee-departments-retry"
                      >
                        <Icon name="refresh" />
                        Thử lại
                      </button>
                    </div>
                  )}
                  {noDepartments && (
                    <p className="field__hint">
                      Chưa có phòng ban nào.{" "}
                      <Link to="/departments/new">Thêm phòng ban</Link> trước
                      khi thêm nhân viên.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Thứ tự chuẩn: Hủy trước, nút chính "Lưu" ở ngoài cùng bên phải. */}
            <div className="panel__footer">
              <Link
                className="btn btn--secondary"
                to={listPath}
                data-testid="employee-cancel"
              >
                Hủy
              </Link>
              <button
                type="submit"
                className="btn btn--primary"
                // Nạp phòng ban lỗi thì không cho lưu (BR4.4); đang lưu thì khóa để bấm đúp chỉ gửi một lần (BR4.8).
                disabled={isSubmitting || departmentsStatus === "error"}
                data-testid="employee-save"
              >
                {isSubmitting ? "Đang lưu…" : "Lưu nhân viên"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
