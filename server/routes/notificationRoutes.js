const express = require('express');
const router = express.Router();
const { getNotifications, readNotification, readAllNotifications } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getNotifications);
router.put('/read/:id', readNotification);
router.put('/read-all', readAllNotifications);

module.exports = router;
