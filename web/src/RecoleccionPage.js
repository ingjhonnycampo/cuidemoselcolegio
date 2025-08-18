import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "./api";

// Íconos SVG simples
const IconFormulario = () => (
  <svg width="24" height="24" fill="#20ad4e" viewBox="0 0 24 24" aria-hidden="true" style={{ marginRight: 10 }}>
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" stroke="#20ad4e" strokeWidth="2" fill="none" />
    <path d="M8 12h8M8 16h5" stroke="#20ad4e" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
const IconGuardar = () => (
  <svg width="21" height="21" viewBox="0 0 20 20" fill="none" style={{ marginRight: 8 }}>
    <rect x="3.5" y="3.5" width="13" height="13" rx="2.5" stroke="#fff" strokeWidth="2" />
    <path d="M7 7h6v2H7V7zm0 4h4v2H7v-2z" fill="#fff" />
  </svg>
);
const IconRegistro = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2e7d32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 10 }} aria-hidden="true">
    <path d="M3 7v10a2 2 0 0 0 2 2h14" />
    <polyline points="16 3 12 7 8 3" />
    <line x1="12" y1="7" x2="12" y2="15" />
  </svg>
);

function calcularEstado(fechaInicio, fechaCierre) {
  const ahora = new Date();
  const inicio = new Date(fechaInicio);
  const cierre = new Date(fechaCierre);
  if (ahora < inicio) return "Abierto";
  if (ahora > cierre) return "Cerrado";
  return "Activo";
}

