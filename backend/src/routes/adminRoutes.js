const express = require('express');
const { getAdminStats, getAdminUsers, toggleUserStatus } = require('../controllers/adminController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);
router.use(authorize('Admin'));

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.patch('/users/:id/status', toggleUserStatus);

module.exports = router;
