const express = require('express');
const {
  registerValidator,
  loginValidator
} = require('../middleware/validators');
const {
  register,
  login
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

module.exports = router;
