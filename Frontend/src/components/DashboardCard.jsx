function DashboardCard({ title, value, subtitle, accent = "#F5A100" }) {
  return (
    <div
      style={{
        position: "relative",
        background:
          "linear-gradient(180deg, rgba(20,53,70,0.95) 0%, rgba(16,38,50,0.98) 100%)",
        borderRadius: "22px",
        padding: "20px",
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow: "0 10px 22px rgba(0,0,0,0.15)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: "-10px",
          bottom: "-10px",
          width: "100px",
          height: "50px",
          background: `radial-gradient(circle, ${accent}33 0%, transparent 65%)`,
        }}
      />

      <div
        style={{
          color: "rgba(249,250,251,0.65)",
          fontSize: "14px",
          fontWeight: "600",
          marginBottom: "10px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          color: "#F9FAFB",
          fontSize: "32px",
          fontWeight: "800",
          lineHeight: 1,
          marginBottom: "10px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          color: accent,
          fontSize: "14px",
          fontWeight: "600",
        }}
      >
        {subtitle}
      </div>
    </div>
  );
}

export default DashboardCard;