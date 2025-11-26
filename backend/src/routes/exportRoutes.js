const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/exportController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/pending', authenticate, authorize('reports', 'read'), asyncHandler(controller.exportPendingCsv));

module.exports = router;
