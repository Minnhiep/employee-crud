/**
 * Bộ icon SVG tự vẽ (lưới 24x24, nét 1.75px), không thêm gói icon.
 * Icon chỉ để nhìn: luôn đi kèm chữ, nên ẩn khỏi trình đọc màn hình (aria-hidden), WCAG 1.1.1.
 * Màu lấy theo chữ xung quanh (currentColor), cỡ mặc định bằng 1.25 lần cỡ chữ.
 */
const PATHS = {
  users: (
    <>
      <path d="M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19" />
      <circle cx="10" cy="7.5" r="3.5" />
      <path d="M20 19v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.15a3.5 3.5 0 0 1 0 6.7" />
    </>
  ),
  building: (
    <>
      <path d="M4 20V5.5A1.5 1.5 0 0 1 5.5 4h7A1.5 1.5 0 0 1 14 5.5V20" />
      <path d="M14 9.5h4.5A1.5 1.5 0 0 1 20 11v9M2.5 20h19" />
      <path d="M7.5 8h3M7.5 11.5h3M7.5 15h3M17 13.5h0M17 16.5h0" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.4-4.4" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  trash: (
    <>
      <path d="M4 7h16M10 11v6M14 11v6" />
      <path d="M6 7l1 12a2 2 0 0 0 2 1.8h6a2 2 0 0 0 2-1.8L18 7M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </>
  ),
  alertCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.5h0" />
    </>
  ),
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 4.5-5" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  chevronRight: <path d="m10 6 6 6-6 6" />,
  refresh: (
    <>
      <path d="M20 11a8 8 0 0 0-14.3-4.9L4 8" />
      <path d="M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16" />
      <path d="M20 20v-4h-4" />
    </>
  ),
  inbox: (
    <>
      <path d="M4 13.5 6.2 6.4A2 2 0 0 1 8.1 5h7.8a2 2 0 0 1 1.9 1.4l2.2 7.1V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-4.5Z" />
      <path d="M4 13.5h4.5l1 2h5l1-2H20" />
    </>
  ),
  arrowLeft: <path d="M19 12H5M11 6l-6 6 6 6" />,
} as const;

export type IconName = keyof typeof PATHS;

type IconProps = {
  name: IconName;
  /** Cỡ icon theo em (so với cỡ chữ của phần tử chứa nó). */
  size?: number;
  className?: string;
};

export function Icon({ name, size = 1.25, className }: IconProps) {
  return (
    <svg
      className={className ? `icon ${className}` : "icon"}
      width={`${size}em`}
      height={`${size}em`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  );
}

/**
 * Dấu logo của ứng dụng ở thanh bên: khối vuông bo góc có hình hai người.
 * Cỡ 1.75rem, cùng số với .brand-mark trong components.css (CSS quyết định cỡ hiển thị; thuộc tính ở đây chỉ để
 * logo đúng cỡ ngay cả khi CSS chưa tải xong).
 */
export function BrandMark() {
  return (
    <svg
      className="brand-mark"
      width="1.75rem"
      height="1.75rem"
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
      <circle cx="13" cy="12" r="4" fill="var(--color-on-primary)" />
      <path
        d="M6 24.5c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5"
        fill="var(--color-on-primary)"
      />
      <circle cx="22" cy="13" r="3" fill="var(--color-brand-accent)" />
      <path
        d="M21 18.2c3 .4 5 2.8 5 5.8h-4.2"
        fill="var(--color-brand-accent)"
      />
    </svg>
  );
}
