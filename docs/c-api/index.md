# C端（用户端）API 接口文档

Base URL: `http://localhost:3000/api`

## 通用响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 状态码说明

| code | 说明 |
|------|------|
| 0 | 成功 |
| 404 | 接口不存在 |
| 500 | 服务器错误 |
| 1001 | 资源不存在 |
| 1002 | 未登录/密码错误 |
| 1004 | 参数不完整 |
| 1005 | 库存不足 |
| 1006 | 订单状态不正确 |
| 1007 | 支付接口未配置 |

---

## 1. 商品

### 1.1 商品列表

```
GET /api/products
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| platform | string | 否 | 平台标识 (douyin/kuaishou/shipinhao/xiaohongshu/baijiahao) |
| category | string | 否 | 分类 |
| gender | string | 否 | 粉丝偏好 (female/male/balanced) |
| is_verified | int | 否 | 是否认证 (0/1) |
| keyword | string | 否 | 搜索关键词 |
| min_price | number | 否 | 最低价格 |
| max_price | number | 否 | 最高价格 |
| min_followers | number | 否 | 最低粉丝数 |
| max_followers | number | 否 | 最高粉丝数 |
| page | int | 否 | 页码，默认1 |
| pageSize | int | 否 | 每页条数，默认12 |
| sort | string | 否 | 排序字段 (created_at/price/followers/likes/favorites/stock) |
| order | string | 否 | 排序方向 (asc/desc)，默认desc |

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "抖音10万粉丝号",
        "platform": "douyin",
        "category": "生活",
        "images": "[\"https://example.com/img1.jpg\"]",
        "price": "299.00",
        "original_price": "599.00",
        "stock": 5,
        "followers": 100000,
        "likes": 500000,
        "favorites": 20000,
        "gender": "female",
        "gender_male_ratio": 30,
        "gender_female_ratio": 70,
        "is_verified": 1,
        "description": "账号描述",
        "usage_guide": "使用说明",
        "remain_stock": 3,
        "created_at": "2026-05-12T10:00:00.000Z"
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 12
  }
}
```

### 1.2 商品详情

```
GET /api/products/:id
```

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "title": "抖音10万粉丝号",
    "images": "[\"https://example.com/img1.jpg\"]",
    "price": "299.00",
    "remain_stock": 3
  }
}
```

---

## 2. 订单

### 2.1 创建订单

```
POST /api/orders
```

**请求参数**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| product_id | int | 是 | 商品ID |
| phone | string | 是 | 买家手机号 |
| pay_method | string | 是 | 支付方式 (wechat/alipay/qq) |

**请求示例**

```json
{
  "product_id": 1,
  "phone": "13800138000",
  "pay_method": "wechat"
}
```

**响应示例**

```json
{
  "code": 0,
  "message": "下单成功",
  "data": {
    "order_no": "RX202605121430ABC123",
    "price": "299.00"
  }
}
```

### 2.2 查询订单

```
GET /api/orders/:order_no
```

---

## 3. 支付

### 3.1 获取支付二维码/链接

```
GET /api/payment/qrcode/:order_no
```

### 3.2 查询订单支付状态

```
GET /api/payment/status/:order_no
```

### 3.3 支付回调通知

```
POST /api/payment/notify
```

此接口由支付平台回调，商户无需主动调用。

---

## 4. 平台

### 4.1 平台列表

```
GET /api/platforms
```

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "platform_key": "douyin",
      "name": "抖音",
      "icon": "🎵",
      "color": "#f0f4ff"
    }
  ]
}
```

---

## 5. 公告

### 5.1 公告列表

```
GET /api/announcements
```

---

## 6. 上传

### 6.1 获取七牛云上传凭证

```
GET /api/upload/token
```

**响应示例**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "xxxx",
    "domain": "https://tevadqicd.bkt.gdipper.com"
  }
}
```
