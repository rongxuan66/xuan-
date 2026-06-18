# API 设计

> 基于C端「账号商城」实际接口反推 + B端管理需求生成
> 基础路径：C端 `/api` | B端 `/admin/api`
> 数据格式：JSON
> 通用响应格式：`{"code": 0, "message": "success", "data": {}}`

---

## 一、C端接口（从代码反推）

### 1.1 商品模块

#### 获取商品列表
```
GET /api/products
```
**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| platform | string | 否 | 平台标识(all/douyin/kuaishou/shipinhao/xiaohongshu/baijiahao) |
| keyword | string | 否 | 搜索关键词(匹配标题和分类) |
| gender | string | 否 | 粉丝偏好(female/male/balanced) |
| is_verified | int | 否 | 认证状态(0/1) |
| followers_min | int | 否 | 粉丝数最小值 |
| followers_max | int | 否 | 粉丝数最大值 |
| price_min | float | 否 | 价格最小值 |
| price_max | float | 否 | 价格最大值 |
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页条数，默认20 |

**响应：**
```json
{
  "code": 0,
  "data": {
    "total": 10,
    "list": [
      {
        "id": 1,
        "platform": "xiaohongshu",
        "title": "千粉女装赛道 · 真人实拍 · 高互动",
        "images": ["https://xxx/img1.jpg", "https://xxx/img2.jpg"],
        "price": 38.00,
        "original_price": 68.00,
        "stock": 3,
        "followers": 1260,
        "likes": 8500,
        "favorites": 3200,
        "gender": "female",
        "gender_ratio": { "male": 22, "female": 78 },
        "is_verified": true,
        "category": "女装"
      }
    ]
  }
}
```

