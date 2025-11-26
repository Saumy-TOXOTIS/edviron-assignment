const Transaction = require('../models/transaction');
const { maskObject } = require('../utils/permissions');
const { getPagination } = require('../utils/pagination');

async function listTransactions(req, res) {
  const { status, paymentMethod, dateFrom, dateTo, schoolId, studentId, gateway, search } = req.query;
  const filter = { ...(req.schoolScope || {}), ...(req.scopeFilter?.transactions || {}) };
  if (status) filter.status = status;
  if (paymentMethod) filter.paymentMethod = paymentMethod;
  if (gateway) filter.gateway = gateway;
  if (schoolId) filter.school = schoolId;
  if (studentId) filter.student = studentId;
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }
  if (search) {
    filter.gatewayRef = new RegExp(search, 'i');
  }

  const { page, limit, skip } = getPagination(req.query);
  const [data, total] = await Promise.all([
    Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('student', 'name studentCode className section')
      .populate('feeBill', 'billNo')
      .lean(),
    Transaction.countDocuments(filter),
  ]);
  const allowedFields = req.allowedFields?.transactions || ['*'];
  const masked = data.map((item) => maskObject(item, allowedFields));
  res.json({ data: masked, page, limit, total });
}

async function getTransaction(req, res) {
  const filter = {
    _id: req.params.id,
    ...(req.schoolScope || {}),
    ...(req.scopeFilter?.transactions || {}),
  };
  const txn = await Transaction.findOne(filter)
    .populate('student', 'name studentCode className section')
    .populate('feeBill', 'billNo')
    .lean();
  if (!txn) return res.status(404).json({ message: 'Transaction not found' });
  const allowedFields = req.allowedFields?.transactions || ['*'];
  return res.json(maskObject(txn, allowedFields));
}

module.exports = {
  listTransactions,
  getTransaction,
};
