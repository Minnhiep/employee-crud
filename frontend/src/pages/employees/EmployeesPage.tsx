import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { ApiError, isAborted, messageOf } from "../../api/client";
import { deleteEmployee, getEmployees } from "../../api/employees";
import type { Employee } from "../../api/employees";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { DataTable } from "../../components/DataTable";
import type { DataTableColumn } from "../../components/DataTable";
import { Icon } from "../../components/Icon";
import { PageHeader } from "../../components/PageHeader";
import { SearchBox } from "../../components/SearchBox";
import { StatusMessage } from "../../components/StatusMessage";
import { Toast } from "../../components/Toast";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useSubmitGuard } from "../../hooks/useSubmitGuard";
import { normalizeText } from "../../utils/normalizeText";

const TITLE = "Nhân viên";

/** Kết quả của một lần tải, ghi kèm "khóa" của lần tải đó để biết nó còn đúng với địa chỉ hiện tại không. */
type LoadResult = {
  key: string;
  status: "ready" | "error";
  employees: Employee[];
  error: string;
};

/** Chữ cái đầu của từ đầu và từ cuối trong họ tên, ví dụ "Đỗ Văn An" → "ĐA"; tên một từ thì một chữ. */
function initialsOf(fullName: string): string {
  const words = fullName.trim().split(/\s+/);
  const first = words.at(0)?.charAt(0) ?? "";
  const last = words.length > 1 ? (words.at(-1)?.charAt(0) ?? "") : "";
  return (first + last).toLocaleUpperCase("vi");
}

const columns: DataTableColumn<Employee>[] = [
  {
    key: "fullName",
    header: "Họ tên",
    render: (employee) => (
      <span className="person">
        {/* Vòng chữ cái chỉ để nhìn; trình đọc màn hình đọc họ tên ngay sau nó. */}
        <span className="avatar" aria-hidden="true">
          {initialsOf(employee.fullName)}
        </span>
        {employee.fullName}
      </span>
    ),
  },
  {
    key: "email",
    header: "Email",
    render: (employee) => (
      <span className="table__muted">{employee.email}</span>
    ),
  },
  {
    key: "departmentName",
    header: "Phòng ban",
    render: (employee) => employee.departmentName,
  },
];

/**
 * Trang danh sách nhân viên (US2.1, US2.4, US3.1): đủ trạng thái tải / lỗi / trống / không khớp / có dữ liệu (BR4.1),
 * tìm theo họ tên hoặc email bằng nút Tìm hoặc Enter (BR4.2), xóa có xác nhận bằng hộp thoại ngay trên bảng (BR4.7).
 */
