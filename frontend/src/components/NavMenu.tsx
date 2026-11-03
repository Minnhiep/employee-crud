import { NavLink } from "react-router";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

const LINKS: { to: string; label: string; icon: IconName }[] = [
  { to: "/employees", label: "Nhân viên", icon: "users" },
  { to: "/departments", label: "Phòng ban", icon: "building" },
];

// NavLink tự thêm aria-current="page" cho mục đang mở, kể cả khi ở trang con
// (ví dụ /employees/new vẫn đánh dấu "Nhân viên").
export function NavMenu() {
  return (
    <nav className="nav" aria-label="Chính">
      <ul className="nav__list">
        {LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                isActive ? "nav__link nav__link--active" : "nav__link"
              }
            >
              <Icon name={link.icon} />
              <span>{link.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
