const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const studentController = require('../controllers/studentController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/',
  authenticate,
  authorize('students', 'read'),
  asyncHandler(studentController.listStudents)
);
router.get(
  '/:id',
  authenticate,
  authorize('students', 'read'),
  asyncHandler(studentController.getStudent)
);

module.exports = router;
