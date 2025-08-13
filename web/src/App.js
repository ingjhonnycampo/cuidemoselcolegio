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


// Dentro de <Routes> agrega esta ruta sin eliminar ninguna otra:







// IMPORTACIÓN NUEVA para desempeño por sedes (archivo esperado en src/)
import ResultadosPorSedes from './ResultadosPorSedes';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
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

          {/* Ruta para crear reto */}
          <Route
            path="/retos/crear"
            element={
              <PrivateRoute>
                <RetoFormPage />
              </PrivateRoute>
            }
          />

          {/* Ruta para editar reto */}
          <Route
            path="/retos/editar/:id"
            element={
              <PrivateRoute>
                <RetoFormPage />
              </PrivateRoute>
            }
          />

          {/* Ruta para detalle de reto */}
          <Route
            path="/retos/:id"
            element={
              <PrivateRoute>
                <RetoDetallePage />
              </PrivateRoute>
            }
          />


          {/* Nueva ruta para gestión de recolecciones */}
          <Route
            path="/retos/:id/recolecciones"
            element={
              <PrivateRoute>
                <RecoleccionPage />
              </PrivateRoute>
            }
          />

          {/* Ruta para seleccionar reto antes de recolección */}
          <Route
            path="/seleccionar-reto-para-recoleccion"
            element={
              <PrivateRoute>
                <SeleccionarRetoParaRecoleccion />
              </PrivateRoute>
            }
          />

          {/* Nuevas rutas para resultados */}
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

          {/* Nueva ruta añadida para resultados por retos y cursos */}
          <Route
            path="/resultados/por-retos-cursos"
            element={
              <PrivateRoute>
                <ResultadosPorRetosYCursos />
              </PrivateRoute>
            }
          />

         

          {/* NUEVA RUTA AGREGADA PARA DESEMPEÑO POR SEDES */}
          <Route
            path="/resultados/por-sedes"
            element={
              <PrivateRoute>
                <ResultadosPorSedes />
              </PrivateRoute>
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
