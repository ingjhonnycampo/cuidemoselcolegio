import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// Función para formatear fechas tipo 'YYYY-MM-DD' a formato legible
function formatearFecha(fechaStr) {
  if (!fechaStr) return "";
  const [year, month, day] = fechaStr.split("-");
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  return `${parseInt(day, 10)} de ${meses[parseInt(month, 10) - 1]} de ${year}`;
}

// Calcula estado abierto o cerrado tomando en cuenta hasta el final del día de fechaCierre
function calcularEstado(fechaInicio, fechaCierre) {
  const ahora = new Date();
  const cierre = new Date(fechaCierre + 'T23:59:59');
  if (ahora < new Date(fechaInicio)) return "Abierto";
  if (ahora > cierre) return "Cerrado";
  return "Activo";
}

export default function RetoDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [reto, setReto] = useState(null);
  const [salones, setSalones] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetalle() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("Usuario no autenticado. Por favor haz login.");
          setLoading(false);
          return;
        }

        const resReto = await axios.get(`http://localhost:5000/api/retos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReto(resReto.data);

        if (resReto.data.asignarATodosLosSalones) {
          const resSalones = await axios.get("http://localhost:5000/api/salones", {
            headers: { Authorization: `Bearer ${token}` },
          });
          setSalones(resSalones.data);
        } else {
          setSalones(resReto.data.salonesAsignados || []);
        }
      } catch {
        setError("Error al cargar el detalle del reto.");
      }
      setLoading(false);
    }
    fetchDetalle();
  }, [id]);

  if (loading) return (
    <div style={styles.fondo}>
      <div style={styles.pageContainer}>
        <p>Cargando detalle...</p>
      </div>
    </div>
  );

  if (error) return (
    <div style={styles.fondo}>
      <div style={styles.pageContainer}>
        <span style={styles.error}>{error}</span>
      </div>
    </div>
  );

  if (!reto) return null;

  const estado = calcularEstado(reto.fechaInicio, reto.fechaCierre);

  return (
    <div style={styles.fondo}>
      <div style={styles.pageContainer}>

        <h2 style={{ ...styles.title, textAlign: "center" }}>Detalle del reto</h2>

        <div style={{ marginBottom: 25 }}>
          <h4 style={styles.etiquetaCentrada}>Nombre del reto</h4>
          <h3 style={{ margin: "0 0 15px 0", textAlign: "center" }}>{reto.nombre}</h3>

          <h4 style={styles.etiquetaCentrada}>Descripción del reto</h4>
          <p style={{ fontSize: 16, lineHeight: 1.4, marginBottom: 15, textAlign: "center" }}>
            {reto.descripcion}
          </p>

          <div style={{ marginBottom: 10 }}>
            <b>Estado: </b>
            <span
              style={{
                color:
                  estado === "Activo" || estado === "Abierto"
                    ? "#2ca430"
                    : estado === "Cerrado"
                    ? "#e74c3c"
                    : "#eca728",
                fontWeight: 700,
              }}
            >
              {estado}
            </span>
          </div>
          <div style={{ marginBottom: 10 }}>
            <b>Fecha de inicio:</b> {formatearFecha(reto.fechaInicio)}
          </div>
          <div style={{ marginBottom: 10 }}>
            <b>Fecha de cierre:</b> {formatearFecha(reto.fechaCierre)}
          </div>
          <div style={{ marginBottom: 10 }}>
            <b>Creado por:</b> {reto.creador?.nombre || "Desconocido"}
          </div>
          <div style={{ marginBottom: 10 }}>
            <b>Asignado a:</b>{" "}
            {reto.asignarATodosLosSalones ? "Todos los salones" : `${salones.length} salones`}
          </div>
        </div>

        <div>
          <h4 style={{ marginBottom: 8 }}>Salones participantes</h4>
          {salones.length === 0 ? (
            <p>No hay salones participantes.</p>
          ) : (
            <ul style={styles.listaSalones}>
              {salones.map((salon) => {
                if (typeof salon === "string") {
                  return <li key={salon}>{salon}</li>;
                } else {
                  return (
                    <li key={salon._id}>
                      {`${salon.grado ? salon.grado.charAt(0).toUpperCase() + salon.grado.slice(1) : ""} - ${salon.salon} - ${salon.jornada ? salon.jornada.charAt(0).toUpperCase() + salon.jornada.slice(1) : ""} - ${salon.sede ? salon.sede.charAt(0).toUpperCase() + salon.sede.slice(1) : ""}`}
                    </li>
                  );
                }
              })}
            </ul>
          )}
        </div>

        <div style={styles.buttonsContainer}>
          <button style={{ ...styles.btnCancelar }} onClick={() => navigate("/retos")}>
            Volver al listado
          </button>
          <button style={{ ...styles.btnDashboard }} onClick={() => navigate("/dashboard")}>
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  fondo: {
    minHeight: "100vh",
    width: "100vw",
    background:
      "linear-gradient(rgba(168,224,99,0.55), rgba(86,171,47,0.45)), url('/fondo-ambiental.jpg') no-repeat center center fixed",
    backgroundSize: "cover",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pageContainer: {
    maxWidth: 700,
    margin: "40px auto",
    padding: 30,
    background: "rgba(255,255,255,0.95)",
    borderRadius: 18,
    boxShadow: "0 0 20px 6px rgb(14 197 134 / 0.2)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#263238",
    display: "flex",
    flexDirection: "column",
    minHeight: "auto",
  },
  title: {
    marginBottom: 24,
    fontWeight: 700,
    fontSize: 26,
    color: "#119e8e",
  },
  btnCancelar: {
    border: "none",
    borderRadius: 8,
    backgroundColor: "#2E7D32",
    color: "white",
    fontWeight: 700,
    fontSize: 16,
    padding: "10px 30px",
    userSelect: "none",
    cursor: "pointer",
  },
  btnDashboard: {
    border: "none",
    borderRadius: 8,
    backgroundColor: "#119e8e",
    color: "white",
    fontWeight: 700,
    fontSize: 16,
    padding: "10px 30px",
    cursor: "pointer",
    userSelect: "none",
    marginLeft: 20,
  },
  buttonsContainer: {
    display: "flex",
    justifyContent: "center",
    gap: 20,
    marginTop: 30,
  },
  error: {
    color: "#e74c3c",
    fontWeight: 700,
    fontSize: 16,
    textAlign: "center",
  },
  listaSalones: {
    background: "#fafcff",
    padding: 14,
    borderRadius: 8,
    border: "1px solid #d4efdf",
    maxHeight: 220,
    overflowY: "auto",
    marginBottom: 10,
  },
  etiquetaCentrada: {
    margin: "0 0 6px 0",
    color: "#119e8e",
    fontWeight: 700,
    textAlign: "center",
    fontSize: 17,
    letterSpacing: 0.5,
  },
};

