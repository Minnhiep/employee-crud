import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router";
import {
  ApiError,
  GENERIC_MESSAGE,
  isAborted,
  messageOf,
} from "../../api/client";
import type { FieldErrors } from "../../api/client";
import {
  createDepartment,
  getDepartment,
  updateDepartment,
} from "../../api/departments";
import { ErrorSummary } from "../../components/ErrorSummary";
import { FormField } from "../../components/FormField";
import { PageHeader } from "../../components/PageHeader";
import { StatusMessage } from "../../components/StatusMessage";
import { splitErrors } from "../../components/splitErrors";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useSubmitGuard } from "../../hooks/useSubmitGuard";
import { normalizeText } from "../../utils/normalizeText";
import { parseId } from "../../utils/parseId";
import {
  DEPARTMENT_NAME_MAX_LENGTH,
  validateDepartment,
} from "./validateDepartment";

const FIELD_NAMES = ["name"] as const;
const FIELD_LABELS = { name: "Tên phòng ban" };
const LIST_PATH = "/departments";

type LoadStatus = "loading" | "ready" | "not-found" | "error";

type DepartmentFormPageProps = {
  mode: "create" | "edit";
};

/**
 * Địa chỉ để quay về sau khi Lưu, Hủy. Chỉ nhận đúng trang chi tiết của phòng đang sửa,
 * để state lạ không đưa người dùng tới một địa chỉ tùy ý; không có state thì về danh sách.
 */
function returnPathFrom(state: unknown, id: number): string {
  const detailPath = `${LIST_PATH}/${id}`;
  return typeof state === "object" &&
    state !== null &&
    "returnTo" in state &&
    state.returnTo === detailPath
    ? detailPath
    : LIST_PATH;
}

/**
 * Form thêm và sửa phòng ban.
 * Kiểm trên trình duyệt như API, khóa nút Lưu khi chờ, lưu xong quay về kèm lời báo.
 */
