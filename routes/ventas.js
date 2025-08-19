// routes/ventas.js
const express = require('express');
const Venta = require('../models/Venta'); // asegúrate que el modelo está en models/Venta.js
const router = express.Router();

// Ruta GET para todas las ventas
router.get('/', async (req, res) => {
  try {
    const ventas = await Venta.find().sort({ fechaHora: -1 });
    res.json(ventas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ventas' });
  }
});

// Ruta POST para registrar nueva venta
router.post('/', async (req, res) => {
  try {
    const { material, precio, libras, usuario } = req.body;
    const total = precio * libras;
    const nuevaVenta = new Venta({ material, precio, libras, usuario, total });
    const ventaGuardada = await nuevaVenta.save();
    res.status(201).json(ventaGuardada);
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar venta' });
  }
});

// Ruta PUT para editar ventas (opcional)
router.put('/:id', async (req, res) => {
  try {
    const { precio, libras } = req.body;
    const venta = await Venta.findById(req.params.id);
    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }
    if (precio !== undefined) venta.precio = precio;
    if (libras !== undefined) venta.libras = libras;
    venta.total = venta.precio * venta.libras;
    const ventaActualizada = await venta.save();
    res.json(ventaActualizada);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar venta' });
  }
});

module.exports = router;
