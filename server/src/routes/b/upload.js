const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const os = require('os');
const ctrl = require('../../controllers/b/uploadController');

const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('仅支持 jpg/png/gif/webp 格式'));
    }
  },
});

router.post('/', upload.single('file'), ctrl.upload);

module.exports = router;
