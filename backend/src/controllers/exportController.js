const { format } = require('@fast-csv/format');
const FeeBill = require('../models/feeBill');

async function exportPendingCsv(req, res) {
  const { schoolId, className, section, dueFrom, dueTo } = req.query;
  const match = {
    ...(req.schoolScope || {}),
    ...(req.scopeFilter?.feeBills || {}),
    $expr: { $lt: ['$amountPaid', '$amountDue'] },
  };
  if (schoolId) match.school = schoolId;
  if (className) match.className = className;
  if (section) match.section = section;
  if (dueFrom || dueTo) {
    match.dueDate = {};
    if (dueFrom) match.dueDate.$gte = new Date(dueFrom);
    if (dueTo) match.dueDate.$lte = new Date(dueTo);
  }

  const cursor = FeeBill.find(match)
    .populate('student', 'name studentCode className section')
    .cursor();

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="pending_payments.csv"');

  const csvStream = format({ headers: true });
  csvStream.pipe(res);

  for await (const bill of cursor) {
    csvStream.write({
      billNo: bill.billNo,
      studentName: bill.student?.name,
      studentCode: bill.student?.studentCode,
      class: bill.student?.className,
      section: bill.student?.section,
      amountDue: bill.amountDue,
      amountPaid: bill.amountPaid,
      pending: bill.amountDue - bill.amountPaid,
      dueDate: bill.dueDate?.toISOString(),
      paymentMethod: bill.paymentMethod,
      status: bill.status,
    });
  }

  csvStream.end();
}

module.exports = { exportPendingCsv };
