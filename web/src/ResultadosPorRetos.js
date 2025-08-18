import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ========== ICONOS SVG PARA TÍTULOS ==========
const IconLista = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ marginRight: 10, verticalAlign: "middle" }} aria-hidden="true">
    <circle cx="12" cy="12" r="10" stroke="#4eac6d" strokeWidth="2" />
    <path d="M8 12h8M8 16h5M8 8h8" stroke="#4eac6d" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconPodio = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8, verticalAlign: "middle" }} aria-hidden="true">
    <rect x="2" y="16" width="6" height="5" rx="2" fill="#ffd700" stroke="#bbaa33" strokeWidth="1" />
    <rect x="9" y="10" width="6" height="11" rx="2" fill="#b8dafb" stroke="#3773c6" strokeWidth="1" />
    <rect x="16" y="13" width="6" height="8" rx="2" fill="#cd7f32" stroke="#995e26" strokeWidth="1" />
    <circle cx="12" cy="7" r="3" fill="#43a047" stroke="#267d53" strokeWidth="1.2" />
    <path d="M12 5.5v-2" stroke="#397087" strokeWidth="1.3" />
  </svg>
);
const IconTrofeo = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ marginRight: 8, verticalAlign: "middle" }} aria-hidden="true">
    <path d="M9 19c0 1.105.895 2 2 2s2-.895 2-2" stroke="#f9820e" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="12" cy="10" rx="6" ry="7" fill="#ffd700" stroke="#eec308" strokeWidth="1.1" />
    <path d="M5 7a3 3 0 0 1-3 3" stroke="#8bd57c" strokeWidth="1.2" />
    <path d="M19 7a3 3 0 0 0 3 3" stroke="#8bd57c" strokeWidth="1.2" />
    <rect x="7" y="17" width="10" height="2" rx="1" fill="#795548" />
  </svg>
);

// ========== SPINNER: RELOJ GIRATORIO ==========
const Spinner = () => (
  <div style={spinnerStyles.spinnerContainer}>
    <svg
      width={80}
      height={80}
      viewBox="0 0 40 40"
      style={{
        display: "block",
        margin: "0 auto",
        animation: "relojspin 1s linear infinite"
      }}
      aria-label="Cargando"
      role="alert"
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke="#e0e0e0"
        strokeWidth="4"
        fill="none"
      />
      <path
        d="M20 20V7"
        stroke="#267d53"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="20" cy="20" r="3.6" fill="#267d53" />
    </svg>
    <span style={spinnerStyles.loadingText}>Cargando...</span>
    <style>{`
      @keyframes relojspin {
        0% { transform: rotate(0deg);}
        100% { transform: rotate(360deg);}
      }
    `}</style>
  </div>
);

const spinnerStyles = {
  spinnerContainer: {
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "rgba(255,255,255,0.85)",
    zIndex: 99,
  },
  loadingText: {
    fontWeight: 700,
    color: "#267d53",
    marginTop: 18,
    fontSize: 22,
    fontFamily: "Segoe UI, Arial, sans-serif"
  }
};


// ========== COMPONENTE MEDALLAS ==========
const Medal = ({ type }) => {
  const colors = {
    oro: "#ffd700",
    plata: "#c0c0c0",
    bronce: "#cd7f32",
  };
  const color = colors[type] || "#999";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={color} aria-hidden="true" style={{ marginLeft: 5, verticalAlign: "middle" }}>
      <circle cx="12" cy="12" r="10" stroke="#444" strokeWidth="1" />
      <path d="M7 14l3-3 2 2 5-5" stroke="#444" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};


