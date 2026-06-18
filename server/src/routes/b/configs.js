const router = require('express').Router();
const { adminAuth } = require('../../middleware/auth');
const ctrl = require('../../controllers/b/configController');

router.get('/', adminAuth, ctrl.list);
router.put('/', adminAuth, ctrl.update);
router.get('/pay', adminAuth, ctrl.getPayConfig);
router.put('/pay', adminAuth, ctrl.payConfig);

module.exports = router;
