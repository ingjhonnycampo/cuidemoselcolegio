import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// SVG decora la parte superior
const IconRegister = () => (
  <svg width="65" height="65" viewBox="0 0 65 65" fill="none" style={{ marginBottom: 14 }}>
    <circle cx="32.5" cy="32.5" r="32.5" fill="#e0fefa"/>
    <ellipse cx="32.5" cy="47" rx="17" ry="7.5" fill="#b8e2b2"/>
    <ellipse cx="32.5" cy="29.6" rx="12.2" ry="12.8" fill="white"/>
    <ellipse cx="39" cy="28.3" rx="2.7" ry="2.2" fill="#67c9a2" opacity="0.32"/>
    <ellipse cx="29.2" cy="31.7" rx="1.5" ry="2" fill="#67c9a2" opacity="0.16"/>
    <ellipse cx="35" cy="26.4" rx="4.4" ry="3.8" fill="#89d3b3"/>
    <ellipse cx="32.5" cy="32.5" rx="11.5" ry="12" fill="none" stroke="#119e8e" strokeWidth="2"/>
  </svg>
);

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
        <div style={styles.svgWrap}>
          <IconRegister />
        </div>
        <h2 style={styles.title}>Registro de usuario</h2>

        {(error || exito) && (
          <div style={{ marginBottom: 15, textAlign: "center" }}>
            {error && <span style={styles.error}>{error}</span>}
            {exito && <span style={styles.exito}>{exito}</span>}
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
              placeholder="Ejemplo: Juan Pérez"
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
              placeholder="correo@ejemplo.com"
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
              placeholder="Mínimo 6 caracteres"
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
              placeholder="Repite la contraseña"
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

          <div style={styles.buttonsRow}>
            <button
              type="submit"
              disabled={!validarFormulario() || loading}
              style={{
                ...styles.btnRegistrar,
                cursor: validarFormulario() && !loading ? "pointer" : "not-allowed",
                opacity: validarFormulario() && !loading ? 1 : 0.6,
              }}
            >
              {loading ? "Registrando..." : "Registrarse"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={styles.btnVolver}
            >
              Volver al login
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @media (max-width:560px){
          .eco-registro-form{
            padding:18px !important;
            max-width:97vw !important;
          }
        }
      `}</style>
    </div>
  );
}

const styles = {
  fondo: {
    minHeight: "100vh",
    width: "100vw",
    background:
      "linear-gradient(rgba(168,224,99,0.65), #e6fff1 80%, #56ab2f15), url('/fondo-ambiental.jpg') no-repeat center center fixed",
    backgroundSize: "cover",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "5vw 0"
  },
  pageContainer: {
    maxWidth: 410,
    width: "98vw",
    background: "rgba(255,255,255,0.97)",
    borderRadius: 18,
    boxShadow: "0 7px 30px rgba(14,197,134,0.13)",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    color: "#263238",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 30,
    margin: "0 auto"
  },
  svgWrap: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  title: {
    marginBottom: 15,
    marginTop: 5,
    fontWeight: "900",
    fontSize: 26,
    letterSpacing: 0.7,
    color: "#119e8e",
    textAlign: "center"
  },
  formGrid: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1fr",
    rowGap: 14,
    marginTop: 5,
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
  },
  inputEditable: {
    marginTop: 3,
    marginBottom: 4,
    padding: "12px 14px",
    fontSize: 15,
    borderRadius: 8,
    border: "1.3px solid #b8e2b2",
    outline: "none",
    background: "#f7fbf6",
    transition: "border .2s"
  },
  label: {
    fontWeight: 700,
    marginBottom: 2,
    fontSize: 15.5,
    color: "#229769"
  },
  error: {
    color: "#e74c3c",
    fontWeight: "700",
    fontSize: 15.5,
    textAlign: "center",
    display: "block"
  },
  exito: {
    color: "#2ac430",
    fontWeight: "700",
    fontSize: 15.5,
    textAlign: "center",
    display: "block"
  },
  buttonsRow: {
    display: "flex",
    flexDirection: "row",
    gap: 15,
    justifyContent: "center",
    marginTop: 12,
    flexWrap: "wrap"
  },
  btnRegistrar: {
    border: "none",
    borderRadius: 10,
    background: "linear-gradient(90deg,#20ad4e,#11998e 95%)",
    color: "#fff",
    fontWeight: 700,
    fontSize: 17,
    padding: "13px 33px",
    userSelect: "none",
    cursor: "pointer",
    boxShadow: "0 6px 16px #54be7941",
    transition: "opacity .1s"
  },
  btnVolver: {
    border: "none",
    borderRadius: 10,
    background: "#f8faf9",
    color: "#119e8e",
    fontWeight: 700,
    fontSize: 16.7,
    padding: "13px 24px",
    boxShadow: "0 2px 8px #d2f7e0",
    userSelect: "none",
    cursor: "pointer",
    borderBottom: "2.2px solid #e0fefa"
  }
};

export default RegisterPage;
