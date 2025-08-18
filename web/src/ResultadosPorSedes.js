import React, { useEffect, useState, useRef, useMemo } from "react";
import api from "./api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// ---- ICONS ----
const IconLogout = ({ style = {} }) => (
  <svg
    viewBox="0 0 24 24"
    width={25}
    height={25}
    aria-hidden="true"
    style={{ verticalAlign: "middle", fill: "#f44336", cursor: "pointer", ...style }}
  >
    <circle cx={12} cy={12} r={12} fill="none" />
    <g>
      <path d="M16 13v-2H7.83l1.58-1.59L8 8l-4 4 4 4 1.41-1.41L7.83 13z" fill="none" stroke="#f44336" strokeWidth="2" />
    </g>
  </svg>
);

const ModalConfirm = ({ visible, onClose, onConfirm }) => {
  if (!visible) return null;
  return (
    <div
      style={modalStyles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      aria-describedby="modalDesc"
    >
      <div style={modalStyles.modal}>
        <h2 id="modalTitle" style={modalStyles.title}>
          Cerrar sesión
        </h2>
        <p id="modalDesc" style={modalStyles.description}>
          ¿Seguro que deseas cerrar tu sesión?
        </p>
        <div style={modalStyles.buttons}>
          <button style={modalStyles.btnConfirm} onClick={onConfirm}>
            Sí, cerrar sesión
          </button>
          <button style={modalStyles.btnCancel} onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

const modalStyles = {
  backdrop: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10000,
  },
  modal: {
    background: "#fff",
    borderRadius: 12,
    padding: 30,
    maxWidth: 380,
    width: "90%",
    boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
    textAlign: "center",
  },
  title: {
    marginBottom: 12,
    color: "#2e7d32",
  },
  description: {
    marginBottom: 20,
    fontSize: 16,
    color: "#444",
  },
  buttons: {
    display: "flex",
    justifyContent: "space-around",
  },
  btnConfirm: {
    backgroundColor: "#2e7d32",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 20px",
    fontWeight: 600,
    cursor: "pointer",
  },
  btnCancel: {
    backgroundColor: "#ccc",
    color: "#333",
    border: "none",
    borderRadius: 8,
    padding: "10px 20px",
    fontWeight: 600,
    cursor: "pointer",
  },
};

const barraStyles = {
  container: {
    width: "100%",
    minHeight: 42,
    margin: "0 0 24px 0",
    padding: "0 19px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "linear-gradient(90deg, #d1f6fa 40%, #fefbe2 100%)",
    borderRadius: 26,
    fontWeight: 700,
    fontSize: 17,
    color: "#1c6a78",
    boxSizing: "border-box",
  },
  userName: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontWeight: 700,
    fontSize: 17,
    color: "#16a098",
    whiteSpace: "nowrap",
  },
  tipoUsuario: {
    display: "inline-flex",
    alignItems: "center",
    gap: 3,
    color: "#f6b70e",
    fontWeight: 700,
    fontSize: 15,
    marginLeft: 3,
    letterSpacing: "0.02em",
    fontStyle: "italic",
  },
  logoutBtn: {
    background: "none",
    border: "none",
    padding: 0,
    margin: 0,
    cursor: "pointer",
    outline: "none",
    height: 36,
    width: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
};

const Medal = ({ type }) => {
  const colors = {
    oro: "#ffd700",
    plata: "#c0c0c0",
    bronza: "#cd7d32",
  };
  return (
    <svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill={colors[type] || "#999"}
      aria-hidden="true"
      style={{ marginLeft: 5, verticalAlign: "middle" }}
    >
      <circle cx={12} cy={12} r={10} stroke="#444" strokeWidth={1} />
      <path
        d="M7 14l3-3 2 2 5-5"
        stroke="#444"
        strokeWidth={2}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

function calcularEstado(fechaInicio, fechaCierre) {
  const ahora = new Date();
  const inicio = new Date(fechaInicio);
  const cierre = new Date(fechaCierre + "T23:59:59");
  if (ahora < inicio) return "Abierto";
  if (ahora > cierre) return "Cerrado";
  return "Activo";
}
function asignarPuntos(ranking) {
  const puntosPosicion = [20, 15, 10, 7, 5, 3, 1];
  const ordenado = [...ranking].sort((a, b) => (b.pesoLibras || 0) - (a.pesoLibras || 0));
  return ordenado.map((item, idx) => {
    const puntos = idx < puntosPosicion.length
      ? item.pesoLibras > 0
        ? puntosPosicion[idx]
        : 0
      : item.pesoLibras > 0
        ? 1
        : 0;
    return { ...item, puntos };
  });
}
function darMedalla(position) {
  if (position === 1) return (<span style={styles.puestoCell}>{position}<Medal type="oro" /></span>);
  if (position === 2) return (<span style={styles.puestoCell}>{position}<Medal type="plata" /></span>);
  if (position === 3) return (<span style={styles.puestoCell}>{position}<Medal type="bronza" /></span>);
  return <span style={{ minWidth: 16, display: "inline-block" }}>{position}.</span>;
}
function aMayusculas(texto) {
  if (!texto) return "";
  return texto.toString().toUpperCase();
}

const LoadingSpinner = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(255,255,255,0.9)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      zIndex: 9999,
    }}
  >
    <svg
      width={80}
      height={80}
      viewBox="0 0 40 40"
      style={{ animation: "reloj-spin 1.8s linear infinite" }}
      aria-hidden="true"
    >
      <circle cx={20} cy={20} r={16} stroke="#6db64a" strokeWidth={5} fill="none" />
      <path d="M20 20v-12" stroke="#4e8d28" strokeWidth={4} strokeLinecap="round" />
      <circle cx={20} cy={20} r={4} fill="#4e8d28" />
      <style>{`
          @keyframes reloj-spin {
            from { transform: rotate(0deg);}
            to { transform: rotate(360deg);}
          }
        `}</style>
    </svg>
    <span style={{ marginTop: 24, fontWeight: "700", fontSize: 22, color: "#4a7f22" }}>Cargando...</span>
  </div>
);

export default function ResultadosPorSedes() {
  const [loadingGeneral, setLoadingGeneral] = useState(true);
  const [retos, setRetos] = useState([]);
  const [selectedRetoId, setSelectedRetoId] = useState("");
  const [ranking, setRanking] = useState([]);
  const [puntuacion, setPuntuacion] = useState([]);
  const [salonesAsignados, setSalonesAsignados] = useState([]);
  const [tablaConsolidado, setTablaConsolidado] = useState([]);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [loadingConsolidado, setLoadingConsolidado] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const reporteDetalleRef = useRef(null);
  const reporteConsolidadoRef = useRef(null);

  const usuario = useMemo(() => {
    const u = localStorage.getItem("usuario");
    return u ? JSON.parse(u) : null;
  }, []);
  const nombreUsuario = usuario?.nombre || "Usuario";
  const tipoUsuario = usuario?.tipo || usuario?.role || usuario?.perfil || "admin";

  // Spinner show for 1.8s at load
  useEffect(() => {
    setLoadingGeneral(true);
    const timer = setTimeout(() => setLoadingGeneral(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  // Load closed retos after spinner disappears
  useEffect(() => {
    if (!loadingGeneral) {
      async function cargarRetos() {
        try {
          const res = await api.get("/retos");
          const retosCerrados = res.data.filter(
            (r) => calcularEstado(r.fechaInicio, r.fechaCierre) === "Cerrado"
          );
          retosCerrados.sort(
            (a, b) => new Date(a.fechaCierre) - new Date(b.fechaCierre)
          );
          setRetos(retosCerrados);
        } catch (e) {
          console.error(e);
        }
      }
      cargarRetos();
    }
  }, [loadingGeneral]);

  // Load detalle ranking for selected reto
  useEffect(() => {
    if (!selectedRetoId) {
      setRanking([]);
      setPuntuacion([]);
      setSalonesAsignados([]);
      return;
    }
    setLoadingDetalles(true);
    Promise.all([
      api.get(`/recolecciones/reto/${selectedRetoId}`),
      api.get(`/retos/${selectedRetoId}`),
    ])
      .then(([resRank, resReto]) => {
        const agrupado = resRank.data.reduce((acc, item) => {
          const idKey = (item.salonId?.["_id"] || item.salonId || item.salon || "").toString();
          if (!acc[idKey]) {
            acc[idKey] = {
              salon: item.salonId?.salon || item.salon || "",
              grado: item.salonId?.grado || item.grado || "",
              jornada: item.salonId?.jornada || item.jornada || "",
              sede: item.salonId?.sede || item.sede || "",
              pesoLibras: 0,
              salonId: idKey,
            };
          }
          acc[idKey].pesoLibras += item.pesoLibras || 0;
          return acc;
        }, {});
        let arr = Object.values(agrupado);

        const salones = resReto.data.salonesAsignados || [];
        setSalonesAsignados(salones);
        salones.forEach((s) => {
          const sid = (s["_id"] || s).toString();
          if (!arr.find((x) => x.salonId === sid)) {
            arr.push({
              salonId: sid,
              salon: s.salon || "",
              grado: s.grado || "",
              jornada: s.jornada || "",
              sede: s.sede || "",
              pesoLibras: 0,
            });
          }
        });

        arr.sort((a, b) => b.pesoLibras - a.pesoLibras);
        setRanking(arr);

        const scored = asignarPuntos(arr);
        setPuntuacion(scored);
      })
      .catch(() => {
        setRanking([]);
        setPuntuacion([]);
        setSalonesAsignados([]);
      })
      .finally(() => setLoadingDetalles(false));
  }, [selectedRetoId]);

  // Load consolidate data sorted with tie-break by libras 
  useEffect(() => {
    if (!loadingGeneral) {
      async function cargarConsolidado() {
        setLoadingConsolidado(true);
        try {
          const res = await api.get("/retos");
          const retosCerrados = res.data.filter(
            (r) => calcularEstado(r.fechaInicio, r.fechaCierre) === "Cerrado"
          );
          const acumulado = {};
          for (const reto of retosCerrados) {
            const resRecol = await api.get(`/recolecciones/reto/${reto._id}`);
            const agrupado = resRecol.data.reduce((acc, item) => {
              const idKey = (item.salonId?.["_id"] || item.salonId || item.salon || "").toString();
              if (!acc[idKey]) {
                acc[idKey] = {
                  salon: item.salonId?.salon || item.salon || "",
                  grado: item.salonId?.grado || item.grado || "",
                  jornada: item.salonId?.jornada || item.jornada || "",
                  sede: item.salonId?.sede || item.sede || "",
                  pesoLibras: 0,
                };
              }
              acc[idKey].pesoLibras += item.pesoLibras || 0;
              return acc;
            }, {});
            let arr = Object.values(agrupado);
            const scored = asignarPuntos(arr);
            scored.forEach((item) => {
              if (!item.sede || !item.jornada) return;
              const key = aMayusculas(item.sede.trim()) + " - " + aMayusculas(item.jornada.trim());
              if (!acumulado[key]) {
                acumulado[key] = {
                  sede: aMayusculas(item.sede),
                  jornada: aMayusculas(item.jornada),
                  puntosTotales: 0,
                  librasTotales: 0,
                };
              }
              acumulado[key].puntosTotales += item.puntos || 0;
              acumulado[key].librasTotales += item.pesoLibras || 0;
            });
          }
          const resSalones = await api.get("/salones");
          const salones = resSalones.data || [];
          salones.forEach((s) => {
            const key = aMayusculas(s.sede.trim()) + " - " + aMayusculas(s.jornada.trim());
            if (!acumulado[key]) {
              acumulado[key] = {
                sede: aMayusculas(s.sede),
                jornada: aMayusculas(s.jornada),
                puntosTotales: 0,
                librasTotales: 0,
              };
            }
          });
          let arreglo = Object.entries(acumulado).map(([key, val]) => ({ key, ...val }));
          arreglo.sort((a, b) => {
            if (b.puntosTotales !== a.puntosTotales) return b.puntosTotales - a.puntosTotales;
            return b.librasTotales - a.librasTotales;
          });
          arreglo = arreglo.map((item, idx) => ({
            ...item,
            posicion: idx + 1,
            medalla: idx === 0 ? "oro" : idx === 1 ? "plata" : idx === 2 ? "bronza" : null,
          }));
          setTablaConsolidado(arreglo);
        } catch (e) {
          console.error(e);
        } finally {
          setLoadingConsolidado(false);
        }
      }
      cargarConsolidado();
    }
  }, [loadingGeneral]);

  function exportarPDF(ref, nombre) {
    if (!ref.current) {
      alert("No hay datos para exportar.");
      return;
    }
    let table = ref.current;
    if (table.tagName && table.tagName.toLowerCase() !== "table") {
      const possible = table.querySelector("table");
      if (possible) table = possible;
    }
    if (!table || !table.rows || table.rows.length < 2) {
      alert("No hay datos para exportar.");
      return;
    }
    const doc = new jsPDF("landscape");
    doc.setFontSize(18);
    doc.text(nombre, 14, 20);
    autoTable(doc, {
      html: table,
      startY: 30,
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [39, 174, 96], textColor: 255 },
      margin: { left: 10, right: 10 },
    });
    doc.save(`${nombre.replace(/\s+/g, "_")}.pdf`);
  }

  function exportarExcel(ref, nombre) {
    if (!ref.current) return;
    let table = ref.current;
    if (table.tagName && table.tagName.toLowerCase() !== "table") {
      const possible = table.querySelector("table");
      if (possible) table = possible;
    }
    if (!table) return;
    const html = table.outerHTML;
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${nombre.replace(/\s+/g, "_")}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function imprimir(ref) {
    if (!ref.current) return;
    let table = ref.current;
    if (table.tagName && table.tagName.toLowerCase() !== "table") {
      const possible = table.querySelector("table");
      if (possible) table = possible;
    }
    if (!table) return;
    const contenido = table.outerHTML;
    const ventana = window.open("", "", "width=900,height=650");
    ventana.document.write(`
      <html>
        <head>
          <title>Imprimir</title>
          <style>
            body{font-family:sans-serif;padding:10px;}
            table{border-collapse:collapse;width:100%;}
            th,td{border:1px solid #666;padding:5px;}
            th{background:#26a626;color:#fff;}
          </style>
        </head>
        <body>${contenido}</body>
      </html>
    `);
    ventana.document.close();
    ventana.focus();
    ventana.print();
  }

  if (loadingGeneral)
    return <LoadingSpinner />;

  return (
    <div style={styles.fondo}>
      <main style={styles.container}>
        <div style={barraStyles.container}>
          <span style={barraStyles.userName}>
            {nombreUsuario}
            <span style={barraStyles.tipoUsuario}>
              <span style={{ color: "#ffa500", fontWeight: "700", fontSize: 17, marginRight: 5 }}>★</span> {tipoUsuario}
            </span>
          </span>
          <button
            style={barraStyles.logoutBtn}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            onClick={() => setModalVisible(true)}
          >
            <IconLogout />
          </button>
        </div>

        <ModalConfirm
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onConfirm={() => {
            setModalVisible(false);
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            window.location.href = "/";
          }}
        />

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <div style={{ maxWidth: 320, width: "100%" }}>
            <label htmlFor="select-reto" style={styles.label}>Seleccione un reto:</label>
            <select
              id="select-reto"
              style={styles.select}
              value={selectedRetoId}
              onChange={(e) => setSelectedRetoId(e.target.value)}
            >
              <option value="">-- Seleccione un reto cerrado --</option>
              {retos.map((reto) => (
                <option key={reto._id} value={reto._id}>{aMayusculas(reto.nombre)}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
          <button style={styles.btnRegresar} onClick={() => window.history.back()}>
            ← Regresar
          </button>
        </div>

        {loadingDetalles ? (
          <LoadingSpinner />
        ) : selectedRetoId ? (
          <>
            <div style={{ ...styles.botonesContainer, justifyContent: "center" }}>
              <button onClick={() => imprimir(reporteDetalleRef)} style={styles.botonAccion}>
                🖨️ Imprimir
              </button>
              <button onClick={() => exportarPDF(reporteDetalleRef, "Detalle_Reto")} style={styles.botonAccion}>
                📄 Exportar PDF
              </button>
              <button onClick={() => exportarExcel(reporteDetalleRef, "Detalle_Reto")} style={styles.botonAccion}>
                📊 Exportar Excel
              </button>
            </div>

            <h2 style={styles.tabTitle}>Detalle del reto seleccionado</h2>
            <div style={styles.tableWrap} ref={reporteDetalleRef}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Puesto</th>
                    <th style={styles.th}>Grado</th>
                    <th style={styles.th}>Curso</th>
                    <th style={styles.th}>JORNADA</th>
                    <th style={styles.th}>SEDE</th>
                    <th style={styles.th}>Peso (lbs)</th>
                    <th style={styles.th}>Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {puntuacion.map((item, idx) => (
                    <tr key={item.salonId || idx} style={idx % 2 ? styles.rowOdd : styles.rowEven}>
                      <td style={styles.puestoCell}>{darMedalla(idx + 1)}</td>
                      <td style={styles.td}>{item.grado}</td>
                      <td style={styles.td}>{item.salon}</td>
                      <td style={styles.td}>{aMayusculas(item.jornada)}</td>
                      <td style={styles.td}>{aMayusculas(item.sede)}</td>
                      <td style={styles.tdRight}>{item.pesoLibras.toFixed(2)}</td>
                      <td style={styles.tdRight}>{item.puntos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        <section style={{ marginTop: 40 }}>
          <div style={{ ...styles.botonesContainer, justifyContent: "center" }}>
            <button onClick={() => imprimir(reporteConsolidadoRef)} style={styles.botonAccion}>
              🖨️ Imprimir
            </button>
            <button onClick={() => exportarPDF(reporteConsolidadoRef, "Consolidado_General")} style={styles.botonAccion}>
              📄 Exportar PDF
            </button>
            <button onClick={() => exportarExcel(reporteConsolidadoRef, "Consolidado_General")} style={styles.botonAccion}>
              📊 Exportar Excel
            </button>
          </div>

          <h2 style={styles.tabTitle}>Consolidado general (todos los retos)</h2>

          {loadingConsolidado ? (
            <LoadingSpinner />
          ) : (
            <div style={styles.tableWrap} ref={reporteConsolidadoRef}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Puesto</th>
                    <th style={styles.th}>SEDE</th>
                    <th style={styles.th}>JORNADA</th>
                    <th style={styles.th}>Puntos Totales</th>
                    <th style={styles.th}>Peso Total (lbs)</th>
                  </tr>
                </thead>
                <tbody>
                  {tablaConsolidado.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center" }}>
                        No hay datos para mostrar
                      </td>
                    </tr>
                  ) : (
                    tablaConsolidado.map(({ key, sede, jornada, puntosTotales, librasTotales, posicion }) => (
                      <tr
                        key={key}
                        style={posicion % 2 ? styles.rowOdd : styles.rowEven}
                      >
                        <td style={styles.puestoCell}>{darMedalla(posicion)}</td>
                        <td style={{ ...styles.td, fontWeight: "bold" }}>
                          {aMayusculas(sede)}
                        </td>
                        <td style={{ ...styles.td, fontWeight: "bold" }}>
                          {aMayusculas(jornada)}
                        </td>
                        <td style={styles.tdRight}>{puntosTotales}</td>
                        <td style={styles.tdRight}>{librasTotales.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const styles = {
  fondo: {
    minHeight: "100vh",
    width: "100vw",
    background:
      "linear-gradient(90deg, #ceeeb6 20%, #87d626 90%), url('/fondo-ambiental.jpg') no-repeat center center fixed",
    backgroundSize: "cover",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 20,
  },
  container: {
    maxWidth: 980,
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 30,
    boxSizing: "border-box",
    boxShadow: "0 0 20px rgba(60, 163, 60, 0.65)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#1b3a31",
    display: "flex",
    flexDirection: "column",
    gap: 24,
    marginTop: 0,
    minHeight: "88vh",
  },
  label: {
    fontWeight: 700,
    fontSize: 18,
    color: "#2f7c1f",
    marginBottom: 8,
    userSelect: "none",
  },
  selectWrapper: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 24,
  },
  select: {
    width: "100%",
    maxWidth: 320,
    padding: "12px 15px",
    borderRadius: 18,
    fontSize: 18,
    border: "1px solid #afdb7d",
    backgroundColor: "#d8edb4",
    color: "#345a11",
    textAlign: "center",
    userSelect: "none",
  },
  btnRegresar: {
    background: "#3a781d",
    color: "white",
    border: "none",
    borderRadius: 22,
    padding: "12px 24px",
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgb(60 120 20 / 0.7)",
    userSelect: "none",
    margin: "0 auto 30px",
    minWidth: 140,
  },
  botonesContainer: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 20,
  },
  botonAccion: {
    backgroundColor: "#3a781d",
    color: "white",
    border: "none",
    borderRadius: 22,
    padding: "12px 28px",
    fontSize: 17,
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 2px 6px rgb(60 120 20 / 0.7)",
    userSelect: "none",
    whiteSpace: "nowrap",
  },
  tabTitle: {
    fontWeight: 700,
    fontSize: 22,
    color: "#2e6b1a",
    textAlign: "center",
  },
  tableWrap: {
    overflowX: "auto",
    borderRadius: 12,
    boxShadow: "0 0 14px rgba(86, 130, 50, 0.7)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    userSelect: "none",
  },
  th: {
    backgroundColor: "#b7da7e",
    border: "1px solid #96b335",
    padding: "10px 14px",
    fontWeight: 700,
    color: "#345715",
    textAlign: "left",
    whiteSpace: "nowrap",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  td: {
    backgroundColor: "#e2f0c6",
    border: "1px solid #96b335",
    padding: "10px 14px",
    fontWeight: 600,
    color: "#386d2f",
  },
  tdRight: {
    backgroundColor: "#e2f0c6",
    border: "1px solid #96b335",
    padding: "10px 14px",
    fontWeight: 700,
    color: "#3b7b1a",
    textAlign: "right",
    userSelect: "text",
  },
  puestoCell: {
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 19,
    justifyContent: "center",
    color: "#3a7b23",
    userSelect: "none",
  },
  rowEven: {
    backgroundColor: "#eaf4c7",
  },
  rowOdd: {
    backgroundColor: "#c9deb1",
  },
  loadingContainer: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(255,255,255,0.9)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    zIndex: 9999,
  },
};
