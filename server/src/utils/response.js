/**
 * 统一响应格式
 * @param {object} res - express response对象
 * @param {number} code - 状态码 0:成功 其他:失败
 * @param {string} message - 提示信息
 * @param {*} data - 返回数据
 */
const response = (res, code = 0, message = 'success', data = null) => {
  const result = {
    code,
    message,
    data,
  };
  return res.json(result);
};

module.exports = response;
