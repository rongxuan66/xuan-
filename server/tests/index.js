const { spawn } = require('child_process');
const path = require('path');
const chalk = require('chalk');
const { reset, summary, ok, fail } = require('./utils/logger');

const serverPath = path.resolve(__dirname, '../src/app.js');
let server = null;

// 启动服务器
const startServer = () => new Promise((resolve, reject) => {
  console.log(chalk.white.bold('╔══════════════════════════════════════════════════════════╗'));
  console.log(chalk.white.bold('║         账号商城 API 接口测试                              ║'));
  console.log(chalk.white.bold('╚══════════════════════════════════════════════════════════╝'));
  console.log(chalk.gray(`\n启动服务: node ${serverPath}\n`));

  server = spawn('node', [serverPath], {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env },
  });

  let started = false;
  const onData = (data) => {
    if (!started && data.includes('Server running at')) {
      started = true;
      resolve();
    }
  };

  server.stdout.on('data', onData);
  server.stderr.on('data', onData);

  setTimeout(() => {
    if (!started) resolve(); // 超时继续
  }, 5000);
});

// 停止服务器
const stopServer = () => {
  if (server) {
    server.kill('SIGTERM');
    server = null;
  }
};

// 执行所有测试
const runTests = async () => {
  reset();

  // ---- C端接口测试 ----
  const cTests = [
    { name: 'C端商品', module: './c-api/products' },
    { name: 'C端订单', module: './c-api/orders' },
    { name: 'C端支付', module: './c-api/payment' },
    { name: 'C端平台', module: './c-api/platforms' },
    { name: 'C端公告', module: './c-api/announcements' },
    { name: '上传凭证', module: './c-api/upload' },
  ];

  for (const t of cTests) {
    try {
      const mod = require(t.module);
      await (typeof mod === 'function' ? mod() : mod.test());
    } catch (err) {
      fail(`${t.name} 测试异常`, err.message);
      console.error(err);
    }
  }

  // ---- B端接口测试 ----
  const bTests = [
    { name: 'B端认证', module: './b-api/auth' },
    { name: '仪表盘', module: './b-api/dashboard' },
    { name: 'B端商品', module: './b-api/products' },
    { name: 'B端订单', module: './b-api/orders' },
    { name: 'B端平台', module: './b-api/platforms' },
    { name: 'B端公告', module: './b-api/announcements' },
    { name: '客户管理', module: './b-api/customers' },
    { name: '系统配置', module: './b-api/configs' },
    { name: '管理员管理', module: './b-api/admins' },
    { name: '操作日志', module: './b-api/logs' },
  ];

  for (const t of bTests) {
    try {
      const mod = require(t.module);
      await (typeof mod === 'function' ? mod() : mod.test());
    } catch (err) {
      fail(`${t.name} 测试异常`, err.message);
      console.error(err);
    }
  }

  summary();
};

// 主流程
(async () => {
  try {
    await startServer();
    await runTests();
  } catch (err) {
    console.error(chalk.red('测试运行失败:'), err.message);
  } finally {
    stopServer();
    // 等待进程退出
    setTimeout(() => process.exit(0), 500);
  }
})();
