const { get } = require('../utils/http');
const { section, assert } = require('../utils/logger');

async function test() {
  section('B端 - 操作日志');

  // 日志列表
  let res = await get('/admin/api/logs');
  assert(res.code === 0, 'GET /admin/api/logs - 列表成功', `total=${res.data?.total}`);
  assert(res.data && Array.isArray(res.data.list), 'list为数组');
  assert(typeof res.data?.total === 'number', 'total字段正确');

  // 分页
  res = await get('/admin/api/logs', { page: 1, pageSize: 10 });
  assert(res.code === 0, 'GET /admin/api/logs?page=1&pageSize=10 - 分页');
  assert(res.data?.pageSize === 10, 'pageSize=10');

  // 带筛选
  res = await get('/admin/api/logs', { action: 'login' });
  assert(res.code === 0, 'GET /admin/api/logs?action=login - 操作类型筛选');
}

module.exports = test;
