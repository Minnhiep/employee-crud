import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { ApiError, isAborted, messageOf } from "../../api/client";
import { getDepartments } from "../../api/departments";
import type { Department } from "../../api/departments";
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
import { parseId } from "../../utils/parseId";

const TITLE = "Nhân viên";

/** Kết quả của một lần tải, ghi kèm "khóa" của lần tải đó để biết nó còn đúng với địa chỉ hiện tại không. */
type LoadResult = {
  key: string;
  status: "ready" | "error";
  employees: Employee[];
  error: string;
};

type DepartmentsLoad =
  | { status: "loading" }
  | { status: "ready"; departments: Department[] }
  | { status: "error" };

/** Chữ cái đầu của từ đầu và từ cuối trong họ tên, ví dụ "Đỗ Văn An" → "ĐA"; tên một từ thì một chữ. */
function initialsOf(fullName: string): string {
  const words = fullName.trim().split(/\s+/);
  const first = firstCharacterOf(words.at(0));
  const last = words.length > 1 ? firstCharacterOf(words.at(-1)) : "";
  return (first + last).toLocaleUpperCase("vi");
}

/** Array.from đi theo từng ký tự thật, nên lấy nguyên emoji; charAt(0) chỉ lấy một nửa và hiện ô vỡ. */
function firstCharacterOf(word: string | undefined): string {
  return Array.from(word ?? "").at(0) ?? "";
}

/**
 * Chuẩn hóa chuỗi tìm như API (gộp khoảng trắng, NFC), dùng cho cả chuỗi gõ ở ô tìm lẫn chuỗi đọc từ địa chỉ.
 * Có ký tự lạ thì giữ chuỗi đã bỏ hai đầu: API trả danh sách rỗng, trang hiện "không tìm thấy".
 */
function normalizeSearch(raw: string): string {
  return normalizeText(raw) ?? raw.trim();
}

/**
 * Đọc ?departmentId= trên địa chỉ: chỉ nhận số nguyên dương viết bằng chữ số (cùng luật với API).
 * Trả về null khi không có, "invalid" khi có nhưng sai dạng (trang bỏ tham số đó đi).
 */
