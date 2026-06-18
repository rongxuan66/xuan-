const pool = require('../../utils/db');
const response = require('../../utils/response');

// 平台列表
exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.platform_key, p.name, p.icon, p.color,
        (SELECT COUNT(*) FROM products pr WHERE pr.platform = p.platform_key AND pr.status = 1) AS product_count
       FROM platforms p WHERE p.status = 1 ORDER BY p.sort_order ASC`
    );
    response(res, 0, 'success', rows);
  } catch (err) {
    console.error('[C]平台列表查询失败:', err);
    response(res, 500, '服务器错误');
  }
};
