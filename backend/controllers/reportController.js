const db = require('../config/db');

const getSalesReport = async (req, res) => {
  try {
    // Dapatkan tanggal hari ini dalam format YYYY-MM-DD
    const today = new Date().toISOString().slice(0, 10);

    // 1. Query untuk Total Pendapatan Hari Ini
    const revenueQuery = `
      SELECT SUM(total_price) as totalRevenue 
      FROM orders 
      WHERE DATE(created_at) = ? AND status = 'selesai'
    `;
    const [revenueResult] = await db.query(revenueQuery, [today]);
    const totalRevenueToday = revenueResult[0].totalRevenue || 0;

    // 2. Query untuk Jumlah Pesanan Hari Ini
    const ordersQuery = `
      SELECT COUNT(id) as totalOrders 
      FROM orders 
      WHERE DATE(created_at) = ?
    `;
    const [ordersResult] = await db.query(ordersQuery, [today]);
    const totalOrdersToday = ordersResult[0].totalOrders || 0;

    // 3. Query untuk Top 5 Menu Terlaris (berdasarkan jumlah terjual)
    const topMenusQuery = `
      SELECT m.name, SUM(oi.quantity) as totalSold
      FROM order_items oi
      JOIN menus m ON oi.menu_id = m.id
      GROUP BY m.name
      ORDER BY totalSold DESC
      LIMIT 5
    `;
    const [topMenusResult] = await db.query(topMenusQuery);

    // Kirim semua data dalam satu respons
    res.status(200).json({
      success: true,
      data: {
        totalRevenueToday,
        totalOrdersToday,
        topSellingMenus: topMenusResult
      }
    });

  } catch (error) {
    console.error("Error fetching sales report:", error);
    res.status(500).json({ success: false, message: 'Server Eror' });
  }
};

module.exports = {
  getSalesReport,
};