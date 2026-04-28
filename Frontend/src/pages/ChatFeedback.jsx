import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

function ChatFeedback() {
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState({
    mentorRating: 0,
    applicationRating: 0,
    chatExperience: 0,
  });

  const [statusFilter, setStatusFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [openStatusMenuId, setOpenStatusMenuId] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState(null);

  const token = localStorage.getItem("token");

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/feedback", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load feedback");
      }

      setFeedbackList(data);

      if (data.length > 0) {
        const totalRating = data.reduce(
          (sum, item) => sum + (item.rating || 0),
          0
        );

        const averageRating = (totalRating / data.length).toFixed(1);

        setSummary({
          mentorRating: averageRating,
          applicationRating: averageRating,
          chatExperience: averageRating,
        });
      } else {
        setSummary({
          mentorRating: 0,
          applicationRating: 0,
          chatExperience: 0,
        });
      }
    } catch (err) {
      setError(err.message || "Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [token]);

  const handleStatusUpdate = async (feedback, newStatus) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/feedback/${feedback._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            session: feedback.session,
            issue: feedback.issue,
            rating: feedback.rating,
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update feedback status");
      }

      setOpenStatusMenuId(null);
      fetchFeedback();
    } catch (err) {
      alert(err.message || "Failed to update feedback status");
    }
  };

  const openDeleteModal = (feedback) => {
    setFeedbackToDelete(feedback);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setFeedbackToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteFeedback = async () => {
    if (!feedbackToDelete) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/feedback/${feedbackToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete feedback");
      }

      closeDeleteModal();
      fetchFeedback();
    } catch (err) {
      alert(err.message || "Failed to delete feedback");
    }
  };

  const getStatusBadgeStyle = (status) => {
    const normalized = (status || "").toLowerCase();

    if (normalized === "resolved") {
      return {
        background: "rgba(34,197,94,0.16)",
        color: "#F9FAFB",
        border: "1px solid rgba(34,197,94,0.22)",
      };
    }

    if (normalized === "under review") {
      return {
        background: "rgba(125,179,209,0.18)",
        color: "#F9FAFB",
        border: "1px solid rgba(125,179,209,0.22)",
      };
    }

    return {
      background: "rgba(245,161,0,0.16)",
      color: "#F9FAFB",
      border: "1px solid rgba(245,161,0,0.22)",
    };
  };

  const filteredFeedback =
    statusFilter === "All"
      ? feedbackList
      : feedbackList.filter(
          (item) =>
            (item.status || "").toLowerCase() === statusFilter.toLowerCase()
        );

  const filterOptions = ["All", "Open", "Resolved", "Under Review"];
  const statusOptions = ["Open", "Under Review", "Resolved"];

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
          Chat & Feedback
        </h1>
        <p
          style={{
            color: "rgba(249,250,251,0.6)",
            marginTop: "8px",
            fontSize: "15px",
          }}
        >
          Review reports, complaints, and session feedback.
        </p>
      </div>

      {loading ? (
        <p style={{ color: "rgba(255,255,255,0.75)" }}>Loading feedback...</p>
      ) : error ? (
        <p style={{ color: "#ff7d7d" }}>{error}</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "18px",
          }}
        >
          <div style={cardStyle}>
            <h3 style={titleStyle}>Feedback Summary</h3>
            <div style={{ display: "grid", gap: "14px" }}>
              <div style={miniCard}>
                <span style={labelStyle}>Mentor Rating</span>
                <span style={valueStyle}>{summary.mentorRating} / 5</span>
              </div>
              <div style={miniCard}>
                <span style={labelStyle}>Application Rating</span>
                <span style={valueStyle}>{summary.applicationRating} / 5</span>
              </div>
              <div style={miniCard}>
                <span style={labelStyle}>Chat Experience</span>
                <span style={valueStyle}>{summary.chatExperience} / 5</span>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <h3 style={{ ...titleStyle, marginBottom: 0 }}>Reported Sessions</h3>

              <div style={{ position: "relative", minWidth: "190px" }}>
                <button
                  onClick={() => setIsFilterOpen((prev) => !prev)}
                  style={customSelectButton}
                >
                  <span>{statusFilter}</span>
                  <span style={arrowStyle}>{isFilterOpen ? "▴" : "▾"}</span>
                </button>

                {isFilterOpen && (
                  <div style={customDropdownMenu}>
                    {filterOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setStatusFilter(option);
                          setIsFilterOpen(false);
                        }}
                        style={{
                          ...dropdownItemStyle,
                          ...(statusFilter === option
                            ? activeDropdownItemStyle
                            : {}),
                        }}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "grid", gap: "12px" }}>
              {filteredFeedback.length > 0 ? (
                filteredFeedback.map((report) => (
                  <div
                    key={report._id}
                    style={{
                      ...miniCard,
                      alignItems: "flex-start",
                      gap: "16px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          color: "#F9FAFB",
                          fontWeight: "700",
                          marginBottom: "4px",
                        }}
                      >
                        {report.session}
                      </div>

                      <div
                        style={{
                          color: "rgba(249,250,251,0.62)",
                          fontSize: "14px",
                          marginBottom: "10px",
                        }}
                      >
                        {report.issue}
                      </div>

                      <div
                        style={{
                          color: "#F5A100",
                          fontSize: "14px",
                          fontWeight: "700",
                        }}
                      >
                        Rating: {report.rating} / 5
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        alignItems: "flex-end",
                        minWidth: "150px",
                      }}
                    >
                      <div style={{ position: "relative", width: "150px" }}>
                        <button
                          onClick={() =>
                            setOpenStatusMenuId((prev) =>
                              prev === report._id ? null : report._id
                            )
                          }
                          style={{
                            ...statusButtonStyle,
                            ...getStatusBadgeStyle(report.status),
                          }}
                        >
                          <span>{report.status}</span>
                          <span style={arrowStyle}>
                            {openStatusMenuId === report._id ? "▴" : "▾"}
                          </span>
                        </button>

                        {openStatusMenuId === report._id && (
                          <div style={statusDropdownMenu}>
                            {statusOptions.map((option) => (
                              <button
                                key={option}
                                onClick={() =>
                                  handleStatusUpdate(report, option)
                                }
                                style={{
                                  ...dropdownItemStyle,
                                  ...(report.status === option
                                    ? activeDropdownItemStyle
                                    : {}),
                                }}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => openDeleteModal(report)}
                        style={deleteBtn}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div style={miniCard}>
                  <div
                    style={{
                      color: "rgba(249,250,251,0.62)",
                      fontSize: "14px",
                    }}
                  >
                    No feedback found.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && feedbackToDelete && (
        <div onClick={closeDeleteModal} style={overlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={deleteModalStyle}>
            <div style={{ padding: "28px", position: "relative" }}>
              <button onClick={closeDeleteModal} style={closeBtn}>
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
                Delete Feedback
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "rgba(255,255,255,0.72)",
                  fontSize: "15px",
                  lineHeight: 1.7,
                }}
              >
                Are you sure you want to delete feedback for{" "}
                <span style={{ color: "#F9FAFB", fontWeight: "700" }}>
                  {feedbackToDelete.session}
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
              <button onClick={closeDeleteModal} style={cancelBtn}>
                Cancel
              </button>

              <button onClick={handleDeleteFeedback} style={confirmDeleteBtn}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const cardStyle = {
  background:
    "linear-gradient(180deg, rgba(20,53,70,0.95) 0%, rgba(16,38,50,0.98) 100%)",
  borderRadius: "28px",
  padding: "24px",
  border: "1px solid rgba(255,255,255,0.05)",
  boxShadow: "0 12px 26px rgba(0,0,0,0.15)",
};

const titleStyle = {
  color: "#F9FAFB",
  fontSize: "22px",
  fontWeight: "800",
  marginBottom: "18px",
};

const miniCard = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: "18px",
  padding: "16px 18px",
  display: "flex",
  justifyContent: "space-between",
};

const labelStyle = {
  color: "rgba(249,250,251,0.68)",
  fontSize: "15px",
};

const valueStyle = {
  color: "#F5A100",
  fontSize: "18px",
  fontWeight: "800",
};

const customSelectButton = {
  width: "190px",
  padding: "12px 16px",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#F9FAFB",
  fontSize: "15px",
  fontWeight: "600",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
};

const statusButtonStyle = {
  width: "150px",
  padding: "10px 14px",
  borderRadius: "16px",
  fontSize: "13px",
  fontWeight: "700",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
};

const arrowStyle = {
  color: "rgba(249,250,251,0.72)",
  fontSize: "14px",
};

const customDropdownMenu = {
  position: "absolute",
  top: "calc(100% + 8px)",
  left: 0,
  right: 0,
  background:
    "linear-gradient(180deg, rgba(20,53,70,0.98) 0%, rgba(16,38,50,1) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  padding: "8px",
  boxShadow: "0 18px 36px rgba(0,0,0,0.22)",
  zIndex: 100,
  display: "grid",
  gap: "6px",
};

const statusDropdownMenu = {
  position: "absolute",
  top: "calc(100% + 8px)",
  left: 0,
  right: 0,
  background:
    "linear-gradient(180deg, rgba(20,53,70,0.98) 0%, rgba(16,38,50,1) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "16px",
  padding: "8px",
  boxShadow: "0 18px 36px rgba(0,0,0,0.22)",
  zIndex: 100,
  display: "grid",
  gap: "6px",
};

const dropdownItemStyle = {
  width: "100%",
  textAlign: "left",
  padding: "12px 14px",
  borderRadius: "12px",
  border: "none",
  background: "transparent",
  color: "#F9FAFB",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer",
};

const activeDropdownItemStyle = {
  background: "rgba(245,161,0,0.14)",
  color: "#F5A100",
};

const deleteBtn = {
  padding: "8px 12px",
  borderRadius: "10px",
  border: "1px solid rgba(239,68,68,0.25)",
  background: "transparent",
  color: "#ff7d7d",
  fontSize: "13px",
  fontWeight: "700",
  cursor: "pointer",
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

const deleteModalStyle = {
  width: "100%",
  maxWidth: "520px",
  borderRadius: "24px",
  overflow: "hidden",
  background:
    "linear-gradient(180deg, rgba(39,20,20,0.97) 0%, rgba(30,16,16,0.99) 100%)",
  border: "1px solid rgba(239,68,68,0.16)",
  boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
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

const confirmDeleteBtn = {
  padding: "12px 24px",
  borderRadius: "14px",
  border: "1px solid rgba(239,68,68,0.28)",
  background: "rgba(239,68,68,0.16)",
  color: "#fecaca",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
};

export default ChatFeedback;