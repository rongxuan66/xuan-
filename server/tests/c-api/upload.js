const { get } = require('../utils/http');
const { section, assert } = require('../utils/logger');

async function test() {
  section('C端 - 上传凭证');

  let res = await get('/api/upload/token');
  assert(res.code === 0, 'GET /api/upload/token - 返回code=0', `code=${res.code}`);
  assert(res.data && typeof res.data.token === 'string', '返回token字段');
  assert(res.data && typeof res.data.domain === 'string', '返回domain字段');
}

module.exports = test;
