const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const config = require('../config');

function buildTokenPayload(user) {
  return {
    sub: user._id.toString(),
    role: user.role.name,
    scope: user.role.scope,
    schoolId: user.school ? user.school.toString() : null,
  };
}

function generateTokens(user) {
  const payload = buildTokenPayload(user);
  const accessToken = jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessTtl });
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshTtl });
  return { accessToken, refreshToken };
}

async function login(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() }).populate('role').populate('school');
  if (!user || user.status === 'disabled') {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const tokens = generateTokens(user);
  return res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role.name,
      scope: user.role.scope,
      school: user.school ? { id: user.school._id, name: user.school.name } : null,
      permissions: user.role.permissions,
    },
    tokens,
  });
}

async function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Missing refresh token' });
  }
  try {
    const payload = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const user = await User.findById(payload.sub).populate('role').populate('school');
    if (!user || user.status === 'disabled') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const tokens = generateTokens(user);
    return res.json({ tokens });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = {
  login,
  refresh,
};