function formatDate(fecha) {
  if (!fecha) return "";
  return new Date(fecha).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getUsuarioActual() {
  const usuarioGuardado = localStorage.getItem("usuario");
  if (!usuarioGuardado) return null;
  return JSON.parse(usuarioGuardado);
}

export default function RecoleccionPage() {
  const { id: retoId } = useParams();
  const navigate = useNavigate();

  const [reto, setReto] = useState(null);
  const [salones, setSalones] = useState([]);
  const [selectedSalon, setSelectedSalon] = useState("");
  const [entregas, setEntregas] = useState([]);
  const [loadingDatos, setLoadingDatos] = useState(true);
  const [loadingEntregas, setLoadingEntregas] = useState(false);
  const [errorReto, setErrorReto] = useState("");
  const [errorSalones, setErrorSalones] = useState("");
  const [errorEntregas, setErrorEntregas] = useState("");
  const [peso, setPeso] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Estado agregado para controlar la visibilidad del modal
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const usuario = useMemo(() => {
    const u = localStorage.getItem("usuario");
    return u ? JSON.parse(u) : null;
  }, []);

  const [modalSalir, setModalSalir] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const usuarioActual = getUsuarioActual();

  const cerrarSesion = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/");
  };

  useEffect(() => {
    async function cargarDatos() {
      setLoadingDatos(true);
      try {
        setErrorReto("");
        const resReto = await api.get(`/retos/${retoId}`);
        setReto(resReto.data);
        setErrorSalones("");
        const resSalones = await api.get(`/recolecciones/reto/${retoId}/salones`);
        setSalones(resSalones.data);
      } catch {
        setErrorReto("Error al cargar información del reto o salones.");
      } finally {
        setTimeout(() => setLoadingDatos(false), 1000); // mínimo 1s spinner
      }
    }
    cargarDatos();
  }, [retoId]);

  useEffect(() => {
    async function cargarEntregas() {
      try {
        setLoadingEntregas(true);
        setErrorEntregas("");
        let url = `/recolecciones/reto/${retoId}`;
        if (selectedSalon) url += `?salonId=${selectedSalon}`;
        const res = await api.get(url);
        setEntregas(res.data);
      } catch {
        setErrorEntregas("Error al cargar registros.");
        setEntregas([]);
      } finally {
        setLoadingEntregas(false);
      }
    }
    cargarEntregas();
  }, [selectedSalon, retoId]);

  useEffect(() => {
    if (formSuccess || formError) {
      const timeout = setTimeout(() => {
        setFormSuccess("");
        setFormError("");
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [formSuccess, formError]);

  // Función para mostrar el modal de éxito 2 segundos y ocultarlo
  function mostrarModalExito() {
    setShowSuccessModal(true);
    setTimeout(() => {
      setShowSuccessModal(false);
    }, 2000);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    if (!selectedSalon) {
      setFormError("Por favor selecciona un salón.");
      return;
    }
    const esNumeroValido = peso !== "" && !isNaN(peso) && Number(peso) >= 0;
    if (!esNumeroValido) {
      setFormError("Ingresa un peso válido (puede ser 0).");
      return;
    }
    const pesoNum = parseFloat(peso);
    if (!usuario) {
      setFormError("Usuario no autorizado.");
      return;
    }
    try {
      await api.post("/recolecciones", {
        retoId,
        salonId: selectedSalon,
        pesoLibras: pesoNum,
        registradoPor: {
          id: usuario.id || usuario._id,
          nombre: usuario.nombre,
        },
      });
      setPeso("");
      setSelectedSalon("");
      setFormSuccess("Registro de información exitoso");

      mostrarModalExito();

    } catch (err) {
      let mensaje = "Error al registrar la evidencia.";
      if (err?.response?.data?.message) {
        mensaje = err.response.data.message;
      }
      setFormError(mensaje);
    }
  };

  const estadoActual = reto ? calcularEstado(reto.fechaInicio, reto.fechaCierre) : "";
  const totalPeso = entregas.reduce((acc, cur) => acc + (cur.pesoLibras || 0), 0);

  return (
    <div style={styles.fondo}>
      <div style={styles.container}>
        {/* Barra usuario conectado / salir */}
        {usuarioActual && (
          <div style={styles.userBar}>
            <div style={styles.userInfo}>
              <svg width={28} height={28} fill="#11998e" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="12" cy="8" r="5" />
                <ellipse cx="12" cy="17" rx="8.2" ry="5.5" fill="#d1f4f1" />
                <ellipse cx="12" cy="17.4" rx="7.3" ry="4.2" fill="#fff" />
              </svg>
              <span>{usuarioActual.nombre}</span>
              <span style={styles.userRole}>
                <svg width={17} height={17} viewBox="0 0 24 24" fill="#eca728" aria-hidden="true" focusable="false">
                  <path d="M12 2l2.092 6.426H20.5l-5.204 3.783L17.181 20 12 15.549 6.819 20l1.885-7.791L3.5 8.426h6.408z" />
                </svg>
                {usuarioActual.rol}
              </span>
            </div>
            <button
              type="button"
              style={styles.logoutBtn}
              onClick={() => setModalSalir(true)}
              aria-label="Cerrar sesión"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="logout-button"
            >
              <svg width={26} height={26} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                <rect x="3" y="3" width="14" height="18" rx="3.5" stroke="#e74c3c" strokeWidth="2" />
                <path d="M16 12h5M19 15l2-3-2-3" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ ...styles.logoutTooltip, opacity: showTooltip ? 1 : 0, visibility: showTooltip ? "visible" : "hidden" }}>
                Cerrar sesión
              </span>
            </button>
          </div>
        )}

        {/* Modal salir */}
        {modalSalir && (
          <div style={styles.modalOverlay} role="dialog" aria-modal="true">
            <div style={styles.modalContent}>
              <h2 style={styles.modalTitle}>¿Seguro que quieres cerrar sesión?</h2>
              <div style={styles.modalButtons}>
                <button style={styles.modalButtonConfirm} onClick={() => {
                  setModalSalir(false);
                  setTimeout(() => cerrarSesion(), 200);
                }}>
                  Sí, salir
                </button>
                <button style={styles.modalButtonCancel} onClick={() => setModalSalir(false)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {loadingDatos ? (
          <div style={{ display: "flex", justifyContent: "center", marginTop: 60 }}>
            <svg width={48} height={48} viewBox="0 0 50 50" aria-hidden="true" >
              <circle
                cx="25"
                cy="25"
                r="20"
                fill="none"
                stroke="#11998e"
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="31.4 31.4"
              >
                <animateTransform
                  attributeName="transform"
                  attributeType="XML"
                  type="rotate"
                  from="0 25 25"
                  to="360 25 25"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            </svg>
          </div>
        ) : (
          <>
            <h2 style={styles.title}>
              <IconFormulario />
              Ingreso de datos en el reto
            </h2>

            <div style={styles.contentRow}>
              <div style={styles.retoTableContainer}>
                <table style={styles.retoTable}>
                  <thead>
                    <tr>
                      <th colSpan="2" style={styles.retoTableHeader}>Información del Reto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorReto ? (
                      <tr>
                        <td colSpan="2" style={styles.errorCell}>{errorReto}</td>
                      </tr>
                    ) : reto ? (
                      <>
                        <tr style={styles.infoRowEven}>
                          <td style={styles.retoLabelLeft}>Nombre:</td>
                          <td style={styles.retoValue}>{reto.nombre}</td>
                        </tr>
                        <tr style={styles.infoRowOdd}>
                          <td style={styles.retoLabelLeft}>Fecha apertura:</td>
                          <td style={styles.retoValue}>{formatDate(reto.fechaInicio)}</td>
                        </tr>
                        <tr style={styles.infoRowEven}>
                          <td style={styles.retoLabelLeft}>Fecha cierre:</td>
                          <td style={styles.retoValue}>{formatDate(reto.fechaCierre)}</td>
                        </tr>
                        <tr style={styles.infoRowOdd}>
                          <td style={styles.retoLabelLeft}>Estado:</td>
                          <td style={{
                            ...styles.estadoCuadroSinSombra,
                            color: estadoActual === "Abierto" ? "#2e7d32" : estadoActual === "Cerrado" ? "#c73838" : "#555"
                          }}>{estadoActual}</td>
                        </tr>
                      </>
                    ) : (
                      <tr>
                        <td colSpan="2">No hay información disponible.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <form style={styles.formSameSize} onSubmit={handleSubmit}>
                <h3 style={styles.formTitleCentered}>
                  <IconFormulario />
                  Registro de evidencia
                </h3>
                {formSuccess && <p style={{ ...styles.message, ...styles.success }}>{formSuccess}</p>}
                {formError && <p style={{ ...styles.message, ...styles.error }}>{formError}</p>}
                {errorSalones && <p style={styles.error}>{errorSalones}</p>}
                <label htmlFor="selectSalon" style={styles.labelBold}>Seleccione Salón</label>
                <select
                  id="selectSalon"
                  style={styles.controlInput}
                  value={selectedSalon}
                  onChange={(e) => setSelectedSalon(e.target.value)}
                >
                  <option value="">-- Seleccione un salón --</option>
                  {salones.map((salon) => (
                    <option key={salon._id} value={salon._id}>
                      {`${salon.grado} | ${salon.salon} | ${salon.jornada} | ${salon.sede}`}
                    </option>
                  ))}
                </select>
                <label htmlFor="peso" style={styles.labelBold}>Peso reciclado (libras)</label>
                <div style={styles.inputRow}>
                  <input
                    id="peso"
                    type="number"
                    style={styles.controlInput}
                    placeholder="Ej. 12.50"
                    min="0"
                    step="0.01"
                    value={peso}
                    onChange={(e) => setPeso(e.target.value)}
                    required
                    inputMode="decimal"
                  />
                  <button type="submit" style={styles.buttonRow}>
                    <IconGuardar />
                    Registrar
                  </button>
                </div>
              </form>
            </div>
            <div style={styles.recordsContainer}>
              <h3 style={styles.recordsTitleCentered}>
                <IconRegistro />
                Registro de Evidencias Previas
              </h3>
              {loadingEntregas && <p>Cargando registros...</p>}
              {errorEntregas && <p style={styles.error}>{errorEntregas}</p>}
              {!loadingEntregas && entregas.length === 0 && <p>No hay registros aún.</p>}
              {!loadingEntregas && entregas.length > 0 && (
                <div style={{ overflowX: "auto" }}>
                  <table style={styles.recordsTable}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Grado</th>
                        <th style={styles.th}>Curso</th>
                        <th style={styles.th}>Jornada</th>
                        <th style={styles.th}>Sede</th>
                        <th style={styles.th}>Peso (lbs)</th>
                        <th style={styles.th}>Registrado por</th>
                        <th style={styles.th}>Fecha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entregas.map((entrega, idx) => (
                        <tr key={entrega._id || idx} style={idx % 2 === 0 ? styles.recordRowEven : styles.recordRowOdd}>
                          <td style={styles.td}>{entrega.salonId?.grado || ""}</td>
                          <td style={styles.td}>{entrega.salonId?.salon || ""}</td>
                          <td style={styles.td}>{entrega.salonId?.jornada || ""}</td>
                          <td style={styles.td}>{entrega.salonId?.sede || ""}</td>
                          <td style={styles.td}>
                            {typeof entrega.pesoLibras === "number" ? entrega.pesoLibras.toFixed(2) : "-"}
                          </td>
                          <td style={styles.td}>{entrega.registradoPor?.nombre || "No registrado"}</td>
                          <td style={styles.td}>
                            {entrega.fechaRegistro ? new Date(entrega.fechaRegistro).toLocaleString() : "-"}
                          </td>
                        </tr>
                      ))}
                      <tr style={styles.totalRow}>
                        <td colSpan="4" style={styles.totalLabelCell}>Total Peso (lbs):</td>
                        <td style={styles.td}>{totalPeso.toFixed(2)}</td>
                        <td colSpan="2"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <button style={styles.backButton} onClick={() => navigate(-1)}>
              ← Volver
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const cajaWidth = 380;
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
    gap: 35,
    boxSizing: "border-box",
  },
  userBar: {
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    background: "linear-gradient(90deg,#e0fefa 60%,#fffbe5 100%)",
    borderRadius: 20,
    boxShadow: "0 2px 12px #e0fefa50",
    color: "#11998e",
    marginBottom: 24,
    flexWrap: "wrap",
    gap: 10,
    fontWeight: 700,
    fontSize: 18,
    boxSizing: "border-box",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  userRole: {
    display: "inline-flex",
    alignItems: "center",
    fontWeight: 500,
    fontSize: 14,
    color: "#eca728",
    gap: 6,
    fontStyle: "italic",
    userSelect: "none",
  },
  logoutBtn: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    borderRadius: "50%",
    padding: 8,
    boxShadow: "0 2px 16px #e74c3c22",
    transition: "background 0.2s",
    color: "#e44848",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    flexShrink: 0,
  },
  logoutTooltip: {
    position: "absolute",
    bottom: "-34px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#272727de",
    color: "#fff",
    padding: "6px 14px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: "nowrap",
    opacity: 0,
    transition: "opacity 0.25s",
    pointerEvents: "none",
    zIndex: 5,
  },
  logoutTooltipVisible: {
    opacity: 1,
    pointerEvents: "auto",
  },
  title: {
    fontWeight: 700,
    fontSize: 34,
    color: "#1e6d1e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
  contentRow: {
    display: "flex",
    gap: 25,
    flexWrap: "wrap",
    alignItems: "flex-start",
    justifyContent: "center",
  },
  retoTableContainer: {
    maxWidth: cajaWidth,
    width: "100%",
    overflowX: "auto",
  },
  retoTable: {
    width: "100%",
    minWidth: cajaWidth,
    borderCollapse: "separate",
    borderSpacing: "0 12px",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "rgba(230, 250, 230, 0.85)",
    boxShadow: "0 0 15px rgba(17, 158, 174, 0.3)",
  },
  retoTableHeader: {
    backgroundColor: "#119e8e",
    color: "white",
    fontWeight: "700",
    fontSize: 20,
    padding: 14,
    textAlign: "center",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  retoLabelLeft: {
    padding: "14px 20px",
    backgroundColor: "rgba(17, 158, 174, 0.15)",
    fontWeight: "700",
    fontSize: 16,
    verticalAlign: "middle",
    textAlign: "left",
    minWidth: 140,
  },
  retoValue: {
    padding: "14px 20px",
    fontSize: 16,
    verticalAlign: "middle",
  },
  infoRowEven: {
    backgroundColor: "#def4e3",
  },
  infoRowOdd: {
    backgroundColor: "#e9f6ec",
  },
  estadoCuadroSinSombra: {
    fontWeight: "700",
    textAlign: "center",
    borderRadius: 8,
    padding: "8px 12px",
    display: "inline-block",
    minWidth: 80,
  },
  message: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#d0f0d3",
    userSelect: "none",
    textAlign: "center",
  },
  success: {
    color: "#2e7d32", // Verde oscuro
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 12,
  },
  error: {
    color: "#c73838",
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 12,
  },
  formSameSize: {
    borderRadius: 16,
    backgroundColor: "rgba(230, 250, 230, 0.85)",
    padding: 26,
    boxShadow: "0 0 15px rgba(17, 158, 174, 0.3)",
    minWidth: cajaWidth,
    maxWidth: cajaWidth,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    justifyContent: "center",
    boxSizing: "border-box",
  },
  formTitleCentered: {
    fontWeight: 700,
    fontSize: 22,
    color: "#22a132",
    marginBottom: 16,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(17, 158, 174, 0.15)",
    borderRadius: 12,
    padding: "10px 15px",
  },
  labelBold: {
    fontWeight: 700,
    fontSize: 16,
    color: "#244b24",
    marginBottom: 8,
  },
  controlInput: {
    width: "100%",
    padding: 14,
    fontSize: 16,
    borderRadius: 10,
    border: "1px solid #a5d18e",
    backgroundColor: "#ecf4e7",
    boxSizing: "border-box",
  },
  inputRow: {
    display: "flex",
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    marginTop: 0,
    marginBottom: 0,
  },
  buttonRow: {
    display: "flex",
    alignItems: "center",
    padding: "0 18px",
    height: 48,
    background: "#43a047",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 18,
    cursor: "pointer",
    transition: "background .3s",
    marginLeft: "auto",
    whiteSpace: "nowrap",
  },
  recordsContainer: {
    marginTop: 30,
  },
  recordsTitleCentered: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    fontSize: 24,
    fontWeight: 700,
    color: "#2e7d32",
    marginBottom: 15,
  },
  recordsTable: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 8px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    fontSize: 15,
  },
  th: {
    backgroundColor: "#81c784",
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
  },
  recordRowEven: {
    backgroundColor: "#f1f8f1",
  },
  recordRowOdd: {
    backgroundColor: "#e7f0e6",
  },
  totalRow: {
    fontWeight: "700",
    backgroundColor: "#397a39",
    color: "white",
  },
  totalLabelCell: {
    paddingLeft: 15,
    textAlign: "right",
  },
  backButton: {
    marginTop: 36,
    padding: "14px 40px",
    backgroundColor: "#388e3c",
    borderRadius: 24,
    border: "none",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    userSelect: "none",
    alignSelf: "center",
  },

  // Responsive adjustments for logout button centering on mobile
  "@media (max-width: 480px)": {
    userBar: {
      flexDirection: "column",
      gap: 14,
      alignItems: "center",
    },
    logoutBtn: {
      margin: "0 auto",
    },
  }
};
