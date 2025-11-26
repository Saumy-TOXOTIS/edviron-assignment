const FeeBill = require('../models/feeBill');
const Transaction = require('../models/transaction');
const { getPagination } = require('../utils/pagination');

function buildDateGroup(by) {
  if (by === 'month') return { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
  if (by === 'day') return { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  return null;
}

async function feesSummary(req, res) {
  const { schoolId, className, section, by } = req.query;
  const match = { ...(req.schoolScope || {}), ...(req.scopeFilter?.feeBills || {}) };
  if (schoolId) match.school = schoolId;
  if (className) match.className = className; // class stored on student, but we denormalize in seed
  if (section) match.section = section;

  const groupId = buildDateGroup(by) || (by === 'paymentMethod' ? '$paymentMethod' : null);

  const groupStage = {
    _id: groupId,
    totalDue: { $sum: '$amountDue' },
    totalCollected: { $sum: '$amountPaid' },
    count: { $sum: 1 },
  };

  const pipeline = [{ $match: match }];
  if (groupId) pipeline.push({ $group: groupStage });
  pipeline.push({
    $project: {
      group: '$_id',
      totalDue: 1,
      totalCollected: 1,
      collectionRate: {
        $cond: [
          { $eq: ['$totalDue', 0] },
          0,
          { $round: [{ $multiply: [{ $divide: ['$totalCollected', '$totalDue'] }, 100] }, 2] },
        ],
      },
      count: 1,
      _id: 0,
    },
  });

  const summary = await FeeBill.aggregate(pipeline);

  // If not grouped, compute overall collection rate separately
  if (!groupId) {
    const totals = summary[0] || { totalDue: 0, totalCollected: 0, count: 0, collectionRate: 0 };
    return res.json({ summary: [totals] });
  }
  return res.json({ summary });
}

async function pendingPayments(req, res) {
  const { schoolId, className, section, dueFrom, dueTo } = req.query;
  const match = {
    ...(req.schoolScope || {}),
    ...(req.scopeFilter?.feeBills || {}),
    $expr: { $lt: ['$amountPaid', '$amountDue'] },
  };
  if (schoolId) match.school = schoolId;
  if (dueFrom || dueTo) {
    match.dueDate = {};
    if (dueFrom) match.dueDate.$gte = new Date(dueFrom);
    if (dueTo) match.dueDate.$lte = new Date(dueTo);
  }
  if (className) match.className = className;
  if (section) match.section = section;

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'students',
        localField: 'student',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: '$student' },
    {
      $project: {
        billNo: '$billNo',
        studentName: '$student.name',
        className: '$student.className',
        section: '$student.section',
        amountDue: 1,
        amountPaid: 1,
        pending: { $subtract: ['$amountDue', '$amountPaid'] },
        dueDate: 1,
      },
    },
    { $sort: { pending: -1, dueDate: 1 } },
  ];

  const results = await FeeBill.aggregate(pipeline).limit(100);
  return res.json({ pending: results });
}

async function failureReport(req, res) {
  const { schoolId, dateFrom, dateTo, gateway } = req.query;
  const match = { ...(req.schoolScope || {}), ...(req.scopeFilter?.transactions || {}), status: 'failed' };
  if (schoolId) match.school = schoolId;
  if (gateway) match.gateway = gateway;
  if (dateFrom || dateTo) {
    match.createdAt = {};
    if (dateFrom) match.createdAt.$gte = new Date(dateFrom);
    if (dateTo) match.createdAt.$lte = new Date(dateTo);
  }

  const breakdown = await Transaction.aggregate([
    { $match: match },
    {
      $group: {
        _id: { failureCode: '$failureCode', gateway: '$gateway' },
        count: { $sum: 1 },
      },
    },
    { $project: { _id: 0, failureCode: '$_id.failureCode', gateway: '$_id.gateway', count: 1 } },
    { $sort: { count: -1 } },
  ]);

  const { page, limit, skip } = getPagination(req.query);
  const [recent, total] = await Promise.all([
    Transaction.find(match)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('amount paymentMethod gateway failureCode failureReason createdAt')
      .lean(),
    Transaction.countDocuments(match),
  ]);

  return res.json({ breakdown, recent, page, limit, total });
}

module.exports = {
  feesSummary,
  pendingPayments,
  failureReport,
};
