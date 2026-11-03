import { useEffect, useRef, useState } from "react";
import type { SubmitEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
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
import { validateDepartment } from "./validateDepartment";

const FIELD_NAMES = ["name"] as const;
const FIELD_LABELS = { name: "Tên phòng ban" };

type LoadStatus = "loading" | "ready" | "not-found" | "error";

type DepartmentFormPageProps = {
  mode: "create" | "edit";
};

/**
 * Form thêm và sửa phòng ban (US1.2, US1.3).
 * Kiểm trên trình duyệt như API (BR4.2), khóa nút Lưu khi chờ (BR4.6), lưu xong về danh sách kèm lời báo (BR4.4).
 */
export function DepartmentFormPage({ mode }: DepartmentFormPageProps) {
  const isEdit = mode === "edit";
  const title = isEdit ? "Sửa phòng ban" : "Thêm phòng ban";
  const headingRef = usePageTitle(title);
  const navigate = useNavigate();
  const { isSubmitting, run } = useSubmitGuard();

  const params = useParams();
  const id = Number(params.id);
  // Địa chỉ như /departments/abc/edit: không phải mã hợp lệ, coi như không tìm thấy, không gọi API.
  const hasValidId = Number.isInteger(id) && id > 0;

  const [name, setName] = useState("");
  // Tên lúc mở form sửa, để mô tả ghi rõ đang sửa phòng nào; không đổi theo lúc gõ.
  const [loadedName, setLoadedName] = useState("");
  const [loadStatus, setLoadStatus] = useState<LoadStatus>(() =>
    !isEdit ? "ready" : hasValidId ? "loading" : "not-found",
  );
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [touched, setTouched] = useState(false);
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

  // Chế độ sửa: tải phòng ban để điền sẵn tên (BR4.3).
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

  function retryLoad() {
    setLoadStatus("loading");
    setReloadKey((key) => key + 1);
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
    if (!(error instanceof ApiError)) {
      setSummaryMessages([GENERIC_MESSAGE]);
    } else if (error.status === 404) {
      setSummaryMessages(["Không tìm thấy phòng ban, có thể đã bị xóa"]);
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
    setTouched(true);
    setSummaryMessages([]);

    const errors = validateDepartment(name);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      // Có lỗi thì không gửi request; đưa focus vào khung tóm tắt (AC4.1.1).
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
        const message = isEdit
          ? `Đã cập nhật phòng ban "${saved.name}"`
          : `Đã thêm phòng ban "${saved.name}"`;
        void navigate("/departments", { state: { message } });
      } catch (error) {
        showSaveError(error);
      }
    });
  }

  return (
    <>
      <PageHeader
        title={title}
        headingRef={headingRef}
        breadcrumbs={[
          { label: "Nhân sự" },
          { label: "Phòng ban", to: "/departments" },
          { label: isEdit ? "Sửa" : "Thêm mới" },
        ]}
        description={
          isEdit
            ? `Cập nhật tên phòng ban${loadedName ? ` ${loadedName}` : ""}. Trường có dấu * là bắt buộc.`
            : "Nhập thông tin phòng ban mới. Trường có dấu * là bắt buộc."
        }
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
                  to: "/departments",
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
              <ErrorSummary
                ref={summaryRef}
                fieldErrors={fieldErrors}
                fieldLabels={FIELD_LABELS}
                messages={summaryMessages}
              />

              {/* Cùng lưới hai cột với form nhân viên: ô chỉ rộng một cột, hai form trông đồng bộ. */}
              <div className="form__grid">
                <FormField
                  id="name"
                  label="Tên phòng ban"
                  required
                  hint="Tối đa 100 ký tự, không trùng với phòng ban khác."
                  errors={fieldErrors.name}
                >
                  {(controlProps) => (
                    <input
                      {...controlProps}
                      type="text"
                      // Không đặt maxLength: trình duyệt sẽ cắt bớt phần dán thừa mà không báo (rà soát N-03).
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
                to="/departments"
                data-testid="department-cancel"
              >
                Hủy
              </Link>
              <button
                type="submit"
                className="btn btn--primary"
                disabled={isSubmitting}
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
