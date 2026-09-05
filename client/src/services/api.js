import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5251/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const storedAuth = localStorage.getItem("restaurant_auth");

    if (storedAuth) {
      try {
        const auth = JSON.parse(storedAuth);

        if (auth.accessToken) {
          config.headers.Authorization = `Bearer ${auth.accessToken}`;
        }
      } catch {
        localStorage.removeItem("restaurant_auth");
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;