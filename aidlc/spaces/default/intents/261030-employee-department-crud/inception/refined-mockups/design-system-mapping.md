# Hệ thống giao diện (Design System Mapping)

> **Nguồn:**
> - Q1: CSS thuần, không thêm thư viện.
> - Q9-B: giao diện thống nhất, dùng biến CSS chung.
> - Q7: đạt WCAG 2.1 AA.
>
> Dự án chưa có hệ thống giao diện sẵn có, nên file này định nghĩa một bộ biến CSS nhỏ (design tokens). Mọi component trong `interaction-spec.md` chỉ dùng các biến này. Nhờ vậy nút, bảng và form trông giống nhau ở mọi trang.

## 1. Cách tổ chức CSS

| File | Nội dung |
|---|---|
| `src/styles/tokens.css` | Toàn bộ biến `:root` dưới đây |
| `src/styles/base.css` | Kiểu nền cho thẻ HTML: `body`, tiêu đề, liên kết, `:focus-visible`, `.sr-only` (ẩn khỏi mắt nhưng trình đọc màn hình vẫn đọc), `prefers-reduced-motion` |
| `src/styles/components.css` | Class cho nút, bảng, form, thông báo (mục 4) |

- Không dùng thư viện CSS và không dùng CSS-in-JS. Class đặt tên theo kiểu `khối__phần--biến-thể` (BEM), viết bằng tiếng Anh, ví dụ `btn--danger`, `form__error`.
- Prettier định dạng cả file CSS (Q9 của Practices Discovery).

## 2. Biến màu

Tỉ lệ tương phản dưới đây là số ước tính (≈) theo công thức WCAG. Bước Build and Test đo lại bằng công cụ.

| Biến | Giá trị | Dùng cho | Tương phản |
|---|---|---|---|
| `--color-text` | `#1f2937` | Chữ chính | ≈ 14.7:1 trên nền trắng |
| `--color-text-muted` | `#4b5563` | Chữ phụ, gợi ý dưới ô | ≈ 7.6:1 trên nền trắng |
| `--color-bg` | `#ffffff` | Nền trang | — |
| `--color-surface` | `#f3f4f6` | Nền header, dòng tiêu đề bảng | Chữ chính ≈ 13.4:1 |
| `--color-border` | `#6b7280` | Viền ô nhập và bảng | ≈ 4.8:1 (≥ 3:1 cho thành phần giao diện) |
| `--color-primary` | `#1d4ed8` | Nút chính, liên kết, viền focus | Chữ trắng trên nền này ≈ 6.7:1 |
| `--color-primary-hover` | `#1e40af` | Nút chính khi di chuột | Chữ trắng ≈ 8.7:1 |
| `--color-danger` | `#b91c1c` | Nút Xóa, chữ lỗi, viền ô lỗi | Chữ trắng ≈ 6.5:1; trên nền trắng ≈ 6.5:1 |
| `--color-danger-bg` | `#fef2f2` | Nền khung lỗi | Chữ `--color-danger` ≈ 6.0:1 |
| `--color-success` | `#166534` | Chữ thông báo thành công | Trên `--color-success-bg` ≈ 6.9:1 |
| `--color-success-bg` | `#f0fdf4` | Nền thông báo thành công | — |
| `--color-focus` | `#1d4ed8` | Viền focus | ≥ 3:1 với nền trắng và nền xám |

Không trạng thái nào được báo chỉ bằng màu:
- Lỗi luôn có biểu tượng (!) và chữ.
- Thành công luôn có ✓ và chữ.
- Mục menu đang mở luôn có chữ đậm và gạch dưới.

## 3. Chữ, khoảng cách, viền

| Biến | Giá trị | Ghi chú |
|---|---|---|
| `--font-family` | `system-ui, "Segoe UI", Roboto, Arial, sans-serif` | Font có sẵn trên máy, hiển thị tốt tiếng Việt, không phải tải thêm (giúp điểm Performance) |
| `--font-size-base` | `1rem` (16px) | Dùng `rem` để phóng to trình duyệt 200% không vỡ giao diện |
| `--font-size-sm` | `0.875rem` | Gợi ý, dòng lỗi |
| `--font-size-h1` | `1.75rem` | Tiêu đề trang |
| `--line-height` | `1.5` | |
| `--space-1` … `--space-6` | `0.25rem, 0.5rem, 1rem, 1.5rem, 2rem, 3rem` | Thang khoảng cách 4–8–16–24–32–48 px |
| `--radius` | `4px` | |
| `--focus-ring` | `3px solid var(--color-focus)` + `outline-offset: 2px` | Dùng cho mọi `:focus-visible`. Không bao giờ dùng `outline: none` |
| `--content-max-width` | `1100px` | |
| `--control-min-height` | `2.75rem` (44px) | Chiều cao tối thiểu của nút và ô nhập |

## 4. Component → thẻ HTML → class

| Component (`interaction-spec.md`) | Thẻ HTML gốc | Class |
|---|---|---|
| AppLayout | `header`, `nav`, `main`, `a.skip-link` | `layout`, `layout__header`, `skip-link` |
| NavMenu | `nav > ul > li > a` (NavLink) | `nav`, `nav__link`, `nav__link--active` |
| Nút chính (Lưu, + Thêm) | `button` hoặc `a` | `btn btn--primary` |
| Nút phụ (Hủy, Sửa, Tìm) | `button` hoặc `a` | `btn btn--secondary` |
| Nút Xóa | `button` | `btn btn--danger` |
| Nút đang khóa | `button[disabled]` | `btn[disabled]`: con trỏ `not-allowed`, độ mờ 0.6, chữ vẫn đủ tương phản |
| DataTable | `div[role=region] > table > caption, thead, tbody` | `table-wrap`, `table` |
| SearchBox | `form[role=search] > label, input[type=search], button` | `search` |
| Form | `form > div.field > label, input/select, p.hint, p.error` | `form`, `field`, `field__hint`, `field__error`, `field--invalid` |
| Khung tóm tắt lỗi | `div[role=alert] > ul > li > a` | `alert alert--error` |
| StatusMessage | `div[role=status \| alert]` | `status status--loading \| --error \| --empty` |
| Toast | `div[role=status]` | `alert alert--success` |
| Văn bản chỉ cho trình đọc màn hình | `span` | `sr-only` |

## 5. Màn hình hẹp (Q5)

- Thiết kế chính cho màn hình từ 1024px.
- Từ 1023px trở xuống:
  - Menu tự xuống dòng.
  - Form vốn đã là một cột.
  - Bảng nằm trong `table-wrap` có `overflow-x: auto`.
- WCAG 1.4.10 (Reflow): ở bề rộng 320px, nội dung không bắt cuộn hai chiều. Bảng dữ liệu được ngoại lệ, chỉ cuộn ngang trong khung của nó. Phóng to trình duyệt 200% thì chữ vẫn đọc được, không bị cắt (WCAG 1.4.4).
