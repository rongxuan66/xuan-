const { get } = require('../utils/http');
const { section, assert } = require('../utils/logger');

async function test() {
  section('C端 - 公告接口');

  let res = await get('/api/announcements');
  assert(res.code === 0, 'GET /api/announcements - 返回code=0', `code=${res.code}`);
  assert(Array.isArray(res.data), 'data为数组');
}

module.exports = test;
