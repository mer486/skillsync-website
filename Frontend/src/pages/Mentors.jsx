import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";
import toast from "react-hot-toast";

function Mentors() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMentor, setSelectedMentor] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  const fetchMentors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("https://skillsync2-production.up.railway.app/api/admin/mentors", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load mentors");
      }

      setMentors(data.data?.items || []);
    } catch (err) {
      setError(err.message || "Failed to load mentors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const isMentorVerified = (mentor) => mentor.isVerified === true;

  const getMentorDisplayStatus = (mentor) => {
    return isMentorVerified(mentor) ? "Verified" : "Pending";
  };

  const getMentorName = (mentor) => {
    return mentor.userId?.fullName || mentor.name || "Unnamed Mentor";
  };

  const getMentorEmail = (mentor) => {
    return mentor.userId?.email || mentor.email || "-";
  };

  const getMentorSpecialization = (mentor) => {
    if (Array.isArray(mentor.specialization) && mentor.specialization.length > 0) {
      return mentor.specialization.join(", ");
    }

    return mentor.careerField || mentor.field || "Not specified";
  };

  const getLiveStatus = (mentor) => {
    return mentor.availabilityStatus || (mentor.isAvailable ? "online" : "offline");
  };

  const openViewModal = (mentor) => {
    setSelectedMentor(mentor);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setSelectedMentor(null);
    setIsViewModalOpen(false);
  };

  const handleVerifyMentor = async (mentor) => {
    const confirmed = window.confirm(
      `Are you sure you want to verify ${getMentorName(mentor)}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `https://skillsync2-production.up.railway.app/api/admin/mentor-profiles/${mentor._id}/verify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to verify mentor");
      }

      toast.success("Mentor verified successfully");
      fetchMentors();
    } catch (err) {
      toast.error(err.message || "Failed to verify mentor");
    }
  };

  const handleUnverifyMentor = async (mentor) => {
    const confirmed = window.confirm(
      `Are you sure you want to unverify ${getMentorName(mentor)}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `https://skillsync2-production.up.railway.app/api/admin/mentor-profiles/${mentor._id}/unverify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to unverify mentor");
      }

      toast.success("Mentor unverified successfully");
      fetchMentors();
    } catch (err) {
      toast.error(err.message || "Failed to unverify mentor");
    }
  };

  const getStatusStyle = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "verified") {
      return {
        background: "rgba(34,197,94,0.15)",
        color: "#86efac",
        border: "1px solid rgba(34,197,94,0.25)",
      };
    }

    return {
      background: "rgba(245,161,0,0.12)",
      color: "#F5A100",
      border: "1px solid rgba(245,161,0,0.25)",
    };
  };

  const getLiveStatusStyle = (status) => {
    const normalized = String(status || "").toLowerCase();

    if (normalized === "online") {
      return {
        background: "rgba(34,197,94,0.12)",
        color: "#86efac",
        border: "1px solid rgba(34,197,94,0.22)",
      };
    }

    if (normalized === "on_break") {
      return {
        background: "rgba(245,161,0,0.12)",
        color: "#F5A100",
        border: "1px solid rgba(245,161,0,0.22)",
      };
    }

    return {
      background: "rgba(255,255,255,0.06)",
      color: "rgba(255,255,255,0.65)",
      border: "1px solid rgba(255,255,255,0.1)",
    };
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "26px", margin: 0, color: "#F9FAFB" }}>
          Mentor Monitoring
        </h1>

        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
          View mentor profiles, verification status, live status, and reliability warnings.
        </p>
      </div>

      <div style={tableContainer}>
        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.75)" }}>Loading mentors...</p>
        ) : error ? (
          <p style={{ color: "#ff7d7d" }}>{error}</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeadRow}>
                <th align="left">Mentor</th>
                <th align="left">Specialization</th>
                <th align="left">Rating</th>
                <th align="left">Sessions</th>
                <th align="left">Live Status</th>
                <th align="left">Warnings</th>
                <th align="left">Status</th>
                <th align="left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {mentors.map((mentor) => {
                const displayStatus = getMentorDisplayStatus(mentor);
                const verified = isMentorVerified(mentor);
                const liveStatus = getLiveStatus(mentor);

                return (
                  <tr key={mentor._id} style={tableRow}>
                    <td style={tableCellStrong}>
                      {getMentorName(mentor)}
                      <div style={smallMuted}>{getMentorEmail(mentor)}</div>
                    </td>

                    <td style={tableCellMuted}>
                      {getMentorSpecialization(mentor)}
                    </td>

                    <td style={tableCellAccent}>⭐ {mentor.ratingAverage || 0}</td>

                    <td style={tableCellMuted}>{mentor.totalSessions || 0}</td>

                    <td style={tableCell}>
                      <span style={{ ...badgeStyle, ...getLiveStatusStyle(liveStatus) }}>
                        {liveStatus}
                      </span>
                    </td>

                    <td style={tableCellMuted}>
                      {mentor.consecutiveValidCancellations || 0} valid /{" "}
                      {mentor.cancellationPenaltyCount || 0} penalties
                    </td>

                    <td style={tableCell}>
                      <span style={{ ...badgeStyle, ...getStatusStyle(displayStatus) }}>
                        {displayStatus}
                      </span>
                    </td>

                    <td style={tableCell}>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <button onClick={() => openViewModal(mentor)} style={actionBtn}>
                          View
                        </button>

                        {verified ? (
                          <button
                            onClick={() => handleUnverifyMentor(mentor)}
                            style={unverifyBtn}
                          >
                            Unverify
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVerifyMentor(mentor)}
                            style={verifyBtn}
                          >
                            Verify
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {mentors.length === 0 && (
                <tr>
                  <td colSpan="8" style={emptyCell}>
                    No mentors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isViewModalOpen && selectedMentor && (
        <div onClick={closeViewModal} style={overlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={modalStyle}>
            <div style={{ padding: "28px", position: "relative" }}>
              <button onClick={closeViewModal} style={closeBtn}>
                ×
              </button>

              <h2 style={modalTitle}>Mentor Details</h2>

              <div style={detailsGrid}>
                <DetailItem label="Name" value={getMentorName(selectedMentor)} />
                <DetailItem label="Email" value={getMentorEmail(selectedMentor)} />
                <DetailItem
                  label="Specialization"
                  value={getMentorSpecialization(selectedMentor)}
                />
                <DetailItem
                  label="Rating"
                  value={`⭐ ${selectedMentor.ratingAverage || 0}`}
                />
                <DetailItem
                  label="Sessions"
                  value={selectedMentor.totalSessions || 0}
                />
                <DetailItem
                  label="Verification Status"
                  value={getMentorDisplayStatus(selectedMentor)}
                />
                <DetailItem
                  label="Live Status"
                  value={getLiveStatus(selectedMentor)}
                />
                <DetailItem
                  label="Consecutive Valid Cancellations"
                  value={selectedMentor.consecutiveValidCancellations || 0}
                />
                <DetailItem
                  label="Penalty Count"
                  value={selectedMentor.cancellationPenaltyCount || 0}
                />
                <DetailItem
                  label="Last Cancellation Reviewed At"
                  value={
                    selectedMentor.lastCancellationReviewedAt
                      ? new Date(selectedMentor.lastCancellationReviewedAt).toLocaleString()
                      : "-"
                  }
                />
                <DetailItem
                  label="Break Ends At"
                  value={
                    selectedMentor.breakEndsAt
                      ? new Date(selectedMentor.breakEndsAt).toLocaleString()
                      : "-"
                  }
                />
                <DetailItem
                  label="Base Rate"
                  value={`${selectedMentor.baseRate || 0} ${
                    selectedMentor.currency || "EGP"
                  }`}
                />
              </div>
            </div>

            <div style={modalFooter}>
              <button onClick={closeViewModal} style={cancelBtn}>
                Close
              </button>
            </div>
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

function DetailItem({ label, value }) {
  return (
    <div style={detailItemStyle}>
      <p style={detailsLabel}>{label}</p>
      <p style={detailsValue}>{value}</p>
    </div>
  );
}

const tableContainer = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: "20px",
  padding: "24px",
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  minWidth: "980px",
  borderCollapse: "collapse",
};

const tableHeadRow = {
  fontSize: "12px",
  color: "rgba(255,255,255,0.55)",
};

const tableRow = {
  borderTop: "1px solid rgba(255,255,255,0.05)",
};

const tableCell = {
  padding: "14px 8px",
  color: "#F9FAFB",
  fontSize: "14px",
  verticalAlign: "top",
};

const tableCellStrong = {
  ...tableCell,
  fontWeight: "700",
};

const tableCellMuted = {
  ...tableCell,
  color: "rgba(255,255,255,0.72)",
};

const tableCellAccent = {
  ...tableCell,
  color: "#F5A100",
  fontWeight: "700",
};

const smallMuted = {
  marginTop: "5px",
  color: "rgba(255,255,255,0.42)",
  fontSize: "12px",
  fontWeight: "500",
};

const emptyCell = {
  padding: "18px 8px",
  color: "rgba(255,255,255,0.6)",
  borderTop: "1px solid rgba(255,255,255,0.05)",
};

const badgeStyle = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "800",
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
  animation: "fadeIn 0.2s ease",
};

const modalStyle = {
  width: "100%",
  maxWidth: "760px",
  maxHeight: "88vh",
  overflow: "auto",
  borderRadius: "24px",
  background:
    "linear-gradient(180deg, rgba(20,53,70,0.97) 0%, rgba(16,38,50,0.99) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
  animation: "modalSlide 0.25s ease",
};

const modalTitle = {
  margin: "4px 0 20px 0",
  color: "#F9FAFB",
  fontSize: "24px",
  fontWeight: "800",
};

const detailsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "16px",
};

const detailItemStyle = {
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "16px",
  padding: "14px",
  minHeight: "72px",
};

const detailsLabel = {
  margin: "0 0 6px 0",
  color: "rgba(249,250,251,0.58)",
  fontSize: "13px",
  fontWeight: "700",
};

const detailsValue = {
  margin: 0,
  color: "#F9FAFB",
  fontSize: "15px",
  lineHeight: 1.5,
  fontWeight: "600",
  wordBreak: "break-word",
  whiteSpace: "pre-wrap",
};

const modalFooter = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  padding: "18px 28px 22px 28px",
  borderTop: "1px solid rgba(255,255,255,0.08)",
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

const cancelBtn = {
  padding: "12px 24px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(255,255,255,0.02)",
  color: "#F9FAFB",
  fontSize: "15px",
  cursor: "pointer",
};

const actionBtn = {
  padding: "7px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "transparent",
  color: "#fff",
  cursor: "pointer",
};

const verifyBtn = {
  padding: "7px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(34,197,94,0.25)",
  background: "rgba(34,197,94,0.12)",
  color: "#86efac",
  cursor: "pointer",
  fontWeight: "700",
};

const unverifyBtn = {
  padding: "7px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(245,161,0,0.25)",
  background: "rgba(245,161,0,0.1)",
  color: "#F5A100",
  cursor: "pointer",
  fontWeight: "700",
};

export default Mentors;