const express = require('express');
const router = express.Router();

const Recoleccion = require('../models/Recoleccion');
const Salon = require('../models/Salon');
const verificarToken = require('../middlewares/auth');

router.use(verificarToken);

router.get('/ranking-por-cursos-retos', async (req, res) => {
  try {
    const agrupado = await Recoleccion.aggregate([
      {
        $group: {
          _id: { retoId: "$retoId", salonId: "$salonId" },
          pesoLibras: { $sum: "$pesoLibras" },
        }
      },
      {
        $lookup: {
          from: "salones",
          localField: "_id.salonId",
          foreignField: "_id",
          as: "salon"
        }
      },
      { $unwind: "$salon" },
      {
        $project: {
          _id: 0,
          retoId: "$_id.retoId",
          cursoId: "$_id.salonId",
          pesoLibras: 1,
          grado: "$salon.grado",
          salon: "$salon.salon",
          jornada: "$salon.jornada",
          sede: "$salon.sede",
          nroEstudiantes: "$salon.nroEstudiantes",
        }
      },
      { $sort: { retoId: 1, pesoLibras: -1, nroEstudiantes: 1 } }
    ]);

    const puntosPorPosicion = [20, 15, 10, 7, 5, 3, 1];
    const resultadosPorReto = {};

    agrupado.forEach(item => {
      if (!resultadosPorReto[item.retoId]) resultadosPorReto[item.retoId] = [];
      resultadosPorReto[item.retoId].push(item);
    });

    for (const retoId in resultadosPorReto) {
      let posicion = 0;
      let ultimoPeso = null;
      let ultimoEstudiantes = null;
      let contador = 1;

      resultadosPorReto[retoId].forEach(curso => {
        if (curso.pesoLibras !== ultimoPeso || curso.nroEstudiantes !== ultimoEstudiantes) {
          posicion = contador;
          ultimoPeso = curso.pesoLibras;
          ultimoEstudiantes = curso.nroEstudiantes;
        }
        curso.posicion = posicion;
        curso.puntos = posicion <= puntosPorPosicion.length ? puntosPorPosicion[posicion - 1] : 0;
        contador++;
      });
    }

    const resultadosPlanos = Object.values(resultadosPorReto).flat();
    res.json(resultadosPlanos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error procesando ranking" });
  }
});

module.exports = router;
