const logger = require('../utils/logger');

// Custom error classes
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}

class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401);
    }
}

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error
    logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method
    });

    // Mongoose bad ObjectId
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new NotFoundError(message);
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new ValidationError(message);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ValidationError(message);
    }

    // OpenAI API errors
    if (err.status && err.type === 'invalid_request_error') {
        error = new AppError('Invalid request to AI service', 400);
    }

    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal Server Error';

    // Send error response
    if (req.accepts('html')) {
        // Render error page for browser requests
        res.status(statusCode).render('errors/500', {
            title: 'Error',
            message: statusCode === 500 ? 'Something went wrong' : message,
            error: process.env.NODE_ENV === 'development' ? err : {}
        });
    } else {
        // Send JSON for API requests
        res.status(statusCode).json({
            success: false,
            error: message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }
};

// 404 handler
const notFound = (req, res, next) => {
    if (req.accepts('html')) {
        res.status(404).render('errors/404', {
            title: 'Page Not Found',
            url: req.url
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'Route not found'
        });
    }
};

module.exports = {
    AppError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    errorHandler,
    notFound
};
