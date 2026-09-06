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

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadCategories() {
    try {
      setError("");

      const data = await getCategories();

      setCategories(data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load categories."
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
        const exists = current.some(
          (item) => item.id === category.id
        );

        if (exists) {
          return current;
        }

        return [...current, category].sort(
          (a, b) =>
            a.displayOrder - b.displayOrder ||
            a.name.localeCompare(b.name)
        );
      });
    },

    CategoryUpdated: (category) => {
      setCategories((current) =>
        current
          .map((item) =>
            item.id === category.id ? category : item
          )
          .sort(
            (a, b) =>
              a.displayOrder - b.displayOrder ||
              a.name.localeCompare(b.name)
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
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to create category."
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
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to update category."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await deleteCategory(id);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to delete category."
      );
    }
  }

  return (
    <section>
      <h2>Category Management</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleCreate}>
        <h3>Add Category</h3>

        <div>
          <label htmlFor="category-name">
            Name
          </label>

          <input
            id="category-name"
            type="text"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            maxLength={100}
            required
          />
        </div>

        <div>
          <label htmlFor="category-description">
            Description
          </label>

          <textarea
            id="category-description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            maxLength={500}
          />
        </div>

        <div>
          <label htmlFor="category-display-order">
            Display Order
          </label>

          <input
            id="category-display-order"
            type="number"
            value={displayOrder}
            onChange={(event) =>
              setDisplayOrder(event.target.value)
            }
            min="0"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Adding..." : "Add Category"}
        </button>
      </form>

      <hr />

      <h3>Categories</h3>

      {isLoading ? (
        <p>Loading categories...</p>
      ) : categories.length === 0 ? (
        <p>No categories found.</p>
      ) : (
        <div>
          {categories.map((category) => (
            <article key={category.id}>
              {editingId === category.id ? (
                <form onSubmit={handleUpdate}>
                  <div>
                    <label htmlFor={`edit-name-${category.id}`}>
                      Name
                    </label>

                    <input
                      id={`edit-name-${category.id}`}
                      type="text"
                      value={editName}
                      onChange={(event) =>
                        setEditName(event.target.value)
                      }
                      maxLength={100}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`edit-description-${category.id}`}
                    >
                      Description
                    </label>

                    <textarea
                      id={`edit-description-${category.id}`}
                      value={editDescription}
                      onChange={(event) =>
                        setEditDescription(
                          event.target.value
                        )
                      }
                      maxLength={500}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`edit-order-${category.id}`}
                    >
                      Display Order
                    </label>

                    <input
                      id={`edit-order-${category.id}`}
                      type="number"
                      value={editDisplayOrder}
                      onChange={(event) =>
                        setEditDisplayOrder(
                          event.target.value
                        )
                      }
                      min="0"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`edit-active-${category.id}`}
                    >
                      Active
                    </label>

                    <input
                      id={`edit-active-${category.id}`}
                      type="checkbox"
                      checked={editIsActive}
                      onChange={(event) =>
                        setEditIsActive(
                          event.target.checked
                        )
                      }
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Saving..."
                      : "Save"}
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
                  <h4>{category.name}</h4>

                  <p>
                    {category.description ||
                      "No description"}
                  </p>

                  <p>
                    Status:{" "}
                    {category.isActive
                      ? "Active"
                      : "Inactive"}
                  </p>

                  <p>
                    Display Order:{" "}
                    {category.displayOrder}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      startEditing(category)
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDelete(category.id)
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