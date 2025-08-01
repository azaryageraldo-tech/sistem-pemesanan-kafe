const express = require('express');
const router = express.Router();
const { 
  getAllMenus, 
  getAdminAllMenus, 
  createMenu, 
  updateMenu, 
  deleteMenu 
} = require('../controllers/menuController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../config/multerConfig');

// Rute Publik
router.get('/', getAllMenus);

// Rute Admin (terproteksi)
router.get('/admin', protect, getAdminAllMenus);
router.post('/', protect, upload.any(), createMenu);
router.put('/:id', protect, upload.any(), updateMenu);
router.delete('/:id', protect, deleteMenu);

module.exports = router;