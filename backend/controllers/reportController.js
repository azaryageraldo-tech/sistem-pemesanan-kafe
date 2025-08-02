const db = require('../config/db');

// Fungsi ini bisa kita hapus atau biarkan, tapi kita akan buat yang baru
// const getSalesReport = ...

const getAnalyticsReport = async (req, res) => {
  try {
    // Ambil rentang tanggal dari query, default 7 hari terakhir
    const endDate = req.query.endDate || new Date().toISOString().slice(0, 10);
    let startDate = new Date();
    startDate.setDate(startDate.getDate() - 6); // Default 7 hari (termasuk hari ini)
    startDate = req.query.startDate || startDate.toISOString().slice(0, 10);

    // 1. Query untuk Total Pendapatan & Pesanan dalam rentang tanggal
    const summaryQuery = `
      SELECT 
        SUM(total_price) as totalRevenue,
        COUNT(id) as totalOrders
      FROM orders
      WHERE DATE(created_at) BETWEEN ? AND ? AND status = 'selesai'
    `;
    const [summaryResult] = await db.query(summaryQuery, [startDate, endDate]);

    // 2. Query untuk Tren Penjualan Harian (untuk grafik garis)
    const salesOverTimeQuery = `
      SELECT 
        DATE(created_at) as date,
        SUM(total_price) as dailyRevenue
      FROM orders
      WHERE DATE(created_at) BETWEEN ? AND ? AND status = 'selesai'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;
    const [salesOverTimeResult] = await db.query(salesOverTimeQuery, [startDate, endDate]);

    // 3. Query untuk Top 5 Menu Terlaris dalam rentang tanggal
    const topMenusQuery = `
      SELECT 
        m.name, 
        SUM(oi.quantity) as totalSold
      FROM order_items oi
      JOIN menus m ON oi.menu_id = m.id
      JOIN orders o ON oi.order_id = o.id
      WHERE DATE(o.created_at) BETWEEN ? AND ?
      GROUP BY m.name
      ORDER BY totalSold DESC
      LIMIT 5
    `;
    const [topMenusResult] = await db.query(topMenusQuery, [startDate, endDate]);

    res.status(200).json({
      success: true,
      data: {
        summary: summaryResult[0],
        salesOverTime: salesOverTimeResult,
        topSellingMenus: topMenusResult
      }
    });

  } catch (error) {
    console.error("Error fetching analytics report:", error);
    res.status(500).json({ success: false, message: 'Server Eror' });
  }
};

module.exports = {
  getAnalyticsReport,
};