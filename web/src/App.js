import logo from './logo.svg';
import './App.css';

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './Login';
import Dashboard from './Dashboard';
import Footer from './Footer';
import SalonesPage from './SalonesPage';
import UsuariosPage from './UsuariosPage';
import RegisterPage from './RegisterPage';
import RetosPage from './RetosPage';
import RetoDetallePage from './RetoDetallePage';
import RetoFormPage from './RetoFormPage'; // <-- Importación para el formulario (crear/editar)
import RecoleccionPage from './RecoleccionPage'; // <-- Nueva importación para la página de recolección
import SeleccionarRetoParaRecoleccion from './SeleccionarRetoParaRecoleccion';

// Nuevas importaciones para resultados
import ResultadosSeleccion from './ResultadosSeleccion.js';
import ResultadosPorRetos from './ResultadosPorRetos.js';
import ResultadosGenerales from './ResultadosGenerales.js';
import ResultadosPorCursos from './ResultadosPorCursos.js';
import ResultadosPorRetosYCursos from './ResultadosPorRetosYCursos'; // <-- Nueva importación



// IMPORTACIÓN NUEVA para desempeño por sedes (archivo esperado en src/)
import ResultadosPorSedes from './ResultadosPorSedes';

// IMPORTACIÓN NUEVA para página informes financieros y protección por roles
import InformesFinancieros from './InformesFinancieros.js';



function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}



// Nueva ruta protegida por roles específicos (profesor y admin)
function PrivateRouteRoles({ children, rolesPermitidos }) {
  const token = localStorage.getItem('token');
  const usuarioStr = localStorage.getItem('usuario');
  let usuario = null;
  try {
    usuario = usuarioStr ? JSON.parse(usuarioStr) : null;
  } catch {
    usuario = null;
  }
  if (!token || !usuario) {
    return <Navigate to="/login" />;
  }
  if (rolesPermitidos && !rolesPermitidos.includes(usuario.rol)) {
    return <Navigate to="/login" />;
  }
  return children;
}

function App() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) {
      setUsuario(JSON.parse(usuarioGuardado));
    }
  }, []);

  return (
    <>
      <Router>
        <Routes>
          <Route path="/login" element={<Login onLogin={setUsuario} />} />
          <Route path="/registro" element={<RegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard usuario={usuario} onLogout={() => setUsuario(null)} />
              </PrivateRoute>
            }
          />

          <Route
            path="/salones"
            element={
              <PrivateRoute>
                <SalonesPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/usuarios"
            element={
              <PrivateRoute>
                <UsuariosPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/retos"
            element={
              <PrivateRoute>
                <RetosPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/retos/crear"
            element={
              <PrivateRoute>
                <RetoFormPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/retos/editar/:id"
            element={
              <PrivateRoute>
                <RetoFormPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/retos/:id"
            element={
              <PrivateRoute>
                <RetoDetallePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/retos/:id/recolecciones"
            element={
              <PrivateRoute>
                <RecoleccionPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/seleccionar-reto-para-recoleccion"
            element={
              <PrivateRoute>
                <SeleccionarRetoParaRecoleccion />
              </PrivateRoute>
            }
          />

          <Route
            path="/resultados"
            element={
              <PrivateRoute>
                <ResultadosSeleccion />
              </PrivateRoute>
            }
          />
          <Route
            path="/resultados/por-retos"
            element={
              <PrivateRoute>
                <ResultadosPorRetos />
              </PrivateRoute>
            }
          />
          <Route
            path="/resultados/generales"
            element={
              <PrivateRoute>
                <ResultadosGenerales />
              </PrivateRoute>
            }
          />
          <Route
            path="/resultados/por-cursos"
            element={
              <PrivateRoute>
                <ResultadosPorCursos />
              </PrivateRoute>
            }
          />
          <Route
            path="/resultados/por-retos-cursos"
            element={
              <PrivateRoute>
                <ResultadosPorRetosYCursos />
              </PrivateRoute>
            }
          />
          <Route
            path="/resultados/por-sedes"
            element={
              <PrivateRoute>
                <ResultadosPorSedes />
              </PrivateRoute>
            }
          />

          {/* Nueva ruta para informes financieros con protección por rol */}
         
<Route
  path="/informes-financieros"
  element={
    <PrivateRouteRoles rolesPermitidos={['profesor', 'admin']}>
      <InformesFinancieros usuario={usuario} />
    </PrivateRouteRoles>
  }
/>

          {/* Ruta catch-all */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>

      <Footer />
    </>
  );
}

export default App;
