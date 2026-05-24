import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

const API_BASE = "http://localhost:5000/api/admin";

function Payments() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [providerFilter, setProviderFilter] = useState("All");
  const [entityFilter, setEntityFilter] = useState("All");

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalTransactions: 0,
    pendingTransactions: 0,
    completedTransactions: 0,
  });

  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPaymentsData = async () => {
      try {
        setLoading(true);
        setSummaryLoading(true);
        setError("");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const transactionsResponse = await fetch(`${API_BASE}/transactions`, {
  headers,
});

const transactionsData = await transactionsResponse.json();

        if (!transactionsResponse.ok) {
          throw new Error(
            transactionsData.message || "Failed to load transactions"
          );
        }

        

        const txItems = transactionsData.data?.items || [];

setTransactions(txItems);

setSummary({
  totalRevenue: txItems.reduce(
    (sum, tx) => sum + Number(tx.amount || tx.totalAmount || 0),
    0
  ),
  totalTransactions: txItems.length,
  pendingTransactions: txItems.filter((tx) => tx.status === "pending").length,
  completedTransactions: txItems.filter((tx) => tx.status === "completed").length,
});
      } catch (err) {
        setError(err.message || "Failed to load payment data");
      } finally {
        setLoading(false);
        setSummaryLoading(false);
      }
    };

    fetchPaymentsData();
  }, [token]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesStatus =
        statusFilter === "All" || tx.status === statusFilter;

      const matchesProvider =
        providerFilter === "All" || tx.provider === providerFilter;

      const matchesEntity =
        entityFilter === "All" || tx.entityType === entityFilter;

      return matchesStatus && matchesProvider && matchesEntity;
    });
  }, [transactions, statusFilter, providerFilter, entityFilter]);

  const statusOptions = [
    { label: "All", value: "All" },
    { label: "Pending", value: "pending" },
    { label: "Completed", value: "completed" },
    { label: "Failed", value: "failed" },
  ];

  const providerOptions = [
    { label: "All", value: "All" },
    { label: "Internal", value: "internal" },
    { label: "Fawry", value: "fawry" },
    { label: "Stripe", value: "stripe" },
  ];

  const entityOptions = [
    { label: "All", value: "All" },
    { label: "Wallet Topup", value: "wallet_topup" },
    { label: "Mentor Session", value: "mentor_session" },
    { label: "Group Event", value: "group_event" },
    { label: "Other", value: "other" },
  ];

  return (
    <AdminLayout>
      <div style={{ marginBottom: "22px" }}>
        <h1 style={title}>Payments & Transactions</h1>

        <p style={subtitle}>
          Monitor transactions, providers, payment status, and platform revenue.
        </p>
      </div>

      {error ? (
        <p style={{ color: "#ff7d7d", marginBottom: "18px" }}>{error}</p>
      ) : null}

      <div style={statsGrid}>
        <StatCard
          label="Total Revenue"
          value={summaryLoading ? "..." : `${summary.totalRevenue} EGP`}
        />

        <StatCard
          label="Total Transactions"
          value={summaryLoading ? "..." : summary.totalTransactions}
        />

        <StatCard
          label="Pending Transactions"
          value={summaryLoading ? "..." : summary.pendingTransactions}
        />

        <StatCard
          label="Completed Transactions"
          value={summaryLoading ? "..." : summary.completedTransactions}
        />
      </div>

      <div style={tableCard}>
        <div style={filterBar}>
          <FilterSelect
            label="Status"
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />

          <FilterSelect
            label="Provider"
            options={providerOptions}
            value={providerFilter}
            onChange={setProviderFilter}
          />

          <FilterSelect
            label="Entity Type"
            options={entityOptions}
            value={entityFilter}
            onChange={setEntityFilter}
          />
        </div>

        {loading ? (
          <p style={{ color: "#F9FAFB", opacity: 0.8 }}>
            Loading transactions...
          </p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                {[
                  "Transaction ID",
                  "User",
                  "Amount",
                  "Provider",
                  "Entity",
                  "Status",
                  "Reference",
                  "Created At",
                ].map((item) => (
                  <th key={item} style={thStyle}>
                    {item}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id}>
                    <td style={cellStyle}>{tx._id}</td>

                    <td style={cellStyle}>
                      {tx.userId?.fullName || "Unknown User"}
                    </td>

                    <td style={cellStyle}>
                      {tx.amount || 0} {tx.currency || "EGP"}
                    </td>

                    <td style={cellStyle}>
                      {formatLabel(tx.provider)}
                    </td>

                    <td style={cellStyle}>
                      {formatLabel(tx.entityType)}
                    </td>

                    <td style={cellStyle}>
                      <span style={getStatusStyle(tx.status)}>
                        {formatLabel(tx.status)}
                      </span>
                    </td>

                    <td style={cellStyle}>{tx.reference || "-"}</td>

                    <td style={cellStyle}>
                      {tx.createdAt
                        ? new Date(tx.createdAt).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={emptyStateStyle}>
                    No transactions match the selected filters.
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

function StatCard({ label, value }) {
  return (
    <div style={statCard}>
      <div style={statLabel}>{label}</div>
      <div style={statValue}>{value}</div>
    </div>
  );
}

function FilterSelect({ label, options, value, onChange }) {
  return (
    <div style={filterGroup}>
      <label style={filterLabel}>{label}</label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={selectStyle}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function formatLabel(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

const title = {
  color: "#F9FAFB",
  fontSize: "32px",
  fontWeight: "800",
  margin: 0,
};

const subtitle = {
  color: "rgba(249,250,251,0.6)",
  marginTop: "8px",
  fontSize: "15px",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0,1fr))",
  gap: "18px",
  marginBottom: "18px",
};

const statCard = {
  background:
    "linear-gradient(180deg, rgba(20,53,70,0.95) 0%, rgba(16,38,50,0.98) 100%)",
  borderRadius: "24px",
  padding: "22px",
  border: "1px solid rgba(255,255,255,0.05)",
};

const statLabel = {
  color: "rgba(249,250,251,0.62)",
  fontSize: "15px",
  marginBottom: "12px",
};

const statValue = {
  color: "#F9FAFB",
  fontSize: "30px",
  fontWeight: "800",
};

const tableCard = {
  background:
    "linear-gradient(180deg, rgba(20,53,70,0.95) 0%, rgba(16,38,50,0.98) 100%)",
  borderRadius: "28px",
  padding: "24px",
  border: "1px solid rgba(255,255,255,0.05)",
  overflowX: "auto",
};

const filterBar = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0,1fr))",
  gap: "16px",
  marginBottom: "22px",
};

const filterGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

const filterLabel = {
  color: "rgba(249,250,251,0.68)",
  fontSize: "13px",
  fontWeight: "600",
};

const selectStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.04)",
  color: "#F9FAFB",
  outline: "none",
};

const tableStyle = {
  width: "100%",
  minWidth: "900px",
  borderCollapse: "collapse",
};

const thStyle = {
  textAlign: "left",
  color: "rgba(249,250,251,0.52)",
  fontSize: "13px",
  fontWeight: "600",
  paddingBottom: "14px",
};

const cellStyle = {
  color: "#F9FAFB",
  fontSize: "14px",
  padding: "16px 12px 16px 0",
  borderTop: "1px solid rgba(255,255,255,0.05)",
};

const emptyStateStyle = {
  color: "rgba(249,250,251,0.62)",
  fontSize: "15px",
  padding: "20px 0",
  borderTop: "1px solid rgba(255,255,255,0.05)",
  textAlign: "center",
};

const getStatusStyle = (status) => {
  if (status === "completed") {
    return {
      display: "inline-block",
      padding: "6px 14px",
      borderRadius: "999px",
      background: "rgba(34,197,94,0.16)",
      color: "#86efac",
      fontSize: "13px",
      fontWeight: "700",
    };
  }

  if (status === "pending") {
    return {
      display: "inline-block",
      padding: "6px 14px",
      borderRadius: "999px",
      background: "rgba(245,161,0,0.16)",
      color: "#F5A100",
      fontSize: "13px",
      fontWeight: "700",
    };
  }

  return {
    display: "inline-block",
    padding: "6px 14px",
    borderRadius: "999px",
    background: "rgba(239,68,68,0.16)",
    color: "#fca5a5",
    fontSize: "13px",
    fontWeight: "700",
  };
};

export default Payments;