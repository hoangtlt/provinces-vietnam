const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config');
const routes = require('./routes');
const errorHandler = require('./middleware/error.middleware');
const { setupSwagger } = require('../swagger/swagger');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());

// Request Body Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger
app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));

// Setup Swagger UI
setupSwagger(app);

// API Routes
app.use('/api/v1', routes);

// Fallback Route Handler (404)
app.use((req, res, next) => {
  const error = new Error(`API endpoint not found: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// Global Error Handler
app.use(errorHandler);

// Start listening if run directly
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`🚀 Location API Server running on port ${PORT}`);
  console.log(`🔧 Mode: ${config.env}`);
  console.log(`📚 Swagger Docs: http://localhost:${PORT}/api-docs`);
  console.log(`==================================================`);
});

module.exports = app;