// ========== COMPONENTE USUARIO ==========
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
      <path d="M12 2l2.092 6.426H20.5l-5.204 3.783L17.181 20 12 15.549 6.819 20l1.885-7.791L3.5 8.426h6.408z" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
      <circle cx={24} cy={24} r={19} stroke="#ffcacf" strokeWidth="2" fill="#fff" />
      <rect x={13} y={14} width={14} height={20} rx={6} stroke="#e74c3c" strokeWidth="2" />
      <path d="M32 24h7M37 29l4-5-4-5" stroke="#e74c3c" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
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
      <button style={barraStyles.logoutBtn} onClick={onLogout} title="Cerrar sesión" aria-label="Cerrar sesión">
        <IconLogout />
      </button>
    </div>
  );
}
const barraStyles = { // ...SIN CAMBIOS...
  fondoBarra: {
    width: "100%",
    maxWidth: 980,
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
// ===== FUNCIONES AUXILIARES =====
function calcularEstado(fechaInicio, fechaCierre) {
  const ahora = new Date();
  const inicio = new Date(fechaInicio);
  const cierre = new Date(fechaCierre + "T23:59:59");
  if (ahora < inicio) return "Abierto";
  if (ahora > cierre) return "Cerrado";
  return "Activo";
}

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
  title: {marginBottom: 10,color: "#2e7d32",},
  desc: {marginBottom: 24,color: "#555",},
  buttons: {display: "flex",justifyContent: "space-between",gap: 12,},
  confirmBtn: {flex: 1,backgroundColor: "#2e7d32",color: "#fff",fontWeight: "700",padding: "10px 0",borderRadius: 8,border: "none",cursor: "pointer",},
  cancelBtn: {flex: 1,backgroundColor: "#ccc",color: "#444",fontWeight: "700",padding: "10px 0",borderRadius: 8,border: "none",cursor: "pointer",},
};

// ============= COMPONENTE PRINCIPAL =============
export default function ResultadosPorRetos() {
  const [loading, setLoading] = useState(true);
  const [retos, setRetos] = useState([]);
  const [selectedRetoId, setSelectedRetoId] = useState("");
  const [ranking, setRanking] = useState([]);
  const [puntuacion, setPuntuacion] = useState([]);
  const [salonesAsignados, setSalonesAsignados] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();

  const usuario = useMemo(() => {
    const u = localStorage.getItem("usuario");
    return u ? JSON.parse(u) : null;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (loading) return;
    api.get("/retos").then((res) => {
      const retosCerrados = res.data.filter(
        (ret) => calcularEstado(ret.fechaInicio, ret.fechaCierre) === "Cerrado"
      );
      setRetos(retosCerrados);
    }).catch((err) => {console.error("Error al cargar retos:", err);});
  }, [loading]);
  useEffect(() => {
    if (!selectedRetoId || loading) {setSalonesAsignados([]);return;}
    api.get(`/retos/${selectedRetoId}`).then((res) => {
      setSalonesAsignados(res.data.salonesAsignados || []);
    }).catch(() => {setSalonesAsignados([]);});
  }, [selectedRetoId, loading]);
  useEffect(() => {
    if (!selectedRetoId || loading) {setRanking([]);setPuntuacion([]);return;}
    api.get(`/recolecciones/reto/${selectedRetoId}`).then((res) => {
      const agrupadoPorSalon = res.data.reduce((acc, item) => {
        const salonId = (item.salonId?._id || item.salonId || item.salon || "").toString();
        const salonNombre = item.salonId?.salon || item.salon || "";
        const grado = item.salonId?.grado || item.grado || "";
        const jornada = item.salonId?.jornada || item.jornada || "";
        const sede = item.salonId?.sede || item.sede || "";
        const pesoLibras = item.pesoLibras || 0;
        if (!acc[salonId]) {acc[salonId] = {salonId,salon: salonNombre,grado,jornada,sede,pesoLibras: 0,};}
        acc[salonId].pesoLibras += pesoLibras;return acc;}, {});
      let rankingMapeado = Object.values(agrupadoPorSalon);
      salonesAsignados.forEach((salonAsignado) => {
        const idSalon = (salonAsignado._id || salonAsignado).toString();
        if (!rankingMapeado.find((r) => r.salonId === idSalon)) {
          rankingMapeado.push({
            salonId: idSalon,salon: salonAsignado.salon || "",grado: salonAsignado.grado || "",jornada: salonAsignado.jornada || "",sede: salonAsignado.sede || "",pesoLibras: 0,
          });}});
      rankingMapeado.sort((a, b) => b.pesoLibras - a.pesoLibras);
      setRanking(rankingMapeado);calcularPuntuacion(rankingMapeado);
    }).catch((err) => {console.error("Error al cargar resultados:", err);setRanking([]);setPuntuacion([]);});
  }, [selectedRetoId, salonesAsignados, loading]);
  function calcularPuntuacion(ranking) {
    const puntosPosicion = [20, 15, 10, 7, 5, 3, 1];
    const nuevaPuntuacion = ranking.map((item, idx) => {
      if (idx < puntosPosicion.length) {
        return { ...item, puntos: item.pesoLibras > 0 ? puntosPosicion[idx] : 0 };
      } else {
        return { ...item, puntos: item.pesoLibras > 0 ? 1 : 0 };
      }
    });
    setPuntuacion(nuevaPuntuacion);
  }
  function darMedalla(position) {
    if (position === 1) return (<span style={styles.puestoCell}>{position}<Medal type="oro" /></span>);
    if (position === 2) return (<span style={styles.puestoCell}>{position}<Medal type="plata" /></span>);
    if (position === 3) return (<span style={styles.puestoCell}>{position}<Medal type="bronce" /></span>);
    return position + ".";
  }

  const totalPeso = ranking.reduce((acc, cur) => acc + (cur.pesoLibras || 0), 0);

  // Export to Excel
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const rankingData = [
      ["Puesto", "Grado", "Curso", "Jornada", "Sede", "Peso total (lbs)"],
      ...ranking.map((item, idx) => [
        idx + 1, item.grado, item.salon, item.jornada, item.sede, item.pesoLibras.toFixed(2),
      ]),
      ["Total", "", "", "", "", totalPeso.toFixed(2)],
    ];
    const wsRanking = XLSX.utils.aoa_to_sheet(rankingData);
    XLSX.utils.book_append_sheet(wb, wsRanking, "Ranking Peso Reciclado");
    const puntuacionData = [
      ["Puesto", "Grado", "Curso", "Jornada", "Sede", "Puntos"],
      ...puntuacion.map((item, idx) => [
        idx + 1, item.grado, item.salon, item.jornada, item.sede, item.puntos,
      ]),
    ];
    const wsPuntuacion = XLSX.utils.aoa_to_sheet(puntuacionData);
    XLSX.utils.book_append_sheet(wb, wsPuntuacion, "Puntuacion");
    XLSX.writeFile(wb, "resultados_reto.xlsx");
  };
  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor("#267d53");
    doc.text("Ranking por Peso Reciclado", 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [["Puesto", "Grado", "Curso", "Jornada", "Sede", "Peso total (lbs)"]],
      body: [
        ...ranking.map((item, idx) => [
          idx + 1, item.grado, item.salon, item.jornada, item.sede, item.pesoLibras.toFixed(2),
        ]),
        ["Total", "", "", "", "", totalPeso.toFixed(2)],
      ],
      styles: { fontSize: 10 },
    });
    doc.addPage();
    doc.setFontSize(16);
    doc.setTextColor("#397087");
    doc.text("Tabla de puntos obtenidos en el reto", 14, 22);
    autoTable(doc, {
      startY: 28,
      head: [["Puesto", "Grado", "Curso", "Jornada", "Sede", "Puntos"]],
      body: puntuacion.map((item, idx) => [
        idx + 1, item.grado, item.salon, item.jornada, item.sede, item.puntos,
      ]),
      styles: { fontSize: 10 },
    });
    doc.save("resultados_reto.pdf");
  };
  const handlePrint = () => {window.print();};

  // LOADING
  if (loading) return <Spinner />;

  // ----------- VISUAL -----------
  return (
    <div style={styles.fondo}>
      <div style={styles.container}>
        <BarraUsuarioResultados usuario={usuario} onLogout={() => setModalVisible(true)} />
        <h1 style={styles.titlePage}>
          <IconLista />
          Resultados por Reto
        </h1>
        <label style={styles.label} htmlFor="selectReto">Selecciona un reto</label>
        <select
          id="selectReto"
          onChange={(e) => setSelectedRetoId(e.target.value)}
          value={selectedRetoId}
          style={styles.select}
        >
          <option value="">-- Selecciona un reto cerrado --</option>
          {retos.map((r) => (<option key={r._id} value={r._id}>{r.nombre}</option>))}
        </select>
        {!selectedRetoId && (
          <div style={styles.messageBox}>
            <span>
              Por favor selecciona un reto para ver resultados.
              <br />
              <span style={styles.reminder}>
                Recuerda que los retos deben estar cerrados para poder ver los resultados.
              </span>
            </span>
          </div>
        )}
        {selectedRetoId && (
          <>
            <div style={styles.exportButtonsContainer}>
              <button style={styles.exportBtn} onClick={exportToExcel}>Exportar Excel</button>
              <button style={styles.exportBtn} onClick={exportToPDF}>Exportar PDF</button>
              <button style={styles.exportBtn} onClick={handlePrint}>Imprimir</button>
            </div>
            <h2 style={styles.tabTitle}><IconPodio />Ranking por Peso Reciclado</h2>
            <div style={styles.tableWrap}>
              <svg style={styles.svgFondo} viewBox="0 0 800 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="svggrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#eaf9ee" />
                    <stop offset="100%" stopColor="#e1f4fc" />
                  </linearGradient>
                  <pattern id="circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="16" fill="#cbe8cc" opacity="0.22" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#svggrad1)" />
                <rect width="100%" height="100%" fill="url(#circles)" />
              </svg>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Puesto</th>
                    <th style={styles.th}>Grado</th>
                    <th style={styles.th}>Curso</th>
                    <th style={styles.th}>Jornada</th>
                    <th style={styles.th}>Sede</th>
                    <th style={styles.th}>Peso total (lbs)</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((item, idx) => (
                    <tr key={item.salonId || idx} style={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                      <td style={styles.tdMedalla}>{darMedalla(idx + 1)}</td>
                      <td style={styles.td}>{item.grado}</td>
                      <td style={styles.td}>{item.salon}</td>
                      <td style={styles.td}>{item.jornada}</td>
                      <td style={styles.td}>{item.sede}</td>
                      <td style={styles.tdNumber}>{item.pesoLibras.toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr style={styles.totalRow}>
                    <td colSpan={5} style={styles.tdTotalLabel}>
                      Total Peso (lbs):</td>
                    <td style={{ ...styles.tdNumber, fontWeight: "bold" }}>{totalPeso.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <h2 style={styles.tabSubtitle}><IconTrofeo />Tabla de puntos obtenidos en el reto</h2>
            <div style={styles.tableWrap}>
              <svg style={styles.svgFondo} viewBox="0 0 800 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="svggrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#d9ebf5" />
                    <stop offset="100%" stopColor="#f7fbe2" />
                  </linearGradient>
                  <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                    <circle cx="16" cy="16" r="8" fill="#99d1ef" opacity="0.13" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#svggrad2)" />
                <rect width="100%" height="100%" fill="url(#dots)" />
              </svg>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Puesto</th>
                    <th style={styles.th}>Grado</th>
                    <th style={styles.th}>Curso</th>
                    <th style={styles.th}>Jornada</th>
                    <th style={styles.th}>Sede</th>
                    <th style={styles.th}>Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {puntuacion.map((item, idx) => (
                    <tr key={item.salonId || idx} style={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                      <td style={styles.tdMedalla}>{darMedalla(idx + 1)}</td>
                      <td style={styles.td}>{item.grado}</td>
                      <td style={styles.td}>{item.salon}</td>
                      <td style={styles.td}>{item.jornada}</td>
                      <td style={styles.td}>{item.sede}</td>
                      <td style={styles.tdNumber}>{item.puntos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <button style={styles.btnRegresar} onClick={() => window.history.back()}>
          <svg style={{ marginRight: 9 }} width="22" height="22" viewBox="0 0 20 20" fill="none">
            <path d="M9 16L3 10L9 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 10H17" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Regresar
        </button>
      </div>
      <ModalConfirm
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={() => {
          setModalVisible(false);
          localStorage.removeItem("token");
          localStorage.removeItem("usuario");
          navigate("/");
        }}
      />
      <style>{`
        @keyframes relojspin { 0% {transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
        @media (max-width: 700px) {
          div[style*="container"] {
            padding-left: 20px !important;
            padding-right: 20px !important;
            max-width: 100% !important;
          }
          select {
            width: 100% !important;
            max-width: 320px !important;
            display: block !important;
            margin-left: auto !important;
            margin-right: auto !important;
          }
          h1, h2 {
            text-align: center !important;
          }
        }
        @media (max-width: 900px) {
          div[style*="optionsRow"] {
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

const styles = { // Igual a tus estilos previos...
  // ... todos los estilos aquí, igual que el código anterior ...
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
    maxWidth: 980,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 30,
    boxShadow: "0 0 20px 0 rgba(60, 173, 60, 0.65)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#1b3a1b",
    display: "flex",
    flexDirection: "column",
    gap: 24,
    marginTop: 20,
    minHeight: "88vh",
    boxSizing: "border-box",
  },
  titlePage: {
    fontWeight: "700",
    fontSize: 30,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.5,
    color: "#1E5937",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 10,
    color: "#267d53",
    textAlign: "center",
  },
  select: {
    padding: 12,
    fontSize: 16,
    borderRadius: 10,
    border: "1px solid #a5d18e",
    backgroundColor: "#ecf4e7",
    width: 300,
    maxWidth: "100%",
    display: "block",
    marginLeft: "auto",
    marginRight: "auto",
  },
  tabTitle: {
    fontWeight: "bold",
    fontSize: 23,
    textAlign: "center",
    color: "#267d53",
    letterSpacing: 0.3,
    margin: "18px 0 10px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tabSubtitle: {
    fontWeight: "bold",
    fontSize: 21,
    textAlign: "center",
    color: "#397087",
    letterSpacing: 0.2,
    margin: "28px 0 12px 0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  messageBox: {
    textAlign: "center",
    fontSize: 17,
    fontWeight: "600",
    color: "#30752d",
    background: "linear-gradient(91deg,#e8ffec 50%,#e0f6fc 130%)",
    border: "2px solid #b2dfb2",
    borderRadius: 13,
    padding: "22px",
    marginTop: 14,
    marginBottom: 30,
  },
  reminder: {
    color: "#114455",
    display: "block",
    fontWeight: "900",
    fontSize: 15.4,
    marginTop: 5,
    letterSpacing: 0.05,
    textShadow: "0 1px 3px #e8f5e9ab",
  },
  exportButtonsContainer: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  exportBtn: {
    padding: "10px 20px",
    borderRadius: 20,
    border: "none",
    cursor: "pointer",
    backgroundColor: "#4caf50",
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
    transition: "background-color 0.3s",
  },
  tableWrap: {
    position: "relative",
    borderRadius: 16,
    marginBottom: 8,
    overflowX: "auto",
    WebkitOverflowScrolling: "touch",
  },
  svgFondo: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    width: "100%",
    zIndex: 0,
    pointerEvents: "none",
    borderRadius: 16,
    minHeight: 138,
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 8px",
    fontSize: 15,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    zIndex: 1,
    position: "relative",
  },
  th: {
    backgroundColor: "#81c784cc",
    color: "#1b5e20",
    fontWeight: "700",
    padding: "12px 15px",
    textAlign: "left",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  td: {
    backgroundColor: "#fff",
    padding: "12px 15px",
    color: "#333",
    verticalAlign: "middle",
    position: "relative",
    zIndex: 2,
  },
  tdNumber: {
    backgroundColor: "#fff",
    padding: "12px 15px",
    color: "#333",
    verticalAlign: "middle",
    textAlign: "right",
    fontWeight: "600",
    position: "relative",
    zIndex: 2,
  },
  tdMedalla: {
    backgroundColor: "#fff",
    padding: "12px 15px",
    verticalAlign: "middle",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    position: "relative",
    zIndex: 2,
  },
  puestoCell: {
    display: "inline-flex",
    alignItems: "center",
    fontWeight: "bold",
    fontSize: 18,
    color: "#1e5937",
  },
  tdTotalLabel: {
    backgroundColor: "#81c784",
    color: "white",
    fontWeight: "700",
    textAlign: "right",
    padding: "12px 15px",
    borderBottomLeftRadius: 8,
    fontSize: 16,
    position: "relative",
    zIndex: 2,
  },
  rowEven: {
    backgroundColor: "#f1f8f144",
    zIndex: 2,
  },
  rowOdd: {
    backgroundColor: "#e7f0e655",
    zIndex: 2,
  },
  totalRow: {
    backgroundColor: "#3a7c49bb",
    zIndex: 2,
  },
  btnRegresar: {
    margin: "44px auto 10px auto",
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "linear-gradient(90deg, #119e8e 30%, #61ce70 100%)",
    color: "#fff",
    padding: "13px 36px",
    fontWeight: 800,
    fontSize: 18,
    borderRadius: 22,
    outline: "none",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 2px 14px 0 #182b2663",
    transition: "background 0.27s, box-shadow 0.19s, transform 0.19s",
    letterSpacing: 0.5,
    position: "relative",
  },
};
