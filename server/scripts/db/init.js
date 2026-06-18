/**
 * 数据库初始化脚本 -- 创建所有表并插入初始数据
 */
const mysql = require('mysql2/promise');
const config = require('../../config');

const createTables = async () => {
  const connection = await mysql.createConnection({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    multipleStatements: true,
  });

  // 创建数据库
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.db.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.query(`USE \`${config.db.database}\``);

  console.log('开始创建数据表...');

  // 1. 商品表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`products\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
      \`title\` varchar(200) NOT NULL DEFAULT '' COMMENT '商品标题',
      \`platform\` varchar(30) NOT NULL DEFAULT '' COMMENT '所属平台标识(douyin/kuaishou/shipinhao/xiaohongshu/baijiahao)',
      \`category\` varchar(50) NOT NULL DEFAULT '' COMMENT '内容分类',
      \`images\` text COMMENT '商品图片JSON数组',
      \`price\` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '售价',
      \`original_price\` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '原价',
      \`stock\` int(11) NOT NULL DEFAULT '0' COMMENT '库存',
      \`followers\` int(11) NOT NULL DEFAULT '0' COMMENT '粉丝数',
      \`likes\` int(11) NOT NULL DEFAULT '0' COMMENT '获赞数',
      \`favorites\` int(11) NOT NULL DEFAULT '0' COMMENT '收藏数',
      \`gender\` varchar(10) NOT NULL DEFAULT 'balanced' COMMENT '粉丝偏好(female/male/balanced)',
      \`gender_male_ratio\` tinyint(3) unsigned NOT NULL DEFAULT '50' COMMENT '男粉比例(%)',
      \`gender_female_ratio\` tinyint(3) unsigned NOT NULL DEFAULT '50' COMMENT '女粉比例(%)',
      \`is_verified\` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否认证(0:未认证 1:已认证)',
      \`description\` text COMMENT '商品介绍',
      \`usage_guide\` text COMMENT '使用说明',
      \`delivery_type\` varchar(10) NOT NULL DEFAULT 'card' COMMENT '交付方式(card:卡密 url:访问URL)',
      \`delivery_url\` text COMMENT '自定义交付URL（支持变量 {VAR}）',
      \`custom_fields\` text COMMENT '自定义输入项JSON',
      \`status\` tinyint(1) NOT NULL DEFAULT '1' COMMENT '上架状态(0:下架 1:上架)',
      \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      PRIMARY KEY (\`id\`),
      KEY \`idx_platform\` (\`platform\`),
      KEY \`idx_status\` (\`status\`),
      KEY \`idx_price\` (\`price\`),
      KEY \`idx_gender\` (\`gender\`),
      KEY \`idx_created_at\` (\`created_at\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品表';
  `);
  console.log('  [OK] products 表创建成功');

  // 2. 订单表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`orders\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
      \`order_no\` varchar(32) NOT NULL DEFAULT '' COMMENT '订单编号',
      \`product_id\` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '商品ID',
      \`product_title\` varchar(200) NOT NULL DEFAULT '' COMMENT '商品标题(冗余)',
      \`product_image\` varchar(500) NOT NULL DEFAULT '' COMMENT '商品图片(冗余)',
      \`price\` decimal(10,2) NOT NULL DEFAULT '0.00' COMMENT '订单金额',
      \`phone\` varchar(20) NOT NULL DEFAULT '' COMMENT '买家手机号',
      \`pay_method\` varchar(20) NOT NULL DEFAULT '' COMMENT '支付方式(wechat/alipay/qq)',
      \`status\` varchar(20) NOT NULL DEFAULT 'pending' COMMENT '订单状态(pending:待支付 paid:已支付 refunded:已退款)',
      \`account\` varchar(100) NOT NULL DEFAULT '' COMMENT '发货账号',
      \`password\` varchar(50) NOT NULL DEFAULT '' COMMENT '发货密码',
      \`user_id\` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '用户ID',
      \`custom_data\` text COMMENT '用户自定义字段值JSON',
      \`paid_at\` datetime DEFAULT NULL COMMENT '支付时间',
      \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '下单时间',
      \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_order_no\` (\`order_no\`),
      KEY \`idx_product_id\` (\`product_id\`),
      KEY \`idx_phone\` (\`phone\`),
      KEY \`idx_status\` (\`status\`),
      KEY \`idx_pay_method\` (\`pay_method\`),
      KEY \`idx_created_at\` (\`created_at\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';
  `);
  console.log('  [OK] orders 表创建成功');

  // 3. 平台分类表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`platforms\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
      \`platform_key\` varchar(30) NOT NULL DEFAULT '' COMMENT '平台标识',
      \`name\` varchar(20) NOT NULL DEFAULT '' COMMENT '平台名称',
      \`icon\` varchar(10) NOT NULL DEFAULT '' COMMENT '图标(emoji)',
      \`color\` varchar(7) NOT NULL DEFAULT '#f0f4ff' COMMENT '主题色(hex)',
      \`sort_order\` int(11) NOT NULL DEFAULT '0' COMMENT '排序(越小越靠前)',
      \`status\` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态(0:禁用 1:启用)',
      \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_platform_key\` (\`platform_key\`),
      KEY \`idx_sort_order\` (\`sort_order\`),
      KEY \`idx_status\` (\`status\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='平台分类表';
  `);
  console.log('  [OK] platforms 表创建成功');

  // 4. 公告表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`announcements\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
      \`content\` varchar(200) NOT NULL DEFAULT '' COMMENT '公告内容',
      \`sort_order\` int(11) NOT NULL DEFAULT '0' COMMENT '排序(越小越靠前)',
      \`status\` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态(0:隐藏 1:显示)',
      \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      PRIMARY KEY (\`id\`),
      KEY \`idx_status\` (\`status\`),
      KEY \`idx_sort_order\` (\`sort_order\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='公告表';
  `);
  console.log('  [OK] announcements 表创建成功');

  // 5. 客户表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`customers\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
      \`phone\` varchar(20) NOT NULL DEFAULT '' COMMENT '手机号',
      \`total_orders\` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '累计订单数',
      \`total_amount\` decimal(12,2) NOT NULL DEFAULT '0.00' COMMENT '累计消费金额',
      \`first_order_at\` datetime DEFAULT NULL COMMENT '首次下单时间',
      \`last_order_at\` datetime DEFAULT NULL COMMENT '最近下单时间',
      \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_phone\` (\`phone\`),
      KEY \`idx_last_order_at\` (\`last_order_at\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='客户表';
  `);
  console.log('  [OK] customers 表创建成功');

  // 6. 系统配置表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`system_configs\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
      \`config_key\` varchar(50) NOT NULL DEFAULT '' COMMENT '配置键',
      \`config_value\` text COMMENT '配置值',
      \`remark\` varchar(100) NOT NULL DEFAULT '' COMMENT '配置说明',
      \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_config_key\` (\`config_key\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';
  `);
  // 插入初始配置
  const [configRows] = await connection.query(`SELECT COUNT(*) as cnt FROM system_configs`);
  if (configRows[0].cnt === 0) {
    await connection.query(`
      INSERT INTO system_configs (config_key, config_value, remark) VALUES
      ('site_name', '账号商城', '站点名称'),
      ('site_description', '账号自动发号系统，下单即发，免登录购买', '站点描述'),
      ('service_wechat', 'kefu001', '客服微信'),
      ('pay_timeout_minutes', '15', '支付超时时间(分钟)');
    `);
  }
  console.log('  [OK] system_configs 表创建成功');

  // 7. 管理员表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`admins\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
      \`username\` varchar(50) NOT NULL DEFAULT '' COMMENT '用户名',
      \`password\` varchar(64) NOT NULL DEFAULT '' COMMENT '密码(MD5)',
      \`nickname\` varchar(50) NOT NULL DEFAULT '' COMMENT '昵称',
      \`avatar\` varchar(500) NOT NULL DEFAULT '' COMMENT '头像URL',
      \`role\` varchar(20) NOT NULL DEFAULT 'admin' COMMENT '角色(admin:超级管理员 editor:编辑)',
      \`status\` tinyint(1) NOT NULL DEFAULT '1' COMMENT '状态(0:禁用 1:启用)',
      \`last_login_at\` datetime DEFAULT NULL COMMENT '最后登录时间',
      \`last_login_ip\` varchar(50) NOT NULL DEFAULT '' COMMENT '最后登录IP',
      \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      \`updated_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
      PRIMARY KEY (\`id\`),
      UNIQUE KEY \`uk_username\` (\`username\`),
      KEY \`idx_status\` (\`status\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='管理员表';
  `);
  // 创建初始管理员 admin/admin123
  const [adminRows] = await connection.query(`SELECT COUNT(*) as cnt FROM admins`);
  if (adminRows[0].cnt === 0) {
    const md5Util = require('../../src/utils/md5Util');
    // 使用固定密码 admin123 的 MD5
    await connection.query(`INSERT INTO admins (username, password, nickname, role) VALUES ('admin', '0192023a7bbd73250516f069df18b500', '超级管理员', 'admin')`);
  }
  console.log('  [OK] admins 表创建成功');

  // 8. 操作日志表
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`operation_logs\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
      \`admin_id\` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '管理员ID',
      \`admin_name\` varchar(50) NOT NULL DEFAULT '' COMMENT '管理员用户名',
      \`action\` varchar(50) NOT NULL DEFAULT '' COMMENT '操作类型',
      \`target\` varchar(100) NOT NULL DEFAULT '' COMMENT '操作对象',
      \`target_id\` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '操作对象ID',
      \`detail\` text COMMENT '操作详情(JSON)',
      \`ip\` varchar(50) NOT NULL DEFAULT '' COMMENT '操作IP',
      \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
      PRIMARY KEY (\`id\`),
      KEY \`idx_admin_id\` (\`admin_id\`),
      KEY \`idx_action\` (\`action\`),
      KEY \`idx_created_at\` (\`created_at\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='操作日志表';
  `);
  console.log('  [OK] operation_logs 表创建成功');

  // 9. 商品卡号表（存储账号密码）
  await connection.query(`
    CREATE TABLE IF NOT EXISTS \`product_cards\` (
      \`id\` int(11) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键',
      \`product_id\` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '商品ID',
      \`card_no\` varchar(300) NOT NULL DEFAULT '' COMMENT '卡号信息(账号----密码----手机号/邮箱)',
      \`status\` tinyint(1) NOT NULL DEFAULT '0' COMMENT '状态(0:未出售 1:已出售)',
      \`order_id\` int(11) unsigned NOT NULL DEFAULT '0' COMMENT '关联订单ID',
      \`created_at\` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
      PRIMARY KEY (\`id\`),
      KEY \`idx_product_id\` (\`product_id\`),
      KEY \`idx_status\` (\`status\`),
      KEY \`idx_order_id\` (\`order_id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品卡号表';
  `);
  console.log('  [OK] product_cards 表创建成功');

  await connection.end();
  console.log('\n数据库初始化完成!');
  process.exit(0);
};

createTables().catch((err) => {
  console.error('数据库初始化失败:', err.message);
  process.exit(1);
});
