const pool = require('../../utils/db');
const response = require('../../utils/response');

// 公告列表
exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, content FROM announcements WHERE status = 1 ORDER BY sort_order ASC');
    response(res, 0, 'success', rows);
  } catch (err) {
    console.error('[C]公告列表查询失败:', err);
    response(res, 500, '服务器错误');
  }
};
