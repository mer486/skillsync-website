import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function AdminLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background:
          "radial-gradient(circle at top left, rgba(245,161,0,0.10), transparent 20%), linear-gradient(135deg, #0d1a22 0%, #132733 45%, #183847 100%)",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          padding: "18px 20px 18px 0",
        }}
      >
        <div
          style={{
            minHeight: "100%",
            borderRadius: "34px",
            overflow: "hidden",
            background:
              "linear-gradient(180deg, rgba(15,29,39,0.95) 0%, rgba(16,38,50,0.98) 100%)",
            border: "1px solid rgba(255,255,255,0.05)",
            boxShadow: "0 20px 45px rgba(0,0,0,0.25)",
          }}
        >
          <Navbar />
          <div style={{ padding: "28px" }}>{children}</div>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;