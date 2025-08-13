import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function getUsuarioActual() {
  const usuarioGuardado = localStorage.getItem("usuario");
  if (!usuarioGuardado) return null;
  return JSON.parse(usuarioGuardado);
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
      setUsuarios(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Error al cargar usuarios"
      );
      setUsuarios([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

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
    if (modoAgregar) {
      if (!password || !passwordConfirm) return false;
      if (password !== passwordConfirm) return false;
    } else if (modoEditar) {
      if (password || passwordConfirm) {
        if (password !== passwordConfirm) return false;
      }
    }
    return true;
  };

  const handleAgregar = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    if (!validarFormulario()) {
      setError("Por favor completa todos los campos correctamente.");
      return;
    }
    const token = getToken();
    if (!token) {
      setError("No hay sesión activa. Por favor inicia sesión.");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/api/usuarios",
        { nombre, email, rol, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExito("Usuario agregado con éxito");
      limpiarFormulario();
      await cargarUsuarios();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "No se pudo agregar el usuario"
      );
    }
  };

  const iniciarEdicion = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setNombre(usuario.nombre || "");
    setEmail(usuario.email || "");
    setRol(usuario.rol || "usuario");
    setPassword("");
    setPasswordConfirm("");
    setModoEditar(true);
    setModoAgregar(false);
    setError("");
    setExito("");
  };

  const handleModificar = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    if (!validarFormulario()) {
      setError("Por favor completa todos los campos correctamente.");
      return;
    }
    const token = getToken();
    if (!token) {
      setError("No hay sesión activa. Por favor inicia sesión.");
      return;
    }
    try {
      const datosActualizar = { nombre, email, rol };
      if (password) datosActualizar.password = password;

      await axios.patch(
        `http://localhost:5000/api/usuarios/${usuarioSeleccionado.id || usuarioSeleccionado._id}`,
        datosActualizar,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExito("Usuario modificado con éxito");
      limpiarFormulario();
      await cargarUsuarios();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "No se pudo modificar el usuario"
      );
    }
  };

  const handleEliminar = async (usuario) => {
    if (!window.confirm(`¿Quieres eliminar al usuario ${usuario.nombre || usuario.email}?`))
      return;
    setError("");
    setExito("");
    const token = getToken();
    if (!token) {
      setError("No hay sesión activa. Por favor inicia sesión.");
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/usuarios/${usuario._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExito("Usuario eliminado con éxito");
      if (usuarioSeleccionado && usuarioSeleccionado._id === usuario._id) {
        limpiarFormulario();
      }
      await cargarUsuarios();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "No se pudo eliminar el usuario"
      );
    }
  };

  const puedeAgregar = rolActual === "admin";
  const puedeEliminar = rolActual === "admin";
  const puedeEditar = rolActual === "admin" || rolActual === "profesor";

  return (
    <div style={styles.fondo}>
      <div style={styles.pageContainer}>
        <h2 style={{ ...styles.title, textAlign: "center" }}>Usuarios registrados</h2>

        {(error || exito) && (
          <div style={{ marginBottom: 12, textAlign: "center" }}>
            {error && <span style={styles.error}>{error}</span>}
            {exito && <span style={styles.exitoCenter}>{exito}</span>}
          </div>
        )}

        {puedeAgregar && !modoAgregar && !modoEditar && (
          <div style={{ marginBottom: 16, textAlign: "center" }}>
            <button
              style={{ ...styles.btnRegistrar, minWidth: 180 }}
              onClick={() => {
                limpiarFormulario();
                setModoAgregar(true);
              }}
            >
              Agregar nuevo usuario
            </button>
          </div>
        )}

        {(modoAgregar || modoEditar) && (
          <form
            onSubmit={modoAgregar ? handleAgregar : handleModificar}
            style={styles.formGrid}
          >
            <div style={styles.formGroup}>
              <label style={styles.label}>Nombre</label>
              <input
                type="text"
                value={nombre}
                required
                onChange={(e) => setNombre(e.target.value)}
                style={styles.inputEditable}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Correo</label>
              <input
                type="email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                style={styles.inputEditable}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Rol</label>
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                required
                style={styles.inputEditable}
              >
                <option value="usuario">Usuario</option>
                <option value="profesor">Profesor</option>
                <option value="admin">Admin</option>
                <option value="invitado">Invitado</option>
                <option value="estudiante">Estudiante</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label>
                Contraseña {modoAgregar ? "(requerida)" : "(opcional)"}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                {...(modoAgregar ? { required: true } : {})}
                style={styles.inputEditable}
              />
            </div>
            <div style={styles.formGroup}>
              <label>
                Confirmar Contraseña {modoAgregar ? "(requerida)" : "(opcional)"}
              </label>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                {...(modoAgregar ? { required: true } : {})}
                style={styles.inputEditable}
              />
            </div>
            <div
              style={{
                gridColumn: "span 2",
                display: "flex",
                justifyContent: "center",
                gap: 12,
              }}
            >
              <button
                type="submit"
                disabled={!validarFormulario()}
                style={{
                  ...styles.btnRegistrar,
                  cursor: validarFormulario() ? "pointer" : "not-allowed",
                  opacity: validarFormulario() ? 1 : 0.5,
                  minWidth: 130,
                }}
              >
                {modoAgregar ? "Agregar" : "Guardar cambios"}
              </button>
              <button
                type="button"
                onClick={limpiarFormulario}
                style={{
                  ...styles.btnCancelar,
                  minWidth: 130,
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {!modoAgregar && !modoEditar && (
          <>
            {loading ? (
              <p>Cargando usuarios...</p>
            ) : usuarios.length === 0 ? (
              <p>No hay usuarios registrados.</p>
            ) : (
              <table style={styles.tablaUsuarios}>
                <thead style={styles.theadSticky}>
                  <tr>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Correo</th>
                    <th style={styles.th}>Rol</th>
                    <th style={styles.th}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario._id} style={{ fontSize: 14 }}>
                      <td style={{ padding: "6px 14px" }}>{usuario.nombre || "-"}</td>
                      <td style={{ padding: "6px 14px" }}>{usuario.email}</td>
                      <td style={{ padding: "6px 14px" }}>{usuario.rol || "-"}</td>
                      <td style={{ padding: "6px 14px" }}>
                        {(rolActual === "admin" ||
                          rolActual === "profesor" ||
                          usuarioActual?.id === usuario._id) && (
                          <button
                            style={styles.btnEditar}
                            onClick={() => iniciarEdicion(usuario)}
                            disabled={loading}
                          >
                            Editar
                          </button>
                        )}
                        {rolActual === "admin" && (
                          <button
                            style={styles.btnEliminar}
                            onClick={() => handleEliminar(usuario)}
                            disabled={loading}
                          >
                            Eliminar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* BOTÓN VOLVER AL DASHBOARD DEBAJO DE TABLA/MENSAJES*/}
            <div style={{ marginTop: 20, textAlign: "left" }}>
              <button
                onClick={() => navigate("/dashboard")}
                style={styles.btnVolver}
                title="Volver al Dashboard"
              >
                <svg
                  width={19}
                  height={19}
                  fill="none"
                  viewBox="0 0 24 24"
                  style={{ marginRight: 8 }}
                >
                  <polyline
                    points="15 19 8 12 15 5"
                    stroke="#fff"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Dashboard
              </button>
            </div>
          </>
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
      "linear-gradient(rgba(168,224,99,0.55), rgba(86,171,47,0.45)), url('/fondo-ambiental.jpg') no-repeat center center fixed",
    backgroundSize: "cover",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
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
  },
  title: {
    marginBottom: 24,
    fontWeight: 700,
    fontSize: 26,
    color: "#119e8e",
  },
  btnVolver: {
    backgroundColor: "#119e8e",
    color: "white",
    border: "none",
    borderRadius: 6,
    padding: "10px 18px",
    fontSize: 16,
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    userSelect: "none",
    transition: "background-color 0.3s ease",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    columnGap: 20,
    rowGap: 16,
    marginBottom: 10,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  inputEditable: {
    padding: "8px 12px",
    fontSize: 14,
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  label: {
    fontWeight: 600,
    marginBottom: 4,
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
    minWidth: 130,
  },
  btnCancelar: {
    border: "none",
    borderRadius: 8,
    backgroundColor: "#2E7D32",
    color: "white",
    fontWeight: 700,
    fontSize: 16,
    padding: "10px 0",
    userSelect: "none",
    cursor: "pointer",
    minWidth: 130,
  },
  btnEditar: {
    backgroundColor: "#eca728",
    color: "white",
    border: "none",
    borderRadius: 6,
    fontWeight: 700,
    fontSize: 14,
    padding: "6px 12px",
    marginRight: 8,
    cursor: "pointer",
  },
  btnEliminar: {
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: 6,
    fontWeight: 700,
    fontSize: 14,
    padding: "6px 12px",
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
    margin: "0 10px",
  },
  tablaUsuarios: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 7px",
    background: "#fafcff",
    borderRadius: 12,
    marginTop: 18,
    boxShadow: "0 3px 5px rgb(0 0 0 / 0.08)",
    fontSize: 14,
  },
  theadSticky: {
    position: "sticky",
    top: 0,
    background: "#d9f1db",
    zIndex: 10,
  },
  th: {
    padding: "8px 14px",
    color: "#119e8e",
    fontWeight: 700,
    borderBottom: "2px solid #a9d1b5",
    textAlign: "center",
  },
};

export default UsuariosPage;

