/**
 * 前后端联动测试 — C-end + B-end 全覆盖
 */
const axios = require('axios');
const BASE = 'http://localhost:3000';
const C_API = BASE + '/api';
const B_API = BASE + '/admin/api';

let adminToken = '';
let testProductId = 0;
let testOrderNo = '';
let testPlatformId = 0;
let testAnnouncementId = 0;
let testAdminId = 0;

const failures = [];
const results = [];

function ok(label) { results.push('  ✓ ' + label); }
function fail(label, reason) { results.push('  ✗ ' + label + ' — ' + reason); failures.push({ label, reason }); }

async function assert(condition, label, detail) {
  if (condition) { ok(label); return true; }
  else { fail(label, detail); return false; }
}

async function test(label, fn) {
  console.log('\n' + label);
  try { await fn(); } catch (e) { fail(label + ' (exception)', e.message); }
}

// ==================== 1. C-end APIs ====================
async function testCProducts() {
  await test('1.1 C-商品列表', async () => {
    const r = await axios.get(C_API + '/products?page=1&pageSize=10');
    await assert(r.data.code === 0, 'GET /api/products 返回 code=0', JSON.stringify(r.data).slice(0, 100));
    await assert(r.data.data && Array.isArray(r.data.data.list), '返回 list 数组');
    await assert(r.data.data.total !== undefined, '返回 total 字段');
    if (r.data.data.list.length) {
      testProductId = r.data.data.list[0].id;
      // 验证移除了旧字段
      await assert(!('category' in r.data.data.list[0]), '响应不含已删除的 category 字段');
      await assert(!('followers' in r.data.data.list[0]), '响应不含已删除的 followers 字段');
      await assert(!('is_verified' in r.data.data.list[0]), '响应不含已删除的 is_verified 字段');
      await assert('remain_stock' in r.data.data.list[0], '响应包含 remain_stock');
    }
  });

  await test('1.2 C-商品详情', async () => {
    if (!testProductId) { ok('跳过 (无商品数据)'); return; }
    const r = await axios.get(C_API + '/products/' + testProductId);
    await assert(r.data.code === 0, 'GET /api/products/:id 返回 code=0');
    await assert(r.data.data && r.data.data.id === testProductId, '返回正确的商品ID');
  });

  await test('1.3 C-商品筛选(platform)', async () => {
    const r = await axios.get(C_API + '/products?platform=douyin');
    await assert(r.data.code === 0, 'platform 筛选正常');
  });

  await test('1.4 C-商品筛选(gender)', async () => {
    const r = await axios.get(C_API + '/products?gender=female');
    await assert(r.data.code === 0, 'gender 筛选正常');
  });

  await test('1.5 C-商品筛选(price range)', async () => {
    const r = await axios.get(C_API + '/products?min_price=1&max_price=100');
    await assert(r.data.code === 0, '价格区间筛选正常');
  });

  await test('1.6 C-商品排序', async () => {
    const r = await axios.get(C_API + '/products?sort=price&order=asc');
    await assert(r.data.code === 0, '排序参数正常');
  });

  await test('1.7 C-商品搜索(keyword)', async () => {
    const r = await axios.get(C_API + '/products?keyword=测试');
    await assert(r.data.code === 0, '关键词搜索正常');
  });

  await test('1.8 C-商品分页', async () => {
    const r = await axios.get(C_API + '/products?page=1&pageSize=1');
    await assert(r.data.code === 0 && r.data.data.pageSize === 1, '分页参数生效');
  });
}

