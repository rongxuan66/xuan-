const router = require('express').Router();
const ctrl = require('../../controllers/c/authController');
const { requireUserAuth } = require('../../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.get('/profile', requireUserAuth, ctrl.profile);
router.put('/profile', requireUserAuth, ctrl.updateProfile);

module.exports = router;
