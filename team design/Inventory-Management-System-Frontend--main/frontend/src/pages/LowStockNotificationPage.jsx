import { useEffect, useState } from "react";
import { getLowStockNotifications } from "../services/lowStockService";

export default function LowStockNotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [message, setMessage] = useState("");

  const loadNotifications = async () => {
    try {
      const res = await getLowStockNotifications();
      setNotifications(res.data);

      if (res.data.length === 0) {
        setMessage("No low stock alerts. Inventory level is healthy.");
      } else {
        setMessage(`${res.data.length} low stock alert(s) found.`);
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to load low stock notifications.");
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  return (
    <div>
      <h1>Low Stock Notifications</h1>

      {message && <p className="message">{message}</p>}

      <div className="card">
        <h2>Parts Below Minimum Stock Level</h2>
        <p>System automatically alerts Admin when part quantity is below 10.</p>

        <table>
          <thead>
            <tr>
              <th>Part ID</th>
              <th>Part Name</th>
              <th>Part Number</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Alert Message</th>
            </tr>
          </thead>

          <tbody>
            {notifications.length === 0 ? (
              <tr>
                <td colSpan="6">No low stock parts found.</td>
              </tr>
            ) : (
              notifications.map((item) => (
                <tr key={item.partId}>
                  <td>{item.partId}</td>
                  <td>{item.partName}</td>
                  <td>{item.partNumber}</td>
                  <td>{item.category}</td>
                  <td>
                    <strong className="low-stock-count">{item.quantity}</strong>
                  </td>
                  <td>{item.message}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <button type="button" onClick={loadNotifications}>
          Refresh Notifications
        </button>
      </div>
    </div>
  );
}