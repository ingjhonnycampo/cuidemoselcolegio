import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const IconTitle = () => (
  <svg
    width={36}
    height={36}
    viewBox="0 0 24 24"
    fill="none"
    stroke="#2e7d32"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ marginRight: 10 }}
    aria-hidden="true"
  >
    <circle cx={12} cy={12} r={10} />
    <path d="M12 16v-4M12 8h.01" />
    <path d="M2 12l5 5L22 4" />
  </svg>
);

const IconRetos = ({ hovered }) => (
  <svg
    width={80}
    height={80}
    viewBox="0 0 24 24"
    fill={hovered ? "#ffd54f" : "none"}
    stroke="#ffb300"
    strokeWidth={hovered ? 4 : 3}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ transition: "all 0.3s ease" }}
  >
    <polygon points="12 2 2 7 2 17 12 22 22 17 22 7 12 2" />
    <line x1={12} y1={22} x2={12} y2={12} />
  </svg>
);

const IconCursos = ({ hovered }) => (
  <svg
    width={80}
    height={80}
    viewBox="0 0 24 24"
    fill={hovered ? "#81c784" : "none"}
    stroke="#43a047"
    strokeWidth={hovered ? 4 : 3}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ transition: "all 0.3s ease" }}
  >
    <rect x={2} y={7} width={20} height={14} rx={2} ry={2} />
    <path d="M16 3v4M8 3v4M3 11h18" stroke={hovered ? "#2e7d32" : "#43a047"} strokeWidth={2} />
  </svg>
);

const IconSedes = ({ hovered }) => (
  <svg
    width={80}
    height={80}
    viewBox="0 0 24 24"
    fill={hovered ? "#8e24aa" : "none"}
    stroke="#6a1b9a"
    strokeWidth={hovered ? 4 : 3}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ transition: "all 0.3s ease" }}
  >
    <path d="M12 3L2 7v14h20V7l-10-4z" />
    <path d="M12 22V12" />
    <path d="M7 17h10" />
  </svg>
);

const IconGeneral = ({ hovered }) => (
  <svg
    width={80}
    height={80}
    viewBox="0 0 24 24"
    fill={hovered ? "#90caf9" : "none"}
    stroke="#4a90e2"
    strokeWidth={hovered ? 4 : 3}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ transition: "all 0.3s ease" }}
  >
    <circle cx={12} cy={12} r={10} />
    <line x1={12} y1={6} x2={12} y2={12} />
    <line x1={12} y1={12} x2={16} y2={14} />
  </svg>
);

