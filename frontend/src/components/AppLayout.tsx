import { Outlet } from "react-router";
import { NavMenu } from "./NavMenu";

/**
 * Khung chung của mọi trang: liên kết bỏ qua, header có menu, vùng nội dung chính.
 * Trang con được React Router vẽ vào chỗ <Outlet />.
 */
export function AppLayout() {
  return (
    <>
      <a className="skip-link" href="#noi-dung">
        Bỏ qua, tới nội dung chính
      </a>
      <header className="layout__header">
        <div className="layout__header-inner">
          <p className="layout__brand">Quản lý nhân sự</p>
          <NavMenu />
        </div>
      </header>
      {/* tabIndex -1 để liên kết bỏ qua đưa được focus vào đây. */}
      <main id="noi-dung" className="layout__main" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  );
}
