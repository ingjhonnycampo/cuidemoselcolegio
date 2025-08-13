import React, { useState, useEffect, useRef, memo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// === Función para obtener usuario y rol ===
function getUsuarioActual() {
  const usuarioGuardado = localStorage.getItem("usuario");
  if (!usuarioGuardado) return null;
  return JSON.parse(usuarioGuardado);
}

function SalonesPage() {
  const [vista, setVista] = useState("menu");
  const [salones, setSalones] = useState([]);
  const [grado, setGrado] = useState("");
  const [jornada, setJornada] = useState("");
  const [sede, setSede] = useState("");
  const [salon, setSalon] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [salonSeleccionado, setSalonSeleccionado] = useState(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loadingEliminar, setLoadingEliminar] = useState(false);
  const tablaRef = useRef(null);
  const filaRefs = useRef({});
  const navigate = useNavigate();

  // === Rol del usuario actual ===
  const usuarioActual = getUsuarioActual();
  const rol = usuarioActual?.rol || "";

  const gradoOptions = [
    "transición", "1°", "2°", "3°", "4°", "5°", "6°", "7°",
    "8°", "9°", "10°", "11°",
  ];
  const jornadaOptions = ["mañana", "tarde", "noche"];
  const sedeOptions = [
    "sede principal", "La Victoria", "Cesarito", "Melvin Jones", "José Andres Padilla",
  ];
  const salonOptions = ["01", "02", "03", "04", "05"];

  const formCompleto =
    grado && jornada && sede && salon && cantidad && Number(cantidad) > 0;

  // === Limpiar mensajes por cambio de vista ===
  useEffect(() => {
    setError("");
    setExito("");
    setLoadingEliminar(false);
    setModoEdicion(false);
    setSalonSeleccionado(null);
  }, [vista]);

  // === Auto-ocultar mensaje de éxito después de 3 segundos ===
  useEffect(() => {
    if (exito) {
      const timer = setTimeout(() => setExito(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [exito]);

  const getToken = () => localStorage.getItem("token");

  // === Cargar salones ===
  const cargarSalones = async () => {
    setError("");
    const token = getToken();
    if (!token) {
      setError("No hay sesión activa. Por favor inicia sesión.");
      return;
    }
    try {
      const res = await axios.get("http://localhost:5000/api/salones", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalones(res.data);
    } catch {
      setError("Error al cargar salones");
      setSalones([]);
    }
  };

  // === Registrar salón (solo admin o profesor) ===
  const handleRegistrar = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");
    if (rol !== "admin" && rol !== "profesor") {
      setError("No tienes permiso para agregar salones.");
      return;
    }
    const token = getToken();
    if (!token) {
      setError("No hay sesión activa. Por favor inicia sesión.");
      return;
    }
    try {
      await axios.post(
        "http://localhost:5000/api/salones",
        { grado, jornada, sede, salon, cantidadEstudiantes: cantidad },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExito("Salón registrado con éxito");
      setGrado("");
      setJornada("");
      setSede("");
      setSalon("");
      setCantidad("");
      await cargarSalones();
      setVista("consultar");
    } catch {
      setError("No se pudo registrar");
    }
  };

  // === Modificar salón (solo admin o profesor) ===
  const handleModificar = async (datosEditados) => {
    if (!datosEditados) return;
    setError("");
    setExito("");
    if (rol !== "admin" && rol !== "profesor") {
      setError("No tienes permiso para modificar.");
      return;
    }
    const token = getToken();
    if (!token) {
      setError("No hay sesión activa. Por favor inicia sesión.");
      return;
    }
    const scrollPos = tablaRef.current?.scrollTop || 0;
    try {
      const {
        _id,
        grado,
        jornada,
        sede,
        salon,
        cantidadEstudiantes,
      } = datosEditados;
      await axios.patch(
        `http://localhost:5000/api/salones/${_id}`,
        { grado, jornada, sede, salon, cantidadEstudiantes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setExito("Salón modificado con éxito");
      await cargarSalones();
      setModoEdicion(false);
      setSalonSeleccionado(null);
      setTimeout(() => {
        if (tablaRef.current) tablaRef.current.scrollTop = scrollPos;
      }, 100);
    } catch {
      setError("No se pudo modificar");
    }
  };

  // === Eliminar salón (solo admin) - confirmación con detalles ===
  const handleEliminar = async () => {
    if (!salonSeleccionado) {
      setError("Debe seleccionar un salón para eliminar.");
      return;
    }
    setError("");
    setExito("");
    if (rol !== "admin") {
      setError("No tienes permiso para eliminar.");
      return;
    }
    const token = getToken();
    if (!token) {
      setError("No hay sesión activa. Por favor inicia sesión.");
      return;
    }

    const mensajeConfirmacion = `¿Quieres eliminar el salón con los siguientes datos?\n\nGrado: ${salonSeleccionado.grado}\nSalón: ${salonSeleccionado.salon}\nJornada: ${salonSeleccionado.jornada}\nSede: ${salonSeleccionado.sede}`;

    if (!window.confirm(mensajeConfirmacion)) {
      return;
    }
    setLoadingEliminar(true);
    try {
      await axios.delete(`http://localhost:5000/api/salones/${salonSeleccionado._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLoadingEliminar(false);
      setExito("Salón eliminado con éxito");
      setSalonSeleccionado(null);
      setModoEdicion(false);
      await cargarSalones();
    } catch {
      setError("No se pudo eliminar");
      setLoadingEliminar(false);
      setTimeout(() => setError(""), 3000);
    }
  };

  // === Efectos secundarios para vista/scroll ===
  useEffect(() => {
    if (vista === "consultar") cargarSalones();
  }, [vista]);

  useEffect(() => {
    if (salonSeleccionado && filaRefs.current[salonSeleccionado._id]) {
      filaRefs.current[salonSeleccionado._id].scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [salonSeleccionado]);

  // === Componente para cada fila editable ===
  const SalonEditable = memo(({ salon, idx }) => {
    const esSeleccionado = salonSeleccionado?._id === salon._id;
    const esEdicion = modoEdicion && esSeleccionado;
    const [editData, setEditData] = useState(salon);
    useEffect(() => {
      if (esEdicion) setEditData(salon);
    }, [esEdicion, salon]);
    const fondoFila = esSeleccionado
      ? "#5bd8d8ff"
      : idx % 2 === 0
      ? "#c8ecb6"
      : "#fff";
    const handleChange = (campo, valor) => {
      setEditData((prev) => ({ ...prev, [campo]: valor }));
    };
    const filaRef = useRef(null);
    useEffect(() => {
      filaRefs.current[salon._id] = filaRef.current;
      return () => delete filaRefs.current[salon._id];
    }, [salon._id]);

    if (esEdicion) {
      // Solo admin o profesor pueden editar
      if (rol === "admin" || rol === "profesor") {
        return (
          <tr ref={filaRef} style={{ ...styles.trEdicion, height: 28 }}>
            <td></td>
            <td style={styles.shortCode}>
              {editData._id ? editData._id.substring(0, 8) : ""}
            </td>
            <td>
              <select
                value={editData.grado || ""}
                onChange={(e) => handleChange("grado", e.target.value)}
                style={styles.inputEditable}
              >
                {gradoOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <select
                value={editData.salon || ""}
                onChange={(e) => handleChange("salon", e.target.value)}
                style={styles.inputEditable}
              >
                {salonOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <select
                value={editData.jornada || ""}
                onChange={(e) => handleChange("jornada", e.target.value)}
                style={styles.inputEditable}
              >
                {jornadaOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <select
                value={editData.sede || ""}
                onChange={(e) => handleChange("sede", e.target.value)}
                style={styles.inputEditable}
              >
                {sedeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt
                      .split(" ")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </option>
                ))}
              </select>
            </td>
            <td style={{ padding: "0 6px" }}>
              <input
                type="number"
                min={1}
                value={editData.cantidadEstudiantes || ""}
                onChange={(e) =>
                  handleChange("cantidadEstudiantes", e.target.value)
                }
                style={{
                  ...styles.inputEditable,
                  width: 60,
                  textAlign: "center",
                }}
              />
            </td>
            <td style={{ whiteSpace: "nowrap", fontSize: 12 }}>
              {editData.createdAt
                ? new Date(editData.createdAt).toLocaleString()
                : ""}
            </td>
            <td style={{ whiteSpace: "nowrap", padding: "0 6px" }}>
              <button
                style={{ ...styles.btnGuardar, marginRight: 8 }}
                onClick={() => handleModificar(editData)}
              >
                Guardar
              </button>
              <button
                style={styles.btnCancelar}
                onClick={() => {
                  setModoEdicion(false);
                  setSalonSeleccionado(null);
                }}
              >
                Cancelar
              </button>
            </td>
          </tr>
        );
      }
      // Otros roles no editan: solo vista normal
      return null;
    }
    return (
      <tr
        ref={filaRef}
        onClick={() => {
          setSalonSeleccionado(salon);
          setModoEdicion(false);
        }}
        style={{
          backgroundColor: fondoFila,
          cursor: "pointer",
          height: 28,
          fontSize: 13,
          userSelect: "none",
        }}
      >
        <td style={{ padding: "0 6px" }}>
          <input
            type="radio"
            name="seleccion"
            checked={esSeleccionado}
            onChange={() => {
              setSalonSeleccionado(salon);
              setModoEdicion(false);
            }}
          />
        </td>
        <td style={styles.shortCode}>
          {salon._id ? salon._id.substring(0, 8) : ""}
        </td>
        <td style={{ padding: "2px 6px" }}>
          {salon.grado ? salon.grado.charAt(0).toUpperCase() + salon.grado.slice(1) : ""}
        </td>
        <td style={{ padding: "2px 6px" }}>{salon.salon || ""}</td>
        <td style={{ padding: "2px 6px" }}>
          {salon.jornada ? salon.jornada.charAt(0).toUpperCase() + salon.jornada.slice(1) : ""}
        </td>
        <td style={{ padding: "2px 6px" }}>
          {salon.sede
            ? salon.sede.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
            : ""}
        </td>
        <td
          style={{
            padding: "2px 6px",
            fontWeight: "600",
            textAlign: "center",
            minWidth: 60,
          }}
        >
          {salon.cantidadEstudiantes ?? ""}
        </td>
        <td style={{ whiteSpace: "nowrap", fontSize: 12, padding: "2px 6px" }}>
          {salon.createdAt ? new Date(salon.createdAt).toLocaleString() : ""}
        </td>
        <td></td>
      </tr>
    );
  });

  return (
    <div style={styles.fondo}>
      <div style={styles.pageContainer}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <img
            src="/logo.jpg"
            alt="Synergy"
            style={{ userSelect: "none", width: 140 }}
            draggable={false}
          />
        </div>
        {vista === "menu" && (
          <>
            <div style={styles.menuOpciones}>
              <h2 style={{ ...styles.title, textAlign: "center" }}>Salones</h2>
              {(rol === "admin" || rol === "profesor") && (
                <button
                  style={{ ...styles.btnOpcion, backgroundColor: "#119e8e" }}
                  onClick={() => setVista("registrar")}
                >
                  <svg
                    width={22}
                    height={22}
                    fill="white"
                    viewBox="0 0 24 24"
                    style={{ marginRight: 7 }}
                  >
                    <path
                      d="M12 5v14m7-7H5"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Registrar nuevo salón
                </button>
              )}
              <button
                style={{ ...styles.btnOpcion, backgroundColor: "#56ab2f" }}
                onClick={() => setVista("consultar")}
              >
                <svg
                  width={22}
                  height={22}
                  fill="white"
                  viewBox="0 0 24 24"
                  style={{ marginRight: 7 }}
                >
                  <circle
                    cx={10.5}
                    cy={10.5}
                    r={7}
                    stroke="currentColor"
                    strokeWidth={2}
                    fill="none"
                  />
                  <line
                    x1={16}
                    y1={16}
                    x2={21}
                    y2={21}
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                </svg>
                Consultar
              </button>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              style={styles.fixedDashboardBtn}
              title="Volver al Dashboard"
            >
              <svg
                width={19}
                height={19}
                fill="none"
                viewBox="0 0 24 24"
                style={{ marginRight: 5 }}
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
          </>
        )}
        {vista === "registrar" && (
          <div>
            <h3 style={{ ...styles.title, textAlign: "center" }}>
              Registrar nuevo salón
            </h3>
            <form onSubmit={handleRegistrar} style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Grado</label>
                <select
                  value={grado}
                  required
                  onChange={(e) => setGrado(e.target.value)}
                  style={styles.inputEditable}
                >
                  <option value="">Selecciona Grado</option>
                  {gradoOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Salón</label>
                <select
                  value={salon}
                  required
                  onChange={(e) => setSalon(e.target.value)}
                  style={styles.inputEditable}
                >
                  <option value="">Selecciona Salón</option>
                  {salonOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Jornada</label>
                <select
                  value={jornada}
                  required
                  onChange={(e) => setJornada(e.target.value)}
                  style={styles.inputEditable}
                >
                  <option value="">Selecciona Jornada</option>
                  {jornadaOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Sede</label>
                <select
                  value={sede}
                  required
                  onChange={(e) => setSede(e.target.value)}
                  style={styles.inputEditable}
                >
                  <option value="">Selecciona Sede</option>
                  {sedeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt
                        .split(" ")
                        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                        .join(" ")}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Cantidad de estudiantes</label>
                <input
                  value={cantidad}
                  required
                  type="number"
                  min={1}
                  onChange={(e) => setCantidad(e.target.value)}
                  style={styles.inputEditable}
                />
              </div>
              <div
                style={{
                  gridColumn: "span 2",
                  display: "flex",
                  gap: 14,
                  justifyContent: "center",
                }}
              >
                <button
                  type="submit"
                  disabled={!formCompleto}
                  style={{
                    ...styles.btnRegistrar,
                    cursor: formCompleto ? "pointer" : "not-allowed",
                    opacity: formCompleto ? 1 : 0.5,
                    backgroundColor: formCompleto ? "#119e8e" : "#a0c9b8",
                  }}
                >
                  Registrar
                </button>
                <button
                  type="button"
                  style={styles.btnCancelar}
                  onClick={() => setVista("menu")}
                >
                  Cancelar
                </button>
              </div>
            </form>
            {(error || exito) && (
              <div style={{ marginTop: 18, width: "100%", textAlign: "center" }}>
                {error && <span style={styles.error}>{error}</span>}
                {exito && <span style={styles.exitoCenter}>{exito}</span>}
              </div>
            )}
          </div>
        )}
        {vista === "consultar" && (
          <div>
            <h3 style={{ ...styles.title, textAlign: "center" }}>Salones registrados</h3>
            <button
              style={{ ...styles.btnCancelar, backgroundColor: "#2E7D32" }}
              onClick={() => setVista("menu")}
            >
              Volver
            </button>
            {(error || exito) && (
              <div style={{ marginTop: 12, width: "100%", textAlign: "center" }}>
                {error && <span style={styles.error}>{error}</span>}
                {exito && <span style={styles.exitoCenter}>{exito}</span>}
              </div>
            )}
            {salones.length === 0 ? (
              <p>No hay salones registrados</p>
            ) : (
              <>
                <div
                  ref={tablaRef}
                  style={{ maxHeight: "60vh", overflowY: "auto" }}
                >
                  <table style={styles.tablaSalones}>
                    <thead>
                      <tr style={styles.theadSticky}>
                        <th style={{ ...styles.th, width: 40 }}></th>
                        <th style={styles.th}>Código</th>
                        <th style={styles.th}>Grado</th>
                        <th style={styles.th}>Salón</th>
                        <th style={styles.th}>Jornada</th>
                        <th style={styles.th}>Sede</th>
                        <th style={styles.th}>N° Estud.</th>
                        <th style={styles.th}>Registrado</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {salones.map((salon, idx) => (
                        <SalonEditable key={salon._id} salon={salon} idx={idx} />
                      ))}
                    </tbody>
                  </table>
                </div>
                {!modoEdicion && salonSeleccionado && (
                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      justifyContent: "center",
                      gap: 18,
                    }}
                  >
                    {(rol === "admin" || rol === "profesor") && (
                      <button
                        style={styles.btnEditar}
                        disabled={loadingEliminar}
                        onClick={() => setModoEdicion(true)}
                      >
                        Editar seleccionada
                      </button>
                    )}
                    {rol === "admin" && (
                      <button
                        style={styles.btnEliminar}
                        disabled={loadingEliminar}
                        onClick={handleEliminar}
                      >
                        {loadingEliminar ? "Eliminando..." : "Eliminar seleccionada"}
                      </button>
                    )}
                  </div>
                )}
                <div style={{ marginTop: 25, textAlign: "left" }}>
                  <button
                    onClick={() => navigate("/dashboard")}
                    style={styles.fixedDashboardBtn}
                    title="Volver al dashboard"
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
  btnDashboardFlexible: {
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
    padding: "4px 8px",
    fontSize: 14,
    borderRadius: 4,
    border: "1px solid #ccc",
    width: "100%",
    boxSizing: "border-box",
    minWidth: 60,
  },
  label: {
    fontSize: 14,
    fontWeight: 600,
    marginBottom: 4,
    color: "#34495e",
  },
  menuOpciones: {
    textAlign: "center",
    marginBottom: 24,
  },
  title: {
    marginBottom: 24,
    fontWeight: 700,
    fontSize: 26,
    color: "#119e8e",
  },
  btnOpcion: {
    display: "inline-flex",
    alignItems: "center",
    padding: "12px 22px",
    margin: "0 16px 16px 0",
    fontSize: 18,
    fontWeight: 700,
    color: "white",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    userSelect: "none",
    transition: "background-color 0.3s",
  },
  btnRegistrar: {
    border: "none",
    borderRadius: 8,
    color: "white",
    fontWeight: 700,
    fontSize: 16,
    userSelect: "none",
    padding: "6px 0",
    minWidth: 130,
  },
  btnCancelar: {
    border: "none",
    borderRadius: 8,
    color: "white",
    backgroundColor: "#2E7D32",
    fontWeight: 700,
    fontSize: 16,
    userSelect: "none",
    padding: "6px 0",
    minWidth: 130,
    cursor: "pointer",
    transition: "background-color 0.25s",
  },
  btnEditar: {
    backgroundColor: "#eca728",
    color: "white",
    border: "none",
    borderRadius: 6,
    fontWeight: 700,
    fontSize: 14,
    padding: "6px 12px",
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
  btnGuardar: {
    backgroundColor: "#2e7d32",
    color: "white",
    border: "none",
    borderRadius: 6,
    fontWeight: 700,
    fontSize: 14,
    padding: "6px 12px",
    cursor: "pointer",
  },
  btnCancelar: {
    backgroundColor: "#dd3b3b",
    color: "white",
    border: "none",
    borderRadius: 6,
    fontWeight: 700,
    fontSize: 14,
    padding: "6px 12px",
    cursor: "pointer",
  },
  trEdicion: {
    backgroundColor: "#fffde3",
    height: 28,
  },
  shortCode: {
    fontSize: 11,
    padding: "2px 6px",
    fontFamily: "monospace",
    userSelect: "text",
    whiteSpace: "nowrap",
  },
  tablaSalones: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 7px",
    marginTop: 22,
    background: "#fafcff",
    borderRadius: 12,
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
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
};

export default SalonesPage;
