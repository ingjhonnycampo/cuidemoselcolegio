import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// ICONOS SVG
const IconUsers = ({ size = 35 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="10" r="4.2" stroke="#119e8e" strokeWidth="2" />
    <circle cx="17" cy="13.5" r="3" stroke="#67c9a2" strokeWidth="2" />
    <ellipse cx="9" cy="18.5" rx="7.5" ry="3.5" stroke="#119e8e" strokeWidth="2" />
    <ellipse cx="17" cy="20" rx="4.1" ry="1.7" stroke="#67c9a2" strokeWidth="2" />
  </svg>
);
const IconAgregar = ({ size=24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10.2" stroke="#119e8e" strokeWidth="2" fill="white"/>
    <path d="M12 8v8M8 12h8" stroke="#119e8e" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);
const IconEditar = ({ size = 23 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="4" y="17" width="16" height="2" rx="1" fill="#eca728" />
    <path d="M18.5 6.5l-11 11M17 5a.707.707 0 011 1l-1 1a.707.707 0 01-1-1l1-1z" stroke="#eca728" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconEliminar = ({ size = 23 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="5" y="6" width="14" height="14" rx="2" stroke="#e74c3c" strokeWidth={1.5} />
    <path d="M9 10v6M15 10v6" stroke="#e74c3c" strokeWidth={2} strokeLinecap="round"/>
    <rect x="8" y="3" width="8" height="2" rx="1" fill="#e74c3c"/>
  </svg>
);

function getUsuarioActual() {
  const usuarioGuardado = localStorage.getItem("usuario");
  if (!usuarioGuardado) return null;
  return JSON.parse(usuarioGuardado);
}

function roleColor(role) {
  switch (role) {
    case "admin": return "#e74c3c";
    case "profesor": return "#eca728";
    case "usuario": return "#119e8e";
    case "invitado": return "#aaa";
    case "estudiante": return "#67c9a2";
    default: return "#bbb";
  }
}

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [loading, setLoading] = useState(false);
  const [modoAgregar, setModoAgregar] = useState(false);
  const [modoEditar, setModoEditar] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState("usuario");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showModalEliminar, setShowModalEliminar] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const usuarioActual = getUsuarioActual();
  const rolActual = usuarioActual?.rol || "";

  const getToken = () => localStorage.getItem("token");

  const cargarUsuarios = async () => {
    setError("");
    setLoading(true);
    const token = getToken();
    if (!token) {
      setError("No hay sesión activa. Por favor inicia sesión.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get("http://localhost:5000/api/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usuariosOrdenados = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setUsuarios(usuariosOrdenados);
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error cargando usuarios"
      );
      setUsuarios([]);
    }
    setLoading(false);
  };

  useEffect(() => { cargarUsuarios(); }, []);

  const limpiarFormulario = () => {
    setNombre("");
    setEmail("");
    setRol("usuario");
    setPassword("");
    setPasswordConfirm("");
    setUsuarioSeleccionado(null);
    setModoAgregar(false);
    setModoEditar(false);
    setError("");
    setExito("");
  };

  const validarFormulario = () => {
    if (!nombre.trim() || !email.trim() || !rol.trim()) return false;
    if (modoAgregar && (!password || !passwordConfirm || password !== passwordConfirm)) return false;
    if (modoEditar && (password || passwordConfirm) && password !== passwordConfirm) return false;
    return true;
  };

  const mostrarModalExito = (mensaje) => {
    setSuccessMessage(mensaje);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    setError(""); setExito("");
    if (!validarFormulario()) {
      setError("Por favor completa todos los campos correctamente.");
      return;
    }
    const token = getToken();
    if (!token) {
      setError("No hay sesión activa.");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/api/usuarios",
        { nombre, email, rol, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      mostrarModalExito("Usuario registrado correctamente");
      limpiarFormulario();
      await cargarUsuarios();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error al agregar usuario"
      );
    }
  };

  const iniciarEdicion = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setNombre(usuario.nombre || "");
    setEmail(usuario.email || "");
    setRol(usuario.rol || "usuario");
    setPassword(""); setPasswordConfirm("");
    setModoEditar(true); setModoAgregar(false); setError(""); setExito("");
  };

  const handleModificar = async (e) => {
    e.preventDefault(); setError(""); setExito("");
    if (!validarFormulario()) {
      setError("Por favor completa todos los campos correctamente.");
      return;
    }
    const token = getToken();
    if (!token) {
      setError("No hay sesión activa.");
      return;
    }
    try {
      const datosActualizar = { nombre, email, rol };
      if (password) datosActualizar.password = password;
      await axios.patch(
        `http://localhost:5000/api/usuarios/${usuarioSeleccionado.id || usuarioSeleccionado._id}`, datosActualizar,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      mostrarModalExito("Usuario actualizado correctamente");
      limpiarFormulario();
      await cargarUsuarios();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error actualizando usuario"
      );
    }
  };

  const pedirEliminar = usuario => { setUsuarioAEliminar(usuario); setShowModalEliminar(true); };
  const confirmarEliminar = async () => {
    if (!usuarioAEliminar) return;
    setError(""); setExito("");
    const token = getToken();
    if (!token) {
      setError("No hay sesión activa."); setShowModalEliminar(false); return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/usuarios/${usuarioAEliminar._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      mostrarModalExito("Usuario eliminado correctamente");
      setShowModalEliminar(false); setUsuarioAEliminar(null);
      await cargarUsuarios();
      if (usuarioSeleccionado && usuarioSeleccionado._id === usuarioAEliminar._id) limpiarFormulario();
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Error eliminando usuario"
      );
      setShowModalEliminar(false); setUsuarioAEliminar(null);
    }
  };
  const cancelarEliminar = () => { setShowModalEliminar(false); setUsuarioAEliminar(null); };

  const usuariosPorRol = usuarios.reduce((acc, usuario) => {
    const r = usuario.rol || "Sin rol";
    if (!acc[r]) acc[r] = [];
    acc[r].push(usuario);
    return acc;
  }, {});

  const puedeAgregar = rolActual === "admin";

  return (
    <div style={styles.fondo}>
      <div style={styles.pageContainer}>
        <div style={styles.pageHeader}>
          <IconUsers />
          <h2 style={styles.title}>Gestión de Usuarios</h2>
        </div>

        {(error || exito) && (
          <div style={{ marginBottom: 12, textAlign: "center" }}>
            {error && <span style={styles.error}>{error}</span>}
            {exito && <span style={styles.exitoCenter}>{exito}</span>}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: modoAgregar || modoEditar ? 13 : 28, flexWrap: "wrap" }}>
          {puedeAgregar && !modoAgregar && !modoEditar && (
            <button
              style={styles.btnAgregar}
              onClick={() => {
                limpiarFormulario();
                setModoAgregar(true);
              }}
              type="button"
            >
              <IconAgregar size={21} />
              <span style={{ marginLeft: 8 }}>Crear usuario</span>
            </button>
          )}
          <button
            onClick={() => navigate("/dashboard")}
            style={styles.btnDashboard}
          >
            <svg width={19} height={19} fill="none" viewBox="0 0 24 24" style={{ marginRight: 7 }}>
              <polyline points="15 19 8 12 15 5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </button>
        </div>

        {modoAgregar || modoEditar ? (
          <form onSubmit={modoAgregar ? handleAgregar : handleModificar} style={styles.form}>
            <h3 style={styles.formTitle}>{modoAgregar ? 'Agregar Usuario' : 'Editar Usuario'}</h3>
            <div style={styles.formCol}>
              <label style={styles.label}>Nombre</label>
              <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} style={styles.input} required />
            </div>
            <div style={styles.formCol}>
              <label style={styles.label}>Correo</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} required />
            </div>
            <div style={styles.formCol}>
              <label style={styles.label}>Rol</label>
              <select value={rol} onChange={e => setRol(e.target.value)} style={styles.input} required>
                <option value="usuario">Usuario</option>
                <option value="profesor">Profesor</option>
                <option value="admin">Admin</option>
                <option value="invitado">Invitado</option>
                <option value="estudiante">Estudiante</option>
              </select>
            </div>
            <div style={styles.formCol}>
              <label>
                Contraseña {modoAgregar ? '(requerida)' : '(opcional)'}
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} required={modoAgregar} />
            </div>
            <div style={styles.formCol}>
              <label>
                Confirmar Contraseña {modoAgregar ? '(requerida)' : '(opcional)'}
              </label>
              <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} style={styles.input} required={modoAgregar} />
            </div>
            <div style={{ gridColumn: "1 / -1", display: 'flex', justifyContent: 'center', marginTop: 20, gap: 14 }}>
              <button type="submit" disabled={!validarFormulario()} style={{ ...styles.btnPrimary, opacity: validarFormulario() ? 1 : 0.5 }}>
                {modoAgregar ? 'Agregar' : 'Guardar cambios'}
              </button>
              <button type="button" onClick={limpiarFormulario} style={styles.btnSecondary}>Cancelar</button>
            </div>
          </form>
        ) : (
          loading ? <p>Cargando usuarios...</p> : (
            Object.entries(usuariosPorRol).map(([rolKey, usuariosList]) => (
              <div key={rolKey} style={{ marginBottom: 38 }}>
                <div style={styles.roleBlockTitleWrap}>
                  <span style={styles.roleBlockTitle}>{rolKey.charAt(0).toUpperCase() + rolKey.slice(1)}</span>
                </div>
                <div style={styles.cardGrid}>
                  {usuariosList.map(usuario => (
                    <div
                      key={usuario._id || usuario.email}
                      className="usuario-card"
                      style={styles.usuarioCard}
                      tabIndex={0}
                    >
                      <h3 style={styles.cardTitle}>{usuario.nombre || '-'}</h3>
                      <p style={styles.userEmail}>{usuario.email}</p>
                      <span style={{ ...styles.roleLabel, backgroundColor: roleColor(usuario.rol) }}>{usuario.rol}</span>
                      <div style={styles.cardActions}>
                        {(rolActual === "admin" || rolActual === "profesor" || usuarioActual?.id === usuario._id) && (
                          <button
                            style={styles.iconButton}
                            onClick={() => iniciarEdicion(usuario)}
                            title="Editar usuario"
                            type="button"
                          >
                            <IconEditar />
                          </button>
                        )}
                        {rolActual === "admin" && (
                          <button
                            style={styles.iconButton}
                            onClick={() => pedirEliminar(usuario)}
                            title="Eliminar usuario"
                            type="button"
                          >
                            <IconEliminar />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )
        )}

        {showModalEliminar && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalWindow}>
              <h3 style={{ textAlign: "center", marginBottom: 14, fontWeight: "bold", color: "#e74c3c" }}>Confirmar eliminación</h3>
              <p style={{ textAlign: "center", marginBottom: 18 }}>
                ¿Seguro que quieres eliminar el usuario <b>{usuarioAEliminar?.nombre || usuarioAEliminar?.email}</b>?
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 18 }}>
                <button style={styles.btnDelete} onClick={confirmarEliminar}>Eliminar</button>
                <button style={styles.btnCancel} onClick={cancelarEliminar}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
        {showSuccessModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalSuccess}>
              <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#4BB543" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              <p style={{ marginTop: 12, fontWeight: "bold", fontSize: 18, color: "#4BB543" }}>
                {successMessage}
              </p>
            </div>
          </div>
        )}
      </div>
      <style>
        {`
          .usuario-card {
            transition: box-shadow 0.18s cubic-bezier(.34,1.56,.64,1), background 0.15s;
          }
          .usuario-card:focus,
          .usuario-card:hover {
            background: #e6fff1 !important;
            box-shadow: 0 14px 32px 0 #119e8e38, 0 1.5px 3px #2ca4301f !important;
            outline: none;
            transform: translateY(-3px) scale(1.045);
          }
        `}
      </style>
    </div>
  );
}

const styles = {
  fondo: {
    minHeight: "100vh",
    width: "100vw",
    background: "linear-gradient(rgba(168,224,99,0.53), rgba(86,171,47,0.47)), url('/fondo-ambiental.jpg') no-repeat center center fixed",
    backgroundSize: "cover",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  pageContainer: {
    maxWidth: 970,
    margin: "38px auto",
    padding: "0 10px 30px 10px",
    background: "rgba(255,255,255,0.95)",
    borderRadius: 18,
    boxShadow: "0 0 18px 2px rgb(14 197 134 / 0.17)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#263238",
    position: "relative",
    width: "98%",
  },
  pageHeader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 0,
    margin: "0 0 22px 0"
  },
  title: {
    fontWeight: "bold",
    fontSize: 32,
    marginTop: 3,
    color: "#119e8e",
    textAlign: "center",
    letterSpacing: ".4px"
  },
  btnDashboard: {
    backgroundColor: "#119e8e",
    color: "white",
    border: "none",
    borderRadius: 6,
    padding: "10px 18px",
    fontSize: 16,
    fontWeight: "bold",
    cursor: "pointer",
    userSelect: "none",
    transition: "background-color 0.3s ease",
    display: "inline-flex",
    alignItems: "center"
  },
  btnAgregar: {
    backgroundColor: "white",
    color: "#119e8e",
    border: "2px solid #119e8e",
    borderRadius: 10,
    fontWeight: "bold",
    fontSize: 16,
    padding: "9px 26px 9px 17px",
    marginBottom: 0,
    marginRight: 0,
    display: "flex",
    alignItems: "center",
    boxShadow: "0 1.5px 12px #119e8e15",
    cursor: "pointer",
    transition: "all .18s"
  },
  error: {
    color: "#e74c3c",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center"
  },
  exitoCenter: {
    color: "#4BB543",
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center"
  },
  btnPrimary: {
    backgroundColor: "#119e8e",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "10px 22px",
    fontWeight: "bold",
    cursor: "pointer",
    userSelect: "none"
  },
  btnSecondary: {
    backgroundColor: "#2E7D32",
    color: "white",
    border: "none",
    borderRadius: 8,
    padding: "10px 22px",
    fontWeight: "bold",
    cursor: "pointer",
    marginLeft: 14
  },
  form: {
    background: "white",
    borderRadius: 15,
    boxShadow: "0 0 12px rgba(0,0,0,0.10)",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    maxWidth: 600,
    margin: "0 auto 38px auto",
    padding: "24px 20px"
  },
  formTitle: {
    gridColumn: "1 / -1",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 23,
    marginBottom: 15,
    color: "#119e8e"
  },
  formCol: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    minWidth: 0
  },
  label: {
    marginBottom: 4,
    fontWeight: "bold"
  },
  input: {
    padding: 11,
    borderRadius: 7,
    border: "1px solid #cbded3",
    fontSize: 16,
    background: "#fafffd"
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(271px, 1fr))",
    gap: 23,
    marginTop: 18
  },
  usuarioCard: {
    backgroundColor: "#f6fcfd",
    borderRadius: 15,
    padding: "23px 16px 15px 16px",
    boxShadow: "0 2.2px 9px -2.5px #119e8e2b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: 210,
    minWidth: 0,
    transition: "box-shadow 0.18s cubic-bezier(.34,1.56,.64,1), background 0.15s",
    cursor: "pointer",
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 21,
    textAlign: "center",
    marginBottom: 7,
    letterSpacing: ".6px",
    color: "#119e8e"
  },
  userEmail: {
    textAlign: "center",
    color: "#5e5e5e",
    fontSize: 14,
    marginBottom: 8,
    wordBreak: "break-all"
  },
  roleLabel: {
    borderRadius: 14,
    padding: "4px 14px",
    fontWeight: "700",
    color: "white",
    fontSize: 13.5,
    textTransform: "capitalize",
    marginBottom: 13,
    marginTop: 1,
    userSelect: "none",
    letterSpacing: ".7px"
  },
  cardActions: {
    marginTop: "auto",
    width: "100%",
    display: "flex",
    justifyContent: "center",
    gap: 24
  },
  iconButton: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    margin: 0,
    width: 30,
    height: 30,
    outline: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  roleBlockTitleWrap: {
    marginBottom: 6,
    marginTop: 5,
    display: 'flex',
    justifyContent: 'center'
  },
  roleBlockTitle: {
    display: "inline-block",
    fontWeight: "bold",
    fontSize: 22,
    letterSpacing: ".5px",
    color: "#388e3c",
    background: "#e3f7ef",
    borderRadius: 999,
    padding: "7px 34px",
    textAlign: "center"
  },
  modalOverlay: {
    position: "fixed",
    zIndex: 99999,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.27)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  modalWindow: {
    backgroundColor: "white",
    borderRadius: 13,
    padding: 31,
    maxWidth: 350,
    width: "97%",
    boxShadow: "0 0 22px 0px rgba(231,76,60,0.15)",
    textAlign: "center"
  },
  btnDelete: {
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: 7,
    padding: "10px 24px",
    fontWeight: "bold",
    cursor: "pointer",
    marginRight: 13
  },
  btnCancel: {
    backgroundColor: "#bbb",
    color: "#303030",
    border: "none",
    borderRadius: 7,
    padding: "10px 24px",
    fontWeight: "bold",
    cursor: "pointer"
  },
  modalSuccess: {
    background: "#f0fff4",
    borderRadius: 11,
    padding: "24px 36px",
    boxShadow: "0 5px 18px rgba(75, 181, 67, 0.24)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: 210
  }
};

export default UsuariosPage;
