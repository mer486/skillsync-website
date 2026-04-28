import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

function Payments() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [providerFilter, setProviderFilter] = useState("All");
  const [entityFilter, setEntityFilter] = useState("All");

  const [openDropdown, setOpenDropdown] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    totalTransactionVolume: 0,
    walletTopups: 0,
    pendingTransactions: 0,
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

        const [transactionsResponse, summaryResponse] = await Promise.all([
          fetch("http://localhost:5000/api/payments", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:5000/api/payments/summary", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const transactionsData = await transactionsResponse.json();
        const summaryData = await summaryResponse.json();

        if (!transactionsResponse.ok) {
          throw new Error(
            transactionsData.message || "Failed to load transactions"
          );
        }

        if (!summaryResponse.ok) {
          throw new Error(summaryData.message || "Failed to load payment summary");
        }

        setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
        setSummary({
          totalTransactionVolume: Number(summaryData.totalTransactionVolume || 0),
          walletTopups: Number(summaryData.walletTopups || 0),
          pendingTransactions: Number(summaryData.pendingTransactions || 0),
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
          Monitor transactions, wallet activity, providers, and payment status.
        </p>
      </div>

      {error ? (
        <p style={{ color: "#ff7d7d", marginBottom: "18px" }}>{error}</p>
      ) : null}

      <div style={statsGrid}>
        <div style={statCard}>
          <div style={statLabel}>Total Transaction Volume</div>
          <div style={statValue}>
            {summaryLoading ? "..." : `${summary.totalTransactionVolume} EGP`}
          </div>
        </div>

        <div style={statCard}>
          <div style={statLabel}>Wallet Top-Ups</div>
          <div style={statValue}>
            {summaryLoading ? "..." : `${summary.walletTopups} EGP`}
          </div>
        </div>

        <div style={statCard}>
          <div style={statLabel}>Pending Transactions</div>
          <div style={statValue}>
            {summaryLoading ? "..." : `${summary.pendingTransactions} EGP`}
          </div>
        </div>
      </div>

      <div style={tableCard}>
        <div style={filterBar}>
          <div style={filterGroup}>
            <label style={filterLabel}>Status</label>
            <div style={{ position: "relative" }}>
              <button
                onClick={() =>
                  setOpenDropdown((prev) => (prev === "status" ? null : "status"))
                }
                style={customSelectButton}
              >
                <span>{getSelectedLabel(statusOptions, statusFilter)}</span>
                <span style={arrowStyle}>
                  {openDropdown === "status" ? "▴" : "▾"}
                </span>
              </button>

              {openDropdown === "status" && (
                <div style={customDropdownMenu}>
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setOpenDropdown(null);
                      }}
                      style={{
                        ...dropdownItemStyle,
                        ...(statusFilter === option.value
                          ? activeDropdownItemStyle
                          : {}),
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={filterGroup}>
            <label style={filterLabel}>Provider</label>
            <div style={{ position: "relative" }}>
              <button
                onClick={() =>
                  setOpenDropdown((prev) =>
                    prev === "provider" ? null : "provider"
                  )
                }
                style={customSelectButton}
              >
                <span>{getSelectedLabel(providerOptions, providerFilter)}</span>
                <span style={arrowStyle}>
                  {openDropdown === "provider" ? "▴" : "▾"}
                </span>
              </button>

              {openDropdown === "provider" && (
                <div style={customDropdownMenu}>
                  {providerOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setProviderFilter(option.value);
                        setOpenDropdown(null);
                      }}
                      style={{
                        ...dropdownItemStyle,
                        ...(providerFilter === option.value
                          ? activeDropdownItemStyle
                          : {}),
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={filterGroup}>
            <label style={filterLabel}>Entity Type</label>
            <div style={{ position: "relative" }}>
              <button
                onClick={() =>
                  setOpenDropdown((prev) => (prev === "entity" ? null : "entity"))
                }
                style={customSelectButton}
              >
                <span>{getSelectedLabel(entityOptions, entityFilter)}</span>
                <span style={arrowStyle}>
                  {openDropdown === "entity" ? "▴" : "▾"}
                </span>
              </button>

              {openDropdown === "entity" && (
                <div style={customDropdownMenu}>
                  {entityOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setEntityFilter(option.value);
                        setOpenDropdown(null);
                      }}
                      style={{
                        ...dropdownItemStyle,
                        ...(entityFilter === option.value
                          ? activeDropdownItemStyle
                          : {}),
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <p style={{ color: "#F9FAFB", opacity: 0.8 }}>Loading transactions...</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {[
                  "Transaction ID",
                  "User",
                  "Amount",
                  "Type",
                  "Provider",
                  "Entity",
                  "Status",
                  "Provider Status",
                  "Reference",
                  "Date",
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
                  <tr key={tx.id}>
                    <td style={cellStyle}>{tx.id}</td>
                    <td style={cellStyle}>{tx.user}</td>
                    <td style={cellStyle}>
                      {tx.amount} {tx.currency}
                    </td>
                    <td style={cellStyle}>{formatLabel(tx.type)}</td>
                    <td style={cellStyle}>{formatLabel(tx.provider)}</td>
                    <td style={cellStyle}>{formatLabel(tx.entityType)}</td>
                    <td style={cellStyle}>
                      <span style={getStatusStyle(tx.status)}>
                        {formatLabel(tx.status)}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      {tx.providerStatus ? formatLabel(tx.providerStatus) : "-"}
                    </td>
                    <td style={cellStyle}>{tx.reference || "-"}</td>
                    <td style={cellStyle}>{tx.date || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" style={emptyStateStyle}>
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

function getSelectedLabel(options, value) {
  const match = options.find((option) => option.value === value);
  return match ? match.label : "All";
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
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "18px",
  marginBottom: "18px",
};

const statCard = {
  background:
    "linear-gradient(180deg, rgba(20,53,70,0.95) 0%, rgba(16,38,50,0.98) 100%)",
  borderRadius: "24px",
  padding: "22px",
  border: "1px solid rgba(255,255,255,0.05)",
  boxShadow: "0 12px 26px rgba(0,0,0,0.15)",
};

const statLabel = {
  color: "rgba(249,250,251,0.62)",
  fontSize: "15px",
  marginBottom: "12px",
};

const statValue = {
  color: "#F9FAFB",
  fontSize: "34px",
  fontWeight: "800",
};

const tableCard = {
  background:
    "linear-gradient(180deg, rgba(20,53,70,0.95) 0%, rgba(16,38,50,0.98) 100%)",
  borderRadius: "28px",
  padding: "24px",
  border: "1px solid rgba(255,255,255,0.05)",
  boxShadow: "0 12px 26px rgba(0,0,0,0.15)",
  overflowX: "auto",
};

const filterBar = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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

const customSelectButton = {
  width: "100%",
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

const thStyle = {
  textAlign: "left",
  color: "rgba(249,250,251,0.52)",
  fontSize: "13px",
  fontWeight: "600",
  paddingBottom: "14px",
  whiteSpace: "nowrap",
};

const cellStyle = {
  color: "#F9FAFB",
  fontSize: "15px",
  padding: "16px 12px 16px 0",
  borderTop: "1px solid rgba(255,255,255,0.05)",
  whiteSpace: "nowrap",
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
      color: "#F9FAFB",
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
      color: "#F9FAFB",
      fontSize: "13px",
      fontWeight: "700",
    };
  }

  return {
    display: "inline-block",
    padding: "6px 14px",
    borderRadius: "999px",
    background: "rgba(239,68,68,0.16)",
    color: "#F9FAFB",
    fontSize: "13px",
    fontWeight: "700",
  };
};

export default Payments;