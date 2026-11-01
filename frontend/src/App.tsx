import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { AppLayout } from "./components/AppLayout";
import { DepartmentFormPage } from "./pages/departments/DepartmentFormPage";
import { DepartmentsPage } from "./pages/departments/DepartmentsPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { NotFoundPage } from "./pages/NotFoundPage";

/**
 * Bảng đường dẫn của ứng dụng. Chuyển trang ngay trong trình duyệt, không tải lại cả trang.
 * U4 thêm /employees/new, /employees/:id/edit.
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
          {/* key khác nhau: đi từ form sửa sang form thêm thì form được tạo mới, không giữ dữ liệu cũ. */}
          <Route
            path="departments/new"
            element={<DepartmentFormPage key="create" mode="create" />}
          />
          <Route
            path="departments/:id/edit"
            element={<DepartmentFormPage key="edit" mode="edit" />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
