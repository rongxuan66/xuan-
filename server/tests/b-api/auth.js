const { get, post, setToken, getToken } = require('../utils/http');
const { section, ok, fail, assert, info } = require('../utils/logger');
const chalk = require('chalk');

let adminToken = '';

async function test() {
  section('B端 - 管理员认证');

  // 登录 - 空参数
  let res = await post('/admin/api/auth/login', {});
  assert(res.code === 1004, 'POST /admin/api/auth/login (空body) - 参数不完整返回1004', `code=${res.code}`);

  // 登录 - 错误密码
  res = await post('/admin/api/auth/login', { username: 'admin', password: 'wrong' });
  assert(res.code === 1002, 'POST /admin/api/auth/login (错误密码) - 返回1002', `code=${res.code} msg=${res.message}`);

  // 登录 - 正确密码
  res = await post('/admin/api/auth/login', { username: 'admin', password: 'admin123' });
  assert(res.code === 0, 'POST /admin/api/auth/login (正确) - 登录成功', `code=${res.code}`);
  assert(!!res.data?.token, '返回JWT token');
  assert(res.data?.user?.username === 'admin', '返回用户信息');
  assert(res.data?.user?.role === 'admin', '角色为admin');

  adminToken = res.data?.token || '';
  setToken(adminToken);

  // 获取当前用户信息
  res = await get('/admin/api/auth/info');
  assert(res.code === 0, 'GET /admin/api/auth/info - 返回code=0', `code=${res.code}`);
  assert(res.data?.username === 'admin', '用户名正确');

  // 未登录访问
  setToken('');
  res = await get('/admin/api/auth/info');
  assert(res.code === 1002, 'GET /admin/api/auth/info (无token) - 未登录返回1002', `code=${res.code}`);

  // 无效token
  setToken('invalid_token_xxx');
  res = await get('/admin/api/auth/info');
  assert(res.code === 1002, 'GET /admin/api/auth/info (无效token) - 返回1002', `code=${res.code}`);

  setToken(adminToken);
}

module.exports = test;
