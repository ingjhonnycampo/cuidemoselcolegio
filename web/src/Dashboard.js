import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';


function Portal({ children }) {
  return ReactDOM.createPortal(children, document.body);
}


function Dashboard({ usuario, onLogout }) {
  const navigate = useNavigate();


  const rol = usuario?.rol || "";
  const [menuRetosAbierto, setMenuRetosAbierto] = useState(false);
  const botonRef = useRef(null);
  const menuRef = useRef(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0, width: 0 });


  useEffect(() => {
    function manejarClickFuera(event) {
      if (
        menuRetosAbierto &&
        menuRef.current && !menuRef.current.contains(event.target) &&
        botonRef.current && !botonRef.current.contains(event.target)
      ) {
        setMenuRetosAbierto(false);
      }
    }
    document.addEventListener('mousedown', manejarClickFuera);
    return () => {
      document.removeEventListener('mousedown', manejarClickFuera);
    };
  }, [menuRetosAbierto]);


  useEffect(() => {
    if (menuRetosAbierto && botonRef.current) {
      const rect = botonRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [menuRetosAbierto]);


  function manejarClickOpcion(ruta) {
    setMenuRetosAbierto(false);
    navigate(ruta);
  }


  const retoOpciones = [];
  if (rol === "profesor" || rol === "admin") {
    retoOpciones.push({ nombre: 'Crear nuevo', ruta: '/retos/crear', icon: '➕' });
  }
  retoOpciones.push({ nombre: 'Consultar retos', ruta: '/retos', icon: '📋' });
  if (rol === "profesor" || rol === "admin") {
    retoOpciones.push({ nombre: 'Registrar material', ruta: '/seleccionar-reto-para-recoleccion', icon: '📦' });
  }


  const opcionesArriba = [
    {
      nombre: 'Salones',
      icono: (
        <svg height="40" width="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="6" width="18" height="12" rx="2" fill="#56ab2f" />
          <rect x="7" y="10" width="10" height="4" fill="#d4fc79" />
        </svg>
      ),
      ruta: '/salones'
    },
    {
      nombre: 'Retos',
      icono: (
        <svg height="40" width="40" viewBox="0 0 24 24" fill="gold" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" fill="#ffb300" />
          <text x="12" y="16" textAnchor="middle" fontSize="18" dy=".4em">🏆</text>
        </svg>
      ),
      onClick: () => setMenuRetosAbierto(prev => !prev),
      isRetos: true,
    },
    {
      nombre: 'Resultados',
      icono: (
        <svg height="40" width="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="16" height="16" rx="3" fill="#eca728" />
          <path d="M8 12h8M8 16h4M8 8h8" stroke="#fff" strokeWidth="2" />
        </svg>
      ),
      ruta: '/resultados'
    },
  ];


  const opcionesAbajo = [
    ...(rol !== 'profesor' && rol !== 'invitado' && rol !== 'estudiante' ? [{
      nombre: 'Usuarios',
      icono: (
        <svg height="40" width="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="10" r="6" fill="#6c63ff" />
          <rect x="6" y="18" width="12" height="3" rx="1.5" fill="#b2a5ff" />
        </svg>
      ),
      ruta: '/usuarios'
    }] : []),
    ...(rol === 'profesor' || rol === 'admin' ? [{
      nombre: 'finanzas',
      icono: (
        <svg height="40" width="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#5a47d1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3h18v18H3z" fill="#d0c9ff" />
          <path d="M7 17v-2a2 2 0 012-2h6" />
          <path d="M7 10h10" />
          <path d="M10 7h1" />
          <path d="M14 7h1" />
        </svg>
      ),
      ruta: '/informes-financieros'
    }] : []),
  ];


  return (
    <div style={styles.contenedor}>
      <header style={styles.encabezado}>
        <div style={styles.usuarioContenedor}>
          <h1 style={styles.titulo}>Bienvenido a SYNERGY</h1>
          {usuario && (
            <span style={styles.usuarioInfo}>
              {usuario.nombre} <small style={styles.rolEtiqueta}>({usuario.rol})</small>
            </span>
          )}
        </div>
        <button
          style={styles.botonCerrarSesion}
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            if (onLogout) onLogout();
          }}
          aria-label="Cerrar sesión"
        >
          Cerrar sesión
        </button>
      </header>


      <section style={styles.opcionesContenedor}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', width: '100%', marginBottom: 24, position: 'relative', zIndex: 1 }}>
          {opcionesArriba.map((opc) => {
            if (opc.isRetos) {
              return (
                <div
                  key={opc.nombre}
                  ref={botonRef}
                  tabIndex={0}
                  role="button"
                  aria-haspopup="true"
                  aria-expanded={menuRetosAbierto}
                  aria-label="Menú de Retos"
                  style={{ ...styles.tarjeta, backgroundColor: '#11998e', color: 'white', boxShadow: '0 6px 20px rgba(17,153,142,0.6)', userSelect: 'none', position: 'relative', zIndex: 1 }}
                  onClick={opc.onClick}
                  onKeyDown={e => { if (e.key === 'Enter') opc.onClick(); }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  {opc.icono}
                  <span style={{ ...styles.nombreTarjeta, color: 'white' }}>{opc.nombre} ▾</span>
                </div>
              );
            }
            return (
              <article
                key={opc.nombre}
                style={{ ...styles.tarjeta, backgroundColor: '#11998e', zIndex: 10 }}
                onClick={() => navigate(opc.ruta)}
                tabIndex={0}
                role="button"
                onKeyDown={e => e.key === 'Enter' && navigate(opc.ruta)}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {opc.icono}
                <span style={{ ...styles.nombreTarjeta, color: 'white' }}>{opc.nombre}</span>
              </article>
            );
          })}
        </div>


        {/* Menú desplegable en portal para correcta visibilidad en móviles */}
        {menuRetosAbierto && (
          <Portal>
            <div
              ref={menuRef}
              style={{
                ...styles.menuDropdown,
                position: 'absolute',
                top: menuPos.top,
                left: menuPos.left,
                width: menuPos.width,
                zIndex: 9999,
              }}
            >
              {retoOpciones.map((subOpc) => (
                <button
                  key={subOpc.nombre}
                  onClick={() => manejarClickOpcion(subOpc.ruta)}
                  style={styles.menuDropdownItem}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#11998e';
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(17,153,142,0.6)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.color = '#11998e';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  aria-label={`Ir a ${subOpc.nombre}`}
                >
                  <span style={{ fontSize: '20px', marginRight: 8 }}>{subOpc.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{subOpc.nombre}</span>
                </button>
              ))}
            </div>
          </Portal>
        )}


        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center', width: '100%' }}>
          {opcionesAbajo.map(opc => (
            <article
              key={opc.nombre}
              style={{ ...styles.tarjeta, backgroundColor: '#11998e', zIndex: 10 }}
              onClick={() => navigate(opc.ruta)}
              tabIndex={0}
              role="button"
              onKeyDown={e => e.key === 'Enter' && navigate(opc.ruta)}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {opc.icono}
              <span style={{ ...styles.nombreTarjeta, color: 'white' }}>{opc.nombre}</span>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}


const styles = {
  contenedor: {
    minHeight: '100vh',
    paddingTop: 40,
    paddingBottom: 60,
    paddingLeft: 20,
    paddingRight: 20,
    background: `
      linear-gradient(rgba(190, 250, 116, 0.7), rgba(86,171,47,0.6)),
      url('/fondo-ambiental.jpg') no-repeat center center
    `,
    backgroundSize: 'cover',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    maxWidth: 1200,
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  encabezado: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  usuarioContenedor: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    minWidth: 200,
    marginBottom: 12,
  },
  titulo: {
    margin: 0,
    fontWeight: '900',
    fontSize: 28,
    color: '#263238',
  },
  usuarioInfo: {
    marginTop: 4,
    color: '#2a1199ff',
    fontWeight: '700',
    fontSize: 20,
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    letterSpacing: '0.5px',
  },
  rolEtiqueta: {
    fontWeight: '400',
    color: '#6c757d',
    fontSize: 16,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  botonCerrarSesion: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    padding: '10px 18px',
    fontWeight: '700',
    fontSize: 16,
    flexShrink: 0,
    transition: 'background-color 0.2s',
  },
  opcionesContenedor: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  tarjeta: {
    backgroundColor: '#11998e',
    borderRadius: 16,
    width: '180px',
    maxWidth: '95vw',
    height: 180,
    boxShadow: '0 12px 30px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative',
  },
  nombreTarjeta: {
    marginTop: 16,
    fontWeight: 700,
    fontSize: 22,
    color: 'white',
    userSelect: 'none',
    wordBreak: 'break-word',
    textAlign: 'center',
  },
  menuDropdown: {
    minWidth: 160,
    backgroundColor: 'white',
    borderRadius: 12,
    boxShadow: '0 8px 16px rgba(0,0,0,0.22)',
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    marginTop: 8,
    alignItems: 'stretch',
  },
  menuDropdownItem: {
    backgroundColor: 'white',
    border: '2px solid #11998e',
    borderRadius: 20,
    padding: '8px 12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    fontSize: 14,
    fontWeight: 600,
    color: '#11998e',
    cursor: 'pointer',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap',
    minWidth: 130,
    transition: 'background-color 0.3s, color 0.3s, transform 0.3s',
  },
};


export default Dashboard;