export function EmployeesPage() {
  const headingRef = usePageTitle(TITLE);
  const navigate = useNavigate();
  const location = useLocation();
  const { isSubmitting, run } = useSubmitGuard();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Chuỗi tìm lấy từ địa chỉ, không lưu state riêng: địa chỉ là nguồn đúng duy nhất, nên Back/F5 tự đúng.
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search")?.trim() ?? "";

  // Tăng số này để tải lại (bấm "Thử lại", sau khi xóa) mà vẫn giữ chuỗi tìm hiện tại.
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${reloadKey}|${search}`;
  const [result, setResult] = useState<LoadResult | null>(null);
  // Lỗi khi xóa (lỗi mạng...) hiện ở đầu thân trang; bảng vẫn giữ nguyên.
  const [actionError, setActionError] = useState("");
  // Nhân viên đang chờ xác nhận xóa; khác null thì hộp xác nhận mở.
  const [pendingDelete, setPendingDelete] = useState<Employee | null>(null);
  // Tăng số này để đưa focus về tiêu đề SAU khi hộp xác nhận đã đóng (dòng vừa xóa không còn để nhận focus).
  const [headingFocusRequest, setHeadingFocusRequest] = useState(0);

  useEffect(() => {
    if (headingFocusRequest > 0) {
      headingRef.current?.focus();
    }
  }, [headingFocusRequest, headingRef]);

  // Tải mỗi khi chuỗi tìm hoặc reloadKey đổi. Lời gọi cũ bị hủy khi có lời gọi mới hoặc rời trang,
  // nên kết quả cũ không bao giờ đè lên kết quả mới (NFR5.5). State chỉ được đặt khi API đã trả lời.
  useEffect(() => {
    const controller = new AbortController();
    getEmployees(search, { signal: controller.signal }).then(
      (employees) =>
        setResult({ key: requestKey, status: "ready", employees, error: "" }),
      (error: unknown) => {
        // Trang tự hủy (rời trang, có lần tải mới hơn) thì không phải lỗi.
        if (isAborted(error)) {
          return;
        }
        setResult({
          key: requestKey,
          status: "error",
          employees: [],
          error: messageOf(error),
        });
      },
    );
    return () => controller.abort();
  }, [search, requestKey]);

  // Kết quả đang giữ là của lần tải trước (chuỗi tìm khác, hoặc vừa bấm tải lại) thì coi như đang tải.
  const current = result?.key === requestKey ? result : null;
  const status = current?.status ?? "loading";
  const employees = current?.employees ?? [];

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  // Trả lại chuỗi thật sự được tìm để ô tìm hiện đúng chuỗi đó (SearchBox).
  function handleSearch(value: string): string {
    // Chuẩn hóa như API (gộp khoảng trắng, NFC) để địa chỉ trang ghi đúng chuỗi được tìm.
    // Có ký tự lạ thì giữ chuỗi đã bỏ hai đầu: API trả danh sách rỗng, trang hiện "không tìm thấy" (Hiệp chọn).
    const term = normalizeText(value) ?? value.trim();
    if (term === search) {
      // Bấm Tìm lại đúng chuỗi cũ: địa chỉ không đổi, nên chủ động tải lại.
      reload();
      return term;
    }
    // Ghi lên địa chỉ (rỗng thì bỏ tham số); mỗi lần tìm là một mục trong lịch sử, nên Back quay lại được.
    setSearchParams(term ? { search: term } : {});
    return term;
  }

  function clearSearch() {
    handleSearch("");
    // Nút "Xóa tìm kiếm" biến mất ngay sau khi bấm, nên đưa focus về ô tìm để người dùng bàn phím gõ tiếp.
    searchInputRef.current?.focus();
  }

  async function confirmDelete() {
    const employee = pendingDelete;
    if (!employee || isSubmitting) {
      return;
    }
    setActionError("");
    await run(async () => {
      try {
        await deleteEmployee(employee.id);
        setPendingDelete(null);
        // Tải lại theo chuỗi tìm hiện tại để dòng vừa xóa biến mất ngay, không cần F5.
        reload();
        // navigate chỉ để mang lời báo cho Toast; giữ nguyên ?search= trên địa chỉ.
        void navigate(location.pathname + location.search, {
          replace: true,
          state: { message: `Đã xóa nhân viên "${employee.fullName}"` },
        });
        setHeadingFocusRequest((request) => request + 1);
      } catch (error) {
        setPendingDelete(null);
        if (error instanceof ApiError && error.status === 404) {
          // Đã bị xóa ở nơi khác: tải lại để bảng đúng với database.
          reload();
          setActionError("Nhân viên này không còn, danh sách đã được tải lại.");
          // Bảng tải lại nên nút Xóa không còn để nhận focus: đưa focus về tiêu đề như khi xóa thành công.
          setHeadingFocusRequest((request) => request + 1);
        } else {
          // Lỗi mạng: giữ dòng, báo lỗi; hộp đóng và focus về nút Xóa.
          setActionError(messageOf(error));
        }
      }
    });
  }

  // Dòng đếm luôn có sẵn trong trang (kể cả lúc rỗng) vì aria-live chỉ chắc chắn được đọc khi vùng đã có từ trước.
  let countText = "";
  if (status === "ready" && search) {
    countText = `Tìm thấy ${employees.length} nhân viên`;
  } else if (status === "ready" && employees.length > 0) {
    countText = `${employees.length} nhân viên`;
  }

  return (
    <>
      <PageHeader
        title={TITLE}
        headingRef={headingRef}
        breadcrumbs={[{ label: "Nhân sự" }, { label: TITLE }]}
        description="Danh sách nhân viên, tìm theo họ tên hoặc email."
        actions={
          <Link
            className="btn btn--primary"
            to="/employees/new"
            data-testid="employee-add"
          >
            <Icon name="plus" />
            Thêm nhân viên
          </Link>
        }
      />

      <Toast />

      <div className="page-body">
        {actionError && (
          <div className="alert alert--error" role="alert">
            <span className="alert__icon" aria-hidden="true">
              <Icon name="alertCircle" />
            </span>
            <p className="alert__content">{actionError}</p>
          </div>
        )}

        <section className="panel" aria-labelledby="danh-sach-nhan-vien">
          <div className="panel__header">
            <h2 id="danh-sach-nhan-vien" className="panel__title">
              Danh sách nhân viên
            </h2>
            <p className="panel__note" aria-live="polite">
              {countText}
            </p>
          </div>

          <div className="toolbar">
            <SearchBox
              initialValue={search}
              onSearch={handleSearch}
              inputRef={searchInputRef}
            />
          </div>

          <div data-testid="employees-status">
            {status === "loading" && (
              <StatusMessage kind="loading" message="Đang tải dữ liệu…" />
            )}
            {status === "error" && (
              <StatusMessage
                kind="error"
                message="Không tải được danh sách nhân viên"
                description={current?.error}
                action={{
                  label: "Thử lại",
                  onClick: reload,
                  testId: "employees-retry",
                }}
              />
            )}
            {status === "ready" && employees.length === 0 && !search && (
              <StatusMessage
                kind="empty"
                message="Chưa có nhân viên nào"
                description="Thêm nhân viên đầu tiên và chọn phòng ban cho họ."
                action={{
                  label: "Thêm nhân viên",
                  to: "/employees/new",
                  icon: "plus",
                }}
              />
            )}
            {status === "ready" && employees.length === 0 && search && (
              <StatusMessage
                kind="empty"
                message="Không tìm thấy nhân viên phù hợp"
                description={`Không có họ tên hoặc email nào chứa "${search}".`}
                action={{
                  label: "Xóa tìm kiếm",
                  onClick: clearSearch,
                  icon: "close",
                  testId: "employees-clear-search",
                }}
              />
            )}
          </div>

          {status === "ready" && employees.length > 0 && (
            <DataTable
              caption="Danh sách nhân viên"
              columns={columns}
              rows={employees}
              renderActions={(employee) => (
                <>
                  <Link
                    className="btn btn--sm btn--ghost"
                    to={`/employees/${employee.id}/edit`}
                    // Gửi kèm chuỗi tìm để Lưu/Hủy quay về đúng danh sách đang tìm (rà soát N-07).
                    state={search ? { search } : undefined}
                    aria-label={`Sửa nhân viên ${employee.fullName}`}
                    data-testid={`employee-edit-${employee.id}`}
                  >
                    <Icon name="edit" />
                    Sửa
                  </Link>
                  <button
                    type="button"
                    className="btn btn--sm btn--ghost-danger"
                    disabled={isSubmitting}
                    onClick={() => {
                      setActionError("");
                      setPendingDelete(employee);
                    }}
                    aria-label={`Xóa nhân viên ${employee.fullName}`}
                    data-testid={`employee-delete-${employee.id}`}
                  >
                    <Icon name="trash" />
                    Xóa
                  </button>
                </>
              )}
            />
          )}
        </section>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Xóa nhân viên?"
        confirmLabel="Xóa nhân viên"
        busy={isSubmitting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
        confirmTestId="employee-delete-confirm"
      >
        {/* Ghi kèm email vì hai người có thể trùng họ tên; email thì không trùng (rà soát N-05). */}
        <p>
          Nhân viên <strong>{pendingDelete?.fullName}</strong> (
          {pendingDelete?.email}) sẽ bị xóa vĩnh viễn. Thao tác này không thể
          hoàn tác.
        </p>
      </ConfirmDialog>
    </>
  );
}
