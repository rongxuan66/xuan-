const { get, put } = require('../utils/http');
const { section, assert, info } = require('../utils/logger');

async function test() {
  section('B端 - 系统配置');

  // 配置列表
  let res = await get('/admin/api/configs');
  assert(res.code === 0, 'GET /admin/api/configs - 列表成功');
  assert(Array.isArray(res.data), 'data为数组');

  // 更新配置
  res = await put('/admin/api/configs', {
    configs: [
      { config_key: 'site_name', config_value: '测试站点名称' },
      { config_key: 'service_wechat', config_value: 'test_wechat' },
    ],
  });
  assert(res.code === 0, 'PUT /admin/api/configs - 更新成功', `code=${res.code}`);

  // 恢复原值
  await put('/admin/api/configs', {
    configs: [
      { config_key: 'site_name', config_value: '账号商城' },
      { config_key: 'service_wechat', config_value: 'kefu001' },
    ],
  });

  // 支付配置 - 获取
  res = await get('/admin/api/configs/pay');
  assert(res.code === 0, 'GET /admin/api/configs/pay - 获取支付配置', `code=${res.code}`);

  // 支付配置 - 保存
  res = await put('/admin/api/configs/pay', {
    api_url: 'https://pay.example.com/submit.php',
    pid: '1001',
    key: 'test_secret_key',
    notify_url: 'http://localhost:3000/api/payment/notify',
    return_url: 'http://localhost:8080/pay-result',
    pay_types: ['wechat', 'alipay'],
    status: 1,
  });
  assert(res.code === 0, 'PUT /admin/api/configs/pay - 保存支付配置', `code=${res.code}`);

  // 验证保存结果
  res = await get('/admin/api/configs/pay');
  assert(res.code === 0 && res.data?.api_url === 'https://pay.example.com/submit.php', '验证支付配置已保存');
}

module.exports = test;
