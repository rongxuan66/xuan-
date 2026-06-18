const pool = require('../../utils/db');
const response = require('../../utils/response');

// 订单列表
exports.list = async (req, res) => {
  try {
    const { order_no, phone, status, pay_method, start_date, end_date, page = 1, pageSize = 15 } = req.query;
    let where = ['1=1'];
    let params = [];

    if (order_no) { where.push('o.order_no LIKE ?'); params.push(`%${order_no}%`); }
    if (phone) { where.push('o.phone LIKE ?'); params.push(`%${phone}%`); }
    if (status) { where.push('o.status = ?'); params.push(status); }
    if (pay_method) { where.push('o.pay_method = ?'); params.push(pay_method); }
    if (start_date) { where.push('o.created_at >= ?'); params.push(start_date); }
    if (end_date) { where.push('o.created_at <= ?'); params.push(end_date + ' 23:59:59'); }

    const offset = (Number(page) - 1) * Number(pageSize);
    const [rows] = await pool.query(
      `SELECT o.*, pc.card_no FROM orders o LEFT JOIN product_cards pc ON pc.order_id = o.id WHERE ${where.join(' AND ')} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(pageSize), offset]
    );
    const [countResult] = await pool.query(`SELECT COUNT(*) AS total FROM orders o WHERE ${where.join(' AND ')}`, params);

    response(res, 0, 'success', { list: rows, total: countResult[0].total, page: Number(page), pageSize: Number(pageSize) });
  } catch (err) {
    console.error('[B]订单列表查询失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 订单详情
exports.detail = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT o.*, pc.card_no FROM orders o LEFT JOIN product_cards pc ON pc.order_id = o.id WHERE o.id = ?', [req.params.id]);
    if (!rows.length) return response(res, 1001, '订单不存在');
    response(res, 0, 'success', rows[0]);
  } catch (err) {
    console.error('[B]订单详情查询失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 手工发货
exports.deliver = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const { account, password } = req.body;

    const [orders] = await conn.query('SELECT * FROM orders WHERE id = ? AND status = ?', [id, 'paid']);
    if (!orders.length) {
      conn.release();
      return response(res, 1006, '订单状态不正确，仅已支付订单可发货');
    }

    await conn.query("UPDATE orders SET account = ?, password = ?, status = 'paid' WHERE id = ?", [account || '', password || '', id]);

    conn.release();
    response(res, 0, '发货成功');
  } catch (err) {
    conn.release();
    console.error('[B]发货失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 退款
exports.refund = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const [orders] = await conn.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (!orders.length) {
      conn.release();
      return response(res, 1001, '订单不存在');
    }
    if (orders[0].status !== 'paid') {
      conn.release();
      return response(res, 1006, '仅已支付订单可退款');
    }

    // 释放卡号
    const [cards] = await conn.query('SELECT id FROM product_cards WHERE order_id = ?', [id]);
    if (cards.length) {
      await conn.query('UPDATE product_cards SET status = 0, order_id = 0 WHERE id = ?', [cards[0].id]);
    }

    await conn.query("UPDATE orders SET status = 'refunded' WHERE id = ?", [id]);

    conn.release();
    response(res, 0, '退款成功');
  } catch (err) {
    conn.release();
    console.error('[B]退款失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 手动确认收款
exports.confirmPayment = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { id } = req.params;
    const [orders] = await conn.query('SELECT * FROM orders WHERE id = ?', [id]);
    if (!orders.length) {
      conn.release();
      return response(res, 1001, '订单不存在');
    }
    const order = orders[0];
    if (order.status === 'paid') {
      conn.release();
      return response(res, 1006, '订单已支付');
    }

    await conn.query("UPDATE orders SET status = 'paid', paid_at = NOW() WHERE id = ?", [id]);

    // 分配卡号
    const [cards] = await conn.query('SELECT id FROM product_cards WHERE product_id = ? AND status = 0 LIMIT 1', [order.product_id]);
    if (cards.length) {
      await conn.query('UPDATE product_cards SET status = 1, order_id = ? WHERE id = ?', [order.id, cards[0].id]);
    }

    conn.release();
    response(res, 0, '确认收款成功');
  } catch (err) {
    conn.release();
    console.error('[B]确认收款失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 导出订单
exports.exportOrders = async (req, res) => {
  try {
    const { status, start_date, end_date } = req.query;
    let where = ['1=1'];
    let params = [];

    if (status) { where.push('status = ?'); params.push(status); }
    if (start_date) { where.push('created_at >= ?'); params.push(start_date); }
    if (end_date) { where.push('created_at <= ?'); params.push(end_date + ' 23:59:59'); }

    const [rows] = await pool.query(
      `SELECT order_no, product_title, price, phone, pay_method, status, account, password, paid_at, created_at FROM orders WHERE ${where.join(' AND ')} ORDER BY created_at DESC`,
      params
    );

    response(res, 0, 'success', rows);
  } catch (err) {
    console.error('[B]订单导出失败:', err);
    response(res, 500, '服务器错误');
  }
};
