import { useState } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";
import { deleteDepartment } from "../../api/departments";
import type { Department } from "../../api/departments";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { useSubmitGuard } from "../../hooks/useSubmitGuard";

type Options = {
  /** Gọi khi xóa xong (204). */
  onDeleted: (department: Department) => void;
  /** Gọi khi API báo lỗi (404, 409 chen nhau, lỗi mạng); hộp đã đóng trước khi gọi. */
  onError: (department: Department, error: unknown) => void;
};

/**
 * Luật xóa phòng ban dùng chung cho trang danh sách và trang chi tiết (BR6.4, US6.4):
 * - Phòng còn người (employeeCount > 0, số của lần tải gần nhất): hộp thông báo "còn N nhân viên",
 *   không có nút xóa, có liên kết tới danh sách nhân viên đã lọc theo phòng đó.
 * - Phòng 0 người: hộp xác nhận như trước (BR4.5).
 * API vẫn tự chặn (409) nếu có người được thêm chen vào giữa lúc tải và lúc xóa; trang cha báo lỗi đó.
 */
export function useDepartmentDelete({ onDeleted, onError }: Options): {
  requestDelete: (department: Department) => void;
  isSubmitting: boolean;
  dialogs: ReactNode;
} {
  const { isSubmitting, run } = useSubmitGuard();
  const [pending, setPending] = useState<Department | null>(null);

  const hasEmployees = pending !== null && pending.employeeCount > 0;

  async function confirmDelete() {
    const department = pending;
    if (!department || isSubmitting) {
      return;
    }
    await run(async () => {
      try {
        await deleteDepartment(department.id);
        setPending(null);
        onDeleted(department);
      } catch (error) {
        setPending(null);
        onError(department, error);
      }
    });
  }

  const dialogs = (
    <>
      <ConfirmDialog
        variant="notice"
        open={hasEmployees}
        title="Không thể xóa phòng ban"
        onCancel={() => setPending(null)}
        extraAction={
          pending && (
            <Link
              className="btn btn--primary"
              to={`/employees?departmentId=${pending.id}`}
              data-testid="department-view-employees"
            >
              Xem {pending.employeeCount} nhân viên
            </Link>
          )
        }
      >
        <p>
          Phòng ban <strong>{pending?.name}</strong> còn{" "}
          {pending?.employeeCount} nhân viên. Hãy chuyển hoặc xóa các nhân viên
          này trước.
        </p>
      </ConfirmDialog>

      <ConfirmDialog
        open={pending !== null && !hasEmployees}
        title="Xóa phòng ban?"
        confirmLabel="Xóa phòng ban"
        busy={isSubmitting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setPending(null)}
        confirmTestId="department-delete-confirm"
      >
        <p>
          Phòng ban <strong>{pending?.name}</strong> sẽ bị xóa vĩnh viễn. Thao
          tác này không thể hoàn tác.
        </p>
      </ConfirmDialog>
    </>
  );

  return { requestDelete: setPending, isSubmitting, dialogs };
}
