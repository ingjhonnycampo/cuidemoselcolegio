require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middlewares primero
app.use(express.json());
app.use(cors());

// Luego las rutas
const salonesRouter = require('./routes/salones');
app.use('/api/salones', salonesRouter);

const retosRouter = require('./routes/retos');
app.use('/api/retos', retosRouter);

const resultadosRouter = require('./routes/resultados');
app.use('/api/resultados', resultadosRouter);

const usuariosRouter = require('./routes/usuarios');
app.use('/api/usuarios', usuariosRouter);

// ------- AGREGA ESTAS LINEAS (esta era la solución que faltaba) --------
const recoleccionesRouter = require('./routes/recolecciones');
app.use('/api/recolecciones', recoleccionesRouter);
// -----------------------------------------------------------------------
const ventasRouter = require('./routes/ventas');
app.use('/api/ventas', ventasRouter);

// PORT y conexión a base de datos
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB conectado'))
.catch(err => console.error('Error conectando a MongoDB:', err));

// Ruta test sencilla (opcional)
app.get('/', (req, res) => {
  res.send('API funcionando');
});

// Levanta el servidor
app.listen(PORT,'0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
