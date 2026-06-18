const router = require('express').Router();
const ctrl = require('../../controllers/c/paymentController');

router.get('/config', ctrl.getConfig);
router.get('/qrcode/:order_no', ctrl.getPayQrcode);
router.get('/status/:order_no', ctrl.queryOrderStatus);
router.get('/return', ctrl.returnHandler);
router.post('/return', ctrl.returnHandler);
router.get('/notify', ctrl.notify);
router.post('/notify', ctrl.notify);
router.post('/simulate/:order_no', ctrl.simulatePay);

module.exports = router;
