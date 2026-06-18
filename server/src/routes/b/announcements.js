const router = require('express').Router();
const { adminAuth } = require('../../middleware/auth');
const ctrl = require('../../controllers/b/announcementController');

router.get('/', adminAuth, ctrl.list);
router.get('/:id', adminAuth, ctrl.detail);
router.post('/', adminAuth, ctrl.create);
router.put('/:id', adminAuth, ctrl.update);
router.delete('/:id', adminAuth, ctrl.remove);

module.exports = router;
