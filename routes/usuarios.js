const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const verificarToken = require('../middlewares/auth');
const autorizarRol = require('../middlewares/autorizarRol');
const bcrypt = require('bcryptjs');

// Middleware validación registro
const validarRegistro = (req, res, next) => {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios para registrar' });
  }
  next();
};

// Registro
router.post('/registro', validarRegistro, async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  try {
    let usuario = await Usuario.findOne({ email });
    if (usuario) return res.status(400).json({ error: 'Email ya registrado' });
    usuario = new Usuario({ nombre, email, password, rol });
    await usuario.save();
    res.json({ mensaje: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(400).json({ error: 'Usuario no encontrado' });
    const esValido = await usuario.compararPassword(password);
    if (!esValido) return res.status(400).json({ error: 'Contraseña incorrecta' });
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '24h' }
    );
    res.json({
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listar usuarios - solo admin
router.get('/', verificarToken, autorizarRol(['admin']), async (req, res) => {
  try {
    const usuarios = await Usuario.find().select('-password');
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar usuarios con paginación - solo admin
router.get('/search', verificarToken, autorizarRol(['admin']), async (req, res) => {
  try {
    const { query = '', page = 1, limit = 10 } = req.query;
    const q = query.trim();
    const filter = q
      ? {
        $or: [
          { nombre: { $regex: q, $options: 'i' } },
          { email: { $regex: q, $options: 'i' } },
          { rol: { $regex: q, $options: 'i' } },
        ]
      }
      : {};
    const total = await Usuario.countDocuments(filter);
    const usuarios = await Usuario.find(filter)
      .select('-password')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ nombre: 1 });
    res.json({ total, page: parseInt(page), usuarios });
  } catch (err) {
    console.error('Error searching usuarios:', err);
    res.status(500).json({ error: err.message || 'Error buscando usuarios' });
  }
});

// Actualizar usuario
router.patch('/:id', verificarToken, async (req, res) => {
  try {
    if (req.usuario.rol !== 'admin' && req.usuario.id !== req.params.id) {
      return res.status(403).json({ error: 'Acceso denegado' });
    }
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');
    if (!usuarioActualizado) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuarioActualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Eliminar usuario - solo admin
router.delete('/:id', verificarToken, autorizarRol(['admin']), async (req, res) => {
  try {
    const eliminado = await Usuario.findByIdAndDelete(req.params.id);
    if (!eliminado) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario eliminado correctamente', id: eliminado._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Crear usuario (solo admin)
router.post('/', verificarToken, autorizarRol(['admin']), async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  try {
    let usuario = await Usuario.findOne({ email });
    if (usuario) return res.status(400).json({ error: 'Email ya registrado' });
    usuario = new Usuario({ nombre, email, password, rol });
    await usuario.save();
    res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
