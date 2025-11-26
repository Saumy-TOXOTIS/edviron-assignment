const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Role = require('../models/role');
const config = require('../config');
const { canPerform, getAllowedFields } = require('../utils/permissions');

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Missing token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, config.jwt.accessSecret);
    const user = await User.findById(payload.sub).populate('role').populate('school');
    if (!user || user.status === 'disabled') {
      return res.status(401).json({ message: 'Invalid user' });
    }
    req.user = user;
    req.role = user.role;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function authorize(resource, action = 'read') {
  return (req, res, next) => {
    const role = req.role;
    if (!role || !canPerform(role, resource, action)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.allowedFields = req.allowedFields || {};
    req.allowedFields[resource] = getAllowedFields(role, resource, action);
    req.scopeFilter = req.scopeFilter || {};
    const scopeFilter = role.scope === 'school' && req.user.school ? { school: req.user.school._id } : {};
    req.schoolScope = scopeFilter;
    req.scopeFilter[resource] = req.scopeFilter[resource] || scopeFilter;
    next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
