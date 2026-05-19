import { useEffect, useState } from "react";
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../services/staffService";

export default function StaffPage() {
  const initialForm = {
    fullName: "",
    email: "",
    password: "",
    role: "Staff",
    phoneNumber: "",
  };

  const [staff, setStaff] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadStaff = async () => {
    try {
      const res = await getStaff();
      setStaff(res.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load staff data.");
    }
  };

  useEffect(() => {
    loadStaff();
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
        await updateStaff(editingId, form);
        setMessage("Staff updated successfully.");
      } else {
        await createStaff(form);
        setMessage("Staff added successfully.");
      }

      setForm(initialForm);
      setEditingId(null);
      loadStaff();
    } catch (error) {
      console.error(error);
      setMessage("Operation failed. Please check the input fields.");
    }
  };

  const handleEdit = (staffMember) => {
    setEditingId(staffMember.id);
    setForm({
      fullName: staffMember.fullName,
      email: staffMember.email,
      password: "",
      role: staffMember.role,
      phoneNumber: staffMember.phoneNumber,
    });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this staff?");
    if (!confirmDelete) return;

    try {
      await deleteStaff(id);
      setMessage("Staff deleted successfully.");
      loadStaff();
    } catch (error) {
      console.error(error);
      setMessage("Failed to delete staff.");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(initialForm);
    setMessage("");
  };

  return (
    <div>
      <h1>Staff Registration and Role Management</h1>

      {message && <p className="message">{message}</p>}

      <div className="card">
        <h2>{editingId ? "Update Staff" : "Add New Staff"}</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          <input
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
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
            name="password"
            type="password"
            placeholder={editingId ? "Enter new/current password" : "Password"}
            value={form.password}
            onChange={handleChange}
            required
          />

          <input
            name="phoneNumber"
            placeholder="Phone Number"
            value={form.phoneNumber}
            onChange={handleChange}
            required
          />

          <select name="role" value={form.role} onChange={handleChange}>
            <option value="Staff">Staff</option>
            <option value="Admin">Admin</option>
          </select>

          <div>
            <button type="submit">
              {editingId ? "Update Staff" : "Add Staff"}
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
        <h2>Staff List</h2>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {staff.length === 0 ? (
              <tr>
                <td colSpan="6">No staff records found.</td>
              </tr>
            ) : (
              staff.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.fullName}</td>
                  <td>{s.email}</td>
                  <td>{s.role}</td>
                  <td>{s.phoneNumber}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(s)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(s.id)}>
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