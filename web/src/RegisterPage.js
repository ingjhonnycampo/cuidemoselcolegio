import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [rol, setRol] = useState("estudiante"); // valor predeterminado
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validarFormulario = () => {
    if (!nombre.trim() || !email.trim() || !rol.trim()) return false;
    if (!password || !passwordConfirm) return false;
    if (password !== passwordConfirm) return false;
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    if (!validarFormulario()) {
      setError("Por favor completa los campos correctamente.");
      return;
    }
    setLoading(true);
    axios
      .post("http://localhost:5000/api/usuarios/registro", {
        nombre,
        email,
        password,
        rol,
      })
      .then(() => {
        setExito("Registro exitoso. Serás redirigido al login...");
        setTimeout(() => navigate("/login"), 3000);
      })
      .catch((err) => {
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Error en el registro."
        );
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div style={styles.fondo}>
      <div style={styles.pageContainer}>
        <h2 style={{ ...styles.title, textAlign: "center" }}>
          Registro de usuario
        </h2>

        {(error || exito) && (
          <div style={{ marginBottom: 20, textAlign: "center" }}>
            {error && <span style={styles.error}>{error}</span>}
            {exito && <span style={styles.exitoCenter}>{exito}</span>}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.formGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nombre completo</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              style={styles.inputEditable}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Correo electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.inputEditable}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.inputEditable}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirmar contraseña</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
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
              <option value="estudiante">Estudiante</option>
              <option value="invitado">Invitado</option>
            </select>
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
              disabled={!validarFormulario() || loading}
              style={{
                ...styles.btnRegistrar,
                cursor:
                  validarFormulario() && !loading ? "pointer" : "not-allowed",
                opacity: validarFormulario() && !loading ? 1 : 0.5,
                minWidth: 130,
              }}
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                ...styles.btnRegistrar,
                backgroundColor: "#2e7d32",
                minWidth: 130,
              }}
            >
              Volver al login
            </button>
          </div>
        </form>
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
    maxWidth: 450,
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
    color: "#119e",
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
    backgroundColor: "#119e",
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
  },
  error: {
    color: "#e74d3d",
    fontWeight: 700,
    fontSize: 16,
    textAlign: "center",
  },
  exitoCenter: {
    color: "#2cac31",
    fontWeight: 800,
    fontSize: 18,
    textAlign: "center",
    margin: "0 10px",
  },
};

export default RegisterPage;
