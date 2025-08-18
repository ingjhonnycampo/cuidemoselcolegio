import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginSVG = () => (
  <svg width="86" height="86" viewBox="0 0 86 86" fill="none" style={{ marginBottom: 20 }}>
    <circle cx="43" cy="43" r="43" fill="#e4f7ef"/>
    <path d="M43 58c-9 0-20 4.5-20 10.2V70a1.8 1.8 0 001.8 1.8h36.3A1.9 1.9 0 0063 70v-1.8C63 62.5 52 58 43 58z" fill="#bcdfc9"/>
    <circle cx="43" cy="39" r="15" fill="#fff" stroke="#11998e" strokeWidth="2.2"/>
    <ellipse cx="43" cy="38" rx="6.5" ry="8" fill="#d7fff3"/>
    <ellipse cx="53" cy="33" rx="1.8" ry="1.3" fill="#20ad4e" opacity="0.24"/>
    <ellipse cx="47" cy="35.5" rx="1.3" ry="1.2" fill="#20ad4e" opacity="0.11"/>
  </svg>
);

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje('');
    try {
      const res = await axios.post('http://localhost:5000/api/usuarios/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      if (onLogin) onLogin(res.data.usuario);
      navigate('/dashboard');
    } catch (error) {
      setMensaje(error.response?.data?.error || 'Error en login');
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.titleContainer}>
          <LoginSVG />
          <h1 style={styles.title}>
            #EcoRetos <span style={{ color: "#20ad4e" }}>San Miguel</span>
          </h1>
        </div>
        <h2 style={styles.subtitle}>Bienvenido, inicia sesión</h2>

        <label htmlFor="email" style={styles.label}>Correo electrónico</label>
        <div style={styles.inputGroup}>
          <span style={styles.icon}>
            <svg width="21" height="21" fill="none" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <rect x="2" y="5" width="20" height="14" rx="4" stroke="#11998e" strokeWidth="2"/>
              <path d="M4 7l8 6 8-6" stroke="#20ad4e" strokeWidth="2" fill="none"/>
            </svg>
          </span>
          <input
            id="email"
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={styles.input}
            autoFocus
          />
        </div>

        <label htmlFor="password" style={styles.label}>Contraseña</label>
        <div style={styles.inputGroup}>
          <span style={styles.icon}>
            <svg width="21" height="21" fill="none" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <rect x="4" y="9" width="16" height="9" rx="3" stroke="#11998e" strokeWidth="2"/>
              <path d="M8 9V7a4 4 0 118 0v2" stroke="#20ad4e" strokeWidth="2"/>
            </svg>
          </span>
          <input
            id="password"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>Entrar</button>

        {mensaje && (
          <div style={{ ...styles.message, color: 'red' }}>
            {mensaje}
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('/registro')}
          style={styles.linkButton}
          aria-label="Ir a la página de registro"
        >
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" style={{ marginRight: 7, verticalAlign: "middle" }} aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="10.5" stroke="#11998e" strokeWidth="1.7"/>
            <path d="M12 16v-8M16 12h-8" stroke="#20ad4e" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          ¿No tienes cuenta? Regístrate aquí
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 16px',
    background: `
      linear-gradient(rgba(168,224,99,0.6), rgba(86,171,47,0.46)),
      url('/fondo-ambiental.jpg') no-repeat center center fixed`,
    backgroundSize: 'cover, cover',
    boxSizing: "border-box"
  },
  form: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    padding: '36px 30px',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(37, 166, 121, 0.2)',
    width: '100%',
    maxWidth: '360px',
    boxSizing: 'border-box',
    textAlign: 'center',
    outline: 'none',
  },
  titleContainer: {
    marginBottom: '12px',
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  title: {
    margin: 0,
    fontWeight: '900',
    fontSize: '2.1rem',
    color: '#11998e',
    letterSpacing: '1.5px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    userSelect: "none"
  },
  subtitle: {
    marginBottom: '24px',
    fontWeight: '700',
    fontSize: '1.23rem',
    color: '#2d6841',
    userSelect: "none"
  },
  label: {
    display: 'block',
    margin: '12px 0 6px',
    fontWeight: '600',
    fontSize: '15px',
    color: '#2f5040',
    textAlign: 'left',
    userSelect: "none"
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    background: '#f0f9f2',
    borderRadius: '8px',
    marginBottom: '11px',
    paddingLeft: '10px',
    border: '1.4px solid #d0ecd9',
    boxSizing: "border-box"
  },
  icon: {
    marginRight: '7px',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '13px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '15px',
    background: "transparent",
    outline: 'none',
    boxSizing: "border-box"
  },
  button: {
    width: '100%',
    padding: '13px',
    border: 'none',
    borderRadius: '9px',
    background: "linear-gradient(90deg,#20ad4e,#11998e 90%)",
    color: '#fff',
    fontWeight: '700',
    fontSize: '18px',
    marginTop: 13,
    transition: 'background .2s',
    userSelect: "none",
    cursor: 'pointer',
    boxShadow: "0 6px 20px #aeecd13c"
  },
  message: {
    marginTop: '13px',
    fontWeight: '600',
    fontSize: '15px',
  },
  linkButton: {
    marginTop: 17,
    background: 'none',
    border: 'none',
    color: '#11998e',
    textDecoration: 'underline',
    cursor: 'pointer',
    userSelect: 'none',
    fontSize: 15,
    display: 'inline-flex',
    alignItems: 'center',
    padding: 0,
    outline:"none"
  }
};

export default Login;
