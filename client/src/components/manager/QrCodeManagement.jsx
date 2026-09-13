import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import api from "../../services/api";

export default function QrCodeManagement() {
  const [qrCode, setQrCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
const [qrStatusTarget, setQrStatusTarget] = useState(false);
  async function loadQrCode() {
    try {
      setError("");
      setIsLoading(true);

      const response = await api.get("/qr-code");
      setQrCode(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load QR code."
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
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to generate new QR code."
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
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update QR code status."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  function downloadQrCode() {
    const canvas = document.getElementById("restaurant-qr-code");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "restaurant-menu-qr-code.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function printQrCode() {
    const canvas = document.getElementById("restaurant-qr-code");
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
        <body style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; padding: 40px;">
          <h1 style="color: #172554; margin-bottom: 8px;">Scan to View Our Menu</h1>
          <p style="color: #64748B; font-size: 16px; margin-bottom: 24px;">Point your camera or QR reader at the code below to browse food and place orders.</p>
          <img src="${image}" alt="Restaurant Menu QR Code" style="max-width: 320px; border: 1px solid #E2E8F0; padding: 16px; border-radius: 12px;" />
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

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-secondary)" }}>
        Loading QR code system...
      </div>
    );
  }

  if (error && !qrCode) {
    return (
      <div className="modern-data-panel" style={{ padding: "32px", textAlign: "center" }}>
        <p style={{ color: "#DC2626", marginBottom: "16px" }}>{error}</p>
        <button
          type="button"
          className="btn-primary-action"
          onClick={loadQrCode}
        >
          Try Again
        </button>
      </div>
    );
  }

  const menuUrl = `${window.location.origin}/menu/${qrCode.token}`;

  return (
    <div className="manager-page-view">
      {error && <div className="staff-error-banner">{error}</div>}

      <div className="qr-split-layout">
        {/* Left Column: QR Code Preview Panel */}
        <div className="qr-preview-panel">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <span
              className={`status-pill ${
                qrCode.isActive ? "active" : "inactive"
              }`}
            >
              ● {qrCode.isActive ? "QR Active" : "QR Disabled"}
            </span>
          </div>

          <div className="qr-canvas-frame">
            <QRCodeCanvas
              id="restaurant-qr-code"
              value={menuUrl}
              size={240}
              level="H"
            />
          </div>

          <p className="qr-caption-text">
            Place this QR code on dining tables, counters, or window stands for contactless customer ordering.
          </p>

          {qrCode.expiresAtUtc && (
            <div className="qr-expiry-text">
              ⏱ Previous QR active until:{" "}
              {new Date(qrCode.expiresAtUtc).toLocaleString()}
            </div>
          )}
        </div>

        {/* Right Column: Actions & Direct Link */}
        <div className="qr-actions-panel">
          {/* Direct Menu Link Card */}
          <div className="qr-action-card">
            <h3 className="qr-action-title">Direct Digital Menu Link</h3>
            <p className="qr-action-desc">
              Customers scanning the QR code will be routed directly to this secure ordering URL.
            </p>

            <div className="qr-link-copy-box">
              <span className="qr-link-text">{menuUrl}</span>
              <button
                type="button"
                className="btn-table-action edit"
                onClick={() => handleCopyLink(menuUrl)}
              >
                {copiedLink ? "✓ Copied!" : "Copy Link"}
              </button>
            </div>
          </div>
{qrStatusTarget && (
  <div
    className="modal-backdrop"
    onClick={() => setQrStatusTarget(false)}
  >
    <div
      className="delete-confirm-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="delete-confirm-icon">
        ⚠
      </div>

      <h3 className="delete-confirm-title">
        {qrCode.isActive
          ? "Disable QR Code?"
          : "Enable QR Code?"}
      </h3>

      <p className="delete-confirm-message">
        Are you sure you want to{" "}
        <strong>
          {qrCode.isActive ? "disable" : "enable"} the
          restaurant QR code?
        </strong>
      </p>

      {qrCode.isActive && (
        <p className="delete-confirm-warning">
          Customers will no longer be able to access the menu
          using this QR code.
        </p>
      )}

      <div className="delete-confirm-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setQrStatusTarget(false)}
        >
          Cancel
        </button>

        <button
          type="button"
          className={qrCode.isActive ? "btn-danger" : "btn-primary"}
          onClick={async () => {
            await toggleQrCode();
            setQrStatusTarget(false);
          }}
        >
          {qrCode.isActive ? "Disable QR Code" : "Enable QR Code"}
        </button>
      </div>
    </div>
  </div>
)}
          {/* Management Controls Card */}
          <div className="qr-action-card">
            <h3 className="qr-action-title">QR Code Operations</h3>
            <p className="qr-action-desc">
              Generate new security tokens, temporarily disable ordering, or download print-ready assets.
            </p>

            <div className="qr-btn-group">
              <button
                type="button"
                className="btn-primary-action"
                onClick={generateNewQrCode}
                disabled={isUpdating}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                </svg>
                {isUpdating ? "Processing..." : "Generate New QR"}
              </button>

              <button
                type="button"
                className={`btn-table-action ${qrCode.isActive ? "delete" : "edit"}`}
                style={{ height: "40px", padding: "0 16px" }}
                onClick={() => setQrStatusTarget(true)}
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
                className="btn-secondary"
                onClick={downloadQrCode}
                disabled={!qrCode.isActive}
              >
                Download PNG
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={printQrCode}
                disabled={!qrCode.isActive}
              >
                Print Signage
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}