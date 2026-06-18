const pool = require('../../utils/db');
const response = require('../../utils/response');

// 获取所有配置
exports.list = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM system_configs ORDER BY id ASC');
    response(res, 0, 'success', rows);
  } catch (err) {
    console.error('[B]配置列表查询失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 更新配置（批量）
exports.update = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { configs } = req.body;
    if (!configs || !Array.isArray(configs)) {
      conn.release();
      return response(res, 1004, '参数格式错误');
    }

    for (const cfg of configs) {
      if (cfg.config_key) {
        await conn.query('INSERT INTO system_configs (config_key, config_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)', [cfg.config_key, cfg.config_value || '']);
      }
    }

    conn.release();
    response(res, 0, '保存成功');
  } catch (err) {
    conn.release();
    console.error('[B]配置更新失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 规范化支付方式：统一转数组
const normalizePayTypes = (val) => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [];
};

// 支付配置（保存为JSON）
exports.payConfig = async (req, res) => {
  try {
    const { api_url, pid, key, notify_url, return_url, pay_types, status } = req.body;
    const payConfig = { api_url, pid, key, notify_url, return_url, pay_types: normalizePayTypes(pay_types), status };

    const [rows] = await pool.query("SELECT id FROM system_configs WHERE config_key = 'pay_config'");
    if (rows.length) {
      await pool.query("UPDATE system_configs SET config_value = ? WHERE config_key = 'pay_config'", [JSON.stringify(payConfig)]);
    } else {
      await pool.query("INSERT INTO system_configs (config_key, config_value, remark) VALUES ('pay_config', ?, '支付配置')", [JSON.stringify(payConfig)]);
    }

    response(res, 0, '支付配置保存成功');
  } catch (err) {
    console.error('[B]支付配置保存失败:', err);
    response(res, 500, '服务器错误');
  }
};

// 获取支付配置
exports.getPayConfig = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM system_configs WHERE config_key = 'pay_config'");
    if (rows.length && rows[0].config_value) {
      const config = JSON.parse(rows[0].config_value);
      config.pay_types = normalizePayTypes(config.pay_types);
      return response(res, 0, 'success', config);
    }
    response(res, 0, 'success', null);
  } catch (err) {
    console.error('[B]获取支付配置失败:', err);
    response(res, 500, '服务器错误');
  }
};
