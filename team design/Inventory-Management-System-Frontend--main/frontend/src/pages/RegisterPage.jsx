import { useState } from "react";
import { registerCustomer } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";

/* ── icons ── */
const EyeOpen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <path d="M14.12 14.12a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1"  x2="12" y2="3"/>   <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1"  y1="12" x2="3"  y2="12"/>   <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36"/>
    <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

export default function RegisterPage({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "", email: "", phone: "", address: "", password: "",
  });
  const [message,   setMessage]   = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPass,  setShowPass]  = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await registerCustomer(form);
      setIsSuccess(true);
      setMessage("Account created successfully! Redirecting to login...");
      setForm({ fullName: "", email: "", phone: "", address: "", password: "" });
      setTimeout(() => navigate("/login"), 1400);
    } catch (error) {
      setIsSuccess(false);
      const data = error.response?.data;
      if (Array.isArray(data)) {
        setMessage(data.map((e) => e.description).join(" "));
      } else if (typeof data === "string") {
        setMessage(data);
      } else {
        setMessage("Registration failed. Use a new email and a strong password like Test@123.");
      }
    }
  };

  return (
    <>
      {/* ── AUTH NAVBAR ── */}
      <header className="top-navbar">
        <div className="nb-brand">
          <div className="nb-gear-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0
                01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2
                2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2
                2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2
                2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2
                0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0
                014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0
                012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0
                010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
            </svg>
          </div>
          <div className="nb-brand-text">
            <span className="nb-brand-name">Auto<span>लय</span></span>
            <span className="nb-brand-sub">Management System</span>
          </div>
        </div>

        <div className="nb-right">
          <button className="theme-toggle" onClick={onToggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
            {theme === "dark" ? <SunIcon /> : <MoonIcon />}
          </button>
          <div className="nb-sep" />
          <span className="nb-auth-hint">
            Have an account? <Link to="/login">Sign in</Link>
          </span>
        </div>
      </header>

      {/* ── PAGE ── */}
      <div className="auth-container">
        <div className="auth-gear auth-gear-1">⚙</div>
        <div className="auth-gear auth-gear-2">⚙</div>
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />

        <div className="auth-card auth-card-wide">
          <h1>Create Account</h1>
          <p>Register as a customer to get started</p>

          {message && (
            <div className={isSuccess ? "auth-alert auth-alert-success" : "auth-alert auth-alert-error"}>
              {isSuccess ? "✓" : "✕"}&nbsp; {message}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="auth-form-grid">
              <div className="auth-field">
                <label>Full Name</label>
                <input name="fullName" placeholder="John Doe"
                  value={form.fullName} onChange={handleChange} required />
              </div>

              <div className="auth-field">
                <label>Email Address</label>
                <input name="email" type="email" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} required />
              </div>

              <div className="auth-field">
                <label>Phone Number</label>
                <input name="phone" placeholder="+977 98XXXXXXXX"
                  value={form.phone} onChange={handleChange} required />
              </div>

              <div className="auth-field">
                <label>Address</label>
                <input name="address" placeholder="Kathmandu, Nepal"
                  value={form.address} onChange={handleChange} required />
              </div>

              <div className="auth-field auth-field-full">
                <label>Password</label>
                <div className="auth-input-wrap">
                  <input name="password" type={showPass ? "text" : "password"}
                    placeholder="Min 8 chars e.g. Test@123"
                    value={form.password} onChange={handleChange} required />
                  <button type="button" className="pw-toggle"
                    onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                    {showPass ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="auth-submit">
              Create Account
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          </form>

          <p className="auth-footer-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
