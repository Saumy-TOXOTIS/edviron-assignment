const FeeBill = require('../models/feeBill');
const { maskObject } = require('../utils/permissions');
const { getPagination } = require('../utils/pagination');

async function listFeeBills(req, res) {
  const { status, paymentMethod, dueFrom, dueTo, schoolId, studentId } = req.query;
  const filter = { ...(req.schoolScope || {}), ...(req.scopeFilter?.feeBills || {}) };
  if (status) filter.status = status;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (schoolId) filter.school = schoolId;
  if (studentId) filter.student = studentId;
  if (dueFrom || dueTo) {
    filter.dueDate = {};
    if (dueFrom) filter.dueDate.$gte = new Date(dueFrom);
    if (dueTo) filter.dueDate.$lte = new Date(dueTo);
  }

  const { page, limit, skip } = getPagination(req.query);
  const [data, total] = await Promise.all([
    FeeBill.find(filter)
      .sort({ dueDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('student', 'name studentCode className section')
      .populate('school', 'name code')
      .lean(),
    FeeBill.countDocuments(filter),
  ]);
  const allowedFields = req.allowedFields?.feeBills || ['*'];
  const masked = data.map((item) => maskObject(item, allowedFields));
  res.json({ data: masked, page, limit, total });
}

async function getFeeBill(req, res) {
  const filter = {
    _id: req.params.id,
    ...(req.schoolScope || {}),
    ...(req.scopeFilter?.feeBills || {}),
  };
  const bill = await FeeBill.findOne(filter)
    .populate('student', 'name studentCode className section')
    .populate('school', 'name code')
    .lean();
  if (!bill) return res.status(404).json({ message: 'Fee bill not found' });
  const allowedFields = req.allowedFields?.feeBills || ['*'];
  return res.json(maskObject(bill, allowedFields));
}

module.exports = {
  listFeeBills,
  getFeeBill,
};
