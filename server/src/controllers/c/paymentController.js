const pool = require('../../utils/db');
const response = require('../../utils/response');
const axios = require('axios');
const { md5Encrypt } = require('../../utils/md5Util');

// URL 变量替换
const substituteUrl = (url, customData) => {
  if (!url || !customData) return url;
  const data = typeof customData === 'string' ? JSON.parse(customData) : customData;
  return url.replace(/\{(\w+)\}/g, (_, varName) => {
    return data[varName] !== undefined ? encodeURIComponent(data[varName]) : _;
  });
};

// 调用交付API（URL接口调用模式，支付成功后自动请求）
const callDeliveryApi = async (url, customData, timeoutMs) => {
  const finalUrl = substituteUrl(url, customData);
  const startTime = Date.now();
  try {
    const res = await axios.get(finalUrl, {
      timeout: timeoutMs || 15000,
      headers: { 'User-Agent': 'RxWeb-Delivery/1.0' },
      validateStatus: () => true,
    });
    let body = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
    if (body.length > 2000) body = body.substring(0, 2000) + '...[截断]';
    const elapsed = Date.now() - startTime;
    return {
      success: true,
      httpStatus: res.status,
      responseBody: body,
      elapsedMs: elapsed,
      url: finalUrl,
    };
  } catch (err) {
    const elapsed = Date.now() - startTime;
    return {
      success: false,
      error: err.message || '请求失败',
      elapsedMs: elapsed,
      url: finalUrl,
    };
  }
};

// 规范化支付方式：字符串转数组
const normalizePayTypes = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

// 内部支付方式 → 网关支付方式（码支付标准：alipay / wxpay / qqpay）
const toGatewayPayType = (internalType) => {
  const map = { alipay: 'alipay', wechat: 'wxpay', qq: 'qqpay' };
  return map[internalType] || internalType;
};

// 标准化支付网关提交URL
// 码支付/易支付API始终在站点根路径 /submit.php，用户可能误填了平台前端地址
const normalizeSubmitUrl = (url) => {
  if (!url) return url;
  if (/\.php(\?.*)?$/.test(url)) return url;
  try {
    const u = new URL(url);
    return u.origin + '/submit.php';
  } catch {
    return url.replace(/\/+$/, '') + '/submit.php';
  }
};

// 获取支付配置
const getPayConfig = async () => {
  const [rows] = await pool.query("SELECT config_value FROM system_configs WHERE config_key = 'pay_config'");
  if (rows.length && rows[0].config_value) {
    const config = JSON.parse(rows[0].config_value);
    config.pay_types = normalizePayTypes(config.pay_types);
    return config;
  }
  return null;
};