function parseDepartmentId(raw: string | null): number | null | "invalid" {
  if (raw === null || raw === "") {
    return null;
  }
  return parseId(raw) ?? "invalid";
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
 * Trang danh sách nhân viên: đủ trạng thái tải / lỗi / trống / không khớp / có dữ liệu,
 * tìm theo họ tên hoặc email bằng nút Tìm hoặc Enter, lọc theo phòng ban,
 * xóa có xác nhận bằng hộp thoại ngay trên bảng.
 */
export function EmployeesPage() {
  const headingRef = usePageTitle(TITLE);
  const navigate = useNavigate();
  const location = useLocation();
  const { isSubmitting, run } = useSubmitGuard();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Chuỗi tìm và phòng lọc lấy từ địa chỉ, không lưu state riêng: địa chỉ là nguồn đúng duy nhất, nên Back/F5 tự đúng.
  const [searchParams, setSearchParams] = useSearchParams();
  const search = normalizeSearch(searchParams.get("search") ?? "");
  const rawDepartmentId = searchParams.get("departmentId");
  const parsedDepartmentId = parseDepartmentId(rawDepartmentId);
  const departmentId =
    typeof parsedDepartmentId === "number" ? parsedDepartmentId : null;

  // Danh sách phòng ban cho ô lọc. Lỗi tải thì vẫn dùng được trang, chỉ khóa ô lọc.
  const [departmentsLoad, setDepartmentsLoad] = useState<DepartmentsLoad>({
    status: "loading",
  });
  const [departmentsReloadKey, setDepartmentsReloadKey] = useState(0);
  const departments =
    departmentsLoad.status === "ready" ? departmentsLoad.departments : [];
  const selectedDepartment = departments.find(
    (department) => department.id === departmentId,
  );
  // Phòng trên địa chỉ sai dạng, hoặc đã tải xong danh sách phòng mà không có phòng đó (đã bị xóa).
  const isStaleDepartment =
    parsedDepartmentId === "invalid" ||
    (departmentId !== null &&
      departmentsLoad.status === "ready" &&
      !selectedDepartment);
  // Câu báo suy ra khi vẽ, không giữ state riêng: hiện trong lúc phát hiện, và sau khi trang đã bỏ tham số
  // (lần điều hướng đó mang cờ staleDepartment). Người dùng lọc hoặc tìm lại là điều hướng mới, câu báo tự ẩn.
  const showStaleNotice =
    isStaleDepartment ||
    (typeof location.state === "object" &&
      location.state !== null &&
      "staleDepartment" in location.state);

  // Tăng số này để tải lại (bấm "Thử lại", sau khi xóa) mà vẫn giữ chuỗi tìm và phòng lọc hiện tại.
  const [reloadKey, setReloadKey] = useState(0);
  const requestKey = `${reloadKey}|${search}|${departmentId ?? ""}`;
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

  useEffect(() => {
    const controller = new AbortController();
    getDepartments({ signal: controller.signal }).then(
      (data) => setDepartmentsLoad({ status: "ready", departments: data }),
      (error: unknown) => {
        if (!isAborted(error)) {
          setDepartmentsLoad({ status: "error" });
        }
      },
    );
    return () => controller.abort();
  }, [departmentsReloadKey]);

  // Phòng không còn: bỏ tham số khỏi địa chỉ (thay thế, không thêm mục lịch sử) để danh sách hiện tất cả,
  // gửi kèm cờ để câu báo vẫn hiện sau khi tham số đã mất.
  useEffect(() => {
    if (!isStaleDepartment) {
      return;
    }
    setSearchParams(
      (params) => {
        const next = new URLSearchParams(params);
        next.delete("departmentId");
        return next;
      },
      { replace: true, state: { staleDepartment: true } },
    );
  }, [isStaleDepartment, setSearchParams]);

  // Tải mỗi khi chuỗi tìm, phòng lọc hoặc reloadKey đổi. Lời gọi cũ bị hủy khi có lời gọi mới hoặc rời trang,
  // nên kết quả cũ không bao giờ đè lên kết quả mới. State chỉ được đặt khi API đã trả lời.
  useEffect(() => {
    const controller = new AbortController();
    getEmployees(search, departmentId, { signal: controller.signal }).then(
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
  }, [search, departmentId, requestKey]);

  // Kết quả đang giữ là của lần tải trước (chuỗi tìm khác, hoặc vừa bấm tải lại) thì coi như đang tải.
  const current = result?.key === requestKey ? result : null;
  const status = current?.status ?? "loading";
  const employees = current?.employees ?? [];

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  // Ghi chuỗi tìm và phòng lọc lên địa chỉ; giá trị rỗng thì bỏ tham số. Mỗi lần đổi là một mục lịch sử.
  function applyFilters(nextSearch: string, nextDepartmentId: number | null) {
    const next = new URLSearchParams();
    if (nextSearch) {
      next.set("search", nextSearch);
    }
    if (nextDepartmentId !== null) {
      next.set("departmentId", String(nextDepartmentId));
    }
    setSearchParams(next);
  }

  // Trả lại chuỗi thật sự được tìm để ô tìm hiện đúng chuỗi đó (SearchBox).
  function handleSearch(value: string): string {
    // Chuẩn hóa trước để địa chỉ trang ghi đúng chuỗi được tìm.
    const term = normalizeSearch(value);
    if (term === search) {
      // Bấm Tìm lại đúng chuỗi cũ: địa chỉ không đổi, nên chủ động tải lại.
      reload();
      return term;
    }
    applyFilters(term, departmentId);
    return term;
  }

  // Đổi phòng là lọc ngay (không cần bấm Tìm), giữ chuỗi tìm đã có trên địa chỉ chứ không lấy chữ đang gõ dở.
  function handleDepartmentChange(value: string) {
    applyFilters(search, value === "" ? null : Number(value));
  }

  function clearFilters() {
    applyFilters("", null);
    // Nút "Xóa bộ lọc" biến mất ngay sau khi bấm, nên đưa focus về ô tìm để người dùng bàn phím gõ tiếp.
    searchInputRef.current?.focus();
  }

  function retryDepartments() {
    setDepartmentsLoad({ status: "loading" });
    setDepartmentsReloadKey((key) => key + 1);
  }

  // Ô lọc bị khóa khi tải phòng ban lỗi nên cần lối thoát riêng. Giữ chuỗi tìm, khác "Xóa bộ lọc" xóa cả hai.
  function clearDepartmentFilter() {
    applyFilters(search, null);
    // Nút biến mất ngay sau khi bấm: đưa focus về ô tìm, như clearFilters.
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
        // Tải lại theo chuỗi tìm và phòng lọc hiện tại để dòng vừa xóa biến mất ngay, không cần F5.
        reload();
        // navigate chỉ để mang lời báo cho Toast; giữ nguyên ?search= và ?departmentId= trên địa chỉ.
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

  // Tên phòng đang lọc dùng trong câu chữ; danh sách phòng chưa tải xong thì nói chung chung.
  const departmentLabel = selectedDepartment
    ? `phòng ${selectedDepartment.name}`
    : "phòng đã chọn";

  // Dòng đếm luôn có sẵn trong trang (kể cả lúc rỗng) vì aria-live chỉ chắc chắn được đọc khi vùng đã có từ trước.
  let countText = "";
  if (status === "ready" && search && departmentId !== null) {
    countText = `Tìm thấy ${employees.length} nhân viên ở ${departmentLabel}`;
  } else if (status === "ready" && departmentId !== null) {
    countText = `${departmentLabel.charAt(0).toUpperCase()}${departmentLabel.slice(1)} có ${employees.length} nhân viên`;
  } else if (status === "ready" && search) {
    countText = `Tìm thấy ${employees.length} nhân viên`;
  } else if (status === "ready" && employees.length > 0) {
    countText = `${employees.length} nhân viên`;
  }

  // Sửa từ danh sách đang tìm hoặc đang lọc: gửi kèm để Lưu/Hủy quay về đúng chỗ.
  const editState =
    search || departmentId !== null
      ? { search, departmentId: departmentId ?? undefined }
      : undefined;

  return (
    <>
      <PageHeader
        title={TITLE}
        headingRef={headingRef}
        breadcrumbs={[{ label: "Nhân sự" }, { label: TITLE }]}
        description="Danh sách nhân viên, tìm theo họ tên hoặc email, lọc theo phòng ban."
        actions={
          <Link
            className="btn btn--primary"
            to={
              departmentId !== null
                ? `/employees/new?departmentId=${departmentId}`
                : "/employees/new"
            }
            // Như nút Sửa: Lưu/Hủy quay về đúng danh sách đang tìm, đang lọc.
            state={editState}
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

        {/* Vùng luôn có trong trang để trình đọc màn hình đọc câu báo khi nó xuất hiện. */}
        <div
          className="alert alert--info"
          role="status"
          data-testid="employees-stale-department"
        >
          {showStaleNotice && (
            <>
              <span className="alert__icon" aria-hidden="true">
                <Icon name="alertCircle" />
              </span>
              <p className="alert__content">
                Phòng ban đã chọn không còn tồn tại. Đang hiện tất cả phòng ban.
              </p>
            </>
          )}
        </div>

        <section className="panel" aria-labelledby="danh-sach-nhan-vien">
          <div className="panel__header">
            <h2 id="danh-sach-nhan-vien" className="panel__title">
              Danh sách nhân viên
            </h2>
            <p
              className="panel__note"
              aria-live="polite"
              data-testid="employees-count"
            >
              {countText}
            </p>
          </div>

          <div className="toolbar">
            <SearchBox
              initialValue={search}
              onSearch={handleSearch}
              inputRef={searchInputRef}
            />
            <div className="field filter">
              <label htmlFor="loc-phong-ban">Phòng ban</label>
              <select
                id="loc-phong-ban"
                value={selectedDepartment ? String(selectedDepartment.id) : ""}
                onChange={(event) => handleDepartmentChange(event.target.value)}
                disabled={departmentsLoad.status !== "ready"}
                data-testid="employees-department-filter"
              >
                <option value="">
                  {departmentsLoad.status === "error"
                    ? "Không tải được phòng ban"
                    : "Tất cả phòng ban"}
                </option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>
            {departmentsLoad.status === "error" && (
              <div className="toolbar__actions">
                <button
                  type="button"
                  className="btn btn--sm btn--secondary"
                  onClick={retryDepartments}
                  data-testid="employees-departments-retry"
                >
                  <Icon name="refresh" />
                  Thử lại
                </button>
                {departmentId !== null && (
                  <button
                    type="button"
                    className="btn btn--sm btn--secondary"
                    onClick={clearDepartmentFilter}
                    data-testid="employees-clear-department"
                  >
                    <Icon name="close" />
                    Bỏ lọc phòng ban
                  </button>
                )}
              </div>
            )}
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
            {status === "ready" &&
              employees.length === 0 &&
              !search &&
              departmentId === null && (
                <StatusMessage
                  kind="empty"
                  message="Chưa có nhân viên nào"
                  description="Thêm nhân viên đầu tiên và chọn phòng ban cho họ."
                  action={{
                    label: "Thêm nhân viên",
                    to: "/employees/new",
                    state: editState,
                    icon: "plus",
                  }}
                />
              )}
            {status === "ready" &&
              employees.length === 0 &&
              !search &&
              departmentId !== null && (
                <StatusMessage
                  kind="empty"
                  message={`${departmentLabel.charAt(0).toUpperCase()}${departmentLabel.slice(1)} chưa có nhân viên nào`}
                  description="Thêm nhân viên vào phòng này, hoặc chọn phòng khác."
                  action={{
                    label: "Thêm nhân viên",
                    to: `/employees/new?departmentId=${departmentId}`,
                    state: editState,
                    icon: "plus",
                  }}
                />
              )}
            {status === "ready" && employees.length === 0 && search && (
              <StatusMessage
                kind="empty"
                message="Không tìm thấy nhân viên phù hợp"
                description={
                  departmentId !== null
                    ? `Không có họ tên hoặc email nào chứa "${search}" ở ${departmentLabel}.`
                    : `Không có họ tên hoặc email nào chứa "${search}".`
                }
                action={{
                  label: "Xóa bộ lọc",
                  onClick: clearFilters,
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
                    state={editState}
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
        {/* Ghi kèm email vì hai người có thể trùng họ tên; email thì không trùng. */}
        <p>
          Nhân viên <strong>{pendingDelete?.fullName}</strong> (
          {pendingDelete?.email}) sẽ bị xóa vĩnh viễn. Thao tác này không thể
          hoàn tác.
        </p>
      </ConfirmDialog>
    </>
  );
}
