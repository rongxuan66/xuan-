const router = require('express').Router();
const { adminAuth } = require('../../middleware/auth');
const ctrl = require('../../controllers/b/orderController');

router.get('/', adminAuth, ctrl.list);
router.get('/export', adminAuth, ctrl.exportOrders);
router.get('/:id', adminAuth, ctrl.detail);
router.post('/:id/deliver', adminAuth, ctrl.deliver);
router.post('/:id/refund', adminAuth, ctrl.refund);
router.post('/:id/confirm-payment', adminAuth, ctrl.confirmPayment);

module.exports = router;
