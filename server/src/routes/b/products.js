const router = require('express').Router();
const { adminAuth } = require('../../middleware/auth');
const ctrl = require('../../controllers/b/productController');

router.get('/', adminAuth, ctrl.list);
router.get('/:id', adminAuth, ctrl.detail);
router.post('/', adminAuth, ctrl.create);
router.put('/:id', adminAuth, ctrl.update);
router.delete('/:id', adminAuth, ctrl.remove);
router.get('/:product_id/cards', adminAuth, ctrl.cards);
router.post('/:product_id/cards', adminAuth, ctrl.importCards);
router.delete('/cards/:card_id', adminAuth, ctrl.deleteCard);

module.exports = router;
