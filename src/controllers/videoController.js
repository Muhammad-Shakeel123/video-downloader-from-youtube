const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
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

// 🎥 Function to download video using yt-dlp
const downloadVideoYtDlp = (url, filePath) => {
  return new Promise((resolve, reject) => {
    const ytDlpPath = 'yt-dlp'; // Change if yt-dlp is not in PATH
    const process = spawn(ytDlpPath, ['-f', 'best', '-o', filePath, url]);

    process.stdout.on('data', data => console.log(`yt-dlp: ${data}`));
    process.stderr.on('data', data => console.error(`yt-dlp error: ${data}`));

    process.on('close', code => {
      if (code === 0) {
        resolve(filePath);
      } else {
        reject(new ApiError(500, `yt-dlp process exited with code ${code}`));
      }
    });
  });
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

  console.log(`📥 Downloading video from: ${url}`);

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
