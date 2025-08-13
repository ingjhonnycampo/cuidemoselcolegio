const express = require('express');
const router = express.Router();
const Resultado = require('../models/Resultado');
const verificarToken = require('../middlewares/auth');
const autorizarRol = require('../middlewares/autorizarRol');

router.use(verificarToken);

// Listar resultados
router.get('/', async (req, res) => {
  try {
    const resultados = await Resultado.find()
      .populate('retoId')
      .populate('salonId');
    res.json(resultados);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Crear resultado
router.post('/', autorizarRol(['admin', 'profesor']), async (req, res) => {
  try {
    const resultado = new Resultado(req.body);
    const saved = await resultado.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Actualizar resultado
router.patch('/:id', autorizarRol(['admin', 'profesor']), async (req, res) => {
  try {
    const resultadoActualizado = await Resultado.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!resultadoActualizado) return res.status(404).json({ error: 'Resultado no encontrado' });
    res.json(resultadoActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar resultado
router.delete('/:id', autorizarRol(['admin']), async (req, res) => {
  try {
    const eliminado = await Resultado.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ error: 'Resultado no encontrado' });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
