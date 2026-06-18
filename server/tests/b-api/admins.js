const { get, post, put, del } = require('../utils/http');
const { section, assert, info } = require('../utils/logger');

let createdAdminId = null;

async function test() {
  section('B端 - 管理员管理');

  // 管理员列表
  let res = await get('/admin/api/admins');
  assert(res.code === 0, 'GET /admin/api/admins - 列表成功');
  assert(Array.isArray(res.data), 'data为数组');

  // 创建管理员
  res = await post('/admin/api/admins', {
    username: 'test_editor_tmp',
    password: '123456',
    nickname: '测试编辑',
    role: 'editor',
  });
  assert(res.code === 0, 'POST /admin/api/admins - 创建成功', `code=${res.code}`);
  createdAdminId = res.data?.id; // create doesn't return id directly, skip if null
  if (!createdAdminId) {
    // find the created admin
    const listRes = await get('/admin/api/admins');
    const found = listRes.data?.find(a => a.username === 'test_editor_tmp');
    if (found) createdAdminId = found.id;
  }

  if (createdAdminId) {
    // 更新管理员
    res = await put(`/admin/api/admins/${createdAdminId}`, {
      username: 'test_editor_tmp',
      nickname: '测试编辑_已改',
      role: 'editor',
      status: 1,
    });
    assert(res.code === 0, 'PUT /admin/api/admins/:id - 更新成功', `code=${res.code}`);

    // 重置密码
    res = await put(`/admin/api/admins/${createdAdminId}`, {
      username: 'test_editor_tmp',
      password: 'newpassword',
      nickname: '测试编辑_已改',
      role: 'editor',
      status: 1,
    });
    assert(res.code === 0, 'PUT /admin/api/admins/:id (重置密码) - 成功', `code=${res.code}`);

    // 删除管理员
    res = await del(`/admin/api/admins/${createdAdminId}`);
    assert(res.code === 0, 'DELETE /admin/api/admins/:id - 删除成功', `code=${res.code}`);
    createdAdminId = null;
  }

  // 创建管理员 - 缺少参数
  res = await post('/admin/api/admins', { username: '' });
  assert(res.code !== 0, 'POST /admin/api/admins (空用户名) - 返回错误', `code=${res.code}`);

  // 重复用户名
  res = await post('/admin/api/admins', { username: 'admin', password: '123', nickname: '重复', role: 'editor' });
  assert(res.code !== 0, 'POST /admin/api/admins (重复用户名) - 返回错误', `code=${res.code}`);
}

module.exports = { test, getCreatedAdminId: () => createdAdminId };
