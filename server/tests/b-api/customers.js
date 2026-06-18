const { get } = require('../utils/http');
const { section, assert } = require('../utils/logger');

async function test() {
  section('B端 - 客户管理');

  // 客户列表
  let res = await get('/admin/api/customers');
  assert(res.code === 0, 'GET /admin/api/customers - 列表成功', `total=${res.data?.total}`);
  assert(res.data && Array.isArray(res.data.list), 'list为数组');
  assert(typeof res.data?.total === 'number', 'total字段正确');

  // 带筛选
  res = await get('/admin/api/customers', { phone: '138' });
  assert(res.code === 0, 'GET /admin/api/customers?phone=138 - 手机号筛选');

  // 分页
  res = await get('/admin/api/customers', { page: 1, pageSize: 5 });
  assert(res.code === 0, 'GET /admin/api/customers?page=1&pageSize=5 - 分页');
  assert(res.data?.pageSize === 5, 'pageSize=5');

  // 不存在的客户详情
  res = await get('/admin/api/customers/99999');
  assert(res.code === 1001, 'GET /admin/api/customers/99999 - 不存在返回1001', `code=${res.code}`);
}

module.exports = test;
