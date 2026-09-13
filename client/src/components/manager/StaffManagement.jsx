import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:5251/api";

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    members: [
      {
        fullName: "",
        email: "",
        phoneNumber: "",
        position: "",
      },
    ],
  });

  const [creating, setCreating] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  const [editStaffForm, setEditStaffForm] = useState({
    name: "",
    email: "",
  });

  const [updatingStaff, setUpdatingStaff] = useState(false);
  const [addingMemberFor, setAddingMemberFor] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [editingMemberFor, setEditingMemberFor] = useState(null);
  const [memberForm, setMemberForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    position: "",
  });

const [deleteMemberTarget, setDeleteMemberTarget] = useState(null);

const [statusTarget, setStatusTarget] = useState(null);
const [memberStatusTarget, setMemberStatusTarget] = useState(null);
  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      const storedAuth = localStorage.getItem("restaurant_auth");

      if (!storedAuth) {
        setError("Authentication information is missing.");
        return;
      }

      const auth = JSON.parse(storedAuth);

      const response = await axios.get(`${API_URL}/staff`, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });

      setStaff(response.data);
    } catch (err) {
      console.error("Failed to load staff:", err);
      setError(
        err.response?.data?.message || "Failed to load staff."
      );
    } finally {
      setLoading(false);
    }
  };

  const createStaff = async (event) => {
    event.preventDefault();

    const memberEmails = createForm.members.map((member) =>
      member.email.trim().toLowerCase()
    );

    const hasDuplicateMembers =
      memberEmails.length !== new Set(memberEmails).size;

    if (hasDuplicateMembers) {
      setError("Duplicate staff member emails are not allowed.");
      return;
    }

    const existingMemberEmails = staff.flatMap((account) =>
      account.members.map((member) => member.email.trim().toLowerCase())
    );

    const hasExistingMember = memberEmails.some((email) =>
      existingMemberEmails.includes(email)
    );

    if (hasExistingMember) {
      setError("One or more staff member emails already exist.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const storedAuth = localStorage.getItem("restaurant_auth");
      const auth = JSON.parse(storedAuth);

      const response = await axios.post(`${API_URL}/staff`, createForm, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });

      setStaff((currentStaff) => [...currentStaff, response.data]);

      setCreateForm({
        name: "",
        email: "",
        password: "",
        members: [
          {
            fullName: "",
            email: "",
            phoneNumber: "",
            position: "",
          },
        ],
      });

      setShowCreateForm(false);
    } catch (err) {
      console.error("Failed to create staff:", err);
      setError(err.response?.data?.message || "Failed to create staff.");
      setShowCreateForm(true);
    } finally {
      setCreating(false);
    }
  };

  const updateStaff = async (event) => {
    event.preventDefault();

    try {
      setUpdatingStaff(true);
      setError("");

      const storedAuth = localStorage.getItem("restaurant_auth");
      const auth = JSON.parse(storedAuth);

      const response = await axios.put(
        `${API_URL}/staff/${editingStaff.accountId}`,
        editStaffForm,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );

      setStaff((currentStaff) =>
        currentStaff.map((account) =>
          account.accountId === editingStaff.accountId
            ? response.data
            : account
        )
      );

      setEditingStaff(null);
    } catch (err) {
      console.error("Failed to update staff:", err);
      setError(err.response?.data?.message || "Failed to update staff.");
    } finally {
      setUpdatingStaff(false);
    }
  };

  const addStaffMember = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const storedAuth = localStorage.getItem("restaurant_auth");
      const auth = JSON.parse(storedAuth);

      const response = await axios.post(
        `${API_URL}/staff/${addingMemberFor}/members`,
        memberForm,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );

      setStaff((currentStaff) =>
        currentStaff.map((account) =>
          account.accountId === addingMemberFor
            ? {
                ...account,
                members: [...account.members, response.data],
              }
            : account
        )
      );

      setAddingMemberFor(null);
      setMemberForm({
        fullName: "",
        email: "",
        phoneNumber: "",
        position: "",
      });
    } catch (err) {
      console.error("Failed to add staff member:", err);
      setError(err.response?.data?.message || "Failed to add staff member.");
    }
  };

  const updateStaffMember = async (event) => {
    event.preventDefault();

    try {
      setError("");

      const storedAuth = localStorage.getItem("restaurant_auth");
      const auth = JSON.parse(storedAuth);

      const response = await axios.put(
        `${API_URL}/staff/${editingMemberFor}/members/${editingMember.id}`,
        memberForm,
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
          },
        }
      );

      setStaff((currentStaff) =>
        currentStaff.map((account) =>
          account.accountId === editingMemberFor
            ? {
                ...account,
                members: account.members.map((member) =>
                  member.id === editingMember.id ? response.data : member
                ),
              }
            : account
        )
      );

      setEditingMember(null);
      setEditingMemberFor(null);
      setMemberForm({
        fullName: "",
        email: "",
        phoneNumber: "",
        position: "",
      });
    } catch (err) {
      console.error("Failed to update staff member:", err);
      setError(err.response?.data?.message || "Failed to update staff member.");
    }
  };

  const updateStaffMemberStatus = async (accountId, member) => {
    try {
      setError("");

      const storedAuth = localStorage.getItem("restaurant_auth");
      const auth = JSON.parse(storedAuth);

      await axios.put(
        `${API_URL}/staff/${accountId}/members/${member.id}/status`,
        JSON.stringify(!member.isActive),
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setStaff((currentStaff) =>
        currentStaff.map((account) =>
          account.accountId === accountId
            ? {
                ...account,
                members: account.members.map((currentMember) =>
                  currentMember.id === member.id
                    ? {
                        ...currentMember,
                        isActive: !currentMember.isActive,
                      }
                    : currentMember
                ),
              }
            : account
        )
      );
    } catch (err) {
      console.error("Failed to update staff member status:", err);
      setError(
        err.response?.data?.message || "Failed to update staff member status."
      );
    }
  };

  const deleteStaffMember = async (accountId, memberId) => {
    // const confirmed = window.confirm(
    //   "Are you sure you want to delete this staff member?"
    // );

    // if (!confirmed) return;

    try {
      setError("");

      const storedAuth = localStorage.getItem("restaurant_auth");
      const auth = JSON.parse(storedAuth);

      await axios.delete(`${API_URL}/staff/${accountId}/members/${memberId}`, {
        headers: {
          Authorization: `Bearer ${auth.accessToken}`,
        },
      });

      setStaff((currentStaff) =>
        currentStaff.map((account) =>
          account.accountId === accountId
            ? {
                ...account,
                members: account.members.filter(
                  (member) => member.id !== memberId
                ),
              }
            : account
        )
      );
    } catch (err) {
      console.error("Failed to delete staff member:", err);
      setError(
        err.response?.data?.message || "Failed to delete staff member."
      );
    }
  };

  const updateStaffStatus = async (account) => {
    try {
      setError("");

      const storedAuth = localStorage.getItem("restaurant_auth");
      const auth = JSON.parse(storedAuth);

      await axios.put(
        `${API_URL}/staff/${account.accountId}/status`,
        JSON.stringify(!account.isActive),
        {
          headers: {
            Authorization: `Bearer ${auth.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      setStaff((currentStaff) =>
        currentStaff.map((staffAccount) =>
          staffAccount.accountId === account.accountId
            ? {
                ...staffAccount,
                isActive: !staffAccount.isActive,
              }
            : staffAccount
        )
      );
    } catch (err) {
      console.error("Failed to update staff status:", err);
      setError(err.response?.data?.message || "Failed to update staff status.");
    }
  };

  const totalMembers = staff.reduce(
    (acc, account) => acc + (account.members ? account.members.length : 0),
    0
  );

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--color-text-secondary)" }}>
        Loading staff accounts...
      </div>
    );
  }

  return (
    <div className="manager-page-view">
      {error && <div className="staff-error-banner">{error}</div>}

      {/* Top Action Bar */}
      <div className="page-top-bar">
        <div className="top-bar-left">
          <div style={{ display: "flex", gap: "12px" }}>
            <span className="panel-count-pill" style={{ padding: "6px 14px" }}>
              Accounts: {staff.length}
            </span>
            <span className="panel-count-pill" style={{ padding: "6px 14px", background: "#ECFDF5", color: "#047857" }}>
              Total Members: {totalMembers}
            </span>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary-action"
          onClick={() => {
            setError("");
            setShowCreateForm(true);
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
          Create Staff Account
        </button>
      </div>

      {/* Staff Accounts List */}
      <div className="staff-accounts-list">
        {staff.length === 0 ? (
          <div className="modern-data-panel" style={{ padding: "40px", textAlign: "center" }}>
            <p style={{ color: "var(--color-text-secondary)" }}>
              No staff accounts found. Click "Create Staff Account" above to get started.
            </p>
          </div>
        ) : (
          staff.map((account) => (
            <div key={account.accountId} className="staff-account-block">
              {/* Account Header */}
              <div className="staff-account-header">
                <div className="staff-account-meta">
                  <div className="item-thumbnail" style={{ width: "40px", height: "40px", fontSize: "16px" }}>
                    👥
                  </div>
                  <div>
                    <h3 className="staff-acc-title">{account.name}</h3>
                    <span className="staff-acc-email">{account.email}</span>
                  </div>
                  <span
                    className={`status-pill ${
                      account.isActive ? "active" : "inactive"
                    }`}
                    style={{ marginLeft: "12px" }}
                  >
                    ● {account.isActive ? "Active Account" : "Deactivated"}
                  </span>
                </div>

                <div className="table-actions-cell">
                  <button
                    type="button"
                    className="btn-table-action edit"
                    onClick={() => {
                      setEditingStaff(account);
                      setEditStaffForm({
                        name: account.name,
                        email: account.email,
                      });
                    }}
                  >
                    Edit Account
                  </button>

                  <button
                    type="button"
                    className={`btn-table-action ${account.isActive ? "delete" : "toggle"}`}
                    onClick={() => setStatusTarget(account)}
                  >
                    {account.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>

              {/* Members Sub-Table */}
              <div className="staff-members-subtable">
                <div className="members-header-bar">
                  <span className="members-title">
                    Assigned Team Members ({account.members ? account.members.length : 0})
                  </span>
                  <button
                    type="button"
                    className="btn-table-action edit"
                    onClick={() => {
                      setAddingMemberFor(account.accountId);
                      setMemberForm({
                        fullName: "",
                        email: "",
                        phoneNumber: "",
                        position: "",
                      });
                    }}
                  >
                    + Add Member
                  </button>
                </div>

                <div className="table-responsive-container">
                  {!account.members || account.members.length === 0 ? (
                    <p style={{ padding: "20px 24px", color: "var(--color-text-secondary)", fontSize: "13px" }}>
                      No members assigned to this account yet. Click "+ Add Member" to add team members.
                    </p>
                  ) : (
                    <table className="modern-table">
                      <thead>
                        <tr>
                          <th>Full Name</th>
                          <th>Position</th>
                          <th>Email</th>
                          <th>Phone</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {account.members.map((member) => (
                          <tr key={member.id}>
                            <td>
                              <span className="item-name-bold">{member.fullName}</span>
                            </td>
                            <td>{member.position || "Staff"}</td>
                            <td>{member.email}</td>
                            <td>{member.phoneNumber || "—"}</td>
                            <td>
                              <span
                                className={`status-pill ${
                                  member.isActive ? "active" : "inactive"
                                }`}
                              >
                                ● {member.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions-cell">
                                <button
                                  type="button"
                                  className="btn-table-action edit"
                                  onClick={() => {
                                    setEditingMember(member);
                                    setEditingMemberFor(account.accountId);
                                    setMemberForm({
                                      fullName: member.fullName,
                                      email: member.email,
                                      phoneNumber: member.phoneNumber || "",
                                      position: member.position || "",
                                    });
                                  }}
                                >
                                  Edit
                                </button>
                                <button
  type="button"
  className="btn-table-action toggle"
  onClick={() =>
    setMemberStatusTarget({
      accountId: account.accountId,
      member,
    })
  }
>
  {member.isActive ? "Deactivate" : "Activate"}
</button>
                                <button
  type="button"
  className="btn-table-action delete"
  onClick={() =>
    setDeleteMemberTarget({
      accountId: account.accountId,
      member,
    })
  }
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
            </div>
          ))
        )}
      </div>

      {/* ==================================================
          CREATE STAFF ACCOUNT MODAL
          ================================================== */}
      {showCreateForm && (
        <div className="modal-backdrop" onClick={() => setShowCreateForm(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "640px" }}>
            <div className="modal-header">
              <h3 className="modal-title">Create Staff Account</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowCreateForm(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={createStaff}>
              <div className="modal-body">
                <div className="form-field-group">
                  <label>Staff Account Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Kitchen Team, Cashier Station"
                    value={createForm.name}
                    onChange={(event) =>
                      setCreateForm({
                        ...createForm,
                        name: event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Login Email Address *</label>
                  <input
                    type="email"
                    placeholder="kitchen@restaurant.com"
                    value={createForm.email}
                    onChange={(event) =>
                      setCreateForm({
                        ...createForm,
                        email: event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Account Password (min 8 characters) *</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={createForm.password}
                    onChange={(event) =>
                      setCreateForm({
                        ...createForm,
                        password: event.target.value,
                      })
                    }
                    required
                    minLength={8}
                  />
                </div>

                <div style={{ marginTop: "12px", borderTop: "1px solid var(--color-light-border)", paddingTop: "16px" }}>
                  <h4 style={{ margin: "0 0 12px 0", fontSize: "14px", fontWeight: "700", color: "var(--color-heading)" }}>
                    Initial Staff Members
                  </h4>

                  {createForm.members.map((member, index) => (
                    <div
                      key={index}
                      style={{
                        background: "#F8FAFC",
                        padding: "14px",
                        borderRadius: "8px",
                        border: "1px solid var(--color-border)",
                        marginBottom: "12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--color-heading)" }}>
                          Member #{index + 1}
                        </span>
                        {createForm.members.length > 1 && (
                          <button
                            type="button"
                            className="btn-table-action delete"
                            style={{ height: "26px", fontSize: "12px" }}
                            onClick={() => {
                              const members = createForm.members.filter(
                                (_, memberIndex) => memberIndex !== index
                              );
                              setCreateForm({ ...createForm, members });
                            }}
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <input
                          type="text"
                          placeholder="Full name *"
                          value={member.fullName}
                          onChange={(event) => {
                            const members = [...createForm.members];
                            members[index] = {
                              ...members[index],
                              fullName: event.target.value,
                            };
                            setCreateForm({ ...createForm, members });
                          }}
                          required
                        />
                        <input
                          type="email"
                          placeholder="Email *"
                          value={member.email}
                          onChange={(event) => {
                            const members = [...createForm.members];
                            members[index] = {
                              ...members[index],
                              email: event.target.value,
                            };
                            setCreateForm({ ...createForm, members });
                          }}
                          required
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                        <input
                          type="text"
                          placeholder="Phone number"
                          value={member.phoneNumber}
                          onChange={(event) => {
                            const members = [...createForm.members];
                            members[index] = {
                              ...members[index],
                              phoneNumber: event.target.value,
                            };
                            setCreateForm({ ...createForm, members });
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Position (e.g. Line Cook, Waiter)"
                          value={member.position}
                          onChange={(event) => {
                            const members = [...createForm.members];
                            members[index] = {
                              ...members[index],
                              position: event.target.value,
                            };
                            setCreateForm({ ...createForm, members });
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ width: "100%", marginTop: "4px" }}
                    onClick={() =>
                      setCreateForm({
                        ...createForm,
                        members: [
                          ...createForm.members,
                          {
                            fullName: "",
                            email: "",
                            phoneNumber: "",
                            position: "",
                          },
                        ],
                      })
                    }
                  >
                    + Add Another Member Row
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={creating}
                >
                  {creating ? "Creating Account..." : "Create Staff Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          EDIT STAFF ACCOUNT MODAL
          ================================================== */}
      {editingStaff && (
        <div className="modal-backdrop" onClick={() => setEditingStaff(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Staff Account</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setEditingStaff(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={updateStaff}>
              <div className="modal-body">
                <div className="form-field-group">
                  <label>Staff Account Name *</label>
                  <input
                    type="text"
                    value={editStaffForm.name}
                    onChange={(event) =>
                      setEditStaffForm({
                        ...editStaffForm,
                        name: event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Staff Email Address *</label>
                  <input
                    type="email"
                    value={editStaffForm.email}
                    onChange={(event) =>
                      setEditStaffForm({
                        ...editStaffForm,
                        email: event.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditingStaff(null)}
                  disabled={updatingStaff}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary-action"
                  disabled={updatingStaff}
                >
                  {updatingStaff ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          ADD MEMBER MODAL
          ================================================== */}
      {addingMemberFor && (
        <div className="modal-backdrop" onClick={() => setAddingMemberFor(null)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Add Staff Member</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setAddingMemberFor(null)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={addStaffMember}>
              <div className="modal-body">
                <div className="form-field-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Alex Johnson"
                    value={memberForm.fullName}
                    onChange={(event) =>
                      setMemberForm({
                        ...memberForm,
                        fullName: event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    placeholder="alex@restaurant.com"
                    value={memberForm.email}
                    onChange={(event) =>
                      setMemberForm({
                        ...memberForm,
                        email: event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={memberForm.phoneNumber}
                    onChange={(event) =>
                      setMemberForm({
                        ...memberForm,
                        phoneNumber: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-field-group">
                  <label>Position / Role</label>
                  <input
                    type="text"
                    placeholder="e.g. Head Chef, Host, Server"
                    value={memberForm.position}
                    onChange={(event) =>
                      setMemberForm({
                        ...memberForm,
                        position: event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setAddingMemberFor(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================
          EDIT MEMBER MODAL
          ================================================== */}
      {editingMember && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setEditingMember(null);
            setEditingMemberFor(null);
          }}
        >
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Edit Staff Member</h3>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => {
                  setEditingMember(null);
                  setEditingMemberFor(null);
                }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={updateStaffMember}>
              <div className="modal-body">
                <div className="form-field-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={memberForm.fullName}
                    onChange={(event) =>
                      setMemberForm({
                        ...memberForm,
                        fullName: event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={memberForm.email}
                    onChange={(event) =>
                      setMemberForm({
                        ...memberForm,
                        email: event.target.value,
                      })
                    }
                    required
                  />
                </div>

                <div className="form-field-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    value={memberForm.phoneNumber}
                    onChange={(event) =>
                      setMemberForm({
                        ...memberForm,
                        phoneNumber: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="form-field-group">
                  <label>Position / Role</label>
                  <input
                    type="text"
                    value={memberForm.position}
                    onChange={(event) =>
                      setMemberForm({
                        ...memberForm,
                        position: event.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditingMember(null);
                    setEditingMemberFor(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-action">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteMemberTarget && (
  <div
    className="modal-backdrop"
    onClick={() => setDeleteMemberTarget(null)}
  >
    <div
      className="delete-confirm-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="delete-confirm-icon">
        🗑
      </div>

      <h3 className="delete-confirm-title">
        Delete Staff Member?
      </h3>

      <p className="delete-confirm-message">
        Are you sure you want to delete{" "}
        <strong>{deleteMemberTarget.member.fullName}</strong>?
      </p>

      <p className="delete-confirm-warning">
        This action cannot be undone.
      </p>

      <div className="delete-confirm-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setDeleteMemberTarget(null)}
        >
          Cancel
        </button>

        <button
          type="button"
          className="btn-danger"
          onClick={async () => {
            await deleteStaffMember(
              deleteMemberTarget.accountId,
              deleteMemberTarget.member.id
            );
            setDeleteMemberTarget(null);
          }}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}


{statusTarget && (
  <div
    className="modal-backdrop"
    onClick={() => setStatusTarget(null)}
  >
    <div
      className="delete-confirm-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="delete-confirm-icon">
        ⚠
      </div>

      <h3 className="delete-confirm-title">
        {statusTarget.isActive
          ? "Deactivate Staff Account?"
          : "Activate Staff Account?"}
      </h3>

      <p className="delete-confirm-message">
        Are you sure you want to{" "}
        <strong>
          {statusTarget.isActive ? "deactivate" : "activate"}{" "}
          {statusTarget.name}
        </strong>
        ?
      </p>

      {statusTarget.isActive && (
        <p className="delete-confirm-warning">
          Staff members will no longer be able to use this account.
        </p>
      )}

      <div className="delete-confirm-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setStatusTarget(null)}
        >
          Cancel
        </button>

        <button
          type="button"
          className={
            statusTarget.isActive ? "btn-danger" : "btn-primary"
          }
          onClick={async () => {
            await updateStaffStatus(statusTarget);
            setStatusTarget(null);
          }}
        >
          {statusTarget.isActive ? "Deactivate" : "Activate"}
        </button>
      </div>
    </div>
  </div>
)}

{memberStatusTarget && (
  <div
    className="modal-backdrop"
    onClick={() => setMemberStatusTarget(null)}
  >
    <div
      className="delete-confirm-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="delete-confirm-icon">
        ⚠
      </div>

      <h3 className="delete-confirm-title">
        {memberStatusTarget.member.isActive
          ? "Deactivate Staff Member?"
          : "Activate Staff Member?"}
      </h3>

      <p className="delete-confirm-message">
        Are you sure you want to{" "}
        <strong>
          {memberStatusTarget.member.isActive
            ? "deactivate"
            : "activate"}{" "}
          {memberStatusTarget.member.fullName}
        </strong>
        ?
      </p>

      {memberStatusTarget.member.isActive && (
        <p className="delete-confirm-warning">
          This staff member will no longer be active.
        </p>
      )}

      <div className="delete-confirm-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={() => setMemberStatusTarget(null)}
        >
          Cancel
        </button>

        <button
          type="button"
          className={
            memberStatusTarget.member.isActive
              ? "btn-danger"
              : "btn-primary"
          }
          onClick={async () => {
            await updateStaffMemberStatus(
              memberStatusTarget.accountId,
              memberStatusTarget.member
            );
            setMemberStatusTarget(null);
          }}
        >
          {memberStatusTarget.member.isActive
            ? "Deactivate"
            : "Activate"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}