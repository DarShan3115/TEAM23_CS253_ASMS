const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth');
const adminGuard = require('../middleware/adminGuard');

// All routes require JWT + admin guard constraints
router.use(auth, adminGuard);

// Platform Stats
router.get('/stats', adminController.getPlatformStats);

// Announcements
router.post('/announcements/broadcast', adminController.broadcastAnnouncement);

// User Management
router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createUser);
router.post('/users/bulk-generate', adminController.bulkGenerateUsers);
router.put('/users/:id', adminController.editUser);
router.delete('/users/:id', adminController.deleteUser);

// Account Actions
router.post('/users/:id/suspend', adminController.suspendUser);
router.post('/users/:id/unlock', adminController.unlockUser);
router.post('/users/:id/reset-password', adminController.adminResetPassword);

module.exports = router;