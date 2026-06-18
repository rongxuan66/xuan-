const router = require('express').Router();
const { adminAuth } = require('../../middleware/auth');
const ctrl = require('../../controllers/b/customerController');

router.get('/', adminAuth, ctrl.list);
router.get('/:id', adminAuth, ctrl.detail);
router.get('/:id/orders', adminAuth, ctrl.orders);

module.exports = router;
