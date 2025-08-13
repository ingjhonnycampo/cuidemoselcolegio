import React, { useEffect, useState, useRef } from "react";
import api from "./api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Medal = ({ type }) => {
  const colors = {
    oro: "#ffd700",
    plata: "#c0c0c0",
    bronce: "#cd7f32",
  };
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill={colors[type] || "#999"}
      aria-hidden="true"
      style={{ marginLeft: 4, verticalAlign: "bottom" }}
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

function darMedalla(position) {
  if (position === 1)
    return (
      <span
        style={{
          fontWeight: 600,
          color: "#DAA520",
          whiteSpace: "nowrap",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 11,
          justifyContent: "center",
        }}
      >
        {position} <Medal type="oro" />
      </span>
    );
  if (position === 2)
    return (
      <span
        style={{
          fontWeight: 600,
          color: "#c0c0c0",
          whiteSpace: "nowrap",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 11,
          justifyContent: "center",
        }}
      >
        {position} <Medal type="plata" />
      </span>
    );
  if (position === 3)
    return (
      <span
        style={{
          fontWeight: 600,
          color: "#CD7F32",
          whiteSpace: "nowrap",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          fontSize: 11,
          justifyContent: "center",
        }}
      >
        {position} <Medal type="bronce" />
      </span>
    );
  return (
    <span
      style={{
        fontSize: 11,
        whiteSpace: "nowrap",
        fontWeight: 600,
        textAlign: "center",
        display: "inline-block",
        minWidth: 16,
      }}
    >
      {position}.
    </span>
  );
}

