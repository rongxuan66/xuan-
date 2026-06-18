# xuan发卡 - 24h 自动发卡系统

一套完整的自动发卡商城系统，支持用户自助购买、下单即发号，无需人工干预。
演示地址 [ch.7i0.cn]http://ch.7i0.cn)
qq交流群 【Rx系列交流群】：https://qm.qq.com/q/n15Lhgh7hK

## 功能特性

### 用户端（C 端）
- 账号商品浏览与搜索
- 在线下单购买
- 24 小时自动发号
- 订单查询与详情查看
- 用户注册 / 登录
- 个人中心

### 管理端（B 端）
- 数据统计仪表盘
- 商品管理（平台、商品、卡密）
- 订单管理
- 公告管理
- 客户管理
- 支付配置
- 系统设置（菜单、角色、用户、日志）

## 技术栈

| 模块 | 技术 |
|------|------|
| 前端（用户端） | HTML + Bootstrap 5 + 原生 JS |
| 后台管理 | Vue 3 + TypeScript + Element Plus + Vite |
| 后端服务 | Node.js + Express |
| 数据库 | MySQL |
| 鉴权 | JWT |
| 文件存储 | 七牛云 |

## 项目结构

```
├── web/                  # 用户端前端页面
│   ├── index.html        # 首页（商品列表）
│   ├── detail.html       # 商品详情
│   ├── orders.html       # 订单查询
│   ├── login.html        # 登录注册
│   ├── profile.html      # 个人中心
│   ├── css/              # 样式文件
│   └── js/               # 脚本文件
│
├── admin/                # 管理后台（Vue3）
│   ├── src/
│   │   ├── api/          # 接口请求
│   │   ├── views/        # 页面组件
│   │   ├── router/       # 路由配置
│   │   ├── stores/       # 状态管理（Pinia）
│   │   └── utils/        # 工具函数
│   └── vite.config.ts
│
├── server/               # 后端服务
│   ├── src/
│   │   ├── app.js        # 入口文件
│   │   ├── controllers/  # 控制器（b端/c端）
│   │   ├── routes/       # 路由定义
│   │   ├── middleware/   # 中间件（鉴权、日志）
│   │   └── utils/        # 工具模块
│   ├── config/           # 配置文件
│   └── scripts/          # 脚本（数据库初始化）
│
└── docs/                 # 项目文档
```

## 快速开始

### 环境要求

- Node.js >= 16
- MySQL >= 5.7
- npm >= 7

### 安装与运行

**1. 克隆项目**

```bash
git https://github.com/rongxuan66/xuan-.git
cd xuan-card-issuance
```

**2. 初始化数据库**

```bash
# 创建数据库并导入表结构
mysql -u root -p < server/scripts/db/init.js
```

**3. 配置环境变量**

复制 `server/.env.example` 为 `server/.env`，修改数据库等配置：

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=rxweb
JWT_SECRET=your_jwt_secret
```

**4. 启动后端服务**

```bash
cd server
npm install
npm start
# 访问 http://localhost:3000
```

**5. 启动管理后台（开发模式）**

```bash
cd admin
npm install
npm run dev
# 访问 http://localhost:8080
```

## 默认端口

| 服务 | 端口 |
|------|------|
| 后端 API + 用户端页面 | 3000 |
| 管理后台（开发模式） | 8080 |

## API 接口

- 用户端接口：`/api/*`
- 管理端接口：`/admin/api/*`

详见 [API 设计文档](docs/API设计.md)

## 开源协议

MIT License
