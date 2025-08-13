import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

// Simple función para mostrar la fecha sin desfase en la tabla y en inputs date
function formatDateString(fechaStr) {
  if (!fechaStr) return "";
  // fechaStr es 'YYYY-MM-DD' almacenada como string
  // Deja string tal cual para input date
  return fechaStr;
}

// Estado solo abierto o cerrado
function getEstado(fechaCierre) {
  const ahora = new Date();
  const cierre = new Date(fechaCierre + "T23:59:59"); // Para incluir todo el día completo de la fecha de cierre
  return ahora > cierre ? "Cerrado" : "Abierto";
}

function RetoFormPage() {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaCierre, setFechaCierre] = useState("");
  const [asignarATodosLos, setAsignarATodosLos] = useState(false);
  const [salonesDisponibles, setSalonesDisponibles] = useState([]);
  const [salonesSeleccionados, setSalonesSeleccionados] = useState([]);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [loading, setLoading] = useState(false);
  const [esEdicion, setEsEdicion] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const getToken = () => localStorage.getItem("token");

  const usuario = (() => {
    const u = localStorage.getItem("usuario");
    return u ? JSON.parse(u) : null;
  })();

  useEffect(() => {
    async function cargarSalones() {
      const token = getToken();
      if (!token) return;
      try {
        const res = await axios.get("http://localhost:5000/api/salones", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSalonesDisponibles(res.data);
      } catch {
        setSalonesDisponibles([]);
      }
    }
    cargarSalones();
  }, []);

  useEffect(() => {
    async function cargarDatos() {
      if (!id) return;
      const token = getToken();
      if (!token) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/retos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const reto = res.data;
        setNombre(reto.nombre || "");
        setDescripcion(reto.descripcion || "");
        setFechaInicio(formatDateString(reto.fechaInicio));
        setFechaCierre(formatDateString(reto.fechaCierre));
        setAsignarATodosLos(!!reto.asignarATodosLosSalones);
        setSalonesSeleccionados(
          reto.salonesAsignados ? reto.salonesAsignados.map((s) => s._id) : []
        );
        setEsEdicion(true);
      } catch {
        setError("Error al cargar datos");
      }
    }
    cargarDatos();
  }, [id]);

  const validarFormulario = () => {
    if (!nombre.trim() || !descripcion.trim()) return false;
    if (!fechaInicio || !fechaCierre) return false;
    if (new Date(fechaInicio) > new Date(fechaCierre)) return false;
    if (!asignarATodosLos && salonesSeleccionados.length === 0) return false;
    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setExito("");

  if (!validarFormulario()) {
    setError("Por favor complete los campos correctamente.");
    return;
  }

  const token = getToken();
  if (!token) {
    setError("No hay sesión activa.");
    return;
  }

  setLoading(true);

  try {
    // Cambia esta línea para enviar TODOS los salones si asignarATodosLos es true
    const data = {
      nombre,
      descripcion,
      fechaInicio,
      fechaCierre,
      asignarATodosLosSalones: asignarATodosLos,
      salonesAsignados: asignarATodosLos 
        ? salonesDisponibles.map((s) => s._id) 
        : salonesSeleccionados,
      creador: {
        id: usuario?._id,
        nombre: usuario?.nombre || "",
      },
    };

    if (esEdicion) {
      await axios.patch(`http://localhost:5000/api/retos/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExito("Reto modificado con éxito.");
    } else {
      await axios.post("http://localhost:5000/api/retos", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExito("Reto creado con éxito.");

      setNombre("");
      setDescripcion("");
      setFechaInicio("");
      setFechaCierre("");
      setAsignarATodosLos(false);
      setSalonesSeleccionados([]);
    }
    setTimeout(() => navigate("/retos"), 3000);
  } catch (err) {
    setError(
      err.response?.data?.error ||
      err.response?.data?.message ||
      "Error guardando reto"
    );
  } finally {
    setLoading(false);
  }
};


  const toggleSeleccion = (idSalon) => {
    if (salonesSeleccionados.includes(idSalon)) {
      setSalonesSeleccionados(salonesSeleccionados.filter((id) => id !== idSalon));
    } else {
      setSalonesSeleccionados([...salonesSeleccionados, idSalon]);
    }
  };

  const estado = getEstado(fechaCierre);

  return (
    <div style={styles.fondo}>
      <div style={styles.pageContainer}>
        <h2 style={{ ...styles.title, textAlign: "center" }}>
          {esEdicion ? "Editar Reto" : "Crear Nuevo Reto"}
        </h2>

        {(error || exito) && (
          <div style={{ marginBottom: 20, textAlign: "center" }}>
            {error && <span style={styles.error}>{error}</span>}
            {exito && <span style={styles.exitoCenter}>{exito}</span>}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={150}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Descripción</label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              required
              style={{ ...styles.input, resize: "vertical" }}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Fecha Cierre</label>
            <input
              type="date"
              value={fechaCierre}
              onChange={(e) => setFechaCierre(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label style={{ userSelect: "none" }}>
              <input
                type="checkbox"
                checked={asignarATodosLos}
                onChange={(e) => setAsignarATodosLos(e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Asignar a todos los salones
            </label>
          </div>

          {asignarATodosLos && (
            <div
              style={{ gridColumn: "span 2", fontStyle: "italic", color: "#444", padding: 12 }}
            >
              Todos los salones serán asignados automáticamente.
            </div>
          )}

          {!asignarATodosLos && (
            <div style={{ gridColumn: "span 2" }}>
              <label style={styles.label}>Seleccionar Salones</label>
              <div style={styles.lista}>
                {salonesDisponibles.length === 0 ? (
                  <p>No hay salones disponibles.</p>
                ) : (
                  salonesDisponibles.map((salon) => (
                    <label key={salon._id} style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={salonesSeleccionados.includes(salon._id)}
                        onChange={() => toggleSeleccion(salon._id)}
                      />
                      {`${salon.grado ? salon.grado.charAt(0).toUpperCase() + salon.grado.slice(1) : ""} - ${salon.salon} - ${salon.jornada ? salon.jornada.charAt(0).toUpperCase() + salon.jornada.slice(1) : ""} (${salon.sede})`}
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <div
            style={{
              gridColumn: "span 2",
              display: "flex",
              justifyContent: "center",
              gap: 14,
              marginTop: 20,
            }}
          >
            <button
              type="submit"
              disabled={!validarFormulario() || loading}
              style={{
                ...styles.btnRegistrar,
                minWidth: 130,
                cursor: validarFormulario() && !loading ? "pointer" : "not-allowed",
                opacity: validarFormulario() && !loading ? 1 : 0.5,
              }}
            >
              {loading
                ? esEdicion
                  ? "Guardando..."
                  : "Creando..."
                : esEdicion
                ? "Guardar cambios"
                : "Crear"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/retos")}
              style={{ ...styles.btnCancelar, minWidth: 130 }}
            >
              Cancelar
            </button>
          </div>
        </form>

        <div
          style={{
            gridColumn: "span 2",
            marginTop: 12,
            textAlign: "center",
            fontWeight: "700",
            fontSize: 16,
            color: estado === "Cerrado" ? "red" : "green",
          }}
        >
          Estado: {estado}
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
      "linear-gradient(rgba(168,224,99,0.55), rgba(86,171,47,0.45)), url('/fondo.jpg') no-repeat center center fixed",
    backgroundSize: "cover",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
  },
  title: {
    marginBottom: 24,
    fontWeight: 700,
    fontSize: 26,
    color: "#119e8e",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    columnGap: 20,
    rowGap: 16,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  input: {
    padding: 8,
    fontSize: 14,
    borderRadius: 4,
    border: "1px solid #ccc",
    boxSizing: "border-box",
  },
  label: {
    fontWeight: 600,
    marginBottom: 6,
    color: "#34495e",
  },
  lista: {
    maxHeight: 180,
    overflowY: "auto",
    border: "1px solid #ccc",
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f9fdf7",
  },
  checkboxLabel: {
    userSelect: "none",
    display: "block",
    marginBottom: 6,
    fontSize: 14,
  },
  btnRegistrar: {
    border: "none",
    borderRadius: 8,
    backgroundColor: "#119e8e",
    color: "white",
    fontWeight: 700,
    fontSize: 16,
    padding: "10px 0",
    userSelect: "none",
    cursor: "pointer",
  },
  btnCancelar: {
    border: "none",
    borderRadius: 8,
    backgroundColor: "#2e7d32",
    color: "white",
    fontWeight: 700,
    fontSize: 16,
    padding: "10px 0",
    userSelect: "none",
    cursor: "pointer",
  },
  error: {
    color: "#e74c3c",
    fontWeight: 700,
    fontSize: 16,
    textAlign: "center",
  },
  exitoCenter: {
    color: "#2ca430",
    fontWeight: 800,
    fontSize: 18,
    textAlign: "center",
  },
};

export default RetoFormPage;
