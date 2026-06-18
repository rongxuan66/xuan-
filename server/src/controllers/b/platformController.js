const pool = require('../../utils/db');
const response = require('../../utils/response');

// 平台列表
exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM platforms ORDER BY sort_order ASC');
    response(res, 0, 'success', rows);
  } catch (err) {
    console.error('[B]平台列表查询失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 平台详情
exports.detail = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM platforms WHERE id = ?', [req.params.id]);
    if (!rows.length) return response(res, 1001, '平台不存在');
    response(res, 0, 'success', rows[0]);
  } catch (err) {
    console.error('[B]平台详情查询失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 创建平台
exports.create = async (req, res) => {
  try {
    const { platform_key, name, icon, color, sort_order, status } = req.body;
    if (!platform_key || !name) {
      return response(res, 1004, '平台标识和名称不能为空');
    }
    const [result] = await pool.query(
      'INSERT INTO platforms (platform_key, name, icon, color, sort_order, status) VALUES (?, ?, ?, ?, ?, ?)',
      [platform_key, name, icon || '', color || '#f0f4ff', sort_order || 0, status !== undefined ? status : 1]
    );
    response(res, 0, '创建成功', { id: result.insertId });
  } catch (err) {
    console.error('[B]平台创建失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 更新平台
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { platform_key, name, icon, color, sort_order, status } = req.body;
    await pool.query(
      'UPDATE platforms SET platform_key=?, name=?, icon=?, color=?, sort_order=?, status=? WHERE id=?',
      [platform_key, name, icon || '', color || '#f0f4ff', sort_order || 0, status !== undefined ? status : 1, id]
    );
    response(res, 0, '更新成功');
  } catch (err) {
    console.error('[B]平台更新失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 删除平台
exports.remove = async (req, res) => {
  try {
    await pool.query('DELETE FROM platforms WHERE id = ?', [req.params.id]);
    response(res, 0, '删除成功');
  } catch (err) {
    console.error('[B]平台删除失败:', err);
    response(res, 500, '服务器错误');
  }
};
