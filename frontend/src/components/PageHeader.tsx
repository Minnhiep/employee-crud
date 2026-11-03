import { Fragment } from "react";
import type { ReactNode, Ref } from "react";
import { Link } from "react-router";
import { Icon } from "./Icon";

/** Một mục trên đường dẫn trang; mục có `to` là liên kết, mục cuối là trang hiện tại. */
export type Breadcrumb = { label: string; to?: string };

type PageHeaderProps = {
  /** Tên trang, hiện ở h1. */
  title: string;
  /**
   * Ref lấy từ usePageTitle(title) của trang. Trang giữ ref này để tự đưa focus về tiêu đề khi cần
   * (ví dụ sau khi xóa một dòng, dòng đó biến mất cùng nút đang được focus).
   */
  headingRef: Ref<HTMLHeadingElement>;
  /** Đường dẫn trang, ví dụ [{ label: "Nhân sự" }, { label: "Nhân viên", to: "/employees" }, { label: "Thêm mới" }]. */
  breadcrumbs: Breadcrumb[];
  /** Một dòng giải thích trang dùng để làm gì. */
  description?: string;
  /** Nút chính của trang (ví dụ "Thêm nhân viên"), đặt bên phải tiêu đề. */
  actions?: ReactNode;
};

/**
 * Dải đầu trang màu trắng, tràn ngang vùng nội dung (kiểu "page header" của phần mềm quản trị):
 * đường dẫn trang, tiêu đề, mô tả bên trái; nút chính bên phải.
 * Nội dung trang đặt sau dải này, trong <div className="page-body">.
 */
export function PageHeader({
  title,
  headingRef,
  breadcrumbs,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header__inner">
        <nav className="breadcrumb" aria-label="Đường dẫn">
          <ol className="breadcrumb__list">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <Fragment key={item.label}>
                  <li className="breadcrumb__item">
                    {item.to && !isLast ? (
                      <Link to={item.to}>{item.label}</Link>
                    ) : (
                      <span aria-current={isLast ? "page" : undefined}>
                        {item.label}
                      </span>
                    )}
                  </li>
                  {!isLast && (
                    <li className="breadcrumb__separator" aria-hidden="true">
                      <Icon name="chevronRight" size={1} />
                    </li>
                  )}
                </Fragment>
              );
            })}
          </ol>
        </nav>
        <div className="page-header__row">
          <div className="page-header__text">
            <h1 ref={headingRef} tabIndex={-1}>
              {title}
            </h1>
            {description && (
              <p className="page-header__description">{description}</p>
            )}
          </div>
          {actions && <div className="page-header__actions">{actions}</div>}
        </div>
      </div>
    </header>
  );
}
