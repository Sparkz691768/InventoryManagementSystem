import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate, useNavigate } from "react-router-dom";
import StaffPage from "./pages/StaffPage";
import VendorPage from "./pages/VendorPage";
import CustomerPage from "./pages/CustomerPage";
import CustomerHomePage from "./pages/CustomerHomePage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PartPage from "./pages/PartPage";
import FinancialReportPage from "./pages/FinancialReportPage";
import LowStockNotificationPage from "./pages/LowStockNotificationPage";
import { getLowStockNotifications } from "./services/lowStockService";

/* ── SVG icons ─────────────────────────────────────── */
const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
  </svg>
);

const GearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010
      2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65
      1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65
      1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83
      0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65
      0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0
      004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2
      2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2
      2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65
      0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65
      1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2
      0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
);

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2z" />
    <path d="M18 16V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z" />
    <path d="M4 7.25a8.5 8.5 0 0 1 0 9.5" />
    <path d="M20 7.25a8.5 8.5 0 0 0 0 9.5" />
  </svg>
);

function useTheme() {
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute("data-theme") || "dark"
  );

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    setTheme(next);
  };

  return { theme, toggle };
}

function getThresholdLabel(item) {
  const threshold =
    item?.minStock ??
    item?.minQuantity ??
    item?.reorderLevel ??
    item?.threshold;

  if (threshold !== undefined && threshold !== null && `${threshold}`.trim() !== "") {
    return `Threshold: ${threshold}`;
  }

  return item?.message || "Below minimum threshold";
}

function getQuantityLabel(item) {
  const qty = item?.quantity ?? item?.stock ?? item?.qty;

  if (qty !== undefined && qty !== null && `${qty}`.trim() !== "") {
    return `Qty: ${qty}`;
  }

  return null;
}