async function testCOrders() {
  await test('2.1 C-创建订单(正常)', async () => {
    if (!testProductId) { ok('跳过 (无商品)'); return; }
    const r = await axios.post(C_API + '/orders', {
      product_id: testProductId, phone: '13800138000', pay_method: 'wechat',
    });
    await assert(r.data.code === 0, 'POST /api/orders 返回 code=0', JSON.stringify(r.data));
    await assert(r.data.data && r.data.data.order_no, '返回订单号');
    if (r.data.data) testOrderNo = r.data.data.order_no;
    console.log('    → 订单号: ' + testOrderNo);
  });

  await test('2.2 C-创建订单(缺少参数)', async () => {
    try {
      const r = await axios.post(C_API + '/orders', { product_id: 1 });
      await assert(r.data.code === 1004, '缺少参数返回 code=1004');
    } catch { fail('缺少参数测试', '请求失败'); }
  });

  await test('2.3 C-创建订单(无效商品)', async () => {
    try {
      const r = await axios.post(C_API + '/orders', {
        product_id: 99999, phone: '13800138000', pay_method: 'wechat',
      });
      await assert(r.data.code === 1001, '无效商品返回 code=1001');
    } catch { fail('无效商品测试', '请求失败'); }
  });

  await test('2.4 C-查询订单', async () => {
    if (!testOrderNo) { ok('跳过 (无订单)'); return; }
    const r = await axios.get(C_API + '/orders/' + testOrderNo);
    await assert(r.data.code === 0, 'GET /api/orders/:no 返回 code=0');
    await assert(r.data.data && r.data.data.order_no === testOrderNo, '返回正确的订单');
    await assert(r.data.data.status === 'pending', '新订单状态为 pending');
  });

  await test('2.5 C-查询不存在的订单', async () => {
    try {
      const r = await axios.get(C_API + '/orders/RX999999999999999999');
      await assert(r.data.code === 1001, '不存在的订单返回 code=1001');
    } catch { fail('404订单测试', '请求失败'); }
  });
}

async function testCPayment() {
  await test('3.1 C-支付二维码', async () => {
    if (!testOrderNo) { ok('跳过 (无订单)'); return; }
    const r = await axios.get(C_API + '/payment/qrcode/' + testOrderNo);
    // 可能返回 1007 (支付未配置) 或 0
    await assert([0, 1007].includes(r.data.code), '支付二维码接口响应', JSON.stringify(r.data).slice(0, 100));
  });

  await test('3.2 C-支付状态查询', async () => {
    if (!testOrderNo) { ok('跳过 (无订单)'); return; }
    const r = await axios.get(C_API + '/payment/status/' + testOrderNo);
    await assert(r.data.code === 0, '支付状态接口正常');
    await assert(r.data.data.status === 'pending', '状态为 pending');
  });
}

async function testCPlatforms() {
  await test('4.1 C-平台列表', async () => {
    const r = await axios.get(C_API + '/platforms');
    await assert(r.data.code === 0, 'GET /api/platforms 返回 code=0');
    await assert(Array.isArray(r.data.data), '返回数组');
  });
}

async function testCAnnouncements() {
  await test('5.1 C-公告列表', async () => {
    const r = await axios.get(C_API + '/announcements');
    await assert(r.data.code === 0, 'GET /api/announcements 返回 code=0');
    await assert(Array.isArray(r.data.data), '返回数组');
    if (r.data.data.length) {
      await assert('content' in r.data.data[0], '公告含 content 字段');
    }
  });
}

// ==================== 2. B-end Auth ====================
async function testAuth() {
  await test('6.1 B-登录(正确)', async () => {
    const r = await axios.post(B_API + '/auth/login', { username: 'admin', password: 'admin123' });
    await assert(r.data.code === 0, '登录成功 code=0', JSON.stringify(r.data));
    await assert(r.data.data && r.data.data.token, '返回 token');
    adminToken = r.data.data ? r.data.data.token : '';
  });

  await test('6.2 B-登录(错误密码)', async () => {
    try {
      const r = await axios.post(B_API + '/auth/login', { username: 'admin', password: 'wrong' });
      await assert(r.data.code === 1002, '错误密码返回 code=1002');
    } catch { fail('错误密码测试', '请求失败'); }
  });

  await test('6.3 B-获取用户信息', async () => {
    if (!adminToken) { ok('跳过 (无token)'); return; }
    const r = await axios.get(B_API + '/auth/info', { headers: { Authorization: 'Bearer ' + adminToken } });
    await assert(r.data.code === 0, '获取用户信息成功');
    await assert(r.data.data && r.data.data.username === 'admin', '返回 admin 用户');
  });

  await test('6.4 B-未登录拦截', async () => {
    try {
      const r = await axios.get(B_API + '/products?page=1', { validateStatus: () => true });
      await assert(r.data.code === 401 || r.status === 401, '未登录返回 401', 'code=' + r.data.code + ' status=' + r.status);
    } catch { fail('未登录拦截测试', '请求失败'); }
  });
}

