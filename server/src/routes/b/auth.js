const router = require('express').Router();
const { adminAuth } = require('../../middleware/auth');
const ctrl = require('../../controllers/b/authController');

router.post('/login', ctrl.login);
router.get('/info', adminAuth, ctrl.info);

module.exports = router;
