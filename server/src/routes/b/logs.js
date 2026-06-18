const router = require('express').Router();
const { adminAuth } = require('../../middleware/auth');
const ctrl = require('../../controllers/b/logController');

router.get('/', adminAuth, ctrl.list);

module.exports = router;
