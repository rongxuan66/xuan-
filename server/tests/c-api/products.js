const { get, post } = require('../utils/http');
const { section, ok, fail, assert, info } = require('../utils/logger');

async function test() {
  section('C端 - 商品接口');

  // 商品列表
  let res = await get('/api/products');
  assert(res.code === 0, 'GET /api/products - 返回code=0', `code=${res.code}`);
  assert(res.data && Array.isArray(res.data.list), '列表数据list为数组', `total=${res.data?.total}`);
  assert(res.data && typeof res.data.total === 'number', '分页total字段正确');
  assert(res.data && res.data.page === 1 && res.data.pageSize === 12, '分页参数正确', `page=${res.data?.page} pageSize=${res.data?.pageSize}`);

  // 带筛选条件
  res = await get('/api/products', { platform: 'douyin' });
  assert(res.code === 0, 'GET /api/products?platform=douyin - 平台筛选');
  assert(res.data && Array.isArray(res.data.list), '筛选结果list为数组');

  // 排序
  res = await get('/api/products', { sort: 'price', order: 'asc' });
  assert(res.code === 0, 'GET /api/products?sort=price&order=asc - 按价格升序');

  // 分页
  res = await get('/api/products', { page: 1, pageSize: 5 });
  assert(res.code === 0, 'GET /api/products?page=1&pageSize=5 - 自定义分页');
  assert(res.data && res.data.pageSize === 5, 'pageSize=5');

  // 商品详情（不存在）
  res = await get('/api/products/99999');
  assert(res.code === 1001, 'GET /api/products/99999 - 不存在的商品返回1001', `code=${res.code} msg=${res.message}`);
}

module.exports = test;
