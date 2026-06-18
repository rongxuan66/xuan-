const pool = require('../../utils/db');
const response = require('../../utils/response');
const { generateToken } = require('../../utils/jwt');
const { md5Encrypt } = require('../../utils/md5Util');

// 登录
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return response(res, 1004, '用户名和密码不能为空');
    }

    const [rows] = await pool.query('SELECT * FROM admins WHERE username = ? AND status = 1', [username]);
    if (!rows.length) {
      return response(res, 1002, '账号不存在或已被禁用');
    }

    const admin = rows[0];
    if (md5Encrypt(password) !== admin.password) {
      return response(res, 1002, '密码错误');
    }

    const token = generateToken({ id: admin.id, role: admin.role, username: admin.username });

    await pool.query('UPDATE admins SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?', [
      req.ip, admin.id,
    ]);

    response(res, 0, '登录成功', {
      token,
      user: {
        id: admin.id,
        username: admin.username,
        nickname: admin.nickname,
        avatar: admin.avatar,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error('[B]登录失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 获取当前用户信息
exports.info = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, username, nickname, avatar, role, last_login_at, last_login_ip, created_at FROM admins WHERE id = ?', [req.adminId]);
    if (!rows.length) {
      return response(res, 1002, '用户不存在');
    }
    response(res, 0, 'success', rows[0]);
  } catch (err) {
    console.error('[B]获取用户信息失败:', err);
    response(res, 500, '服务器错误');
  }
};
