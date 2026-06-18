const pool = require('../../utils/db');
const response = require('../../utils/response');

// 商品列表
exports.list = async (req, res) => {
  try {
    const { platform, status, keyword, page = 1, pageSize = 15 } = req.query;
    let where = ['1=1'];
    let params = [];

    if (platform) { where.push('platform = ?'); params.push(platform); }
    if (status !== undefined && status !== '') { where.push('status = ?'); params.push(Number(status)); }
    if (keyword) { where.push('title LIKE ?'); params.push(`%${keyword}%`); }

    const offset = (Number(page) - 1) * Number(pageSize);
    const [rows] = await pool.query(
      `SELECT p.*, (SELECT COUNT(*) FROM product_cards pc WHERE pc.product_id = p.id AND pc.status = 0) AS remain_stock, (SELECT COUNT(*) FROM product_cards pc WHERE pc.product_id = p.id) AS card_count FROM products p WHERE ${where.join(' AND ')} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(pageSize), offset]
    );
    const [countResult] = await pool.query(`SELECT COUNT(*) AS total FROM products WHERE ${where.join(' AND ')}`, params);

    response(res, 0, 'success', { list: rows, total: countResult[0].total, page: Number(page), pageSize: Number(pageSize) });
  } catch (err) {
    console.error('[B]商品列表查询失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 商品详情
exports.detail = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!rows.length) return response(res, 1001, '商品不存在');
    response(res, 0, 'success', rows[0]);
  } catch (err) {
    console.error('[B]商品详情查询失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 创建商品
exports.create = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { title, platform, images, price, original_price, stock, description, usage_guide, status, cards, delivery_type, delivery_url, custom_fields } = req.body;

    if (!title || !platform) {
      conn.release();
      return response(res, 1004, '商品标题和平台不能为空');
    }

    const [result] = await conn.query(
      `INSERT INTO products (title, platform, images, price, original_price, stock, description, usage_guide, delivery_type, delivery_url, custom_fields, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, platform, JSON.stringify(images || []), price || 0, original_price || 0, stock || 0, description || '', usage_guide || '', delivery_type || 'card', delivery_url || '', JSON.stringify(custom_fields || []), status !== undefined ? status : 1]
    );

    // 插入卡号
    if (cards && Array.isArray(cards) && cards.length) {
      const cardValues = cards.map(c => [result.insertId, c.card_no || c, 0]);
      await conn.query('INSERT INTO product_cards (product_id, card_no, status) VALUES ?', [cardValues]);
    }

    conn.release();
    response(res, 0, '创建成功', { id: result.insertId });
  } catch (err) {
    conn.release();
    console.error('[B]商品创建失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 更新商品
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const allowed = ['title', 'platform', 'images', 'price', 'original_price', 'stock', 'description', 'usage_guide', 'delivery_type', 'delivery_url', 'custom_fields', 'status'];
    const sets = [];
    const values = [];
    allowed.forEach(f => {
      if (fields[f] !== undefined) {
        sets.push(`${f} = ?`);
        values.push((f === 'images' || f === 'custom_fields') ? JSON.stringify(fields[f]) : fields[f]);
      }
    });
    if (!sets.length) return response(res, 1004, '无更新字段');

    values.push(id);
    await pool.query(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`, values);

    response(res, 0, '更新成功');
  } catch (err) {
    console.error('[B]商品更新失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 删除商品
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM product_cards WHERE product_id = ?', [id]);
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    response(res, 0, '删除成功');
  } catch (err) {
    console.error('[B]商品删除失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 商品卡号列表
exports.cards = async (req, res) => {
  try {
    const { product_id } = req.params;
    const [rows] = await pool.query('SELECT * FROM product_cards WHERE product_id = ? ORDER BY id ASC', [product_id]);
    response(res, 0, 'success', rows);
  } catch (err) {
    console.error('[B]卡号列表查询失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 批量导入卡号
exports.importCards = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { cards } = req.body;

    if (!cards || !Array.isArray(cards) || !cards.length) {
      return response(res, 1004, '卡号数据不能为空');
    }

    const values = cards.map(c => [product_id, c.card_no || c, 0]);
    await pool.query('INSERT INTO product_cards (product_id, card_no, status) VALUES ?', [values]);

    // 更新商品库存
    const [cntResult] = await pool.query('SELECT COUNT(*) AS cnt FROM product_cards WHERE product_id = ? AND status = 0', [product_id]);
    await pool.query('UPDATE products SET stock = ? WHERE id = ?', [cntResult[0].cnt, product_id]);

    response(res, 0, `成功导入 ${cards.length} 条卡号`);
  } catch (err) {
    console.error('[B]卡号导入失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 删除卡号
exports.deleteCard = async (req, res) => {
  try {
    const { card_id } = req.params;
    const [cardRows] = await pool.query('SELECT * FROM product_cards WHERE id = ?', [card_id]);
    if (!cardRows.length) return response(res, 1001, '卡号不存在');

    await pool.query('DELETE FROM product_cards WHERE id = ?', [card_id]);

    // 更新商品库存
    const productId = cardRows[0].product_id;
    const [cntResult] = await pool.query('SELECT COUNT(*) AS cnt FROM product_cards WHERE product_id = ? AND status = 0', [productId]);
    await pool.query('UPDATE products SET stock = ? WHERE id = ?', [cntResult[0].cnt, productId]);

    response(res, 0, '删除成功');
  } catch (err) {
    console.error('[B]卡号删除失败:', err);
    response(res, 500, '服务器错误');
  }
};
