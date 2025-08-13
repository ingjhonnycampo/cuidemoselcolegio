import React, { useEffect, useState } from 'react';
import axios from 'axios';

function SalonesList({ onEditar }) {
  const [salones, setSalones] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSalones = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/salones', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSalones(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Error al cargar salones');
      }
    };

    fetchSalones();
  }, []);

  // EL RETURN debe estar DENTRO de la función SalonesList
  return (
    <div>
      <h3>Lista de Salones</h3>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {salones.map(salon => (
          <li key={salon._id}>
            <strong>{salon.nombre}</strong> - Capacidad: {salon.capacidad}
            {' '}
            {onEditar && (
              <button onClick={() => onEditar(salon._id)} style={{ marginLeft: 10 }}>
                Editar
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SalonesList;
