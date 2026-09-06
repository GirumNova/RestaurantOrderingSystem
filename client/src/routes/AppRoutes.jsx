import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import ProtectedRoute from "./ProtectedRoute";
import StaffDashboard from "../pages/staff/StaffDashboard";
import CustomerMenuPage from "../pages/customer/CustomerMenuPage";
import CartPage from "../pages/customer/CartPage";
import QrMenuPage from "../pages/customer/QrMenuPage";
import RoleRoute from "./RoleRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/login" element={<LoginPage />} />
    <Route
  path="/menu"
  element={<CustomerMenuPage />}
/>
<Route
  path="/menu/:token"
  element={<QrMenuPage />}
/>
<Route
  path="/cart"
  element={<CartPage />}
/>
    <Route element={<ProtectedRoute />}>
    <Route element={<RoleRoute allowedRoles={[1]} />}>
        <Route
        path="/manager"
        element={<ManagerDashboard />}
        />
    </Route>
    </Route>
    <Route element={<ProtectedRoute />}>
  <Route element={<RoleRoute allowedRoles={[2]} />}>
    <Route
      path="/staff"
      element={<StaffDashboard />}
    />
  </Route>
</Route>
    </Routes>
  );
}