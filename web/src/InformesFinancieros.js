import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getVentas, registrarVenta, editarVenta } from "./apiVentas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const mobileStyles = `
@media (max-width: 600px) {
  html, body, #root {
    width: 100% !important;
    min-width: 0 !important;
    padding: 0 !important;
    margin: 0 !important;
    box-sizing: border-box !important;
    overflow-x: hidden !important;
  }
  .pageContainer {
    width: 100% !important;
    max-width: 100% !important;
    padding: 1.5vw 1.5vw 9vw 1.5vw !important;
    margin: 0 !important;
    border-radius: 0 !important;
    background: #f4fbe6 !important;
  }
  .userBar {
    flex-direction: column !important;
    align-items: center !important;
    gap: 4px !important;
    padding: 0 !important;
    margin-bottom: 1vw !important;
  }
  .userName, .userRole {
    font-size: 4vw !important;
    text-align: center !important;
    word-break: break-word !important;
    margin: 0 !important;
    width: 100% !important;
  }
  button[aria-label="Cerrar sesión"] {
    margin: 8px auto 0 auto !important;
    display: flex !important;
    justify-content: center !important;
    width: 40px !important;
    height: 40px !important;
    font-size: 20px !important;
    border-radius: 50% !important;
    background-color: #e53935 !important;
    color: white !important;
    border: none !important;
    box-shadow: 0 2px 6px #aa2e2e6b !important;
  }
  .header {
    font-size: 5vw !important;
    font-weight: 700 !important;
    text-align: center !important;
    margin-bottom: 2vw !important;
    padding: 0 1rem !important;
    letter-spacing: 0 !important;
  }
  .navContainer {
    display: flex !important;
    flex-direction: column !important;
    gap: 1.5vw !important;
    padding: 0 !important;
  }
  .navContainer button {
    font-size: 3.5vw !important;
    padding: 3vw 0 !important;
    border-radius: 10px !important;
    text-align: center !important;
    width: 100% !important;
    margin: 0 auto !important;
  }
  .navContainer button.active {
    background-color: #689f38 !important;
    color: white !important;
    font-weight: 800 !important;
  }
  form.form, .formGroup {
    width: 100% !important;
    max-width: 100% !important;
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    gap: 2vw !important;
  }
  label {
    font-size: 3.5vw !important;
    font-weight: 700 !important;
    margin-bottom: 0.8vw !important;
    width: 90% !important;
  }
  input, select, textarea {
    font-size: 3vw !important;
    width: 90% !important;
    max-width: 360px !important;
    padding: 8px !important;
    border-radius: 8px !important;
    border: 1.5px solid #7fb866 !important;
    box-sizing: border-box !important;
    text-align: center !important;
  }
  button.buttonAdd {
    width: 90% !important;
    font-size: 4vw !important;
    padding: 3vw 0 !important;
    margin: 1rem auto 2rem auto !important;
    border-radius: 20vw !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    font-weight: 700 !important;
    color: white !important;
    background-color: #4caf50 !important;
  }
  button.buttonAdd:disabled {
    background-color: #a5d6a7 !important;
    cursor: not-allowed !important;
  }
  .tableContainer {
    overflow-x: auto !important;
    margin-bottom: 2rem !important;
  }
  table {
    font-size: 3.5vw !important;
    width: 100% !important;
    border-spacing: 0 8px !important;
  }
  th, td {
    padding: 1vw !important;
    text-align: center !important;
    background-color: #eff9d9 !important;
    border-radius: 8px !important;
    font-weight: 700 !important;
    color: #386118 !important;
    word-break: break-word !important;
  }
  th {
    background-color: #c5e2a8 !important;
  }
  .totalsRow {
    background-color: #b6d776 !important;
    font-weight: 900 !important;
    font-size: 3.6vw !important;
  }
  .backButtonContainer {
    width: 100% !important;
    margin-top: 3vw !important;
    display: flex !important;
    justify-content: center !important;
  }
  button.backButton {
    width: 90% !important;
    font-size: 4vw !important;
    padding: 3vw 0 !important;
    margin: 0 auto !important;
    border-radius: 20vw !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
  }
  .iconButtonsContainer {
    display: flex !important;
    justify-content: center !important;
    gap: 5vw !important;
    margin-bottom: 2rem !important;
  }
  .iconButton {
    border: none !important;
    background: none !important;
    cursor: pointer !important;
    padding: 10px !important;
  }
}
`;

const styles = {
  container: {
    maxWidth: 960,
    margin: "auto",
    padding: 16,
    backgroundColor: "#f4fbe6",
    borderRadius: 12,
    boxShadow: "0 0 14px rgba(50, 100, 30, 0.13)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    boxSizing: "border-box",
  },
  userBar: {
    background: "linear-gradient(90deg, #e6eecc 40%, #aed581 100%)",
    borderRadius: 22,
    padding: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    flexWrap: "wrap",
  },
  userNameBlock: {
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    fontWeight: "900",
    fontSize: 20,
    color: "#335014",
    lineHeight: 1,
  },
  userRole: {
    fontWeight: "600",
    fontStyle: "italic",
    opacity: 0.7,
    fontSize: 14,
    color: "#335014",
    marginTop: 2,
  },
  navContainer: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  navButton: {
    borderRadius: 24,
    border: "none",
    backgroundColor: "#aed581",
    color: "#335014",
    padding: "10px 20px",
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
    userSelect: "none",
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexBasis: 140,
    justifyContent: "center",
  },
  navButtonActive: {
    backgroundColor: "#689f38",
    color: "white",
    fontWeight: 900,
  },
  form: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 12,
  },
  formGroup: {
    width: 320,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontWeight: 600,
    color: "#4e7930",
  },
  select: {
    borderRadius: 8,
    border: "1.5px solid #b4dc82",
    backgroundColor: "#f9ffe7",
    padding: 8,
    fontSize: 16,
    color: "#335014",
    boxSizing: "border-box",
    textAlign: "center",
  },
  input: {
    borderRadius: 8,
    border: "1.5px solid #b4dc82",
    backgroundColor: "#f9ffe7",
    padding: 8,
    fontSize: 16,
    color: "#335014",
    boxSizing: "border-box",
    textAlign: "center",
  },
  buttonAdd: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#4caf50",
    border: "none",
    borderRadius: 30,
    padding: "12px 28px",
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    cursor: "pointer",
    alignSelf: "flex-end",
    marginTop: 18,
    userSelect: "none",
  },
  buttonDisabled: {
    backgroundColor: "#a5d6a7",
    cursor: "not-allowed",
  },
  tableContainer: {
    overflowX: "auto",
    marginTop: 16,
  },
  table: {
    borderCollapse: "separate",
    borderSpacing: "0 12px",
    fontSize: 14,
    width: "100%",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#335014",
  },
  th: {
    backgroundColor: "#c5e1a5",
    padding: 10,
    borderRadius: "12px 12px 0 0",
    fontWeight: 900,
    color: "#335014",
    textAlign: "center",
  },
  td: {
    backgroundColor: "#f7ffe3",
    padding: 12,
    borderRadius: 6,
    fontWeight: 600,
    textAlign: "center",
    userSelect: "none",
    wordBreak: "break-word",
  },
  tdEditable: {
    cursor: "text",
    userSelect: "text",
  },
  dateCell: {
    fontStyle: "italic",
    color: "#537032",
    fontSize: 13,
  },
  totalsRow: {
    fontWeight: 900,
    backgroundColor: "#ccdba0",
    fontSize: 15,
  },
  iconButtonsContainer: {
    display: "flex",
    gap: 20,
    justifyContent: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  iconButton: {
    border: "none",
    background: "none",
    cursor: "pointer",
    padding: 8,
    borderRadius: 8,
  },
  textarea: {
    width: "100%",
    maxWidth: 600,
    minHeight: 80,
    fontSize: 16,
    padding: 12,
    borderRadius: 8,
    border: "1.5px solid #b4dc82",
    boxSizing: "border-box",
    resize: "vertical",
    color: "#335014",
  },
  backButtonContainer: {
    display: "flex",
    justifyContent: "center",
    marginTop: 30,
  },
  backButton: {
    cursor: "pointer",
    backgroundColor: "#c8e6c9",
    color: "#335014",
    border: "2px solid #689f38",
    fontWeight: "bold",
    borderRadius: 32,
    fontSize: 16,
    padding: "10px 28px",
    display: "flex",
    gap: 8,
    alignItems: "center",
    userSelect: "none",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
  },
  modalContent: {
    background: "white",
    borderRadius: 12,
    padding: 32,
    maxWidth: 360,
    boxShadow: "0 6px 24px rgba(0,0,0,0.2)",
    textAlign: "center",
  },
  modalButtons: {
    display: "flex",
    justifyContent: "center",
    gap: 16,
    marginTop: 20,
  },
  modalButtonConfirm: {
    backgroundColor: "#689f38",
    border: "none",
    color: "white",
    fontWeight: "bold",
    padding: "12px 32px",
    borderRadius: 8,
    cursor: "pointer",
  },
  modalButtonCancel: {
    backgroundColor: "#eee",
    border: "none",
    color: "#335014",
    fontWeight: "bold",
    padding: "12px 32px",
    borderRadius: 8,
    cursor: "pointer",
  },
  successModal: {
    position: "fixed",
    top: "20%",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "1rem 2rem",
    borderRadius: 12,
    boxShadow: "0 0 10px #15572499",
    fontWeight: "700",
    zIndex: 10001,
  },
};

function Spinner() {
  return (
    <div style={{ height: "70vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
      <div className="lds-dual-ring" />
      <style>{`
        .lds-dual-ring {
          display: inline-block;
          width: 48px;
          height: 48px;
        }
        .lds-dual-ring:after {
          content: " ";
          display: block;
          width: 40px;
          height: 40px;
          margin: 4px;
          border-radius: 50%;
          border: 5px solid #a5c471;
          border-color: #689f38 transparent #689f38 transparent;
          animation: lds-dual-ring 1.2s linear infinite;
        }
        @keyframes lds-dual-ring {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );
}

