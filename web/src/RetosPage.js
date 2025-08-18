import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


function getUsuarioActual() {
  const usuarioGuardado = localStorage.getItem("usuario");
  if (!usuarioGuardado) return null;
  return JSON.parse(usuarioGuardado);
}
function fechaFormateada(fechaStr) {
  if (!fechaStr || fechaStr.length !== 10) return fechaStr || "";
  const [yyyy, mm, dd] = fechaStr.split("-");
  return `${dd}/${mm}/${yyyy}`;
}
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
  const [modalSalir, setModalSalir] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);


  // Nueva bandera de carga inicial para controlar los 2s
  const [loadingRetos, setLoadingRetos] = useState(true);


  // Modal de eliminación
  const [modalEliminar, setModalEliminar] = useState({
    visible: false,
    reto: null,
    paso: "confirmar" // "confirmar" | "eliminando" | "exito"
  });


  const usuarioActual = getUsuarioActual();
  const rol = usuarioActual?.rol || "";
  const navigate = useNavigate();
  const [hoveredId, setHoveredId] = useState(null);


  const getToken = () => localStorage.getItem("token");
  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };


  const cargarRetos = async () => {
    setError("");
    setLoading(true);
    setLoadingRetos(true);
    const token = getToken();
    if (!token) {
      setError("No hay sesión activa. Por favor inicia sesión.");
      setLoading(false);
      setLoadingRetos(false);
      return;
    }
    let resultOk = false;
    try {
      const res = await axios.get("http://localhost:5000/api/retos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRetos(res.data);
      resultOk = true;
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al cargar retos"
      );
      setRetos([]);
    }
    setLoading(false);
    // Garantiza que el spinner de carga se vea al menos 2 segundos
    setTimeout(() => setLoadingRetos(false), 2000);
    // También en caso de error, desactiva loadingRetos al finalizar los 2s
  };


  useEffect(() => {
    cargarRetos();
    // eslint-disable-next-line
  }, []);


  // Modal eliminar
  const handleSolicitarEliminar = (reto) => {
    setModalEliminar({
      visible: true,
      reto,
      paso: "confirmar"
    });
  };


  const handleCloseModalEliminar = () => {
    setModalEliminar({ visible: false, reto: null, paso: "confirmar" });
  };


  const handleEliminarReto = async () => {
    setModalEliminar((prev) => ({
      ...prev,
      paso: "eliminando",
    }));


    // Espera de 2 segundos para mostrar animación
    setTimeout(async () => {
      const token = getToken();
      if (!token || !modalEliminar.reto) {
        setModalEliminar((prev) => ({ ...prev, paso: "error" }));
        return;
      }
      try {
        await axios.delete(`http://localhost:5000/api/retos/${modalEliminar.reto._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setModalEliminar((prev) => ({ ...prev, paso: "exito" }));
        setTimeout(() => {
          setModalEliminar({ visible: false, reto: null, paso: "confirmar" });
          cargarRetos();
        }, 1500);
      } catch {
        setModalEliminar((prev) => ({ ...prev, paso: "error" }));
        setTimeout(() => {
          setModalEliminar({ visible: false, reto: null, paso: "confirmar" });
        }, 1500);
      }
    }, 2000);
  };


  const styles = {
    fondo: {
      minHeight: "100vh", width: "100vw",
      background: "linear-gradient(rgba(168,224,99,0.55), rgba(86,171,47,0.45)), url('/fondo-ambiental.jpg') no-repeat center center fixed",
      backgroundSize: "cover", display: "flex", justifyContent: "center", alignItems: "start",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", padding: 11,
    },
    userBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, padding: '12px 20px',
      background: "linear-gradient(90deg,#e0fefa 60%,#fffbe5 100%)", borderRadius: 20,
      boxShadow: "0 2px 12px #e0fefa50", color: "#11998e", flexWrap: 'wrap', gap: 10
    },
    userInfo: { fontWeight: 700, fontSize: 18, display: "flex", alignItems: "center", gap: 10 },
    userName: { userSelect: "none" },
    userRole: { display: "inline-flex", alignItems: "center", fontWeight: 500, fontSize: 14, color: "#eca728", gap: 6, userSelect: "none", fontStyle: "italic" },
    logoutBtn: { background: "transparent", border: "none", cursor: "pointer", borderRadius: "50%", padding: 8, boxShadow: "0 2px 16px #e74c3c22", transition: "background 0.2s",
      color: "#e44848", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" },
    logoutTooltip: {
      visibility: showTooltip ? "visible" : "hidden", opacity: showTooltip ? 1 : 0,
      backgroundColor: "#232323d9", color: "#fff", textAlign: "center", borderRadius: 8,
      padding: "5px 12px", position: "absolute", zIndex: 2, left: "50%", top: "110%",
      transform: "translateX(-50%)", fontSize: 14, fontWeight: 600, pointerEvents: "none",
      transition: "opacity 0.2s", whiteSpace: "nowrap"
    },
    loadingSpinnerContainer: {
      width: "100%", display: "flex", flexDirection: "column", alignItems: "center", marginTop: 50, marginBottom: 36
    },
    loadingSpinner: {
      width: 60, height: 60, marginBottom: 20, animation: "rotate 1s linear infinite"
    },
    modalOverlay: {
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000,
    },
    modalContent: {
      background: "#fff", borderRadius: 16, padding: 24,
      width: "92%", maxWidth: 350, boxShadow: "0 8px 32px rgba(0,0,0,0.24)", textAlign: "center"
    },
    modalTitle: { fontSize: 20, fontWeight: 700, marginBottom: 18, color: "#e74c3c" },
    modalReto: { fontWeight: 700, color: "#11998e", fontSize: 16, margin: "7px 0" },
    modalDato: { margin: "3px 0", fontSize: 15 },
    modalButtons: { display: "flex", justifyContent: "center", gap: 22, marginTop: 20 },
    modalButtonConfirm: { backgroundColor: "#e74c3c", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontWeight: 700 },
    modalButtonCancel: { backgroundColor: "#aaa", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 700 },
    modalLoading: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, fontWeight: 700, fontSize: 17, color: "#11998e", padding: 18 },
    modalExito: { color: "#2ca430", fontWeight: 800, fontSize: 19, padding: 19 },
    title: {
      fontSize: 32, fontWeight: 900, color: "#119e8e",
      textAlign: "center", marginBottom: 20, userSelect: "none",
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15
    },
    retoNombre: {
      fontSize: 19, fontWeight: 700, marginBottom: 7, color: "#11998e",
      display: "flex", alignItems: "center", gap: 8, justifyContent: "center", textAlign: "center",
      textTransform: "uppercase",
    },
    retoEstado: (estado) => ({
      fontWeight: "700",
      fontSize: 15,
      marginBottom: 10,
      userSelect: "none",
      textAlign: "center",
      color: estado === "Activo" ? "#2ca430" : estado === "Pendiente" ? "#eca728" : "#e74c3c",
    }),
    retoInfo: { fontSize: 14, fontWeight: 600, marginBottom: 4, color: "#34495e" },
    botones: { marginTop: "auto", display: "flex", justifyContent: "flex-end", gap: 12, flexWrap: "wrap" },
    btn: { padding: "7px 13px", fontWeight: 700, fontSize: 13, borderRadius: 8, border: "none", cursor: "pointer", transition: "background-color 0.2s", userSelect: "none", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 3 },
    btnVer: { backgroundColor: "#11998e", color: "white" },
    btnEditar: { backgroundColor: "#eca728", color: "white" },
    btnEliminar: { backgroundColor: "#e74c3c", color: "white" },
  };


  useEffect(() => {
    if (typeof window !== "undefined" && !document.getElementById("rotate-keyframes")) {
      const style = document.createElement("style");
      style.id = "rotate-keyframes";
      style.innerHTML = `
        @keyframes rotate {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (loadingRetos) {
    return (
      <div style={styles.fondo}>
        <div style={styles.loadingSpinnerContainer}>
          <svg style={styles.loadingSpinner} viewBox="0 0 50 50" aria-hidden="true">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="#11998e"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="31.4 31.4"
            />
          </svg>
          <div style={{ color: "#11998e", fontWeight: 700, fontSize: 20 }}>Cargando retos...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.fondo}>
      <div className="retos-container-main">
        {usuarioActual && (
          <div className="retoform-userbar" style={styles.userBar}>
            <div style={styles.userInfo}>
              <svg style={styles.userIcon} fill="#11998e" viewBox="0 0 24 24">
                <circle cx="12" cy="8" r="5" fill="#11998e" />
                <ellipse cx="12" cy="17" rx="8.2" ry="5.5" fill="#d1f4f1" />
                <ellipse cx="12" cy="17.4" rx="7.3" ry="4.2" fill="#fff" />
              </svg>
              <div style={styles.userName}>{usuarioActual.nombre}</div>
              <div style={styles.userRole}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="#eca728">
                  <path d="M12 2l2.092 6.426H20.5l-5.204 3.783L17.181 20 12 15.549 6.819 20l1.885-7.791L3.5 8.426h6.408z" />
                </svg>
                {usuarioActual.rol}
              </div>
            </div>
            <button
              type="button"
              style={styles.logoutBtn}
              onClick={() => setModalSalir(true)}
              aria-label="Cerrar sesión"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="14" height="18" rx="3.5" stroke="#e74c3c" strokeWidth="2" />
                <path d="M16 12h5M19 15l2-3-2-3" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="logout-tooltip" style={styles.logoutTooltip}>
                Cerrar sesión
              </span>
            </button>
          </div>
        )}

        {modalSalir && (
          <div style={styles.modalOverlay} role="dialog" aria-modal="true">
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>¿Seguro que quieres cerrar sesión?</h2>
              <div style={styles.modalButtons}>
                <button
                  style={styles.modalButtonConfirm}
                  onClick={() => {
                    setModalSalir(false);
                    setTimeout(() => cerrarSesion(), 200);
                  }}
                >
                  Sí, salir
                </button>
                <button
                  style={styles.modalButtonCancel}
                  onClick={() => setModalSalir(false)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ELIMINAR RETO */}
        {modalEliminar.visible && (
          <div style={styles.modalOverlay} role="dialog" aria-modal="true">
            <div style={styles.modalContent}>
              {modalEliminar.paso === "confirmar" && (
                <>
                  <span style={styles.modalTitle}>¿Eliminar este reto?</span>
                  <div style={styles.modalReto}>{modalEliminar.reto?.nombre}</div>
                  <div style={styles.modalDato}>ID: <b>{modalEliminar.reto?._id}</b></div>
                  <div style={styles.modalDato}>Desde: <b>{fechaFormateada(modalEliminar.reto?.fechaInicio)}</b></div>
                  <div style={styles.modalDato}>Hasta: <b>{fechaFormateada(modalEliminar.reto?.fechaCierre)}</b></div>
                  <div style={styles.modalButtons}>
                    <button style={styles.modalButtonConfirm} onClick={handleEliminarReto}>
                      Sí, eliminar
                    </button>
                    <button style={styles.modalButtonCancel} onClick={handleCloseModalEliminar}>
                      Cancelar
                    </button>
                  </div>
                </>
              )}
              {modalEliminar.paso === "eliminando" && (
                <div style={styles.modalLoading}>
                  <svg width={54} height={54} viewBox="0 0 54 54">
                    <circle cx="27" cy="27" r="22" fill="#e0fefa" />
                    <circle cx="27" cy="27" r="22" stroke="#11c586" strokeWidth="3" fill="none" opacity="0.45"/>
                    <g>
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        repeatCount="indefinite"
                        dur="1.2s"
                        from="0 27 27"
                        to="360 27 27"/>
                      <path d="M27 27V13" stroke="#eca728" strokeWidth="3" strokeLinecap="round"/>
                      <circle cx="27" cy="13" r="3" fill="#eca728"/>
                    </g>
                  </svg>
                  <span>Eliminando...</span>
                </div>
              )}
              {modalEliminar.paso === "exito" && (
                <div style={styles.modalExito}>
                  <span>¡Reto eliminado con éxito!</span>
                </div>
              )}
              {modalEliminar.paso === "error" && (
                <div style={styles.modalExito}>
                  <span>Ocurrió un error al eliminar</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="retos-flexbar" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          {(rol === "admin" || rol === "profesor") && (
            <button className="retos-btn-agregar" onClick={() => navigate("/retos/crear")}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="11" fill="#17dbb4" />
                <path d="M12 8v8M8 12h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              </svg>
              Crear reto
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button className="retos-btn-dashboard" onClick={() => navigate("/dashboard")} title="Ir al dashboard">
            <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
              <rect x="3" y="10" width="18" height="10" fill="#6c63ff" rx="3" />
              <rect x="8" y="4" width="8" height="6" fill="#b2a5ff" rx="2" />
            </svg>
            Dashboard
          </button>
        </div>


        <div style={styles.title}>
          <svg
            width="36"
            height="36"
            viewBox="0 0 40 40"
            fill="none"
          >
            <ellipse cx="20" cy="37" rx="13" ry="3" fill="#e0fefa" />
            <rect x="10" y="5" width="20" height="14" rx="7" fill="#eca728" />
            <rect x="14" y="19" width="12" height="6" rx="2" fill="#fffbe5" />
            <path d="M9 11C4.5 11 3 15 3 18C3 21 6.5 24 11 24" stroke="#11998e" strokeWidth="2"/>
            <path d="M31 11c4.5 0 6 4 6 7s-4.5 6-9 6" stroke="#11998e" strokeWidth="2"/>
            <circle cx="20" cy="12" r="3" fill="#fffbe5" />
          </svg>
          Retos
        </div>

        {(error || loading) && (
          <div style={{ marginBottom: 12, textAlign: "center" }}>
            {error && <span style={{ color: "#e74c3c", fontWeight: 700 }}>{error}</span>}
            {loading && !error && <span>Cargando retos...</span>}
          </div>
        )}

        {retos.length === 0 && !loading ? (
          <p style={{ textAlign: "center", color: "#555" }}>
            No hay retos registrados
          </p>
        ) : (
          <div className="retos-grid">
            {retos.map((reto) => {
              const estado = calcularEstado(reto.fechaInicio, reto.fechaCierre);
              const asignacion = reto.asignarATodosLosSalones
                ? "Todos los salones"
                : `${reto.salonesAsignados?.length || 0} salones`;
              const isHovered = hoveredId === reto._id;
              return (
                <div
                  key={reto._id}
                  className="reto-card"
                  style={isHovered ? { boxShadow: "0 14px 32px rgba(17,153,142,.20)", transform: "translateY(-7px) scale(1.025)", background: "#ecfff1" } : {}}
                  onMouseEnter={() => setHoveredId(reto._id)}
                  onMouseLeave={() => setHoveredId(null)}
                  tabIndex={0}
                  aria-label={`Reto ${reto.nombre}, estado ${estado}`}
                >
                  <div>
                    <div className="reto-row" style={styles.retoNombre}>
                      <svg width="24" height="24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                        <ellipse cx="12" cy="21.2" rx="10" ry="2.3" fill="#fae69a" />
                        <rect x="5" y="4" width="14" height="9" rx="5" fill="#eca728" />
                        <rect x="8" y="13.5" width="8" height="5" rx="1.6" fill="#fffbe5" />
                        <path d="M4 8c-2 0-2 2.5-2 4 0 1.5 2 3 4 3" stroke="#11998e" strokeWidth="1.5"/>
                        <path d="M20 8c2 0 2 2.5 2 4 0 1.5-2 3-4 3" stroke="#11998e" strokeWidth="1.5"/>
                        <circle cx="12" cy="8.7" r="1.9" fill="#fffbe5" />
                      </svg>
                      {reto.nombre.toUpperCase()}
                    </div>

                    {/* Estado debajo del título, centrado */}
                    <div style={styles.retoEstado(estado)}>
                      {estado}
                    </div>

                    <div style={styles.retoInfo}>
                      <strong>Inicio: </strong>
                      {fechaFormateada(reto.fechaInicio)}
                    </div>
                    <div style={styles.retoInfo}>
                      <strong>Cierre: </strong>
                      {fechaFormateada(reto.fechaCierre)}
                    </div>

                    <div style={styles.retoInfo}>
                      <strong>Asignación: </strong>
                      {asignacion}
                    </div>
                  </div>
                  <div style={styles.botones}>
                    <button
                      style={{ ...styles.btn, ...styles.btnVer }}
                      onClick={() => navigate(`/retos/${reto._id}`)}
                      aria-label={`Ver detalles de ${reto.nombre}`}
                    >
                      <svg width="18" height="18" fill="none" viewBox="0 0 20 20">
                        <ellipse cx="10" cy="10" rx="8" ry="6" fill="#fff" />
                        <ellipse cx="10" cy="10" rx="8" ry="6" stroke="#11998e" strokeWidth="1.5" />
                        <circle cx="10" cy="10" r="3" fill="#11998e" />
                      </svg>
                      Ver
                    </button>
                    {rol === "admin" && (
                      <>
                        <button
                          style={{ ...styles.btn, ...styles.btnEditar }}
                          onClick={() => navigate(`/retos/editar/${reto._id}`)}
                          aria-label={`Editar ${reto.nombre}`}
                        >
                          <svg width="17" height="17" fill="none" viewBox="0 0 20 20">
                            <rect x="5" y="13" width="10" height="2" rx="1" fill="#fffbe5" />
                            <path d="M7 12l5.7-5.7a1 1 0 0 1 1.42 0l.58.58a1 1 0 0 1 0 1.42L9 14H7v-2Z" fill="#fff" />
                            <rect x="6" y="13" width="8" height="1" rx="0.5" fill="#fff8dc" />
                          </svg>
                          Editar
                        </button>
                        <button
                          style={{ ...styles.btn, ...styles.btnEliminar }}
                          onClick={() => handleSolicitarEliminar(reto)}
                          aria-label={`Eliminar ${reto.nombre}`}
                          title="Eliminar reto"
                        >
                          <svg width="17" height="17" fill="none" viewBox="0 0 19 19">
                            <rect x="5" y="7" width="9" height="7" rx="2" fill="#fce5e5" />
                            <rect x="3" y="5" width="13" height="2" rx="1" fill="#e74c3c" />
                            <path d="M8 9v4M11 9v4" stroke="#e74c3c" strokeWidth="1.4" strokeLinecap="round" />
                          </svg>
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default RetosPage;
