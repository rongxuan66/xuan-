const { verifyToken } = require('../utils/jwt');
const response = require('../utils/response');

/**
 * 管理员认证中间件
 */
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 1002, message: '未登录', data: null });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ code: 1002, message: '令牌无效或已过期', data: null });
  }
  req.adminId = decoded.id;
  req.adminRole = decoded.role;
  req.adminName = decoded.username || '';
  next();
};

/**
 * 超级管理员权限校验
 */
const requireAdminRole = (req, res, next) => {
  if (req.adminRole !== 'admin') {
    return response(res, 1003, '无权限');
  }
  next();
};

/**
 * C端用户认证中间件（可选：不强制，仅解析token）
 */
const userAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    if (decoded) {
      req.userId = decoded.id;
      req.userPhone = decoded.phone;
    }
  }
  next();
};

/**
 * C端用户认证中间件（强制：未登录返回401）
 */
const requireUserAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 1002, message: '请先登录', data: null });
  }
  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ code: 1002, message: '令牌无效或已过期', data: null });
  }
  req.userId = decoded.id;
  req.userPhone = decoded.phone;
  next();
};

module.exports = {
  adminAuth,
  requireAdminRole,
  userAuth,
  requireUserAuth,
};