const IconLogout = ({ onClick }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <button aria-label="Cerrar sesión" title="Cerrar sesión" onClick={onClick}
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: hover ? "#b71c1c" : "#e53935",
        color: "white",
        border: "none",
        fontSize: 20,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: hover ? "0 0 10px #b71c1c" : "none",
        transition: "background-color 0.3s",
        margin: "10px auto 0 auto"
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >⎋</button>
  )
};

const ReciclajeIcon = () => (
  <svg width={28} height={28} style={{ marginRight: 8, verticalAlign: "middle" }} viewBox="0 0 24 24" fill="#8BC34A">
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <rect x="7" y="10" width="10" height="4" fill="#dce775" />
  </svg>
);

const InformeIcon = () => (
  <svg width={28} height={28} style={{ marginRight: 8, verticalAlign: "middle" }} viewBox="0 0 24 24" fill="#689F38">
    <circle cx="12" cy="12" r="12" fill="#e6eecc" />
    <text x="12" y="16" fill="#38761d" fontSize="18" fontWeight="bold" textAnchor="middle">📄</text>
  </svg>
);

const IconAdd = ({ size = 20, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M19 11H13V5H11V11H5V13H11V19H13V13H19V11Z" />
  </svg>
);

const IconBack = () => (
  <svg width={22} height={22} style={{ marginRight: 7, verticalAlign: "middle" }} viewBox="0 0 24 24" fill="none" stroke="#689F38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const IconPDF = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="6" fill="#D32F2F" />
    <text x="18" y="25" fill="#fff" fontWeight="bold" fontSize="14" fontFamily="Arial" textAnchor="middle">PDF</text>
  </svg>
);

const IconExcel = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="6" fill="#388E3C" />
    <text x="18" y="25" fill="#fff" fontWeight="bold" fontSize="14" fontFamily="Arial" textAnchor="middle">XLS</text>
  </svg>
);

