import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLowStockNotifications } from "../services/lowStockService";

export default function AdminDashboardPage() {
  const fullName = localStorage.getItem("fullName");
  const navigate = useNavigate();
  const [lowStockItems, setLowStockItems] = useState([]);
  const [lowStockState, setLowStockState] = useState({ loading: true, error: "" });

  const now  = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good Morning" :
    hour < 17 ? "Good Afternoon" : "Good Evening";

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const loadLowStock = async () => {
    try {
      setLowStockState({ loading: true, error: "" });
      const res = await getLowStockNotifications();
      setLowStockItems(Array.isArray(res.data) ? res.data : []);
      setLowStockState({ loading: false, error: "" });
    } catch (error) {
      console.error(error);
      setLowStockItems([]);
      setLowStockState({ loading: false, error: "Failed to load low stock alerts." });
    }
  };

  useEffect(() => {
    loadLowStock();
  }, []);

  const lowStockPreview = useMemo(() => lowStockItems.slice(0, 4), [lowStockItems]);

  const getThresholdLabel = (item) => {
    const threshold =
      item?.minStock ??
      item?.minQuantity ??
      item?.reorderLevel ??
      item?.threshold;

    if (threshold !== undefined && threshold !== null && `${threshold}`.trim() !== "") {
      return `Threshold: ${threshold}`;
    }

    return item?.message || "Below minimum threshold";
  };

  return (
    <div className="admin-home">

      {/* ── HERO ── */}
      <div className="admin-hero">
        <div className="admin-hero-left">
          <div className="admin-greeting-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10"/>
            </svg>
            {greeting}
          </div>
          <h1>{fullName}</h1>
          <p>{dateStr} &nbsp;·&nbsp; Vehicle Parts Management System</p>
        </div>
        <div className="admin-hero-right">
          <div className="admin-hero-gear">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010
                2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65
                1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009
                19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65
                1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65
                1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0
                012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0
                001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65
                0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65
                0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65
                1.65 0 00-1.51 1z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* ── QUICK STATS ── */}
      <div className="admin-stats">
        <div className="admin-stat-item admin-stat-blue">
          <span className="admin-stat-icon">🏪</span>
          <div>
            <div className="admin-stat-label">Vendors</div>
            <div className="admin-stat-sub">Manage suppliers</div>
          </div>
        </div>
        <div className="admin-stat-item admin-stat-indigo">
          <span className="admin-stat-icon">👤</span>
          <div>
            <div className="admin-stat-label">Staff</div>
            <div className="admin-stat-sub">Manage accounts</div>
          </div>
        </div>
        <div className="admin-stat-item admin-stat-cyan">
          <span className="admin-stat-icon">🚗</span>
          <div>
            <div className="admin-stat-label">Customers</div>
            <div className="admin-stat-sub">Vehicle records</div>
          </div>
        </div>
      </div>

      {/* ── LOW STOCK PANEL ── */}
      <section className="low-stock-panel">
        <div className="low-stock-panel-head">
          <div>
            <span className="low-stock-panel-kicker">Inventory Alert</span>
            <h2>Low Stock Alerts</h2>
            <p>Parts below minimum stock threshold.</p>
          </div>
          <div className="low-stock-panel-actions">
            <button
              type="button"
              className="low-stock-panel-btn"
              onClick={() => navigate("/low-stock")}
            >
              View All
            </button>
            <button
              type="button"
              className="low-stock-panel-btn low-stock-panel-btn-ghost"
              onClick={loadLowStock}
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="low-stock-panel-body">
          {lowStockState.loading && (
            <div className="low-stock-panel-state">Loading alerts...</div>
          )}

          {!lowStockState.loading && lowStockState.error && (
            <div className="low-stock-panel-state low-stock-panel-error">
              {lowStockState.error}
            </div>
          )}

          {!lowStockState.loading && !lowStockState.error && lowStockItems.length === 0 && (
            <div className="low-stock-panel-state">No low stock alerts right now.</div>
          )}

          {!lowStockState.loading && !lowStockState.error && lowStockItems.length > 0 && (
            <div className="low-stock-panel-grid">
              {lowStockPreview.map((item) => (
                <div key={item.partId ?? item.partNumber ?? item.partName} className="low-stock-panel-item">
                  <div className="low-stock-panel-title">{item.partName || "Unknown part"}</div>
                  <div className="low-stock-panel-threshold">{getThresholdLabel(item)}</div>
                </div>
              ))}
            </div>
          )}

          {!lowStockState.loading && !lowStockState.error && lowStockItems.length > 4 && (
            <div className="low-stock-panel-foot">
              {lowStockItems.length} alerts found. View full list for details.
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION LABEL ── */}
      <div className="admin-section-label">
        <span className="admin-section-line" />
        Quick Access
        <span className="admin-section-line" />
      </div>

      {/* ── CARDS ── */}
      <div className="admin-cards">
        <div className="admin-card admin-card-blue" onClick={() => navigate("/vendors")}>
          <div className="admin-card-header">
            <div className="admin-card-icon-wrap admin-icon-blue">🏪</div>
            <span className="admin-card-badge">Vendors</span>
          </div>
          <h3>Vendor Management</h3>
          <p>Add, update, and remove vendors. View all registered supplier details and contacts.</p>
          <div className="admin-card-footer">
            <span className="admin-card-action">Go to Vendors</span>
            <span className="admin-card-arrow">→</span>
          </div>
        </div>

        <div className="admin-card admin-card-indigo" onClick={() => navigate("/staff-management")}>
          <div className="admin-card-header">
            <div className="admin-card-icon-wrap admin-icon-indigo">👤</div>
            <span className="admin-card-badge">Staff</span>
          </div>
          <h3>Staff Management</h3>
          <p>Register staff accounts, assign roles, and manage existing team members.</p>
          <div className="admin-card-footer">
            <span className="admin-card-action">Go to Staff</span>
            <span className="admin-card-arrow">→</span>
          </div>
        </div>

        <div className="admin-card admin-card-cyan" onClick={() => navigate("/customers")}>
          <div className="admin-card-header">
            <div className="admin-card-icon-wrap admin-icon-cyan">🚗</div>
            <span className="admin-card-badge">Customers</span>
          </div>
          <h3>Customer &amp; Vehicle</h3>
          <p>Register customers with vehicle details, search records and update information.</p>
          <div className="admin-card-footer">
            <span className="admin-card-action">Go to Customers</span>
            <span className="admin-card-arrow">→</span>
          </div>
        </div>
      </div>
    </div>
  );
}
