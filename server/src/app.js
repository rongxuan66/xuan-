const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const config = require('../config');
const response = require('./utils/response');

const cRoutes = require('./routes/c');
const bRoutes = require('./routes/b');

const app = express();

// 中间件
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// C端（用户端）路由
app.use('/api', cRoutes);

// B端（管理端）路由
app.use('/admin/api', bRoutes);

// 七牛云上传凭证
app.get('/api/upload/token', (req, res) => {
  const { getUploadToken, domain } = require('./utils/qiniu');
  response(res, 0, 'success', { token: getUploadToken(), domain });
});

// 静态文件（web前端 & 上传文件）
const webDir = path.join(__dirname, '../../web');
const publicDir = path.join(__dirname, '../public');
app.use(express.static(webDir));
app.use('/uploads', express.static(path.join(publicDir, 'uploads')));

// 404
app.use((req, res) => {
  response(res, 404, '接口不存在');
});

// 错误处理
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err);
  response(res, 500, err.message || '服务器内部错误');
});

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
