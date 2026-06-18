const router = require('express').Router();
const ctrl = require('../../controllers/c/configController');

router.get('/', ctrl.siteConfig);

module.exports = router;
