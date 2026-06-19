import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import toast from "react-hot-toast";

const API_BASE = "https://skillsync2-production.up.railway.app/api/admin";

function MentorCancellations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reviewModal, setReviewModal] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("valid");
  const [adminNote, setAdminNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("token");

  const fetchPendingCancellations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/mentor-cancellations/pending`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load pending cancellations");
      }

      setItems(result.data || []);
    } catch (err) {
      setError(err.message || "Failed to load pending cancellations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCancellations();
  }, []);

  const openReview = (session, status) => {
    setReviewModal(session);
    setReviewStatus(status);
    setAdminNote("");
  };

  const closeReview = () => {
    setReviewModal(null);
    setAdminNote("");
    setReviewStatus("valid");
  };

  const submitReview = async () => {
    if (!reviewModal) return;

    try {
      setSubmitting(true);

      const response = await fetch(
        `${API_BASE}/mentor-cancellations/${reviewModal._id}/review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            reviewStatus,
            adminNote,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit review");
      }

      toast.success("Cancellation review submitted");
      closeReview();
      fetchPendingCancellations();
    } catch (err) {
      toast.error(err.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={pageTitle}>Mentor Cancellation Reviews</h1>
        <p style={pageSubtitle}>
          Review mentor cancellation reasons and decide whether they are valid or rejected.
        </p>
      </div>

      <div style={sectionStyle}>
        {loading ? (
          <p style={mutedText}>Loading pending cancellations...</p>
        ) : error ? (
          <p style={errorText}>{error}</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeadRow}>
                <th align="left">Mentor</th>
                <th align="left">User</th>
                <th align="left">Session</th>
                <th align="left">Reason</th>
                <th align="left">Cancelled At</th>
                <th align="left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((session) => (
                <tr key={session._id} style={tableRow}>
                  <td style={tableCell}>
                    {session.mentorUserId?.fullName || "Unnamed Mentor"}
                    <div style={smallMuted}>{session.mentorUserId?.email || "-"}</div>
                  </td>

                  <td style={tableCellMuted}>
                    {session.userId?.fullName || "Unnamed User"}
                    <div style={smallMuted}>{session.userId?.email || "-"}</div>
                  </td>

                  <td style={tableCellMuted}>
                    {session.scheduledDate || "-"}
                    <div style={smallMuted}>
                      {session.scheduledStartTime || "-"} - {session.scheduledEndTime || "-"}
                    </div>
                  </td>

                  <td style={tableCellMuted}>
                    {session.mentorCancellation?.reason || "No reason provided"}
                  </td>

                  <td style={tableCellMuted}>
                    {session.mentorCancellation?.cancelledAt
                      ? new Date(session.mentorCancellation.cancelledAt).toLocaleString()
                      : "-"}
                  </td>

                  <td style={tableCell}>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <button
                        style={validBtn}
                        onClick={() => openReview(session, "valid")}
                      >
                        Mark Valid
                      </button>

                      <button
                        style={rejectBtn}
                        onClick={() => openReview(session, "rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {items.length === 0 && (
                <tr style={tableRow}>
                  <td colSpan="6" style={tableCellMuted}>
                    No pending mentor cancellations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {reviewModal && (
        <div style={overlayStyle} onClick={closeReview}>
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h2 style={modalTitle}>
              {reviewStatus === "valid" ? "Mark Cancellation as Valid" : "Reject Cancellation Reason"}
            </h2>

            <p style={pageSubtitle}>
              Mentor: {reviewModal.mentorUserId?.fullName || "Unnamed Mentor"}
            </p>

            <p style={reasonBox}>
              {reviewModal.mentorCancellation?.reason || "No reason provided"}
            </p>

            <label style={labelStyle}>Admin Note</label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Write your internal note..."
              style={textareaStyle}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={closeReview} style={cancelBtn}>
                Cancel
              </button>
              <button
                onClick={submitReview}
                disabled={submitting}
                style={reviewStatus === "valid" ? validBtn : rejectBtn}
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const pageTitle = {
  fontSize: "28px",
  margin: 0,
  color: "#F9FAFB",
  fontWeight: "800",
};

const pageSubtitle = {
  color: "rgba(255,255,255,0.6)",
  fontSize: "14px",
  marginTop: "8px",
};

const sectionStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "22px",
  padding: "22px",
};

const mutedText = { color: "rgba(255,255,255,0.7)" };
const errorText = { color: "#ff7d7d" };

const tableStyle = {
  width: "100%",
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

const validBtn = {
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

const reasonBox = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "14px",
  padding: "14px",
  color: "rgba(255,255,255,0.78)",
  lineHeight: 1.6,
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

export default MentorCancellations;