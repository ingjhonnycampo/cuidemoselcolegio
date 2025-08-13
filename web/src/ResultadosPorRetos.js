import React, { useEffect, useState } from "react";
import api from "./api";

const Medal = ({ type }) => {
  const colors = {
    oro: "#ffd700",
    plata: "#c0c0c0",
    bronce: "#cd7f32",
  };
  const color = colors[type] || "#999";
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill={color}
      aria-hidden="true"
      style={{ marginLeft: 5, verticalAlign: "middle" }}
    >
      <circle cx="12" cy="12" r="10" stroke="#444" strokeWidth="1" />
      <path
        d="M7 14l3-3 2 2 5-5"
        stroke="#444"
        strokeWidth="2"
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

export default function ResultadosPorRetos() {
  const [retos, setRetos] = useState([]);
  const [selectedRetoId, setSelectedRetoId] = useState("");
  const [ranking, setRanking] = useState([]);
  const [puntuacion, setPuntuacion] = useState([]);
  const [salonesAsignados, setSalonesAsignados] = useState([]);

  useEffect(() => {
    api
      .get("/retos")
      .then((res) => {
        const retosCerrados = res.data.filter(
          (ret) => calcularEstado(ret.fechaInicio, ret.fechaCierre) === "Cerrado"
        );
        setRetos(retosCerrados);
      })
      .catch((err) => {
        console.error("Error al cargar retos:", err);
      });
  }, []);

  useEffect(() => {
    if (!selectedRetoId) {
      setSalonesAsignados([]);
      return;
    }
    api
      .get(`/retos/${selectedRetoId}`)
      .then((res) => {
        setSalonesAsignados(res.data.salonesAsignados || []);
      })
      .catch(() => {
        setSalonesAsignados([]);
      });
  }, [selectedRetoId]);

  useEffect(() => {
    if (!selectedRetoId) {
      setRanking([]);
      setPuntuacion([]);
      return;
    }

    api
      .get(`/recolecciones/reto/${selectedRetoId}`)
      .then((res) => {
        const agrupadoPorSalon = res.data.reduce((acc, item) => {
          const salonId = (item.salonId?._id || item.salonId || item.salon || "").toString();
          const salonNombre = item.salonId?.salon || item.salon || "";
          const grado = item.salonId?.grado || item.grado || "";
          const jornada = item.salonId?.jornada || item.jornada || "";
          const sede = item.salonId?.sede || item.sede || "";
          const pesoLibras = item.pesoLibras || 0;
          if (!acc[salonId]) {
            acc[salonId] = {
              salonId,
              salon: salonNombre,
              grado,
              jornada,
              sede,
              pesoLibras: 0,
            };
          }
          acc[salonId].pesoLibras += pesoLibras;
          return acc;
        }, {});
        let rankingMapeado = Object.values(agrupadoPorSalon);

        salonesAsignados.forEach((salonAsignado) => {
          const idSalon = (salonAsignado._id || salonAsignado).toString();
          if (!rankingMapeado.find((r) => r.salonId === idSalon)) {
            rankingMapeado.push({
              salonId: idSalon,
              salon: salonAsignado.salon || "",
              grado: salonAsignado.grado || "",
              jornada: salonAsignado.jornada || "",
              sede: salonAsignado.sede || "",
              pesoLibras: 0,
            });
          }
        });

        rankingMapeado.sort((a, b) => b.pesoLibras - a.pesoLibras);

        setRanking(rankingMapeado);
        calcularPuntuacion(rankingMapeado);
      })
      .catch((err) => {
        console.error("Error al cargar resultados:", err);
        setRanking([]);
        setPuntuacion([]);
      });
  }, [selectedRetoId, salonesAsignados]);

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

  // Devuelve el número+medalla para top 3, solo número para el resto
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
          <Medal type="bronce" />
        </span>
      );
    return position + ".";
  }

  const totalPeso = ranking.reduce((acc, cur) => acc + (cur.pesoLibras || 0), 0);

  return (
    <div style={styles.fondo}>
      <div style={styles.container}>
        <h1 style={styles.titlePage}>Resultados por Reto</h1>

        <label style={styles.label} htmlFor="selectReto">
          Selecciona un reto
        </label>
        <select
          id="selectReto"
          onChange={(e) => setSelectedRetoId(e.target.value)}
          value={selectedRetoId}
          style={styles.select}
        >
          <option value="">-- Selecciona un reto cerrado --</option>
          {retos.map((r) => (
            <option key={r._id} value={r._id}>
              {r.nombre}
            </option>
          ))}
        </select>

        {!selectedRetoId && (
          <div style={styles.messageBox}>
            <span>
              Por favor selecciona un reto para ver resultados.<br />
              <span style={styles.reminder}>
                Recuerda que los retos deben estar cerrados para poder ver los resultados.
              </span>
            </span>
          </div>
        )}

        {selectedRetoId && (
          <>
            <h2 style={styles.tabTitle}>Ranking por Peso Reciclado</h2>
            <div style={styles.tableWrap}>
              <svg style={styles.svgFondo} viewBox="0 0 800 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="svggrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#eaf9ee" />
                    <stop offset="100%" stopColor="#e1f4fc" />
                  </linearGradient>
                  <pattern id="circles" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="16" fill="#cbe8cc" opacity="0.22"/>
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
                    <tr
                      key={item.salonId || idx}
                      style={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}
                    >
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
                      Total Peso (lbs):
                    </td>
                    <td style={{ ...styles.tdNumber, fontWeight: "bold" }}>
                      {totalPeso.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2 style={styles.tabSubtitle}>Tabla de puntos obtenidos en el reto</h2>
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
                    <tr
                      key={item.salonId || idx}
                      style={idx % 2 === 0 ? styles.rowEven : styles.rowOdd}
                    >
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

        {/* Botón regresar SIEMPRE visible */}
        <button
          style={styles.btnRegresar}
          onClick={() => window.history.back()}
        >
          <svg style={{ marginRight: 9 }} width="22" height="22" viewBox="0 0 20 20" fill="none">
            <path d="M9 16L3 10L9 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 10H17" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Regresar
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
    minHeight: "88vh"
  },
  titlePage: {
    fontWeight: "700",
    fontSize: 30,
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: 0.5,
    color: "#1E5937",
  },
  label: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 10,
    color: "#267d53",
  },
  select: {
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    borderRadius: 10,
    border: "1px solid #a5d18e",
    backgroundColor: "#ecf4e7",
    width: 300,
    maxWidth: "100%"
  },
  tabTitle: {
    fontWeight: "bold",
    fontSize: 23,
    textAlign: "center",
    color: "#267d53",
    letterSpacing: 0.3,
    margin: "18px 0 10px 0"
  },
  tabSubtitle: {
    fontWeight: "bold",
    fontSize: 21,
    textAlign: "center",
    color: "#397087",
    letterSpacing: 0.2,
    margin: "28px 0 12px 0"
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
    marginBottom: 30
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
  tableWrap: {
    position: "relative",
    borderRadius: 16,
    marginBottom: 8,
    overflowX: "auto", // scroll horizontal para móvil
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
