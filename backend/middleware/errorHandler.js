// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error
  let error = {
    success: false,
    message: 'Internal Server Error',
    code: 'INTERNAL_ERROR'
  };

  // Handle different types of errors
  if (err.name === 'ValidationError') {
    error = {
      success: false,
      message: 'Validation Error',
      code: 'VALIDATION_ERROR',
      errors: err.errors
    };
    return res.status(400).json(error);
  }

  if (err.name === 'CastError') {
    error = {
      success: false,
      message: 'Invalid ID format',
      code: 'INVALID_ID'
    };
    return res.status(400).json(error);
  }

  if (err.code === 'SQLITE_CONSTRAINT') {
    error = {
      success: false,
      message: 'Database constraint violation',
      code: 'CONSTRAINT_VIOLATION'
    };
    return res.status(400).json(error);
  }

  if (err.code === 'SQLITE_BUSY') {
    error = {
      success: false,
      message: 'Database is busy, please try again',
      code: 'DATABASE_BUSY'
    };
    return res.status(503).json(error);
  }

  if (err.code === 'ENOENT') {
    error = {
      success: false,
      message: 'File not found',
      code: 'FILE_NOT_FOUND'
    };
    return res.status(404).json(error);
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    error = {
      success: false,
      message: 'File too large',
      code: 'FILE_TOO_LARGE'
    };
    return res.status(400).json(error);
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error = {
      success: false,
      message: 'Unexpected file field',
      code: 'UNEXPECTED_FILE'
    };
    return res.status(400).json(error);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    };
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      success: false,
      message: 'Token expired',
      code: 'TOKEN_EXPIRED'
    };
    return res.status(401).json(error);
  }

  // Handle rate limiting errors
  if (err.status === 429) {
    error = {
      success: false,
      message: 'Too many requests',
      code: 'RATE_LIMIT_EXCEEDED'
    };
    return res.status(429).json(error);
  }

  // Handle network errors
  if (err.code === 'ECONNREFUSED') {
    error = {
      success: false,
      message: 'Database connection refused',
      code: 'DATABASE_CONNECTION_ERROR'
    };
    return res.status(503).json(error);
  }

  // Handle timeout errors
  if (err.code === 'ETIMEDOUT') {
    error = {
      success: false,
      message: 'Request timeout',
      code: 'TIMEOUT_ERROR'
    };
    return res.status(408).json(error);
  }

  // Log error details in development
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
    error.details = err.message;
  }

  // Send error response
  res.status(err.status || 500).json(error);
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found handler
const notFound = (req, res, next) => {
  const error = new Error(`Route not found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  notFound
};