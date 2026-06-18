const router = require('express').Router();

router.use('/auth', require('./auth'));
router.use('/config', require('./config'));
router.use('/products', require('./products'));
router.use('/orders', require('./orders'));
router.use('/payment', require('./payment'));
router.use('/platforms', require('./platforms'));
router.use('/announcements', require('./announcements'));

module.exports = router;
