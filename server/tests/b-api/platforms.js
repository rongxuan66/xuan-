const { get, post, put, del } = require('../utils/http');
const { section, assert, info } = require('../utils/logger');

let createdPlatformId = null;

async function test() {
  section('B端 - 平台管理');

  // 平台列表
  let res = await get('/admin/api/platforms');
  assert(res.code === 0, 'GET /admin/api/platforms - 列表成功');
  assert(Array.isArray(res.data), 'data为数组');

  // 创建平台
  res = await post('/admin/api/platforms', {
    platform_key: 'test_platform_tmp',
    name: '测试平台',
    icon: '🧪',
    color: '#ff6600',
    sort_order: 99,
    status: 1,
  });
  assert(res.code === 0, 'POST /admin/api/platforms - 创建成功', `id=${res.data?.id}`);
  createdPlatformId = res.data?.id;

  if (createdPlatformId) {
    // 平台详情
    res = await get(`/admin/api/platforms/${createdPlatformId}`);
    assert(res.code === 0, 'GET /admin/api/platforms/:id - 详情成功');
    assert(res.data?.platform_key === 'test_platform_tmp', '平台标识正确');

    // 更新平台
    res = await put(`/admin/api/platforms/${createdPlatformId}`, {
      platform_key: 'test_platform_tmp',
      name: '测试平台_已编辑',
      icon: '🧪',
      color: '#00cc66',
      sort_order: 100,
      status: 1,
    });
    assert(res.code === 0, 'PUT /admin/api/platforms/:id - 更新成功', `code=${res.code}`);

    // 删除平台
    res = await del(`/admin/api/platforms/${createdPlatformId}`);
    assert(res.code === 0, 'DELETE /admin/api/platforms/:id - 删除成功', `code=${res.code}`);
    createdPlatformId = null;
  }

  // 不存在的平台详情
  res = await get('/admin/api/platforms/99999');
  assert(res.code === 1001, 'GET /admin/api/platforms/99999 - 不存在返回1001', `code=${res.code}`);

  // 创建平台 - 缺少参数
  res = await post('/admin/api/platforms', { name: '缺少key' });
  assert(res.code !== 0, 'POST /admin/api/platforms (缺少key) - 返回错误', `code=${res.code}`);
}

module.exports = { test, getCreatedPlatformId: () => createdPlatformId };
