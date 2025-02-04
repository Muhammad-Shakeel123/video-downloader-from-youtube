const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// Route to handle video download
router.get('/video-download', videoController.downloadVideo);

module.exports = router;
