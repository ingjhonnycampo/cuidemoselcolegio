import React, { useEffect, useState } from "react";
import api from "./api";

export default function ResultadosPorRetosYCursos() {
  const [cursos, setCursos] = useState([]);
  const [retos, setRetos] = useState([]);
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    api.get("/salones")
      .then(res => {
        console.log("Cursos cargados:", res.data);
        setCursos(res.data || []);
      })
      .catch(() => setCursos([]));

    api.get("/retos")
      .then(res => {
        const cerrados = res.data.filter(reto => new Date(reto.fechaCierre + "T23:59:59") < new Date());
        console.log("Retos cerrados:", cerrados);
        setRetos(cerrados);
      })
      .catch(() => setRetos([]));

    api.get("/recolecciones/todos-cursos-retos")
      .then(res => {
        console.log("Datos recolecciones:", res.data);
        setDatos(res.data || []);
      })
      .catch(() => setDatos([]));
  }, []);

  // Obtener nombre curso y nroEstudiantes con Map para acceso rápido
  const cursosMap = React.useMemo(() => {
    const map = {};
    cursos.forEach(c => {
      map[c._id] = { 
        nombre: `${c.grado} ${c.salon} ${c.jornada} ${c.sede}`.trim(), 
        nroEstudiantes: c.nroEstudiantes || 0 
      };
    });
    return map;
  }, [cursos]);

  // Agrupa, suma kilos/puntos por reto y curso, para evitar duplicados y mezclar objetos
  const datosAgrupadosPorReto = React.useMemo(() => {
    const agrupado = {}; // { retoId: { cursoId: { pesoLibras, puntos } } }

    datos.forEach(d => {
      // Convertir ids a string para evitar problemas de comparación
      const retoIdStr = d.retoId.toString();
      const cursoIdStr = d.cursoId.toString();

      if (!agrupado[retoIdStr]) agrupado[retoIdStr] = {};
      if (!agrupado[retoIdStr][cursoIdStr]) {
        agrupado[retoIdStr][cursoIdStr] = { pesoLibras: 0, puntos: 0 };
      }
      agrupado[retoIdStr][cursoIdStr].pesoLibras += Number(d.pesoLibras) || 0;
      agrupado[retoIdStr][cursoIdStr].puntos += Number(d.puntos) || 0;
    });

    // Convertir a array y ordenar con desempate
    const resultado = {};
    Object.entries(agrupado).forEach(([retoId, cursosObj]) => {
      const arr = Object.entries(cursosObj).map(([cursoId, vals]) => ({
        retoId,
        cursoId,
        pesoLibras: vals.pesoLibras,
        puntos: vals.puntos,
        nombreCurso: cursosMap[cursoId]?.nombre || cursoId,
        nroEstudiantes: cursosMap[cursoId]?.nroEstudiantes || 0,
      }));

      // Ordenar por peso desc y desempatar por nroEstudiantes asc
      arr.sort((a, b) => {
        if (b.pesoLibras !== a.pesoLibras) return b.pesoLibras - a.pesoLibras;
        return a.nroEstudiantes - b.nroEstudiantes;
      });

      // Asignar posiciones contiguas con respeto a empates y desempates
      let posicionActual = 0;
      let ultimoPeso = null;
      let ultimoEstudiantes = null;
      let contador = 1;
      arr.forEach((item, i) => {
        if (item.pesoLibras !== ultimoPeso || item.nroEstudiantes !== ultimoEstudiantes) {
          posicionActual = contador;
          ultimoPeso = item.pesoLibras;
          ultimoEstudiantes = item.nroEstudiantes;
        }
        item.posicion = posicionActual;
        contador++;
      });

      resultado[retoId] = arr;
    });

    console.log("Agrupados y ordenados por reto:", resultado);

    return resultado; // { retoId: [array ordenado con posiciones] }
  }, [datos, cursosMap]);

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: 30, color: "#2e7d32" }}>
        Resultados de desempeño por retos y cursos
      </h2>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center" }}>
        {retos.map(reto => {
          const datosDelReto = datosAgrupadosPorReto[reto._id] || [];
          console.log('Dato para reto:', reto._id, datosDelReto);
          return (
            <div key={reto._id} style={{ minWidth: 280, background: "#f7fbf7", border: "1px solid #eaf5ea", borderRadius: 10, padding: 15 }}>
              <h4 style={{ color: "#119e8e", marginBottom: 10, textAlign: "center" }}>
                {reto.nombre}
              </h4>

              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#eaf5ea" }}>
                    <th style={{ padding: "6px 10px", textAlign: "left" }}>Pos.</th>
                    <th style={{ padding: "6px 10px", textAlign: "left" }}>Curso</th>
                    <th style={{ padding: "6px 10px", textAlign: "center" }}>Peso (lbs)</th>
                    <th style={{ padding: "6px 10px", textAlign: "center" }}>Puntos</th>
                  </tr>
                </thead>
                <tbody>
                  {datosDelReto.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: "10px", textAlign: "center", fontStyle: "italic", color: "#999" }}>
                        No hay participantes para este reto
                      </td>
                    </tr>
                  ) : (
                    datosDelReto.map(item => (
                      <tr key={item.cursoId + item.retoId} style={{ backgroundColor: "#f7fbf7" }}>
                        <td style={{ padding: "6px 10px" }}>{item.posicion}</td>
                        <td style={{ padding: "6px 10px" }}>{item.nombreCurso}</td>
                        <td style={{ padding: "6px 10px", textAlign: "center" }}>{item.pesoLibras.toFixed(2)}</td>
                        <td style={{ padding: "6px 10px", textAlign: "center" }}>{item.puntos}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    </div>
  );
}
