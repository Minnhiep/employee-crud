import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ApiError, isAborted, messageOf } from "../../api/client";
import { getDepartment } from "../../api/departments";
import type { Department } from "../../api/departments";
import { getEmployees } from "../../api/employees";
import type { Employee } from "../../api/employees";
import { DataTable } from "../../components/DataTable";
import type { DataTableColumn } from "../../components/DataTable";
import { Icon } from "../../components/Icon";
import { PageHeader } from "../../components/PageHeader";
import { StatusMessage } from "../../components/StatusMessage";
import { Toast } from "../../components/Toast";
import { usePageTitle } from "../../hooks/usePageTitle";
import { parseId } from "../../utils/parseId";
import { useDepartmentDelete } from "./useDepartmentDelete";

/** Kết quả của một lần tải (phòng ban và nhân viên của phòng), ghi kèm khóa để bỏ kết quả cũ. */
type LoadResult = {
  key: number;
  status: "ready" | "not-found" | "error";
  department: Department | null;
  employees: Employee[];
  error: string;
};

const employeeColumns: DataTableColumn<Employee>[] = [
  {
    key: "fullName",
    header: "Họ tên",
    render: (employee) => (
      <span className="table__strong">{employee.fullName}</span>
    ),
  },
  {
    key: "email",
    header: "Email",
    render: (employee) => (
      <span className="table__muted">{employee.email}</span>
    ),
  },
];

/**
 * Trang chi tiết phòng ban `/departments/:id`: tên, số nhân viên và bảng nhân viên của phòng.
 * Gọi hai API song song: GET phòng ban (có employeeCount) và GET nhân viên lọc theo phòng.
 * Từ đây sửa, xóa phòng ban, sửa từng nhân viên hoặc thêm nhân viên đã chọn sẵn phòng này.
 */
