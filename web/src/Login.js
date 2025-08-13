import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


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
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario)); // <-- LÍNEA CRUCIAL AGREGADA


      setMensaje('¡Login exitoso!');
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
          {/* Logo del colegio, descomenta y coloca el logo correcto en /public */}
          {/* <img src="/logo-colegio.png" alt="Logo Colegio" style={styles.logo} /> */}
          <h1 style={styles.title}>EcoRetos2025</h1>
          <h3 style={styles.subTitle}>San Miguel</h3>
        </div>


        <h2 style={styles.subtitle}>Iniciar sesión</h2>


        <label htmlFor="email" style={styles.label}>Correo electrónico</label>
        <div style={styles.inputGroup}>
          <span style={styles.icon}>
            {/* Ícono de correo (SVG) */}
            <svg width="20" height="20" fill="#11998e" viewBox="0 0 24 24">
              <path d="M4 4h16v16H4zm0 2v12h16V6zm16 0-8 7-8-7"/>
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
          />
        </div>


        <div style={styles.inputGroup}>
          <span style={styles.icon}>
            {/* Ícono de candado (SVG) */}
            <svg width="20" height="20" fill="#11998e" viewBox="0 0 24 24">
              <path d="M6 10V8a6 6 0 1112 0v2h1a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V11a1 1 0 011-1zm2-2a4 4 0 018 0v2H8V8zm10 3H6v8h12v-8z"/>
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
          <div style={{
            ...styles.message,
            color: mensaje === '¡Login exitoso!' ? 'green' : 'red'
          }}>
            {mensaje}
          </div>
        )}

        {/* BOTÓN ADICIONAL PARA REGISTRO */}
        <button
          type="button"
          onClick={() => navigate('/registro')}
          style={{
            marginTop: 20,
            backgroundColor: 'transparent',
            border: 'none',
            color: '#11998e',
            textDecoration: 'underline',
            cursor: 'pointer',
            userSelect: 'none',
            fontSize: 14,
          }}
          aria-label="Ir a la página de registro"
        >
          ¿No tienes cuenta? Regístrate aquí
        </button>
      </form>
    </div>
  );
}


const styles = {
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    background: '#f0f4f8',
    borderRadius: '4px',
    marginBottom: '15px',
    paddingLeft: '10px'
  },
  icon: {
    marginRight: '8px',
    display: 'flex',
    alignItems: 'center'
  },
  input: {
    flex: 1,
    padding: '10px 12px',
    border: 'none',
    borderRadius: '4px',
    background: 'transparent',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none'
  },


  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `
      linear-gradient(rgba(168,224,99,0.6), rgba(86,171,47,0.5)),
      url('/fondo-ambiental.jpg') no-repeat center center fixed
    `,
    backgroundSize: 'cover, cover'
  },
  form: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: '40px 30px 30px',
    borderRadius: '12px',
    boxShadow: '0 6px 24px rgba(52,171,127,0.18)',
    width: '340px',
    boxSizing: 'border-box',
    textAlign: 'center'
  },
  titleContainer: {
    marginBottom: '20px',
  },
  logo: {
    width: '66px',
    height: '66px',
    margin: '0 auto 12px',
    display: 'block',
    borderRadius: '50%',
    background: '#d4fc79',
    boxShadow: '0 2px 8px rgba(52,171,47,0.12)'
  },
  title: {
    margin: 0,
    fontWeight: '900',
    fontSize: '34px',
    color: '#11998e',
    letterSpacing: '2px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  subTitle: {
    margin: 0,
    fontWeight: '600',
    fontSize: '18px',
    color: '#56ab2f',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    letterSpacing: '1px'
  },
  subtitle: {
    marginBottom: '24px',
    fontWeight: '700',
    fontSize: '20px',
    color: '#34495e'
  },
  label: {
    display: 'block',
    margin: '10px 0 6px',
    fontWeight: '600',
    fontSize: '14px',
    color: '#34495e',
    textAlign: 'left'
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '4px',
    border: '1px solid #bdc3c7',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.3s',
    marginBottom: '15px'
  },
  button: {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '4px',
    backgroundColor: '#11998e',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
    transition: 'background-color 0.3s'
  },
  message: {
    marginTop: '15px',
    fontWeight: '600'
  }
};


export default Login;

