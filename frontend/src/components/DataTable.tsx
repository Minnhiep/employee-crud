import type { ReactNode } from "react";

/** Một cột của bảng: tiêu đề và cách lấy giá trị ô từ một dòng. */
export type DataTableColumn<Row> = {
  key: string;
  header: string;
  render: (row: Row) => ReactNode;
  /** "end": căn phải cả tiêu đề lẫn ô, dùng cho cột số. */
  align?: "end";
};

type DataTableProps<Row extends { id: number }> = {
  /** Tên bảng cho trình đọc màn hình (ẩn khỏi mắt vì tấm chứa bảng đã có tiêu đề). */
  caption: string;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  /** Vẽ nút Sửa/Xóa cho mỗi dòng (nút có aria-label ghi đủ tên mục). */
  renderActions?: (row: Row) => ReactNode;
};

/**
 * Bảng danh sách dùng chung cho nhân viên và phòng ban, đặt bên trong tấm nội dung (class "panel").
 * Không có dòng nào thì không vẽ gì: trang cha hiện StatusMessage kind="empty".
 */
export function DataTable<Row extends { id: number }>({
  caption,
  columns,
  rows,
  renderActions,
}: DataTableProps<Row>) {
  if (rows.length === 0) {
    return null;
  }

  return (
    // Khung cuộn ngang nhận được focus để người dùng bàn phím cuộn được bảng rộng.
    <div className="table-wrap" role="region" aria-label={caption} tabIndex={0}>
      <table className="table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={
                  column.align === "end" ? "table__cell--end" : undefined
                }
              >
                {column.header}
              </th>
            ))}
            {renderActions && (
              <th scope="col" className="table__actions-header">
                Thao tác
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={
                    column.align === "end" ? "table__cell--end" : undefined
                  }
                >
                  {column.render(row)}
                </td>
              ))}
              {renderActions && (
                <td className="table__actions-cell">
                  <div className="table__actions">{renderActions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
