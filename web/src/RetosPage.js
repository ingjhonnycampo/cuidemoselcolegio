import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Función para obtener usuario actual y rol
function getUsuarioActual() {
  const usuarioGuardado = localStorage.getItem("usuario");
  if (!usuarioGuardado) return null;
  return JSON.parse(usuarioGuardado);
}

// Convierte 'YYYY-MM-DD' a 'dd/mm/yyyy'
function fechaFormateada(fechaStr) {
  if (!fechaStr || fechaStr.length !== 10) return fechaStr || "";
  const [yyyy, mm, dd] = fechaStr.split("-");
  return `${dd}/${mm}/${yyyy}`;
}

// Función para calcular estado según fechas
function calcularEstado(fechaInicio, fechaCierre) {
  const ahora = new Date();
  const cierreCompleta = new Date(fechaCierre + "T23:59:59");
  if (ahora < new Date(fechaInicio)) return "Pendiente";
  if (ahora > cierreCompleta) return "Cerrado";
  return "Activo";
}

function RetosPage() {
  const [retos, setRetos] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingEliminar, setLoadingEliminar] = useState(false);

  const usuarioActual = getUsuarioActual();
  const rol = usuarioActual?.rol || "";
  const navigate = useNavigate();

  // Obtener token JWT
  const getToken = () => localStorage.getItem("token");

  // Cargar retos desde backend
  const cargarRetos = async () => {
    setError("");
    setLoading(true);
    const token = getToken();
    if (!token) {
      setError("No hay sesión activa. Por favor inicia sesión.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get("http://localhost:5000/api/retos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRetos(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error al cargar retos"
      );
      setRetos([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarRetos();
  }, []);

  // Función para eliminar un reto (solo admin)
  const handleEliminar = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este reto?")) return;

    setLoadingEliminar(true);
    const token = getToken();
    if (!token) {
      setError("No hay sesión activa. Por favor inicia sesión.");
      setLoadingEliminar(false);
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/retos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoadingEliminar(false);
      cargarRetos();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error al eliminar el reto"
      );
      setLoadingEliminar(false);
    }
  };

  return (
    <div style={styles.fondo}>
      <div style={styles.pageContainer}>
        <h2 style={{ ...styles.title, textAlign: "center" }}>Retos</h2>

        {(error || loading) && (
          <div style={{ marginBottom: 12, textAlign: "center" }}>
            {error && <span style={styles.error}>{error}</span>}
            {loading && !error && <span>Cargando retos...</span>}
          </div>
        )}

        {(rol === "admin" || rol === "profesor") && (
          <div style={{ marginBottom: 16, textAlign: "center" }}>
            <button
              style={styles.btnRegistrar}
              onClick={() => navigate("/retos/crear")}
            >
              Agregar nuevo reto
            </button>
          </div>
        )}

        {retos.length === 0 && !loading ? (
          <p>No hay retos registrados</p>
        ) : (
          <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
            <table style={styles.tablaRetos}>
              <thead style={styles.theadSticky}>
                <tr style={styles.thead}>
                  <th style={styles.th}>Nombre</th>
                  <th style={styles.th}>Fecha Inicio</th>
                  <th style={styles.th}>Fecha Cierre</th>
                  <th style={styles.th}>Estado</th>
                  <th style={styles.th}>Asignación</th>
                  <th style={{ ...styles.th, width: rol === "admin" ? 150 : 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {retos.map((reto, idx) => {
                  const estado = calcularEstado(reto.fechaInicio, reto.fechaCierre);
                  const asignacion = reto.asignarATodosLosSalones
                    ? "Todos los salones"
                    : `${reto.salonesAsignados?.length || 0} salones`;
                  return (
                    <tr
                      key={reto._id}
                      style={idx % 2 === 0 ? styles.trEven : styles.trOdd}
                    >
                      <td style={styles.td}>{reto.nombre}</td>
                      <td style={styles.td}>{fechaFormateada(reto.fechaInicio)}</td>
                      <td style={styles.td}>{fechaFormateada(reto.fechaCierre)}</td>
                      <td
                        style={{
                          ...styles.td,
                          fontWeight: "700",
                          color:
                            estado === "Cerrado"
                              ? "#e74c3c"
                              : estado === "Activo"
                              ? "#2ca430"
                              : "#eca728",
                        }}
                      >
                        {estado}
                      </td>
                      <td style={styles.td}>{asignacion}</td>
                      <td
                        style={{
                          ...styles.td,
                          textAlign: "center",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {/* Icono lupa para detalles */}
                        <button
                          onClick={() => navigate(`/retos/${reto._id}`)}
                          aria-label={`Ver detalles del reto ${reto.nombre}`}
                          style={styles.btnLupa}
                        >
                          🔍
                        </button>

                        {/* Botones Editar y Eliminar solo para admin */}
                        {rol === "admin" && (
                          <>
                            <button
                              onClick={() => navigate(`/retos/editar/${reto._id}`)}
                              style={styles.btnEditar}
                              title="Editar reto"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleEliminar(reto._id)}
                              style={{ ...styles.btnEliminar, marginLeft: 8 }}
                              title="Eliminar reto"
                              disabled={loadingEliminar}
                            >
                              {loadingEliminar ? "Eliminando..." : "Eliminar"}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Botón fijo volver al dashboard abajo izquierda */}
        <button
          onClick={() => navigate("/dashboard")}
          style={styles.fixedDashboardBtn}
          title="Volver al dashboard"
        >
          ← Dashboard
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
      "linear-gradient(rgba(168,224,99,0.55), rgba(86,171,47,0.45)), url('/fondo-ambiental.jpg') no-repeat center center fixed",
    backgroundSize: "cover",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  pageContainer: {
    maxWidth: 950,
    margin: "40px auto",
    padding: 30,
    background: "rgba(255,255,255,0.95)",
    borderRadius: 18,
    boxShadow: "0 0 20px 6px rgb(14 197 134 / 0.2)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#263238",
    position: "relative",
    minHeight: 700,
    display: "flex",
    flexDirection: "column",
  },
  title: {
    marginBottom: 24,
    fontWeight: 700,
    fontSize: 26,
    color: "#119e8e",
  },
  tablaRetos: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 22,
    backgroundColor: "#fafcff",
    borderRadius: 12,
    boxShadow: "0 3px 5px rgb(0 0 0 / 0.08)",
    fontSize: 14,
  },
  theadSticky: {
    position: "sticky",
    top: 0,
    backgroundColor: "#d9f1db",
    zIndex: 10,
  },
  thead: {
    backgroundColor: "#d9f1db",
  },
  th: {
    padding: "12px 15px",
    textAlign: "left",
    color: "#119e8e",
    fontWeight: 700,
    borderBottom: "2px solid #a9d1b5",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  td: {
    padding: "12px 15px",
    textAlign: "left",
    borderBottom: "1px solid #eee",
    verticalAlign: "middle",
  },
  trEven: {
    backgroundColor: "#f7fbf7",
  },
  trOdd: {
    backgroundColor: "white",
  },
  btnLupa: {
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    marginRight: 8,
  },
  btnRegistrar: {
    border: "none",
    borderRadius: 8,
    backgroundColor: "#119e8e",
    color: "white",
    fontWeight: 700,
    fontSize: 16,
    padding: "10px 20px",
    cursor: "pointer",
    userSelect: "none",
  },
  btnEditar: {
    borderRadius: 8,
    backgroundColor: "#eca728",
    border: "none",
    color: "white",
    fontWeight: 700,
    fontSize: 14,
    padding: "7px 12px",
    cursor: "pointer",
    userSelect: "none",
  },
  btnEliminar: {
    borderRadius: 8,
    backgroundColor: "#e74c3c",
    border: "none",
    color: "white",
    fontWeight: 700,
    fontSize: 14,
    padding: "7px 12px",
    cursor: "pointer",
    userSelect: "none",
  },
  fixedDashboardBtn: {
    position: "absolute",
    left: 28,
    bottom: 50,
    backgroundColor: "#119e8e",
    borderRadius: 28,
    color: "white",
    padding: "7px 16px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    boxShadow: "0 1px 10px 0 #abded720",
    userSelect: "none",
    transition: "opacity 0.2s",
    zIndex: 20,
  },
  error: {
    color: "#e74c3c",
    fontWeight: 700,
    fontSize: 16,
    textAlign: "center",
  },
};

export default RetosPage;
