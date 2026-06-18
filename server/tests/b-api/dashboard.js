const { get } = require('../utils/http');
const { section, assert } = require('../utils/logger');

async function test() {
  section('B端 - 仪表盘');

  let res = await get('/admin/api/dashboard/stats');
  assert(res.code === 0, 'GET /admin/api/dashboard/stats - 返回code=0', `code=${res.code}`);
  assert(typeof res.data?.product_count === 'number', 'product_count字段正确');
  assert(typeof res.data?.order_count === 'number', 'order_count字段正确');
  assert(typeof res.data?.total_revenue === 'string' || typeof res.data?.total_revenue === 'number', 'total_revenue字段正确');
  assert(typeof res.data?.customer_count === 'number', 'customer_count字段正确');
  assert(Array.isArray(res.data?.recent_orders), 'recent_orders为数组');
  assert(Array.isArray(res.data?.order_trend), 'order_trend为数组');
}

module.exports = test;
