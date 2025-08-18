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
  const [modalMsg, setModalMsg] = useState(null);
// modalMsg será: { tipo: 'exito'|'error', texto: string } o null si está oculto
const [hoverReg, setHoverReg] = useState(false);
const [hoverCan, setHoverCan] = useState(false);
const [modalConsulta, setModalConsulta] = useState(null); // Para mostrar detalles
const [modalEliminar, setModalEliminar] = useState(null); // Para confirmar eliminación
const [editandoId, setEditandoId] = useState(null);       // Para permitir editar una tarjeta
const [modalExitoEliminar, setModalExitoEliminar] = useState(false);


  // --- NUEVO: Estados para barra usuario y modal salir ---
const [modalSalir, setModalSalir] = useState(false);
const [showTooltip, setShowTooltip] = useState(false);

  const tablaRef = useRef(null);
  const filaRefs = useRef({});
  const navigate = useNavigate();

  // === Rol del usuario actual ===
  const usuarioActual = getUsuarioActual();
  const rol = usuarioActual?.rol || "";

  const gradoOptions = [
    "transición", "1°", "2°", "3°", "4°", "5°", "6°", "7°",
    "8°", "9°", "10°", "11°", "Ciclo III", "Ciclo IV", "Ciclo V", "Ciclo VI"
  ];
  const jornadaOptions = ["mañana", "tarde", "noche"];
  const sedeOptions = [
    "sede principal", "La Victoria", "Cesarito", "Melvin Jones", "José Andres Padilla",
  ];
  const salonOptions = ["01", "02", "03", "04", "05"];

  const formCompleto =
    grado && jornada && sede && salon && cantidad && Number(cantidad) > 0;


    useEffect(() => {
  if (modalExitoEliminar) {
    const timer = setTimeout(() => {
      setModalExitoEliminar(false);
      setVista("consultar"); // Opcional: redirige a la vista de todos los cursos después de cerrar
    }, 2000); // 2 segundos

    return () => clearTimeout(timer); // Limpia el timeout si cambia modalExitoEliminar antes
  }
}, [modalExitoEliminar]);

  // === Limpiar mensajes por cambio de vista ===
  useEffect(() => {
  setError("");
  setExito("");
  setLoadingEliminar(false);

  if (vista !== "registrar") {
    setModoEdicion(false);
    setSalonSeleccionado(null);
  }
}, [vista]);


  // === Auto-ocultar mensaje de éxito después de 3 segundos ===
  useEffect(() => {
    if (exito) {
      const timer = setTimeout(() => setExito(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [exito]);

useEffect(() => {
  if (modoEdicion && salonSeleccionado) {
    setGrado(salonSeleccionado.grado || "");
    setJornada(salonSeleccionado.jornada || "");
    setSede(salonSeleccionado.sede || "");
    setSalon(salonSeleccionado.salon || "");
    setCantidad(
      salonSeleccionado.cantidadEstudiantes ? String(salonSeleccionado.cantidadEstudiantes) : ""
    );
  }
}, [modoEdicion, salonSeleccionado]);



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

const handleRegistrar = async (e) => {
  e.preventDefault();
  setError("");
  setExito("");
  if (rol !== "admin" && rol !== "profesor") {
    setModalMsg({ tipo: "error", texto: "No tienes permiso para agregar salones." });
    setTimeout(() => setModalMsg(null), 3000);
    return;
  }
  const token = getToken();
  if (!token) {
    setModalMsg({ tipo: "error", texto: "No hay sesión activa. Por favor inicia sesión." });
    setTimeout(() => setModalMsg(null), 3000);
    return;
  }
  try {
    await axios.post(
      "http://localhost:5000/api/salones",
      { grado, jornada, sede, salon, cantidadEstudiantes: cantidad },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setModalMsg({ tipo: "exito", texto: "¡Salón registrado con éxito!" });
    setGrado("");
    setJornada("");
    setSede("");
    setSalon("");
    setCantidad("");
    // No cambies de vista aquí, permanece en el formulario
    await cargarSalones();
  } catch {
    setModalMsg({ tipo: "error", texto: "No se pudo registrar" });
  }
  setTimeout(() => setModalMsg(null), 3000);
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
      setModalMsg({ tipo: "exito", texto: "Salón modificado con éxito" });
setTimeout(() => {
  setModalMsg(null);
  setVista("consultar");
}, 2000); // espera 2 segundos para que el usuario vea el mensaje

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



  const handleSubmit = async (e) => {
  e.preventDefault();
  if (modoEdicion) {
    await handleModificar({
      _id: salonSeleccionado._id,
      grado,
      jornada,
      sede,
      salon,
      cantidadEstudiantes: Number(cantidad),
    });
  } else {
    await handleRegistrar(e);
  }
};

  // === Eliminar salón (solo admin) - confirmación con detalles ===
 const handleEliminar = async (id) => {
  if (!id) {
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
  setLoadingEliminar(true);
  try {
    await axios.delete(`http://localhost:5000/api/salones/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setLoadingEliminar(false);
    setModalExitoEliminar(true);
    await cargarSalones();
    setSalonSeleccionado(null);
    setModoEdicion(false);
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
setModoEdicion(true);
setVista("registrar");

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
setModoEdicion(true);
setVista("registrar");

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

// --- NUEVO: Componente para cuadros con icono y hover ---
const OptionCard = ({ icon, title, onClick, color, bgColor }) => (
  <button
    onClick={onClick}
    style={{
      ...styles.optionCard,
      borderColor: color,
      color: color,
      background: bgColor,
    }}
    onMouseEnter={e => {
      e.currentTarget.style.backgroundColor = color;
      e.currentTarget.style.color = "#fff";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.backgroundColor = bgColor;
      e.currentTarget.style.color = color;
    }}
  >
    <div style={styles.optionIcon}>{icon}</div>
    <div style={styles.optionTitleMini}>{title}</div>
  </button>
);



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
        
<div style={styles.userBar}>
  <div style={styles.avatarCircle}>
    <span style={styles.avatarInitials}>
      {usuarioActual?.nombre ? usuarioActual.nombre[0].toUpperCase() : ""}
    </span>
  </div>
  <div style={styles.userInfoResponsive}>
    <span style={styles.userName}>{usuarioActual?.nombre}</span>
    <span style={styles.userRole}>{usuarioActual?.rol}</span>
  </div>
  <div style={{ position: "relative" }}>
  <button
    style={styles.logoutResponsive}
    onClick={() => setModalSalir(true)}
    onMouseEnter={() => setShowTooltip(true)}
    onMouseLeave={() => setShowTooltip(false)}
  >
    {/* Icono SVG de salir */}
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M16 17L21 12L16 7"
        stroke="#e74c3c"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12H9"
        stroke="#e74c3c"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 19V5"
        stroke="#e74c3c"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </button>
  {showTooltip && (
    <span style={styles.logoutTooltip}>Cerrar sesión</span>
  )}
</div>

</div>


{/* NUEVO: Modal confirmación */}

{modalSalir && (
  <div style={{
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(44, 62, 80, 0.20)",
    zIndex: 9999,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }}>
    <div style={{
      background: "#fff",
      borderRadius: "16px",
      padding: "38px 32px 28px",
      minWidth: 320,
      minHeight: 150,
      boxShadow: "0 6px 32px #ff860124, 0 1.5px 7px #bbb2",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center"
    }}>
      <div style={{
        width: 58,
        height: 58,
        background: "#fff8ec",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 14
      }}>
        <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="11" fill="#fff2e0" stroke="#fdad43" strokeWidth={2}/>
          <path d="M12 8v4" stroke="#fdad43" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="12" cy="16.2" r="1.1" fill="#fdad43"/>
        </svg>
      </div>
      <h2 style={{
        fontSize: 22,
        fontWeight: 800,
        color: "#22313a",
        marginBottom: 18,
        marginTop: 0,
        letterSpacing: ".01em"
      }}>¿Seguro que quieres cerrar sesión?</h2>
      <div style={{
        display: "flex",
        gap: 14,
        flexWrap: "wrap",
        marginTop: 6,
        justifyContent: "center"
      }}>
        <button
          style={{
            background: "linear-gradient(90deg,#ff5d56,#fdad43 110%)",
            color: "#fff",
            padding: "10px 22px",
            border: "none",
            borderRadius: "7px",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 2px 12px #f1b41722",
            transition: "background 0.25s"
          }}
          onClick={() => {
            setModalSalir(false);
            localStorage.removeItem("token");
            localStorage.removeItem("usuario");
            navigate("/");
          }}
        >
          Sí, salir
        </button>
        <button
          style={{
            background: "#e1e4e8",
            color: "#444",
            padding: "10px 22px",
            border: "none",
            borderRadius: "7px",
            fontWeight: 700,
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 2px 12px #ddd2",
            transition: "background 0.23s"
          }}
          onClick={() => setModalSalir(false)}
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}



        {vista === "menu" && (
          <>
           <div style={styles.menuGridResponsive}>
  {(rol === "admin" || rol === "profesor") && (
    <OptionCard
      icon={
        <svg width={36} height={36} viewBox="0 0 24 24" fill="none">
          <path d="M12 5v14m7-7H5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      }
      title="Registrar salón"
      onClick={() => setVista("registrar")}
      color="#1565c0"      // Hover y texto
      bgColor="#2196f3"    // Fondo normal (azul claro)
    />
  )}
  <OptionCard
    icon={
      <svg width={36} height={36} fill="none" viewBox="0 0 24 24">
        <circle cx={10.5} cy={10.5} r={7} stroke="#fff" strokeWidth={2}/>
        <line x1={16} y1={16} x2={21} y2={21} stroke="#fff" strokeWidth={2} strokeLinecap="round"/>
      </svg>
    }
    title="Consultar salones"
    onClick={() => setVista("consultar")}
    color="#00838f"     // Hover y texto
    bgColor="#33bfff"   // Fondo normal (azul celeste)
  />
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
  <div style={styles.formContainer}>
    <div style={styles.formHeader}>
      <svg style={styles.headerIcon} width="36" height="36" fill="#56ab2f" viewBox="0 0 24 24">
        <path d="M12 5v14m7-7H5" stroke="#56ab2f" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      
      <h2 style={styles.formTitle}>
  {modoEdicion ? "Editar salón" : "Registrar nuevo salón"}
</h2>

    </div>
    <form onSubmit={handleSubmit} style={styles.formGridResponsive}>

      {/* Grado */}
      <div style={styles.formGroupResponsive}>
        <label style={styles.labelResponsive}>
          <svg width="22" height="22" fill="#119e8e" viewBox="0 0 24 24">
            <path d="M12 2L2 7v7c0 5 10 8 10 8s10-3 10-8V7l-10-5z" stroke="#119e8e" strokeWidth={2} strokeLinejoin="round"/>
          </svg>
          <span>Grado</span>
        </label>
        <select
          value={grado}
          required
          onChange={e => setGrado(e.target.value)}
          style={styles.inputResponsive}
        >
          <option value="">Selecciona Grado</option>
          {gradoOptions.map(opt =>
            <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
          )}
        </select>
      </div>
      {/* Salón */}
      <div style={styles.formGroupResponsive}>
        <label style={styles.labelResponsive}>
          <svg width="22" height="22" fill="#fdc207" viewBox="0 0 24 24">
            <rect x="4" y="3" width="16" height="7" rx="2" stroke="#fdc207" strokeWidth={2}/>
            <rect x="4" y="14" width="8" height="7" rx="2" stroke="#fdc207" strokeWidth={2}/>
            <rect x="16" y="14" width="4" height="7" rx="2" stroke="#fdc207" strokeWidth={2}/>
          </svg>
          <span>Salón</span>
        </label>
        <select
          value={salon}
          required
          onChange={e => setSalon(e.target.value)}
          style={styles.inputResponsive}
        >
          <option value="">Selecciona Salón</option>
          {salonOptions.map(opt =>
            <option key={opt} value={opt}>{opt}</option>
          )}
        </select>
      </div>
      {/* Jornada */}
      <div style={styles.formGroupResponsive}>
        <label style={styles.labelResponsive}>
          <svg width="22" height="22" fill="#39a94b" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="7" stroke="#39a94b" strokeWidth={2}/>
            <path d="M12 6v6l4 2" stroke="#39a94b" strokeWidth={2} strokeLinecap="round"/>
          </svg>
          <span>Jornada</span>
        </label>
        <select
          value={jornada}
          required
          onChange={e => setJornada(e.target.value)}
          style={styles.inputResponsive}
        >
          <option value="">Selecciona Jornada</option>
          {jornadaOptions.map(opt =>
            <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
          )}
        </select>
      </div>
      {/* Sede */}
      <div style={styles.formGroupResponsive}>
        <label style={styles.labelResponsive}>
          <svg width="22" height="22" fill="#8886f7" viewBox="0 0 24 24">
            <path d="M12 2C8 2 5 6 5 10.5c0 5 7 11.5 7 11.5s7-6.5 7-11.5C19 6 16 2 12 2z" stroke="#8886f7" strokeWidth={2}/>
            <circle cx="12" cy="10.5" r="2" fill="#8886f7"/>
          </svg>
          <span>Sede</span>
        </label>
        <select
          value={sede}
          required
          onChange={e => setSede(e.target.value)}
          style={styles.inputResponsive}
        >
          <option value="">Selecciona Sede</option>
          {sedeOptions.map(opt =>
            <option key={opt} value={opt}>
              {opt.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
            </option>
          )}
        </select>
      </div>
      {/* Cantidad de estudiantes */}
      <div style={styles.formGroupResponsive}>
        <label style={styles.labelResponsive}>
          <svg width="22" height="22" fill="#fc8b65" viewBox="0 0 24 24">
            <rect x="3" y="7" width="18" height="10" rx="2" stroke="#fc8b65" strokeWidth={2}/>
            <circle cx="7" cy="12" r="1" fill="#fc8b65"/>
            <circle cx="12" cy="12" r="1" fill="#fc8b65"/>
            <circle cx="17" cy="12" r="1" fill="#fc8b65"/>
          </svg>
          <span>Cantidad de estudiantes</span>
        </label>
        <input
          value={cantidad}
          required
          type="number"
          min={1}
          onChange={e => setCantidad(e.target.value)}
          style={styles.inputResponsive}
        />
      </div>
      {/* Botones */}
      <div style={styles.formButtonsResponsive}>
        <button
  type="submit"
  disabled={!formCompleto}
  style={{
    ...styles.btnRegistrarResponsive,
    background: hoverReg && formCompleto ? "#388e1e" : "#56ab2f",
    opacity: formCompleto ? 1 : 0.5,
    cursor: formCompleto ? "pointer" : "not-allowed",
  }}
  onMouseEnter={() => setHoverReg(true)}
  onMouseLeave={() => setHoverReg(false)}
>
  {modoEdicion ? "Guardar cambios" : "Registrar"}
</button>

        <button
          type="button"
         style={{
    ...styles.btnCancelarResponsive,
    background: hoverCan ? "#aed7e4" : "#e0e0e0",
  }}
  onMouseEnter={() => setHoverCan(true)}
  onMouseLeave={() => setHoverCan(false)}
          onClick={() => setVista("menu")}
        >
          Cancelar
        </button>
      </div>
      {(error || exito) && (
        <div style={styles.formMsgResponsive}>
          {error && <span style={styles.errorResponsive}>{error}</span>}
          {exito && <span style={styles.exitoResponsive}>{exito}</span>}
        </div>
      )}
    </form>




    {modalMsg && (
  
  <div style={styles.msgModalOverlay}>
    <div
      style={{
        ...styles.msgModalBox,
        background: modalMsg.tipo === "exito" ? "#e8ffef" : "#ffebeb",
        border: `2.5px solid ${modalMsg.tipo === "exito" ? "#56ab2f" : "#e74c3c"}`
      }}
    >
      <svg width={38} height={38} style={{marginBottom: 10}}
        viewBox="0 0 24 24" fill="none">
        {modalMsg.tipo === "exito" ? (
          <circle cx="12" cy="12" r="11" fill="#c2fad6" stroke="#56ab2f" strokeWidth={2}/>
        ) : (
          <circle cx="12" cy="12" r="11" fill="#ffbdbd" stroke="#e74c3c" strokeWidth={2}/>
        )}
        {modalMsg.tipo === "exito" ? (
          <path d="M7 13l3 3 7-7" stroke="#23a96b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        ) : (
          <path d="M15 9l-6 6M9 9l6 6" stroke="#e74c3c" strokeWidth="2.5" strokeLinecap="round" />
        )}
      </svg>
      <span style={{
        fontSize: 18,
        fontWeight: 700,
        color: modalMsg.tipo === "exito" ? "#33a251" : "#e74c3c",
      }}>{modalMsg.texto}</span>
    </div>
  </div>
)}

  </div>

  
)}


{vista === "consultar" && (
  <div>
    {/* Botones en una línea separada arriba del título */}
    <div style={styles.buttonsRow}>
      <button
        type="button"
        style={styles.btnBack}
        onClick={() => setVista("menu")}
      >
        <svg
          width={20}
          height={20}
          fill="none"
          viewBox="0 0 24 24"
          stroke="#1565c0"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: 6 }}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver
      </button>

      <button
        type="button"
        style={styles.btnDashboard}
        onClick={() => navigate("/dashboard")}
      >
        <svg
          width={20}
          height={20}
          fill="none"
          viewBox="0 0 24 24"
          stroke="#1565c0"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: 6 }}
        >
          <path d="M3 13h8V3H3v10zM13 21h8v-6h-8v6zM13 3v6h8V3h-8zM3 21h8v-4H3v4z" />
        </svg>
        Dashboard
      </button>
    </div>

    {/* Título en línea separada debajo de los botones */}
    <h3 style={styles.title}>Salones registrados</h3>

    {(error || exito) && (
      <div style={{ marginTop: 12, width: "100%", textAlign: "center" }}>
        {error && <span style={styles.error}>{error}</span>}
        {exito && <span style={styles.exitoCenter}>{exito}</span>}
      </div>
    )}

    {salones.length === 0 && !error && !exito ? (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 160 }}>
        <svg width="58" height="58" viewBox="0 0 50 50" style={{ marginRight: 12, animation: "girar 1s linear infinite" }}>
          <circle cx="25" cy="25" r="20" fill="none" stroke="#1565c0" strokeWidth="5" strokeDasharray="31.4 31.4" strokeLinecap="round"/>
          <line x1="25" y1="25" x2="25" y2="11" stroke="#1565c0" strokeWidth="3" strokeLinecap="round"/>
          <line x1="25" y1="25" x2="36" y2="25" stroke="#31c2fa" strokeWidth="3" strokeLinecap="round"/>
        </svg>
        <span style={{ color: "#1565c0", fontWeight: 600, fontSize: 20 }}>Cargando cursos...</span>
      </div>
    ) : (
      <div>
        {Object.entries(
          salones.reduce((acc, salon) => {
            (acc[salon.sede] = acc[salon.sede] || []).push(salon);
            return acc;
          }, {})
        ).map(([sede, salonesPorSede]) => {
          const jornadasAgrupadas = salonesPorSede.reduce((acc, salon) => {
            (acc[salon.jornada] = acc[salon.jornada] || []).push(salon);
            return acc;
          }, {});
          return (
            <section key={sede} style={styles.sedeSection}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                <svg width={26} height={26} fill="#e86e19" style={{ marginRight: 7 }}>
                  <path d="M12 2l7 6v8a7 7 0 1 1-14 0V8l7-6z" />
                </svg>
                <h2 style={styles.sedeTitle}>{sede.toUpperCase()}</h2>
              </div>
              {Object.entries(jornadasAgrupadas).map(([jornada, arr]) => (
                <div key={jornada} style={styles.jornadaContainer}>
                  <h3 style={styles.jornadaTitle}>{jornada}</h3>
                  <div style={styles.coursesCardGrid}>
                    {arr.map(salon => (
                      <div
                        key={salon._id}
                        style={styles.courseCard}
                        onMouseEnter={e => e.currentTarget.style.background = "#e2f1f7"}
                        onMouseLeave={e => e.currentTarget.style.background = "#d5f0ee"}
                      >
                        <div style={{ color: "#148c8c", fontWeight: 800, marginBottom: 7, fontSize: 16 }}>
                          <svg width="20" height="20" fill="#16a34a" viewBox="0 0 24 24" style={{ verticalAlign: "middle", marginRight: 5 }}>
                            <circle cx="12" cy="12" r="10" stroke="#16a34a" strokeWidth={2} fill="none"/>
                          </svg>
                          Grado: {salon.grado}
                        </div>
                        <div style={{ marginBottom: 4 }}>Salón: <strong>{salon.salon}</strong></div>
                        <div style={{ marginBottom: 4 }}>Estudiantes: <strong>{salon.cantidadEstudiantes}</strong></div>
                        <div style={{ fontSize: 12, color: "#757575", marginBottom: 8 }}>
                          Registrado: {salon.createdAt ? new Date(salon.createdAt).toLocaleDateString() : ""}
                        </div>
                        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                          {/* Botón Consultar */}
                          <button title="Consultar"
                            style={styles.btnCursoCard}
                            onClick={() => setModalConsulta(salon)}
                            onMouseEnter={e => e.currentTarget.style.background = "#cde9f9"}
                            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                          >
                            <svg width={18} height={18} fill="none" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7" stroke="#117bb8" strokeWidth="2"/><line x1="16" y1="16" x2="22" y2="22" stroke="#117bb8" strokeWidth="2" strokeLinecap="round"/></svg>
                          </button>

                          {/* Botón Editar */}
                          {(rol === "admin" || rol === "profesor") && (
                            <button title="Editar"
                              style={styles.btnCursoCard}
                              onClick={() => {
                                setSalonSeleccionado(salon);
                                setModoEdicion(true);
                                setVista("registrar");
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = "#fffbdf"}
                              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                            >
                              <svg width={18} height={18} fill="none" viewBox="0 0 24 24">
                                <path d="M16.475 5.425a2.121 2.121 0 013 3L7 20h-4v-4l13.475-13.475z" stroke="#eba112" strokeWidth="2"/>
                                <path d="M15 6l3 3" stroke="#eba112" strokeWidth="2"/>
                              </svg>
                            </button>
                          )}

                          {/* Botón Eliminar */}
                          {rol === "admin" && (
                            <button title="Eliminar"
                              style={styles.btnCursoCard}
                              onClick={() => setModalEliminar(salon)}
                              onMouseEnter={e => e.currentTarget.style.background = "#f9d3d3"}
                              onMouseLeave={e => e.currentTarget.style.background = "#fff"}
                            >
                              <svg width={19} height={19} fill="none" viewBox="0 0 24 24">
                                <line x1="6" y1="6" x2="18" y2="18" stroke="#e74c3c" strokeWidth={2} strokeLinecap="round"/>
                                <line x1="6" y1="18" x2="18" y2="6" stroke="#e74c3c" strokeWidth={2} strokeLinecap="round"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </section>
          );
        })}
      </div>
    )}

    <style>
      {`
        @keyframes girar { 100% { transform: rotate(360deg); } }
      `}
    </style>

    {/* Modal consultar curso */}
    {modalConsulta && (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <h2 style={{ color: "#1184b1", fontWeight: 800 }}>Detalles del curso</h2>
          <div><strong>Grado:</strong> {modalConsulta.grado}</div>
          <div><strong>Salón:</strong> {modalConsulta.salon}</div>
          <div><strong>Sede:</strong> {modalConsulta.sede}</div>
          <div><strong>Jornada:</strong> {modalConsulta.jornada}</div>
          <div><strong>Estudiantes:</strong> {modalConsulta.cantidadEstudiantes}</div>
          <div><strong>Registrado:</strong> {modalConsulta.createdAt ? new Date(modalConsulta.createdAt).toLocaleString() : ""}</div>
          <button style={{ ...styles.btnCancelar, marginTop: 16, backgroundColor: "#0ea5e9" }} onClick={() => setModalConsulta(null)}>Cerrar</button>
        </div>
      </div>
    )}

    {/* Modal eliminar curso */}
    {modalEliminar && (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <h2 style={{ color: "#e74c3c", fontWeight: 800 }}>¿Eliminar este curso?</h2>
          <div><strong>Grado:</strong> {modalEliminar.grado}</div>
          <div><strong>Salón:</strong> {modalEliminar.salon}</div>
          <div><strong>Sede:</strong> {modalEliminar.sede}</div>
          <div><strong>Jornada:</strong> {modalEliminar.jornada}</div>
          <div><strong>Estudiantes:</strong> {modalEliminar.cantidadEstudiantes}</div>
          <div><strong>Registrado:</strong> {modalEliminar.createdAt ? new Date(modalEliminar.createdAt).toLocaleString() : ""}</div>
          <div style={{ display: "flex", gap: 14, marginTop: 18 }}>
            <button
              style={styles.btnEliminar}
              onClick={async () => {
                setModalEliminar(null);
                await handleEliminar(modalEliminar._id);
                setModalExitoEliminar(true);
              }}
            >
              Sí, eliminar
            </button>

            <button style={styles.btnCancelar} onClick={() => setModalEliminar(null)}>
              Cancelar
            </button>
          </div>
        </div>
      </div>
    )}

    {modalExitoEliminar && (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <h2 style={{ color: "#2E7D32", fontWeight: 700 }}>Salón eliminado con éxito</h2>
          <button
            style={styles.btnCancelar}
            onClick={() => setModalExitoEliminar(false)}
          >
            Cerrar
          </button>
        </div>
      </div>
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

// --- NUEVOS estilos ---
userBar: {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px 20px",
  background: "#f5f5f5",
  borderRadius: 10,
  marginBottom: 20,
},
userInfo: { display: "flex", flexDirection: "column" },
userRole: { fontSize: 12, color: "#555" },
logoutBtn: { background: "transparent", border: "none", cursor: "pointer", position: "relative" },


logoutTooltip: {
  position: "absolute",
  left: "50%",
  top: "110%",
  transform: "translateX(-50%)",
  background: "#232323",
  color: "#fff",
  borderRadius: "5px",
  fontSize: 14,
  padding: "4px 10px",
  whiteSpace: "nowrap",
  zIndex: 10001,
  boxShadow: "0 2px 12px #0003",
  opacity: 1,
  pointerEvents: "none",
  transition: "opacity 0.22s",
},

modalOverlay: {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(0,0,0,0.3)",
  zIndex: 1000,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
},
modalContent: {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  minWidth: 280,
},
modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
modalButtonRow: { display: "flex", justifyContent: "center", gap: 10 },
modalBtnRojo: { background: "red", color: "#fff", padding: "6px 12px", border: "none", borderRadius: 4, cursor: "pointer" },
modalBtnGris: { background: "#aaa", color: "#fff", padding: "6px 12px", border: "none", borderRadius: 4, cursor: "pointer" },
menuGrid: { display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", marginTop: 20 },
optionCard: {
  border: "2px solid",
  borderRadius: 10,
  padding: 20,
  width: 240,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 10,
  cursor: "pointer",
  background: "transparent",
  userSelect: "none",
  transition: "all 0.3s ease",
},
optionIcon: { fontSize: 30, marginBottom: 10 },
optionTitle: { fontSize: 18, fontWeight: "bold" },
optionDesc: { fontSize: 14, textAlign: "center", color: "#555" },


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
  // Quitar posicionamiento que lo saca del flujo normal
  position: "static",   // o simplemente eliminar esta línea
  marginTop: "20px",
  alignSelf: "center",
  backgroundColor: "#119e8e",
  borderRadius: 28,
  color: "white",
  padding: "7px 16px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center", // ✅ centra el contenido SVG + texto
  boxShadow: "0 1px 10px 0 #abded720",
  userSelect: "none",
  transition: "opacity 0.2s",
  // left: 28, bottom: 50, zIndex: 20 👈 eliminados
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
  flexGrow: 1,
  color: "#1565c0",
  fontSize: 28,
  fontWeight: 900,
  letterSpacing: "0.03em",
  textAlign: "center",
  textShadow: "0 1px 7px #198ae133",
  margin: "0 0 12px 0", // margen abajo para separar del contenido
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

  buttonsRow: {
  display: "flex",
  gap: 12,
  justifyContent: "center",
  marginBottom: 14,
  marginTop: 22,
  flexWrap: "wrap",
},

btnBack: {
  display: "flex",
  alignItems: "center",
  backgroundColor: "#d5f0ee",
  color: "#1565c0",
  border: "none",
  borderRadius: 8,
  padding: "8px 14px",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
  userSelect: "none",
  transition: "background-color 0.3s",
},

btnDashboard: {
  display: "flex",
  alignItems: "center",
  backgroundColor: "#33bfff",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "8px 14px",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
  userSelect: "none",
  transition: "background-color 0.3s",
},

title: {
  color: "#1565c0",
  fontSize: 28,
  fontWeight: 900,
  letterSpacing: "0.03em",
  textAlign: "center",
  textShadow: "0 1px 7px #198ae133",
  margin: "0 0 24px 0",
},

"@media (max-width: 600px)": {
  buttonsRow: {
    flexDirection: "column",
    gap: 10,
    alignItems: "center",
  },
  btnBack: {
    width: "100%",
    justifyContent: "center",
  },
  btnDashboard: {
    width: "100%",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  },
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

  userBar: {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "#e3f8e2",
  boxShadow: "0 1px 12px #86b66b38",
  padding: "8px 16px",
  borderRadius: "10px",
  gap: "10px",
  flexWrap: "wrap",           // 👈 Permite que los hijos bajen a otra línea si no hay espacio
  boxSizing: "border-box",    // 👈 Asegura que padding esté dentro del ancho total
},

avatarCircle: {
  width: "42px",
  height: "42px",
  borderRadius: "50%",
  background: "#b5e2c7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "21px",
  fontWeight: "bold",
  color: "#44905e",
  flexShrink: 0,              // 👈 Evita que el avatar se deforme
},

userInfoResponsive: {
  display: "flex",
  flexDirection: "column",
  flex: 1,                    // 👈 Ocupa el espacio restante
  minWidth: 0,                // 👈 Permite que el texto se recorte
},

userName: {
  fontSize: "17px",
  fontWeight: 700,
  color: "#23907c",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",   // 👈 Muestra "…" si el texto no cabe
},

userRole: {
  fontSize: "13px",
  fontWeight: 500,
  color: "#39a94b",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
},

btnCursoCard: {
  background: "#fff",
  border: "1.2px solid #e0e0e0",
  borderRadius: 9,
  cursor: "pointer",
  padding: "4px 8px",
  margin: 0,
  display: "flex",
  alignItems: "center",
  transition: "background 0.17s, box-shadow 0.17s",
  boxShadow: "0 1px 6px #64b8d625",
},


logoutResponsive: {
  background: "#fff",
  color: "#e74c3c",
  border: "1px solid #e0e0e0",
  borderRadius: "50%",
  width: "38px",
  height: "38px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "22px",
  cursor: "pointer",
  flexShrink: 0,              // 👈 No se reduce
  boxShadow: "0 2px 8px #39a34822",
  transition: "background 0.2s",
},


avatarInitials: { fontSize: "21px", fontWeight: "bold" },
userInfoResponsive: {
  display: "flex",
  flexDirection: "column",
  flex: 1,
  minWidth: 0,
},
userName: { fontSize: "17px", fontWeight: 700, color: "#23907c" },
userRole: { fontSize: "13px", fontWeight: 500, color: "#39a94b" },
logoutResponsive: {
  background: "#fff",
  color: "#e74c3c",
  border: "1px solid #e0e0e0",
  borderRadius: "100%",
  width: "38px",
  height: "38px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "22px",
  cursor: "pointer",
  marginLeft: 6,
  boxShadow: "0 2px 8px #39a34822",
  transition: "background 0.2s",
},
menuGridResponsive: {
  display: "flex",
  flexWrap: "wrap",
  gap: "18px",
  justifyContent: "center",
  margin: "30px 0 18px 0",
},



optionCard: {
  border: "2px solid",
  borderRadius: 15,
  width: 145,
  height: 100,
  margin: "12px 18px",
  background: "#2196f3", // por defecto azul (se puede sobrescribir con bgColor en OptionCard)
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  userSelect: "none",
  cursor: "pointer",
  boxShadow: "0 3px 18px #225fa722",
  fontWeight: 600,
  fontSize: 15,
  transition: "background 0.18s, color 0.18s, box-shadow 0.14s",
},
optionIcon: {
  fontSize: "30px",
  color: "#fff",
  marginBottom: "4px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
},
optionTitleMini: {
  fontSize: "17px",
  fontWeight: 700,
  color: "#fff",
  margin: 0,
},
menuGridResponsive: {
  display: "flex",
  gap: 18,
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  margin: "25px 0 12px 0",
},
"@media (max-width: 700px)": {
  optionCard: {
    width: "85vw",
    maxWidth: "98vw",
    height: 80,
    margin: "9px auto",
  },
  menuGridResponsive: {
    flexDirection: "column",
    gap: 10,
    margin: "16px 0 6px 0",
  },
},

modalOverlay: {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(44, 62, 80, 0.20)",
  zIndex: 99999,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
},

modalContentSalir: {
  background: "white",
  borderRadius: "16px",
  padding: "38px 32px 28px",
  minWidth: 320,
  minHeight: 150,
  boxShadow: "0 6px 32px #ff860124, 0 1.5px 7px #bbb2",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center"
},

iconCircle: {
  width: 58,
  height: 58,
  background: "#fff8ec",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 14,
},

tituloSalir: {
  fontSize: 22,
  fontWeight: 800,
  color: "#22313a",
  marginBottom: 18,
  marginTop: 0,
  letterSpacing: ".01em",
},

modalButtonRow: {
  display: "flex",
  gap: 14,
  flexWrap: "wrap",
  marginTop: 6,
  justifyContent: "center"
},

modalBtnRojo: {
  background: "linear-gradient(90deg,#ff5d56,#fdad43 110%)",
  color: "#fff",
  padding: "10px 22px",
  border: "none",
  borderRadius: "7px",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
  boxShadow: "0 2px 12px #f1b41722",
  transition: "background 0.25s",
},

modalBtnGris: {
  background: "#e1e4e8",
  color: "#444",
  padding: "10px 22px",
  border: "none",
  borderRadius: "7px",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
  boxShadow: "0 2px 12px #ddd2",
  transition: "background 0.23s",
},




sedeSection: {
  marginBottom: "30px",
  padding: "12px 0",
  borderBottom: "2px solid #119e8e",
},
sedeTitle: {
  fontSize: "23px",
  fontWeight: 800,
  color: "#e86e19",
  marginBottom: 2,
  letterSpacing: "0.02em",
  textAlign: "center",
  textShadow: "0 2px 10px #f5b94f48"
},
jornadaContainer: {
  marginBottom: "18px",
},
jornadaTitle: {
  fontSize: "17px",
  fontWeight: 600,
  color: "#0f8d22",
  margin: "10px 0",
  marginLeft: 22,
  textTransform: "capitalize",
},

coursesCardGrid: {
  display: "flex",
  flexWrap: "wrap",
  gap: "15px",
  marginBottom: "17px",
  justifyContent: "center",
},
courseCard: {
  background: "#d5f0ee",
  borderRadius: "14px",
  boxShadow: "0 2px 10px #53cdaa32",
  padding: "16px 18px 12px 18px",
  minWidth: "190px",
  maxWidth: "230px",
  fontSize: 15,
  color: "#23593c",
  marginBottom: "2px",
  display: "flex",
  flexDirection: "column",
  transition: "background 0.20s, box-shadow 0.20s",
  cursor: "pointer",
},






formContainer: {
  maxWidth: "470px",
  width: "100%",
  margin: "30px auto",
  background: "#fff",
  borderRadius: "18px",
  boxShadow: "0 5px 32px #86b66b28",
  padding: "38px 30px 28px 30px",
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  alignItems: "stretch",
  boxSizing: "border-box",
},
formHeader: {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "14px",
  justifyContent: "center",
},
headerIcon: { fontSize: "32px", color: "#56ab2f" },
formTitle: {
  fontSize: "28px",
  color: "#119e8e",
  fontWeight: 700,
},
formGridResponsive: {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  width: "100%",
},
formGroupResponsive: {
  display: "flex",
  flexDirection: "column",
  gap: "6px",
},
labelResponsive: {
  fontSize: "15px",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  color: "#119e8e",
  fontWeight: 600,
  marginBottom: "2px",
},
inputResponsive: {
  fontSize: "15px",
  padding: "7px 12px",
  borderRadius: "8px",
  border: "1.5px solid #90ceb3",
  width: "100%",
  background: "#f8fefb",
},
formButtonsResponsive: {
  display: "flex",
  gap: "16px",
  margin: "22px 0 0 0",
  flexWrap: "wrap",
  justifyContent: "center",
},
btnRegistrarResponsive: {
  background: "#56ab2f",
  color: "#fff",
  borderRadius: "9px",
  padding: "10px 28px",
  fontSize: "17px",
  fontWeight: 600,
  border: "none",
  boxShadow: "0 2px 16px #56ab2f22",
  display: "flex",
  alignItems: "center",
  gap: "7px",
  transition: "background 0.2s",
},
btnCancelarResponsive: {
  background: "#e0e0e0",
  color: "#2c2c2c",
  borderRadius: "9px",
  padding: "10px 24px",
  fontSize: "17px",
  border: "none",
  fontWeight: 600,
  boxShadow: "0 2px 16px #aaa4",
  transition: "background 0.2s",
},
formMsgResponsive: {
  marginTop: "10px",
  textAlign: "center",
  width: "100%",
},
errorResponsive: {
  color: "#e74c3c",
  fontWeight: 600,
},
exitoResponsive: {
  color: "#56ab2f",
  fontWeight: 600,
},
"@media (max-width: 700px)": {
  formContainer: {
    padding: "20px 4vw",
    margin: "24px auto",
    borderRadius: "10px",
    maxWidth: "95vw",
  },
  formHeader: {
    gap: "7px",
    marginBottom: "9px",
  },
  formTitle: {
    fontSize: "22px",
  },
  btnRegistrarResponsive: {
    width: "100%",
    padding: "10px 0",
    fontSize: "16px",
  },
  btnCancelarResponsive: {
    width: "100%",
    padding: "10px 0",
    fontSize: "16px",
  },
},
msgModalOverlay: {
  position: "fixed",
  top: 0, left: 0, right: 0, bottom: 0,
  background: "rgba(60,80,60,0.14)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 10010,
},
msgModalBox: {
  minWidth: "250px",
  maxWidth: "90vw",
  minHeight: "90px",
  background: "#e8ffef",
  borderRadius: "15px",
  boxShadow: "0 5px 28px #6fd17833",
  padding: "28px 32px 16px 32px",
  display: "flex",
  alignItems: "center",
  flexDirection: "column",
  gap: "11px",
  textAlign: "center",
  animation: "fadeIn 0.4s",
},

btnRegistrarResponsive: {
  background: "#56ab2f",
  color: "#fff",
  borderRadius: "9px",
  padding: "10px 28px",
  fontSize: "17px",
  fontWeight: 600,
  border: "none",
  display: "flex",
  alignItems: "center",
  gap: "7px",
  boxShadow: "0 2px 16px #56ab2f22",
  transition: "background 0.24s",
},
btnCancelarResponsive: {
  background: "#e0e0e0",
  color: "#2c2c2c",
  borderRadius: "9px",
  padding: "10px 24px",
  fontSize: "17px",
  border: "none",
  fontWeight: 600,
  display: "flex",
  alignItems: "center",
  gap: "7px",
  boxShadow: "0 2px 16px #aaa4",
  transition: "background 0.24s",
},
topBar: {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 20,
  flexWrap: "wrap",
  marginBottom: 18,
  padding: "0 10px",
},

btnBack: {
  display: "flex",
  alignItems: "center",
  backgroundColor: "#d5f0ee",
  color: "#1565c0",
  border: "none",
  borderRadius: 8,
  padding: "8px 14px",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
  userSelect: "none",
  transition: "background-color 0.3s",
},

btnDashboard: {
  display: "flex",
  alignItems: "center",
  backgroundColor: "#33bfff",
  color: "#fff",
  border: "none",
  borderRadius: 8,
  padding: "8px 14px",
  fontWeight: 700,
  fontSize: 16,
  cursor: "pointer",
  userSelect: "none",
  transition: "background-color 0.3s",
},

title: {
  flexGrow: 1,
  color: "#1565c0",
  fontSize: 28,
  fontWeight: 900,
  letterSpacing: "0.03em",
  textAlign: "center",
  textShadow: "0 1px 7px #198ae133",
  margin: 0,
},

// Responsividad para pantallas pequeñas
"@media (max-width: 600px)": {
  topBar: {
    flexDirection: "column",
    gap: 12,
  },
  title: {
    fontSize: 22,
  },
  btnBack: {
    width: "100%",
    justifyContent: "center",
  },
  btnDashboard: {
    width: "100%",
    justifyContent: "center",
  },
},


optionIcon: { fontSize: "38px", color: "#119e8e" },
optionTitle: { fontSize: "22px", fontWeight: 700, color: "#119e8e" },
optionDesc: { fontSize: "16px", color: "#484848", textAlign: "center" },

// RESPONSIVE media queries, agrega usando CSS-in-JS o en tu CSS:
'@media (max-width: 700px)': {
  pageContainer: { maxWidth: "98vw", padding: "10vw 3vw", minHeight: "auto" },
  userBar: { flexDirection: "column", alignItems: "flex-start", padding: "11px 4vw" },
  menuGridResponsive: { flexDirection: "column", gap: "16px", alignItems: "stretch" },
  optionCard: { width: "100%", minWidth: "0", margin: "0 auto" },
  tablaSalones: { fontSize: "13px", minWidth: "520px", overflowX: "auto" },
},

"@media (max-width: 700px)": {
  coursesCardGrid: { flexDirection: "column", gap: "12px" },
  courseCard: { width: "98vw", minWidth: "0", maxWidth: "98vw" },
},


};

export default SalonesPage;
