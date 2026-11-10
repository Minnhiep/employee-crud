import { Link, Outlet } from "react-router";
import { BrandMark } from "./Icon";
import { NavMenu } from "./NavMenu";
import { Toast } from "./Toast";

/**
 * Khung chung của mọi trang, kiểu phần mềm quản trị: thanh bên trái (logo + menu) và vùng nội dung.
 * Màn hẹp dưới 960px: thanh bên thành thanh ngang trên cùng (xem components.css).
 * Trang con được React Router vẽ vào chỗ <Outlet />.
 */
export function AppLayout() {
  return (
    <div className="app">
      <a className="skip-link" href="#noi-dung">
        Bỏ qua, tới nội dung chính
      </a>
      {/* Thanh bên là phần đầu trang (logo + menu chính) nên dùng <header>, không dùng <aside>. */}
      <header className="sidebar">
        <Link className="sidebar__brand" to="/employees">
          <BrandMark />
          <span className="sidebar__brand-name">Quản lý nhân sự</span>
        </Link>
        <NavMenu />
      </header>
      {/* tabIndex -1 để liên kết bỏ qua đưa được focus vào đây. */}
      <main id="noi-dung" className="app__main" tabIndex={-1}>
        {/* Thông báo thành công dùng chung cho mọi trang, có sẵn trước khi trang nào gửi lời báo (xem Toast). */}
        <Toast />
        <Outlet />
      </main>
    </div>
  );
}
