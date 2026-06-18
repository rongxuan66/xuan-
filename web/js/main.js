/**
 * 公共逻辑 — 账号发号系统
 * 依赖: jQuery, dayjs, API
 */
var currentProducts = [];
var currentPlatforms = [];
var paymentConfig = { configured: false, pay_types: ['wechat', 'alipay', 'qq'] };
var payMethodMeta = {
  wechat: { name: '微信', icon: '💚', cls: '' },
  alipay: { name: '支付宝', icon: '💙', cls: '' },
  qq: { name: 'QQ', icon: '💜', cls: '' },
};

$(function () {
  initApp();
});

function initApp() {
  initAuth();
  loadPaymentConfig();
  initAnnounceBar();
  initTabBar();
  initPlatformCats();
  initProductGrid();
}

/* ==================== 登录状态 ==================== */
function initAuth() {
  if (!Auth.isLoggedIn()) {
    renderNavGuest();
    return;
  }
  // 验证token是否仍然有效
  Auth.getProfile().then(function (res) {
    var data = handleResponse(res);
    if (data) {
      // 更新本地用户信息
      Auth.saveSession(Auth.getToken(), data);
      renderNavUser(data);
    } else {
      Auth.logout();
      renderNavGuest();
    }
  }).fail(function () {
    renderNavGuest();
  });
}

function renderNavGuest() {
  $('.nav-links').html(
    '<a href="orders.html">📋 <span>查订单</span></a>'
    + '<a href="login.html">🔑 <span>登录/注册</span></a>'
  );
}

function renderNavUser(user) {
  $('.nav-links').html(
    '<a href="orders.html">📋 <span>我的订单</span></a>'
    + '<span style="font-size:13px;color:var(--text-muted);cursor:pointer" onclick="location.href=\'profile.html\'">👤 ' + (user.nickname || user.phone) + '</span>'
    + '<a href="javascript:void(0)" onclick="handleLogout()" style="font-size:12px;color:#94a3b8">退出</a>'
  );
}

window.handleLogout = function () {
  Auth.logout();
  toast('已退出登录');
  renderNavGuest();
  // 如果当前在需要登录的页面，跳转到首页
  var path = window.location.pathname.split('/').pop();
  if (path === 'profile.html') {
    location.href = 'index.html';
  }
};

/* ==================== 支付配置 ==================== */
function loadPaymentConfig() {
  API.getPaymentConfig().then(function (res) {
    var data = handleResponse(res);
    if (data) {
      paymentConfig.configured = data.configured || false;
      paymentConfig.pay_types = data.pay_types || ['wechat', 'alipay', 'qq'];
    }
  }).fail(function () { /* keep defaults */ });
}

function renderPayMethods(selectedPay) {
  selectedPay = selectedPay || paymentConfig.pay_types[0] || 'wechat';
  return paymentConfig.pay_types.map(function (pt) {
    var meta = payMethodMeta[pt] || { name: pt, icon: '�', cls: '' };
    var sel = pt === selectedPay ? ' selected' : '';
    return '<div class="pay-method' + sel + '" data-pay="' + pt + '"><span class="pay-icon">' + meta.icon + '</span> ' + meta.name + '</div>';
  }).join('');
}

/* ==================== 自定义字段渲染 ==================== */
function renderCustomFields(customFields, containerId) {
  var $area = $(containerId || '#customFieldsArea');
  if (!$area.length) return;
  var fields = customFields;
  if (typeof fields === 'string') {
    try { fields = JSON.parse(fields); } catch (e) { fields = []; }
  }
  if (!fields || !fields.length) {
    $area.hide().html('');
    return;
  }
  var html = '';
  fields.forEach(function (f) {
    html += '<div class="form-group">'
      + '<label>' + (f.label || f.var) + '</label>'
      + '<input class="form-control custom-field-input" data-var="' + (f.var || '') + '" placeholder="请输入' + (f.label || f.var) + '">'
      + '</div>';
  });
  $area.html(html).show();
}

