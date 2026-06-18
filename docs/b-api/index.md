# B端（管理端）API 接口文档

Base URL: `http://localhost:3000/admin/api`

## 认证说明

除登录接口外，所有B端接口需在Header中携带JWT令牌：

```
Authorization: Bearer <token>
```

---

## 1. 管理员认证

### 1.1 登录

```
POST /admin/api/auth/login
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 (MD5) |

**响应示例**

```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "nickname": "超级管理员",
      "avatar": "",
      "role": "admin"
    }
  }
}
```

### 1.2 获取当前用户信息

```
GET /admin/api/auth/info
```

---

## 2. 商品管理

### 2.1 商品列表

```
GET /admin/api/products
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| platform | string | 否 | 平台筛选 |
| category | string | 否 | 分类筛选 |
| status | int | 否 | 状态筛选 (0/1) |
| keyword | string | 否 | 标题搜索 |
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页条数，默认15 |

### 2.2 商品详情

```
GET /admin/api/products/:id
```

### 2.3 创建商品

```
POST /admin/api/products
```

请求体包含所有商品字段，可选 `cards` 数组批量导入卡号。

### 2.4 更新商品

```
PUT /admin/api/products/:id
```

### 2.5 删除商品

```
DELETE /admin/api/products/:id
```

会同时删除关联的卡号。

### 2.6 商品卡号列表

```
GET /admin/api/products/:product_id/cards
```

### 2.7 批量导入卡号

```
POST /admin/api/products/:product_id/cards
```

```json
{
  "cards": ["账号1----密码1", "账号2----密码2"]
}
```

### 2.8 删除卡号

```
DELETE /admin/api/products/cards/:card_id
```

---

## 3. 订单管理

### 3.1 订单列表

```
GET /admin/api/orders
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| order_no | string | 否 | 订单号搜索 |
| phone | string | 否 | 手机号搜索 |
| status | string | 否 | 状态筛选 (pending/paid/refunded) |
| pay_method | string | 否 | 支付方式 |
| start_date | string | 否 | 开始日期 |
| end_date | string | 否 | 结束日期 |
| page | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |

### 3.2 订单详情

```
GET /admin/api/orders/:id
```

### 3.3 手工发货

```
POST /admin/api/orders/:id/deliver
```

```json
{
  "account": "发货账号",
  "password": "发货密码"
}
```

### 3.4 退款

```
POST /admin/api/orders/:id/refund
```

退款后自动释放已分配的卡号。

### 3.5 导出订单

```
GET /admin/api/orders/export
```

支持 status/start_date/end_date 筛选。

---

## 4. 平台管理

### 4.1 平台列表

```
GET /admin/api/platforms
```

### 4.2 平台详情

```
GET /admin/api/platforms/:id
```

### 4.3 创建平台

```
POST /admin/api/platforms
```

```json
{
  "platform_key": "douyin",
  "name": "抖音",
  "icon": "🎵",
  "color": "#f0f4ff",
  "sort_order": 1,
  "status": 1
}
```

### 4.4 更新平台

```
PUT /admin/api/platforms/:id
```

### 4.5 删除平台

```
DELETE /admin/api/platforms/:id
```

---

## 5. 公告管理

### 5.1 公告列表

```
GET /admin/api/announcements
```

### 5.2 公告详情

```
GET /admin/api/announcements/:id
```

### 5.3 创建公告

```
POST /admin/api/announcements
```

```json
{
  "content": "公告内容",
  "sort_order": 0,
  "status": 1
}
```

### 5.4 更新公告

```
PUT /admin/api/announcements/:id
```

### 5.5 删除公告

```
DELETE /admin/api/announcements/:id
```

---

## 6. 客户管理

### 6.1 客户列表

```
GET /admin/api/customers
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| phone | string | 否 | 手机号搜索 |
| page | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |

### 6.2 客户详情

```
GET /admin/api/customers/:id
```

### 6.3 客户订单列表

```
GET /admin/api/customers/:id/orders
```

---

## 7. 系统配置

### 7.1 获取配置列表

```
GET /admin/api/configs
```

### 7.2 批量更新配置

```
PUT /admin/api/configs
```

```json
{
  "configs": [
    { "config_key": "site_name", "config_value": "账号商城" }
  ]
}
```

### 7.3 获取支付配置

```
GET /admin/api/configs/pay
```

### 7.4 保存支付配置

```
PUT /admin/api/configs/pay
```

```json
{
  "api_url": "https://pay.example.com/submit.php",
  "pid": "1001",
  "key": "your_secret_key",
  "notify_url": "https://your-domain.com/api/payment/notify",
  "return_url": "https://your-domain.com/pay-result",
  "pay_types": ["wechat", "alipay", "qq"],
  "status": 1
}
```

---

## 8. 仪表盘

### 8.1 统计数据

```
GET /admin/api/dashboard/stats
```

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "product_count": 150,
    "order_count": 520,
    "total_revenue": "89600.00",
    "customer_count": 320,
    "today_orders": 12,
    "today_revenue": "3200.00",
    "recent_orders": [],
    "platform_stats": [],
    "order_trend": [
      { "date": "2026-05-06", "count": 8, "revenue": "2400.00" }
    ]
  }
}
```

---

## 9. 管理员管理（仅超级管理员）

所有接口需要 admin 角色权限。

### 9.1 管理员列表

```
GET /admin/api/admins
```

### 9.2 创建管理员

```
POST /admin/api/admins
```

```json
{
  "username": "editor1",
  "password": "123456",
  "nickname": "编辑员",
  "role": "editor"
}
```

### 9.3 更新管理员

```
PUT /admin/api/admins/:id
```

### 9.4 删除管理员

```
DELETE /admin/api/admins/:id
```

不能删除最后一个超级管理员。

---

## 10. 操作日志

### 10.1 日志列表

```
GET /admin/api/logs
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| admin_name | string | 否 | 操作人搜索 |
| action | string | 否 | 操作类型 |
| start_date | string | 否 | 开始日期 |
| end_date | string | 否 | 结束日期 |
| page | int | 否 | 页码 |
| pageSize | int | 否 | 每页条数 |
