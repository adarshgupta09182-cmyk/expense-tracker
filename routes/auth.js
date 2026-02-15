const express = require('express');
const {
  registerValidator,
  loginValidator
} = require('../middleware/validators');
const {
  register,
  login,
  resetPassword
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.post('/reset-password', resetPassword);

module.exports = router;