// Función para capitalizar primera letra de cada palabra
function titleCase(str) {
  return str
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const coloresRetos = ["#d7efd9", "#c5e1a5"]; // tonos verde claro suaves
const colorFondoAzul = "#1e40af";
const colorTextoBlanco = "white";

export default function ResultadosPorRetos() {
  const [retos, setRetos] = useState([]);
  const [selectedRetoId, setSelectedRetoId] = useState("");
  const [ranking, setRanking] = useState([]);
  const [puntuacion, setPuntuacion] = useState([]);
  const [salonesAsignados, setSalonesAsignados] = useState([]);

  const [reporteHistoricoCursos, setReporteHistoricoCursos] = useState([]);
  const [cargandoHistorico, setCargandoHistorico] = useState(false);

  const reporteRef = useRef(null);

  // Carga retos cerrados
  useEffect(() => {
    api
      .get("/retos")
      .then((res) => {
        const retosCerrados = res.data.filter((ret) => {
          const ahora = new Date();
          const cierre = new Date(ret.fechaCierre + "T23:59:59");
          return ahora > cierre;
        });
        setRetos(retosCerrados);
      })
      .catch((err) => {
        console.error("Error al cargar retos:", err);
      });
  }, []);

  // Carga salones asignados al reto seleccionado
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

  // Carga ranking y calcula puntuación para el reto seleccionado
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
            acc[salonId] = { salonId, salon: salonNombre, grado, jornada, sede, pesoLibras: 0 };
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

        const puntosPosicion = [20, 15, 10, 7, 5, 3, 1];
        const nuevaPuntuacion = rankingMapeado.map((item, idx) => {
          if (idx < puntosPosicion.length) {
            return { ...item, puntos: item.pesoLibras > 0 ? puntosPosicion[idx] : 0 };
          } else {
            return { ...item, puntos: item.pesoLibras > 0 ? 1 : 0 };
          }
        });
        setPuntuacion(nuevaPuntuacion);
      })
      .catch((err) => {
        console.error("Error al cargar resultados:", err);
        setRanking([]);
        setPuntuacion([]);
      });
  }, [selectedRetoId, salonesAsignados]);

  // Reporte histórico general por cursos con regla corregida de puntos
  useEffect(() => {
    async function cargarHistorico() {
      setCargandoHistorico(true);
      try {
        const resRetos = await api.get("/retos");
        const retosCerrados = resRetos.data.filter((r) => {
          const cierre = new Date(r.fechaCierre + "T23:59:59");
          return new Date() > cierre;
        });
        if (retosCerrados.length === 0) {
          setReporteHistoricoCursos([]);
          setCargandoHistorico(false);
          return;
        }

        const resCursos = await api.get("/salones");
        const cursos = resCursos.data || [];

        const retosData = [];
        for (const reto of retosCerrados) {
          const resRecolect = await api.get(`/recolecciones/reto/${reto._id}`);
          retosData.push({
            retoId: reto._id,
            nombreReto: reto.nombre,
            ranking: resRecolect.data || [],
          });
        }

        const cursosMap = {};
        cursos.forEach((c) => {
          cursosMap[c._id] = {
            nombreCurso: `${c.grado} ${c.salon} ${c.jornada} (${c.sede})`.trim(),
            nroEstudiantes: c.nroEstudiantes || 0,
          };
        });

        const resumenCursos = {};
        for (const reto of retosData) {
          const rankingPorCurso = {};

          reto.ranking.forEach((rec) => {
            const cursoId = (rec.salonId?._id || rec.salonId || rec.salon || "").toString();
            if (!rankingPorCurso[cursoId]) rankingPorCurso[cursoId] = { pesoLibras: 0 };
            rankingPorCurso[cursoId].pesoLibras += Number(rec.pesoLibras) || 0;
          });

          const rankingArr = Object.keys(rankingPorCurso).map((cursoId) => ({
            cursoId,
            pesoLibras: rankingPorCurso[cursoId].pesoLibras,
            nroEstudiantes: cursosMap[cursoId]?.nroEstudiantes || 0,
          }));

          rankingArr.sort((a, b) => {
            if (b.pesoLibras !== a.pesoLibras) return b.pesoLibras - a.pesoLibras;
            return a.nroEstudiantes - b.nroEstudiantes;
          });

          let posicionActual = 0;
          let ultimoPeso = null;
          let ultimoEstudiantes = null;
          let contador = 1;
          rankingArr.forEach((item) => {
            if (item.pesoLibras !== ultimoPeso || item.nroEstudiantes !== ultimoEstudiantes) {
              posicionActual = contador;
              ultimoPeso = item.pesoLibras;
              ultimoEstudiantes = item.nroEstudiantes;
            }
            item.posicion = posicionActual;
            contador++;
          });

          rankingArr.forEach((item) => {
            if (!resumenCursos[item.cursoId]) {
              resumenCursos[item.cursoId] = {
                cursoId: item.cursoId,
                nombreCurso: cursosMap[item.cursoId]?.nombreCurso || item.cursoId,
                nroEstudiantes: cursosMap[item.cursoId]?.nroEstudiantes || 0,
                porReto: [],
                totalPuntos: 0,
                totalLibras: 0,
              };
            }
            let puntos = 0;
            const pos = item.posicion;
            if (pos === 1) puntos = 20;
            else if (pos === 2) puntos = 15;
            else if (pos === 3) puntos = 10;
            else if (pos === 4) puntos = 7;
            else if (pos === 5) puntos = 5;
            else if (pos === 6) puntos = 3;
            else if (pos === 7) puntos = 1;
            else if (item.pesoLibras > 0) puntos = 1;  // <-- Esta línea corregida

            resumenCursos[item.cursoId].porReto.push({
              retoId: reto.retoId,
              nombreReto: reto.nombreReto,
              posicion: pos,
              puntos,
              pesoLibras: item.pesoLibras,
            });

            resumenCursos[item.cursoId].totalPuntos += puntos;
            resumenCursos[item.cursoId].totalLibras += item.pesoLibras;
          });

          Object.keys(cursosMap).forEach((cursoId) => {
            if (!resumenCursos[cursoId]) {
              resumenCursos[cursoId] = {
                cursoId,
                nombreCurso: cursosMap[cursoId].nombreCurso,
                nroEstudiantes: cursosMap[cursoId].nroEstudiantes,
                porReto: [],
                totalPuntos: 0,
                totalLibras: 0,
              };
            }
            if (!rankingPorCurso[cursoId]) {
              resumenCursos[cursoId].porReto.push({
                retoId: reto.retoId,
                nombreReto: reto.nombreReto,
                posicion: "-",
                puntos: 0,
                pesoLibras: 0,
              });
            }
          });
        }

        const resumenArray = Object.values(resumenCursos);
        resumenArray.sort((a, b) => b.totalPuntos - a.totalPuntos);

        setReporteHistoricoCursos(resumenArray);
      } catch (error) {
        console.error("Error cargando reporte histórico cursos:", error);
        setReporteHistoricoCursos([]);
      } finally {
        setCargandoHistorico(false);
      }
    }
    cargarHistorico();
  }, []);

  // Exportar PDF
  function exportarPDF() {
    if (!reporteRef.current) return;
    const doc = new jsPDF();
    doc.text("Reporte Histórico General por Cursos", 14, 20);
    autoTable(doc, { html: reporteRef.current, startY: 30 });
    doc.save("reporte_historico_general.pdf");
  }

  // Exportar Excel (simple, basado en tabla HTML)
  function exportarExcel() {
    if (!reporteRef.current) return;
    const tablaHtml = reporteRef.current.outerHTML;
    const dataType = "application/vnd.ms-excel";
    const blob = new Blob([tablaHtml], { type: dataType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reporte_historico_general.xls";
    link.click();
    URL.revokeObjectURL(url);
  }

  // Regresar
  function regresar() {
    window.history.back();
  }

  return (
    <div style={styles.fondo}>
      <div style={styles.container}>
        {/* Botones de acción */}
        <div style={styles.botonesContainer}>
          <button style={styles.botonAccion} onClick={exportarPDF}>
            📄 Exportar PDF
          </button>
          <button style={styles.botonAccion} onClick={exportarExcel}>
            📊 Exportar Excel
          </button>
          <button style={{ ...styles.botonAccion, ...styles.botonRegresar }} onClick={regresar}>
            ↩ Regresar
          </button>
        </div>

        <hr style={{ margin: "25px 0 10px 0", borderColor: "#267d53" }} />
        <h2
          style={{
            marginBottom: 12,
            color: "#2a8f56",
            fontWeight: "bold",
            textAlign: "center",
            textShadow: "0 0 6px #a0dca0",
          }}
        >
          Reporte Histórico General por Cursos
        </h2>

        {cargandoHistorico ? (
          <div style={{ textAlign: "center", fontSize: 16, color: "#267d53" }}>
            Cargando reporte histórico...
          </div>
        ) : reporteHistoricoCursos.length === 0 ? (
          <div style={{ textAlign: "center", fontSize: 16, color: "#555" }}>
            No hay datos de reporte histórico por cursos disponibles.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table ref={reporteRef} style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Pos.</th>
                  <th style={styles.th}>Curso</th>
                  {reporteHistoricoCursos[0]?.porReto.map((pr) => (
                    <th
                      key={pr.retoId}
                      colSpan={3}
                      style={{
                        ...styles.th,
                        backgroundColor: colorFondoAzul,
                        color: colorTextoBlanco,
                        fontWeight: "700",
                        textShadow: "1px 1px 3px rgba(0,0,0,0.4)",
                      }}
                    >
                      {pr.nombreReto}
                    </th>
                  ))}
                  <th style={styles.th}>Puntos Totales</th>
                  <th style={styles.th}>Libras Totales</th>
                </tr>
                <tr style={{ backgroundColor: colorFondoAzul, color: colorTextoBlanco, fontWeight: "700" }}>
                  <th></th>
                  <th></th>
                  {reporteHistoricoCursos[0]?.porReto.map((pr) => (
                    <React.Fragment key={pr.retoId}>
                      <th style={styles.th}>Puesto</th>
                      <th style={styles.th}>Pts</th>
                      <th style={styles.th}>Lbs</th>
                    </React.Fragment>
                  ))}
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {reporteHistoricoCursos.map((curso, idx) => (
                  <tr
                    key={curso.cursoId || idx}
                    style={idx % 2 === 0 ? styles.rowEvenColorido : styles.rowOddColorido}
                  >
                    <td style={{ ...styles.tdNumber, fontWeight: "bold", textAlign: "center" }}>
                      {darMedalla(idx + 1)}
                    </td>
                    <td
                      style={{
                        ...styles.td,
                        fontSize: 13,
                        fontWeight: "700",
                        textTransform: "capitalize",
                      }}
                    >
                      {titleCase(curso.nombreCurso)}
                    </td>
                    {curso.porReto.map((pr, ix) => {
                      const bgColor = coloresRetos[ix % coloresRetos.length];
                      return (
                        <React.Fragment key={pr.retoId}>
                          <td style={{ ...styles.tdNumber, backgroundColor: bgColor }}>
                            {pr.posicion === "-" ? "-" : darMedalla(pr.posicion)}
                          </td>
                          <td
                            style={{
                              ...styles.tdNumber,
                              fontWeight: "bold",
                              backgroundColor: bgColor,
                            }}
                          >
                            {pr.puntos}
                          </td>
                          <td style={{ ...styles.tdNumber, backgroundColor: bgColor }}>
                            {pr.pesoLibras.toFixed(2)}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    <td style={{ ...styles.tdNumber, fontWeight: "bold" }}>{curso.totalPuntos}</td>
                    <td style={{ ...styles.tdNumber, fontWeight: "bold" }}>{curso.totalLibras.toFixed(2)}</td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: "#d7efd9", fontWeight: "bold" }}>
                  <td style={styles.td}>Totales</td>
                  <td style={styles.td}></td>
                  {reporteHistoricoCursos[0]?.porReto.map((pr, idx) => {
                    const bgColor = coloresRetos[idx % coloresRetos.length];
                    const sumaLibras = reporteHistoricoCursos.reduce(
                      (acc, c) => acc + (c.porReto.find((p) => p.retoId === pr.retoId)?.pesoLibras || 0),
                      0
                    );
                    return (
                      <React.Fragment key={pr.retoId}>
                        <td style={{ ...styles.td, backgroundColor: bgColor }} colSpan={3} align="center">
                          {sumaLibras.toFixed(2)}
                        </td>
                      </React.Fragment>
                    );
                  })}
                  <td style={styles.td}></td>
                  <td style={styles.td}>
                    {reporteHistoricoCursos.reduce((acc, c) => acc + c.totalLibras, 0).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
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
    maxWidth: 1100,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 30,
    boxShadow: "0 0 20px 0 rgba(60, 173, 60, 0.65)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#1b3a1b",
    marginTop: 24,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  th: {
    border: "1px solid #a5d6a7",
    padding: "6px 10px",
    textAlign: "center",
    whiteSpace: "nowrap",
  },
  td: {
    border: "1px solid #a5d6a7",
    padding: "6px 10px",
    textAlign: "left",
  },
  tdNumber: {
    border: "1px solid #a5d6a7",
    padding: "6px 10px",
    textAlign: "center",
    fontWeight: "600",
    whiteSpace: "nowrap",
  },
  rowEvenColorido: {
    backgroundColor: "#e8f5e9",
  },
  rowOddColorido: {
    backgroundColor: "#c8e6c9",
  },
  botonesContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: 15,
    gap: 16,
    flexWrap: "wrap",
  },
  botonAccion: {
    backgroundColor: "#4caf50",
    color: "white",
    border: "none",
    borderRadius: 30,
    padding: "10px 25px",
    fontWeight: "700",
    fontSize: 15,
    cursor: "pointer",
    boxShadow: "0 6px 12px rgba(76, 175, 80, 0.6)",
    transition: "background-color 0.3s, box-shadow 0.3s",
    userSelect: "none",
  },
  botonRegresar: {
    backgroundColor: "#267d53",
    boxShadow: "0 6px 12px rgba(38, 125, 83, 0.6)",
  },
};
