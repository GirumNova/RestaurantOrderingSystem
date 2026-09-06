import { useEffect, useState } from "react";
import {
  createMenuItem,
  deleteMenuItem,
  getMenuItems,
  updateMenuItem,
} from "../../services/menuItemService";
import { getCategories } from "../../services/categoryService";
import useSignalR from "../../hooks/useSignalR";

export default function MenuItemManagement() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editIsAvailable, setEditIsAvailable] = useState(true);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadData() {
    try {
      setError("");

      const [menuItemData, categoryData] = await Promise.all([
        getMenuItems(),
        getCategories(),
      ]);

      setMenuItems(menuItemData);
      setCategories(categoryData);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load menu items."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useSignalR({
    MenuItemCreated: (menuItem) => {
      setMenuItems((current) => {
        const exists = current.some(
          (item) => item.id === menuItem.id
        );

        if (exists) {
          return current;
        }

        return [...current, menuItem];
      });
    },

    MenuItemUpdated: (menuItem) => {
      setMenuItems((current) =>
        current.map((item) =>
          item.id === menuItem.id ? menuItem : item
        )
      );
    },

    MenuItemDeleted: (menuItemId) => {
      setMenuItems((current) =>
        current.filter((item) => item.id !== menuItemId)
      );
    },
  });

  async function handleCreate(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Menu item name is required.");
      return;
    }

    if (!categoryId) {
      setError("Category is required.");
      return;
    }

    if (price === "" || Number(price) < 0) {
      setError("Price must be a valid non-negative number.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      await createMenuItem({
        name: name.trim(),
        description: description.trim() || null,
        categoryId: Number(categoryId),
        price: Number(price),
        imageUrl: imageUrl.trim() || null,
        isAvailable,
      });

      setName("");
      setDescription("");
      setCategoryId("");
      setPrice("");
      setImageUrl("");
      setIsAvailable(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create menu item."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing(menuItem) {
    setEditingId(menuItem.id);
    setEditName(menuItem.name);
    setEditDescription(menuItem.description || "");
    setEditCategoryId(String(menuItem.categoryId));
    setEditPrice(String(menuItem.price));
    setEditImageUrl(menuItem.imageUrl || "");
    setEditIsAvailable(menuItem.isAvailable);
    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
    setEditCategoryId("");
    setEditPrice("");
    setEditImageUrl("");
    setEditIsAvailable(true);
  }

  async function handleUpdate(event) {
    event.preventDefault();

    if (!editName.trim()) {
      setError("Menu item name is required.");
      return;
    }

    if (!editCategoryId) {
      setError("Category is required.");
      return;
    }

    if (editPrice === "" || Number(editPrice) < 0) {
      setError("Price must be a valid non-negative number.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      await updateMenuItem(editingId, {
        name: editName.trim(),
        description: editDescription.trim() || null,
        categoryId: Number(editCategoryId),
        price: Number(editPrice),
        imageUrl: editImageUrl.trim() || null,
        isAvailable: editIsAvailable,
      });

      cancelEditing();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update menu item."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this menu item?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteMenuItem(id);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete menu item."
      );
    }
  }

  return (
    <section>
      <h2>Menu Item Management</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleCreate}>
        <h3>Add Menu Item</h3>

        <div>
          <label htmlFor="menu-item-name">Name</label>

          <input
            id="menu-item-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={150}
            required
          />
        </div>

        <div>
          <label htmlFor="menu-item-description">
            Description
          </label>

          <textarea
            id="menu-item-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            maxLength={1000}
          />
        </div>

        <div>
          <label htmlFor="menu-item-category">
            Category
          </label>

          <select
            id="menu-item-category"
            value={categoryId}
            onChange={(event) =>
              setCategoryId(event.target.value)
            }
            required
          >
            <option value="">Select category</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="menu-item-price">Price</label>

          <input
            id="menu-item-price"
            type="number"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div>
          <label htmlFor="menu-item-image">Image URL</label>

          <input
            id="menu-item-image"
            type="url"
            value={imageUrl}
            onChange={(event) =>
              setImageUrl(event.target.value)
            }
            maxLength={500}
          />
        </div>

        <div>
          <label htmlFor="menu-item-available">
            Available
          </label>

          <input
            id="menu-item-available"
            type="checkbox"
            checked={isAvailable}
            onChange={(event) =>
              setIsAvailable(event.target.checked)
            }
          />
        </div>

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Menu Item"}
        </button>
      </form>

      <hr />

      <h3>Menu Items</h3>

      {isLoading ? (
        <p>Loading menu items...</p>
      ) : menuItems.length === 0 ? (
        <p>No menu items found.</p>
      ) : (
        <div>
          {menuItems.map((menuItem) => (
            <article key={menuItem.id}>
              {editingId === menuItem.id ? (
                <form onSubmit={handleUpdate}>
                  <div>
                    <label
                      htmlFor={`edit-menu-name-${menuItem.id}`}
                    >
                      Name
                    </label>

                    <input
                      id={`edit-menu-name-${menuItem.id}`}
                      type="text"
                      value={editName}
                      onChange={(event) =>
                        setEditName(event.target.value)
                      }
                      maxLength={150}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`edit-menu-description-${menuItem.id}`}
                    >
                      Description
                    </label>

                    <textarea
                      id={`edit-menu-description-${menuItem.id}`}
                      value={editDescription}
                      onChange={(event) =>
                        setEditDescription(event.target.value)
                      }
                      maxLength={1000}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`edit-menu-category-${menuItem.id}`}
                    >
                      Category
                    </label>

                    <select
                      id={`edit-menu-category-${menuItem.id}`}
                      value={editCategoryId}
                      onChange={(event) =>
                        setEditCategoryId(event.target.value)
                      }
                      required
                    >
                      <option value="">
                        Select category
                      </option>

                      {categories.map((category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor={`edit-menu-price-${menuItem.id}`}
                    >
                      Price
                    </label>

                    <input
                      id={`edit-menu-price-${menuItem.id}`}
                      type="number"
                      value={editPrice}
                      onChange={(event) =>
                        setEditPrice(event.target.value)
                      }
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`edit-menu-image-${menuItem.id}`}
                    >
                      Image URL
                    </label>

                    <input
                      id={`edit-menu-image-${menuItem.id}`}
                      type="url"
                      value={editImageUrl}
                      onChange={(event) =>
                        setEditImageUrl(event.target.value)
                      }
                      maxLength={500}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`edit-menu-available-${menuItem.id}`}
                    >
                      Available
                    </label>

                    <input
                      id={`edit-menu-available-${menuItem.id}`}
                      type="checkbox"
                      checked={editIsAvailable}
                      onChange={(event) =>
                        setEditIsAvailable(
                          event.target.checked
                        )
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <h4>{menuItem.name}</h4>

                  <p>
                    Category: {menuItem.categoryName}
                  </p>

                  <p>
                    {menuItem.description ||
                      "No description"}
                  </p>

                  <p>Price: {menuItem.price}</p>

                  <p>
                    Status:{" "}
                    {menuItem.isAvailable
                      ? "Available"
                      : "Unavailable"}
                  </p>

                  {menuItem.imageUrl && (
                    <img
                      src={menuItem.imageUrl}
                      alt={menuItem.name}
                      width="150"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      startEditing(menuItem)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(menuItem.id)
                    }
                  >
                    Delete
                  </button>
                </>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}