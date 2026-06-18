const router = require('express').Router();
const operationLog = require('../../middleware/operationLog');

router.use(operationLog);
router.use('/auth', require('./auth'));
router.use('/products', require('./products'));
router.use('/orders', require('./orders'));
router.use('/platforms', require('./platforms'));
router.use('/announcements', require('./announcements'));
router.use('/customers', require('./customers'));
router.use('/configs', require('./configs'));
router.use('/dashboard', require('./dashboard'));
router.use('/admins', require('./admins'));
router.use('/logs', require('./logs'));
router.use('/upload', require('./upload'));

module.exports = router;
