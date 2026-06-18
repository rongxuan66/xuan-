const { get } = require('../utils/http');
const { section, assert, info } = require('../utils/logger');

async function test() {
  section('C端 - 支付接口');

  // 支付二维码 - 不存在的订单
  let res = await get('/api/payment/qrcode/RX_NOT_EXIST');
  assert(res.code === 1001, 'GET /api/payment/qrcode/:no (不存在订单) - 返回1001', `code=${res.code}`);

  // 订单状态查询 - 不存在的订单
  res = await get('/api/payment/status/RX_NOT_EXIST');
  assert(res.code === 1001, 'GET /api/payment/status/:no (不存在订单) - 返回1001', `code=${res.code}`);

  // 支付回调 - 无参数
  // notify 接口验证签名失败返回 fail 文本，由支付平台调用，不测试
  info('支付回调 /api/payment/notify 由支付平台调用，跳过');
}

module.exports = test;