function collectCustomFields(containerId) {
  var data = {};
  $(containerId || '#customFieldsArea').find('.custom-field-input').each(function () {
    var varName = $(this).data('var');
    if (varName) data[varName] = $(this).val().trim();
  });
  return data;
}

/* ==================== 公告 ==================== */
function initAnnounceBar() {
  var $bar = $('.announce-bar .marquee');
  if (!$bar.length) return;
  API.getAnnouncements().then(function (res) {
    var data = handleResponse(res);
    if (data && data.length) {
      var texts = data.map(function (a) { return a.content; });
      $bar.html(texts.concat(texts).map(function (t) { return '<span>' + t + '</span>'; }).join(''));
    } else {
      $bar.html('<span>欢迎访问账号商城</span><span>欢迎访问账号商城</span>');
    }
  }).fail(function () {
    $bar.html('<span>欢迎访问账号商城</span><span>欢迎访问账号商城</span>');
  });
}

/* ==================== TabBar ==================== */
function initTabBar() {
  var path = window.location.pathname.split('/').pop() || 'index.html';
  var map = { 'index.html': 0, 'orders.html': 1, 'profile.html': 2, 'detail.html': -1, 'order-detail.html': -1 };
  var idx = map[path];
  if (idx >= 0) $('.mobile-tabbar .tab-item').eq(idx).addClass('active');
}