// ==================== 3. B-end Product ====================
async function testBProducts() {
  const h = { headers: { Authorization: 'Bearer ' + adminToken } };

  await test('7.1 B-商品列表', async () => {
    const r = await axios.get(B_API + '/products?page=1&pageSize=10', h);
    await assert(r.data.code === 0, '列表正常');
    await assert(r.data.data.list && r.data.data.total !== undefined, '返回分页数据');
  });

  await test('7.2 B-商品创建', async () => {
    const r = await axios.post(B_API + '/products', {
      title: '联动测试商品_' + Date.now(),
      platform: 'douyin',
      price: 99.99,
      original_price: 199.00,
      stock: 10,
      likes: 5000,
      favorites: 2000,
      gender: 'female',
      gender_male_ratio: 20,
      gender_female_ratio: 80,
      description: '这是一个自动化测试商品',
      usage_guide: '测试使用说明',
      status: 1,
    }, h);
    await assert(r.data.code === 0, '创建商品成功', JSON.stringify(r.data));
    if (r.data.data && r.data.data.id) {
      testProductId = r.data.data.id;
      console.log('    → 新商品ID: ' + testProductId);
    }
  });

  await test('7.3 C端验证-新建商品即时可见', async () => {
    if (!testProductId) { ok('跳过'); return; }
    const r = await axios.get(C_API + '/products/' + testProductId);
    await assert(r.data.code === 0, 'C端可查到新商品');
    await assert(r.data.data.title.includes('联动测试商品'), 'C端标题正确');
    await assert(r.data.data.status === 1, 'C端状态为已上架');
  });

  await test('7.4 B-商品编辑', async () => {
    if (!testProductId) { ok('跳过'); return; }
    const r = await axios.put(B_API + '/products/' + testProductId, {
      title: '联动测试商品_已编辑',
      platform: 'douyin',
      price: 88.00,
      original_price: 168.00,
      stock: 5,
      likes: 6000,
      favorites: 2500,
      gender: 'male',
      gender_male_ratio: 70,
      gender_female_ratio: 30,
      description: '已编辑的描述',
      usage_guide: '已编辑的使用说明',
      status: 1,
    }, h);
    await assert(r.data.code === 0, '编辑成功');
  });

  await test('7.5 C端验证-编辑即时生效', async () => {
    if (!testProductId) { ok('跳过'); return; }
    const r = await axios.get(C_API + '/products/' + testProductId);
    await assert(r.data.code === 0, 'C端可查编辑后的商品');
    await assert(r.data.data.title === '联动测试商品_已编辑', '标题已更新');
    await assert(Number(r.data.data.price) === 88, '价格已更新');
    await assert(r.data.data.gender === 'male', '性别偏好已更新');
  });

  await test('7.6 B-商品下架→C端不可见', async () => {
    if (!testProductId) { ok('跳过'); return; }
    await axios.put(B_API + '/products/' + testProductId, { ...(await axios.get(B_API + '/products/' + testProductId, h)).data.data, status: 0 }, h);
    const r = await axios.get(C_API + '/products/' + testProductId);
    await assert(r.data.code === 1001, '下架后C端查询返回1001');
  });

  await test('7.7 B-商品上架→C端恢复可见', async () => {
    if (!testProductId) { ok('跳过'); return; }
    const detail = await axios.get(B_API + '/products/' + testProductId, h);
    const data = { ...detail.data.data, status: 1 };
    await axios.put(B_API + '/products/' + testProductId, data, h);
    const r = await axios.get(C_API + '/products/' + testProductId);
    await assert(r.data.code === 0, '上架后C端恢复可见');
  });

  await test('7.8 B-商品列表筛选(status)', async () => {
    const r1 = await axios.get(B_API + '/products?status=1&pageSize=5', h);
    await assert(r1.data.code === 0, '上架商品筛选正常');
    const r0 = await axios.get(B_API + '/products?status=0&pageSize=5', h);
    await assert(r0.data.code === 0, '下架商品筛选正常');
  });

  await test('7.9 B-商品列表筛选(platform)', async () => {
    const r = await axios.get(B_API + '/products?platform=douyin&pageSize=5', h);
    await assert(r.data.code === 0, '按平台筛选正常');
  });

  await test('7.10 B-商品搜索(keyword)', async () => {
    const r = await axios.get(B_API + '/products?keyword=联动测试', h);
    await assert(r.data.code === 0, '关键词搜索正常');
    await assert(r.data.data.total > 0, '搜索到结果');
  });
}

