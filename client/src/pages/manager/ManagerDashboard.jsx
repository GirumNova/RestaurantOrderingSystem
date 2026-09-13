import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LogoutButton from "../../components/auth/LogoutButton";
import CategoryManagement from "../../components/manager/CategoryManagement";
import MenuItemManagement from "../../components/manager/MenuItemManagement";
import QrCodeManagement from "../../components/manager/QrCodeManagement";
import StaffManagement from "../../components/manager/StaffManagement";
import "./ManagerDashboard.css";

export default function ManagerDashboard() {
  const { view } = useParams();
  const currentView = view || "dashboard";
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (viewKey) => {
    setMobileMenuOpen(false);
    if (viewKey === "dashboard") {
      navigate("/manager");
    } else {
      navigate(`/manager/${viewKey}`);
    }
  };

  const getViewHeader = () => {
    switch (currentView) {
      case "menu":
        return {
          title: "Menu Item Management",
          subtitle: "Create, edit, and manage dishes, pricing, and availability.",
        };
      case "categories":
        return {
          title: "Category Management",
          subtitle: "Organize your food and beverage catalog sections.",
        };
      case "qrcode":
        return {
          title: "QR Code Management",
          subtitle: "Generate and assign contactless ordering tokens to dining tables.",
        };
      case "staff":
        return {
          title: "Staff Management",
          subtitle: "Manage restaurant team members, credentials, and access roles.",
        };
      case "orders":
        return {
          title: "Orders Management",
          subtitle: "Monitor, accept, and update active dining orders.",
        };
      case "reports":
        return {
          title: "Reports & Analytics",
          subtitle: "Review sales volume, order trends, and restaurant performance.",
        };
      case "settings":
        return {
          title: "Settings & Configuration",
          subtitle: "Manage restaurant preferences, operating hours, and system details.",
        };
      case "dashboard":
      default:
        return {
          title: "Manager Dashboard 👋",
          subtitle: "Here's what's happening at your restaurant today.",
        };
    }
  };

  const headerInfo = getViewHeader();

  return (
    <div className="manager-dashboard-container">
      {/* Mobile backdrop overlay */}
      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ==================================================
          LEFT SIDEBAR (Fixed/stable ~256px)
          ================================================== */}
      <aside className={`dashboard-sidebar ${mobileMenuOpen ? "mobile-open" : ""}`}>
        {/* Restaurant Branding */}
        <div className="sidebar-branding">
          <div className="branding-logo-icon">
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
          <div className="branding-info">
            <span className="branding-title">Restaurant Portal</span>
            <span className="branding-subtitle">Management Suite</span>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="sidebar-nav" aria-label="Main Navigation">
          <button
            type="button"
            className={`sidebar-nav-item ${currentView === "dashboard" ? "active" : ""}`}
            onClick={() => navigateTo("dashboard")}
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
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </span>
            <span className="nav-text">Dashboard</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${currentView === "menu" ? "active" : ""}`}
            onClick={() => navigateTo("menu")}
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
                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                <path d="M7 2v20" />
                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
              </svg>
            </span>
            <span className="nav-text">Menu</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${currentView === "categories" ? "active" : ""}`}
            onClick={() => navigateTo("categories")}
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
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
            </span>
            <span className="nav-text">Categories</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${currentView === "qrcode" ? "active" : ""}`}
            onClick={() => navigateTo("qrcode")}
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
                <rect width="5" height="5" x="3" y="3" rx="1" />
                <rect width="5" height="5" x="16" y="3" rx="1" />
                <rect width="5" height="5" x="3" y="16" rx="1" />
                <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                <path d="M21 21v.01" />
                <path d="M12 7v3a2 2 0 0 1-2 2H7" />
                <path d="M3 12h.01" />
                <path d="M12 3h.01" />
                <path d="M12 16v.01" />
                <path d="M16 12h1" />
                <path d="M21 12v.01" />
                <path d="M12 21v-1" />
              </svg>
            </span>
            <span className="nav-text">QR Code</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${currentView === "staff" ? "active" : ""}`}
            onClick={() => navigateTo("staff")}
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
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </span>
            <span className="nav-text">Staff</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${currentView === "orders" ? "active" : ""}`}
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
            <span className="nav-text">Orders</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${currentView === "reports" ? "active" : ""}`}
            onClick={() => navigateTo("reports")}
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
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </span>
            <span className="nav-text">Reports</span>
          </button>

          <button
            type="button"
            className={`sidebar-nav-item ${currentView === "settings" ? "active" : ""}`}
            onClick={() => navigateTo("settings")}
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
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </span>
            <span className="nav-text">Settings</span>
          </button>
        </nav>

        {/* Sidebar Footer: Profile & Logout */}
        <div className="sidebar-footer">
          <div className="sidebar-profile">
            <div className="profile-avatar">
              <span>M</span>
              <span className="profile-status-dot" title="Online" />
            </div>
            <div className="profile-info">
              <span className="profile-name">Manager</span>
              <span className="profile-role">Restaurant Admin</span>
            </div>
          </div>

          <div className="sidebar-logout-wrapper">
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* ==================================================
          MAIN CONTENT AREA
          ================================================== */}
      <main className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <button
              type="button"
              className="mobile-menu-btn"
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
            <div className="header-title-group">
              <h1 className="header-greeting">{headerInfo.title}</h1>
              <p className="header-subgreeting">{headerInfo.subtitle}</p>
            </div>
          </div>

          <div className="header-right">
            <div className="header-date-badge">
              <span className="header-status-indicator" />
              <span>System Live</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="dashboard-content">
          {/* ==================================================
              1. DASHBOARD OVERVIEW VIEW
              ================================================== */}
          {currentView === "dashboard" && (
            <>
              {/* Stat Overview Cards Row */}
              <section className="dashboard-stats-grid" aria-label="Management Overview Statistics">
                <div className="stat-card" onClick={() => navigateTo("categories")} style={{ cursor: "pointer" }}>
                  <div className="stat-icon-wrapper blue">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="7" height="7" x="3" y="3" rx="1" />
                      <rect width="7" height="7" x="14" y="3" rx="1" />
                      <rect width="7" height="7" x="14" y="14" rx="1" />
                      <rect width="7" height="7" x="3" y="14" rx="1" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Categories</span>
                    <span className="stat-value">Active</span>
                    <span className="stat-meta">● Menu Organization</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => navigateTo("menu")} style={{ cursor: "pointer" }}>
                  <div className="stat-icon-wrapper sky">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                      <path d="M7 2v20" />
                      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Menu Items</span>
                    <span className="stat-value">Catalog</span>
                    <span className="stat-meta">● Real-time Updates</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => navigateTo("qrcode")} style={{ cursor: "pointer" }}>
                  <div className="stat-icon-wrapper indigo">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="5" height="5" x="3" y="3" rx="1" />
                      <rect width="5" height="5" x="16" y="3" rx="1" />
                      <rect width="5" height="5" x="3" y="16" rx="1" />
                      <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                      <path d="M21 21v.01" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Table QR Codes</span>
                    <span className="stat-value">Dine-in</span>
                    <span className="stat-meta">● Contactless Ordering</span>
                  </div>
                </div>

                <div className="stat-card" onClick={() => navigateTo("staff")} style={{ cursor: "pointer" }}>
                  <div className="stat-icon-wrapper royal">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    </svg>
                  </div>
                  <div className="stat-content">
                    <span className="stat-label">Staff Team</span>
                    <span className="stat-value">Active</span>
                    <span className="stat-meta">● Role Access</span>
                  </div>
                </div>
              </section>

              {/* Quick Actions Shortcuts */}
              <section className="quick-actions-section" aria-label="Management Quick Actions">
                <h2 className="section-subheading">Quick Actions</h2>
                <div className="quick-actions-grid">
                  <div
                    className="quick-action-card"
                    onClick={() => navigateTo("menu")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="quick-action-left">
                      <div className="quick-action-icon" style={{ backgroundColor: "#F0F9FF", color: "#0284C7" }}>
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
                          <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
                          <path d="M7 2v20" />
                          <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
                        </svg>
                      </div>
                      <div>
                        <div className="quick-action-title">Manage Menu Items</div>
                        <div className="quick-action-desc">Add new food items, update pricing & descriptions</div>
                      </div>
                    </div>
                    <span className="quick-action-arrow">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </div>

                  <div
                    className="quick-action-card"
                    onClick={() => navigateTo("categories")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="quick-action-left">
                      <div className="quick-action-icon" style={{ backgroundColor: "#EFF6FF", color: "#2563EB" }}>
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
                          <rect width="7" height="7" x="3" y="3" rx="1" />
                          <rect width="7" height="7" x="14" y="3" rx="1" />
                          <rect width="7" height="7" x="14" y="14" rx="1" />
                          <rect width="7" height="7" x="3" y="14" rx="1" />
                        </svg>
                      </div>
                      <div>
                        <div className="quick-action-title">Manage Categories</div>
                        <div className="quick-action-desc">Organize dietary and menu category groupings</div>
                      </div>
                    </div>
                    <span className="quick-action-arrow">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </div>

                  <div
                    className="quick-action-card"
                    onClick={() => navigateTo("qrcode")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="quick-action-left">
                      <div className="quick-action-icon" style={{ backgroundColor: "#EEF2FF", color: "#4F46E5" }}>
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
                          <rect width="5" height="5" x="3" y="3" rx="1" />
                          <rect width="5" height="5" x="16" y="3" rx="1" />
                          <rect width="5" height="5" x="3" y="16" rx="1" />
                          <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
                          <path d="M21 21v.01" />
                        </svg>
                      </div>
                      <div>
                        <div className="quick-action-title">Generate QR Codes</div>
                        <div className="quick-action-desc">Configure contactless ordering tokens for tables</div>
                      </div>
                    </div>
                    <span className="quick-action-arrow">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </div>

                  <div
                    className="quick-action-card"
                    onClick={() => navigateTo("staff")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="quick-action-left">
                      <div className="quick-action-icon" style={{ backgroundColor: "#E0E7FF", color: "#1D4ED8" }}>
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
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                        </svg>
                      </div>
                      <div>
                        <div className="quick-action-title">Manage Staff</div>
                        <div className="quick-action-desc">Add or remove staff accounts and permissions</div>
                      </div>
                    </div>
                    <span className="quick-action-arrow">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </span>
                  </div>
                </div>
              </section>

              {/* System Overview Card */}
              <section className="management-card">
                <header className="management-card-header">
                  <div className="card-header-left">
                    <div className="card-header-icon">
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
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="card-title">System Overview</h2>
                      <p className="card-description">
                        All restaurant management modules are active and operational
                      </p>
                    </div>
                  </div>
                  <span className="card-badge">Operational</span>
                </header>
                <div className="management-card-body">
                  <p style={{ color: "var(--color-text-secondary)", margin: 0, fontSize: "14px" }}>
                    Select any management section from the left sidebar or quick actions above to manage categories, menu items, table QR codes, and staff accounts.
                  </p>
                </div>
              </section>
            </>
          )}

          {/* ==================================================
              2. MENU ITEMS VIEW
              ================================================== */}
          {currentView === "menu" && <MenuItemManagement />}

          {/* ==================================================
              3. CATEGORIES VIEW
              ================================================== */}
          {currentView === "categories" && <CategoryManagement />}

          {/* ==================================================
              4. QR CODE VIEW
              ================================================== */}
          {currentView === "qrcode" && <QrCodeManagement />}

          {/* ==================================================
              5. STAFF VIEW
              ================================================== */}
          {currentView === "staff" && <StaffManagement />}

          {/* ==================================================
              6. ORDERS VIEW
              ================================================== */}
          {currentView === "orders" && (
            <div className="manager-page-view">
              {/* Order Status KPI ribbon */}
              <div className="metrics-grid" style={{ marginBottom: 20 }}>
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Active Orders</span>
                    <span className="metric-icon" style={{ background: "#EFF6FF", color: "#2563EB" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                        <rect x="8" y="2" width="8" height="4" rx="1" />
                      </svg>
                    </span>
                  </div>
                  <div className="metric-value">12</div>
                  <div className="metric-footer">
                    <span className="metric-trend positive">Live</span>
                    <span className="metric-period">Dining & Takeaway</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">In Kitchen</span>
                    <span className="metric-icon" style={{ background: "#FFFBEB", color: "#D97706" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </span>
                  </div>
                  <div className="metric-value">5</div>
                  <div className="metric-footer">
                    <span className="metric-trend" style={{ color: "#D97706" }}>Preparing</span>
                    <span className="metric-period">Avg prep: ~14m</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Ready for Pickup</span>
                    <span className="metric-icon" style={{ background: "#ECFDF5", color: "#059669" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </span>
                  </div>
                  <div className="metric-value">3</div>
                  <div className="metric-footer">
                    <span className="metric-trend positive">Ready</span>
                    <span className="metric-period">Staff notified</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Completed Today</span>
                    <span className="metric-icon" style={{ background: "#F0F9FF", color: "#0284C7" }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                        <path d="M3 6h18" />
                        <path d="M16 10a4 4 0 0 1-8 0" />
                      </svg>
                    </span>
                  </div>
                  <div className="metric-value">84</div>
                  <div className="metric-footer">
                    <span className="metric-trend positive">↑ 14%</span>
                    <span className="metric-period">vs yesterday</span>
                  </div>
                </div>
              </div>

              {/* Order Monitoring Table Layout */}
              <div className="modern-data-panel">
                <div className="page-top-bar" style={{ marginBottom: 0, padding: "16px 20px" }}>
                  <div className="top-bar-filter">
                    <button type="button" className="btn-secondary" style={{ height: 36, fontSize: 13, background: "var(--color-primary)", color: "#FFF", borderColor: "var(--color-primary)" }}>All Orders (12)</button>
                    <button type="button" className="btn-secondary" style={{ height: 36, fontSize: 13 }}>Pending (4)</button>
                    <button type="button" className="btn-secondary" style={{ height: 36, fontSize: 13 }}>Preparing (5)</button>
                    <button type="button" className="btn-secondary" style={{ height: 36, fontSize: 13 }}>Ready (3)</button>
                  </div>
                  <button type="button" className="btn-secondary" onClick={() => navigateTo("dashboard")} style={{ height: 36, fontSize: 13 }}>
                    Refresh Board
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="modern-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Table</th>
                        <th>Items Summary</th>
                        <th>Total</th>
                        <th>Elapsed</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{ fontWeight: 600, color: "var(--color-heading)" }}>#ORD-1048</td>
                        <td><span className="status-pill ready">Table 4</span></td>
                        <td>
                          <div style={{ fontSize: 13 }}>2x Margherita Pizza, 1x Truffle Fries</div>
                          <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Special: Extra basil</div>
                        </td>
                        <td className="item-price-tag">$42.50</td>
                        <td style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>8m ago</td>
                        <td><span className="status-pill pending">Pending Accept</span></td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600, color: "var(--color-heading)" }}>#ORD-1047</td>
                        <td><span className="status-pill ready">Table 2</span></td>
                        <td>
                          <div style={{ fontSize: 13 }}>1x Wagyu Burger, 1x Caesar Salad</div>
                        </td>
                        <td className="item-price-tag">$36.00</td>
                        <td style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>15m ago</td>
                        <td><span className="status-pill pending" style={{ background: "#FEF3C7", color: "#92400E", borderColor: "#FCD34D" }}>Kitchen Prep</span></td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600, color: "var(--color-heading)" }}>#ORD-1046</td>
                        <td><span className="status-pill ready">Table 7</span></td>
                        <td>
                          <div style={{ fontSize: 13 }}>3x Cold Brew Coffee, 2x Croissants</div>
                        </td>
                        <td className="item-price-tag">$24.00</td>
                        <td style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>22m ago</td>
                        <td><span className="status-pill ready">Ready for Serving</span></td>
                      </tr>
                      <tr>
                        <td style={{ fontWeight: 600, color: "var(--color-heading)" }}>#ORD-1045</td>
                        <td><span className="status-pill unavailable">Takeaway #12</span></td>
                        <td>
                          <div style={{ fontSize: 13 }}>1x Seafood Pasta, 1x Tiramisu</div>
                        </td>
                        <td className="item-price-tag">$31.50</td>
                        <td style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>45m ago</td>
                        <td><span className="status-pill active">Completed</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================
              7. REPORTS VIEW
              ================================================== */}
          {currentView === "reports" && (
            <div className="manager-page-view">
              {/* Reports Filter Ribbon */}
              <div className="page-top-bar">
                <div className="top-bar-filter">
                  <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-heading)" }}>Report Window:</span>
                  <button type="button" className="btn-secondary" style={{ height: 36, fontSize: 13, background: "var(--color-primary)", color: "#FFF", borderColor: "var(--color-primary)" }}>Today</button>
                  <button type="button" className="btn-secondary" style={{ height: 36, fontSize: 13 }}>Last 7 Days</button>
                  <button type="button" className="btn-secondary" style={{ height: 36, fontSize: 13 }}>This Month</button>
                </div>
                <button type="button" className="btn-secondary" style={{ height: 36, fontSize: 13 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6 }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export CSV
                </button>
              </div>

              {/* KPI metrics cards */}
              <div className="metrics-grid" style={{ marginBottom: 24 }}>
                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Total Revenue</span>
                    <span className="metric-icon" style={{ background: "#EFF6FF", color: "#2563EB" }}>$</span>
                  </div>
                  <div className="metric-value">$3,420.50</div>
                  <div className="metric-footer">
                    <span className="metric-trend positive">↑ 18.2%</span>
                    <span className="metric-period">vs yesterday</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Avg Order Value</span>
                    <span className="metric-icon" style={{ background: "#ECFDF5", color: "#059669" }}>Ø</span>
                  </div>
                  <div className="metric-value">$38.40</div>
                  <div className="metric-footer">
                    <span className="metric-trend positive">↑ 4.1%</span>
                    <span className="metric-period">basket size</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Orders Completed</span>
                    <span className="metric-icon" style={{ background: "#F0F9FF", color: "#0284C7" }}>#</span>
                  </div>
                  <div className="metric-value">89</div>
                  <div className="metric-footer">
                    <span className="metric-trend positive">98.9%</span>
                    <span className="metric-period">fulfillment rate</span>
                  </div>
                </div>

                <div className="metric-card">
                  <div className="metric-top">
                    <span className="metric-label">Avg Kitchen Turnaround</span>
                    <span className="metric-icon" style={{ background: "#FFFBEB", color: "#D97706" }}>⏱</span>
                  </div>
                  <div className="metric-value">13.5 min</div>
                  <div className="metric-footer">
                    <span className="metric-trend positive">↓ 1.8 min</span>
                    <span className="metric-period">faster speed</span>
                  </div>
                </div>
              </div>

              {/* Reports Breakdown Grid */}
              <div className="settings-sections-grid">
                <div className="settings-card">
                  <h3 className="settings-card-title">Top Selling Categories</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: "var(--color-heading)" }}>Main Courses</span>
                        <span style={{ fontWeight: 700, color: "var(--color-primary)" }}>$1,620.00 (47%)</span>
                      </div>
                      <div style={{ height: 8, background: "#EFF6FF", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: "47%", height: "100%", background: "var(--color-primary)" }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: "var(--color-heading)" }}>Beverages & Drinks</span>
                        <span style={{ fontWeight: 700, color: "#059669" }}>$980.50 (29%)</span>
                      </div>
                      <div style={{ height: 8, background: "#EFF6FF", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: "29%", height: "100%", background: "#059669" }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: "var(--color-heading)" }}>Appetizers & Starters</span>
                        <span style={{ fontWeight: 700, color: "#D97706" }}>$540.00 (16%)</span>
                      </div>
                      <div style={{ height: 8, background: "#EFF6FF", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: "16%", height: "100%", background: "#D97706" }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: "var(--color-heading)" }}>Desserts</span>
                        <span style={{ fontWeight: 700, color: "#8B5CF6" }}>$280.00 (8%)</span>
                      </div>
                      <div style={{ height: 8, background: "#EFF6FF", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: "8%", height: "100%", background: "#8B5CF6" }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="settings-card">
                  <h3 className="settings-card-title">Peak Ordering Hours</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div className="settings-row">
                      <div>
                        <div className="settings-label-title">Lunch Rush (12:00 PM – 2:00 PM)</div>
                        <div className="settings-label-desc">Peak load: 38 orders/hr</div>
                      </div>
                      <span className="status-pill active">Highest Traffic</span>
                    </div>
                    <div className="settings-row">
                      <div>
                        <div className="settings-label-title">Dinner Rush (7:00 PM – 9:30 PM)</div>
                        <div className="settings-label-desc">Peak load: 34 orders/hr</div>
                      </div>
                      <span className="status-pill active">High Traffic</span>
                    </div>
                    <div className="settings-row">
                      <div>
                        <div className="settings-label-title">Afternoon Lull (3:00 PM – 5:30 PM)</div>
                        <div className="settings-label-desc">Low load: 8 orders/hr</div>
                      </div>
                      <span className="status-pill inactive">Off-Peak</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================
              8. SETTINGS VIEW
              ================================================== */}
          {currentView === "settings" && (
            <div className="manager-page-view">
              <div className="settings-sections-grid">
                {/* Card 1: Restaurant Profile */}
                <div className="settings-card">
                  <h3 className="settings-card-title">Restaurant Profile</h3>
                  <div className="form-field-group">
                    <label>Restaurant Name</label>
                    <input type="text" defaultValue="La Bella Gourmet Dining" />
                  </div>
                  <div className="form-field-group">
                    <label>Support Contact Phone</label>
                    <input type="text" defaultValue="+1 (555) 342-9102" />
                  </div>
                  <div className="form-field-group">
                    <label>Currency & Tax Rate (%)</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <input type="text" defaultValue="USD ($)" />
                      <input type="number" defaultValue="8.5" step="0.1" />
                    </div>
                  </div>
                </div>

                {/* Card 2: Operating Hours */}
                <div className="settings-card">
                  <h3 className="settings-card-title">Operating Hours</h3>
                  <div className="settings-row">
                    <div>
                      <div className="settings-label-title">Monday – Friday</div>
                      <div className="settings-label-desc">Lunch & Dinner Shifts</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-heading)" }}>11:00 AM – 10:00 PM</span>
                  </div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-label-title">Saturday – Sunday</div>
                      <div className="settings-label-desc">Brunch & Evening Shifts</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-heading)" }}>10:00 AM – 11:30 PM</span>
                  </div>
                  <div className="form-checkbox-row">
                    <input type="checkbox" id="acceptOrdersOpen" defaultChecked />
                    <label htmlFor="acceptOrdersOpen">Automatically accept QR orders only during operating hours</label>
                  </div>
                </div>

                {/* Card 3: QR Ordering Rules */}
                <div className="settings-card">
                  <h3 className="settings-card-title">Ordering Rules & Experience</h3>
                  <div className="settings-row">
                    <div>
                      <div className="settings-label-title">Table Ordering Mode</div>
                      <div className="settings-label-desc">Allow customers to send orders directly to kitchen</div>
                    </div>
                    <input type="checkbox" defaultChecked style={{ width: 20, height: 20, accentColor: "var(--color-primary)" }} />
                  </div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-label-title">Special Instructions</div>
                      <div className="settings-label-desc">Allow guest allergies and preparation requests</div>
                    </div>
                    <input type="checkbox" defaultChecked style={{ width: 20, height: 20, accentColor: "var(--color-primary)" }} />
                  </div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-label-title">Out-of-Stock Item Display</div>
                      <div className="settings-label-desc">Hide dishes automatically when marked unavailable</div>
                    </div>
                    <input type="checkbox" defaultChecked style={{ width: 20, height: 20, accentColor: "var(--color-primary)" }} />
                  </div>
                </div>

                {/* Card 4: Sound & Notifications */}
                <div className="settings-card">
                  <h3 className="settings-card-title">Notifications & Security</h3>
                  <div className="settings-row">
                    <div>
                      <div className="settings-label-title">New Order Sound Alert</div>
                      <div className="settings-label-desc">Play chime notification for incoming customer orders</div>
                    </div>
                    <input type="checkbox" defaultChecked style={{ width: 20, height: 20, accentColor: "var(--color-primary)" }} />
                  </div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-label-title">Real-Time SignalR Sync</div>
                      <div className="settings-label-desc">Keep active orders and status synchronised live</div>
                    </div>
                    <span className="status-pill active">Connected</span>
                  </div>
                  <div className="settings-row">
                    <div>
                      <div className="settings-label-title">Session Security Timeout</div>
                      <div className="settings-label-desc">Auto-lock manager console after idle period</div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-heading)" }}>30 Minutes</span>
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