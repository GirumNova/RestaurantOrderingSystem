import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import api from "../../services/api";

export default function QrCodeManagement() {
  const [qrCode, setQrCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");

  async function loadQrCode() {
    try {
      setError("");
      setIsLoading(true);

      const response = await api.get("/qr-code");
      setQrCode(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load QR code."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadQrCode();
  }, []);

  async function generateNewQrCode() {
    const confirmed = window.confirm(
      "Generate a new QR code? The current QR code will remain valid for 24 hours."
    );

    if (!confirmed) return;

    try {
      setError("");
      setIsUpdating(true);

      const response = await api.post("/qr-code/generate");

      setQrCode(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to generate new QR code."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function toggleQrCode() {
    if (!qrCode) return;

    try {
      setError("");
      setIsUpdating(true);

      const response = await api.put("/qr-code/status", {
        isActive: !qrCode.isActive,
      });

      setQrCode(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update QR code status."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  function downloadQrCode() {
    const canvas = document.getElementById(
      "restaurant-qr-code"
    );

    if (!canvas) return;

    const link = document.createElement("a");

    link.download = "restaurant-menu-qr-code.png";
    link.href = canvas.toDataURL("image/png");

    link.click();
  }

  function printQrCode() {
    const canvas = document.getElementById(
      "restaurant-qr-code"
    );

    if (!canvas) return;

    const image = canvas.toDataURL("image/png");

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setError("Please allow pop-ups to print the QR code.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Restaurant Menu QR Code</title>
        </head>

        <body
          style="
            text-align: center;
            font-family: Arial, sans-serif;
            padding: 40px;
          "
        >
          <h1>Scan to View Our Menu</h1>

          <img
            src="${image}"
            alt="Restaurant Menu QR Code"
          />

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  if (isLoading) {
    return <p>Loading QR code...</p>;
  }

  if (error && !qrCode) {
    return (
      <section>
        <h2>QR Code Management</h2>

        <p>{error}</p>

        <button type="button" onClick={loadQrCode}>
          Try Again
        </button>
      </section>
    );
  }

  const menuUrl =
    `${window.location.origin}/menu/${qrCode.token}`;

  return (
    <section>
      <h2>QR Code Management</h2>

      <p>
        Status:{" "}
        <strong>
          {qrCode.isActive ? "Active" : "Disabled"}
        </strong>
      </p>

      <QRCodeCanvas
        id="restaurant-qr-code"
        value={menuUrl}
        size={256}
        level="H"
      />

      <p>
        Customers scan this QR code to access the restaurant
        menu.
      </p>

      {qrCode.expiresAtUtc && (
        <p>
          Previous QR expires:{" "}
          {new Date(qrCode.expiresAtUtc).toLocaleString()}
        </p>
      )}

      {error && <p>{error}</p>}

      <div>
        <button
          type="button"
          onClick={generateNewQrCode}
          disabled={isUpdating}
        >
          {isUpdating
            ? "Processing..."
            : "Generate New QR Code"}
        </button>

        <button
          type="button"
          onClick={toggleQrCode}
          disabled={isUpdating}
        >
          {isUpdating
            ? "Processing..."
            : qrCode.isActive
              ? "Disable QR Code"
              : "Enable QR Code"}
        </button>

        <button
          type="button"
          onClick={downloadQrCode}
          disabled={!qrCode.isActive}
        >
          Download QR Code
        </button>

        <button
          type="button"
          onClick={printQrCode}
          disabled={!qrCode.isActive}
        >
          Print QR Code
        </button>
      </div>
    </section>
  );
}