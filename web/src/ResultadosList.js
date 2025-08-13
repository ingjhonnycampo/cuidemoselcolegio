import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ResultadosList() {
  const [resultados, setResultados] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResultados = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/resultados', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setResultados(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar resultados');
      }
    };
    fetchResultados();
  }, []);

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!resultados.length) return <div>Cargando resultados...</div>;

  return (
    <div>
      <h3>Lista de Resultados</h3>
      <ul>
        {resultados.map(resultado => (
          <li key={resultado._id}>
            <strong>Salón:</strong> {resultado.salonId?.nombre || resultado.salonId}
            {' | '}
            <strong>Reto:</strong> {resultado.retoId?.nombre || resultado.retoId}
            {' | '}
            <strong>Peso recolectado:</strong> {resultado.pesoRecolectado}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ResultadosList;
