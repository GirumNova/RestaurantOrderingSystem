import { useAuth } from "../../context/AuthContext";
import { login } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
export default function LoginPage() {
  const { auth, loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
  if (auth) {
    if (auth.role === 1) {
      navigate("/manager", { replace: true });
    } else if (auth.role === 2) {
      navigate("/staff", { replace: true });
    }
  }
}, [auth, navigate]);
  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const data = await login(email, password);

      loginUser(data);

if (data.role === 1) {
  navigate("/manager", { replace: true });
} else if (data.role === 2) {
  navigate("/staff", { replace: true });
}
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Invalid email or password."
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <h1>Restaurant Ordering System</h1>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Password</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </main>
  );
}