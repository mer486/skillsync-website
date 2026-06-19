import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("adminLoggedIn") === "true";
    const token = localStorage.getItem("token");

    if (isLoggedIn && token && token !== "undefined" && token !== "null") {
      navigate("/dashboard");
    }
  }, [navigate]);

  const handleLogin = async () => {
    setError("");

    try {
      const response = await fetch("https://skillsync2-production.up.railway.app/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const token =
        data?.token ||
        data?.data?.token ||
        data?.data?.accessToken ||
        "";

      const user =
        data?.admin ||
        data?.user ||
        data?.data?.admin ||
        data?.data?.user ||
        null;

      if (!token) {
        throw new Error("Login succeeded but token was not returned correctly");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("admin", JSON.stringify(user || {}));
      localStorage.setItem("adminLoggedIn", "true");

      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "24px",
        background:
          "radial-gradient(circle at top left, rgba(245,161,0,0.10), transparent 20%), linear-gradient(135deg, #0d1a22 0%, #132733 45%, #183847 100%)",
      }}
    >
      <div
        style={{
          width: "420px",
          borderRadius: "30px",
          padding: "36px",
          background:
            "linear-gradient(180deg, rgba(20,53,70,0.95) 0%, rgba(16,38,50,0.98) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 20px 45px rgba(0,0,0,0.22)",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "18px",
            }}
          >
            <img
              src="/logo.png"
              alt="SkillSync Logo"
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.06)",
                padding: "6px",
              }}
            />
            <span
              style={{
                color: "#F9FAFB",
                fontSize: "24px",
                fontWeight: "800",
              }}
            >
              SkillSync
            </span>
          </div>

          <h1
            style={{
              color: "#F9FAFB",
              fontSize: "32px",
              fontWeight: "800",
              margin: 0,
            }}
          >
            Admin Login
          </h1>

          <p
            style={{
              marginTop: "8px",
              color: "rgba(249,250,251,0.62)",
              fontSize: "15px",
            }}
          >
            Sign in to access the dashboard.
          </p>
        </div>

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "15px 16px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.03)",
            color: "#F9FAFB",
            fontSize: "15px",
            marginBottom: "14px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "15px 16px",
            borderRadius: "14px",
            border: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.03)",
            color: "#F9FAFB",
            fontSize: "15px",
            marginBottom: "18px",
            outline: "none",
            boxSizing: "border-box",
          }}
        />

        {error && (
          <p
            style={{
              color: "#FCA5A5",
              fontSize: "14px",
              marginTop: "0",
              marginBottom: "14px",
            }}
          >
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "15px",
            border: "none",
            borderRadius: "14px",
            background: "linear-gradient(180deg, #F5A100 0%, #D68C00 100%)",
            color: "#102632",
            fontSize: "16px",
            fontWeight: "800",
            cursor: "pointer",
            boxShadow: "0 14px 24px rgba(245,161,0,0.18)",
          }}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Login;
