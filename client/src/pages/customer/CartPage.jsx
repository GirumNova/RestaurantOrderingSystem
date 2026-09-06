import { useCart } from "../../context/CartContext";

export default function CartPage() {
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

  if (cartItems.length === 0) {
    return (
      <main>
        <h1>Your Cart</h1>
        <p>Your cart is empty.</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Your Cart</h1>

      <p>
        {itemCount} {itemCount === 1 ? "item" : "items"}
      </p>

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

          <div>
            <button
              type="button"
              onClick={() => decreaseQuantity(item.id)}
            >
              −
            </button>

            <span>{item.quantity}</span>

            <button
              type="button"
              onClick={() => increaseQuantity(item.id)}
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

      <button type="button" onClick={clearCart}>
        Clear Cart
      </button>

      <button type="button">
        Place Order
      </button>
    </main>
  );
}