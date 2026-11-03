import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ApiError } from "../../api/client";
import { deleteDepartment, getDepartments } from "../../api/departments";
import type { Department } from "../../api/departments";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { DataTable } from "../../components/DataTable";
import type { DataTableColumn } from "../../components/DataTable";
import { Icon } from "../../components/Icon";
import { PageHeader } from "../../components/PageHeader";
import { StatusMessage } from "../../components/StatusMessage";
import { Toast } from "../../components/Toast";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useSubmitGuard } from "../../hooks/useSubmitGuard";

const TITLE = "Phòng ban";
const GENERIC_MESSAGE = "Đã có lỗi xảy ra, vui lòng thử lại sau.";

type LoadStatus = "loading" | "error" | "ready";

const columns: DataTableColumn<Department>[] = [
  {
    key: "name",
    header: "Tên phòng ban",
    render: (department) => (
      <span className="table__strong">{department.name}</span>
    ),
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
 * và xóa có xác nhận bằng hộp thoại ngay trên bảng (BR4.5).
 */
export function DepartmentsPage() {
  const headingRef = usePageTitle(TITLE);
  const navigate = useNavigate();
  const location = useLocation();
  const { isSubmitting, run } = useSubmitGuard();

  const [status, setStatus] = useState<LoadStatus>("loading");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadError, setLoadError] = useState("");
  // Lỗi khi xóa (409, lỗi mạng...) hiện ở đầu thân trang; bảng vẫn giữ nguyên.
  const [actionError, setActionError] = useState("");
  // Phòng ban đang chờ xác nhận xóa; khác null thì hộp xác nhận mở.
  const [pendingDelete, setPendingDelete] = useState<Department | null>(null);
  // Tăng số này để đưa focus về tiêu đề SAU khi hộp xác nhận đã đóng (dòng vừa xóa không còn để nhận focus).
  const [headingFocusRequest, setHeadingFocusRequest] = useState(0);
  // Lời gọi tải lại (bấm "Thử lại", sau khi xóa): giữ lại để hủy nếu có lời gọi mới hoặc rời trang.
  const reloadControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (headingFocusRequest > 0) {
      headingRef.current?.focus();
    }
  }, [headingFocusRequest, headingRef]);

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

  async function confirmDelete() {
    const department = pendingDelete;
    if (!department || isSubmitting) {
      return;
    }
    setActionError("");
    await run(async () => {
      try {
        await deleteDepartment(department.id);
        setPendingDelete(null);
        // Gọi lại hàm tải danh sách để dòng vừa xóa biến mất ngay, không cần F5 (rà soát U2).
        reload();
        // navigate chỉ để mang lời báo cho Toast; việc tải danh sách không phụ thuộc vào nó.
        void navigate(location.pathname + location.search, {
          replace: true,
          state: { message: `Đã xóa phòng ban "${department.name}"` },
        });
        setHeadingFocusRequest((request) => request + 1);
      } catch (error) {
        setPendingDelete(null);
        if (error instanceof ApiError && error.status === 404) {
          // Đã bị xóa ở nơi khác: tải lại để bảng đúng với database.
          reload();
          setActionError("Phòng ban này không còn, danh sách đã được tải lại.");
          // Bảng tải lại nên nút Xóa không còn để nhận focus: đưa focus về tiêu đề như khi xóa thành công.
          setHeadingFocusRequest((request) => request + 1);
        } else {
          // 409 (còn nhân viên) hoặc lỗi mạng: giữ dòng, báo lỗi; hộp đóng và focus về nút Xóa.
          setActionError(messageOf(error));
        }
      }
    });
  }

  return (
    <>
      <PageHeader
        title={TITLE}
        headingRef={headingRef}
        breadcrumbs={[{ label: "Nhân sự" }, { label: TITLE }]}
        description="Danh mục phòng ban dùng khi gán nhân viên."
        actions={
          <Link
            className="btn btn--primary"
            to="/departments/new"
            data-testid="department-add"
          >
            <Icon name="plus" />
            Thêm phòng ban
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

        <section className="panel" aria-labelledby="danh-sach-phong-ban">
          <div className="panel__header">
            <h2 id="danh-sach-phong-ban" className="panel__title">
              Danh sách phòng ban
            </h2>
            {status === "ready" && departments.length > 0 && (
              <p className="panel__note">{departments.length} phòng ban</p>
            )}
          </div>

          <div data-testid="departments-status">
            {status === "loading" && (
              <StatusMessage kind="loading" message="Đang tải dữ liệu…" />
            )}
            {status === "error" && (
              <StatusMessage
                kind="error"
                message="Không tải được danh sách phòng ban"
                description={loadError}
                action={{ label: "Thử lại", onClick: reload }}
              />
            )}
            {status === "ready" && departments.length === 0 && (
              <StatusMessage
                kind="empty"
                message="Chưa có phòng ban nào"
                description="Thêm phòng ban đầu tiên để bắt đầu gán nhân viên."
                action={{
                  label: "Thêm phòng ban",
                  to: "/departments/new",
                  icon: "plus",
                }}
              />
            )}
          </div>

          {status === "ready" && departments.length > 0 && (
            <DataTable
              caption="Danh sách phòng ban"
              columns={columns}
              rows={departments}
              renderActions={(department) => (
                <>
                  <Link
                    className="btn btn--sm btn--ghost"
                    to={`/departments/${department.id}/edit`}
                    aria-label={`Sửa phòng ban ${department.name}`}
                    data-testid={`department-edit-${department.id}`}
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
                      setPendingDelete(department);
                    }}
                    aria-label={`Xóa phòng ban ${department.name}`}
                    data-testid={`department-delete-${department.id}`}
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
        title="Xóa phòng ban?"
        confirmLabel="Xóa phòng ban"
        busy={isSubmitting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPendingDelete(null)}
        confirmTestId="department-delete-confirm"
      >
        <p>
          Phòng ban <strong>{pendingDelete?.name}</strong> sẽ bị xóa vĩnh viễn.
          Thao tác này không thể hoàn tác.
        </p>
      </ConfirmDialog>
    </>
  );
}