const IconPrint = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 7H18V11H6V7Z" fill="#4CAF50" />
    <rect x="5" y="11" width="14" height="7" rx="1" fill="#A5D6A7" />
    <rect x="8" y="15" width="8" height="2" fill="#4CAF50" />
    <rect x="9" y="4" width="6" height="3" rx="1" fill="#81C784" />
  </svg>
);

function formatNumero(num) {
  if (typeof num !== "number" || isNaN(num)) return num;
  return num.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function formatFechaHora(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
}

const materiales = [
  "Papel y Cartón",
  "Botellas Plásticas",
  "Latas de Aluminio",
  "Vidrio (Botellas y Frascos)",
  "Residuos Electrónicos",
  "Tetra Pak",
  "Aceite Vegetal",
  "Textiles",
  "Baterías",
  "Plasticos HDPE",
];

function ModalConfirm({ onCancel, onConfirm }) {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0,0,0,0.3)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10000,
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: 12,
        padding: 24,
        maxWidth: 360,
        textAlign: "center",
      }}>
        <h3>Confirmar acción</h3>
        <p>¿Está seguro que desea cerrar sesión?</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          <button style={{ padding: 12, borderRadius: 8, border: "none", backgroundColor: "#eee" }} onClick={onCancel}>Cancelar</button>
          <button style={{ padding: 12, borderRadius: 8, border: "none", backgroundColor: "#689f38", color: "white" }} onClick={onConfirm}>Cerrar Sesión</button>
        </div>
      </div>
    </div>
  );
}

