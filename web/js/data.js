/**
 * 数据层 — 对接后端 API
 */

// 统一的 API 响应处理
function handleResponse(res) {
  if (res && res.code === 0) {
    return res.data;
  }
  var msg = (res && res.message) || '请求失败';
  console.error('[API]', msg);
  return null;
}

// Toast 提示
function toast(msg) {
  var t = $('<div class="toast">' + msg + '</div>');
  $('body').append(t);
  setTimeout(function () { t.fadeOut(300, function () { t.remove(); }); }, 2200);
}

// 站点配置缓存
window.siteConfig = { site_name: '账号商城', service_wechat: '', pay_timeout_minutes: 15 };

// 加载站点配置并应用到页面
function loadSiteConfig() {
  API.getSiteConfig().then(function (res) {
    var cfg = handleResponse(res);
    if (!cfg) return;
    // 更新站点名
    if (cfg.site_name && cfg.site_name !== window.siteConfig.site_name) {
      window.siteConfig.site_name = cfg.site_name;
      document.title = document.title.replace(/账号商城/g, cfg.site_name);
      $('.logo').each(function () {
        var $t = $(this);
        $t.html($t.html().replace(/账号商城/g, cfg.site_name));
      });
      $('.site-footer p').each(function () {
        var $t = $(this);
        $t.html($t.html().replace(/账号商城/g, cfg.site_name));
      });
    }
    // 始终同步客服微信
    window.siteConfig.service_wechat = cfg.service_wechat || '';
    $('.service-wechat').each(function () {
      var $t = $(this);
      var label = $t.data('label') || '微信';
      $t.text(cfg.service_wechat ? label + '：' + cfg.service_wechat : '');
    });
    $('.service-wechat-inline').text(cfg.service_wechat || 'kefu001');
    if (cfg.pay_timeout_minutes) {
      window.siteConfig.pay_timeout_minutes = Number(cfg.pay_timeout_minutes);
    }
  }).fail(function (err) { console.error('[SiteConfig] 加载失败:', err); });
}

// 本地订单存储（用于订单查询便利）
var OrderStore = {
  _key: 'red_orders',
  getAll: function () {
    try { return JSON.parse(localStorage.getItem(this._key)) || []; } catch (e) { return []; }
  },
  add: function (order) {
    var orders = this.getAll();
    orders.unshift(order);
    localStorage.setItem(this._key, JSON.stringify(orders));
  },
  getByNumber: function (orderNo) {
    return this.getAll().find(function (o) { return o.orderNo === orderNo; });
  },
  save: function () {
    localStorage.setItem(this._key, JSON.stringify(this.getAll()));
  },
};
