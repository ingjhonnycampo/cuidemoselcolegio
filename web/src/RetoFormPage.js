import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";


function formatDateString(fechaStr) {
  if (!fechaStr) return "";
  return fechaStr;
}
function getEstado(fechaCierre) {
  const ahora = new Date();
  const cierre = new Date(fechaCierre + "T23:59:59");
  return ahora > cierre ? "Cerrado" : "Abierto";
}

// Agregado: Reloj animado para modal
function RelojSVG() {
  return (
    <svg
      style={{ marginRight: 10, animation: "spin 1s linear infinite" }}
      xmlns="http://www.w3.org/2000/svg"
      width="26"
      height="26"
      fill="none"
      stroke="#11998e"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </svg>
  );
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
  const [modalSalir, setModalSalir] = useState(false);

  // Agregado: estados para modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

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

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  const validarFormulario = () => {
    if (!nombre.trim() || !descripcion.trim()) return false;
    if (!fechaInicio || !fechaCierre) return false;
    if (new Date(fechaInicio) > new Date(fechaCierre)) return false;
    if (!asignarATodosLos && salonesSeleccionados.length === 0) return false;
    return true;
  };

  const toggleSeleccion = (idSalon) => {
    if (salonesSeleccionados.includes(idSalon)) {
      setSalonesSeleccionados(salonesSeleccionados.filter((id) => id !== idSalon));
    } else {
      setSalonesSeleccionados([...salonesSeleccionados, idSalon]);
    }
  };

  const estado = getEstado(fechaCierre);

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

    // Mostrar modal y mensaje de carga
    setModalVisible(true);
    setModalLoading(true);
    setModalMessage(esEdicion ? "Actualizando reto..." : "Creando reto...");

    setLoading(true);
    try {
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

      // Esperar 2 segundos con el reloj visible
      await new Promise(res => setTimeout(res, 2000));

      if (esEdicion) {
        await axios.patch(`http://localhost:5000/api/retos/${id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExito("Reto modificado con éxito.");
        setModalLoading(false);
        setModalMessage("Reto modificado con éxito.");
      } else {
        await axios.post("http://localhost:5000/api/retos", data, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExito("Reto creado con éxito.");
        setModalLoading(false);
        setModalMessage("Reto creado con éxito.");
        setNombre("");
        setDescripcion("");
        setFechaInicio("");
        setFechaCierre("");
        setAsignarATodosLos(false);
        setSalonesSeleccionados([]);
      }

      // Ocultar modal luego de mostrar mensaje éxito y navegar
      setTimeout(() => {
        setModalVisible(false);
        setModalMessage("");
        navigate("/retos");
      }, 1800);
    } catch (err) {
      const errMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error guardando reto";
      setError(errMsg);
      setModalLoading(false);
      setModalMessage(errMsg);
      setTimeout(() => {
        setModalVisible(false);
        setModalMessage("");
      }, 2200);
    } finally {
      setLoading(false);
    }
  };

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
      padding: 12,
    },
    headerUsuario: {
      width: "100%"
    },
    userData: {
      display: "flex",
      alignItems: "center",
      gap: 11,
      background: "linear-gradient(90deg,#e0fefa 60%,#fffbe5 100%)",
      borderRadius: 16,
      padding: "7px 17px",
      fontWeight: 700,
      fontSize: 17,
      boxShadow: "0 2px 12px #e0fefa50",
      color: "#11998e",
    },
    userIcon: {
      width: 28,
      height: 28,
      marginRight: 4,
    },
    userRol: {
      display: "inline-flex",
      alignItems: "center",
      fontWeight: 400,
      fontSize: 14,
      color: "#eca728",
      gap: 2,
      marginLeft: 8,
    },
    formGroup: {
      display: "flex",
      flexDirection: "column",
    },
    input: {
      padding: 10,
      fontSize: 16,
      borderRadius: 10,
      border: "1px solid #9aca9a",
      boxSizing: "border-box",
      transition: "border-color 0.3s",
      outlineColor: "#66bb6a",
    },
    label: {
      fontWeight: 700,
      marginBottom: 8,
      color: "#2f4f4f",
    },
    checkboxGroup: {
      display: "flex",
      alignItems: "center",
      gap: 10,
      marginTop: 10,
    },
    checkbox: {
      width: 20,
      height: 20,
      cursor: "pointer",
    },
    labelCheckbox: {
      userSelect: "none",
      fontSize: 16,
      color: "#34495e",
      cursor: "pointer",
    },
    lista: {
      maxHeight: 190,
      overflowY: "auto",
      border: "2px solid #88c58a",
      padding: 14,
      borderRadius: 12,
      backgroundColor: "#eefff4",
    },
    checkboxLabel: {
      userSelect: "none",
      display: "block",
      marginBottom: 8,
      fontSize: 15,
      cursor: "pointer",
      color: "#2a3f29",
    },
    btnRegistrar: {
      border: "none",
      borderRadius: 24,
      backgroundColor: "#11998e",
      color: "white",
      fontWeight: 700,
      fontSize: 18,
      padding: "14px 30px",
      cursor: "pointer",
      userSelect: "none",
      boxShadow: "0 6px 18px rgb(17 153 142 / 0.6)",
      transition: "background-color 0.4s ease",
      display: "flex",
      alignItems: "center",
      gap: 8,
      justifyContent: "center",
    },
    btnCancelar: {
      border: "none",
      borderRadius: 24,
      backgroundColor: "#ca4e4e",
      color: "white",
      fontWeight: 700,
      fontSize: 18,
      padding: "14px 30px",
      cursor: "pointer",
      userSelect: "none",
      boxShadow: "0 5px 14px rgb(221 76 76 / 0.18)",
      transition: "background-color 0.4s ease",
      display: "flex",
      alignItems: "center",
      gap: 8,
      justifyContent: "center",
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

  return (
    <div style={styles.fondo}>
      <div className="retoform-container">
        {/* Usuario conectado y cerrar sesión */}
        {usuario && (
          <div className="retoform-userbar" style={styles.headerUsuario}>
            <span style={styles.userData}>
              <svg style={styles.userIcon} fill="#11998e" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="5" fill="#11998e" />
                <ellipse cx="12" cy="17" rx="8.2" ry="5.5" fill="#d1f4f1" />
                <ellipse cx="12" cy="17.4" rx="7.3" ry="4.2" fill="#fff" />
              </svg>
              {usuario.nombre}
              <span style={styles.userRol}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#eca728">
                  <path d="M12 2l2.092 6.426H20.5l-5.204 3.783L17.181 20 12 15.549 6.819 20l1.885-7.791L3.5 8.426h6.408z" />
                </svg>
                {usuario.rol}
              </span>
            </span>
            <button
              type="button"
              className="retoform-logout-btn"
              onClick={() => setModalSalir(true)}
              tabIndex={0}
              title="Cerrar sesión"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="14" height="18" rx="3.5" stroke="#e74c3c" strokeWidth="2" />
                <path d="M16 12h5M19 15l2-3-2-3" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="logout-tooltip">Cerrar sesión</span>
            </button>
          </div>
        )}

        {/* MODAL Cerrar sesión */}
        {modalSalir && (
          <div className="retoform-modal-bg" tabIndex={-1}>
            <div className="retoform-modal" role="dialog" aria-modal="true">
              <h3>
                ¿Seguro que quieres cerrar sesión?
              </h3>
              <div className="retoform-modal-buttons">
                <button
                  className="retoform-modal-btn"
                  style={{ background: "#11998e" }}
                  onClick={() => {
                    setModalSalir(false);
                    setTimeout(() => cerrarSesion(), 200);
                  }}
                >
                  Sí, salir
                </button>
                <button
                  className="retoform-modal-btn cancel"
                  onClick={() => setModalSalir(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Título elegante con SVGs */}
        <div
          className="retoform-title"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <span aria-hidden="true" style={{ display: "flex", alignItems: "center" }}>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="#119e8e" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="22" fill="#e0fefa" stroke="#11c586" strokeWidth="2" />
              <path d="M18 30 L24 16 L30 30 Z" fill="#119e8e" />
            </svg>
          </span>
          <span style={{ flex: 1, textAlign: "center", display: "block" }}>
            {esEdicion ? "Editar Reto" : "Crear Nuevo Reto"}
          </span>
          <span aria-hidden="true" style={{ display: "flex", alignItems: "center" }}>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="#eca728" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="22" fill="#fffbe5" stroke="#eca728" strokeWidth="2" />
              <path d="M24 30 Q28 27 24 16 Q20 27 24 30 Z" fill="#eca728" />
            </svg>
          </span>
        </div>

        {(error || exito) && (
          <div style={{ marginBottom: 20, textAlign: "center" }}>
            {error && <span style={styles.error}>{error}</span>}
            {exito && <span style={styles.exitoCenter}>{exito}</span>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="retoform-formgrid">
          <div style={styles.formGroup}>
            <label htmlFor="nombre" style={styles.label}>
              Nombre<span aria-hidden="true" style={{ color: "#e74c3c" }}> *</span>
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={150}
              required
              style={styles.input}
              placeholder="Ingrese el nombre del reto"
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="descripcion" style={styles.label}>
              Descripción<span aria-hidden="true" style={{ color: "#e74c3c" }}> *</span>
            </label>
            <textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              required
              style={{ ...styles.input, resize: "vertical" }}
              placeholder="Escriba la descripción del reto"
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="fechaInicio" style={styles.label}>
              Fecha Inicio<span aria-hidden="true" style={{ color: "#e74c3c" }}> *</span>
            </label>
            <input
              id="fechaInicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="fechaCierre" style={styles.label}>
              Fecha Cierre<span aria-hidden="true" style={{ color: "#e74c3c" }}> *</span>
            </label>
            <input
              id="fechaCierre"
              type="date"
              value={fechaCierre}
              onChange={(e) => setFechaCierre(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={{ gridColumn: "span 2", ...styles.checkboxGroup }}>
            <input
              type="checkbox"
              id="asignarTodos"
              checked={asignarATodosLos}
              onChange={(e) => setAsignarATodosLos(e.target.checked)}
              aria-describedby="asignarTodosDesc"
              style={styles.checkbox}
            />
            <label htmlFor="asignarTodos" style={styles.labelCheckbox}>
              Asignar a todos los salones
            </label>
          </div>
          {asignarATodosLos && (
            <div
              style={{ gridColumn: "span 2", fontStyle: "italic", color: "#444", padding: 12 }}
              id="asignarTodosDesc"
            >
              Todos los salones serán asignados automáticamente.
            </div>
          )}
          {!asignarATodosLos && (
            <div style={{ gridColumn: "span 2" }}>
              <label style={styles.label}>Seleccionar Salones</label>
              <div style={styles.lista} aria-label="Lista de salones disponibles">
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
              flexWrap: "wrap"
            }}
          >
            <button
              type="submit"
              disabled={!validarFormulario() || loading}
              style={{
                ...styles.btnRegistrar,
                cursor: validarFormulario() && !loading ? "pointer" : "not-allowed",
                opacity: validarFormulario() && !loading ? 1 : 0.5,
                minWidth: 130,
              }}
            >
              {loading ? (esEdicion ? "Guardando..." : "Creando...") : esEdicion ? "Guardar cambios" : "Crear"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              style={{ ...styles.btnCancelar, minWidth: 130 }}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="11" fill="#fce5e5" />
                <path d="M7 7l8 8M15 7l-8 8" stroke="#c60101" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Cancelar
            </button>
          </div>
          <div
            style={{
              gridColumn: "span 2",
              marginTop: 12,
              textAlign: "center",
              fontWeight: "700",
              fontSize: 16,
              color: estado === "Cerrado" ? "red" : "green",
            }}
            aria-live="polite"
          >
            Estado: {estado}
          </div>
        </form>

        {/* Modal animado con reloj y mensaje */}
        {modalVisible && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.22)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: 18,
                padding: "36px 30px",
                boxShadow: "0 5px 30px #119c7c38",
                fontWeight: 700,
                fontSize: 18,
                display: "flex",
                alignItems: "center",
                color: modalLoading
                  ? "#11998e"
                  : modalMessage.toLowerCase().includes("error")
                    ? "#e74c3c"
                    : "#22a542",
                minWidth: 200,
                maxWidth: 320,
                textAlign: "center",
              }}
            >
              {modalLoading && <RelojSVG />}
              <span>{modalMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RetoFormPage;
