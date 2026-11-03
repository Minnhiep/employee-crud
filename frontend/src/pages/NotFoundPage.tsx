import { Link } from "react-router";
import { Icon } from "../components/Icon";
import { PageHeader } from "../components/PageHeader";
import { usePageTitle } from "../hooks/usePageTitle";

const TITLE = "Không tìm thấy trang";

// Gõ sai địa chỉ thì vào đây, thay vì thấy một trang trắng.
export function NotFoundPage() {
  const headingRef = usePageTitle(TITLE);

  return (
    <>
      <PageHeader
        title={TITLE}
        headingRef={headingRef}
        breadcrumbs={[{ label: "Nhân sự" }, { label: TITLE }]}
      />
      <div className="page-body">
        <section className="panel">
          <div className="status status--empty">
            <span className="status__icon" aria-hidden="true">
              <Icon name="inbox" size={1.5} />
            </span>
            <p className="status__message">
              Đường dẫn này không tồn tại hoặc đã bị đổi.
            </p>
            <p className="status__description">
              Kiểm tra lại địa chỉ, hoặc quay về danh sách nhân viên.
            </p>
            <Link className="btn btn--primary" to="/employees">
              <Icon name="arrowLeft" />
              Về danh sách nhân viên
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