export function DepartmentFormPage({ mode }: DepartmentFormPageProps) {
  const isEdit = mode === "edit";
  const navigate = useNavigate();
  const { isSubmitting, run } = useSubmitGuard();
  const locationState: unknown = useLocation().state;

  const params = useParams();
  // Địa chỉ như /departments/abc/edit: không phải mã hợp lệ, coi như không tìm thấy, không gọi API.
  const parsedId = parseId(params.id);
  const hasValidId = parsedId !== null;
  const id = parsedId ?? 0;
  const returnPath = returnPathFrom(locationState, id);

  const [name, setName] = useState("");
  // Tên lúc mở form sửa, để mô tả ghi rõ đang sửa phòng nào; không đổi theo lúc gõ.
  const [loadedName, setLoadedName] = useState("");
  const [loadStatus, setLoadStatus] = useState<LoadStatus>(() =>
    !isEdit ? "ready" : hasValidId ? "loading" : "not-found",
  );
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const baseTitle = isEdit ? "Sửa phòng ban" : "Thêm phòng ban";
  const title =
    loadStatus === "not-found" ? "Không tìm thấy phòng ban" : baseTitle;
  const headingRef = usePageTitle(title);
  // Tăng số này để đưa focus về tiêu đề SAU khi trang đã vẽ lại (ví dụ sau khi bấm "Thử lại").
  const [headingFocusRequest, setHeadingFocusRequest] = useState(0);

  useEffect(() => {
    if (headingFocusRequest > 0) {
      headingRef.current?.focus();
    }
  }, [headingFocusRequest, headingRef]);

  const [touched, setTouched] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [summaryMessages, setSummaryMessages] = useState<string[]>([]);
  // Đã bấm Lưu ít nhất một lần. Khung tóm tắt lỗi ("Chưa lưu được…", role="alert") chỉ hiện từ lúc đó: trước khi
  // bấm Lưu, câu "Chưa lưu được" là sai sự thật, và trình đọc màn hình bị ngắt mỗi lần rời ô trống.
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

  // Chế độ sửa: tải phòng ban để điền sẵn tên.
  useEffect(() => {
    if (!isEdit || !hasValidId) {
      return;
    }
    const controller = new AbortController();
    getDepartment(id, { signal: controller.signal }).then(
      (department) => {
        setName(department.name);
        setLoadedName(department.name);
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

  // Nút "Thử lại" biến mất ngay khi bấm (trang chuyển sang "đang tải"), focus sẽ rơi về body:
  // đưa focus về tiêu đề để người dùng bàn phím không mất vị trí.
  function retryLoad() {
    setLoadStatus("loading");
    setReloadKey((key) => key + 1);
    setHeadingFocusRequest((request) => request + 1);
  }

  function handleNameChange(value: string) {
    setName(value);
    // Đã rời ô một lần thì kiểm lại ngay khi gõ, để lỗi biến mất khi đã sửa đúng.
    if (touched) {
      setFieldErrors(validateDepartment(value));
    }
  }

  function handleNameBlur() {
    setTouched(true);
    const localErrors = validateDepartment(name);
    // Chỉ thay lỗi khi kiểm trên trình duyệt thấy sai. Lỗi của API (ví dụ "đã tồn tại") được giữ tới khi
    // người dùng sửa ô (onChange kiểm lại). Vì sao: lưu lỗi thì focus chuyển sang khung tóm tắt, ô tên bị
    // blur; nếu thay hết ở đây thì lỗi API vừa nhận bị xóa ngay và người dùng không thấy gì.
    setFieldErrors((current) =>
      Object.keys(localErrors).length > 0 ? localErrors : current,
    );
  }

  function showSaveError(error: unknown) {
    if (isAborted(error)) {
      return;
    }
    setSubmitAttempted(true);
    if (!(error instanceof ApiError)) {
      setSummaryMessages([GENERIC_MESSAGE]);
    } else if (error.status === 404) {
      setSummaryMessages(["Không tìm thấy phòng ban, có thể đã bị xóa."]);
    } else if (error.kind === "client") {
      // 400/409: lỗi của ô tên hiện cạnh ô, lỗi khác (hoặc chỉ có detail) hiện ở khung tóm tắt.
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
    // Nút Lưu khóa bằng aria-disabled nên vẫn bấm được (Enter trong ô cũng gửi form): tự bỏ qua khi đang lưu.
    if (isSubmitting) {
      return;
    }
    setSubmitAttempted(true);
    setTouched(true);
    setSummaryMessages([]);

    const errors = validateDepartment(name);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      // Có lỗi thì không gửi request; đưa focus vào khung tóm tắt.
      setSummaryFocusRequest((request) => request + 1);
      return;
    }

    // Gửi đúng tên sẽ được lưu (đã gộp khoảng trắng, NFC). Đã qua validateDepartment nên không ra null.
    const request = { name: normalizeText(name) ?? name };
    await run(async () => {
      try {
        const saved = isEdit
          ? await updateDepartment(id, request)
          : await createDepartment(request);
        // Đã rời form bằng menu hoặc nút Back: bản ghi đã lưu, không kéo người dùng khỏi trang đang xem.
        if (hasLeftFormRef.current) {
          return;
        }
        const message = isEdit
          ? `Đã cập nhật phòng ban "${saved.name}"`
          : `Đã thêm phòng ban "${saved.name}"`;
        void navigate(returnPath, { state: { message } });
      } catch (error) {
        // Form không còn trên màn hình để hiện lỗi, và ứng dụng không có vùng thông báo chung: chỉ ghi lại.
        if (hasLeftFormRef.current) {
          console.error("Không lưu được phòng ban sau khi đã rời form", error);
          return;
        }
        showSaveError(error);
      }
    });
  }

  // Câu về trường bắt buộc chỉ có nghĩa khi form hiện trên trang.
  let description: string | undefined;
  if (loadStatus === "error") {
    description = "Cập nhật tên phòng ban.";
  } else if (loadStatus !== "not-found") {
    description = isEdit
      ? `Cập nhật tên phòng ban${loadedName ? ` ${loadedName}` : ""}. Trường có dấu * là bắt buộc.`
      : "Nhập thông tin phòng ban mới. Trường có dấu * là bắt buộc.";
  }

  return (
    <>
      <PageHeader
        title={title}
        headingRef={headingRef}
        breadcrumbs={[
          { label: "Trang chủ", to: "/", disabled: isSubmitting },
          { label: "Phòng ban", to: LIST_PATH, disabled: isSubmitting },
          { label: isEdit ? "Sửa" : "Thêm mới" },
        ]}
        description={description}
      />

      <div className="page-body">
        {loadStatus !== "ready" && (
          <section className="panel panel--form">
            {loadStatus === "loading" && (
              <StatusMessage kind="loading" message="Đang tải dữ liệu…" />
            )}
            {loadStatus === "not-found" && (
              <StatusMessage
                kind="error"
                message="Không tìm thấy phòng ban"
                description="Phòng ban có thể đã bị xóa, hoặc đường dẫn không đúng."
                action={{
                  label: "Về danh sách phòng ban",
                  to: LIST_PATH,
                  icon: "arrowLeft",
                }}
              />
            )}
            {loadStatus === "error" && (
              <StatusMessage
                kind="error"
                message="Không tải được thông tin phòng ban"
                description={loadError}
                action={{ label: "Thử lại", onClick: retryLoad }}
              />
            )}
          </section>
        )}

        {loadStatus === "ready" && (
          <form
            className="panel panel--form"
            aria-labelledby="thong-tin-phong-ban"
            noValidate
            onSubmit={(event) => void handleSubmit(event)}
          >
            <div className="panel__header">
              <h2 id="thong-tin-phong-ban" className="panel__title">
                Thông tin phòng ban
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

              {/* Cùng lưới hai cột với form nhân viên: ô chỉ rộng một cột, hai form trông đồng bộ. */}
              <div className="form__grid">
                <FormField
                  id="name"
                  label="Tên phòng ban"
                  required
                  hint={`Viết hoa chữ cái đầu, ví dụ: Kế toán, Nhân sự, IT. Tối đa ${DEPARTMENT_NAME_MAX_LENGTH} ký tự, không trùng với phòng ban khác.`}
                  errors={fieldErrors.name}
                >
                  {(controlProps) => (
                    <input
                      {...controlProps}
                      type="text"
                      // Không đặt maxLength: trình duyệt sẽ cắt bớt phần dán thừa mà không báo.
                      // Để nguyên, validateDepartment báo "tối đa 100 ký tự" cạnh ô.
                      autoComplete="off"
                      placeholder="Ví dụ: Kế toán"
                      value={name}
                      onChange={(event) => handleNameChange(event.target.value)}
                      onBlur={handleNameBlur}
                      data-testid="department-name"
                    />
                  )}
                </FormField>
              </div>
            </div>

            {/* Thứ tự chuẩn: Hủy trước, nút chính "Lưu" ở ngoài cùng bên phải. */}
            <div className="panel__footer">
              <Link
                className="btn btn--secondary"
                to={returnPath}
                // Request đã gửi thì Hủy không dừng được: bấm chỉ làm người dùng tưởng chưa lưu, nên khóa lại.
                // Dùng aria-disabled như ConfirmDialog: vẫn Tab tới được, không mất vị trí bàn phím.
                aria-disabled={isSubmitting}
                onClick={(event) => {
                  if (isSubmitting) {
                    event.preventDefault();
                  }
                }}
                data-testid="department-cancel"
              >
                Hủy
              </Link>
              <button
                type="submit"
                className="btn btn--primary"
                // Đang lưu thì khóa để bấm đúp chỉ gửi một lần. Dùng aria-disabled như nút Hủy, không dùng disabled:
                // nút disabled bị trình duyệt lấy mất focus, người dùng bàn phím và trình đọc màn hình mất vị trí.
                // Vì nút vẫn bấm được về mặt kỹ thuật, handleSubmit tự bỏ qua khi đang lưu.
                aria-disabled={isSubmitting}
                data-testid="department-save"
              >
                {isSubmitting ? "Đang lưu…" : "Lưu phòng ban"}
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
