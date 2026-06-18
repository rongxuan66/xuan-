const { get, post, put, del } = require('../utils/http');
const { section, ok, fail, assert, info } = require('../utils/logger');

let createdProductId = null;
let createdCardId = null;

async function test() {
  section('B端 - 商品管理');

  // 商品列表
  let res = await get('/admin/api/products');
  assert(res.code === 0, 'GET /admin/api/products - 列表成功', `total=${res.data?.total}`);
  assert(res.data && Array.isArray(res.data.list), 'list为数组');
  assert(typeof res.data?.total === 'number', 'total字段正确');

  // 带筛选
  res = await get('/admin/api/products', { keyword: 'test' });
  assert(res.code === 0, 'GET /admin/api/products?keyword=test - 关键词筛选');

  // 创建商品
  res = await post('/admin/api/products', {
    title: '测试商品_抖音号',
    platform: 'douyin',
    category: '生活',
    price: 99.00,
    original_price: 199.00,
    stock: 10,
    followers: 50000,
    likes: 200000,
    gender: 'female',
    gender_male_ratio: 35,
    gender_female_ratio: 65,
    is_verified: 1,
    description: '这是一个测试商品',
    usage_guide: '使用注意事项',
    status: 1,
    cards: ['test_account_001----pass123----13800138000', 'test_account_002----pass456----13900139000'],
  });
  assert(res.code === 0, 'POST /admin/api/products - 创建成功', `code=${res.code}`);
  createdProductId = res.data?.id;
  if (createdProductId) {
    info(`创建商品ID: ${createdProductId}`);

    // 商品详情
    res = await get(`/admin/api/products/${createdProductId}`);
    assert(res.code === 0, 'GET /admin/api/products/:id - 详情成功');
    assert(res.data?.title === '测试商品_抖音号', '标题正确');

    // 更新商品
    res = await put(`/admin/api/products/${createdProductId}`, {
      title: '测试商品_抖音号_已编辑',
      platform: 'douyin',
      category: '生活',
      price: 88.00,
      original_price: 199.00,
      stock: 10,
      followers: 50000,
      likes: 200000,
      gender: 'female',
      gender_male_ratio: 35,
      gender_female_ratio: 65,
      is_verified: 1,
      description: '编辑后的描述',
      usage_guide: '',
      status: 1,
    });
    assert(res.code === 0, 'PUT /admin/api/products/:id - 更新成功', `code=${res.code}`);

    // 卡号列表
    res = await get(`/admin/api/products/${createdProductId}/cards`);
    assert(res.code === 0, 'GET /admin/api/products/:pid/cards - 卡号列表', `count=${res.data?.length}`);
    createdCardId = res.data?.length ? res.data[0].id : null;

    // 导入卡号
    res = await post(`/admin/api/products/${createdProductId}/cards`, {
      cards: ['test_account_003----pass789'],
    });
    assert(res.code === 0, 'POST /admin/api/products/:pid/cards - 导入卡号', `msg=${res.message}`);

    // 删除卡号
    if (createdCardId) {
      res = await del(`/admin/api/products/cards/${createdCardId}`);
      assert(res.code === 0, `DELETE /admin/api/products/cards/${createdCardId} - 删除卡号`, `code=${res.code}`);
    }
  }

  // 创建商品 - 缺少必要参数
  res = await post('/admin/api/products', { title: '' });
  assert(res.code !== 0, 'POST /admin/api/products (参数不完整) - 返回错误', `code=${res.code}`);

  // 不存在的商品详情
  res = await get('/admin/api/products/99999');
  assert(res.code === 1001, 'GET /admin/api/products/99999 - 不存在返回1001', `code=${res.code}`);
}

module.exports = { test, getCreatedProductId: () => createdProductId };