// 获取支付二维码（模拟）
exports.getPayQrcode = async (req, res) => {
  try {
    const { order_no } = req.params;
    const [orders] = await pool.query('SELECT * FROM orders WHERE order_no = ?', [order_no]);
    if (!orders.length) {
      return response(res, 1001, '订单不存在');
    }
    const order = orders[0];
    if (order.status !== 'pending') {
      return response(res, 1006, '订单状态不正确');
    }

    const payConfig = await getPayConfig();
    if (!payConfig || !payConfig.api_url) {
      return response(res, 1007, '支付接口未配置');
    }

    // 构建支付请求参数（码支付/易支付标准）
    const params = {
      pid: payConfig.pid,
      type: toGatewayPayType(order.pay_method),
      out_trade_no: order.order_no,
      notify_url: payConfig.notify_url,
      return_url: payConfig.return_url,
      name: order.product_title,
      money: String(order.price),
      sign_type: 'MD5',
    };

    // 生成签名：剔除 sign、sign_type、空值，按 key 升序拼接
    const signParams = {};
    Object.keys(params).forEach(k => {
      if (k !== 'sign' && k !== 'sign_type' && params[k] !== '' && params[k] !== null && params[k] !== undefined) {
        signParams[k] = params[k];
      }
    });
    const signStr = Object.keys(signParams).sort().map(k => `${k}=${signParams[k]}`).join('&') + payConfig.key;
    params.sign = md5Encrypt(signStr);

    response(res, 0, 'success', { pay_url: normalizeSubmitUrl(payConfig.api_url), params });
  } catch (err) {
    console.error('[C]获取支付二维码失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 支付回调（GET/POST 均支持，码支付标准）
exports.notify = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const data = req.method === 'GET' ? req.query : req.body;
    const { out_trade_no, trade_no, trade_status, money, sign, pid, type, name } = data;

    if (trade_status !== 'TRADE_SUCCESS') {
      conn.release();
      return res.send('fail');
    }

    // 验证签名：剔除 sign、sign_type、空值
    const payConfig = await getPayConfig();
    if (payConfig) {
      const signParams = {};
      Object.keys(data).forEach(k => {
        if (k !== 'sign' && k !== 'sign_type' && data[k] !== '' && data[k] !== null && data[k] !== undefined) {
          signParams[k] = data[k];
        }
      });
      const signStr = Object.keys(signParams).sort().map(k => `${k}=${signParams[k]}`).join('&') + payConfig.key;
      if (md5Encrypt(signStr) !== sign) {
        conn.release();
        return res.send('fail');
      }
    }

    // 查找订单
    const [orders] = await conn.query('SELECT * FROM orders WHERE order_no = ? AND status = ?', [out_trade_no, 'pending']);
    if (!orders.length) {
      conn.release();
      return res.send('fail');
    }
    const order = orders[0];

    // 更新订单状态
    await conn.query("UPDATE orders SET status = 'paid', paid_at = NOW() WHERE id = ?", [order.id]);

    // 查询商品交付方式
    const [products] = await conn.query('SELECT delivery_type, delivery_url FROM products WHERE id = ?', [order.product_id]);
    const deliveryType = products.length ? products[0].delivery_type : 'card';

    if (deliveryType === 'url') {
      const apiResult = await callDeliveryApi(products[0].delivery_url, order.custom_data);
      await conn.query('UPDATE orders SET account = ? WHERE id = ?', [JSON.stringify(apiResult), order.id]);
    } else {
      // 分配卡号
      const [cards] = await conn.query('SELECT id, card_no FROM product_cards WHERE product_id = ? AND status = 0 LIMIT 1', [order.product_id]);
      if (cards.length) {
        await conn.query('UPDATE product_cards SET status = 1, order_id = ? WHERE id = ?', [order.id, cards[0].id]);
        await conn.query('UPDATE orders SET account = ? WHERE id = ?', [cards[0].card_no, order.id]);
        const [newCnt] = await conn.query('SELECT COUNT(*) AS cnt FROM product_cards WHERE product_id = ? AND status = 0', [order.product_id]);
        await conn.query('UPDATE products SET stock = ? WHERE id = ?', [newCnt[0].cnt, order.product_id]);
      }
    }

    conn.release();
    res.send('success');
  } catch (err) {
    conn.release();
    console.error('[C]支付回调处理失败:', err);
    console.error('[C]支付回调错误详情:', err.stack);
    res.send('fail');
  }
};

// 模拟支付（无网关时手动确认）
exports.simulatePay = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { order_no } = req.params;
    const [orders] = await conn.query('SELECT * FROM orders WHERE order_no = ?', [order_no]);
    if (!orders.length) {
      conn.release();
      return response(res, 1001, '订单不存在');
    }
    const order = orders[0];
    if (order.status === 'paid') {
      conn.release();
      return response(res, 1006, '订单已支付');
    }

    await conn.query("UPDATE orders SET status = 'paid', paid_at = NOW() WHERE id = ?", [order.id]);

    // 查询商品交付方式
    const [products] = await conn.query('SELECT delivery_type, delivery_url FROM products WHERE id = ?', [order.product_id]);
    const deliveryType = products.length ? products[0].delivery_type : 'card';

    if (deliveryType === 'url') {
      // URL 交付：调用API接口
      const apiResult = await callDeliveryApi(products[0].delivery_url, order.custom_data);
      await conn.query('UPDATE orders SET account = ? WHERE id = ?', [JSON.stringify(apiResult), order.id]);
    } else {
      // 卡密交付：分配卡号
      const [cards] = await conn.query('SELECT id, card_no FROM product_cards WHERE product_id = ? AND status = 0 LIMIT 1', [order.product_id]);
      if (cards.length) {
        await conn.query('UPDATE product_cards SET status = 1, order_id = ? WHERE id = ?', [order.id, cards[0].id]);
        await conn.query('UPDATE orders SET account = ? WHERE id = ?', [cards[0].card_no, order.id]);
        const [newCnt] = await conn.query('SELECT COUNT(*) AS cnt FROM product_cards WHERE product_id = ? AND status = 0', [order.product_id]);
        await conn.query('UPDATE products SET stock = ? WHERE id = ?', [newCnt[0].cnt, order.product_id]);
      }
    }

    conn.release();
    response(res, 0, '支付成功');
  } catch (err) {
    conn.release();
    console.error('[C]模拟支付失败:', err);
    response(res, 500, err.message || '服务器错误');
  }
};

