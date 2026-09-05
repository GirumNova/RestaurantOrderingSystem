import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = "restaurant_auth";

function getStoredAuth() {
  const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!storedAuth) {
    return null;
  }

  try {
    return JSON.parse(storedAuth);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(getStoredAuth);

  useEffect(() => {
    if (auth) {
      localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify(auth)
      );
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [auth]);

  function loginUser(loginResponse) {
    setAuth(loginResponse);
  }

  function logout() {
    setAuth(null);
  }

  const value = {
    auth,
    isAuthenticated: !!auth,
    loginUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider."
    );
  }

  return context;
}