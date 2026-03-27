import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet());
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ============================================
// API ROUTES
// ============================================
import authRoutes from './routes/auth.js';
import promptsRoutes from './routes/prompts.js';
import usersRoutes from './routes/users.js';

app.use('/api/auth', authRoutes);
app.use('/api/prompts', promptsRoutes);
app.use('/api/users', usersRoutes);

// ============================================
// 404 HANDLER
// ============================================
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not Found', 
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: [
      'GET /health',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me',
      'GET /api/prompts',
      'POST /api/prompts',
      'GET /api/users/profile'
    ]
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║         ��� PROMPT STUDIO BACKEND SERVER                  ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  ��� Server:    http://localhost:${PORT}                    ║`);
  console.log(`║  ��� Frontend:  ${FRONTEND_URL}                             ║`);
  console.log(`║  ��� Environment: ${process.env.NODE_ENV || 'development'}                          ║`);
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log('║  Available Endpoints:                                     ║');
  console.log('║  • GET  /health                                           ║');
  console.log('║  • POST /api/auth/register                                ║');
  console.log('║  • POST /api/auth/login                                   ║');
  console.log('║  • GET  /api/auth/me                                      ║');
  console.log('║  • GET  /api/prompts                                      ║');
  console.log('║  • POST /api/prompts                                      ║');
  console.log('║  • GET  /api/users/profile                                ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
});

export default app;