// 查询订单支付状态
exports.queryOrderStatus = async (req, res) => {
  try {
    const { order_no } = req.params;
    const [rows] = await pool.query('SELECT order_no, status, paid_at FROM orders WHERE order_no = ?', [order_no]);
    if (!rows.length) {
      return response(res, 1001, '订单不存在');
    }
    response(res, 0, 'success', rows[0]);
  } catch (err) {
    console.error('[C]查询订单状态失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 支付同步跳转处理（return_url）
// 支付完成后网关将用户浏览器重定向到此，需验证签名并更新订单状态
exports.returnHandler = async (req, res) => {
  try {
    const data = req.method === 'GET' ? req.query : req.body;
    const { out_trade_no, trade_no, trade_status, money, sign, type, name } = data;

    // 验证签名
    const payConfig = await getPayConfig();
    if (payConfig) {
      const signParams = {};
      Object.keys(data).forEach(k => {
        if (k !== 'sign' && k !== 'sign_type' && data[k] !== '' && data[k] !== null && data[k] !== undefined) {
          signParams[k] = data[k];
        }
      });
      const signStr = Object.keys(signParams).sort().map(k => `${k}=${signParams[k]}`).join('&') + payConfig.key;
      if (md5Encrypt(signStr) !== sign) {
        return res.send('<html><body style="text-align:center;padding:60px;font-family:sans-serif"><h2 style="color:#ef4444">签名验证失败</h2><p>请勿伪造支付结果</p></body></html>');
      }
    }

    // 如果支付成功，更新订单
    if (trade_status === 'TRADE_SUCCESS' && out_trade_no) {
      const conn = await pool.getConnection();
      try {
        const [orders] = await conn.query('SELECT * FROM orders WHERE order_no = ? AND status = ?', [out_trade_no, 'pending']);
        if (orders.length) {
          const order = orders[0];
          await conn.query("UPDATE orders SET status = 'paid', paid_at = NOW() WHERE id = ?", [order.id]);
          // 查询商品交付方式
          const [products] = await conn.query('SELECT delivery_type, delivery_url FROM products WHERE id = ?', [order.product_id]);
          const deliveryType = products.length ? products[0].delivery_type : 'card';
          if (deliveryType === 'url') {
            const apiResult = await callDeliveryApi(products[0].delivery_url, order.custom_data);
            await conn.query('UPDATE orders SET account = ? WHERE id = ?', [JSON.stringify(apiResult), order.id]);
          } else {
            const [cards] = await conn.query('SELECT id, card_no FROM product_cards WHERE product_id = ? AND status = 0 LIMIT 1', [order.product_id]);
            if (cards.length) {
              await conn.query('UPDATE product_cards SET status = 1, order_id = ? WHERE id = ?', [order.id, cards[0].id]);
              await conn.query('UPDATE orders SET account = ? WHERE id = ?', [cards[0].card_no, order.id]);
              const [newCnt] = await conn.query('SELECT COUNT(*) AS cnt FROM product_cards WHERE product_id = ? AND status = 0', [order.product_id]);
              await conn.query('UPDATE products SET stock = ? WHERE id = ?', [newCnt[0].cnt, order.product_id]);
            }
          }
        }
        conn.release();
      } catch (e) {
        conn.release();
        console.error('[C]同步跳转更新订单失败:', e);
      }
    }

    // 返回HTML页面，自动跳转到订单详情
    const orderNo = out_trade_no || '';
    res.send(
      '<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>支付结果</title><style>body{font-family:sans-serif;text-align:center;padding:60px 20px;background:#f8fafc}' +
      (trade_status === 'TRADE_SUCCESS'
        ? 'h2{color:#16a34a}.card{background:#fff;border-radius:12px;padding:24px;max-width:400px;margin:16px auto;box-shadow:0 1px 3px rgba(0,0,0,.1)}'
        : 'h2{color:#ef4444}') +
      '</style></head><body>' +
      (trade_status === 'TRADE_SUCCESS'
        ? '<h2>支付成功</h2><div class="card"><p>订单号：' + orderNo + '</p><p style="color:#94a3b8;font-size:13px">网关交易号：' + (trade_no || '-') + '</p><p style="margin-top:16px"><a href="/order-detail.html?no=' + orderNo + '" style="color:#18a058;font-weight:600">查看订单详情</a></p><p style="font-size:12px;color:#94a3b8;margin-top:16px">如未自动跳转请点击上方链接</p></div><script>setTimeout(function(){location.href="/order-detail.html?no=' + orderNo + '";},3000);</script>'
        : '<h2>支付失败</h2><p style="color:#94a3b8">支付状态：' + (trade_status || '未知') + '</p>') +
      '</body></html>'
    );
  } catch (err) {
    console.error('[C]同步跳转处理失败:', err);
    res.send('<html><body style="text-align:center;padding:60px"><h2>系统错误</h2><p>请稍后重试</p></body></html>');
  }
};

// 获取公开支付配置（供前端动态渲染支付方式）
exports.getConfig = async (req, res) => {
  try {
    const payConfig = await getPayConfig();
    if (!payConfig || !payConfig.api_url || !payConfig.pid) {
      return response(res, 0, 'success', {
        configured: false,
        pay_types: ['wechat', 'alipay', 'qq'],
      });
    }
    response(res, 0, 'success', {
      configured: !!payConfig.status,
      pay_types: normalizePayTypes(payConfig.pay_types),
    });
  } catch (err) {
    console.error('[C]获取支付配置失败:', err);
    response(res, 500, '服务器错误');
  }
};