/* ==================== 数字格式化 ==================== */
function fmtNum(n) {
  n = Number(n);
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

/* ==================== 平台图标渲染 ==================== */
function renderPlatformIcon(icon, color) {
  color = color || '#f0f4ff';
  if (icon && (icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('uploads/'))) {
    return '<img src="' + icon + '" alt="" style="width:24px;height:24px;object-fit:contain">';
  }
  return icon || '📱';
}

/* ==================== 平台分类 ==================== */
function initPlatformCats() {
  var $cats = $('#platformCats');
  if (!$cats.length) return;
  API.getPlatforms().then(function (res) {
    var platforms = handleResponse(res) || [];
    currentPlatforms = platforms;
    var totalCount = platforms.reduce(function (sum, p) { return sum + (Number(p.product_count) || 0); }, 0);
    var html = '<div class="platform-cat active" data-platform="all">'
      + '<div class="cat-icon" style="background:#f0f4ff">📱</div>'
      + '<div class="cat-info"><div class="cat-name">全部</div>'
      + '<div class="cat-count" id="catCountAll">' + totalCount + ' 个商品</div>'
      + '</div></div>';
    platforms.forEach(function (p) {
      var count = Number(p.product_count) || 0;
      html += '<div class="platform-cat" data-platform="' + p.platform_key + '">'
        + '<div class="cat-icon" style="background:' + (p.color || '#f0f4ff') + '">' + renderPlatformIcon(p.icon, p.color) + '</div>'
        + '<div class="cat-info"><div class="cat-name">' + p.name + '</div>'
        + '<div class="cat-count" data-platform-count="' + p.platform_key + '">' + count + ' 个商品</div>'
        + '</div></div>';
    });
    $cats.html(html);

    $cats.on('click', '.platform-cat', function () {
      $cats.find('.platform-cat').removeClass('active');
      $(this).addClass('active');
      applyFilters(getCurrentPlatform());
    });

    loadProducts(getCurrentPlatform());
  }).fail(function () {
    var defaults = [
      { platform_key: 'all', name: '全部', icon: '📱', color: '#f0f4ff' },
      { platform_key: 'douyin', name: '某音', icon: '🎵', color: '#fef2f2' },
      { platform_key: 'kuaishou', name: '某手', icon: '⚡', color: '#fefce8' },
      { platform_key: 'shipinhao', name: '某视频号', icon: '📺', color: '#ecfdf5' },
      { platform_key: 'xiaohongshu', name: '某红薯', icon: '📖', color: '#fdf2f8' },
      { platform_key: 'baijiahao', name: '某百家号', icon: '📝', color: '#eef2ff' },
    ];
    currentPlatforms = defaults;
    initPlatformCatsFromData(defaults);
  });
}

function initPlatformCatsFromData(platforms) {
  var $cats = $('#platformCats');
  var html = '';
  platforms.forEach(function (p) {
    var cls = p.platform_key === 'all' ? ' active' : '';
    html += '<div class="platform-cat' + cls + '" data-platform="' + p.platform_key + '">'
      + '<div class="cat-icon" style="background:' + (p.color || '#f0f4ff') + '">' + renderPlatformIcon(p.icon, p.color) + '</div>'
      + '<div class="cat-info"><div class="cat-name">' + p.name + '</div>'
      + '<div class="cat-count">-- 个商品</div>'
      + '</div></div>';
  });
  $cats.html(html);
  $cats.on('click', '.platform-cat', function () {
    $cats.find('.platform-cat').removeClass('active');
    $(this).addClass('active');
    applyFilters(getCurrentPlatform());
  });
  loadProducts('all');
}

/* ==================== 筛选 ==================== */
function getCurrentPlatform() {
  var $active = $('#platformCats .platform-cat.active');
  return $active.length ? $active.data('platform') : 'all';
}

function buildApiParams(platform) {
  var params = { page: 1, pageSize: 100 };
  if (platform && platform !== 'all') params.platform = platform;

  var keyword = ($('#searchKeyword').val() || '').trim();
  if (keyword) params.keyword = keyword;

  return params;
}

function loadProducts(platform) {
  var params = buildApiParams(platform);
  API.getProducts(params).then(function (res) {
    var data = handleResponse(res);
    if (data && data.list) {
      currentProducts = data.list.map(function (p) {
        if (typeof p.images === 'string') {
          try { p.images = JSON.parse(p.images); } catch (e) { p.images = []; }
        }
        if (!p.images || !p.images.length) p.images = ['https://placehold.co/600x600/f1f5f9/94a3b8?text=N/A'];
        p.price = Number(p.price) || 0;
        p.original_price = Number(p.original_price) || 0;
        p.stock = Number(p.card_count > 0 ? (p.remain_stock !== undefined ? p.remain_stock : p.stock) : p.stock) || 0;
        return p;
      });
    } else {
      currentProducts = [];
    }
    renderProductGrid(currentProducts);
    updateDisplayCount(currentProducts.length);
    updatePlatformCounts();
  }).fail(function () {
    currentProducts = [];
    renderProductGrid([]);
    updateDisplayCount(0);
  });
}

function applyFilters(platform) {
  loadProducts(platform);
}

function updateDisplayCount(count) {
  $('.section-header span').text('共 ' + count + ' 个');
  if (count === 0) {
    $('#emptyTip').show(); $('.pagination-wrapper').hide();
  } else {
    $('#emptyTip').hide(); $('.pagination-wrapper').show();
  }
}

function updatePlatformCounts() {
  API.getPlatforms().then(function (res) {
    var platforms = handleResponse(res) || [];
    var totalCount = platforms.reduce(function (sum, p) { return sum + (Number(p.product_count) || 0); }, 0);
    $('#catCountAll').text(totalCount + ' 个商品');
    platforms.forEach(function (p) {
      var count = Number(p.product_count) || 0;
      var el = $('.cat-count[data-platform-count="' + p.platform_key + '"]');
      if (el.length) el.text(count + ' 个商品');
    });
  }).fail(function () {});
}

/* ==================== 商品卡片渲染 ==================== */
function renderProductCard(p) {
  var img = (p.images && p.images.length) ? p.images[0] : 'https://placehold.co/600x600/f1f5f9/94a3b8?text=N/A';
  var price = Number(p.price).toFixed(2);
  var stock = p.stock || 0;
  return '<div class="product-card" data-id="' + p.id + '" onclick="location.href=\'detail.html?id=' + p.id + '\'">'
    + '<div class="card-img">'
    + '<img src="' + img + '" alt="' + p.title + '" loading="lazy">'
    + '</div>'
    + '<div class="card-body">'
    + '<div class="card-title">' + p.title + '</div>'
    + '<div class="card-meta">'
    + '<span class="card-price"><span class="unit">¥</span>' + price + '</span>'
    + '<span class="card-stock">库存 ' + stock + '</span>'
    + '</div>'
    + '<button class="card-btn" onclick="event.stopPropagation(); location.href=\'detail.html?id=' + p.id + '\'">立即购买</button>'
    + '</div></div>';
}

function renderProductGrid(products) {
  var $grid = $('#productGrid');
  if (!$grid.length) return;
  if (!products) products = currentProducts;
  $grid.html(products.map(renderProductCard).join(''));
}

function initProductGrid() {
  var $grid = $('#productGrid');
  if ($grid.length && currentProducts.length) renderProductGrid(currentProducts);
}

/* ==================== 支付通用逻辑 ==================== */
function openPaymentGateway(payUrl, params) {
  // 创建表单 POST 跳转到支付网关（新窗口）
  var form = $('<form method="POST" action="' + payUrl + '" target="_blank" style="display:none"></form>');
  Object.keys(params).forEach(function (key) {
    form.append('<input type="hidden" name="' + key + '" value="' + params[key] + '">');
  });
  $('body').append(form);
  form.submit();
  setTimeout(function () { form.remove(); }, 500);
}

function buildPayQRContent(payData, orderNo, $container, $countdown) {
  if (payData && payData.pay_url) {
    // 有支付网关：自动跳转 + 倒计时
    openPaymentGateway(payData.pay_url, payData.params);
    $container.html(
      '<div style="text-align:center;padding:16px">'
      + '<p style="font-size:18px;margin-bottom:8px">🏦</p>'
      + '<p style="font-size:13px;color:#111827;font-weight:600">已跳转至支付页面</p>'
      + '<p style="font-size:12px;color:#94a3b8;margin-top:6px">请在打开的支付页面完成付款</p>'
      + '<p style="font-size:12px;color:#94a3b8;word-break:break-all">如未弹出，<a href="#" onclick="event.preventDefault();openPaymentGateway(\'' + payData.pay_url + '\', ' + JSON.stringify(payData.params).replace(/'/g, "\\'") + ')" style="color:#18a058">点此跳转</a></p>'
      + '</div>');
  } else {
    // 无支付网关：模拟支付
    $container.html(
      '<div style="text-align:center;padding:16px">'
      + '<p style="font-size:13px;color:#94a3b8;margin-bottom:12px">支付网关未配置，请使用模拟支付</p>'
      + '<button class="btn-submit" onclick="event.preventDefault();PayHelper.simulate(\'' + orderNo + '\')" style="display:inline-block;width:auto;padding:8px 24px">🧪 模拟支付</button>'
      + '</div>');
    if ($countdown) $countdown.hide();
  }
}

/* 支付辅助 */
window.PayHelper = {
  simulate: function (orderNo) {
    API.simulatePay(orderNo).then(function (res) {
      if (res && res.code === 0) {
        var local = OrderStore.getByNumber(orderNo);
        if (local) { local.status = 'paid'; OrderStore.save(); }
        toast('模拟支付成功！');
        setTimeout(function () { location.reload(); }, 800);
      } else {
        toast((res && res.message) || '模拟支付失败');
      }
    }).fail(function () {
      toast('网络错误');
    });
  },
};

/* ==================== 快捷购买（首页卡片） ==================== */
window.QuickBuy = {
  open: function (productId) {
    var p = currentProducts.find(function (x) { return x.id === productId; });
    if (!p) { toast('商品不存在'); return; }
    if (p.stock <= 0) { toast('该商品已售罄'); return; }

    var price = Number(p.price).toFixed(2);
    var overlay = $('<div class="modal-overlay" id="buyModal">'
      + '<div class="modal-box" style="position:relative">'
      + '<button class="btn-close-modal" onclick="$(\'#buyModal\').remove()">x</button>'
      + '<h4>确认购买</h4>'
      + '<p class="modal-sub">' + p.title + '</p>'
      + '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:rgba(24,160,88,0.06);border-radius:8px;margin-bottom:16px">'
      + '<span style="font-size:13px;color:var(--text-muted)">应付金额</span>'
      + '<span style="font-size:24px;font-weight:800;color:#ef4444">¥' + price + '</span></div>'
      + (Auth.isLoggedIn()
        ? '<div class="form-group"><label>已登录：' + Auth.getUser().phone + '</label><input type="hidden" id="buyPhone" value="' + Auth.getUser().phone + '"></div>'
        : '<div class="form-group"><label>手机号（用于查询订单）</label><input class="form-control" type="tel" id="buyPhone" placeholder="输入手机号以便查询订单"></div>')
      + '<div class="form-group"><label>选择支付方式</label>'
      + '<div class="pay-methods">'
      + renderPayMethods('wechat')
      + '</div></div>'
      + '<button class="btn-submit" id="btnConfirmPay">确认支付 ¥' + price + '</button>'
      + '<div class="qr-area" id="qrArea">'
      + '<div class="qr-img" id="qrContainer"></div>'
      + '<div class="countdown" id="countdown">支付剩余 15:00</div>'
      + '<button class="btn-paid" id="btnPaid">已支付 ✓</button>'
      + '</div>'
      + '</div></div>');
    $('body').append(overlay);
    overlay.on('click', function (e) { if (e.target === this) $(this).remove(); });

    overlay.find('.pay-method').on('click', function () {
      overlay.find('.pay-method').removeClass('selected');
      $(this).addClass('selected');
    });

    overlay.find('#btnConfirmPay').on('click', function () {
      var phone = overlay.find('#buyPhone').val().trim();
      var payMethod = overlay.find('.pay-method.selected').data('pay');
      QuickBuy.createOrderAndPay(overlay, p, phone, payMethod);
    });

    overlay.find('#btnPaid').on('click', function () {
      var orderNo = overlay.data('orderNo');
      if (orderNo) QuickBuy.checkPayment(overlay, orderNo);
    });
  },

  createOrderAndPay: function (overlay, p, phone, payMethod) {
    if (!phone && !Auth.isLoggedIn()) { toast('请输入手机号'); return; }
    overlay.find('#btnConfirmPay').prop('disabled', true).text('创建订单中...');

    var orderData = { product_id: p.id, pay_method: payMethod };
    if (!Auth.isLoggedIn()) orderData.phone = phone;
    API.createOrder(orderData).then(function (res) {
      if (res && res.code === 0) {
        var orderNo = res.data.order_no;
        overlay.data('orderNo', orderNo);
        var order = {
          orderNo: orderNo,
          productId: p.id,
          productTitle: p.title,
          productImage: (p.images && p.images.length) ? p.images[0] : '',
          price: Number(p.price),
          phone: phone,
          status: 'pending',
          createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        };
        OrderStore.add(order);
        QuickBuy.showQR(overlay, orderNo, payMethod);
      } else {
        toast((res && res.message) || '下单失败');
        overlay.find('#btnConfirmPay').prop('disabled', false).text('确认支付 ¥' + Number(p.price).toFixed(2));
      }
    }).fail(function () {
      toast('网络错误，请重试');
      overlay.find('#btnConfirmPay').prop('disabled', false).text('确认支付 ¥' + Number(p.price).toFixed(2));
    });
  },

  showQR: function (overlay, orderNo, payMethod) {
    overlay.find('#btnConfirmPay').hide();
    overlay.find('.pay-methods').hide();
    overlay.find('.form-group').hide();
    overlay.find('.modal-sub').text('订单号: ' + orderNo);
    overlay.find('#qrArea').show();

    var $container = overlay.find('#qrContainer');
    var $countdown = overlay.find('#countdown');

    API.getPaymentQrcode(orderNo).then(function (res) {
      if (res && res.code === 0 && res.data) {
        buildPayQRContent(res.data, orderNo, $container, $countdown);
      } else if (res && res.code === 1007) {
        // 支付未配置
        buildPayQRContent(null, orderNo, $container, $countdown);
      } else {
        $container.html('<div style="text-align:center;padding:20px;color:#94a3b8"><p>获取支付信息失败</p></div>');
      }
    }).fail(function () {
      $container.html('<div style="text-align:center;padding:20px;color:#94a3b8"><p>获取支付信息失败</p></div>');
    });

    var totalSec = (window.siteConfig.pay_timeout_minutes || 15) * 60;
    var remaining = totalSec;
    var $cd = overlay.find('#countdown');
    var timer = setInterval(function () {
      remaining--;
      var min = Math.floor(remaining / 60);
      var sec = remaining % 60;
      $cd.text('支付剩余 ' + min + ':' + (sec < 10 ? '0' : '') + sec);
      if (remaining < 60) $cd.addClass('warning');
      if (remaining <= 0) {
        clearInterval(timer);
        $cd.text('支付已超时');
        toast('支付超时，请重新下单');
      }
    }, 1000);
    overlay.data('payTimer', timer);
  },

  checkPayment: function (overlay, orderNo) {
    API.getPaymentStatus(orderNo).then(function (res) {
      if (res && res.code === 0 && res.data) {
        if (res.data.status === 'paid') {
          clearInterval(overlay.data('payTimer'));
          var local = OrderStore.getByNumber(orderNo);
          if (local) { local.status = 'paid'; OrderStore.save(); }
          toast('支付成功！查看订单详情');
          overlay.remove();
          setTimeout(function () { location.href = 'order-detail.html?no=' + orderNo; }, 500);
        } else {
          toast('订单尚未支付，请继续等待或联系客服');
        }
      } else {
        toast((res && res.message) || '查询支付状态失败');
      }
    }).fail(function () {
      toast('网络错误，请重试');
    });
  },
};

/* ==================== 详情页购买 ==================== */
window.DetailBuy = {
  init: function (p) {
    var $form = $('#detailBuyForm');
    if (!$form.length) return;

    $form.find('.pay-method').on('click', function () {
      $form.find('.pay-method').removeClass('selected');
      $(this).addClass('selected');
    });

    $form.find('#btnDetailPay').on('click', function () {
      if (p.stock <= 0) { toast('该商品已售罄'); return; }
      var phone = $('#detailPhone').val() ? $('#detailPhone').val().trim() : '';
      if (!phone && !Auth.isLoggedIn() && p.delivery_type !== 'url') { toast('请输入手机号'); return; }
      var payMethod = $form.find('.pay-method.selected').data('pay');
      DetailBuy.createOrderAndPay(p, phone, payMethod);
    });

    $form.find('#btnDetailPaid').on('click', function () {
      var orderNo = $form.data('orderNo');
      if (orderNo) DetailBuy.checkPayment(orderNo);
    });
  },

  createOrderAndPay: function (p, phone, payMethod) {
    $('#btnDetailPay').prop('disabled', true).text('创建订单中...');

    var orderData = { product_id: p.id, pay_method: payMethod };
    if (!Auth.isLoggedIn()) orderData.phone = phone;
    var customData = collectCustomFields('#customFieldsArea');
    if (Object.keys(customData).length) orderData.custom_data = customData;
    API.createOrder(orderData).then(function (res) {
      if (res && res.code === 0) {
        var orderNo = res.data.order_no;
        $('#detailBuyForm').data('orderNo', orderNo);
        var order = {
          orderNo: orderNo,
          productId: p.id,
          productTitle: p.title,
          productImage: (p.images && p.images.length) ? p.images[0] : '',
          price: Number(p.price),
          phone: phone,
          status: 'pending',
          createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        };
        OrderStore.add(order);
        DetailBuy.showQR(orderNo, payMethod);
      } else {
        toast((res && res.message) || '下单失败');
        $('#btnDetailPay').prop('disabled', false).text('确认支付 ¥' + Number(p.price).toFixed(2));
      }
    }).fail(function () {
      toast('网络错误，请重试');
      $('#btnDetailPay').prop('disabled', false).text('确认支付 ¥' + Number(p.price).toFixed(2));
    });
  },

  showQR: function (orderNo, payMethod) {
    $('#detailBuyForm .pay-methods').hide();
    $('#detailBuyForm #detailPhone').prop('disabled', true);
    $('#detailBuyForm #btnDetailPay').hide();
    $('#detailBuyForm .form-group').first().find('label').text('手机号（选填）');
    $('#detailQRArea').show();

    var $container = $('#detailQRContainer');
    var $countdown = $('#detailCountdown');

    API.getPaymentQrcode(orderNo).then(function (res) {
      if (res && res.code === 0 && res.data) {
        buildPayQRContent(res.data, orderNo, $container, $countdown);
      } else if (res && res.code === 1007) {
        buildPayQRContent(null, orderNo, $container, $countdown);
      } else {
        $container.html('<div style="text-align:center;padding:20px;color:#94a3b8"><p>获取支付信息失败</p></div>');
      }
    }).fail(function () {
      $container.html('<div style="text-align:center;padding:20px;color:#94a3b8"><p>获取支付信息失败</p></div>');
    });

    var totalSec = (window.siteConfig.pay_timeout_minutes || 15) * 60, remaining = totalSec;
    var $cd = $('#detailCountdown');
    var timer = setInterval(function () {
      remaining--;
      var min = Math.floor(remaining / 60), sec = remaining % 60;
      $cd.text('支付剩余 ' + min + ':' + (sec < 10 ? '0' : '') + sec);
      if (remaining < 60) $cd.addClass('warning');
      if (remaining <= 0) { clearInterval(timer); $cd.text('支付已超时'); toast('支付超时，请重新下单'); }
    }, 1000);
    $('#detailBuyForm').data('payTimer', timer);
  },

  checkPayment: function (orderNo) {
    API.getPaymentStatus(orderNo).then(function (res) {
      if (res && res.code === 0 && res.data) {
        if (res.data.status === 'paid') {
          clearInterval($('#detailBuyForm').data('payTimer'));
          var local = OrderStore.getByNumber(orderNo);
          if (local) { local.status = 'paid'; OrderStore.save(); }
          toast('支付成功！查看订单详情');
          setTimeout(function () { location.href = 'order-detail.html?no=' + orderNo; }, 500);
        } else {
          toast('订单尚未支付，请继续等待或联系客服');
        }
      } else {
        toast((res && res.message) || '查询失败');
      }
    }).fail(function () { toast('网络错误，请重试'); });
  },
};

/* ==================== 图片预览 ==================== */
window.previewImage = function (url) {
  var overlay = $('<div class="img-preview-overlay" onclick="$(this).remove()"><img src="' + url + '" alt="预览"></div>');
  $('body').append(overlay);
};

/* ==================== Toast ==================== */
window.toast = function (msg) {
  var t = $('<div class="toast">' + msg + '</div>');
  $('body').append(t);
  setTimeout(function () { t.fadeOut(300, function () { t.remove(); }); }, 2200);
};

/* ==================== 复制 ==================== */
window.copyText = function (text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(function () { toast('已复制到剪贴板'); });
  } else {
    var ta = $('<textarea>').val(text).appendTo('body').select();
    document.execCommand('copy'); ta.remove(); toast('已复制到剪贴板');
  }
};

/* 导出到全局 */
window.fmtNum = fmtNum;
window.renderProductCard = renderProductCard;
window.renderProductGrid = renderProductGrid;
window.applyFilters = applyFilters;
window.getCurrentPlatform = getCurrentPlatform;
window.currentProducts = currentProducts;
