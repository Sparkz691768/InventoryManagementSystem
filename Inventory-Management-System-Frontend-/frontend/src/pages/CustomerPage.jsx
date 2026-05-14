import { useState } from "react";
import {
  registerCustomerWithVehicle,
  getCustomerWithVehicles,
} from "../services/customerService";

export default function CustomerPage() {
  const initialForm = {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    vehicleNumber: "",
    make: "",
    model: "",
    year: "",
    color: "",
  };

  const [form, setForm] = useState(initialForm);
  const [customerId, setCustomerId] = useState("");
  const [customer, setCustomer] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...form,
        year: Number(form.year),
      };

      const res = await registerCustomerWithVehicle(payload);
      setMessage("Customer and vehicle registered successfully.");
      setCustomer(res.data);
      setForm(initialForm);
    } catch (error) {
      console.error(error);
      setMessage("Registration failed. Please check the input fields.");
    }
  };

  const handleSearch = async () => {
    if (!customerId) {
      setMessage("Please enter customer ID.");
      return;
    }

    try {
      const res = await getCustomerWithVehicles(customerId);
      setCustomer(res.data);
      setMessage("Customer details loaded successfully.");
    } catch (error) {
      console.error(error);
      setCustomer(null);
      setMessage("Customer not found.");
    }
  };

  return (
    <div>
      <h1>Customer Registration with Vehicle Details</h1>

      {message && <p className="message">{message}</p>}

      <div className="card">
        <h2>Register Customer</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          <input
            name="fullName"
            placeholder="Customer Full Name"
            value={form.fullName}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Customer Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <input
            name="phone"
            placeholder="Phone Number"
            value={form.phone}
            onChange={handleChange}
            required
          />

          <input
            name="address"
            placeholder="Address"
            value={form.address}
            onChange={handleChange}
            required
          />

          <input
            name="vehicleNumber"
            placeholder="Vehicle Number"
            value={form.vehicleNumber}
            onChange={handleChange}
            required
          />

          <input
            name="make"
            placeholder="Vehicle Make"
            value={form.make}
            onChange={handleChange}
            required
          />

          <input
            name="model"
            placeholder="Vehicle Model"
            value={form.model}
            onChange={handleChange}
            required
          />

          <input
            name="year"
            type="number"
            placeholder="Vehicle Year"
            value={form.year}
            onChange={handleChange}
            required
          />

          <input
            name="color"
            placeholder="Vehicle Color"
            value={form.color}
            onChange={handleChange}
            required
          />

          <button type="submit">Register Customer</button>
        </form>
      </div>

      <div className="card">
        <h2>Search Customer with Vehicle</h2>

        <div className="form-grid">
          <input
            type="number"
            placeholder="Enter Customer ID"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          />

          <button type="button" onClick={handleSearch}>
            Search
          </button>
        </div>
      </div>

      {customer && (
        <div className="card">
          <h2>Registered Customer Details</h2>

          <table>
            <tbody>
              <tr>
                <th>ID</th>
                <td>{customer.id}</td>
              </tr>
              <tr>
                <th>Full Name</th>
                <td>{customer.fullName}</td>
              </tr>
              <tr>
                <th>Email</th>
                <td>{customer.email}</td>
              </tr>
              <tr>
                <th>Phone</th>
                <td>{customer.phone}</td>
              </tr>
              <tr>
                <th>Address</th>
                <td>{customer.address}</td>
              </tr>
            </tbody>
          </table>

          <h3>Vehicle Details</h3>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehicle Number</th>
                <th>Make</th>
                <th>Model</th>
                <th>Year</th>
                <th>Color</th>
              </tr>
            </thead>

            <tbody>
              {customer.vehicles && customer.vehicles.length > 0 ? (
                customer.vehicles.map((v) => (
                  <tr key={v.id}>
                    <td>{v.id}</td>
                    <td>{v.vehicleNumber}</td>
                    <td>{v.make}</td>
                    <td>{v.model}</td>
                    <td>{v.year}</td>
                    <td>{v.color}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No vehicle details found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}