const md5 = require('md5');

/**
 * MD5加密
 * @param {string} str - 明文
 * @returns {string} 密文
 */
const md5Encrypt = (str) => {
  return md5(str);
};

/**
 * 验证MD5密码
 * @param {string} plain - 明文
 * @param {string} encrypted - 密文
 * @returns {boolean}
 */
const md5Verify = (plain, encrypted) => {
  return md5(plain) === encrypted;
};

module.exports = {
  md5Encrypt,
  md5Verify,
};
