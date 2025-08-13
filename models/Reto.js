const mongoose = require('mongoose');

const RetoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  // Cambiar a tipo String para evitar desfase horario con fechas
  fechaInicio: { type: String, required: true },
  fechaCierre: { type: String, required: true },
  asignarATodosLosSalones: { type: Boolean, default: false },
  salonesAsignados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Salon' }],
  creador: { 
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, 
    nombre: { type: String } 
  }
}, { timestamps: true });

module.exports = mongoose.model('Reto', RetoSchema);
