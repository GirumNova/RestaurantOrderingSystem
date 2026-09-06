import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCategories,
} from "../../services/categoryService";
import {
  getCustomerMenu,
} from "../../services/menuItemService";
import useSignalR from "../../hooks/useSignalR";
import { useCart } from "../../context/CartContext";

export default function CustomerMenuPage() {
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] =
    useState("all");
    const [selectedItem, setSelectedItem] = useState(null);
const [selectedQuantity, setSelectedQuantity] = useState(1);
const { addToCart } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadMenu() {
    try {
      setError("");
      setIsLoading(true);

      const [categoryData, menuItemData] =
        await Promise.all([
          getCategories(),
          getCustomerMenu(),
        ]);

      setCategories(
        categoryData.filter((category) => category.isActive)
      );

      setMenuItems(menuItemData);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load the menu."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMenu();
  }, []);
useSignalR({
  CategoryCreated: () => {
    loadMenu();
  },

  CategoryUpdated: () => {
    loadMenu();
  },

  CategoryDeleted: () => {
    loadMenu();
  },

  MenuItemCreated: () => {
    loadMenu();
  },

  MenuItemUpdated: () => {
    loadMenu();
  },

  MenuItemDeleted: () => {
    loadMenu();
  },
});
  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return menuItems.filter((item) => {
      const matchesCategory =
        selectedCategoryId === "all" ||
        item.categoryId === Number(selectedCategoryId);

      const matchesSearch =
        !normalizedSearch ||
        item.name.toLowerCase().includes(normalizedSearch) ||
        item.description
          ?.toLowerCase()
          .includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [menuItems, search, selectedCategoryId]);

  const groupedItems = useMemo(() => {
    return categories
      .map((category) => ({
        ...category,
        items: filteredItems.filter(
          (item) => item.categoryId === category.id
        ),
      }))
      .filter((category) => category.items.length > 0);
  }, [categories, filteredItems]);

  if (isLoading) {
    return <p>Loading menu...</p>;
  }

  if (error) {
    return (
      <section>
        <h1>Restaurant Menu</h1>
        <p>{error}</p>

        <button type="button" onClick={loadMenu}>
          Try Again
        </button>
      </section>
    );
  }

  return (
    <main>
      <h1>Restaurant Menu</h1>
    <Link to="/cart">
  View Cart
</Link>
      <div>
        <label htmlFor="menu-search">
          Search
        </label>

        <input
          id="menu-search"
          type="search"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search food..."
        />
      </div>

      <div>
        <button
          type="button"
          onClick={() => setSelectedCategoryId("all")}
        >
          All
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() =>
              setSelectedCategoryId(String(category.id))
            }
          >
            {category.name}
          </button>
        ))}
      </div>

      {groupedItems.length === 0 ? (
        <p>No menu items found.</p>
      ) : (
        groupedItems.map((category) => (
          <section key={category.id}>
            <h2>{category.name}</h2>

            {category.description && (
              <p>{category.description}</p>
            )}

            <div>
              {category.items.map((item) => (
                <article
  key={item.id}
  onClick={() => {
    setSelectedItem(item);
    setSelectedQuantity(1);
  }}
  style={{ cursor: "pointer" }}
>
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      width="200"
                    />
                  )}

                  <h3>{item.name}</h3>

                  <p>
                    {item.description ||
                      "No description"}
                  </p>

                  <p>Price: {item.price}</p>

                    {/* <button
                    type="button"
                    onClick={() => {
                        addToCart(selectedItem, selectedQuantity);
                        setSelectedItem(null);
                        setSelectedQuantity(1);
                    }}
                    >
                    Add to Cart
                    </button> */}
                </article>
              ))}
            </div>
          </section>
        ))
      )}
      {selectedItem && (
  <div
    role="dialog"
    aria-modal="true"
    onClick={() => setSelectedItem(null)}
  >
    <div onClick={(event) => event.stopPropagation()}>
      {selectedItem.imageUrl && (
        <img
          src={selectedItem.imageUrl}
          alt={selectedItem.name}
          width="300"
        />
      )}

      <h2>{selectedItem.name}</h2>

      <p>
        {selectedItem.description || "No description"}
      </p>

      <p>Price: {selectedItem.price}</p>

      <div>
        <button
          type="button"
          onClick={() =>
            setSelectedQuantity((quantity) =>
              Math.max(1, quantity - 1)
            )
          }
        >
          −
        </button>

        <span>{selectedQuantity}</span>

        <button
          type="button"
          onClick={() =>
            setSelectedQuantity((quantity) => quantity + 1)
          }
        >
          +
        </button>
      </div>

        <button
        type="button"
        onClick={() => {
            addToCart(selectedItem, selectedQuantity);
            setSelectedItem(null);
            setSelectedQuantity(1);
        }}
        >
        Add to Cart
        </button>

      <button
        type="button"
        onClick={() => setSelectedItem(null)}
      >
        Close
      </button>
    </div>
  </div>
)}
    </main>
  );
}