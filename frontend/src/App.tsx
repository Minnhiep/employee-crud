import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AppLayout } from "./components/AppLayout";
import { DepartmentsPage } from "./pages/DepartmentsPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { NotFoundPage } from "./pages/NotFoundPage";

/**
 * Bảng đường dẫn của ứng dụng. Chuyển trang ngay trong trình duyệt, không tải lại cả trang.
 * U3 thêm /departments/new, /departments/:id/edit; U4 thêm /employees/new, /employees/:id/edit.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* replace: không để "/" lại trong lịch sử, bấm Quay lại không bị kẹt. */}
          <Route index element={<Navigate to="/employees" replace />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="departments" element={<DepartmentsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
