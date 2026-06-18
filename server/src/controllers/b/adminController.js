const pool = require('../../utils/db');
const response = require('../../utils/response');
const { md5Encrypt } = require('../../utils/md5Util');

// 管理员列表
exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, nickname, avatar, role, status, last_login_at, created_at FROM admins ORDER BY id ASC');
    response(res, 0, 'success', rows);
  } catch (err) {
    console.error('[B]管理员列表查询失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 创建管理员
exports.create = async (req, res) => {
  try {
    const { username, password, nickname, role } = req.body;
    if (!username || !password) {
      return response(res, 1004, '用户名和密码不能为空');
    }

    const [exist] = await pool.query('SELECT id FROM admins WHERE username = ?', [username]);
    if (exist.length) return response(res, 1008, '用户名已存在');

    await pool.query('INSERT INTO admins (username, password, nickname, role) VALUES (?, ?, ?, ?)', [
      username, md5Encrypt(password), nickname || username, role || 'editor',
    ]);

    response(res, 0, '创建成功');
  } catch (err) {
    console.error('[B]管理员创建失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 更新管理员
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, nickname, role, status } = req.body;

    const updateFields = ['username=?, nickname=?, role=?, status=?'];
    const params = [username, nickname || username, role || 'editor', status !== undefined ? status : 1];

    if (password) {
      updateFields.push('password=?');
      params.push(md5Encrypt(password));
    }

    params.push(id);
    await pool.query(`UPDATE admins SET ${updateFields.join(', ')} WHERE id=?`, params);

    response(res, 0, '更新成功');
  } catch (err) {
    console.error('[B]管理员更新失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 删除管理员
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM admins WHERE id = ?', [id]);
    if (!rows.length) return response(res, 1001, '管理员不存在');
    if (rows[0].role === 'admin') {
      const [adminCount] = await pool.query("SELECT COUNT(*) AS cnt FROM admins WHERE role = 'admin'");
      if (adminCount[0].cnt <= 1) return response(res, 1009, '不能删除最后一个超级管理员');
    }
    await pool.query('DELETE FROM admins WHERE id = ?', [id]);
    response(res, 0, '删除成功');
  } catch (err) {
    console.error('[B]管理员删除失败:', err);
    response(res, 500, '服务器错误');
  }
};
