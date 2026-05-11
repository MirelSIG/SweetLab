const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'sweetlab-dev-secret';
const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_SECRET || 'sweetlab-dev-refresh-secret';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const MAX_LOGIN_ATTEMPTS = Number(process.env.MAX_LOGIN_ATTEMPTS || 5);
const LOCK_TIME_MINUTES = Number(process.env.LOCK_TIME_MINUTES || 15);

const failedAttemptsByIdentity = new Map();

const allowedRoles = ['admin', 'externo'];

const getIdentityKey = (req, username) => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown-ip';
  return `${username.toLowerCase()}::${ip}`;
};

const lockDurationMs = LOCK_TIME_MINUTES * 60 * 1000;

const registerFailedAttempt = (identityKey) => {
  const now = Date.now();
  const previous = failedAttemptsByIdentity.get(identityKey) || { count: 0, lockedUntil: 0 };
  const count = previous.count + 1;
  const lockedUntil = count >= MAX_LOGIN_ATTEMPTS ? now + lockDurationMs : 0;

  failedAttemptsByIdentity.set(identityKey, { count, lockedUntil });
};

const clearFailedAttempts = (identityKey) => {
  failedAttemptsByIdentity.delete(identityKey);
};

const getLockRemainingSeconds = (identityKey) => {
  const entry = failedAttemptsByIdentity.get(identityKey);
  if (!entry || !entry.lockedUntil) {
    return 0;
  }

  const remainingMs = entry.lockedUntil - Date.now();
  if (remainingMs <= 0) {
    failedAttemptsByIdentity.delete(identityKey);
    return 0;
  }

  return Math.ceil(remainingMs / 1000);
};

const buildAccessToken = ({ role, username }) => jwt.sign(
  {
    role,
    username,
    scope: role === 'admin' ? ['recipes:read', 'recipes:write', 'recipes:delete'] : ['recipes:read']
  },
  ACCESS_TOKEN_SECRET,
  { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
);

const buildRefreshToken = ({ userId, role, username }) => jwt.sign(
  {
    sub: userId,
    role,
    username,
    tokenType: 'refresh'
  },
  REFRESH_TOKEN_SECRET,
  { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
);

const storeRefreshToken = async (userId, refreshToken) => {
  const user = await User.findById(userId);
  if (!user) {
    return;
  }

  const existingTokens = user.refreshTokens || [];
  const rotatedTokens = [...existingTokens, refreshToken].slice(-5);
  user.refreshTokens = rotatedTokens;
  await user.save();
};

exports.login = async (req, res) => {
  const { role, username, password } = req.body || {};

  if (!role || !allowedRoles.includes(role)) {
    return res.status(400).json({ message: 'Rol invalido. Usa "admin" o "externo".' });
  }

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña son obligatorios.' });
  }

  const identityKey = getIdentityKey(req, username);
  const lockRemainingSeconds = getLockRemainingSeconds(identityKey);
  if (lockRemainingSeconds > 0) {
    return res.status(429).json({
      message: `Cuenta bloqueada temporalmente por intentos fallidos. Intenta de nuevo en ${lockRemainingSeconds} segundos.`
    });
  }

  try {
    const user = await User.findOne({ username, role });

    if (!user) {
      registerFailedAttempt(identityKey);
      return res.status(401).json({ message: 'Credenciales invalidas para el rol indicado.' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      registerFailedAttempt(identityKey);
      return res.status(401).json({ message: 'Credenciales invalidas para el rol indicado.' });
    }

    clearFailedAttempts(identityKey);

    const token = buildAccessToken({ role: user.role, username: user.username });
    const refreshToken = buildRefreshToken({
      userId: user._id.toString(),
      role: user.role,
      username: user.username
    });
    await storeRefreshToken(user._id, refreshToken);

    return res.json({
      token,
      refreshToken,
      role: user.role,
      expiresIn: ACCESS_TOKEN_EXPIRES_IN
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error al iniciar sesion.' });
  }
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body || {};

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token requerido.' });
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    if (payload.tokenType !== 'refresh') {
      return res.status(401).json({ message: 'Refresh token invalido.' });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado para refresh token.' });
    }

    if (!(user.refreshTokens || []).includes(refreshToken)) {
      return res.status(401).json({ message: 'Refresh token no reconocido.' });
    }

    const newAccessToken = buildAccessToken({ role: user.role, username: user.username });
    const newRefreshToken = buildRefreshToken({
      userId: user._id.toString(),
      role: user.role,
      username: user.username
    });

    user.refreshTokens = (user.refreshTokens || [])
      .filter((token) => token !== refreshToken)
      .concat(newRefreshToken)
      .slice(-5);
    await user.save();

    return res.json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
      role: user.role,
      expiresIn: ACCESS_TOKEN_EXPIRES_IN
    });
  } catch (error) {
    return res.status(401).json({ message: 'Refresh token invalido o expirado.' });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body || {};

  if (!refreshToken) {
    return res.status(204).send();
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const user = await User.findById(payload.sub);
    if (user) {
      user.refreshTokens = (user.refreshTokens || []).filter((token) => token !== refreshToken);
      await user.save();
    }
  } catch (error) {
    // Si el token ya expiró, igual finalizamos logout en cliente.
  }

  return res.status(204).send();
};