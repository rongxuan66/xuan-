const pool = require('../../utils/db');
const response = require('../../utils/response');
const { generateToken } = require('../../utils/jwt');
const { md5Encrypt } = require('../../utils/md5Util');

// 手机号格式校验（中国大陆）
const isValidPhone = (phone) => /^1[3-9]\d{9}$/.test(phone);

// 注册
exports.register = async (req, res) => {
  try {
    const { phone, password, nickname } = req.body;
    if (!phone || !password) {
      return response(res, 1004, '手机号和密码不能为空');
    }
    if (!isValidPhone(phone)) {
      return response(res, 1004, '手机号格式不正确');
    }
    if (password.length < 6) {
      return response(res, 1004, '密码长度不能少于6位');
    }

    const [existing] = await pool.query('SELECT id, password FROM customers WHERE phone = ?', [phone]);
    if (existing.length) {
      // 已是注册用户
      if (existing[0].password) {
        return response(res, 1004, '该手机号已注册，请直接登录');
      }
      // 有下单记录但未注册 → 补充密码完成注册
      await pool.query("UPDATE customers SET password = ?, nickname = ?, status = 1 WHERE phone = ?", [
        md5Encrypt(password), (nickname || '').substring(0, 50), phone,
      ]);
      const [rows] = await pool.query('SELECT * FROM customers WHERE phone = ?', [phone]);
      const user = rows[0];
      const token = generateToken({ id: user.id, phone: user.phone });
      return response(res, 0, '注册成功', {
        token,
        user: { id: user.id, phone: user.phone, nickname: user.nickname, total_orders: user.total_orders, total_amount: user.total_amount },
      });
    }

    // 全新注册
    const [result] = await pool.query(
      'INSERT INTO customers (phone, password, nickname, status, total_orders, total_amount, first_order_at) VALUES (?, ?, ?, 1, 0, 0, NOW())',
      [phone, md5Encrypt(password), (nickname || '').substring(0, 50)]
    );
    const userId = result.insertId;
    const token = generateToken({ id: userId, phone });

    response(res, 0, '注册成功', {
      token,
      user: { id: userId, phone, nickname: (nickname || ''), total_orders: 0, total_amount: 0 },
    });
  } catch (err) {
    console.error('[C]注册失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 登录
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return response(res, 1004, '手机号和密码不能为空');
    }

    const [rows] = await pool.query('SELECT * FROM customers WHERE phone = ? AND status = 1', [phone]);
    if (!rows.length || !rows[0].password) {
      return response(res, 1002, '账号未注册或已被禁用');
    }

    const user = rows[0];
    if (md5Encrypt(password) !== user.password) {
      return response(res, 1002, '密码错误');
    }

    await pool.query('UPDATE customers SET last_order_at = IFNULL(last_order_at, NOW()) WHERE id = ?', [user.id]);

    const token = generateToken({ id: user.id, phone: user.phone });

    response(res, 0, '登录成功', {
      token,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        total_orders: user.total_orders,
        total_amount: user.total_amount,
      },
    });
  } catch (err) {
    console.error('[C]登录失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 获取个人信息
exports.profile = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, phone, nickname, total_orders, total_amount, status, first_order_at, last_order_at, created_at FROM customers WHERE id = ?',
      [req.userId]
    );
    if (!rows.length) {
      return response(res, 1001, '用户不存在');
    }
    response(res, 0, 'success', rows[0]);
  } catch (err) {
    console.error('[C]获取个人信息失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 更新个人信息
exports.updateProfile = async (req, res) => {
  try {
    const { nickname } = req.body;
    await pool.query('UPDATE customers SET nickname = ? WHERE id = ?', [
      (nickname || '').substring(0, 50), req.userId,
    ]);
    response(res, 0, '更新成功');
  } catch (err) {
    console.error('[C]更新个人信息失败:', err);
    response(res, 500, '服务器错误');
  }
};
