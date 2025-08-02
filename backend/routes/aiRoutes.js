const express = require('express');
const router = express.Router();
const { getMenuRecommendation, chatWithAI } = require('../controllers/aiController');

// Rute untuk rekomendasi satu arah
router.post('/recommendation', getMenuRecommendation);

// Rute untuk chatbot interaktif
router.post('/chat', chatWithAI);

module.exports = router;