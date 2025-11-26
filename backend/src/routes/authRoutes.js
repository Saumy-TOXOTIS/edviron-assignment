const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.post(
  '/login',
  [body('email').isEmail(), body('password').isLength({ min: 6 })],
  asyncHandler(authController.login)
);

router.post('/refresh', asyncHandler(authController.refresh));

module.exports = router;
