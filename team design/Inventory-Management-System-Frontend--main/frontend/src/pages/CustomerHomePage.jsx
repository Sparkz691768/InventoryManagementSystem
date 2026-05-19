export default function CustomerHomePage() {
  const fullName = localStorage.getItem("fullName");

  return (
    <div className="customer-home">
      <div className="home-hero">
        <h1>Welcome, {fullName}!</h1>
        <p>Your trusted Vehicle Parts Management System</p>
      </div>

      <div className="home-cards">
        <div className="home-card">
          <div className="home-card-icon">🔧</div>
          <h3>Quality Parts</h3>
          <p>We stock genuine and OEM-grade vehicle parts for all major makes and models.</p>
        </div>

        <div className="home-card">
          <div className="home-card-icon">🚗</div>
          <h3>Vehicle Tracking</h3>
          <p>Your vehicle details are securely stored and managed in our system.</p>
        </div>

        <div className="home-card">
          <div className="home-card-icon">📦</div>
          <h3>Fast Service</h3>
          <p>Our staff is ready to assist you in finding the right parts quickly.</p>
        </div>

        <div className="home-card">
          <div className="home-card-icon">✅</div>
          <h3>Verified Vendors</h3>
          <p>All parts are sourced from verified and trusted vendors in our network.</p>
        </div>
      </div>

      <div className="home-info">
        <h2>How It Works</h2>
        <ol>
          <li>Register your vehicle details with our staff.</li>
          <li>Our team identifies compatible parts from verified vendors.</li>
          <li>Parts are sourced, checked, and delivered to you.</li>
          <li>Your vehicle record is updated for future reference.</li>
        </ol>
      </div>

      <div className="home-contact">
        <h2>Contact Us</h2>
        <p>Phone: +977-01-4XXXXXX</p>
        <p>Email: support@vehicleparts.com</p>
        <p>Address: Kathmandu, Nepal</p>
      </div>
    </div>
  );
}
