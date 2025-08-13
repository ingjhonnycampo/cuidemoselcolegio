const mongoose = require('mongoose');
const ResultadoSchema = new mongoose.Schema({
  retoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reto', required: true },
  salonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Salon', required: true },
  pesoRecolectado: { type: Number, required: true }
});
module.exports = mongoose.model('Resultado', ResultadoSchema);
