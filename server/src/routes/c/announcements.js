const router = require('express').Router();
const ctrl = require('../../controllers/c/announcementController');

router.get('/', ctrl.list);

module.exports = router;
