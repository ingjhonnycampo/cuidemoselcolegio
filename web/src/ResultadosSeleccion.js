import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Barra Synergy para usuario
function IconAvatar() {
  return (
    <svg height={56} width={56} viewBox="0 0 56 56" fill="none">
      <circle cx={28} cy={22} r={14} fill="#119e8e" />
      <ellipse cx={28} cy={39.5} rx={20} ry={10.5} fill="#eafcf7" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#faab34">
      <path d="M12 2l2.092 6.426H20.5l-5.204 3.783L17.181 20 12 15.549 6.819 20l1.885-7.791L3.5 8.426h6.408z"/>
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="24" r="19" stroke="#ffcacf" strokeWidth="2" fill="#fff"/>
      <rect x="13" y="14" width="14" height="20" rx="6" stroke="#e74c3c" strokeWidth="2"/>
      <path d="M32 24h7M37 29l4-5-4-5" stroke="#e74c3c" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function BarraUsuarioResultados({ usuario, onLogout }) {
  if (!usuario) return null;
  return (
    <div style={barraStyles.fondoBarra}>
      <div style={barraStyles.wrapAvatar}><IconAvatar /></div>
      <div style={barraStyles.userData}>
        <span style={barraStyles.nombre}>{usuario.nombre}</span>
        {usuario.rol && (
          <span style={barraStyles.rol}>
            <IconStar />
            <span style={{ fontStyle: "italic", color: "#e39216", marginLeft: 3, fontWeight: 600 }}>{usuario.rol}</span>
          </span>
        )}
      </div>
      <button
        style={barraStyles.logoutBtn}
        onClick={onLogout}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
      >
        <IconLogout />
      </button>
    </div>
  );
}
const barraStyles = {
  fondoBarra: {
    width: "100%",
    maxWidth: 900,
    margin: "0 auto 30px auto",
    background: "linear-gradient(90deg, #e0fefa 60%, #fffbe5 100%)",
    boxShadow: "0 2px 22px #8eeacc44",
    borderRadius: 30,
    display: "flex",
    alignItems: "center",
    position: "relative",
    minHeight: 72,
    padding: "8px 40px 8px 18px",
    transition: "box-shadow .2s",
    boxSizing: "border-box",
  },
  wrapAvatar: {
    marginRight: 15,
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  userData: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minWidth: 0,
    justifyContent: "center",
  },
  nombre: {
    fontWeight: 800,
    color: "#0c978c",
    fontSize: 18.5,
    lineHeight: 1.14,
    textShadow: "0 1px 0 #e0fcfa66",
    letterSpacing: 0.33,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  rol: {
    display: "flex",
    alignItems: "center",
    fontWeight: 700,
    fontSize: 15.3,
    color: "#e39216",
    marginTop: 3,
    marginLeft: 1,
    gap: 2,
  },
  logoutBtn: {
    position: "relative",
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    borderRadius: "50%",
    transition: "background .17s",
    boxShadow: "0 0 7px #e74c3c29",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 20,
    flexShrink: 0,
  }
};

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

// Modal elegante para confirmar cierre
function ModalConfirm({ visible, onClose, onConfirm }) {
  if (!visible) return null;
  return (
    <div style={modalStyles.backdrop} role="dialog" aria-modal="true" aria-labelledby="modalTitle" aria-describedby="modalDesc">
      <div style={modalStyles.modal}>
        <h2 id="modalTitle" style={modalStyles.title}>¿Estás seguro que quieres cerrar sesión?</h2>
        <div id="modalDesc" style={modalStyles.desc}>Se cerrará tu sesión actual.</div>
        <div style={modalStyles.buttons}>
          <button style={modalStyles.confirmBtn} onClick={onConfirm}>Sí, cerrar sesión</button>
          <button style={modalStyles.cancelBtn} onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

const modalStyles = {
  backdrop: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
  },
  modal: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    maxWidth: 380,
    width: "90%",
    boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
    textAlign: "center",
  },
  title: {
    marginBottom: 10,
    color: "#2e7d32",
  },
  desc: {
    marginBottom: 24,
    color: "#555",
  },
  buttons: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#2e7d32",
    color: "#fff",
    fontWeight: "700",
    padding: "10px 0",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#ccc",
    color: "#444",
    fontWeight: "700",
    padding: "10px 0",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
  },
};

export default function ResultadosMenu() {
  const [hoveredBtn, setHoveredBtn] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();
  const usuario = useMemo(() => {
    const u = localStorage.getItem("usuario");
    return u ? JSON.parse(u) : null;
  }, []);

  const handleMouseEnter = (btn) => setHoveredBtn(btn);
  const handleMouseLeave = () => setHoveredBtn(null);
  const handleNavigate = (path) => navigate(path);
  const handleLogoutClick = () => setModalVisible(true);
  const handleConfirmLogout = () => {
    setModalVisible(false);
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };
  const handleCancelLogout = () => setModalVisible(false);

  return (
    <div style={styles.fondo}>
      <div style={styles.container}>
        <BarraUsuarioResultados usuario={usuario} onLogout={handleLogoutClick} />
        <h1 style={styles.pageTitle}>
          <IconTitle />
          EcoRetos - Resultados
        </h1>
        <div style={styles.optionsRow} className="resultados-eco-row">
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
      <ModalConfirm visible={modalVisible} onClose={handleCancelLogout} onConfirm={handleConfirmLogout} />
      <style>{`
        @media (max-width: 650px) {
          .resultados-eco-row {
            flex-direction: column !important;
            gap: 20px !important;
            align-items: center !important;
            justify-content: center !important;
            display: flex !important;
          }
          button[style*="optionCard"] {
            width: 98vw !important;
            min-height: 220px !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          h1 {
            text-align: center !important;
          }
        }
        @media (max-width: 900px) {
          .resultados-eco-row {
            flex-direction: column !important;
            gap: 20px !important;
            align-items: center !important;
          }
          button[style*="optionCard"] {
            width: 98vw !important;
            min-height: 220px !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  fondo: {
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(rgba(168,224,168,0.55), rgba(86,171,86,0.45)), url('/fondo-ambiental.jpg') no-repeat center center fixed",
    backgroundSize: "cover",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    maxWidth: 900,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 40,
    boxShadow: "0 10px 60px rgb(152 196 156 / 0.45)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#1b5d3b",
    display: "flex",
    flexDirection: "column",
    gap: 25,
    position: "relative",
  },
  pageTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: "#1b5d3b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  optionsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 20,
    justifyContent: "center",
  },
  optionCard: {
    borderRadius: 24,
    border: "3px solid",
    width: 270,
    height: 220,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    fontWeight: 700,
    fontSize: 19,
    textTransform: "uppercase",
    userSelect: "none",
    padding: 10,
    background: "#d1f7e6",
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: "auto",
    marginRight: "auto",
  },
  optionLabel: {
    textAlign: "center",
  },
  pageReturnButton: {
    marginTop: 40,
    padding: "10px 36px",
    backgroundColor: "#4caf50",
    border: "none",
    borderRadius: 60,
    color: "white",
    fontWeight: 700,
    fontSize: 18,
    cursor: "pointer",
    alignSelf: "center",
    boxShadow: "0 6px 20px rgb(26 69 14 / 0.34)",
  },
};
