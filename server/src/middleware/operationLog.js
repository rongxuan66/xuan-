const pool = require('../utils/db');

/**
 * 管理员操作日志中间件
 * 记录所有 POST/PUT/DELETE 操作
 */
const operationLog = (req, res, next) => {
  // 只记录写操作
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // 从路径推断操作目标和类型
  const path = req.path.replace(/\/\d+$/, ''); // 去掉末尾数字ID
  const parts = path.split('/').filter(Boolean);
  const resource = parts[parts.length - 1] || path; // 资源名
  const targetId = req.params.id || '';

  const actionMap = {
    POST: '创建',
    PUT: '更新',
    DELETE: '删除',
  };
  const action = actionMap[req.method] || req.method;

  // 记录原始 json 方法
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    // 异步记录日志，不阻塞响应
    const adminId = req.adminId || 0;
    const adminName = req.adminName || '';
    const detail = JSON.stringify({ method: req.method, path: req.originalUrl, body: req.body, result: body && body.code });

    if (adminId) {
      pool.query(
        'INSERT INTO operation_logs (admin_id, admin_name, action, target, target_id, detail, ip) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [adminId, adminName, action, resource, targetId, detail, req.ip || '']
      ).catch(err => console.error('[操作日志]写入失败:', err));
    }

    res.json = originalJson;
    return originalJson(body);
  };

  next();
};

module.exports = operationLog;
