import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import useSignalR from "../../hooks/useSignalR";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../../components/auth/LogoutButton";
import "./StaffDashboard.css";

const API_URL = "http://localhost:5251/api";

const statusLabels = {
  1: "Pending",
  2: "Preparing",
  3: "Ready",
  4: "Completed",
  5: "Rejected",
};

const orderTypeLabels = {
  1: "Dine-In",
  2: "Takeout",
};

export default function StaffDashboard() {
  const { auth } = useAuth();
  const { view } = useParams();
  const currentView = view || "orders";
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [newOrderNotification, setNewOrderNotification] = useState(null);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Preserve existing SignalR implementation
  useSignalR({
    OrderStatusUpdated: (updatedOrder) => {
      setOrders((currentOrders) => {
        const exists = currentOrders.some(
          (order) => order.orderNumber === updatedOrder.orderNumber
        );

        if (exists) {
          return currentOrders.map((order) =>
            order.orderNumber === updatedOrder.orderNumber
              ? updatedOrder
              : order
          );
        }

        return [...currentOrders, updatedOrder];
      });
    },

    NewOrderCreated: (newOrder) => {
      setOrders((currentOrders) => {
        const exists = currentOrders.some(
          (order) => order.orderNumber === newOrder.orderNumber
        );

        if (exists) {
          return currentOrders;
        }

        return [...currentOrders, newOrder];
      });

      setNewOrderNotification(newOrder);

      const audio = new Audio("/notification.mp3");
      audio.play().catch((audioErr) => {
        console.warn("Notification sound could not play:", audioErr);
      });

      setTimeout(() => {
        setNewOrderNotification(null);
      }, 6000);
    },
  });

  // Preserve existing order fetching
  useEffect(() => {
    async function loadOrders() {
      try {
        const storedAuth = localStorage.getItem("restaurant_auth");

        if (!storedAuth) {
          setError("Authentication information is missing.");
          return;
        }

        const authData = JSON.parse(storedAuth);

        const response = await axios.get(`${API_URL}/orders/staff`, {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
          },
        });

        setOrders(response.data);
      } catch (loadErr) {
        console.error("Failed to load staff orders:", loadErr);
        setError(
          loadErr.response?.data?.message || "Failed to load orders."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, []);

  // Preserve existing status update API call
  const updateOrderStatus = async (
    orderNumber,
    status,
    rejectionReason = null
  ) => {
    try {
      setActionLoading(orderNumber);
      setError("");

      const storedAuth = localStorage.getItem("restaurant_auth");

      if (!storedAuth) {
        setError("Authentication information is missing.");
        return;
      }

      const authData = JSON.parse(storedAuth);

      const response = await axios.put(
        `${API_URL}/orders/${orderNumber}/status`,
        {
          status,
          rejectionReason,
        },
        {
          headers: {
            Authorization: `Bearer ${authData.accessToken}`,
          },
        }
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.orderNumber === orderNumber ? response.data : order
        )
      );
    } catch (updateErr) {
      console.error("Failed to update order:", updateErr);
      setError(
        updateErr.response?.data?.message || "Failed to update order."
      );
    } finally {
      setActionLoading("");
    }
  };

  const handleAccept = (orderNumber) => {
    updateOrderStatus(orderNumber, 2);
  };

  const handleReject = (orderNumber) => {
    const reason = window.prompt("Enter the reason for rejecting this order:");

    if (!reason || !reason.trim()) {
      return;
    }

    updateOrderStatus(orderNumber, 5, reason.trim());
  };

  const handleReady = (orderNumber) => {
    updateOrderStatus(orderNumber, 3);
  };

  const handleComplete = (orderNumber) => {
    updateOrderStatus(orderNumber, 4);
  };

  const navigateTo = (viewKey) => {
    setMobileMenuOpen(false);
    if (viewKey === "orders") {
      navigate("/staff");
    } else {
      navigate(`/staff/${viewKey}`);
    }
  };

  // Filtered orders by status
  const pendingOrders = orders.filter((order) => order.status === 1);
  const preparingOrders = orders.filter((order) => order.status === 2);
  const readyOrders = orders.filter((order) => order.status === 3);
  const completedOrders = orders.filter((order) => order.status === 4);
  const rejectedOrders = orders.filter((order) => order.status === 5);

  const getHistoryOrders = () => {
    if (historyFilter === "completed") return completedOrders;
    if (historyFilter === "rejected") return rejectedOrders;
    return [...completedOrders, ...rejectedOrders];
  };

  function renderOrderCard(order) {
    const isActionLoading = actionLoading === order.orderNumber;
    const highlightClass =
      order.status === 1
        ? "pending-highlight"
        : order.status === 2
        ? "preparing-highlight"
        : order.status === 3
        ? "ready-highlight"
        : order.status === 4
        ? "completed-highlight"
        : "rejected-highlight";

    return (
      <article key={order.orderNumber} className={`order-card ${highlightClass}`}>
        <div className="order-card-header">
          <h3 className="order-number">#{order.orderNumber}</h3>
          <div className="order-meta-badges">
            <span className="order-type-badge">
              {orderTypeLabels[order.orderType] || "Order"}
            </span>
            <span className={`order-status-badge status-${order.status}`}>
              {statusLabels[order.status]}
            </span>
          </div>
        </div>

        <div className="order-items-wrapper">
          <span className="order-items-label">Ordered Items</span>
          <ul className="order-items-list">
            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => (
                <li key={item.menuItemId || index} className="order-item-row">
                  <div className="order-item-info">
                    <span className="order-item-qty">{item.quantity}×</span>
                    <span>{item.itemName}</span>
                  </div>
                  {item.lineTotal !== undefined && (
                    <span className="order-item-price">
                      ${Number(item.lineTotal).toFixed(2)}
                    </span>
                  )}
                </li>
              ))
            ) : (
              <li className="order-item-row">No item details</li>
            )}
          </ul>
        </div>

        {order.totalAmount !== undefined && (
          <div className="order-total-bar">
            <span className="order-total-label">Total Amount</span>
            <span className="order-total-amount">
              ${Number(order.totalAmount).toFixed(2)}
            </span>
          </div>
        )}

        {order.status === 5 && order.rejectionReason && (
          <div className="order-rejection-box">
            <strong>Reason:</strong> {order.rejectionReason}
          </div>
        )}

        {/* Status Actions */}
        {order.status === 1 && (
          <div className="order-actions-bar">
            <button
              type="button"
              className="staff-btn staff-btn-accept"
              onClick={() => handleAccept(order.orderNumber)}
              disabled={isActionLoading}
            >
              {isActionLoading ? "Processing..." : "Accept Order"}
            </button>
            <button
              type="button"
              className="staff-btn staff-btn-reject"
              onClick={() => handleReject(order.orderNumber)}
              disabled={isActionLoading}
            >
              Reject
            </button>
          </div>
        )}

        {order.status === 2 && (
          <div className="order-actions-bar">
            <button
              type="button"
              className="staff-btn staff-btn-ready"
              onClick={() => handleReady(order.orderNumber)}
              disabled={isActionLoading}
            >
              {isActionLoading ? "Processing..." : "✓ Mark as Ready"}
            </button>
          </div>
        )}

        {order.status === 3 && (
          <div className="order-actions-bar">
            <button
              type="button"
              className="staff-btn staff-btn-complete"
              onClick={() => handleComplete(order.orderNumber)}
              disabled={isActionLoading}
            >
              {isActionLoading ? "Processing..." : "✓ Complete Order"}
            </button>
          </div>
        )}
      </article>
    );
  }

  if (loading) {
    return (
      <div className="staff-loading-container">
        <div className="staff-spinner" />
        <p>Loading staff workspace...</p>
      </div>
    );
  }

  return (
    <div className="staff-dashboard-container">
      {/* Mobile backdrop */}
      {mobileMenuOpen && (
        <div
          className="staff-mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ==================================================
          LEFT SIDEBAR (Stationary 100vh with own scroll)
          ================================================== */}
      <aside className={`staff-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        {/* Branding */}
        <div className="staff-sidebar-branding">
          <div className="staff-branding-logo">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
              <path d="M15 2v10" />
              <path d="M21 2v18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V2" />
              <path d="M7 2v20" />
            </svg>
          </div>
          <div className="staff-branding-info">
            <span className="staff-branding-title">Kitchen & Staff</span>
            <span className="staff-branding-subtitle">Order Operations</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="staff-sidebar-nav" aria-label="Staff Navigation">
          <button
            type="button"
            className={`staff-nav-item ${currentView === "orders" ? "active" : ""}`}
            onClick={() => navigateTo("orders")}
          >
            <span className="nav-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" />
                <path d="M9 12h6" />
                <path d="M9 16h6" />
              </svg>
            </span>
            <span>Live Orders</span>
            {pendingOrders.length > 0 && (
              <span className="staff-nav-badge" title="Pending Orders">
                {pendingOrders.length}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`staff-nav-item ${currentView === "history" ? "active" : ""}`}
            onClick={() => navigateTo("history")}
          >
            <span className="nav-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            <span>Order History</span>
          </button>

          <button
            type="button"
            className={`staff-nav-item ${currentView === "profile" ? "active" : ""}`}
            onClick={() => navigateTo("profile")}
          >
            <span className="nav-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <span>Staff Profile</span>
          </button>

          <button
            type="button"
            className={`staff-nav-item ${currentView === "help" ? "active" : ""}`}
            onClick={() => navigateTo("help")}
          >
            <span className="nav-icon">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <span>Workflow Help</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="staff-sidebar-footer">
          <div className="staff-profile-card">
            <div className="staff-profile-avatar">
              <span>S</span>
              <span className="staff-profile-dot" title="Staff Online" />
            </div>
            <div className="staff-profile-info">
              <span className="staff-profile-name">
                {auth?.email ? auth.email.split("@")[0] : "Staff Member"}
              </span>
              <span className="staff-profile-role">Kitchen / Counter</span>
            </div>
          </div>

          <div className="staff-logout-wrapper">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* ==================================================
          MAIN WORKSPACE (Fixed height 100vh with inner scroll)
          ================================================== */}
      <main className="staff-main-workspace">
        {/* Top Header */}
        <header className="staff-header">
          <div className="staff-header-left">
            <button
              type="button"
              className="staff-mobile-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="staff-header-title-group">
              <h1 className="staff-header-title">
                {currentView === "orders" && "Active Orders Workspace"}
                {currentView === "history" && "Order History & Logs"}
                {currentView === "profile" && "Staff Member Profile"}
                {currentView === "help" && "Operational Workflow Guide"}
              </h1>
              <p className="staff-header-subtitle">
                {currentView === "orders" &&
                  "Real-time kitchen order board. Accept, prepare, and complete customer orders."}
                {currentView === "history" &&
                  "Review completed dining records and rejected orders."}
                {currentView === "profile" &&
                  "Account details and current authenticated session."}
                {currentView === "help" &&
                  "Kitchen order stages and status transition guidelines."}
              </p>
            </div>
          </div>

          <div className="staff-header-right">
            <div className="staff-live-badge">
              <span className="staff-status-pulse" />
              <span>Live Kitchen Feed</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="staff-content-area">
          {/* Incoming Real-Time Order Toast */}
          {newOrderNotification && (
            <div className="staff-notification-toast">
              <div className="toast-content-wrapper">
                <div className="toast-bell-icon">🔔</div>
                <div>
                  <div className="toast-title">
                    New Order Received: #{newOrderNotification.orderNumber}
                  </div>
                  <div className="toast-meta">
                    Type: {orderTypeLabels[newOrderNotification.orderType]} •
                    Total: ${Number(newOrderNotification.totalAmount).toFixed(2)}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNewOrderNotification(null)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#FFFFFF",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ✕
              </button>
            </div>
          )}

          {error && <div className="staff-error-banner">{error}</div>}

          {/* ==================================================
              1. ORDERS VIEW (Active Orders Board)
              ================================================== */}
          {currentView === "orders" && (
            <>
              {/* Order Status Summary Ribbon */}
              <div className="staff-stats-ribbon">
                <div className="ribbon-pill pending">
                  <div className="ribbon-pill-left">
                    <span className="ribbon-pill-label">1. Pending Orders</span>
                    <span className="ribbon-pill-count">{pendingOrders.length}</span>
                  </div>
                  <span className="ribbon-pill-badge">Awaiting Action</span>
                </div>

                <div className="ribbon-pill preparing">
                  <div className="ribbon-pill-left">
                    <span className="ribbon-pill-label">2. Preparing</span>
                    <span className="ribbon-pill-count">{preparingOrders.length}</span>
                  </div>
                  <span className="ribbon-pill-badge">In Kitchen</span>
                </div>

                <div className="ribbon-pill ready">
                  <div className="ribbon-pill-left">
                    <span className="ribbon-pill-label">3. Ready for Pickup</span>
                    <span className="ribbon-pill-count">{readyOrders.length}</span>
                  </div>
                  <span className="ribbon-pill-badge">Ready to Serve</span>
                </div>
              </div>

              {/* 3-Column Kanban Orders Board */}
              <div className="staff-orders-board">
                {/* Column 1: Pending */}
                <section className="order-column">
                  <div className="column-header">
                    <div className="column-title-wrapper">
                      <span className="column-indicator pending" />
                      <h2 className="column-title">Pending Orders</h2>
                    </div>
                    <span className="column-count-badge">
                      {pendingOrders.length}
                    </span>
                  </div>
                  <div className="column-cards-list">
                    {pendingOrders.length === 0 ? (
                      <div className="empty-column-state">
                        <svg
                          className="empty-column-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 14 14" />
                        </svg>
                        <span>No pending orders right now.</span>
                      </div>
                    ) : (
                      pendingOrders.map(renderOrderCard)
                    )}
                  </div>
                </section>

                {/* Column 2: Preparing */}
                <section className="order-column">
                  <div className="column-header">
                    <div className="column-title-wrapper">
                      <span className="column-indicator preparing" />
                      <h2 className="column-title">In Kitchen / Preparing</h2>
                    </div>
                    <span className="column-count-badge">
                      {preparingOrders.length}
                    </span>
                  </div>
                  <div className="column-cards-list">
                    {preparingOrders.length === 0 ? (
                      <div className="empty-column-state">
                        <svg
                          className="empty-column-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                          <path d="M7 2v20" />
                          <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                        </svg>
                        <span>No orders currently being prepared.</span>
                      </div>
                    ) : (
                      preparingOrders.map(renderOrderCard)
                    )}
                  </div>
                </section>

                {/* Column 3: Ready */}
                <section className="order-column">
                  <div className="column-header">
                    <div className="column-title-wrapper">
                      <span className="column-indicator ready" />
                      <h2 className="column-title">Ready for Pickup</h2>
                    </div>
                    <span className="column-count-badge">
                      {readyOrders.length}
                    </span>
                  </div>
                  <div className="column-cards-list">
                    {readyOrders.length === 0 ? (
                      <div className="empty-column-state">
                        <svg
                          className="empty-column-icon"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        <span>No orders ready for pickup.</span>
                      </div>
                    ) : (
                      readyOrders.map(renderOrderCard)
                    )}
                  </div>
                </section>
              </div>
            </>
          )}

          {/* ==================================================
              2. ORDER HISTORY VIEW
              ================================================== */}
          {currentView === "history" && (
            <div className="history-view-container">
              <div className="history-filter-bar">
                <button
                  type="button"
                  className={`history-filter-btn ${
                    historyFilter === "all" ? "active" : ""
                  }`}
                  onClick={() => setHistoryFilter("all")}
                >
                  All History ({completedOrders.length + rejectedOrders.length})
                </button>
                <button
                  type="button"
                  className={`history-filter-btn ${
                    historyFilter === "completed" ? "active" : ""
                  }`}
                  onClick={() => setHistoryFilter("completed")}
                >
                  Completed ({completedOrders.length})
                </button>
                <button
                  type="button"
                  className={`history-filter-btn ${
                    historyFilter === "rejected" ? "active" : ""
                  }`}
                  onClick={() => setHistoryFilter("rejected")}
                >
                  Rejected ({rejectedOrders.length})
                </button>
              </div>

              <div className="history-orders-grid">
                {getHistoryOrders().length === 0 ? (
                  <p style={{ color: "var(--color-text-secondary)" }}>
                    No orders match the selected history filter.
                  </p>
                ) : (
                  getHistoryOrders().map(renderOrderCard)
                )}
              </div>
            </div>
          )}

          {/* ==================================================
              3. STAFF PROFILE VIEW
              ================================================== */}
          {currentView === "profile" && (
            <div className="staff-card-panel">
              <div className="panel-header">
                <div className="panel-header-icon">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div>
                  <h2 className="panel-header-title">Staff Account Details</h2>
                  <p className="panel-header-desc">
                    Current active staff session credentials
                  </p>
                </div>
              </div>

              <div className="profile-details-grid">
                <div className="detail-item">
                  <span className="detail-label">Email / Identifier</span>
                  <span className="detail-value">{auth?.email || "staff@restaurant.com"}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Role</span>
                  <span className="detail-value">Staff (Kitchen / Service)</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Session Status</span>
                  <span className="detail-value" style={{ color: "#10B981" }}>
                    ● Online & Active
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">SignalR Feed</span>
                  <span className="detail-value" style={{ color: "#2563EB" }}>
                    ● Connected to Hub
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================
              4. HELP / WORKFLOW GUIDE VIEW
              ================================================== */}
          {currentView === "help" && (
            <div className="staff-card-panel">
              <div className="panel-header">
                <div className="panel-header-icon">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div>
                  <h2 className="panel-header-title">Staff Order Workflow Guide</h2>
                  <p className="panel-header-desc">
                    Operational steps for processing incoming customer orders
                  </p>
                </div>
              </div>

              <div className="help-steps-list">
                <div className="help-step-card">
                  <div className="help-step-num">1</div>
                  <div>
                    <div className="help-step-title">Receive & Accept / Reject</div>
                    <p className="help-step-text">
                      New orders arrive in the <strong>Pending</strong> column accompanied by an audio chime. Review items and click <strong>Accept Order</strong> to send to the kitchen, or <strong>Reject</strong> with a specific reason if unavailable.
                    </p>
                  </div>
                </div>

                <div className="help-step-card">
                  <div className="help-step-num">2</div>
                  <div>
                    <div className="help-step-title">Prepare in Kitchen</div>
                    <p className="help-step-text">
                      Accepted orders move into <strong>Preparing</strong>. The kitchen team prepares the ordered dishes and drinks. Once the food is ready, click <strong>Mark as Ready</strong>.
                    </p>
                  </div>
                </div>

                <div className="help-step-card">
                  <div className="help-step-num">3</div>
                  <div>
                    <div className="help-step-title">Serve & Complete</div>
                    <p className="help-step-text">
                      Orders ready for service appear in the <strong>Ready for Pickup</strong> column. When served to the dining table or picked up for takeout, click <strong>Complete Order</strong> to archive.
                    </p>
                  </div>
                </div>

                <div className="help-step-card">
                  <div className="help-step-num">4</div>
                  <div>
                    <div className="help-step-title">Order History</div>
                    <p className="help-step-text">
                      Completed and rejected orders are logged under <strong>Order History</strong> for end-of-shift reconciliation and audit.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}