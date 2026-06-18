/**
 * C-end API 服务层
 * Base URL: http://localhost:3000/api
 */
var API_BASE = '/api';

var API = {

  // ==================== 商品 ====================
  getProducts: function (params) {
    return $.get(API_BASE + '/products', params);
  },

  getProductDetail: function (id) {
    return $.get(API_BASE + '/products/' + id);
  },

  // ==================== 订单 ====================
  createOrder: function (data) {
    var headers = {};
    if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
      headers['Authorization'] = 'Bearer ' + Auth.getToken();
    }
    return $.ajax({
      url: API_BASE + '/orders',
      method: 'POST',
      contentType: 'application/json',
      headers: headers,
      data: JSON.stringify(data),
    });
  },

  getOrder: function (orderNo) {
    return $.get(API_BASE + '/orders/' + orderNo);
  },

  // ==================== 支付 ====================
  getPaymentConfig: function () {
    return $.get(API_BASE + '/payment/config');
  },

  getPaymentQrcode: function (orderNo) {
    return $.get(API_BASE + '/payment/qrcode/' + orderNo);
  },

  getPaymentStatus: function (orderNo) {
    return $.get(API_BASE + '/payment/status/' + orderNo);
  },

  simulatePay: function (orderNo) {
    return $.ajax({
      url: API_BASE + '/payment/simulate/' + orderNo,
      method: 'POST',
    });
  },

  // ==================== 站点配置 ====================
  getSiteConfig: function () {
    return $.get(API_BASE + '/config');
  },

  // ==================== 平台 ====================
  getPlatforms: function () {
    return $.get(API_BASE + '/platforms');
  },

  // ==================== 公告 ====================
  getAnnouncements: function () {
    return $.get(API_BASE + '/announcements');
  },

  // ==================== 上传凭证 ====================
  getUploadToken: function () {
    return $.get(API_BASE + '/upload/token');
  },
};
