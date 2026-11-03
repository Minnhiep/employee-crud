import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useParams,
} from "react-router";
import { AppLayout } from "./components/AppLayout";
import { DepartmentDetailPage } from "./pages/departments/DepartmentDetailPage";
import { DepartmentFormPage } from "./pages/departments/DepartmentFormPage";
import { DepartmentsPage } from "./pages/departments/DepartmentsPage";
import { EmployeeFormPage } from "./pages/employees/EmployeeFormPage";
import { EmployeesPage } from "./pages/employees/EmployeesPage";
import { NotFoundPage } from "./pages/NotFoundPage";

/**
 * Form sửa nhân viên có key theo id (rà soát U3): đang sửa người A mà gõ địa chỉ sửa người B
 * thì form được tạo mới và nạp đúng người B, không giữ dữ liệu của A.
 */
function EmployeeEditRoute() {
  const { id } = useParams();
  return <EmployeeFormPage key={`edit-${id}`} mode="edit" />;
}

/** Cùng cách với form sửa nhân viên (rà soát tổng thể A-13): đổi id thì form phòng ban được tạo mới. */
function DepartmentEditRoute() {
  const { id } = useParams();
  return <DepartmentFormPage key={`edit-${id}`} mode="edit" />;
}

/** Trang chi tiết phòng ban (FR8.2) cũng tạo mới theo id, để không lẫn dữ liệu khi đi từ phòng này sang phòng khác. */
function DepartmentDetailRoute() {
  const { id } = useParams();
  return <DepartmentDetailPage key={`detail-${id}`} />;
}

/**
 * Bảng đường dẫn của ứng dụng. Chuyển trang ngay trong trình duyệt, không tải lại cả trang.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* replace: không để "/" lại trong lịch sử, bấm Quay lại không bị kẹt. */}
          <Route index element={<Navigate to="/employees" replace />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route
            path="employees/new"
            element={<EmployeeFormPage key="create" mode="create" />}
          />
          <Route path="employees/:id/edit" element={<EmployeeEditRoute />} />
          <Route path="departments" element={<DepartmentsPage />} />
          {/* key khác nhau: đi từ form sửa sang form thêm thì form được tạo mới, không giữ dữ liệu cũ. */}
          <Route
            path="departments/new"
            element={<DepartmentFormPage key="create" mode="create" />}
          />
          <Route path="departments/:id" element={<DepartmentDetailRoute />} />
          <Route
            path="departments/:id/edit"
            element={<DepartmentEditRoute />}
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
