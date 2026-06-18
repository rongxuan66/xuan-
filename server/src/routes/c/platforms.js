const router = require('express').Router();
const ctrl = require('../../controllers/c/platformController');

router.get('/', ctrl.list);

module.exports = router;
