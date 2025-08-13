import React, { useEffect, useState, useRef } from "react";
import api from "./api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// --- Puntos por ranking y consuelo ---
function puntosPorRanking(posicion, pesoLibras) {
  const tabla = [20, 15, 10, 7, 5, 3, 1];
  if (posicion < 7 && pesoLibras > 0) return tabla[posicion];
  if (pesoLibras > 0) return 1;
  return 0;
}
const Medal = ({ type }) => {
  const colors = { oro: "#ffd700", plata: "#c0c0c0", bronce: "#cd7f32" };
  return (
    <svg width={36} height={36} viewBox="0 0 24 24" fill={colors[type] || "#999"} aria-hidden="true" style={{ marginLeft: 5, verticalAlign: "middle", filter: "drop-shadow(0 0 4px #FFF5)" }}>
      <circle cx={12} cy={12} r={10} stroke="#444" strokeWidth={1.5}/>
      <path d="M7 14l3-3 2 2 5-5" stroke="#444" strokeWidth={2.1} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};
function darMedalla(posicion) {
  if (posicion === 1) return <span style={styles.puestoCell}>{posicion}<Medal type="oro" /></span>;
  if (posicion === 2) return <span style={styles.puestoCell}>{posicion}<Medal type="plata" /></span>;
  if (posicion === 3) return <span style={styles.puestoCell}>{posicion}<Medal type="bronce" /></span>;
  return <span style={{ minWidth: 22, fontWeight: 700, color: "#572a67", background: "rgba(255,255,255,0.6)", borderRadius: 8, display: "inline-block" }}>{posicion}.</span>;
}
function aMayusculas(txt) { return txt ? txt.toString().toUpperCase() : ""; }
const coloresRow = ["#ffe5ec", "#b8e8f5", "#f7ffe0", "#ffe6c5", "#e6e7ff"];

const LoadingSpinner = () => (
  <div style={styles.loadingContainer}>
    <svg width={50} height={50} viewBox="0 0 50 50" style={{ animation: "spin 1.7s linear infinite" }}>
      <circle cx={25} cy={25} r={19} fill="#fff0" stroke="#944fd4" strokeWidth={5} style={{ opacity: 0.27 }}/>
      <path d="M25 6a19 19 0 1 1-16.9 9.4" fill="none" stroke="#ff32b7" strokeWidth={5} strokeLinecap="round" style={{ opacity: 0.8 }}/>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); }}`}</style>
    </svg>
    <span style={{ fontSize: 19, fontWeight: "bold", marginLeft: 13, color: "#e2418c", letterSpacing: 1 }}>
      Cargando información...
    </span>
  </div>
);

export default function ResultadosGenerales() {
  const [loading, setLoading] = useState(true);
  const [totalRetos, setTotalRetos] = useState(0);
  const [totalLibras, setTotalLibras] = useState(0);
  const [totalPuntos, setTotalPuntos] = useState(0);
  const [rankingSede, setRankingSede] = useState([]);
  const [rankingJornada, setRankingJornada] = useState([]);
  const [tablaSalon, setTablaSalon] = useState([]);
  const sedeRef = useRef(null);
  const jornadaRef = useRef(null);
  const salonRef = useRef(null);

  useEffect(() => {
    async function cargarDatos() {
      setLoading(true);
      try {
        const resRetos = await api.get("/retos");
        const retosCerrados = resRetos.data.filter(
          (r) => new Date() > new Date(r.fechaCierre + "T23:59:59")
        );
        setTotalRetos(retosCerrados.length);
        const puntosPorSede = {}, puntosPorJornada = {}, puntosPorSalon = {};
        let acumuladoLibras = 0, acumuladoPuntos = 0;
        function idCurso(item) {
          return (item.salonId?._id || item.salonId || item.salon || "").toString();
        }
        for (const reto of retosCerrados) {
          const resRecolect = await api.get(`/recolecciones/reto/${reto._id}`);
          const recolectas = resRecolect.data || [];
          const agrupado = {};
          recolectas.forEach(item => {
            const salonId = idCurso(item);
            if (!agrupado[salonId]) {
              agrupado[salonId] = {
                salonId,
                pesoLibras: 0,
                grado: item.salonId?.grado || item.grado || "",
                salon: item.salonId?.salon || item.salon || "",
                jornada: item.salonId?.jornada || item.jornada || "",
                sede: item.salonId?.sede || item.sede || "",
              };
            }
            agrupado[salonId].pesoLibras += item.pesoLibras || 0;
          });
          let rankingArr = Object.values(agrupado);
          rankingArr.sort((a, b) => b.pesoLibras - a.pesoLibras);
          rankingArr.forEach((item, idx) => {
            const puntos = puntosPorRanking(idx, item.pesoLibras);
            const sede = aMayusculas(item.sede);
            const jornada = aMayusculas(item.jornada);
            const salonKey = (item.grado + " " + item.salon + " " + item.jornada + " " + item.sede).trim();
            if (!puntosPorSede[sede]) puntosPorSede[sede] = { puntos: 0, libras: 0 };
            puntosPorSede[sede].puntos += puntos;
            puntosPorSede[sede].libras += item.pesoLibras || 0;
            if (!puntosPorJornada[jornada]) puntosPorJornada[jornada] = { puntos: 0, libras: 0 };
            puntosPorJornada[jornada].puntos += puntos;
            puntosPorJornada[jornada].libras += item.pesoLibras || 0;
            if (!puntosPorSalon[salonKey]) puntosPorSalon[salonKey] = { puntos: 0, libras: 0 };
            puntosPorSalon[salonKey].puntos += puntos;
            puntosPorSalon[salonKey].libras += item.pesoLibras || 0;
            acumuladoPuntos += puntos;
            acumuladoLibras += item.pesoLibras || 0;
          });
        }
        setTotalLibras(acumuladoLibras);
        setTotalPuntos(acumuladoPuntos);
        let rankingSedeArr = Object.entries(puntosPorSede)
          .map(([sede, vals]) => ({ sede, puntosTotales: vals.puntos, librasTotales: vals.libras }))
          .sort((a, b) => b.puntosTotales - a.puntosTotales)
          .map((item, idx) => ({
            ...item, posicion: idx + 1,
            medalla: idx === 0 ? "oro" : idx === 1 ? "plata" : idx === 2 ? "bronce" : null,
          }));
        setRankingSede(rankingSedeArr);

        let rankingJornadaArr = Object.entries(puntosPorJornada)
          .map(([jornada, vals]) => ({ jornada, puntosTotales: vals.puntos, librasTotales: vals.libras }))
          .sort((a, b) => b.puntosTotales - a.puntosTotales)
          .map((item, idx) => ({
            ...item, posicion: idx + 1,
            medalla: idx === 0 ? "oro" : idx === 1 ? "plata" : idx === 2 ? "bronce" : null,
          }));
        setRankingJornada(rankingJornadaArr);

        let rankingSalonArr = Object.entries(puntosPorSalon)
          .map(([salon, vals]) => ({ curso: salon, puntosTotales: vals.puntos }))
          .sort((a, b) => b.puntosTotales - a.puntosTotales)
          .map((item, idx) => ({
            ...item, posicion: idx + 1
          }));
        setTablaSalon(rankingSalonArr);

      } catch (err) {
        setRankingSede([]); setRankingJornada([]); setTablaSalon([]);
        setTotalRetos(0); setTotalLibras(0); setTotalPuntos(0);
        console.error("Error en resultados generales:", err);
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

  function exportarPDF(ref, nombre) {
    if (!ref.current) {
      alert("No hay tabla para exportar.");
      return;
    }
    // Busca el nodo <table> dentro del ref (sea div o table)
    const table = ref.current.querySelector ? ref.current.querySelector("table") : ref.current;
    if (!table) {
      alert("No hay tabla para exportar.");
      return;
    }
    const rowsLength = table.tBodies?.[0]?.rows?.length || 0;
    if (rowsLength === 0) {
      alert("No hay datos para exportar.");
      return;
    }
    const doc = new jsPDF("landscape");
    doc.setFontSize(18);
    doc.text(nombre, 16, 22);
    autoTable(doc, {
      html: table,
      startY: 38,
      styles: { fontSize: 12, cellPadding: 3 },
      headStyles: { fillColor: [137, 36, 184], textColor: 255 },
      margin: { left: 18, right: 18 },
    });
    doc.save(`${nombre.replace(/\s+/g, "_")}.pdf`);
  }
  function exportarExcel(ref, nombre) {
    if (!ref.current) return;
    const table = ref.current.querySelector ? ref.current.querySelector("table") : ref.current;
    if (!table) return;
    const tablaHtml = table.outerHTML;
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
    const table = ref.current.querySelector ? ref.current.querySelector("table") : ref.current;
    if (!table) return;
    const contenido = table.outerHTML;
    const ventana = window.open("", "", "width=1200,height=650");
    ventana.document.write(`
      <html><head><title>Imprimir</title>
      <style>
        body { font-family: sans-serif; padding: 10px; background: #ffe5ec; }
        table { border-collapse: separate; border-spacing: 0 8px; width: 100%; }
        th, td { border: 1.7px solid #a27de1; padding: 8px; }
        th { background: linear-gradient(90deg, #bd60b7, #2bd79e 80%); color: white; font-weight: bold;}
        tr:hover td { background-color: #fffecb !important; }
      </style>
      </head><body>${contenido}</body></html>`);
    ventana.document.close(); ventana.focus(); ventana.print();
  }

  return (
    <div style={styles.fondo}>
      <main style={styles.container}>
        <h1 style={styles.titlePage}>🌟 Resultados Generales 🌟</h1>
        <section style={{ position: "relative", minHeight: 170, marginBottom: 26 }}>
          <div style={styles.logoFondoBox}>
            <img
              src="/logo.png"
              alt="logo fondo"
              style={styles.logoFondo}
              draggable={false}
            />
          </div>
          <h2 style={styles.subTitle}>Totales Generales</h2>
          <div style={styles.totalesContainer}>
            <div style={styles.totalBox}>
              <div style={styles.totalNumber}>{totalRetos}</div>
              <div>Retos terminados</div>
            </div>
            <div style={styles.totalBox}>
              <div style={styles.totalNumber}>{totalLibras.toFixed(2)}</div>
              <div>Libras recicladas</div>
            </div>
            <div style={styles.totalBox}>
              <div style={styles.totalNumber}>{totalPuntos}</div>
              <div>Puntos totales</div>
            </div>
          </div>
        </section>
        {loading ? (<LoadingSpinner />) : (
          <>
            {/* TABLAS */}
            <section style={{ marginBottom: 30 }}>
              <h2 style={styles.tabTitle}>🥇 Ranking por Sede</h2>
              <div style={styles.tableWrap} ref={sedeRef}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Puesto</th>
                      <th style={styles.th}>Sede</th>
                      <th style={styles.th}>Puntos</th>
                      <th style={styles.th}>Libras</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingSede.length === 0 ? (
                      <tr><td colSpan={4} style={styles.td}>No hay datos</td></tr>
                    ) : (
                      rankingSede.map((item, idx) => (
                        <tr
                          key={item.sede}
                          style={{
                            backgroundColor: coloresRow[idx % coloresRow.length],
                            outline: idx < 3 ? "3px solid #926eee" : undefined,
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#cfd9ff"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = coloresRow[idx % coloresRow.length]}
                        >
                          <td style={styles.puestoCell}>{darMedalla(idx + 1)}</td>
                          <td style={{ ...styles.td, fontWeight: "bold", letterSpacing: 2 }}>{aMayusculas(item.sede)}</td>
                          <td style={styles.tdNumber}>{item.puntosTotales}</td>
                          <td style={styles.tdNumber}>{item.librasTotales.toFixed(2)}</td>
                        </tr>
                    )))}
                  </tbody>
                </table>
              </div>
              <div style={styles.botonesContainer}>
                <button onClick={() => imprimir(sedeRef)} style={styles.botonAccion}>🖨️ Imprimir</button>
                <button onClick={() => exportarPDF(sedeRef, "Ranking_Por_Sede")} style={styles.botonAccion}>📄 Exportar PDF</button>
                <button onClick={() => exportarExcel(sedeRef, "Ranking_Por_Sede")} style={styles.botonAccion}>📊 Exportar Excel</button>
              </div>
            </section>
            <section style={{ marginBottom: 30 }}>
              <h2 style={styles.tabTitle}>🎯 Ranking por Jornada</h2>
              <div style={styles.tableWrap} ref={jornadaRef}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Puesto</th>
                      <th style={styles.th}>Jornada</th>
                      <th style={styles.th}>Puntos</th>
                      <th style={styles.th}>Libras</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rankingJornada.length === 0 ? (
                      <tr><td colSpan={4} style={styles.td}>No hay datos</td></tr>
                    ) : (
                      rankingJornada.map((item, idx) => (
                        <tr
                          key={item.jornada}
                          style={{
                            backgroundColor: coloresRow[idx % coloresRow.length],
                            outline: idx < 3 ? "3px solid #f84d88" : undefined,
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#ffe69c"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = coloresRow[idx % coloresRow.length]}
                        >
                          <td style={styles.puestoCell}>{darMedalla(idx + 1)}</td>
                          <td style={{ ...styles.td, fontWeight: "bold", letterSpacing: 2 }}>{aMayusculas(item.jornada)}</td>
                          <td style={styles.tdNumber}>{item.puntosTotales}</td>
                          <td style={styles.tdNumber}>{item.librasTotales.toFixed(2)}</td>
                        </tr>
                    )))}
                  </tbody>
                </table>
              </div>
              <div style={styles.botonesContainer}>
                <button onClick={() => imprimir(jornadaRef)} style={styles.botonAccion}>🖨️ Imprimir</button>
                <button onClick={() => exportarPDF(jornadaRef, "Ranking_Por_Jornada")} style={styles.botonAccion}>📄 Exportar PDF</button>
                <button onClick={() => exportarExcel(jornadaRef, "Ranking_Por_Jornada")} style={styles.botonAccion}>📊 Exportar Excel</button>
              </div>
            </section>
            <section style={{ marginTop: 32 }}>
              <h2 style={styles.tabTitle}>🏆 Ranking Final por Salón</h2>
              <div style={styles.tableWrap} ref={salonRef}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Puesto</th>
                      <th style={styles.th}>CURSO</th>
                      <th style={styles.th}>Puntos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tablaSalon.length === 0 ? (
                      <tr><td colSpan={3} style={styles.td}>No hay datos</td></tr>
                    ) : (
                      tablaSalon.map((item, idx) => (
                        <tr
                          key={item.curso}
                          style={{
                            backgroundColor: coloresRow[idx % coloresRow.length],
                            outline: idx < 3 ? "3px solid #46ecb6" : undefined,
                            cursor: "pointer",
                            transition: "background-color 0.2s",
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = "#f0c1ff"}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = coloresRow[idx % coloresRow.length]}
                        >
                          <td style={styles.puestoCell}>{darMedalla(idx + 1)}</td>
                          <td style={{ ...styles.td, fontWeight: "bold", letterSpacing: 2 }}>{aMayusculas(item.curso)}</td>
                          <td style={styles.tdNumber}>{item.puntosTotales}</td>
                        </tr>
                    )))}
                  </tbody>
                </table>
              </div>
              <div style={styles.botonesContainer}>
                <button onClick={() => imprimir(salonRef)} style={styles.botonAccion}>🖨️ Imprimir</button>
                <button onClick={() => exportarPDF(salonRef, "Ranking_Final_Por_Salon")} style={styles.botonAccion}>📄 Exportar PDF</button>
                <button onClick={() => exportarExcel(salonRef, "Ranking_Final_Por_Salon")} style={styles.botonAccion}>📊 Exportar Excel</button>
              </div>
            </section>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 30, marginBottom: 8 }}>
              <button
                style={styles.btnRegresar}
                onClick={() => window.history.back()}
                onMouseEnter={e => e.currentTarget.style.background = "linear-gradient(90deg, #e671d4, #23caf7 90%)"}
                onMouseLeave={e => e.currentTarget.style.background = "linear-gradient(90deg, #8e43e7, #4caf50 85%)"}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" style={{ marginRight: 7, verticalAlign: "middle" }}>
                  <path d="M9.5 7l-5 5 5 5M4.5 12h15" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontWeight: "bold", fontSize: 18, letterSpacing: 2 }}>Volver</span>
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

const styles = {
  fondo: {
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(120deg, #faf3df, #ffeae6 32%, #f3e6ff 100%)",
    backgroundSize: "cover", display: "flex", justifyContent: "center", alignItems: "flex-start", padding: 18,
  },
  container: {
    width: "100%",
    maxWidth: 750,
    backgroundColor: "rgba(255,255,255,0.97)",
    borderRadius: 23,
    padding: 32,
    boxShadow: "0 8px 44px rgba(146, 62, 181, 0.13)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#1b3a31", display: "flex", flexDirection: "column", gap: 25,
    marginTop: 0, minHeight: "88vh", position: "relative"
  },
  logoFondoBox: {
    pointerEvents: "none",
    position: "absolute",
    left: 0,
    top: "10px",
    width: "100%",
    height: 210,
    zIndex: 0,
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    overflow: "hidden",
  },
  logoFondo: {
    width: 240,
    height: 240,
    opacity: 0.11,
    filter: "blur(0.5px) grayscale(0.2)",
    objectFit: "contain",
    userSelect: "none",
    zIndex: 0,
    marginTop: 0,
  },
  titlePage: {
    fontWeight: "900", fontSize: 35, textAlign: "center",
    marginBottom: 20, letterSpacing: 1.2, color: "#AE2C7C",
    textShadow: "2px 2px 10px #fcb6e6cc, 0 0 3px #fff",
  },
  subTitle: { fontWeight: "800", fontSize: 22, color: "#6438a9", textAlign: "center", marginBottom: 16, letterSpacing: 0.7, textShadow: "0 0 10px #ffaffe54" },
  totalesContainer: { display: "flex", justifyContent: "center", gap: 36, marginTop: 8, flexWrap: "wrap" },
  totalBox: {
    background: "linear-gradient(140deg,#fff8db, #ffe6e6 75%, #f1f5ff 100%)",
    border: "3px solid #f47edb", borderRadius: 16, padding: 23, width: 185,
    textAlign: "center", color: "#ae2c7c", fontWeight: 900, fontSize: 20,
    boxShadow: "0 2px 10px #ecb5ed79, 0 0 10px #d0ecf6d7 inset", userSelect: "none",
    outline: "3.5px dashed #f8f3ff69",
    transition: "box-shadow 0.3s",
  },
  totalNumber: {
    fontSize: 44, marginBottom: 7, color: "#ae2c7c", textShadow: "2px 2px 12px #fcbeee, 0 0 7px #fff",
    letterSpacing: 1.2,
  },
  tableWrap: {
    overflowX: "auto", borderRadius: 16,
    boxShadow: "0 8px 36px rgba(212, 88, 234, 0.13)", marginTop: 11,
  },
  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 10px",
    fontSize: 16, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  th: {
    background: "linear-gradient(90deg, #9f22b9, #2bd8e6 75%, #fffde4 100%)",
    color: "#fff", fontWeight: 900, padding: "16px 18px",
    textAlign: "center", border: "none", borderTopLeftRadius: 16, borderTopRightRadius: 16,
    fontSize: 17, userSelect: "none", boxShadow: "0 3.5px 11px #e733b833",
    textShadow: "1px 1px 6px #952ae348",
    letterSpacing: 1.2,
  },
  td: {
    backgroundColor: "#fff8fc", padding: "14px 16px", color: "#622088",
    fontWeight: "800", borderBottom: "2px solid #8853ad29", transition: "background-color 0.3s",
    textAlign: "center", cursor: "pointer", letterSpacing: 1,
    fontSize: 16,
  },
  tdNumber: {
    backgroundColor: "#fff8fc", padding: "14px 16px", color: "#068e67",
    fontWeight: "900", borderBottom: "2px solid #74e6d92c", textAlign: "center", transition: "background-color 0.3s",
    fontSize: 17,
    letterSpacing: 1.2,
    cursor: "pointer", userSelect: "none",
  },
  puestoCell: {
    fontWeight: "900", display: "flex", alignItems: "center", gap: 10,
    fontSize: 20, color: "#ae2c7c", justifyContent: "center", userSelect: "none",
    textShadow: "1px 1px 4px #ffdef7ac"
  },
  rowEven: { backgroundColor: "#e3f4fd" },
  rowOdd: { backgroundColor: "#fff7e1" },
  botonesContainer: { display: "flex", justifyContent: "flex-start", gap: 14, paddingTop: 10, paddingBottom: 14 },
  botonAccion: { padding: "14px 24px", background: "linear-gradient(90deg,#f342d1,#4faee3 90%)", border: "none", borderRadius: 30, color: "#fff", fontSize: "17px", fontWeight: "900", letterSpacing: 1, cursor: "pointer", boxShadow: "0 6px 14px #dab7f3a5", transition: "filter 0.2s, background 0.21s", filter: "brightness(1.06)", },
  loadingContainer: { display: "flex", alignItems: "center", justifyContent: "center", gap: 18, padding: 30, },
  btnRegresar: { padding: "15px 30px", background: "linear-gradient(90deg, #8e43e7, #4caf50 85%)", border: "none", borderRadius: 32, color: "#fff", fontSize: "20px", fontWeight: "900", letterSpacing: 2, cursor: "pointer", boxShadow: "0 10px 36px #a261e1dc", transition: "background .32s, filter .24s", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, margin: "0 auto", },
};
