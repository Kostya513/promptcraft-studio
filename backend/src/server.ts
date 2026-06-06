import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key';

// ============================================
// MIDDLEWARE
// ============================================
app.use(helmet());
app.use(cors({
  origin: [FRONTEND_URL, 'http://localhost:8080', 'http://localhost:8081', 'http://localhost:8082'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================
// MOCK SOCIAL LOGIN
// ============================================
app.post('/api/auth/social-login', (req: Request, res: Response) => {
  const { provider, email } = req.body;
  
  console.log(`[SOCIAL LOGIN] Provider: ${provider}, Email: ${email}`);
  
  const payload = {
    email: email || `${provider}@example.com`,
    provider,
    role: 'business',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60)
  };
  
  const token = jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256' });
  
  const user = {
    id: Date.now(),
    email: email || `${provider}@example.com`,
    name: (email || provider).split('@')[0],
    avatar_url: null,
    role: 'business'
  };
  
  console.log(`[SUCCESS] User logged in: ${user.email}`);
  res.json({ token, user });
});

// ============================================
// API ROUTES
// ============================================
import authRoutes from './routes/auth.js';
import oauthRoutes from './routes/oauth.js';
import promptsRoutes from './routes/prompts.js';
import usersRoutes from './routes/users.js';
import aiRoutes from './routes/ai.js';
import postsRoutes from './routes/posts.js';
import agentsRoutes from './routes/agents.js';
import aiKeysRoutes from './routes/aiKeys.js';

app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/prompts', promptsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/agents', agentsRoutes);
app.use('/api/ai-keys', aiKeysRoutes);

// ============================================
// SERVE UPLOADED FILES
// ============================================
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  setHeaders: (res: Response, _filePath: string) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

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
      'POST /api/auth/social-login',
      'GET /api/oauth/vk',
      'GET /api/oauth/yandex',
      'GET /api/oauth/google',
      'POST /api/users/avatar',
      'GET /api/users/profile',
      'GET /api/prompts',
      'POST /api/prompts',
      'GET /api/posts',
      'POST /api/posts',
      'DELETE /api/posts/:id',
      'PUT /api/posts/:id/like',
      'PUT /api/posts/:id/share',
      'GET /api/agents',
      'POST /api/agents',
      'GET /api/agents/:id',
      'PUT /api/agents/:id',
      'DELETE /api/agents/:id',
      'POST /api/agents/:id/run',
      'GET /api/agents/:id/logs',
      'GET /api/ai-keys',
      'POST /api/ai-keys',
      'DELETE /api/ai-keys/:providerId',
      'POST /api/ai-keys/:providerId/test',
      'PUT /api/ai-keys/:providerId/default',
      'GET /api/ai-keys/providers'
    ]
  });
});

// ============================================
// ERROR HANDLER
// ============================================
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
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
  console.log('║          PROMPT STUDIO BACKEND SERVER                  ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log(`║  🌐 Server:    http://localhost:${PORT}                    ║`);
  console.log(`║  🔗 Frontend:  ${FRONTEND_URL}                             ║`);
  console.log(`║  ⚙️  Environment: ${process.env.NODE_ENV || 'development'} ║`);
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log('║  Available Endpoints:                                     ║');
  console.log('║  • GET  /health                                           ║');
  console.log('║  • POST /api/auth/social-login                            ║');
  console.log('║  • GET  /api/prompts                                      ║');
  console.log('║  • POST /api/prompts                                      ║');
  console.log('║  • GET  /api/posts                                        ║');
  console.log('║  • POST /api/posts                                        ║');
  console.log('║  • GET  /api/agents                                       ║');
  console.log('║  • POST /api/agents                                       ║');
  console.log('║  • POST /api/agents/:id/run                               ║');
  console.log('║  • GET  /api/ai-keys                                      ║');
  console.log('║  • POST /api/ai-keys                                      ║');
  console.log('║  • GET  /api/ai-keys/providers                            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');
});

export default app;