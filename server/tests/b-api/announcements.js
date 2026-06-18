const { get, post, put, del } = require('../utils/http');
const { section, assert, info } = require('../utils/logger');

let createdAnnouncementId = null;

async function test() {
  section('B端 - 公告管理');

  // 公告列表
  let res = await get('/admin/api/announcements');
  assert(res.code === 0, 'GET /admin/api/announcements - 列表成功');
  assert(Array.isArray(res.data), 'data为数组');

  // 创建公告
  res = await post('/admin/api/announcements', {
    content: '这是一条测试公告内容',
    sort_order: 1,
    status: 1,
  });
  assert(res.code === 0, 'POST /admin/api/announcements - 创建成功', `id=${res.data?.id}`);
  createdAnnouncementId = res.data?.id;

  if (createdAnnouncementId) {
    // 公告详情
    res = await get(`/admin/api/announcements/${createdAnnouncementId}`);
    assert(res.code === 0, 'GET /admin/api/announcements/:id - 详情成功');
    assert(res.data?.content === '这是一条测试公告内容', '内容正确');

    // 更新公告
    res = await put(`/admin/api/announcements/${createdAnnouncementId}`, {
      content: '编辑后的公告内容',
      sort_order: 2,
      status: 0,
    });
    assert(res.code === 0, 'PUT /admin/api/announcements/:id - 更新成功', `code=${res.code}`);

    // 删除公告
    res = await del(`/admin/api/announcements/${createdAnnouncementId}`);
    assert(res.code === 0, 'DELETE /admin/api/announcements/:id - 删除成功', `code=${res.code}`);
    createdAnnouncementId = null;
  }

  // 创建公告 - 空内容
  res = await post('/admin/api/announcements', { content: '' });
  assert(res.code !== 0, 'POST /admin/api/announcements (空内容) - 返回错误', `code=${res.code}`);

  // 不存在的公告详情
  res = await get('/admin/api/announcements/99999');
  assert(res.code === 1001, 'GET /admin/api/announcements/99999 - 不存在返回1001', `code=${res.code}`);
}

module.exports = { test, getCreatedAnnouncementId: () => createdAnnouncementId };
