const mongoose = require('mongoose');

const ventaSchema = new mongoose.Schema({
  material: { type: String, required: true },
  precio: { type: Number, required: true },
  libras: { type: Number, required: true },
  usuario: { type: String, required: true },
  total: { type: Number, required: true },
  fechaHora: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Venta', ventaSchema);
