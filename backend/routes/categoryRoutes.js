const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/role');

router.get('/', verifyToken, categoryController.getAll);
router.post('/', verifyToken, checkRole(['admin', 'super_admin']), categoryController.create);

module.exports = router;
