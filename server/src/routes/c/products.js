const router = require('express').Router();
const ctrl = require('../../controllers/c/productController');

router.get('/', ctrl.list);
router.get('/:id', ctrl.detail);

module.exports = router;
