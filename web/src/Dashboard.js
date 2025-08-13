import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard({ usuario, onLogout }) {
  const navigate = useNavigate();

  const rol = usuario?.rol || "";
  const [menuRetosAbierto, setMenuRetosAbierto] = useState(false);
  const botonRef = useRef(null);
  const menuRef = useRef(null);

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

  function manejarClickOpcion(ruta) {
    setMenuRetosAbierto(false);
    navigate(ruta);
  }

  const opciones = [
    {
      nombre: 'Salones',
      icono: (
        <svg height="40" width="40" viewBox="0 0 24 24" fill="#56ab2f" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="6" width="18" height="12" rx="2"/>
          <rect x="7" y="10" width="10" height="4" fill="#fff"/>
        </svg>
      ),
      ruta: '/salones'
    },
    {
      nombre: 'Resultados',
      icono: (
        <svg height="40" width="40" viewBox="0 0 24 24" fill="#eca728" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="4" width="16" height="16" rx="3"/>
          <path d="M8 12h8M8 16h4M8 8h8" stroke="#fff" strokeWidth="2"/>
        </svg>
      ),
      ruta: '/resultados'
    },
    ...(rol !== 'profesor' && rol !== 'invitado' && rol !== 'estudiante' ? [{
      nombre: 'Usuarios',
      icono: (
        <svg height="40" width="40" viewBox="0 0 24 24" fill="#6c63ff" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8" r="4"/>
          <rect x="6" y="14" width="12" height="6" rx="3" fill="#c5cafe" />
        </svg>
      ),
      ruta: '/usuarios'
    }] : [])
  ];

  return (
    <div style={styles.contenedor}>
      <header style={styles.encabezado}>
        <div>
          <h1 style={{ margin: 0, fontWeight: 900 }}>Bienvenido a SYNERGY</h1>
          {usuario && (
            <span style={styles.usuarioInfo}>
              {usuario.nombre} ({usuario.rol})
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
        >
          Cerrar sesión
        </button>
      </header>

      <section style={styles.opcionesContenedor}>
        {opciones.map(opc => (
          <article
            key={opc.nombre}
            style={styles.tarjeta}
            onClick={() => navigate(opc.ruta)}
            tabIndex={0}
            role="button"
            onKeyDown={e => e.key === 'Enter' && navigate(opc.ruta)}
          >
            {opc.icono}
            <span style={styles.nombreTarjeta}>{opc.nombre}</span>
          </article>
        ))}

        <div style={{ position: 'relative', width: 180, height: 180, margin: 0 }}>
          <article
            id="botonRetos"
            ref={botonRef}
            style={styles.tarjeta}
            onClick={() => setMenuRetosAbierto(prev => !prev)}
            tabIndex={0}
            role="button"
            onKeyDown={e => { if (e.key === 'Enter') setMenuRetosAbierto(prev => !prev); }}
          >
            <svg height="40" width="40" viewBox="0 0 24 24" fill="#11998e" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10"/>
              <text x="12" y="16" textAnchor="middle" fontSize="12" dy=".3em">🏆</text>
            </svg>
            <span style={styles.nombreTarjeta}>Retos ▾</span>
          </article>

          {menuRetosAbierto && (
            <div
              id="menuRetos"
              ref={menuRef}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                backgroundColor: 'white',
                borderRadius: 12,
                boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                zIndex: 1000,
                width: 180,
                userSelect: 'none',
                marginTop: 4,
              }}
            >

              {(rol === "profesor" || rol === "admin") && (
                <div
                  className="menuItem"
                  style={menuItemStyle}
                  onClick={() => manejarClickOpcion('/retos/crear')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && manejarClickOpcion('/retos/crear')}
                >
                  Crear nuevo
                </div>
              )}

              <div
                className="menuItem"
                style={menuItemStyle}
                onClick={() => manejarClickOpcion('/retos')}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && manejarClickOpcion('/retos')}
              >
                Consultar retos
              </div>

              {(rol === "profesor" || rol === "admin") && (
                <div
                  className="menuItem"
                  style={menuItemStyle}
                  onClick={() => manejarClickOpcion('/seleccionar-reto-para-recoleccion')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && manejarClickOpcion('/seleccionar-reto-para-recoleccion')}
                >
                  Registrar material
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

const menuItemStyle = {
  padding: '12px 16px',
  cursor: 'pointer',
  borderBottom: '1px solid #eee',
  fontSize: 16,
  color: '#263238',
  outline: 'none',
  userSelect: 'none',
  transition: 'background-color 0.2s',
};

// Agrega este CSS en tu App.css o similar para resalte en hover
// .menuItem:hover, .menuItem:focus {
//   background-color: #d0ebff !important;
// }

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
    boxSizing: 'border-box'
  },
  encabezado: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    flexWrap: 'wrap',
  },
  usuarioInfo: {
    marginLeft: 12,
    color: '#2a1199ff',
    fontWeight: '600',
    fontSize: 18
  },
  botonCerrarSesion: {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    padding: '8px 16px',
    fontWeight: '700',
    fontSize: 16,
    flexShrink: 0
  },
  opcionesContenedor: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 32
  },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: 180,
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
    color: '#263238',
    userSelect: 'none',
  }
};

export default Dashboard;


