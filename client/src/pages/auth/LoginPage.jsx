import { useAuth } from "../../context/AuthContext";
import { login } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./LoginPage.css";

export default function LoginPage() {
  const { auth, loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="login-page">
      {/* Left branding section */}
      <section className="login-brand-panel">
        <div className="login-brand-overlay" />

        <div className="login-brand-content">
          <div className="login-brand-logo">
            <span>🍽</span>
          </div>

          <div className="login-brand-text">
            <span className="login-brand-label">RESTAURANT</span>

            <h1>
              Restaurant
              <br />
              Ordering System
            </h1>

            <p>
              Everything you need to manage your restaurant,
              <br />
              serve your team, and delight your customers.
            </p>
          </div>

          <div className="login-brand-footer">
            <div className="login-brand-line" />

            <span>Restaurant Management Platform</span>
          </div>
        </div>
      </section>

      {/* Right login section */}
      <section className="login-form-panel">
        <div className="login-form-container">
          <div className="login-mobile-logo">
            <div className="login-mobile-logo-icon">🍽</div>
            <span>Restaurant System</span>
          </div>

          <div className="login-header">
            <span className="login-welcome">WELCOME BACK</span>

            <h2>Sign in to your account</h2>

            <p>
              Enter your credentials below to access your
              dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="email">Email address</label>

              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" />
                    <path d="m22 6-10 7L2 6" />
                  </svg>
                </span>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <div className="login-label-row">
                <label htmlFor="password">Password</label>
              </div>

              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect
                      x="3"
                      y="10"
                      width="18"
                      height="11"
                      rx="2"
                    />
                    <path d="M7 10V7a5 5 0 0 1 10 0v3" />
                  </svg>
                </span>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                      <path d="m4 4 16 16" />
                    </svg>
                  ) : (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>

                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="login-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 12h14" />
                    <path d="m13 6 6 6-6 6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="login-security">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6l-7-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>

            <span>Your connection is secure</span>
          </div>
        </div>
      </section>
    </main>
  );
}