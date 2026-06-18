const router = require('express').Router();
const { adminAuth, requireAdminRole } = require('../../middleware/auth');
const ctrl = require('../../controllers/b/adminController');

router.get('/', adminAuth, requireAdminRole, ctrl.list);
router.post('/', adminAuth, requireAdminRole, ctrl.create);
router.put('/:id', adminAuth, requireAdminRole, ctrl.update);
router.delete('/:id', adminAuth, requireAdminRole, ctrl.remove);

module.exports = router;
