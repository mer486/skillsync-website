import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

function Settings() {
  const [settings, setSettings] = useState({
    enableNotifications: false,
    paymentGateway: false,
    mentorVerification: false,
    supportEmail: "",
    walletEnabled: false,
    fawryEnabled: false,
    platformFeePercent: 0,
    minDurationMinutes: 15,
    maxDurationMinutes: 60,
    userJoinGraceMinutes: 5,
    eventsEnabled: false,
    complaintsEnabled: false,
  });

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError("");

        const [settingsResponse, logsResponse] = await Promise.all([
          fetch("http://localhost:5000/api/settings", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch("http://localhost:5000/api/settings/security-logs", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const settingsData = await settingsResponse.json();
        const logsData = await logsResponse.json();

        if (!settingsResponse.ok) {
          throw new Error(settingsData.message || "Failed to load settings");
        }

        if (!logsResponse.ok) {
          throw new Error(logsData.message || "Failed to load security logs");
        }

        setSettings({
          enableNotifications: Boolean(settingsData.enableNotifications),
          paymentGateway: Boolean(settingsData.paymentGateway),
          mentorVerification: Boolean(settingsData.mentorVerification),
          supportEmail: settingsData.supportEmail || "",
          walletEnabled: Boolean(settingsData.walletEnabled),
          fawryEnabled: Boolean(settingsData.fawryEnabled),
          platformFeePercent: Number(settingsData.platformFeePercent || 0),
          minDurationMinutes: Number(settingsData.minDurationMinutes || 15),
          maxDurationMinutes: Number(settingsData.maxDurationMinutes || 60),
          userJoinGraceMinutes: Number(settingsData.userJoinGraceMinutes || 5),
          eventsEnabled: Boolean(settingsData.eventsEnabled),
          complaintsEnabled: Boolean(settingsData.complaintsEnabled),
        });

        setLogs(Array.isArray(logsData) ? logsData : []);
      } catch (err) {
        setError(err.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [token]);

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleInputChange = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch("http://localhost:5000/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...settings,
          platformFeePercent: Number(settings.platformFeePercent || 0),
          minDurationMinutes: Number(settings.minDurationMinutes || 15),
          maxDurationMinutes: Number(settings.maxDurationMinutes || 60),
          userJoinGraceMinutes: Number(settings.userJoinGraceMinutes || 5),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to save settings");
      }

      setSettings({
        enableNotifications: Boolean(data.enableNotifications),
        paymentGateway: Boolean(data.paymentGateway),
        mentorVerification: Boolean(data.mentorVerification),
        supportEmail: data.supportEmail || "",
        walletEnabled: Boolean(data.walletEnabled),
        fawryEnabled: Boolean(data.fawryEnabled),
        platformFeePercent: Number(data.platformFeePercent || 0),
        minDurationMinutes: Number(data.minDurationMinutes || 15),
        maxDurationMinutes: Number(data.maxDurationMinutes || 60),
        userJoinGraceMinutes: Number(data.userJoinGraceMinutes || 5),
        eventsEnabled: Boolean(data.eventsEnabled),
        complaintsEnabled: Boolean(data.complaintsEnabled),
      });

      setSuccessMessage("Settings updated successfully.");
    } catch (err) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: "22px" }}>
        <h1 style={{ color: "#F9FAFB", fontSize: "32px", fontWeight: "800", margin: 0 }}>
          Settings & Security
        </h1>
        <p style={{ color: "rgba(249,250,251,0.6)", marginTop: "8px", fontSize: "15px" }}>
          Manage admin preferences, platform controls, and security logs.
        </p>
      </div>

      {loading ? (
        <p style={{ color: "#F9FAFB", opacity: 0.8 }}>Loading settings...</p>
      ) : (
        <>
          {error ? <p style={{ color: "#ff7d7d", marginBottom: "16px" }}>{error}</p> : null}
          {successMessage ? (
            <p style={{ color: "#86efac", marginBottom: "16px" }}>{successMessage}</p>
          ) : null}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "18px",
            }}
          >
            <div style={cardStyle}>
              <h3 style={titleStyle}>Platform Settings</h3>

              <div style={{ display: "grid", gap: "14px", marginBottom: "18px" }}>
                <div style={rowStyle}>
                  <span>Enable Notifications</span>
                  <button style={toggleStyle} onClick={() => handleToggle("enableNotifications")}>
                    {settings.enableNotifications ? "ON" : "OFF"}
                  </button>
                </div>

                <div style={rowStyle}>
                  <span>Payment Gateway</span>
                  <button style={toggleStyle} onClick={() => handleToggle("paymentGateway")}>
                    {settings.paymentGateway ? "Configured" : "Disabled"}
                  </button>
                </div>

                <div style={rowStyle}>
                  <span>Mentor Verification</span>
                  <button style={toggleStyle} onClick={() => handleToggle("mentorVerification")}>
                    {settings.mentorVerification ? "Active" : "Inactive"}
                  </button>
                </div>

                <div style={rowStyle}>
                  <span>Wallet Payments</span>
                  <button style={toggleStyle} onClick={() => handleToggle("walletEnabled")}>
                    {settings.walletEnabled ? "ON" : "OFF"}
                  </button>
                </div>

                <div style={rowStyle}>
                  <span>Events</span>
                  <button style={toggleStyle} onClick={() => handleToggle("eventsEnabled")}>
                    {settings.eventsEnabled ? "ON" : "OFF"}
                  </button>
                </div>

                <div style={rowStyle}>
                  <span>Complaints</span>
                  <button style={toggleStyle} onClick={() => handleToggle("complaintsEnabled")}>
                    {settings.complaintsEnabled ? "ON" : "OFF"}
                  </button>
                </div>
              </div>

              <div style={{ display: "grid", gap: "12px" }}>
                <label style={labelStyle}>
                  Support Email
                  <input
                    style={inputStyle}
                    value={settings.supportEmail}
                    onChange={(e) => handleInputChange("supportEmail", e.target.value)}
                  />
                </label>

                <label style={labelStyle}>
                  Platform Fee %
                  <input
                    type="number"
                    style={inputStyle}
                    value={settings.platformFeePercent}
                    onChange={(e) => handleInputChange("platformFeePercent", e.target.value)}
                  />
                </label>

                <label style={labelStyle}>
                  Min Session Duration
                  <input
                    type="number"
                    style={inputStyle}
                    value={settings.minDurationMinutes}
                    onChange={(e) => handleInputChange("minDurationMinutes", e.target.value)}
                  />
                </label>

                <label style={labelStyle}>
                  Max Session Duration
                  <input
                    type="number"
                    style={inputStyle}
                    value={settings.maxDurationMinutes}
                    onChange={(e) => handleInputChange("maxDurationMinutes", e.target.value)}
                  />
                </label>

                <label style={labelStyle}>
                  User Join Grace Minutes
                  <input
                    type="number"
                    style={inputStyle}
                    value={settings.userJoinGraceMinutes}
                    onChange={(e) => handleInputChange("userJoinGraceMinutes", e.target.value)}
                  />
                </label>

                <button onClick={handleSave} style={saveButtonStyle} disabled={saving}>
                  {saving ? "Saving..." : "Save Settings"}
                </button>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={titleStyle}>Security Logs</h3>

              <div style={{ display: "grid", gap: "12px" }}>
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div key={index} style={logStyle}>
                      <div>{log.message}</div>
                      <div
                        style={{
                          color: "rgba(249,250,251,0.55)",
                          fontSize: "12px",
                          marginTop: "6px",
                        }}
                      >
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : ""}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={logStyle}>No security logs found.</div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

const cardStyle = {
  background: "linear-gradient(180deg, rgba(20,53,70,0.95) 0%, rgba(16,38,50,0.98) 100%)",
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

const rowStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: "18px",
  padding: "16px 18px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "#F9FAFB",
};

const toggleStyle = {
  padding: "6px 14px",
  borderRadius: "999px",
  background: "rgba(245,161,0,0.16)",
  color: "#F9FAFB",
  fontSize: "13px",
  fontWeight: "700",
  border: "none",
  cursor: "pointer",
};

const logStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.05)",
  borderRadius: "18px",
  padding: "16px 18px",
  color: "rgba(249,250,251,0.8)",
};

const labelStyle = {
  display: "grid",
  gap: "8px",
  color: "#F9FAFB",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.08)",
  background: "rgba(255,255,255,0.03)",
  color: "#F9FAFB",
  outline: "none",
  fontSize: "14px",
  boxSizing: "border-box",
};

const saveButtonStyle = {
  padding: "12px 24px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(180deg, #F5A100 0%, #D68C00 100%)",
  color: "#102632",
  fontSize: "15px",
  fontWeight: "800",
  cursor: "pointer",
};

export default Settings;