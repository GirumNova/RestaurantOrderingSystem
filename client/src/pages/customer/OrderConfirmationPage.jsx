import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function OrderConfirmationPage() {
  const { orderNumber } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `http://localhost:5251/api/orders/${orderNumber}`
        );

        setOrder(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your order."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return "Order Received";
      case 2:
        return "Preparing";
      case 3:
        return "Ready";
      case 4:
        return "Completed";
      case 5:
        return "Rejected";
      default:
        return "Unknown";
    }
  };

  if (loading) {
    return (
      <main>
        <p>Loading your order...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <h1>Order Not Found</h1>
        <p>{error}</p>

        <button onClick={() => navigate("/menu")}>
          Back to Menu
        </button>
      </main>
    );
  }

  return (
    <main>
      <h1>Order Confirmed</h1>

      <p>Your order has been placed successfully.</p>

      <h2>{order.orderNumber}</h2>

      <p>
        Status: <strong>{getStatusText(order.status)}</strong>
      </p>

      <p>
        Order Type:{" "}
        <strong>
          {order.orderType === 1 ? "Dine-In" : "Takeout"}
        </strong>
      </p>

      <h3>Your Order</h3>

      {order.items.map((item) => (
        <div key={item.menuItemId}>
          <p>
            {item.quantity} × {item.itemName} —{" "}
            {item.lineTotal.toFixed(2)}
          </p>
        </div>
      ))}

      <p>
        Subtotal: {order.subtotalAmount.toFixed(2)}
      </p>

      <p>
        Tax: {order.taxAmount.toFixed(2)}
      </p>

      <p>
        <strong>
          Total: {order.totalAmount.toFixed(2)}
        </strong>
      </p>

      {order.rejectionReason && (
        <p>
          Rejection reason:{" "}
          <strong>{order.rejectionReason}</strong>
        </p>
      )}

      <button
        onClick={() =>
          navigate(`/order/${order.orderNumber}`)
        }
      >
        Track My Order
      </button>

      <button onClick={() => navigate("/menu")}>
        Back to Menu
      </button>
    </main>
  );
}