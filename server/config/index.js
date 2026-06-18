require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

module.exports = {
  // 服务器配置
  port: process.env.PORT || 3002,
  env: process.env.NODE_ENV || 'development',

  // 数据库配置
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'rxweb',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4',
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'rxweb_jwt_secret_key_2026',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  // 七牛云配置
  qiniu: {
    ak: process.env.QINIU_AK || '',
    sk: process.env.QINIU_SK || '',
    bucket: process.env.QINIU_BUCKET || '',
    domain: process.env.QINIU_DOMAIN || '',
  },
};
