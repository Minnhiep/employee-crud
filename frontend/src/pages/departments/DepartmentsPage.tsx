import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { ApiError, isAborted, messageOf } from "../../api/client";
import { getDepartments } from "../../api/departments";
import type { Department } from "../../api/departments";
import { DataTable } from "../../components/DataTable";
import type { DataTableColumn } from "../../components/DataTable";
import { Icon } from "../../components/Icon";
import { PageHeader } from "../../components/PageHeader";
import { StatusMessage } from "../../components/StatusMessage";
import { usePageTitle } from "../../hooks/usePageTitle";
import { useDepartmentDelete } from "./useDepartmentDelete";

const TITLE = "Phòng ban";

/** Kết quả của một lần tải, ghi kèm "khóa" của lần tải đó để biết nó còn là lần tải mới nhất không. */
type LoadResult = {
  key: number;
  status: "ready" | "error";
  departments: Department[];
  error: string;
};

const columns: DataTableColumn<Department>[] = [
  {
    key: "name",
    header: "Tên phòng ban",
    // Tên là liên kết tới trang chi tiết: xem phòng này có những ai.
    render: (department) => (
      <Link
        className="table__strong table__link"
        to={`/departments/${department.id}`}
        aria-label={`Xem phòng ban ${department.name}`}
        data-testid={`department-view-${department.id}`}
      >
        {department.name}
      </Link>
    ),
  },
  {
    key: "employeeCount",
    header: "Số nhân viên",
    align: "end",
    render: (department) => department.employeeCount,
  },
];

/**
 * Trang danh sách phòng ban: bốn trạng thái tải / lỗi / trống / có dữ liệu,
 * cột số nhân viên, và xóa theo luật của useDepartmentDelete.
 */
export function DepartmentsPage() {
  const headingRef = usePageTitle(TITLE);
  const navigate = useNavigate();
  const location = useLocation();

  // Tăng số này để tải lại (bấm "Thử lại", sau khi xóa). Cùng kiểu với trang nhân viên.
  const [reloadKey, setReloadKey] = useState(0);
  const [result, setResult] = useState<LoadResult | null>(null);
  // Lỗi khi xóa (409, lỗi mạng...) hiện ở đầu thân trang; bảng vẫn giữ nguyên.
  const [actionError, setActionError] = useState("");
  // Tăng số này để đưa focus về tiêu đề SAU khi hộp xác nhận đã đóng (dòng vừa xóa không còn để nhận focus).
  const [headingFocusRequest, setHeadingFocusRequest] = useState(0);

  useEffect(() => {
    if (headingFocusRequest > 0) {
      headingRef.current?.focus();
    }
  }, [headingFocusRequest, headingRef]);

  // Địa chỉ MỚI NHẤT của trang, cho lời gọi xóa đang chờ API (cùng cách với trang nhân viên): onDeleted thuộc lần
  // vẽ lúc bấm Xóa, nếu trong lúc chờ người dùng bấm Back mà vẫn ở trang này thì `location` trong đó đã cũ.
  // Ghi ref trong effect, sau mỗi lần vẽ: React không cho ghi ref trong lúc vẽ.
  const latestLocationRef = useRef(location);
  useEffect(() => {
    latestLocationRef.current = location;
  }, [location]);

  // Tải khi mở trang và mỗi khi reloadKey đổi. Lời gọi cũ bị hủy khi có lời gọi mới hoặc rời trang,
  // nên kết quả cũ không bao giờ đè lên kết quả mới. State chỉ được đặt khi API đã trả lời.
  useEffect(() => {
    const controller = new AbortController();
    getDepartments({ signal: controller.signal }).then(
      (departments) =>
        setResult({ key: reloadKey, status: "ready", departments, error: "" }),
      (error: unknown) => {
        // Trang tự hủy (rời trang, có lần tải mới hơn) thì không phải lỗi.
        if (isAborted(error)) {
          return;
        }
        setResult({
          key: reloadKey,
          status: "error",
          departments: [],
          error: messageOf(error),
        });
      },
    );
    return () => controller.abort();
  }, [reloadKey]);

  // Kết quả đang giữ là của lần tải trước (vừa bấm tải lại) thì coi như đang tải.
  const current = result?.key === reloadKey ? result : null;
  const status = current?.status ?? "loading";
  const departments = current?.departments ?? [];
  const loadError = current?.error ?? "";

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  // Nút "Thử lại" biến mất ngay khi trang chuyển sang "đang tải": đưa focus về tiêu đề, không để rơi về body.
  function retry() {
    reload();
    setHeadingFocusRequest((request) => request + 1);
  }

  const { requestDelete, isSubmitting, dialogs } = useDepartmentDelete({
    onDeleted: (department) => {
      // Gọi lại hàm tải danh sách để dòng vừa xóa biến mất ngay, không cần F5.
      reload();
      // navigate chỉ để mang lời báo cho Toast, thay đúng địa chỉ đang mở; việc tải danh sách không phụ thuộc vào nó.
      const latest = latestLocationRef.current;
      void navigate(latest.pathname + latest.search, {
        replace: true,
        state: { message: `Đã xóa phòng ban "${department.name}"` },
      });
      setHeadingFocusRequest((request) => request + 1);
    },
    onError: (_department, error) => {
      // 404 (đã bị xóa ở nơi khác) và 409 (có người vừa được thêm vào phòng) đều làm số trên bảng cũ:
      // tải lại để bảng đúng với database. Bảng tải lại nên nút Xóa không còn để nhận focus:
      // đưa focus về tiêu đề như khi xóa thành công.
      if (
        error instanceof ApiError &&
        (error.status === 404 || error.status === 409)
      ) {
        reload();
        setHeadingFocusRequest((request) => request + 1);
      }
      if (error instanceof ApiError && error.status === 404) {
        setActionError("Phòng ban này không còn, danh sách đã được tải lại.");
      } else {
        // 409 hoặc lỗi mạng: hiện lời API trả về ("…còn N nhân viên") hoặc câu chung.
        setActionError(messageOf(error));
      }
    },
  });

  return (
    <>
      <PageHeader
        title={TITLE}
        headingRef={headingRef}
        breadcrumbs={[{ label: "Trang chủ", to: "/" }, { label: TITLE }]}
        description="Danh mục phòng ban và số nhân viên của từng phòng."
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
                action={{ label: "Thử lại", onClick: retry }}
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
                      requestDelete(department);
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

      {dialogs}
    </>
  );
}
