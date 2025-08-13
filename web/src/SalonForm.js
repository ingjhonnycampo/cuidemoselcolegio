import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SalonForm({ salonId, onSuccess, onCancel }) {
  const [nombre, setNombre] = useState('');
  const [capacidad, setCapacidad] = useState('');
  const [mensaje, setMensaje] = useState('');
  const token = localStorage.getItem('token');

  // Si recibimos un salonId, cargamos los datos para editar
  useEffect(() => {
    if (salonId) {
      axios.get(`http://localhost:5000/api/salones/${salonId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setNombre(res.data.nombre);
        setCapacidad(res.data.capacidad);
      }).catch(error => {
        setMensaje('Error al cargar salón');
      });
    }
  }, [salonId, token]);

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje('');
    if (!nombre || !capacidad) {
      setMensaje('Por favor completa todos los campos');
      return;
    }
    try {
      if (salonId) {
        // Editar salón (PATCH)
        await axios.patch(`http://localhost:5000/api/salones/${salonId}`, { nombre, capacidad }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensaje('Salón actualizado correctamente');
      } else {
        // Crear salón (POST)
        await axios.post('http://localhost:5000/api/salones', { nombre, capacidad }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensaje('Salón creado correctamente');
        setNombre('');
        setCapacidad('');
      }
      if(onSuccess) onSuccess();
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error al guardar salón');
    }
  };

  return (
    <div style={{ marginTop: 20, maxWidth: 400 }}>
      <h3>{salonId ? 'Editar Salón' : 'Crear Salón'}</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre del salón"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <input
          type="number"
          placeholder="Capacidad"
          value={capacidad}
          onChange={e => setCapacidad(e.target.value)}
          required
          min="1"
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <button type="submit" style={{ marginRight: 10 }}>
          {salonId ? 'Actualizar' : 'Crear'}
        </button>
        {onCancel && <button type="button" onClick={onCancel}>Cancelar</button>}
      </form>
      {mensaje && <p style={{ marginTop: 10, color: mensaje.includes('correctamente') ? 'green' : 'red' }}>{mensaje}</p>}
    </div>
  );
}

export default SalonForm;
