import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

const API_BASE = "https://skillsync2-production.up.railway.app/api/admin";

function StatCard({ title, value, subtitle }) {
  return (
    <div style={cardStyle}>
      <p style={cardTitle}>{title}</p>
      <h2 style={cardValue}>{value}</h2>
      {subtitle && <p style={cardSubtitle}>{subtitle}</p>}
    </div>
  );
}

function MentorBehavior() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/analytics/mentor-behavior`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load mentor behavior analytics");
      }

      setData(result.data || {});
    } catch (err) {
      setError(err.message || "Failed to load mentor behavior analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const mentorStatuses = data?.mentorStatuses || {};

  return (
    <AdminLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={pageTitle}>Mentor Behavior Analytics</h1>
        <p style={pageSubtitle}>
          Monitor mentor reliability, cancellations, penalties, and live availability.
        </p>
      </div>

      {loading ? (
        <p style={mutedText}>Loading analytics...</p>
      ) : error ? (
        <p style={errorText}>{error}</p>
      ) : (
        <>
          <div style={gridStyle}>
            <StatCard
              title="Total Cancellations"
              value={data?.totalMentorCancellations || 0}
              subtitle="Cancelled by mentors"
            />
            <StatCard
              title="Pending Reviews"
              value={data?.pendingCancellationReviews || 0}
              subtitle="Need admin decision"
            />
            <StatCard
              title="Valid Reviews"
              value={data?.validCancellationReviews || 0}
              subtitle="Accepted as valid"
            />
            <StatCard
              title="Rejected Reviews"
              value={data?.rejectedCancellationReviews || 0}
              subtitle="Not accepted"
            />
            <StatCard
              title="Online Mentors"
              value={mentorStatuses.online || 0}
              subtitle="Currently online"
            />
            <StatCard
              title="Offline Mentors"
              value={mentorStatuses.offline || 0}
              subtitle="Currently offline"
            />
            <StatCard
              title="On Break"
              value={mentorStatuses.onBreak || 0}
              subtitle="Temporary break"
            />
            <StatCard
              title="Blocked Mentors"
              value={data?.blockedMentors || 0}
              subtitle="Inactive mentor accounts"
            />
          </div>

          <div style={sectionStyle}>
            <div style={{ marginBottom: "18px" }}>
              <h2 style={sectionTitle}>Top Mentors With Cancellation Warnings</h2>
              <p style={pageSubtitle}>
                Mentors currently having valid cancellation counts or penalty cycles.
              </p>
            </div>

            <table style={tableStyle}>
              <thead>
                <tr style={tableHeadRow}>
                  <th align="left">Mentor</th>
                  <th align="left">Email</th>
                  <th align="left">Consecutive Valid Cancellations</th>
                  <th align="left">Penalty Count</th>
                </tr>
              </thead>

              <tbody>
                {(data?.topCancellationMentors || []).map((mentor) => (
                  <tr key={mentor.mentorProfileId} style={tableRow}>
                    <td style={tableCell}>{mentor.fullName || "Unnamed Mentor"}</td>
                    <td style={tableCellMuted}>{mentor.email || "-"}</td>
                    <td style={tableCell}>{mentor.consecutiveValidCancellations || 0}</td>
                    <td style={tableCell}>{mentor.cancellationPenaltyCount || 0}</td>
                  </tr>
                ))}

                {(data?.topCancellationMentors || []).length === 0 && (
                  <tr style={tableRow}>
                    <td colSpan="4" style={tableCellMuted}>
                      No mentor cancellation warnings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
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

const mutedText = {
  color: "rgba(255,255,255,0.7)",
};

const errorText = {
  color: "#ff7d7d",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "16px",
  marginBottom: "22px",
};

const cardStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "20px",
  padding: "20px",
};

const cardTitle = {
  margin: 0,
  color: "rgba(255,255,255,0.58)",
  fontSize: "13px",
  fontWeight: "700",
};

const cardValue = {
  margin: "10px 0 6px",
  color: "#F9FAFB",
  fontSize: "30px",
  fontWeight: "800",
};

const cardSubtitle = {
  margin: 0,
  color: "rgba(255,255,255,0.48)",
  fontSize: "12px",
};

const sectionStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: "22px",
  padding: "22px",
};

const sectionTitle = {
  color: "#F9FAFB",
  margin: 0,
  fontSize: "20px",
  fontWeight: "800",
};

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
  padding: "14px 0",
  color: "#F9FAFB",
  fontSize: "14px",
  fontWeight: "600",
};

const tableCellMuted = {
  padding: "14px 0",
  color: "rgba(255,255,255,0.65)",
  fontSize: "14px",
};

export default MentorBehavior;