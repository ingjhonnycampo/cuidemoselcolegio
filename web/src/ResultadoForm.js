import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ResultadoForm({ resultadoId, onSuccess, onCancel }) {
  const [retoId, setRetoId] = useState('');
  const [salonId, setSalonId] = useState('');
  const [pesoRecolectado, setPesoRecolectado] = useState('');
  const [retos, setRetos] = useState([]);
  const [salones, setSalones] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const token = localStorage.getItem('token');

  // Cargar retos y salones para los selects
  useEffect(() => {
    axios.get('http://localhost:5000/api/retos', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setRetos(res.data))
      .catch(() => setMensaje('Error cargando retos'));

    axios.get('http://localhost:5000/api/salones', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setSalones(res.data))
      .catch(() => setMensaje('Error cargando salones'));
  }, [token]);

  // Cargar resultado para edición
  useEffect(() => {
    if (resultadoId) {
      axios.get(`http://localhost:5000/api/resultados/${resultadoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => {
        setRetoId(res.data.retoId?._id || '');
        setSalonId(res.data.salonId?._id || '');
        setPesoRecolectado(res.data.pesoRecolectado);
      }).catch(() => setMensaje('Error cargando resultado'));
    }
  }, [resultadoId, token]);

  const handleSubmit = async e => {
    e.preventDefault();
    setMensaje('');
    if (!retoId || !salonId || !pesoRecolectado) {
      setMensaje('Por favor completa todos los campos');
      return;
    }

    try {
      const data = { retoId, salonId, pesoRecolectado: Number(pesoRecolectado) };
      if (resultadoId) {
        await axios.patch(`http://localhost:5000/api/resultados/${resultadoId}`, data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensaje('Resultado actualizado correctamente');
      } else {
        await axios.post('http://localhost:5000/api/resultados', data, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMensaje('Resultado creado correctamente');
        setRetoId('');
        setSalonId('');
        setPesoRecolectado('');
      }
      if(onSuccess) onSuccess();
    } catch (err) {
      setMensaje(err.response?.data?.error || 'Error al guardar resultado');
    }
  };

  return (
    <div style={{ marginTop: 20, maxWidth: 400 }}>
      <h3>{resultadoId ? 'Editar Resultado' : 'Crear Resultado'}</h3>
      <form onSubmit={handleSubmit}>
        <select
          value={retoId}
          onChange={e => setRetoId(e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        >
          <option value="">Selecciona un reto</option>
          {retos.map(r => (
            <option key={r._id} value={r._id}>
              {r.nombre}
            </option>
          ))}
        </select>

        <select
          value={salonId}
          onChange={e => setSalonId(e.target.value)}
          required
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        >
          <option value="">Selecciona un salón</option>
          {salones.map(s => (
            <option key={s._id} value={s._id}>
              {s.nombre}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Peso recolectado"
          value={pesoRecolectado}
          onChange={e => setPesoRecolectado(e.target.value)}
          min="0"
          required
          style={{ width: '100%', padding: 8, marginBottom: 10 }}
        />

        <button type="submit" style={{ marginRight: 10 }}>
          {resultadoId ? 'Actualizar' : 'Crear'}
        </button>
        {onCancel && <button type="button" onClick={onCancel}>Cancelar</button>}
      </form>
      {mensaje && (
        <p style={{ marginTop: 10, color: mensaje.includes('correctamente') ? 'green' : 'red' }}>
          {mensaje}
        </p>
      )}
    </div>
  );
}

export default ResultadoForm;
