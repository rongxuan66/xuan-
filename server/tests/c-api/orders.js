const { get, post } = require('../utils/http');
const { section, ok, fail, assert, info } = require('../utils/logger');

let createdOrderNo = '';

async function test() {
  section('C端 - 订单接口');

  // 创建订单 - 缺少参数
  let res = await post('/api/orders', {});
  assert(res.code === 1004, 'POST /api/orders (空body) - 参数不完整返回1004', `code=${res.code}`);

  // 创建订单 - 不存在的商品
  res = await post('/api/orders', { product_id: 99999, phone: '13800138000', pay_method: 'wechat' });
  assert(res.code === 1001, 'POST /api/orders (不存在商品) - 返回1001', `code=${res.code}`);

  // 查询订单 - 不存在
  res = await get('/api/orders/RX_NOT_EXIST');
  assert(res.code === 1001, 'GET /api/orders/RX_NOT_EXIST - 不存在的订单返回1001', `code=${res.code}`);
}

module.exports = test;
