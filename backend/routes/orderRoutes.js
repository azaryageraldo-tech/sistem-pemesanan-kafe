const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');

// Route untuk membuat pesanan baru
router.post('/', createOrder);

// Route untuk mengambil semua pesanan
router.get('/', getAllOrders);

// ROUTE BARU: untuk mengubah status pesanan
router.put('/:id/status', updateOrderStatus);

module.exports = router;