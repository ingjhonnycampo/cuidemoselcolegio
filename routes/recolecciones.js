const express = require('express');
const router = express.Router();

const Recoleccion = require('../models/Recoleccion');
const Reto = require('../models/Reto');
const Salon = require('../models/Salon');

const verificarToken = require('../middlewares/auth');

// Proteger todo el router
router.use(verificarToken);

// Crear un nuevo registro de recolección
router.post('/', async (req, res) => {
  try {
    const { retoId, salonId, pesoLibras, registradoPor } = req.body;
    if (!retoId || !salonId || !pesoLibras || !registradoPor) {
      return res.status(400).json({ error: 'Faltan datos obligatorios' });
    }
    const nuevaRecoleccion = new Recoleccion({ retoId, salonId, pesoLibras, registradoPor });
    await nuevaRecoleccion.save();
    res.status(201).json(nuevaRecoleccion);
  } catch (e) {
    res.status(500).json({ error: 'Error al crear recolección' });
  }
});

// Obtener registros de recolección para reto y opcionalmente por salón
router.get('/reto/:retoId', async (req, res) => {
  try {
    const { retoId } = req.params;
    const { salonId } = req.query;

    let filtro = { retoId };
    if (salonId) filtro.salonId = salonId;

    const entregas = await Recoleccion.find(filtro)
      .populate('salonId', 'grado salon jornada sede')
      .sort({ fechaRegistro: -1 });

    res.json(entregas);
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener recolecciones' });
  }
});

// NUEVO endpoint para ranking sumado y ordenado (para ResultadosPorCursos)
router.get('/reto/:retoId/ranking', async (req, res) => {
  try {
    const { retoId } = req.params;

    const ranking = await Recoleccion.aggregate([
      { $match: { retoId } },
      {
        $group: {
          _id: "$salonId",
          pesoLibras: { $sum: "$pesoLibras" },
        }
      },
      {
        $lookup: {
          from: "salones",  // Ajusta el nombre según tu colección real
          localField: "_id",
          foreignField: "_id",
          as: "salonData"
        }
      },
      { $unwind: "$salonData" },
      { $sort: { pesoLibras: -1 } },
      {
        $project: {
          _id: 0,
          salonId: "$_id",
          pesoLibras: 1,
          grado: "$salonData.grado",
          salon: "$salonData.salon",
          jornada: "$salonData.jornada",
          sede: "$salonData.sede",
        }
      }
    ]);

    res.json(ranking);
  } catch (e) {
    console.error("Error en ranking agregado", e);
    res.status(500).json({ error: 'Error al obtener ranking agregado' });
  }
});

// Obtener salones asignados a un reto
router.get('/reto/:retoId/salones', async (req, res) => {
  try {
    const { retoId } = req.params;
    const reto = await Reto.findById(retoId).populate('salonesAsignados');

    if (!reto) return res.status(404).json({ error: 'Reto no encontrado' });

    if (reto.asignarATodosLosSalones) {
      const salones = await Salon.find();
      return res.json(salones);
    }

    return res.json(reto.salonesAsignados);
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener salones' });
  }
});

module.exports = router;
