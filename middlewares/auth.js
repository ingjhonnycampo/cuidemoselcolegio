const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader)
    return res.status(401).json({ error: 'Falta el token de autenticación' });

  const partes = authHeader.split(' ');

  if (partes.length !== 2 || partes[0] !== 'Bearer')
    return res.status(401).json({ error: 'Formato de token inválido' });

  const token = partes[1];

  if (!token)
    return res.status(401).json({ error: 'Falta el token de autenticación' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.usuario = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = verificarToken;
