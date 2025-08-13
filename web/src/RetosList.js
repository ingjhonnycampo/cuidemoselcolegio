import React, { useEffect, useState } from 'react';
import axios from 'axios';

function RetosList({ onEditar }) {
  const [retos, setRetos] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRetos = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/retos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRetos(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar retos');
      }
    };

    fetchRetos();
  }, []);

  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!retos.length) return <div>Cargando retos...</div>;

  return (
    <div>
      <h3>Lista de Retos</h3>
      <ul style={{ padding: 0, listStyle: 'none' }}>
        {retos.map((reto, index) => (
          <li
            key={reto._id}
            style={{
              backgroundColor: index % 2 === 0 ? 'rgba(44, 164, 48, 0.1)' : 'transparent', // filas pares en verde
              padding: '8px 12px',
              borderRadius: 4,
              marginBottom: 6,
            }}
          >
            <strong>{reto.nombre}</strong> - Descripción: {reto.descripcion}{' '}
            <button onClick={() => onEditar(reto._id)}>Editar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RetosList;
