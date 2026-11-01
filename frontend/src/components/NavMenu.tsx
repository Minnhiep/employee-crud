import { NavLink } from "react-router";

const LINKS = [
  { to: "/employees", label: "Nhân viên" },
  { to: "/departments", label: "Phòng ban" },
] as const;

// NavLink tự thêm aria-current="page" cho mục đang mở, kể cả khi ở trang con
// (ví dụ /employees/new vẫn đánh dấu "Nhân viên").
export function NavMenu() {
  return (
    <nav aria-label="Chính">
      <ul className="nav__list">
        {LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              className={({ isActive }) =>
                isActive ? "nav__link nav__link--active" : "nav__link"
              }
            >
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
