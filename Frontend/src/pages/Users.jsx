import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

function Users() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalType, setModalType] = useState(null); // "block" | "unblock" | "delete" | "details" | null
  const [selectedUser, setSelectedUser] = useState(null);

  const [blockForm, setBlockForm] = useState({
    blockReason: "",
    blockNote: "",
  });
  const [blockError, setBlockError] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load users");
      }

      setUsers(data);
    } catch (err) {
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return users;

    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
    );
  }, [users, searchTerm]);

  const openBlockModal = (user) => {
    setSelectedUser(user);
    setBlockForm({
      blockReason: user.blockReason || "",
      blockNote: user.blockNote || "",
    });
    setBlockError("");
    setModalType("block");
  };

  const openUnblockModal = (user) => {
    setSelectedUser(user);
    setModalType("unblock");
  };

  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setModalType("delete");
  };

  const openDetailsModal = (user) => {
    setSelectedUser(user);
    setModalType("details");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
    setBlockForm({
      blockReason: "",
      blockNote: "",
    });
    setBlockError("");
  };

  const handleBlockUser = async () => {
    if (!selectedUser) return;

    setBlockError("");

    if (!blockForm.blockReason) {
      setBlockError("Please select a block reason.");
      return;
    }

    try {
      const admin = JSON.parse(localStorage.getItem("admin") || "{}");

      const response = await fetch(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            name: selectedUser.name,
            email: selectedUser.email,
            role: selectedUser.role,
            status: "Blocked",
            blockReason: blockForm.blockReason,
            blockNote: blockForm.blockNote,
            blockedAt: new Date().toISOString(),
            blockedBy: admin.email || "Admin",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to block user");
      }

      setUsers((prev) =>
        prev.map((item) => (item._id === selectedUser._id ? data : item))
      );

      closeModal();
    } catch (err) {
      alert(err.message || "Failed to block user");
    }
  };

  const handleUnblockUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            name: selectedUser.name,
            email: selectedUser.email,
            role: selectedUser.role,
            status: "Active",
            blockReason: "",
            blockNote: "",
            blockedAt: null,
            blockedBy: "",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to unblock user");
      }

      setUsers((prev) =>
        prev.map((item) => (item._id === selectedUser._id ? data : item))
      );

      closeModal();
    } catch (err) {
      alert(err.message || "Failed to unblock user");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((item) => item._id !== selectedUser._id));
      closeModal();
    } catch (err) {
      alert(err.message || "Failed to delete user");
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Not available";
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return "Not available";
    return date.toLocaleString();
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: "22px" }}>
        <h1
          style={{
            color: "#F9FAFB",
            fontSize: "32px",
            fontWeight: "800",
            margin: 0,
          }}
        >
          User Management
        </h1>
        <p
          style={{
            color: "rgba(249,250,251,0.6)",
            marginTop: "8px",
            fontSize: "15px",
          }}
        >
          View and manage all registered students and graduates.
        </p>
      </div>

      <div
        style={{
          background:
            "linear-gradient(180deg, rgba(20,53,70,0.95) 0%, rgba(16,38,50,0.98) 100%)",
          borderRadius: "28px",
          padding: "24px",
          border: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 12px 26px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ display: "flex", gap: "14px", marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: 1,
              padding: "14px 16px",
              borderRadius: "14px",
              border: "1px solid rgba(255,255,255,0.07)",
              background: "rgba(255,255,255,0.03)",
              color: "#F9FAFB",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            style={{
              padding: "14px 22px",
              borderRadius: "14px",
              border: "none",
              background: "linear-gradient(180deg, #F5A100 0%, #D68C00 100%)",
              color: "#102632",
              fontWeight: "800",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </div>

        {loading ? (
          <p style={{ color: "#F9FAFB", opacity: 0.8 }}>Loading users...</p>
        ) : error ? (
          <p style={{ color: "#ff7d7d" }}>{error}</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left" }}>
                {["Name", "Email", "Role", "Status", "Actions"].map((item) => (
                  <th
                    key={item}
                    style={{
                      color: "rgba(249,250,251,0.52)",
                      fontSize: "13px",
                      fontWeight: "600",
                      paddingBottom: "14px",
                    }}
                  >
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td style={cellStyle}>{user.name}</td>
                  <td style={cellStyle}>{user.email}</td>
                  <td style={cellStyle}>{user.role}</td>
                  <td style={cellStyle}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "6px 14px",
                        borderRadius: "999px",
                        background:
                          user.status === "Active"
                            ? "rgba(245,161,0,0.16)"
                            : "rgba(255,255,255,0.08)",
                        color: "#F9FAFB",
                        fontSize: "13px",
                        fontWeight: "700",
                      }}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td style={cellStyle}>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {user.status === "Blocked" && (
                        <button
                          onClick={() => openDetailsModal(user)}
                          style={smallBtn}
                        >
                          View Details
                        </button>
                      )}

                      <button
                        onClick={() =>
                          user.status === "Blocked"
                            ? openUnblockModal(user)
                            : openBlockModal(user)
                        }
                        style={smallBtn}
                      >
                        {user.status === "Blocked" ? "Unblock" : "Block"}
                      </button>

                      <button
                        onClick={() => openDeleteModal(user)}
                        style={smallBtn}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    style={{
                      color: "rgba(249,250,251,0.6)",
                      fontSize: "15px",
                      padding: "18px 0",
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalType && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(5, 12, 18, 0.58)",
            backdropFilter: "blur(5px)",
            WebkitBackdropFilter: "blur(5px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: "24px",
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth:
                modalType === "block"
                  ? "580px"
                  : modalType === "details"
                  ? "560px"
                  : "460px",
              borderRadius: "24px",
              overflow: "hidden",
              background:
                "linear-gradient(180deg, rgba(20,53,70,0.97) 0%, rgba(16,38,50,0.99) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
              animation: "modalSlide 0.25s ease",
            }}
          >
            {modalType === "block" && (
              <>
                <div
                  style={{ padding: "28px 28px 18px 28px", position: "relative" }}
                >
                  <button onClick={closeModal} style={closeBtn}>
                    ×
                  </button>

                  <h2
                    style={{
                      margin: "4px 0 12px 0",
                      color: "#F9FAFB",
                      fontSize: "24px",
                      fontWeight: "800",
                    }}
                  >
                    Block User
                  </h2>

                  <p
                    style={{
                      margin: "0 0 24px 0",
                      color: "rgba(249,250,251,0.72)",
                      fontSize: "15px",
                      lineHeight: 1.6,
                    }}
                  >
                    Add an internal reason for blocking{" "}
                    <span style={{ color: "#F9FAFB", fontWeight: "700" }}>
                      {selectedUser?.name}
                    </span>
                    .
                  </p>

                  <div style={{ marginBottom: "20px" }}>
                    <label style={labelStyle}>Block Reason</label>
                    <select
                      value={blockForm.blockReason}
                      onChange={(e) =>
                        setBlockForm((prev) => ({
                          ...prev,
                          blockReason: e.target.value,
                        }))
                      }
                      style={{
                        ...inputStyle,
                        appearance: "none",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.02) 100%)",
                        backgroundImage:
                          "linear-gradient(45deg, transparent 50%, rgba(249,250,251,0.6) 50%), linear-gradient(135deg, rgba(249,250,251,0.6) 50%, transparent 50%)",
                        backgroundPosition:
                          "calc(100% - 22px) calc(50% - 3px), calc(100% - 16px) calc(50% - 3px)",
                        backgroundSize: "6px 6px, 6px 6px",
                        backgroundRepeat: "no-repeat",
                        paddingRight: "42px",
                        border: blockError
                          ? "1px solid rgba(252,165,165,0.9)"
                          : "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <option
                        value=""
                        style={{ background: "#183847", color: "#F9FAFB" }}
                      >
                        Select a reason
                      </option>
                      <option
                        value="Policy violation"
                        style={{ background: "#183847", color: "#F9FAFB" }}
                      >
                        Policy violation
                      </option>
                      <option
                        value="Inappropriate behavior"
                        style={{ background: "#183847", color: "#F9FAFB" }}
                      >
                        Inappropriate behavior
                      </option>
                      <option
                        value="Spam or fake activity"
                        style={{ background: "#183847", color: "#F9FAFB" }}
                      >
                        Spam or fake activity
                      </option>
                      <option
                        value="Suspicious account"
                        style={{ background: "#183847", color: "#F9FAFB" }}
                      >
                        Suspicious account
                      </option>
                      <option
                        value="Requested by admin"
                        style={{ background: "#183847", color: "#F9FAFB" }}
                      >
                        Requested by admin
                      </option>
                      <option
                        value="Other"
                        style={{ background: "#183847", color: "#F9FAFB" }}
                      >
                        Other
                      </option>
                    </select>

                    {blockError && (
                      <p
                        style={{
                          marginTop: "10px",
                          marginBottom: "0",
                          color: "#FCA5A5",
                          fontSize: "13px",
                          fontWeight: "500",
                        }}
                      >
                        {blockError}
                      </p>
                    )}
                  </div>

                  <div style={{ marginBottom: "8px" }}>
                    <label style={labelStyle}>Internal Note</label>
                    <textarea
                      value={blockForm.blockNote}
                      onChange={(e) =>
                        setBlockForm((prev) => ({
                          ...prev,
                          blockNote: e.target.value,
                        }))
                      }
                      placeholder="Add internal notes for documentation..."
                      rows="4"
                      style={{
                        ...inputStyle,
                        resize: "none",
                        minHeight: "120px",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    padding: "18px 28px 22px 28px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <button
                    onClick={handleBlockUser}
                    style={{
                      padding: "12px 28px",
                      borderRadius: "14px",
                      border: "none",
                      background:
                        "linear-gradient(180deg, #F5A100 0%, #D68C00 100%)",
                      color: "#102632",
                      fontSize: "15px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    Confirm Block
                  </button>

                  <button onClick={closeModal} style={cancelBtn}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {modalType === "details" && (
              <>
                <div style={{ padding: "28px", position: "relative" }}>
                  <button onClick={closeModal} style={closeBtn}>
                    ×
                  </button>

                  <h2
                    style={{
                      margin: "4px 0 18px 0",
                      color: "#F9FAFB",
                      fontSize: "24px",
                      fontWeight: "800",
                    }}
                  >
                    Block Details
                  </h2>

                  <div style={{ display: "grid", gap: "18px" }}>
                    <div>
                      <p style={detailsLabel}>User</p>
                      <p style={detailsValue}>{selectedUser?.name || "Not available"}</p>
                    </div>

                    <div>
                      <p style={detailsLabel}>Email</p>
                      <p style={detailsValue}>{selectedUser?.email || "Not available"}</p>
                    </div>

                    <div>
                      <p style={detailsLabel}>Block Reason</p>
                      <p style={detailsValue}>
                        {selectedUser?.blockReason || "Not provided"}
                      </p>
                    </div>

                    <div>
                      <p style={detailsLabel}>Internal Note</p>
                      <p style={detailsValue}>
                        {selectedUser?.blockNote || "No internal note added."}
                      </p>
                    </div>

                    <div>
                      <p style={detailsLabel}>Blocked By</p>
                      <p style={detailsValue}>
                        {selectedUser?.blockedBy || "Not available"}
                      </p>
                    </div>

                    <div>
                      <p style={detailsLabel}>Blocked At</p>
                      <p style={detailsValue}>
                        {formatDate(selectedUser?.blockedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    padding: "18px 28px 22px 28px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <button onClick={closeModal} style={cancelBtn}>
                    Close
                  </button>
                </div>
              </>
            )}

            {modalType === "unblock" && (
              <>
                <div style={{ padding: "28px", position: "relative" }}>
                  <button onClick={closeModal} style={closeBtn}>
                    ×
                  </button>

                  <h2
                    style={{
                      margin: "4px 0 14px 0",
                      color: "#F9FAFB",
                      fontSize: "24px",
                      fontWeight: "800",
                    }}
                  >
                    Unblock User
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: "rgba(249,250,251,0.72)",
                      fontSize: "15px",
                      lineHeight: 1.7,
                    }}
                  >
                    Are you sure you want to unblock{" "}
                    <span style={{ color: "#F9FAFB", fontWeight: "700" }}>
                      {selectedUser?.name}
                    </span>
                    ?
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    padding: "18px 28px 22px 28px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <button
                    onClick={handleUnblockUser}
                    style={{
                      padding: "12px 28px",
                      borderRadius: "14px",
                      border: "none",
                      background:
                        "linear-gradient(180deg, #F5A100 0%, #D68C00 100%)",
                      color: "#102632",
                      fontSize: "15px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    Confirm Unblock
                  </button>

                  <button onClick={closeModal} style={cancelBtn}>
                    Cancel
                  </button>
                </div>
              </>
            )}

            {modalType === "delete" && (
              <>
                <div style={{ padding: "28px", position: "relative" }}>
                  <button onClick={closeModal} style={closeBtn}>
                    ×
                  </button>

                  <h2
                    style={{
                      margin: "4px 0 14px 0",
                      color: "#F9FAFB",
                      fontSize: "24px",
                      fontWeight: "800",
                    }}
                  >
                    Delete User
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: "rgba(249,250,251,0.72)",
                      fontSize: "15px",
                      lineHeight: 1.7,
                    }}
                  >
                    Are you sure you want to delete{" "}
                    <span style={{ color: "#F9FAFB", fontWeight: "700" }}>
                      {selectedUser?.name}
                    </span>
                    ? This action cannot be undone.
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: "12px",
                    padding: "18px 28px 22px 28px",
                    borderTop: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <button
                    onClick={handleDeleteUser}
                    style={{
                      padding: "12px 28px",
                      borderRadius: "14px",
                      border: "none",
                      background:
                        "linear-gradient(180deg, #ff7d7d 0%, #e35d5d 100%)",
                      color: "#fff",
                      fontSize: "15px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>

                  <button onClick={closeModal} style={cancelBtn}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>

          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }

              @keyframes modalSlide {
                from {
                  opacity: 0;
                  transform: translateY(14px) scale(0.98);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
            `}
          </style>
        </div>
      )}
    </AdminLayout>
  );
}

const cellStyle = {
  color: "#F9FAFB",
  fontSize: "15px",
  padding: "16px 0",
  borderTop: "1px solid rgba(255,255,255,0.05)",
};

const smallBtn = {
  padding: "8px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#F9FAFB",
  cursor: "pointer",
  fontWeight: "600",
};

const closeBtn = {
  position: "absolute",
  top: "18px",
  right: "18px",
  background: "transparent",
  border: "none",
  color: "rgba(255,255,255,0.55)",
  fontSize: "34px",
  lineHeight: 1,
  cursor: "pointer",
};

const labelStyle = {
  display: "block",
  color: "#F9FAFB",
  fontSize: "14px",
  marginBottom: "10px",
};

const inputStyle = {
  width: "100%",
  padding: "16px 18px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  color: "#F9FAFB",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
};

const cancelBtn = {
  padding: "12px 24px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.02)",
  color: "#F9FAFB",
  fontSize: "15px",
  cursor: "pointer",
};

const detailsLabel = {
  margin: "0 0 8px 0",
  color: "rgba(249,250,251,0.58)",
  fontSize: "13px",
  fontWeight: "600",
  letterSpacing: "0.2px",
};

const detailsValue = {
  margin: 0,
  color: "#F9FAFB",
  fontSize: "15px",
  lineHeight: 1.7,
  whiteSpace: "pre-wrap",
};

export default Users;