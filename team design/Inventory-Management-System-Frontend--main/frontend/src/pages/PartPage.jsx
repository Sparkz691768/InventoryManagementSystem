import { useEffect, useState } from "react";
import {
  getParts,
  createPart,
  updatePart,
  deletePart,
} from "../services/partService";

export default function PartPage() {
  const initialForm = {
    partName: "",
    partNumber: "",
    category: "",
    quantity: "",
    purchasePrice: "",
    sellingPrice: "",
    vendorId: "",
  };

  const [parts, setParts] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState("");

  const loadParts = async () => {
    try {
      const res = await getParts();
      setParts(res.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load parts.");
    }
  };

  useEffect(() => {
    loadParts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const preparePayload = () => ({
    partName: form.partName,
    partNumber: form.partNumber,
    category: form.category,
    quantity: Number(form.quantity),
    purchasePrice: Number(form.purchasePrice),
    sellingPrice: Number(form.sellingPrice),
    vendorId: form.vendorId ? Number(form.vendorId) : null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = preparePayload();

      if (editingId) {
        await updatePart(editingId, payload);
        setMessage("Part updated successfully.");
      } else {
        await createPart(payload);
        setMessage("Part purchased/added successfully.");
      }

      setForm(initialForm);
      setEditingId(null);
      loadParts();
    } catch (error) {
      console.error(error);
      setMessage("Operation failed. Check Vendor ID or keep it empty.");
    }
  };

  const handleEdit = (part) => {
    setEditingId(part.id);
    setForm({
      partName: part.partName,
      partNumber: part.partNumber,
      category: part.category,
      quantity: part.quantity,
      purchasePrice: part.purchasePrice,
      sellingPrice: part.sellingPrice,
      vendorId: part.vendorId ?? "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this part?")) return;

    try {
      await deletePart(id);
      setMessage("Part deleted successfully.");
      loadParts();
    } catch (error) {
      console.error(error);
      setMessage("Failed to delete part.");
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(initialForm);
    setMessage("");
  };

  return (
    <div>
      <h1>Parts Management</h1>

      {message && <p className="message">{message}</p>}

      <div className="card">
        <h2>{editingId ? "Edit Part" : "Purchase / Add New Part"}</h2>

        <form onSubmit={handleSubmit} className="form-grid">
          <input name="partName" placeholder="Part Name" value={form.partName} onChange={handleChange} required />
          <input name="partNumber" placeholder="Part Number" value={form.partNumber} onChange={handleChange} required />
          <input name="category" placeholder="Category" value={form.category} onChange={handleChange} required />
          <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} required />
          <input name="purchasePrice" type="number" placeholder="Purchase Price" value={form.purchasePrice} onChange={handleChange} required />
          <input name="sellingPrice" type="number" placeholder="Selling Price" value={form.sellingPrice} onChange={handleChange} required />
          <input name="vendorId" type="number" placeholder="Vendor ID optional" value={form.vendorId} onChange={handleChange} />

          <div>
            <button type="submit">{editingId ? "Update Part" : "Add Part"}</button>

            {editingId && (
              <button type="button" className="delete-btn" onClick={handleCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h2>Parts List</h2>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Part Name</th>
              <th>Part Number</th>
              <th>Category</th>
              <th>Qty</th>
              <th>Purchase</th>
              <th>Selling</th>
              <th>Vendor ID</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {parts.length === 0 ? (
              <tr>
                <td colSpan="9">No parts found.</td>
              </tr>
            ) : (
              parts.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.partName}</td>
                  <td>{p.partNumber}</td>
                  <td>{p.category}</td>
                  <td>{p.quantity}</td>
                  <td>{p.purchasePrice}</td>
                  <td>{p.sellingPrice}</td>
                  <td>{p.vendorId ?? "-"}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(p)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(p.id)}>Delete</button>
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