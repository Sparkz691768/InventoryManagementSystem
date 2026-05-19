import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import StaffPage from "./pages/StaffPage";
import VendorPage from "./pages/VendorPage";
import CustomerPage from "./pages/CustomerPage";

function App() {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "light" ? "dark" : "light");
  };

  return (
    <BrowserRouter>
      {/* ===== TOP NAVBAR ===== */}
      <header className="top-navbar">
        <div className="nb-brand">
          <div className="nb-gear-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>
            </svg>
          </div>
          <div className="nb-brand-text">
            <span className="nb-brand-name">Auto<span>लय</span></span>
            <span className="nb-brand-sub">Management System</span>
          </div>
        </div>

        <div className="nb-right">
          <button className="theme-toggle" onClick={toggleTheme} style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text)", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", width: "34px", height: "34px", borderRadius: "8px" }} title="Toggle Theme">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          
          <div className="nb-notifications">
            <svg viewBox="0 0 24 24">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span className="nb-notification-badge" style={{ position: "absolute", top: "-4px", right: "-4px", background: "#ef4444", color: "white", fontSize: "10px", fontWeight: "bold", padding: "2px 5px", borderRadius: "10px" }}>1</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "12px", paddingLeft: "16px", borderLeft: "1px solid var(--border)" }}>
            <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--primary)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
              S
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)" }}>System Admin</span>
              <span style={{ fontSize: "10px", color: "var(--primary)", fontWeight: "bold", letterSpacing: "0.5px" }}>ADMIN</span>
            </div>
          </div>

          <button style={{ marginLeft: "16px", background: "transparent", border: "1px solid var(--border)", padding: "6px 12px", borderRadius: "6px", color: "var(--danger, #ef4444)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "500", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; e.currentTarget.style.borderColor = "#ef4444"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border)"; }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            Logout
          </button>
        </div>
      </header>

      <div className="layout" style={{ paddingTop: "var(--navbar-h, 60px)" }}>
        <aside className="sidebar" style={{ top: "var(--navbar-h, 60px)", height: "calc(100vh - var(--navbar-h, 60px))" }}>
          {/* Custom Team Sidebar Visual Design and Bubbles */}
          <div className="sidebar-bubble sidebar-bubble-1" />
          <div className="sidebar-bubble sidebar-bubble-2" />
          <div className="sidebar-bubble sidebar-bubble-3" />
          <div className="sidebar-bubble sidebar-bubble-4" />

          <span className="sidebar-section-label" style={{ marginTop: "10px" }}>Dashboard</span>

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