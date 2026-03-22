import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import authRoutes from './modules/auth/auth.router';
import userRoutes from './modules/users/user.router';
import propertyRoutes from './modules/properties/property.router';
import listingRoutes from './modules/listings/listing.router';
import messageRoutes from './modules/messages/message.router';
import uploadRoutes from './modules/uploads/upload.router';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Tüm network interface'lerden erişime izin ver

// Middleware
app.use(helmet());
app.use(cors({
  origin: true, // Tüm originlere izin ver (development için)
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log('=== INCOMING REQUEST ===');
  console.log(`${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('Content-Type:', req.headers['content-type']);
  next();
});

// Health check
app.get('/health', (req, res) => {
  console.log('Health check received');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  console.log('Test endpoint hit!');
  res.json({ message: 'Backend is working!', timestamp: new Date().toISOString() });
});

// Static files - serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/uploads', uploadRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server - 0.0.0.0'da dinle (tüm IP'lerden erişim)
app.listen(Number(PORT), HOST, () => {
  console.log('========================================');
  console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
  console.log(`📝 API: http://localhost:${PORT}/api`);
  console.log(`📱 Mobile: http://192.168.x.x:${PORT}/api`);
  console.log('========================================');
});

export default app;
