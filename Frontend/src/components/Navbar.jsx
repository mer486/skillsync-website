import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleReload = () => {
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    localStorage.removeItem("adminLoggedIn");
    navigate("/");
  };

  return (
    <div
      style={{
        height: "70px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: "700",
            margin: 0,
            color: "#F9FAFB",
          }}
        >
          SkillSync Dashboard
        </h2>

        <p
          style={{
            margin: "2px 0 0",
            fontSize: "12px",
            color: "rgba(255,255,255,0.55)",
          }}
        >
          Admin Panel
        </p>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <button
          onClick={handleReload}
          title="Reload page"
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "10px",
            border: "1px solid rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.03)",
            color: "#F9FAFB",
            cursor: "pointer",
          }}
        >
          ⟳
        </button>

        <div
          style={{
            padding: "6px 14px",
            borderRadius: "999px",
            background: "rgba(255,255,255,0.05)",
            fontSize: "13px",
            fontWeight: "600",
            color: "#F9FAFB",
          }}
        >
          Admin
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 14px",
            borderRadius: "12px",
            border: "1px solid rgba(245,161,0,0.25)",
            background: "rgba(245,161,0,0.12)",
            color: "#F9FAFB",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Navbar;