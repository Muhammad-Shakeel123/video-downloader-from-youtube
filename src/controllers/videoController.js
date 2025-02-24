const fs = require('fs');
const path = require('path');
const ytdlp = require('yt-dlp-exec');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

// 📁 Function to get download directory
const getDownloadPath = filename => {
  const downloadsDir = path.join(__dirname, '..', 'downloads');
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }
  return path.join(downloadsDir, filename);
};

// 🎥 Function to download video using yt-dlp-exec
const downloadVideoYtDlp = async (url, filePath) => {
  try {
    console.log(`📥 Downloading video from: ${url}`);

    await ytdlp(url, {
      format: 'best',
      output: filePath.replace(/\\/g, '/'), // Ensures correct path formatting
    });

    console.log(`✅ Video downloaded successfully: ${filePath}`);
    return filePath;
  } catch (error) {
    console.error(`❌ yt-dlp error: ${error.message}`);
    throw new ApiError(500, `yt-dlp failed: ${error.message}`);
  }
};

// 🚀 Main function to handle video downloads
exports.downloadVideo = asyncHandler(async (req, res, next) => {
  const { url } = req.query;
  if (!url) {
    return next(new ApiError(400, 'URL is required.'));
  }

  const timestamp = Date.now();
  const fileName = `downloaded_video_${timestamp}.mp4`;
  const filePath = getDownloadPath(fileName);

  try {
    await downloadVideoYtDlp(url, filePath);
    return res
      .status(200)
      .json(
        new ApiResponse(200, { filePath }, 'Video downloaded successfully.'),
      );
  } catch (error) {
    return next(new ApiError(500, error.message));
  }
});
