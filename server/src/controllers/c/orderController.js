const pool = require('../../utils/db');
const response = require('../../utils/response');

// 生成订单号
const genOrderNo = () => {
  const now = new Date();
  const d = now.toISOString().slice(0, 10).replace(/-/g, '');
  const t = String(now.getHours()).padStart(2, '0') + String(now.getMinutes()).padStart(2, '0') + String(now.getSeconds()).padStart(2, '0');
  const r = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RX${d}${t}${r}`;
};

// 我的订单列表（需登录）
exports.list = async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);

    const [rows] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [req.userId, Number(pageSize), offset]
    );
    const [countResult] = await pool.query(
      'SELECT COUNT(*) AS total FROM orders WHERE user_id = ?',
      [req.userId]
    );

    response(res, 0, 'success', {
      list: rows,
      total: countResult[0].total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (err) {
    console.error('[C]订单列表查询失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 创建订单
exports.create = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { product_id, phone, pay_method, custom_data } = req.body;

    if (!product_id || !pay_method) {
      conn.release();
      return response(res, 1004, '参数不完整');
    }

    // 查询商品
    const [products] = await conn.query('SELECT * FROM products WHERE id = ? AND status = 1', [product_id]);
    if (!products.length) {
      conn.release();
      return response(res, 1001, '商品不存在或已下架');
    }
    const product = products[0];

    // 已登录用户自动使用账户手机号，URL交付型商品不需要手机号
    let orderPhone = phone;
    if (req.userId && req.userPhone) {
      orderPhone = req.userPhone;
    }
    if (!orderPhone && product.delivery_type !== 'url') {
      conn.release();
      return response(res, 1004, '手机号不能为空');
    }

    // 检查库存：优先用 product.stock，有卡号时检查可用卡号
    if (Number(product.stock) <= 0) {
      conn.release();
      return response(res, 1005, '库存不足');
    }
    const [cards] = await conn.query('SELECT COUNT(*) AS cnt FROM product_cards WHERE product_id = ?', [product_id]);
    if (product.delivery_type !== 'url' && cards[0].cnt > 0) {
      const [avail] = await conn.query('SELECT COUNT(*) AS cnt FROM product_cards WHERE product_id = ? AND status = 0', [product_id]);
      if (avail[0].cnt <= 0) {
        conn.release();
        return response(res, 1005, '库存不足');
      }
    }

    const orderNo = genOrderNo();
    const images = product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [];
    const productImage = images.length ? images[0] : '';

    const [orderResult] = await conn.query(
      `INSERT INTO orders (order_no, product_id, product_title, product_image, price, phone, user_id, pay_method, custom_data, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [orderNo, product_id, product.title, productImage, product.price, orderPhone, req.userId || null, pay_method, custom_data ? JSON.stringify(custom_data) : null]
    );

    // 有卡号商品在支付成功后分配卡号，无卡号商品直接减库存
    if (cards[0].cnt === 0) {
      await conn.query('UPDATE products SET stock = stock - 1 WHERE id = ? AND stock > 0', [product_id]);
    }

    // 更新客户统计
    await conn.query(
      `INSERT INTO customers (phone, total_orders, total_amount, first_order_at, last_order_at) VALUES (?, 1, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE total_orders = total_orders + 1, total_amount = total_amount + ?, last_order_at = NOW()`,
      [orderPhone, product.price, product.price]
    );

    conn.release();
    response(res, 0, '下单成功', { order_no: orderNo, price: product.price });
  } catch (err) {
    conn.release();
    console.error('[C]订单创建失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 查询订单
exports.detail = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT o.*, p.custom_fields AS product_custom_fields, p.delivery_type AS delivery_type FROM orders o LEFT JOIN products p ON o.product_id = p.id WHERE o.order_no = ?', [id]);
    if (!rows.length) {
      return response(res, 1001, '订单不存在');
    }
    const order = rows[0];

    // 如果已登录，校验订单是否属于当前用户
    if (req.userId && order.user_id && order.user_id !== req.userId) {
      return response(res, 1003, '无权查看该订单');
    }

    response(res, 0, 'success', order);
  } catch (err) {
    console.error('[C]订单查询失败:', err);
    response(res, 500, '服务器错误');
  }
};
