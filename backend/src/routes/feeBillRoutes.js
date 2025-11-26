const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/feeBillController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/', authenticate, authorize('feeBills', 'read'), asyncHandler(controller.listFeeBills));
router.get('/:id', authenticate, authorize('feeBills', 'read'), asyncHandler(controller.getFeeBill));

module.exports = router;
