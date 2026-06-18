const pool = require('../../utils/db');
const response = require('../../utils/response');

// 商品列表
exports.list = async (req, res) => {
  try {
    const { platform, keyword, min_price, max_price, page = 1, pageSize = 12, sort = 'created_at', order = 'desc' } = req.query;

    const allowedSorts = ['created_at', 'price', 'stock'];
    const sortCol = allowedSorts.includes(sort) ? sort : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    let where = ['p.status = 1'];
    let params = [];

    if (platform) {
      where.push('p.platform = ?');
      params.push(platform);
    }
    if (keyword) {
      where.push('(p.title LIKE ? OR p.description LIKE ?)');
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (min_price) {
      where.push('p.price >= ?');
      params.push(Number(min_price));
    }
    if (max_price) {
      where.push('p.price <= ?');
      params.push(Number(max_price));
    }

    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const offset = (Number(page) - 1) * Number(pageSize);

    const [rows] = await pool.query(
      `SELECT p.*, (SELECT COUNT(*) FROM product_cards pc WHERE pc.product_id = p.id AND pc.status = 0) AS remain_stock, (SELECT COUNT(*) FROM product_cards pc WHERE pc.product_id = p.id) AS card_count FROM products p ${whereStr} ORDER BY p.${sortCol} ${sortOrder} LIMIT ? OFFSET ?`,
      [...params, Number(pageSize), offset]
    );

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total FROM products p ${whereStr}`,
      params
    );

    response(res, 0, 'success', {
      list: rows,
      total: countResult[0].total,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  } catch (err) {
    console.error('[C]产品列表查询失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 商品详情
exports.detail = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, (SELECT COUNT(*) FROM product_cards pc WHERE pc.product_id = p.id AND pc.status = 0) AS remain_stock, (SELECT COUNT(*) FROM product_cards pc WHERE pc.product_id = p.id) AS card_count FROM products p WHERE p.id = ? AND p.status = 1`,
      [req.params.id]
    );
    if (!rows.length) {
      return response(res, 1001, '商品不存在');
    }
    response(res, 0, 'success', rows[0]);
  } catch (err) {
    console.error('[C]产品详情查询失败:', err);
    response(res, 500, '服务器错误');
  }
};
