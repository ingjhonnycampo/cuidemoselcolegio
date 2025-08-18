import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Formatea 'YYYY-MM-DD' → 'd/m/yyyy'
function fechaFormateada(fechaStr) {
  if (!fechaStr || fechaStr.length !== 10) return fechaStr || "";
  const [yyyy, mm, dd] = fechaStr.split("-");
  return `${parseInt(dd, 10)}/${parseInt(mm, 10)}/${yyyy}`;
}

// Sistema de estado: pendiente - activo - cerrado
function calcularEstado(fechaInicio, fechaCierre) {
  const hoy = new Date();
  const inicio = new Date(fechaInicio);
  const cierre = new Date(fechaCierre + "T23:59:59");
  if (hoy < inicio) return "Inicia Pronto";
  if (hoy > cierre) return "Cerrado";
  return "Activo";
}

function SeleccionarRetoParaRecoleccion() {
  const [retos, setRetos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rolUsuario, setRolUsuario] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener rol usuario de localStorage
    const usuarioJSON = localStorage.getItem("usuario");
    if (usuarioJSON) {
      try {
        const usuarioObj = JSON.parse(usuarioJSON);
        setRolUsuario(usuarioObj.rol);
      } catch {
        setRolUsuario(null);
      }
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("No autenticado");
      setLoading(false);
      return;
    }
    axios
      .get("http://localhost:5000/api/retos", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setRetos(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Error al cargar los retos.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={fondo}>
        <div style={contenedor}>
          <p>Cargando retos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={fondo}>
        <div style={contenedor}>
          <p style={{ color: "red" }}>{error}</p>
        </div>
      </div>
    );
  }

  // Click para ingresar al reto, solo si está activo o usuario es admin
  const handleClickReto = (reto) => {
    const estado = calcularEstado(reto.fechaInicio, reto.fechaCierre);
    if ((estado === "Cerrado" || estado === "Pendiente") && rolUsuario !== "admin") {
      alert("Este reto no está disponible. Solo administradores pueden ingresar.");
      return;
    }
    navigate(`/retos/${reto._id}/recolecciones`);
  };

  return (
    <div style={fondo}>
      <div style={contenedor}>
        <h2 style={{ marginBottom: 24, textAlign: "center" }}>
          Selecciona un reto para registrar material reciclado
        </h2>

        {retos.length === 0 ? (
          <p style={{ textAlign: "center" }}>No hay retos disponibles.</p>
        ) : (
          <div style={gridContenedor}>
            {retos.map((reto) => {
              const estado = calcularEstado(reto.fechaInicio, reto.fechaCierre);
              let estadoColor =
                estado === "Activo"
                  ? "#2ca430"
                  : estado === "Cerrado"
                  ? "#e74c3c"
                  : "#eca728";
              const isHabilitado = estado === "Activo" || rolUsuario === "admin";

              return (
                <div
                  key={reto._id}
                  style={{
                    ...card,
                    cursor: isHabilitado ? "pointer" : "not-allowed",
                    opacity: isHabilitado ? 1 : 0.6,
                  }}
                  onClick={() => isHabilitado && handleClickReto(reto)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={() => {}}
                >
                  {/* Ícono hoja ambiental */}
                  <svg
                    width="54"
                    height="54"
                    viewBox="0 0 54 54"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ marginBottom: 12 }}
                  >
                    <circle
                      cx="27"
                      cy="27"
                      r="26"
                      stroke="#34a853"
                      strokeWidth="2"
                      fill="#EAFCEC"
                    />
                    <path
                      d="M39 20C33 33 16 32 16 32C19 46 35 44 36 26M36 26L32 29"
                      stroke="#34a853"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <ellipse
                      cx="23"
                      cy="34"
                      rx="2"
                      ry="1.4"
                      fill="#b9e4c9"
                      opacity="0.8"
                    />
                  </svg>

                  <h3 style={{ margin: "0 0 8px 0", color: "#119e8e" }}>
                    {reto.nombre}
                  </h3>
                  <p style={{ margin: "0 0 6px 0", fontWeight: "600" }}>
                    Creado por: {reto.creador?.nombre || "Desconocido"}
                  </p>
                  <p style={{ margin: "0 0 4px 0", fontSize: 14 }}>
                    Inicio: {fechaFormateada(reto.fechaInicio)}
                  </p>
                  <p style={{ margin: "0 0 8px 0", fontSize: 14 }}>
                    Cierre: {fechaFormateada(reto.fechaCierre)}
                  </p>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 13,
                      color: "white",
                      backgroundColor: estadoColor,
                      userSelect: "none",
                      textTransform: "capitalize",
                    }}
                  >
                    {estado}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Botón elegante para volver al dashboard */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
          <button
            style={btnVolverDashboard}
            onClick={() => navigate("/dashboard")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="none"
              stroke="#fff"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="feather feather-arrow-left"
              viewBox="0 0 24 24"
              style={{ marginRight: 9, verticalAlign: "middle" }}
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Volver al dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

const fondo = {
  minHeight: "100vh",
  width: "100vw",
  background:
    "linear-gradient(rgba(168,224,99,0.55), rgba(86,171,47,0.45)), url('/fondo-ambiental.jpg') no-repeat center center fixed",
  backgroundSize: "cover",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const contenedor = {
  background: "rgba(255,255,255,0.95)",
  borderRadius: 18,
  padding: 36,
  boxShadow: "0 0 20px 6px rgb(14 197 134 / 0.15)",
  minWidth: 350,
  maxWidth: 900,
  width: "90vw",
};

const gridContenedor = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 20,
};

const card = {
  backgroundColor: "#f0f9f4",
  borderRadius: 16,
  padding: 20,
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  userSelect: "none",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  transition: "transform 0.15s ease",
};

const btnVolverDashboard = {
  background: "linear-gradient(90deg, #119e8e 60%, #68b678 100%)",
  color: "white",
  fontWeight: 700,
  border: "none",
  borderRadius: 28,
  padding: "12px 28px",
  fontSize: 16,
  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  transition: "background 0.14s",
};

export default SeleccionarRetoParaRecoleccion;
