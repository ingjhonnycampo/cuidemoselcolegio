import React, { useEffect, useState } from "react";
import api from "./api";

export default function ResultadosPorCursosNuevo() {
  const [resultados, setResultados] = useState([]);
  const [retos, setRetos] = useState([]);
  const [salones, setSalones] = useState([]);

  useEffect(() => {
    api.get("/retos")
      .then(res => {
        const cerrados = res.data.filter(
          reto => new Date(reto.fechaCierre + "T23:59:59") < new Date()
        );
        setRetos(cerrados);
      })
      .catch(() => setRetos([]));

    api.get("/ranking-cursos-retos/ranking-por-cursos-retos")
      .then(res => setResultados(res.data || []))
      .catch(() => setResultados([]));

    api.get("/salones")
      .then(res => setSalones(res.data || []))
      .catch(() => setSalones([]));
  }, []);

  // Función para procesar cada reto en resultados
  const resultadosProcesados = {};
  retos.forEach(reto => {
    const datosReto = resultados.filter(r => r.retoId === reto._id);
    resultadosProcesados[reto._id] = procesarRanking(datosReto, salones);
  });

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: 30, color: "#2e7d32" }}>
        Resultados por Cursos (con lógica personalizada)
      </h2>

      {retos.map(reto => {
        const datosDelReto = resultadosProcesados[reto._id] || [];

        return (
          <div key={reto._id} style={{ marginBottom: 30 }}>
            <h3 style={{ color: "#119e8e" }}>{reto.nombre}</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#eaf5ea" }}>
                  <th style={{ padding: 10, textAlign: "center" }}>Pos.</th>
                  <th style={{ padding: 10 }}>Curso</th>
                  <th style={{ padding: 10, textAlign: "center" }}>Peso (lbs)</th>
                  <th style={{ padding: 10, textAlign: "center" }}>Puntos</th>
                  <th style={{ padding: 10, textAlign: "center" }}>Estudiantes</th>
                </tr>
              </thead>
              <tbody>
                {datosDelReto.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 10, textAlign: "center", fontStyle: "italic", color: "#999" }}>
                      Sin participantes
                    </td>
                  </tr>
                ) : (
                  datosDelReto.map(curso => (
                    <tr key={curso.cursoId}>
                      <td style={{ padding: 10, textAlign: "center" }}>{curso.posicion}</td>
                      <td style={{ padding: 10 }}>
                        {`${curso.grado} ${curso.salon} ${curso.jornada} ${curso.sede}`.trim()}
                      </td>
                      <td style={{ padding: 10, textAlign: "center" }}>{curso.pesoLibras.toFixed(2)}</td>
                      <td style={{ padding: 10, textAlign: "center" }}>{curso.puntos}</td>
                      <td style={{ padding: 10, textAlign: "center" }}>
                        {salones.find(s => s._id === curso.cursoId)?.nroEstudiantes || 0}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}

// Función para asignar posiciones y puntos con desempate
function procesarRanking(ranking, salonesInfo) {
  const mapaEstudiantes = {};
  salonesInfo.forEach(salon => {
    mapaEstudiantes[salon._id] = salon.nroEstudiantes || 0;
  });

  const ordenado = [...ranking].sort((a, b) => {
    if (b.pesoLibras !== a.pesoLibras) return b.pesoLibras - a.pesoLibras;
    return (mapaEstudiantes[a.cursoId] || 0) - (mapaEstudiantes[b.cursoId] || 0);
  });

  let posiciones = [];
  let posicionActual = 0;
  let ultimoPeso = null;
  let ultimoEstudiantes = null;
  let contadorPosicion = 1;

  ordenado.forEach((item, i) => {
    const nroEst = mapaEstudiantes[item.cursoId] || 0;

    if (item.pesoLibras !== ultimoPeso || nroEst !== ultimoEstudiantes) {
      posicionActual = contadorPosicion;
      ultimoPeso = item.pesoLibras;
      ultimoEstudiantes = nroEst;
    }

    posiciones[i] = posicionActual;
    contadorPosicion++;
  });

  const puntosPosicion = [20, 15, 10, 7, 5, 3, 1];
  return ordenado.map((item, idx) => ({
    ...item,
    posicion: posiciones[idx],
    puntos: posiciones[idx] <= puntosPosicion.length ? puntosPosicion[posiciones[idx] - 1] : 0
  }));
}
