import { useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../../services/categoryService";
import useSignalR from "../../hooks/useSignalR";

export default function CategoryManagement() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDisplayOrder, setEditDisplayOrder] = useState(0);
  const [editIsActive, setEditIsActive] = useState(true);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const [deleteTarget, setDeleteTarget] = useState(null);
  async function loadCategories() {
    try {
      setError("");
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load categories."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  useSignalR({
    CategoryCreated: (category) => {
      setCategories((current) => {
        const exists = current.some((item) => item.id === category.id);
        if (exists) return current;

        return [...current, category].sort(
          (a, b) =>
            a.displayOrder - b.displayOrder || a.name.localeCompare(b.name)
        );
      });
    },

    CategoryUpdated: (category) => {
      setCategories((current) =>
        current
          .map((item) => (item.id === category.id ? category : item))
          .sort(
            (a, b) =>
              a.displayOrder - b.displayOrder || a.name.localeCompare(b.name)
          )
      );
    },

    CategoryDeleted: (categoryId) => {
      setCategories((current) =>
        current.filter((item) => item.id !== categoryId)
      );
    },
  });

  async function handleCreate(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      await createCategory({
        name: name.trim(),
        description: description.trim() || null,
        displayOrder: Number(displayOrder),
      });

      setName("");
      setDescription("");
      setDisplayOrder(0);
      setIsCreateModalOpen(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to create category."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing(category) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditDescription(category.description || "");
    setEditDisplayOrder(category.displayOrder);
    setEditIsActive(category.isActive);
    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditName("");
    setEditDescription("");
    setEditDisplayOrder(0);
    setEditIsActive(true);
  }

  async function handleUpdate(event) {
    event.preventDefault();

    if (!editName.trim()) {
      setError("Category name is required.");
      return;
    }

    try {
      setError("");
      setIsSubmitting(true);

      await updateCategory(editingId, {
        name: editName.trim(),
        description: editDescription.trim() || null,
        isActive: editIsActive,
        displayOrder: Number(editDisplayOrder),
      });

      cancelEditing();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update category."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id) {
    // const confirmed = window.confirm(
    //   "Are you sure you want to delete this category?"
    // );

    // if (!confirmed) return;

    try {
      setError("");
      await deleteCategory(id);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to delete category."
      );
    }
  }

  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery.trim()) return true;
    return (
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cat.description &&
        cat.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
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
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
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
          Add Category
        </button>
      </div>

      {/* Modern Categories Table Panel */}
      <div className="modern-data-panel">
        <div className="panel-header-simple">
          <h3 className="panel-title-text">Menu Category Groupings</h3>
          <span className="panel-count-pill">
            {filteredCategories.length}{" "}
            {filteredCategories.length === 1 ? "category" : "categories"}
          </span>
        </div>

        <div className="table-responsive-container">
          {isLoading ? (
            <p style={{ padding: "32px", textAlign: "center", color: "var(--color-text-secondary)" }}>
              Loading categories...
            </p>
          ) : filteredCategories.length === 0 ? (
            <p style={{ padding: "40px", textAlign: "center", color: "var(--color-text-secondary)" }}>
              No categories found.
            </p>
          ) : (
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Display Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <div className="item-name-bold">{category.name}</div>
                    </td>
                    <td>
                      <span className="item-desc-muted" style={{ maxWidth: "400px" }}>
                        {category.description || "No description"}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: "600",
                          background: "var(--color-light-border)",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "13px",
                        }}
                      >
                        {category.displayOrder}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${category.isActive ? "active" : "inactive"
                          }`}
                      >
                        ● {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions-cell">
                        <button
                          type="button"
                          className="btn-table-action edit"
                          onClick={() => startEditing(category)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-table-action delete"
                          onClick={() => setDeleteTarget(category)}
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
          ADD CATEGORY MODAL
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
              <h3 className="modal-title">Add New Category</h3>
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
                  <label htmlFor="category-name">Category Name *</label>
                  <input
                    id="category-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="e.g. Appetizers, Main Course, Beverages"
                    maxLength={100}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="category-description">Description</label>
                  <textarea
                    id="category-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Optional category details or dietary highlights..."
                    maxLength={500}
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="category-display-order">
                    Display Order (Rank)
                  </label>
                  <input
                    id="category-display-order"
                    type="number"
                    value={displayOrder}
                    onChange={(event) => setDisplayOrder(event.target.value)}
                    min="0"
                  />
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
                  {isSubmitting ? "Adding..." : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          EDIT CATEGORY MODAL
          ================================================== */}
      {editingId !== null && (
        <div className="modal-backdrop" onClick={cancelEditing}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Edit Category</h3>
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
                  <label htmlFor="edit-category-name">Category Name *</label>
                  <input
                    id="edit-category-name"
                    type="text"
                    value={editName}
                    onChange={(event) => setEditName(event.target.value)}
                    maxLength={100}
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="edit-category-description">
                    Description
                  </label>
                  <textarea
                    id="edit-category-description"
                    value={editDescription}
                    onChange={(event) =>
                      setEditDescription(event.target.value)
                    }
                    maxLength={500}
                  />
                </div>

                <div className="form-field-group">
                  <label htmlFor="edit-category-order">Display Order</label>
                  <input
                    id="edit-category-order"
                    type="number"
                    value={editDisplayOrder}
                    onChange={(event) =>
                      setEditDisplayOrder(event.target.value)
                    }
                    min="0"
                  />
                </div>

                <div className="form-checkbox-row">
                  <input
                    id="edit-category-active"
                    type="checkbox"
                    checked={editIsActive}
                    onChange={(event) =>
                      setEditIsActive(event.target.checked)
                    }
                  />
                  <label htmlFor="edit-category-active">
                    Category is Active and visible on menu
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
              Delete Category?
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