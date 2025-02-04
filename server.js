const express = require('express');
const app = express();
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./src/routes/routes');
const ApiError = require('./src/utils/ApiError');

// Load environment variables
dotenv.config();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use(routes);

// Global Error Handler
app.use((err, req, res, next) => {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
    });
  }
  console.error(err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
});

// Start Server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
