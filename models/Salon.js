const mongoose = require('mongoose');

const SalonSchema = new mongoose.Schema({
  grado: { type: String, required: true },
  jornada: { type: String, required: true },
  sede: { type: String, required: true },
  salon: { type: String, required: true },
  cantidadEstudiantes: { type: Number, required: true }
}, { 
  timestamps: true,
  collection: 'salons'   // <--- colección minúscula explicita
});

module.exports = mongoose.model('Salon', SalonSchema);
