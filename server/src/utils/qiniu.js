const qiniu = require('qiniu');
const config = require('../../config');

const mac = new qiniu.auth.digest.Mac(config.qiniu.ak, config.qiniu.sk);
const putPolicy = new qiniu.rs.PutPolicy({
  scope: config.qiniu.bucket,
  expires: 7200,
});

/**
 * 获取七牛云上传凭证
 * @returns {string} uploadToken
 */
const getUploadToken = () => {
  return putPolicy.uploadToken(mac);
};

module.exports = {
  getUploadToken,
  domain: config.qiniu.domain,
};
