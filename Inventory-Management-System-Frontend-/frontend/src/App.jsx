import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import StaffPage from "./pages/StaffPage";
import VendorPage from "./pages/VendorPage";
import CustomerPage from "./pages/CustomerPage";

function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <aside className="sidebar">
          <h2>Vehicle Parts System</h2>
          <Link to="/">Staff</Link>
          <Link to="/vendors">Vendors</Link>
          <Link to="/customers">Customer + Vehicle</Link>
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