export default function ResultadosMenu() {
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const navigate = useNavigate();

  const usuario = useMemo(() => {
    const u = localStorage.getItem("usuario");
    return u ? JSON.parse(u) : null;
  }, []);

  const handleMouseEnter = (btn) => setHoveredBtn(btn);
  const handleMouseLeave = () => setHoveredBtn(null);

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div style={styles.fondo}>
      <div style={styles.container}>
        <h1 style={styles.pageTitle}>
          <IconTitle />
          EcoRetos - Resultados
        </h1>
        {usuario && (
          <p style={styles.userInfo}>
            Usuario: {usuario.nombre} | Rol: {usuario.rol || "Usuario"}
          </p>
        )}
        <div style={styles.optionsRow}>
          <button
            style={{
              ...styles.optionCard,
              borderColor: "#ffb300",
              color: "#ffb300",
              transform: hoveredBtn === "porRetos" ? "scale(1.1)" : "scale(1)",
              boxShadow: hoveredBtn === "porRetos" ? "0 8px 20px rgba(255, 181, 0, 0.5)" : "none",
              transition: "all 0.3s ease",
            }}
            onClick={() => handleNavigate("/resultados/por-retos")}
            onMouseEnter={() => handleMouseEnter("porRetos")}
            onMouseLeave={handleMouseLeave}
            aria-label="Ver resultados por retos"
          >
            <IconRetos hovered={hoveredBtn === "porRetos"} />
            <span style={styles.optionLabel}>Resultados por Retos</span>
          </button>

          <button
            style={{
              ...styles.optionCard,
              borderColor: "#43a047",
              color: "#43a047",
              transform: hoveredBtn === "porCursos" ? "scale(1.1)" : "scale(1)",
              boxShadow: hoveredBtn === "porCursos" ? "0 8px 20px rgba(67, 160, 71, 0.5)" : "none",
              transition: "all 0.3s ease",
            }}
            onClick={() => handleNavigate("/resultados/por-cursos")}
            onMouseEnter={() => handleMouseEnter("porCursos")}
            onMouseLeave={handleMouseLeave}
            aria-label="Ver desempeño por cursos"
          >
            <IconCursos hovered={hoveredBtn === "porCursos"} />
            <span style={styles.optionLabel}>Desempeño por Cursos</span>
          </button>

          {/* NUEVO BOTÓN "Desempeño por Sedes" colocado ANTES de "Resultados Generales" */}
          <button
            style={{
              ...styles.optionCard,
              borderColor: "#6a1b9a",
              color: "#8e24aa",
              transform: hoveredBtn === "porSedes" ? "scale(1.1)" : "scale(1)",
              boxShadow: hoveredBtn === "porSedes" ? "0 8px 20px rgba(142, 36, 170, 0.5)" : "none",
              transition: "all 0.3s ease",
            }}
            onClick={() => handleNavigate("/resultados/por-sedes")}
            onMouseEnter={() => handleMouseEnter("porSedes")}
            onMouseLeave={handleMouseLeave}
            aria-label="Ver desempeño por sedes"
          >
            <IconSedes hovered={hoveredBtn === "porSedes"} />
            <span style={styles.optionLabel}>Desempeño por Sedes</span>
          </button>

          <button
            style={{
              ...styles.optionCard,
              borderColor: "#4a90e2",
              color: "#4a90e2",
              transform: hoveredBtn === "generales" ? "scale(1.1)" : "scale(1)",
              boxShadow: hoveredBtn === "generales" ? "0 8px 20px rgba(74, 144, 226, 0.5)" : "none",
              transition: "all 0.3s ease",
            }}
            onClick={() => handleNavigate("/resultados/generales")}
            onMouseEnter={() => handleMouseEnter("generales")}
            onMouseLeave={handleMouseLeave}
            aria-label="Ver resultados generales"
          >
            <IconGeneral hovered={hoveredBtn === "generales"} />
            <span style={styles.optionLabel}>Resultados Generales</span>
          </button>
        </div>
        <button style={styles.pageReturnButton} onClick={() => window.history.back()}>
          ← Regresar
        </button>
      </div>
    </div>
  );
}

const styles = {
  fondo: {
    minHeight: "100vh",
    width: "100vw",
    background:
      "linear-gradient(rgba(168,224,168,0.55), rgba(86,171,86,0.45)), url('/fondo-ambiental.jpg') no-repeat center center fixed",
    backgroundSize: "cover",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 1000,
    backgroundColor: "rgba(255, 255, 255, 0.97)",
    borderRadius: 20,
    padding: 40,
    boxShadow: "0 0 30px 0 rgba(60, 173, 60, 0.65)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#1b3a1b",
    display: "flex",
    flexDirection: "column",
    gap: 30,
    position: "relative",
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: "#2e7d32",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  userInfo: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: 600,
    color: "#555",
  },
  optionsRow: {
    display: "flex",
    justifyContent: "space-evenly",
    flexWrap: "wrap",
    gap: 30,
  },
  optionCard: {
    borderRadius: 24,
    border: "3px solid",
    width: 270,
    height: 260,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    fontWeight: 700,
    fontSize: 22,
    textTransform: "uppercase",
    userSelect: "none",
    transition: "all 0.3s ease",
    backgroundColor: "#f7fff9",
  },
  optionLabel: {
    textAlign: "center",
  },
  pageReturnButton: {
    marginTop: 40,
    padding: "10px 36px",
    backgroundColor: "#2e7d32",
    border: "none",
    borderRadius: 30,
    color: "white",
    fontWeight: 800,
    fontSize: 18,
    cursor: "pointer",
    alignSelf: "center",
    boxShadow: "0 5px 15px rgba(0,0,0,0.25)",
    transition: "background-color 0.3s ease",
  },
};
