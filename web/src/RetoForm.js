import React, { useState, useEffect } from 'react';
import axios from 'axios';

function RetoForm({ retoId, onSuccess, onCancel }) {
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (retoId) {
      if (!token) {
        setMensaje("No autenticado. Por favor inicia sesión.");
        return;
      }
      axios.get(`http://localhost:5000/api/retos/${retoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        setNombre(res.data.nombre);
        setDescripcion(res.data.descripcion);
      }).catch(err => {
        if (err.response?.data?.error) {
          setMensaje(err.response.data.error);
        } else {
          setMensaje('Error al cargar reto');
        }
      });
    }
  }, [retoId, token]);

  const handleSubmit = async e => {
    e.preventDefault();

    if (!token) {
      setMensaje("No autenticado. Por favor inicia sesión.");
      return;
    }

    if (!nombre || !descripcion) {
      setMensaje('Por favor llena todos los campos');
      return;
    }

    setLoading(true);
    setMensaje('');
    try {
      if (retoId) {
        await axios.patch(`http://localhost:5000/api/retos/${retoId}`, { nombre, descripcion }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensaje('Reto actualizado correctamente');
      } else {
        await axios.post('http://localhost:5000/api/retos', { nombre, descripcion }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensaje('Reto creado correctamente');
        setNombre('');
        setDescripcion('');
      }
      if (onSuccess) onSuccess();
    } catch (err) {
      if (err.response?.data?.error) {
        setMensaje(err.response.data.error);
      } else {
        setMensaje('Error al guardar reto');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 20, maxWidth: 400 }}>
      <h3>{retoId ? 'Editar Reto' : 'Crear Reto'}</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nombre del reto"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />
        <textarea
          placeholder="Descripción"
          value={descripcion}
          onChange={e => setDescripcion(e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginBottom: 10, height: 80 }}
        />
        <button type="submit" style={{ marginRight: 10 }} disabled={loading}>
          {loading ? (retoId ? 'Actualizando...' : 'Creando...') : (retoId ? 'Actualizar' : 'Crear')}
        </button>
        {onCancel && <button type="button" onClick={onCancel}>Cancelar</button>}
      </form>
      {mensaje && (
        <p style={{ marginTop: 10, color: mensaje.toLowerCase().includes('correctamente') ? 'green' : 'red' }}>
          {mensaje}
        </p>
      )}
    </div>
  );
}

export default RetoForm;
