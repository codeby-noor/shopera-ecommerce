const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const orderRoutes = require('./routes/orderRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(morgan('dev'));

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
];
const customOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map(url => url.trim())
  .filter(Boolean);
const allowedOrigins = [...new Set([...defaultOrigins, ...customOrigins])];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests or matching origins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  const engine = db.getEngine() || 'disconnected';
  const isHealthy = engine === 'mysql';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    platform: 'SHOPERA E-Commerce Platform API',
    database_engine: engine,
    is_fallback: false,
    database_host: process.env.DB_HOST || process.env.TIDB_HOST || 'localhost',
    database_port: parseInt(process.env.DB_PORT || process.env.TIDB_PORT, 10) || ((process.env.DB_HOST || '').includes('tidbcloud.com') ? 4000 : 3306),
    database_name: process.env.DB_NAME || process.env.TIDB_DATABASE || 'shopera',
    timestamp: new Date().toISOString()
  });
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// In Production, serve frontend static files if built
const frontendDistPath = path.join(__dirname, '../frontend/dist');
const frontendBuildPath = path.join(__dirname, '../frontend/build');

if (require('fs').existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else if (require('fs').existsSync(frontendBuildPath)) {
  app.use(express.static(frontendBuildPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendBuildPath, 'index.html'));
  });
}

// Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server after Database Connection
async function startServer() {
  try {
    await db.connect();
    app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`🚀 SHOPERA Server running in ${process.env.NODE_ENV || 'development'} mode`);
      console.log(`📡 API URL: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Database Engine: ${db.getEngine()?.toUpperCase()}`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = app;
