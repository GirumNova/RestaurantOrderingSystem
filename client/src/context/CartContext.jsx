import {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";
import useSignalR from "../hooks/useSignalR";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  function addToCart(item, quantity = 1) {
    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (cartItem) => cartItem.id === item.id
      );

      if (existingItem) {
        return currentItems.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + quantity,
                isAvailable: item.isAvailable,
              }
            : cartItem
        );
      }

      return [
        ...currentItems,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          quantity,
          isAvailable: item.isAvailable,
        },
      ];
    });
  }

  function increaseQuantity(itemId) {
    setCartItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  }

  function decreaseQuantity(itemId) {
    setCartItems((currentItems) =>
      currentItems
        .map((item) =>
          item.id === itemId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeItem(itemId) {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.id !== itemId)
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  useSignalR({
    MenuItemUpdated: (menuItem) => {
      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item.id === menuItem.id
            ? {
                ...item,
                name: menuItem.name,
                price: menuItem.price,
                imageUrl: menuItem.imageUrl,
                isAvailable: menuItem.isAvailable,
              }
            : item
        )
      );
    },

    MenuItemDeleted: (menuItemId) => {
      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item.id === menuItemId
            ? {
                ...item,
                isAvailable: false,
              }
            : item
        )
      );
    },
  });

  const itemCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      ),
    [cartItems]
  );

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total + item.price * item.quantity,
        0
      ),
    [cartItems]
  );

  const total = subtotal;

  const value = {
    cartItems,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    clearCart,
    itemCount,
    subtotal,
    total,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}