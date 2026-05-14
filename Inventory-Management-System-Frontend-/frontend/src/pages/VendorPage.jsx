import { useEffect, useState } from "react";
import {
  getVendors,
  createVendor,
  updateVendor,
  deleteVendor,
} from "../services/vendorService";

export default function VendorPage() {
  const initialForm = {
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
  };

  const [vendors, setVendors] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadVendors = async () => {
    try {
      const res = await getVendors();
      setVendors(res.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load vendor data.");
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await updateVendor(editingId, form);
        setMessage("Vendor updated successfully.");
      } else {
        await createVendor(form);
        setMessage("Vendor added successfully.");
      }

      setForm(initialForm);
      setEditingId(null);
      loadVendors();
    } catch (error) {
      console.error(error);
      setMessage("Operation failed. Please check the input fields.");
    }
  };

  const handleEdit = (vendor) => {
    setEditingId(vendor.id);
    setForm({
      name: vendor.name,
      contactPerson: vendor.contactPerson,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this vendor?");
    if (!confirmDelete) return;

    try {
      await deleteVendor(id);
      setMessage("Vendor deleted successfully.");
      loadVendors();
    } catch (error) {
      console.error(error);
      setMessage("Failed to delete vendor.");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(initialForm);
    setMessage("");
  };

  return (
    <div>
      <h1>Vendor Management</h1>

      {message && <p className="message">{message}</p>}

      <div className="card">
        <h2>{editingId ? "Update Vendor" : "Add New Vendor"}</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          <input
            name="name"
            placeholder="Vendor Name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            name="contactPerson"
            placeholder="Contact Person"
            value={form.contactPerson}
            onChange={handleChange}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
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

          <div>
            <button type="submit">
              {editingId ? "Update Vendor" : "Add Vendor"}
            </button>

            {editingId && (
              <button type="button" className="delete-btn" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Vendor List</h2>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Vendor Name</th>
              <th>Contact Person</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {vendors.length === 0 ? (
              <tr>
                <td colSpan="7">No vendor records found.</td>
              </tr>
            ) : (
              vendors.map((v) => (
                <tr key={v.id}>
                  <td>{v.id}</td>
                  <td>{v.name}</td>
                  <td>{v.contactPerson}</td>
                  <td>{v.email}</td>
                  <td>{v.phone}</td>
                  <td>{v.address}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(v)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(v.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}