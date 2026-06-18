/**
 * 简易日志记录
 */
const logger = {
  info: (msg, data = '') => {
    const time = new Date().toISOString();
    console.log(`[INFO  ${time}] ${msg}`, data ? JSON.stringify(data) : '');
  },
  warn: (msg, data = '') => {
    const time = new Date().toISOString();
    console.warn(`[WARN  ${time}] ${msg}`, data ? JSON.stringify(data) : '');
  },
  error: (msg, data = '') => {
    const time = new Date().toISOString();
    console.error(`[ERROR ${time}] ${msg}`, data ? JSON.stringify(data) : '');
  },
};

module.exports = logger;
