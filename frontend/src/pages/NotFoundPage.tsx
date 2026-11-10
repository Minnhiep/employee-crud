import { PageHeader } from "../components/PageHeader";
import { StatusMessage } from "../components/StatusMessage";
import { usePageTitle } from "../hooks/usePageTitle";

const TITLE = "Không tìm thấy trang";

// Gõ sai địa chỉ thì vào đây, thay vì thấy một trang trắng.
// Dùng StatusMessage như các trang "không tìm thấy" khác (form, chi tiết phòng ban) để mọi trang cùng một kiểu.
export function NotFoundPage() {
  const headingRef = usePageTitle(TITLE);

  return (
    <>
      <PageHeader
        title={TITLE}
        headingRef={headingRef}
        breadcrumbs={[{ label: "Trang chủ", to: "/" }, { label: TITLE }]}
      />
      <div className="page-body">
        <section className="panel">
          <StatusMessage
            kind="error"
            message="Đường dẫn này không tồn tại hoặc đã bị đổi."
            description="Kiểm tra lại địa chỉ, hoặc quay về danh sách nhân viên."
            action={{
              label: "Về danh sách nhân viên",
              to: "/employees",
              icon: "arrowLeft",
            }}
          />
        </section>
      </div>
    </>
  );
}
