const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const commentController = require('../controllers/commentController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/role');
const upload = require('../middleware/upload');

const { createLaporanLimiter } = require('../middleware/rateLimiter');

router.get('/', verifyToken, laporanController.getAll);
router.get('/stats', verifyToken, laporanController.getStats);
router.get('/:id', verifyToken, laporanController.getById);
router.post('/', verifyToken, createLaporanLimiter, upload.single('image'), laporanController.create);
router.patch('/:id/status', verifyToken, checkRole(['admin', 'super_admin']), laporanController.updateStatus);
router.delete('/:id', verifyToken, checkRole(['super_admin']), laporanController.delete);

router.post('/:id/upvote', verifyToken, laporanController.toggleUpvote);
router.post('/:id/comments', verifyToken, commentController.create);

module.exports = router;