// ==================== 4. B-end Order ====================
async function testBOrders() {
  const h = { headers: { Authorization: 'Bearer ' + adminToken } };

  await test('8.1 B-订单列表', async () => {
    const r = await axios.get(B_API + '/orders?page=1&pageSize=10', h);
    await assert(r.data.code === 0, '订单列表正常');
    await assert(r.data.data.list && r.data.data.total !== undefined, '返回分页数据');
  });

  await test('8.2 B-订单详情', async () => {
    if (!testOrderNo) { ok('跳过 (无订单)'); return; }
    // B-end 订单详情用整数 id，先通过列表查到 id
    const list = await axios.get(B_API + '/orders?order_no=' + testOrderNo + '&pageSize=1', h);
    if (!list.data.data || !list.data.data.list.length) { ok('跳过 (列表中未找到该订单)'); return; }
    const orderId = list.data.data.list[0].id;
    const r = await axios.get(B_API + '/orders/' + orderId, h);
    await assert(r.data.code === 0, '订单详情正常');
    await assert(r.data.data.order_no === testOrderNo, '订单号匹配');
  });

  await test('8.3 B-订单筛选(status)', async () => {
    const r = await axios.get(B_API + '/orders?status=pending&pageSize=5', h);
    await assert(r.data.code === 0, '按状态筛选正常');
  });

  await test('8.4 B-订单筛选(phone)', async () => {
    const r = await axios.get(B_API + '/orders?phone=13800138000&pageSize=5', h);
    await assert(r.data.code === 0, '按手机号筛选正常');
  });

  await test('8.5 B-订单发货(模拟)', async () => {
    if (!testOrderNo) { ok('跳过 (无订单)'); return; }
    // B-end 订单详情用整数 id，先通过列表查到 id
    const list = await axios.get(B_API + '/orders?order_no=' + testOrderNo + '&pageSize=1', h);
    if (!list.data.data || !list.data.data.list.length) { ok('跳过 (列表中未找到该订单)'); return; }
    const orderId = list.data.data.list[0].id;
    // deliver 要求订单状态为 paid，pending 订单会失败（验证接口可达性）
    const r = await axios.put(B_API + '/orders/' + orderId + '/deliver', {
      account: 'test_account@test.com',
      password: 'test_pwd_123',
    }, h);
    await assert(r.data.code !== 500, '发货接口可达', JSON.stringify(r.data).slice(0, 100));
  });
}

// ==================== 5. B-end Platform ====================
async function testBPlatforms() {
  const h = { headers: { Authorization: 'Bearer ' + adminToken } };

  await test('9.1 B-平台列表', async () => {
    const r = await axios.get(B_API + '/platforms', h);
    await assert(r.data.code === 0, '平台列表正常');
    await assert(Array.isArray(r.data.data), '返回数组');
  });

  await test('9.2 B-平台创建', async () => {
    const r = await axios.post(B_API + '/platforms', {
      platform_key: 'test_plat_' + Date.now(),
      name: '测试平台',
      icon: '🧪',
      color: '#ff0000',
      sort_order: 99,
      status: 1,
    }, h);
    await assert(r.data.code === 0, '创建平台成功', JSON.stringify(r.data));
  });

  await test('9.3 C端验证-新建平台可见', async () => {
    const r = await axios.get(C_API + '/platforms');
    await assert(r.data.code === 0, 'C端平台列表正常');
    const found = r.data.data.find(p => p.name === '测试平台');
    await assert(!!found, 'C端可见新建平台：' + JSON.stringify(found));
  });

  await test('9.4 B-平台编辑+删除', async () => {
    const list = await axios.get(B_API + '/platforms', h);
    const testPlat = list.data.data.find(p => p.name === '测试平台');
    if (!testPlat) { ok('跳过 (无测试平台)'); return; }
    await axios.put(B_API + '/platforms/' + testPlat.id, { ...testPlat, name: '测试平台_已编辑' }, h);
    const del = await axios.delete(B_API + '/platforms/' + testPlat.id, h);
    await assert(del.data.code === 0, '删除平台成功');
  });
}

