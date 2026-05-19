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
  
  // NEW PAYMENT STATUS & METHOD STATES
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paidAmount, setPaidAmount] = useState(0);
  const [esewaRedirectParams, setEsewaRedirectParams] = useState(null);

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
  const getCreditDueDate = () => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 1);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit" });
  };

  const triggerEsewaRedirect = (params) => {
    const form = document.createElement("form");
    form.setAttribute("method", "POST");
    form.setAttribute("action", "https://rc-epay.esewa.com.np/api/epay/main/v2/form");
    
    const fields = {
      amount: params.amount,
      tax_amount: params.taxAmount,
      product_service_charge: params.serviceCharge,
      product_delivery_charge: params.deliveryCharge,
      total_amount: params.totalAmount,
      transaction_uuid: params.transactionUuid,
      product_code: params.productCode,
      signature: params.signature,
      signed_field_names: params.signedFieldNames,
      success_url: params.successUrl,
      failure_url: params.failureUrl,
    };
    
    for (const key in fields) {
      if (fields.hasOwnProperty(key)) {
        const hiddenField = document.createElement("input");
        hiddenField.setAttribute("type", "hidden");
        hiddenField.setAttribute("name", key);
        hiddenField.setAttribute("value", fields[key]);
        form.appendChild(hiddenField);
      }
    }
    
    document.body.appendChild(form);
    form.submit();
  };

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
        paymentStatus: paymentStatus,
        paymentMethod: paymentMethod,
        paidAmount: parseFloat(paidAmount) || 0,
      };

      const res = await createSale(saleData);
      const createdSale = res.data;

      setSaleId(createdSale.id);
      setCart([]);
      
      // Reset payment form states
      setPaymentStatus("Paid");
      setPaymentMethod("Cash");
      setPaidAmount(0);

      // Check for eSewa Sandbox Redirect
      if (createdSale.paymentMethod === "Online" && createdSale.esewaParameters) {
        showMessage("Sale created! Please proceed to eSewa.", "success");
        setEsewaRedirectParams(createdSale.esewaParameters);
      }
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
                {product.productName} - NPR {product.price} (Stock: {product.stockQuantity})
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
                    <td>NPR {item.price}</td>
                    <td>{item.quantity}</td>
                    <td>NPR {calculateSubtotal(item)}</td>
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
                marginTop: "16px",
                padding: "16px",
                background: "var(--card-bg, rgba(255, 255, 255, 0.05))",
                borderRadius: "8px",
                border: "1px solid var(--border-color, #e2e8f0)",
                maxWidth: "350px",
                marginLeft: "auto",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "15px" }}>
                <span style={{ color: "var(--text-secondary, #475569)" }}>Subtotal:</span>
                <span style={{ fontWeight: "600" }}>NPR {calculateTotal()}</span>
              </div>
              {parseFloat(calculateTotal()) > 5000 && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "15px" }}>
                    <span style={{ color: "var(--text-secondary, #475569)" }}>Loyalty Discount (10%):</span>
                    <span style={{ fontWeight: "600", color: "var(--text-color, #000)" }}>- NPR {(parseFloat(calculateTotal()) * 0.10).toFixed(2)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "15px" }}>
                    <span style={{ color: "var(--text-secondary, #475569)" }}>Loyalty Points Earned:</span>
                    <span style={{ fontWeight: "600", color: "var(--text-color, #000)" }}>{Math.floor((parseFloat(calculateTotal()) * 0.90) / 100)} Points</span>
                  </div>
                </>
              )}
              <hr style={{ margin: "12px 0", borderColor: "var(--border-color, #e2e8f0)" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px", fontWeight: "bold" }}>
                <span>Final Total:</span>
                <span>NPR {(parseFloat(calculateTotal()) > 5000 ? parseFloat(calculateTotal()) * 0.90 : parseFloat(calculateTotal())).toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ===== CREATE SALE & SEND INVOICE SECTION ===== */}
      <div className="card">
        <h2>4. Complete Transaction</h2>

        <div className="form-grid" style={{ marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "600", color: "var(--text-dim)" }}>Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                if (e.target.value === "Credit") {
                  setPaymentStatus("Unpaid");
                } else if (e.target.value === "Online") {
                  setPaymentStatus("Paid");
                }
              }}
            >
              <option value="Cash">Cash</option>
              <option value="Credit">Credit</option>
              <option value="Online">Online (eSewa Gateway)</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "600", color: "var(--text-dim)" }}>Payment Status</label>
            <select
              value={paymentStatus}
              disabled={paymentMethod === "Credit" || paymentMethod === "Online"}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                if (e.target.value === "Paid") {
                  setPaidAmount(0);
                }
              }}
            >
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
            </select>
          </div>

          {paymentStatus === "Partial" && (
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: "600", color: "var(--text-dim)" }}>Paid Amount (NPR)</label>
              <input
                type="number"
                min="0"
                placeholder="Enter paid amount"
                value={paidAmount}
                onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
          )}
        </div>

        {/* Real-time Partial / Credit / Online indicators */}
        {(paymentMethod === "Credit" || paymentStatus === "Unpaid" || paymentStatus === "Partial") && (
          <div
            style={{
              background: "var(--surface2, rgba(255,255,255,0.03))",
              padding: "14px",
              borderRadius: "8px",
              border: "1px solid var(--border-color, #e2e8f0)",
              marginBottom: "16px",
              fontSize: "13.5px",
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Bill Total:</span>
              <span style={{ fontWeight: "600" }}>NPR {(parseFloat(calculateTotal()) > 5000 ? parseFloat(calculateTotal()) * 0.90 : parseFloat(calculateTotal())).toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Paid Amount:</span>
              <span style={{ fontWeight: "600" }}>
                NPR {paymentStatus === "Partial" ? paidAmount.toFixed(2) : (paymentStatus === "Paid" ? (parseFloat(calculateTotal()) > 5000 ? parseFloat(calculateTotal()) * 0.90 : parseFloat(calculateTotal())).toFixed(2) : "0.00")}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--warning, #f59e0b)" }}>
              <span>Remaining Balance:</span>
              <span style={{ fontWeight: "bold" }}>
                NPR {(() => {
                  const final = parseFloat(calculateTotal()) > 5000 ? parseFloat(calculateTotal()) * 0.90 : parseFloat(calculateTotal());
                  if (paymentStatus === "Partial") {
                    return Math.max(0, final - paidAmount).toFixed(2);
                  }
                  if (paymentStatus === "Unpaid" || paymentMethod === "Credit") {
                    return final.toFixed(2);
                  }
                  return "0.00";
                })()}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#b45309", marginTop: "4px", borderTop: "1px dashed var(--border-color, #e2e8f0)", paddingTop: "6px" }}>
              <span>Credit Due Date:</span>
              <span style={{ fontWeight: "bold" }}>{getCreditDueDate()}</span>
            </div>
          </div>
        )}

        {paymentMethod === "Online" && (
          <div
            style={{
              background: "rgba(59,130,246,0.06)",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid rgba(59,130,246,0.2)",
              color: "var(--primary, #3b82f6)",
              fontSize: "13px",
              marginBottom: "16px"
            }}
          >
            ℹ️ You will be redirected to the secure **eSewa Sandbox Merchant Gateway** checkout to complete this transaction online.
          </div>
        )}

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
              background: "var(--primary-dim, rgba(59,130,246,0.08))",
              border: "1px solid var(--primary-border, rgba(59,130,246,0.2))",
              padding: "12px",
              borderRadius: "8px",
              color: "var(--primary, #3b82f6)",
            }}
          >
            <strong>Current Sale ID:</strong> {saleId} - Ready to send invoice!
          </div>
        )}
      </div>

      {/* eSewa Manual Redirection Modal */}
      {esewaRedirectParams && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.7)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
          backdropFilter: "blur(4px)"
        }}>
          <div style={{
            background: "var(--bg-color, #1a1f2c)",
            padding: "40px",
            borderRadius: "16px",
            textAlign: "center",
            maxWidth: "400px",
            border: "1px solid var(--border-color, #333)",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
            <h2 style={{ marginBottom: "12px", color: "var(--text-color, #fff)" }}>Secure Checkout</h2>
            <p style={{ color: "var(--text-dim, #999)", marginBottom: "24px", lineHeight: "1.5" }}>
              Your sale has been securely recorded. Click the button below to complete your transaction via the eSewa Gateway.
            </p>
            <button 
              onClick={() => {
                triggerEsewaRedirect(esewaRedirectParams);
                setEsewaRedirectParams(null); // Close modal once clicked
              }}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#41A124",
                color: "white",
                fontSize: "16px",
                fontWeight: "bold",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 6px -1px rgba(65, 161, 36, 0.4)"
              }}
            >
              Proceed to eSewa Payment
            </button>
            <button
              onClick={() => setEsewaRedirectParams(null)}
              style={{
                marginTop: "16px",
                background: "transparent",
                border: "none",
                color: "var(--text-dim, #666)",
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}