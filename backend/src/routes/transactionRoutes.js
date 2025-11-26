const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/transactionController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/',
  authenticate,
  authorize('transactions', 'read'),
  asyncHandler(controller.listTransactions)
);
router.get(
  '/:id',
  authenticate,
  authorize('transactions', 'read'),
  asyncHandler(controller.getTransaction)
);

module.exports = router;
