// src/apiVentas.js
import api from './api';

export async function getVentas() {
  // GET /api/ventas
  const res = await api.get('/ventas');
  return res.data;
}

export async function registrarVenta(venta) {
  // POST /api/ventas
  const res = await api.post('/ventas', venta);
  return res.data;
}

export async function editarVenta(id, update) {
  // PUT /api/ventas/:id
  const res = await api.put(`/ventas/${id}`, update);
  return res.data;
}
