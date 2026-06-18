const { get, post } = require('../utils/http');
const { section, assert, info } = require('../utils/logger');

async function test() {
  section('B端 - 订单管理');

  // 订单列表
  let res = await get('/admin/api/orders');
  assert(res.code === 0, 'GET /admin/api/orders - 列表成功', `total=${res.data?.total}`);
  assert(res.data && Array.isArray(res.data.list), 'list为数组');
  assert(typeof res.data?.total === 'number', 'total字段正确');

  // 带筛选
  res = await get('/admin/api/orders', { status: 'paid' });
  assert(res.code === 0, 'GET /admin/api/orders?status=paid - 状态筛选');

  res = await get('/admin/api/orders', { pay_method: 'wechat' });
  assert(res.code === 0, 'GET /admin/api/orders?pay_method=wechat - 支付方式筛选');

  // 分页
  res = await get('/admin/api/orders', { page: 1, pageSize: 10 });
  assert(res.code === 0, 'GET /admin/api/orders?page=1&pageSize=10 - 分页');
  assert(res.data?.pageSize === 10, 'pageSize=10');

  // 导出订单
  res = await get('/admin/api/orders/export');
  assert(res.code === 0, 'GET /admin/api/orders/export - 导出成功');
  assert(Array.isArray(res.data), '导出数据为数组');

  // 不存在的订单详情
  res = await get('/admin/api/orders/99999');
  assert(res.code === 1001, 'GET /admin/api/orders/99999 - 不存在返回1001', `code=${res.code}`);

  // 手工发货 - 不存在的订单
  res = await post('/admin/api/orders/99999/deliver', { account: 'test', password: 'pwd' });
  assert(res.code !== 0, 'POST /admin/api/orders/99999/deliver - 不存在订单发货失败', `code=${res.code}`);

  // 退款 - 不存在的订单
  res = await post('/admin/api/orders/99999/refund');
  assert(res.code !== 0, 'POST /admin/api/orders/99999/refund - 不存在订单退款失败', `code=${res.code}`);
}

module.exports = test;
