import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function OrderTrackingPage() {
  const { orderNumber: urlOrderNumber } = useParams();
const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState(
    urlOrderNumber || ""
  );
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(!!urlOrderNumber);
  const [error, setError] = useState("");

  const trackOrder = async (number = orderNumber) => {
    if (!number.trim()) {
      setError("Please enter an order number.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setOrder(null);

      const response = await axios.get(
        `http://localhost:5251/api/orders/${number.trim()}`
      );

      setOrder(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to find the order."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlOrderNumber) {
      trackOrder(urlOrderNumber);
    }
  }, [urlOrderNumber]);

  return (
    <main>
      <h1>Track Your Order</h1>

      <input
        type="text"
        value={orderNumber}
        onChange={(e) => setOrderNumber(e.target.value)}
        placeholder="Enter order number"
      />

      <button onClick={() => trackOrder()} disabled={loading}>
        {loading ? "Tracking..." : "Track Order"}
      </button>

      {error && <p>{error}</p>}

      {order && (
        <section>
          <h2>Order {order.orderNumber}</h2>

<p>
  Status:{" "}
  <strong>
    {order.status === 1
      ? "Order Received"
      : order.status === 2
      ? "Preparing"
      : order.status === 3
      ? "Ready"
      : order.status === 4
      ? "Completed"
      : "Rejected"}
  </strong>
</p>

<div>
  <p>
    {order.status >= 1 ? "●" : "○"} Order Received
  </p>

  {order.status !== 5 && (
    <>
      <p>
        {order.status >= 2 ? "●" : "○"} Preparing
      </p>

      <p>
        {order.status >= 3 ? "●" : "○"} Ready
      </p>

      <p>
        {order.status >= 4 ? "●" : "○"} Completed
      </p>
    </>
  )}

  {order.status === 5 && (
    <p>● Rejected</p>
  )}
</div>

          <p>
            Order Type:{" "}
            <strong>
              {order.orderType === 1 ? "Dine-In" : "Takeout"}
            </strong>
          </p>
<h3>Your Order</h3>

{order.items.map((item) => (
  <p key={item.menuItemId}>
    {item.quantity} × {item.itemName} —{" "}
    {item.lineTotal.toFixed(2)}
  </p>
))}
          <p>Subtotal: {order.subtotalAmount.toFixed(2)}</p>
          <p>Tax: {order.taxAmount.toFixed(2)}</p>
          <p>Total: {order.totalAmount.toFixed(2)}</p>

          {order.rejectionReason && (
            <p>
              Rejection reason: {order.rejectionReason}
            </p>
          )}
        </section>
      )}
      <button onClick={() => navigate("/menu")}>
  Back to Menu
</button>
    </main>
  );
}