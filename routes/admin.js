const express = require('express');
const { getDashboard } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes protected and admin only
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);

module.exports = router;
