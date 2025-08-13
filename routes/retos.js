const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Reto = require('../models/Reto');
const verificarToken = require('../middlewares/auth');
const autorizarRol = require('../middlewares/autorizarRol');

router.use(verificarToken);

// Crear reto - solo admin o profesor
router.post('/', autorizarRol(['admin', 'profesor']), async (req, res) => {
  try {
    const reto = new Reto(req.body);
    const savedReto = await reto.save();
    res.json(savedReto);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Listar retos
router.get('/', async (req, res) => {
  try {
    const retos = await Reto.find();
    res.json(retos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un reto por ID con salonesAsignados poblados
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID de reto inválido' });
    }
    const reto = await Reto.findById(req.params.id).populate('salonesAsignados').lean();
    if (!reto) {
      return res.status(404).json({ error: 'Reto no encontrado' });
    }
    res.json(reto);
  } catch (err) {
    console.error('Error al obtener el detalle del reto:', err);
    res.status(500).json({ error: 'Error al obtener el detalle del reto' });
  }
});

// Actualizar reto y devolver reto poblado en salonesAsignados
router.patch('/:id', autorizarRol(['admin', 'profesor']), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID de reto inválido' });
    }
    const retoActualizado = await Reto.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('salonesAsignados');  // <--- Aquí el populate para mantener consistencia
    if (!retoActualizado) return res.status(404).json({ error: 'Reto no encontrado' });
    res.json(retoActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar reto
router.delete('/:id', autorizarRol(['admin']), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'ID de reto inválido' });
    }
    const eliminado = await Reto.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ error: 'Reto no encontrado' });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
