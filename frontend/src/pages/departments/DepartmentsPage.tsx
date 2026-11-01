import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ApiError } from "../../api/client";
import { deleteDepartment, getDepartments } from "../../api/departments";
import type { Department } from "../../api/departments";
import { DataTable } from "../../components/DataTable";
import type { DataTableColumn } from "../../components/DataTable";
import { StatusMessage } from "../../components/StatusMessage";
import { Toast } from "../../components/Toast";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useSubmitGuard } from "../../hooks/useSubmitGuard";

const GENERIC_MESSAGE = "Đã có lỗi xảy ra, vui lòng thử lại sau.";

type LoadStatus = "loading" | "error" | "ready";

const columns: DataTableColumn<Department>[] = [
  {
    key: "name",
    header: "Tên phòng ban",
    render: (department) => department.name,
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
 * Trang danh sách phòng ban (US1.1, US1.4): bốn trạng thái tải / lỗi / trống / có dữ liệu (BR4.1),
 * và xóa có xác nhận ngay trên bảng (BR4.5).
 */
export function DepartmentsPage() {
  const headingRef = usePageTitle("Phòng ban");
  const navigate = useNavigate();
  const location = useLocation();
  const { isSubmitting, run } = useSubmitGuard();

  const [status, setStatus] = useState<LoadStatus>("loading");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadError, setLoadError] = useState("");
  // Lỗi khi xóa (409, lỗi mạng...) hiện ở đầu trang; bảng vẫn giữ nguyên.
  const [actionError, setActionError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  // Lời gọi tải lại (bấm "Thử lại", sau khi xóa): giữ lại để hủy nếu có lời gọi mới hoặc rời trang.
  const reloadControllerRef = useRef<AbortController | null>(null);

  // Hai hàm nhận kết quả tải; chỉ được gọi khi API đã trả lời (trong .then), không gọi ngay trong effect.
  const showDepartments = useCallback((data: Department[]) => {
    setDepartments(data);
    setStatus("ready");
  }, []);

  const showLoadError = useCallback((error: unknown) => {
    // Trang tự hủy (rời trang, có lần tải mới hơn) thì không phải lỗi.
    if (isAborted(error)) {
      return;
    }
    setLoadError(messageOf(error));
    setStatus("error");
  }, []);

  // Tải lần đầu khi mở trang; rời trang thì hủy lời gọi còn dang dở.
  useEffect(() => {
    const controller = new AbortController();
    getDepartments({ signal: controller.signal }).then(
      showDepartments,
      showLoadError,
    );
    return () => {
      controller.abort();
      reloadControllerRef.current?.abort();
    };
  }, [showDepartments, showLoadError]);

  // Tải lại khi bấm "Thử lại" hoặc sau khi xóa (gọi từ sự kiện, không từ effect).
  const reload = useCallback(() => {
    reloadControllerRef.current?.abort();
    const controller = new AbortController();
    reloadControllerRef.current = controller;
    setStatus("loading");
    getDepartments({ signal: controller.signal }).then(
      showDepartments,
      showLoadError,
    );
  }, [showDepartments, showLoadError]);

  async function handleDelete(department: Department) {
    if (isSubmitting) {
      return;
    }
    const confirmed = window.confirm(
      `Xóa phòng ban "${department.name}"? Thao tác này không hoàn tác được.`,
    );
    if (!confirmed) {
      return;
    }

    setActionError("");
    setDeletingId(department.id);
    await run(async () => {
      try {
        await deleteDepartment(department.id);
        // Gọi lại hàm tải danh sách để dòng vừa xóa biến mất ngay, không cần F5 (rà soát U2).
        reload();
        // navigate chỉ để mang lời báo cho Toast; việc tải danh sách không phụ thuộc vào nó.
        void navigate(location.pathname + location.search, {
          replace: true,
          state: { message: `Đã xóa phòng ban "${department.name}"` },
        });
        headingRef.current?.focus();
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) {
          // Đã bị xóa ở nơi khác: tải lại để bảng đúng với database.
          reload();
          setActionError("Mục này đã không còn");
        } else {
          // 409 (còn nhân viên) hoặc lỗi mạng: giữ dòng, báo lỗi, mở lại nút.
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
          Phòng ban
        </h1>
        <Link
          className="btn btn--primary"
          to="/departments/new"
          data-testid="department-add"
        >
          + Thêm phòng ban
        </Link>
      </div>

      <Toast />

      {actionError && (
        <div className="alert alert--error" role="alert">
          <span className="icon" aria-hidden="true">
            (!)
          </span>{" "}
          {actionError}
        </div>
      )}

      <div data-testid="departments-status">
        {status === "loading" && (
          <StatusMessage kind="loading" message="Đang tải..." />
        )}
        {status === "error" && (
          <StatusMessage
            kind="error"
            message={loadError}
            action={{ label: "Thử lại", onClick: reload }}
          />
        )}
        {status === "ready" && departments.length === 0 && (
          <StatusMessage
            kind="empty"
            message="Chưa có phòng ban nào."
            action={{ label: "Thêm phòng ban", to: "/departments/new" }}
          />
        )}
      </div>

      {status === "ready" && departments.length > 0 && (
        <>
          <DataTable
            caption="Danh sách phòng ban"
            columns={columns}
            rows={departments}
            renderActions={(department) => (
              <>
                <Link
                  className="btn btn--secondary"
                  to={`/departments/${department.id}/edit`}
                  aria-label={`Sửa phòng ban ${department.name}`}
                  data-testid={`department-edit-${department.id}`}
                >
                  Sửa
                </Link>
                <button
                  type="button"
                  className="btn btn--danger"
                  disabled={isSubmitting}
                  onClick={() => void handleDelete(department)}
                  aria-label={`Xóa phòng ban ${department.name}`}
                  data-testid={`department-delete-${department.id}`}
                >
                  {deletingId === department.id ? "Đang xóa..." : "Xóa"}
                </button>
              </>
            )}
          />
          <p className="list-count">Có {departments.length} phòng ban</p>
        </>
      )}
    </>
  );
}
