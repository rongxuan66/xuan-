const pool = require('../../utils/db');
const response = require('../../utils/response');

// 获取前台公开配置
exports.siteConfig = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT config_key, config_value FROM system_configs WHERE config_key IN ('site_name', 'site_description', 'service_wechat', 'pay_timeout_minutes')");
    const config = {};
    rows.forEach(r => { config[r.config_key] = r.config_value; });
    response(res, 0, 'success', {
      site_name: config.site_name || '账号商城',
      site_description: config.site_description || '账号自动发号系统',
      service_wechat: config.service_wechat || '',
      pay_timeout_minutes: parseInt(config.pay_timeout_minutes) || 15,
    });
  } catch (err) {
    console.error('[C]获取站点配置失败:', err);
    response(res, 500, '服务器错误');
  }
};
