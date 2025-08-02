// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const { getAnalyticsReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.get('/analytics', protect, getAnalyticsReport);

module.exports = router;