import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { ApiError } from "../../api/client";
import { deleteEmployee, getEmployees } from "../../api/employees";
import type { Employee } from "../../api/employees";
import { DataTable } from "../../components/DataTable";
import type { DataTableColumn } from "../../components/DataTable";
import { SearchBox } from "../../components/SearchBox";
import { StatusMessage } from "../../components/StatusMessage";
import { Toast } from "../../components/Toast";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useSubmitGuard } from "../../hooks/useSubmitGuard";

const GENERIC_MESSAGE = "Đã có lỗi xảy ra, vui lòng thử lại sau.";

/** Kết quả của một lần tải, ghi kèm "khóa" của lần tải đó để biết nó còn đúng với địa chỉ hiện tại không. */
type LoadResult = {
  key: string;
  status: "ready" | "error";
  employees: Employee[];
  error: string;
};

const columns: DataTableColumn<Employee>[] = [
  { key: "fullName", header: "Họ tên", render: (e) => e.fullName },
  { key: "email", header: "Email", render: (e) => e.email },
  {
    key: "departmentName",
    header: "Phòng ban",
    render: (e) => e.departmentName,
  },
];

function messageOf(error: unknown): string {
  return error instanceof ApiError && error.message
    ? error.message
    : GENERIC_MESSAGE;
}

function isAborted(error: unknown): boolean {
  return error instanceof ApiError && error.kind === "aborted";
}

/**
 * Trang danh sách nhân viên (US2.1, US2.4, US3.1): đủ trạng thái tải / lỗi / trống / không khớp / có dữ liệu (BR4.1),
 * tìm theo họ tên hoặc email bằng nút Tìm hoặc Enter (BR4.2), xóa có xác nhận ngay trên bảng (BR4.7).
 */
export function EmployeesPage() {
  const headingRef = usePageTitle("Nhân viên");
  const navigate = useNavigate();
  const location = useLocation();
  const { isSubmitting, run } = useSubmitGuard();

  // Chuỗi tìm lấy từ địa chỉ, không lưu state riêng: địa chỉ là nguồn đúng duy nhất, nên Back/F5 tự đúng.
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search")?.trim() ?? "";

  // Tăng số này để tải lại (bấm "Thử lại", sau khi xóa) mà vẫn giữ chuỗi tìm hiện tại.
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${reloadKey}|${search}`;
  const [result, setResult] = useState<LoadResult | null>(null);
  // Lỗi khi xóa (lỗi mạng...) hiện ở đầu trang; bảng vẫn giữ nguyên.
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  function handleSearch(value: string) {
    if (value === search) {
      // Bấm Tìm lại đúng chuỗi cũ: địa chỉ không đổi, nên chủ động tải lại.
      reload();
      return;
    }
    // Ghi lên địa chỉ (rỗng thì bỏ tham số); mỗi lần tìm là một mục trong lịch sử, nên Back quay lại được.
    setSearchParams(value ? { search: value } : {});
  }

  async function handleDelete(employee: Employee) {
    if (isSubmitting) {
      return;
    }
    const confirmed = window.confirm(
      `Xóa nhân viên "${employee.fullName}"? Thao tác này không hoàn tác được.`,
    );
    if (!confirmed) {
      return;
    }

    setActionError("");
    setDeletingId(employee.id);
    await run(async () => {
      try {
        await deleteEmployee(employee.id);
        // Tải lại theo chuỗi tìm hiện tại để dòng vừa xóa biến mất ngay, không cần F5.
        reload();
        // navigate chỉ để mang lời báo cho Toast; giữ nguyên ?search= trên địa chỉ.
        void navigate(location.pathname + location.search, {
          replace: true,
          state: { message: `Đã xóa nhân viên "${employee.fullName}"` },
        });
        headingRef.current?.focus();
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          // Đã bị xóa ở nơi khác: tải lại để bảng đúng với database.
          reload();
          setActionError("Mục này đã không còn");
        } else {
          // Lỗi mạng: giữ dòng, báo lỗi, mở lại nút.
          setActionError(messageOf(error));
        }
      }
    });
    setDeletingId(null);
  }

  return (
    <>
      <div className="page-header">
        <h1 ref={headingRef} tabIndex={-1}>
          Nhân viên
        </h1>
        <Link
          className="btn btn--primary"
          to="/employees/new"
          data-testid="employee-add"
        >
          + Thêm nhân viên
        </Link>
      </div>

      {/* key theo chuỗi tìm: Back/Forward đổi địa chỉ thì ô tìm được tạo lại với đúng chuỗi trên địa chỉ. */}
      <SearchBox
        key={search}
        initialValue={search}
        onSearch={handleSearch}
        disabled={status === "loading"}
      />

      <Toast />

      {actionError && (
        <div className="alert alert--error" role="alert">
          <span className="icon" aria-hidden="true">
            (!)
          </span>{" "}
          {actionError}
        </div>
      )}

      <div data-testid="employees-status">
        {status === "loading" && (
          <StatusMessage kind="loading" message="Đang tải..." />
        )}
        {status === "error" && (
          <>
            <StatusMessage kind="error" message={current?.error ?? ""} />
            <button
              type="button"
              className="btn btn--secondary"
              onClick={reload}
              data-testid="employees-retry"
            >
              Thử lại
            </button>
          </>
        )}
        {status === "ready" && employees.length === 0 && !search && (
          <StatusMessage
            kind="empty"
            message="Chưa có nhân viên nào."
            action={{ label: "Thêm nhân viên", to: "/employees/new" }}
          />
        )}
        {status === "ready" && employees.length === 0 && search && (
          <>
            <StatusMessage
              kind="empty"
              message={`Không tìm thấy nhân viên phù hợp với "${search}".`}
            />
            <Link
              className="btn btn--secondary"
              to="/employees"
              data-testid="employees-clear-search"
            >
              Xóa tìm kiếm
            </Link>
          </>
        )}
      </div>

      {status === "ready" && employees.length > 0 && (
        <>
          <DataTable
            caption="Danh sách nhân viên"
            columns={columns}
            rows={employees}
            renderActions={(employee) => (
              <>
                <Link
                  className="btn btn--secondary"
                  to={`/employees/${employee.id}/edit`}
                  aria-label={`Sửa nhân viên ${employee.fullName}`}
                  data-testid={`employee-edit-${employee.id}`}
                >
                  Sửa
                </Link>
                <button
                  type="button"
                  className="btn btn--danger"
                  disabled={isSubmitting}
                  onClick={() => void handleDelete(employee)}
                  aria-label={`Xóa nhân viên ${employee.fullName}`}
                  data-testid={`employee-delete-${employee.id}`}
                >
                  {deletingId === employee.id ? "Đang xóa..." : "Xóa"}
                </button>
              </>
            )}
          />
          {/* aria-live: trình đọc màn hình đọc lại số dòng sau mỗi lần tìm. */}
          <p className="list-count" aria-live="polite">
            {search
              ? `Đang hiện ${employees.length} nhân viên`
              : `Có ${employees.length} nhân viên`}
          </p>
        </>
      )}
    </>
  );
}
