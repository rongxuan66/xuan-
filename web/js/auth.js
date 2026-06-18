/**
 * C端认证服务层
 * 管理用户登录状态、Token存储、认证API调用
 */
var Auth = {
  _key: 'rx_user',

  getToken: function () {
    return localStorage.getItem(this._key + '_token') || '';
  },

  getUser: function () {
    try { return JSON.parse(localStorage.getItem(this._key + '_info')); } catch (e) { return null; }
  },

  isLoggedIn: function () {
    return !!this.getToken();
  },

  saveSession: function (token, user) {
    localStorage.setItem(this._key + '_token', token);
    localStorage.setItem(this._key + '_info', JSON.stringify(user));
  },

  logout: function () {
    localStorage.removeItem(this._key + '_token');
    localStorage.removeItem(this._key + '_info');
  },

  // ==================== API ====================

  register: function (phone, password, nickname) {
    return $.ajax({
      url: API_BASE + '/auth/register',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ phone: phone, password: password, nickname: nickname || '' }),
    });
  },

  login: function (phone, password) {
    return $.ajax({
      url: API_BASE + '/auth/login',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ phone: phone, password: password }),
    });
  },

  getProfile: function () {
    return $.ajax({
      url: API_BASE + '/auth/profile',
      method: 'GET',
      headers: { Authorization: 'Bearer ' + this.getToken() },
    });
  },

  updateProfile: function (nickname) {
    return $.ajax({
      url: API_BASE + '/auth/profile',
      method: 'PUT',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + this.getToken() },
      data: JSON.stringify({ nickname: nickname }),
    });
  },

  getMyOrders: function (params) {
    return $.ajax({
      url: API_BASE + '/orders',
      method: 'GET',
      headers: { Authorization: 'Bearer ' + this.getToken() },
      data: params || {},
    });
  },
};
