const pool = require('../../utils/db');
const response = require('../../utils/response');

// 仪表盘统计
exports.stats = async (req, res) => {
  try {
    const [
      [productCount],
      [orderCount],
      [revenue],
      [customerCount],
      [todayOrders],
      [todayRevenue],
      [recentOrders],
      [platformStats],
      [orderTrend],
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) AS total FROM products'),
      pool.query('SELECT COUNT(*) AS total FROM orders'),
      pool.query("SELECT COALESCE(SUM(price), 0) AS total FROM orders WHERE status = 'paid'"),
      pool.query('SELECT COUNT(*) AS total FROM customers'),
      pool.query("SELECT COUNT(*) AS total FROM orders WHERE DATE(created_at) = CURDATE()"),
      pool.query("SELECT COALESCE(SUM(price), 0) AS total FROM orders WHERE status = 'paid' AND DATE(created_at) = CURDATE()"),
      pool.query('SELECT o.*, pc.card_no FROM orders o LEFT JOIN product_cards pc ON pc.order_id = o.id ORDER BY o.created_at DESC LIMIT 10'),
      pool.query(`SELECT p.platform, COUNT(*) AS count, COALESCE(SUM(o.price), 0) AS revenue
                  FROM orders o LEFT JOIN products p ON p.id = o.product_id
                  WHERE o.status = 'paid' GROUP BY p.platform`),
      pool.query(`SELECT DATE(created_at) AS date, COUNT(*) AS count, COALESCE(SUM(price), 0) AS revenue
                  FROM orders WHERE status = 'paid' AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                  GROUP BY DATE(created_at) ORDER BY date ASC`),
    ]);

    response(res, 0, 'success', {
      product_count: productCount[0].total,
      order_count: orderCount[0].total,
      total_revenue: revenue[0].total,
      customer_count: customerCount[0].total,
      today_orders: todayOrders[0].total,
      today_revenue: todayRevenue[0].total,
      recent_orders: recentOrders,
      platform_stats: platformStats,
      order_trend: orderTrend,
    });
  } catch (err) {
    console.error('[B]仪表盘统计失败:', err);
    response(res, 500, '服务器错误');
  }
};
