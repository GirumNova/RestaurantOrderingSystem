import LogoutButton from "../../components/auth/LogoutButton";
import CategoryManagement from "../../components/manager/CategoryManagement";
import MenuItemManagement from "../../components/manager/MenuItemManagement";
import QrCodeManagement from "../../components/manager/QrCodeManagement";
export default function ManagerDashboard() {
  return (
    <main>
      <h1>Manager Dashboard</h1>
      <p>Welcome, Manager.</p>

      <CategoryManagement />

      <hr />

      <MenuItemManagement />
      <QrCodeManagement />
      <LogoutButton />
    </main>
  );
}