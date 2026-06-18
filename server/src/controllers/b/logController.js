const pool = require('../../utils/db');
const response = require('../../utils/response');

// 操作日志列表
exports.list = async (req, res) => {
  try {
    const { admin_name, action, start_date, end_date, page = 1, pageSize = 20 } = req.query;
    let where = ['1=1'];
    let params = [];

    if (admin_name) { where.push('admin_name LIKE ?'); params.push(`%${admin_name}%`); }
    if (action) { where.push('action = ?'); params.push(action); }
    if (start_date) { where.push('created_at >= ?'); params.push(start_date); }
    if (end_date) { where.push('created_at <= ?'); params.push(end_date + ' 23:59:59'); }

    const offset = (Number(page) - 1) * Number(pageSize);
    const [rows] = await pool.query(
      `SELECT * FROM operation_logs WHERE ${where.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(pageSize), offset]
    );
    const [countResult] = await pool.query(`SELECT COUNT(*) AS total FROM operation_logs WHERE ${where.join(' AND ')}`, params);

    response(res, 0, 'success', { list: rows, total: countResult[0].total, page: Number(page), pageSize: Number(pageSize) });
  } catch (err) {
    console.error('[B]操作日志查询失败:', err);
    response(res, 500, '服务器错误');
  }
};
