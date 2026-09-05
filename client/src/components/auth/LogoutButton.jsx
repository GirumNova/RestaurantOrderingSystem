import { useAuth } from "../../context/AuthContext";

export default function LogoutButton() {
  const { logout } = useAuth();

  function handleLogout() {
    logout();
  }

  return (
    <button type="button" onClick={handleLogout}>
      Logout
    </button>
  );
}