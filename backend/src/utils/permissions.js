function getPermission(role, resource) {
  if (!role || !role.permissions) return {};
  return role.permissions[resource] || {};
}

function canPerform(role, resource, action) {
  const perm = getPermission(role, resource);
  return Boolean(perm[action]);
}

function getAllowedFields(role, resource, action) {
  const perm = getPermission(role, resource);
  const fields = perm[`${action}Fields`] || perm[`${action}`] || [];
  if (fields === '*') return ['*'];
  if (Array.isArray(fields) && fields.includes('*')) return ['*'];
  return Array.isArray(fields) ? fields : [];
}

function maskObject(obj, allowedFields) {
  if (!Array.isArray(allowedFields) || allowedFields.includes('*')) {
    return obj;
  }
  const clean = {};
  allowedFields.forEach((key) => {
    if (obj[key] !== undefined) clean[key] = obj[key];
  });
  if (obj._id && clean._id === undefined) clean._id = obj._id;
  return clean;
}

module.exports = {
  getPermission,
  canPerform,
  getAllowedFields,
  maskObject,
};
