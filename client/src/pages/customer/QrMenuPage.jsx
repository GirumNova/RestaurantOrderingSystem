import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

export default function QrMenuPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function validateQrCode() {
      try {
        await api.get(`/qr-code/${token}`);

        navigate("/menu", { replace: true });
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "This restaurant menu is currently unavailable."
        );
        setIsLoading(false);
      }
    }

    validateQrCode();
  }, [token, navigate]);

  if (isLoading) {
    return (
      <main>
        <h1>Restaurant Menu</h1>
        <p>Checking QR code...</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Menu Unavailable</h1>

      <p>{error}</p>
    </main>
  );
}