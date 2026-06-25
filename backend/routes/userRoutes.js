const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/role');

router.get('/', verifyToken, checkRole(['super_admin']), userController.getAll);
router.put('/profile', verifyToken, userController.updateProfile);
router.put('/:id/role', verifyToken, checkRole(['super_admin']), userController.updateRole);
router.delete('/:id', verifyToken, checkRole(['super_admin']), userController.delete);

module.exports = router;
