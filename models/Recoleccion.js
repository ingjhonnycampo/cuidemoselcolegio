const mongoose = require('mongoose');

const recoleccionSchema = new mongoose.Schema({
  retoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reto', required: true },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  pesoLibras: { type: Number, required: true }, // en libras
  registradoPor: { // info del usuario que registra
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    nombre: { type: String, required: true }
  },
  fechaRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recoleccion', recoleccionSchema);

