import { useEffect, useState } from "react";
import AdminLayout from "../layouts/AdminLayout";

function CareerPaths() {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalType, setModalType] = useState(null); // "add" | "edit" | "delete" | null
  const [selectedCareer, setSelectedCareer] = useState(null);

  const [formData, setFormData] = useState({
    path: "",
    skills: "",
    resources: "",
  });

  const token = localStorage.getItem("token");

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  const fetchCareerPaths = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/careerpaths", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load career paths");
      }

      setCareers(data);
    } catch (err) {
      setError(err.message || "Failed to load career paths");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareerPaths();
  }, []);

  const openAddModal = () => {
    setFormData({
      path: "",
      skills: "",
      resources: "",
    });
    setSelectedCareer(null);
    setModalType("add");
  };

  const openEditModal = (career) => {
    setSelectedCareer(career);
    setFormData({
      path: career.path || "",
      skills: career.skills || "",
      resources: career.resources || "",
    });
    setModalType("edit");
  };

  const openDeleteModal = (career) => {
    setSelectedCareer(career);
    setModalType("delete");
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedCareer(null);
    setFormData({
      path: "",
      skills: "",
      resources: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddCareerPath = async () => {
    if (!formData.path || !formData.skills || !formData.resources) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/careerpaths", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to add career path");
      }

      setCareers((prev) => [data, ...prev]);
      closeModal();
    } catch (err) {
      alert(err.message || "Failed to add career path");
    }
  };

  const handleEditCareerPath = async () => {
    if (!selectedCareer) return;

    if (!formData.path || !formData.skills || !formData.resources) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/careerpaths/${selectedCareer._id}`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update career path");
      }

      setCareers((prev) =>
        prev.map((item) => (item._id === selectedCareer._id ? data : item))
      );

      closeModal();
    } catch (err) {
      alert(err.message || "Failed to update career path");
    }
  };

  const handleDeleteCareerPath = async () => {
    if (!selectedCareer) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/careerpaths/${selectedCareer._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete career path");
      }

      setCareers((prev) =>
        prev.filter((item) => item._id !== selectedCareer._id)
      );

      closeModal();
    } catch (err) {
      alert(err.message || "Failed to delete career path");
    }
  };

  return (
    <AdminLayout>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "26px", margin: 0 }}>Career Paths & Skills</h1>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "14px" }}>
          Manage career tracks, required skills, and learning resources.
        </p>
      </div>

      <div
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "20px",
          padding: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3 style={{ fontSize: "18px", margin: 0 }}>Career Paths</h3>

          <button
            onClick={openAddModal}
            style={{
              padding: "10px 16px",
              borderRadius: "12px",
              border: "none",
              background: "#F5A100",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Add Career Path
          </button>
        </div>

        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.75)" }}>
            Loading career paths...
          </p>
        ) : error ? (
          <p style={{ color: "#ff7d7d" }}>{error}</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)" }}>
                <th align="left">Career Path</th>
                <th align="left">Required Skills</th>
                <th align="left">Resources</th>
                <th align="left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {careers.map((career) => (
                <tr
                  key={career._id}
                  style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
                >
                  <td style={{ padding: "14px 0", fontWeight: "600" }}>
                    {career.path}
                  </td>

                  <td style={{ color: "rgba(255,255,255,0.75)" }}>
                    {career.skills}
                  </td>

                  <td style={{ color: "rgba(255,255,255,0.75)" }}>
                    {career.resources}
                  </td>

                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        onClick={() => openEditModal(career)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "10px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "transparent",
                          color: "#fff",
                          cursor: "pointer",
                        }}
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => openDeleteModal(career)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: "10px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          background: "transparent",
                          color: "#ff7d7d",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {careers.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    style={{
                      padding: "18px 0",
                      color: "rgba(255,255,255,0.6)",
                    }}
                  >
                    No career paths found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modalType && (
        <div
          onClick={closeModal}
          style={{
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
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: modalType === "delete" ? "460px" : "560px",
              borderRadius: "24px",
              overflow: "hidden",
              background:
                "linear-gradient(180deg, rgba(20,53,70,0.97) 0%, rgba(16,38,50,0.99) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 60px rgba(0,0,0,0.35)",
              animation: "modalSlide 0.25s ease",
            }}
          >
            {modalType !== "delete" ? (
              <>
                <div style={{ padding: "28px 28px 18px 28px", position: "relative" }}>
                  <button
                    onClick={closeModal}
                    style={{
                      position: "absolute",
                      top: "18px",
                      right: "18px",
                      background: "transparent",
                      border: "none",
                      color: "rgba(255,255,255,0.55)",
                      fontSize: "34px",
                      lineHeight: 1,
                      cursor: "pointer",
                    }}
                  >
                    ×
                  </button>

                  <h2
                    style={{
                      margin: "4px 0 28px 0",
                      color: "#F9FAFB",
                      fontSize: "24px",
                      fontWeight: "800",
                    }}
                  >
                    {modalType === "add" ? "Add Career Path" : "Edit Career Path"}
                  </h2>

                  <div style={{ marginBottom: "22px" }}>
                    <label
                      style={{
                        display: "block",
                        color: "#F9FAFB",
                        fontSize: "14px",
                        marginBottom: "10px",
                      }}
                    >
                      Career Path Name
                    </label>
                    <input
                      type="text"
                      name="path"
                      placeholder="Career Path Name"
                      value={formData.path}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "16px 18px",
                        borderRadius: "14px",
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.03)",
                        color: "#F9FAFB",
                        fontSize: "15px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "22px" }}>
                    <label
                      style={{
                        display: "block",
                        color: "#F9FAFB",
                        fontSize: "14px",
                        marginBottom: "10px",
                      }}
                    >
                      Required Skills
                    </label>
                    <input
                      type="text"
                      name="skills"
                      placeholder="Required Skills"
                      value={formData.skills}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "16px 18px",
                        borderRadius: "14px",
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.03)",
                        color: "#F9FAFB",
                        fontSize: "15px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "8px" }}>
                    <label
                      style={{
                        display: "block",
                        color: "#F9FAFB",
                        fontSize: "14px",
                        marginBottom: "10px",
                      }}
                    >
                      Learning Resources
                    </label>
                    <input
                      type="text"
                      name="resources"
                      placeholder="Learning Resources"
                      value={formData.resources}
                      onChange={handleChange}
                      style={{
                        width: "100%",
                        padding: "16px 18px",
                        borderRadius: "14px",
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.03)",
                        color: "#F9FAFB",
                        fontSize: "15px",
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
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
                  <button
                    onClick={modalType === "add" ? handleAddCareerPath : handleEditCareerPath}
                    style={{
                      padding: "12px 32px",
                      borderRadius: "14px",
                      border: "none",
                      background: "linear-gradient(180deg, #F5A100 0%, #D68C00 100%)",
                      color: "#102632",
                      fontSize: "15px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    {modalType === "add" ? "Add" : "Save"}
                  </button>

                  <button
                    onClick={closeModal}
                    style={{
                      padding: "12px 24px",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.02)",
                      color: "#F9FAFB",
                      fontSize: "15px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ padding: "28px", position: "relative" }}>
                  <button
                    onClick={closeModal}
                    style={{
                      position: "absolute",
                      top: "18px",
                      right: "18px",
                      background: "transparent",
                      border: "none",
                      color: "rgba(255,255,255,0.55)",
                      fontSize: "34px",
                      lineHeight: 1,
                      cursor: "pointer",
                    }}
                  >
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
                    Delete Career Path
                  </h2>

                  <p
                    style={{
                      margin: 0,
                      color: "rgba(249,250,251,0.72)",
                      fontSize: "15px",
                      lineHeight: 1.7,
                    }}
                  >
                    Are you sure you want to delete{" "}
                    <span style={{ color: "#F9FAFB", fontWeight: "700" }}>
                      {selectedCareer?.path}
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
                  <button
                    onClick={handleDeleteCareerPath}
                    style={{
                      padding: "12px 28px",
                      borderRadius: "14px",
                      border: "none",
                      background: "linear-gradient(180deg, #ff7d7d 0%, #e35d5d 100%)",
                      color: "#fff",
                      fontSize: "15px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>

                  <button
                    onClick={closeModal}
                    style={{
                      padding: "12px 24px",
                      borderRadius: "14px",
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.02)",
                      color: "#F9FAFB",
                      fontSize: "15px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>

          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }

              @keyframes modalSlide {
                from {
                  opacity: 0;
                  transform: translateY(14px) scale(0.98);
                }
                to {
                  opacity: 1;
                  transform: translateY(0) scale(1);
                }
              }
            `}
          </style>
        </div>
      )}
    </AdminLayout>
  );
}

export default CareerPaths;