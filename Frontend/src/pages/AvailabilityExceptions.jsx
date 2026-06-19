import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

const API_BASE = "https://skillsync2-production.up.railway.app/api/admin";

function AvailabilityExceptions() {
  const [items, setItems] = useState([]);
  const [isActive, setIsActive] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchExceptions = async () => {
    try {
      setLoading(true);
      setError("");

      const query = isActive !== "" ? `?isActive=${isActive}` : "";

      const response = await fetch(`${API_BASE}/mentor-availability-exceptions${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load availability exceptions");
      }

      setItems(result.data?.items || []);
    } catch (err) {
      setError(err.message || "Failed to load availability exceptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
  }, [isActive]);

  return (
    <AdminLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={pageTitle}>Availability Exceptions</h1>
        <p style={pageSubtitle}>
          Track mentor temporary unavailable periods, vacations, and removed exceptions.
        </p>
      </div>

      <div style={filterBar}>
        <label style={labelStyle}>Status</label>
        <select value={isActive} onChange={(e) => setIsActive(e.target.value)} style={selectStyle}>
          <option value="">All</option>
          <option value="true">Active</option>
          <option value="false">Removed / Inactive</option>
        </select>
      </div>

      <div style={sectionStyle}>
        {loading ? (
          <p style={mutedText}>Loading availability exceptions...</p>
        ) : error ? (
          <p style={errorText}>{error}</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeadRow}>
                <th align="left">Mentor</th>
                <th align="left">Unavailable From</th>
                <th align="left">Unavailable To</th>
                <th align="left">Reason</th>
                <th align="left">Status</th>
                <th align="left">Created At</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={item._id} style={tableRow}>
                  <td style={tableCell}>
                    {item.mentorUserId?.fullName || "Unnamed Mentor"}
                    <div style={smallMuted}>{item.mentorUserId?.email || "-"}</div>
                  </td>

                  <td style={tableCellMuted}>
                    {item.unavailableFrom
                      ? new Date(item.unavailableFrom).toLocaleString()
                      : "-"}
                  </td>

                  <td style={tableCellMuted}>
                    {item.unavailableTo
                      ? new Date(item.unavailableTo).toLocaleString()
                      : "-"}
                  </td>

                  <td style={tableCellMuted}>{item.reason || "-"}</td>

                  <td style={tableCell}>
                    <span style={item.isActive ? activeBadge : inactiveBadge}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td style={tableCellMuted}>
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr style={tableRow}>
                  <td colSpan="6" style={tableCellMuted}>
                    No availability exceptions found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
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

const tableStyle = { width: "100%", borderCollapse: "collapse", minWidth: "860px" };
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

const activeBadge = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "800",
  background: "rgba(34,197,94,0.12)",
  color: "#86efac",
  border: "1px solid rgba(34,197,94,0.25)",
};

const inactiveBadge = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "800",
  background: "rgba(255,255,255,0.06)",
  color: "rgba(255,255,255,0.62)",
  border: "1px solid rgba(255,255,255,0.1)",
};

export default AvailabilityExceptions;