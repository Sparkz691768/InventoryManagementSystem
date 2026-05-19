import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import StaffPage from "./pages/StaffPage";
import VendorPage from "./pages/VendorPage";
import CustomerPage from "./pages/CustomerPage";

import { useState, useEffect } from "react";
import api from "./api/axios";

// Real-time Notification Widget for Overdue Credits
function OverdueNotificationWidget() {
  const [overdueSales, setOverdueSales] = useState([]);

  useEffect(() => {
    const fetchOverdue = async () => {
      try {
        const res = await api.get("/Sales/overdue");
        setOverdueSales(res.data);
      } catch (err) {
        console.error("Failed to fetch overdue sales:", err);
      }
    };

    fetchOverdue();
    const interval = setInterval(fetchOverdue, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, []);

  if (overdueSales.length === 0) return null;

  return (
    <div style={{
      margin: "0 0 20px 0",
      padding: "12px",
      backgroundColor: "rgba(220, 38, 38, 0.1)",
      border: "1px solid rgba(220, 38, 38, 0.3)",
      borderRadius: "8px",
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      color: "#ef4444",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", animation: "pulse 2s infinite" }}>
        <span style={{ fontSize: "18px" }}>⚠️</span>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: "bold", fontSize: "14px" }}>Action Required</span>
          <span style={{ fontSize: "12px", opacity: 0.9 }}>
            {overdueSales.length} credit{overdueSales.length > 1 ? "s" : ""} overdue!
          </span>
        </div>
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
        {overdueSales.map(sale => (
          <div key={sale.id} style={{ 
            backgroundColor: "rgba(0, 0, 0, 0.2)", 
            padding: "8px", 
            borderRadius: "4px",
            fontSize: "11px",
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: "bold", color: "var(--text-color, #fff)" }}>{sale.invoiceNumber}</span>
              <span style={{ 
                backgroundColor: sale.paymentStatus === "Partial" ? "#d97706" : "#dc2626", 
                color: "white", 
                padding: "2px 6px", 
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: "bold"
              }}>
                {sale.paymentStatus}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary, #999)" }}>
              <span>Remaining:</span>
              <span style={{ color: "#ef4444", fontWeight: "bold" }}>NPR {sale.remainingAmount?.toFixed(2)}</span>
            </div>
            <div style={{ fontSize: "9px", opacity: 0.8, textAlign: "right" }}>
              Due: {new Date(sale.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="layout" style={{ paddingTop: 0 }}>
        <aside className="sidebar" style={{ top: 0 }}>
          {/* Custom Team Sidebar Visual Design and Bubbles */}
          <div className="sidebar-bubble sidebar-bubble-1" />
          <div className="sidebar-bubble sidebar-bubble-2" />
          <div className="sidebar-bubble sidebar-bubble-3" />
          <div className="sidebar-bubble sidebar-bubble-4" />

          {/* Autolaya Brand Header */}
          <div className="nb-brand" style={{ padding: "0 0 20px 0", borderBottom: "1px solid var(--border-color, rgba(255,255,255,0.1))", marginBottom: "20px" }}>
            <div className="nb-brand-text">
              <span className="nb-brand-name" style={{ fontSize: "20px", fontWeight: "bold", color: "var(--text-color, #fff)" }}>Auto<span>लय</span></span>
              <span className="nb-brand-sub" style={{ fontSize: "10px", color: "var(--text-secondary, #999)", display: "block" }}>Management System</span>
            </div>
          </div>

          <OverdueNotificationWidget />

          <span className="sidebar-section-label">Navigation</span>

          <nav style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <NavLink to="/" end>
              <span className="nav-icon" />Sales &amp; Invoices
            </NavLink>
            <NavLink to="/vendors">
              <span className="nav-icon" />Vendor Management
            </NavLink>
            <NavLink to="/customers">
              <span className="nav-icon" />Customer &amp; Vehicle
            </NavLink>
          </nav>
        </aside>

        <main className="content">
          <Routes>
            <Route path="/" element={<StaffPage />} />
            <Route path="/vendors" element={<VendorPage />} />
            <Route path="/customers" element={<CustomerPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;