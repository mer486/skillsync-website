import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

const API_BASE = "http://localhost:5000/api/admin";

const ACTIONS = [
  "",
  "status_changed",
  "break_started",
  "break_ended",
  "session_cancelled_by_mentor",
  "cancellation_reviewed_valid",
  "cancellation_reviewed_rejected",
  "penalty_applied",
  "mentor_blocked",
  "schedule_change_requested",
  "schedule_change_approved",
  "schedule_change_rejected",
  "schedule_change_applied",
  "availability_exception_created",
  "availability_exception_removed",
  "mentor_online",
  "mentor_offline",
];

function MentorActivityLogs() {
  const [items, setItems] = useState([]);
  const [action, setAction] = useState("");
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const query = action ? `?action=${action}` : "";

      const response = await fetch(`${API_BASE}/mentor-activity-logs${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load mentor activity logs");
      }

      setItems(result.data?.items || []);
    } catch (err) {
      setError(err.message || "Failed to load mentor activity logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [action]);

  return (
    <AdminLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={pageTitle}>Mentor Activity Logs</h1>
        <p style={pageSubtitle}>
          Track mentor actions, admin decisions, schedule changes, breaks, and penalties.
        </p>
      </div>

      <div style={filterBar}>
        <label style={labelStyle}>Action</label>
        <select value={action} onChange={(e) => setAction(e.target.value)} style={selectStyle}>
          {ACTIONS.map((item) => (
            <option key={item || "all"} value={item}>
              {item || "All actions"}
            </option>
          ))}
        </select>
      </div>

      <div style={sectionStyle}>
        {loading ? (
          <p style={mutedText}>Loading activity logs...</p>
        ) : error ? (
          <p style={errorText}>{error}</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeadRow}>
                <th align="left">Mentor</th>
                <th align="left">Action</th>
                <th align="left">Message</th>
                <th align="left">Performed By</th>
                <th align="left">Role</th>
                <th align="left">Date</th>
                <th align="left">Details</th>
              </tr>
            </thead>

            <tbody>
              {items.map((log) => (
                <tr key={log._id} style={tableRow}>
                  <td style={tableCell}>
                    {log.mentorUserId?.fullName || "Unnamed Mentor"}
                    <div style={smallMuted}>{log.mentorUserId?.email || "-"}</div>
                  </td>

                  <td style={tableCell}>
                    <span style={actionBadge}>{log.action}</span>
                  </td>

                  <td style={tableCellMuted}>{log.message || "-"}</td>

                  <td style={tableCellMuted}>
                    {log.performedByUserId?.fullName ||
                      log.performedByUserId?.email ||
                      "System"}
                  </td>

                  <td style={tableCellMuted}>{log.performedByRole || "system"}</td>

                  <td style={tableCellMuted}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString() : "-"}
                  </td>

                  <td style={tableCell}>
                    <button style={detailsBtn} onClick={() => setSelectedLog(log)}>
                      View Details
                    </button>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr style={tableRow}>
                  <td colSpan="7" style={tableCellMuted}>
                    No mentor activity logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {selectedLog && (
        <div style={overlayStyle} onClick={() => setSelectedLog(null)}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitle}>Log Details</h2>

            <p style={pageSubtitle}>{selectedLog.action}</p>

            <pre style={jsonBox}>
              {JSON.stringify(selectedLog.metadata || {}, null, 2)}
            </pre>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button style={cancelBtn} onClick={() => setSelectedLog(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
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

const tableStyle = { width: "100%", borderCollapse: "collapse", minWidth: "1000px" };
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

const actionBadge = {
  display: "inline-block",
  padding: "6px 10px",
  borderRadius: "999px",
  background: "rgba(245,161,0,0.12)",
  color: "#F5A100",
  border: "1px solid rgba(245,161,0,0.25)",
  fontSize: "12px",
  fontWeight: "800",
};

const detailsBtn = {
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
  maxWidth: "680px",
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

const jsonBox = {
  background: "rgba(0,0,0,0.22)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  padding: "14px",
  color: "rgba(255,255,255,0.78)",
  maxHeight: "420px",
  overflow: "auto",
  margin: "16px 0",
};

const cancelBtn = {
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.03)",
  color: "#F9FAFB",
  cursor: "pointer",
};

export default MentorActivityLogs;