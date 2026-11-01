import type { ReactNode } from "react";

/** Một cột của bảng: tiêu đề và cách lấy giá trị ô từ một dòng. */
export type DataTableColumn<Row> = {
  key: string;
  header: string;
  render: (row: Row) => ReactNode;
};

type DataTableProps<Row extends { id: number }> = {
  caption: string;
  columns: DataTableColumn<Row>[];
  rows: Row[];
  /** Vẽ nút Sửa/Xóa cho mỗi dòng (nút có aria-label ghi đủ tên mục). */
  renderActions?: (row: Row) => ReactNode;
};

/**
 * Bảng danh sách dùng chung cho nhân viên và phòng ban.
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
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} scope="col">
                {column.header}
              </th>
            ))}
            {renderActions && <th scope="col">Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
              {renderActions && (
                <td>
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
