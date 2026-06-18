const path = require('path');
const fs = require('fs');
const response = require('../../utils/response');
const crypto = require('crypto');

const UPLOAD_DIR = path.join(__dirname, '../../../public/uploads');

// ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

exports.upload = (req, res) => {
  try {
    if (!req.file) {
      return response(res, 1004, '请选择文件');
    }
    const ext = path.extname(req.file.originalname) || '.jpg';
    const name = crypto.randomBytes(16).toString('hex') + ext;
    const dest = path.join(UPLOAD_DIR, name);
    fs.renameSync(req.file.path, dest);
    const protocol = req.protocol;
    const host = req.get('host');
    const url = protocol + '://' + host + '/uploads/' + name;
    response(res, 0, '上传成功', { url });
  } catch (err) {
    console.error('[B]文件上传失败:', err);
    response(res, 500, '上传失败');
  }
};
