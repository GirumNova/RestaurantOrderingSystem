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

  // Create form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isAvailable, setIsAvailable] = useState(true);

  // Edit form state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editIsAvailable, setEditIsAvailable] = useState(true);

  // UI state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  async function loadData() {
    try {
      setError("");

      const [menuItemData, categoryData] = await Promise.all([
        getMenuItems(),
        getCategories(),
      ]);

      setMenuItems(menuItemData);
      setCategories(categoryData);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load menu items."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useSignalR({
    CategoryCreated: () => {
      loadData();
    },

    CategoryUpdated: () => {
      loadData();
    },

    CategoryDeleted: () => {
      loadData();
    },

    MenuItemCreated: (menuItem) => {
      setMenuItems((current) => {
        const exists = current.some((item) => item.id === menuItem.id);
        if (exists) return current;
        return [...current, menuItem];
      });
    },

    MenuItemUpdated: (menuItem) => {
      setMenuItems((current) =>
        current.map((item) => (item.id === menuItem.id ? menuItem : item))
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
      setIsCreateModalOpen(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create menu item."
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
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update menu item."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id) {
    // const confirmed = window.confirm(
    //   "Are you sure you want to delete this menu item?"
    // );

    // if (!confirmed) return;

    try {
      setError("");
      await deleteMenuItem(id);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete menu item."
      );
    }
  }

  // Filtered menu items
  const filteredMenuItems = menuItems.filter((item) => {
    const matchesCategory =
      selectedCategoryFilter === "all" ||
      String(item.categoryId) === String(selectedCategoryFilter);

    const matchesSearch =
      !searchQuery.trim() ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description &&
        item.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="manager-page-view">
      {error && <div className="staff-error-banner">{error}</div>}

      {/* Top Action Bar */}
      <div className="page-top-bar">
        <div className="top-bar-left">
          <div className="search-input-wrapper">
            <svg
              className="search-icon-inside"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="top-bar-search"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="top-bar-filter"
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="btn-primary-action"
          onClick={() => {
            setError("");
            setIsCreateModalOpen(true);
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Menu Item
        </button>
      </div>

      {/* Modern Menu Items Table Panel */}
      <div className="modern-data-panel">
        <div className="panel-header-simple">
          <h3 className="panel-title-text">Catalog Dishes & Drinks</h3>
          <span className="panel-count-pill">
            {filteredMenuItems.length} {filteredMenuItems.length === 1 ? "item" : "items"}
          </span>
        </div>

        <div className="table-responsive-container">
          {isLoading ? (
            <p style={{ padding: "32px", textAlign: "center", color: "var(--color-text-secondary)" }}>
              Loading menu items...
            </p>
          ) : filteredMenuItems.length === 0 ? (
            <p style={{ padding: "40px", textAlign: "center", color: "var(--color-text-secondary)" }}>
              No menu items found.
            </p>
          ) : (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Availability</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMenuItems.map((menuItem) => (
                  <tr key={menuItem.id}>
                    <td>
                      <div className="item-cell-wrapper">
                        {menuItem.imageUrl ? (
                          <img
                            src={menuItem.imageUrl}
                            alt={menuItem.name}
                            className="item-thumbnail"
                          />
                        ) : (
                          <div className="item-thumbnail">🍽</div>
                        )}
                        <div className="item-text-info">
                          <span className="item-name-bold">{menuItem.name}</span>
                          <span className="item-desc-muted">
                            {menuItem.description || "No description provided"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>{menuItem.categoryName || "Uncategorized"}</td>
                    <td className="item-price-tag">
                      ${Number(menuItem.price).toFixed(2)}
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          menuItem.isAvailable ? "available" : "unavailable"
                        }`}
                      >
                        ● {menuItem.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions-cell">
                        <button
                          type="button"
                          className="btn-table-action edit"
                          onClick={() => startEditing(menuItem)}
                        >
                          Edit
                        </button>
                        <button
  type="button"
  className="btn-table-action delete"
  onClick={() => setDeleteTarget(menuItem)}
>
  Delete
</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ==================================================
          ADD MENU ITEM MODAL
          ================================================== */}
      {isCreateModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setIsCreateModalOpen(false)}
        >
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Add New Menu Item</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setIsCreateModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-field-group">
                  <label htmlFor="menu-item-name">Item Name *</label>
                  <input
                    id="menu-item-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Truffle Mushroom Burger"
                    maxLength={150}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="menu-item-category">Category *</label>
                  <select
                    id="menu-item-category"
                    value={categoryId}
                    onChange={(event) => setCategoryId(event.target.value)}
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

                <div className="form-field-group">
                  <label htmlFor="menu-item-price">Price ($) *</label>
                  <input
                    id="menu-item-price"
                    type="number"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="menu-item-image">Image URL</label>
                  <input
                    id="menu-item-image"
                    type="url"
                    value={imageUrl}
                    onChange={(event) => setImageUrl(event.target.value)}
                    placeholder="https://images.example.com/item.jpg"
                    maxLength={500}
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="menu-item-description">Description</label>
                  <textarea
                    id="menu-item-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Provide delicious details about ingredients, flavors..."
                    maxLength={1000}
                  />
                </div>

                <div className="form-checkbox-row">
                  <input
                    id="menu-item-available"
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(event) => setIsAvailable(event.target.checked)}
                  />
                  <label htmlFor="menu-item-available">
                    Available for customer ordering immediately
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Menu Item"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          EDIT MENU ITEM MODAL
          ================================================== */}
      {editingId !== null && (
        <div className="modal-backdrop" onClick={cancelEditing}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Edit Menu Item</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={cancelEditing}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdate}>
              <div className="modal-body">
                <div className="form-field-group">
                  <label htmlFor="edit-menu-name">Item Name *</label>
                  <input
                    id="edit-menu-name"
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    maxLength={150}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="edit-menu-category">Category *</label>
                  <select
                    id="edit-menu-category"
                    value={editCategoryId}
                    onChange={(event) => setEditCategoryId(event.target.value)}
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

                <div className="form-field-group">
                  <label htmlFor="edit-menu-price">Price ($) *</label>
                  <input
                    id="edit-menu-price"
                    type="number"
                    value={editPrice}
                    onChange={(event) => setEditPrice(event.target.value)}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="edit-menu-image">Image URL</label>
                  <input
                    id="edit-menu-image"
                    type="url"
                    value={editImageUrl}
                    onChange={(event) => setEditImageUrl(event.target.value)}
                    maxLength={500}
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="edit-menu-description">Description</label>
                  <textarea
                    id="edit-menu-description"
                    value={editDescription}
                    onChange={(event) => setEditDescription(event.target.value)}
                    maxLength={1000}
                  />
                </div>

                <div className="form-checkbox-row">
                  <input
                    id="edit-menu-available"
                    type="checkbox"
                    checked={editIsAvailable}
                    onChange={(event) =>
                      setEditIsAvailable(event.target.checked)
                    }
                  />
                  <label htmlFor="edit-menu-available">
                    Available for customer ordering
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={cancelEditing}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
  <div
    className="modal-backdrop"
    onClick={() => setDeleteTarget(null)}
  >
    <div
      className="delete-confirm-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="delete-confirm-icon">
        🗑
      </div>

      <h3 className="delete-confirm-title">
        Delete Menu Item?
      </h3>

      <p className="delete-confirm-message">
        Are you sure you want to delete{" "}
        <strong>{deleteTarget.name}</strong>?
      </p>

      <p className="delete-confirm-warning">
        This action cannot be undone.
      </p>

      <div className="delete-confirm-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setDeleteTarget(null)}
        >
          Cancel
        </button>

        <button
          type="button"
          className="btn-danger"
          onClick={async () => {
            await handleDelete(deleteTarget.id);
            setDeleteTarget(null);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}