export function DepartmentDetailPage() {
  const navigate = useNavigate();
  const params = useParams();
  // Địa chỉ như /departments/abc không phải mã hợp lệ, coi như không tìm thấy, không gọi API.
  const parsedId = parseId(params.id);
  const hasValidId = parsedId !== null;
  const id = parsedId ?? 0;
  const detailPath = `/departments/${id}`;

  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!hasValidId) {
      return;
    }
    const controller = new AbortController();
    const options = { signal: controller.signal };
    // Chạy song song: thời gian chờ bằng lời gọi lâu hơn chứ không phải tổng hai lời gọi.
    Promise.all([
      getDepartment(id, options),
      getEmployees("", id, options),
    ]).then(
      ([department, employees]) =>
        setResult({
          key: reloadKey,
          status: "ready",
          department,
          employees,
          error: "",
        }),
      (error: unknown) => {
        if (isAborted(error)) {
          return;
        }
        const notFound = error instanceof ApiError && error.status === 404;
        setResult({
          key: reloadKey,
          status: notFound ? "not-found" : "error",
          department: null,
          employees: [],
          error: messageOf(error),
        });
      },
    );
    return () => controller.abort();
  }, [hasValidId, id, reloadKey]);

  const current = result?.key === reloadKey ? result : null;
  const status = !hasValidId ? "not-found" : (current?.status ?? "loading");
  const department = current?.department ?? null;
  const employees = current?.employees ?? [];

  const title =
    status === "not-found"
      ? "Không tìm thấy phòng ban"
      : (department?.name ?? "Chi tiết phòng ban");
  const headingRef = usePageTitle(title);

  // Tăng số này để đưa focus về tiêu đề SAU khi hộp xác nhận đã đóng: lúc hộp còn mở, phần ngoài hộp không nhận focus.
  const [headingFocusRequest, setHeadingFocusRequest] = useState(0);

  useEffect(() => {
    if (headingFocusRequest > 0) {
      headingRef.current?.focus();
    }
  }, [headingFocusRequest, headingRef]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  const { requestDelete, isSubmitting, dialogs } = useDepartmentDelete({
    onDeleted: (deleted) => {
      // Phòng đã mất nên trang này không còn gì để hiện: về danh sách phòng ban kèm lời báo.
      void navigate("/departments", {
        state: { message: `Đã xóa phòng ban "${deleted.name}"` },
      });
    },
    onError: (_department, error) => {
      // 404: phòng vừa bị xóa ở nơi khác; 409: có người vừa được thêm vào. Tải lại để số đúng.
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 409)
      ) {
        reload();
      }
      if (!(error instanceof ApiError && error.status === 404)) {
        setActionError(messageOf(error));
      }
      setHeadingFocusRequest((request) => request + 1);
    },
  });

  // Gửi kèm đường quay về: Lưu/Hủy ở form nhân viên và form sửa phòng ban đưa người dùng lại đúng trang chi tiết này.
  const returnState = { returnTo: detailPath };

  return (
    <>
      <PageHeader
        title={title}
        headingRef={headingRef}
        breadcrumbs={[
          { label: "Nhân sự" },
          { label: "Phòng ban", to: "/departments" },
          { label: title },
        ]}
        description={
          status === "ready" && department
            ? `${department.employeeCount} nhân viên`
            : undefined
        }
        actions={
          status === "ready" &&
          department && (
            <>
              <Link
                className="btn btn--secondary"
                to={`/departments/${department.id}/edit`}
                state={returnState}
                data-testid="department-detail-edit"
              >
                <Icon name="edit" />
                Sửa phòng ban
              </Link>
              <button
                type="button"
                className="btn btn--ghost-danger"
                disabled={isSubmitting}
                onClick={() => {
                  setActionError("");
                  requestDelete(department);
                }}
                data-testid="department-detail-delete"
              >
                <Icon name="trash" />
                Xóa phòng ban
              </button>
            </>
          )
        }
      />

      {/* Lời báo "Đã thêm / Đã cập nhật…" khi form nhân viên hoặc form sửa phòng ban quay về trang này. */}
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

        {status === "not-found" && (
          <section className="panel">
            <StatusMessage
              kind="empty"
              message="Không tìm thấy phòng ban"
              description="Phòng ban này không tồn tại hoặc đã bị xóa."
              action={{ label: "Về danh sách phòng ban", to: "/departments" }}
            />
          </section>
        )}

        {status !== "not-found" && (
          <section className="panel" aria-labelledby="nhan-vien-cua-phong">
            <div className="panel__header">
              <h2 id="nhan-vien-cua-phong" className="panel__title">
                Nhân viên của phòng
              </h2>
              {status === "ready" && department && (
                <Link
                  className="btn btn--sm btn--primary"
                  to={`/employees/new?departmentId=${department.id}`}
                  state={returnState}
                  data-testid="department-detail-add-employee"
                >
                  <Icon name="plus" />
                  Thêm nhân viên
                </Link>
              )}
            </div>

            <div data-testid="department-detail-status">
              {status === "loading" && (
                <StatusMessage kind="loading" message="Đang tải dữ liệu…" />
              )}
              {status === "error" && (
                <StatusMessage
                  kind="error"
                  message="Không tải được phòng ban"
                  description={current?.error}
                  action={{ label: "Thử lại", onClick: reload }}
                />
              )}
              {status === "ready" && employees.length === 0 && (
                <StatusMessage
                  kind="empty"
                  message="Phòng ban chưa có nhân viên nào"
                  description="Thêm nhân viên đầu tiên cho phòng này."
                />
              )}
            </div>

            {status === "ready" && employees.length > 0 && (
              <DataTable
                caption={`Nhân viên của phòng ${department?.name ?? ""}`}
                columns={employeeColumns}
                rows={employees}
                renderActions={(employee) => (
                  <Link
                    className="btn btn--sm btn--ghost"
                    to={`/employees/${employee.id}/edit`}
                    state={returnState}
                    aria-label={`Sửa nhân viên ${employee.fullName}`}
                  >
                    <Icon name="edit" />
                    Sửa
                  </Link>
                )}
              />
            )}
          </section>
        )}
      </div>

      {dialogs}
    </>
  );
}
