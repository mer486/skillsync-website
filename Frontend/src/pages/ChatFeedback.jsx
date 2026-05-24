import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000/api/admin";

function ChatFeedback() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [complaintStatus, setComplaintStatus] = useState("reviewed");
  const [complaintAdminNote, setComplaintAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/complaints/open`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load complaints");
      }

      setComplaints(result.data || []);
    } catch (err) {
      setError(err.message || "Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [token]);

  const openStatusModal = (complaint, status = "reviewed") => {
    setSelectedComplaint(complaint);
    setComplaintStatus(status);
    setComplaintAdminNote("");
  };

  const closeStatusModal = () => {
    setSelectedComplaint(null);
    setComplaintStatus("reviewed");
    setComplaintAdminNote("");
  };

  const submitComplaintStatus = async () => {
    if (!selectedComplaint) return;

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_BASE}/complaints/${selectedComplaint._id}/status`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            complaintStatus,
            complaintAdminNote,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update complaint");
      }

      toast.success("Complaint status updated");
      closeStatusModal();
      fetchComplaints();
    } catch (err) {
      toast.error(err.message || "Failed to update complaint");
    } finally {
      setSubmitting(false);
    }
  };

  const openCount = complaints.length;

  return (
    <AdminLayout>
      <div style={{ marginBottom: "22px" }}>
        <h1 style={pageTitle}>Chat & Feedback</h1>
        <p style={pageSubtitle}>
          Review open complaints and session feedback. Mentor cancellation reviews are handled separately.
        </p>
      </div>

      <div style={summaryGrid}>
        <SummaryCard title="Open Complaints" value={openCount} />
        <SummaryCard
          title="Complaint Source"
          value="Sessions"
          subtitle="Session feedback reports"
        />
        <SummaryCard
          title="Admin Action"
          value="Review"
          subtitle="Reviewed / Resolved / Dismissed"
        />
      </div>

      <div style={cardStyle}>
        <h3 style={titleStyle}>Open Complaints</h3>

        {loading ? (
          <p style={mutedText}>Loading complaints...</p>
        ) : error ? (
          <p style={errorText}>{error}</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeadRow}>
                <th align="left">User</th>
                <th align="left">Mentor</th>
                <th align="left">Rating</th>
                <th align="left">Complaint</th>
                <th align="left">Status</th>
                <th align="left">Created At</th>
                <th align="left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {complaints.map((item) => (
                <tr key={item._id} style={tableRow}>
                  <td style={tableCell}>
                    {item.userId?.fullName || "Unnamed User"}
                    <div style={smallMuted}>{item.userId?.email || "-"}</div>
                  </td>

                  <td style={tableCellMuted}>
                    {item.mentorUserId?.fullName || "Unnamed Mentor"}
                    <div style={smallMuted}>{item.mentorUserId?.email || "-"}</div>
                  </td>

                  <td style={tableCellAccent}>{item.rating || 0} / 5</td>

                  <td style={tableCellMuted}>
                    {item.complaintText || item.comment || "No complaint text"}
                  </td>

                  <td style={tableCell}>
                    <span style={getStatusBadge(item.complaintStatus)}>
                      {item.complaintStatus || "open"}
                    </span>
                  </td>

                  <td style={tableCellMuted}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                  </td>

                  <td style={tableCell}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        style={reviewBtn}
                        onClick={() => openStatusModal(item, "reviewed")}
                      >
                        Review
                      </button>
                      <button
                        style={resolveBtn}
                        onClick={() => openStatusModal(item, "resolved")}
                      >
                        Resolve
                      </button>
                      <button
                        style={dismissBtn}
                        onClick={() => openStatusModal(item, "dismissed")}
                      >
                        Dismiss
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {complaints.length === 0 && (
                <tr style={tableRow}>
                  <td colSpan="7" style={tableCellMuted}>
                    No open complaints.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedComplaint && (
        <div onClick={closeStatusModal} style={overlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
            <h2 style={modalTitle}>Update Complaint Status</h2>

            <p style={pageSubtitle}>
              Set this complaint to: <strong>{complaintStatus}</strong>
            </p>

            <label style={labelStyle}>Admin Note</label>
            <textarea
              value={complaintAdminNote}
              onChange={(e) => setComplaintAdminNote(e.target.value)}
              placeholder="Write an internal admin note..."
              style={textareaStyle}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={closeStatusModal} style={cancelBtn}>
                Cancel
              </button>
              <button
                onClick={submitComplaintStatus}
                disabled={submitting}
                style={saveBtn}
              >
                {submitting ? "Saving..." : "Save Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function SummaryCard({ title, value, subtitle }) {
  return (
    <div style={summaryCard}>
      <span style={summaryTitle}>{title}</span>
      <strong style={summaryValue}>{value}</strong>
      {subtitle && <span style={summarySubtitle}>{subtitle}</span>}
    </div>
  );
}

function getStatusBadge(status) {
  const normalized = String(status || "open").toLowerCase();

  const base = {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "capitalize",
  };

  if (normalized === "resolved") {
    return {
      ...base,
      background: "rgba(34,197,94,0.12)",
      color: "#86efac",
      border: "1px solid rgba(34,197,94,0.25)",
    };
  }

  if (normalized === "dismissed") {
    return {
      ...base,
      background: "rgba(255,255,255,0.06)",
      color: "rgba(255,255,255,0.65)",
      border: "1px solid rgba(255,255,255,0.1)",
    };
  }

  if (normalized === "reviewed") {
    return {
      ...base,
      background: "rgba(125,179,209,0.16)",
      color: "#B0D6EA",
      border: "1px solid rgba(125,179,209,0.25)",
    };
  }

  return {
    ...base,
    background: "rgba(245,161,0,0.12)",
    color: "#F5A100",
    border: "1px solid rgba(245,161,0,0.25)",
  };
}

const pageTitle = {
  color: "#F9FAFB",
  fontSize: "32px",
  fontWeight: "800",
  margin: 0,
};

const pageSubtitle = {
  color: "rgba(249,250,251,0.6)",
  marginTop: "8px",
  fontSize: "15px",
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "14px",
  marginBottom: "18px",
};

const summaryCard = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: "18px",
  padding: "18px",
  display: "grid",
  gap: "8px",
};

const summaryTitle = {
  color: "rgba(249,250,251,0.65)",
  fontSize: "14px",
};

const summaryValue = {
  color: "#F5A100",
  fontSize: "24px",
};

const summarySubtitle = {
  color: "rgba(249,250,251,0.45)",
  fontSize: "12px",
};

const cardStyle = {
  background:
    "linear-gradient(180deg, rgba(20,53,70,0.95) 0%, rgba(16,38,50,0.98) 100%)",
  borderRadius: "24px",
  padding: "22px",
  border: "1px solid rgba(255,255,255,0.05)",
  boxShadow: "0 12px 26px rgba(0,0,0,0.15)",
  overflowX: "auto",
};

const titleStyle = {
  color: "#F9FAFB",
  fontSize: "22px",
  fontWeight: "800",
  margin: "0 0 18px",
};

const mutedText = { color: "rgba(255,255,255,0.7)" };
const errorText = { color: "#ff7d7d" };

const tableStyle = {
  width: "100%",
  minWidth: "950px",
  borderCollapse: "collapse",
};

const tableHeadRow = {
  color: "rgba(255,255,255,0.55)",
  fontSize: "12px",
};

const tableRow = {
  borderTop: "1px solid rgba(255,255,255,0.06)",
};

const tableCell = {
  padding: "14px 8px",
  color: "#F9FAFB",
  fontSize: "14px",
  fontWeight: "600",
  verticalAlign: "top",
};

const tableCellMuted = {
  ...tableCell,
  color: "rgba(255,255,255,0.68)",
  fontWeight: "500",
};

const tableCellAccent = {
  ...tableCell,
  color: "#F5A100",
};

const smallMuted = {
  marginTop: "4px",
  color: "rgba(255,255,255,0.42)",
  fontSize: "12px",
};

const reviewBtn = {
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(125,179,209,0.25)",
  background: "rgba(125,179,209,0.12)",
  color: "#B0D6EA",
  cursor: "pointer",
  fontWeight: "700",
};

const resolveBtn = {
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(34,197,94,0.25)",
  background: "rgba(34,197,94,0.12)",
  color: "#86efac",
  cursor: "pointer",
  fontWeight: "700",
};

const dismissBtn = {
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  color: "rgba(255,255,255,0.72)",
  cursor: "pointer",
  fontWeight: "700",
};

const overlayStyle = {
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
};

const modalStyle = {
  width: "100%",
  maxWidth: "560px",
  borderRadius: "24px",
  background:
    "linear-gradient(180deg, rgba(20,53,70,0.97) 0%, rgba(16,38,50,0.99) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
  padding: "24px",
};

const modalTitle = {
  margin: 0,
  color: "#F9FAFB",
  fontSize: "22px",
  fontWeight: "800",
};

const labelStyle = {
  display: "block",
  color: "rgba(255,255,255,0.62)",
  marginBottom: "8px",
  fontSize: "13px",
  fontWeight: "700",
};

const textareaStyle = {
  width: "100%",
  minHeight: "110px",
  resize: "vertical",
  boxSizing: "border-box",
  padding: "12px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  color: "#F9FAFB",
  outline: "none",
  marginBottom: "16px",
};

const cancelBtn = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  color: "#F9FAFB",
  cursor: "pointer",
};

const saveBtn = {
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(245,161,0,0.25)",
  background: "rgba(245,161,0,0.12)",
  color: "#F5A100",
  cursor: "pointer",
  fontWeight: "800",
};

export default ChatFeedback;