require('dotenv').config();
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const session = require('express-session');
const flash = require('connect-flash');
const logger = require('./src/utils/logger');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');
const { generalLimiter } = require('./src/middleware/rateLimiter');

// Initialize Express app
const app = express();

// Trust proxy (for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
        }
    }
}));

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Flash messages
app.use(flash());

// Make flash messages available to all views
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.warning = req.flash('warning');
    res.locals.info = req.flash('info');
    next();
});

// HTTP request logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined', {
        stream: {
            write: (message) => logger.info(message.trim())
        }
    }));
}

// Rate limiting
app.use(generalLimiter);

// Routes
const mainRoutes = require('./src/routes/index');
app.use('/', mainRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    logger.info(`GrantWise AI server running on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`\n🚀 GrantWise AI is running!`);
    console.log(`📍 Local: http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
    server.close(() => {
        process.exit(1);
    });
});

module.exports = app;
