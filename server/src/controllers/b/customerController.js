const pool = require('../../utils/db');
const response = require('../../utils/response');

// 客户列表
exports.list = async (req, res) => {
  try {
    const { phone, page = 1, pageSize = 15 } = req.query;
    let where = ['1=1'];
    let params = [];

    if (phone) { where.push('phone LIKE ?'); params.push(`%${phone}%`); }

    const offset = (Number(page) - 1) * Number(pageSize);
    const [rows] = await pool.query(
      `SELECT * FROM customers WHERE ${where.join(' AND ')} ORDER BY last_order_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(pageSize), offset]
    );
    const [countResult] = await pool.query(`SELECT COUNT(*) AS total FROM customers WHERE ${where.join(' AND ')}`, params);

    response(res, 0, 'success', { list: rows, total: countResult[0].total, page: Number(page), pageSize: Number(pageSize) });
  } catch (err) {
    console.error('[B]客户列表查询失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 客户详情
exports.detail = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (!rows.length) return response(res, 1001, '客户不存在');
    response(res, 0, 'success', rows[0]);
  } catch (err) {
    console.error('[B]客户详情查询失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 客户订单列表
exports.orders = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM orders WHERE phone = (SELECT phone FROM customers WHERE id = ?) ORDER BY created_at DESC', [id]);
    response(res, 0, 'success', rows);
  } catch (err) {
    console.error('[B]客户订单查询失败:', err);
    response(res, 500, '服务器错误');
  }
};
