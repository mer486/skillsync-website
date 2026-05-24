import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import toast from "react-hot-toast";

const API_BASE = "http://localhost:5000/api/admin";

function formatSchedule(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "No schedule";

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  return items
    .map((item) => {
      const day = dayNames[item.dayOfWeek] || `Day ${item.dayOfWeek}`;
      return `${day}: ${item.startTime} - ${item.endTime}`;
    })
    .join("\n");
}

function ScheduleRequests() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);
  const [actionType, setActionType] = useState("approve");
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const query = status ? `?status=${status}` : "";

      const response = await fetch(`${API_BASE}/schedule-change-requests${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load schedule requests");
      }

      setItems(result.data?.items || []);
    } catch (err) {
      setError(err.message || "Failed to load schedule requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [status]);

  const openModal = (request, type) => {
    setModal(request);
    setActionType(type);
    setAdminNote("");
  };

  const closeModal = () => {
    setModal(null);
    setActionType("approve");
    setAdminNote("");
  };

  const submitDecision = async () => {
    if (!modal) return;

    try {
      setSubmitting(true);

      const endpoint =
        actionType === "approve"
          ? `${API_BASE}/schedule-change-requests/${modal._id}/approve`
          : `${API_BASE}/schedule-change-requests/${modal._id}/reject`;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ adminNote }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit decision");
      }

      toast.success(
  actionType === "approve"
    ? "Schedule request approved"
    : "Schedule request rejected"
);
      
      closeModal();
      fetchRequests();
    } catch (err) {
      toast.error(err.message || "Failed to submit decision");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={pageTitle}>Schedule Change Requests</h1>
        <p style={pageSubtitle}>
          Review mentor weekly schedule changes and approve or reject requests.
        </p>
      </div>

      <div style={filterBar}>
        <label style={labelStyle}>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={selectStyle}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="applied">Applied</option>
        </select>
      </div>

      <div style={sectionStyle}>
        {loading ? (
          <p style={mutedText}>Loading schedule requests...</p>
        ) : error ? (
          <p style={errorText}>{error}</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeadRow}>
                <th align="left">Mentor</th>
                <th align="left">Current Schedule</th>
                <th align="left">Requested Schedule</th>
                <th align="left">Reason</th>
                <th align="left">Effective From</th>
                <th align="left">Status</th>
                <th align="left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((request) => (
                <tr key={request._id} style={tableRow}>
                  <td style={tableCell}>
                    {request.mentorUserId?.fullName || "Unnamed Mentor"}
                    <div style={smallMuted}>{request.mentorUserId?.email || "-"}</div>
                  </td>

                  <td style={tableCellMuted}>
                    <pre style={preStyle}>{formatSchedule(request.currentAvailability)}</pre>
                  </td>

                  <td style={tableCellMuted}>
                    <pre style={preStyle}>{formatSchedule(request.requestedAvailability)}</pre>
                  </td>

                  <td style={tableCellMuted}>{request.reason || "-"}</td>

                  <td style={tableCellMuted}>
                    {request.effectiveFrom
                      ? new Date(request.effectiveFrom).toLocaleDateString()
                      : "-"}
                  </td>

                  <td style={tableCell}>
                    <span style={getStatusBadge(request.status)}>{request.status}</span>
                  </td>

                  <td style={tableCell}>
                    {request.status === "pending" ? (
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button style={approveBtn} onClick={() => openModal(request, "approve")}>
                          Approve
                        </button>
                        <button style={rejectBtn} onClick={() => openModal(request, "reject")}>
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={smallMuted}>Reviewed</span>
                    )}
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr style={tableRow}>
                  <td colSpan="7" style={tableCellMuted}>
                    No schedule change requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div style={overlayStyle} onClick={closeModal}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitle}>
              {actionType === "approve" ? "Approve Schedule Request" : "Reject Schedule Request"}
            </h2>

            <p style={pageSubtitle}>
              Mentor: {modal.mentorUserId?.fullName || "Unnamed Mentor"}
            </p>

            <label style={labelStyle}>Admin Note</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Write your review note..."
              style={textareaStyle}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={closeModal} style={cancelBtn}>
                Cancel
              </button>
              <button
                onClick={submitDecision}
                disabled={submitting}
                style={actionType === "approve" ? approveBtn : rejectBtn}
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function getStatusBadge(status) {
  const base = {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: "999px",
    fontSize: "12px",
    fontWeight: "800",
    textTransform: "capitalize",
  };

  if (status === "approved" || status === "applied") {
    return {
      ...base,
      background: "rgba(34,197,94,0.12)",
      color: "#86efac",
      border: "1px solid rgba(34,197,94,0.25)",
    };
  }

  if (status === "rejected") {
    return {
      ...base,
      background: "rgba(239,68,68,0.12)",
      color: "#fca5a5",
      border: "1px solid rgba(239,68,68,0.25)",
    };
  }

  return {
    ...base,
    background: "rgba(245,161,0,0.12)",
    color: "#F5A100",
    border: "1px solid rgba(245,161,0,0.25)",
  };
}

const pageTitle = { fontSize: "28px", margin: 0, color: "#F9FAFB", fontWeight: "800" };
const pageSubtitle = { color: "rgba(255,255,255,0.6)", fontSize: "14px", marginTop: "8px" };
const mutedText = { color: "rgba(255,255,255,0.7)" };
const errorText = { color: "#ff7d7d" };

const filterBar = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "18px",
  padding: "16px",
  marginBottom: "18px",
};

const labelStyle = {
  color: "rgba(255,255,255,0.62)",
  fontSize: "13px",
  fontWeight: "700",
};

const selectStyle = {
  padding: "10px 12px",
  borderRadius: "12px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "#102632",
  color: "#F9FAFB",
  outline: "none",
};

const sectionStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "22px",
  padding: "22px",
  overflowX: "auto",
};

const tableStyle = { width: "100%", borderCollapse: "collapse", minWidth: "980px" };
const tableHeadRow = { color: "rgba(255,255,255,0.55)", fontSize: "12px" };
const tableRow = { borderTop: "1px solid rgba(255,255,255,0.06)" };

const tableCell = {
  padding: "14px 8px",
  color: "#F9FAFB",
  fontSize: "14px",
  fontWeight: "600",
  verticalAlign: "top",
};

const tableCellMuted = {
  padding: "14px 8px",
  color: "rgba(255,255,255,0.68)",
  fontSize: "14px",
  verticalAlign: "top",
};

const smallMuted = {
  marginTop: "4px",
  color: "rgba(255,255,255,0.42)",
  fontSize: "12px",
};

const preStyle = {
  margin: 0,
  whiteSpace: "pre-wrap",
  fontFamily: "inherit",
  color: "rgba(255,255,255,0.68)",
};

const approveBtn = {
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(34,197,94,0.25)",
  background: "rgba(34,197,94,0.12)",
  color: "#86efac",
  cursor: "pointer",
  fontWeight: "700",
};

const rejectBtn = {
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(239,68,68,0.25)",
  background: "rgba(239,68,68,0.12)",
  color: "#fca5a5",
  cursor: "pointer",
  fontWeight: "700",
};

const cancelBtn = {
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  color: "#F9FAFB",
  cursor: "pointer",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(5,12,18,0.65)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
  padding: "24px",
};

const modalStyle = {
  width: "100%",
  maxWidth: "560px",
  background: "linear-gradient(180deg, rgba(20,53,70,0.98), rgba(16,38,50,0.99))",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "22px",
  padding: "24px",
};

const modalTitle = {
  margin: 0,
  color: "#F9FAFB",
  fontSize: "22px",
  fontWeight: "800",
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
  margin: "8px 0 16px",
};

export default ScheduleRequests;