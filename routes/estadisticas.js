const express = require('express');
const router = express.Router();
const Recoleccion = require('../models/Recoleccion'); // Ajusta con el nombre correcto de tu modelo de recolecciones
const Reto = require('../models/Reto');
const mongoose = require('mongoose');

router.get('/desempeno-por-curso', async (req, res) => {
  try {
    const cursoId = req.query.cursoId;
    if (!cursoId) return res.status(400).json({ error: 'Falta parámetro cursoId' });

    // Validar objectId válido si usas mongo
    if (!mongoose.Types.ObjectId.isValid(cursoId)) {
      return res.status(400).json({ error: 'cursoId inválido' });
    }

    // Obtener retos cerrados (fechaCierre < ahora)
    const retosCerrados = await Reto.find({
      fechaCierre: { $lt: new Date() }
    }).select('_id');

    const retosCerradosIds = retosCerrados.map(r => r._id);

    // Agregación para obtener peso y puntos agrupados por reto y curso
    const datos = await Recoleccion.aggregate([
      { $match: { cursoId: mongoose.Types.ObjectId(cursoId), retoId: { $in: retosCerradosIds } } },
      {
        $group: {
          _id: {
            retoId: "$retoId",
            cursoId: "$cursoId"
          },
          pesoLibras: { $sum: "$pesoLibras" },
          puntos: { $sum: "$puntos" }
        }
      },
      {
        $project: {
          _id: 0,
          retoId: "$_id.retoId",
          cursoId: "$_id.cursoId",
          pesoLibras: 1,
          puntos: 1
        }
      }
    ]);

    res.json(datos);
  } catch (error) {
    console.error("Error en desempeño-por-curso:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
