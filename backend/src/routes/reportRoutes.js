const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/reportController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/fees/summary',
  authenticate,
  authorize('reports', 'read'),
  asyncHandler(controller.feesSummary)
);
router.get(
  '/fees/pending',
  authenticate,
  authorize('reports', 'read'),
  asyncHandler(controller.pendingPayments)
);
router.get(
  '/transactions/failures',
  authenticate,
  authorize('reports', 'read'),
  asyncHandler(controller.failureReport)
);

module.exports = router;