#### 获取商品详情
```
GET /api/products/:id
```
**响应：**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "platform": "xiaohongshu",
    "title": "千粉女装赛道 · 真人实拍 · 高互动",
    "images": ["https://xxx/img1.jpg", "https://xxx/img2.jpg", "https://xxx/img3.jpg"],
    "price": 38.00,
    "original_price": 68.00,
    "stock": 3,
    "followers": 1260,
    "likes": 8500,
    "favorites": 3200,
    "gender": "female",
    "gender_ratio": { "male": 22, "female": 78 },
    "is_verified": true,
    "category": "女装",
    "description": "账号为真人实拍女装赛道...",
    "usage_guide": "1. 下单后系统自动发送账号及密码..."
  }
}
```

---

### 1.2 订单模块

#### 查询订单列表（按手机号）
```
GET /api/orders
```
**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 否 | 手机号(模糊匹配) |
| status | string | 否 | 订单状态(pending/paid) |

**响应：**
```json
{
  "code": 0,
  "data": {
    "total": 3,
    "list": [
      {
        "order_no": "RED20260510143000a1b2",
        "product_id": 1,
        "product_title": "千粉女装赛道 · 真人实拍 · 高互动",
        "product_image": "https://xxx/thumb.jpg",
        "price": 38.00,
        "phone": "138****6789",
        "status": "paid",
        "created_at": "2026-05-10 14:30:00"
      }
    ]
  }
}
```

#### 获取订单详情
```
GET /api/orders/:order_no
```
**响应：**
```json
{
  "code": 0,
  "data": {
    "order_no": "RED20260510143000a1b2",
    "product_id": 1,
    "product_title": "千粉女装赛道 · 真人实拍 · 高互动",
    "product_image": "https://xxx/thumb.jpg",
    "price": 38.00,
    "phone": "138****6789",
    "pay_method": "wechat",
    "status": "paid",
    "account": "account_1@redbook.com",
    "password": "Pwd_a1b2c3d4",
    "paid_at": "2026-05-10 14:30:05",
    "created_at": "2026-05-10 14:30:00"
  }
}
```

#### 创建订单（下单）
```
POST /api/orders
```
**请求体：**
```json
{
  "product_id": 1,
  "phone": "13812345678",
  "pay_method": "wechat"
}
```
**响应：**
```json
{
  "code": 0,
  "data": {
    "order_no": "RED20260511153000x1y2",
    "price": 38.00,
    "status": "pending",
    "created_at": "2026-05-11 15:30:00"
  }
}
```

#### 支付成功回调
```
POST /api/orders/:order_no/pay-callback
```
**请求体：**
```json
{
  "pay_method": "wechat",
  "transaction_id": "WX20260511153000abcd"
}
```
**响应：**
```json
{
  "code": 0,
  "data": {
    "order_no": "RED20260511153000x1y2",
    "status": "paid",
    "account": "account_1@redbook.com",
    "password": "Pwd_x1y2z3w4"
  }
}
```

---

### 1.3 平台模块

#### 获取平台分类列表
```
GET /api/platforms
```
**响应：**
```json
{
  "code": 0,
  "data": [
    { "key": "all", "name": "全部", "icon": "📱", "color": "#f0f4ff" },
    { "key": "douyin", "name": "某音", "icon": "🎵", "color": "#fef2f2" },
    { "key": "kuaishou", "name": "某手", "icon": "⚡", "color": "#fefce8" },
    { "key": "shipinhao", "name": "某视频号", "icon": "📺", "color": "#ecfdf5" },
    { "key": "xiaohongshu", "name": "某红薯", "icon": "📖", "color": "#fdf2f8" },
    { "key": "baijiahao", "name": "某百家号", "icon": "📝", "color": "#eef2ff" }
  ]
}
```

---

### 1.4 公告模块

#### 获取公告列表
```
GET /api/announcements
```
**响应：**
```json
{
  "code": 0,
  "data": [
    "系统已升级至 V2.3，下单更流畅，发号更稳定",
    "新上架一批高粉账号，数量有限，先到先得"
  ]
}
```

---

### 1.5 统计模块

#### 获取站点统计
```
GET /api/stats
```
**响应：**
```json
{
  "code": 0,
  "data": {
    "total_sold": 12860,
    "online_products": 326,
    "good_rate": "99.7%"
  }
}
```

---

## 二、B端接口（后台管理系统）

> 所有B端接口需要管理员登录态，请求头携带 `Authorization: Bearer <token>`

### 2.1 管理员认证

#### 登录
```
POST /admin/api/login
```
**请求体：**
```json
{
  "username": "admin",
  "password": "admin123"
}
```
**响应：**
```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "nickname": "超级管理员",
      "role": "admin"
    }
  }
}
```

#### 获取当前用户信息
```
GET /admin/api/user/info
```
#### 退出登录
```
POST /admin/api/logout
```

---

### 2.2 商品管理（B端）

#### 商品列表
```
GET /admin/api/products
```
**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 搜索关键词(标题) |
| platform | string | 否 | 平台标识 |
| category | string | 否 | 内容分类 |
| is_verified | int | 否 | 认证状态(0/1) |
| gender | string | 否 | 粉丝偏好 |
| followers_min | int | 否 | 粉丝数最小值 |
| followers_max | int | 否 | 粉丝数最大值 |
| price_min | float | 否 | 价格最小值 |
| price_max | float | 否 | 价格最大值 |
| status | int | 否 | 上架状态(0/1) |
| stock_status | string | 否 | 库存状态(instock:有库存 outstock:已售罄) |
| start_date | string | 否 | 创建开始日期(YYYY-MM-DD) |
| end_date | string | 否 | 创建结束日期(YYYY-MM-DD) |
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页条数，默认20 |

**响应：**
```json
{
  "code": 0,
  "data": {
    "total": 10,
    "page": 1,
    "page_size": 20,
    "list": [
      {
        "id": 1,
        "title": "千粉女装赛道 · 真人实拍 · 高互动",
        "platform": "xiaohongshu",
        "category": "女装",
        "price": 38.00,
        "original_price": 68.00,
        "stock": 3,
        "followers": 1260,
        "likes": 8500,
        "favorites": 3200,
        "gender": "female",
        "gender_male_ratio": 22,
        "gender_female_ratio": 78,
        "is_verified": 1,
        "status": 1,
        "images": ["https://xxx/img1.jpg"],
        "created_at": "2026-05-01 10:00:00",
        "updated_at": "2026-05-10 14:30:00"
      }
    ]
  }
}
```

#### 商品详情
```
GET /admin/api/products/:id
```

#### 新增商品
```
POST /admin/api/products
```
**请求体：**
```json
{
  "title": "千粉女装赛道 · 真人实拍 · 高互动",
  "platform": "xiaohongshu",
  "category": "女装",
  "images": ["https://xxx/img1.jpg", "https://xxx/img2.jpg"],
  "price": 38.00,
  "original_price": 68.00,
  "stock": 3,
  "followers": 1260,
  "likes": 8500,
  "favorites": 3200,
  "gender": "female",
  "gender_male_ratio": 22,
  "gender_female_ratio": 78,
  "is_verified": 1,
  "description": "账号为真人实拍女装赛道...",
  "usage_guide": "1. 下单后系统自动发送账号及密码...",
  "status": 1
}
```

#### 编辑商品
```
PUT /admin/api/products/:id
```
**请求体：** 同新增

#### 删除商品
```
DELETE /admin/api/products/:id
```

#### 修改商品状态（上架/下架）
```
PATCH /admin/api/products/:id/status
```
**请求体：**
```json
{
  "status": 1
}
```

---

### 2.3 订单管理（B端）

#### 订单列表
```
GET /admin/api/orders
```
**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| order_no | string | 否 | 订单编号 |
| keyword | string | 否 | 商品标题关键词 |
| phone | string | 否 | 手机号 |
| status | string | 否 | 订单状态(pending/paid/refunded) |
| pay_method | string | 否 | 支付方式(wechat/alipay/qq) |
| start_date | string | 否 | 下单开始日期 |
| end_date | string | 否 | 下单结束日期 |
| page | int | 否 | 页码 |
| page_size | int | 否 | 每页条数 |

**响应：**
```json
{
  "code": 0,
  "data": {
    "total": 156,
    "list": [
      {
        "id": 1,
        "order_no": "RED20260510143000a1b2",
        "product_id": 1,
        "product_title": "千粉女装赛道 · 真人实拍 · 高互动",
        "product_image": "https://xxx/thumb.jpg",
        "price": 38.00,
        "phone": "138****6789",
        "pay_method": "wechat",
        "status": "paid",
        "account": "account_1@redbook.com",
        "password": "Pwd_a1b2c3d4",
        "paid_at": "2026-05-10 14:30:05",
        "created_at": "2026-05-10 14:30:00"
      }
    ]
  }
}
```

#### 订单详情
```
GET /admin/api/orders/:id
```

#### 编辑订单（补发账号/修改信息）
```
PUT /admin/api/orders/:id
```
**请求体：**
```json
{
  "phone": "13812345678",
  "status": "paid",
  "account": "new_account@redbook.com",
  "password": "new_password_123"
}
```

#### 删除订单
```
DELETE /admin/api/orders/:id
```

#### 订单退款
```
PATCH /admin/api/orders/:id/refund
```
**请求体：**
```json
{
  "reason": "买家申请退款"
}
```

#### 手动发货
```
PATCH /admin/api/orders/:id/deliver
```
**请求体：**
```json
{
  "account": "account_1@redbook.com",
  "password": "Pwd_a1b2c3d4"
}
```

---

### 2.4 平台管理（B端）

#### 平台列表
```
GET /admin/api/platforms
```
**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 平台名称搜索 |
| status | int | 否 | 状态(0/1) |

#### 平台详情
```
GET /admin/api/platforms/:id
```

#### 新增平台
```
POST /admin/api/platforms
```
**请求体：**
```json
{
  "platform_key": "douyin",
  "name": "某音",
  "icon": "🎵",
  "color": "#fef2f2",
  "sort_order": 1,
  "status": 1
}
```

#### 编辑平台
```
PUT /admin/api/platforms/:id
```

#### 删除平台
```
DELETE /admin/api/platforms/:id
```

#### 修改平台状态
```
PATCH /admin/api/platforms/:id/status
```
**请求体：**
```json
{
  "status": 1
}
```

---

### 2.5 公告管理（B端）

#### 公告列表
```
GET /admin/api/announcements
```
**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 否 | 内容搜索 |
| status | int | 否 | 状态(0/1) |

#### 公告详情
```
GET /admin/api/announcements/:id
```

#### 新增公告
```
POST /admin/api/announcements
```
**请求体：**
```json
{
  "content": "系统已升级至 V2.3，下单更流畅，发号更稳定",
  "sort_order": 1,
  "status": 1
}
```

#### 编辑公告
```
PUT /admin/api/announcements/:id
```

#### 删除公告
```
DELETE /admin/api/announcements/:id
```

#### 修改公告状态
```
PATCH /admin/api/announcements/:id/status
```

---

### 2.6 客户管理（B端）

#### 客户列表
```
GET /admin/api/customers
```
**请求参数：**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 否 | 手机号搜索 |
| start_date | string | 否 | 注册开始日期 |
| end_date | string | 否 | 注册结束日期 |
| page | int | 否 | 页码 |
| page_size | int | 否 | 每页条数 |

**响应：**
```json
{
  "code": 0,
  "data": {
    "total": 89,
    "list": [
      {
        "id": 1,
        "phone": "138****6789",
        "total_orders": 5,
        "total_amount": 526.00,
        "first_order_at": "2026-04-01 10:00:00",
        "last_order_at": "2026-05-10 14:30:00"
      }
    ]
  }
}
```

#### 客户详情
```
GET /admin/api/customers/:id
```
**响应：** 含客户基本信息和历史订单列表

#### 客户订单列表
```
GET /admin/api/customers/:id/orders
```

---

### 2.7 系统配置（B端）

#### 获取所有配置
```
GET /admin/api/configs
```

#### 批量更新配置
```
PUT /admin/api/configs
```
**请求体：**
```json
{
  "site_name": "账号商城",
  "site_description": "账号自动发号系统",
  "service_wechat": "kefu001",
  "pay_timeout_minutes": "15"
}
```

---

### 2.8 数据统计（B端）

#### 获取仪表盘数据
```
GET /admin/api/dashboard
```
**响应：**
```json
{
  "code": 0,
  "data": {
    "total_sold": 12860,
    "online_products": 326,
    "good_rate": "99.7%",
    "today_orders": 42,
    "today_amount": 3580.00,
    "pending_orders": 8,
    "order_trend_30days": [
      { "date": "2026-04-12", "count": 35, "amount": 2980.00 },
      { "date": "2026-04-13", "count": 42, "amount": 3520.00 }
    ],
    "platform_distribution": [
      { "platform": "xiaohongshu", "count": 86 },
      { "platform": "douyin", "count": 54 }
    ],
    "revenue_trend_7days": [
      { "date": "2026-05-05", "amount": 4280.00 },
      { "date": "2026-05-06", "amount": 5120.00 }
    ]
  }
}
```

---

## 接口汇总

### C端接口（7个）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/products | 商品列表 |
| GET | /api/products/:id | 商品详情 |
| GET | /api/orders | 订单列表(按手机号) |
| GET | /api/orders/:order_no | 订单详情 |
| POST | /api/orders | 创建订单(下单) |
| POST | /api/orders/:order_no/pay-callback | 支付回调 |
| GET | /api/platforms | 平台分类 |
| GET | /api/announcements | 公告列表 |
| GET | /api/stats | 站点统计 |

### B端接口（36个）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /admin/api/login | 登录 |
| GET | /admin/api/user/info | 当前用户信息 |
| POST | /admin/api/logout | 退出登录 |
| GET | /admin/api/products | 商品列表 |
| GET | /admin/api/products/:id | 商品详情 |
| POST | /admin/api/products | 新增商品 |
| PUT | /admin/api/products/:id | 编辑商品 |
| DELETE | /admin/api/products/:id | 删除商品 |
| PATCH | /admin/api/products/:id/status | 修改商品状态 |
| GET | /admin/api/orders | 订单列表 |
| GET | /admin/api/orders/:id | 订单详情 |
| PUT | /admin/api/orders/:id | 编辑订单 |
| DELETE | /admin/api/orders/:id | 删除订单 |
| PATCH | /admin/api/orders/:id/refund | 订单退款 |
| PATCH | /admin/api/orders/:id/deliver | 手动发货 |
| GET | /admin/api/platforms | 平台列表 |
| GET | /admin/api/platforms/:id | 平台详情 |
| POST | /admin/api/platforms | 新增平台 |
| PUT | /admin/api/platforms/:id | 编辑平台 |
| DELETE | /admin/api/platforms/:id | 删除平台 |
| PATCH | /admin/api/platforms/:id/status | 修改平台状态 |
| GET | /admin/api/announcements | 公告列表 |
| GET | /admin/api/announcements/:id | 公告详情 |
| POST | /admin/api/announcements | 新增公告 |
| PUT | /admin/api/announcements/:id | 编辑公告 |
| DELETE | /admin/api/announcements/:id | 删除公告 |
| PATCH | /admin/api/announcements/:id/status | 修改公告状态 |
| GET | /admin/api/customers | 客户列表 |
| GET | /admin/api/customers/:id | 客户详情 |
| GET | /admin/api/customers/:id/orders | 客户订单列表 |
| GET | /admin/api/configs | 获取配置 |
| PUT | /admin/api/configs | 更新配置 |
| GET | /admin/api/dashboard | 仪表盘数据 |

---

## 通用错误码

| code | 说明 |
|------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 未登录 |
| 1003 | 无权限 |
| 1004 | 资源不存在 |
| 1005 | 操作失败 |
| 2001 | 商品库存不足 |
| 2002 | 订单已过期 |
| 2003 | 订单状态不允许此操作 |
| 5000 | 服务器内部错误 |
