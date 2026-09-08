import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../../context/CartContext";

export default function CartPage() {
  const navigate = useNavigate();
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
    itemCount,
    subtotal,
    total,
  } = useCart();
  const [orderType, setOrderType] = useState(1);
  const [placingOrder, setPlacingOrder] = useState(false);
 // const [createdOrder, setCreatedOrder] = useState(null);
  const [error, setError] = useState("");
const placeOrder = async () => {
  try {
    setPlacingOrder(true);
    setError("");

    const response = await axios.post(
      "http://localhost:5251/api/orders",
      {
        orderType,
        items: cartItems.map((item) => ({
          menuItemId: item.id,
          quantity: item.quantity,
        })),
      }
    );

    clearCart();

    navigate(
      `/order-confirmation/${response.data.orderNumber}`
    );
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Unable to place your order."
    );
  } finally {
    setPlacingOrder(false);
  }
};
  //   if (createdOrder) {
  //   return (
  //     <main>
  //       <h1>Order Confirmed</h1>

  //       <p>Your order has been placed successfully.</p>

  //       <h2>{createdOrder.orderNumber}</h2>

  //       <p>Status: Pending</p>

  //       <p>
  //         Order Type:{" "}
  //         <strong>
  //           {createdOrder.orderType === 1
  //             ? "Dine-In"
  //             : "Takeout"}
  //         </strong>
  //       </p>

  //       <p>
  //         Total: {createdOrder.totalAmount.toFixed(2)}
  //       </p>
  //     </main>
  //   );
  // }
 if (cartItems.length === 0) {
    return (
      <main>
        <h1>Your Cart</h1>
        <p>Your cart is empty.</p>
      </main>
    );
  }

  const hasUnavailableItems = cartItems.some(
    (item) => item.isAvailable === false
  );

  return (
    <main>
      <h1>Your Cart</h1>

      <p>
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </p>

      {hasUnavailableItems && (
        <p>
          ⚠️ One or more items in your cart are no longer
          available. Please remove them before placing your
          order.
        </p>
      )}

      {cartItems.map((item) => (
        <article key={item.id}>
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.name}
              width="150"
            />
          )}

          <h2>{item.name}</h2>

          <p>Price: {item.price}</p>

          {!item.isAvailable && (
            <p>
              <strong>
                This item is currently unavailable.
              </strong>
            </p>
          )}

          <div>
            <button
              type="button"
              onClick={() => decreaseQuantity(item.id)}
              disabled={!item.isAvailable}
            >
              −
            </button>

            <span>{item.quantity}</span>

            <button
              type="button"
              onClick={() => increaseQuantity(item.id)}
              disabled={!item.isAvailable}
            >
              +
            </button>
          </div>

          <p>
            Item total:{" "}
            {(item.price * item.quantity).toFixed(2)}
          </p>

          <button
            type="button"
            onClick={() => removeItem(item.id)}
          >
            Remove
          </button>
        </article>
      ))}

      <hr />

      <p>Subtotal: {subtotal.toFixed(2)}</p>
      <p>Total: {total.toFixed(2)}</p>

      <h2>Order Type</h2>

      <label>
        <input
          type="radio"
          name="orderType"
          value="1"
          checked={orderType === 1}
          onChange={() => setOrderType(1)}
        />
        Dine-In
      </label>

      <br />

      <label>
        <input
          type="radio"
          name="orderType"
          value="2"
          checked={orderType === 2}
          onChange={() => setOrderType(2)}
        />
        Takeout
      </label>

      <button type="button" onClick={clearCart}>
        Clear Cart
      </button>

      <button
        type="button"
        onClick={placeOrder}
        disabled={hasUnavailableItems || placingOrder}
      >
        {placingOrder ? "Placing Order..." : "Place Order"}
      </button>
    </main>
  );
}