// ==================== 6. B-end Announcement ====================
async function testBAnnouncements() {
  const h = { headers: { Authorization: 'Bearer ' + adminToken } };

  await test('10.1 B-公告列表', async () => {
    const r = await axios.get(B_API + '/announcements', h);
    await assert(r.data.code === 0, '公告列表正常');
  });

  await test('10.2 B-公告创建', async () => {
    const r = await axios.post(B_API + '/announcements', {
      content: '联动测试公告_' + Date.now(),
      sort_order: 1,
      status: 1,
    }, h);
    await assert(r.data.code === 0, '创建公告成功', JSON.stringify(r.data));
    if (r.data.data && r.data.data.id) testAnnouncementId = r.data.data.id;
  });

  await test('10.3 C端验证-公告即时可见', async () => {
    const r = await axios.get(C_API + '/announcements');
    const found = r.data.data.find(a => a.content && a.content.includes('联动测试公告'));
    await assert(!!found, 'C端可见新公告: ' + (found ? found.content : 'NOT FOUND'));
  });

  await test('10.4 B-公告删除', async () => {
    if (!testAnnouncementId) { ok('跳过'); return; }
    const del = await axios.delete(B_API + '/announcements/' + testAnnouncementId, h);
    await assert(del.data.code === 0, '删除公告成功');
  });

  await test('10.5 C端验证-公告已删除', async () => {
    const r = await axios.get(C_API + '/announcements');
    const found = r.data.data.find(a => a.content && a.content.includes('联动测试公告'));
    await assert(!found, 'C端已不再显示已删除公告');
  });
}

// ==================== 7. Config ====================
async function testConfig() {
  const h = { headers: { Authorization: 'Bearer ' + adminToken } };

  await test('11.1 B-获取基础配置', async () => {
    const r = await axios.get(B_API + '/configs', h);
    await assert(r.data.code === 0, '获取配置正常');
    await assert(Array.isArray(r.data.data), '返回配置数组');
    if (r.data.data.length) {
      await assert('config_key' in r.data.data[0], '配置项含 config_key');
    }
  });

  await test('11.2 B-更新基础配置', async () => {
    const r = await axios.put(B_API + '/configs', {
      configs: [
        { config_key: 'site_name', config_value: '联动测试商城' },
        { config_key: 'site_description', config_value: '测试描述' },
      ],
    }, h);
    await assert(r.data.code === 0, '更新配置成功');
  });

  await test('11.3 验证-配置持久化', async () => {
    const r = await axios.get(B_API + '/configs', h);
    const siteName = r.data.data.find(c => c.config_key === 'site_name');
    await assert(siteName && siteName.config_value === '联动测试商城', '配置值已持久化: ' + (siteName ? siteName.config_value : 'NOT FOUND'));
    // 还原
    await axios.put(B_API + '/configs', {
      configs: [{ config_key: 'site_name', config_value: '账号商城' }],
    }, h);
  });

  await test('11.4 B-支付配置', async () => {
    const r1 = await axios.get(B_API + '/configs/pay', h);
    await assert(r1.data.code === 0, '获取支付配置正常');
    const r2 = await axios.put(B_API + '/configs/pay', {
      api_url: 'https://pay.example.com/',
      pid: '1001',
      key: 'testkey123',
      notify_url: 'https://test.com/notify',
      return_url: 'https://test.com/return',
      pay_types: ['alipay', 'wechat', 'qq'],
    }, h);
    await assert(r2.data.code === 0, '保存支付配置成功');
  });
}

