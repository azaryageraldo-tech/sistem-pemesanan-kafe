const db = require('../config/db');

// Helper function untuk mengambil detail order
const getFullOrderDetails = async (orderId, connection) => {
  const conn = connection || db;
  const [order] = await conn.query('SELECT * FROM orders WHERE id = ?', [orderId]);
  if (order.length === 0) return null;

  const itemsQuery = `
    SELECT oi.quantity, m.name, m.price 
    FROM order_items oi 
    JOIN menus m ON oi.menu_id = m.id 
    WHERE oi.order_id = ?
  `;
  const [items] = await conn.query(itemsQuery, [orderId]);
  order[0].items = items;
  return order[0];
};

// ... di dalam file backend/controllers/orderController.js

const createOrder = async (req, res) => {
  // Ambil data baru: customer_name dan table_number
  const { customer_name, table_number, total_price, payment_method, items } = req.body;

  // Validasi data yang masuk
  if (!customer_name || !table_number || !total_price || !payment_method || !items || !items.length) {
    return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Simpan customer_name dan table_number ke database
    const orderQuery = 'INSERT INTO orders (customer_name, table_number, total_price, status, payment_method) VALUES (?, ?, ?, ?, ?)';
    const [orderResult] = await connection.query(orderQuery, [customer_name, table_number, total_price, 'diterima', payment_method]);
    const orderId = orderResult.insertId;

    const orderItemsQuery = 'INSERT INTO order_items (order_id, menu_id, quantity) VALUES ?';
    const orderItemsValues = items.map(item => [orderId, item.id, item.quantity]);
    await connection.query(orderItemsQuery, [orderItemsValues]);

    const newOrderDetails = await getFullOrderDetails(orderId, connection); // Fungsi helper kita sudah ada
    await connection.commit();

    req.io.emit('new_order', newOrderDetails);
    res.status(201).json({ success: true, message: 'Pesanan berhasil dibuat!', data: newOrderDetails });
  } catch (error) {
    await connection.rollback();
    console.error('Eror saat membuat pesanan:', error);
    res.status(500).json({ success: false, message: 'Server Eror' });
  } finally {
    connection.release();
  }
};

// ... (fungsi lainnya tetap sama)

// ... (di dalam file backend/controllers/orderController.js)

const getAllOrders = async (req, res) => {
  try {
    // Ambil parameter dari query URL, beri nilai default
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 9; // 9 pesanan per halaman
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let whereClause = '';
    let params = [];
    let countParams = [];

    // Jika ada query pencarian, bangun klausa WHERE
    if (search) {
      whereClause = 'WHERE customer_name LIKE ? OR table_number LIKE ?';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm);
    }

    // Query untuk menghitung total item yang cocok (untuk total halaman)
    const countQuery = `SELECT COUNT(*) as total FROM orders ${whereClause}`;
    const [countResult] = await db.query(countQuery, countParams);
    const totalItems = countResult[0].total;
    const totalPages = Math.ceil(totalItems / limit);

    // Query utama untuk mengambil data pesanan dengan limit dan offset
    const dataQuery = `
      SELECT * FROM orders 
      ${whereClause} 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);
    const [orders] = await db.query(dataQuery, params);

    // Ambil detail item untuk setiap pesanan yang diambil
    const fullOrders = await Promise.all(orders.map(order => getFullOrderDetails(order.id)));

    // Kirim respons dalam format baru yang menyertakan info paginasi
    res.status(200).json({
      success: true,
      data: {
        orders: fullOrders,
        totalPages: totalPages,
        currentPage: page,
      }
    });

  } catch (error) {
    console.error('Eror saat mengambil pesanan:', error);
    res.status(500).json({ success: false, message: 'Server Eror' });
  }
};

// ... (fungsi lainnya tetap sama)

const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    const updatedOrderDetails = await getFullOrderDetails(id);
    req.io.emit('order_updated', updatedOrderDetails);
    res.status(200).json({ success: true, data: updatedOrderDetails });
  } catch (error) {
    console.error('Eror saat update status:', error);
    res.status(500).json({ success: false, message: 'Server Eror' });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  updateOrderStatus,
};