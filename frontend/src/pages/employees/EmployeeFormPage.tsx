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
import { parseId } from "../../utils/parseId";
import { FULL_NAME_MAX_LENGTH, validateEmployee } from "./validateEmployee";
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

const DEPARTMENT_PATH_PREFIX = "/departments/";

type LoadStatus = "loading" | "ready" | "not-found" | "error";
// "reloading": nạp lại khi form đã hiện, khác "loading" ở chỗ không được gỡ form khỏi màn hình.
type DepartmentsStatus = "loading" | "reloading" | "ready" | "error";

type EmployeeFormPageProps = {
  mode: "create" | "edit";
};

/**
 * Địa chỉ để quay về sau khi Lưu, Hủy, đọc từ state mà trang trước gửi kèm (không có khi gõ thẳng địa chỉ,
 * khi đó về /employees):
 * - `returnTo` từ trang chi tiết phòng ban: chỉ nhận đúng dạng /departments/<số>, để state lạ không đưa
 *   người dùng tới một địa chỉ tùy ý;
 * - `search`, `departmentId` từ trang danh sách đang tìm hoặc lọc: dựng lại bằng
 *   URLSearchParams, nên giá trị lạ chỉ thành tham số, không đổi được đường dẫn.
 */
function listPathFrom(state: unknown): string {
  if (typeof state !== "object" || state === null) {
    return "/employees";
  }
  if (
    "returnTo" in state &&
    typeof state.returnTo === "string" &&
    state.returnTo.startsWith(DEPARTMENT_PATH_PREFIX) &&
    parseId(state.returnTo.slice(DEPARTMENT_PATH_PREFIX.length)) !== null
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
 * Form thêm và sửa nhân viên.
 * Kiểm trên trình duyệt như API, ô Phòng ban nạp từ API, khóa nút Lưu khi chờ,
 * lưu xong quay về kèm lời báo.
 */
export function EmployeeFormPage({ mode }: EmployeeFormPageProps) {
  const isEdit = mode === "edit";
  const navigate = useNavigate();
  const { isSubmitting, run } = useSubmitGuard();
  const listPath = listPathFrom(useLocation().state);
  const [searchParams] = useSearchParams();
  // ?departmentId= khi đi từ trang chi tiết phòng ban hoặc danh sách đang lọc.
  // Chỉ form thêm mới chọn sẵn phòng; form sửa luôn lấy phòng của nhân viên đang sửa.
  const presetDepartmentId = isEdit
    ? null
    : parseId(searchParams.get("departmentId"));

  const params = useParams();
  // Địa chỉ như /employees/abc/edit: không phải mã hợp lệ, coi như không tìm thấy, không gọi API.
  const parsedId = parseId(params.id);
  const hasValidId = parsedId !== null;
  const id = parsedId ?? 0;

  const [values, setValues] = useState<EmployeeFormValues>(EMPTY_VALUES);
  // Họ tên lúc mở form sửa, để mô tả ghi rõ đang sửa ai; không đổi theo lúc gõ.
  const [loadedName, setLoadedName] = useState("");
  const [loadStatus, setLoadStatus] = useState<LoadStatus>(() =>
    !isEdit ? "ready" : hasValidId ? "loading" : "not-found",
  );
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const baseTitle = isEdit ? "Sửa nhân viên" : "Thêm nhân viên";
  const title =
    loadStatus === "not-found" ? "Không tìm thấy nhân viên" : baseTitle;
  const headingRef = usePageTitle(title);
  // Tăng số này để đưa focus về tiêu đề SAU khi trang đã vẽ lại (ví dụ sau khi bấm "Thử lại").
  const [headingFocusRequest, setHeadingFocusRequest] = useState(0);

  useEffect(() => {
    if (headingFocusRequest > 0) {
      headingRef.current?.focus();
    }
  }, [headingFocusRequest, headingRef]);

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
  // Đã bấm Lưu ít nhất một lần. Khung tóm tắt lỗi ("Chưa lưu được…", role="alert") chỉ hiện từ lúc đó: trước khi
  // bấm Lưu, câu "Chưa lưu được" là sai sự thật, và trình đọc màn hình bị ngắt mỗi lần rời một ô trống.
  // Lỗi khi rời ô chỉ hiện ngay dưới ô (theo mẫu "error summary" của GOV.UK).
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const summaryRef = useRef<HTMLDivElement>(null);
  // Tăng số này để đưa focus vào khung tóm tắt lỗi SAU khi khung đã được vẽ.
  const [summaryFocusRequest, setSummaryFocusRequest] = useState(0);

  useEffect(() => {
    if (summaryFocusRequest > 0) {
      summaryRef.current?.focus();
    }
  }, [summaryFocusRequest]);

  // Đánh dấu form đã rời trang, để lời gọi lưu đang chờ biết không được chuyển trang nữa.
  // Đặt lại false khi gắn vì StrictMode gắn, gỡ rồi gắn lại form một lần lúc phát triển.
  const hasLeftFormRef = useRef(false);
  useEffect(() => {
    hasLeftFormRef.current = false;
    return () => {
      hasLeftFormRef.current = true;
    };
  }, []);

  // Chế độ sửa: tải nhân viên để điền sẵn ba ô. Chạy song song với việc nạp phòng ban bên dưới,
  // nên thời gian chờ bằng lời gọi lâu hơn chứ không phải tổng hai lời gọi.
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

  // Nạp danh sách phòng ban cho ô chọn.
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
        // Phòng đang chọn không còn thì bỏ chọn: nếu giữ, ô hiện dòng đầu nhưng bấm Lưu vẫn gửi mã phòng đã mất.
        // Đặt sau bước chọn sẵn để không tự chọn thay người dùng một phòng khác.
        setValues((current) =>
          current.departmentId === "" ||
          data.some(
            (department) => String(department.id) === current.departmentId,
          )
            ? current
            : { ...current, departmentId: "" },
        );
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

  // Hai nút "Thử lại" biến mất ngay khi bấm (trang chuyển sang "đang tải"), focus sẽ rơi về body:
  // đưa focus về tiêu đề để người dùng bàn phím không mất vị trí.
  function retryLoad() {
    setLoadStatus("loading");
    setReloadKey((key) => key + 1);
    setHeadingFocusRequest((request) => request + 1);
  }

  function reloadDepartments() {
    setDepartmentsStatus("reloading");
    setDepartmentsReloadKey((key) => key + 1);
  }

  function retryDepartments() {
    reloadDepartments();
    setHeadingFocusRequest((request) => request + 1);
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
    // người dùng sửa ô. Vì sao: lưu lỗi thì focus chuyển sang khung tóm tắt, ô bị blur;
    // nếu xóa lỗi ở đây thì lỗi API vừa nhận biến mất ngay và người dùng không thấy gì.
    if (localError) {
      setFieldErrors((current) => withFieldError(current, field, localError));
    }
  }

  function showSaveError(error: unknown) {
    if (isAborted(error)) {
      return;
    }
    setSubmitAttempted(true);
    if (!(error instanceof ApiError)) {
      setSummaryMessages([GENERIC_MESSAGE]);
    } else if (error.status === 404) {
      setSummaryMessages(["Không tìm thấy nhân viên, có thể đã bị xóa."]);
    } else if (error.kind === "client") {
      // 400/409: lỗi theo khóa fullName, email, departmentId hiện cạnh ô; lỗi khác ở khung tóm tắt.
      const { fieldErrors: apiFieldErrors, otherMessages } = splitErrors(
        error.errors,
        FIELD_NAMES,
      );
      setFieldErrors(apiFieldErrors);
      const hasAnyFieldError = Object.keys(error.errors).length > 0;
      setSummaryMessages(hasAnyFieldError ? otherMessages : [messageOf(error)]);
      // API chê phòng ban nghĩa là danh sách trên form có thể đã cũ: nạp lại để chọn được ngay, không cần tải lại trang.
      // Nhận biết theo khóa, không theo câu chữ, để sửa lời báo ở API không làm hỏng chỗ này.
      if ("departmentId" in error.errors) {
        reloadDepartments();
      }
    } else {
      // Lỗi mạng hoặc lỗi máy chủ.
      setSummaryMessages([messageOf(error)]);
    }
    setSummaryFocusRequest((request) => request + 1);
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    // Nút Lưu khóa bằng aria-disabled nên vẫn bấm được (Enter trong ô cũng gửi form): tự bỏ qua khi đang khóa.
    if (isSaveLocked) {
      return;
    }
    setSubmitAttempted(true);
    setTouched({ fullName: true, email: true, departmentId: true });
    setSummaryMessages([]);

    const errors = validateEmployee(values);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      // Có lỗi thì không gửi request; đưa focus vào khung tóm tắt.
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
        // Đã rời form bằng menu hoặc nút Back: bản ghi đã lưu, không kéo người dùng khỏi trang đang xem.
        if (hasLeftFormRef.current) {
          return;
        }
        const message = isEdit
          ? `Đã cập nhật nhân viên "${saved.fullName}"`
          : `Đã thêm nhân viên "${saved.fullName}"`;
        void navigate(listPath, { state: { message } });
      } catch (error) {
        // Form không còn trên màn hình để hiện lỗi, và ứng dụng không có vùng thông báo chung: chỉ ghi lại.
        if (hasLeftFormRef.current) {
          console.error("Không lưu được nhân viên sau khi đã rời form", error);
          return;
        }
        showSaveError(error);
      }
    });
  }

  // Sửa: chờ cả nhân viên lẫn phòng ban xong mới hiện form (để ô Phòng ban chọn sẵn đúng phòng).
  // Đã biết không có nhân viên để sửa thì thôi chờ phòng ban, để trang chỉ hiện đúng một trạng thái.
  const isLoading =
    loadStatus === "loading" ||
    (loadStatus === "ready" && isEdit && departmentsStatus === "loading");
  const noDepartments =
    departmentsStatus === "ready" && departments.length === 0;
  // Khóa nút Lưu khi: đang lưu (bấm đúp chỉ gửi một lần); danh sách phòng ban đang nạp, nạp lại hoặc nạp lỗi
  // (chưa biết phòng đã chọn còn không; bấm Lưu lúc đang nạp sẽ bị báo nhầm "Vui lòng chọn phòng ban").
  const isSaveLocked = isSubmitting || departmentsStatus !== "ready";

  // Câu về trường bắt buộc chỉ có nghĩa khi form hiện trên trang.
  let description: string | undefined;
  if (loadStatus === "error") {
    description = "Cập nhật thông tin nhân viên.";
  } else if (loadStatus !== "not-found") {
    description = isEdit
      ? `Cập nhật thông tin ${loadedName ? `của ${loadedName}` : "nhân viên"}. Trường có dấu * là bắt buộc.`
      : "Nhập thông tin nhân viên mới. Trường có dấu * là bắt buộc.";
  }

  return (
    <>
      <PageHeader
        title={title}
        headingRef={headingRef}
        breadcrumbs={[
          { label: "Trang chủ", to: "/", disabled: isSubmitting },
          { label: "Nhân viên", to: listPath, disabled: isSubmitting },
          { label: isEdit ? "Sửa" : "Thêm mới" },
        ]}
        description={description}
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
              {submitAttempted && (
                <ErrorSummary
                  ref={summaryRef}
                  fieldErrors={fieldErrors}
                  fieldLabels={FIELD_LABELS}
                  messages={summaryMessages}
                />
              )}

              {/* Hai cột trên màn rộng (Họ tên | Email, rồi Phòng ban), một cột trên màn hẹp. */}
              <div className="form__grid">
                <FormField
                  id="fullName"
                  label="Họ tên"
                  required
                  hint={`Tối đa ${FULL_NAME_MAX_LENGTH} ký tự.`}
                  errors={fieldErrors.fullName}
                >
                  {(controlProps) => (
                    <input
                      {...controlProps}
                      type="text"
                      // Không đặt maxLength: trình duyệt sẽ cắt bớt phần dán thừa mà không báo.
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
                      // type="text" chứ không "email": với type="email", Chrome tự đổi tên miền có dấu sang dạng
                      // punycode (gõ a@bücher.vn thì giá trị thành a@xn--bcher-kva.vn), dữ liệu lưu khác chữ người gõ.
                      // inputMode="email" vẫn mở bàn phím email trên điện thoại; tắt tự viết hoa và tự sửa chính tả.
                      // Định dạng email vẫn do validateEmployee (trên form) và API kiểm như trước.
                      type="text"
                      inputMode="email"
                      autoCapitalize="none"
                      spellCheck={false}
                      // Không đặt maxLength, cùng lý do với ô họ tên.
                      // Tắt gợi ý: form này nhập email của nhân viên khác, trình duyệt gợi ý email của chính người
                      // đang dùng máy là sai mục đích (dễ chọn nhầm rồi lưu).
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

                  {(departmentsStatus === "loading" ||
                    departmentsStatus === "reloading") && (
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
                // Request đã gửi thì Hủy không dừng được: bấm chỉ làm người dùng tưởng chưa lưu, nên khóa lại.
                // Dùng aria-disabled như ConfirmDialog: vẫn Tab tới được, không mất vị trí bàn phím.
                aria-disabled={isSubmitting}
                onClick={(event) => {
                  if (isSubmitting) {
                    event.preventDefault();
                  }
                }}
                data-testid="employee-cancel"
              >
                Hủy
              </Link>
              <button
                type="submit"
                className="btn btn--primary"
                // Lúc nào khóa: xem isSaveLocked. Dùng aria-disabled như nút Hủy, không dùng disabled: nút disabled bị
                // trình duyệt lấy mất focus, người dùng bàn phím và trình đọc màn hình mất vị trí. Vì nút vẫn bấm được
                // về mặt kỹ thuật, handleSubmit tự bỏ qua khi đang khóa.
                aria-disabled={isSaveLocked}
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