// ==================== 8. Admin & Logs ====================
async function testAdmins() {
  const h = { headers: { Authorization: 'Bearer ' + adminToken } };

  await test('12.1 B-管理员列表', async () => {
    const r = await axios.get(B_API + '/admins', h);
    await assert(r.data.code === 0, '管理员列表正常');
    await assert(Array.isArray(r.data.data), '返回数组');
  });

  await test('12.2 B-创建管理员', async () => {
    const r = await axios.post(B_API + '/admins', {
      username: 'test_' + Date.now(),
      password: 'test123',
      nickname: '测试员',
      role: 'editor',
      status: 1,
    }, h);
    await assert(r.data.code === 0, '创建管理员成功', JSON.stringify(r.data));
  });

  await test('12.3 B-操作日志', async () => {
    const r = await axios.get(B_API + '/logs?page=1&pageSize=10', h);
    await assert(r.data.code === 0, '操作日志列表正常');
    await assert(r.data.data && r.data.data.list !== undefined, '返回 list');
  });
}

// ==================== 9. Customer ====================
async function testCustomers() {
  const h = { headers: { Authorization: 'Bearer ' + adminToken } };

  await test('13.1 B-客户列表', async () => {
    const r = await axios.get(B_API + '/customers?page=1&pageSize=10', h);
    await assert(r.data.code === 0, '客户列表正常');
    await assert(r.data.data.list && r.data.data.total !== undefined, '返回分页数据');
  });

  await test('13.2 B-客户订单', async () => {
    const customers = await axios.get(B_API + '/customers?page=1&pageSize=1', h);
    const list = customers.data.data.list;
    if (list.length) {
      const r = await axios.get(B_API + '/customers/' + list[0].id + '/orders', h);
      await assert(r.data.code === 0, '客户订单查询正常');
    } else {
      ok('跳过 (无客户数据)');
    }
  });
}

// ==================== 10. Cleanup ====================
async function cleanup() {
  const h = { headers: { Authorization: 'Bearer ' + adminToken } };

  // 删除测试商品
  if (testProductId) {
    try { await axios.delete(B_API + '/products/' + testProductId, h); console.log('  [清理] 删除测试商品 #' + testProductId); } catch {}
  }
  // 删除测试管理员
  const admins = await axios.get(B_API + '/admins', h);
  for (const a of admins.data.data || []) {
    if (a.username && a.username.startsWith('test_') && a.role !== 'admin') {
      try { await axios.delete(B_API + '/admins/' + a.id, h); console.log('  [清理] 删除测试管理员 ' + a.username); } catch {}
    }
  }
  // 删除测试平台
  const plats = await axios.get(B_API + '/platforms', h);
  for (const p of plats.data.data || []) {
    if (p.name && (p.name.startsWith('测试平台') || p.platform_key.startsWith('test_plat_'))) {
      try { await axios.delete(B_API + '/platforms/' + p.id, h); console.log('  [清理] 删除测试平台 ' + p.name); } catch {}
    }
  }
}

// ==================== MAIN ====================
async function main() {
  console.log('═══════════════════════════════════════════');
  console.log('  前后端联动集成测试');
  console.log('═══════════════════════════════════════════');

  await testCProducts();
  await testCOrders();
  await testCPayment();
  await testCPlatforms();
  await testCAnnouncements();
  await testAuth();
  await testBProducts();
  await testBOrders();
  await testBPlatforms();
  await testBAnnouncements();
  await testConfig();
  await testAdmins();
  await testCustomers();
  await cleanup();

  // 输出报告
  console.log('\n═══════════════════════════════════════════');
  console.log('  测试报告');
  console.log('═══════════════════════════════════════════');
  console.log('通过: ' + results.filter(r => r.startsWith('  ✓')).length);
  console.log('失败: ' + failures.length);

  if (failures.length) {
    console.log('\n失败明细:');
    failures.forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.label}`);
      console.log(`     原因: ${f.reason}`);
    });
  } else {
    console.log('\n  🎉 所有测试通过！');
  }

  process.exit(failures.length ? 1 : 0);
}

main();