function TopNavbar({
  fullName,
  role,
  onLogout,
  theme,
  onToggleTheme,
  notifications,
  notificationCount,
  notificationLoading,
  notificationError,
  onRefreshNotifications,
}) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const initial = fullName ? fullName.charAt(0).toUpperCase() : "U";
  const roleCls =
    role === "Admin" ? "nb-role-admin" :
    role === "Staff" ? "nb-role-staff" : "nb-role-customer";

  const badgeLabel = notificationCount > 9 ? "9+" : `${notificationCount}`;
  const previewItems = notifications.slice(0, 5);

  const handleToggle = () => {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      onRefreshNotifications();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isOpen) {
        return;
      }

      const target = event.target;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }

      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <header className="top-navbar">
      <div className="nb-brand">
        <div className="nb-gear-icon"><GearIcon /></div>
        <div className="nb-brand-text">
          <span className="nb-brand-name">Auto<span>लय</span></span>
          <span className="nb-brand-sub">Management System</span>
        </div>
      </div>

      <div className="nb-right">
        <button className="theme-toggle" onClick={onToggleTheme}>
          {theme === "dark" ? <SunIcon /> : <MoonIcon />}
        </button>

        <div className="nb-notification-wrap">
          <button
            type="button"
            className="nb-notifications"
            onClick={handleToggle}
            aria-label="Low stock notifications"
            title="Low stock notifications"
            ref={buttonRef}
          >
            <BellIcon />
            {notificationCount > 0 && (
              <span className="nb-notification-badge">{badgeLabel}</span>
            )}
          </button>

          {isOpen && (
            <div className="nb-notification-menu" ref={menuRef}>
              <div className="nb-notification-menu-head">
                <div>
                  <div className="nb-notification-title">Low Stock Alerts</div>
                  <div className="nb-notification-sub">Parts below threshold</div>
                </div>
                <div className="nb-notification-actions">
                  <button type="button" onClick={onRefreshNotifications}>
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      navigate("/low-stock");
                    }}
                  >
                    View all
                  </button>
                </div>
              </div>

              {notificationLoading && (
                <div className="nb-notification-state">Loading alerts...</div>
              )}

              {!notificationLoading && notificationError && (
                <div className="nb-notification-state nb-notification-error">
                  {notificationError}
                </div>
              )}

              {!notificationLoading && !notificationError && notifications.length === 0 && (
                <div className="nb-notification-state">No low stock alerts right now.</div>
              )}

              {!notificationLoading && !notificationError && notifications.length > 0 && (
                <div className="nb-notification-list">
                  {previewItems.map((item) => {
                    const quantityLabel = getQuantityLabel(item);
                    return (
                      <button
                        key={item.partId ?? item.partNumber ?? item.partName}
                        type="button"
                        className="nb-notification-item"
                        onClick={() => {
                          handleClose();
                          navigate("/low-stock");
                        }}
                      >
                        <div className="nb-notification-item-title">
                          {item.partName || "Unknown part"}
                        </div>
                        <div className="nb-notification-item-meta">
                          {quantityLabel && <span>{quantityLabel}</span>}
                          <span>{getThresholdLabel(item)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {!notificationLoading && !notificationError && notifications.length > 5 && (
                <div className="nb-notification-foot">
                  {notifications.length} alerts total. View all for details.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="nb-sep" />

        <div className="nb-user">
          <div className="nb-avatar">{initial}</div>
          <div className="nb-user-info">
            <span className="nb-welcome">Welcome back</span>
            <span className="nb-name">{fullName}</span>
          </div>
        </div>

        <div className={`nb-role ${roleCls}`}>{role}</div>

        <div className="nb-sep" />

        <button className="nb-logout" onClick={onLogout}>
          <LogoutIcon /> Logout
        </button>
      </div>
    </header>
  );
}

function Sidebar({ role }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-bubble sidebar-bubble-1" />
      <div className="sidebar-bubble sidebar-bubble-2" />
      <div className="sidebar-bubble sidebar-bubble-3" />
      <div className="sidebar-bubble sidebar-bubble-4" />

      <span className="sidebar-section-label">Navigation</span>

      <nav>
        {role === "Staff" && (
          <NavLink to="/staff" end>
            <span className="nav-icon" />Customer &amp; Vehicle
          </NavLink>
        )}

        {role === "Admin" && (
          <>
            <NavLink to="/admin" end>
              <span className="nav-icon" />Dashboard
            </NavLink>

            <NavLink to="/vendors">
              <span className="nav-icon" />Vendor Management
            </NavLink>

            <NavLink to="/staff-management">
              <span className="nav-icon" />Staff Management
            </NavLink>

            <NavLink to="/customers">
              <span className="nav-icon" />Customer &amp; Vehicle
            </NavLink>

            <NavLink to="/parts">
              <span className="nav-icon" />Parts Management
            </NavLink>

            <NavLink to="/reports">
              <span className="nav-icon" />Financial Reports
            </NavLink>

            <NavLink to="/low-stock">
              <span className="nav-icon" />Low Stock Alerts
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const fullName = localStorage.getItem("fullName");
  const { theme, toggle } = useTheme();
  const pollIntervalMs = 10000;
  const [notifications, setNotifications] = useState([]);
  const [notificationState, setNotificationState] = useState({ loading: false, error: "" });
  const [toast, setToast] = useState({ visible: false, message: "" });
  const lastCountRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const toastTimerRef = useRef(null);

  const notificationCount = notifications.length;

  const logout = () => {
    localStorage.clear();
    localStorage.setItem("theme", theme);
    window.location.href = "/login";
  };

  const showToast = (message) => {
    setToast({ visible: true, message });
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToast({ visible: false, message: "" });
      toastTimerRef.current = null;
    }, 5000);
  };

  const refreshNotifications = async () => {
    if (!token || role !== "Admin") {
      setNotifications([]);
      setNotificationState({ loading: false, error: "" });
      lastCountRef.current = 0;
      hasLoadedRef.current = false;
      return;
    }

    try {
      setNotificationState({ loading: true, error: "" });
      const res = await getLowStockNotifications();
      const nextNotifications = Array.isArray(res.data) ? res.data : [];
      setNotifications(nextNotifications);
      setNotificationState({ loading: false, error: "" });

      if (hasLoadedRef.current && nextNotifications.length > lastCountRef.current) {
        showToast("New low stock alert detected.");
      }

      lastCountRef.current = nextNotifications.length;
      hasLoadedRef.current = true;
    } catch (error) {
      console.error(error);
      setNotifications([]);
      setNotificationState({ loading: false, error: "Failed to load notifications." });
    }
  };

  useEffect(() => {
    lastCountRef.current = 0;
    hasLoadedRef.current = false;
    refreshNotifications();
  }, [token, role]);

  useEffect(() => {
    if (!token || role !== "Admin") {
      return;
    }

    const intervalId = setInterval(() => {
      refreshNotifications();
    }, pollIntervalMs);

    return () => clearInterval(intervalId);
  }, [token, role]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  if (!token) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<RegisterPage theme={theme} onToggleTheme={toggle} />} />
          <Route path="/login" element={<LoginPage theme={theme} onToggleTheme={toggle} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    );
  }

  const navbar = (
    <TopNavbar
      fullName={fullName}
      role={role}
      onLogout={logout}
      theme={theme}
      onToggleTheme={toggle}
      notifications={notifications}
      notificationCount={notificationCount}
      notificationLoading={notificationState.loading}
      notificationError={notificationState.error}
      onRefreshNotifications={refreshNotifications}
    />
  );

  const toastBanner = toast.visible ? (
    <div className="nb-toast" role="status" aria-live="polite">
      <span className="nb-toast-dot" />
      <span>{toast.message}</span>
    </div>
  ) : null;

  if (role === "Customer") {
    return (
      <BrowserRouter>
        {navbar}
        {toastBanner}
        <div className="customer-layout">
          <main className="customer-main">
            <Routes>
              <Route path="/customer" element={<CustomerHomePage />} />
              <Route path="*" element={<Navigate to="/customer" />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    );
  }

  if (role === "Staff") {
    return (
      <BrowserRouter>
        {navbar}
        {toastBanner}
        <div className="layout">
          <Sidebar role="Staff" />
          <main className="content">
            <Routes>
              <Route path="/staff" element={<CustomerPage />} />
              <Route path="*" element={<Navigate to="/staff" />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    );
  }

  if (role === "Admin") {
    return (
      <BrowserRouter>
        {navbar}
        {toastBanner}
        <div className="layout">
          <Sidebar role="Admin" />
          <main className="content">
            <Routes>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/vendors" element={<VendorPage />} />
              <Route path="/staff-management" element={<StaffPage />} />
              <Route path="/customers" element={<CustomerPage />} />
              <Route path="/parts" element={<PartPage />} />
              <Route path="/reports" element={<FinancialReportPage />} />
              <Route path="/low-stock" element={<LowStockNotificationPage />} />
              <Route path="*" element={<Navigate to="/admin" />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    );
  }

  localStorage.clear();
  localStorage.setItem("theme", theme);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;