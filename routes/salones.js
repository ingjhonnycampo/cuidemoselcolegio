const express = require('express');
const router = express.Router();
const Salon = require('../models/Salon');
const verificarToken = require('../middlewares/auth');
const autorizarRol = require('../middlewares/autorizarRol');

router.use(verificarToken);

// Crear salón
router.post('/', autorizarRol(['admin', 'profesor']), async (req, res) => {
  try {
    const { grado, jornada, sede, salon, cantidadEstudiantes } = req.body;
    if (!grado || !jornada || !sede || !salon || cantidadEstudiantes === undefined) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    const nuevoSalon = new Salon(req.body);
    const savedSalon = await nuevoSalon.save();
    return res.status(201).json(savedSalon);
  } catch (err) {
    console.error('Error creando salón:', err);
    return res.status(400).json({ error: err.message || 'Error al crear salón' });
  }
});

// Listar salones ordenados por grado y salón
router.get('/', async (req, res) => {
  try {
    const salones = await Salon.find().sort({ grado: 1, salon: 1 });
    return res.json(salones);
  } catch (err) {
    console.error('Error listando salones:', err);
    return res.status(500).json({ error: err.message || 'Error al obtener salones' });
  }
});

// Obtener un salón por Id (para traer sus datos completos si se necesita)
router.get('/:id', async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id);
    if (!salon) return res.status(404).json({ error: 'Salón no encontrado' });
    return res.json(salon);
  } catch (err) {
    console.error('Error obteniendo salón:', err);
    return res.status(500).json({ error: err.message || 'Error al obtener salón' });
  }
});

// Actualizar salón
router.patch('/:id', autorizarRol(['admin', 'profesor']), async (req, res) => {
  try {
    const { grado, jornada, sede, salon, cantidadEstudiantes } = req.body;
    if (!grado && !jornada && !sede && !salon && cantidadEstudiantes === undefined) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }
    const salonActualizado = await Salon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!salonActualizado) return res.status(404).json({ error: 'Salón no encontrado' });
    return res.json(salonActualizado);
  } catch (err) {
    console.error('Error actualizando salón:', err);
    return res.status(400).json({ error: err.message || 'Error al actualizar salón' });
  }
});

// Eliminar salón POR _id - solo admin
router.delete('/:id', autorizarRol(['admin']), async (req, res) => {
  try {
    const eliminado = await Salon.findByIdAndDelete(req.params.id);
    if (!eliminado)
      return res.status(404).json({ error: 'Salón no encontrado' });
    return res.json({ mensaje: 'Salón eliminado con éxito', idEliminado: req.params.id });
  } catch (err) {
    console.error('Error eliminando salón:', err);
    return res.status(400).json({ error: err.message || 'Error al eliminar salón' });
  }
});

module.exports = router;
