const pool = require('../../utils/db');
const response = require('../../utils/response');

// 公告列表
exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM announcements ORDER BY sort_order ASC');
    response(res, 0, 'success', rows);
  } catch (err) {
    console.error('[B]公告列表查询失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 公告详情
exports.detail = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM announcements WHERE id = ?', [req.params.id]);
    if (!rows.length) return response(res, 1001, '公告不存在');
    response(res, 0, 'success', rows[0]);
  } catch (err) {
    console.error('[B]公告详情查询失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 创建公告
exports.create = async (req, res) => {
  try {
    const { content, sort_order, status } = req.body;
    if (!content) return response(res, 1004, '公告内容不能为空');
    const [result] = await pool.query(
      'INSERT INTO announcements (content, sort_order, status) VALUES (?, ?, ?)',
      [content, sort_order || 0, status !== undefined ? status : 1]
    );
    response(res, 0, '创建成功', { id: result.insertId });
  } catch (err) {
    console.error('[B]公告创建失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 更新公告
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, sort_order, status } = req.body;
    await pool.query('UPDATE announcements SET content=?, sort_order=?, status=? WHERE id=?', [content, sort_order || 0, status !== undefined ? status : 1, id]);
    response(res, 0, '更新成功');
  } catch (err) {
    console.error('[B]公告更新失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 删除公告
exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    response(res, 0, '删除成功');
  } catch (err) {
    console.error('[B]公告删除失败:', err);
    response(res, 500, '服务器错误');
  }
};
