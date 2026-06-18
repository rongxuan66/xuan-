const jwt = require('jsonwebtoken');
const config = require('../../config');

/**
 * 生成JWT令牌
 * @param {object} payload - 载荷数据
 * @returns {string} token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

/**
 * 验证JWT令牌
 * @param {string} token - 令牌
 * @returns {object|null} 解码后的数据
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
