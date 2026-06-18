const router = require('express').Router();
const { adminAuth } = require('../../middleware/auth');
const ctrl = require('../../controllers/b/dashboardController');

router.get('/stats', adminAuth, ctrl.stats);

module.exports = router;
