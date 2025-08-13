import React, { useEffect, useState, useRef } from "react";
import api from "./api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Medal = ({ type }) => {
  const colors = {
    oro: "#ffd700",
    plata: "#c0c0c0",
    bronza: "#cd7f32",
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
  const ordenado = [...ranking].sort(
    (a, b) => (b.pesoLibras || 0) - (a.pesoLibras || 0)
  );
  return ordenado.map((item, idx) => {
    const puntos =
      idx < puntosPosicion.length
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
  if (position === 1)
    return (
      <span style={styles.puestoCell}>
        {position}
        <Medal type="oro" />
      </span>
    );
  if (position === 2)
    return (
      <span style={styles.puestoCell}>
        {position}
        <Medal type="plata" />
      </span>
    );
  if (position === 3)
    return (
      <span style={styles.puestoCell}>
        {position}
        <Medal type="bronza" />
      </span>
    );
  return <span style={{ minWidth: 16, display: "inline-block" }}>{position}.</span>;
}

// Mostrar texto en mayúsculas
function aMayusculas(texto) {
  if (!texto) return "";
  return texto.toString().toUpperCase();
}

const coloresRetos = ["#d7efd9", "#c5e5c5"];
const colorFondoAzul = "#1f5d1f";
const colorTextoBlanco = "white";

const LoadingSpinner = () => (
  <div style={styles.loadingContainer}>
    <svg
      width={48}
      height={48}
      viewBox="0 0 50 50"
      style={{ animation: "spin 2s linear infinite" }}
    >
      <circle cx={25} cy={25} r={10} fill="#4a867a" />
      <path d="M25 10l12 7v0" fill="#7cbf7b">
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0 25 25"
          to="360 25 25"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </path>
      <style>{`
        @keyframes spin {
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
    <span style={{ fontSize: 18, fontWeight: "700", color: "#2d7a2d", marginLeft: 12 }}>
      Cargando información...
    </span>
  </div>
);

export default function ResultadosPorSedes() {
  const [retos, setRetos] = useState([]);
  const [selectedRetoId, setSelectedRetoId] = useState("");
  const [ranking, setRanking] = useState([]);
  const [puntuacion, setPuntuacion] = useState([]);
  const [salonesAsignados, setSalonesAsignados] = useState([]);
  const [tablaConsolidado, setTablaConsolidado] = useState([]);
  const [loadingDetalles, setLoadingDetalles] = useState(false);
  const [loadingConsolidado, setLoadingConsolidado] = useState(false);

  const reporteDetalleRef = useRef(null);
  const reporteConsolidadoRef = useRef(null);

  useEffect(() => {
    async function cargarRetos() {
      try {
        const res = await api.get("/retos");
        const retosCerrados = res.data.filter((r) =>
          calcularEstado(r.fechaInicio, r.fechaCierre) === "Cerrado"
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
  }, []);

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
        const agrupa = resRank.data.reduce((acc, it) => {
          const idKey = (it.salonId?.["_id"] || it.salonId || it.salon || "").toString();
          if (!acc[idKey]) {
            acc[idKey] = {
              salon: it.salonId?.salon || it.salon || "",
              grado: it.salonId?.grado || it.grado || "",
              jornada: it.salonId?.jornada || it.jornada || "",
              sede: it.salonId?.sede || it.sede || "",
              pesoLibras: 0,
              salonId: idKey,
            };
          }
          acc[idKey].pesoLibras += it.pesoLibras || 0;
          return acc;
        }, {});
        let arr = Object.values(agrupa);

        const salones = resReto.data.salonesAsignados || [];
        setSalonesAsignados(salones);
        salones.forEach((s) => {
          const idKey = (s["_id"] || s).toString();
          if (!arr.find((x) => x.salonId === idKey)) {
            arr.push({
              salonId: idKey,
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

  useEffect(() => {
    async function cargarConsolidado() {
      setLoadingConsolidado(true);
      try {
        const res = await api.get("/retos");
        const retosCerrados = res.data.filter((r) =>
          calcularEstado(r.fechaInicio, r.fechaCierre) === "Cerrado"
        );
        const acumulado = {};
        for (const reto of retosCerrados) {
          const resRecol = await api.get(`/recolecciones/reto/${reto._id}`);
          const agrupa = resRecol.data.reduce((acc, it) => {
            const idKey = (it.salonId?.["_id"] || it.salonId || it.salon || "").toString();
            if (!acc[idKey]) {
              acc[idKey] = {
                salon: it.salonId?.salon || it.salon || "",
                grado: it.salonId?.grado || it.grado || "",
                jornada: it.salonId?.jornada || it.jornada || "",
                sede: it.salonId?.sede || it.sede || "",
                pesoLibras: 0,
              };
            }
            acc[idKey].pesoLibras += it.pesoLibras || 0;
            return acc;
          }, {});
          let arr = Object.values(agrupa);
          const scored = asignarPuntos(arr);
          scored.forEach((item) => {
            if (!item.sede || !item.jornada) return;
            const key =
              aMayusculas(item.sede.trim()) + " - " + aMayusculas(item.jornada.trim());
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
          const key =
            aMayusculas(s.sede.trim()) + " - " + aMayusculas(s.jornada.trim());
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
        arreglo.sort((a, b) => b.puntosTotales - a.puntosTotales);
        arreglo = arreglo.map((item, idx) => ({
          ...item,
          posicion: idx + 1,
          medalla: idx === 0 ? "oro" : idx === 1 ? "plata" : idx === 2 ? "bronce" : null,
        }));
        setTablaConsolidado(arreglo);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingConsolidado(false);
      }
    }
    cargarConsolidado();
  }, []);

  function exportarPDF(ref, nombre) {
    if (!ref.current) return;
    const doc = new jsPDF("landscape");
    doc.setFontSize(18);
    doc.text(nombre, 14, 20);
    autoTable(doc, {
      html: ref.current,
      startY: 30,
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [39, 174, 96], textColor: 255 },
      margin: { left: 10, right: 10 },
    });
    doc.save(`${nombre.replace(/\s+/g, "_")}.pdf`);
  }

  function exportarExcel(ref, nombre) {
    if (!ref.current) return;
    const tablaHtml = ref.current.outerHTML;
    const dataType = "application/vnd.ms-excel";
    const blob = new Blob([tablaHtml], { type: dataType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${nombre.replace(/\s+/g, "_")}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function imprimir(ref) {
    if (!ref.current) return;
    const contenido = ref.current.innerHTML;
    const ventana = window.open("", "", "width=900,height=650");
    ventana.document.write(`
      <html>
        <head>
          <title>Imprimir</title>
          <style>
            body { font-family: sans-serif; padding: 10px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #666; padding: 5px; }
            th { background: #26a626; color: white; }
          </style>
        </head>
        <body>${contenido}</body>
      </html>
    `);
    ventana.document.close();
    ventana.focus();
    ventana.print();
  }

  return (
    <div style={styles.fondo}>
      <main style={styles.container}>
        <div style={styles.topBar}>
          <label htmlFor="select-reto" style={styles.label}>
            Seleccione un reto:
          </label>
          <select
            id="select-reto"
            style={styles.select}
            value={selectedRetoId}
            onChange={(e) => setSelectedRetoId(e.target.value)}
          >
            <option value="">-- Seleccione un reto cerrado --</option>
            {retos.map((r) => (
              <option key={r._id} value={r._id}>
                {aMayusculas(r.nombre)}
              </option>
            ))}
          </select>
          <button onClick={() => window.history.back()} style={styles.btnRegresar}>
            ← Regresar
          </button>
        </div>

        {/* Tabla detalle reto seleccionado */}
        {loadingDetalles ? (
          <LoadingSpinner />
        ) : selectedRetoId ? (
          <>
            <div style={styles.botonesContainer}>
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
                    <tr
                      key={item.salonId || idx}
                      style={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}
                    >
                      <td style={styles.puestoCell}>{darMedalla(idx + 1)}</td>
                      <td style={styles.td}>{item.grado}</td>
                      <td style={styles.td}>{item.salon}</td>
                      <td style={styles.td}>{aMayusculas(item.jornada)}</td>
                      <td style={styles.td}>{aMayusculas(item.sede)}</td>
                      <td style={styles.tdNumber}>{item.pesoLibras.toFixed(2)}</td>
                      <td style={styles.tdNumber}>{item.puntos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : null}

        {/* Tabla consolidado general */}
        <section style={{ marginTop: 40 }}>
          <div style={styles.botonesContainer}>
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
                    tablaConsolidado.map(({ key, sede, jornada, puntosTotales, librasTotales, posicion, medalla }) => (
                      <tr
                        key={key}
                        style={posicion % 2 === 0 ? styles.rowEven : styles.rowOdd}
                      >
                        <td style={styles.puestoCell}>{darMedalla(posicion)}</td>
                        <td style={{ ...styles.td, fontWeight: "bold" }}>{aMayusculas(sede)}</td>
                        <td style={{ ...styles.td, fontWeight: "bold" }}>{aMayusculas(jornada)}</td>
                        <td style={styles.tdNumber}>{puntosTotales}</td>
                        <td style={styles.tdNumber}>{librasTotales.toFixed(2)}</td>
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
      "linear-gradient(rgba(168,224,168,0.55), rgba(86,171,86,0.45)), url('/fondo-ambiental.jpg') no-repeat center center fixed",
    backgroundSize: "cover",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    padding: 20,
  },
  header: {
    width: "100%",
    maxWidth: 980,
    display: "flex",
    justifyContent: "flex-end",
    padding: "12px 30px",
    boxSizing: "border-box",
  },
  btnRegresar: {
    padding: "10px 30px",
    backgroundColor: "#27a627",
    border: "none",
    borderRadius: 25,
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    cursor: "pointer",
    boxShadow: "0 6px 12px rgba(39, 166, 39, 0.6)",
    transition: "background-color 0.3s ease",
    outline: "none",
    userSelect: "none",
  },
  container: {
    width: "100%",
    maxWidth: 980,
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
  topBar: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  titlePage: {
    fontWeight: "700",
    fontSize: 30,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.5,
    color: "#258925",
  },
  label: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 0,
    whiteSpace: "nowrap",
    color: "#2a8f2a",
  },
  select: {
    padding: 12,
    fontSize: 16,
    borderRadius: 10,
    border: "1px solid #8ac08a",
    backgroundColor: "#e8f6e8",
    width: 300,
    maxWidth: "100%",
  },
  tabTitle: {
    fontWeight: "700",
    fontSize: 22,
    color: "#2e8f2e",
    textAlign: "center",
  },
  tableWrap: {
    overflowX: "auto",
    borderRadius: 12,
    boxShadow: "0 3px 12px rgb(35 140 35 / 30%)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  th: {
    backgroundColor: "#cff1c0",
    color: "#2b6c2b",
    fontWeight: "700",
    padding: "10px 14px",
    border: "1px solid #91cc91",
    textAlign: "left",
    whiteSpace: "nowrap",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  td: {
    padding: "10px 14px",
    border: "1px solid #91cc91",
    color: "#2d6d2d",
    fontWeight: "600",
  },
  tdNumber: {
    padding: "10px 14px",
    border: "1px solid #91cc91",
    textAlign: "right",
    fontWeight: "700",
    color: "#268026",
  },
  puestoCell: {
    fontWeight: "700",
    display: "flex",
    flexWrap: "nowrap",
    alignItems: "center",
    gap: 4,
    fontSize: 16,
    color: "#2a8f2a",
    justifyContent: "center",
  },
  rowEven: {
    backgroundColor: "#e6f2e6",
  },
  rowOdd: {
    backgroundColor: "#ddefdb",
  },
  botonesContainer: {
    display: "flex",
    justifyContent: "flex-start",
    gap: 12,
    paddingTop: 6,
    paddingBottom: 6,
  },
  botonAccion: {
    padding: "8px 20px",
    backgroundColor: "#35a735",
    border: "none",
    borderRadius: 24,
    color: "white",
    fontSize: 14,
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(38, 168, 38, 0.6)",
    transition: "background-color 0.3s ease",
    userSelect: "none",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 20,
  },
};
