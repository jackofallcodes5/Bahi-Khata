const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, mobile apps)
    if (!origin) return callback(null, true);
    const allowed = [
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^https:\/\/.*\.netlify\.app$/,
    ];
    if (allowed.some((pattern) => pattern.test(origin))) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Serve uploads statically
app.use('/uploads', express.static('uploads'));

// Routes Placeholder
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Bahi Khata API is running' });
});

// Import Routes
const authRoutes = require('./src/routes/authRoutes');
const shopRoutes = require('./src/routes/shopRoutes');
const billRoutes = require('./src/routes/billRoutes');
const deliveryRoutes = require('./src/routes/deliveryRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/bills', billRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

module.exports = app;
