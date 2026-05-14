import { useEffect, useState } from "react";
import {
  searchCustomers,
  getProducts,
  createSale,
  sendInvoice,
} from "../services/staffService";

export default function StaffPage() {
  // Customer Search State
  const [searchInput, setSearchInput] = useState({
    name: "",
    phone: "",
    vehicleNumber: "",
  });
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Product & Cart State
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  // Sale & Invoice State
  const [saleId, setSaleId] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (error) {
      console.error(error);
      showMessage("Failed to load products.", "error");
    }
  };

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  // ===== CUSTOMER SEARCH SECTION =====
  const handleSearchInputChange = (e) => {
    setSearchInput({
      ...searchInput,
      [e.target.name]: e.target.value,
    });
  };

  const handleSearchCustomers = async () => {
    if (!searchInput.name && !searchInput.phone && !searchInput.vehicleNumber) {
      showMessage("Please enter at least one search criteria.", "error");
      return;
    }

    try {
      const res = await searchCustomers(
        searchInput.name,
        searchInput.phone,
        searchInput.vehicleNumber
      );
      setSearchResults(res.data);
      if (res.data.length === 0) {
        showMessage("No customers found.", "error");
      }
    } catch (error) {
      console.error(error);
      showMessage("Failed to search customers.", "error");
    }
  };

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setSearchResults([]);
    showMessage(`Selected customer: ${customer.fullName}`);
  };

  // ===== PRODUCT & CART SECTION =====
  const handleAddToCart = () => {
    if (!selectedProductId) {
      showMessage("Please select a product.", "error");
      return;
    }

    if (selectedQuantity < 1) {
      showMessage("Quantity must be at least 1.", "error");
      return;
    }

    const product = products.find((p) => p.id === parseInt(selectedProductId));
    if (!product) {
      showMessage("Product not found.", "error");
      return;
    }

    if (selectedQuantity > product.stockQuantity) {
      showMessage(
        `Insufficient stock. Available: ${product.stockQuantity}`,
        "error"
      );
      return;
    }

    // Check if product already in cart
    const existingItem = cart.find((item) => item.productId === product.id);
    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + selectedQuantity;
      if (newQuantity > product.stockQuantity) {
        showMessage(
          `Total quantity exceeds stock. Available: ${product.stockQuantity}`,
          "error"
        );
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } else {
      // Add new item
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.productName,
          price: product.price,
          quantity: selectedQuantity,
        },
      ]);
    }

    setSelectedProductId("");
    setSelectedQuantity(1);
    showMessage("Product added to cart.");
  };

  const handleRemoveFromCart = (productId) => {
    setCart(cart.filter((item) => item.productId !== productId));
    showMessage("Product removed from cart.");
  };

  const calculateSubtotal = (item) => {
    return (item.quantity * item.price).toFixed(2);
  };

  const calculateTotal = () => {
    return cart
      .reduce((sum, item) => sum + item.quantity * item.price, 0)
      .toFixed(2);
  };

  // ===== CREATE SALE SECTION =====
  const handleCreateSale = async () => {
    if (!selectedCustomer) {
      showMessage("Please select a customer.", "error");
      return;
    }

    if (cart.length === 0) {
      showMessage("Please add products to cart.", "error");
      return;
    }

    try {
      const saleData = {
        customerId: selectedCustomer.id,
        items: cart.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      };

      const res = await createSale(saleData);
      setSaleId(res.data.id);
      setCart([]);
      showMessage(
        `Sale created successfully! Sale ID: ${res.data.id}. You can now send the invoice.`
      );
    } catch (error) {
      console.error(error);
      showMessage("Failed to create sale. Please try again.", "error");
    }
  };

  // ===== SEND INVOICE SECTION =====
  const handleSendInvoice = async () => {
    if (!saleId) {
      showMessage("No sale to send invoice for.", "error");
      return;
    }

    try {
      await sendInvoice(saleId);
      showMessage("Invoice sent successfully to customer email!");
      setSaleId(null);
    } catch (error) {
      console.error(error);
      showMessage("Failed to send invoice. Please try again.", "error");
    }
  };

  return (
    <div>
      <h1>Sales & Invoice Management</h1>

      {message && (
        <p
          className="message"
          style={
            messageType === "error"
              ? { background: "#fee2e2", color: "#991b1b", borderColor: "#dc2626" }
              : {}
          }
        >
          {message}
        </p>
      )}

      {/* ===== CUSTOMER SEARCH SECTION ===== */}
      <div className="card">
        <h2>1. Search Customer</h2>
        <div className="form-grid">
          <input
            name="name"
            placeholder="Customer Name"
            value={searchInput.name}
            onChange={handleSearchInputChange}
          />
          <input
            name="phone"
            placeholder="Phone Number"
            value={searchInput.phone}
            onChange={handleSearchInputChange}
          />
          <input
            name="vehicleNumber"
            placeholder="Vehicle Number"
            value={searchInput.vehicleNumber}
            onChange={handleSearchInputChange}
          />
          <button onClick={handleSearchCustomers}>Search</button>
        </div>

        {selectedCustomer && (
          <div
            style={{
              background: "#dcfce7",
              padding: "12px",
              borderRadius: "8px",
              marginTop: "12px",
              color: "#166534",
            }}
          >
            <strong>Selected Customer:</strong> {selectedCustomer.fullName} |{" "}
            {selectedCustomer.phone} | {selectedCustomer.vehicleNumber}
            <button
              style={{
                marginLeft: "12px",
                background: "#dc2626",
                padding: "6px 12px",
                fontSize: "12px",
              }}
              onClick={() => setSelectedCustomer(null)}
            >
              Change
            </button>
          </div>
        )}

        {searchResults.length > 0 && (
          <table style={{ marginTop: "12px" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Vehicle Number</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.fullName}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.vehicleNumber}</td>
                  <td>
                    <button
                      style={{ padding: "6px 12px", fontSize: "12px" }}
                      onClick={() => handleSelectCustomer(customer)}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ===== PRODUCT SELECTION SECTION ===== */}
      <div className="card">
        <h2>2. Select Products</h2>
        <div className="form-grid">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            <option value="">-- Select a Product --</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.productName} - ${product.price} (Stock: {product.stockQuantity})
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            placeholder="Quantity"
            value={selectedQuantity}
            onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
          />

          <button onClick={handleAddToCart}>Add to Cart</button>
        </div>
      </div>

      {/* ===== CART SECTION ===== */}
      <div className="card">
        <h2>3. Shopping Cart</h2>

        {cart.length === 0 ? (
          <p style={{ color: "#999" }}>Cart is empty. Add products above.</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.productId}>
                    <td>{item.productName}</td>
                    <td>${item.price}</td>
                    <td>{item.quantity}</td>
                    <td>${calculateSubtotal(item)}</td>
                    <td>
                      <button
                        className="delete-btn"
                        style={{ padding: "6px 12px", fontSize: "12px" }}
                        onClick={() => handleRemoveFromCart(item.productId)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div
              style={{
                textAlign: "right",
                marginTop: "12px",
                fontSize: "18px",
                fontWeight: "bold",
                color: "#12372a",
              }}
            >
              Total: ${calculateTotal()}
            </div>
          </>
        )}
      </div>

      {/* ===== CREATE SALE & SEND INVOICE SECTION ===== */}
      <div className="card">
        <h2>4. Complete Transaction</h2>

        <div style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
          <button
            onClick={handleCreateSale}
            style={{ flex: 1 }}
            disabled={!selectedCustomer || cart.length === 0}
          >
            Create Sale
          </button>

          {saleId && (
            <button onClick={handleSendInvoice} style={{ flex: 1 }}>
              Send Invoice Email (Sale #{saleId})
            </button>
          )}
        </div>

        {saleId && (
          <div
            style={{
              background: "#dbeafe",
              padding: "12px",
              borderRadius: "8px",
              color: "#1e40af",
            }}
          >
            <strong>Current Sale ID:</strong> {saleId} - Ready to send invoice!
          </div>
        )}
      </div>
    </div>
  );
}