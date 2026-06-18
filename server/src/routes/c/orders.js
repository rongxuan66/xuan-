const router = require('express').Router();
const ctrl = require('../../controllers/c/orderController');
const { userAuth, requireUserAuth } = require('../../middleware/auth');

router.get('/', requireUserAuth, ctrl.list);
router.post('/', userAuth, ctrl.create);
router.get('/:id', userAuth, ctrl.detail);

module.exports = router;
