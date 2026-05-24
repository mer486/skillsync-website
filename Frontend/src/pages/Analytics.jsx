import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

const API_BASE = "http://localhost:5000/api/admin";

function Analytics() {
  const [overview, setOverview] = useState(null);
  const [sessionTrends, setSessionTrends] = useState([]);
  const [topCareers, setTopCareers] = useState([]);
  const [topSkills, setTopSkills] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [overviewRes, sessionsRes, careersRes, skillsRes] =
          await Promise.all([
            fetch(`${API_BASE}/analytics/overview`, { headers }),
            fetch(`${API_BASE}/analytics/session-trends?days=30`, { headers }),
            fetch(`${API_BASE}/analytics/top-careers?limit=5`, { headers }),
            fetch(`${API_BASE}/analytics/top-skills?limit=5`, { headers }),
          ]);

        const [overviewData, sessionsData, careersData, skillsData] =
          await Promise.all([
            overviewRes.json(),
            sessionsRes.json(),
            careersRes.json(),
            skillsRes.json(),
          ]);

        if (!overviewRes.ok) {
          throw new Error(overviewData.message || "Failed to load overview");
        }

        if (!sessionsRes.ok) {
          throw new Error(sessionsData.message || "Failed to load session trends");
        }

        if (!careersRes.ok) {
          throw new Error(careersData.message || "Failed to load top careers");
        }

        if (!skillsRes.ok) {
          throw new Error(skillsData.message || "Failed to load top skills");
        }

        setOverview(overviewData.data || {});
        setSessionTrends(sessionsData.data || []);
        setTopCareers(careersData.data || []);
        setTopSkills(skillsData.data || []);
      } catch (err) {
        setError(err.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [token]);

  const metrics = [
    ["Total Users", overview?.totalUsers || 0],
    ["Total Mentors", overview?.totalMentors || 0],
    ["Pending Mentors", overview?.pendingMentors || 0],
    ["Active Sessions", overview?.activeSessions || 0],
    ["Completed Sessions", overview?.completedSessions || 0],
    ["User No Shows", overview?.noShowSessions || 0],
    ["Open Complaints", overview?.openComplaints || 0],
    ["Transactions", overview?.totalTransactions || 0],
    ["Revenue", `${overview?.totalRevenue || 0} EGP`],
  ];

  const latestSessionRow =
    sessionTrends.length > 0 ? sessionTrends[sessionTrends.length - 1] : null;

  return (
    <AdminLayout>
      <div style={{ marginBottom: "22px" }}>
        <h1 style={pageTitle}>Analytics & Reports</h1>
        <p style={pageSubtitle}>
          General platform analytics for users, sessions, careers, skills, and transactions.
        </p>
      </div>

      {loading ? (
        <p style={{ color: "#F9FAFB", opacity: 0.8 }}>Loading analytics...</p>
      ) : error ? (
        <p style={{ color: "#ff7d7d" }}>{error}</p>
      ) : (
        <>
          <div style={metricsGrid}>
            {metrics.map(([label, value]) => (
              <div key={label} style={miniCard}>
                <span style={metricLabel}>{label}</span>
                <span style={metricValue}>{value}</span>
              </div>
            ))}
          </div>

          <div style={mainGrid}>
            <div style={cardStyle}>
              <h3 style={titleStyle}>Session Trends Summary</h3>

              <div style={sessionSummaryGrid}>
                <div style={summaryBox}>
                  <span style={metricLabel}>Latest Date</span>
                  <strong style={metricValue}>{latestSessionRow?.date || "-"}</strong>
                </div>

                <div style={summaryBox}>
                  <span style={metricLabel}>Scheduled</span>
                  <strong style={metricValue}>{latestSessionRow?.scheduled || 0}</strong>
                </div>

                <div style={summaryBox}>
                  <span style={metricLabel}>Completed</span>
                  <strong style={metricValue}>{latestSessionRow?.completed || 0}</strong>
                </div>

                <div style={summaryBox}>
                  <span style={metricLabel}>Cancelled</span>
                  <strong style={metricValue}>{latestSessionRow?.cancelled || 0}</strong>
                </div>
              </div>

              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeadRow}>
                    <th align="left">Date</th>
                    <th align="left">Scheduled</th>
                    <th align="left">Started</th>
                    <th align="left">Active</th>
                    <th align="left">Completed</th>
                    <th align="left">Cancelled</th>
                    <th align="left">Expired</th>
                    <th align="left">No Show</th>
                  </tr>
                </thead>

                <tbody>
                  {sessionTrends.slice(-10).map((row) => (
                    <tr key={row.date} style={tableRow}>
                      <td style={tableCell}>{row.date}</td>
                      <td style={tableCellMuted}>{row.scheduled}</td>
                      <td style={tableCellMuted}>{row.started}</td>
                      <td style={tableCellMuted}>{row.active}</td>
                      <td style={tableCellMuted}>{row.completed}</td>
                      <td style={tableCellMuted}>{row.cancelled}</td>
                      <td style={tableCellMuted}>{row.expired}</td>
                      <td style={tableCellMuted}>{row.user_no_show}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "grid", gap: "18px" }}>
              <div style={cardStyle}>
                <h3 style={titleStyle}>Top Career Paths</h3>

                <div style={{ display: "grid", gap: "12px" }}>
                  {topCareers.length === 0 ? (
                    <p style={mutedText}>No career analytics yet.</p>
                  ) : (
                    topCareers.map((item) => (
                      <div key={item.careerId} style={listItem}>
                        <span>{item.careerName}</span>
                        <strong>{item.count}</strong>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div style={cardStyle}>
                <h3 style={titleStyle}>Top Skills</h3>

                <div style={{ display: "grid", gap: "12px" }}>
                  {topSkills.length === 0 ? (
                    <p style={mutedText}>No skill analytics yet.</p>
                  ) : (
                    topSkills.map((item) => (
                      <div key={item.skill} style={listItem}>
                        <span>{item.skill}</span>
                        <strong>{item.count}</strong>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
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

const metricsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "14px",
  marginBottom: "18px",
};

const mainGrid = {
  display: "grid",
  gridTemplateColumns: "1.5fr 1fr",
  gap: "18px",
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
  fontSize: "20px",
  fontWeight: "800",
  margin: "0 0 18px",
};

const miniCard = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: "18px",
  padding: "16px 18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const metricLabel = {
  color: "rgba(249,250,251,0.68)",
  fontSize: "14px",
};

const metricValue = {
  color: "#F5A100",
  fontSize: "18px",
  fontWeight: "800",
};

const sessionSummaryGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "12px",
  marginBottom: "18px",
};

const summaryBox = {
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: "16px",
  padding: "14px",
  display: "grid",
  gap: "8px",
};

const tableStyle = {
  width: "100%",
  minWidth: "760px",
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
  padding: "12px 6px",
  color: "#F9FAFB",
  fontSize: "13px",
  fontWeight: "700",
};

const tableCellMuted = {
  padding: "12px 6px",
  color: "rgba(255,255,255,0.65)",
  fontSize: "13px",
};

const listItem = {
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: "14px",
  padding: "12px 14px",
  display: "flex",
  justifyContent: "space-between",
  color: "#F9FAFB",
};

const mutedText = {
  color: "rgba(255,255,255,0.6)",
};

export default Analytics;