export default function InformesFinancieros({ usuario }) {
  const navigate = useNavigate();

  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("registro");
  const [showSpinner, setShowSpinner] = useState(true);
  const [material, setMaterial] = useState("");
  const [precio, setPrecio] = useState("");
  const [libras, setLibras] = useState("");
  const [editarIdx, setEditarIdx] = useState(null);
  const [editarCampo, setEditarCampo] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setShowSpinner(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function cargarVentas() {
      try {
        const data = await getVentas();
        setVentas(data);
      } catch {
        alert("Error cargando ventas");
      } finally {
        setLoading(false);
      }
    }
    cargarVentas();
  }, []);

  const agregarVenta = async () => {
    if (!material || !precio || !libras) return;
    if (Number(precio) <= 0 || Number(libras) <= 0) return;

    try {
      const nuevaVenta = await registrarVenta({
        material,
        precio: Number(precio),
        libras: Number(libras),
        usuario: usuario?.nombre || "Desconocido",
      });
      setVentas((v) => [...v, nuevaVenta]);
      setMaterial("");
      setPrecio("");
      setLibras("");
      setSuccessVisible(true);
      setTimeout(() => setSuccessVisible(false), 1500);
    } catch {
      alert("Error al registrar venta");
    }
  };

  const iniciarEdicion = (idx, campo) => {
    if (usuario?.rol !== "admin") return;
    setEditarIdx(idx);
    setEditarCampo(campo);
  };

  const terminarEdicion = async (e, idx, campo) => {
    const val = e.target.textContent.trim();
    if (!val || isNaN(val) || Number(val) <= 0) {
      setEditarIdx(null);
      setEditarCampo(null);
      return;
    }
    try {
      const venta = ventas[idx];
      const actualizado = await editarVenta(venta._id, { [campo]: Number(val) });
      setVentas((v) => v.map((item, i) => (i === idx ? actualizado : item)));
    } catch {
      alert("Error al actualizar venta");
    }
    setEditarIdx(null);
    setEditarCampo(null);
  };

  let ventasFiltradas = ventas;
  if (fechaDesde) ventasFiltradas = ventasFiltradas.filter((v) => new Date(v.fechaHora) >= new Date(fechaDesde));
  if (fechaHasta) ventasFiltradas = ventasFiltradas.filter((v) => new Date(v.fechaHora) <= new Date(fechaHasta + "T23:59:59"));
  if (material) ventasFiltradas = ventasFiltradas.filter((v) => v.material === material);

  const totalVentas = ventasFiltradas.length;
  const totalLibras = ventasFiltradas.reduce((acc, v) => acc + (v.libras || 0), 0);
  const totalDinero = ventasFiltradas.reduce((acc, v) => acc + (v.total || 0), 0);

  const tablaMateriales = {};
  ventasFiltradas.forEach((v) => {
    if (!tablaMateriales[v.material]) tablaMateriales[v.material] = { ventas: 0, libras: 0, dinero: 0, precioSum: 0 };
    tablaMateriales[v.material].ventas++;
    tablaMateriales[v.material].libras += v.libras || 0;
    tablaMateriales[v.material].dinero += v.total || 0;
    tablaMateriales[v.material].precioSum += v.precio || 0;
  });

  const resumenUsuarios = {};
  ventasFiltradas.forEach((v) => {
    const usuarioName = v.usuario || "Desconocido";
    if (!resumenUsuarios[usuarioName]) resumenUsuarios[usuarioName] = { ventas: 0, libras: 0, dinero: 0 };
    resumenUsuarios[usuarioName].ventas++;
    resumenUsuarios[usuarioName].libras += v.libras || 0;
    resumenUsuarios[usuarioName].dinero += v.total || 0;
  });

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "/login";
  };

  const exportarExcel = () => {
    const wsMateriales = XLSX.utils.json_to_sheet(
      Object.entries(tablaMateriales).map(([mat, d]) => ({
        Material: mat,
        Ventas: d.ventas,
        Libras: d.libras,
        "Precio Promedio": d.ventas ? (d.precioSum / d.ventas).toFixed(2) : 0,
        Total: d.dinero.toFixed(2),
      }))
    );
    const wsUsuarios = XLSX.utils.json_to_sheet(
      Object.entries(resumenUsuarios).map(([user, d]) => ({
        Usuario: user,
        Ventas: d.ventas,
        Libras: d.libras,
        Total: d.dinero.toFixed(2),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsMateriales, "Materiales");
    XLSX.utils.book_append_sheet(wb, wsUsuarios, "Usuarios");
    const wbout = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "InformeCompleto.xlsx");
  };

  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Informe de Ventas - Materiales", 14, 14);
    autoTable(doc, {
      startY: 18,
      head: [["Material", "Ventas", "Libras", "Precio Promedio", "Total"]],
      body: Object.entries(tablaMateriales).map(([mat, d]) => [
        mat,
        d.ventas,
        d.libras,
        d.ventas ? (d.precioSum / d.ventas).toFixed(2) : "0",
        d.dinero.toFixed(2),
      ]),
      theme: "striped",
    });
    const y = doc.lastAutoTable.finalY + 10;
    doc.text("Informe de Ventas - Usuarios", 14, y);
    autoTable(doc, {
      startY: y + 4,
      head: [["Usuario", "Ventas", "Libras", "Total"]],
      body: Object.entries(resumenUsuarios).map(([user, d]) => [
        user,
        d.ventas,
        d.libras,
        d.dinero.toFixed(2),
      ]),
      theme: "striped",
    });
    doc.save("InformeCompleto.pdf");
  };

  return (
    <div className="pageContainer" style={styles.container} role="main">
      <style>{mobileStyles}</style>
      <div style={styles.userBar}>
        <div style={styles.userName}>{usuario?.nombre || "Usuario"}</div>
        <div style={styles.userRole}>{usuario?.rol || ""}</div>
        <button aria-label="Cerrar sesión" onClick={() => setModalOpen(true)} style={{ background: "none", border: "none" }}>
          <IconLogout />
        </button>
      </div>
      <div style={styles.navContainer}>
        <button onClick={() => setView("registro")} style={{ ...styles.navButton, ...(view === "registro" ? styles.navButtonActive : {}) }} aria-current={view === "registro" ? "page" : undefined}>Registro de Ventas</button>
        <button onClick={() => setView("informe")} style={{ ...styles.navButton, ...(view === "informe" ? styles.navButtonActive : {}) }} aria-current={view === "informe" ? "page" : undefined}>Informe Financiero</button>
      </div>

      {view === "registro" && (
        <>
          <h1 style={styles.header}>Registro de Ventas</h1>
          <form style={styles.form} onSubmit={(e) => { e.preventDefault(); agregarVenta(); }}>
            <div style={styles.formGroup}>
              <label htmlFor="material" style={styles.label}>Material</label>
              <select id="material" style={styles.select} value={material} onChange={e => setMaterial(e.target.value)} required>
                <option value="">--Seleccione--</option>
                {materiales.map(mat => (<option key={mat} value={mat}>{mat}</option>))}
              </select>
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="precio" style={styles.label}>Precio ($/libra)</label>
              <input id="precio" style={styles.input} type="number" min="0" step="0.01" value={precio} onChange={e => setPrecio(e.target.value)} disabled={!material} required/>
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="libras" style={styles.label}>Libras</label>
              <input id="libras" style={styles.input} type="number" min="0" step="0.01" value={libras} onChange={e => setLibras(e.target.value)} disabled={!material} required/>
            </div>
            <button type="submit" disabled={!material || !precio || !libras || Number(precio) <= 0 || Number(libras) <= 0} style={(!material || !precio || !libras || Number(precio) <= 0 || Number(libras) <= 0) ? styles.buttonDisabled : styles.buttonAdd}>
              <IconAdd /> Agregar Venta
            </button>
          </form>
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Material</th>
                  <th style={styles.th}>Precio</th>
                  <th style={styles.th}>Libras</th>
                  <th style={styles.th}>Usuario</th>
                  <th style={styles.th}>Total</th>
                  <th style={styles.th}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <tr><td style={styles.td} colSpan={6}>Cargando...</td></tr> : 
                  ventasFiltradas.length === 0 ? <tr><td style={styles.td} colSpan={6}>No hay registros</td></tr> :
                  ventasFiltradas.map((v, idx) => (
                    <tr key={v._id}>
                      <td style={styles.td}>{v.material}</td>
                      <td contentEditable={editarIdx === idx && editarCampo === "precio"} suppressContentEditableWarning style={{...styles.td, ...styles.tdEditable}} onClick={() => usuario?.rol === "admin" && iniciarEdicion(idx, "precio")} onBlur={e => terminarEdicion(e, idx, "precio")} onKeyDown={e => {if(e.key==="Enter"){e.preventDefault(); e.currentTarget.blur()}}}>{formatNumero(v.precio)}</td>
                      <td contentEditable={editarIdx === idx && editarCampo === "libras"} suppressContentEditableWarning style={{...styles.td, ...styles.tdEditable}} onClick={() => usuario?.rol === "admin" && iniciarEdicion(idx, "libras")} onBlur={e => terminarEdicion(e, idx, "libras")} onKeyDown={e => {if(e.key==="Enter"){e.preventDefault(); e.currentTarget.blur()}}}>{formatNumero(v.libras)}</td>
                      <td style={styles.td}>{v.usuario}</td>
                      <td style={styles.td}>{formatNumero(v.total)}</td>
                      <td style={{...styles.td,...styles.dateCell}}>{formatFechaHora(v.fechaHora)}</td>
                    </tr>
                  ))
                }
                {!loading && ventasFiltradas.length > 0 && (
                <tr style={styles.totalsRow}>
                  <td colSpan={2}>Totales</td>
                  <td>{formatNumero(totalLibras)}</td>
                  <td></td>
                  <td>{formatNumero(totalDinero)}</td>
                  <td></td>
                </tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={styles.backButtonContainer}>
            <button style={styles.backButton} onClick={() => navigate("/dashboard")}>Volver</button>
          </div>
        </>
      )}

      {view === "informe" && (
        <>
          <h1 style={styles.header}>Informe Financiero</h1>
          <form style={styles.form}>
            <div style={styles.formGroup}>
              <label htmlFor="fechaDesde" style={styles.label}>Fecha Desde</label>
              <input id="fechaDesde" type="date" style={styles.input} value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="fechaHasta" style={styles.label}>Fecha Hasta</label>
              <input id="fechaHasta" type="date" style={styles.input} value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="material" style={styles.label}>Material</label>
              <select id="material" style={styles.select} value={material} onChange={e => setMaterial(e.target.value)}>
                <option value="">Todos</option>
                {materiales.map(mat => <option key={mat} value={mat}>{mat}</option>)}
              </select>
            </div>
          </form>

          <div style={styles.iconButtonsContainer}>
            <button style={styles.iconButton} onClick={() => exportarPDF(tablaMateriales, resumenUsuarios)} aria-label="Exportar PDF">
              <IconPDF />
            </button>
            <button style={styles.iconButton} onClick={() => exportarExcel(tablaMateriales, resumenUsuarios)} aria-label="Exportar Excel">
              <IconExcel />
            </button>
            <button style={styles.iconButton} onClick={() => window.print()} aria-label="Imprimir">
              <IconPrint />
            </button>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Material</th>
                  <th style={styles.th}>Ventas</th>
                  <th style={styles.th}>Libras</th>
                  <th style={styles.th}>Precio Promedio</th>
                  <th style={styles.th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(tablaMateriales).map(([mat, d]) => (
                  <tr key={mat}>
                    <td style={styles.td}>{mat}</td>
                    <td style={styles.td}>{formatNumero(d.ventas)}</td>
                    <td style={styles.td}>{formatNumero(d.libras)}</td>
                    <td style={styles.td}>{d.ventas ? (d.precioSum / d.ventas).toFixed(2) : 0}</td>
                    <td style={styles.td}>{formatNumero(d.dinero)}</td>
                  </tr>
                ))}
                <tr style={styles.totalsRow}>
                  <td>Total</td>
                  <td>{formatNumero(Object.values(tablaMateriales).reduce((a,c) => a + c.ventas, 0))}</td>
                  <td>{formatNumero(Object.values(tablaMateriales).reduce((a,c) => a + c.libras, 0))}</td>
                  <td></td>
                  <td>{formatNumero(Object.values(tablaMateriales).reduce((a,c) => a + c.dinero, 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Usuario</th>
                  <th style={styles.th}>Ventas</th>
                  <th style={styles.th}>Libras</th>
                  <th style={styles.th}>Total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(resumenUsuarios).sort((a,b) => b[1].dinero - a[1].dinero).map(([user, d]) => (
                  <tr key={user}>
                    <td style={styles.td}>{user}</td>
                    <td style={styles.td}>{formatNumero(d.ventas)}</td>
                    <td style={styles.td}>{formatNumero(d.libras)}</td>
                    <td style={styles.td}>{formatNumero(d.dinero)}</td>
                  </tr>
                ))}
                <tr style={styles.totalsRow}>
                  <td>Total</td>
                  <td>{formatNumero(Object.values(resumenUsuarios).reduce((a,c) => a + c.ventas, 0))}</td>
                  <td>{formatNumero(Object.values(resumenUsuarios).reduce((a,c) => a + c.libras, 0))}</td>
                  <td>{formatNumero(Object.values(resumenUsuarios).reduce((a,c) => a + c.dinero, 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style={styles.backButtonContainer}>
            <button style={styles.backButton} onClick={() => navigate("/dashboard")}>Volver</button>
          </div>

          <div style={{ marginTop: 20 }}>
            <label htmlFor="observaciones" style={{ fontWeight: "bold", color: "#4a7526" }}>Observaciones</label>
            <textarea id="observaciones" style={styles.textarea} value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={4} />
          </div>
        </>
      )}

      {modalOpen && <ModalConfirm onCancel={() => setModalOpen(false)} onConfirm={cerrarSesion} />}

      {successVisible && (
        <div style={styles.successModal} role="alert" aria-live="assertive">
          Venta registrada con éxito
        </div>
      )}
    </div>
  );
}
